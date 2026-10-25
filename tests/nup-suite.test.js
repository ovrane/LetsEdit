import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { NupOps } from '../src/core/engine/operations/nup-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleNupRequest } from '../server/routes/nup-routes.js';

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

test('createSampleNupPdf produces an 8-page corporate document', async () => {
  const sampleBytes = await NupOps.createSampleNupPdf();
  assert(sampleBytes instanceof Uint8Array, 'Sample should be Uint8Array');
  assert(sampleBytes.length > 500, 'Sample should not be empty');

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 8, 'Sample document must contain 8 pages');
});

test('getIncludedPageIndices parses all, odd, even, and custom range strings', () => {
  const allPages = NupOps.getIncludedPageIndices(6, 'all');
  assert.deepStrictEqual(allPages, [0, 1, 2, 3, 4, 5]);

  const oddPages = NupOps.getIncludedPageIndices(6, 'odd');
  assert.deepStrictEqual(oddPages, [0, 2, 4]);

  const evenPages = NupOps.getIncludedPageIndices(6, 'even');
  assert.deepStrictEqual(evenPages, [1, 3, 5]);

  const customRange = NupOps.getIncludedPageIndices(8, '1-3, 6-7');
  assert.deepStrictEqual(customRange, [0, 1, 2, 5, 6]);
});

test('applyNup 2-Up produces landscape A4 sheets with 2 pages per sheet', async () => {
  const sampleBytes = await NupOps.createSampleNupPdf();
  const res = await NupOps.applyNup(sampleBytes, {
    layout: 2,
    margin: 20,
    gutter: 8,
    showBorder: true
  });

  assert(res instanceof Uint8Array, 'Result must be Uint8Array');
  assert.strictEqual(res.bytes, res, 'Result.bytes should point to itself');
  assert.strictEqual(res.outputPageCount, 4, '8 pages in 2-Up must yield 4 sheets');
  assert.strictEqual(res.layout, 2);

  const doc = await PDFDocument.load(res);
  assert.strictEqual(doc.getPageCount(), 4);
  const sz = doc.getPage(0).getSize();
  assert.strictEqual(sz.width, 841.89, 'Default 2-Up sheet must be A4 landscape width');
  assert.strictEqual(sz.height, 595.28, 'Default 2-Up sheet must be A4 landscape height');
});

test('applyNup 4-Up produces portrait A4 sheets with 2x2 grid', async () => {
  const sampleBytes = await NupOps.createSampleNupPdf();
  const res = await NupOps.applyNup(sampleBytes, {
    layout: 4,
    showBorder: true,
    borderColor: '#3b82f6',
    backgroundColor: '#f8fafc'
  });

  assert.strictEqual(res.outputPageCount, 2, '8 pages in 4-Up must yield 2 sheets');
  assert.strictEqual(res.appliedCount, 8);

  const doc = await PDFDocument.load(res);
  assert.strictEqual(doc.getPageCount(), 2);
  const sz = doc.getPage(0).getSize();
  assert.strictEqual(sz.width, 595.28, '4-Up portrait width');
  assert.strictEqual(sz.height, 841.89, '4-Up portrait height');
});

test('applyNup 6-Up and 8-Up layouts impose correct sheet counts', async () => {
  const sampleBytes = await NupOps.createSampleNupPdf();

  // 6-Up on 8 pages -> ceil(8/6) = 2 sheets
  const res6 = await NupOps.applyNup(sampleBytes, { layout: 6 });
  assert.strictEqual(res6.outputPageCount, 2);
  const doc6 = await PDFDocument.load(res6);
  assert.strictEqual(doc6.getPageCount(), 2);

  // 8-Up on 8 pages -> ceil(8/8) = 1 sheet
  const res8 = await NupOps.applyNup(sampleBytes, { layout: 8 });
  assert.strictEqual(res8.outputPageCount, 1);
  const doc8 = await PDFDocument.load(res8);
  assert.strictEqual(doc8.getPageCount(), 1);
});

test('applyNup respects custom orientation override', async () => {
  const sampleBytes = await NupOps.createSampleNupPdf();
  const res = await NupOps.applyNup(sampleBytes, {
    layout: 4,
    orientation: 'landscape'
  });

  const doc = await PDFDocument.load(res);
  const sz = doc.getPage(0).getSize();
  assert.strictEqual(sz.width, 841.89, 'Forced landscape width');
  assert.strictEqual(sz.height, 595.28, 'Forced landscape height');
});

test('applyNup filters pages by rangeRule (odd pages only)', async () => {
  const sampleBytes = await NupOps.createSampleNupPdf();
  const res = await NupOps.applyNup(sampleBytes, {
    layout: 2,
    rangeRule: 'odd'
  });

  // 8 pages -> 4 odd pages -> 2 sheets in 2-Up
  assert.strictEqual(res.appliedCount, 4);
  assert.strictEqual(res.outputPageCount, 2);
});

test('PageOperations facade delegates applyNup and createSampleNupPdf', async () => {
  const sampleBytes = await PageOperations.createSampleNupPdf();
  assert(sampleBytes instanceof Uint8Array);

  const res = await PageOperations.applyNup(sampleBytes, { layout: 4 });
  assert.strictEqual(res.outputPageCount, 2);
  assert(res.report, 'Report must be attached');
});

test('GET /api/nup/sample returns sample base64 PDF', async () => {
  const req = createMockReq('GET', '/api/nup/sample');
  const res = createMockRes();

  const handled = await handleNupRequest(req, res, '/api/nup/sample', 'GET');
  assert(Boolean(handled));
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert(parsed.pdfBase64, 'pdfBase64 must be present');
  assert(parsed.size > 500, 'size must be > 500');

  const buf = Buffer.from(parsed.pdfBase64, 'base64');
  const doc = await PDFDocument.load(buf);
  assert.strictEqual(doc.getPageCount(), 8);
});

test('POST /api/nup/preview-config computes imposition statistics', async () => {
  const req = createMockReq('POST', '/api/nup/preview-config', {
    layout: 4,
    totalPages: 10,
    orientation: 'portrait'
  });
  const res = createMockRes();

  await handleNupRequest(req, res, '/api/nup/preview-config', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.layout, 4);
  assert.strictEqual(parsed.expectedSheets, 3, 'ceil(10/4) = 3 sheets');
  assert.strictEqual(parsed.pagesPerSheet, 4);
});

test('POST /api/nup/apply imposes pages onto sheets and returns base64 PDF', async () => {
  const sampleBytes = await NupOps.createSampleNupPdf();
  const req = createMockReq('POST', '/api/nup/apply', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64'),
    layout: 2,
    showBorder: true
  });
  const res = createMockRes();

  await handleNupRequest(req, res, '/api/nup/apply', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.outputPageCount, 4);
  assert.strictEqual(parsed.layout, 2);
  assert(parsed.pdfBase64, 'Output PDF base64 must exist');

  const outBuf = Buffer.from(parsed.pdfBase64, 'base64');
  const doc = await PDFDocument.load(outBuf);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('POST /api/nup/apply returns 400 when pdfBase64 is missing', async () => {
  const req = createMockReq('POST', '/api/nup/apply', {
    layout: 2
  });
  const res = createMockRes();

  await handleNupRequest(req, res, '/api/nup/apply', 'POST');
  assert.strictEqual(res.statusCode, 400);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, false);
  assert(parsed.error.includes('Missing pdfBase64'));
});
