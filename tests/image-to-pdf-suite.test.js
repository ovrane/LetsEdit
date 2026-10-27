import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { ImageToPdfOps, PAGE_SIZES, MARGIN_PRESETS } from '../src/core/engine/operations/image-to-pdf-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleImageToPdfRequest } from '../server/routes/image-to-pdf-routes.js';

test('Image to PDF Suite - Page size presets and dimension resolution', () => {
  assert.equal(PAGE_SIZES.a4.width, 595.28);
  assert.equal(PAGE_SIZES.letter.width, 612.0);
  assert.equal(PAGE_SIZES.legal.height, 1008.0);

  // Exact fit
  const fitDims = ImageToPdfOps.resolveDimensions('fit', 'auto', 1200, 800);
  assert.equal(fitDims.width, 1200);
  assert.equal(fitDims.height, 800);

  // Auto orientation: landscape image -> landscape A4
  const landscapeDims = ImageToPdfOps.resolveDimensions('a4', 'auto', 1200, 800);
  assert.equal(landscapeDims.width, 841.89);
  assert.equal(landscapeDims.height, 595.28);

  // Forced portrait
  const portraitDims = ImageToPdfOps.resolveDimensions('a4', 'portrait', 1200, 800);
  assert.equal(portraitDims.width, 595.28);
  assert.equal(portraitDims.height, 841.89);
});

test('Image to PDF Suite - Margin presets resolution', () => {
  assert.equal(ImageToPdfOps.resolveMargin('none'), 0);
  assert.equal(ImageToPdfOps.resolveMargin('small'), 18);
  assert.equal(ImageToPdfOps.resolveMargin('medium'), 36);
  assert.equal(ImageToPdfOps.resolveMargin('large'), 72);
  assert.equal(ImageToPdfOps.resolveMargin(25), 25);
  assert.equal(ImageToPdfOps.resolveMargin('30'), 30);
});

test('Image to PDF Suite - createSampleImageBatch produces test images', () => {
  const images = ImageToPdfOps.createSampleImageBatch();
  assert.equal(images.length, 3);
  for (const img of images) {
    assert.ok(img.bytes instanceof Uint8Array);
    assert.ok(img.bytes.length > 20);
    assert.ok(img.width > 0);
    assert.ok(img.height > 0);
  }
});

test('Image to PDF Suite - 1-up layout compiles 1 image per page', async () => {
  const sampleImages = ImageToPdfOps.createSampleImageBatch();
  const res = await ImageToPdfOps.imagesToPdf(sampleImages, {
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'small',
    layout: '1-up'
  });

  assert.ok(res.pdfBytes instanceof Uint8Array);
  assert.equal(res.report.success, true);
  assert.equal(res.report.imagesConverted, 3);
  assert.equal(res.report.pagesGenerated, 3);

  const doc = await PDFDocument.load(res.pdfBytes);
  assert.equal(doc.getPageCount(), 3);
});

test('Image to PDF Suite - 2-up and 4-up imposition layouts pack multiple images per page', async () => {
  const sampleImages = ImageToPdfOps.createSampleImageBatch();
  // 3 images in 2-up -> 2 pages (Page 1 has 2, Page 2 has 1)
  const res2Up = await ImageToPdfOps.imagesToPdf(sampleImages, {
    pageSize: 'a4',
    layout: '2-up'
  });
  assert.equal(res2Up.report.pagesGenerated, 2);

  // 3 images in 4-up -> 1 page (all 3 on 1 page)
  const res4Up = await ImageToPdfOps.imagesToPdf(sampleImages, {
    pageSize: 'a4',
    layout: '4-up'
  });
  assert.equal(res4Up.report.pagesGenerated, 1);
});

test('Image to PDF Suite - PageOperations facade delegates imagesToPdf', async () => {
  const sampleImages = PageOperations.createSampleImageBatch();
  const pdfBytes = await PageOperations.imagesToPdf(sampleImages, { pageSize: 'letter' });
  assert.ok(pdfBytes instanceof Uint8Array);

  const withReport = await PageOperations.imagesToPdf(sampleImages, { pageSize: 'letter', withReport: true });
  assert.ok(withReport.pdfBytes instanceof Uint8Array);
  assert.equal(withReport.report.pageSize, 'letter');
});

test('Image to PDF Suite - handleImageToPdfRequest serves sample and convert endpoints', async () => {
  // 1. GET /api/image-to-pdf/sample
  let status = null;
  let headers = {};
  let bodyData = '';
  const mockRes = {
    writeHead: (s, h) => { status = s; headers = h; },
    end: (d) => { bodyData = d; }
  };

  const sampleHandled = await handleImageToPdfRequest({ url: '/api/image-to-pdf/sample', method: 'GET' }, mockRes, '/api/image-to-pdf/sample', 'GET');
  assert.equal(sampleHandled, true);
  assert.equal(status, 200);
  const sampleJson = JSON.parse(bodyData);
  assert.equal(sampleJson.success, true);
  assert.equal(sampleJson.count, 3);
  assert.ok(sampleJson.images[0].bytesBase64.length > 20);

  // 2. POST /api/image-to-pdf/convert
  status = null;
  bodyData = '';
  const mockConvertReq = {
    url: '/api/image-to-pdf/convert',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          images: sampleJson.images,
          pageSize: 'a4',
          orientation: 'auto',
          layout: '1-up'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandled = await handleImageToPdfRequest(mockConvertReq, mockRes, '/api/image-to-pdf/convert', 'POST');
  assert.equal(convertHandled, true);
  assert.equal(status, 200);
  const convertJson = JSON.parse(bodyData);
  assert.equal(convertJson.success, true);
  assert.equal(convertJson.report.imagesConverted, 3);
  assert.ok(convertJson.pdfBase64.length > 100);
});
