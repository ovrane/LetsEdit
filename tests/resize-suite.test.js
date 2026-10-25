import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { ResizeOps } from '../src/core/engine/operations/resize-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleResizeRequest } from '../server/routes/resize-routes.js';

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

test('createSampleResizePdf produces a 4-page test document', async () => {
  const sampleBytes = await ResizeOps.createSampleResizePdf();
  assert(sampleBytes instanceof Uint8Array, 'Sample should be Uint8Array');
  assert(sampleBytes.length > 500, 'Sample should not be empty');

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 4, 'Sample document must contain 4 pages');
});

test('resolveTargetDimensions handles presets and orientations', () => {
  // A4 portrait
  const [a4W, a4H] = ResizeOps.resolveTargetDimensions('a4', 'portrait', 595.28, 841.89);
  assert.strictEqual(a4W, 595.28);
  assert.strictEqual(a4H, 841.89);

  // A4 landscape
  const [a4LandW, a4LandH] = ResizeOps.resolveTargetDimensions('a4', 'landscape', 595.28, 841.89);
  assert.strictEqual(a4LandW, 841.89);
  assert.strictEqual(a4LandH, 595.28);

  // US Letter portrait
  const [letW, letH] = ResizeOps.resolveTargetDimensions('letter', 'portrait', 595.28, 841.89);
  assert.strictEqual(letW, 612.0);
  assert.strictEqual(letH, 792.0);

  // Original size
  const [origW, origH] = ResizeOps.resolveTargetDimensions('original', 'auto', 500, 700);
  assert.strictEqual(origW, 500);
  assert.strictEqual(origH, 700);
});

test('resizePdf margin expansion mode adds margins to original page dimensions', async () => {
  const sampleBytes = await ResizeOps.createSampleResizePdf();
  const res = await ResizeOps.resizePdf(sampleBytes, {
    pageSize: 'original',
    marginTop: 36,
    marginBottom: 36,
    marginLeft: 20,
    marginRight: 20
  });

  assert(res instanceof Uint8Array);
  assert.strictEqual(res.bytes, res);
  assert.strictEqual(res.appliedCount, 4);

  const doc = await PDFDocument.load(res);
  assert.strictEqual(doc.getPageCount(), 4);
  const sz = doc.getPage(0).getSize();
  // Original was 595.28 x 841.89. New should be (595.28 + 40) x (841.89 + 72) = 635.28 x 913.89
  assert(Math.abs(sz.width - (595.28 + 40)) < 0.1);
  assert(Math.abs(sz.height - (841.89 + 72)) < 0.1);
});

test('resizePdf standard format mode fits pages into target A4 size', async () => {
  const sampleBytes = await ResizeOps.createSampleResizePdf();
  const res = await ResizeOps.resizePdf(sampleBytes, {
    pageSize: 'a4',
    orientation: 'portrait',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20
  });

  const doc = await PDFDocument.load(res);
  assert.strictEqual(doc.getPageCount(), 4);
  const sz = doc.getPage(0).getSize();
  assert.strictEqual(sz.width, 595.28);
  assert.strictEqual(sz.height, 841.89);
});

test('resizePdf standard format mode fits pages into US Letter landscape', async () => {
  const sampleBytes = await ResizeOps.createSampleResizePdf();
  const res = await ResizeOps.resizePdf(sampleBytes, {
    pageSize: 'letter',
    orientation: 'landscape'
  });

  const doc = await PDFDocument.load(res);
  const sz = doc.getPage(0).getSize();
  assert.strictEqual(sz.width, 792.0);
  assert.strictEqual(sz.height, 612.0);
});

test('resizePdf binding gutter with duplex mirror margins alternates left/right offsets', async () => {
  const sampleBytes = await ResizeOps.createSampleResizePdf();
  const res = await ResizeOps.resizePdf(sampleBytes, {
    pageSize: 'original',
    marginLeft: 10,
    marginRight: 10,
    bindingGutter: 50,
    mirrorMargins: true
  });

  assert(res.report, 'Report should be present');
  const pages = res.report.pages;
  assert.strictEqual(pages.length, 4);

  // Odd page (pageIndex 1, index 0): gutter on Left -> left = 10 + 50 = 60, right = 10
  assert.strictEqual(pages[0].leftMargin, 60);
  assert.strictEqual(pages[0].rightMargin, 10);

  // Even page (pageIndex 2, index 1): gutter on Right -> left = 10, right = 10 + 50 = 60
  assert.strictEqual(pages[1].leftMargin, 10);
  assert.strictEqual(pages[1].rightMargin, 60);
});

test('resizePdf filters pages by rangeRule (odd pages only)', async () => {
  const sampleBytes = await ResizeOps.createSampleResizePdf();
  const res = await ResizeOps.resizePdf(sampleBytes, {
    pageSize: 'letter',
    rangeRule: 'odd'
  });

  assert.strictEqual(res.appliedCount, 2);
  const doc = await PDFDocument.load(res);
  assert.strictEqual(doc.getPageCount(), 4);

  // Odd page (page 0) resized to Letter (612 x 792)
  const sz0 = doc.getPage(0).getSize();
  assert.strictEqual(sz0.width, 612.0);

  // Even page (page 1) unmodified (original A4: 595.28 x 841.89)
  const sz1 = doc.getPage(1).getSize();
  assert.strictEqual(sz1.width, 595.28);
});

test('PageOperations facade delegates resizePdf and createSampleResizePdf', async () => {
  const sampleBytes = await PageOperations.createSampleResizePdf();
  assert(sampleBytes instanceof Uint8Array);

  const res = await PageOperations.resizePdf(sampleBytes, {
    pageSize: 'a5',
    orientation: 'portrait'
  });
  assert.strictEqual(res.appliedCount, 4);
  assert(res.report, 'Report must be attached');
  assert.strictEqual(res.targetPageSize, 'a5');
});

test('GET /api/resize/sample returns sample base64 PDF', async () => {
  const req = createMockReq('GET', '/api/resize/sample');
  const res = createMockRes();

  const handled = await handleResizeRequest(req, res, '/api/resize/sample', 'GET');
  assert(Boolean(handled));
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert(parsed.pdfBase64, 'pdfBase64 must be present');
  assert(parsed.size > 500, 'size must be > 500');

  const buf = Buffer.from(parsed.pdfBase64, 'base64');
  const doc = await PDFDocument.load(buf);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('POST /api/resize/preview-bounds computes dimensions and scale', async () => {
  const req = createMockReq('POST', '/api/resize/preview-bounds', {
    pageSize: 'a4',
    orientation: 'portrait',
    width: 595.28,
    height: 841.89,
    marginTop: 36,
    marginBottom: 36,
    marginLeft: 36,
    marginRight: 36,
    bindingGutter: 36
  });
  const res = createMockRes();

  await handleResizeRequest(req, res, '/api/resize/preview-bounds', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.target.width, 595.28);
  assert.strictEqual(parsed.target.height, 841.89);
  assert(parsed.available.width < 595.28);
  assert(parsed.scale <= 1.0);
});

test('POST /api/resize/apply applies resizing and returns base64 PDF', async () => {
  const sampleBytes = await ResizeOps.createSampleResizePdf();
  const req = createMockReq('POST', '/api/resize/apply', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64'),
    pageSize: 'a4',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20
  });
  const res = createMockRes();

  await handleResizeRequest(req, res, '/api/resize/apply', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.appliedCount, 4);
  assert(parsed.pdfBase64, 'Output PDF base64 must exist');

  const outBuf = Buffer.from(parsed.pdfBase64, 'base64');
  const doc = await PDFDocument.load(outBuf);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('POST /api/resize/apply returns 400 when pdfBase64 is missing', async () => {
  const req = createMockReq('POST', '/api/resize/apply', {
    pageSize: 'a4'
  });
  const res = createMockRes();

  await handleResizeRequest(req, res, '/api/resize/apply', 'POST');
  assert.strictEqual(res.statusCode, 400);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, false);
  assert(parsed.error.includes('Missing pdfBase64'));
});
