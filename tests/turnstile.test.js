import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { turnstileManager } from '../src/core/turnstile.js';
import { verifyTurnstileToken, handleAuthRequest } from '../server/routes/auth-routes.js';

// Helper to make mock requests against handleAuthRequest
async function makeRequest(pathname, method = 'GET', body = null, headers = {}) {
  const req = new http.IncomingMessage();
  req.url = pathname;
  req.method = method;
  req.headers = { host: 'localhost', ...headers };

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

  await handleAuthRequest(req, res, pathname, method);
  let parsed = null;
  try {
    parsed = JSON.parse(resBody);
  } catch (e) {
    parsed = resBody;
  }

  return { status: resStatusCode, headers: resHeaders, body: parsed };
}

describe('Cloudflare Turnstile Bot Protection Engine Tests', () => {
  test('turnstileManager initializes with valid default test site key', () => {
    assert.ok(turnstileManager);
    assert.ok(turnstileManager.siteKey);
    assert.equal(typeof turnstileManager.siteKey, 'string');
    assert.ok(turnstileManager.siteKey.length > 5);
  });

  test('turnstileManager token management (set, get, reset)', () => {
    const dummyId = 'widget_test_123';
    turnstileManager.activeWidgets.set(dummyId, {
      container: null,
      token: 'tok_turnstile_abc',
      onVerify: null
    });

    assert.equal(turnstileManager.getToken(dummyId), 'tok_turnstile_abc');

    turnstileManager.reset(dummyId);
    assert.equal(turnstileManager.getToken(dummyId), null);

    turnstileManager.remove(dummyId);
    assert.equal(turnstileManager.activeWidgets.has(dummyId), false);
  });

  test('verifyTurnstileToken returns success for test token', async () => {
    const res = await verifyTurnstileToken('1x00000000000000000000AA');
    assert.ok(res);
    assert.equal(res.success, true);
  });

  test('verifyTurnstileToken returns success for simulated token', async () => {
    const res = await verifyTurnstileToken('cf_sim_test_session_token_12345');
    assert.ok(res);
    assert.equal(res.success, true);
  });

  test('verifyTurnstileToken fails when token is empty or missing', async () => {
    const res = await verifyTurnstileToken('');
    assert.ok(res);
    assert.equal(res.success, false);
    assert.ok(res['error-codes'].includes('missing-input-response'));
  });

  test('POST /api/turnstile/verify successfully validates Turnstile token', async () => {
    const res = await makeRequest('/api/turnstile/verify', 'POST', {
      token: '1x00000000000000000000AA'
    });

    assert.equal(res.status, 200);
    assert.ok(res.body);
    assert.equal(res.body.success, true);
  });

  test('POST /api/turnstile/verify rejects missing token', async () => {
    const res = await makeRequest('/api/turnstile/verify', 'POST', {
      token: ''
    });

    assert.equal(res.status, 400);
    assert.ok(res.body);
    assert.equal(res.body.success, false);
  });
});
