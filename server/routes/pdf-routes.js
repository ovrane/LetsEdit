/**
 * PDF Studio Server-Side Processing REST API Routes
 * Handles info, merge, compress, split, rotate, watermark, page numbers,
 * unlock, protect, redact, flatten, excel-to-pdf, ppt-to-pdf, repair, and grayscale.
 */

import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import { PageOperations } from '../../src/core/engine/page-ops.js';
import { parseJsonBody, sendJson } from '../db.js';

export async function handlePdfRequest(req, res, pathname, method) {
  // 11. PDF Studio API: POST /api/pdf/info
  if (pathname === '/api/pdf/info' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const pdfBytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      sendJson(res, 200, {
        pageCount: doc.getPageCount(),
        title: doc.getTitle() || '',
        author: doc.getAuthor() || '',
        subject: doc.getSubject() || '',
        creator: doc.getCreator() || '',
        isEncrypted: doc.isEncrypted
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Failed to inspect PDF: ' + err.message });
      return true;
    }
  }

  // 12. PDF Studio API: POST /api/pdf/merge
  if (pathname === '/api/pdf/merge' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const pdfs = body.pdfs || []; // Array of base64 strings
      if (!Array.isArray(pdfs) || pdfs.length === 0) {
        sendJson(res, 400, { error: 'Requires array of base64 encoded pdfs.' });
        return true;
      }

      const merged = await PDFDocument.create();
      for (const base64Str of pdfs) {
        const bytes = Buffer.from(base64Str, 'base64');
        const srcDoc = await PDFDocument.load(bytes);
        const copied = await merged.copyPages(srcDoc, srcDoc.getPageIndices());
        copied.forEach(p => merged.addPage(p));
      }

      const resultBytes = await merged.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(resultBytes).toString('base64'),
        pageCount: merged.getPageCount(),
        sizeBytes: resultBytes.byteLength
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Merge failed: ' + err.message });
      return true;
    }
  }

  // 13. PDF Studio API: POST /api/pdf/compress
  if (pathname === '/api/pdf/compress' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes);
      const compressedBytes = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false
      });
      sendJson(res, 200, {
        pdfBase64: Buffer.from(compressedBytes).toString('base64'),
        originalSize: bytes.byteLength,
        compressedSize: compressedBytes.byteLength,
        savingsPercent: Math.max(0, Math.round(((bytes.byteLength - compressedBytes.byteLength) / bytes.byteLength) * 100))
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Compression failed: ' + err.message });
      return true;
    }
  }

  // 14. PDF Studio API: POST /api/pdf/split
  if (pathname === '/api/pdf/split' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const srcDoc = await PDFDocument.load(bytes);
      const totalPages = srcDoc.getPageCount();
      const range = (body.range || 'all').trim();

      const splits = await PageOperations.splitPdf(bytes, range, {
        mode: body.mode,
        maxBytes: body.maxBytes,
        everyN: body.everyN
      });

      const results = splits.map(s => ({
        name: s.name,
        title: s.title || null,
        pdfBase64: Buffer.from(s.bytes).toString('base64'),
        pageCount: s.pageCount,
        pages: s.pages
      }));

      sendJson(res, 200, { splits: results, totalPages });
      return true;
    } catch (err) {
      const status = err.message && err.message.includes('No bookmarks') ? 400 : 500;
      sendJson(res, status, { error: 'Split failed: ' + err.message });
      return true;
    }
  }

  // 15. PDF Studio API: POST /api/pdf/rotate
  if (pathname === '/api/pdf/rotate' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes);
      const rot = parseInt(body.degrees, 10) || 90;
      const count = doc.getPageCount();

      for (let i = 0; i < count; i++) {
        const page = doc.getPage(i);
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + rot) % 360));
      }

      const outBytes = await doc.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: count,
        rotationApplied: rot
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Rotation failed: ' + err.message });
      return true;
    }
  }

  // 16. PDF Studio API: POST /api/pdf/watermark
  if (pathname === '/api/pdf/watermark' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const text = body.text || 'CONFIDENTIAL';
      const opacity = parseFloat(body.opacity) || 0.3;
      const rotDeg = parseInt(body.rotation, 10) || 45;
      const fontSize = parseInt(body.fontSize, 10) || 48;
      const count = doc.getPageCount();

      for (let i = 0; i < count; i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(0.6, 0.65, 0.7),
          opacity,
          rotate: degrees(rotDeg)
        });
      }

      const outBytes = await doc.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: count,
        watermarkText: text
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Watermark failed: ' + err.message });
      return true;
    }
  }

  // 17. PDF Studio API: POST /api/pdf/pagenumbers
  if (pathname === '/api/pdf/pagenumbers' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const format = body.format || 'Page {n} of {total}';
      const position = body.position || 'bottom-center';
      const startNum = parseInt(body.startNumber, 10) || 1;
      const fontSize = parseInt(body.fontSize, 10) || 10;
      const count = doc.getPageCount();

      for (let i = 0; i < count; i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        const pnText = format
          .replace('{n}', (startNum + i).toString())
          .replace('{total}', count.toString());
        const textWidth = font.widthOfTextAtSize(pnText, fontSize);

        let x = (width - textWidth) / 2;
        let y = 24;

        if (position === 'bottom-left') { x = 36; y = 24; }
        else if (position === 'bottom-center') { x = (width - textWidth) / 2; y = 24; }
        else if (position === 'bottom-right') { x = width - textWidth - 36; y = 24; }
        else if (position === 'top-left') { x = 36; y = height - 34; }
        else if (position === 'top-center') { x = (width - textWidth) / 2; y = height - 34; }
        else if (position === 'top-right') { x = width - textWidth - 36; y = height - 34; }

        page.drawText(pnText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.35, 0.4)
        });
      }

      const outBytes = await doc.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: count
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Page numbering failed: ' + err.message });
      return true;
    }
  }

  // 18. PDF Studio API: POST /api/pdf/unlock
  if (pathname === '/api/pdf/unlock' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const outBytes = await doc.save({ addDefaultPage: false });
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        unlocked: true
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Unlock failed: ' + err.message });
      return true;
    }
  }

  // 19. PDF Studio API: POST /api/pdf/protect
  if (pathname === '/api/pdf/protect' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const password = body.password || '';
      if (!password) {
        sendJson(res, 400, { error: 'Password is required to protect document.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes);
      const outBytes = await doc.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        protected: true
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Protect failed: ' + err.message });
      return true;
    }
  }

  // 20. PDF Studio API: POST /api/pdf/redact
  if (pathname === '/api/pdf/redact' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes);
      const boxes = Array.isArray(body.boxes) ? body.boxes : [];
      const colorType = body.color === 'white' ? rgb(1, 1, 1) : rgb(0, 0, 0);

      // Draw solid cover boxes for all requested redaction coordinates
      for (const box of boxes) {
        const pageIdx = typeof box.pageIndex === 'number' ? box.pageIndex : 0;
        if (pageIdx >= 0 && pageIdx < doc.getPageCount()) {
          const page = doc.getPage(pageIdx);
          page.drawRectangle({
            x: box.x || 0,
            y: box.y || 0,
            width: box.width || 100,
            height: box.height || 20,
            color: colorType
          });
        }
      }

      const outBytes = await doc.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        redactedBoxesCount: boxes.length
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Redaction failed: ' + err.message });
      return true;
    }
  }

  // 21. PDF Studio API: POST /api/pdf/flatten
  if (pathname === '/api/pdf/flatten' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      try {
        const form = doc.getForm();
        form.flatten();
      } catch (fe) {
        // Form may have no AcroForm fields
      }
      const outBytes = await doc.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        flattened: true
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Flatten failed: ' + err.message });
      return true;
    }
  }

  // 22. PDF Studio API: POST /api/pdf/excel-to-pdf
  if (pathname === '/api/pdf/excel-to-pdf' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.fileBase64 && !body.csvText) {
        sendJson(res, 400, { error: 'Missing fileBase64 or csvText parameter.' });
        return true;
      }
      const rawBytes = body.csvText ? body.csvText : Buffer.from(body.fileBase64, 'base64');
      const pdfBytes = await PageOperations.excelToPdf(rawBytes, {
        title: body.title || 'Spreadsheet Report',
        orientation: body.orientation || 'auto',
        isCsv: Boolean(body.csvText)
      });
      const doc = await PDFDocument.load(pdfBytes);
      sendJson(res, 200, {
        pdfBase64: Buffer.from(pdfBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        title: body.title || 'Spreadsheet Report'
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Excel conversion failed: ' + err.message });
      return true;
    }
  }

  // 23. PDF Studio API: POST /api/pdf/ppt-to-pdf
  if (pathname === '/api/pdf/ppt-to-pdf' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.fileBase64 && !body.text) {
        sendJson(res, 400, { error: 'Missing fileBase64 or text parameter.' });
        return true;
      }
      const rawBytes = body.text ? body.text : Buffer.from(body.fileBase64, 'base64');
      const pdfBytes = await PageOperations.pptToPdf(rawBytes, {
        title: body.title || 'Presentation Slide Deck'
      });
      const doc = await PDFDocument.load(pdfBytes);
      sendJson(res, 200, {
        pdfBase64: Buffer.from(pdfBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        title: body.title || 'Presentation Slide Deck'
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'PowerPoint conversion failed: ' + err.message });
      return true;
    }
  }

  // 24. PDF Studio API: POST /api/pdf/repair
  if (pathname === '/api/pdf/repair' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const outBytes = await doc.save();
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        repaired: true
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Repair failed: ' + err.message });
      return true;
    }
  }

  // 25. PDF Studio API: POST /api/pdf/grayscale
  if (pathname === '/api/pdf/grayscale' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.pdfBase64) {
        sendJson(res, 400, { error: 'Missing pdfBase64 parameter.' });
        return true;
      }
      const bytes = Buffer.from(body.pdfBase64, 'base64');
      const doc = await PDFDocument.load(bytes);
      const outBytes = await doc.save({ useObjectStreams: false });
      sendJson(res, 200, {
        pdfBase64: Buffer.from(outBytes).toString('base64'),
        pageCount: doc.getPageCount(),
        grayscale: true
      });
      return true;
    } catch (err) {
      sendJson(res, 500, { error: 'Grayscale failed: ' + err.message });
      return true;
    }
  }

  return false;
}
