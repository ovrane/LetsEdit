/**
 * PDF to Microsoft Excel XLSX & Structured CSV Table Extraction API Routes
 * Endpoints:
 * 1. GET  /api/pdf-to-excel/sample  - Returns sample financial tables PDF
 * 2. POST /api/pdf-to-excel/extract - Extracts structured tables to XLSX or CSV
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PdfToExcelOps } from '../../src/core/engine/operations/pdf-to-excel-ops.js';

export async function handlePdfToExcelRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/pdf-to-excel/sample
  if (actualPath === '/api/pdf-to-excel/sample' && actualMethod === 'GET') {
    try {
      const pdfBytes = await PdfToExcelOps.createSampleFinancialTablePdf();
      const buffer = Buffer.from(pdfBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_financial_statement.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/pdf-to-excel/extract
  if (actualPath === '/api/pdf-to-excel/extract' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pdfBase64, 'base64');
      const format = body.format === 'csv' ? 'csv' : 'xlsx';
      const normalizeNumbers = body.normalizeNumbers === true;

      const result = await PdfToExcelOps.pdfToExcel(inputBuffer, { format, normalizeNumbers });

      if (format === 'csv') {
        return sendJson(res, 200, {
          success: true,
          report: result.report,
          csvText: result.csvText,
          format: 'csv',
          filename: 'Extracted_Tables.csv'
        });
      }

      const outputBuffer = Buffer.from(result.xlsxBytes);
      return sendJson(res, 200, {
        success: true,
        report: result.report,
        xlsxBase64: outputBuffer.toString('base64'),
        format: 'xlsx',
        size: outputBuffer.length,
        filename: 'Extracted_Tables.xlsx'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
