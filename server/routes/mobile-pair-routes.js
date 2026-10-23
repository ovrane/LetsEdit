/**
 * Mobile Camera & Touch Signature Pairing Routes
 * Enables real-time synchronization between desktop PDF editor
 * and mobile devices via QR code scan (camera capture & touch signature).
 */

import crypto from 'node:crypto';
import { parseJsonBody, sendJson } from '../db.js';

// In-memory pairing sessions map
export const PAIRING_SESSIONS = new Map();

// Session expiry time: 20 minutes
const SESSION_TTL_MS = 20 * 60 * 1000;

// Periodic cleanup of expired pairing sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of PAIRING_SESSIONS.entries()) {
    if (now > session.expiresAt) {
      PAIRING_SESSIONS.delete(id);
    }
  }
}, 60 * 1000);

export async function handleMobilePairRequest(req, res, pathname, method) {
  // 1. Create a new pairing session
  if (pathname === '/api/mobile-pair/session' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const action = body.action || 'camera'; // 'camera' | 'sign' | 'upload'
      const sessionId = 'pair_' + crypto.randomBytes(8).toString('hex');
      const now = Date.now();

      const session = {
        id: sessionId,
        action,
        status: 'waiting', // 'waiting' | 'connected' | 'completed' | 'expired'
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS,
        payload: null
      };

      PAIRING_SESSIONS.set(sessionId, session);

      return sendJson(res, 201, {
        success: true,
        sessionId,
        action,
        expiresAt: session.expiresAt
      });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // 2. Query session status (Desktop long-poll / poll)
  if (pathname.startsWith('/api/mobile-pair/session/') && method === 'GET') {
    const sessionId = pathname.replace('/api/mobile-pair/session/', '').trim();
    const session = PAIRING_SESSIONS.get(sessionId);

    if (!session) {
      return sendJson(res, 404, { success: false, error: 'Pairing session not found or expired' });
    }

    if (Date.now() > session.expiresAt) {
      PAIRING_SESSIONS.delete(sessionId);
      return sendJson(res, 410, { success: false, error: 'Pairing session expired' });
    }

    return sendJson(res, 200, {
      success: true,
      sessionId: session.id,
      action: session.action,
      status: session.status,
      payload: session.payload,
      expiresAt: session.expiresAt
    });
  }

  // 3. Mobile Device Connects to Session
  if (pathname.startsWith('/api/mobile-pair/connect/') && method === 'POST') {
    const sessionId = pathname.replace('/api/mobile-pair/connect/', '').trim();
    const session = PAIRING_SESSIONS.get(sessionId);

    if (!session) {
      return sendJson(res, 404, { success: false, error: 'Session not found' });
    }

    if (Date.now() > session.expiresAt) {
      PAIRING_SESSIONS.delete(sessionId);
      return sendJson(res, 410, { success: false, error: 'Session expired' });
    }

    if (session.status === 'waiting') {
      session.status = 'connected';
    }

    return sendJson(res, 200, {
      success: true,
      sessionId: session.id,
      action: session.action,
      status: session.status
    });
  }

  // 4. Mobile Device Submits Captured Photo or Touch Signature
  if (pathname.startsWith('/api/mobile-pair/submit/') && method === 'POST') {
    const sessionId = pathname.replace('/api/mobile-pair/submit/', '').trim();
    const session = PAIRING_SESSIONS.get(sessionId);

    if (!session) {
      return sendJson(res, 404, { success: false, error: 'Session not found' });
    }

    if (Date.now() > session.expiresAt) {
      PAIRING_SESSIONS.delete(sessionId);
      return sendJson(res, 410, { success: false, error: 'Session expired' });
    }

    try {
      const body = await parseJsonBody(req);
      if (!body.imageBase64 && !body.dataUrl) {
        return sendJson(res, 400, { success: false, error: 'No image data provided' });
      }

      session.status = 'completed';
      session.payload = {
        dataUrl: body.dataUrl || body.imageBase64,
        filename: body.filename || (session.action === 'sign' ? 'mobile_signature.png' : 'mobile_scan.jpg'),
        mimeType: body.mimeType || (session.action === 'sign' ? 'image/png' : 'image/jpeg'),
        width: body.width || null,
        height: body.height || null,
        receivedAt: Date.now()
      };

      return sendJson(res, 200, {
        success: true,
        message: 'Payload successfully received by desktop session'
      });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  return false;
}
