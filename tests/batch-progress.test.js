import { test } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { BatchProgressModal } from '../src/components/workflow/batch-progress-modal.js';
import { PageOperations } from '../src/core/engine/page-ops.js';

// Helper to create small sample PDF bytes
async function createTestPdf(pageCount = 1) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([200, 200]);
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

test('BatchProgressModal - Initial State and Initialization', () => {
  const modal = new BatchProgressModal();
  assert.strictEqual(modal.isCancelled, false);
  assert.strictEqual(modal.processedBytes, 0);
  assert.strictEqual(modal.totalBytes, 0);
  assert.deepStrictEqual(modal.files, []);
});

test('BatchProgressModal - startBatch initializes file queues and weights', () => {
  const modal = new BatchProgressModal();
  const mockFiles = [
    { name: 'Contract_A.pdf', size: 1000 },
    { name: 'Receipt_B.pdf', size: 2000 },
    { name: 'Spreadsheet_C.xlsx', size: 3000 }
  ];

  modal.startBatch({
    title: 'Batch Compression: 3 Files',
    subtitle: 'Compressing in background',
    files: mockFiles
  });

  assert.strictEqual(modal.files.length, 3);
  assert.strictEqual(modal.totalBytes, 6000);
  assert.strictEqual(modal.files[0].status, 'queued');
  assert.strictEqual(modal.files[1].status, 'queued');
  assert.strictEqual(modal.files[2].status, 'queued');
});

test('BatchProgressModal - updateFileProgress and completeFile advance progress and metrics', () => {
  const modal = new BatchProgressModal();
  const mockFiles = [
    { name: 'Doc1.pdf', size: 1000 },
    { name: 'Doc2.pdf', size: 1000 }
  ];

  modal.startBatch({
    title: 'Testing Progress',
    files: mockFiles
  });

  // Update file 0 progress
  modal.updateFileProgress(0, 50, 'Optimizing streams...');
  assert.strictEqual(modal.files[0].progress, 50);
  assert.strictEqual(modal.files[0].status, 'processing');
  assert.strictEqual(modal.processedBytes, 500); // 50% of 1000

  // Complete file 0 with savings metric
  modal.completeFile(0, { metric: '-42%' });
  assert.strictEqual(modal.files[0].status, 'completed');
  assert.strictEqual(modal.files[0].progress, 100);
  assert.strictEqual(modal.files[0].metric, '-42%');
  assert.strictEqual(modal.processedBytes, 1000);

  // Complete file 1
  modal.completeFile(1, { metric: '-18%' });
  assert.strictEqual(modal.files[1].status, 'completed');
  assert.strictEqual(modal.processedBytes, 2000);
});

test('BatchProgressModal - failFile records error state', () => {
  const modal = new BatchProgressModal();
  modal.startBatch({
    title: 'Testing Failure',
    files: [{ name: 'Damaged.pdf', size: 500 }]
  });

  modal.failFile(0, new Error('Corrupted PDF header'));
  assert.strictEqual(modal.files[0].status, 'failed');
  assert.strictEqual(modal.files[0].error, 'Corrupted PDF header');
});

test('BatchProgressModal - cancelBatch aborts remaining queue items', () => {
  const modal = new BatchProgressModal();
  let cancelledFired = false;

  modal.startBatch({
    title: 'Testing Cancel',
    files: [
      { name: 'Doc1.pdf', size: 1000 },
      { name: 'Doc2.pdf', size: 1000 },
      { name: 'Doc3.pdf', size: 1000 }
    ],
    onCancel: () => {
      cancelledFired = true;
    }
  });

  modal.completeFile(0);
  modal.cancelBatch();

  assert.strictEqual(modal.isCancelled, true);
  assert.strictEqual(modal.files[0].status, 'completed');
  assert.strictEqual(modal.files[1].status, 'cancelled');
  assert.strictEqual(modal.files[2].status, 'cancelled');
  assert.strictEqual(cancelledFired, true);
});

test('PageOperations.mergePdf - reports per-file progress callback', async () => {
  const pdf1 = await createTestPdf(1);
  const pdf2 = await createTestPdf(2);
  const pdf3 = await createTestPdf(1);

  const progressEvents = [];
  const merged = await PageOperations.mergePdf([pdf1, pdf2, pdf3], {
    onProgress: (p) => {
      progressEvents.push({ ...p });
    }
  });

  assert.ok(merged instanceof Uint8Array);
  assert.strictEqual(progressEvents.length, 3);
  assert.strictEqual(progressEvents[0].current, 1);
  assert.strictEqual(progressEvents[0].total, 3);
  assert.strictEqual(progressEvents[1].current, 2);
  assert.strictEqual(progressEvents[2].current, 3);
  assert.strictEqual(progressEvents[2].percent, 100);

  // Validate merged page count
  const mergedDoc = await PDFDocument.load(merged);
  assert.strictEqual(mergedDoc.getPageCount(), 4);
});

test('PageOperations.imagesToPdf - reports per-image progress callback', async () => {
  const imgList = [
    { name: 'photo1.png', bytes: samplePngBytes },
    { name: 'photo2.png', bytes: samplePngBytes }
  ];

  const progressEvents = [];
  const pdfBytes = await PageOperations.imagesToPdf(imgList, {
    orientation: 'portrait',
    onProgress: (p) => {
      progressEvents.push({ ...p });
    }
  });

  assert.ok(pdfBytes instanceof Uint8Array);
  assert.strictEqual(progressEvents.length, 2);
  assert.strictEqual(progressEvents[0].current, 1);
  assert.strictEqual(progressEvents[0].total, 2);
  assert.strictEqual(progressEvents[1].current, 2);
  assert.strictEqual(progressEvents[1].percent, 100);

  const doc = await PDFDocument.load(pdfBytes);
  assert.strictEqual(doc.getPageCount(), 2);
});
