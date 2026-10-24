import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, PDFName, PDFDict, PDFArray, StandardFonts } from 'pdf-lib';
import { SanitizeOps } from '../src/core/engine/operations/sanitize-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleSanitizeRequest } from '../server/routes/sanitize-routes.js';

// Mock request / response helpers for backend route testing
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

test('createSampleExposedPdf generates document loaded with hidden data vectors', async () => {
  const sampleBytes = await SanitizeOps.createSampleExposedPdf();
  assert.ok(sampleBytes instanceof Uint8Array);
  assert.ok(sampleBytes.byteLength > 1000);

  const doc = await PDFDocument.load(sampleBytes, { updateMetadata: false });
  assert.strictEqual(doc.getPageCount(), 1);
  assert.strictEqual(doc.getTitle(), 'Confidential M&A Strategy [DRAFT INTERNAL ONLY]');
  assert.strictEqual(doc.getAuthor(), 'Secret Project Team <internal-audit@enterprise.local>');
  assert.ok(doc.catalog.has(PDFName.of('PieceInfo')), 'Must have /PieceInfo');
  assert.ok(doc.catalog.has(PDFName.of('OpenAction')), 'Must have /OpenAction');
  assert.ok(doc.catalog.has(PDFName.of('Metadata')), 'Must have /Metadata XMP');

  const page = doc.getPage(0);
  const annots = page.node.Annots();
  assert.ok(annots && annots.size() > 0, 'Must have page annotations');
});

test('inspectHiddenData correctly flags high-risk threats', async () => {
  const sampleBytes = await SanitizeOps.createSampleExposedPdf();
  const inspection = await SanitizeOps.inspectHiddenData(sampleBytes);

  assert.strictEqual(inspection.totalPages, 1);
  assert.strictEqual(inspection.riskLevel, 'high');
  assert.ok(inspection.findings.metadata, 'Should detect Info metadata');
  assert.ok(inspection.findings.xmpStream, 'Should detect XMP stream');
  assert.ok(inspection.findings.openActions, 'Should detect OpenActions');
  assert.ok(inspection.findings.privateData, 'Should detect /PieceInfo private app data');
  assert.ok(inspection.findings.annotations >= 1, 'Should detect annotations');
  assert.ok(inspection.findings.totalThreats >= 4, 'Total threats should be >= 4');
});

test('sanitizeDocument purges all hidden data and yields a clean document', async () => {
  const sampleBytes = await SanitizeOps.createSampleExposedPdf();
  const sanitized = await SanitizeOps.sanitizeDocument(sampleBytes);

  assert.ok(sanitized instanceof Uint8Array);
  assert.ok(sanitized.report.isClean);
  assert.ok(sanitized.report.removedItemsCount > 0);

  // Inspect the sanitized document directly
  const doc = await PDFDocument.load(sanitized, { updateMetadata: false });
  assert.strictEqual(doc.getTitle() || '', '');
  assert.strictEqual(doc.getAuthor() || '', '');
  assert.strictEqual(doc.catalog.has(PDFName.of('Metadata')), false);
  assert.strictEqual(doc.catalog.has(PDFName.of('OpenAction')), false);
  assert.strictEqual(doc.catalog.has(PDFName.of('PieceInfo')), false);

  const page = doc.getPage(0);
  const annots = page.node.Annots();
  assert.ok(!annots || annots.size() === 0, 'Annotations must be completely removed');

  // Verify through inspectHiddenData
  const reInspection = await SanitizeOps.inspectHiddenData(sanitized);
  assert.strictEqual(reInspection.riskLevel, 'clean');
  assert.strictEqual(reInspection.findings.totalThreats, 0);
  assert.strictEqual(reInspection.findings.privateData, false);
  assert.strictEqual(reInspection.findings.openActions, false);
});

test('sanitizeDocument supports selective purge options', async () => {
  const sampleBytes = await SanitizeOps.createSampleExposedPdf();

  // Purge scripts and private data, but keep metadata
  const partiallySanitized = await SanitizeOps.sanitizeDocument(sampleBytes, {
    purgeMetadata: false,
    purgeEmbeddedFiles: true,
    purgeScripts: true,
    purgeAnnotations: true,
    purgePrivateData: true,
    flattenForms: true
  });

  const doc = await PDFDocument.load(partiallySanitized, { updateMetadata: false });
  assert.strictEqual(doc.getTitle(), 'Confidential M&A Strategy [DRAFT INTERNAL ONLY]');
  assert.strictEqual(doc.catalog.has(PDFName.of('OpenAction')), false);
  assert.strictEqual(doc.catalog.has(PDFName.of('PieceInfo')), false);
});

test('sanitizeDocument flattens interactive form fields', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([500, 500]);
  const form = doc.getForm();
  const textField = form.createTextField('client.signatureName');
  textField.setText('Jane Doe, CFO');
  textField.addToPage(page, { x: 50, y: 300, width: 200, height: 25 });

  const rawFormBytes = await doc.save();
  const preInspection = await SanitizeOps.inspectHiddenData(rawFormBytes);
  assert.ok(preInspection.findings.formFields >= 1);

  const sanitizedBytes = await SanitizeOps.sanitizeDocument(rawFormBytes, { flattenForms: true });
  const postInspection = await SanitizeOps.inspectHiddenData(sanitizedBytes);
  assert.strictEqual(postInspection.findings.formFields, 0);
});

test('PageOperations facade delegates sanitize methods seamlessly', async () => {
  const sample = await PageOperations.createSampleExposedPdf();
  assert.ok(sample instanceof Uint8Array);

  const inspection = await PageOperations.inspectHiddenData(sample);
  assert.strictEqual(inspection.riskLevel, 'high');

  const sanitized = await PageOperations.sanitizeDocument(sample);
  assert.ok(sanitized.report.isClean);
});

test('Backend API: GET /api/sanitize/sample returns exposed test document', async () => {
  const req = createMockReq('GET', '/api/sanitize/sample');
  const res = createMockRes();

  const handled = await handleSanitizeRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const payload = JSON.parse(res.body);
  assert.strictEqual(payload.success, true);
  assert.ok(payload.pdfBase64);
  assert.strictEqual(payload.filename, 'sample_exposed_document.pdf');
});

test('Backend API: POST /api/sanitize/inspect returns deep threat forensic analysis', async () => {
  const sampleBytes = await SanitizeOps.createSampleExposedPdf();
  const req = createMockReq('POST', '/api/sanitize/inspect', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64')
  });
  const res = createMockRes();

  const handled = await handleSanitizeRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const payload = JSON.parse(res.body);
  assert.strictEqual(payload.success, true);
  assert.strictEqual(payload.inspection.riskLevel, 'high');
  assert.ok(payload.inspection.findings.privateData);
});

test('Backend API: POST /api/sanitize/execute cleans document and returns clean report', async () => {
  const sampleBytes = await SanitizeOps.createSampleExposedPdf();
  const req = createMockReq('POST', '/api/sanitize/execute', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64'),
    options: {
      purgeMetadata: true,
      purgeEmbeddedFiles: true,
      purgeScripts: true,
      purgeAnnotations: true,
      purgePrivateData: true,
      flattenForms: true
    }
  });
  const res = createMockRes();

  const handled = await handleSanitizeRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const payload = JSON.parse(res.body);
  assert.strictEqual(payload.success, true);
  assert.ok(payload.pdfBase64);
  assert.ok(payload.report.isClean);
  assert.strictEqual(payload.reInspection.riskLevel, 'clean');
});

test('Backend API: Handles error cases gracefully', async () => {
  // Missing payload in /inspect
  const reqInspect = createMockReq('POST', '/api/sanitize/inspect', {});
  const resInspect = createMockRes();
  await handleSanitizeRequest(reqInspect, resInspect);
  assert.strictEqual(resInspect.statusCode, 400);

  // Missing payload in /execute
  const reqExec = createMockReq('POST', '/api/sanitize/execute', {});
  const resExec = createMockRes();
  await handleSanitizeRequest(reqExec, resExec);
  assert.strictEqual(resExec.statusCode, 400);

  // Unhandled routes return false
  const reqOther = createMockReq('GET', '/api/other');
  const resOther = createMockRes();
  const handled = await handleSanitizeRequest(reqOther, resOther);
  assert.strictEqual(handled, false);
});
