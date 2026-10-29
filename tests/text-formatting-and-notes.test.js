/**
 * Text Formatting and Sticky Note Annotations Functional Tests
 * Verifies rich typography (bold, italic, underline, strikethrough, alignment, highlight, opacity)
 * and Adobe Acrobat-style Sticky Note (/Text) annotations in PDF export and store state.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { pdfEngine } from '../src/core/pdf-engine.js';
import { store } from '../src/core/state-store.js';
import { FONT_CATALOG, getCssFontFamily, getStandardFontFallback } from '../src/core/font-registry.js';

describe('Rich Text Formatting & Adobe Sticky Notes Tests', () => {
  let sampleBytes;

  before(async () => {
    sampleBytes = await pdfEngine.createSamplePdf();
    pdfEngine.rawBytes = sampleBytes;
  });

  test('Font Registry catalog contains 150+ fonts and resolves CSS font family correctly', () => {
    assert(FONT_CATALOG.length >= 150, `Catalog should have at least 150 fonts, found ${FONT_CATALOG.length}`);
    const helveticaCss = getCssFontFamily('Helvetica');
    assert(helveticaCss.includes('Helvetica'), 'Should include Helvetica in CSS font');

    const poppinsCss = getCssFontFamily('Poppins');
    assert(poppinsCss.includes('Poppins'), 'Should include Poppins in CSS font');

    // Standard font variants resolution
    assert.strictEqual(getStandardFontFallback('Helvetica', true, false), 'Helvetica-Bold');
    assert.strictEqual(getStandardFontFallback('Helvetica', false, true), 'Helvetica-Oblique');
    assert.strictEqual(getStandardFontFallback('Helvetica', true, true), 'Helvetica-BoldOblique');
    assert.strictEqual(getStandardFontFallback('TimesRoman', true, true), 'Times-BoldItalic');
  });

  test('State store contains default text styling properties', () => {
    const s = store.getState();
    assert.strictEqual(s.activeBold, false);
    assert.strictEqual(s.activeItalic, false);
    assert.strictEqual(s.activeUnderline, false);
    assert.strictEqual(s.activeStrikethrough, false);
    assert.strictEqual(s.activeTextAlign, 'left');
    assert.strictEqual(s.activeTextBgColor, 'transparent');
  });

  test('exportPdf compiles text with bold, italic, underline, strikethrough, alignment, and highlight background', async () => {
    const state = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: {
        1: [
          {
            id: 'rich-text-1',
            type: 'text',
            text: 'Formatted Headline Document',
            x: 0.1,
            y: 0.2,
            width: 0.8,
            height: 0.05,
            fontSize: 20,
            fontFamily: 'Helvetica',
            bold: true,
            italic: true,
            underline: true,
            strikethrough: true,
            align: 'center',
            bgColor: '#fef08a',
            color: '#1e3a8a',
            opacity: 0.95
          }
        ]
      }
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    assert(exportedBytes.byteLength > 500, 'Exported PDF should be non-empty');

    const doc = await PDFDocument.load(exportedBytes);
    assert.strictEqual(doc.getPageCount(), 1);
  });

  test('exportPdf compiles Adobe Acrobat-style Sticky Note (/Text) annotations', async () => {
    const state = {
      pageCount: 1,
      pageOrder: [1],
      deletedPages: new Set(),
      pageRotations: { 1: 0 },
      annotations: {
        1: [
          {
            id: 'note-1',
            type: 'note',
            text: 'Please review clause 4.2 before signing.',
            author: 'Legal Counsel',
            date: '10:30 AM',
            x: 0.15,
            y: 0.35,
            width: 0.05,
            height: 0.04,
            color: '#f59e0b',
            isOpen: true
          }
        ]
      }
    };

    const exportedBytes = await pdfEngine.exportPdf(state);
    assert(exportedBytes.byteLength > 500, 'Exported PDF with note should be non-empty');

    const doc = await PDFDocument.load(exportedBytes);
    const page = doc.getPage(0);
    const annots = page.node.Annots();
    assert(annots && annots.size() > 0, 'Page should have at least 1 annotation');

    let foundNote = false;
    for (let i = 0; i < annots.size(); i++) {
      const annotRef = annots.get(i);
      const annotObj = doc.context.lookup(annotRef);
      if (annotObj) {
        const subtype = annotObj.get(PDFName.of('Subtype'));
        if (subtype && subtype.encodedName === '/Text') {
          foundNote = true;
          const contents = annotObj.get(PDFName.of('Contents'));
          assert(contents, 'Note annotation should have Contents');
          assert(contents.value.includes('Please review clause 4.2'), 'Contents should match comment text');
        }
      }
    }

    assert(foundNote, 'Native PDF /Text annotation should be found in exported PDF');
  });
});
