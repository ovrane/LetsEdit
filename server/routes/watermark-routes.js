/**
 * Adobe Acrobat Pro & iLovePDF Dynamic Watermark API Routes
 * Endpoints:
 * 1. GET  /api/watermark/sample  - Returns 4-page sample document for watermark testing
 * 2. POST /api/watermark/preview - Returns macro-interpolated preview text and calculated anchor points
 * 3. POST /api/watermark/apply   - Stamps text or image watermark onto PDF and returns base64 PDF
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PDFDocument } from 'pdf-lib';
import { WatermarkOps } from '../../src/core/engine/operations/watermark-ops.js';

export async function handleWatermarkRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/watermark/sample
  if (actualPath === '/api/watermark/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
      const buffer = Buffer.from(sampleBytes);
      const acceptsPdf = req.headers && ((req.headers.accept && req.headers.accept.includes('application/pdf')) || req.headers['content-type'] === 'application/pdf');
      if (acceptsPdf) {
        res.writeHead(200, {
          'content-type': 'application/pdf',
          'content-length': String(buffer.length),
          'content-disposition': 'attachment; filename="sample_watermark_document.pdf"'
        });
        res.end(buffer);
        return true;
      }
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_watermark_document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/watermark/preview
  if (actualPath === '/api/watermark/preview' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const textRaw = body.text || 'CONFIDENTIAL';
      const anchor = body.anchor || body.position || 'center';

      let totalPages = Number(body.totalPages || 4);
      let pageW = Number(body.width || 595.28);
      let pageH = Number(body.height || 841.89);
      const pagesMeta = [];

      if (body.pdfBase64) {
        const doc = await PDFDocument.load(Buffer.from(body.pdfBase64, 'base64'));
        totalPages = doc.getPageCount();
        for (let i = 0; i < totalPages; i++) {
          const sz = doc.getPage(i).getSize();
          pagesMeta.push({ pageIndex: i, pageNumber: i + 1, width: sz.width, height: sz.height });
        }
        if (pagesMeta[0]) {
          pageW = pagesMeta[0].width;
          pageH = pagesMeta[0].height;
        }
      }

      const interpolated = WatermarkOps.interpolateMacros(textRaw, {
        pageNumber: Number(body.pageNumber || 1),
        totalPages,
        fileName: body.fileName || 'document.pdf',
        title: body.title || 'Document'
      });

      const pos = WatermarkOps.calculateAnchorPosition(anchor, pageW, pageH, 0, 0, body.offsetX, body.offsetY);

      return sendJson(res, 200, {
        success: true,
        totalPages,
        pages: pagesMeta,
        originalText: textRaw,
        interpolatedText: interpolated,
        anchor,
        position: pos,
        rotation: Number(body.rotation ?? 45),
        opacity: Number(body.opacity ?? 0.3)
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/watermark/apply
  if (actualPath === '/api/watermark/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const config = body.config || body.options || body;
      const options = body.meta || {};

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const updatedBytes = await WatermarkOps.applyWatermark(inBuffer, config, options);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        appliedCount: updatedBytes.appliedCount ?? updatedBytes.report?.appliedCount ?? 0,
        totalPages: updatedBytes.totalPages ?? updatedBytes.report?.totalPages ?? 0,
        watermarkMode: updatedBytes.watermarkMode ?? 'text',
        report: updatedBytes.report
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
