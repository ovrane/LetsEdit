import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { PageNumbersOps } from '../src/core/engine/operations/pagenumbers-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handlePageNumbersRequest } from '../server/routes/pagenumbers-routes.js';

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

test('createSamplePageNumbersPdf produces a 4-page whitepaper with metadata', async () => {
  const sampleBytes = await PageNumbersOps.createSamplePageNumbersPdf();
  assert(sampleBytes instanceof Uint8Array, 'Sample should be Uint8Array');
  assert(sampleBytes.length > 500, 'Sample should not be empty');

  const doc = await PDFDocument.load(sampleBytes);
  assert.strictEqual(doc.getPageCount(), 4, 'Sample must have 4 pages');
  assert.strictEqual(doc.getTitle(), 'Peer-Reviewed Computational Linguistics Whitepaper');
});

test('toRoman generates correct lowercase and uppercase Roman numerals', () => {
  assert.strictEqual(PageNumbersOps.toRoman(1, false), 'i');
  assert.strictEqual(PageNumbersOps.toRoman(4, false), 'iv');
  assert.strictEqual(PageNumbersOps.toRoman(9, false), 'ix');
  assert.strictEqual(PageNumbersOps.toRoman(14, false), 'xiv');
  assert.strictEqual(PageNumbersOps.toRoman(40, false), 'xl');

  assert.strictEqual(PageNumbersOps.toRoman(1, true), 'I');
  assert.strictEqual(PageNumbersOps.toRoman(5, true), 'V');
  assert.strictEqual(PageNumbersOps.toRoman(10, true), 'X');
  assert.strictEqual(PageNumbersOps.toRoman(50, true), 'L');
  assert.strictEqual(PageNumbersOps.toRoman(100, true), 'C');
});

test('toLetters generates correct lowercase and uppercase alphabetical numbering', () => {
  assert.strictEqual(PageNumbersOps.toLetters(1, false), 'a');
  assert.strictEqual(PageNumbersOps.toLetters(2, false), 'b');
  assert.strictEqual(PageNumbersOps.toLetters(26, false), 'z');
  assert.strictEqual(PageNumbersOps.toLetters(27, false), 'aa');

  assert.strictEqual(PageNumbersOps.toLetters(1, true), 'A');
  assert.strictEqual(PageNumbersOps.toLetters(26, true), 'Z');
  assert.strictEqual(PageNumbersOps.toLetters(28, true), 'AB');
});

test('formatNumber interpolates {n}, {total}, and dynamic macros', () => {
  const currentYear = new Date().getFullYear();
  const res1 = PageNumbersOps.formatNumber(1, 10, 'Page {n} of {total}', 'arabic');
  assert.strictEqual(res1, 'Page 1 of 10');

  const res2 = PageNumbersOps.formatNumber(3, 10, '{n} / {total}', 'roman-lower');
  assert.strictEqual(res2, 'iii / 10');

  const res3 = PageNumbersOps.formatNumber(4, 8, 'Report-<<Year>>: {n}', 'arabic');
  assert.strictEqual(res3, `Report-${currentYear}: 4`);

  const res4 = PageNumbersOps.formatNumber(2, 5, 'Doc: <<FileName>> - {n}', 'alpha-upper', { fileName: 'Quarterly_Review.pdf' });
  assert.strictEqual(res4, 'Doc: Quarterly_Review - B');
});

test('getIncludedPageIndices handles all, skip-cover, odd, even, and custom range rules', () => {
  assert.deepStrictEqual(PageNumbersOps.getIncludedPageIndices(4, 'all'), [0, 1, 2, 3]);
  assert.deepStrictEqual(PageNumbersOps.getIncludedPageIndices(4, 'skip-cover'), [1, 2, 3]);
  assert.deepStrictEqual(PageNumbersOps.getIncludedPageIndices(4, 'odd'), [0, 2]);
  assert.deepStrictEqual(PageNumbersOps.getIncludedPageIndices(4, 'even'), [1, 3]);
  assert.deepStrictEqual(PageNumbersOps.getIncludedPageIndices(6, '2-4, 6'), [1, 2, 3, 5]);
});

test('calculatePosition resolves coordinates for all 6 zones respecting margins', () => {
  const margins = { top: 36, bottom: 36, left: 36, right: 36 };
  const width = 600;
  const height = 800;
  const textWidth = 80;
  const fontSize = 10;

  const tl = PageNumbersOps.calculatePosition('top-left', width, height, textWidth, fontSize, margins);
  assert.strictEqual(tl.x, 36);
  assert.strictEqual(tl.y, 800 - 36 - 10);

  const tc = PageNumbersOps.calculatePosition('top-center', width, height, textWidth, fontSize, margins);
  assert.strictEqual(tc.x, (600 - 80) / 2);
  assert.strictEqual(tc.y, 800 - 36 - 10);

  const tr = PageNumbersOps.calculatePosition('top-right', width, height, textWidth, fontSize, margins);
  assert.strictEqual(tr.x, 600 - 36 - 80);
  assert.strictEqual(tr.y, 800 - 36 - 10);

  const bl = PageNumbersOps.calculatePosition('bottom-left', width, height, textWidth, fontSize, margins);
  assert.strictEqual(bl.x, 36);
  assert.strictEqual(bl.y, 36);

  const bc = PageNumbersOps.calculatePosition('bottom-center', width, height, textWidth, fontSize, margins);
  assert.strictEqual(bc.x, (600 - 80) / 2);
  assert.strictEqual(bc.y, 36);

  const br = PageNumbersOps.calculatePosition('bottom-right', width, height, textWidth, fontSize, margins);
  assert.strictEqual(br.x, 600 - 36 - 80);
  assert.strictEqual(br.y, 36);
});

test('applyPageNumbers with standard Arabic applies numbers across all pages', async () => {
  const sampleBytes = await PageNumbersOps.createSamplePageNumbersPdf();
  const { pdfBytes, report } = await PageNumbersOps.applyPageNumbers(sampleBytes, {
    style: 'arabic',
    formatTemplate: 'Page {n} of {total}',
    position: 'bottom-center',
    range: 'all'
  });

  assert(pdfBytes instanceof Uint8Array);
  assert.strictEqual(report.stampedCount, 4);
  assert.strictEqual(report.totalPages, 4);
  assert.strictEqual(report.startFormatted, 'Page 1 of 4');
  assert.strictEqual(report.endFormatted, 'Page 4 of 4');

  const doc = await PDFDocument.load(pdfBytes);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('applyPageNumbers with Roman numerals and skip-cover skips page 1', async () => {
  const sampleBytes = await PageNumbersOps.createSamplePageNumbersPdf();
  const { pdfBytes, report } = await PageNumbersOps.applyPageNumbers(sampleBytes, {
    style: 'roman-lower',
    formatTemplate: '- {n} -',
    position: 'bottom-right',
    range: 'skip-cover',
    firstNumber: 1
  });

  assert(pdfBytes instanceof Uint8Array);
  assert.strictEqual(report.stampedCount, 3);
  assert.strictEqual(report.startFormatted, '- i -');
  assert.strictEqual(report.endFormatted, '- iii -');
  assert.deepStrictEqual(report.stampedPages, [2, 3, 4]);
});

test('applyPageNumbers with custom font, font size, and color', async () => {
  const sampleBytes = await PageNumbersOps.createSamplePageNumbersPdf();
  const { pdfBytes, report } = await PageNumbersOps.applyPageNumbers(sampleBytes, {
    style: 'alpha-upper',
    formatTemplate: '{n}',
    position: 'top-right',
    fontFamily: 'times',
    fontSize: 14,
    textColor: '#dc2626',
    range: 'odd'
  });

  assert(pdfBytes instanceof Uint8Array);
  assert.strictEqual(report.stampedCount, 2);
  assert.strictEqual(report.fontFamily, 'times');
  assert.strictEqual(report.fontSize, 14);
  assert.strictEqual(report.textColor, '#dc2626');
  assert.deepStrictEqual(report.stampedPages, [1, 3]);
});

test('PageOperations facade methods delegate to PageNumbersOps', async () => {
  const sampleBytes = await PageOperations.createSamplePageNumbersPdf();
  assert(sampleBytes instanceof Uint8Array);

  const res1 = await PageOperations.applyPageNumbers(sampleBytes, {
    formatTemplate: '{n} / {total}',
    position: 'bottom-center'
  });
  assert(res1.pdfBytes instanceof Uint8Array);
  assert.strictEqual(res1.report.stampedCount, 4);

  const res2Bytes = await PageOperations.addPageNumbers(sampleBytes, {
    formatTemplate: 'Page {n}'
  });
  assert(res2Bytes instanceof Uint8Array);
  const doc = await PDFDocument.load(res2Bytes);
  assert.strictEqual(doc.getPageCount(), 4);
});

test('handlePageNumbersRequest GET /api/pagenumbers/sample returns binary PDF and JSON base64', async () => {
  // Test binary
  const req1 = createMockReq('GET', '/api/pagenumbers/sample', null, { accept: 'application/pdf' });
  const res1 = createMockRes();
  const handled1 = await handlePageNumbersRequest(req1, res1);
  assert.strictEqual(handled1, true);
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.headers['Content-Type'], 'application/pdf');

  // Test JSON base64
  const req2 = createMockReq('GET', '/api/pagenumbers/sample?format=json');
  const res2 = createMockRes();
  const handled2 = await handlePageNumbersRequest(req2, res2);
  assert.strictEqual(handled2, true);
  assert.strictEqual(res2.statusCode, 200);
  const parsed = JSON.parse(res2.body);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.pageCount, 4);
  assert(typeof parsed.pdfBase64 === 'string');
});

test('handlePageNumbersRequest POST /api/pagenumbers/preview returns calculated string and coordinates', async () => {
  const req = createMockReq('POST', '/api/pagenumbers/preview', {
    style: 'arabic',
    formatTemplate: 'Page {n} of {total}',
    firstNumber: 1,
    position: 'bottom-center',
    pageCount: 12
  });
  const res = createMockRes();
  const handled = await handlePageNumbersRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.previewText, 'Page 1 of 12');
  assert.strictEqual(data.position, 'bottom-center');
  assert(data.coordinates.x > 0);
  assert(data.coordinates.y > 0);
});

test('handlePageNumbersRequest POST /api/pagenumbers/apply stamps numbers and returns base64 and report', async () => {
  const sampleBytes = await PageNumbersOps.createSamplePageNumbersPdf();
  const sampleBase64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/pagenumbers/apply', {
    fileData: sampleBase64,
    fileName: 'Whitepaper.pdf',
    style: 'arabic',
    formatTemplate: 'Page {n} of {total}',
    position: 'bottom-center',
    range: 'all'
  });
  const res = createMockRes();
  const handled = await handlePageNumbersRequest(req, res);
  assert.strictEqual(handled, true);
  assert.strictEqual(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert(typeof data.pdfBase64 === 'string');
  assert.strictEqual(data.report.stampedCount, 4);
  assert.strictEqual(data.report.startFormatted, 'Page 1 of 4');
  assert.strictEqual(data.report.endFormatted, 'Page 4 of 4');
});
