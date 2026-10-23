import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { MultiSignOps } from '../src/core/engine/operations/multi-sign-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleSignRequest, SIGNATURE_REQUESTS } from '../server/routes/sign-request-routes.js';

// Helper to create small sample PDF bytes
async function createTestPdf(pageCount = 2) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Multi-Sign Sample Page ${i + 1}`, { x: 50, y: 550 });
  }
  return await doc.save();
}

// 1x1 Transparent PNG data URL
const samplePngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Mock request / response helpers for backend testing
function createMockReq(method, body = null, headers = {}) {
  const req = {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    socket: { remoteAddress: '192.168.1.100' },
    listeners: {},
    on(event, handler) {
      this.listeners[event] = handler;
      if (event === 'data' && body !== null) {
        handler(typeof body === 'string' ? body : JSON.stringify(body));
      }
      if (event === 'end') {
        setTimeout(handler, 0);
      }
    }
  };
  return req;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(code, headers = {}) {
      this.statusCode = code;
      this.headers = { ...this.headers, ...headers };
    },
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(content) {
      this.body = content;
    }
  };
  return res;
}

test('MultiSignOps - burnSignatureFields burns text, date, checkbox, and signature image', async () => {
  const origPdf = await createTestPdf(2);
  const fields = [
    {
      id: 'fld_1',
      recipientEmail: 'alice@example.com',
      type: 'signature',
      page: 0,
      x: 50,
      y: 100,
      width: 140,
      height: 48,
      value: samplePngDataUrl
    },
    {
      id: 'fld_2',
      recipientEmail: 'alice@example.com',
      type: 'date',
      page: 0,
      x: 50,
      y: 50,
      width: 100,
      height: 24,
      value: '2026-10-24'
    },
    {
      id: 'fld_3',
      recipientEmail: 'bob@example.com',
      type: 'checkbox',
      page: 1,
      x: 60,
      y: 200,
      width: 20,
      height: 20,
      value: true
    },
    {
      id: 'fld_4',
      recipientEmail: 'bob@example.com',
      type: 'text',
      page: 1,
      x: 90,
      y: 200,
      width: 120,
      height: 24,
      value: 'Approved by Legal'
    }
  ];

  const burnedBytes = await MultiSignOps.burnSignatureFields(origPdf, fields);
  assert(burnedBytes instanceof Uint8Array);
  assert(burnedBytes.length > origPdf.length);

  const loadedDoc = await PDFDocument.load(burnedBytes);
  assert.strictEqual(loadedDoc.getPageCount(), 2);
});

test('MultiSignOps - compileCompletedDocument appends Multi-Party Audit Certificate', async () => {
  const origPdf = await createTestPdf(2);
  const signRequest = {
    transactionId: 'TRX-20261024-TESTMULTI',
    documentName: 'Contract_Agreement.pdf',
    recipients: [
      { name: 'Alice Smith', email: 'alice@company.com', status: 'signed', signedAt: '2026-10-24T10:00:00Z' },
      { name: 'Bob Jones', email: 'bob@partner.org', status: 'signed', signedAt: '2026-10-24T10:15:00Z' }
    ],
    fields: [
      { id: 'fld_1', recipientEmail: 'alice@company.com', type: 'signature', page: 0, x: 60, y: 80, width: 120, height: 40, value: samplePngDataUrl }
    ]
  };

  const finalBytes = await MultiSignOps.compileCompletedDocument(origPdf, signRequest);
  assert(finalBytes instanceof Uint8Array);

  const finalDoc = await PDFDocument.load(finalBytes);
  // Original was 2 pages; with appended multi-party certificate page it should be 3 pages
  assert.strictEqual(finalDoc.getPageCount(), 3);
});

test('PageOperations - facade exposes burnSignatureFields and compileCompletedDocument', async () => {
  const origPdf = await createTestPdf(1);
  const burned = await PageOperations.burnSignatureFields(origPdf, []);
  assert(burned instanceof Uint8Array);

  const compiled = await PageOperations.compileCompletedDocument(origPdf, {
    transactionId: 'TRX-TEST',
    recipients: []
  });
  assert(compiled instanceof Uint8Array);
  const doc = await PDFDocument.load(compiled);
  assert.strictEqual(doc.getPageCount(), 2);
});

test('Backend API - Full Signature Request Lifecycle (Create -> Query -> Recipient Sign -> Complete -> Download)', async () => {
  const origPdf = await createTestPdf(1);
  const binary = Buffer.from(origPdf).toString('base64');

  // Step 1: Create Signature Request: POST /api/signatures/request
  const createPayload = {
    title: 'Consulting Contract',
    documentName: 'Consulting_Contract.pdf',
    documentBase64: binary,
    senderName: 'CEO Office',
    senderEmail: 'ceo@agency.com',
    recipients: [
      { name: 'Consultant', email: 'consultant@freelance.org', role: 'signer' },
      { name: 'Finance Lead', email: 'finance@agency.com', role: 'signer' }
    ],
    fields: [
      { id: 'fld_sig_1', recipientEmail: 'consultant@freelance.org', type: 'signature', page: 0, x: 50, y: 150, width: 140, height: 48 },
      { id: 'fld_date_1', recipientEmail: 'consultant@freelance.org', type: 'date', page: 0, x: 50, y: 90, width: 100, height: 24 },
      { id: 'fld_sig_2', recipientEmail: 'finance@agency.com', type: 'signature', page: 0, x: 220, y: 150, width: 140, height: 48 }
    ]
  };

  const req1 = createMockReq('POST', createPayload);
  const res1 = createMockRes();
  const handled1 = await handleSignRequest(req1, res1, '/api/signatures/request', 'POST');
  assert.strictEqual(handled1, true);
  assert.strictEqual(res1.statusCode, 201);

  const resJson1 = JSON.parse(res1.body);
  assert.strictEqual(resJson1.success, true);
  assert(resJson1.requestId);
  assert(resJson1.transactionId.startsWith('TRX-'));
  assert.strictEqual(resJson1.recipients.length, 2);

  const reqId = resJson1.requestId;
  const token1 = resJson1.recipients[0].token;
  const token2 = resJson1.recipients[1].token;

  // Step 2: Query Signature Request details: GET /api/signatures/request/:id
  const req2 = createMockReq('GET');
  const res2 = createMockRes();
  const handled2 = await handleSignRequest(req2, res2, `/api/signatures/request/${reqId}`, 'GET');
  assert.strictEqual(handled2, true);
  const resJson2 = JSON.parse(res2.body);
  assert.strictEqual(resJson2.success, true);
  assert.strictEqual(resJson2.status, 'pending');

  // Step 3: Recipient 1 View Query: GET /api/signatures/recipient/:token
  const req3 = createMockReq('GET');
  const res3 = createMockRes();
  const handled3 = await handleSignRequest(req3, res3, `/api/signatures/recipient/${token1}`, 'GET');
  assert.strictEqual(handled3, true);
  const resJson3 = JSON.parse(res3.body);
  assert.strictEqual(resJson3.success, true);
  assert.strictEqual(resJson3.recipient.email, 'consultant@freelance.org');
  assert.strictEqual(resJson3.fields.length, 2); // 2 fields assigned to consultant

  // Step 4: Recipient 1 Submits Signature: POST /api/signatures/recipient/:token/submit
  const submitPayload1 = {
    fieldValues: {
      fld_sig_1: samplePngDataUrl,
      fld_date_1: '2026-10-24'
    }
  };
  const req4 = createMockReq('POST', submitPayload1);
  const res4 = createMockRes();
  const handled4 = await handleSignRequest(req4, res4, `/api/signatures/recipient/${token1}/submit`, 'POST');
  assert.strictEqual(handled4, true);
  const resJson4 = JSON.parse(res4.body);
  assert.strictEqual(resJson4.success, true);
  assert.strictEqual(resJson4.completed, false); // Still waiting for Recipient 2

  // Step 5: Recipient 2 Submits Signature: POST /api/signatures/recipient/:token/submit
  const submitPayload2 = {
    fieldValues: {
      fld_sig_2: samplePngDataUrl
    }
  };
  const req5 = createMockReq('POST', submitPayload2);
  const res5 = createMockRes();
  const handled5 = await handleSignRequest(req5, res5, `/api/signatures/recipient/${token2}/submit`, 'POST');
  assert.strictEqual(handled5, true);
  const resJson5 = JSON.parse(res5.body);
  assert.strictEqual(resJson5.success, true);
  assert.strictEqual(resJson5.completed, true); // All signed!
  assert.strictEqual(resJson5.status, 'completed');

  // Step 6: Download Final Signed Document: GET /api/signatures/request/:id/download
  const req6 = createMockReq('GET');
  const res6 = createMockRes();
  const handled6 = await handleSignRequest(req6, res6, `/api/signatures/request/${reqId}/download`, 'GET');
  assert.strictEqual(handled6, true);
  assert.strictEqual(res6.statusCode, 200);
  assert.strictEqual(res6.headers['Content-Type'], 'application/pdf');
  assert(res6.body instanceof Buffer);

  const downloadedDoc = await PDFDocument.load(res6.body);
  // 1 page original + 1 page multi-party audit certificate = 2 pages
  assert.strictEqual(downloadedDoc.getPageCount(), 2);
});
