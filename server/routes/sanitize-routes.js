/**
 * Advanced Document Sanitization & Hidden Information Cleaner API Routes
 * Reverse-engineered from Adobe Acrobat Pro & iLovePDF privacy specifications:
 * 1. GET  /api/sanitize/sample   - Returns sample PDF with intentional metadata, pieceinfo, and openaction
 * 2. POST /api/sanitize/inspect  - Deep inspection of metadata, scripts, attachments, and private data
 * 3. POST /api/sanitize/execute  - Purges hidden data, flattens forms, strips attachments, and rebuilds object streams
 */

import { parseJsonBody, sendJson } from '../db.js';
import { SanitizeOps } from '../../src/core/engine/operations/sanitize-ops.js';

export async function handleSanitizeRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/sanitize/sample
  if (actualPath === '/api/sanitize/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await SanitizeOps.createSampleExposedPdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_exposed_document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/sanitize/inspect
  if (actualPath === '/api/sanitize/inspect' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const inspection = await SanitizeOps.inspectHiddenData(buffer);

      return sendJson(res, 200, {
        success: true,
        inspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/sanitize/execute
  if (actualPath === '/api/sanitize/execute' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const options = body.options || {};

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const sanitizedBytes = await SanitizeOps.sanitizeDocument(buffer, options);
      const outBuffer = Buffer.from(sanitizedBytes);

      // Re-inspect to verify clean status
      const reInspection = await SanitizeOps.inspectHiddenData(outBuffer);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        report: sanitizedBytes.report,
        reInspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
