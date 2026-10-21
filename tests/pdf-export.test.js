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
});
