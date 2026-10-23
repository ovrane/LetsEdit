import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { FormOps } from '../src/core/engine/operations/form-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleFormRequest } from '../server/routes/form-routes.js';

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

test('FormOps - createSampleFillableFormPdf creates valid interactive AcroForm PDF', async () => {
  const sampleBytes = await FormOps.createSampleFillableFormPdf();
  assert.ok(sampleBytes instanceof Uint8Array);
  assert.ok(sampleBytes.byteLength > 1000);

  const doc = await PDFDocument.load(sampleBytes);
  const form = doc.getForm();
  const fields = form.getFields();
  assert.ok(fields.length >= 7, 'Sample form must contain at least 7 interactive fields');

  const names = fields.map(f => f.getName());
  assert.ok(names.includes('full_name'));
  assert.ok(names.includes('email_address'));
  assert.ok(names.includes('department'));
  assert.ok(names.includes('engagement_type'));
  assert.ok(names.includes('terms_accepted'));
});

test('FormOps - inspectFormFields extracts detailed schema, types, values and widgets', async () => {
  const sampleBytes = await FormOps.createSampleFillableFormPdf();
  const inspection = await FormOps.inspectFormFields(sampleBytes);

  assert.strictEqual(inspection.hasForm, true);
  assert.ok(inspection.fieldCount >= 7);

  const nameField = inspection.fields.find(f => f.name === 'full_name');
  assert.ok(nameField);
  assert.strictEqual(nameField.type, 'text');
  assert.strictEqual(nameField.value, 'Jane Doe');
  assert.ok(nameField.widgets.length > 0);
  assert.strictEqual(nameField.widgets[0].pageIndex, 0);

  const deptField = inspection.fields.find(f => f.name === 'department');
  assert.ok(deptField);
  assert.strictEqual(deptField.type, 'dropdown');
  assert.strictEqual(deptField.value, 'Engineering');
  assert.ok(deptField.options.includes('Engineering'));
  assert.ok(deptField.options.includes('Marketing'));

  const roleField = inspection.fields.find(f => f.name === 'engagement_type');
  assert.ok(roleField);
  assert.strictEqual(roleField.type, 'radio');
  assert.strictEqual(roleField.value, 'Full-Time Employee');

  const termsField = inspection.fields.find(f => f.name === 'terms_accepted');
  assert.ok(termsField);
  assert.strictEqual(termsField.type, 'checkbox');
  assert.strictEqual(termsField.isChecked, true);
});

test('FormOps - fillFormFields populates text, dropdown, radio, and checkbox fields', async () => {
  const sampleBytes = await FormOps.createSampleFillableFormPdf();

  const updatedBytes = await FormOps.fillFormFields(sampleBytes, {
    full_name: 'Robert Vance',
    email_address: 'rvance@refrigeration.com',
    department: 'Marketing',
    engagement_type: 'Contractor',
    terms_accepted: false,
    subscribe_updates: true,
    submission_date: '2026-10-24'
  });

  const inspection = await FormOps.inspectFormFields(updatedBytes);
  const nameField = inspection.fields.find(f => f.name === 'full_name');
  assert.strictEqual(nameField.value, 'Robert Vance');

  const emailField = inspection.fields.find(f => f.name === 'email_address');
  assert.strictEqual(emailField.value, 'rvance@refrigeration.com');

  const deptField = inspection.fields.find(f => f.name === 'department');
  assert.strictEqual(deptField.value, 'Marketing');

  const roleField = inspection.fields.find(f => f.name === 'engagement_type');
  assert.strictEqual(roleField.value, 'Contractor');

  const termsField = inspection.fields.find(f => f.name === 'terms_accepted');
  assert.strictEqual(termsField.isChecked, false);

  const subscribeField = inspection.fields.find(f => f.name === 'subscribe_updates');
  assert.strictEqual(subscribeField.isChecked, true);
});

test('FormOps - fillFormFields with flatten: true flattens AcroForm fields into static vectors', async () => {
  const sampleBytes = await FormOps.createSampleFillableFormPdf();
  const flatBytes = await FormOps.fillFormFields(sampleBytes, {
    full_name: 'Flattened User'
  }, { flatten: true });

  const inspection = await FormOps.inspectFormFields(flatBytes);
  assert.strictEqual(inspection.hasForm, false);
  assert.strictEqual(inspection.fieldCount, 0);
});

test('FormOps - exportFormData produces valid JSON, XFDF, FDF, and CSV formats', async () => {
  const sampleBytes = await FormOps.createSampleFillableFormPdf();

  // 1. JSON Export
  const jsonExport = await FormOps.exportFormData(sampleBytes, 'json');
  assert.strictEqual(jsonExport.format, 'json');
  assert.strictEqual(jsonExport.extension, 'json');
  const parsedJson = JSON.parse(jsonExport.content);
  assert.ok(parsedJson.fields);
  assert.strictEqual(parsedJson.fields.full_name, 'Jane Doe');
  assert.strictEqual(parsedJson.fields.department, 'Engineering');
  assert.strictEqual(parsedJson.fields.terms_accepted, true);

  // 2. XFDF Export (Adobe Acrobat ISO standard)
  const xfdfExport = await FormOps.exportFormData(sampleBytes, 'xfdf');
  assert.strictEqual(xfdfExport.format, 'xfdf');
  assert.strictEqual(xfdfExport.extension, 'xfdf');
  assert.ok(xfdfExport.content.includes('<xfdf'));
  assert.ok(xfdfExport.content.includes('<field name="full_name">'));
  assert.ok(xfdfExport.content.includes('<value>Jane Doe</value>'));

  // 3. FDF Export (Classic Acrobat dictionary)
  const fdfExport = await FormOps.exportFormData(sampleBytes, 'fdf');
  assert.strictEqual(fdfExport.format, 'fdf');
  assert.ok(fdfExport.content.startsWith('%FDF-1.2'));
  assert.ok(fdfExport.content.includes('/T (full_name)'));

  // 4. CSV Export
  const csvExport = await FormOps.exportFormData(sampleBytes, 'csv');
  assert.strictEqual(csvExport.format, 'csv');
  assert.ok(csvExport.content.includes('"field_name","field_type","field_value","page"'));
  assert.ok(csvExport.content.includes('"full_name","text","Jane Doe","1"'));
});

test('FormOps - importFormData imports data from JSON, XFDF, and CSV into PDF forms', async () => {
  const sampleBytes = await FormOps.createSampleFillableFormPdf();

  // Import JSON
  const jsonData = JSON.stringify({
    fields: {
      full_name: 'JSON Imported Name',
      department: 'Finance & Accounting'
    }
  });
  const fromJsonPdf = await FormOps.importFormData(sampleBytes, jsonData, 'json');
  const inspectJson = await FormOps.inspectFormFields(fromJsonPdf);
  assert.strictEqual(inspectJson.fields.find(f => f.name === 'full_name')?.value, 'JSON Imported Name');
  assert.strictEqual(inspectJson.fields.find(f => f.name === 'department')?.value, 'Finance & Accounting');

  // Import XFDF
  const xfdfData = `<?xml version="1.0" encoding="UTF-8"?>
<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">
  <fields>
    <field name="full_name">
      <value>XFDF Imported User</value>
    </field>
    <field name="terms_accepted">
      <value>Off</value>
    </field>
  </fields>
</xfdf>`;
  const fromXfdfPdf = await FormOps.importFormData(sampleBytes, xfdfData, 'xfdf');
  const inspectXfdf = await FormOps.inspectFormFields(fromXfdfPdf);
  assert.strictEqual(inspectXfdf.fields.find(f => f.name === 'full_name')?.value, 'XFDF Imported User');
  assert.strictEqual(inspectXfdf.fields.find(f => f.name === 'terms_accepted')?.isChecked, false);

  // Import CSV
  const csvData = `"field_name","field_type","field_value","page"
"full_name","text","CSV Imported Person","1"
"department","dropdown","Marketing","1"`;
  const fromCsvPdf = await FormOps.importFormData(sampleBytes, csvData, 'csv');
  const inspectCsv = await FormOps.inspectFormFields(fromCsvPdf);
  assert.strictEqual(inspectCsv.fields.find(f => f.name === 'full_name')?.value, 'CSV Imported Person');
  assert.strictEqual(inspectCsv.fields.find(f => f.name === 'department')?.value, 'Marketing');
});

test('PageOperations - exposes FormOps methods on facade', () => {
  assert.strictEqual(typeof PageOperations.inspectFormFields, 'function');
  assert.strictEqual(typeof PageOperations.fillFormFields, 'function');
  assert.strictEqual(typeof PageOperations.exportFormData, 'function');
  assert.strictEqual(typeof PageOperations.importFormData, 'function');
  assert.strictEqual(typeof PageOperations.createSampleFillableFormPdf, 'function');
});

test('Backend API - /api/forms/* endpoints (inspect, fill, export-data, import-data, sample)', async () => {
  // 1. GET /api/forms/sample
  const reqSample = createMockReq('GET', '/api/forms/sample');
  const resSample = createMockRes();
  const handledSample = await handleFormRequest(reqSample, resSample, '/api/forms/sample', 'GET');
  assert.strictEqual(handledSample, true);
  assert.strictEqual(resSample.statusCode, 200);
  assert.strictEqual(resSample.headers['Content-Type'], 'application/pdf');
  const samplePdfBytes = resSample.body;
  assert.ok(samplePdfBytes instanceof Buffer);

  const sampleBase64 = samplePdfBytes.toString('base64');

  // 2. POST /api/forms/inspect
  const reqInspect = createMockReq('POST', '/api/forms/inspect', { pdfBase64: sampleBase64 });
  const resInspect = createMockRes();
  const handledInspect = await handleFormRequest(reqInspect, resInspect, '/api/forms/inspect', 'POST');
  assert.strictEqual(handledInspect, true);
  assert.strictEqual(resInspect.statusCode, 200);
  const inspectRes = JSON.parse(resInspect.body);
  assert.strictEqual(inspectRes.success, true);
  assert.strictEqual(inspectRes.hasForm, true);
  assert.ok(inspectRes.fieldCount >= 7);

  // 3. POST /api/forms/fill
  const reqFill = createMockReq('POST', '/api/forms/fill', {
    pdfBase64: sampleBase64,
    fields: { full_name: 'API Filled Name' },
    flatten: false
  });
  const resFill = createMockRes();
  const handledFill = await handleFormRequest(reqFill, resFill, '/api/forms/fill', 'POST');
  assert.strictEqual(handledFill, true);
  assert.strictEqual(resFill.statusCode, 200);
  const fillRes = JSON.parse(resFill.body);
  assert.strictEqual(fillRes.success, true);
  assert.ok(fillRes.pdfBase64);

  // 4. POST /api/forms/export-data
  const reqExport = createMockReq('POST', '/api/forms/export-data', {
    pdfBase64: fillRes.pdfBase64,
    format: 'xfdf'
  });
  const resExport = createMockRes();
  const handledExport = await handleFormRequest(reqExport, resExport, '/api/forms/export-data', 'POST');
  assert.strictEqual(handledExport, true);
  assert.strictEqual(resExport.statusCode, 200);
  const exportRes = JSON.parse(resExport.body);
  assert.strictEqual(exportRes.success, true);
  assert.strictEqual(exportRes.format, 'xfdf');
  assert.ok(exportRes.content.includes('API Filled Name'));

  // 5. POST /api/forms/import-data
  const reqImport = createMockReq('POST', '/api/forms/import-data', {
    pdfBase64: sampleBase64,
    dataContent: JSON.stringify({ fields: { full_name: 'Import API Name' } }),
    format: 'json'
  });
  const resImport = createMockRes();
  const handledImport = await handleFormRequest(reqImport, resImport, '/api/forms/import-data', 'POST');
  assert.strictEqual(handledImport, true);
  assert.strictEqual(resImport.statusCode, 200);
  const importRes = JSON.parse(resImport.body);
  assert.strictEqual(importRes.success, true);
  assert.ok(importRes.pdfBase64);
});
