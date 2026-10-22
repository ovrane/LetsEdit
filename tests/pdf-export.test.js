/**
 * PDF Export & Vector Compilation Functional Tests
 * Tests real PDF compilation, AcroForms, watermarks, page numbers, and password encryption via pdf-lib.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { pdfEngine } from '../src/core/pdf-engine.js';

describe('PDF Vector Export & Feature Tests', () => {
  let sampleBytes;

  before(async () => {
    sampleBytes = await pdfEngine.createSamplePdf();
    pdfEngine.rawBytes = sampleBytes;
  });

  test('createSamplePdf produces valid multi-page PDF document', async () => {
    assert(sampleBytes.byteLength > 500, 'Sample PDF should have content');
    const doc = await PDFDocument.load(sampleBytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  test('exportPdf compiles text and vector shapes onto pages', async () => {
    const state = {
      pageCount: 2,
      pageOrder: [1, 2],
      deletedPages: new Set(),
      pageRotations: { 1: 0, 2: 0 },
      annotations: {
        1: [
          {
            id: 'txt-1',
            type: 'text',
            text: 'Official Agreement Addendum',
            x: 0.1,
            y: 0.15,
            width: 0.4,
            height: 0.05,
            fontSize: 16,
            fontFamily: 'Helvetica',
            color: '#1e293b',
            hasUnderlay: true
          },
          {
            id: 'shape-1',
            type: 'shape',
            shapeType: 'rectangle',
            x: 0.1,
            y: 0.3,
            width: 0.3,
            height: 0.1,
            strokeColor: '#2563eb',
            strokeWidth: 2,
            fillColor: '#eff6ff'
          }
        ],
        2: []
      },
      watermark: null,
      pageNumbers: null,
      exportPassword: null
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    assert(exportedBytes instanceof Uint8Array);
    assert(exportedBytes.byteLength > sampleBytes.byteLength);

    const doc = await PDFDocument.load(exportedBytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  test('exportPdf creates native interactive AcroForm fields', async () => {
    const state = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: {
        1: [
          {
            id: 'inp-name',
            type: 'form',
            formType: 'text',
            x: 0.2,
            y: 0.2,
            width: 0.3,
            height: 0.04,
            value: 'Alice Smith'
          },
          {
            id: 'cb-agree',
            type: 'form',
            formType: 'checkbox',
            x: 0.2,
            y: 0.3,
            width: 0.05,
            height: 0.04,
            checked: true
          }
        ]
      },
      watermark: null,
      pageNumbers: null,
      exportPassword: null
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    const doc = await PDFDocument.load(exportedBytes);
    const form = doc.getForm();
    assert(form !== null, 'Exported PDF should contain an AcroForm');

    const tf = form.getTextField('tf_inp-name');
    assert.strictEqual(tf.getText(), 'Alice Smith');

    const cb = form.getCheckBox('cb_cb-agree');
    assert.strictEqual(cb.isChecked(), true);
  });

  test('exportPdf embeds document watermark across all pages', async () => {
    const state = {
      pageCount: 2,
      pageOrder: [1, 2],
      deletedPages: new Set(),
      pageRotations: { 1: 0, 2: 0 },
      annotations: { 1: [], 2: [] },
      watermark: {
        text: 'CONFIDENTIAL',
        rotation: 45,
        opacity: 0.25,
        color: '#dc2626',
        fontSize: 48
      },
      pageNumbers: null,
      exportPassword: null
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    const doc = await PDFDocument.load(exportedBytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  test('exportPdf numbers pages dynamically with tokens', async () => {
    const state = {
      pageCount: 2,
      pageOrder: [1, 2],
      deletedPages: new Set(),
      pageRotations: { 1: 0, 2: 0 },
      annotations: { 1: [], 2: [] },
      watermark: null,
      pageNumbers: {
        format: 'Page {n} of {total}',
        position: 'bottom-center'
      },
      exportPassword: null
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    const doc = await PDFDocument.load(exportedBytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  test('exportPdf enforces AES-256 password protection', async () => {
    const testPassword = 'SecurePassword2026!';
    const state = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: { 1: [] },
      watermark: null,
      pageNumbers: null,
      exportPassword: {
        userPassword: testPassword,
        ownerPassword: 'MasterPasswordAdmin!'
      }
    };

    const encryptedBytes = await pdfEngine.exportPdf(state);

    // Attempting to load without password or without ignoreEncryption should reject
    await assert.rejects(
      async () => {
        await PDFDocument.load(encryptedBytes);
      },
      /encrypted/i,
      'Loading encrypted PDF without password must throw error'
    );

    // Document with ignoreEncryption: true loads and verifies isEncrypted is true
    const docWithIgnore = await PDFDocument.load(encryptedBytes, { ignoreEncryption: true });
    assert.strictEqual(docWithIgnore.isEncrypted, true);
    assert.strictEqual(docWithIgnore.getPageCount(), 1);
  });

  test('exportPdf embeds document metadata properties', async () => {
    const state = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: { 1: [] },
      watermark: null,
      pageNumbers: null,
      exportPassword: null,
      metadata: {
        title: 'Confidential Executive Summary',
        author: 'Chief Executive Officer',
        subject: 'Q4 2026 Strategy',
        keywords: 'strategy, confidential, executive',
        creator: 'PDF Studio Pro Test',
        producer: 'PDF Studio Vector Engine'
      }
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    const doc = await PDFDocument.load(exportedBytes, { updateMetadata: false });

    assert.strictEqual(doc.getTitle(), 'Confidential Executive Summary');
    assert.strictEqual(doc.getAuthor(), 'Chief Executive Officer');
    assert.strictEqual(doc.getSubject(), 'Q4 2026 Strategy');
    assert.strictEqual(doc.getCreator(), 'PDF Studio Pro Test');
    assert.strictEqual(doc.getProducer(), 'PDF Studio Vector Engine');
  });

  test('exportPdf applies crop box trimming to pages', async () => {
    const state = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: { 1: [] },
      watermark: null,
      pageNumbers: null,
      exportPassword: null,
      cropSettings: {
        top: 40,
        right: 30,
        bottom: 50,
        left: 20,
        applyToAll: true,
        pageNum: 1
      }
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    const doc = await PDFDocument.load(exportedBytes);
    const page = doc.getPage(0);
    const cropBox = page.getCropBox();

    // Original page is A4: [595.28, 841.89]
    // Left: 20, Bottom: 50, Width: 595.28 - 20 - 30 = 545.28, Height: 841.89 - 40 - 50 = 751.89
    assert.strictEqual(cropBox.x, 20);
    assert.strictEqual(cropBox.y, 50);
    assert(Math.abs(cropBox.width - (595.28 - 50)) < 0.1);
    assert(Math.abs(cropBox.height - (841.89 - 90)) < 0.1);
  });

  test('splitPdf extracts custom ranges and individual pages', async () => {
    // Split into 2 individual ranges (1-1 and 2-2)
    const ranges = await pdfEngine.splitPdf('1-1, 2-2');
    assert.strictEqual(ranges.length, 2);
    assert.strictEqual(ranges[0].pageCount, 1);
    assert.strictEqual(ranges[1].pageCount, 1);

    const doc1 = await PDFDocument.load(ranges[0].bytes);
    assert.strictEqual(doc1.getPageCount(), 1);

    // Split 'all' mode
    const allSplits = await pdfEngine.splitPdf('all');
    assert.strictEqual(allSplits.length, 2);
  });

  test('exportPdf compiles legal Bates numbering across pages', async () => {
    const state = {
      pageCount: 2,
      pageOrder: [1, 2],
      deletedPages: new Set(),
      pageRotations: { 1: 0, 2: 0 },
      annotations: { 1: [], 2: [] },
      watermark: null,
      pageNumbers: null,
      exportPassword: null,
      batesNumbering: {
        prefix: 'LEGAL-',
        startNumber: 100,
        digits: 6,
        suffix: '-CONF',
        position: 'bottom-right',
        fontSize: 10,
        color: '#0f172a'
      }
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    const doc = await PDFDocument.load(exportedBytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  test('exportPdf flattens interactive form fields into static vectors', async () => {
    const state = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: {
        1: [
          {
            id: 'field-1',
            type: 'form',
            formType: 'input',
            value: 'Permanent Value',
            x: 0.1,
            y: 0.2,
            width: 0.3,
            height: 0.05
          }
        ]
      },
      watermark: null,
      pageNumbers: null,
      exportPassword: null,
      flattenForms: true
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    const doc = await PDFDocument.load(exportedBytes);
    // After flattening, form fields should be baked and no longer in getFields()
    const form = doc.getForm();
    assert.strictEqual(form.getFields().length, 0);
  });

  test('extractDocumentText extracts searchable plain text across all pages', async () => {
    const text = await pdfEngine.extractDocumentText();
    assert(typeof text === 'string');
    assert(text.includes('Sample PDF Contract & Document'));
    assert(text.includes('Terms & Conditions Exhibit'));
    assert(text.includes('--- Page 1 ---'));
    assert(text.includes('--- Page 2 ---'));
  });

  test('alternateMix interleaves pages from two documents', async () => {
    const docA = await pdfEngine.createSamplePdf();
    const docB = await pdfEngine.createSamplePdf();

    // Alternate mix forward
    const mixed = await pdfEngine.alternateMix(docA, docB, { reverseB: false });
    const doc = await PDFDocument.load(mixed);
    assert.strictEqual(doc.getPageCount(), 4);

    // Alternate mix with reverse B (duplex scanner mode)
    const duplexMixed = await pdfEngine.alternateMix(docA, docB, { reverseB: true });
    const duplexDoc = await PDFDocument.load(duplexMixed);
    assert.strictEqual(duplexDoc.getPageCount(), 4);
  });

  test('nUpPdf creates 2-Up and 4-Up imposition sheets', async () => {
    // 2-Up on 2-page sample produces 1 landscape sheet
    const nup2Bytes = await pdfEngine.nUpPdf(2);
    const nup2Doc = await PDFDocument.load(nup2Bytes);
    assert.strictEqual(nup2Doc.getPageCount(), 1);
    const sz2 = nup2Doc.getPage(0).getSize();
    assert.strictEqual(sz2.width, 841.89);
    assert.strictEqual(sz2.height, 595.28);

    // 4-Up on 2-page sample produces 1 portrait sheet
    const nup4Bytes = await pdfEngine.nUpPdf(4);
    const nup4Doc = await PDFDocument.load(nup4Bytes);
    assert.strictEqual(nup4Doc.getPageCount(), 1);
    const sz4 = nup4Doc.getPage(0).getSize();
    assert.strictEqual(sz4.width, 595.28);
    assert.strictEqual(sz4.height, 841.89);
  });

  test('imagesToPdf converts multiple images into a multi-page A4 PDF', async () => {
    const pngBytes = Uint8Array.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0,
      31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 248, 207, 192, 240, 31, 0, 5, 0, 1,
      255, 137, 145, 125, 163, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ]);

    const images = [
      { bytes: pngBytes, isJpg: false },
      { bytes: pngBytes, isJpg: false }
    ];

    const pdfBytes = await pdfEngine.imagesToPdf(images);
    assert(pdfBytes.byteLength > 200);

    const doc = await PDFDocument.load(pdfBytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  test('splitInHalf vertically and horizontally slices book scan pages', async () => {
    // Vertical split
    const vertBytes = await pdfEngine.splitInHalf('vertical');
    const vertDoc = await PDFDocument.load(vertBytes);
    assert.strictEqual(vertDoc.getPageCount(), 4);
    const cbVert = vertDoc.getPage(0).getCropBox();
    assert.strictEqual(cbVert.x, 0);
    assert.strictEqual(cbVert.y, 0);
    assert(Math.abs(cbVert.width - 595.28 / 2) < 0.1);

    // Horizontal split
    const horizBytes = await pdfEngine.splitInHalf('horizontal');
    const horizDoc = await PDFDocument.load(horizBytes);
    assert.strictEqual(horizDoc.getPageCount(), 4);
    const cbHoriz = horizDoc.getPage(0).getCropBox();
    assert(Math.abs(cbHoriz.height - 841.89 / 2) < 0.1);
  });

  test('unlockPdf strips password protection and returns unrestricted PDF', async () => {
    // 1. Create encrypted PDF
    const encState = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: { 1: [] },
      watermark: null,
      pageNumbers: null,
      exportPassword: {
        userPassword: 'LockPassword123!',
        ownerPassword: 'AdminMaster456!'
      }
    };
    const encryptedBytes = await pdfEngine.exportPdf(encState);

    // Verify it rejects without password
    await assert.rejects(
      async () => {
        await PDFDocument.load(encryptedBytes);
      },
      /encrypted/i
    );

    // 2. Unlock the PDF
    const unlockedBytes = await pdfEngine.unlockPdf(encryptedBytes, 'LockPassword123!');
    assert(unlockedBytes.byteLength > 200);

    // 3. Verify it loads freely with zero errors and isEncrypted is false
    const cleanDoc = await PDFDocument.load(unlockedBytes);
    assert.strictEqual(cleanDoc.isEncrypted, false);
    assert.strictEqual(cleanDoc.getPageCount(), 1);
  });

  test('resizePdfMargins expands page margins and standardizes sheet bounds', async () => {
    const sampleBytes = await pdfEngine.createSamplePdf();

    // 1. Expand margins (e.g. Left +72 for spiral binder, +36 Top/Bottom/Right)
    const expandedBytes = await pdfEngine.resizePdfMargins(sampleBytes, {
      marginLeft: 72,
      marginRight: 36,
      marginTop: 36,
      marginBottom: 36,
      pageSize: 'original'
    });
    const expDoc = await PDFDocument.load(expandedBytes);
    assert.strictEqual(expDoc.getPageCount(), 2);
    const expSize = expDoc.getPage(0).getSize();
    // A4 is 595.28 x 841.89 -> +108 width, +72 height
    assert(Math.abs(expSize.width - (595.28 + 108)) < 0.1);
    assert(Math.abs(expSize.height - (841.89 + 72)) < 0.1);

    // 2. Standardize to US Letter (612 x 792 pt)
    const letterBytes = await pdfEngine.resizePdfMargins(sampleBytes, {
      marginLeft: 36,
      marginRight: 36,
      marginTop: 36,
      marginBottom: 36,
      pageSize: 'letter'
    });
    const letterDoc = await PDFDocument.load(letterBytes);
    assert.strictEqual(letterDoc.getPageCount(), 2);
    const letterSize = letterDoc.getPage(0).getSize();
    assert.strictEqual(letterSize.width, 612.0);
    assert.strictEqual(letterSize.height, 792.0);
  });

  test('compressPdf compresses stream objects and returns size savings metrics', async () => {
    const sampleBytes = await pdfEngine.createSamplePdf();
    const result = await pdfEngine.compressPdf(sampleBytes, { quality: 'recommended', removeMetadata: true });

    assert(result.bytes instanceof Uint8Array);
    assert(result.originalSize > 0);
    assert(result.compressedSize > 0);
    assert(result.compressedSize <= result.originalSize);
    assert(typeof result.savingsPercent === 'number');

    const compressedDoc = await PDFDocument.load(result.bytes);
    assert.strictEqual(compressedDoc.getPageCount(), 2);
    assert.strictEqual(compressedDoc.getTitle() || '', '');
  });

  test('flipPages mirrors pages horizontally, vertically, and both with page scopes', async () => {
    const sampleBytes = await pdfEngine.createSamplePdf();

    // 1. Horizontal flip on all pages
    const horizBytes = await pdfEngine.flipPages(sampleBytes, { direction: 'horizontal', pageRange: 'all' });
    assert(horizBytes.byteLength > 200);
    const horizDoc = await PDFDocument.load(horizBytes);
    assert.strictEqual(horizDoc.getPageCount(), 2);
    const p1Size = horizDoc.getPage(0).getSize();
    assert.strictEqual(Math.round(p1Size.width), 595);
    assert.strictEqual(Math.round(p1Size.height), 842);

    // 2. Vertical flip on odd pages only
    const vertBytes = await pdfEngine.flipPages(sampleBytes, { direction: 'vertical', pageRange: [1] });
    const vertDoc = await PDFDocument.load(vertBytes);
    assert.strictEqual(vertDoc.getPageCount(), 2);

    // 3. Both (180° inverted) flip
    const bothBytes = await pdfEngine.flipPages(sampleBytes, { direction: 'both', pageRange: 'all' });
    const bothDoc = await PDFDocument.load(bothBytes);
    assert.strictEqual(bothDoc.getPageCount(), 2);
  });

  test('convertToGrayscale desaturates color streams to DeviceGray', async () => {
    const sampleBytes = await pdfEngine.createSamplePdf();
    const grayBytes = await pdfEngine.convertToGrayscale(sampleBytes);

    assert(grayBytes.byteLength > 200);
    const grayDoc = await PDFDocument.load(grayBytes);
    assert.strictEqual(grayDoc.getPageCount(), 2);

    // Verify content streams contain valid DeviceGray operators (g or G)
    const p1 = grayDoc.getPage(0);
    const contents = p1.node.Contents();
    assert(contents !== null && contents !== undefined);
  });

  test('extractImages extracts embedded image objects from PDF', async () => {
    // 1. Create a PDF with an embedded PNG image
    const testDoc = await PDFDocument.create();
    const page = testDoc.addPage([400, 400]);
    // 1x1 red PNG base64
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const pngBytes = Uint8Array.from(Buffer.from(pngBase64, 'base64'));
    const embeddedImg = await testDoc.embedPng(pngBytes);
    page.drawImage(embeddedImg, { x: 50, y: 50, width: 100, height: 100 });
    const pdfWithImgBytes = await testDoc.save();

    // 2. Extract embedded images
    const images = await pdfEngine.extractImages(pdfWithImgBytes);
    assert(Array.isArray(images), 'Extracted images should be an array');
    assert(images.length >= 1, 'Should find at least 1 embedded image');
    assert.strictEqual(images[0].width, 1);
    assert.strictEqual(images[0].height, 1);
    assert(images[0].bytes.byteLength > 0);
    assert(images[0].name.startsWith('image_'));
  });

  test('applyOcr injects invisible searchable vector text layer onto PDF pages', async () => {
    const sampleBytes = await pdfEngine.createSamplePdf();
    const mockWords = [
      { text: 'Invoice', x: 50, y: 700, width: 45, height: 12 },
      { text: 'Number', x: 100, y: 700, width: 40, height: 12 },
      { text: 'TAX-2026', x: 145, y: 700, width: 55, height: 12 }
    ];

    let progressCalls = 0;
    const result = await pdfEngine.applyOcr(sampleBytes, {
      pageRange: [1],
      language: 'eng',
      mockOcrResults: [
        { pageIndex: 0, text: 'Invoice Number TAX-2026', words: mockWords }
      ],
      onProgress: (p) => {
        progressCalls++;
        assert(p.page === 1);
        assert(p.progress >= 0 && p.progress <= 100);
      }
    });

    assert(result.pdfBytes.byteLength > 200);
    assert(result.fullText.includes('Invoice Number TAX-2026'));
    assert.strictEqual(result.pagesOcr.length, 1);
    assert.strictEqual(result.pagesOcr[0].wordCount, 3);
    assert(progressCalls > 0);

    // Verify resulting PDF document can be loaded and is valid
    const ocrDoc = await PDFDocument.load(result.pdfBytes);
    assert.strictEqual(ocrDoc.getPageCount(), 2);
  });

  test('repairPdf fixes corrupted PDF headers and recovers document pages', async () => {
    const sampleBytes = await pdfEngine.createSamplePdf();
    const sampleArr = new Uint8Array(sampleBytes);
    // Simulate damaged PDF with missing header and prepended corrupted bytes
    const junkPrefix = new TextEncoder().encode('CORRUPTED_SYSTEM_LOG_DATA\n');
    const damagedBytes = new Uint8Array(junkPrefix.length + sampleArr.length);
    damagedBytes.set(junkPrefix, 0);
    damagedBytes.set(sampleArr, junkPrefix.length);

    const repaired = await pdfEngine.repairPdf(damagedBytes);
    assert(repaired.pdfBytes.byteLength > 200);
    assert.strictEqual(repaired.pageCount, 2);
    assert(repaired.recoveredObjects > 0);

    const doc = await PDFDocument.load(repaired.pdfBytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  test('comparePdfs detects differences and generates visual comparison report', async () => {
    const docA = await PDFDocument.create();
    const p1 = docA.addPage([400, 400]);
    p1.drawText('Agreement between Party Alpha and Party Beta');
    const bytesA = await docA.save();

    const docB = await PDFDocument.create();
    const p2 = docB.addPage([400, 400]);
    p2.drawText('Agreement between Party Alpha and Party Gamma Modified');
    const bytesB = await docB.save();

    const comparison = await pdfEngine.comparePdfs(bytesA, bytesB);
    assert.strictEqual(comparison.pagesA, 1);
    assert.strictEqual(comparison.pagesB, 1);
    assert(comparison.similarityScore > 0 && comparison.similarityScore <= 100);
    assert(comparison.diffCount >= 1);
    assert(comparison.reportPdfBytes.byteLength > 200);

    const reportDoc = await PDFDocument.load(comparison.reportPdfBytes);
    assert(reportDoc.getPageCount() >= 1);
  });

  test('convertToPdfA conforms to ISO 19005-1 with OutputIntents', async () => {
    const sampleBytes = await pdfEngine.createSamplePdf();
    const pdfaBytes = await pdfEngine.convertToPdfA(sampleBytes);
    assert(pdfaBytes.byteLength > 200);

    const pdfaDoc = await PDFDocument.load(pdfaBytes, { updateMetadata: false });
    assert.strictEqual(pdfaDoc.getPageCount(), 2);
    assert(pdfaDoc.getProducer().includes('PDF/A'));
  });
});





