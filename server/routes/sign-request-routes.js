/**
 * Multi-Signer Signature Request & Recipient API Routes
 * Reverse-engineered from iLovePDF & Adobe Acrobat Sign workflows.
 * Handles multi-recipient signature requests, field placement manifests,
 * token-based recipient signing sessions, status tracking, and final signed PDF compilation.
 */

import crypto from 'node:crypto';
import { parseJsonBody, sendJson } from '../db.js';
import { MultiSignOps } from '../../src/core/engine/operations/multi-sign-ops.js';
import { PDFDocument } from 'pdf-lib';

// In-memory signature requests database
export const SIGNATURE_REQUESTS = new Map();

// Helper to generate secure alphanumeric IDs
function generateId(prefix = 'sigreq') {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

// Helper to generate unique legal transaction ID
function generateTxId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TRX-${dateStr}-${rand}`;
}

export async function handleSignRequest(req, res, pathname, method) {
  // 0. Sample 3-Page Contract: GET /api/signature/sample or GET /api/signatures/sample
  if ((pathname === '/api/signature/sample' || pathname === '/api/signatures/sample') && method === 'GET') {
    try {
      const pkg = await MultiSignOps.createSampleSignContractPackage();
      const isJson = req.headers['accept']?.includes('application/json');
      if (isJson) {
        return sendJson(res, 200, {
          success: true,
          title: pkg.title,
          documentName: pkg.documentName,
          recipients: pkg.recipients,
          fields: pkg.fields,
          documentBase64: Buffer.from(pkg.pdfBytes).toString('base64')
        });
      }
      const buf = Buffer.from(pkg.pdfBytes);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pkg.documentName}"`,
        'Content-Length': buf.length
      });
      res.end(buf);
      return true;
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 0b. List active signature requests: GET /api/signature/requests or GET /api/signatures/requests
  if ((pathname === '/api/signature/requests' || pathname === '/api/signatures/requests') && method === 'GET') {
    const list = Array.from(SIGNATURE_REQUESTS.values()).map(r => ({
      requestId: r.id,
      transactionId: r.transactionId,
      title: r.title,
      documentName: r.documentName,
      status: r.status,
      signingOrder: r.signingOrder || 'parallel',
      recipientCount: r.recipients.length,
      signedCount: r.recipients.filter(rec => rec.status === 'signed').length,
      createdAt: r.createdAt,
      completedAt: r.completedAt
    }));
    return sendJson(res, 200, { success: true, count: list.length, requests: list });
  }

  // 1. Create a new multi-signer signature request: POST /api/signatures/request, /api/signature/create-request, /api/signatures/create-request
  const isCreateReq = (pathname === '/api/signatures/request' || pathname === '/api/signature/create-request' || pathname === '/api/signatures/create-request') && method === 'POST';
  if (isCreateReq) {
    try {
      const body = await parseJsonBody(req);
      let {
        title = 'Untitled Document',
        documentName = 'Document.pdf',
        documentBase64 = null,
        recipients = [],
        fields = [],
        senderName = 'Document Owner',
        senderEmail = 'owner@letsedit.dev',
        signingOrder = 'parallel', // 'parallel' | 'sequential'
        useSample = false
      } = body;

      if (!documentBase64 && useSample) {
        const pkg = await MultiSignOps.createSampleSignContractPackage();
        documentBase64 = Buffer.from(pkg.pdfBytes).toString('base64');
        if (recipients.length === 0) recipients = pkg.recipients;
        if (fields.length === 0) fields = pkg.fields;
        if (title === 'Untitled Document') title = pkg.title;
        if (documentName === 'Document.pdf') documentName = pkg.documentName;
      }

      if (!documentBase64) {
        return sendJson(res, 400, { success: false, error: 'Document base64 content is required.' });
      }

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return sendJson(res, 400, { success: false, error: 'At least one recipient is required.' });
      }

      const requestId = generateId('sigreq');
      const transactionId = generateTxId();
      const now = new Date().toISOString();

      // Palette of distinct colors for recipients
      const colorPalette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

      // Assign unique signing tokens and status to each recipient
      const enrichedRecipients = recipients.map((r, idx) => ({
        id: r.id || `rec_${idx + 1}`,
        name: r.name || `Signer ${idx + 1}`,
        email: (r.email || '').trim().toLowerCase(),
        role: r.role || 'signer', // 'signer' | 'approver' | 'viewer'
        color: r.color || colorPalette[idx % colorPalette.length],
        token: MultiSignOps.generateCryptographicToken(r.id || `rec_${idx + 1}`, transactionId),
        status: 'pending', // 'pending' | 'viewed' | 'signed'
        signedAt: null,
        ipAddress: null,
        userAgent: null
      }));

      // Validate fields and assign unique IDs if missing
      const enrichedFields = fields.map((f, idx) => ({
        id: f.id || `fld_${idx + 1}`,
        recipientEmail: (f.recipientEmail || enrichedRecipients[0]?.email || '').trim().toLowerCase(),
        type: f.type || 'signature', // 'signature' | 'initials' | 'date' | 'text' | 'checkbox' | 'company'
        page: parseInt(f.page !== undefined ? f.page : 0, 10),
        x: parseFloat(f.x) || 100,
        y: parseFloat(f.y) || 100,
        width: parseFloat(f.width) || (f.type === 'signature' ? 140 : f.type === 'checkbox' ? 24 : 100),
        height: parseFloat(f.height) || (f.type === 'signature' ? 50 : f.type === 'checkbox' ? 24 : 28),
        required: f.required !== false,
        minLength: f.minLength || null,
        maxLength: f.maxLength || null,
        mask: f.mask || null,
        regex: f.regex || null,
        label: f.label || (f.type.charAt(0).toUpperCase() + f.type.slice(1)),
        value: null
      }));

      const record = {
        id: requestId,
        transactionId,
        title,
        documentName,
        documentBase64,
        senderName,
        senderEmail,
        signingOrder: signingOrder === 'sequential' ? 'sequential' : 'parallel',
        recipients: enrichedRecipients,
        fields: enrichedFields,
        status: 'pending', // 'pending' | 'partially_signed' | 'completed' | 'cancelled'
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        finalSignedBase64: null,
        auditLog: [
          {
            event: 'REQUEST_CREATED',
            timestamp: now,
            actor: `${senderName} (${senderEmail})`,
            details: `Signature request initiated with ${enrichedRecipients.length} recipients, ${enrichedFields.length} fields, and ${signingOrder} routing.`
          }
        ]
      };

      SIGNATURE_REQUESTS.set(requestId, record);

      return sendJson(res, 201, {
        success: true,
        requestId,
        transactionId,
        status: record.status,
        signingOrder: record.signingOrder,
        recipients: enrichedRecipients.map(r => ({
          name: r.name,
          email: r.email,
          token: r.token,
          signingUrl: `/sign_document?token=${r.token}`
        })),
        createdAt: now
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. Query signature request details: GET /api/signatures/request/:id or /api/signature/request/:id
  const matchGetReq = pathname.match(/^\/api\/signatures?\/request\/([a-zA-Z0-9_-]+)$/);
  if (matchGetReq && method === 'GET') {
    const reqId = matchGetReq[1];
    const record = SIGNATURE_REQUESTS.get(reqId);
    if (!record) {
      return sendJson(res, 404, { success: false, error: 'Signature request not found.' });
    }

    return sendJson(res, 200, {
      success: true,
      requestId: record.id,
      transactionId: record.transactionId,
      title: record.title,
      documentName: record.documentName,
      status: record.status,
      senderName: record.senderName,
      senderEmail: record.senderEmail,
      createdAt: record.createdAt,
      completedAt: record.completedAt,
      recipients: record.recipients.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        color: r.color,
        status: r.status,
        signedAt: r.signedAt,
        signingUrl: `/sign_document?token=${r.token}`
      })),
      fieldCount: record.fields.length,
      auditLog: record.auditLog
    });
  }

  // 3. Recipient token query: GET /api/signatures/recipient/:token, /api/signature/recipient-view/:token, /api/signatures/recipient-view/:token
  const matchRecQuery = pathname.match(/^\/api\/signatures?\/(?:recipient|recipient-view)\/([a-zA-Z0-9_-]+)$/);
  if (matchRecQuery && method === 'GET') {
    const token = matchRecQuery[1];
    let foundRecord = null;
    let currentRecipient = null;

    for (const record of SIGNATURE_REQUESTS.values()) {
      const rec = record.recipients.find(r => r.token === token);
      if (rec) {
        foundRecord = record;
        currentRecipient = rec;
        break;
      }
    }

    if (!foundRecord || !currentRecipient) {
      return sendJson(res, 404, { success: false, error: 'Invalid or expired signing token.' });
    }

    const signCheck = MultiSignOps.canRecipientSign(foundRecord, currentRecipient.email);

    // Mark recipient as viewed if pending
    if (currentRecipient.status === 'pending') {
      currentRecipient.status = 'viewed';
      foundRecord.auditLog.push({
        event: 'DOCUMENT_VIEWED',
        timestamp: new Date().toISOString(),
        actor: `${currentRecipient.name} (${currentRecipient.email})`,
        details: 'Recipient opened the document signing portal.'
      });
    }

    // Get fields assigned specifically to this recipient
    const recipientFields = foundRecord.fields
      .filter(f => f.recipientEmail === currentRecipient.email)
      .map(f => ({
        id: f.id,
        type: f.type,
        page: f.page,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        required: f.required,
        minLength: f.minLength,
        maxLength: f.maxLength,
        mask: f.mask,
        regex: f.regex,
        label: f.label,
        value: f.value
      }));

    return sendJson(res, 200, {
      success: true,
      requestId: foundRecord.id,
      transactionId: foundRecord.transactionId,
      documentName: foundRecord.documentName,
      title: foundRecord.title,
      senderName: foundRecord.senderName,
      signingOrder: foundRecord.signingOrder || 'parallel',
      canSign: signCheck.allowed,
      sequenceMessage: signCheck.error || null,
      recipient: {
        id: currentRecipient.id,
        name: currentRecipient.name,
        email: currentRecipient.email,
        status: currentRecipient.status,
        color: currentRecipient.color,
        role: currentRecipient.role
      },
      fields: recipientFields,
      documentBase64: foundRecord.documentBase64
    });
  }

  // 4. Recipient signature submission: POST /api/signatures/recipient/:token/submit, /api/signature/submit-signature, /api/signatures/submit-signature
  const matchRecSubmit = pathname.match(/^\/api\/signatures?\/(?:recipient\/([a-zA-Z0-9_-]+)\/submit|submit-signature)$/);
  if (matchRecSubmit && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const token = matchRecSubmit[1] || body.token;

      if (!token) {
        return sendJson(res, 400, { success: false, error: 'Recipient signing token is required.' });
      }

      let foundRecord = null;
      let currentRecipient = null;

      for (const record of SIGNATURE_REQUESTS.values()) {
        const rec = record.recipients.find(r => r.token === token);
        if (rec) {
          foundRecord = record;
          currentRecipient = rec;
          break;
        }
      }

      if (!foundRecord || !currentRecipient) {
        return sendJson(res, 404, { success: false, error: 'Invalid or expired signing token.' });
      }

      if (currentRecipient.status === 'signed') {
        return sendJson(res, 400, { success: false, error: 'This document has already been signed by you.' });
      }

      // Enforce sequential signing order
      const signCheck = MultiSignOps.canRecipientSign(foundRecord, currentRecipient.email);
      if (!signCheck.allowed) {
        return sendJson(res, 403, { success: false, error: signCheck.error });
      }

      const { fieldValues = {} } = body;
      const now = new Date().toISOString();

      // Validate field constraints (required, minLength, mask)
      const assignedFields = foundRecord.fields.filter(f => f.recipientEmail === currentRecipient.email);
      const valResult = MultiSignOps.validateFieldValues(assignedFields, fieldValues);
      if (!valResult.valid) {
        return sendJson(res, 400, { success: false, error: valResult.error, fieldId: valResult.fieldId });
      }

      // Populate values for assigned fields
      foundRecord.fields.forEach(f => {
        if (f.recipientEmail === currentRecipient.email && fieldValues[f.id] !== undefined) {
          f.value = fieldValues[f.id];
        }
      });

      // Update recipient record
      currentRecipient.status = 'signed';
      currentRecipient.signedAt = now;
      currentRecipient.ipAddress = req.socket?.remoteAddress || '127.0.0.1';
      currentRecipient.userAgent = req.headers['user-agent'] || 'Web Browser';

      foundRecord.auditLog.push({
        event: 'RECIPIENT_SIGNED',
        timestamp: now,
        actor: `${currentRecipient.name} (${currentRecipient.email})`,
        details: `Successfully signed and submitted all assigned fields.`
      });

      // Check if all signers and approvers have signed
      const allSigned = foundRecord.recipients.filter(r => r.role !== 'viewer').every(r => r.status === 'signed');
      if (allSigned) {
        foundRecord.status = 'completed';
        foundRecord.completedAt = now;
        foundRecord.auditLog.push({
          event: 'REQUEST_COMPLETED',
          timestamp: now,
          actor: 'LetsEdit Multi-Sign Engine',
          details: 'All recipient signatures received. Cryptographic audit trail finalized.'
        });

        // Generate the final compiled PDF with burned fields and audit trail
        try {
          const rawBuffer = Buffer.from(foundRecord.documentBase64, 'base64');
          const finalBytes = await MultiSignOps.compileCompletedDocument(rawBuffer, foundRecord);
          foundRecord.finalSignedBase64 = Buffer.from(finalBytes).toString('base64');
        } catch (burnErr) {
          console.warn('[handleSignRequest] Failed to compile final PDF immediately:', burnErr);
        }
      } else {
        foundRecord.status = 'partially_signed';
      }

      foundRecord.updatedAt = now;

      return sendJson(res, 200, {
        success: true,
        message: 'Signature submitted successfully.',
        status: foundRecord.status,
        completed: allSigned
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 5. Download finalized signed document: GET /api/signatures/request/:id/download or /api/signature/request/:id/download
  const matchDownload = pathname.match(/^\/api\/signatures?\/request\/([a-zA-Z0-9_-]+)\/download$/);
  if (matchDownload && method === 'GET') {
    const reqId = matchDownload[1];
    const record = SIGNATURE_REQUESTS.get(reqId);
    if (!record) {
      return sendJson(res, 404, { success: false, error: 'Signature request not found.' });
    }

    // If final signed document not generated yet, compile on demand
    let pdfBuffer;
    if (record.finalSignedBase64) {
      pdfBuffer = Buffer.from(record.finalSignedBase64, 'base64');
    } else {
      const rawBuffer = Buffer.from(record.documentBase64, 'base64');
      const compiled = await MultiSignOps.compileCompletedDocument(rawBuffer, record);
      pdfBuffer = Buffer.from(compiled);
      record.finalSignedBase64 = pdfBuffer.toString('base64');
    }

    const filename = `Signed_${record.documentName.replace(/\.[^/.]+$/, '')}_${record.transactionId}.pdf`;
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length
    });
    res.end(pdfBuffer);
    return true;
  }

  return false;
}
