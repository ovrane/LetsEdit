import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { MultiSignOps } from '../src/core/engine/operations/multi-sign-ops.js';
import { MultiSignerOps } from '../src/core/engine/operations/multi-signer-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleSignRequest, SIGNATURE_REQUESTS } from '../server/routes/sign-request-routes.js';
import { handleMultiSignerRequest } from '../server/routes/multi-signer-routes.js';

// 1x1 Transparent PNG data URL for test signatures
const samplePngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Mock request / response helpers for backend testing
function createMockReq(method, body = null, headers = {}) {
  const req = {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    socket: { remoteAddress: '127.0.0.1' },
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

test('Multi-Signer Suite - createSampleSignContract generates valid 3-page commercial agreement', async () => {
  const contractBytes = await MultiSignOps.createSampleSignContract();
  assert(contractBytes instanceof Uint8Array);
  assert(contractBytes.length > 5000);

  const doc = await PDFDocument.load(contractBytes);
  assert.strictEqual(doc.getPageCount(), 3);

  const p1 = doc.getPage(0);
  const p3 = doc.getPage(2);
  assert.strictEqual(Math.round(p1.getWidth()), 595);
  assert.strictEqual(Math.round(p1.getHeight()), 842);
  assert.strictEqual(Math.round(p3.getWidth()), 595);
  assert.strictEqual(Math.round(p3.getHeight()), 842);
});

test('Multi-Signer Suite - createSampleSignContractPackage returns complete agreement package with fields', async () => {
  const pkg = await MultiSignOps.createSampleSignContractPackage();
  assert(pkg.pdfBytes instanceof Uint8Array);
  assert.strictEqual(pkg.documentName, 'Commercial_Mutual_Services_Agreement.pdf');
  assert.strictEqual(pkg.recipients.length, 2);
  assert(pkg.fields.length >= 8);

  const roles = pkg.recipients.map(r => r.role);
  assert(roles.every(role => role === 'signer'));

  // Ensure Party A and Party B have signature and company fields
  const types = pkg.fields.map(f => f.type);
  assert(types.includes('signature'));
  assert(types.includes('company'));
  assert(types.includes('date'));
  assert(types.includes('text'));
});

test('Multi-Signer Suite - validateFieldValue enforces required, minLength, and regex masks', () => {
  // Required
  const reqField = { label: 'Full Legal Name', required: true, minLength: 3 };
  assert.strictEqual(MultiSignOps.validateFieldValue(reqField, '').valid, false);
  assert.strictEqual(MultiSignOps.validateFieldValue(reqField, '   ').valid, false);
  assert.strictEqual(MultiSignOps.validateFieldValue(reqField, null).valid, false);

  // minLength
  assert.strictEqual(MultiSignOps.validateFieldValue(reqField, 'Al').valid, false);
  assert.strictEqual(MultiSignOps.validateFieldValue(reqField, 'Alice').valid, true);

  // Optional field
  const optField = { label: 'Notes', required: false };
  assert.strictEqual(MultiSignOps.validateFieldValue(optField, '').valid, true);

  // Email mask
  const emailField = { label: 'Email', mask: 'email', required: true };
  assert.strictEqual(MultiSignOps.validateFieldValue(emailField, 'invalid-email').valid, false);
  assert.strictEqual(MultiSignOps.validateFieldValue(emailField, 'signer@company.org').valid, true);

  // Phone mask
  const phoneField = { label: 'Phone', mask: 'phone', required: true };
  assert.strictEqual(MultiSignOps.validateFieldValue(phoneField, 'notaphone').valid, false);
  assert.strictEqual(MultiSignOps.validateFieldValue(phoneField, '+1 (555) 234-5678').valid, true);

  // SSN mask
  const ssnField = { label: 'SSN', mask: 'ssn', required: true };
  assert.strictEqual(MultiSignOps.validateFieldValue(ssnField, '12-34').valid, false);
  assert.strictEqual(MultiSignOps.validateFieldValue(ssnField, '123-45-6789').valid, true);

  // Batch validation
  const batchRes = MultiSignOps.validateFieldValues(
    [
      { id: 'f1', label: 'Name', required: true, minLength: 3 },
      { id: 'f2', label: 'Email', mask: 'email', required: true }
    ],
    { f1: 'Bob', f2: 'invalid' }
  );
  assert.strictEqual(batchRes.valid, false);
  assert.strictEqual(batchRes.fieldId, 'f2');
});

test('Multi-Signer Suite - canRecipientSign correctly evaluates parallel vs sequential routing', () => {
  const parallelRequest = {
    signingOrder: 'parallel',
    recipients: [
      { email: 'signer1@test.org', status: 'pending', role: 'signer' },
      { email: 'signer2@test.org', status: 'pending', role: 'signer' }
    ]
  };

  // In parallel, either signer can sign anytime
  assert.strictEqual(MultiSignOps.canRecipientSign(parallelRequest, 'signer1@test.org').allowed, true);
  assert.strictEqual(MultiSignOps.canRecipientSign(parallelRequest, 'signer2@test.org').allowed, true);

  const sequentialRequest = {
    signingOrder: 'sequential',
    recipients: [
      { name: 'Alice', email: 'alice@test.org', status: 'pending', role: 'signer' },
      { name: 'Bob', email: 'bob@test.org', status: 'pending', role: 'signer' },
      { name: 'Charlie', email: 'charlie@test.org', status: 'pending', role: 'viewer' }
    ]
  };

  // In sequential, Alice can sign, but Bob cannot sign until Alice has signed
  assert.strictEqual(MultiSignOps.canRecipientSign(sequentialRequest, 'alice@test.org').allowed, true);
  const bobCheck = MultiSignOps.canRecipientSign(sequentialRequest, 'bob@test.org');
  assert.strictEqual(bobCheck.allowed, false);
  assert(bobCheck.error.includes('Alice'));

  // Once Alice signs, Bob is allowed
  sequentialRequest.recipients[0].status = 'signed';
  assert.strictEqual(MultiSignOps.canRecipientSign(sequentialRequest, 'bob@test.org').allowed, true);
});

test('Multi-Signer Suite - generateCryptographicToken produces secure session tokens', () => {
  const tok1 = MultiSignOps.generateCryptographicToken('rec_1', 'TRX-101');
  const tok2 = MultiSignOps.generateCryptographicToken('rec_2', 'TRX-101');
  assert(tok1.startsWith('sign_tok_'));
  assert(tok2.startsWith('sign_tok_'));
  assert.notStrictEqual(tok1, tok2);
});

test('Multi-Signer Suite - PageOperations facade delegates Multi-Signer methods', async () => {
  const contract = await PageOperations.createSampleSignContract();
  assert(contract instanceof Uint8Array);

  const pkg = await PageOperations.createSampleSignContractPackage();
  assert.strictEqual(pkg.recipients.length, 2);

  const val = PageOperations.validateFieldValue({ required: true }, '');
  assert.strictEqual(val.valid, false);

  const canSign = PageOperations.canRecipientSign({ signingOrder: 'parallel', recipients: [{ email: 'a@b.com' }] }, 'a@b.com');
  assert.strictEqual(canSign.allowed, true);
});

test('Multi-Signer Suite - Full API Lifecycle with Sequential Routing & Field Constraints', async () => {
  // Step 1: Query sample agreement endpoint: GET /api/signature/sample
  const sampleReq = createMockReq('GET', null, { accept: 'application/json' });
  const sampleRes = createMockRes();
  const sampleHandled = await handleMultiSignerRequest(sampleReq, sampleRes, '/api/signature/sample', 'GET');
  assert.strictEqual(sampleHandled, true);
  assert.strictEqual(sampleRes.statusCode, 200);
  const sampleJson = JSON.parse(sampleRes.body);
  assert.strictEqual(sampleJson.success, true);
  assert(sampleJson.documentBase64);
  assert.strictEqual(sampleJson.recipients.length, 2);

  // Step 2: Create a sequential signature request: POST /api/signature/create-request
  const createPayload = {
    title: 'Acme-Apex MSA Agreement',
    documentName: 'Acme_Apex_Agreement.pdf',
    documentBase64: sampleJson.documentBase64,
    signingOrder: 'sequential',
    senderName: 'General Counsel',
    senderEmail: 'counsel@acme-tech.example',
    recipients: [
      { name: 'Alice Smith', email: 'alice@acme-tech.example', role: 'signer' },
      { name: 'Bob Jones', email: 'bob@apex-systems.example', role: 'signer' }
    ],
    fields: [
      { id: 'fld_sig_1', recipientEmail: 'alice@acme-tech.example', type: 'signature', page: 2, x: 60, y: 380, width: 180, height: 45, required: true },
      { id: 'fld_company_1', recipientEmail: 'alice@acme-tech.example', type: 'company', page: 2, x: 60, y: 260, width: 180, height: 22, required: true, minLength: 3 },
      { id: 'fld_sig_2', recipientEmail: 'bob@apex-systems.example', type: 'signature', page: 2, x: 340, y: 380, width: 180, height: 45, required: true },
      { id: 'fld_company_2', recipientEmail: 'bob@apex-systems.example', type: 'company', page: 2, x: 340, y: 260, width: 180, height: 22, required: true, minLength: 3 }
    ]
  };

  const createReq = createMockReq('POST', createPayload);
  const createRes = createMockRes();
  const createHandled = await handleMultiSignerRequest(createReq, createRes, '/api/signature/create-request', 'POST');
  assert.strictEqual(createHandled, true);
  assert.strictEqual(createRes.statusCode, 201);
  const createJson = JSON.parse(createRes.body);
  assert.strictEqual(createJson.success, true);
  assert.strictEqual(createJson.signingOrder, 'sequential');
  assert.strictEqual(createJson.recipients.length, 2);

  const reqId = createJson.requestId;
  const tokenAlice = createJson.recipients[0].token;
  const tokenBob = createJson.recipients[1].token;

  // Step 3: List active signature requests: GET /api/signature/requests
  const listReq = createMockReq('GET');
  const listRes = createMockRes();
  const listHandled = await handleMultiSignerRequest(listReq, listRes, '/api/signature/requests', 'GET');
  assert.strictEqual(listHandled, true);
  const listJson = JSON.parse(listRes.body);
  assert.strictEqual(listJson.success, true);
  assert(listJson.requests.some(r => r.requestId === reqId));

  // Step 4: Bob attempts to view portal before Alice signs -> canSign should be false
  const bobViewReq = createMockReq('GET');
  const bobViewRes = createMockRes();
  const bobViewHandled = await handleMultiSignerRequest(bobViewReq, bobViewRes, `/api/signature/recipient-view/${tokenBob}`, 'GET');
  assert.strictEqual(bobViewHandled, true);
  const bobViewJson = JSON.parse(bobViewRes.body);
  assert.strictEqual(bobViewJson.success, true);
  assert.strictEqual(bobViewJson.canSign, false);
  assert(bobViewJson.sequenceMessage.includes('Alice'));

  // Step 5: Bob attempts to submit signature early -> should be rejected with 403
  const bobEarlySubmitReq = createMockReq('POST', {
    token: tokenBob,
    fieldValues: { fld_sig_2: samplePngDataUrl, fld_company_2: 'Apex Systems LLC' }
  });
  const bobEarlySubmitRes = createMockRes();
  const bobEarlyHandled = await handleMultiSignerRequest(bobEarlySubmitReq, bobEarlySubmitRes, '/api/signature/submit-signature', 'POST');
  assert.strictEqual(bobEarlyHandled, true);
  assert.strictEqual(bobEarlySubmitRes.statusCode, 403);

  // Step 6: Alice submits invalid data (violates minLength: 3 on company name) -> rejected with 400
  const aliceInvalidReq = createMockReq('POST', {
    token: tokenAlice,
    fieldValues: { fld_sig_1: samplePngDataUrl, fld_company_1: 'A' }
  });
  const aliceInvalidRes = createMockRes();
  await handleMultiSignerRequest(aliceInvalidReq, aliceInvalidRes, '/api/signature/submit-signature', 'POST');
  assert.strictEqual(aliceInvalidRes.statusCode, 400);

  // Step 7: Alice submits valid data -> succeeds and status transitions to 'partially_signed'
  const aliceValidReq = createMockReq('POST', {
    token: tokenAlice,
    fieldValues: { fld_sig_1: samplePngDataUrl, fld_company_1: 'Acme Technologies Inc.' }
  });
  const aliceValidRes = createMockRes();
  await handleMultiSignerRequest(aliceValidReq, aliceValidRes, '/api/signature/submit-signature', 'POST');
  assert.strictEqual(aliceValidRes.statusCode, 200);
  const aliceValidJson = JSON.parse(aliceValidRes.body);
  assert.strictEqual(aliceValidJson.status, 'partially_signed');
  assert.strictEqual(aliceValidJson.completed, false);

  // Step 8: Bob queries portal again -> now canSign is true!
  const bobViewReq2 = createMockReq('GET');
  const bobViewRes2 = createMockRes();
  await handleMultiSignerRequest(bobViewReq2, bobViewRes2, `/api/signature/recipient-view/${tokenBob}`, 'GET');
  const bobViewJson2 = JSON.parse(bobViewRes2.body);
  assert.strictEqual(bobViewJson2.canSign, true);

  // Step 9: Bob submits valid signature -> completes document!
  const bobSubmitReq = createMockReq('POST', {
    token: tokenBob,
    fieldValues: { fld_sig_2: samplePngDataUrl, fld_company_2: 'Apex Global LLC' }
  });
  const bobSubmitRes = createMockRes();
  await handleMultiSignerRequest(bobSubmitReq, bobSubmitRes, '/api/signature/submit-signature', 'POST');
  assert.strictEqual(bobSubmitRes.statusCode, 200);
  const bobSubmitJson = JSON.parse(bobSubmitRes.body);
  assert.strictEqual(bobSubmitJson.completed, true);
  assert.strictEqual(bobSubmitJson.status, 'completed');

  // Step 10: Download finalized signed document with burned fields & eIDAS audit certificate
  const downloadReq = createMockReq('GET');
  const downloadRes = createMockRes();
  await handleMultiSignerRequest(downloadReq, downloadRes, `/api/signature/request/${reqId}/download`, 'GET');
  assert.strictEqual(downloadRes.statusCode, 200);
  assert.strictEqual(downloadRes.headers['Content-Type'], 'application/pdf');

  const finalDoc = await PDFDocument.load(downloadRes.body);
  // Original 3 pages + 1 eIDAS Multi-Signer Audit Certificate page = 4 pages
  assert.strictEqual(finalDoc.getPageCount(), 4);
});
