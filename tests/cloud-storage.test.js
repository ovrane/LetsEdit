import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { handleCloudStorageRequest, CLOUD_DRIVE_STORAGE } from '../server/routes/cloud-storage-routes.js';
import { CloudStorageService } from '../src/core/cloud-storage.js';

// Mock request / response helpers for backend testing
function createMockReq(method, urlPath, body = null, headers = {}) {
  const req = {
    method,
    url: urlPath,
    headers: { 'content-type': 'application/json', host: 'localhost:3000', ...headers },
    listeners: {},
    on(event, handler) {
      this.listeners[event] = handler;
      if (event === 'data' && body !== null) {
        handler(typeof body === 'string' ? body : JSON.stringify(body));
      }
      if (event === 'end') {
        setTimeout(handler, 0);
      }
    }
  };
  return req;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(code, headers = {}) {
      this.statusCode = code;
      this.headers = { ...this.headers, ...headers };
    },
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(content) {
      this.body = content;
    }
  };
  return res;
}

test('Cloud Storage API - GET /api/cloud/:provider/files lists files for Google Drive and Dropbox', async () => {
  // Test Google Drive listing
  const req1 = createMockReq('GET', '/api/cloud/gdrive/files');
  const res1 = createMockRes();
  const handled1 = await handleCloudStorageRequest(req1, res1, '/api/cloud/gdrive/files', 'GET');
  assert.strictEqual(handled1, true);
  assert.strictEqual(res1.statusCode, 200);

  const parsed1 = JSON.parse(res1.body);
  assert.strictEqual(parsed1.success, true);
  assert.strictEqual(parsed1.provider, 'gdrive');
  assert.ok(Array.isArray(parsed1.files));
  assert.ok(parsed1.files.length >= 3);

  // Test Dropbox listing
  const req2 = createMockReq('GET', '/api/cloud/dropbox/files');
  const res2 = createMockRes();
  const handled2 = await handleCloudStorageRequest(req2, res2, '/api/cloud/dropbox/files', 'GET');
  assert.strictEqual(handled2, true);
  assert.strictEqual(res2.statusCode, 200);

  const parsed2 = JSON.parse(res2.body);
  assert.strictEqual(parsed2.success, true);
  assert.strictEqual(parsed2.provider, 'dropbox');
  assert.ok(Array.isArray(parsed2.files));
  assert.ok(parsed2.files.length >= 2);
});

test('Cloud Storage API - GET /api/cloud/:provider/files filters files with search query ?q=', async () => {
  const req = createMockReq('GET', '/api/cloud/gdrive/files?q=financial');
  const res = createMockRes();
  await handleCloudStorageRequest(req, res, '/api/cloud/gdrive/files', 'GET');

  const parsed = JSON.parse(res1_body(res));
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.files.length, 1);
  assert.ok(parsed.files[0].name.toLowerCase().includes('financial'));
});

function res1_body(res) {
  return typeof res.body === 'string' ? res.body : res.body.toString('utf8');
}

test('Cloud Storage API - GET /api/cloud/:provider/download/:id downloads valid PDF stream and handles 404', async () => {
  // Valid file
  const validId = 'gdrive_file_001';
  const req = createMockReq('GET', `/api/cloud/gdrive/download/${validId}`);
  const res = createMockRes();
  const handled = await handleCloudStorageRequest(req, res, `/api/cloud/gdrive/download/${validId}`, 'GET');

  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.headers['Content-Type'], 'application/pdf');
  assert.ok(res.body instanceof Buffer);

  // Validate that the returned buffer is indeed a valid PDF readable by pdf-lib
  const parsedPdf = await PDFDocument.load(res.body);
  assert.strictEqual(parsedPdf.getPageCount(), 1);

  // Unknown file 404
  const req404 = createMockReq('GET', '/api/cloud/gdrive/download/unknown_file_id');
  const res404 = createMockRes();
  await handleCloudStorageRequest(req404, res404, '/api/cloud/gdrive/download/unknown_file_id', 'GET');
  assert.strictEqual(res404.statusCode, 404);
  const parsed404 = JSON.parse(res404.body);
  assert.strictEqual(parsed404.success, false);
});

test('Cloud Storage API - POST /api/cloud/:provider/upload uploads file and generates shareable link', async () => {
  const uploadPayload = {
    filename: 'Signed_Vendor_Contract_2026.pdf',
    destinationFolder: 'LetsEdit / 2026 Exports',
    fileBase64: Buffer.from('%PDF-1.4 Minimal test pdf bytes').toString('base64')
  };

  const req = createMockReq('POST', '/api/cloud/gdrive/upload', uploadPayload);
  const res = createMockRes();
  const handled = await handleCloudStorageRequest(req, res, '/api/cloud/gdrive/upload', 'POST');

  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 201);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.provider, 'gdrive');
  assert.strictEqual(parsed.file.name, 'Signed_Vendor_Contract_2026.pdf');
  assert.ok(parsed.shareUrl.startsWith('https://drive.google.com/file/d/'));
  assert.ok(parsed.file.id.startsWith('gdrive_'));

  // Also test Dropbox upload
  const reqDbx = createMockReq('POST', '/api/cloud/dropbox/upload', uploadPayload);
  const resDbx = createMockRes();
  await handleCloudStorageRequest(reqDbx, resDbx, '/api/cloud/dropbox/upload', 'POST');
  assert.strictEqual(resDbx.statusCode, 201);
  const parsedDbx = JSON.parse(resDbx.body);
  assert.ok(parsedDbx.shareUrl.startsWith('https://www.dropbox.com/s/'));
});

test('CloudStorageService client - listFiles, downloadFile, and uploadDocument work end-to-end', async () => {
  // Mock global fetch to dispatch to handleCloudStorageRequest
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    const parsedUrl = new URL(url, 'http://localhost:3000');
    const pathname = parsedUrl.pathname;
    const body = options.body ? JSON.parse(options.body) : null;

    const mockReq = createMockReq(method, url, body);
    const mockRes = createMockRes();
    const handled = await handleCloudStorageRequest(mockReq, mockRes, pathname, method);

    if (!handled) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ success: false, error: 'Not found' })
      };
    }

    return {
      ok: mockRes.statusCode >= 200 && mockRes.statusCode < 300,
      status: mockRes.statusCode,
      json: async () => JSON.parse(typeof mockRes.body === 'string' ? mockRes.body : mockRes.body.toString()),
      arrayBuffer: async () => {
        const buf = Buffer.isBuffer(mockRes.body) ? mockRes.body : Buffer.from(mockRes.body);
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      }
    };
  };

  try {
    // 1. List files
    const files = await CloudStorageService.listFiles('gdrive');
    assert.ok(Array.isArray(files));
    assert.ok(files.length > 0);

    // 2. Download file
    const downloaded = await CloudStorageService.downloadFile('gdrive', files[0].id, files[0].name);
    assert.strictEqual(downloaded.name, files[0].name);
    assert.strictEqual(downloaded.type, 'application/pdf');
    assert.ok(downloaded.bytes instanceof Uint8Array);
    assert.ok(downloaded.size > 0);

    // 3. Upload document
    const testBytes = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]); // '%PDF-1.4'
    const uploadResult = await CloudStorageService.uploadDocument('dropbox', testBytes, 'Test_Upload.pdf', 'Exports');
    assert.strictEqual(uploadResult.success, true);
    assert.ok(uploadResult.shareUrl);
    assert.strictEqual(uploadResult.file.name, 'Test_Upload.pdf');
  } finally {
    global.fetch = originalFetch;
  }
});
