/**
 * Adobe Acrobat Pro & iLovePDF Dynamic Page Numbering API Routes
 * Endpoints:
 * 1. GET  /api/pagenumbers/sample  - Returns 4-page academic whitepaper for Page Numbering testing
 * 2. POST /api/pagenumbers/preview - Returns preview formatted page numbers text and calculated anchor position
 * 3. POST /api/pagenumbers/apply   - Stamps page numbers across document pages
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PageNumbersOps } from '../../src/core/engine/operations/pagenumbers-ops.js';

export async function handlePageNumbersRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/pagenumbers/sample
  if (actualPath === '/api/pagenumbers/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await PageNumbersOps.createSamplePageNumbersPdf();
      const buffer = Buffer.from(sampleBytes);
      const isPdfReq = urlObj.searchParams?.get('format') === 'pdf' || (req.headers && ((req.headers.accept && req.headers.accept.includes('application/pdf')) || req.headers['content-type'] === 'application/pdf'));
      if (isPdfReq) {
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': String(buffer.length),
          'Content-Disposition': 'attachment; filename="sample_pagenumbers_doc.pdf"'
        });
        res.end(buffer);
        return true;
      }
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        pageCount: 4,
        filename: 'sample_pagenumbers_doc.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/pagenumbers/preview
  if (actualPath === '/api/pagenumbers/preview' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const format = body.format || body.formatTemplate || 'Page {n} of {total}';
      const style = body.style || 'arabic';
      const num = parseInt(body.number || body.pageNumber || body.firstNumber || 1, 10) || 1;
      const total = parseInt(body.total || body.totalPages || body.pageCount || 4, 10) || 4;
      const position = body.position || body.pos || 'bottom-center';
      const pageW = Number(body.width || 595.28);
      const pageH = Number(body.height || 841.89);
      const fontSize = Number(body.fontSize || 10);

      const formatted = PageNumbersOps.formatNumber(num, total, format, style, {
        fileName: body.fileName || 'Document.pdf'
      });

      const approxWidth = formatted.length * fontSize * 0.55;
      const pos = PageNumbersOps.calculatePosition(position, pageW, pageH, approxWidth, fontSize, {
        top: body.marginTop ?? 28,
        bottom: body.marginBottom ?? 24,
        left: body.marginLeft ?? 36,
        right: body.marginRight ?? 36
      });

      return sendJson(res, 200, {
        success: true,
        formatted,
        previewText: formatted,
        position,
        coordinates: pos,
        format,
        style,
        anchor: position
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/pagenumbers/apply
  if (actualPath === '/api/pagenumbers/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64 || body.fileData || body.pdf;
      const config = body.config || body.options || body;
      const context = body.context || body.meta || {};

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const updatedBytes = await PageNumbersOps.applyPageNumbers(inBuffer, config, context);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        appliedCount: updatedBytes.appliedCount ?? updatedBytes.report?.appliedCount ?? 0,
        totalPages: updatedBytes.totalPages ?? updatedBytes.report?.totalPages ?? 0,
        startFormatted: updatedBytes.report?.startFormatted,
        endFormatted: updatedBytes.report?.endFormatted,
        report: updatedBytes.report
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
