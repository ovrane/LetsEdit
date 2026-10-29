import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { PdfToImageOps, DPI_CONFIG } from '../src/core/engine/operations/pdf-to-image-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handlePdfToImageRequest } from '../server/routes/pdf-to-image-routes.js';

test('PDF to Image Suite - DPI configurations and metrics estimation', () => {
  assert.equal(DPI_CONFIG[72].dpi, 72);
  assert.equal(DPI_CONFIG[150].scale, 150 / 72);
  assert.equal(DPI_CONFIG[300].scale, 300 / 72);
  assert.equal(DPI_CONFIG[600].dpi, 600);

  const metrics72 = PdfToImageOps.estimateMetrics(595.28, 841.89, 72, 'png');
  assert.equal(metrics72.pixelWidth, 595);
  assert.equal(metrics72.pixelHeight, 842);
  assert.ok(metrics72.estimatedBytes > 1000);

  const metrics300 = PdfToImageOps.estimateMetrics(595.28, 841.89, 300, 'jpg', 0.9);
  assert.equal(metrics300.pixelWidth, 2480);
  assert.equal(metrics300.pixelHeight, 3508);
  assert.ok(metrics300.megaPixels >= 8.6);
  assert.ok(metrics300.estimatedBytes > metrics72.estimatedBytes);
});

test('PDF to Image Suite - parsePageRange handles multiple syntax formats', () => {
  assert.deepEqual(PdfToImageOps.parsePageRange('all', 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(PdfToImageOps.parsePageRange('1-3, 5', 5), [1, 2, 3, 5]);
  assert.deepEqual(PdfToImageOps.parsePageRange('4, 2, 1', 5), [1, 2, 4]);
  assert.deepEqual(PdfToImageOps.parsePageRange([2, 4], 5), [2, 4]);
  assert.deepEqual(PdfToImageOps.parsePageRange('99', 5), [1]); // Clamps invalid
});

test('PDF to Image Suite - createSampleRasterPdf produces valid 4-page test PDF', async () => {
  const bytes = await PdfToImageOps.createSampleRasterPdf();
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 500);

  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 4);
});

test('PDF to Image Suite - renderPageToImage renders page telemetry and bytes', async () => {
  const sampleBytes = await PdfToImageOps.createSampleRasterPdf();
  const res = await PdfToImageOps.renderPageToImage(sampleBytes, 2, {
    dpi: 300,
    format: 'png',
    baseName: 'sample_doc.pdf'
  });

  assert.equal(res.success, true);
  assert.equal(res.pageNum, 2);
  assert.equal(res.totalPages, 4);
  assert.equal(res.dpi, 300);
  assert.equal(res.ext, 'png');
  assert.ok(res.width > 2000);
  assert.ok(res.height > 3000);
  assert.equal(res.filename, 'sample_doc_page_002.png');
  assert.ok(res.bytes.length > 0);
});

test('PDF to Image Suite - renderPagesToZip bundles multiple pages into valid ZIP archive', async () => {
  const sampleBytes = await PdfToImageOps.createSampleRasterPdf();
  const zipResult = await PdfToImageOps.renderPagesToZip(sampleBytes, {
    dpi: 150,
    format: 'jpg',
    pageRange: '1-3',
    baseName: 'report'
  });

  assert.equal(zipResult.success, true);
  assert.equal(zipResult.totalImages, 3);
  assert.equal(zipResult.dpi, 150);
  assert.equal(zipResult.format, 'jpg');
  assert.ok(zipResult.zipBytes instanceof Uint8Array);
  assert.ok(zipResult.zipBytes.length > 500);

  // Read back ZIP and verify contents
  const loadedZip = await JSZip.loadAsync(zipResult.zipBytes);
  const fileNames = Object.keys(loadedZip.files);
  assert.equal(fileNames.length, 3);
  assert.ok(fileNames.includes('report_page_001.jpg'));
  assert.ok(fileNames.includes('report_page_002.jpg'));
  assert.ok(fileNames.includes('report_page_003.jpg'));
});

test('PDF to Image Suite - PageOperations facade delegates to-image methods', async () => {
  const sampleBytes = await PageOperations.createSampleRasterPdf();
  assert.ok(sampleBytes.length > 0);

  const single = await PageOperations.renderPageToImage(sampleBytes, 1, { dpi: 72, format: 'webp' });
  assert.equal(single.pageNum, 1);
  assert.equal(single.ext, 'webp');

  const zip = await PageOperations.renderPagesToZip(sampleBytes, { dpi: 72, pageRange: '1' });
  assert.equal(zip.totalImages, 1);
  assert.ok(zip.zipBytes.length > 0);
});

test('PDF to Image Suite - handlePdfToImageRequest serves sample, render, and batch-zip', async () => {
  // 1. GET /api/pdf-to-image/sample
  let status = null;
  let headers = {};
  let bodyData = '';
  const mockRes = {
    writeHead: (s, h) => { status = s; headers = h; },
    end: (d) => { bodyData = d; }
  };

  const sampleHandled = await handlePdfToImageRequest({ url: '/api/pdf-to-image/sample', method: 'GET' }, mockRes, '/api/pdf-to-image/sample', 'GET');
  assert.equal(sampleHandled, true);
  assert.equal(status, 200);
  const sampleJson = JSON.parse(bodyData);
  assert.equal(sampleJson.success, true);
  assert.ok(sampleJson.pdfBase64.length > 100);

  // 2. POST /api/pdf-to-image/render
  status = null;
  bodyData = '';
  const mockRenderReq = {
    url: '/api/pdf-to-image/render',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: sampleJson.pdfBase64,
          pageNum: 1,
          dpi: 150,
          format: 'png'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const renderHandled = await handlePdfToImageRequest(mockRenderReq, mockRes, '/api/pdf-to-image/render', 'POST');
  assert.equal(renderHandled, true);
  assert.equal(status, 200);
  const renderJson = JSON.parse(bodyData);
  assert.equal(renderJson.success, true);
  assert.equal(renderJson.pageNum, 1);
  assert.ok(renderJson.imageBase64.length > 50);

  // 3. POST /api/pdf-to-image/batch-zip
  status = null;
  bodyData = '';
  const mockZipReq = {
    url: '/api/pdf-to-image/batch-zip',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: sampleJson.pdfBase64,
          dpi: 150,
          format: 'png',
          pageRange: '1-2'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const zipHandled = await handlePdfToImageRequest(mockZipReq, mockRes, '/api/pdf-to-image/batch-zip', 'POST');
  assert.equal(zipHandled, true);
  assert.equal(status, 200);
  const zipJson = JSON.parse(bodyData);
  assert.equal(zipJson.success, true);
  assert.equal(zipJson.totalImages, 2);
  assert.ok(zipJson.zipBase64.length > 100);
});
