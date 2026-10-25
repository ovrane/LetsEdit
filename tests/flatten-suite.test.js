import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, PDFName } from 'pdf-lib';
import { FlattenOps } from '../src/core/engine/operations/flatten-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleFlattenRequest } from '../server/routes/flatten-routes.js';

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

test('createSampleFlattenPdf produces a 3-page corporate form with metadata', async () => {
  const sampleBytes = await FlattenOps.createSampleFlattenPdf();
  assert(sampleBytes instanceof Uint8Array, 'Sample should be Uint8Array');
  assert(sampleBytes.length > 500, 'Sample should not be empty');

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 3, 'Sample must have 3 pages');
  assert.strictEqual(doc.getTitle(), 'Corporate NDA & Compliance Agreement (Fillable Form)');
  assert(doc.catalog.has(PDFName.of('AcroForm')), 'Sample must contain interactive AcroForm catalog');
});

test('inspectFlattenTargets accurately discovers interactive fields and breakdowns', async () => {
  const sampleBytes = await FlattenOps.createSampleFlattenPdf();
  const inspection = await FlattenOps.inspectFlattenTargets(sampleBytes);

  assert.strictEqual(inspection.hasAcroForm, true);
  assert(inspection.fieldCount >= 9, 'Should have at least 9 interactive fields');
  assert.strictEqual(inspection.totalPages, 3);
  assert.strictEqual(inspection.isAlreadyFlat, false);

  assert(inspection.fieldTypes.text >= 6, 'Should detect text fields');
  assert(inspection.fieldTypes.checkbox >= 2, 'Should detect checkbox fields');
  assert(inspection.fieldTypes.dropdown >= 1, 'Should detect dropdown field');
  assert(inspection.fieldTypes.radio >= 1, 'Should detect radio group');

  const companyField = inspection.fields.find(f => f.name === 'party_company_name');
  assert(companyField, 'Should find party_company_name field');
  assert.strictEqual(companyField.value, 'Acme Global Technologies Inc.');
});

test('inspectFlattenTargets handles already-flat or non-form documents', async () => {
  const flatDoc = await PDFDocument.create();
  flatDoc.addPage([400, 400]);
  const flatBytes = await flatDoc.save();

  const inspection = await FlattenOps.inspectFlattenTargets(flatBytes);
  assert.strictEqual(inspection.hasAcroForm, false);
  assert.strictEqual(inspection.fieldCount, 0);
  assert.strictEqual(inspection.isAlreadyFlat, true);
});

test('flattenPdf mode all bakes all form fields and annotations into static vectors', async () => {
  const sampleBytes = await FlattenOps.createSampleFlattenPdf();
  const outputBytes = await FlattenOps.flattenPdf(sampleBytes, { mode: 'all' });

  assert(outputBytes instanceof Uint8Array);
  assert(outputBytes.pdfBytes instanceof Uint8Array);
  assert(outputBytes.report.fieldsFlattened >= 9);
  assert.strictEqual(outputBytes.report.mode, 'all');
  assert.strictEqual(outputBytes.report.isFlat, true);

  // Load resulting PDF and verify AcroForm catalog was removed
  const postDoc = await PDFDocument.load(outputBytes);
  assert.strictEqual(postDoc.getPageCount(), 3);
  assert.strictEqual(postDoc.catalog.has(PDFName.of('AcroForm')), false, 'AcroForm catalog must be eliminated');

  // Verify post-inspection indicates document is now flat
  const postInspection = await FlattenOps.inspectFlattenTargets(outputBytes);
  assert.strictEqual(postInspection.fieldCount, 0);
  assert.strictEqual(postInspection.isAlreadyFlat, true);
});

test('flattenPdf mode forms flattens form fields and preserves custom options', async () => {
  const sampleBytes = await FlattenOps.createSampleFlattenPdf();
  const outputBytes = await FlattenOps.flattenPdf(sampleBytes, {
    mode: 'forms',
    stripXFA: true,
    cleanNeedAppearances: true
  });

  assert(outputBytes instanceof Uint8Array);
  assert(outputBytes.report.fieldsFlattened >= 9);
  assert.strictEqual(outputBytes.report.mode, 'forms');

  const postInspection = await FlattenOps.inspectFlattenTargets(outputBytes);
  assert.strictEqual(postInspection.fieldCount, 0);
});

test('flattenPdf mode annotations handles annotation purging', async () => {
  const sampleBytes = await FlattenOps.createSampleFlattenPdf();
  const outputBytes = await FlattenOps.flattenPdf(sampleBytes, { mode: 'annotations' });

  assert(outputBytes instanceof Uint8Array);
  assert.strictEqual(outputBytes.report.mode, 'annotations');
});

test('PageOperations facade delegates flatten methods seamlessly', async () => {
  const sampleBytes = await PageOperations.createSampleFlattenPdf();
  assert(sampleBytes instanceof Uint8Array);

  const inspection = await PageOperations.inspectFlattenTargets(sampleBytes);
  assert.strictEqual(inspection.hasAcroForm, true);

  const flatBytes = await PageOperations.flattenPdf(sampleBytes, { mode: 'all' });
  assert(flatBytes instanceof Uint8Array);
  assert(flatBytes.report.fieldsFlattened >= 9);
});

test('handleFlattenRequest GET /api/flatten/sample returns binary PDF and JSON base64', async () => {
  // 1. Binary PDF request
  const req1 = createMockReq('GET', '/api/flatten/sample', null, { accept: 'application/pdf' });
  const res1 = createMockRes();
  const handled1 = await handleFlattenRequest(req1, res1);
  assert.strictEqual(handled1, true);
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.headers['Content-Type'], 'application/pdf');

  // 2. JSON base64 request
  const req2 = createMockReq('GET', '/api/flatten/sample');
  const res2 = createMockRes();
  const handled2 = await handleFlattenRequest(req2, res2);
  assert.strictEqual(handled2, true);
  assert.strictEqual(res2.statusCode, 200);
  const data = JSON.parse(res2.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.pageCount, 3);
  assert(typeof data.pdfBase64 === 'string');
});

test('handleFlattenRequest POST /api/flatten/inspect analyzes form fields', async () => {
  const sampleBytes = await FlattenOps.createSampleFlattenPdf();
  const sampleBase64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/flatten/inspect', {
    fileData: sampleBase64
  });
  const res = createMockRes();
  const handled = await handleFlattenRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.hasAcroForm, true);
  assert(data.fieldCount >= 9);
});

test('handleFlattenRequest POST /api/flatten/inspect returns 400 when payload missing', async () => {
  const req = createMockReq('POST', '/api/flatten/inspect', {});
  const res = createMockRes();
  const handled = await handleFlattenRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 400);
});

test('handleFlattenRequest POST /api/flatten/apply bakes form and returns report', async () => {
  const sampleBytes = await FlattenOps.createSampleFlattenPdf();
  const sampleBase64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/flatten/apply', {
    fileData: sampleBase64,
    mode: 'all'
  });
  const res = createMockRes();
  const handled = await handleFlattenRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert(typeof data.pdfBase64 === 'string');
  assert(data.report.fieldsFlattened >= 9);
  assert.strictEqual(data.report.mode, 'all');
  assert.strictEqual(data.report.isFlat, true);
});

test('handleFlattenRequest POST /api/flatten/apply returns 400 when payload missing', async () => {
  const req = createMockReq('POST', '/api/flatten/apply', {});
  const res = createMockRes();
  const handled = await handleFlattenRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 400);
});
