import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, PDFName, StandardFonts } from 'pdf-lib';
import { MergeOps } from '../src/core/engine/operations/merge-ops.js';
import { SplitOps } from '../src/core/engine/operations/split-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleSplitMergeRequest } from '../server/routes/split-merge-routes.js';

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

// Helper to create a test PDF with text
async function createTestDocWithPages(pageTexts) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageTexts.length; i++) {
    const page = doc.addPage([500, 700]);
    page.drawText(pageTexts[i], { x: 50, y: 650, size: 14, font });
  }
  return await doc.save();
}

test('MergeOps - mergePdfAdvanced merges documents with Table of Contents (TOC)', async () => {
  const doc1 = await createTestDocWithPages(['Document One Content']);
  const doc2 = await createTestDocWithPages(['Document Two Content']);

  const files = [
    { name: 'Financial_Report.pdf', bytes: doc1 },
    { name: 'Audit_Summary.pdf', bytes: doc2 }
  ];

  const mergedBytes = await MergeOps.mergePdfAdvanced(files, {
    generateToc: true,
    tocTitle: 'Executive Summary Index'
  });

  assert.ok(mergedBytes instanceof Uint8Array);
  const resultDoc = await PDFDocument.load(mergedBytes);

  // 2 original pages + 1 TOC page = 3 pages
  assert.strictEqual(resultDoc.getPageCount(), 3);
});

test('MergeOps - mergePdfAdvanced injects Cover Page and continuous page numbers', async () => {
  const doc1 = await createTestDocWithPages(['Report Section 1']);
  const doc2 = await createTestDocWithPages(['Report Section 2']);

  const files = [
    { name: 'Section_A.pdf', bytes: doc1 },
    { name: 'Section_B.pdf', bytes: doc2 }
  ];

  const mergedBytes = await MergeOps.mergePdfAdvanced(files, {
    addCoverPage: true,
    coverTitle: 'Annual Corporate Filing',
    generateToc: true,
    addPageNumbers: true
  });

  const resultDoc = await PDFDocument.load(mergedBytes);
  // 1 cover + 1 TOC + 2 document pages = 4 pages
  assert.strictEqual(resultDoc.getPageCount(), 4);
});

test('MergeOps - mergePdfAdvanced creates PDF Outline Bookmarks (/Outlines)', async () => {
  const doc1 = await createTestDocWithPages(['Page from doc 1']);
  const doc2 = await createTestDocWithPages(['Page from doc 2']);

  const files = [
    { name: 'Alpha.pdf', bytes: doc1 },
    { name: 'Beta.pdf', bytes: doc2 }
  ];

  const mergedBytes = await MergeOps.mergePdfAdvanced(files, {
    includeBookmarks: true
  });

  const resultDoc = await PDFDocument.load(mergedBytes);
  assert.strictEqual(resultDoc.catalog.has(PDFName.of('Outlines')), true);
});

test('SplitOps - splitByText partitions document by keyword occurrence (contains mode)', async () => {
  const docBytes = await createTestDocWithPages([
    'Invoice Header for Customer A',
    'Customer A line items and details',
    'Invoice Header for Customer B',
    'Customer B line items and details'
  ]);

  const splits = await SplitOps.splitByText(docBytes, {
    keyword: 'Invoice',
    mode: 'contains',
    filenamePattern: 'Order_[n].pdf'
  });

  assert.strictEqual(splits.length, 2);
  assert.strictEqual(splits[0].name, 'Order_1.pdf');
  assert.strictEqual(splits[0].pageCount, 2);
  assert.strictEqual(splits[0].pages, '1-2');

  assert.strictEqual(splits[1].name, 'Order_2.pdf');
  assert.strictEqual(splits[1].pageCount, 2);
  assert.strictEqual(splits[1].pages, '3-4');

  // Verify sub-documents are valid PDFs
  const subDoc1 = await PDFDocument.load(splits[0].bytes);
  assert.strictEqual(subDoc1.getPageCount(), 2);
});

test('SplitOps - splitByText partitions document when captured regex value changes (change mode)', async () => {
  const docBytes = await createTestDocWithPages([
    'Statement for Account #ACC-1001 (Page 1 of 2)',
    'Statement for Account #ACC-1001 (Page 2 of 2)',
    'Statement for Account #ACC-2002 (Page 1 of 1)'
  ]);

  const splits = await SplitOps.splitByText(docBytes, {
    keyword: /Account\s*#?([A-Za-z0-9_-]+)/i,
    mode: 'change',
    filenamePattern: 'Statement_[text].pdf'
  });

  assert.strictEqual(splits.length, 2);
  assert.strictEqual(splits[0].name, 'Statement_ACC-1001.pdf');
  assert.strictEqual(splits[0].pageCount, 2);

  assert.strictEqual(splits[1].name, 'Statement_ACC-2002.pdf');
  assert.strictEqual(splits[1].pageCount, 1);
});

test('PageOperations facade delegates mergePdfAdvanced and splitByText seamlessly', async () => {
  const doc1 = await createTestDocWithPages(['Invoice #555 Part 1']);
  const doc2 = await createTestDocWithPages(['Invoice #666 Part 2']);

  const merged = await PageOperations.mergePdfAdvanced([
    { name: 'Doc1.pdf', bytes: doc1 },
    { name: 'Doc2.pdf', bytes: doc2 }
  ], { generateToc: true });

  assert.ok(merged.byteLength > 500);

  const splits = await PageOperations.splitByText(merged, {
    keyword: 'Invoice',
    mode: 'contains'
  });
  assert.ok(splits.length >= 2);
});

test('Split & Merge API Route - POST /api/merge/advanced generates combined PDF', async () => {
  const doc1 = await createTestDocWithPages(['Document One API']);
  const doc2 = await createTestDocWithPages(['Document Two API']);

  const req = createMockReq('POST', '/api/merge/advanced', {
    files: [
      { name: 'DocA.pdf', base64: Buffer.from(doc1).toString('base64') },
      { name: 'DocB.pdf', base64: Buffer.from(doc2).toString('base64') }
    ],
    options: {
      generateToc: true,
      includeBookmarks: true
    }
  });
  const res = createMockRes();

  const handled = await handleSplitMergeRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.ok(data.mergedPdfBase64.length > 100);

  const mergedBuf = Buffer.from(data.mergedPdfBase64, 'base64');
  const loaded = await PDFDocument.load(mergedBuf);
  assert.strictEqual(loaded.getPageCount(), 3);
});

test('Split & Merge API Route - POST /api/split/by-text splits uploaded PDF by keyword', async () => {
  const docBytes = await createTestDocWithPages([
    'Invoice #701 Client A',
    'Invoice #702 Client B'
  ]);
  const base64 = Buffer.from(docBytes).toString('base64');

  const req = createMockReq('POST', '/api/split/by-text', {
    pdfBase64: base64,
    keyword: 'Invoice',
    mode: 'contains',
    filenamePattern: 'Split_[text]_[n].pdf'
  });
  const res = createMockRes();

  const handled = await handleSplitMergeRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.totalSplits, 2);
  assert.strictEqual(data.splits[0].name, 'Split_Invoice_1.pdf');
  assert.strictEqual(data.splits[1].name, 'Split_Invoice_2.pdf');
});

test('MergeOps - insertBlankPage inserts blank page at target position', async () => {
  const docBytes = await createTestDocWithPages(['Page 1', 'Page 2']);
  const withInserted = await MergeOps.insertBlankPage(docBytes, 0); // after index 0
  const loaded = await PDFDocument.load(withInserted);
  assert.strictEqual(loaded.getPageCount(), 3);
});

test('MergeOps - duplicatePage clones page at target index', async () => {
  const docBytes = await createTestDocWithPages(['Page 1', 'Page 2']);
  const withDuplicated = await MergeOps.duplicatePage(docBytes, 1); // duplicate page index 1
  const loaded = await PDFDocument.load(withDuplicated);
  assert.strictEqual(loaded.getPageCount(), 3);
});

test('PageOperations facade exposes insertBlankPage and duplicatePage', async () => {
  const docBytes = await createTestDocWithPages(['Only Page']);
  const dup = await PageOperations.duplicatePage(docBytes, 0);
  const loaded = await PDFDocument.load(dup);
  assert.strictEqual(loaded.getPageCount(), 2);
});
