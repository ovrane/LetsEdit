/**
 * Advanced Multi-Zone Header & Footer API Routes
 * Reverse-engineered from Adobe Acrobat Pro specifications:
 * 1. GET  /api/header-footer/sample   - Returns 4-page sample document for header/footer testing
 * 2. POST /api/header-footer/apply    - Applies 6-zone dynamic headers & footers with macro interpolation
 * 3. POST /api/header-footer/preview  - Returns macro interpolation previews for given strings
 */

import { parseJsonBody, sendJson } from '../db.js';
import { HeaderFooterOps } from '../../src/core/engine/operations/header-footer-ops.js';

export async function handleHeaderFooterRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/header-footer/sample
  if (actualPath === '/api/header-footer/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await HeaderFooterOps.createSampleHeaderFooterPdf();
      const buffer = Buffer.from(sampleBytes);
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_header_footer_document.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/header-footer/preview
  if (actualPath === '/api/header-footer/preview' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { template = '', config = null, context = {} } = body;

      if (config && typeof config === 'object') {
        const preview = {
          leftHeader: HeaderFooterOps.interpolateMacros(config.leftHeader || '', context),
          centerHeader: HeaderFooterOps.interpolateMacros(config.centerHeader || '', context),
          rightHeader: HeaderFooterOps.interpolateMacros(config.rightHeader || '', context),
          leftFooter: HeaderFooterOps.interpolateMacros(config.leftFooter || '', context),
          centerFooter: HeaderFooterOps.interpolateMacros(config.centerFooter || '', context),
          rightFooter: HeaderFooterOps.interpolateMacros(config.rightFooter || '', context)
        };
        return sendJson(res, 200, {
          success: true,
          preview,
          context
        });
      }

      const interpolated = HeaderFooterOps.interpolateMacros(template, context);

      return sendJson(res, 200, {
        success: true,
        template,
        result: interpolated
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/header-footer/apply
  if (actualPath === '/api/header-footer/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const config = body.config || body.options || {};
      const options = body.meta || {};

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const updatedBytes = await HeaderFooterOps.applyHeaderFooter(buffer, config, options);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        appliedCount: updatedBytes.appliedCount ?? updatedBytes.report?.appliedCount ?? 0,
        totalPages: updatedBytes.totalPages ?? updatedBytes.report?.totalPages ?? 0,
        report: updatedBytes.report
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
