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
  // 1. Create a new multi-signer signature request: POST /api/signatures/request
  if (pathname === '/api/signatures/request' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const {
        title = 'Untitled Document',
        documentName = 'Document.pdf',
        documentBase64 = null,
        recipients = [],
        fields = [],
        senderName = 'Document Owner',
        senderEmail = 'owner@letsedit.dev'
      } = body;

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
        token: 'sign_tok_' + crypto.randomBytes(12).toString('hex'),
        status: 'pending', // 'pending' | 'viewed' | 'signed'
        signedAt: null,
        ipAddress: null,
        userAgent: null
      }));

      // Validate fields and assign unique IDs if missing
      const enrichedFields = fields.map((f, idx) => ({
        id: f.id || `fld_${idx + 1}`,
        recipientEmail: (f.recipientEmail || enrichedRecipients[0]?.email || '').trim().toLowerCase(),
        type: f.type || 'signature', // 'signature' | 'initials' | 'date' | 'text' | 'checkbox'
        page: parseInt(f.page !== undefined ? f.page : 0, 10),
        x: parseFloat(f.x) || 100,
        y: parseFloat(f.y) || 100,
        width: parseFloat(f.width) || (f.type === 'signature' ? 140 : f.type === 'checkbox' ? 24 : 100),
        height: parseFloat(f.height) || (f.type === 'signature' ? 50 : f.type === 'checkbox' ? 24 : 28),
        required: f.required !== false,
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
            details: `Signature request initiated with ${enrichedRecipients.length} recipients and ${enrichedFields.length} fields.`
          }
        ]
      };

      SIGNATURE_REQUESTS.set(requestId, record);

      return sendJson(res, 201, {
        success: true,
        requestId,
        transactionId,
        status: record.status,
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

  // 2. Query signature request details: GET /api/signatures/request/:id
  const matchGetReq = pathname.match(/^\/api\/signatures\/request\/([a-zA-Z0-9_-]+)$/);
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

  // 3. Recipient token query: GET /api/signatures/recipient/:token
  const matchRecQuery = pathname.match(/^\/api\/signatures\/recipient\/([a-zA-Z0-9_-]+)$/);
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
      recipient: {
        id: currentRecipient.id,
        name: currentRecipient.name,
        email: currentRecipient.email,
        status: currentRecipient.status,
        color: currentRecipient.color
      },
      fields: recipientFields,
      documentBase64: foundRecord.documentBase64
    });
  }

  // 4. Recipient signature submission: POST /api/signatures/recipient/:token/submit
  const matchRecSubmit = pathname.match(/^\/api\/signatures\/recipient\/([a-zA-Z0-9_-]+)\/submit$/);
  if (matchRecSubmit && method === 'POST') {
    try {
      const token = matchRecSubmit[1];
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

      const body = await parseJsonBody(req);
      const { fieldValues = {} } = body;
      const now = new Date().toISOString();

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

      // Check if all signers have signed
      const allSigned = foundRecord.recipients.every(r => r.status === 'signed');
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

  // 5. Download finalized signed document: GET /api/signatures/request/:id/download
  const matchDownload = pathname.match(/^\/api\/signatures\/request\/([a-zA-Z0-9_-]+)\/download$/);
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
