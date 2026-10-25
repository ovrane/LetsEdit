/**
 * Adobe Acrobat Pro & iLovePDF Document Flattening API Routes
 * Endpoints:
 * 1. GET  /api/flatten/sample  - Returns 3-page corporate fillable form PDF
 * 2. POST /api/flatten/inspect - Analyzes interactive AcroForm fields and annotations
 * 3. POST /api/flatten/apply   - Permanently bakes form fields and annotations into static vectors
 */

import { parseJsonBody, sendJson } from '../db.js';
import { FlattenOps } from '../../src/core/engine/operations/flatten-ops.js';

export async function handleFlattenRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/flatten/sample
  if (actualPath === '/api/flatten/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await FlattenOps.createSampleFlattenPdf();
      const buffer = Buffer.from(sampleBytes);
      const isPdfReq = urlObj.searchParams?.get('format') === 'pdf' || (req.headers && ((req.headers.accept && req.headers.accept.includes('application/pdf')) || req.headers['content-type'] === 'application/pdf'));

      if (isPdfReq) {
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': String(buffer.length),
          'Content-Disposition': 'attachment; filename="sample_corporate_form.pdf"'
        });
        res.end(buffer);
        return true;
      }

      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        fieldCount: 9,
        pageCount: 3,
        filename: 'sample_corporate_form.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/flatten/inspect
  if (actualPath === '/api/flatten/inspect' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64 || body.fileData || body.pdf;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const inspection = await FlattenOps.inspectFlattenTargets(inBuffer);

      return sendJson(res, 200, {
        success: true,
        ...inspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/flatten/apply
  if (actualPath === '/api/flatten/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64 || body.fileData || body.pdf;
      const options = body.options || body.config || body;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const updatedBytes = await FlattenOps.flattenPdf(inBuffer, options);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        report: updatedBytes.report || updatedBytes.lastFlattenResult,
        fieldsFlattened: updatedBytes.fieldsFlattened,
        annotationsFlattened: updatedBytes.annotationsFlattened
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
