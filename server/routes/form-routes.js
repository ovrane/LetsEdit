/**
 * Forms Backend API Routes
 * Conforms to Adobe Acrobat & Sejda Form Filler specifications:
 * 1. POST /api/forms/inspect      - Extract AcroForm field definitions, types & coordinates
 * 2. POST /api/forms/fill         - Populate fields with validation and optional vector flattening
 * 3. POST /api/forms/export-data  - Export form data to XFDF, FDF, JSON, or CSV
 * 4. POST /api/forms/import-data  - Ingest XFDF, FDF, JSON, or CSV data into target PDF
 * 5. GET  /api/forms/sample       - Deliver official sample fillable AcroForm PDF
 */

import { parseJsonBody, sendJson } from '../db.js';
import { FormOps } from '../../src/core/engine/operations/form-ops.js';

export async function handleFormRequest(req, res, pathname, method) {
  // 1. GET /api/forms/sample - Deliver sample fillable PDF
  if (pathname === '/api/forms/sample' && method === 'GET') {
    try {
      const bytes = await FormOps.createSampleFillableFormPdf();
      const buffer = Buffer.from(bytes);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Sample_Application_Form.pdf"',
        'Content-Length': buffer.length
      });
      res.end(buffer);
      return true;
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/forms/inspect - Inspect AcroForm fields
  if (pathname === '/api/forms/inspect' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { pdfBase64 } = body;
      if (!pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 payload.' });
      }

      const buffer = Buffer.from(pdfBase64, 'base64');
      const inspection = await FormOps.inspectFormFields(buffer);

      return sendJson(res, 200, {
        success: true,
        ...inspection
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. POST /api/forms/fill - Populate form fields
  if (pathname === '/api/forms/fill' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { pdfBase64, fields = {}, flatten = false } = body;
      if (!pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 payload.' });
      }

      const inBuffer = Buffer.from(pdfBase64, 'base64');
      const filledBytes = await FormOps.fillFormFields(inBuffer, fields, { flatten });
      const outBuffer = Buffer.from(filledBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length,
        fieldCount: Object.keys(fields).length,
        flattened: Boolean(flatten)
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 4. POST /api/forms/export-data - Export form fields to XFDF, FDF, JSON, CSV
  if (pathname === '/api/forms/export-data' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { pdfBase64, format = 'json' } = body;
      if (!pdfBase64) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 payload.' });
      }

      const inBuffer = Buffer.from(pdfBase64, 'base64');
      const exportResult = await FormOps.exportFormData(inBuffer, format);

      return sendJson(res, 200, {
        success: true,
        ...exportResult
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 5. POST /api/forms/import-data - Ingest XFDF, FDF, JSON, CSV into PDF
  if (pathname === '/api/forms/import-data' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { pdfBase64, dataContent, format = 'auto' } = body;
      if (!pdfBase64 || !dataContent) {
        return sendJson(res, 400, { success: false, error: 'Missing pdfBase64 or dataContent payload.' });
      }

      const inBuffer = Buffer.from(pdfBase64, 'base64');
      const filledBytes = await FormOps.importFormData(inBuffer, dataContent, format);
      const outBuffer = Buffer.from(filledBytes);

      return sendJson(res, 200, {
        success: true,
        pdfBase64: outBuffer.toString('base64'),
        size: outBuffer.length
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return false;
}
