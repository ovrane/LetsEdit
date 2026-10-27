import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { PptxToPdfOps } from '../src/core/engine/operations/pptx-to-pdf-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { pdfEngine } from '../src/core/pdf-engine.js';
import { handlePptxToPdfRequest } from '../server/routes/pptx-to-pdf-routes.js';

test('PPTX to PDF Suite - createSamplePptxFile creates valid 5-slide OpenXML presentation archive', async () => {
  const pptxBytes = await PptxToPdfOps.createSamplePptxFile();
  assert.ok(pptxBytes instanceof Uint8Array);
  assert.ok(pptxBytes.length > 500);

  const zip = await JSZip.loadAsync(pptxBytes);
  const files = Object.keys(zip.files);
  assert.ok(files.includes('[Content_Types].xml'));
  assert.ok(files.includes('ppt/presentation.xml'));
  assert.ok(files.includes('ppt/slides/slide1.xml'));
  assert.ok(files.includes('ppt/slides/slide2.xml'));
  assert.ok(files.includes('ppt/slides/slide3.xml'));
  assert.ok(files.includes('ppt/slides/slide4.xml'));
  assert.ok(files.includes('ppt/slides/slide5.xml'));
});

test('PPTX to PDF Suite - parsePptxSlides extracts 5 slides with titles and bullet points', async () => {
  const pptxBytes = await PptxToPdfOps.createSamplePptxFile();
  const slides = await PptxToPdfOps.parsePptxSlides(pptxBytes);

  assert.ok(Array.isArray(slides));
  assert.equal(slides.length, 5);

  assert.equal(slides[0].title, 'Enterprise Zero-Telemetry Document Intelligence');
  assert.ok(slides[0].bullets.length >= 1);

  assert.equal(slides[1].title, 'Security Vulnerabilities in Cloud PDF Gateways');
  assert.ok(slides[1].bullets.length >= 2);

  assert.equal(slides[4].title, 'Strategic Roadmap & Next Steps');
});

test('PPTX to PDF Suite - pptToPdf layout: 1-up renders 5-page 16:9 widescreen presentation', async () => {
  const pptxBytes = await PptxToPdfOps.createSamplePptxFile();
  const result = await PptxToPdfOps.pptToPdf(pptxBytes, { layout: '1-up' });

  assert.ok(result.pdfBytes instanceof Uint8Array);
  assert.equal(result.report.success, true);
  assert.equal(result.report.slidesCount, 5);
  assert.equal(result.report.pagesGenerated, 5);

  const doc = await PDFDocument.load(result.pdfBytes);
  assert.equal(doc.getPageCount(), 5);
  const page1 = doc.getPage(0);
  assert.ok(page1.getWidth() > page1.getHeight(), 'Should be widescreen landscape');
  assert.equal(page1.getWidth(), 841.89);
});

test('PPTX to PDF Suite - pptToPdf layout: 3-up renders conference handout with notes lines', async () => {
  const pptxBytes = await PptxToPdfOps.createSamplePptxFile();
  const result = await PptxToPdfOps.pptToPdf(pptxBytes, { layout: '3-up' });

  assert.equal(result.report.layout, '3-up');
  // 5 slides divided by 3 per page = 2 pages
  assert.equal(result.report.pagesGenerated, 2);

  const doc = await PDFDocument.load(result.pdfBytes);
  assert.equal(doc.getPageCount(), 2);
});

test('PPTX to PDF Suite - pptToPdf layout: 2-up and 6-up', async () => {
  const pptxBytes = await PptxToPdfOps.createSamplePptxFile();

  const res2Up = await PptxToPdfOps.pptToPdf(pptxBytes, { layout: '2-up' });
  assert.equal(res2Up.report.pagesGenerated, 3); // 5 slides / 2 per page = 3 pages

  const res6Up = await PptxToPdfOps.pptToPdf(pptxBytes, { layout: '6-up' });
  assert.equal(res6Up.report.pagesGenerated, 1); // 5 slides fit on 1 6-up page
});

test('PPTX to PDF Suite - PageOperations & pdfEngine facade delegation', async () => {
  const pptxBytes = await PageOperations.createSamplePptxFile();

  // 1. Raw bytes return
  const pdfBytes = await PageOperations.pptToPdf(pptxBytes);
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.report);
  assert.equal(pdfBytes.report.success, true);

  // 2. With report return
  const reportObj = await PageOperations.pptToPdf(pptxBytes, { withReport: true, layout: '1-up' });
  assert.ok(reportObj.pdfBytes instanceof Uint8Array);
  assert.equal(reportObj.report.slidesCount, 5);

  // 3. pdfEngine delegation
  const engineRes = await pdfEngine.pptToPdf(pptxBytes);
  assert.ok(engineRes instanceof Uint8Array || engineRes.pdfBytes);
});

test('PPTX to PDF Suite - backend API routes GET /sample and POST /convert', async () => {
  // Test 1: GET /api/pptx-to-pdf/sample
  let statusCode = 0;
  let responseData = null;
  const mockRes = {
    writeHead(status, headers) { statusCode = status; },
    end(body) { responseData = JSON.parse(body); }
  };

  const sampleHandled = await handlePptxToPdfRequest(
    { url: '/api/pptx-to-pdf/sample', method: 'GET' },
    mockRes,
    '/api/pptx-to-pdf/sample',
    'GET'
  );
  assert.equal(sampleHandled, true);
  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.ok(responseData.pptxBase64);
  assert.equal(responseData.filename, 'sample_presentation_deck.pptx');

  // Test 2: POST /api/pptx-to-pdf/convert
  let postStatus = 0;
  let postData = null;
  const mockPostRes = {
    writeHead(status, headers) { postStatus = status; },
    end(body) { postData = JSON.parse(body); }
  };

  const reqObj = {
    url: '/api/pptx-to-pdf/convert',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pptxBase64: responseData.pptxBase64,
          layout: '1-up'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandled = await handlePptxToPdfRequest(reqObj, mockPostRes, '/api/pptx-to-pdf/convert', 'POST');
  assert.equal(convertHandled, true);
  assert.equal(postStatus, 200);
  assert.equal(postData.success, true);
  assert.ok(postData.pdfBase64);
  assert.equal(postData.filename, 'Presentation_Slides.pdf');
  assert.ok(postData.report);
  assert.equal(postData.report.slidesCount, 5);
});
