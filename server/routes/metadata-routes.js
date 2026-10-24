/**
 * PDF Metadata & Adobe XMP API Routes
 * Reverse-engineered from Adobe Acrobat Pro & Sejda Metadata editor specifications:
 * 1. GET  /api/metadata/sample   - Returns a pre-populated test PDF with rich metadata & XMP
 * 2. POST /api/metadata/inspect  - Deep inspection of Info dictionary, XMP packet, and properties
 * 3. POST /api/metadata/update   - Updates Info dictionary and injects ISO 16684-1 Adobe XMP stream
 * 4. POST /api/metadata/strip    - 1-Click privacy wipe of all metadata identifiers and XMP streams
 */

import { parseJsonBody, sendJson } from '../db.js';
import { MetadataOps } from '../../src/core/engine/operations/metadata-ops.js';

export async function handleMetadataRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/metadata/sample
  if (actualPath === '/api/metadata/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await MetadataOps.createSampleMetadataPdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_metadata_document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/metadata/inspect
  if (actualPath === '/api/metadata/inspect' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const inspection = await MetadataOps.inspectMetadata(buffer);

      return sendJson(res, 200, {
        success: true,
        inspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/metadata/update
  if (actualPath === '/api/metadata/update' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const { metadata = {}, options = {} } = body;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const updatedBytes = await MetadataOps.updateMetadata(buffer, metadata, options);
      const outBuffer = Buffer.from(updatedBytes);

      // Re-inspect updated result
      const reInspection = await MetadataOps.inspectMetadata(outBuffer);

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

  // 4. POST /api/metadata/strip
  if (actualPath === '/api/metadata/strip' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const sanitizedBytes = await MetadataOps.stripMetadata(buffer);
      const outBuffer = Buffer.from(sanitizedBytes);

      const reInspection = await MetadataOps.inspectMetadata(outBuffer);

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
