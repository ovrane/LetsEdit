/**
 * Adobe Acrobat Pro & iLovePDF Color Space Inversion & DeviceGray Grayscale API Routes
 * Endpoints:
 * 1. GET  /api/grayscale/sample  - Returns 4-page multi-colored corporate brochure
 * 2. POST /api/grayscale/preview - Generates grayscale preview telemetry of selected page
 * 3. POST /api/grayscale/convert - Converts document to DeviceGray with ink savings telemetry
 */

import { parseJsonBody, sendJson } from '../db.js';
import { GrayscaleOps } from '../../src/core/engine/operations/grayscale-ops.js';

export async function handleGrayscaleRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/grayscale/sample
  if (actualPath === '/api/grayscale/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await GrayscaleOps.createSampleGrayscalePdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_color_brochure.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/grayscale/preview
  if (actualPath === '/api/grayscale/preview' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pdfBase64, 'base64');
      const mode = body.mode || 'standard';
      const preserveBlackText = body.preserveBlackText !== false;
      const targetPage = Number(body.pageNum || 1);

      const result = await GrayscaleOps.convertToGrayscale(inputBuffer, {
        mode,
        preserveBlackText,
        pageRange: [targetPage]
      });

      return sendJson(res, 200, {
        success: true,
        page: targetPage,
        report: result.report,
        pdfBase64: Buffer.from(result.pdfBytes).toString('base64')
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/grayscale/convert
  if (actualPath === '/api/grayscale/convert' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pdfBase64, 'base64');
      const mode = body.mode || 'standard';
      const preserveBlackText = body.preserveBlackText !== false;
      const pageRange = body.pageRange || 'all';

      const result = await GrayscaleOps.convertToGrayscale(inputBuffer, {
        mode,
        preserveBlackText,
        pageRange
      });

      const convertedBuf = Buffer.from(result.pdfBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: convertedBuf.toString('base64'),
        size: convertedBuf.length,
        report: result.report
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
