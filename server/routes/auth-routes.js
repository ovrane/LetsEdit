/**
 * Auth & User Management Routes (LETSEDIT_AUTH_SPECIFICATION.md)
 * Handles login, registration, SSO domain lookup, SAML URL, Google/Microsoft OAuth,
 * session verification (/users/me), profile updating, developer API keys, logout, and password recovery.
 */

import { USERS, SESSIONS, SSO_DOMAINS, parseJsonBody, sendJson, generateToken } from '../db.js';

export async function handleAuthRequest(req, res, pathname, method) {
  // 1. Health & Status Check
  if (pathname === '/api/health' && method === 'GET') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'PDF Studio Core Engine & Auth API',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // 2. Sejda Auth API: POST /users/login
  if (pathname === '/users/login' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { email, password, emailVerificationCode } = body;

      if (!email || !email.includes('@')) {
        sendJson(res, 400, { error: 'Invalid email address provided.' });
        return true;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const domain = normalizedEmail.split('@')[1];

      // Enterprise SSO domain check
      if (SSO_DOMAINS.includes(domain) && !password) {
        sendJson(res, 400, { error: 'Enterprise accounts must authenticate via SSO.' });
        return true;
      }

      // Adaptive step-up 2FA Challenge (403 Simulation)
      const requires2FA = normalizedEmail.includes('2fa') || password === 'demo' || (USERS.get(normalizedEmail)?.requires2fa);
      if (requires2FA) {
        if (!emailVerificationCode) {
          sendJson(res, 403, {
            error: 'Email verification required',
            message: 'A 6-digit confirmation code was sent to your email. Enter 123456.',
            twoFactorRequired: true
          });
          return true;
        }

        if (emailVerificationCode !== '123456') {
          sendJson(res, 400, {
            error: 'Invalid verification code. Enter 123456 to verify.',
            twoFactorRequired: true
          });
          return true;
        }
      }

      // Check registered user
      let user = USERS.get(normalizedEmail);
      if (!user && requires2FA && emailVerificationCode === '123456') {
        user = {
          email: normalizedEmail,
          password,
          name: normalizedEmail.split('@')[0],
          plan: 'Pro',
          teamMember: false,
          requires2fa: true
        };
        USERS.set(normalizedEmail, user);
      } else if (!user) {
        sendJson(res, 401, { error: 'No account found with this email. Please create an account first.' });
        return true;
      } else if (user.password && user.password !== password && !requires2FA) {
        sendJson(res, 401, { error: 'Incorrect password. Please check your credentials.' });
        return true;
      }

      const token = generateToken('token_');
      SESSIONS.set(token, {
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: Date.now()
      });

      sendJson(res, 200, {
        email: user.email,
        name: user.name,
        plan: user.plan,
        teamMember: user.teamMember,
        token
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 3. Sejda Auth API: POST /users/register
  if (pathname === '/users/register' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { name, email, password } = body;

      if (!email || !email.includes('@')) {
        sendJson(res, 400, { error: 'A valid email address is required.' });
        return true;
      }

      if (!password || password.length < 6) {
        sendJson(res, 400, { error: 'Password must be at least 6 characters long.' });
        return true;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (USERS.has(normalizedEmail)) {
        sendJson(res, 409, { error: 'An account with this email already exists. Please sign in instead.' });
        return true;
      }

      const user = {
        email: normalizedEmail,
        password,
        name: (name && name.trim()) || normalizedEmail.split('@')[0],
        plan: 'Pro',
        teamMember: false,
        requires2fa: false
      };
      USERS.set(normalizedEmail, user);

      const token = generateToken('token_reg_');
      SESSIONS.set(token, {
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: Date.now()
      });

      sendJson(res, 200, {
        email: user.email,
        name: user.name,
        plan: user.plan,
        teamMember: false,
        token
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 4. Sejda Auth API: POST /users/login-with-sso/lookup
  if (pathname === '/users/login-with-sso/lookup' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const email = (body.email || '').trim().toLowerCase();
      const domain = email.split('@')[1] || '';
      const useSSO = SSO_DOMAINS.includes(domain);

      sendJson(res, 200, { useSSO, domain });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 5. Sejda Auth API: POST /users/login-with-sso
  if (pathname === '/users/login-with-sso' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const email = (body.email || '').trim().toLowerCase();
      const domain = email.split('@')[1] || 'enterprise.com';

      const ssoUrl = `https://auth.${domain}/saml2/idp/sso?client_id=letsedit_suite&email=${encodeURIComponent(email)}`;
      sendJson(res, 200, { ssoUrl, email, useSSO: true });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 6. Sejda Auth API: POST /users/login-with-google
  if (pathname === '/users/login-with-google' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const user = {
        email: body.email || 'alex.google@example.com',
        name: body.name || 'Alex Morgan',
        plan: 'Pro',
        provider: 'google',
        teamMember: false
      };
      const token = generateToken('gsi_');
      SESSIONS.set(token, user);

      sendJson(res, 200, { ...user, token });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 7. Sejda Auth API: POST /users/login-with-microsoft
  if (pathname === '/users/login-with-microsoft' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const user = {
        email: body.email || 'jordan.msft@example.com',
        name: body.name || 'Jordan Miller',
        plan: 'Pro',
        provider: 'microsoft',
        teamMember: false
      };
      const token = generateToken('msal_');
      SESSIONS.set(token, user);

      sendJson(res, 200, { ...user, token });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 8. Sejda Auth API: GET /users/me
  if (pathname === '/users/me' && method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (token && SESSIONS.has(token)) {
      const session = SESSIONS.get(token);
      sendJson(res, 200, { user: session, valid: true });
    } else {
      sendJson(res, 401, { error: 'Unauthorized session or token expired', valid: false });
    }
    return true;
  }

  // 8.1 Sejda Auth API: PUT /users/me (update profile)
  if (pathname === '/users/me' && method === 'PUT') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || !SESSIONS.has(token)) {
      sendJson(res, 401, { error: 'Unauthorized session' });
      return true;
    }
    const session = SESSIONS.get(token);
    const body = await parseJsonBody(req);
    if (body.name) session.name = body.name.trim();
    if (typeof body.requires2fa === 'boolean') session.requires2fa = body.requires2fa;
    SESSIONS.set(token, session);
    sendJson(res, 200, { user: session, success: true });
    return true;
  }

  // 8.2 Developer & Automation API Keys: GET /users/api-keys
  if (pathname === '/users/api-keys' && method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || !SESSIONS.has(token)) {
      sendJson(res, 401, { error: 'Unauthorized session' });
      return true;
    }
    const session = SESSIONS.get(token);
    const apiKeys = session.apiKeys || [];
    sendJson(res, 200, { apiKeys });
    return true;
  }

  // 8.3 Developer & Automation API Keys: POST /users/api-keys
  if (pathname === '/users/api-keys' && method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || !SESSIONS.has(token)) {
      sendJson(res, 401, { error: 'Unauthorized session' });
      return true;
    }
    const session = SESSIONS.get(token);
    const body = await parseJsonBody(req);
    const label = (body.label || 'Default Automation Key').trim();
    const newKey = {
      id: 'key_' + Math.random().toString(36).substring(2, 10),
      token: 'api_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      label,
      createdAt: new Date().toISOString()
    };
    if (!session.apiKeys) session.apiKeys = [];
    session.apiKeys.push(newKey);
    SESSIONS.set(token, session);
    sendJson(res, 201, { apiKey: newKey, success: true });
    return true;
  }

  // 8.4 Developer & Automation API Keys: DELETE /users/api-keys
  if (pathname.startsWith('/users/api-keys') && method === 'DELETE') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || !SESSIONS.has(token)) {
      sendJson(res, 401, { error: 'Unauthorized session' });
      return true;
    }
    const session = SESSIONS.get(token);
    const keyId = pathname.split('/').pop();
    if (session.apiKeys) {
      session.apiKeys = session.apiKeys.filter(k => k.id !== keyId);
      SESSIONS.set(token, session);
    }
    sendJson(res, 200, { success: true, message: 'API key revoked successfully.' });
    return true;
  }

  // 9. Sejda Auth API: POST /users/logout
  if (pathname === '/users/logout' && method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) SESSIONS.delete(token);

    sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
    return true;
  }

  // 10. Sejda Auth API: POST /users/forgot-password & /users/reset-password
  if ((pathname === '/users/forgot-password' || pathname === '/users/reset-password') && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const email = (body.email || '').trim();
      sendJson(res, 200, {
        success: true,
        message: `Password reset instructions sent to ${email || 'your email'}.`
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 11. Cloudflare Turnstile Verification API: POST /api/turnstile/verify
  if (pathname === '/api/turnstile/verify' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const token = body.token || body['cf-turnstile-response'] || '';
      const clientIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      const verification = await verifyTurnstileToken(token, clientIp);
      sendJson(res, verification.success ? 200 : 400, verification);
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  return false;
}

/**
 * Cloudflare Turnstile Server-Side Verification
 * Validates token against https://challenges.cloudflare.com/turnstile/v0/siteverify
 */
export async function verifyTurnstileToken(token, clientIp = '') {
  if (!token) return { success: false, 'error-codes': ['missing-input-response'] };

  // Testing dummy tokens / local simulation keys / human verified nonces
  if (token.startsWith('cf_sim_') || token.startsWith('cf_verified_') || token.startsWith('XXXX.') || token === '1x00000000000000000000AA') {
    return { success: true, challenge_ts: new Date().toISOString(), hostname: 'localhost' };
  }

  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) formData.append('remoteip', clientIp);

    const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await cfRes.json();
    return data;
  } catch (err) {
    console.warn('[Cloudflare Turnstile] Verification warning (fallback allowed):', err.message);
    return { success: true, warning: 'Verification network fallback' };
  }
}
