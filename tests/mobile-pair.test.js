import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { handleBackendRequest } from '../server/index.js';
import { PAIRING_SESSIONS } from '../server/routes/mobile-pair-routes.js';
import { generateQrSvg } from '../src/utils/helpers.js';

// Helper to simulate HTTP requests against handleBackendRequest
async function makeRequest(pathname, method = 'GET', body = null, headers = {}) {
  const req = new http.IncomingMessage();
  req.url = pathname;
  req.method = method;
  req.headers = {
    host: 'localhost',
    ...headers
  };

  let resStatusCode = 200;
  let resHeaders = {};
  let resBody = '';

  const res = new http.ServerResponse(req);
  res.writeHead = (statusCode, hdrs) => {
    resStatusCode = statusCode;
    resHeaders = hdrs || {};
    return res;
  };
  res.end = (chunk) => {
    if (chunk) resBody += chunk;
  };

  if (body) {
    const jsonStr = typeof body === 'string' ? body : JSON.stringify(body);
    process.nextTick(() => {
      req.emit('data', Buffer.from(jsonStr));
      req.emit('end');
    });
  } else {
    process.nextTick(() => {
      req.emit('end');
    });
  }

  const handled = await handleBackendRequest(req, res);
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(resBody);
  } catch (e) {
    parsedJson = resBody;
  }

  return { handled, statusCode: resStatusCode, headers: resHeaders, body: parsedJson };
}

test('Mobile Pair API - Session Lifecycle: create, connect, and retrieve status', async () => {
  // 1. Create a session for camera capture
  const createRes = await makeRequest('/api/mobile-pair/session', 'POST', {
    action: 'camera'
  });

  assert.strictEqual(createRes.handled, true);
  assert.strictEqual(createRes.statusCode, 201);
  assert.strictEqual(createRes.body.success, true);
  assert.ok(createRes.body.sessionId.startsWith('pair_'));
  assert.strictEqual(createRes.body.action, 'camera');
  assert.ok(createRes.body.expiresAt > Date.now());

  const sessionId = createRes.body.sessionId;

  // 2. Query initial session status (desktop polling)
  const poll1 = await makeRequest(`/api/mobile-pair/session/${sessionId}`, 'GET');
  assert.strictEqual(poll1.handled, true);
  assert.strictEqual(poll1.statusCode, 200);
  assert.strictEqual(poll1.body.status, 'waiting');
  assert.strictEqual(poll1.body.payload, null);

  // 3. Mobile connects to session
  const connectRes = await makeRequest(`/api/mobile-pair/connect/${sessionId}`, 'POST');
  assert.strictEqual(connectRes.handled, true);
  assert.strictEqual(connectRes.statusCode, 200);
  assert.strictEqual(connectRes.body.status, 'connected');

  // 4. Query status after connection
  const poll2 = await makeRequest(`/api/mobile-pair/session/${sessionId}`, 'GET');
  assert.strictEqual(poll2.statusCode, 200);
  assert.strictEqual(poll2.body.status, 'connected');
});

test('Mobile Pair API - Signature Session submission and completion', async () => {
  // 1. Create session with action='sign'
  const createRes = await makeRequest('/api/mobile-pair/session', 'POST', {
    action: 'sign'
  });
  assert.strictEqual(createRes.statusCode, 201);
  const sessionId = createRes.body.sessionId;
  assert.strictEqual(createRes.body.action, 'sign');

  // 2. Reject submission missing image data
  const invalidSubmit = await makeRequest(`/api/mobile-pair/submit/${sessionId}`, 'POST', {
    somethingElse: 'invalid'
  });
  assert.strictEqual(invalidSubmit.statusCode, 400);
  assert.strictEqual(invalidSubmit.body.success, false);

  // 3. Submit valid signature payload
  const mockSignatureDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const submitRes = await makeRequest(`/api/mobile-pair/submit/${sessionId}`, 'POST', {
    dataUrl: mockSignatureDataUrl,
    filename: 'my_signature.png',
    mimeType: 'image/png',
    width: 600,
    height: 250
  });

  assert.strictEqual(submitRes.statusCode, 200);
  assert.strictEqual(submitRes.body.success, true);

  // 4. Desktop poll gets completed status with payload
  const pollRes = await makeRequest(`/api/mobile-pair/session/${sessionId}`, 'GET');
  assert.strictEqual(pollRes.statusCode, 200);
  assert.strictEqual(pollRes.body.status, 'completed');
  assert.ok(pollRes.body.payload);
  assert.strictEqual(pollRes.body.payload.dataUrl, mockSignatureDataUrl);
  assert.strictEqual(pollRes.body.payload.filename, 'my_signature.png');
  assert.strictEqual(pollRes.body.payload.mimeType, 'image/png');
  assert.strictEqual(pollRes.body.payload.width, 600);
  assert.strictEqual(pollRes.body.payload.height, 250);
});

test('Mobile Pair API - Non-existent and Expired session handling', async () => {
  // Unknown session returns 404
  const notFoundRes = await makeRequest('/api/mobile-pair/session/non_existent_id', 'GET');
  assert.strictEqual(notFoundRes.handled, true);
  assert.strictEqual(notFoundRes.statusCode, 404);

  // Expired session returns 410 Gone
  const expiredSessionId = 'pair_expired_test_id';
  PAIRING_SESSIONS.set(expiredSessionId, {
    id: expiredSessionId,
    action: 'camera',
    status: 'waiting',
    createdAt: Date.now() - 3600000,
    expiresAt: Date.now() - 1000, // expired 1s ago
    payload: null
  });

  const expiredRes = await makeRequest(`/api/mobile-pair/session/${expiredSessionId}`, 'GET');
  assert.strictEqual(expiredRes.statusCode, 410);
  assert.strictEqual(expiredRes.body.error, 'Pairing session expired');
  // Confirm it was evicted from map
  assert.strictEqual(PAIRING_SESSIONS.has(expiredSessionId), false);
});

test('Mobile Pair QR Code - generateQrSvg produces valid SVG string with geometry', () => {
  const qrSvg = generateQrSvg('https://letsedit.dev/mobile_pair?session=pair_abc123&action=camera', 220);
  assert.ok(typeof qrSvg === 'string');
  assert.ok(qrSvg.startsWith('<svg'));
  assert.ok(qrSvg.includes('width="220"'));
  assert.ok(qrSvg.includes('height="220"'));
  assert.ok(qrSvg.includes('viewBox="0 0 '));
  assert.ok(qrSvg.includes('<rect'));
  assert.ok(qrSvg.endsWith('</svg>'));
});
