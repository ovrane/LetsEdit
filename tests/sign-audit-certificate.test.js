import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import {
  computeSha256Hex,
  generateTransactionId,
  buildAuditRecord,
  generateStandaloneAuditCertificatePdf
} from '../src/core/engine/sign-audit-certificate.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { generateQrMatrix } from '../src/utils/helpers.js';

// Helper to create small sample PDF bytes
async function createTestPdf(pageCount = 1) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Sample Test Document Page ${i + 1}`, { x: 50, y: 500 });
  }
  return await doc.save();
}

// 1x1 Transparent PNG byte array
const samplePngBytes = new Uint8Array([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
  0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
  0x42, 0x60, 0x82
]);

test('sign-audit - computeSha256Hex produces accurate 64-character hex digests', async () => {
  const data = new TextEncoder().encode('Hello, LetsEdit PDF Signer!');
  const hash = await computeSha256Hex(data);
  assert.strictEqual(typeof hash, 'string');
  assert.strictEqual(hash.length, 64);
  assert.match(hash, /^[0-9a-f]{64}$/);

  // Deterministic check
  const hash2 = await computeSha256Hex(data);
  assert.strictEqual(hash, hash2);
});

test('sign-audit - generateTransactionId formats properly', () => {
  const txId = generateTransactionId();
  assert.match(txId, /^TRX-\d{8}-[A-Z0-9]{8}$/);
});

test('sign-audit - generateQrMatrix generates square matrix', () => {
  const matrix = generateQrMatrix('https://letsedit.io/verify?tx=TRX-123');
  assert(Array.isArray(matrix));
  assert(matrix.length > 10);
  assert.strictEqual(matrix.length, matrix[0].length);
});

test('sign-audit - buildAuditRecord constructs complete legal audit record', async () => {
  const origPdf = await createTestPdf(1);
  const record = await buildAuditRecord({
    originalBytes: origPdf,
    signatureImageBytes: samplePngBytes,
    signerName: 'Ada Lovelace',
    signerEmail: 'ada@example.com',
    dateText: '2026-10-24',
    transactionId: 'TRX-20261024-TEST0001'
  });

  assert.strictEqual(record.transactionId, 'TRX-20261024-TEST0001');
  assert.strictEqual(record.signerName, 'Ada Lovelace');
  assert.strictEqual(record.signerEmail, 'ada@example.com');
  assert.strictEqual(record.dateText, '2026-10-24');
  assert.strictEqual(record.originalHash.length, 64);
  assert.strictEqual(record.signatureHash.length, 64);
  assert.strictEqual(record.tamperStatus, 'VERIFIED_TAMPER_EVIDENT');
  assert(record.verificationUrl.includes('TRX-20261024-TEST0001'));
});

test('sign-audit - generateStandaloneAuditCertificatePdf produces valid single page A4 PDF', async () => {
  const origPdf = await createTestPdf(1);
  const record = await buildAuditRecord({
    originalBytes: origPdf,
    signatureImageBytes: samplePngBytes,
    signerName: 'Nikola Tesla',
    signerEmail: 'nikola@example.com',
    transactionId: 'TRX-20261024-TEST0002'
  });

  const certBytes = await generateStandaloneAuditCertificatePdf(record, {
    signatureBytes: samplePngBytes,
    isPng: true
  });

  assert(certBytes instanceof Uint8Array);
  assert(certBytes.length > 500);

  const certDoc = await PDFDocument.load(certBytes);
  assert.strictEqual(certDoc.getPageCount(), 1);
  const certPage = certDoc.getPage(0);
  assert.strictEqual(Math.round(certPage.getWidth()), 595);
  assert.strictEqual(Math.round(certPage.getHeight()), 842);
});

test('sign-audit - PageOperations.signPdf with appendAuditCertificate: true adds audit sheet', async () => {
  const origPdf = await createTestPdf(2);
  const signedBytes = await PageOperations.signPdf(origPdf, {
    imageBytes: samplePngBytes,
    isPng: true,
    position: 'bottom-right',
    dateText: '2026-10-24',
    signerName: 'Alan Turing',
    signerEmail: 'alan@bletchley.org',
    appendAuditCertificate: true,
    embedBadge: true
  });

  assert(signedBytes instanceof Uint8Array);
  assert(signedBytes.auditRecord);
  assert.strictEqual(signedBytes.auditRecord.signerName, 'Alan Turing');
  assert.strictEqual(signedBytes.auditRecord.originalHash.length, 64);
  assert.strictEqual(signedBytes.auditRecord.signedHash.length, 64);

  // Original document had 2 pages; with appended certificate it should have 3 pages
  const signedDoc = await PDFDocument.load(signedBytes);
  assert.strictEqual(signedDoc.getPageCount(), 3);
});

test('sign-audit - PageOperations.signPdf without appendAuditCertificate preserves original page count', async () => {
  const origPdf = await createTestPdf(2);
  const signedBytes = await PageOperations.signPdf(origPdf, {
    imageBytes: samplePngBytes,
    isPng: true,
    position: 'bottom-left',
    appendAuditCertificate: false,
    embedBadge: true
  });

  const signedDoc = await PDFDocument.load(signedBytes);
  assert.strictEqual(signedDoc.getPageCount(), 2);
  assert(signedBytes.auditRecord);
});

test('sign-audit - PageOperations.generateAuditCertificate facade works correctly', async () => {
  const origPdf = await createTestPdf(1);
  const record = await buildAuditRecord({
    originalBytes: origPdf,
    signerName: 'Grace Hopper',
    signerEmail: 'grace@navy.mil'
  });

  const certBytes = await PageOperations.generateAuditCertificate(record);
  assert(certBytes instanceof Uint8Array);
  const loadedDoc = await PDFDocument.load(certBytes);
  assert.strictEqual(loadedDoc.getPageCount(), 1);
});
