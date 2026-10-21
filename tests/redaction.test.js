/**
 * True Text Redaction & Content Stream Sanitization Tests
 * Tests permanent purging of confidential text and character streams from PDF binary structure.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  stringToPdfHex,
  pdfHexToString,
  decompressStreamBytes,
  compressStreamBytes,
  sanitizeContentStream,
  redactPageContentStreams
} from '../src/core/pdf-redactor.js';

describe('True PDF Redaction & Content Stream Sanitization Tests', () => {

  test('hex encoding and decoding round-trip', () => {
    const original = 'CONFIDENTIAL_DATA_98765';
    const hex = stringToPdfHex(original);
    const decoded = pdfHexToString(hex);
    assert.strictEqual(decoded, original);
  });

  test('stream compression and decompression round-trip', async () => {
    const raw = new TextEncoder().encode('q BT /F1 12 Tf (Secret Key) Tj ET Q');
    const compressed = await compressStreamBytes(raw);
    assert(compressed.byteLength > 0);

    const decompressed = await decompressStreamBytes(compressed);
    const restoredText = new TextDecoder().decode(decompressed);
    assert.strictEqual(restoredText, 'q BT /F1 12 Tf (Secret Key) Tj ET Q');
  });

  test('sanitizeContentStream removes literal and hex target strings', () => {
    const sampleStream = `
      q
      BT
      /F1 12 Tf
      (CONFIDENTIAL_SECRET) Tj
      ET
      BT
      <434F4E464944454E5449414C5F534543524554> Tj
      ET
      Q
    `;

    const sanitized = sanitizeContentStream(sampleStream, [], ['CONFIDENTIAL_SECRET']);
    assert(!sanitized.includes('CONFIDENTIAL_SECRET'));
    assert(!sanitized.includes('434F4E464944454E5449414C5F534543524554'));
  });

  test('sanitizeContentStream removes text by bounding box coordinates', () => {
    const sampleStream = `
      q
      BT
      1 0 0 1 100 250 Tm
      (Redacted SSN 000-11-2222) Tj
      ET
      BT
      1 0 0 1 100 600 Tm
      (Public Header Information) Tj
      ET
      Q
    `;

    const redactionBoxes = [
      { x: 90, y: 240, width: 200, height: 30 }
    ];

    const sanitized = sanitizeContentStream(sampleStream, redactionBoxes);
    assert(!sanitized.includes('Redacted SSN 000-11-2222'), 'Target text inside bounding box must be purged');
    assert(sanitized.includes('Public Header Information'), 'Text outside bounding box must remain intact');
  });

  test('redactPageContentStreams permanently sanitizes real PDF content streams', async () => {
    // 1. Create a PDF document with confidential text
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 500]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    page.drawText('CONFIDENTIAL PATIENT RECORD 99482', {
      x: 80,
      y: 350,
      size: 14,
      font
    });

    page.drawText('Public Hospital General Notice', {
      x: 80,
      y: 450,
      size: 14,
      font
    });

    // 2. Perform True Redaction on the confidential area
    const redactionBoxes = [
      { x: 70, y: 340, width: 300, height: 25 }
    ];

    await redactPageContentStreams(doc, page, redactionBoxes, ['99482']);

    // 3. Save PDF and verify text is physically purged from the output binary
    const savedBytes = await doc.save();
    const binaryString = new TextDecoder('latin1').decode(savedBytes);

    assert(!binaryString.includes('CONFIDENTIAL PATIENT RECORD 99482'), 'Confidential string must not appear in saved PDF');
    assert(!binaryString.includes('99482'), 'Patient ID token must not appear in saved PDF');
    assert(binaryString.includes('Hospital General Notice'), 'Unredacted text must be preserved');
  });
});
