import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { PdfToWordOps } from '../src/core/engine/operations/pdf-to-word-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { pdfEngine } from '../src/core/pdf-engine.js';
import { handlePdfToWordRequest } from '../server/routes/pdf-to-word-routes.js';

test('PDF to Word Suite - createSampleStructuredPdf creates valid binary PDF with headings and tables', async () => {
  const pdfBytes = await PdfToWordOps.createSampleStructuredPdf();
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.length > 1000);

  const doc = await PDFDocument.load(pdfBytes);
  assert.equal(doc.getPageCount(), 1);
  const page = doc.getPage(0);
  assert.equal(page.getWidth(), 595.28);
  assert.equal(page.getHeight(), 841.89);
});

test('PDF to Word Suite - extractLayout extracts structured tokens, headings, paragraphs, and tables', async () => {
  const pdfBytes = await PdfToWordOps.createSampleStructuredPdf();
  const layout = await PdfToWordOps.extractLayout(pdfBytes, { mode: 'flow' });

  assert.ok(layout.itemsCount >= 10);
  assert.ok(layout.linesCount >= 8);
  assert.ok(Array.isArray(layout.elements));
  assert.ok(layout.elements.length >= 4);

  const heading1 = layout.elements.find(e => e.type === 'heading' && e.level === 1);
  assert.ok(heading1, 'Should find at least one Heading 1');
  assert.match(heading1.text, /Enterprise|Agreement|Scope/i);

  const tableElem = layout.elements.find(e => e.type === 'table');
  assert.ok(tableElem, 'Should detect tabular grid structure');
  assert.ok(tableElem.rows.length >= 2, 'Table should have multiple rows');

  const paraElem = layout.elements.find(e => e.type === 'paragraph');
  assert.ok(paraElem, 'Should extract flowing body paragraph');
});

test('PDF to Word Suite - pdfToWord compiles valid OpenXML DOCX archive with styles', async () => {
  const pdfBytes = await PdfToWordOps.createSampleStructuredPdf();
  const result = await PdfToWordOps.pdfToWord(pdfBytes, { mode: 'flow' });

  assert.ok(result.docxBytes instanceof Uint8Array);
  assert.equal(result.report.success, true);
  assert.ok(result.report.headingsCount >= 1);
  assert.ok(result.report.paragraphsCount >= 1);
  assert.ok(result.report.tablesCount >= 1);

  // Validate ZIP structure of the DOCX archive
  const zip = await JSZip.loadAsync(result.docxBytes);
  const files = Object.keys(zip.files);
  assert.ok(files.includes('[Content_Types].xml'));
  assert.ok(files.includes('_rels/.rels'));
  assert.ok(files.includes('word/document.xml'));
  assert.ok(files.includes('word/styles.xml'));

  const documentXml = await zip.file('word/document.xml').async('text');
  assert.match(documentXml, /<w:document/);
  assert.match(documentXml, /<w:tbl>/);
  assert.match(documentXml, /<w:pStyle w:val="Heading1"/);

  const stylesXml = await zip.file('word/styles.xml').async('text');
  assert.match(stylesXml, /<w:style w:type="paragraph" w:styleId="Heading1"/);
  assert.match(stylesXml, /<w:style w:type="table" w:styleId="TableGrid"/);
});

test('PDF to Word Suite - mode: frame keeps line elements separate', async () => {
  const pdfBytes = await PdfToWordOps.createSampleStructuredPdf();
  const result = await PdfToWordOps.pdfToWord(pdfBytes, { mode: 'frame' });

  assert.equal(result.report.mode, 'frame');
  assert.ok(result.docxBytes.length > 500);

  const zip = await JSZip.loadAsync(result.docxBytes);
  const documentXml = await zip.file('word/document.xml').async('text');
  assert.ok(documentXml.length > 200);
});

test('PDF to Word Suite - PageOperations & pdfEngine facade delegation', async () => {
  const pdfBytes = await PageOperations.createSampleStructuredPdf();

  // Test raw bytes return
  const docxBytes = await PageOperations.pdfToWord(pdfBytes);
  assert.ok(docxBytes instanceof Uint8Array);
  assert.ok(docxBytes.report);
  assert.equal(docxBytes.report.success, true);

  // Test withReport return
  const reportObj = await PageOperations.pdfToWord(pdfBytes, { withReport: true });
  assert.ok(reportObj.docxBytes instanceof Uint8Array);
  assert.equal(reportObj.report.success, true);

  // Test pdfEngine integration
  const engineResult = await pdfEngine.pdfToWord(pdfBytes);
  assert.ok(engineResult instanceof Uint8Array || engineResult.docxBytes);
});

test('PDF to Word Suite - backend API routes GET /sample and POST /convert', async () => {
  // Test 1: GET /api/pdf-to-word/sample
  let statusCode = 0;
  let responseData = null;
  const mockRes = {
    writeHead(status, headers) { statusCode = status; },
    end(body) { responseData = JSON.parse(body); }
  };

  const sampleHandled = await handlePdfToWordRequest(
    { url: '/api/pdf-to-word/sample', method: 'GET' },
    mockRes
  );
  assert.equal(sampleHandled, true);
  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.ok(responseData.pdfBase64);

  // Test 2: POST /api/pdf-to-word/convert
  let postStatus = 0;
  let postData = null;
  const mockPostRes = {
    writeHead(status, headers) { postStatus = status; },
    end(body) { postData = JSON.parse(body); }
  };

  const reqObj = {
    url: '/api/pdf-to-word/convert',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: responseData.pdfBase64,
          mode: 'flow'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandled = await handlePdfToWordRequest(reqObj, mockPostRes, '/api/pdf-to-word/convert', 'POST');
  assert.equal(convertHandled, true);
  assert.equal(postStatus, 200);
  assert.equal(postData.success, true);
  assert.ok(postData.docxBase64);
  assert.equal(postData.filename, 'Converted_Document.docx');
  assert.ok(postData.report);
  assert.equal(postData.report.tablesCount >= 1, true);
});
