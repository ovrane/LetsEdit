/**
 * Adobe Acrobat Pro & iLovePDF N-Up Page Imposition API Routes
 * Endpoints:
 * 1. GET  /api/nup/sample         - Returns 8-page multi-section document for N-Up testing
 * 2. POST /api/nup/apply          - Imposes PDF pages onto N-Up sheets (2-up, 4-up, 6-up, 8-up)
 * 3. POST /api/nup/preview-config - Computes imposition grid stats (sheets, scale, cells)
 */

import { parseJsonBody, sendJson } from '../db.js';
import { NupOps } from '../../src/core/engine/operations/nup-ops.js';

export async function handleNupRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/nup/sample
  if (actualPath === '/api/nup/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await NupOps.createSampleNupPdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_nup_imposition_document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/nup/preview-config
  if (actualPath === '/api/nup/preview-config' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const layout = Number(body.layout || 2);
      const totalPages = Number(body.totalPages || 8);
      const spec = NupOps.LAYOUT_SPECS[layout] || NupOps.LAYOUT_SPECS[2];
      const orientation = (body.orientation || spec.defaultOrientation || 'portrait').toLowerCase();
      const grid = spec[orientation] || spec[spec.defaultOrientation];
      const pagesPerSheet = grid.cols * grid.rows;
      const rangeRule = body.rangeRule || body.pageRange || 'all';
      const included = NupOps.getIncludedPageIndices(totalPages, rangeRule);
      const expectedSheets = Math.ceil(included.length / pagesPerSheet);

      return sendJson(res, 200, {
        success: true,
        layout,
        orientation,
        cols: grid.cols,
        rows: grid.rows,
        pagesPerSheet,
        sourcePages: totalPages,
        selectedPages: included.length,
        expectedSheets
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/nup/apply
  if (actualPath === '/api/nup/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const config = body.config || body.options || body;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const updatedBytes = await NupOps.applyNup(inBuffer, config);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        appliedCount: updatedBytes.appliedCount ?? updatedBytes.report?.appliedCount ?? 0,
        outputPageCount: updatedBytes.outputPageCount ?? updatedBytes.report?.outputPageCount ?? 0,
        layout: updatedBytes.layout ?? updatedBytes.report?.layout ?? 2,
        report: updatedBytes.report
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
