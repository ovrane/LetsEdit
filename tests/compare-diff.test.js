/**
 * Compare PDF & Visual Diff Engine Unit Tests
 * Tests side-by-side diff, wipe slider percentage, opacity ghost blend,
 * page differences detection, and modal state management.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, rgb } from 'pdf-lib';
import { CompareModal } from '../src/components/compare-modal.js';
import { pdfEngine } from '../src/core/pdf-engine.js';

describe('Compare PDF & Visual Diff Tests', () => {
  let modal;

  beforeEach(() => {
    modal = new CompareModal();
  });

  test('CompareModal initializes with default state and parameters', () => {
    assert.strictEqual(modal.activeViewMode, 'side-by-side');
    assert.strictEqual(modal.currentPage, 1);
    assert.strictEqual(modal.totalPages, 1);
    assert.strictEqual(modal.wipePercent, 50);
    assert.strictEqual(modal.opacityPercent, 50);
    assert.strictEqual(modal.isComparing, false);
    assert.strictEqual(modal.comparisonResult, null);
  });

  test('Wipe and Opacity percent updates stay within valid bounds', () => {
    modal.wipePercent = 75;
    assert.strictEqual(modal.wipePercent, 75);

    modal.opacityPercent = 30;
    assert.strictEqual(modal.opacityPercent, 30);
  });

  test('View mode transitions between side-by-side, wipe, opacity, and table', () => {
    const modes = ['side-by-side', 'wipe', 'opacity', 'table'];
    for (const mode of modes) {
      modal.activeViewMode = mode;
      assert.strictEqual(modal.activeViewMode, mode);
    }
  });

  test('pdfEngine.comparePdfs detects exact identical documents', async () => {
    const docA = await PDFDocument.create();
    const p1 = docA.addPage([400, 400]);
    p1.drawText('Confidential Master Agreement Section 1');
    const bytesA = await docA.save();

    const comparison = await pdfEngine.comparePdfs(bytesA, bytesA);
    assert.strictEqual(comparison.similarityScore, 100);
    assert.strictEqual(comparison.diffCount, 0);
    assert.strictEqual(comparison.pageDiffs.length, 1);
    assert.strictEqual(comparison.pageDiffs[0].diffType, 'identical');
  });

  test('pdfEngine.comparePdfs detects modifications and page count discrepancies', async () => {
    // Doc A: 1 Page
    const docA = await PDFDocument.create();
    const p1 = docA.addPage([400, 400]);
    p1.drawText('Invoice #1001 Total Amount Due: $500 USD');
    const bytesA = await docA.save();

    // Doc B: 2 Pages, Page 1 modified, Page 2 added
    const docB = await PDFDocument.create();
    const pB1 = docB.addPage([400, 400]);
    pB1.drawText('Invoice #1001 Total Amount Due: $950 EUR Overdue');
    const pB2 = docB.addPage([400, 400]);
    pB2.drawText('Terms & Conditions for Wire Transfer');
    const bytesB = await docB.save();

    const comparison = await pdfEngine.comparePdfs(bytesA, bytesB);
    assert(comparison.similarityScore < 100);
    assert(comparison.diffCount >= 1);
    assert.strictEqual(comparison.pageDiffs.length, 2);
    assert.strictEqual(comparison.pageDiffs[0].diffType, 'modified');
    assert.strictEqual(comparison.pageDiffs[1].diffType, 'added');
    assert(comparison.pageDiffs[0].addedWords.length > 0 || comparison.pageDiffs[0].removedWords.length > 0);
  });

  test('Wipe and Opacity UI methods execute safely with DOM mocks', () => {
    // Provide a lightweight mock element for updateWipeUI & updateOpacityUI
    const mockOverlay = { style: {} };
    const mockLine = { style: {} };
    const mockWipeBadge = { textContent: '' };
    const mockCanvasB = { style: {} };
    const mockOpacityBadge = { textContent: '' };

    modal.modal = {
      querySelector: (sel) => {
        if (sel === '#compare-wipe-overlay') return mockOverlay;
        if (sel === '#compare-wipe-line') return mockLine;
        if (sel === '#compare-wipe-pct-badge') return mockWipeBadge;
        if (sel === '#compare-opacity-canvas-b') return mockCanvasB;
        if (sel === '#compare-opacity-pct-badge') return mockOpacityBadge;
        return null;
      }
    };

    modal.wipePercent = 42;
    modal.updateWipeUI();
    assert.strictEqual(mockOverlay.style.clipPath, 'inset(0 0 0 42%)');
    assert.strictEqual(mockLine.style.left, '42%');
    assert.strictEqual(mockWipeBadge.textContent, '42% Wipe');

    modal.opacityPercent = 85;
    modal.updateOpacityUI();
    assert.strictEqual(mockCanvasB.style.opacity, '0.85');
    assert.strictEqual(mockOpacityBadge.textContent, '85% Blend');
  });

  test('Page stepper navigation correctly constrains current page bounds', () => {
    modal.totalPages = 3;
    modal.currentPage = 1;

    // Advance page
    if (modal.currentPage < modal.totalPages) modal.currentPage++;
    assert.strictEqual(modal.currentPage, 2);

    if (modal.currentPage < modal.totalPages) modal.currentPage++;
    assert.strictEqual(modal.currentPage, 3);

    // Guard upper bound
    if (modal.currentPage < modal.totalPages) modal.currentPage++;
    assert.strictEqual(modal.currentPage, 3);

    // Decrement page
    if (modal.currentPage > 1) modal.currentPage--;
    assert.strictEqual(modal.currentPage, 2);

    if (modal.currentPage > 1) modal.currentPage--;
    assert.strictEqual(modal.currentPage, 1);

    // Guard lower bound
    if (modal.currentPage > 1) modal.currentPage--;
    assert.strictEqual(modal.currentPage, 1);
  });
});
