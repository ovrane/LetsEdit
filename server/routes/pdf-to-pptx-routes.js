/**
 * PDF to PowerPoint Presentation (PPTX) Conversion API Routes
 * Endpoints:
 * 1. GET  /api/pdf-to-pptx/sample  (alias /api/pdf-to-ppt/sample)  - Returns sample 4-slide PDF deck
 * 2. POST /api/pdf-to-pptx/convert (alias /api/pdf-to-ppt/convert) - Decomposes PDF pages into PPTX presentation
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PdfToPptxOps } from '../../src/core/engine/operations/pdf-to-pptx-ops.js';

export async function handlePdfToPptxRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET sample PDF deck
  if ((actualPath === '/api/pdf-to-pptx/sample' || actualPath === '/api/pdf-to-ppt/sample') && actualMethod === 'GET') {
    try {
      const pdfBytes = await PdfToPptxOps.createSamplePresentationPdf();
      const buffer = Buffer.from(pdfBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'Executive_Presentation_Sample.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST convert PDF to PPTX
  if ((actualPath === '/api/pdf-to-pptx/convert' || actualPath === '/api/pdf-to-ppt/convert') && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pdfBase64, 'base64');
      const options = {
        mode: body.mode || 'editable',
        aspectRatio: body.aspectRatio || 'auto'
      };

      const result = await PdfToPptxOps.pdfToPptx(inputBuffer, options);
      const outputBuffer = Buffer.from(result.pptxBytes);

      return sendJson(res, 200, {
        success: true,
        report: result.report,
        pptxBase64: outputBuffer.toString('base64'),
        size: outputBuffer.length,
        filename: 'Decomposed_Presentation.pptx'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
