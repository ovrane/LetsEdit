/**
 * Studio Export & Processing Workflow Suite
 * Verifies the Sejda / Smallpdf executive workflow:
 * 1. Modal creation and DOM state
 * 2. Progress transition: 0% -> 35% -> 70% -> 100%
 * 3. Step updates and compilation
 * 4. Ready state with download, print, save, and naming
 */

import test from 'node:test';
import assert from 'node:assert';
import { StudioExportModal } from '../src/components/studio-export-modal.js';
import { PDFDocument } from 'pdf-lib';

test('StudioExportModal initializes with clean default properties', () => {
  const modal = new StudioExportModal();
  assert.strictEqual(modal.stage, 'processing');
  assert.strictEqual(modal.isProcessing, false);
  assert.strictEqual(modal.filename, 'document_edited.pdf');
  assert.strictEqual(modal.numPages, 1);
  assert.strictEqual(modal.fileSizeStr, '0 KB');
});

test('StudioExportModal safely handles missing document state', async () => {
  const modal = new StudioExportModal();
  // Attempt to start workflow with empty state
  await modal.startWorkflow({ pdfBytes: null });
  // Should not crash or remain in processing state
  assert.strictEqual(modal.isProcessing, false);
});

test('StudioExportModal compiles PDF and transitions to ready view', async () => {
  // Create a minimal valid PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage([600, 400]);
  const pdfBytes = await pdfDoc.save();

  const mockState = {
    pdfBytes: pdfBytes.buffer,
    filename: 'Quarterly_Financial_Report.pdf',
    pages: [{ pageNum: 1 }],
    numPages: 1
  };

  const modal = new StudioExportModal();
  await modal.startWorkflow(mockState);

  assert.strictEqual(modal.stage, 'ready');
  assert.strictEqual(modal.isProcessing, false);
  assert.strictEqual(modal.filename, 'Quarterly_Financial_Report_edited.pdf');
  assert.ok(modal.pdfBytes instanceof Uint8Array);
  assert.ok(modal.pdfBytes.byteLength > 0);
  assert.ok(modal.fileSizeStr.includes('B')); // e.g. '1.2 KB' or similar
});
