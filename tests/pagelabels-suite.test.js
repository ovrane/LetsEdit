import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import {
  PageLabelsOps,
  toRoman,
  toAlpha,
  formatPageLabel
} from '../src/core/engine/operations/pagelabels-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handlePageLabelsRequest } from '../server/routes/pagelabels-routes.js';

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

test('toRoman & toAlpha conversion utilities produce accurate numbering', () => {
  assert.strictEqual(toRoman(1, false), 'i');
  assert.strictEqual(toRoman(4, false), 'iv');
  assert.strictEqual(toRoman(9, true), 'IX');
  assert.strictEqual(toRoman(14, false), 'xiv');
  assert.strictEqual(toRoman(40, true), 'XL');
  assert.strictEqual(toRoman(90, true), 'XC');
  assert.strictEqual(toRoman(2026, false), 'mmxxvi');

  assert.strictEqual(toAlpha(1, false), 'a');
  assert.strictEqual(toAlpha(26, false), 'z');
  assert.strictEqual(toAlpha(27, true), 'AA');
  assert.strictEqual(toAlpha(28, false), 'ab');
});

test('formatPageLabel combines style, prefix, startAt, and offset correctly', () => {
  assert.strictEqual(formatPageLabel('r', 'Pref. ', 1, 0), 'Pref. i');
  assert.strictEqual(formatPageLabel('r', 'Pref. ', 1, 2), 'Pref. iii');
  assert.strictEqual(formatPageLabel('D', '', 1, 4), '5');
  assert.strictEqual(formatPageLabel('A', 'Appendix ', 1, 1), 'Appendix B');
  assert.strictEqual(formatPageLabel('R', 'Vol. ', 3, 0), 'Vol. III');
});

test('PageLabelsOps - createSamplePageLabelsPdf creates multi-section document', async () => {
  const sampleBytes = await PageLabelsOps.createSamplePageLabelsPdf();
  assert.ok(sampleBytes && sampleBytes.length > 0);

  const inspection = await PageLabelsOps.inspectPageLabels(sampleBytes);
  assert.strictEqual(inspection.hasPageLabels, true);
  assert.strictEqual(inspection.totalPages, 5);
  assert.strictEqual(inspection.sections.length, 2);

  // Section 1: Roman lower
  assert.strictEqual(inspection.sections[0].style, 'r');
  assert.strictEqual(inspection.sections[0].fromPage, 1);
  assert.strictEqual(inspection.sections[0].toPage, 2);

  // Section 2: Decimal
  assert.strictEqual(inspection.sections[1].style, 'D');
  assert.strictEqual(inspection.sections[1].fromPage, 3);
  assert.strictEqual(inspection.sections[1].toPage, 5);

  // Check generated page labels
  assert.strictEqual(inspection.pageLabels[0].label, 'i');
  assert.strictEqual(inspection.pageLabels[1].label, 'ii');
  assert.strictEqual(inspection.pageLabels[2].label, '1');
  assert.strictEqual(inspection.pageLabels[3].label, '2');
  assert.strictEqual(inspection.pageLabels[4].label, '3');
});

test('PageLabelsOps - applyPageLabels injects ISO 32000-1 /PageLabels tree and visual stamp', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([500, 700]);
  doc.addPage([500, 700]);
  doc.addPage([500, 700]);
  doc.addPage([500, 700]);
  const initialBytes = await doc.save({ updateProperties: false });

  const updatedBytes = await PageLabelsOps.applyPageLabels(
    initialBytes,
    [
      { fromPage: 1, toPage: 1, style: 'r', prefix: 'Intro-', startAt: 1 },
      { fromPage: 2, toPage: 4, style: 'D', prefix: 'P-', startAt: 10 }
    ],
    { stampVisual: true, position: 'bottom-center' }
  );

  const inspection = await PageLabelsOps.inspectPageLabels(updatedBytes);
  assert.strictEqual(inspection.hasPageLabels, true);
  assert.strictEqual(inspection.totalPages, 4);
  assert.strictEqual(inspection.pageLabels[0].label, 'Intro-i');
  assert.strictEqual(inspection.pageLabels[1].label, 'P-10');
  assert.strictEqual(inspection.pageLabels[2].label, 'P-11');
  assert.strictEqual(inspection.pageLabels[3].label, 'P-12');
});

test('PageLabelsOps - removePageLabels deletes /PageLabels dictionary and reverts to unsectioned', async () => {
  const sampleBytes = await PageLabelsOps.createSamplePageLabelsPdf();
  const unsectionedBytes = await PageLabelsOps.removePageLabels(sampleBytes);

  const inspection = await PageLabelsOps.inspectPageLabels(unsectionedBytes);
  assert.strictEqual(inspection.hasPageLabels, false);
  assert.strictEqual(inspection.pageLabels[0].label, '1');
  assert.strictEqual(inspection.pageLabels[1].label, '2');
});

test('PageOperations facade delegates PageLabelsOps seamlessly', async () => {
  const sample = await PageOperations.createSamplePageLabelsPdf();
  assert.ok(sample && sample.length > 0);

  const inspected = await PageOperations.inspectPageLabels(sample);
  assert.strictEqual(inspected.hasPageLabels, true);

  const reapplied = await PageOperations.applyPageLabels(sample, [
    { fromPage: 1, toPage: 5, style: 'A', prefix: 'Sheet-', startAt: 1 }
  ]);
  const reInspected = await PageOperations.inspectPageLabels(reapplied);
  assert.strictEqual(reInspected.pageLabels[0].label, 'Sheet-A');
  assert.strictEqual(reInspected.pageLabels[1].label, 'Sheet-B');

  const removed = await PageOperations.removePageLabels(reapplied);
  const removedInspected = await PageOperations.inspectPageLabels(removed);
  assert.strictEqual(removedInspected.hasPageLabels, false);
});

test('Backend API - GET /api/pagelabels/sample returns sample document', async () => {
  const req = createMockReq('GET', '/api/pagelabels/sample');
  const res = createMockRes();

  await handlePageLabelsRequest(req, res, '/api/pagelabels/sample', 'GET');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.ok(data.pdfBase64 && data.pdfBase64.length > 100);
  assert.strictEqual(data.filename, 'sample_pagelabels_document.pdf');
});

test('Backend API - POST /api/pagelabels/inspect analyzes document page labels', async () => {
  const sampleBytes = await PageLabelsOps.createSamplePageLabelsPdf();
  const b64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/pagelabels/inspect', { pdfBase64: b64 });
  const res = createMockRes();

  await handlePageLabelsRequest(req, res, '/api/pagelabels/inspect', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.inspection.hasPageLabels, true);
  assert.strictEqual(data.inspection.sections.length, 2);
});

test('Backend API - POST /api/pagelabels/apply updates page labels and returns base64', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([500, 700]);
  doc.addPage([500, 700]);
  const initialBytes = await doc.save({ updateProperties: false });
  const b64 = Buffer.from(initialBytes).toString('base64');

  const req = createMockReq('POST', '/api/pagelabels/apply', {
    pdfBase64: b64,
    sections: [
      { fromPage: 1, toPage: 2, style: 'R', prefix: 'Vol.', startAt: 5 }
    ]
  });
  const res = createMockRes();

  await handlePageLabelsRequest(req, res, '/api/pagelabels/apply', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.inspection.pageLabels[0].label, 'Vol.V');
  assert.strictEqual(data.inspection.pageLabels[1].label, 'Vol.VI');
  assert.ok(data.pdfBase64);
});

test('Backend API - POST /api/pagelabels/remove reverts to unsectioned numbering', async () => {
  const sampleBytes = await PageLabelsOps.createSamplePageLabelsPdf();
  const b64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/pagelabels/remove', { pdfBase64: b64 });
  const res = createMockRes();

  await handlePageLabelsRequest(req, res, '/api/pagelabels/remove', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.inspection.hasPageLabels, false);
  assert.strictEqual(data.inspection.pageLabels[0].label, '1');
});
