/**
 * Word DOCX to PDF Conversion API Routes
 * Endpoints:
 * 1. GET  /api/word-to-pdf/sample  - Returns sample DOCX with headings, lists, tables
 * 2. POST /api/word-to-pdf/convert - Converts DOCX base64 into vector PDF
 */

import { parseJsonBody, sendJson } from '../db.js';
import { WordToPdfOps } from '../../src/core/engine/operations/word-to-pdf-ops.js';

export async function handleWordToPdfRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/word-to-pdf/sample
  if (actualPath === '/api/word-to-pdf/sample' && actualMethod === 'GET') {
    try {
      const docxBytes = await WordToPdfOps.createSampleDocxFile();
      const buffer = Buffer.from(docxBytes);
      return sendJson(res, 200, {
        success: true,
        docxBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_enterprise_agreement.docx'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/word-to-pdf/convert
  if (actualPath === '/api/word-to-pdf/convert' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.docxBase64) {
        return sendJson(res, 400, { success: false, error: 'docxBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.docxBase64, 'base64');
      const fontFamily = body.fontFamily || 'helvetica';

      const result = await WordToPdfOps.wordToPdf(inputBuffer, { fontFamily });
      const outputBuffer = Buffer.from(result.pdfBytes);

      return sendJson(res, 200, {
        success: true,
        report: result.report,
        pdfBase64: outputBuffer.toString('base64'),
        size: outputBuffer.length,
        filename: 'Converted_Document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
