/**
 * Hardware & Camera Ink Scanner API Routes
 * Conforms to Phase 5 Task 5.2 Specification.
 * Handles Otsu dynamic binarization, illumination leveling, and transparent PNG signature isolation.
 */

import { parseJsonBody, sendJson } from '../db.js';
import { InkScannerOps } from '../../src/core/engine/operations/ink-scanner-ops.js';

export async function handleInkScannerRequest(req, res, pathname, method) {
  // 1. GET /api/ink-scanner/sample — returns synthetic paper signature sample
  if (pathname === '/api/ink-scanner/sample' && method === 'GET') {
    try {
      const sample = await InkScannerOps.createSampleInkCapture(400, 160);
      const isJson = req.headers['accept']?.includes('application/json');

      if (isJson) {
        return sendJson(res, 200, {
          success: true,
          width: sample.width,
          height: sample.height,
          dataUrl: sample.dataUrl,
          pngBase64: Buffer.from(sample.pngBytes).toString('base64')
        });
      }

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="sample_signature_photo.png"',
        'Content-Length': sample.pngBytes.length
      });
      res.end(Buffer.from(sample.pngBytes));
      return true;
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/ink-scanner/process — processes raw image and returns clean transparent PNG
  if (pathname === '/api/ink-scanner/process' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const {
        imageBase64 = null,
        threshold = undefined,
        thresholdOffset = 0,
        color = '#1a365d',
        smoothing = true,
        normalizeIllum = true,
        width = 400,
        height = 160
      } = body;

      let imageInput = null;
      if (imageBase64) {
        // Decode base64 to Uint8Array
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const buf = Buffer.from(cleanBase64, 'base64');
        imageInput = new Uint8Array(buf);
      }

      const result = await InkScannerOps.processInkImage(imageInput, {
        threshold,
        thresholdOffset,
        color,
        smoothing,
        normalizeIllum,
        width,
        height
      });

      return sendJson(res, 200, {
        success: true,
        width: result.width,
        height: result.height,
        otsuThreshold: result.otsuThreshold,
        effectiveThreshold: result.effectiveThreshold,
        inkColor: result.inkColor,
        dataUrl: result.dataUrl,
        pngBase64: Buffer.from(result.pngBytes).toString('base64')
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
