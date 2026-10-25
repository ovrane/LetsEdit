import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { RedactOps } from '../src/core/engine/operations/redact-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleRedactRequest } from '../server/routes/redact-routes.js';

// Mock request / response helpers for backend route testing
function createMockReq(method, urlPath, body = null, headers = {}) {
  const req = {
    method,
    url: urlPath,
    headers: { 'content-type': 'application/json', host: 'localhost:3000', ...headers },
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

test('createSampleRedactPdf produces a 3-page confidential discovery record with mock PII', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  assert(sampleBytes instanceof Uint8Array, 'Sample should be Uint8Array');
  assert(sampleBytes.length > 500, 'Sample should not be empty');

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 3, 'Sample must have 3 pages');
  assert.strictEqual(doc.getTitle(), 'Confidential Financial & PII Discovery Record');
});

test('searchSensitiveData detects SSN, credit cards, emails, phone numbers, and custom keywords', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  const searchResult = await RedactOps.searchSensitiveData(sampleBytes, {
    ssn: true,
    creditCard: true,
    email: true,
    phone: true,
    customKeywords: ['PROJECT VALKYRIE', 'Acquisition']
  });

  assert(searchResult.totalMatches > 0, 'Should find sensitive matches in sample PDF');
  assert(searchResult.matches.some(m => m.type === 'ssn'), 'Should detect SSN pattern');
  assert(searchResult.matches.some(m => m.type === 'creditCard'), 'Should detect Credit Card pattern');
  assert(searchResult.matches.some(m => m.type === 'email'), 'Should detect email pattern');
  assert(searchResult.matches.some(m => m.type === 'custom'), 'Should detect custom keywords');
  assert.strictEqual(searchResult.scannedPages, 3, 'Should scan all 3 pages');
});

test('searchSensitiveData on a clean document returns 0 matches', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 400]);
  page.drawText('Public Annual Financial Overview - Safe for Distribution', { x: 50, y: 350 });
  const cleanBytes = await doc.save();

  const searchResult = await RedactOps.searchSensitiveData(cleanBytes, {
    ssn: true,
    creditCard: true,
    email: true,
    phone: true
  });

  assert.strictEqual(searchResult.totalMatches, 0, 'Clean PDF must return 0 sensitive matches');
  assert.strictEqual(searchResult.matches.length, 0);
});

test('applyRedaction with blackout removes sensitive tokens and burns vector rectangles', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  const { pdfBytes, report } = await RedactOps.applyRedaction(sampleBytes, {
    ssn: true,
    creditCard: true,
    email: true,
    phone: true,
    customKeywords: ['VALKYRIE'],
    appearance: 'blackout',
    overlayText: '[REDACTED]'
  });

  assert(pdfBytes instanceof Uint8Array);
  assert(pdfBytes.length > 500);
  assert(report.redactedItemsCount > 0, 'Report must show redacted items');
  assert.strictEqual(report.appearance, 'blackout');
  assert.strictEqual(report.overlayText, '[REDACTED]');

  const doc = await PDFDocument.load(pdfBytes);
  assert.strictEqual(doc.getPageCount(), 3);
});

test('applyRedaction with whiteout appearance and custom text overlay', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  const { pdfBytes, report } = await RedactOps.applyRedaction(sampleBytes, {
    ssn: true,
    appearance: 'whiteout',
    overlayText: 'CONFIDENTIAL / PURGED'
  });

  assert(pdfBytes instanceof Uint8Array);
  assert.strictEqual(report.appearance, 'whiteout');
  assert.strictEqual(report.overlayText, 'CONFIDENTIAL / PURGED');
  assert(report.redactedItemsCount > 0);
});

test('applyRedaction purges sensitive terms from decompressed content stream text operators', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  const { pdfBytes } = await RedactOps.applyRedaction(sampleBytes, {
    ssn: true,
    creditCard: true,
    email: true,
    phone: true,
    customKeywords: ['VALKYRIE', 'Acquisition']
  });

  // Verify that a second sensitive scan finds 0 matches on the purged document
  const postScan = await RedactOps.searchSensitiveData(pdfBytes, {
    ssn: true,
    creditCard: true,
    email: true,
    phone: true,
    customKeywords: ['VALKYRIE']
  });

  assert.strictEqual(postScan.totalMatches, 0, 'Post-redaction document must have zero sensitive matches');
});

test('applyRedaction supports custom target pages filtering', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  const { pdfBytes, report } = await RedactOps.applyRedaction(sampleBytes, {
    ssn: true,
    targetPages: [1] // Only page 1
  });

  assert(report.redactedPages.includes(1), 'Page 1 must be redacted');
  assert(!report.redactedPages.includes(2), 'Page 2 should not be redacted when filtered out');
  assert(!report.redactedPages.includes(3), 'Page 3 should not be redacted when filtered out');

  const doc = await PDFDocument.load(pdfBytes);
  assert.strictEqual(doc.getPageCount(), 3, 'Document structure is preserved');
});

test('PageOperations facade delegates correctly to RedactOps methods', async () => {
  const sampleBytes = await PageOperations.createSampleRedactPdf();
  assert(sampleBytes instanceof Uint8Array);

  const search = await PageOperations.searchSensitiveData(sampleBytes, { email: true });
  assert(search.totalMatches > 0);

  const { pdfBytes, report } = await PageOperations.applyRedaction(sampleBytes, { email: true });
  assert(pdfBytes instanceof Uint8Array);
  assert(report.redactedItemsCount > 0);
});

test('backend route GET /api/redact/sample returns raw PDF binary', async () => {
  const req = createMockReq('GET', '/api/redact/sample', null, { accept: 'application/pdf' });
  const res = createMockRes();

  const handled = await handleRedactRequest(req, res);
  assert.strictEqual(handled, true, 'Route should handle /api/redact/sample');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.headers['Content-Type'], 'application/pdf');
  assert(res.body instanceof Buffer || res.body instanceof Uint8Array);
});

test('backend route GET /api/redact/sample returns base64 payload in JSON mode', async () => {
  const req = createMockReq('GET', '/api/redact/sample');
  const res = createMockRes();

  const handled = await handleRedactRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.filename, 'sample_pii_discovery.pdf');
  assert(typeof json.pdfBase64 === 'string');
});

test('backend route POST /api/redact/search detects sensitive entities in uploaded PDF', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  const base64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/redact/search', {
    fileData: base64,
    options: { ssn: true, creditCard: true, email: true, phone: true }
  });
  const res = createMockRes();

  const handled = await handleRedactRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.strictEqual(json.success, true);
  assert(json.totalMatches > 0);
  assert.strictEqual(json.scannedPages, 3);
});

test('backend route POST /api/redact/search returns 400 when fileData is missing', async () => {
  const req = createMockReq('POST', '/api/redact/search', {});
  const res = createMockRes();

  const handled = await handleRedactRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 400);
  const json = JSON.parse(res.body);
  assert.strictEqual(json.success, false);
});

test('backend route POST /api/redact/apply executes vector redaction and returns report', async () => {
  const sampleBytes = await RedactOps.createSampleRedactPdf();
  const base64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/redact/apply', {
    fileData: base64,
    options: {
      ssn: true,
      creditCard: true,
      customKeywords: ['VALKYRIE'],
      appearance: 'blackout',
      overlayText: '[REDACTED]'
    }
  });
  const res = createMockRes();

  const handled = await handleRedactRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.strictEqual(json.success, true);
  assert(typeof json.pdfBase64 === 'string');
  assert(json.report.redactedItemsCount > 0);
  assert.strictEqual(json.report.appearance, 'blackout');
});

test('backend route returns false for unmatched URLs', async () => {
  const req = createMockReq('GET', '/api/other-route');
  const res = createMockRes();

  const handled = await handleRedactRequest(req, res);
  assert.strictEqual(handled, false);
});
