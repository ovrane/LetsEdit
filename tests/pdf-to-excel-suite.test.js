import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { PdfToExcelOps } from '../src/core/engine/operations/pdf-to-excel-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { pdfEngine } from '../src/core/pdf-engine.js';
import { handlePdfToExcelRequest } from '../server/routes/pdf-to-excel-routes.js';

test('PDF to Excel Suite - createSampleFinancialTablePdf creates valid financial statement PDF', async () => {
  const pdfBytes = await PdfToExcelOps.createSampleFinancialTablePdf();
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.length > 500);

  const doc = await PDFDocument.load(pdfBytes);
  assert.equal(doc.getPageCount(), 1);
});

test('PDF to Excel Suite - normalizeCellValue handles currency, percentages, and parenthesized negatives', () => {
  assert.deepEqual(PdfToExcelOps.normalizeCellValue('$45,200,000', true), { value: 45200000, isNumeric: true });
  assert.deepEqual(PdfToExcelOps.normalizeCellValue('29.2%', true), { value: 0.292, isNumeric: true });
  assert.deepEqual(PdfToExcelOps.normalizeCellValue('($1,500.00)', true), { value: -1500, isNumeric: true });
  assert.deepEqual(PdfToExcelOps.normalizeCellValue('Asset Category', true), { value: 'Asset Category', isNumeric: false });
  assert.deepEqual(PdfToExcelOps.normalizeCellValue('$45,200,000', false), { value: '$45,200,000', isNumeric: false });
});

test('PDF to Excel Suite - extractPdfTokens and extractTablesFromTokens extracts 2D table matrix', async () => {
  const pdfBytes = await PdfToExcelOps.createSampleFinancialTablePdf();
  const tokens = await PdfToExcelOps.extractPdfTokens(pdfBytes);
  assert.ok(tokens.length >= 15);

  const tables = PdfToExcelOps.extractTablesFromTokens(tokens);
  assert.ok(Array.isArray(tables));
  assert.ok(tables.length >= 1);

  const mainTable = tables[0];
  assert.ok(mainTable.rows.length >= 5);
  assert.ok(mainTable.rows[0].length >= 3);
  assert.match(mainTable.rows[0][0], /Asset|Category/i);
});

test('PDF to Excel Suite - pdfToExcel compiles valid OpenXML XLSX archive with shared strings', async () => {
  const pdfBytes = await PdfToExcelOps.createSampleFinancialTablePdf();
  const result = await PdfToExcelOps.pdfToExcel(pdfBytes, { format: 'xlsx', normalizeNumbers: true });

  assert.ok(result.xlsxBytes instanceof Uint8Array);
  assert.equal(result.report.success, true);
  assert.equal(result.report.format, 'xlsx');
  assert.ok(result.report.rowsExtracted >= 5);

  const zip = await JSZip.loadAsync(result.xlsxBytes);
  const files = Object.keys(zip.files);
  assert.ok(files.includes('[Content_Types].xml'));
  assert.ok(files.includes('xl/workbook.xml'));
  assert.ok(files.includes('xl/sharedStrings.xml'));
  assert.ok(files.includes('xl/worksheets/sheet1.xml'));

  const sheetXml = await zip.file('xl/worksheets/sheet1.xml').async('text');
  assert.match(sheetXml, /<c r="[A-Z0-9]+"/);
});

test('PDF to Excel Suite - pdfToExcel compiles RFC-4180 CSV output', async () => {
  const pdfBytes = await PdfToExcelOps.createSampleFinancialTablePdf();
  const result = await PdfToExcelOps.pdfToExcel(pdfBytes, { format: 'csv' });

  assert.equal(result.report.format, 'csv');
  assert.ok(typeof result.csvText === 'string');
  assert.ok(result.csvText.includes(','));
  assert.match(result.csvText, /Cash and Liquid Equivalents/);
});

test('PDF to Excel Suite - PageOperations & pdfEngine facade delegation', async () => {
  const pdfBytes = await PageOperations.createSampleFinancialTablePdf();

  // 1. Raw bytes return
  const fileBytes = await PageOperations.pdfToExcel(pdfBytes, { format: 'xlsx' });
  assert.ok(fileBytes instanceof Uint8Array);
  assert.ok(fileBytes.report);
  assert.equal(fileBytes.report.success, true);

  // 2. With report return
  const reportObj = await PageOperations.pdfToExcel(pdfBytes, { format: 'csv', withReport: true });
  assert.ok(reportObj.fileBytes instanceof Uint8Array);
  assert.equal(reportObj.report.format, 'csv');

  // 3. pdfEngine delegation
  const engineRes = await pdfEngine.pdfToExcel(pdfBytes, { format: 'xlsx' });
  assert.ok(engineRes instanceof Uint8Array || engineRes.xlsxBytes);
});

test('PDF to Excel Suite - backend API routes GET /sample and POST /extract', async () => {
  // Test 1: GET /api/pdf-to-excel/sample
  let statusCode = 0;
  let responseData = null;
  const mockRes = {
    writeHead(status, headers) { statusCode = status; },
    end(body) { responseData = JSON.parse(body); }
  };

  const sampleHandled = await handlePdfToExcelRequest(
    { url: '/api/pdf-to-excel/sample', method: 'GET' },
    mockRes,
    '/api/pdf-to-excel/sample',
    'GET'
  );
  assert.equal(sampleHandled, true);
  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.ok(responseData.pdfBase64);
  assert.equal(responseData.filename, 'sample_financial_statement.pdf');

  // Test 2: POST /api/pdf-to-excel/extract (XLSX)
  let postStatus = 0;
  let postData = null;
  const mockPostRes = {
    writeHead(status, headers) { postStatus = status; },
    end(body) { postData = JSON.parse(body); }
  };

  const reqObjXlsx = {
    url: '/api/pdf-to-excel/extract',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: responseData.pdfBase64,
          format: 'xlsx',
          normalizeNumbers: true
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandledXlsx = await handlePdfToExcelRequest(reqObjXlsx, mockPostRes, '/api/pdf-to-excel/extract', 'POST');
  assert.equal(convertHandledXlsx, true);
  assert.equal(postStatus, 200);
  assert.equal(postData.success, true);
  assert.ok(postData.xlsxBase64);
  assert.equal(postData.format, 'xlsx');
  assert.equal(postData.filename, 'Extracted_Tables.xlsx');

  // Test 3: POST /api/pdf-to-excel/extract (CSV)
  let csvStatus = 0;
  let csvData = null;
  const mockCsvRes = {
    writeHead(status, headers) { csvStatus = status; },
    end(body) { csvData = JSON.parse(body); }
  };

  const reqObjCsv = {
    url: '/api/pdf-to-excel/extract',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          pdfBase64: responseData.pdfBase64,
          format: 'csv'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandledCsv = await handlePdfToExcelRequest(reqObjCsv, mockCsvRes, '/api/pdf-to-excel/extract', 'POST');
  assert.equal(convertHandledCsv, true);
  assert.equal(csvStatus, 200);
  assert.equal(csvData.success, true);
  assert.equal(csvData.format, 'csv');
  assert.ok(csvData.csvText);
});
