import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { HeaderFooterOps } from '../src/core/engine/operations/header-footer-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleHeaderFooterRequest } from '../server/routes/header-footer-routes.js';

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

test('interpolateMacros replaces all dynamic macro tokens correctly', () => {
  const context = {
    pageNumber: 3,
    totalPages: 10,
    fileName: 'Annual_Report_2026.pdf',
    title: 'Financial Q3',
    author: 'Audit Team',
    date: '2026-10-24',
    time: '14:30'
  };

  const template = '<<Title>> | Page <<Page>> of <<TotalPages>> | By <<Author>> | <<Date>> <<Time>> (<<FileName>>)';
  const result = HeaderFooterOps.interpolateMacros(template, context);

  assert.strictEqual(
    result,
    'Financial Q3 | Page 3 of 10 | By Audit Team | 2026-10-24 14:30 (Annual_Report_2026.pdf)'
  );

  // Fallback / undefined handling
  const partial = HeaderFooterOps.interpolateMacros('Page <<Page>> / <<TotalPages>> - <<Author>>', {
    pageNumber: 1,
    totalPages: 5
  });
  assert.ok(partial.startsWith('Page 1 / 5'));
});

test('isPageIncluded evaluates all, odd, even, custom ranges, and skipFirst', () => {
  // All pages
  assert.strictEqual(HeaderFooterOps.isPageIncluded(1, 5, 'all', false), true);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(3, 5, 'all', false), true);

  // Skip first (cover page)
  assert.strictEqual(HeaderFooterOps.isPageIncluded(1, 5, 'all', true), false);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(2, 5, 'all', true), true);

  // Odd pages
  assert.strictEqual(HeaderFooterOps.isPageIncluded(1, 5, 'odd', false), true);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(2, 5, 'odd', false), false);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(3, 5, 'odd', false), true);

  // Even pages
  assert.strictEqual(HeaderFooterOps.isPageIncluded(1, 5, 'even', false), false);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(2, 5, 'even', false), true);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(4, 5, 'even', false), true);

  // Custom range string '2-4, 5'
  assert.strictEqual(HeaderFooterOps.isPageIncluded(1, 5, '2-4', false), false);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(2, 5, '2-4', false), true);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(3, 5, '2-4', false), true);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(4, 5, '2-4', false), true);
  assert.strictEqual(HeaderFooterOps.isPageIncluded(5, 5, '2-4', false), false);
});

test('createSampleHeaderFooterPdf produces a 4-page test document', async () => {
  const sampleBytes = await HeaderFooterOps.createSampleHeaderFooterPdf();
  assert.ok(sampleBytes instanceof Uint8Array);
  assert.ok(sampleBytes.byteLength > 800);

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('applyHeaderFooter stamps 6 zones, margins, and divider rules', async () => {
  const sampleBytes = await HeaderFooterOps.createSampleHeaderFooterPdf();

  const config = {
    leftHeader: 'CONFIDENTIAL',
    centerHeader: '<<Title>>',
    rightHeader: '<<Date>>',
    leftFooter: 'Author: <<Author>>',
    centerFooter: 'Page <<Page>> of <<TotalPages>>',
    rightFooter: '<<FileName>>',
    font: 'Helvetica',
    fontSize: 9,
    color: '#4338ca',
    marginTop: 36,
    marginBottom: 36,
    marginLeft: 40,
    marginRight: 40,
    showHeaderDivider: true,
    showFooterDivider: true,
    rangeRule: 'all',
    skipFirst: false
  };

  const result = await HeaderFooterOps.applyHeaderFooter(sampleBytes, config, {
    fileName: 'Annual_Report.pdf',
    title: 'Enterprise Architecture',
    author: 'Security Division'
  });

  assert.ok(result.bytes instanceof Uint8Array);
  assert.strictEqual(result.appliedCount, 4);
  assert.strictEqual(result.totalPages, 4);
  assert.ok(result.zones.leftHeader === 'CONFIDENTIAL');
  assert.ok(result.zones.centerFooter === 'Page <<Page>> of <<TotalPages>>');

  // Verify resulting PDF is loadable and has 4 pages
  const modifiedDoc = await PDFDocument.load(result.bytes);
  assert.strictEqual(modifiedDoc.getPageCount(), 4);
});

test('applyHeaderFooter respects skipFirst cover page option and range rules', async () => {
  const sampleBytes = await HeaderFooterOps.createSampleHeaderFooterPdf();

  const config = {
    centerHeader: 'INTERNAL ONLY',
    centerFooter: 'Page <<Page>> of <<TotalPages>>',
    rangeRule: 'all',
    skipFirst: true // skip cover page (page 1)
  };

  const result = await HeaderFooterOps.applyHeaderFooter(sampleBytes, config);
  assert.strictEqual(result.appliedCount, 3); // 4 total minus 1 cover page
  assert.strictEqual(result.totalPages, 4);

  // Even pages only
  const evenConfig = {
    centerHeader: 'EVEN PAGES ONLY',
    rangeRule: 'even',
    skipFirst: false
  };
  const evenResult = await HeaderFooterOps.applyHeaderFooter(sampleBytes, evenConfig);
  assert.strictEqual(evenResult.appliedCount, 2); // pages 2 and 4
});

test('PageOperations facade delegates to HeaderFooterOps', async () => {
  assert.strictEqual(typeof PageOperations.applyHeaderFooter, 'function');
  assert.strictEqual(typeof PageOperations.interpolateMacros, 'function');
  assert.strictEqual(typeof PageOperations.isPageIncluded, 'function');
  assert.strictEqual(typeof PageOperations.createSampleHeaderFooterPdf, 'function');

  const sampleBytes = await PageOperations.createSampleHeaderFooterPdf();
  const res = await PageOperations.applyHeaderFooter(sampleBytes, {
    centerFooter: '<<Page>>'
  });
  assert.strictEqual(res.appliedCount, 4);
});

test('Backend API: GET /api/header-footer/sample returns PDF buffer', async () => {
  const req = createMockReq('GET', '/api/header-footer/sample');
  const res = createMockRes();

  const handled = await handleHeaderFooterRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.ok(parsed.pdfBase64 && parsed.pdfBase64.length > 500);
  assert.strictEqual(parsed.filename, 'sample_header_footer_document.pdf');
});

test('Backend API: POST /api/header-footer/preview resolves macro tokens for UI', async () => {
  const req = createMockReq('POST', '/api/header-footer/preview', {
    config: {
      leftHeader: '<<Date>>',
      centerFooter: 'Page <<Page>> of <<TotalPages>>'
    },
    context: {
      pageNumber: 2,
      totalPages: 8,
      fileName: 'Draft.pdf'
    }
  });
  const res = createMockRes();

  const handled = await handleHeaderFooterRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.preview.centerFooter, 'Page 2 of 8');
  assert.ok(parsed.preview.leftHeader.length > 0);
});

test('Backend API: POST /api/header-footer/apply stamps base64 PDF and returns result', async () => {
  const sampleBytes = await HeaderFooterOps.createSampleHeaderFooterPdf();
  const base64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/header-footer/apply', {
    pdfBase64: base64,
    config: {
      centerHeader: 'STAMPED VIA BACKEND API',
      centerFooter: 'Page <<Page>> of <<TotalPages>>',
      skipFirst: true
    },
    fileName: 'API_Document.pdf'
  });
  const res = createMockRes();

  const handled = await handleHeaderFooterRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.appliedCount, 3);
  assert.strictEqual(parsed.totalPages, 4);
  assert.ok(parsed.pdfBase64 && parsed.pdfBase64.length > 100);
});

test('Backend API: handles missing payload and invalid inputs with 400', async () => {
  const req = createMockReq('POST', '/api/header-footer/apply', {
    pdfBase64: '' // Empty
  });
  const res = createMockRes();

  const handled = await handleHeaderFooterRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 400);

  const parsed = JSON.parse(res.body);
  assert.strictEqual(parsed.success, false);
  assert.ok(parsed.error.includes('Missing'));
});
