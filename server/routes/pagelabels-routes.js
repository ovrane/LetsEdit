/**
 * Advanced PDF Page Labels & Multi-Section Pagination API Routes
 * Implements ISO 32000-1 Clause 12.4.2 specifications:
 * 1. GET  /api/pagelabels/sample   - Returns a pre-built multi-section PDF (preface Roman + body Decimal)
 * 2. POST /api/pagelabels/inspect  - Inspects existing /Catalog /PageLabels number tree and page mappings
 * 3. POST /api/pagelabels/apply    - Injects /PageLabels number tree and optional visual header/footer stamps
 * 4. POST /api/pagelabels/remove   - Purges /PageLabels dictionary and reverts to standard 1-based numbering
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PageLabelsOps } from '../../src/core/engine/operations/pagelabels-ops.js';

export async function handlePageLabelsRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/pagelabels/sample
  if (actualPath === '/api/pagelabels/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await PageLabelsOps.createSamplePageLabelsPdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_pagelabels_document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/pagelabels/inspect
  if (actualPath === '/api/pagelabels/inspect' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const inspection = await PageLabelsOps.inspectPageLabels(buffer);

      return sendJson(res, 200, {
        success: true,
        inspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/pagelabels/apply
  if (actualPath === '/api/pagelabels/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const { sections = [], options = {} } = body;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const updatedBytes = await PageLabelsOps.applyPageLabels(buffer, sections, options);
      const outBuffer = Buffer.from(updatedBytes);

      // Re-inspect updated result
      const reInspection = await PageLabelsOps.inspectPageLabels(outBuffer);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        inspection: reInspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 4. POST /api/pagelabels/remove
  if (actualPath === '/api/pagelabels/remove' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const sanitizedBytes = await PageLabelsOps.removePageLabels(buffer);
      const outBuffer = Buffer.from(sanitizedBytes);

      const reInspection = await PageLabelsOps.inspectPageLabels(outBuffer);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        inspection: reInspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
