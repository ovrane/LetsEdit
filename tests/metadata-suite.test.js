import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { MetadataOps } from '../src/core/engine/operations/metadata-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleMetadataRequest } from '../server/routes/metadata-routes.js';

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

test('MetadataOps - createSampleMetadataPdf creates a rich document with metadata and XMP', async () => {
  const pdfBytes = await MetadataOps.createSampleMetadataPdf();
  assert.ok(pdfBytes && pdfBytes.length > 0);

  const inspection = await MetadataOps.inspectMetadata(pdfBytes);
  assert.strictEqual(inspection.info.title, 'Global Master Services Agreement (MSA)');
  assert.strictEqual(inspection.info.author, 'Lexicon Legal Corporation & Partners');
  assert.strictEqual(inspection.info.subject, 'Commercial Terms, Intellectual Property & Data Protection');
  assert.ok(inspection.info.keywords.includes('legal'));
  assert.strictEqual(inspection.hasXmp, true);
  assert.ok(inspection.xmpPacket.includes('<dc:title>'));
  assert.ok(inspection.xmpPacket.includes('Global Master Services Agreement (MSA)'));
  assert.strictEqual(inspection.stats.pageCount, 1);
});

test('MetadataOps - inspectMetadata accurately parses PDF Info dictionary and technical properties', async () => {
  const doc = await PDFDocument.create();
  doc.setTitle('Q3 Financial Summary');
  doc.setAuthor('John Smith');
  doc.setSubject('Financial Reports');
  doc.setKeywords(['finance', 'quarterly', '2026']);
  doc.addPage([400, 600]);
  const pdfBytes = await doc.save();

  const inspection = await MetadataOps.inspectMetadata(pdfBytes);
  assert.strictEqual(inspection.info.title, 'Q3 Financial Summary');
  assert.strictEqual(inspection.info.author, 'John Smith');
  assert.strictEqual(inspection.info.subject, 'Financial Reports');
  assert.ok(inspection.info.keywords.includes('finance'));
  assert.strictEqual(inspection.stats.pageCount, 1);
  assert.strictEqual(inspection.stats.isEncrypted, false);
});

test('MetadataOps - updateMetadata injects updated fields and ISO 16684-1 Adobe XMP stream', async () => {
  const doc = await PDFDocument.create();
  doc.addPage([500, 700]);
  const initialBytes = await doc.save();

  const updatedBytes = await MetadataOps.updateMetadata(
    initialBytes,
    {
      title: 'Updated Policy Document',
      author: 'Compliance Officer',
      subject: 'Security Protocols',
      keywords: 'iso27001, security, compliance',
      creator: 'Adobe InDesign 2026',
      producer: 'LetsEdit Pro PDF Engine'
    },
    { syncXmp: true, updateModificationDate: true }
  );

  const inspection = await MetadataOps.inspectMetadata(updatedBytes);
  assert.strictEqual(inspection.info.title, 'Updated Policy Document');
  assert.strictEqual(inspection.info.author, 'Compliance Officer');
  assert.strictEqual(inspection.info.subject, 'Security Protocols');
  assert.ok(inspection.info.keywords.includes('iso27001'));
  assert.strictEqual(inspection.info.creator, 'Adobe InDesign 2026');
  assert.strictEqual(inspection.info.producer, 'LetsEdit Pro PDF Engine');
  assert.strictEqual(inspection.hasXmp, true);
  assert.ok(inspection.xmpPacket.includes('<dc:title>'));
  assert.ok(inspection.xmpPacket.includes('Updated Policy Document'));
  assert.ok(inspection.xmpPacket.includes('Compliance Officer'));
});

test('MetadataOps - stripMetadata performs complete 1-click privacy sanitization', async () => {
  const sampleBytes = await MetadataOps.createSampleMetadataPdf();
  const sanitizedBytes = await MetadataOps.stripMetadata(sampleBytes);

  const inspection = await MetadataOps.inspectMetadata(sanitizedBytes);
  assert.strictEqual(inspection.info.title, '');
  assert.strictEqual(inspection.info.author, '');
  assert.strictEqual(inspection.info.subject, '');
  assert.strictEqual(inspection.info.keywords, '');
  assert.strictEqual(inspection.hasXmp, false);
  assert.strictEqual(inspection.xmpPacket, '');
});

test('MetadataOps - generateXmpPacket properly escapes XML entities and formats Dublin Core', () => {
  const xmp = MetadataOps.generateXmpPacket({
    title: 'Research & Development <Special> "Test"',
    author: "O'Connor & Smith",
    subject: 'A & B testing',
    keywords: 'tag1, tag2 & tag3',
    creator: 'App & Co.',
    producer: 'PDF <Builder>'
  });

  assert.ok(xmp.includes('&amp; Development'));
  assert.ok(xmp.includes('&lt;Special&gt;'));
  assert.ok(xmp.includes('&quot;Test&quot;'));
  assert.ok(xmp.includes('O&apos;Connor &amp; Smith'));
  assert.ok(xmp.includes('<x:xmpmeta'));
  assert.ok(xmp.includes('</x:xmpmeta>'));
});

test('PageOperations facade exposes metadata operations seamlessly', async () => {
  const sample = await PageOperations.createSampleMetadataPdf();
  assert.ok(sample && sample.length > 0);

  const inspected = await PageOperations.inspectMetadata(sample);
  assert.ok(inspected && inspected.info.title);

  const updated = await PageOperations.updateMetadata(sample, { title: 'Facade Test' });
  const reInspected = await PageOperations.inspectMetadata(updated);
  assert.strictEqual(reInspected.info.title, 'Facade Test');

  const stripped = await PageOperations.stripMetadata(updated);
  const strippedInspected = await PageOperations.inspectMetadata(stripped);
  assert.strictEqual(strippedInspected.info.title, '');
});

test('Backend API - GET /api/metadata/sample returns base64 test PDF', async () => {
  const req = createMockReq('GET', '/api/metadata/sample');
  const res = createMockRes();

  await handleMetadataRequest(req, res, '/api/metadata/sample', 'GET');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.ok(data.pdfBase64 && data.pdfBase64.length > 100);
  assert.strictEqual(data.filename, 'sample_metadata_document.pdf');
});

test('Backend API - POST /api/metadata/inspect inspects document payload', async () => {
  const sampleBytes = await MetadataOps.createSampleMetadataPdf();
  const b64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/metadata/inspect', { pdfBase64: b64 });
  const res = createMockRes();

  await handleMetadataRequest(req, res, '/api/metadata/inspect', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.inspection.info.title, 'Global Master Services Agreement (MSA)');
});

test('Backend API - POST /api/metadata/update modifies metadata and returns updated PDF', async () => {
  const sampleBytes = await MetadataOps.createSampleMetadataPdf();
  const b64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/metadata/update', {
    pdfBase64: b64,
    metadata: {
      title: 'API Updated Document',
      author: 'API Bot',
      subject: 'Automated Processing'
    }
  });
  const res = createMockRes();

  await handleMetadataRequest(req, res, '/api/metadata/update', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.inspection.info.title, 'API Updated Document');
  assert.strictEqual(data.inspection.info.author, 'API Bot');
  assert.ok(data.pdfBase64);
});

test('Backend API - POST /api/metadata/strip sanitizes all document metadata', async () => {
  const sampleBytes = await MetadataOps.createSampleMetadataPdf();
  const b64 = Buffer.from(sampleBytes).toString('base64');

  const req = createMockReq('POST', '/api/metadata/strip', { pdfBase64: b64 });
  const res = createMockRes();

  await handleMetadataRequest(req, res, '/api/metadata/strip', 'POST');
  assert.strictEqual(res.statusCode, 200);

  const data = JSON.parse(res.body);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.inspection.info.title, '');
  assert.strictEqual(data.inspection.info.author, '');
  assert.strictEqual(data.inspection.hasXmp, false);
});
