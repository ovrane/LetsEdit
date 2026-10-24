/**
 * Advanced PDF Document Outlines & Hierarchical Bookmarks API Routes
 * Implements ISO 32000-1 Clause 12.3.3 specifications:
 * 1. GET  /api/outlines/sample   - Returns sample PDF with 2-level hierarchical bookmarks
 * 2. POST /api/outlines/inspect  - Extracts bookmark outline tree, page targets, and styles
 * 3. POST /api/outlines/apply    - Injects /Outlines tree dictionary with /First, /Last, /Prev, /Next
 * 4. POST /api/outlines/remove   - Purges /Outlines dictionary from document catalog
 */

import { parseJsonBody, sendJson } from '../db.js';
import { OutlineOps } from '../../src/core/engine/operations/outline-ops.js';

export async function handleOutlineRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/outlines/sample
  if (actualPath === '/api/outlines/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await OutlineOps.createSampleOutlinesPdf();
      const buffer = Buffer.from(sampleBytes);
      const inspection = await OutlineOps.inspectOutlines(buffer);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_bookmarked_document.pdf',
        inspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/outlines/inspect
  if (actualPath === '/api/outlines/inspect' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const inspection = await OutlineOps.inspectOutlines(buffer);
      const markdownTOC = OutlineOps.exportToMarkdownTOC(inspection.items);

      return sendJson(res, 200, {
        success: true,
        inspection,
        markdownTOC
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/outlines/apply
  if (actualPath === '/api/outlines/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const items = body.items || body.bookmarks || [];
      const options = body.options || {};

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const updatedBytes = await OutlineOps.applyOutlines(buffer, items, options);
      const outBuffer = Buffer.from(updatedBytes);

      // Re-inspect to return synchronized structure
      const reInspection = await OutlineOps.inspectOutlines(outBuffer);
      const markdownTOC = OutlineOps.exportToMarkdownTOC(reInspection.items);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        inspection: reInspection,
        markdownTOC
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 4. POST /api/outlines/remove
  if (actualPath === '/api/outlines/remove' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const sanitizedBytes = await OutlineOps.removeOutlines(buffer);
      const outBuffer = Buffer.from(sanitizedBytes);

      const reInspection = await OutlineOps.inspectOutlines(outBuffer);

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
