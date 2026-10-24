/**
 * Advanced PDF Repair & Structure Diagnostic Backend Routes
 * Conforms to iLovePDF Repair & Sejda PDF Recovery specifications:
 * 1. GET  /api/repair/sample-corrupt - Delivers synthetically corrupted PDF for 1-click testing
 * 2. POST /api/repair/diagnose       - Byte-level static structure inspection & anomaly audit
 * 3. POST /api/repair/execute        - Multi-tier recovery & xref re-serialization
 */

import { parseJsonBody, sendJson } from '../db.js';
import { RepairOps } from '../../src/core/engine/operations/repair-ops.js';

export async function handleRepairRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  // 1. GET /api/repair/sample-corrupt - Deliver synthetically damaged PDF
  if (actualPath === '/api/repair/sample-corrupt' && actualMethod === 'GET') {
    try {
      const corruptBytes = await RepairOps.createCorruptTestPdf();
      const buffer = Buffer.from(corruptBytes);

      const wantsJson = (req.headers && (
        (req.headers.accept && req.headers.accept.includes('application/json')) ||
        (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))
      )) || urlObj.searchParams?.get('format') === 'json';

      if (wantsJson) {
        return sendJson(res, 200, {
          success: true,
          corruptedBase64: buffer.toString('base64'),
          diagnostic: RepairOps.diagnosePdf(buffer)
        });
      }

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Corrupted_Sample_Document.pdf"',
        'Content-Length': buffer.length
      });
      res.end(buffer);
      return true;
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/repair/diagnose - Static anomaly inspection
  if (actualPath === '/api/repair/diagnose' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const diagnostic = RepairOps.diagnosePdf(buffer);

      return sendJson(res, 200, {
        success: true,
        diagnostic,
        ...diagnostic
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/repair/execute - Multi-tier PDF reconstruction
  if (actualPath === '/api/repair/execute' && actualMethod === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const b64 = body.pdfBase64 || body.fileBase64;
      const options = body.options || {};
      if (!b64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 / fileBase64 payload.' });
      }

      const buffer = Buffer.from(b64, 'base64');
      const repairResult = await RepairOps.repairPdfAdvanced(buffer, options);
      const outBuffer = Buffer.from(repairResult.pdfBytes);
      const outBase64 = outBuffer.toString('base64');

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBase64,
        repairedPdfBase64: outBase64,
        size: outBuffer.length,
        pageCount: repairResult.pageCount,
        recoveredPages: repairResult.pageCount,
        recoveredObjects: repairResult.recoveredObjects,
        anomaliesFixed: repairResult.anomaliesFixed,
        auditLog: repairResult.diagnosticLog,
        diagnosticLog: repairResult.diagnosticLog,
        diagnostic: repairResult.diagnostic
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
