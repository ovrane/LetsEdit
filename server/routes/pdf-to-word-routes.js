/**
 * PDF to Microsoft Word DOCX Conversion API Routes
 * Endpoints:
 * 1. GET  /api/pdf-to-word/sample  - Returns sample structured PDF with headings, lists, tables
 * 2. POST /api/pdf-to-word/convert - Converts PDF into editable OpenXML DOCX archive
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PdfToWordOps } from '../../src/core/engine/operations/pdf-to-word-ops.js';

export async function handlePdfToWordRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/pdf-to-word/sample
  if (actualPath === '/api/pdf-to-word/sample' && actualMethod === 'GET') {
    try {
      const pdfBytes = await PdfToWordOps.createSampleStructuredPdf();
      const buffer = Buffer.from(pdfBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_structured_agreement.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/pdf-to-word/convert
  if (actualPath === '/api/pdf-to-word/convert' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pdfBase64, 'base64');
      const mode = body.mode || 'flow';
      const result = await PdfToWordOps.pdfToWord(inputBuffer, { mode });
      const outputBuffer = Buffer.from(result.docxBytes);

      return sendJson(res, 200, {
        success: true,
        report: result.report,
        docxBase64: outputBuffer.toString('base64'),
        size: outputBuffer.length,
        filename: 'Converted_Document.docx'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
