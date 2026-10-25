/**
 * Adobe Acrobat Pro Legal Production Bates Numbering API Routes
 * Endpoints:
 * 1. GET  /api/bates/sample  - Returns 4-page sample legal brief for Bates testing
 * 2. POST /api/bates/preview - Returns preview bates stamp format and calculated anchor position
 * 3. POST /api/bates/apply   - Stamps Bates numbers sequentially across document pages
 * 4. POST /api/bates/batch   - Stamps multi-document batch sequentially
 */

import { parseJsonBody, sendJson } from '../db.js';
import { PDFDocument } from 'pdf-lib';
import { BatesOps } from '../../src/core/engine/operations/bates-ops.js';

export async function handleBatesRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/bates/sample
  if (actualPath === '/api/bates/sample' && actualMethod === 'GET') {
    try {
      const sampleBytes = await BatesOps.createSampleBatesPdf();
      const buffer = Buffer.from(sampleBytes);
      const acceptsPdf = req.headers && ((req.headers.accept && req.headers.accept.includes('application/pdf')) || req.headers['content-type'] === 'application/pdf');
      if (acceptsPdf) {
        res.writeHead(200, {
          'content-type': 'application/pdf',
          'content-length': String(buffer.length),
          'content-disposition': 'attachment; filename="sample_bates_brief.pdf"'
        });
        res.end(buffer);
        return true;
      }
      return sendJson(res, 200, {
        success: true,
        pdfBase64: buffer.toString('base64'),
        size: buffer.length,
        filename: 'sample_bates_brief.pdf'
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/bates/preview
  if (actualPath === '/api/bates/preview' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const prefix = body.prefix ?? 'CASE-';
      const suffix = body.suffix ?? '';
      const startNum = parseInt(body.startNumber ?? body.start ?? 1, 10) || 1;
      const digits = Math.max(1, Math.min(12, parseInt(body.digits ?? 6, 10) || 6));
      const position = body.position || body.pos || 'bottom-right';
      const pageW = Number(body.width || 595.28);
      const pageH = Number(body.height || 841.89);
      const fontSize = Number(body.fontSize || 10);

      const formattedStamp = BatesOps.formatBatesStamp(startNum, digits, prefix, suffix, {
        fileName: body.fileName || 'Document.pdf',
        caseNo: body.caseNo || 'CASE-2026'
      });

      // Rough width approximation for preview coordinate calculation (0.6 * fontSize * chars)
      const approxWidth = formattedStamp.length * fontSize * 0.6;
      const pos = BatesOps.calculatePosition(position, pageW, pageH, approxWidth, fontSize, {
        top: body.marginTop ?? 28,
        bottom: body.marginBottom ?? 24,
        left: body.marginLeft ?? 36,
        right: body.marginRight ?? 36
      });

      return sendJson(res, 200, {
        success: true,
        formattedStamp,
        position: pos,
        startNumber: startNum,
        digits,
        prefix,
        suffix,
        anchor: position
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/bates/apply
  if (actualPath === '/api/bates/apply' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const config = body.config || body.options || body;
      const context = body.context || body.meta || {};

      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const inBuffer = Buffer.from(b64, 'base64');
      const updatedBytes = await BatesOps.applyBatesNumbering(inBuffer, config, context);
      const outBuffer = Buffer.from(updatedBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        appliedCount: updatedBytes.appliedCount ?? updatedBytes.report?.appliedCount ?? 0,
        totalPages: updatedBytes.totalPages ?? updatedBytes.report?.totalPages ?? 0,
        startBates: updatedBytes.report?.startBates,
        endBates: updatedBytes.report?.endBates,
        report: updatedBytes.report
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 4. POST /api/bates/batch
  if (actualPath === '/api/bates/batch' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const rawDocs = body.documents || body.files || [];
      const commonConfig = body.config || body.options || {};

      if (!Array.isArray(rawDocs) || rawDocs.length === 0) {
        return sendJson(res, 400, { success: false, error: 'Expected non-empty documents array' });
      }

      const documents = rawDocs.map(d => ({
        name: d.name || 'document.pdf',
        bytes: Buffer.from(d.pdfBase64 || d.bytes, 'base64')
      }));

      const batchResult = await BatesOps.sequenceBatch(documents, commonConfig);

      const serializedDocs = batchResult.documents.map(d => ({
        name: d.name,
        pdfBase64: Buffer.from(d.bytes).toString('base64'),
        report: d.report
      }));

      return sendJson(res, 200, {
        success: true,
        documents: serializedDocs,
        totalStampedPages: batchResult.totalStampedPages,
        startBates: batchResult.startBates,
        endBates: batchResult.endBates,
        nextAvailableNumber: batchResult.nextAvailableNumber
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
