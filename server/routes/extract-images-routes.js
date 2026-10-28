/**
 * PDF Embedded Image Extraction API Routes
 * Endpoints:
 * 1. GET  /api/extract-images/sample  - Returns multi-image sample PDF
 * 2. POST /api/extract-images/analyze - Inventories all embedded images without extracting bytes
 * 3. POST /api/extract-images/extract - Extracts images, deduplicates, and returns ZIP archive base64
 */

import { parseJsonBody, sendJson } from '../db.js';
import { ExtractImagesOps } from '../../src/core/engine/operations/extract-images-ops.js';

export async function handleExtractImagesRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/extract-images/sample
  if (actualPath === '/api/extract-images/sample' && actualMethod === 'GET') {
    try {
      const pdfBytes = await ExtractImagesOps.createSampleMultiImagePdf();
      const buffer = Buffer.from(pdfBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_embedded_images.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/extract-images/analyze
  if (actualPath === '/api/extract-images/analyze' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }
      const buffer = Buffer.from(body.pdfBase64, 'base64');
      const analysis = await ExtractImagesOps.analyzeImages(buffer);
      return sendJson(res, 200, {
        success: true,
        analysis
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/extract-images/extract
  if (actualPath === '/api/extract-images/extract' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'pdfBase64 is required' });
      }

      const buffer = Buffer.from(body.pdfBase64, 'base64');
      const minWidth = typeof body.minWidth === 'number' ? body.minWidth : 0;
      const minHeight = typeof body.minHeight === 'number' ? body.minHeight : 0;
      const deduplicate = body.deduplicate !== false;
      const targetFormat = body.targetFormat || 'all';

      const result = await ExtractImagesOps.extractImages(buffer, {
        minWidth,
        minHeight,
        deduplicate,
        targetFormat
      });

      const zipBuffer = Buffer.from(result.zipBytes);
      return sendJson(res, 200, {
        success: true,
        report: result.report,
        images: result.images,
        manifest: result.manifest,
        zipBase64: zipBuffer.toString('base64'),
        size: zipBuffer.length,
        filename: 'Extracted_Images.zip'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
