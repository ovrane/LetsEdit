/**
 * PDF to Image Rasterization & Batch ZIP API Routes
 * Endpoints:
 * 1. GET  /api/pdf-to-image/sample     - Returns 4-page multi-style sample document
 * 2. POST /api/pdf-to-image/render     - Renders single page to image (PNG/JPEG/WebP) with DPI
 * 3. POST /api/pdf-to-image/batch-zip  - Renders pages and packages into downloadable ZIP
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PdfToImageOps } from '../../src/core/engine/operations/pdf-to-image-ops.js';

export async function handlePdfToImageRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/pdf-to-image/sample
  if (actualPath === '/api/pdf-to-image/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await PdfToImageOps.createSampleRasterPdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_high_res_publication.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/pdf-to-image/render
  if (actualPath === '/api/pdf-to-image/render' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pdfBase64, 'base64');
      const pageNum = Number(body.pageNum || 1);
      const dpi = Number(body.dpi || 150);
      const format = body.format || 'png';
      const quality = typeof body.quality === 'number' ? body.quality : 0.92;

      const result = await PdfToImageOps.renderPageToImage(inputBuffer, pageNum, {
        dpi,
        format,
        quality,
        baseName: body.baseName || 'document'
      });

      return sendJson(res, 200, {
        success: true,
        pageNum: result.pageNum,
        totalPages: result.totalPages,
        width: result.width,
        height: result.height,
        dpi: result.dpi,
        format: result.ext,
        filename: result.filename,
        imageBase64: Buffer.from(result.bytes).toString('base64'),
        size: result.bytes.length
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/pdf-to-image/batch-zip
  if (actualPath === '/api/pdf-to-image/batch-zip' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const inputBuffer = Buffer.from(body.pdfBase64, 'base64');
      const dpi = Number(body.dpi || 150);
      const format = body.format || 'png';
      const pageRange = body.pageRange || 'all';

      const result = await PdfToImageOps.renderPagesToZip(inputBuffer, {
        dpi,
        format,
        pageRange,
        baseName: body.baseName || 'document'
      });

      return sendJson(res, 200, {
        success: true,
        totalImages: result.totalImages,
        zipFilename: result.zipFilename,
        dpi: result.dpi,
        format: result.format,
        images: result.images,
        zipBase64: Buffer.from(result.zipBytes).toString('base64'),
        size: result.zipBytes.length
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
