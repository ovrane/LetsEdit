/**
 * Advanced Merge & Split API Routes
 * Conforms to Sejda & Adobe Acrobat Advanced Merge & Split specifications:
 * 1. POST /api/merge/advanced   - Multi-document merge with TOC, bookmarks, and cover page
 * 2. POST /api/split/by-text    - Split by keyword occurrence or regex value change
 * 3. POST /api/split/by-bookmarks - Split by PDF bookmark/outline chapter structure
 */

import { parseJsonBody, sendJson } from '../db.js';
import { MergeOps } from '../../src/core/engine/operations/merge-ops.js';
import { SplitOps } from '../../src/core/engine/operations/split-ops.js';

export async function handleSplitMergeRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. POST /api/merge/advanced
  if (actualPath === '/api/merge/advanced' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { files, options = {} } = body;

      if (!Array.isArray(files) || files.length === 0) {
        return sendJson(res, 400, { success: false, error: 'Missing or empty files array.' });
      }

      const fileList = files.map((f, idx) => ({
        name: f.name || `Document_${idx + 1}.pdf`,
        bytes: Buffer.from(f.base64 || f.fileBase64 || '', 'base64')
      }));

      const mergedBytes = await MergeOps.mergePdfAdvanced(fileList, options);
      const outBuffer = Buffer.from(mergedBytes);

      return sendJson(res, 200, {
        success: true,
        mergedPdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/split/by-text
  if (actualPath === '/api/split/by-text' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const { keyword, mode = 'contains', filenamePattern = '[text]_[n].pdf' } = body;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const results = await SplitOps.splitByText(buffer, { keyword, mode, filenamePattern });

      const splits = results.map(r => ({
        name: r.name,
        pdfBase64: Buffer.from(r.bytes).toString('base64'),
        pageCount: r.pageCount,
        pages: r.pages,
        matchedValue: r.matchedValue
      }));

      return sendJson(res, 200, {
        success: true,
        splits,
        totalSplits: splits.length
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/split/by-bookmarks
  if (actualPath === '/api/split/by-bookmarks' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const results = await SplitOps.splitByBookmarks(buffer);

      const splits = results.map(r => ({
        name: r.name,
        title: r.title,
        pdfBase64: Buffer.from(r.bytes).toString('base64'),
        pageCount: r.pageCount,
        pages: r.pages
      }));

      return sendJson(res, 200, {
        success: true,
        splits,
        totalSplits: splits.length
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
