import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { WatermarkOps } from '../src/core/engine/operations/watermark-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleWatermarkRequest } from '../server/routes/watermark-routes.js';

// Minimal 1x1 transparent PNG data for image watermark test
const SAMPLE_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SAMPLE_PNG_BYTES = Uint8Array.from(Buffer.from(SAMPLE_PNG_BASE64, 'base64'));

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

test('createSampleWatermarkPdf produces a 4-page test document with metadata', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  assert(sampleBytes instanceof Uint8Array, 'Sample should be Uint8Array');
  assert(sampleBytes.length > 500, 'Sample should not be empty');

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 4, 'Sample document must contain 4 pages');
  assert.strictEqual(doc.getTitle(), 'Quarterly Financial & Security Audit');
});

test('applyWatermark stamps diagonal vector text watermark across all pages', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const result = await WatermarkOps.applyWatermark(sampleBytes, {
    mode: 'text',
    text: 'CONFIDENTIAL DRAFT',
    fontFamily: 'HelveticaBold',
    fontSize: 36,
    color: '#ef4444',
    opacity: 0.35,
    rotation: 45,
    layer: 'over',
    layout: 'single',
    position: 'center'
  }, { fileName: 'Report.pdf' });

  assert(result instanceof Uint8Array);
  assert(result.report, 'Result should carry report metadata');
  assert.strictEqual(result.report.appliedCount, 4);
  assert.strictEqual(result.report.totalPages, 4);
  assert.strictEqual(result.report.mode, 'text');
  assert.strictEqual(result.report.rotation, 45);
  assert.strictEqual(result.report.layer, 'over');

  const stampedDoc = await PDFDocument.load(result);
  assert.strictEqual(stampedDoc.getPageCount(), 4);
});

test('applyWatermark interpolates dynamic macros (<<Page>>, <<TotalPages>>, <<Date>>, <<FileName>>)', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const result = await WatermarkOps.applyWatermark(sampleBytes, {
    mode: 'text',
    text: 'COPY - Page <<Page>> of <<TotalPages>> (<<FileName>>)',
    fontSize: 20,
    position: 'bottom-center'
  }, { fileName: 'Internal_Memo.pdf' });

  assert(result.report.appliedCount === 4);
  const doc = await PDFDocument.load(result);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('applyWatermark supports mosaic repeat grid layout mode', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const result = await WatermarkOps.applyWatermark(sampleBytes, {
    mode: 'text',
    text: 'INTERNAL ONLY',
    layout: 'mosaic',
    rotation: 30,
    opacity: 0.15
  });

  assert.strictEqual(result.report.layout, 'mosaic');
  assert.strictEqual(result.report.appliedCount, 4);
  const doc = await PDFDocument.load(result);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('applyWatermark supports 9-point anchor alignment positions', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const positions = ['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  for (const pos of positions) {
    const result = await WatermarkOps.applyWatermark(sampleBytes, {
      mode: 'text',
      text: `STAMP-${pos.toUpperCase()}`,
      position: pos,
      pages: '1'
    });
    assert.strictEqual(result.report.appliedCount, 1);
  }
});

test('applyWatermark supports background layering (layer: under)', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const result = await WatermarkOps.applyWatermark(sampleBytes, {
    mode: 'text',
    text: 'BACKGROUND WATERMARK',
    layer: 'under',
    opacity: 0.2
  });

  assert.strictEqual(result.report.layer, 'under');
  assert.strictEqual(result.report.appliedCount, 4);
  const doc = await PDFDocument.load(result);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('applyWatermark stamps embedded PNG image watermark', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const result = await WatermarkOps.applyWatermark(sampleBytes, {
    mode: 'image',
    imageBytes: SAMPLE_PNG_BYTES,
    imageFormat: 'png',
    imageScale: 0.5,
    opacity: 0.4,
    rotation: 0,
    position: 'center'
  });

  assert.strictEqual(result.report.mode, 'image');
  assert.strictEqual(result.report.appliedCount, 4);
  const doc = await PDFDocument.load(result);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('applyWatermark supports custom page range selection', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const result = await WatermarkOps.applyWatermark(sampleBytes, {
    mode: 'text',
    text: 'TARGETED WATERMARK',
    pages: '2-3'
  });

  assert.strictEqual(result.report.appliedCount, 2);
  assert.strictEqual(result.report.totalPages, 4);
});

test('PageOperations facade delegates to WatermarkOps and attaches report', async () => {
  const sample = await PageOperations.createSampleWatermarkPdf();
  assert(sample.length > 500);

  const res = await PageOperations.applyWatermark(sample, {
    text: 'FACADE TEST',
    rotation: 45
  });

  assert(res instanceof Uint8Array);
  assert(res.report);
  assert.strictEqual(res.report.appliedCount, 4);
});

test('Backend HTTP route GET /api/watermark/sample returns sample PDF', async () => {
  const req = createMockReq('GET', '/api/watermark/sample');
  const res = createMockRes();

  const handled = await handleWatermarkRequest(req, res, '/api/watermark/sample', 'GET');
  assert.strictEqual(Boolean(handled), true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert(parsed.pdfBase64, 'pdfBase64 should be present');
  assert(parsed.size > 500, 'size should be > 500');

  const doc = await PDFDocument.load(Buffer.from(parsed.pdfBase64, 'base64'));
  assert.strictEqual(doc.getPageCount(), 4);
});

test('Backend HTTP route POST /api/watermark/preview returns document metadata', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const req = createMockReq('POST', '/api/watermark/preview', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64')
  });
  const res = createMockRes();

  const handled = await handleWatermarkRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.totalPages, 4);
  assert(parsed.pages && parsed.pages.length === 4);
});

test('Backend HTTP route POST /api/watermark/apply executes watermark stamping', async () => {
  const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
  const req = createMockReq('POST', '/api/watermark/apply', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64'),
    options: {
      mode: 'text',
      text: 'BACKEND WATERMARK',
      rotation: 45,
      color: '#0284c7',
      opacity: 0.3
    },
    context: { fileName: 'Test_Doc.pdf' }
  });
  const res = createMockRes();

  const handled = await handleWatermarkRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert(parsed.pdfBase64);
  assert(parsed.report);
  assert.strictEqual(parsed.report.appliedCount, 4);
  assert.strictEqual(parsed.report.totalPages, 4);
});
