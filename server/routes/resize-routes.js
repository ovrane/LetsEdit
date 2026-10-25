/**
 * Adobe Acrobat Pro & Sejda Page Resizing & Margins API Routes
 * Endpoints:
 * 1. GET  /api/resize/sample         - Returns 4-page multi-format sample document
 * 2. POST /api/resize/preview-bounds - Computes target dimensions, available printable area, and scale factor
 * 3. POST /api/resize/apply          - Resizes page bounds, adds binding gutters/margins, and returns base64 PDF
 */

import { parseJsonBody, sendJson } from '../db.js';
import { ResizeOps } from '../../src/core/engine/operations/resize-ops.js';

export async function handleResizeRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/resize/sample
  if (actualPath === '/api/resize/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await ResizeOps.createSampleResizePdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_resize_document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/resize/preview-bounds
  if (actualPath === '/api/resize/preview-bounds' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const pageSize = body.pageSize || 'a4';
      const orientation = (body.orientation || 'auto').toLowerCase();
      const origW = Number(body.width || 595.28);
      const origH = Number(body.height || 841.89);

      const [targetW, targetH] = ResizeOps.resolveTargetDimensions(pageSize, orientation, origW, origH);
      const marginTop = Number(body.marginTop || 0);
      const marginBottom = Number(body.marginBottom || 0);
      const marginLeft = Number(body.marginLeft || 0);
      const marginRight = Number(body.marginRight || 0);
      const bindingGutter = Number(body.bindingGutter || 0);

      const availW = Math.max(10, targetW - (marginLeft + marginRight + bindingGutter));
      const availH = Math.max(10, targetH - (marginTop + marginBottom));
      const scale = Math.min(availW / origW, availH / origH, 1.0);

      return sendJson(res, 200, {
        success: true,
        pageSize,
        orientation,
        original: { width: origW, height: origH },
        target: { width: targetW, height: targetH },
        margins: { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight, bindingGutter },
        available: { width: availW, height: availH },
        scale
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/resize/apply
  if (actualPath === '/api/resize/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const config = body.config || body.options || body;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const updatedBytes = await ResizeOps.resizePdf(inBuffer, config);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        appliedCount: updatedBytes.appliedCount ?? updatedBytes.report?.appliedCount ?? 0,
        totalPages: updatedBytes.totalPages ?? updatedBytes.report?.totalPages ?? 0,
        targetPageSize: updatedBytes.targetPageSize ?? 'original',
        report: updatedBytes.report
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
