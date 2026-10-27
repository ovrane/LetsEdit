import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { PdfToPptxOps } from '../src/core/engine/operations/pdf-to-pptx-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { pdfEngine } from '../src/core/pdf-engine.js';
import { handlePdfToPptxRequest } from '../server/routes/pdf-to-pptx-routes.js';

test('PDF to PPTX Suite - createSamplePresentationPdf creates valid 4-page landscape slide deck', async () => {
  const pdfBytes = await PdfToPptxOps.createSamplePresentationPdf();
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.length > 1000);

  const doc = await PDFDocument.load(pdfBytes);
  assert.equal(doc.getPageCount(), 4);

  const p1 = doc.getPage(0);
  assert.ok(p1.getWidth() > p1.getHeight(), 'Should be landscape orientation');
  assert.equal(Math.round(p1.getWidth()), 842);
  assert.equal(Math.round(p1.getHeight()), 595);
});

test('PDF to PPTX Suite - extractSlideLayouts and decomposeSlide parses presentation structure', async () => {
  const pdfBytes = await PdfToPptxOps.createSamplePresentationPdf();
  const pages = await PdfToPptxOps.extractSlideLayouts(pdfBytes);

  assert.equal(pages.length, 4);

  // Slide 1: Title slide
  const d1 = PdfToPptxOps.decomposeSlide(pages[0]);
  assert.ok(d1.title.includes('Enterprise Zero-Telemetry Document Intelligence'));
  assert.ok(d1.subtitle.includes('Strategic Briefing'));

  // Slide 2: Architectural Pillars
  const d2 = PdfToPptxOps.decomposeSlide(pages[1]);
  assert.ok(d2.title.includes('Architectural Pillars'));
  assert.ok(d2.cards.length >= 2, 'Should detect architectural pillar cards');

  // Slide 3: Benchmarks
  const d3 = PdfToPptxOps.decomposeSlide(pages[2]);
  assert.ok(d3.title.includes('Benchmarks'));

  // Slide 4: Roadmap
  const d4 = PdfToPptxOps.decomposeSlide(pages[3]);
  assert.ok(d4.title.includes('Roadmap'));
  assert.ok(d4.bullets.length >= 3, 'Should detect roadmap bullets');
});

test('PDF to PPTX Suite - pdfToPptx compiles valid OpenXML presentation (.pptx) with JSZip verification', async () => {
  const pdfBytes = await PdfToPptxOps.createSamplePresentationPdf();
  const result = await PdfToPptxOps.pdfToPptx(pdfBytes, { mode: 'editable', aspectRatio: '16:9' });

  assert.ok(result.pptxBytes instanceof Uint8Array);
  assert.equal(result.report.slideCount, 4);
  assert.equal(result.report.aspectRatio, '16:9');
  assert.equal(result.report.mode, 'editable');
  assert.ok(result.report.elementsProcessed >= 4);

  // Verify internal OpenXML ZIP structure
  const zip = await JSZip.loadAsync(result.pptxBytes);
  const files = Object.keys(zip.files);

  assert.ok(files.includes('[Content_Types].xml'));
  assert.ok(files.includes('_rels/.rels'));
  assert.ok(files.includes('ppt/_rels/presentation.xml.rels'));
  assert.ok(files.includes('ppt/presentation.xml'));
  assert.ok(files.includes('ppt/theme/theme1.xml'));
  assert.ok(files.includes('ppt/slideMasters/slideMaster1.xml'));
  assert.ok(files.includes('ppt/slideLayouts/slideLayout1.xml'));
  assert.ok(files.includes('ppt/slideLayouts/slideLayout2.xml'));
  assert.ok(files.includes('ppt/slides/slide1.xml'));
  assert.ok(files.includes('ppt/slides/slide2.xml'));
  assert.ok(files.includes('ppt/slides/slide3.xml'));
  assert.ok(files.includes('ppt/slides/slide4.xml'));
  assert.ok(files.includes('ppt/slides/_rels/slide1.xml.rels'));

  // Verify presentation.xml contents (16:9 widescreen dimensions)
  const presXml = await zip.file('ppt/presentation.xml').async('string');
  assert.ok(presXml.includes('screen16x9'));
  assert.ok(presXml.includes('cx="12192000"'));
  assert.ok(presXml.includes('cy="6858000"'));

  // Verify slide 1 title presence
  const slide1Xml = await zip.file('ppt/slides/slide1.xml').async('string');
  assert.ok(slide1Xml.includes('Enterprise Zero-Telemetry Document Intelligence'));
});

test('PDF to PPTX Suite - Aspect Ratio 4:3 standard override', async () => {
  const pdfBytes = await PdfToPptxOps.createSamplePresentationPdf();
  const result = await PdfToPptxOps.pdfToPptx(pdfBytes, { aspectRatio: '4:3' });

  assert.equal(result.report.aspectRatio, '4:3');

  const zip = await JSZip.loadAsync(result.pptxBytes);
  const presXml = await zip.file('ppt/presentation.xml').async('string');
  assert.ok(presXml.includes('screen4x3'));
  assert.ok(presXml.includes('cx="9144000"'));
  assert.ok(presXml.includes('cy="6858000"'));
});

test('PDF to PPTX Suite - PageOperations & pdfEngine facade delegation', async () => {
  const samplePdf = await PageOperations.createSamplePresentationPdf();
  assert.ok(samplePdf instanceof Uint8Array);

  // 1. Raw bytes return with attached report
  const pptxBytes = await PageOperations.pdfToPpt(samplePdf);
  assert.ok(pptxBytes instanceof Uint8Array);
  assert.ok(pptxBytes.report);
  assert.equal(pptxBytes.report.slideCount, 4);

  // 2. Options withReport return
  const reportObj = await PageOperations.pdfToPpt(samplePdf, { withReport: true, mode: 'editable' });
  assert.ok(reportObj.pptxBytes instanceof Uint8Array);
  assert.equal(reportObj.report.slideCount, 4);

  // 3. pdfEngine delegation
  const engineRes = await pdfEngine.pdfToPpt(samplePdf);
  assert.ok(engineRes instanceof Uint8Array || engineRes.pptxBytes);
});

test('PDF to PPTX Suite - Backend API routes GET /sample and POST /convert', async () => {
  // Test 1: GET /api/pdf-to-pptx/sample
  const sampleReq = {
    url: '/api/pdf-to-pptx/sample',
    method: 'GET'
  };
  let sampleStatus = 0;
  let sampleData = null;
  const sampleRes = {
    writeHead: (st) => { sampleStatus = st; },
    end: (str) => { sampleData = JSON.parse(str); }
  };

  const sampleHandled = await handlePdfToPptxRequest(sampleReq, sampleRes);
  assert.equal(sampleHandled, true);
  assert.equal(sampleStatus, 200);
  assert.equal(sampleData.success, true);
  assert.ok(sampleData.pdfBase64);

  // Test 2: POST /api/pdf-to-pptx/convert
  let postCallback;
  const convertReq = {
    url: '/api/pdf-to-pptx/convert',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: sampleData.pdfBase64,
          mode: 'editable',
          aspectRatio: '16:9'
        })));
      }
      if (evt === 'end') {
        cb();
      }
    }
  };

  let convertStatus = 0;
  let convertData = null;
  const convertRes = {
    writeHead: (st) => { convertStatus = st; },
    end: (str) => { convertData = JSON.parse(str); }
  };

  const convertHandled = await handlePdfToPptxRequest(convertReq, convertRes);
  assert.equal(convertHandled, true);
  assert.equal(convertStatus, 200);
  assert.equal(convertData.success, true);
  assert.equal(convertData.report.slideCount, 4);
  assert.ok(convertData.pptxBase64);
  assert.equal(convertData.filename, 'Decomposed_Presentation.pptx');
});
