import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { DeskewOps } from '../src/core/engine/operations/deskew-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleDeskewRequest } from '../server/routes/deskew-routes.js';

test('Deskew Suite - createSampleSkewedPdf produces valid tilted 3-page document', async () => {
  const bytes = await DeskewOps.createSampleSkewedPdf(2.5);
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 500);

  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 3);
});

test('Deskew Suite - detectSkewAngleFromPixels accurately detects angle from simulated scanned rows', () => {
  const w = 200;
  const h = 200;
  // Create an RGBA buffer with dark lines tilted at approximately 0 degrees
  const pixels = new Uint8ClampedArray(w * h * 4);
  pixels.fill(255); // white background

  // Draw 5 horizontal dark bars (lum = 0)
  for (let r = 20; r < 180; r += 30) {
    for (let dy = 0; dy < 4; dy++) {
      const y = r + dy;
      for (let x = 10; x < 190; x++) {
        const idx = (y * w + x) * 4;
        pixels[idx] = 20;
        pixels[idx + 1] = 20;
        pixels[idx + 2] = 20;
        pixels[idx + 3] = 255;
      }
    }
  }

  const angle = DeskewOps.detectSkewAngleFromPixels(pixels, w, h, { minAngle: -4.0, maxAngle: 4.0, step: 0.5 });
  assert.ok(Math.abs(angle) <= 0.5, `Expected angle close to 0, got ${angle}`);
});

test('Deskew Suite - deskewPdf straightens pages with affine center transform and reports telemetry', async () => {
  const skewedBytes = await DeskewOps.createSampleSkewedPdf(3.0);
  const result = await DeskewOps.deskewPdf(skewedBytes, {
    angle: -3.0,
    autoCrop: true
  });

  assert.ok(result.pdfBytes instanceof Uint8Array);
  assert.equal(result.report.success, true);
  assert.equal(result.report.angle, -3.0);
  assert.equal(result.report.totalPages, 3);
  assert.equal(result.report.pagesProcessed, 3);
  assert.equal(result.report.autoCropped, true);

  const doc = await PDFDocument.load(result.pdfBytes);
  assert.equal(doc.getPageCount(), 3);
  const p1 = doc.getPage(0);
  const cropBox = p1.getCropBox();
  // CropBox should be inset due to autoCrop: true
  assert.ok(cropBox.x > 0);
  assert.ok(cropBox.y > 0);
});

test('Deskew Suite - PageOperations facade delegates deskewPdf properly', async () => {
  const skewedBytes = await PageOperations.createSampleSkewedPdf(2.0);
  const deskewedBytes = await PageOperations.deskewPdf(skewedBytes, -2.0);
  assert.ok(deskewedBytes instanceof Uint8Array);

  const withReport = await PageOperations.deskewPdf(skewedBytes, { angle: -2.0, withReport: true });
  assert.ok(withReport.pdfBytes instanceof Uint8Array);
  assert.equal(withReport.report.angle, -2.0);
});

test('Deskew Suite - handleDeskewRequest serves sample, detect, and apply endpoints', async () => {
  // 1. GET /api/deskew/sample
  let status = null;
  let headers = {};
  let bodyData = '';
  const mockRes = {
    writeHead: (s, h) => { status = s; headers = h; },
    end: (d) => { bodyData = d; }
  };

  const sampleHandled = await handleDeskewRequest({ url: '/api/deskew/sample', method: 'GET' }, mockRes, '/api/deskew/sample', 'GET');
  assert.equal(sampleHandled, true);
  assert.equal(status, 200);
  const sampleJson = JSON.parse(bodyData);
  assert.equal(sampleJson.success, true);
  assert.ok(sampleJson.pdfBase64.length > 100);

  // 2. POST /api/deskew/detect
  status = null;
  bodyData = '';
  const mockDetectReq = {
    url: '/api/deskew/detect',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({ width: 100, height: 100 })));
      }
      if (evt === 'end') cb();
    }
  };

  const detectHandled = await handleDeskewRequest(mockDetectReq, mockRes, '/api/deskew/detect', 'POST');
  assert.equal(detectHandled, true);
  assert.equal(status, 200);
  const detectJson = JSON.parse(bodyData);
  assert.equal(detectJson.success, true);
  assert.ok(typeof detectJson.detectedAngle === 'number');

  // 3. POST /api/deskew/apply
  status = null;
  bodyData = '';
  const mockApplyReq = {
    url: '/api/deskew/apply',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: sampleJson.pdfBase64,
          angle: -2.5,
          autoCrop: true
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const applyHandled = await handleDeskewRequest(mockApplyReq, mockRes, '/api/deskew/apply', 'POST');
  assert.equal(applyHandled, true);
  assert.equal(status, 200);
  const applyJson = JSON.parse(bodyData);
  assert.equal(applyJson.success, true);
  assert.equal(applyJson.report.angle, -2.5);
  assert.ok(applyJson.pdfBase64.length > 100);
});
