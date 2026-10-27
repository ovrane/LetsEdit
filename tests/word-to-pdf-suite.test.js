import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { WordToPdfOps } from '../src/core/engine/operations/word-to-pdf-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleWordToPdfRequest } from '../server/routes/word-to-pdf-routes.js';

test('Word to PDF Suite - createSampleDocxFile creates valid binary OpenXML DOCX archive', async () => {
  const docxBytes = await WordToPdfOps.createSampleDocxFile();
  assert.ok(docxBytes instanceof Uint8Array);
  assert.ok(docxBytes.length > 500);

  const zip = await JSZip.loadAsync(docxBytes);
  const files = Object.keys(zip.files);
  assert.ok(files.includes('[Content_Types].xml'));
  assert.ok(files.includes('word/document.xml'));
  assert.ok(files.includes('word/styles.xml'));
});

test('Word to PDF Suite - parseDocxContent parses headings, text runs, lists, and tables', async () => {
  const docxBytes = await WordToPdfOps.createSampleDocxFile();
  const items = await WordToPdfOps.parseDocxContent(docxBytes);

  assert.ok(Array.isArray(items));
  assert.ok(items.length >= 5);

  const h1 = items.find(it => it.style === 'heading1');
  assert.ok(h1);
  assert.equal(h1.text, 'Executive Enterprise Agreement');

  const h2 = items.find(it => it.style === 'heading2');
  assert.ok(h2);

  const listItems = items.filter(it => it.isList);
  assert.ok(listItems.length >= 2);

  const table = items.find(it => it.type === 'table');
  assert.ok(table);
  assert.ok(table.rows.length >= 3);
  assert.equal(table.rows[0].length, 3);
  assert.equal(table.rows[0][0].text, 'Item');
});

test('Word to PDF Suite - wordToPdf converts DOCX to vector PDF with styling and tables', async () => {
  const docxBytes = await WordToPdfOps.createSampleDocxFile();
  const result = await WordToPdfOps.wordToPdf(docxBytes, { fontFamily: 'helvetica' });

  assert.ok(result.pdfBytes instanceof Uint8Array);
  assert.equal(result.report.success, true);
  assert.ok(result.report.headingsCount >= 2);
  assert.ok(result.report.paragraphsCount >= 3);
  assert.ok(result.report.tablesCount >= 1);
  assert.ok(result.report.pagesGenerated >= 1);

  const doc = await PDFDocument.load(result.pdfBytes);
  assert.ok(doc.getPageCount() >= 1);
});

test('Word to PDF Suite - PageOperations facade delegates wordToPdf', async () => {
  const docxBytes = await PageOperations.createSampleDocxFile();
  const pdfBytes = await PageOperations.wordToPdf(docxBytes);
  assert.ok(pdfBytes instanceof Uint8Array);

  const withReport = await PageOperations.wordToPdf(docxBytes, { fontFamily: 'times', withReport: true });
  assert.ok(withReport.pdfBytes instanceof Uint8Array);
  assert.equal(withReport.report.success, true);
});

test('Word to PDF Suite - handleWordToPdfRequest serves sample and convert endpoints', async () => {
  // 1. GET /api/word-to-pdf/sample
  let status = null;
  let headers = {};
  let bodyData = '';
  const mockRes = {
    writeHead: (s, h) => { status = s; headers = h; },
    end: (d) => { bodyData = d; }
  };

  const sampleHandled = await handleWordToPdfRequest({ url: '/api/word-to-pdf/sample', method: 'GET' }, mockRes, '/api/word-to-pdf/sample', 'GET');
  assert.equal(sampleHandled, true);
  assert.equal(status, 200);
  const sampleJson = JSON.parse(bodyData);
  assert.equal(sampleJson.success, true);
  assert.ok(sampleJson.docxBase64.length > 100);

  // 2. POST /api/word-to-pdf/convert
  status = null;
  bodyData = '';
  const mockConvertReq = {
    url: '/api/word-to-pdf/convert',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          docxBase64: sampleJson.docxBase64,
          fontFamily: 'helvetica'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandled = await handleWordToPdfRequest(mockConvertReq, mockRes, '/api/word-to-pdf/convert', 'POST');
  assert.equal(convertHandled, true);
  assert.equal(status, 200);
  const convertJson = JSON.parse(bodyData);
  assert.equal(convertJson.success, true);
  assert.ok(convertJson.report.headingsCount >= 2);
  assert.ok(convertJson.pdfBase64.length > 100);
});
