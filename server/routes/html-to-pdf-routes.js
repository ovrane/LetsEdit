/**
 * HTML5 & Markdown to PDF API Routes
 * Endpoints:
 * 1. GET  /api/html-to-pdf/sample  - Returns sample HTML & Markdown documents
 * 2. POST /api/html-to-pdf/convert - Converts HTML / Markdown string into polished vector PDF
 */

import { parseJsonBody, sendJson } from '../db.js';
import { HtmlToPdfOps } from '../../src/core/engine/operations/html-to-pdf-ops.js';

export async function handleHtmlToPdfRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/html-to-pdf/sample
  if (actualPath === '/api/html-to-pdf/sample' && actualMethod === 'GET') {
    try {
      const sampleHtml = HtmlToPdfOps.createSampleHtmlString();
      const sampleMarkdown = HtmlToPdfOps.createSampleMarkdownString();
      return sendJson(res, 200, {
        success: true,
        html: sampleHtml,
        markdown: sampleMarkdown,
        filenameHtml: 'sample_technical_whitepaper.html',
        filenameMarkdown: 'sample_specification.md'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/html-to-pdf/convert
  if (actualPath === '/api/html-to-pdf/convert' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const content = body.content || (body.contentBase64 ? Buffer.from(body.contentBase64, 'base64').toString('utf-8') : null);

      if (!content) {
        return sendJson(res, 400, { success: false, error: 'content or contentBase64 is required' });
      }

      const format = body.format || 'html'; // 'html' | 'markdown'
      const theme = body.theme || 'modern';
      const pageSize = body.pageSize || 'A4';
      const orientation = body.orientation || 'portrait';
      const title = body.title || 'Document';

      const result = await HtmlToPdfOps.convertToPdf(content, {
        format,
        theme,
        pageSize,
        orientation,
        title
      });

      const outputBuffer = Buffer.from(result.pdfBytes);

      return sendJson(res, 200, {
        success: true,
        report: result.report,
        pdfBase64: outputBuffer.toString('base64'),
        size: outputBuffer.length,
        filename: `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
