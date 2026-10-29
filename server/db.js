/**
 * In-Memory Database & Core HTTP Utilities for Server
 */

export const USERS = new Map([
  [
    'demo@example.com',
    {
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User',
      plan: 'Pro',
      teamMember: false,
      requires2fa: false
    }
  ],
  [
    'alex.pro@example.com',
    {
      email: 'alex.pro@example.com',
      password: 'StandardPassword123',
      name: 'Alex Morgan',
      plan: 'Pro',
      teamMember: false,
      requires2fa: false
    }
  ],
  [
    'developer@example.com',
    {
      email: 'developer@example.com',
      password: 'DevPassword123',
      name: 'Developer',
      plan: 'Pro',
      teamMember: false,
      requires2fa: false
    }
  ],
  [
    'security.2fa@example.com',
    {
      email: 'security.2fa@example.com',
      password: 'demo',
      name: 'Security Analyst',
      plan: 'Enterprise',
      teamMember: true,
      requires2fa: true
    }
  ],
  [
    'security@enterprise.org',
    {
      email: 'security@enterprise.org',
      password: 'demo',
      name: 'Enterprise Security Officer',
      plan: 'Enterprise',
      teamMember: true,
      requires2fa: true
    }
  ]
]);

export const SESSIONS = new Map();
export const SSO_DOMAINS = ['acme.com', 'enterprise.org', 'company.com', 'corp.net', 'google.com', 'microsoft.com'];

// Helper to parse JSON body from incoming request
export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // 50MB max limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON responses
export function sendJson(res, statusCode, data, headers = {}) {
  const jsonStr = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
    ...headers
  });
  res.end(jsonStr);
  return true;
}

// Helper to generate secure random token
export function generateToken(prefix = 'auth_') {
  return prefix + Math.random().toString(36).substring(2) + Date.now().toString(36);
}
