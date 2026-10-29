/**
 * PDF/A Conformance Engine & ISO 19005 Validation Test Suite
 * Tests multi-profile generation (PDF/A-1b, PDF/A-2b, PDF/A-3b) and deep validator telemetry.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, PDFName } from 'pdf-lib';
import { pdfEngine } from '../src/core/pdf-engine.js';
import { RepairCompareOperations } from '../src/core/engine/repair-compare.js';

describe('PDF/A Multi-Profile & Conformance Validator Tests', () => {
  let sampleBytes;

  before(async () => {
    sampleBytes = await pdfEngine.createSamplePdf();
  });

  test('validatePdfA detects non-compliant standard PDF', async () => {
    const report = await RepairCompareOperations.validatePdfA(sampleBytes);
    assert.strictEqual(report.isValid, false, 'Standard sample should not be PDF/A compliant');
    const intentCheck = report.checks.find(c => c.name.includes('OutputIntent'));
    assert.ok(intentCheck, 'Report should contain OutputIntent check');
    assert.strictEqual(intentCheck.passed, false, 'OutputIntent should fail on standard PDF');
  });

  test('convertToPdfA generates ISO 19005-1 compliant PDF/A-1b', async () => {
    const pdfaBytes = await RepairCompareOperations.convertToPdfA(sampleBytes, { profile: 'pdfa-1b' });
    assert.ok(pdfaBytes.byteLength > 500);

    const report = await RepairCompareOperations.validatePdfA(pdfaBytes);
    assert.strictEqual(report.isValid, true, 'Converted document should be valid PDF/A');
    assert.strictEqual(report.part, 1);
    assert.strictEqual(report.conformance, 'B');
    assert.strictEqual(report.profile, 'PDF/A-1b');

    // Verify catalog OutputIntents
    const doc = await PDFDocument.load(pdfaBytes);
    const outputIntents = doc.catalog.get(PDFName.of('OutputIntents'));
    assert.ok(outputIntents, 'Document catalog must contain OutputIntents array');
  });

  test('convertToPdfA generates ISO 19005-2 compliant PDF/A-2b', async () => {
    const pdfaBytes = await RepairCompareOperations.convertToPdfA(sampleBytes, { profile: 'pdfa-2b' });
    assert.ok(pdfaBytes.byteLength > 500);

    const report = await RepairCompareOperations.validatePdfA(pdfaBytes);
    assert.strictEqual(report.isValid, true);
    assert.strictEqual(report.part, 2);
    assert.strictEqual(report.conformance, 'B');
    assert.strictEqual(report.profile, 'PDF/A-2b');
  });

  test('convertToPdfA generates ISO 19005-3 compliant PDF/A-3b with attached e-invoice XML', async () => {
    const mockInvoiceXml = new TextEncoder().encode(
      '<?xml version="1.0" encoding="UTF-8"?><rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"><rsm:ExchangedDocument><rsm:ID>INV-2026-001</rsm:ID></rsm:ExchangedDocument></rsm:CrossIndustryInvoice>'
    );

    const pdfaBytes = await RepairCompareOperations.convertToPdfA(sampleBytes, {
      profile: 'pdfa-3b',
      embeddedFile: {
        name: 'factur-x.xml',
        bytes: mockInvoiceXml,
        mimeType: 'text/xml',
        description: 'Electronic Invoice Factur-X / ZUGFeRD'
      }
    });

    assert.ok(pdfaBytes.byteLength > 500);

    const report = await RepairCompareOperations.validatePdfA(pdfaBytes);
    assert.strictEqual(report.isValid, true);
    assert.strictEqual(report.part, 3);
    assert.strictEqual(report.conformance, 'B');
    assert.strictEqual(report.profile, 'PDF/A-3b');
  });
});
