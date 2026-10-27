/**
 * PowerPoint PPTX to PDF Conversion API Routes
 * Endpoints:
 * 1. GET  /api/pptx-to-pdf/sample  - Returns sample 5-slide PPTX presentation deck
 * 2. POST /api/pptx-to-pdf/convert - Converts presentation slides into landscape PDF or handouts
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PptxToPdfOps } from '../../src/core/engine/operations/pptx-to-pdf-ops.js';

export async function handlePptxToPdfRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/pptx-to-pdf/sample
  if (actualPath === '/api/pptx-to-pdf/sample' && actualMethod === 'GET') {
    try {
      const pptxBytes = await PptxToPdfOps.createSamplePptxFile();
      const buffer = Buffer.from(pptxBytes);
      return sendJson(res, 200, {
        success: true,
        pptxBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_presentation_deck.pptx'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/pptx-to-pdf/convert
  if (actualPath === '/api/pptx-to-pdf/convert' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pptxBase64) {
        return sendJson(res, 400, { success: false, error: 'pptxBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pptxBase64, 'base64');
      const options = {
        title: body.title || 'Executive Presentation',
        layout: body.layout || '1-up'
      };

      const result = await PptxToPdfOps.pptToPdf(inputBuffer, options);
      const outputBuffer = Buffer.from(result.pdfBytes);

      return sendJson(res, 200, {
        success: true,
        report: result.report,
        pdfBase64: outputBuffer.toString('base64'),
        size: outputBuffer.length,
        filename: 'Presentation_Slides.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
