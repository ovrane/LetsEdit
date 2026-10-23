/**
 * OCR Engine & Text Injection Unit Tests
 * Tests WebAssembly Tesseract language options, page range slicing,
 * invisible vector text layer injection, progress callbacks, and transcript extraction.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { ExtractionOcrOperations, SUPPORTED_OCR_LANGUAGES } from '../src/core/engine/extraction-ocr.js';
import { pdfEngine } from '../src/core/pdf-engine.js';

describe('OCR Engine & Text Layer Injection Tests', () => {
  test('SUPPORTED_OCR_LANGUAGES contains all 10 supported languages', () => {
    assert(Array.isArray(SUPPORTED_OCR_LANGUAGES));
    assert.strictEqual(SUPPORTED_OCR_LANGUAGES.length, 10);
    const codes = SUPPORTED_OCR_LANGUAGES.map(l => l.code);
    ['eng', 'spa', 'fra', 'deu', 'ita', 'por', 'chi_sim', 'jpn', 'rus', 'ara'].forEach(code => {
      assert(codes.includes(code), `Missing language code: ${code}`);
    });
  });

  test('applyOcr rejects empty or missing raw bytes', async () => {
    await assert.rejects(async () => {
      await pdfEngine.applyOcr(null);
    }, /No PDF loaded for OCR/);
  });

  test('applyOcr injects invisible searchable text layer and tracks progress', async () => {
    const doc = await PDFDocument.create();
    const p1 = doc.addPage([500, 700]);
    p1.drawText('Sample Scanned Header');
    const p2 = doc.addPage([500, 700]);
    p2.drawText('Sample Scanned Footer');
    const rawBytes = await doc.save();

    let progressCalls = [];
    const mockWordsP1 = [
      { text: 'Invoice', bbox: { x0: 50, y0: 50, x1: 120, y1: 70 }, confidence: 96 },
      { text: 'Total', bbox: { x0: 130, y0: 50, x1: 180, y1: 70 }, confidence: 94 },
      { text: '$1,250.00', bbox: { x0: 190, y0: 50, x1: 260, y1: 70 }, confidence: 98 }
    ];
    const mockWordsP2 = [
      { text: 'Payment', bbox: { x0: 50, y0: 80, x1: 130, y1: 100 }, confidence: 95 },
      { text: 'Received', bbox: { x0: 140, y0: 80, x1: 220, y1: 100 }, confidence: 97 }
    ];

    const result = await pdfEngine.applyOcr(rawBytes, {
      language: 'eng',
      pageRange: 'all',
      mockOcrResults: [
        { pageIndex: 0, text: 'Invoice Total $1,250.00', words: mockWordsP1 },
        { pageIndex: 1, text: 'Payment Received', words: mockWordsP2 }
      ],
      onProgress: (p) => {
        progressCalls.push(p);
      }
    });

    assert(result.pdfBytes.byteLength > 200);
    assert.strictEqual(result.totalPages, 2);
    assert.strictEqual(result.language, 'eng');
    assert.strictEqual(result.pagesOcr.length, 2);
    assert.strictEqual(result.pagesOcr[0].wordCount, 3);
    assert.strictEqual(result.pagesOcr[1].wordCount, 2);
    assert(result.fullText.includes('Invoice Total $1,250.00'));
    assert(result.fullText.includes('Payment Received'));

    // Progress callback validation
    assert(progressCalls.length >= 2);
    for (const prog of progressCalls) {
      assert(prog.progress >= 0 && prog.progress <= 100);
      assert(prog.page >= 1 && prog.page <= 2);
    }

    // Verify resulting PDF loads and has intact pages
    const outputDoc = await PDFDocument.load(result.pdfBytes);
    assert.strictEqual(outputDoc.getPageCount(), 2);
  });

  test('applyOcr respects pageRange subset selection', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([400, 400]);
    doc.addPage([400, 400]);
    doc.addPage([400, 400]);
    const rawBytes = await doc.save();

    const mockWords = [
      { text: 'Page2Only', bbox: { x0: 20, y0: 20, x1: 80, y1: 40 }, confidence: 99 }
    ];

    // Only process page 2
    const result = await pdfEngine.applyOcr(rawBytes, {
      language: 'fra',
      pageRange: [2],
      mockOcrResults: [
        { pageIndex: 1, text: 'Page2Only', words: mockWords }
      ]
    });

    assert.strictEqual(result.totalPages, 1);
    assert.strictEqual(result.pagesOcr.length, 1);
    assert.strictEqual(result.pagesOcr[0].pageNum, 2);
    assert.strictEqual(result.language, 'fra');
    assert(result.fullText.includes('Page2Only'));
  });

  test('applyOcr handles fallback synthesis gracefully when no words recognized', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([400, 400]);
    const rawBytes = await doc.save();

    // No mock results and headless environment
    const result = await pdfEngine.applyOcr(rawBytes, {
      language: 'deu',
      pageRange: '1'
    });

    assert(result.pdfBytes.byteLength > 200);
    assert.strictEqual(result.pagesOcr.length, 1);
    assert(result.pagesOcr[0].wordCount >= 1);
    assert.strictEqual(result.language, 'deu');
  });
});
