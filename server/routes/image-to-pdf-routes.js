/**
 * Images to PDF Imposition API Routes
 * Endpoints:
 * 1. GET  /api/image-to-pdf/sample  - Returns mock image collection for testing
 * 2. POST /api/image-to-pdf/convert - Compiles image array into standardized PDF
 */

import { parseJsonBody, sendJson } from '../db.js';
import { ImageToPdfOps } from '../../src/core/engine/operations/image-to-pdf-ops.js';

export async function handleImageToPdfRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/image-to-pdf/sample
  if (actualPath === '/api/image-to-pdf/sample' && actualMethod === 'GET') {
    try {
      const sampleImages = ImageToPdfOps.createSampleImageBatch();
      return sendJson(res, 200, {
        success: true,
        count: sampleImages.length,
        images: sampleImages.map(img => ({
          name: img.name,
          width: img.width,
          height: img.height,
          size: img.size,
          bytesBase64: Buffer.from(img.bytes).toString('base64')
        }))
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/image-to-pdf/convert
  if (actualPath === '/api/image-to-pdf/convert' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
        return sendJson(res, 400, { success: false, error: 'images array is required' });
      }

      const imagesList = body.images.map((item, idx) => ({
        name: item.name || `image_${idx + 1}.png`,
        bytes: item.bytesBase64 ? Buffer.from(item.bytesBase64, 'base64') : item.bytes,
        width: Number(item.width || 800),
        height: Number(item.height || 600)
      }));

      const pageSize = body.pageSize || 'a4';
      const orientation = body.orientation || 'auto';
      const margin = body.margin || 'small';
      const layout = body.layout || '1-up';

      const result = await ImageToPdfOps.imagesToPdf(imagesList, {
        pageSize,
        orientation,
        margin,
        layout
      });

      const buffer = Buffer.from(result.pdfBytes);
      return sendJson(res, 200, {
        success: true,
        report: result.report,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'Images_Combined.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
