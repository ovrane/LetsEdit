import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { ExcelToPdfOps } from '../src/core/engine/operations/excel-to-pdf-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { pdfEngine } from '../src/core/pdf-engine.js';
import { handleExcelToPdfRequest } from '../server/routes/excel-to-pdf-routes.js';

test('Excel to PDF Suite - createSampleXlsxFile creates valid multi-sheet OpenXML XLSX archive', async () => {
  const xlsxBytes = await ExcelToPdfOps.createSampleXlsxFile();
  assert.ok(xlsxBytes instanceof Uint8Array);
  assert.ok(xlsxBytes.length > 500);

  const zip = await JSZip.loadAsync(xlsxBytes);
  const files = Object.keys(zip.files);
  assert.ok(files.includes('[Content_Types].xml'));
  assert.ok(files.includes('xl/workbook.xml'));
  assert.ok(files.includes('xl/sharedStrings.xml'));
  assert.ok(files.includes('xl/worksheets/sheet1.xml'));
  assert.ok(files.includes('xl/worksheets/sheet2.xml'));
});

test('Excel to PDF Suite - parseSpreadsheetInput parses XLSX sheets and shared strings', async () => {
  const xlsxBytes = await ExcelToPdfOps.createSampleXlsxFile();
  const sheets = await ExcelToPdfOps.parseSpreadsheetInput(xlsxBytes);

  assert.ok(Array.isArray(sheets));
  assert.equal(sheets.length, 2);
  assert.equal(sheets[0].name, 'Revenue & Margins');
  assert.equal(sheets[1].name, 'Operating Expenses');

  assert.ok(sheets[0].rows.length >= 4);
  assert.equal(sheets[0].rows[0][0], 'Product Line');
  assert.equal(sheets[0].rows[0][1], 'Q1 Actual');
  assert.equal(sheets[0].rows[1][0], 'Enterprise PDF SDK');
});

test('Excel to PDF Suite - parseSpreadsheetInput handles raw RFC-4180 CSV strings', async () => {
  const csvContent = `Department,Q1 Budget,Q2 Budget,Notes\n"Engineering, Core",150000,165000,"Zero-telemetry runtime"\nSecurity,75000,80000,"Pen-testing & ISO audit"`;
  const sheets = await ExcelToPdfOps.parseSpreadsheetInput(csvContent);

  assert.equal(sheets.length, 1);
  assert.equal(sheets[0].rows.length, 3);
  assert.equal(sheets[0].rows[0][0], 'Department');
  assert.equal(sheets[0].rows[1][0], 'Engineering, Core');
  assert.equal(sheets[0].rows[1][3], 'Zero-telemetry runtime');
});

test('Excel to PDF Suite - excelToPdf converts XLSX to multi-page vector PDF with gridlines', async () => {
  const xlsxBytes = await ExcelToPdfOps.createSampleXlsxFile();
  const result = await ExcelToPdfOps.excelToPdf(xlsxBytes, {
    fitMode: 'fit-columns',
    orientation: 'auto',
    gridlines: true,
    zebra: true
  });

  assert.ok(result.pdfBytes instanceof Uint8Array);
  assert.equal(result.report.success, true);
  assert.equal(result.report.sheetsCount, 2);
  assert.ok(result.report.pagesGenerated >= 2);
  assert.ok(result.report.rowsRendered >= 8);

  const doc = await PDFDocument.load(result.pdfBytes);
  assert.ok(doc.getPageCount() >= 2);
});

test('Excel to PDF Suite - fitMode fit-sheet and landscape orientation', async () => {
  const xlsxBytes = await ExcelToPdfOps.createSampleXlsxFile();
  const result = await ExcelToPdfOps.excelToPdf(xlsxBytes, {
    fitMode: 'fit-sheet',
    orientation: 'landscape'
  });

  assert.equal(result.report.fitMode, 'fit-sheet');
  const doc = await PDFDocument.load(result.pdfBytes);
  const page = doc.getPage(0);
  assert.ok(page.getWidth() > page.getHeight(), 'Should be landscape oriented');
});

test('Excel to PDF Suite - PageOperations & pdfEngine facade delegation', async () => {
  const xlsxBytes = await PageOperations.createSampleXlsxFile();

  // 1. Raw bytes return
  const pdfBytes = await PageOperations.excelToPdf(xlsxBytes);
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.report);
  assert.equal(pdfBytes.report.success, true);

  // 2. With report return
  const resReport = await PageOperations.excelToPdf(xlsxBytes, { withReport: true });
  assert.ok(resReport.pdfBytes instanceof Uint8Array);
  assert.equal(resReport.report.success, true);

  // 3. pdfEngine delegation
  const engineResult = await pdfEngine.excelToPdf(xlsxBytes);
  assert.ok(engineResult instanceof Uint8Array || engineResult.pdfBytes);
});

test('Excel to PDF Suite - backend API routes GET /sample and POST /convert', async () => {
  // Test 1: GET /api/excel-to-pdf/sample
  let statusCode = 0;
  let responseData = null;
  const mockRes = {
    writeHead(status, headers) { statusCode = status; },
    end(body) { responseData = JSON.parse(body); }
  };

  const sampleHandled = await handleExcelToPdfRequest(
    { url: '/api/excel-to-pdf/sample', method: 'GET' },
    mockRes,
    '/api/excel-to-pdf/sample',
    'GET'
  );
  assert.equal(sampleHandled, true);
  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.ok(responseData.xlsxBase64);
  assert.equal(responseData.filename, 'sample_financial_forecast.xlsx');

  // Test 2: POST /api/excel-to-pdf/convert
  let postStatus = 0;
  let postData = null;
  const mockPostRes = {
    writeHead(status, headers) { postStatus = status; },
    end(body) { postData = JSON.parse(body); }
  };

  const reqObj = {
    url: '/api/excel-to-pdf/convert',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') {
        cb(Buffer.from(JSON.stringify({
          fileBase64: responseData.xlsxBase64,
          fitMode: 'fit-columns'
        })));
      }
      if (evt === 'end') cb();
    }
  };

  const convertHandled = await handleExcelToPdfRequest(reqObj, mockPostRes, '/api/excel-to-pdf/convert', 'POST');
  assert.equal(convertHandled, true);
  assert.equal(postStatus, 200);
  assert.equal(postData.success, true);
  assert.ok(postData.pdfBase64);
  assert.equal(postData.filename, 'Spreadsheet_Report.pdf');
  assert.ok(postData.report);
  assert.equal(postData.report.sheetsCount, 2);
});
