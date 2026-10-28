import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { HtmlToPdfOps } from '../src/core/engine/operations/html-to-pdf-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleHtmlToPdfRequest } from '../server/routes/html-to-pdf-routes.js';

test('HTML5 to PDF Suite - createSampleHtmlString returns valid technical HTML', () => {
  const html = HtmlToPdfOps.createSampleHtmlString();
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('<h1>LetsEdit: Client-Side WebAssembly PDF Architecture</h1>'));
  assert.ok(html.includes('<table>'));
  assert.ok(html.includes('<pre><code>'));
  assert.ok(html.includes('<div class="page-break"></div>'));
});

test('HTML5 to PDF Suite - createSampleMarkdownString returns valid GFM markdown', () => {
  const md = HtmlToPdfOps.createSampleMarkdownString();
  assert.ok(typeof md === 'string');
  assert.ok(md.includes('# LetsEdit Markdown Specification Document'));
  assert.ok(md.includes('| Feature | Legacy Cloud Editors | LetsEdit WASM Engine |'));
  assert.ok(md.includes('```javascript'));
});

test('HTML5 to PDF Suite - parseMarkdownToAst parses tokens accurately', () => {
  const md = `# Title
## Subtitle
> Important note
- Item 1
- Item 2
1. Step 1
| A | B |
| --- | --- |
| 1 | 2 |
\`\`\`javascript
const x = 10;
\`\`\`
---`;
  const tokens = HtmlToPdfOps.parseMarkdownToAst(md);
  assert.ok(tokens.length >= 7);
  assert.equal(tokens[0].type, 'heading');
  assert.equal(tokens[0].level, 1);
  assert.equal(tokens[0].text, 'Title');
  assert.equal(tokens[1].type, 'heading');
  assert.equal(tokens[1].level, 2);
  assert.equal(tokens[2].type, 'blockquote');
  assert.equal(tokens[3].type, 'list-item');
  assert.equal(tokens[4].type, 'list-item');
  assert.equal(tokens[5].type, 'list-item');
  assert.equal(tokens[5].ordered, true);
  const tableToken = tokens.find(t => t.type === 'table');
  assert.ok(tableToken);
  assert.deepEqual(tableToken.headers, ['A', 'B']);
  assert.equal(tableToken.rows.length, 1);
  const codeToken = tokens.find(t => t.type === 'codeblock');
  assert.ok(codeToken);
  assert.equal(codeToken.language, 'javascript');
});

test('HTML5 to PDF Suite - parseHtmlToAst extracts semantic elements and tables', () => {
  const html = `<html><head><title>Test Title</title></head><body>
    <h1>Heading 1</h1>
    <p>Paragraph content</p>
    <table>
      <thead><tr><th>Col 1</th><th>Col 2</th></tr></thead>
      <tbody><tr><td>Data 1</td><td>Data 2</td></tr></tbody>
    </table>
    <pre><code>console.log('hello');</code></pre>
  </body></html>`;
  const { docTitle, tokens } = HtmlToPdfOps.parseHtmlToAst(html);
  assert.equal(docTitle, 'Test Title');
  assert.ok(tokens.length >= 4);
  assert.equal(tokens[0].type, 'heading');
  assert.equal(tokens[0].text, 'Heading 1');
  assert.equal(tokens[1].type, 'paragraph');
  assert.equal(tokens[1].text, 'Paragraph content');
  const tableToken = tokens.find(t => t.type === 'table');
  assert.ok(tableToken);
  assert.deepEqual(tableToken.headers, ['Col 1', 'Col 2']);
  assert.deepEqual(tableToken.rows, [['Data 1', 'Data 2']]);
});

test('HTML5 to PDF Suite - convertHtmlToPdf produces valid vector PDF with pagination and report', async () => {
  const sampleHtml = HtmlToPdfOps.createSampleHtmlString();
  const result = await HtmlToPdfOps.convertHtmlToPdf(sampleHtml, {
    theme: 'modern',
    pageSize: 'A4',
    orientation: 'portrait',
    title: 'Client-Side WASM Paper'
  });

  assert.ok(result.pdfBytes instanceof Uint8Array);
  assert.ok(result.pdfBytes.length > 1000);
  assert.ok(result.report);
  assert.equal(result.report.theme, 'modern');
  assert.ok(result.report.pages >= 2);
  assert.ok(result.report.headings >= 3);
  assert.ok(result.report.tables >= 1);
  assert.ok(result.report.codeBlocks >= 1);

  // Validate resulting document in pdf-lib
  const doc = await PDFDocument.load(result.pdfBytes);
  assert.equal(doc.getPageCount(), result.report.pages);
  assert.equal(doc.getTitle(), 'Client-Side WASM Paper');
});

test('HTML5 to PDF Suite - convertMarkdownToPdf supports custom themes (technical, academic, elegant)', async () => {
  const sampleMd = HtmlToPdfOps.createSampleMarkdownString();

  for (const theme of ['technical', 'academic', 'elegant']) {
    const res = await HtmlToPdfOps.convertMarkdownToPdf(sampleMd, {
      theme,
      pageSize: 'Letter',
      orientation: 'portrait'
    });

    assert.ok(res.pdfBytes instanceof Uint8Array);
    assert.equal(res.report.theme, theme);
    assert.equal(res.report.format, 'markdown');
    assert.ok(res.report.pages >= 1);

    const doc = await PDFDocument.load(res.pdfBytes);
    assert.ok(doc.getPageCount() >= 1);
  }
});

test('HTML5 to PDF Suite - PageOperations facade delegates htmlToPdf and markdownToPdf', async () => {
  const sampleHtml = '<h1>Facade Test</h1><p>Testing PageOperations facade method.</p>';
  const pdfBytes = await PageOperations.htmlToPdf(sampleHtml, { title: 'Facade Title' });

  assert.ok(pdfBytes instanceof Uint8Array);
  const doc = await PDFDocument.load(pdfBytes);
  assert.equal(doc.getTitle(), 'Facade Title');
  assert.equal(doc.getPageCount(), 1);

  const sampleMd = '# Facade Markdown\nTesting PageOperations markdownToPdf.';
  const mdPdfBytes = await PageOperations.markdownToPdf(sampleMd, { title: 'MD Facade' });
  assert.ok(mdPdfBytes instanceof Uint8Array);
  const mdDoc = await PDFDocument.load(mdPdfBytes);
  assert.equal(mdDoc.getTitle(), 'MD Facade');
});

test('HTML5 to PDF Suite - Backend HTTP routes serve /api/html-to-pdf/sample and convert', async () => {
  // Test GET /api/html-to-pdf/sample
  let statusCode = 0;
  let responseData = null;
  const mockResSample = {
    writeHead(code, headers) { statusCode = code; },
    end(payload) { responseData = JSON.parse(payload); }
  };

  const handledSample = await handleHtmlToPdfRequest({
    method: 'GET',
    url: '/api/html-to-pdf/sample'
  }, mockResSample, '/api/html-to-pdf/sample', 'GET');

  assert.equal(handledSample, true);
  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.ok(responseData.html.includes('<h1>LetsEdit: Client-Side WebAssembly PDF Architecture</h1>'));
  assert.ok(responseData.markdown.includes('# LetsEdit Markdown Specification Document'));

  // Test POST /api/html-to-pdf/convert
  let convertStatusCode = 0;
  let convertData = null;
  const mockResConvert = {
    writeHead(code, headers) { convertStatusCode = code; },
    end(payload) { convertData = JSON.parse(payload); }
  };

  const payload = JSON.stringify({
    content: '<h1>API Generated PDF</h1><p>Generated via backend HTTP route.</p>',
    format: 'html',
    theme: 'modern',
    title: 'API Document'
  });

  const mockReqConvert = {
    method: 'POST',
    url: '/api/html-to-pdf/convert',
    on: (evt, cb) => {
      if (evt === 'data') cb(Buffer.from(payload));
      if (evt === 'end') cb();
    }
  };

  const handledConvert = await handleHtmlToPdfRequest(mockReqConvert, mockResConvert, '/api/html-to-pdf/convert', 'POST');
  assert.equal(handledConvert, true);
  assert.equal(convertStatusCode, 200);
  assert.equal(convertData.success, true);
  assert.ok(convertData.pdfBase64);
  assert.ok(convertData.size > 500);
  assert.equal(convertData.filename, 'API_Document.pdf');
  assert.ok(convertData.report);
  assert.equal(convertData.report.pages, 1);
});
