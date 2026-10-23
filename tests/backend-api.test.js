import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { handleBackendRequest } from '../server/index.js';
import { PDFDocument } from 'pdf-lib';
import { PageOperations } from '../src/core/engine/page-ops.js';

// Helper to make mock requests against handleBackendRequest
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

test('Backend API - GET /api/health returns 200 and system status', async () => {
  const res = await makeRequest('/api/health', 'GET');
  assert.strictEqual(res.handled, true);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'ok');
  assert.strictEqual(res.body.service, 'PDF Studio Core Engine & Auth API');
  assert.ok(res.body.uptime >= 0);
});

test('Backend API - POST /users/login-with-sso/lookup detects enterprise domain', async () => {
  const ssoRes = await makeRequest('/users/login-with-sso/lookup', 'POST', { email: 'worker@acme.com' });
  assert.strictEqual(ssoRes.statusCode, 200);
  assert.strictEqual(ssoRes.body.useSSO, true);

  const regularRes = await makeRequest('/users/login-with-sso/lookup', 'POST', { email: 'user@gmail.com' });
  assert.strictEqual(regularRes.statusCode, 200);
  assert.strictEqual(regularRes.body.useSSO, false);
});

test('Backend API - POST /users/login-with-sso returns SAML redirect URL', async () => {
  const res = await makeRequest('/users/login-with-sso', 'POST', { email: 'alex@enterprise.org' });
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.ssoUrl.includes('https://auth.enterprise.org/saml2/idp/sso'));
});

test('Backend API - POST /users/login adaptive 2FA challenge (403 simulation)', async () => {
  // Demo 2FA trigger
  const res403 = await makeRequest('/users/login', 'POST', {
    email: 'user.2fa@example.com',
    password: 'demo'
  });
  assert.strictEqual(res403.statusCode, 403);
  assert.strictEqual(res403.body.twoFactorRequired, true);

  // Supplying invalid code fails with 400
  const resInvalid = await makeRequest('/users/login', 'POST', {
    email: 'user.2fa@example.com',
    password: 'demo',
    emailVerificationCode: '999999'
  });
  assert.strictEqual(resInvalid.statusCode, 400);

  // Supplying valid code 123456 succeeds with 200
  const res200 = await makeRequest('/users/login', 'POST', {
    email: 'user.2fa@example.com',
    password: 'demo',
    emailVerificationCode: '123456'
  });
  assert.strictEqual(res200.statusCode, 200);
  assert.ok(res200.body.token);
  assert.strictEqual(res200.body.email, 'user.2fa@example.com');
});

test('Backend API - POST /users/register creates user and returns session', async () => {
  const regRes = await makeRequest('/users/register', 'POST', {
    name: 'Morgan Test',
    email: 'morgan.test@example.com',
    password: 'morgans_secure_password'
  });
  assert.strictEqual(regRes.statusCode, 200);
  assert.strictEqual(regRes.body.name, 'Morgan Test');
  assert.ok(regRes.body.token);

  // Verify GET /users/me with token
  const meRes = await makeRequest('/users/me', 'GET', null, {
    authorization: `Bearer ${regRes.body.token}`
  });
  assert.strictEqual(meRes.statusCode, 200);
  assert.strictEqual(meRes.body.user.email, 'morgan.test@example.com');
  // Verify PUT /users/me updates profile name and preferences
  const updateRes = await makeRequest('/users/me', 'PUT', {
    name: 'Morgan Updated',
    requires2fa: true
  }, {
    authorization: `Bearer ${regRes.body.token}`
  });
  assert.strictEqual(updateRes.statusCode, 200);
  assert.strictEqual(updateRes.body.user.name, 'Morgan Updated');
  assert.strictEqual(updateRes.body.user.requires2fa, true);

  // Generate a developer automation API key
  const keyCreateRes = await makeRequest('/users/api-keys', 'POST', {
    label: 'CI/CD Pipeline Key'
  }, {
    authorization: `Bearer ${regRes.body.token}`
  });
  assert.strictEqual(keyCreateRes.statusCode, 201);
  assert.ok(keyCreateRes.body.apiKey.token.startsWith('api_live_'));
  assert.strictEqual(keyCreateRes.body.apiKey.label, 'CI/CD Pipeline Key');
  const keyId = keyCreateRes.body.apiKey.id;

  // List active API keys
  const keysListRes = await makeRequest('/users/api-keys', 'GET', null, {
    authorization: `Bearer ${regRes.body.token}`
  });
  assert.strictEqual(keysListRes.statusCode, 200);
  assert.strictEqual(keysListRes.body.apiKeys.length, 1);

  // Revoke the API key
  const revokeRes = await makeRequest(`/users/api-keys/${keyId}`, 'DELETE', null, {
    authorization: `Bearer ${regRes.body.token}`
  });
  assert.strictEqual(revokeRes.statusCode, 200);
  assert.strictEqual(revokeRes.body.success, true);
});

test('Backend API - OAuth Sign-in (Google and Microsoft)', async () => {
  const gRes = await makeRequest('/users/login-with-google', 'POST', { id_token: 'dummy_google_jwt' });
  assert.strictEqual(gRes.statusCode, 200);
  assert.strictEqual(gRes.body.provider, 'google');

  const mRes = await makeRequest('/users/login-with-microsoft', 'POST', { id_token: 'dummy_msal_token' });
  assert.strictEqual(mRes.statusCode, 200);
  assert.strictEqual(mRes.body.provider, 'microsoft');
});

test('Backend API - POST /api/pdf/info inspects PDF document structure', async () => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage([400, 400]);
  pdfDoc.setTitle('Server Test Title');
  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  const res = await makeRequest('/api/pdf/info', 'POST', { pdfBase64 });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.pageCount, 1);
  assert.strictEqual(res.body.title, 'Server Test Title');
});

test('Backend API - POST /api/pdf/merge combines multiple PDFs', async () => {
  const doc1 = await PDFDocument.create();
  doc1.addPage([300, 300]);
  const doc2 = await PDFDocument.create();
  doc2.addPage([300, 300]);
  doc2.addPage([300, 300]);

  const b64_1 = Buffer.from(await doc1.save()).toString('base64');
  const b64_2 = Buffer.from(await doc2.save()).toString('base64');

  const res = await makeRequest('/api/pdf/merge', 'POST', { pdfs: [b64_1, b64_2] });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.pageCount, 3);
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/compress optimizes PDF streams', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/compress', 'POST', { pdfBase64: b64 });
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.pdfBase64);
  assert.ok(res.body.compressedSize > 0);
});

test('Backend API - POST /api/pdf/split splits document by range or pages', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  doc.addPage([400, 400]);
  doc.addPage([400, 400]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  // Split all pages
  const resAll = await makeRequest('/api/pdf/split', 'POST', { pdfBase64: b64, range: 'all' });
  assert.strictEqual(resAll.statusCode, 200);
  assert.strictEqual(resAll.body.splits.length, 3);
  assert.strictEqual(resAll.body.splits[0].pageCount, 1);

  // Split range "1-2, 3"
  const resRange = await makeRequest('/api/pdf/split', 'POST', { pdfBase64: b64, range: '1-2, 3' });
  assert.strictEqual(resRange.statusCode, 200);
  assert.strictEqual(resRange.body.splits.length, 2);
  assert.strictEqual(resRange.body.splits[0].pageCount, 2);
  assert.strictEqual(resRange.body.splits[1].pageCount, 1);

  // Split every N pages (every 2 pages)
  const resEveryN = await makeRequest('/api/pdf/split', 'POST', { pdfBase64: b64, mode: 'every_n', everyN: 2 });
  assert.strictEqual(resEveryN.statusCode, 200);
  assert.strictEqual(resEveryN.body.splits.length, 2);
  assert.strictEqual(resEveryN.body.splits[0].pageCount, 2);
  assert.strictEqual(resEveryN.body.splits[1].pageCount, 1);

  // Split by max size
  const resSize = await makeRequest('/api/pdf/split', 'POST', { pdfBase64: b64, mode: 'size', maxBytes: 50000 });
  assert.strictEqual(resSize.statusCode, 200);
  assert.ok(resSize.body.splits.length >= 1);

  // Split by bookmarks (returns 400 when document has no bookmarks)
  const resBm = await makeRequest('/api/pdf/split', 'POST', { pdfBase64: b64, mode: 'bookmarks' });
  assert.strictEqual(resBm.statusCode, 400);
  assert.ok(resBm.body.error.includes('No bookmarks'));
});

test('Backend API - POST /api/pdf/rotate rotates document pages', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/rotate', 'POST', { pdfBase64: b64, degrees: 90 });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.rotationApplied, 90);

  const rotatedDoc = await PDFDocument.load(Buffer.from(res.body.pdfBase64, 'base64'));
  assert.strictEqual(rotatedDoc.getPage(0).getRotation().angle, 90);
});

test('Backend API - POST /api/pdf/watermark stamps text watermark', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([500, 500]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/watermark', 'POST', {
    pdfBase64: b64,
    text: 'CONFIDENTIAL DRAFT',
    opacity: 0.4
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.watermarkText, 'CONFIDENTIAL DRAFT');
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/pagenumbers adds page numbers', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([500, 500]);
  doc.addPage([500, 500]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/pagenumbers', 'POST', {
    pdfBase64: b64,
    format: 'Page {n} of {total}',
    position: 'bottom-center'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.pageCount, 2);
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/unlock removes restrictions', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/unlock', 'POST', { pdfBase64: b64 });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.unlocked, true);
});

test('Backend API - POST /api/pdf/protect checks password requirement', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const failRes = await makeRequest('/api/pdf/protect', 'POST', { pdfBase64: b64, password: '' });
  assert.strictEqual(failRes.statusCode, 400);

  const succRes = await makeRequest('/api/pdf/protect', 'POST', { pdfBase64: b64, password: 'secretpassword' });
  assert.strictEqual(succRes.statusCode, 200);
  assert.strictEqual(succRes.body.protected, true);
});

test('PageOperations.addPageNumbers - adds page numbers with position and format', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([595.28, 841.89]);
  doc.addPage([595.28, 841.89]);
  const rawBytes = await doc.save();

  const numberedBytes = await PageOperations.addPageNumbers(rawBytes, {
    format: 'Page {n} of {total}',
    position: 'bottom-center',
    startNumber: 1,
    startPage: 1,
    fontSize: 10
  });

  assert.ok(numberedBytes instanceof Uint8Array);
  const outDoc = await PDFDocument.load(numberedBytes);
  assert.strictEqual(outDoc.getPageCount(), 2);
});

test('PageOperations.signPdf - embeds signature and date stamp on target page', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([595.28, 841.89]);
  const rawBytes = await doc.save();

  // 1x1 valid PNG
  const pngBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

  const signedBytes = await PageOperations.signPdf(rawBytes, {
    imageBytes: pngBytes,
    isPng: true,
    position: 'bottom-right',
    dateText: '2026-10-23',
    targetPage: 0
  });

  assert.ok(signedBytes instanceof Uint8Array);
  const outDoc = await PDFDocument.load(signedBytes);
  assert.strictEqual(outDoc.getPageCount(), 1);
});

test('Backend API - POST /api/pdf/redact draws solid cover boxes', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([500, 500]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/redact', 'POST', {
    pdfBase64: b64,
    boxes: [{ pageIndex: 0, x: 50, y: 50, width: 200, height: 30 }],
    color: 'black'
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.redactedBoxesCount, 1);
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/flatten flattens AcroForm fields', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([500, 500]);
  const form = doc.getForm();
  const tf = form.createTextField('testField');
  tf.setText('Sample text');
  tf.addToPage(page, { x: 50, y: 50, width: 150, height: 25 });
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/flatten', 'POST', {
    pdfBase64: b64
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.flattened, true);
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/excel-to-pdf converts CSV and spreadsheets', async () => {
  const csv = 'City,Population,Region\nNew York,8336817,Northeast\nLos Angeles,3979576,West\nChicago,2693976,Midwest';
  const res = await makeRequest('/api/pdf/excel-to-pdf', 'POST', {
    csvText: csv,
    title: 'US Cities Report'
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.pageCount, 1);
  assert.strictEqual(res.body.title, 'US Cities Report');
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/ppt-to-pdf converts presentation slides', async () => {
  const text = 'Slide 1: Executive Overview\nKey metric: 99.9% uptime\nSlide 2: Architecture\nDecoupled backend and pure client-side processing';
  const res = await makeRequest('/api/pdf/ppt-to-pdf', 'POST', {
    text: text,
    title: 'Tech Architecture'
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.pageCount, 2);
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/repair reconstructs and validates document', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/repair', 'POST', {
    pdfBase64: b64
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.repaired, true);
  assert.strictEqual(res.body.pageCount, 1);
  assert.ok(res.body.pdfBase64);
});

test('Backend API - POST /api/pdf/grayscale converts document streams', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const b64 = Buffer.from(await doc.save()).toString('base64');

  const res = await makeRequest('/api/pdf/grayscale', 'POST', {
    pdfBase64: b64
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.grayscale, true);
  assert.strictEqual(res.body.pageCount, 1);
  assert.ok(res.body.pdfBase64);
});


