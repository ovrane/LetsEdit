import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, PDFName } from 'pdf-lib';
import { OutlineOps } from '../src/core/engine/operations/outline-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleOutlineRequest } from '../server/routes/outline-routes.js';

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

test('createSampleOutlinesPdf generates document with hierarchical outlines', async () => {
  const sampleBytes = await OutlineOps.createSampleOutlinesPdf();
  assert.ok(sampleBytes instanceof Uint8Array);
  assert.ok(sampleBytes.byteLength > 1000);

  const doc = await PDFDocument.load(sampleBytes, { updateMetadata: false });
  assert.strictEqual(doc.getPageCount(), 4);
  assert.ok(doc.catalog.has(PDFName.of('Outlines')), 'Catalog must contain /Outlines dictionary');
});

test('inspectOutlines extracts multi-level bookmarks, page targets, and styles', async () => {
  const sampleBytes = await OutlineOps.createSampleOutlinesPdf();
  const inspection = await OutlineOps.inspectOutlines(sampleBytes);

  assert.strictEqual(inspection.hasOutlines, true);
  assert.strictEqual(inspection.totalPages, 4);
  assert.ok(inspection.totalBookmarks >= 5, 'Should have at least 5 bookmarks');
  assert.strictEqual(inspection.items.length, 4, 'Root items should be 4');

  // Verify Chapter 1
  const ch1 = inspection.items[0];
  assert.strictEqual(ch1.title, '1. Executive Summary');
  assert.strictEqual(ch1.pageNumber, 1);
  assert.strictEqual(ch1.bold, true);
  assert.strictEqual(ch1.color, '#2563eb');

  // Verify Chapter 2 with nested children
  const ch2 = inspection.items[1];
  assert.strictEqual(ch2.title, '2. System Architecture');
  assert.strictEqual(ch2.pageNumber, 2);
  assert.strictEqual(ch2.children.length, 2, 'Chapter 2 must have 2 child bookmarks');

  const sec21 = ch2.children[0];
  assert.strictEqual(sec21.title, '2.1 Core Pipeline & Engine');
  assert.strictEqual(sec21.pageNumber, 2);
  assert.strictEqual(sec21.fitType, 'FitH');

  const sec22 = ch2.children[1];
  assert.strictEqual(sec22.title, '2.2 Client-Side WASM Modules');
  assert.strictEqual(sec22.italic, true);
});

test('applyOutlines attaches custom outline tree and updates references', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([500, 500]);
  doc.addPage([500, 500]);
  doc.addPage([500, 500]);
  const rawBytes = await doc.save();

  const customTree = [
    {
      id: 'bm_a',
      title: 'Section A: Foundations',
      pageNumber: 1,
      fitType: 'Fit',
      bold: true,
      italic: false,
      color: '#059669',
      children: [
        {
          id: 'bm_a1',
          title: 'A.1 Prerequisites',
          pageNumber: 2,
          fitType: 'FitH',
          bold: false,
          italic: true,
          color: '#0284c7',
          children: []
        }
      ]
    },
    {
      id: 'bm_b',
      title: 'Section B: Deployment',
      pageNumber: 3,
      fitType: 'Fit',
      bold: false,
      italic: false,
      color: '#dc2626',
      children: []
    }
  ];

  const updatedBytes = await OutlineOps.applyOutlines(rawBytes, customTree);
  assert.ok(updatedBytes instanceof Uint8Array);

  const inspection = await OutlineOps.inspectOutlines(updatedBytes);
  assert.strictEqual(inspection.hasOutlines, true);
  assert.strictEqual(inspection.totalBookmarks, 3);
  assert.strictEqual(inspection.items.length, 2);
  assert.strictEqual(inspection.items[0].children.length, 1);
  assert.strictEqual(inspection.items[0].children[0].title, 'A.1 Prerequisites');
  assert.strictEqual(inspection.items[0].children[0].pageNumber, 2);
});

test('removeOutlines deletes /Outlines dictionary cleanly', async () => {
  const sampleBytes = await OutlineOps.createSampleOutlinesPdf();
  const cleanedBytes = await OutlineOps.removeOutlines(sampleBytes);

  const doc = await PDFDocument.load(cleanedBytes, { updateMetadata: false });
  assert.strictEqual(doc.catalog.has(PDFName.of('Outlines')), false);

  const inspection = await OutlineOps.inspectOutlines(cleanedBytes);
  assert.strictEqual(inspection.hasOutlines, false);
  assert.strictEqual(inspection.totalBookmarks, 0);
  assert.strictEqual(inspection.items.length, 0);
});

test('exportToMarkdownTOC formats hierarchical Markdown string', () => {
  const testTree = [
    {
      title: 'Introduction',
      pageNumber: 1,
      bold: true,
      italic: false,
      children: [
        { title: 'Background', pageNumber: 2, bold: false, italic: false, children: [] }
      ]
    },
    {
      title: 'Conclusion',
      pageNumber: 3,
      bold: false,
      italic: true,
      children: []
    }
  ];

  const md = OutlineOps.exportToMarkdownTOC(testTree);
  assert.ok(md.includes('- [**Introduction**](#page=1) (p. 1)'));
  assert.ok(md.includes('  - [Background](#page=2) (p. 2)'));
  assert.ok(md.includes('- [*Conclusion*](#page=3) (p. 3)'));
});

test('PageOperations facade delegates outline operations seamlessly', async () => {
  const sample = await PageOperations.createSampleOutlinesPdf();
  assert.ok(sample instanceof Uint8Array);

  const inspection = await PageOperations.inspectOutlines(sample);
  assert.strictEqual(inspection.hasOutlines, true);
  assert.ok(inspection.totalBookmarks >= 5);

  const md = PageOperations.exportToMarkdownTOC(inspection.items);
  assert.ok(typeof md === 'string' && md.length > 0);

  const cleaned = await PageOperations.removeOutlines(sample);
  const reInspection = await PageOperations.inspectOutlines(cleaned);
  assert.strictEqual(reInspection.hasOutlines, false);
});

test('Backend API: GET /api/outlines/sample returns bookmarked PDF', async () => {
  const req = createMockReq('GET', '/api/outlines/sample');
  const res = createMockRes();

  const handled = await handleOutlineRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const payload = JSON.parse(res.body);
  assert.strictEqual(payload.success, true);
  assert.ok(payload.pdfBase64);
  assert.strictEqual(payload.filename, 'sample_bookmarked_document.pdf');
  assert.ok(payload.inspection.hasOutlines);
});

test('Backend API: POST /api/outlines/inspect extracts outline tree and markdown TOC', async () => {
  const sampleBytes = await OutlineOps.createSampleOutlinesPdf();
  const req = createMockReq('POST', '/api/outlines/inspect', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64')
  });
  const res = createMockRes();

  const handled = await handleOutlineRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const payload = JSON.parse(res.body);
  assert.strictEqual(payload.success, true);
  assert.strictEqual(payload.inspection.hasOutlines, true);
  assert.ok(payload.markdownTOC.includes('Executive Summary'));
});

test('Backend API: POST /api/outlines/apply applies bookmarks and returns re-inspection', async () => {
  const sampleBytes = await OutlineOps.createSampleOutlinesPdf();
  const customTree = [
    { title: 'Chapter 1: Overview', pageNumber: 1, fitType: 'Fit', bold: true, color: '#3b82f6', children: [] }
  ];

  const req = createMockReq('POST', '/api/outlines/apply', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64'),
    items: customTree
  });
  const res = createMockRes();

  const handled = await handleOutlineRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const payload = JSON.parse(res.body);
  assert.strictEqual(payload.success, true);
  assert.ok(payload.pdfBase64);
  assert.strictEqual(payload.inspection.totalBookmarks, 1);
  assert.strictEqual(payload.inspection.items[0].title, 'Chapter 1: Overview');
});

test('Backend API: Handles remove and error scenarios', async () => {
  const sampleBytes = await OutlineOps.createSampleOutlinesPdf();

  // POST /api/outlines/remove
  const reqRemove = createMockReq('POST', '/api/outlines/remove', {
    pdfBase64: Buffer.from(sampleBytes).toString('base64')
  });
  const resRemove = createMockRes();
  const handled = await handleOutlineRequest(reqRemove, resRemove);
  assert.strictEqual(handled, true);
  assert.strictEqual(resRemove.statusCode, 200);
  const removePayload = JSON.parse(resRemove.body);
  assert.strictEqual(removePayload.inspection.hasOutlines, false);

  // Missing payload in /inspect
  const reqMissing = createMockReq('POST', '/api/outlines/inspect', {});
  const resMissing = createMockRes();
  await handleOutlineRequest(reqMissing, resMissing);
  assert.strictEqual(resMissing.statusCode, 400);

  // Unhandled routes return false
  const reqOther = createMockReq('GET', '/api/unknown');
  const resOther = createMockRes();
  assert.strictEqual(await handleOutlineRequest(reqOther, resOther), false);
});
