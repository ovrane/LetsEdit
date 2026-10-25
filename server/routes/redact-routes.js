/**
 * Adobe Acrobat Pro & iLovePDF Permanent Vector Redaction API Routes
 * Endpoints:
 * 1. GET  /api/redact/sample  - Returns 3-page PII test document with mock SSNs, cards, and keys
 * 2. POST /api/redact/search  - Discovers sensitive terms and PII occurrences across pages
 * 3. POST /api/redact/apply   - Permanently purges content streams and burns opaque redactions
 */

import { parseJsonBody, sendJson } from '../db.js';
import { RedactOps } from '../../src/core/engine/operations/redact-ops.js';

export async function handleRedactRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/redact/sample
  if (actualPath === '/api/redact/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await RedactOps.createSampleRedactPdf();
      const buffer = Buffer.from(sampleBytes);
      const isPdfReq = urlObj.searchParams?.get('format') === 'pdf' || (req.headers && ((req.headers.accept && req.headers.accept.includes('application/pdf')) || req.headers['content-type'] === 'application/pdf'));

      if (isPdfReq) {
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': String(buffer.length),
          'Content-Disposition': 'attachment; filename="sample_pii_discovery.pdf"'
        });
        res.end(buffer);
        return true;
      }

      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        pageCount: 3,
        filename: 'sample_pii_discovery.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/redact/search
  if (actualPath === '/api/redact/search' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64 || body.fileData || body.pdf;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const searchOptions = body.options || body.config || body;
      const searchRes = await RedactOps.searchSensitiveData(inBuffer, searchOptions);

      return sendJson(res, 200, {
        success: true,
        ...searchRes
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/redact/apply
  if (actualPath === '/api/redact/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64 || body.fileData || body.pdf;
      const options = body.options || body.config || body;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const updatedBytes = await RedactOps.applyRedaction(inBuffer, options);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        report: updatedBytes.report || updatedBytes.lastRedactResult
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
