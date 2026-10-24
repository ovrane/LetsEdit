/**
 * PDF Studio & LetsEdit Fullstack Backend Server Entry Point
 * Conforms to SEJDA_AUTH_SPECIFICATION.md & SEJDA_FULL_SUITE_REVERSE_ENGINEERING.md
 * Modular architecture dispatching to db, auth-routes, pdf-routes, and static.
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleAuthRequest } from './routes/auth-routes.js';
import { handlePdfRequest } from './routes/pdf-routes.js';
import { handleMobilePairRequest, PAIRING_SESSIONS } from './routes/mobile-pair-routes.js';
import { handleSignRequest, SIGNATURE_REQUESTS } from './routes/sign-request-routes.js';
import { handleCloudStorageRequest, CLOUD_DRIVE_STORAGE } from './routes/cloud-storage-routes.js';
import { handleFormRequest } from './routes/form-routes.js';
import { handleRepairRequest } from './routes/repair-routes.js';
import { handleSplitMergeRequest } from './routes/split-merge-routes.js';
import { handleMetadataRequest } from './routes/metadata-routes.js';
import { handlePageLabelsRequest } from './routes/pagelabels-routes.js';
import { serveStatic } from './static.js';

export { USERS, SESSIONS, SSO_DOMAINS, parseJsonBody, sendJson, generateToken } from './db.js';
export { PAIRING_SESSIONS } from './routes/mobile-pair-routes.js';
export { SIGNATURE_REQUESTS } from './routes/sign-request-routes.js';
export { CLOUD_DRIVE_STORAGE } from './routes/cloud-storage-routes.js';
export { serveStatic } from './static.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

/**
 * Core Request Dispatcher
 * Can be plugged directly into Node http.createServer or Vite dev server middleware
 */
export async function handleBackendRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return true;
  }

  // Dispatch Sejda Auth & User Management endpoints
  const authHandled = await handleAuthRequest(req, res, pathname, method);
  if (authHandled) return true;

  // Dispatch PDF Studio Processing endpoints
  const pdfHandled = await handlePdfRequest(req, res, pathname, method);
  if (pdfHandled) return true;

  // Dispatch Mobile Camera & Signature Pairing endpoints
  const mobilePairHandled = await handleMobilePairRequest(req, res, pathname, method);
  if (mobilePairHandled) return true;

  // Dispatch Multi-Signer Signature Request endpoints
  const signHandled = await handleSignRequest(req, res, pathname, method);
  if (signHandled) return true;

  // Dispatch Cloud Storage (Google Drive & Dropbox) endpoints
  const cloudHandled = await handleCloudStorageRequest(req, res, pathname, method);
  if (cloudHandled) return true;

  // Dispatch Form Filler & Data Export/Import endpoints
  const formHandled = await handleFormRequest(req, res, pathname, method);
  if (formHandled) return true;

  // Dispatch PDF Repair & Diagnostic Suite endpoints
  const repairHandled = await handleRepairRequest(req, res, pathname, method);
  if (repairHandled) return true;

  // Dispatch Advanced Merge & Split endpoints
  const splitMergeHandled = await handleSplitMergeRequest(req, res, pathname, method);
  if (splitMergeHandled) return true;

  // Dispatch PDF Metadata & Adobe XMP endpoints
  const metadataHandled = await handleMetadataRequest(req, res, pathname, method);
  if (metadataHandled) return true;

  // Dispatch ISO 32000-1 PageLabels endpoints
  const pageLabelsHandled = await handlePageLabelsRequest(req, res, pathname, method);
  if (pageLabelsHandled) return true;

  return false;
}

/**
 * Creates and starts standalone HTTP server
 */
export function startServer(port = process.env.PORT || 3000) {
  const server = http.createServer(async (req, res) => {
    try {
      const handled = await handleBackendRequest(req, res);
      if (!handled) {
        serveStatic(req, res, DIST_DIR);
      }
    } catch (err) {
      console.error('Server error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[PDF Studio Backend] Server listening at http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Start automatically if executed directly via `node server/index.js`
if (process.argv[1] && process.argv[1].endsWith('server/index.js')) {
  startServer();
}
