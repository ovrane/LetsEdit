import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { RepairOps } from '../src/core/engine/operations/repair-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleRepairRequest } from '../server/routes/repair-routes.js';

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

test('RepairOps - createCorruptTestPdf generates structurally damaged sample document', async () => {
  const corruptBytes = await RepairOps.createCorruptTestPdf();
  assert.ok(corruptBytes instanceof Uint8Array);
  assert.ok(corruptBytes.byteLength > 500);

  // Should have leading HTTP headers or garbage before %PDF
  const str = new TextDecoder().decode(corruptBytes.slice(0, 100));
  assert.ok(!str.startsWith('%PDF-'), 'Corrupt sample must not start immediately with %PDF');
  assert.ok(str.includes('%PDF-1.7'), 'Corrupt sample contains shifted %PDF header');
});

test('RepairOps - diagnosePdf detects anomalies and calculates integrity health score', async () => {
  const corruptBytes = await RepairOps.createCorruptTestPdf();
  const diag = RepairOps.diagnosePdf(corruptBytes);

  assert.ok(diag, 'Diagnostic object must be defined');
  assert.ok(diag.healthScore < 80, `Health score should reflect damage, got ${diag.healthScore}`);
  assert.ok(diag.headerOffset > 0, `Expected header offset > 0, got ${diag.headerOffset}`);
  assert.strictEqual(diag.hasEof, false, 'Expected missing %%EOF');
  assert.ok(diag.anomalies.length >= 2, 'Must detect at least 2 anomalies');
  assert.ok(diag.recipe, 'Must recommend a recovery recipe');
});

test('RepairOps - repairPdfAdvanced restores corrupted PDF into valid ISO 32000-1 document', async () => {
  const corruptBytes = await RepairOps.createCorruptTestPdf();
  const result = await RepairOps.repairPdfAdvanced(corruptBytes);

  assert.ok(result.pdfBytes instanceof Uint8Array);
  assert.ok(result.repairedBytes instanceof Uint8Array);
  assert.ok(result.pdfBytes.byteLength > 500);
  assert.ok(result.pageCount >= 1, `Expected at least 1 recovered page, got ${result.pageCount}`);
  assert.ok(result.recoveredObjects > 0, 'Expected recovered objects');
  assert.ok(result.anomaliesFixed.length >= 2, 'Expected anomalies to be resolved');
  assert.ok(result.diagnosticLog.includes('[Tier 1] Sanitized header'));
  assert.ok(result.diagnosticLog.includes('[Tier 2] Restored missing %%EOF'));

  // Ensure output can be parsed cleanly by PDFDocument without errors
  const restoredDoc = await PDFDocument.load(result.pdfBytes);
  assert.ok(restoredDoc.getPageCount() >= 1);
});

test('PageOperations facade delegates diagnosePdf and repairPdfAdvanced seamlessly', async () => {
  const corruptBytes = await PageOperations.createCorruptTestPdf();
  const diag = PageOperations.diagnosePdf(corruptBytes);
  assert.ok(diag.anomalies.length >= 2);

  const repairResult = await PageOperations.repairPdfAdvanced(corruptBytes);
  assert.ok(repairResult.pdfBytes.byteLength > 500);
  assert.ok(repairResult.pageCount >= 1);
});

test('Repair API Route - GET /api/repair/sample-corrupt returns damaged document payload', async () => {
  const req = createMockReq('GET', '/api/repair/sample-corrupt');
  const res = createMockRes();

  const handled = await handleRepairRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.ok(data.corruptedBase64.length > 50);
  assert.ok(data.diagnostic.healthScore < 80);
});

test('Repair API Route - POST /api/repair/diagnose analyzes uploaded PDF base64', async () => {
  const corruptBytes = await RepairOps.createCorruptTestPdf();
  const base64 = Buffer.from(corruptBytes).toString('base64');

  const req = createMockReq('POST', '/api/repair/diagnose', {
    fileBase64: base64,
    filename: 'test_broken.pdf'
  });
  const res = createMockRes();

  const handled = await handleRepairRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.ok(data.diagnostic.anomalies.length >= 2);
  assert.strictEqual(data.diagnostic.hasEof, false);
});

test('Repair API Route - POST /api/repair/execute repairs damaged PDF and returns base64 & audit log', async () => {
  const corruptBytes = await RepairOps.createCorruptTestPdf();
  const base64 = Buffer.from(corruptBytes).toString('base64');

  const req = createMockReq('POST', '/api/repair/execute', {
    fileBase64: base64,
    filename: 'test_broken.pdf'
  });
  const res = createMockRes();

  const handled = await handleRepairRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.ok(data.repairedPdfBase64.length > 100);
  assert.ok(data.recoveredPages >= 1);
  assert.ok(data.anomaliesFixed.length >= 2);
  assert.ok(data.auditLog.includes('[LetsEdit PDF Repair Suite]'));

  // Test decoding the returned repaired PDF
  const repairedBuf = Buffer.from(data.repairedPdfBase64, 'base64');
  const doc = await PDFDocument.load(repairedBuf);
  assert.ok(doc.getPageCount() >= 1);
});

test('RepairOps - handles truncated documents without startxref cleanly', async () => {
  // Create a minimal document and truncate the last 20 bytes
  const doc = await PDFDocument.create();
  doc.addPage([400, 600]);
  const validBytes = await doc.save();
  const truncated = validBytes.slice(0, validBytes.length - 35); // Remove startxref and %%EOF

  const diag = RepairOps.diagnosePdf(truncated);
  assert.strictEqual(diag.hasEof, false);

  const result = await RepairOps.repairPdfAdvanced(truncated);
  assert.ok(result.pdfBytes.byteLength > 100);
  assert.ok(result.pageCount >= 1);

  const verified = await PDFDocument.load(result.pdfBytes);
  assert.ok(verified.getPageCount() >= 1);
});
