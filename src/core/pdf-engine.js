/**
 * PDF Engine: PDF.js rendering & PDF-Lib compilation
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFArray, PDFRawStream, PDFStream } from 'pdf-lib';
import { hexToRgb, uint8ArrayToBase64 } from '../utils/helpers.js';
import { applyPdfEncryption } from './pdf-crypto.js';
import { redactPageContentStreams, pdfHexToString, decompressStreamBytes } from './pdf-redactor.js';

// Setup PDF.js worker
const workerSrc = typeof window !== 'undefined'
  ? new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  : '';
if (workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export class PdfEngine {
  constructor() {
    this.pdfDoc = null;
    this.rawBytes = null;
  }

  async loadPdf(arrayBuffer) {
    this.rawBytes = arrayBuffer;
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
      cMapPacked: true
    });
    this.pdfDoc = await loadingTask.promise;
    return {
      numPages: this.pdfDoc.numPages,
      doc: this.pdfDoc
    };
  }

  async createSamplePdf() {
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Page 1: Sample Document
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page1.getSize();

    page1.drawText('Sample PDF Contract & Document', {
      x: 50,
      y: height - 80,
      size: 22,
      font: helveticaBold,
      color: rgb(0.12, 0.44, 0.72)
    });

    page1.drawText('Welcome to the next-generation Online PDF Editor.', {
      x: 50,
      y: height - 110,
      size: 13,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });

    // Content section
    const lines = [
      'This document is ready for interactive editing. You can test all core features:',
      '1. Text Editing: Click on any existing text above or below to edit, or add new text.',
      '2. Redaction / Whiteout: Mask sensitive details with opaque whiteout boxes.',
      '3. Annotate & Draw: Sketch freehand notes or highlight key clauses with the pen.',
      '4. Shapes & Lines: Insert rectangles, circles, or directional arrows.',
      '5. Signatures: Place electronic signatures using typing, drawing, or image upload.',
      '6. Form Controls: Add interactive text input fields and checkboxes.',
      '7. Page Controls: Use the left sidebar to rotate, reorder, or delete pages.'
    ];

    let yPos = height - 160;
    for (const line of lines) {
      page1.drawText(line, {
        x: 50,
        y: yPos,
        size: 11,
        font: times,
        color: rgb(0.2, 0.2, 0.2)
      });
      yPos -= 28;
    }

    // Add a decorative box
    page1.drawRectangle({
      x: 50,
      y: height - 480,
      width: width - 100,
      height: 70,
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
      color: rgb(0.96, 0.98, 1.0)
    });

    page1.drawText('Section 4: Agreement & Signatures', {
      x: 65,
      y: height - 440,
      size: 12,
      font: helveticaBold,
      color: rgb(0.15, 0.2, 0.3)
    });

    page1.drawText('Both parties agree to execute this agreement electronically.', {
      x: 65,
      y: height - 460,
      size: 10,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4)
    });

    // Signature Area
    page1.drawText('Authorized Signature:', {
      x: 50,
      y: height - 580,
      size: 11,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3)
    });

    page1.drawLine({
      start: { x: 50, y: height - 640 },
      end: { x: 250, y: height - 640 },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6)
    });

    page1.drawText('Date: ____________________', {
      x: 320,
      y: height - 640,
      size: 11,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });

    // Page 2: Second page for multi-page demo
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    page2.drawText('Page 2: Terms & Conditions Exhibit', {
      x: 50,
      y: height - 80,
      size: 18,
      font: helveticaBold,
      color: rgb(0.15, 0.2, 0.3)
    });

    page2.drawText('Detailed Terms and Policy Information:', {
      x: 50,
      y: height - 120,
      size: 12,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer;
  }

  async getPage(pageNum) {
    if (!this.pdfDoc) throw new Error('No PDF loaded');
    return await this.pdfDoc.getPage(pageNum);
  }

  async renderPageToCanvas(page, canvas, scale = 1.0, rotation = 0) {
    const totalRotation = (page.rotate + rotation) % 360;
    const viewport = page.getViewport({ scale, rotation: totalRotation });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    return viewport;
  }

  async extractTextItems(page, scale = 1.0, rotation = 0) {
    const totalRotation = (page.rotate + rotation) % 360;
    const viewport = page.getViewport({ scale, rotation: totalRotation });
    const textContent = await page.getTextContent();
    return {
      items: textContent.items,
      viewport
    };
  }

  async appendBlankPage(width = 595.28, height = 841.89) {
    if (!this.rawBytes) throw new Error('No PDF loaded');
    const doc = await PDFDocument.load(this.rawBytes);
    doc.addPage([width, height]);
    const newBytes = await doc.save();
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  async mergeExternalPdf(externalBytes) {
    if (!this.rawBytes) throw new Error('No PDF loaded');
    const primaryDoc = await PDFDocument.load(this.rawBytes);
    const extDoc = await PDFDocument.load(externalBytes);
    const pages = await primaryDoc.copyPages(extDoc, extDoc.getPageIndices());
    pages.forEach(p => primaryDoc.addPage(p));
    const newBytes = await primaryDoc.save();
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  /**
   * Splits or extracts pages from the active PDF based on a range expression.
   * e.g. "1-2, 3" -> generates separate documents.
   * @param {string} rangeExpression - e.g. "1-2, 3" or "all"
   * @returns {Promise<Array<{ name: string, bytes: Uint8Array, pageCount: number }>>}
   */
  async splitPdf(rangeExpression) {
    if (!this.rawBytes) throw new Error('No PDF loaded to split');
    const sourceDoc = await PDFDocument.load(this.rawBytes);
    const totalPages = sourceDoc.getPageCount();

    if (!rangeExpression || rangeExpression.trim().toLowerCase() === 'all') {
      // Split each page into individual documents
      const results = [];
      for (let i = 0; i < totalPages; i++) {
        const subDoc = await PDFDocument.create();
        const [page] = await subDoc.copyPages(sourceDoc, [i]);
        subDoc.addPage(page);
        const bytes = await subDoc.save();
        results.push({
          name: `page_${i + 1}.pdf`,
          bytes,
          pageCount: 1
        });
      }
      return results;
    }

    // Parse comma-separated ranges: e.g. "1-2, 3-5"
    const groups = rangeExpression.split(',').map(s => s.trim()).filter(Boolean);
    const results = [];

    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const g = groups[gIdx];
      let pageIndices = [];
      if (g.includes('-')) {
        const [startStr, endStr] = g.split('-').map(s => s.trim());
        const start = Math.max(1, parseInt(startStr, 10));
        const end = Math.min(totalPages, parseInt(endStr, 10));
        for (let p = start; p <= end; p++) {
          pageIndices.push(p - 1);
        }
      } else {
        const p = parseInt(g, 10);
        if (p >= 1 && p <= totalPages) {
          pageIndices.push(p - 1);
        }
      }

      if (pageIndices.length > 0) {
        const subDoc = await PDFDocument.create();
        const pages = await subDoc.copyPages(sourceDoc, pageIndices);
        pages.forEach(pg => subDoc.addPage(pg));
        const bytes = await subDoc.save();
        results.push({
          name: `split_range_${g.replace(/\s+/g, '')}.pdf`,
          bytes,
          pageCount: pageIndices.length
        });
      }
    }

    return results;
  }

  /**
   * Slices each page down the middle (Sejda Split in Half tool).
   * Commonly used for scanned books, magazines, or A3 spreads.
   * @param {'vertical'|'horizontal'} direction - 'vertical' (left/right) or 'horizontal' (top/bottom)
   * @returns {Promise<Uint8Array>}
   */
  async splitInHalf(direction = 'vertical') {
    if (!this.rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(this.rawBytes);
    const finalDoc = await PDFDocument.create();
    const numPages = sourceDoc.getPageCount();

    for (let i = 0; i < numPages; i++) {
      const origPage = sourceDoc.getPage(i);
      const { width, height } = origPage.getSize();

      if (direction === 'horizontal') {
        // Top half first
        const [topHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        topHalf.setCropBox(0, height / 2, width, height / 2);
        finalDoc.addPage(topHalf);

        // Bottom half second
        const [bottomHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        bottomHalf.setCropBox(0, 0, width, height / 2);
        finalDoc.addPage(bottomHalf);
      } else {
        // Vertical cut: Left half first
        const [leftHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        leftHalf.setCropBox(0, 0, width / 2, height);
        finalDoc.addPage(leftHalf);

        // Right half second
        const [rightHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        rightHalf.setCropBox(width / 2, 0, width / 2, height);
        finalDoc.addPage(rightHalf);
      }
    }

    return await finalDoc.save();
  }

  /**
   * Removes password encryption and restrictions from a PDF document (Sejda Unlock tool).
   * @param {ArrayBuffer|Uint8Array} encryptedBytes
   * @param {string} [password] - User or owner password
   * @returns {Promise<Uint8Array>}
   */
  async unlockPdf(encryptedBytes, password = '') {
    const sourceDoc = await PDFDocument.load(encryptedBytes, { ignoreEncryption: true });
    const finalDoc = await PDFDocument.create();
    const pageIndices = sourceDoc.getPageIndices();
    const pages = await finalDoc.copyPages(sourceDoc, pageIndices);
    pages.forEach(p => finalDoc.addPage(p));
    finalDoc.context.trailerInfo.Encrypt = undefined;
    return await finalDoc.save();
  }

  /**
   * Resizes page margins or bounds per Sejda's Resize PDF tool.
   * Embeds original pages into newly dimensioned pages with specified margins.
   * @param {Uint8Array|ArrayBuffer} pdfBytes
   * @param {Object} options
   *   marginTop, marginRight, marginBottom, marginLeft (in points, default 0)
   *   pageSize: 'original' | 'a4' | 'letter' | 'legal'
   *   backgroundColor: '#ffffff'
   * @returns {Promise<Uint8Array>}
   */
  async resizePdfMargins(pdfBytes, options = {}) {
    const {
      marginTop = 0,
      marginRight = 0,
      marginBottom = 0,
      marginLeft = 0,
      pageSize = 'original',
      backgroundColor = '#ffffff'
    } = options;

    const srcDoc = await PDFDocument.load(pdfBytes);
    const newDoc = await PDFDocument.create();
    const pageCount = srcDoc.getPageCount();

    const STANDARD_SIZES = {
      a4: [595.28, 841.89],
      letter: [612.0, 792.0],
      legal: [612.0, 1008.0]
    };

    const { r, g, b } = hexToRgb(backgroundColor || '#ffffff');
    const bgCol = rgb(r / 255, g / 255, b / 255);

    for (let i = 0; i < pageCount; i++) {
      const srcPage = srcDoc.getPage(i);
      const { width: origWidth, height: origHeight } = srcPage.getSize();

      if (!srcPage.node.get(PDFName.of('Contents'))) {
        srcPage.node.set(PDFName.of('Contents'), srcDoc.context.register(srcDoc.context.stream('')));
      }

      let newWidth, newHeight, drawX, drawY, drawW, drawH;

      if (pageSize !== 'original' && STANDARD_SIZES[pageSize.toLowerCase()]) {
        [newWidth, newHeight] = STANDARD_SIZES[pageSize.toLowerCase()];
        const availableW = Math.max(10, newWidth - (Number(marginLeft) + Number(marginRight)));
        const availableH = Math.max(10, newHeight - (Number(marginTop) + Number(marginBottom)));
        const scale = Math.min(availableW / origWidth, availableH / origHeight, 1.0);
        drawW = origWidth * scale;
        drawH = origHeight * scale;
        drawX = Number(marginLeft) + (availableW - drawW) / 2;
        drawY = Number(marginBottom) + (availableH - drawH) / 2;
      } else {
        newWidth = origWidth + Number(marginLeft) + Number(marginRight);
        newHeight = origHeight + Number(marginTop) + Number(marginBottom);
        drawX = Number(marginLeft);
        drawY = Number(marginBottom);
        drawW = origWidth;
        drawH = origHeight;
      }

      const embedded = await newDoc.embedPage(srcPage);
      const newPage = newDoc.addPage([newWidth, newHeight]);
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: newWidth,
        height: newHeight,
        color: bgCol
      });
      newPage.drawPage(embedded, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });
    }

    return await newDoc.save({ updateMetadata: false });
  }

  /**
   * Compresses PDF documents per Sejda's Compress PDF tool specifications.
   * Compresses indirect object streams, optimizes xref tables, and flattens redundant structures.
   * @param {Uint8Array|ArrayBuffer} pdfBytes
   * @param {Object} options
   *   quality: 'extreme' | 'recommended' | 'low'
   *   removeMetadata?: boolean
   * @returns {Promise<{ bytes: Uint8Array, originalSize: number, compressedSize: number, savingsPercent: number }>}
   */
  async compressPdf(pdfBytes, options = {}) {
    const originalSize = pdfBytes.byteLength || pdfBytes.length;
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    if (options.removeMetadata) {
      doc.context.trailerInfo.Info = undefined;
    }

    // Enable cross-reference object stream compression (PDF 1.5+)
    // Packs dictionary and indirect objects into compact binary flate streams
    const compressedBytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateMetadata: false
    });

    let finalBytes = compressedBytes;
    let finalSize = compressedBytes.byteLength || compressedBytes.length;

    // Never return larger bytes than source
    if (finalSize > originalSize && !options.removeMetadata) {
      finalBytes = new Uint8Array(pdfBytes);
      finalSize = originalSize;
    }

    const savings = Math.max(0, originalSize - finalSize);
    const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

    return {
      bytes: finalBytes,
      originalSize,
      compressedSize: finalSize,
      savingsPercent
    };
  }

  /**
   * Flips / mirrors PDF pages horizontally, vertically, or both (Sejda Flip PDF tool).
   * Employs vector coordinate transformation matrix to mirror all content without rasterization.
   * @param {Uint8Array|ArrayBuffer} pdfBytes
   * @param {{ direction?: 'horizontal'|'vertical'|'both', pageRange?: 'all'|number[] }} options
   * @returns {Promise<Uint8Array>}
   */
  async flipPages(pdfBytes, options = {}) {
    const direction = options.direction || 'horizontal';
    const targetPages = options.pageRange || 'all';

    const srcDoc = await PDFDocument.load(pdfBytes);
    const finalDoc = await PDFDocument.create();
    const count = srcDoc.getPageCount();

    for (let i = 0; i < count; i++) {
      const pageNum = i + 1;
      const shouldFlip = targetPages === 'all' || (Array.isArray(targetPages) && targetPages.includes(pageNum));

      const srcPage = srcDoc.getPage(i);
      const { width, height } = srcPage.getSize();

      // Guard: Ensure srcPage has non-empty Contents before embedding
      if (!srcPage.node.get(PDFName.of('Contents'))) {
        srcPage.node.set(PDFName.of('Contents'), srcDoc.context.register(srcDoc.context.stream('')));
      }

      if (!shouldFlip) {
        const [copied] = await finalDoc.copyPages(srcDoc, [i]);
        finalDoc.addPage(copied);
      } else {
        const embedded = await finalDoc.embedPage(srcPage);
        const newPage = finalDoc.addPage([width, height]);

        if (direction === 'horizontal') {
          // Mirror horizontally: x' = width - x
          newPage.drawPage(embedded, {
            x: width,
            y: 0,
            xScale: -1,
            yScale: 1
          });
        } else if (direction === 'vertical') {
          // Mirror vertically: y' = height - y
          newPage.drawPage(embedded, {
            x: 0,
            y: height,
            xScale: 1,
            yScale: -1
          });
        } else if (direction === 'both') {
          // Mirror both: x' = width - x, y' = height - y
          newPage.drawPage(embedded, {
            x: width,
            y: height,
            xScale: -1,
            yScale: -1
          });
        }
      }
    }

    return await finalDoc.save({ updateMetadata: false });
  }

  /**
   * Converts a PDF to monochrome grayscale per Sejda Grayscale tool specifications.
   * Desaturates content stream vector RGB and CMYK color operators (rg, RG, k, K) to luminance DeviceGray.
   * @param {Uint8Array|ArrayBuffer} pdfBytes
   * @returns {Promise<Uint8Array>}
   */
  async convertToGrayscale(pdfBytes) {
    const doc = await PDFDocument.load(pdfBytes);
    const count = doc.getPageCount();

    for (let i = 0; i < count; i++) {
      const page = doc.getPage(i);
      const contents = page.node.Contents();
      if (!contents) continue;

      const streamRefs = [];
      if (contents.asArray) {
        const arr = contents.asArray();
        for (let j = 0; j < arr.length; j++) streamRefs.push(contents.get(j));
      } else if (contents.size) {
        for (let j = 0; j < contents.size(); j++) streamRefs.push(contents.get(j));
      } else {
        streamRefs.push(contents);
      }

      for (const ref of streamRefs) {
        const stream = doc.context.lookup(ref);
        if (!stream || !stream.getContents) continue;

        const rawBytes = stream.getContents();
        const decompressed = await decompressStreamBytes(rawBytes);
        const text = new TextDecoder('latin1').decode(decompressed);

        // Replace RGB fill (r g b rg) with DeviceGray (lum g)
        let converted = text.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+rg\b/g, (match, r, g, b) => {
          const lum = Math.min(1, Math.max(0, 0.299 * parseFloat(r) + 0.587 * parseFloat(g) + 0.114 * parseFloat(b)));
          return `${lum.toFixed(3)} g`;
        });

        // Replace RGB stroke (r g b RG) with DeviceGray (lum G)
        converted = converted.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+RG\b/g, (match, r, g, b) => {
          const lum = Math.min(1, Math.max(0, 0.299 * parseFloat(r) + 0.587 * parseFloat(g) + 0.114 * parseFloat(b)));
          return `${lum.toFixed(3)} G`;
        });

        // Replace CMYK fill (c m y k k) with DeviceGray (lum g)
        converted = converted.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+k\b/g, (match, c, m, y, k) => {
          const cVal = parseFloat(c), mVal = parseFloat(m), yVal = parseFloat(y), kVal = parseFloat(k);
          const r = (1 - cVal) * (1 - kVal);
          const g = (1 - mVal) * (1 - kVal);
          const b = (1 - yVal) * (1 - kVal);
          const lum = Math.min(1, Math.max(0, 0.299 * r + 0.587 * g + 0.114 * b));
          return `${lum.toFixed(3)} g`;
        });

        // Replace CMYK stroke (c m y k K) with DeviceGray (lum G)
        converted = converted.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+K\b/g, (match, c, m, y, k) => {
          const cVal = parseFloat(c), mVal = parseFloat(m), yVal = parseFloat(y), kVal = parseFloat(k);
          const r = (1 - cVal) * (1 - kVal);
          const g = (1 - mVal) * (1 - kVal);
          const b = (1 - yVal) * (1 - kVal);
          const lum = Math.min(1, Math.max(0, 0.299 * r + 0.587 * g + 0.114 * b));
          return `${lum.toFixed(3)} G`;
        });

        if (converted !== text) {
          const newStream = doc.context.flateStream(new TextEncoder().encode(converted));
          doc.context.assign(ref, newStream);
        }
      }
    }

    return await doc.save({ updateMetadata: false });
  }


  /**
   * Interleaves pages from two documents (Sejda Alternate & Mix tool).
   * Commonly used for duplex feeder scanning (Doc A = odd pages, Doc B = even pages).
   * @param {ArrayBuffer|Uint8Array} docABytes
   * @param {ArrayBuffer|Uint8Array} docBBytes
   * @param {{ reverseB?: boolean }} options
   * @returns {Promise<Uint8Array>}
   */
  async alternateMix(docABytes, docBBytes, options = {}) {
    const docA = await PDFDocument.load(docABytes);
    const docB = await PDFDocument.load(docBBytes);
    const finalDoc = await PDFDocument.create();

    const countA = docA.getPageCount();
    const countB = docB.getPageCount();
    const reverseB = options.reverseB !== false; // Default true for scanner flows

    const indicesB = Array.from({ length: countB }, (_, i) => i);
    if (reverseB) indicesB.reverse();

    const maxCount = Math.max(countA, countB);

    for (let i = 0; i < maxCount; i++) {
      if (i < countA) {
        const [copiedA] = await finalDoc.copyPages(docA, [i]);
        finalDoc.addPage(copiedA);
      }
      if (i < countB) {
        const bIdx = indicesB[i];
        const [copiedB] = await finalDoc.copyPages(docB, [bIdx]);
        finalDoc.addPage(copiedB);
      }
    }

    return await finalDoc.save();
  }

  /**
   * Generates N-Up imposition (2 or 4 pages per sheet onto A4).
   * @param {number} nUpCount - 2 or 4
   * @returns {Promise<Uint8Array>}
   */
  async nUpPdf(nUpCount = 2) {
    if (!this.rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(this.rawBytes);
    const finalDoc = await PDFDocument.create();
    const numPages = sourceDoc.getPageCount();

    if (nUpCount === 2) {
      // 2-Up: Landscape A4 (841.89 x 595.28 pt)
      const sheetW = 841.89;
      const sheetH = 595.28;

      for (let i = 0; i < numPages; i += 2) {
        const sheet = finalDoc.addPage([sheetW, sheetH]);

        const page1 = sourceDoc.getPage(i);
        if (!page1.node.get(PDFName.of('Contents'))) {
          page1.node.set(PDFName.of('Contents'), sourceDoc.context.register(sourceDoc.context.stream('')));
        }
        const ep1 = await finalDoc.embedPage(page1);
        const sz1 = ep1.size();
        const scale1 = Math.min((sheetW / 2 - 40) / sz1.width, (sheetH - 40) / sz1.height);
        sheet.drawPage(ep1, {
          x: 30 + ((sheetW / 2 - 40) - sz1.width * scale1) / 2,
          y: (sheetH - sz1.height * scale1) / 2,
          xScale: scale1,
          yScale: scale1
        });

        if (i + 1 < numPages) {
          const page2 = sourceDoc.getPage(i + 1);
          if (!page2.node.get(PDFName.of('Contents'))) {
            page2.node.set(PDFName.of('Contents'), sourceDoc.context.register(sourceDoc.context.stream('')));
          }
          const ep2 = await finalDoc.embedPage(page2);
          const sz2 = ep2.size();
          const scale2 = Math.min((sheetW / 2 - 40) / sz2.width, (sheetH - 40) / sz2.height);
          sheet.drawPage(ep2, {
            x: sheetW / 2 + 10 + ((sheetW / 2 - 40) - sz2.width * scale2) / 2,
            y: (sheetH - sz2.height * scale2) / 2,
            xScale: scale2,
            yScale: scale2
          });
        }
      }
    } else {
      // 4-Up: Portrait A4 (595.28 x 841.89 pt) in 2x2 grid
      const sheetW = 595.28;
      const sheetH = 841.89;
      const cellW = sheetW / 2;
      const cellH = sheetH / 2;

      for (let i = 0; i < numPages; i += 4) {
        const sheet = finalDoc.addPage([sheetW, sheetH]);
        const positions = [
          { x: 10, y: cellH + 10 },               // Top-left
          { x: cellW + 10, y: cellH + 10 },       // Top-right
          { x: 10, y: 10 },                       // Bottom-left
          { x: cellW + 10, y: 10 }                // Bottom-right
        ];

        for (let sub = 0; sub < 4; sub++) {
          const pIdx = i + sub;
          if (pIdx < numPages) {
            const page = sourceDoc.getPage(pIdx);
            if (!page.node.get(PDFName.of('Contents'))) {
              page.node.set(PDFName.of('Contents'), sourceDoc.context.register(sourceDoc.context.stream('')));
            }
            const ep = await finalDoc.embedPage(page);
            const sz = ep.size();
            const scale = Math.min((cellW - 20) / sz.width, (cellH - 20) / sz.height);
            sheet.drawPage(ep, {
              x: positions[sub].x + ((cellW - 20) - sz.width * scale) / 2,
              y: positions[sub].y + ((cellH - 20) - sz.height * scale) / 2,
              xScale: scale,
              yScale: scale
            });
          }
        }
      }
    }

    return await finalDoc.save();
  }

  /**
   * Converts an array of images (data URL or Uint8Array/ArrayBuffer) into a clean A4 PDF.
   * @param {Array<{ bytes?: Uint8Array|ArrayBuffer, dataUrl?: string, isJpg?: boolean }>} imagesList
   * @returns {Promise<Uint8Array>}
   */
  async imagesToPdf(imagesList) {
    const finalDoc = await PDFDocument.create();
    const pageW = 595.28;
    const pageH = 841.89;

    for (const item of imagesList) {
      let imgBytes = item.bytes;
      if (!imgBytes && item.dataUrl) {
        if (typeof fetch !== 'undefined') {
          imgBytes = await fetch(item.dataUrl).then(r => r.arrayBuffer());
        }
      }
      if (!imgBytes) continue;

      let embeddedImg;
      const isJpg = item.isJpg || (item.dataUrl && (item.dataUrl.includes('image/jpeg') || item.dataUrl.includes('image/jpg')));
      if (isJpg) {
        embeddedImg = await finalDoc.embedJpg(imgBytes);
      } else {
        embeddedImg = await finalDoc.embedPng(imgBytes);
      }

      const imgDims = embeddedImg.scale(1.0);
      const scale = Math.min((pageW - 40) / imgDims.width, (pageH - 40) / imgDims.height);
      const scaledW = imgDims.width * scale;
      const scaledH = imgDims.height * scale;

      const page = finalDoc.addPage([pageW, pageH]);
      page.drawImage(embeddedImg, {
        x: (pageW - scaledW) / 2,
        y: (pageH - scaledH) / 2,
        width: scaledW,
        height: scaledH
      });
    }

    return await finalDoc.save();
  }

  /**
   * Extracts all plain text across all document pages.
   * @returns {Promise<string>}
   */
  async extractDocumentText() {
    if (!this.rawBytes && !this.pdfDoc) throw new Error('No PDF loaded');

    // Browser path via PDF.js if available
    if (this.pdfDoc) {
      const fullText = [];
      for (let p = 1; p <= this.pdfDoc.numPages; p++) {
        const page = await this.pdfDoc.getPage(p);
        const content = await page.getTextContent();
        const pageStrings = content.items.map(item => item.str).join(' ');
        fullText.push(`--- Page ${p} ---\n${pageStrings}\n`);
      }
      return fullText.join('\n');
    }

    // Direct content stream parsing path (headless/Node.js safe)
    const doc = await PDFDocument.load(this.rawBytes);
    const numPages = doc.getPageCount();
    const fullText = [];

    for (let i = 0; i < numPages; i++) {
      const page = doc.getPage(i);
      const pageNum = i + 1;
      const contentsRef = page.node.get(PDFName.of('Contents'));
      const streamTexts = [];

      if (contentsRef) {
        const streamObjects = contentsRef instanceof PDFArray
          ? contentsRef.asArray()
          : (Array.isArray(contentsRef) ? contentsRef : [contentsRef]);
        for (const ref of streamObjects) {
          const stream = doc.context.lookup(ref);
          if (stream && stream.getContents) {
            let bytes = stream.getContents();
            try {
              const filter = stream.dict.get(PDFName.of('Filter'));
              if (filter && (filter.encodedName === '/FlateDecode' || filter === PDFName.of('FlateDecode'))) {
                bytes = await decompressStreamBytes(bytes);
              }
            } catch (e) {
              // Proceed with uncompressed bytes
            }

            const textStr = new TextDecoder('latin1').decode(bytes);

            // Match literal strings: (text) Tj
            const literalMatches = textStr.match(/\(([^)]+)\)\s*(?:Tj|'|")/g) || [];
            for (const lm of literalMatches) {
              const cleaned = lm.replace(/^[('"]|[)'"]\s*(?:Tj)?$/g, '').trim();
              if (cleaned) streamTexts.push(cleaned);
            }

            // Match hex strings: <hex> Tj
            const hexMatches = textStr.match(/<([0-9a-fA-F]+)>\s*Tj/g) || [];
            for (const hm of hexMatches) {
              const hexVal = hm.replace(/[<>\sTj]/g, '');
              const decoded = pdfHexToString(hexVal);
              if (decoded && decoded.trim()) streamTexts.push(decoded.trim());
            }

            // Match array TJ: [(text) 10 (text2)] TJ
            const arrayMatches = textStr.match(/\[([^\]]+)\]\s*TJ/g) || [];
            for (const am of arrayMatches) {
              const inArr = am.match(/\(([^)]+)\)/g) || [];
              for (const item of inArr) {
                const s = item.replace(/[()]/g, '').trim();
                if (s) streamTexts.push(s);
              }
            }
          }
        }
      }

      fullText.push(`--- Page ${pageNum} ---\n${streamTexts.join(' ')}\n`);
    }

    return fullText.join('\n');
  }

  /**
   * Renders a given page to a high-resolution Image Blob (PNG / JPEG).
   * @param {number} pageNum
   * @param {number} dpiScale - 1.0 (72 DPI), 2.0 (150 DPI), 4.16 (300 DPI)
   * @param {string} format - 'image/png' or 'image/jpeg'
   * @returns {Promise<Blob>}
   */
  async renderPageToImageBlob(pageNum, dpiScale = 2.0, format = 'image/png') {
    if (!this.pdfDoc) throw new Error('No PDF loaded');
    const page = await this.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: dpiScale });
    if (typeof document === 'undefined') {
      return new Uint8Array(0);
    }
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    return new Promise(resolve => canvas.toBlob(resolve, format, 0.95));
  }

  /**
   * Extracts all embedded image objects (JPEG, PNG, JPX, raster) from a PDF.
   * @param {Uint8Array|ArrayBuffer} [pdfBytes]
   * @returns {Promise<Array<{ id: string, name: string, width: number, height: number, bytes: Uint8Array, mimeType: string, extension: string, dataUrl: string, sizeBytes: number }>>}
   */
  async extractImages(pdfBytes = null) {
    const bytesToUse = pdfBytes || this.rawBytes;
    if (!bytesToUse) throw new Error('No PDF loaded to extract images from');

    const doc = await PDFDocument.load(bytesToUse, { ignoreEncryption: true });
    const extracted = [];
    const context = doc.context;
    const indirectObjects = context.enumerateIndirectObjects();

    let imageIndex = 1;
    for (const [ref, obj] of indirectObjects) {
      if (!obj || !(obj instanceof PDFRawStream || obj instanceof PDFStream)) continue;
      const dict = obj.dict;
      if (!dict) continue;

      const subtype = dict.get(PDFName.of('Subtype'))?.toString();
      if (subtype !== '/Image') continue;

      const width = dict.get(PDFName.of('Width'))?.asNumber?.() || 0;
      const height = dict.get(PDFName.of('Height'))?.asNumber?.() || 0;
      const filter = dict.get(PDFName.of('Filter'))?.toString() || '';

      const rawBytes = obj.contents;
      if (!rawBytes || rawBytes.length === 0) continue;

      let mimeType = 'image/jpeg';
      let extension = 'jpg';
      let dataUrl = null;

      if (filter.includes('DCTDecode')) {
        mimeType = 'image/jpeg';
        extension = 'jpg';
        dataUrl = `data:image/jpeg;base64,${uint8ArrayToBase64(rawBytes)}`;
      } else if (filter.includes('JPXDecode')) {
        mimeType = 'image/jp2';
        extension = 'jp2';
        dataUrl = `data:image/jp2;base64,${uint8ArrayToBase64(rawBytes)}`;
      } else {
        // FlateDecode or uncompressed raster
        try {
          const decompressed = await decompressStreamBytes(rawBytes);
          if (typeof document !== 'undefined' && width > 0 && height > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;

            if (decompressed.length === width * height * 4) {
              data.set(decompressed);
            } else if (decompressed.length === width * height * 3) {
              for (let i = 0, j = 0; i < decompressed.length; i += 3, j += 4) {
                data[j] = decompressed[i];
                data[j + 1] = decompressed[i + 1];
                data[j + 2] = decompressed[i + 2];
                data[j + 3] = 255;
              }
            } else if (decompressed.length >= width * height) {
              for (let i = 0, j = 0; i < width * height; i++, j += 4) {
                const g = decompressed[i];
                data[j] = g;
                data[j + 1] = g;
                data[j + 2] = g;
                data[j + 3] = 255;
              }
            }
            ctx.putImageData(imgData, 0, 0);
            dataUrl = canvas.toDataURL('image/png');
            mimeType = 'image/png';
            extension = 'png';
          }
        } catch (e) {
          // Fallback if decompression fails
        }
      }

      if (!dataUrl && rawBytes) {
        dataUrl = `data:${mimeType};base64,${uint8ArrayToBase64(rawBytes)}`;
      }

      extracted.push({
        id: `img_${imageIndex}`,
        name: `image_${imageIndex}.${extension}`,
        width,
        height,
        bytes: rawBytes,
        mimeType,
        extension,
        dataUrl,
        sizeBytes: rawBytes.length
      });
      imageIndex++;
    }

    return extracted;
  }

  /**
   * Compiles all edits back into a vector PDF file using pdf-lib.
   */
  async exportPdf(state) {
    if (!this.rawBytes) throw new Error('No source PDF to export');

    const sourceDoc = await PDFDocument.load(this.rawBytes);
    const finalDoc = await PDFDocument.create();

    const helvetica = await finalDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await finalDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await finalDoc.embedFont(StandardFonts.TimesRoman);
    const courier = await finalDoc.embedFont(StandardFonts.Courier);

    const fontMap = {
      Helvetica: helvetica,
      HelveticaBold: helveticaBold,
      TimesRoman: timesRoman,
      Courier: courier,
      Roboto: helvetica,
      Montserrat: helveticaBold,
      Caveat: timesRoman
    };

    if (state.metadata) {
      if (state.metadata.title) finalDoc.setTitle(state.metadata.title);
      if (state.metadata.author) finalDoc.setAuthor(state.metadata.author);
      if (state.metadata.subject) finalDoc.setSubject(state.metadata.subject);
      if (state.metadata.keywords) {
        const kwList = Array.isArray(state.metadata.keywords)
          ? state.metadata.keywords
          : String(state.metadata.keywords).split(',').map(s => s.trim()).filter(Boolean);
        finalDoc.setKeywords(kwList);
      }
      if (state.metadata.creator) finalDoc.setCreator(state.metadata.creator);
      if (state.metadata.producer) finalDoc.setProducer(state.metadata.producer);
    }

    const numSourcePages = sourceDoc.getPageCount();

    // Determine target page sequence from pageOrder
    const targetOrder = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder.filter(p => !state.deletedPages.has(p) && p <= numSourcePages)
      : Array.from({ length: numSourcePages }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));

    const totalPages = targetOrder.length;

    for (let outIdx = 0; outIdx < totalPages; outIdx++) {
      const origPage = targetOrder[outIdx];
      const [copiedPage] = await finalDoc.copyPages(sourceDoc, [origPage - 1]);
      finalDoc.addPage(copiedPage);

      const { width: pWidth, height: pHeight } = copiedPage.getSize();

      // Apply crop margins if configured
      if (state.cropSettings) {
        const cs = state.cropSettings;
        if (cs.applyToAll || cs.pageNum === origPage) {
          const top = Number(cs.top) || 0;
          const right = Number(cs.right) || 0;
          const bottom = Number(cs.bottom) || 0;
          const left = Number(cs.left) || 0;

          const cropX = left;
          const cropY = bottom;
          const cropW = Math.max(20, pWidth - left - right);
          const cropH = Math.max(20, pHeight - top - bottom);

          copiedPage.setCropBox(cropX, cropY, cropW, cropH);
        }
      }

      // Apply rotation if any
      const addRotation = state.pageRotations[origPage] || 0;
      if (addRotation !== 0) {
        const curRot = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees((curRot + addRotation) % 360));
      }

      // Get annotations for this page
      const annotations = state.annotations[origPage] || [];

      // Pass 1: True Redaction - Purge underlying text content streams
      const redactionBoxes = [];
      const textTargets = [];

      for (const ann of annotations) {
        if (ann.type === 'whiteout' || (ann.type === 'text' && ann.hasUnderlay)) {
          const pdfX = ann.x * pWidth;
          const pdfY = pHeight - (ann.y * pHeight) - (ann.height * pHeight);
          const pdfW = ann.width * pWidth;
          const pdfH = ann.height * pHeight;
          redactionBoxes.push({ x: pdfX, y: pdfY, width: pdfW, height: pdfH });
          if (ann.replacedText) textTargets.push(ann.replacedText);
        }
      }

      if (redactionBoxes.length > 0 || textTargets.length > 0) {
        try {
          await redactPageContentStreams(finalDoc, copiedPage, redactionBoxes, textTargets);
        } catch (redactErr) {
          console.warn('Content stream redaction skipped for page:', redactErr);
        }
      }

      // Pass 2: Draw visual annotations
      for (const ann of annotations) {
        const pdfX = ann.x * pWidth;
        const pdfY = pHeight - (ann.y * pHeight) - (ann.height * pHeight);
        const pdfW = ann.width * pWidth;
        const pdfH = ann.height * pHeight;

        if (ann.type === 'whiteout') {
          const isBlackout = ann.color === '#000000' || ann.isBlackout;
          copiedPage.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH,
            color: isBlackout ? rgb(0, 0, 0) : rgb(1, 1, 1),
            borderWidth: 0
          });
        } else if (ann.type === 'text') {
          if (ann.hasUnderlay) {
            copiedPage.drawRectangle({
              x: pdfX - 2,
              y: pdfY - 2,
              width: pdfW + 4,
              height: pdfH + 4,
              color: rgb(1, 1, 1),
              borderWidth: 0
            });
          }

          const font = fontMap[ann.fontFamily] || helvetica;
          const { r, g, b } = hexToRgb(ann.color || '#000000');
          const fontSize = (ann.fontSize || 14) * (pWidth / 600);

          copiedPage.drawText(ann.text || '', {
            x: pdfX,
            y: pdfY + (pdfH * 0.2),
            size: fontSize,
            font: font,
            color: rgb(r / 255, g / 255, b / 255)
          });
        } else if (ann.type === 'shape') {
          const { r: sr, g: sg, b: sb } = hexToRgb(ann.strokeColor || '#000000');
          const hasFill = ann.fillColor && ann.fillColor !== 'transparent';
          const fill = hasFill ? hexToRgb(ann.fillColor) : null;

          if (ann.shapeType === 'rectangle') {
            copiedPage.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: pdfW,
              height: pdfH,
              borderColor: rgb(sr / 255, sg / 255, sb / 255),
              borderWidth: ann.strokeWidth || 2,
              color: fill ? rgb(fill.r / 255, fill.g / 255, fill.b / 255) : undefined
            });
          } else if (ann.shapeType === 'ellipse') {
            copiedPage.drawEllipse({
              x: pdfX + (pdfW / 2),
              y: pdfY + (pdfH / 2),
              xScale: pdfW / 2,
              yScale: pdfH / 2,
              borderColor: rgb(sr / 255, sg / 255, sb / 255),
              borderWidth: ann.strokeWidth || 2,
              color: fill ? rgb(fill.r / 255, fill.g / 255, fill.b / 255) : undefined
            });
          } else if (ann.shapeType === 'line') {
            copiedPage.drawLine({
              start: { x: pdfX, y: pdfY + pdfH },
              end: { x: pdfX + pdfW, y: pdfY },
              thickness: ann.strokeWidth || 2,
              color: rgb(sr / 255, sg / 255, sb / 255)
            });
          }
        } else if (ann.type === 'image' || ann.type === 'signature') {
          try {
            if (ann.dataUrl) {
              const imgBytes = await fetch(ann.dataUrl).then(r => r.arrayBuffer());
              let embeddedImg;
              if (ann.dataUrl.includes('image/jpeg') || ann.dataUrl.includes('image/jpg')) {
                embeddedImg = await finalDoc.embedJpg(imgBytes);
              } else {
                embeddedImg = await finalDoc.embedPng(imgBytes);
              }

              copiedPage.drawImage(embeddedImg, {
                x: pdfX,
                y: pdfY,
                width: pdfW,
                height: pdfH
              });
            }
          } catch (imgErr) {
            console.error('Failed to embed image in export:', imgErr);
          }
        } else if (ann.type === 'drawing') {
          if (ann.points && ann.points.length > 1) {
            const { r, g, b } = hexToRgb(ann.color || '#ff0000');
            const strokeColor = rgb(r / 255, g / 255, b / 255);
            const thickness = (ann.strokeWidth || 3) * (pWidth / 600);

            for (let i = 0; i < ann.points.length - 1; i++) {
              const pt1 = ann.points[i];
              const pt2 = ann.points[i + 1];
              copiedPage.drawLine({
                start: { x: pt1.x * pWidth, y: pHeight - (pt1.y * pHeight) },
                end: { x: pt2.x * pWidth, y: pHeight - (pt2.y * pHeight) },
                thickness,
                color: strokeColor,
                opacity: ann.isHighlighter ? 0.4 : 1.0
              });
            }
          }
        } else if (ann.type === 'form') {
          // Native Interactive AcroForm Fields
          try {
            const form = finalDoc.getForm();
            if (ann.formType === 'checkbox') {
              const cb = form.createCheckBox(`cb_${ann.id}`);
              cb.addToPage(copiedPage, { x: pdfX, y: pdfY, width: Math.max(16, pdfW), height: Math.max(16, pdfH) });
              if (ann.checked) cb.check();
            } else if (ann.formType === 'radio') {
              const radioGroup = form.createRadioGroup(`rg_${ann.groupName || 'default'}`);
              radioGroup.addOptionToPage(`opt_${ann.id}`, copiedPage, { x: pdfX, y: pdfY, width: Math.max(16, pdfW), height: Math.max(16, pdfH) });
              if (ann.checked) radioGroup.select(`opt_${ann.id}`);
            } else {
              const tf = form.createTextField(`tf_${ann.id}`);
              tf.addToPage(copiedPage, { x: pdfX, y: pdfY, width: pdfW, height: pdfH });
              if (ann.value) tf.setText(ann.value);
            }
          } catch (formErr) {
            console.error('Failed to create interactive AcroForm field:', formErr);
          }
        }
      }

      // Add Document-wide Watermark if configured
      if (state.watermark && state.watermark.text) {
        const wmColor = hexToRgb(state.watermark.color || '#94a3b8');
        copiedPage.drawText(state.watermark.text, {
          x: pWidth * 0.2,
          y: pHeight * 0.5,
          size: state.watermark.fontSize || 42,
          font: helveticaBold,
          color: rgb(wmColor.r / 255, wmColor.g / 255, wmColor.b / 255),
          opacity: state.watermark.opacity || 0.3,
          rotate: degrees(state.watermark.rotation || 45)
        });
      }

      // Add Header / Footer Page Numbers if configured
      if (state.pageNumbers) {
        const pnFormat = state.pageNumbers.format || 'Page {n} of {total}';
        const pnText = pnFormat.replace('{n}', (outIdx + 1).toString()).replace('{total}', totalPages.toString());
        const pnSize = 10;
        const pnWidth = helvetica.widthOfTextAtSize(pnText, pnSize);
        let pnX = (pWidth - pnWidth) / 2;
        let pnY = 25;

        if (state.pageNumbers.position === 'bottom-left') pnX = 36;
        else if (state.pageNumbers.position === 'bottom-right') pnX = pWidth - pnWidth - 36;
        else if (state.pageNumbers.position === 'top-center') pnY = pHeight - 35;
        else if (state.pageNumbers.position === 'top-left') { pnX = 36; pnY = pHeight - 35; }
        else if (state.pageNumbers.position === 'top-right') { pnX = pWidth - pnWidth - 36; pnY = pHeight - 35; }

        copiedPage.drawText(pnText, {
          x: pnX,
          y: pnY,
          size: pnSize,
          font: helvetica,
          color: rgb(0.35, 0.35, 0.35)
        });
      }

      // Add Legal Bates Numbering if configured
      if (state.batesNumbering) {
        const bn = state.batesNumbering;
        const start = Number(bn.startNumber) || 1;
        const currentNum = start + outIdx;
        const digits = Number(bn.digits) || 6;
        const padded = String(currentNum).padStart(digits, '0');
        const batesText = `${bn.prefix || ''}${padded}${bn.suffix || ''}`;
        const batesSize = Number(bn.fontSize) || 10;
        const batesWidth = helveticaBold.widthOfTextAtSize(batesText, batesSize);
        const { r, g, b } = hexToRgb(bn.color || '#1e293b');

        let bnX = pWidth - batesWidth - 36;
        let bnY = 24;

        if (bn.position === 'bottom-left') { bnX = 36; bnY = 24; }
        else if (bn.position === 'bottom-center') { bnX = (pWidth - batesWidth) / 2; bnY = 24; }
        else if (bn.position === 'bottom-right') { bnX = pWidth - batesWidth - 36; bnY = 24; }
        else if (bn.position === 'top-left') { bnX = 36; bnY = pHeight - 34; }
        else if (bn.position === 'top-center') { bnX = (pWidth - batesWidth) / 2; bnY = pHeight - 34; }
        else if (bn.position === 'top-right') { bnX = pWidth - batesWidth - 36; bnY = pHeight - 34; }

        copiedPage.drawText(batesText, {
          x: bnX,
          y: bnY,
          size: batesSize,
          font: helveticaBold,
          color: rgb(r / 255, g / 255, b / 255)
        });
      }
    }

    // Flatten interactive forms into read-only vector page content if configured
    if (state.flattenForms || state.flatten) {
      try {
        const form = finalDoc.getForm();
        form.flatten();
      } catch (flattenErr) {
        // Form may have no fields or is already flat
      }
    }

    // Apply standard PDF encryption if configured
    if (state.exportPassword && state.exportPassword.userPassword) {
      applyPdfEncryption(
        finalDoc,
        state.exportPassword.userPassword,
        state.exportPassword.ownerPassword,
        state.exportPassword.permissions
      );
    }

    return await finalDoc.save({ updateMetadata: false });
  }
}

export const pdfEngine = new PdfEngine();
