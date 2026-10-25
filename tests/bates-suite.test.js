import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { BatesOps } from '../src/core/engine/operations/bates-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleBatesRequest } from '../server/routes/bates-routes.js';

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

test('createSampleBatesPdf produces a 4-page legal discovery document with metadata', async () => {
  const sampleBytes = await BatesOps.createSampleBatesPdf();
  assert(sampleBytes instanceof Uint8Array, 'Sample should be Uint8Array');
  assert(sampleBytes.length > 500, 'Sample should not be empty');

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 4, 'Sample must have 4 pages');
  assert.strictEqual(doc.getTitle(), 'Legal Production Master Discovery Brief');
});

test('formatBatesStamp formats zero-padded strings and interpolates macros', () => {
  const stamp1 = BatesOps.formatBatesStamp(1, 6, 'CASE-', '-CONF');
  assert.strictEqual(stamp1, 'CASE-000001-CONF');

  const stamp2 = BatesOps.formatBatesStamp(45, 4, 'PROD-<<Year>>-', '', {});
  const currentYear = new Date().getFullYear();
  assert.strictEqual(stamp2, `PROD-${currentYear}-0045`);

  const stamp3 = BatesOps.formatBatesStamp(123, 8, '<<CaseNo>>-', '', { caseNo: 'SEC-9901' });
  assert.strictEqual(stamp3, 'SEC-9901-00000123');
});

test('getIncludedPageIndices handles all, skip-cover, odd, even, and custom range rules', () => {
  assert.deepStrictEqual(BatesOps.getIncludedPageIndices(4, 'all'), [0, 1, 2, 3]);
  assert.deepStrictEqual(BatesOps.getIncludedPageIndices(4, 'skip-cover'), [1, 2, 3]);
  assert.deepStrictEqual(BatesOps.getIncludedPageIndices(4, 'odd'), [0, 2]);
  assert.deepStrictEqual(BatesOps.getIncludedPageIndices(4, 'even'), [1, 3]);
  assert.deepStrictEqual(BatesOps.getIncludedPageIndices(6, '2-4, 6'), [1, 2, 3, 5]);
});

test('calculatePosition resolves coordinates for all 6 legal Bates positions', () => {
  const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
  for (const pos of positions) {
    const coords = BatesOps.calculatePosition(pos, 595.28, 841.89, 100, 10);
    assert(typeof coords.x === 'number');
    assert(typeof coords.y === 'number');
    assert(coords.x >= 0 && coords.x <= 595.28);
    assert(coords.y >= 0 && coords.y <= 841.89);
  }
});

test('applyBatesNumbering stamps document sequentially with zero-padded audit report', async () => {
  const sampleBytes = await BatesOps.createSampleBatesPdf();
  const result = await BatesOps.applyBatesNumbering(sampleBytes, {
    prefix: 'LEGAL-PROD-',
    suffix: '-US',
    startNumber: 101,
    digits: 6,
    position: 'bottom-right'
  });

  assert(result instanceof Uint8Array);
  assert(result.report);
  assert.strictEqual(result.report.startBates, 'LEGAL-PROD-000101-US');
  assert.strictEqual(result.report.endBates, 'LEGAL-PROD-000104-US');
  assert.strictEqual(result.report.stampedCount, 4);
  assert.strictEqual(result.report.totalPages, 4);
  assert.strictEqual(result.report.nextNumber, 105);

  const doc = await PDFDocument.load(result);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('applyBatesNumbering with skip-cover skips first page', async () => {
  const sampleBytes = await BatesOps.createSampleBatesPdf();
  const result = await BatesOps.applyBatesNumbering(sampleBytes, {
    prefix: 'BRIEF-',
    startNumber: 1,
    digits: 5,
    rangeRule: 'skip-cover'
  });

  assert.strictEqual(result.report.stampedCount, 3);
  assert.strictEqual(result.report.totalPages, 4);
  assert.strictEqual(result.report.startBates, 'BRIEF-00001');
  assert.strictEqual(result.report.endBates, 'BRIEF-00003');
  assert.strictEqual(result.report.nextNumber, 4);
});

test('applyBatesNumbering supports custom fonts (CourierBold, TimesRomanBold) and styling', async () => {
  const sampleBytes = await BatesOps.createSampleBatesPdf();
  const result = await BatesOps.applyBatesNumbering(sampleBytes, {
    prefix: 'DOCKET-',
    digits: 6,
    fontFamily: 'CourierBold',
    fontSize: 12,
    color: '#b91c1c',
    position: 'top-center'
  });

  assert.strictEqual(result.report.stampedCount, 4);
  const doc = await PDFDocument.load(result);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('sequenceBatch numbers multi-document collection sequentially', async () => {
  const doc1Bytes = await BatesOps.createSampleBatesPdf();
  const doc2Bytes = await BatesOps.createSampleBatesPdf();

  const batch = await BatesOps.sequenceBatch([
    { name: 'Deposition_A.pdf', bytes: doc1Bytes },
    { name: 'Deposition_B.pdf', bytes: doc2Bytes }
  ], {
    prefix: 'LITIGATION-',
    digits: 6,
    startNumber: 1
  });

  assert.strictEqual(batch.documents.length, 2);
  assert.strictEqual(batch.totalStampedPages, 8);
  assert.strictEqual(batch.startBates, 'LITIGATION-000001');
  assert.strictEqual(batch.endBates, 'LITIGATION-000008');
  assert.strictEqual(batch.nextAvailableNumber, 9);

  assert.strictEqual(batch.documents[0].report.startBates, 'LITIGATION-000001');
  assert.strictEqual(batch.documents[0].report.endBates, 'LITIGATION-000004');

  assert.strictEqual(batch.documents[1].report.startBates, 'LITIGATION-000005');
  assert.strictEqual(batch.documents[1].report.endBates, 'LITIGATION-000008');
});

test('PageOperations facade delegates batesNumberPdf, applyBatesNumbering, and sequenceBatesBatch', async () => {
  const sample = await PageOperations.createSampleBatesPdf();
  assert(sample.length > 500);

  const res = await PageOperations.applyBatesNumbering(sample, {
    prefix: 'FACADE-',
    digits: 5
  });

  assert(res instanceof Uint8Array);
  assert(res.report);
  assert.strictEqual(res.report.stampedCount, 4);

  const res2 = await PageOperations.batesNumberPdf(sample, {
    prefix: 'LEGACY-',
    digits: 6
  });
  assert(res2.report);
  assert.strictEqual(res2.report.startBates, 'LEGACY-000001');
});

test('Backend HTTP route GET /api/bates/sample returns legal brief PDF', async () => {
  const req = createMockReq('GET', '/api/bates/sample');
  const res = createMockRes();

  const handled = await handleBatesRequest(req, res, '/api/bates/sample', 'GET');
  assert.strictEqual(Boolean(handled), true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert(parsed.pdfBase64, 'pdfBase64 must be returned');

  const doc = await PDFDocument.load(Buffer.from(parsed.pdfBase64, 'base64'));
  assert.strictEqual(doc.getPageCount(), 4);
});

test('Backend HTTP route POST /api/bates/preview calculates stamp and position', async () => {
  const req = createMockReq('POST', '/api/bates/preview', {
    prefix: 'PREVIEW-',
    suffix: '-EXHIBIT',
    startNumber: 50,
    digits: 6,
    position: 'bottom-center'
  });
  const res = createMockRes();

  const handled = await handleBatesRequest(req, res, '/api/bates/preview', 'POST');
  assert.strictEqual(Boolean(handled), true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.formattedStamp, 'PREVIEW-000050-EXHIBIT');
  assert(parsed.position && typeof parsed.position.x === 'number');
});

test('Backend HTTP route POST /api/bates/apply stamps PDF and returns audit report', async () => {
  const sampleBytes = await BatesOps.createSampleBatesPdf();
  const req = createMockReq('POST', '/api/bates/apply', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64'),
    config: {
      prefix: 'API-BATES-',
      startNumber: 1,
      digits: 6,
      position: 'bottom-right'
    }
  });
  const res = createMockRes();

  const handled = await handleBatesRequest(req, res, '/api/bates/apply', 'POST');
  assert.strictEqual(Boolean(handled), true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.startBates, 'API-BATES-000001');
  assert.strictEqual(parsed.endBates, 'API-BATES-000004');
  assert.strictEqual(parsed.appliedCount, 4);
  assert(parsed.pdfBase64);
});

test('Backend HTTP route POST /api/bates/batch processes multi-document batch', async () => {
  const sampleBytes = await BatesOps.createSampleBatesPdf();
  const b64 = Buffer.from(sampleBytes).toString('base64');
  const req = createMockReq('POST', '/api/bates/batch', {
    documents: [
      { name: 'Doc1.pdf', pdfBase64: b64 },
      { name: 'Doc2.pdf', pdfBase64: b64 }
    ],
    config: {
      prefix: 'BATCH-',
      digits: 6,
      startNumber: 1
    }
  });
  const res = createMockRes();

  const handled = await handleBatesRequest(req, res, '/api/bates/batch', 'POST');
  assert.strictEqual(Boolean(handled), true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.totalStampedPages, 8);
  assert.strictEqual(parsed.startBates, 'BATCH-000001');
  assert.strictEqual(parsed.endBates, 'BATCH-000008');
  assert.strictEqual(parsed.documents.length, 2);
});
