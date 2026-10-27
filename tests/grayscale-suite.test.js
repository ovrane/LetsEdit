import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { GrayscaleOps } from '../src/core/engine/operations/grayscale-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleGrayscaleRequest } from '../server/routes/grayscale-routes.js';

test('Grayscale Suite - createSampleGrayscalePdf produces valid multi-page PDF', async () => {
  const bytes = await GrayscaleOps.createSampleGrayscalePdf();
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 500);

  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 4);
});

test('Grayscale Suite - convertToGrayscale with standard mode converts RGB content streams', async () => {
  const sampleBytes = await GrayscaleOps.createSampleGrayscalePdf();
  const res = await GrayscaleOps.convertToGrayscale(sampleBytes, {
    mode: 'standard',
    preserveBlackText: true
  });

  assert.ok(res.pdfBytes instanceof Uint8Array);
  assert.equal(res.report.pagesProcessed, 4);
  assert.ok(res.report.totalObjectsConverted > 0);
  assert.ok(res.report.estimatedTonerSavingsPercent >= 15);

  const convertedDoc = await PDFDocument.load(res.pdfBytes);
  assert.equal(convertedDoc.getPageCount(), 4);
});

test('Grayscale Suite - presets apply different tone mapping & toner saving curves', async () => {
  const sampleBytes = await GrayscaleOps.createSampleGrayscalePdf();
  
  const highContrast = await GrayscaleOps.convertToGrayscale(sampleBytes, {
    mode: 'high-contrast'
  });
  assert.ok(highContrast.report.estimatedTonerSavingsPercent >= 20);

  const tonerSaver = await GrayscaleOps.convertToGrayscale(sampleBytes, {
    mode: 'toner-saver'
  });
  assert.ok(tonerSaver.report.estimatedTonerSavingsPercent >= 30);
  assert.equal(tonerSaver.report.mode, 'toner-saver');
});

test('Grayscale Suite - PageOperations facade delegates convertToGrayscale correctly', async () => {
  const sampleBytes = await PageOperations.createSampleGrayscalePdf();
  assert.ok(sampleBytes.length > 500);

  const res = await PageOperations.convertToGrayscale(sampleBytes, {
    mode: 'deep-monochrome'
  });
  assert.equal(res.report.mode, 'deep-monochrome');
  assert.ok(res.pdfBytes.length > 0);
});

test('Grayscale Suite - handleGrayscaleRequest handles GET /api/grayscale/sample and POST /api/grayscale/convert', async () => {
  // 1. GET /api/grayscale/sample
  let status = null;
  let headers = {};
  let bodyData = '';
  const mockRes = {
    writeHead: (s, h) => { status = s; headers = h; },
    end: (d) => { bodyData = d; }
  };

  const sampleHandled = await handleGrayscaleRequest({ url: '/api/grayscale/sample', method: 'GET' }, mockRes, '/api/grayscale/sample', 'GET');
  assert.equal(sampleHandled, true);
  assert.equal(status, 200);
  const sampleJson = JSON.parse(bodyData);
  assert.equal(sampleJson.success, true);
  assert.ok(sampleJson.pdfBase64.length > 100);

  // 2. POST /api/grayscale/convert
  status = null;
  bodyData = '';
  const mockReq = {
    url: '/api/grayscale/convert',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: sampleJson.pdfBase64,
          mode: 'toner-saver'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandled = await handleGrayscaleRequest(mockReq, mockRes, '/api/grayscale/convert', 'POST');
  assert.equal(convertHandled, true);
  assert.equal(status, 200);
  const convertJson = JSON.parse(bodyData);
  assert.equal(convertJson.success, true);
  assert.ok(convertJson.report.estimatedTonerSavingsPercent >= 30);
  assert.ok(convertJson.pdfBase64.length > 100);
});
