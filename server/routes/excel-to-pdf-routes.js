/**
 * Excel XLSX & CSV to PDF Conversion API Routes
 * Endpoints:
 * 1. GET  /api/excel-to-pdf/sample  - Returns sample XLSX financial forecast workbook
 * 2. POST /api/excel-to-pdf/convert - Converts spreadsheet into vector PDF report
 */

import { parseJsonBody, sendJson } from '../db.js';
import { ExcelToPdfOps } from '../../src/core/engine/operations/excel-to-pdf-ops.js';

export async function handleExcelToPdfRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/excel-to-pdf/sample
  if (actualPath === '/api/excel-to-pdf/sample' && actualMethod === 'GET') {
    try {
      const xlsxBytes = await ExcelToPdfOps.createSampleXlsxFile();
      const buffer = Buffer.from(xlsxBytes);
      return sendJson(res, 200, {
        success: true,
        xlsxBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_financial_forecast.xlsx'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/excel-to-pdf/convert
  if (actualPath === '/api/excel-to-pdf/convert' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.fileBase64 && !body.csvText) {
        return sendJson(res, 400, { success: false, error: 'fileBase64 or csvText is required' });
      }

      const input = body.fileBase64 ? Buffer.from(body.fileBase64, 'base64') : body.csvText;
      const options = {
        fitMode: body.fitMode || 'fit-columns',
        orientation: body.orientation || 'auto',
        pageSize: body.pageSize || 'a4',
        gridlines: body.gridlines !== false,
        zebra: body.zebra !== false
      };

      const result = await ExcelToPdfOps.excelToPdf(input, options);
      const outputBuffer = Buffer.from(result.pdfBytes);

      return sendJson(res, 200, {
        success: true,
        report: result.report,
        pdfBase64: outputBuffer.toString('base64'),
        size: outputBuffer.length,
        filename: 'Spreadsheet_Report.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
