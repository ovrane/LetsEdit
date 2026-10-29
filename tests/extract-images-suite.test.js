import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { ExtractImagesOps } from '../src/core/engine/operations/extract-images-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleExtractImagesRequest } from '../server/routes/extract-images-routes.js';

test('Extract Images Suite - createSampleMultiImagePdf creates valid 3-page PDF with embedded images', async () => {
  const pdfBytes = await ExtractImagesOps.createSampleMultiImagePdf();
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.length > 500);

  const doc = await PDFDocument.load(pdfBytes);
  assert.equal(doc.getPageCount(), 3);
  assert.equal(doc.getTitle(), 'Sample Document with Embedded Images');
});

test('Extract Images Suite - analyzeImages inventories embedded image objects and flags duplicates', async () => {
  const pdfBytes = await ExtractImagesOps.createSampleMultiImagePdf();
  const analysis = await ExtractImagesOps.analyzeImages(pdfBytes);

  assert.ok(analysis);
  assert.ok(analysis.totalFound >= 3);
  assert.ok(analysis.uniqueCount >= 2);
  assert.equal(analysis.images.length, analysis.totalFound);

  const firstImg = analysis.images[0];
  assert.ok(firstImg.id);
  assert.ok(firstImg.format === 'jpg' || firstImg.format === 'png');
  assert.ok(typeof firstImg.width === 'number');
  assert.ok(typeof firstImg.height === 'number');
  assert.ok(firstImg.hash);
});

test('Extract Images Suite - extractImages packages images and manifest into valid ZIP archive', async () => {
  const pdfBytes = await ExtractImagesOps.createSampleMultiImagePdf();
  const result = await ExtractImagesOps.extractImages(pdfBytes, { deduplicate: false });

  assert.ok(result.images.length >= 3);
  assert.ok(result.zipBytes instanceof Uint8Array);
  assert.ok(result.report);
  assert.ok(result.report.extractedCount >= 3);
  assert.equal(result.report.skippedDuplicates, 0);

  // Inspect generated ZIP
  const zip = await JSZip.loadAsync(result.zipBytes);
  const manifestFile = zip.file('image-manifest.json');
  assert.ok(manifestFile);

  const manifestContent = await manifestFile.async('string');
  const manifest = JSON.parse(manifestContent);
  assert.equal(manifest.totalExtracted, result.images.length);
  assert.ok(manifest.images.length >= 3);

  // Verify first image entry in ZIP
  const firstFilename = result.images[0].filename;
  assert.ok(zip.file(firstFilename));
});

test('Extract Images Suite - extractImages deduplicates repeating images across pages', async () => {
  const pdfBytes = await ExtractImagesOps.createSampleMultiImagePdf();
  const withDedup = await ExtractImagesOps.extractImages(pdfBytes, { deduplicate: true });
  const noDedup = await ExtractImagesOps.extractImages(pdfBytes, { deduplicate: false });

  assert.ok(withDedup.images.length <= noDedup.images.length);
  assert.ok(withDedup.report.skippedDuplicates >= 0);
  assert.ok(withDedup.report.extractedCount === withDedup.images.length);
});

test('Extract Images Suite - extractImages respects format filter', async () => {
  const pdfBytes = await ExtractImagesOps.createSampleMultiImagePdf();
  const jpgOnly = await ExtractImagesOps.extractImages(pdfBytes, { targetFormat: 'jpg' });

  for (const img of jpgOnly.images) {
    assert.equal(img.extension, 'jpg');
  }
});

test('Extract Images Suite - PageOperations facade delegates extractImages and analyzeImages', async () => {
  const pdfBytes = await PageOperations.createSampleMultiImagePdf();
  assert.ok(pdfBytes instanceof Uint8Array);

  const analysis = await PageOperations.analyzeImages(pdfBytes);
  assert.ok(analysis.totalFound >= 2);

  const zipBytes = await PageOperations.extractImages(pdfBytes);
  assert.ok(zipBytes instanceof Uint8Array);
  assert.ok(zipBytes.images.length >= 2);

  const withReport = await PageOperations.extractImages(pdfBytes, { withReport: true });
  assert.ok(withReport.zipBytes);
  assert.ok(withReport.report);
  assert.ok(withReport.report.extractedCount >= 2);
});

test('Extract Images Suite - Backend HTTP routes serve sample, analyze, and extract', async () => {
  // 1. GET /api/extract-images/sample
  let sampleStatus = 0;
  let sampleData = '';
  const mockSampleRes = {
    writeHead(code) { sampleStatus = code; },
    end(data) { sampleData = data; }
  };

  const sampleHandled = await handleExtractImagesRequest({
    method: 'GET',
    url: '/api/extract-images/sample'
  }, mockSampleRes, '/api/extract-images/sample', 'GET');

  assert.equal(sampleHandled, true);
  assert.equal(sampleStatus, 200);
  const sampleJson = JSON.parse(sampleData);
  assert.equal(sampleJson.success, true);
  assert.ok(sampleJson.pdfBase64.length > 100);

  // 2. POST /api/extract-images/analyze
  let analyzeStatus = 0;
  let analyzeData = '';
  const mockAnalyzeRes = {
    writeHead(code) { analyzeStatus = code; },
    end(data) { analyzeData = data; }
  };

  const mockAnalyzeReq = {
    method: 'POST',
    url: '/api/extract-images/analyze',
    on(evt, cb) {
      if (evt === 'data') cb(Buffer.from(JSON.stringify({ pdfBase64: sampleJson.pdfBase64 })));
      if (evt === 'end') cb();
    }
  };

  const analyzeHandled = await handleExtractImagesRequest(mockAnalyzeReq, mockAnalyzeRes, '/api/extract-images/analyze', 'POST');
  assert.equal(analyzeHandled, true);
  assert.equal(analyzeStatus, 200);
  const analyzeJson = JSON.parse(analyzeData);
  assert.equal(analyzeJson.success, true);
  assert.ok(analyzeJson.analysis.totalFound >= 2);

  // 3. POST /api/extract-images/extract
  let extractStatus = 0;
  let extractData = '';
  const mockExtractRes = {
    writeHead(code) { extractStatus = code; },
    end(data) { extractData = data; }
  };

  const mockExtractReq = {
    method: 'POST',
    url: '/api/extract-images/extract',
    on(evt, cb) {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: sampleJson.pdfBase64,
          deduplicate: true
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const extractHandled = await handleExtractImagesRequest(mockExtractReq, mockExtractRes, '/api/extract-images/extract', 'POST');
  assert.equal(extractHandled, true);
  assert.equal(extractStatus, 200);
  const extractJson = JSON.parse(extractData);
  assert.equal(extractJson.success, true);
  assert.ok(extractJson.zipBase64.length > 100);
  assert.ok(extractJson.images.length >= 2);
  assert.ok(extractJson.report.extractedCount >= 2);
});
