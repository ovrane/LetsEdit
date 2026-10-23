/**
 * Page Operations Sub-Module
 * Handles multi-document merge, range/page splitting, book-scan bisecting (split-in-half),
 * duplex alternate & mix, N-up imposition, page flipping/mirroring, and image compilation.
 */

import { PDFDocument, PDFName, degrees, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export class PageOperations {
  /**
   * Appends a blank page to the given rawBytes.
   */
  static async appendBlankPage(rawBytes, width = 595.28, height = 841.89) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const doc = await PDFDocument.load(rawBytes);
    doc.addPage([width, height]);
    return await doc.save();
  }

  /**
   * Merges an external PDF into rawBytes.
   */
  static async mergeExternalPdf(rawBytes, externalBytes) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const primaryDoc = await PDFDocument.load(rawBytes);
    const extDoc = await PDFDocument.load(externalBytes);
    const pages = await primaryDoc.copyPages(extDoc, extDoc.getPageIndices());
    pages.forEach(p => primaryDoc.addPage(p));
    return await primaryDoc.save();
  }

  /**
   * Merges multiple independent PDF buffers into one document.
   */
  static async mergePdf(fileList) {
    if (!Array.isArray(fileList) || fileList.length === 0) {
      throw new Error('No files provided to merge');
    }
    const finalDoc = await PDFDocument.create();
    for (const item of fileList) {
      const bytes = item.bytes || item;
      const u8 = new Uint8Array(bytes);
      // Check if PDF (starts with %PDF: 0x25, 0x50, 0x44, 0x46)
      const isPdf = u8.length >= 4 && u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46;
      if (isPdf) {
        const doc = await PDFDocument.load(bytes);
        const pages = await finalDoc.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => finalDoc.addPage(p));
      } else {
        // Embed image file (PNG or JPG/JPEG)
        const isJpg = (u8[0] === 0xFF && u8[1] === 0xD8) || (item.name && /\.(jpe?g)$/i.test(item.name));
        let embeddedImg;
        try {
          embeddedImg = isJpg ? await finalDoc.embedJpg(bytes) : await finalDoc.embedPng(bytes);
        } catch {
          // Fallback try opposite format if header mismatched
          embeddedImg = isJpg ? await finalDoc.embedPng(bytes) : await finalDoc.embedJpg(bytes);
        }
        const pageW = 595.28; // Standard A4 width
        const pageH = 841.89; // Standard A4 height
        const dims = embeddedImg.scale(1.0);
        const scale = Math.min((pageW - 40) / dims.width, (pageH - 40) / dims.height);
        const scaledW = dims.width * scale;
        const scaledH = dims.height * scale;
        const page = finalDoc.addPage([pageW, pageH]);
        page.drawImage(embeddedImg, {
          x: (pageW - scaledW) / 2,
          y: (pageH - scaledH) / 2,
          width: scaledW,
          height: scaledH
        });
      }
    }
    return await finalDoc.save();
  }

  /**
   * Splits or extracts pages from a PDF based on a range expression.
   * e.g. "1-2, 3" -> generates separate documents.
   */
  static async splitPdf(rawBytes, rangeExpression) {
    if (!rawBytes) throw new Error('No PDF loaded to split');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const totalPages = sourceDoc.getPageCount();

    if (!rangeExpression || rangeExpression.trim().toLowerCase() === 'all') {
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
   */
  static async splitInHalf(rawBytes, direction = 'vertical') {
    if (!rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const numPages = sourceDoc.getPageCount();

    for (let i = 0; i < numPages; i++) {
      const origPage = sourceDoc.getPage(i);
      const { width, height } = origPage.getSize();

      if (direction === 'horizontal') {
        const [topHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        topHalf.setCropBox(0, height / 2, width, height / 2);
        finalDoc.addPage(topHalf);

        const [bottomHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        bottomHalf.setCropBox(0, 0, width, height / 2);
        finalDoc.addPage(bottomHalf);
      } else {
        const [leftHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        leftHalf.setCropBox(0, 0, width / 2, height);
        finalDoc.addPage(leftHalf);

        const [rightHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        rightHalf.setCropBox(width / 2, 0, width / 2, height);
        finalDoc.addPage(rightHalf);
      }
    }

    return await finalDoc.save();
  }

  /**
   * Alternates and mixes two PDF documents (e.g. duplex scanner scans).
   */
  static async alternateMix(docABytes, docBBytes, options = {}) {
    const docA = await PDFDocument.load(docABytes);
    const docB = await PDFDocument.load(docBBytes);
    const finalDoc = await PDFDocument.create();

    const countA = docA.getPageCount();
    const countB = docB.getPageCount();
    const reverseB = options.reverseB !== false;

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
   */
  static async nUpPdf(rawBytes, nUpCount = 2) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const numPages = sourceDoc.getPageCount();

    if (nUpCount === 2) {
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
      const sheetW = 595.28;
      const sheetH = 841.89;
      const cellW = sheetW / 2;
      const cellH = sheetH / 2;

      for (let i = 0; i < numPages; i += 4) {
        const sheet = finalDoc.addPage([sheetW, sheetH]);
        const positions = [
          { x: 10, y: cellH + 10 },
          { x: cellW + 10, y: cellH + 10 },
          { x: 10, y: 10 },
          { x: cellW + 10, y: 10 }
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
   * Flips / mirrors PDF pages horizontally, vertically, or both.
   */
  static async flipPages(pdfBytes, options = {}) {
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
          newPage.drawPage(embedded, {
            x: width,
            y: 0,
            xScale: -1,
            yScale: 1
          });
        } else if (direction === 'vertical') {
          newPage.drawPage(embedded, {
            x: 0,
            y: height,
            xScale: 1,
            yScale: -1
          });
        } else {
          newPage.drawPage(embedded, {
            x: width,
            y: height,
            xScale: -1,
            yScale: -1
          });
        }
      }
    }

    return await finalDoc.save();
  }

  /**
   * Converts an array of images into a clean PDF with custom orientation and margins.
   */
  static async imagesToPdf(imagesList, options = {}) {
    const finalDoc = await PDFDocument.create();
    const orientation = options.orientation || 'portrait';
    const margin = typeof options.margin === 'number' ? options.margin : (parseInt(options.margin, 10) || 0);

    const baseW = 595.28;
    const baseH = 841.89;
    const pageW = orientation === 'landscape' ? baseH : baseW;
    const pageH = orientation === 'landscape' ? baseW : baseH;

    for (const item of imagesList) {
      let imgBytes = item.bytes;
      if (!imgBytes && item.dataUrl) {
        if (typeof fetch !== 'undefined') {
          imgBytes = await fetch(item.dataUrl).then(r => r.arrayBuffer());
        }
      }
      if (!imgBytes) continue;

      let embeddedImg;
      const u8 = new Uint8Array(imgBytes);
      const isPng = u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47;
      const isJpg = (u8[0] === 0xFF && u8[1] === 0xD8) || (!isPng && (item.isJpg || (item.name && (item.name.toLowerCase().endsWith('.jpg') || item.name.toLowerCase().endsWith('.jpeg')))));

      if (isJpg) {
        embeddedImg = await finalDoc.embedJpg(imgBytes);
      } else {
        embeddedImg = await finalDoc.embedPng(imgBytes);
      }

      const imgDims = embeddedImg.scale(1.0);
      const availW = Math.max(20, pageW - margin * 2);
      const availH = Math.max(20, pageH - margin * 2);
      const scale = Math.min(availW / imgDims.width, availH / imgDims.height);
      const scaledW = imgDims.width * scale;
      const scaledH = imgDims.height * scale;

      const page = finalDoc.addPage([pageW, pageH]);
      page.drawImage(embeddedImg, {
        x: margin + (availW - scaledW) / 2,
        y: margin + (availH - scaledH) / 2,
        width: scaledW,
        height: scaledH
      });
    }

    return await finalDoc.save();
  }

  /**
   * Straightens/deskews PDF pages by rotating them about their center point
   * by the specified angle in degrees (e.g. -2.5° or +1.5°).
   */
  static async deskewPdf(rawBytes, angleDegrees = 0) {
    if (!rawBytes) throw new Error('No PDF loaded to deskew');
    let angle = 0;
    if (typeof angleDegrees === 'number') {
      angle = angleDegrees;
    } else if (typeof angleDegrees === 'string') {
      angle = parseFloat(angleDegrees) || 0;
    } else if (angleDegrees && typeof angleDegrees.angle !== 'undefined') {
      angle = parseFloat(angleDegrees.angle) || 0;
    }

    const srcDoc = await PDFDocument.load(rawBytes);
    const totalPages = srcDoc.getPageCount();

    if (Math.abs(angle) < 0.0001) {
      return await srcDoc.save();
    }

    const finalDoc = await PDFDocument.create();

    for (let i = 0; i < totalPages; i++) {
      const srcPage = srcDoc.getPage(i);
      // Ensure Contents stream exists so embedPdf doesn't fail on blank/sparse pages
      if (!srcPage.node.get(PDFName.of('Contents'))) {
        srcPage.node.set(PDFName.of('Contents'), srcDoc.context.register(srcDoc.context.stream('')));
      }

      const [embedded] = await finalDoc.embedPdf(srcDoc, [i]);
      const width = srcPage.getWidth();
      const height = srcPage.getHeight();

      const newPage = finalDoc.addPage([width, height]);

      // Center-point rotation matrix
      const cx = width / 2;
      const cy = height / 2;
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = cx - (cx * cos - cy * sin);
      const y = cy - (cx * sin + cy * cos);

      newPage.drawPage(embedded, {
        x,
        y,
        rotate: degrees(angle)
      });
    }

    return await finalDoc.save();
  }

  /**
   * Fast client-side tilt detection using horizontal projection profile variance.
   * Analyzes text rows across candidate angles [-5.0°, +5.0°] in 0.25° increments.
   * Returns the angle with maximum contrast between text rows and whitespace.
   */
  static detectDeskewAngle(canvas) {
    if (!canvas || !canvas.width || !canvas.height) return 0;
    const w = canvas.width;
    const h = canvas.height;

    const targetW = 200;
    const scale = Math.min(1.0, targetW / w);
    const sw = Math.round(w * scale);
    const sh = Math.round(h * scale);
    if (sw <= 0 || sh <= 0) return 0;

    let sctx;
    if (typeof document !== 'undefined') {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = sw;
      sampleCanvas.height = sh;
      sctx = sampleCanvas.getContext('2d');
      sctx.drawImage(canvas, 0, 0, sw, sh);
    } else {
      return 0;
    }

    const imgData = sctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    // Convert to binary 1 (dark ink) / 0 (background)
    const binary = new Uint8Array(sw * sh);
    for (let i = 0; i < sw * sh; i++) {
      const idx = i * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      binary[i] = lum < 185 ? 1 : 0;
    }

    let bestAngle = 0;
    let maxVariance = -1;

    // Search between -5.0° and +5.0° in 0.25° increments
    for (let a = -5.0; a <= 5.001; a += 0.25) {
      const rad = (a * Math.PI) / 180;
      const tan = Math.tan(rad);
      const rowBins = new Float32Array(sh);

      for (let y = 0; y < sh; y++) {
        const rowOffset = y * sw;
        for (let x = 0; x < sw; x += 2) {
          if (binary[rowOffset + x]) {
            const projectedY = Math.round(y + (x - sw / 2) * tan);
            if (projectedY >= 0 && projectedY < sh) {
              rowBins[projectedY]++;
            }
          }
        }
      }

      // Compute variance
      let sum = 0;
      for (let y = 0; y < sh; y++) sum += rowBins[y];
      const mean = sum / sh;
      let variance = 0;
      for (let y = 0; y < sh; y++) {
        const d = rowBins[y] - mean;
        variance += d * d;
      }

      if (variance > maxVariance) {
        maxVariance = variance;
        bestAngle = a;
      }
    }

    // Returns angle needed to straighten (negative of detected tilt)
    return Math.round(-bestAngle * 10) / 10;
  }

  /**
   * Reorders, deletes, and rotates pages in a PDF document according to pageList.
   * pageList: Array of page descriptors:
   *   - number (0-indexed page index from original document)
   *   - object: { index: number, rotation?: number }
   */
  static async organizePages(rawBytes, pageList) {
    if (!rawBytes) throw new Error('No PDF loaded to organize');
    if (!Array.isArray(pageList) || pageList.length === 0) {
      throw new Error('No pages specified to organize');
    }

    const srcDoc = await PDFDocument.load(rawBytes);
    const totalPages = srcDoc.getPageCount();
    const finalDoc = await PDFDocument.create();

    const items = pageList.map(item => {
      if (typeof item === 'number') {
        return { index: item, rotation: 0 };
      }
      return {
        index: typeof item.index === 'number' ? item.index : 0,
        rotation: parseInt(item.rotation, 10) || 0
      };
    }).filter(item => item.index >= 0 && item.index < totalPages);

    if (items.length === 0) {
      throw new Error('All pages in organize list were out of bounds');
    }

    const indicesToCopy = items.map(it => it.index);
    const copiedPages = await finalDoc.copyPages(srcDoc, indicesToCopy);

    for (let i = 0; i < copiedPages.length; i++) {
      const page = copiedPages[i];
      const rot = items[i].rotation;
      if (rot !== 0) {
        const curRot = page.getRotation().angle;
        page.setRotation(degrees((curRot + rot) % 360));
      }
      finalDoc.addPage(page);
    }

    return await finalDoc.save();
  }

  /**
   * Applies custom crop box margins (top, right, bottom, left) to pages.
   */
  static async cropPdf(rawBytes, options = {}) {
    if (!rawBytes) throw new Error('No PDF loaded to crop');
    const doc = await PDFDocument.load(rawBytes);
    const pages = doc.getPages();
    const top = Math.max(0, Number(options.top) || 0);
    const right = Math.max(0, Number(options.right) || 0);
    const bottom = Math.max(0, Number(options.bottom) || 0);
    const left = Math.max(0, Number(options.left) || 0);
    const targetPage = typeof options.pageScope === 'number' ? options.pageScope : null;

    for (let i = 0; i < pages.length; i++) {
      if (targetPage !== null && i !== targetPage) continue;
      const page = pages[i];
      const { width, height } = page.getSize();
      const cropW = Math.max(20, width - left - right);
      const cropH = Math.max(20, height - top - bottom);
      page.setCropBox(left, bottom, cropW, cropH);
    }
    return await doc.save();
  }

  /**
   * Automatically detects outer blank/whitespace margins of a page canvas.
   * Returns suggested crop margins { top, right, bottom, left } in points.
   */
  static detectWhitespaceCrop(canvas, scale = 1.0) {
    if (!canvas || !canvas.width || !canvas.height) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, maxX = 0, minY = h, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        if (a > 20 && (r < 240 || g < 240 || b < 240)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const topPx = minY;
    const bottomPx = h - maxY;
    const leftPx = minX;
    const rightPx = w - maxX;

    const ptFactor = scale > 0 ? (1 / scale) : 1;
    return {
      top: Math.max(0, Math.round((topPx * ptFactor) - 10)),
      right: Math.max(0, Math.round((rightPx * ptFactor) - 10)),
      bottom: Math.max(0, Math.round((bottomPx * ptFactor) - 10)),
      left: Math.max(0, Math.round((leftPx * ptFactor) - 10))
    };
  }

  /**
   * Stamps legal Bates numbering sequentially across all document pages.
   */
  static async batesNumberPdf(rawBytes, options = {}) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const helveticaBold = await finalDoc.embedFont(StandardFonts.HelveticaBold);
    const numPages = sourceDoc.getPageCount();

    const prefix = options.prefix || 'CASE-';
    const suffix = options.suffix || '';
    const startNumber = parseInt(options.startNumber, 10) || 1;
    const digits = parseInt(options.digits, 10) || 6;
    const position = options.position || 'bottom-right';
    const fontSize = parseInt(options.fontSize, 10) || 10;
    const colorHex = options.color || '#1e293b';

    const hexToRgb = (hex) => {
      const clean = hex.replace('#', '');
      const num = parseInt(clean, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };
    const { r, g, b } = hexToRgb(colorHex);
    const textColor = rgb(r / 255, g / 255, b / 255);

    for (let i = 0; i < numPages; i++) {
      const [page] = await finalDoc.copyPages(sourceDoc, [i]);
      const { width: pWidth, height: pHeight } = page.getSize();
      const currentNum = startNumber + i;
      const padded = String(currentNum).padStart(digits, '0');
      const batesText = `${prefix}${padded}${suffix}`;
      const textWidth = helveticaBold.widthOfTextAtSize(batesText, fontSize);

      let bnX = pWidth - textWidth - 36;
      let bnY = 24;

      if (position === 'bottom-left') { bnX = 36; bnY = 24; }
      else if (position === 'bottom-center') { bnX = (pWidth - textWidth) / 2; bnY = 24; }
      else if (position === 'bottom-right') { bnX = pWidth - textWidth - 36; bnY = 24; }
      else if (position === 'top-left') { bnX = 36; bnY = pHeight - 34; }
      else if (position === 'top-center') { bnX = (pWidth - textWidth) / 2; bnY = pHeight - 34; }
      else if (position === 'top-right') { bnX = pWidth - textWidth - 36; bnY = pHeight - 34; }

      page.drawText(batesText, {
        x: bnX,
        y: bnY,
        size: fontSize,
        font: helveticaBold,
        color: textColor
      });

      finalDoc.addPage(page);
    }

    return await finalDoc.save();
  }

  /**
   * Converts HTML string / text into a vector PDF document.
   */
  static async htmlToPdf(htmlString, options = {}) {
    const title = options.title || 'HTML Document';
    const lines = htmlString.replace(/<[^>]+>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 800;

    page.drawText(title, { x: 50, y, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 30;

    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }
      const words = line.split(' ');
      let curLine = '';
      for (const w of words) {
        const testLine = curLine ? `${curLine} ${w}` : w;
        if (font.widthOfTextAtSize(testLine, 10.5) > 495) {
          page.drawText(curLine, { x: 50, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
          y -= 15;
          if (y < 60) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 800;
          }
          curLine = w;
        } else {
          curLine = testLine;
        }
      }
      if (curLine) {
        page.drawText(curLine, { x: 50, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 18;
      }
    }

    return await pdfDoc.save();
  }

  /**
   * Converts Word DOCX byte stream or plain text into a vector PDF document.
   */
  static async wordToPdf(docxBytes, options = {}) {
    let paragraphs = [];
    try {
      const zip = await JSZip.loadAsync(docxBytes);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
        if (parser) {
          const xmlDoc = parser.parseFromString(docXml, 'text/xml');
          paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p')).map(p => {
            return Array.from(p.getElementsByTagName('w:t')).map(t => t.textContent).join('');
          }).filter(Boolean);
        } else {
          // Node.js regex fallback for testing environment
          const matches = docXml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
          paragraphs = matches.map(m => m.replace(/<[^>]+>/g, '')).filter(Boolean);
        }
      }
    } catch (e) {
      // Fallback
    }

    if (paragraphs.length === 0) {
      const textDecoder = new TextDecoder('utf-8');
      paragraphs = textDecoder.decode(docxBytes).replace(/[^\x20-\x7E\n]/g, ' ').split('\n').map(l => l.trim()).filter(l => l.length > 2);
    }

    const title = options.title || 'Word Document';
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 800;

    page.drawText(title, { x: 50, y, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 30;

    for (const para of paragraphs) {
      if (y < 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }
      const words = para.split(' ');
      let curLine = '';
      for (const w of words) {
        const testLine = curLine ? `${curLine} ${w}` : w;
        if (font.widthOfTextAtSize(testLine, 11) > 495) {
          page.drawText(curLine, { x: 50, y, size: 11, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 16;
          if (y < 60) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 800;
          }
          curLine = w;
        } else {
          curLine = testLine;
        }
      }
      if (curLine) {
        page.drawText(curLine, { x: 50, y, size: 11, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 20;
      }
    }

    return await pdfDoc.save();
  }

  /**
   * Converts Excel spreadsheets (.xlsx, .xls, .csv) into a styled vector PDF table document.
   */
  static async excelToPdf(fileBytes, options = {}) {
    let rows = [];
    const isCsv = options.isCsv || false;

    // 1. Try parsing as OpenXML XLSX package
    if (!isCsv) {
      try {
        const zip = await JSZip.loadAsync(fileBytes);
        // Shared strings table
        const sharedStrings = [];
        const ssXml = await zip.file('xl/sharedStrings.xml')?.async('text');
        if (ssXml) {
          const ssMatches = ssXml.match(/<t[^>]*>([^<]+)<\/t>/g) || [];
          for (const m of ssMatches) {
            sharedStrings.push(m.replace(/<[^>]+>/g, ''));
          }
        }

        // Sheet 1 worksheet
        const sheetXml = await zip.file('xl/worksheets/sheet1.xml')?.async('text');
        if (sheetXml) {
          const rowMatches = sheetXml.match(/<row[^>]*>[\s\S]*?<\/row>/g) || [];
          for (const rMatch of rowMatches) {
            const cells = [];
            const cellMatches = rMatch.match(/<c[^>]*>[\s\S]*?<\/c>/g) || [];
            for (const cMatch of cellMatches) {
              const isShared = cMatch.includes('t="s"');
              const valMatch = cMatch.match(/<v>([^<]+)<\/v>/);
              if (valMatch) {
                const val = valMatch[1];
                if (isShared && sharedStrings[parseInt(val, 10)] !== undefined) {
                  cells.push(sharedStrings[parseInt(val, 10)]);
                } else {
                  cells.push(val);
                }
              } else {
                const tMatch = cMatch.match(/<t[^>]*>([^<]+)<\/t>/);
                cells.push(tMatch ? tMatch[1] : '');
              }
            }
            if (cells.some(c => c && c.trim())) {
              rows.push(cells);
            }
          }
        }
      } catch (e) {
        // Fall through to CSV parsing
      }
    }

    // 2. CSV / Plain Text Fallback
    if (rows.length === 0) {
      const textDecoder = new TextDecoder('utf-8');
      const text = typeof fileBytes === 'string' ? fileBytes : textDecoder.decode(fileBytes);
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        // Split by tab or comma (handling quoted values simply)
        const delimiter = line.includes('\t') ? '\t' : ',';
        const cols = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cols.some(c => c)) {
          rows.push(cols);
        }
      }
    }

    if (rows.length === 0) {
      rows = [['No data available']];
    }

    // Determine max columns
    const maxCols = Math.max(...rows.map(r => r.length), 1);
    // Pad rows so each has maxCols
    rows = rows.map(r => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    const isLandscape = options.orientation === 'landscape' || maxCols > 4;
    const pageWidth = isLandscape ? 841.89 : 595.28;
    const pageHeight = isLandscape ? 595.28 : 841.89;
    const margin = 40;
    const tableWidth = pageWidth - (margin * 2);

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Compute column widths proportionally
    const colWidth = tableWidth / maxCols;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin - 20;

    // Document Title
    const title = options.title || 'Spreadsheet Report';
    page.drawText(title, {
      x: margin,
      y,
      size: 16,
      font: helveticaBold,
      color: rgb(0.12, 0.16, 0.22)
    });
    y -= 30;

    const rowHeight = 22;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      if (y < margin + 25) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin - 20;
      }

      const row = rows[rIdx];
      const isHeader = rIdx === 0;

      // Row background
      if (isHeader) {
        page.drawRectangle({
          x: margin,
          y: y - 5,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.15, 0.39, 0.92) // Primary Blue
        });
      } else if (rIdx % 2 === 1) {
        page.drawRectangle({
          x: margin,
          y: y - 5,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.96, 0.97, 0.98) // Light zebra
        });
      }

      // Draw cell text
      for (let cIdx = 0; cIdx < maxCols; cIdx++) {
        const cellText = String(row[cIdx] || '');
        const font = isHeader ? helveticaBold : helvetica;
        const fontColor = isHeader ? rgb(1, 1, 1) : rgb(0.15, 0.15, 0.15);
        const fontSize = isHeader ? 10 : 9;

        // Truncate text if it overflows cell width
        let displayStr = cellText;
        while (displayStr.length > 0 && font.widthOfTextAtSize(displayStr, fontSize) > colWidth - 10) {
          displayStr = displayStr.slice(0, -1);
        }
        if (displayStr.length < cellText.length && displayStr.length > 3) {
          displayStr = displayStr.slice(0, -2) + '…';
        }

        const cellX = margin + (cIdx * colWidth) + 5;
        const cellY = y + 2;

        page.drawText(displayStr, {
          x: cellX,
          y: cellY,
          size: fontSize,
          font,
          color: fontColor
        });

        // Vertical cell divider
        if (cIdx > 0) {
          page.drawLine({
            start: { x: margin + (cIdx * colWidth), y: y - 5 },
            end: { x: margin + (cIdx * colWidth), y: y - 5 + rowHeight },
            thickness: 0.5,
            color: isHeader ? rgb(0.3, 0.5, 0.95) : rgb(0.85, 0.88, 0.92)
          });
        }
      }

      // Horizontal row line
      page.drawLine({
        start: { x: margin, y: y - 5 },
        end: { x: margin + tableWidth, y: y - 5 },
        thickness: 0.5,
        color: rgb(0.82, 0.85, 0.9)
      });

      y -= rowHeight;
    }

    return await pdfDoc.save();
  }

  /**
   * Converts PowerPoint presentation (.pptx) packages into formatted presentation PDF slides.
   */
  static async pptToPdf(pptxBytes, options = {}) {
    let slides = [];

    // 1. Try unpacking OpenXML PPTX slides via JSZip
    try {
      const zip = await JSZip.loadAsync(pptxBytes);
      const slideFiles = [];

      zip.forEach((relativePath) => {
        if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
          slideFiles.push(relativePath);
        }
      });

      // Sort slide files numerically (slide1, slide2, ..., slide10)
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
        return numA - numB;
      });

      for (const slidePath of slideFiles) {
        const xml = await zip.file(slidePath)?.async('text');
        if (!xml) continue;

        // Extract shape text blocks
        const textBlocks = [];
        const shapeMatches = xml.match(/<p:sp>[\s\S]*?<\/p:sp>/g) || [];
        for (const sp of shapeMatches) {
          const tMatches = sp.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
          const text = tMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
          if (text) {
            textBlocks.push(text);
          }
        }

        if (textBlocks.length > 0) {
          const title = textBlocks[0];
          const content = textBlocks.slice(1);
          slides.push({ title, content });
        }
      }
    } catch (e) {
      // Fallback
    }

    // 2. Text fallback if PPTX extraction yielded nothing
    if (slides.length === 0) {
      const textDecoder = new TextDecoder('utf-8');
      const text = typeof pptxBytes === 'string' ? pptxBytes : textDecoder.decode(pptxBytes);
      const clean = text.replace(/[^\x20-\x7E\n]/g, ' ').trim();
      const chunks = clean.split(/(?:---|===|Slide \d+)/i).map(c => c.trim()).filter(c => c.length > 5);

      if (chunks.length > 0) {
        for (let i = 0; i < chunks.length; i++) {
          const lines = chunks[i].split('\n').map(l => l.trim()).filter(Boolean);
          slides.push({
            title: lines[0] || `Slide ${i + 1}`,
            content: lines.slice(1)
          });
        }
      } else {
        slides.push({
          title: options.title || 'Presentation Slide Deck',
          content: ['Slide content converted from presentation format client-side.']
        });
      }
    }

    // Slide Dimensions: Standard 16:9 Landscape (841.89 × 595.28 pt)
    const slideWidth = 841.89;
    const slideHeight = 595.28;
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const docTitle = options.title || 'Executive Presentation';

    for (let sIdx = 0; sIdx < slides.length; sIdx++) {
      const slide = slides[sIdx];
      const page = pdfDoc.addPage([slideWidth, slideHeight]);

      // Header Banner (Top Gradient Card)
      page.drawRectangle({
        x: 0,
        y: slideHeight - 110,
        width: slideWidth,
        height: 110,
        color: rgb(0.08, 0.12, 0.22) // Modern dark navy banner
      });

      // Accent Stripe
      page.drawRectangle({
        x: 0,
        y: slideHeight - 114,
        width: slideWidth,
        height: 4,
        color: rgb(0.14, 0.45, 0.95) // Vibrant blue accent line
      });

      // Slide Title
      page.drawText(slide.title, {
        x: 50,
        y: slideHeight - 65,
        size: 24,
        font: helveticaBold,
        color: rgb(1, 1, 1)
      });

      // Slide Content Bullet Points
      let contentY = slideHeight - 160;
      for (const item of slide.content) {
        if (contentY < 70) break;

        // Bullet Dot
        page.drawCircle({
          x: 60,
          y: contentY + 4,
          size: 4,
          color: rgb(0.14, 0.45, 0.95)
        });

        // Wrapped bullet text
        const words = item.split(' ');
        let curLine = '';
        for (const w of words) {
          const testLine = curLine ? `${curLine} ${w}` : w;
          if (helvetica.widthOfTextAtSize(testLine, 13) > 710) {
            page.drawText(curLine, { x: 75, y: contentY, size: 13, font: helvetica, color: rgb(0.2, 0.25, 0.3) });
            contentY -= 20;
            if (contentY < 70) break;
            curLine = w;
          } else {
            curLine = testLine;
          }
        }
        if (curLine && contentY >= 70) {
          page.drawText(curLine, { x: 75, y: contentY, size: 13, font: helvetica, color: rgb(0.2, 0.25, 0.3) });
          contentY -= 28;
        }
      }

      // Footer Bar
      page.drawLine({
        start: { x: 50, y: 40 },
        end: { x: slideWidth - 50, y: 40 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92)
      });

      page.drawText(docTitle, {
        x: 50,
        y: 24,
        size: 9,
        font: helvetica,
        color: rgb(0.45, 0.5, 0.55)
      });

      const slideNumText = `Slide ${sIdx + 1} of ${slides.length}`;
      const numWidth = helvetica.widthOfTextAtSize(slideNumText, 9);
      page.drawText(slideNumText, {
        x: slideWidth - 50 - numWidth,
        y: 24,
        size: 9,
        font: helvetica,
        color: rgb(0.45, 0.5, 0.55)
      });
    }

    return await pdfDoc.save();
  }


  /**
   * Adds custom formatted page numbers across PDF pages.
   */
  static async addPageNumbers(rawBytes, options = {}) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const helvetica = await finalDoc.embedFont(StandardFonts.Helvetica);
    const numPages = sourceDoc.getPageCount();

    const format = options.format || 'Page {n} of {total}';
    const position = options.position || 'bottom-center';
    const startNumber = parseInt(options.startNumber, 10) || 1;
    const startPage = Math.max(1, parseInt(options.startPage, 10) || 1);
    const fontSize = parseInt(options.fontSize, 10) || 10;
    const colorHex = options.color || '#475569';

    const hexToRgb = (hex) => {
      const clean = hex.replace('#', '');
      const num = parseInt(clean, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };
    const { r, g, b } = hexToRgb(colorHex);
    const textColor = rgb(r / 255, g / 255, b / 255);

    for (let i = 0; i < numPages; i++) {
      const [page] = await finalDoc.copyPages(sourceDoc, [i]);
      if (i + 1 >= startPage) {
        const { width: pWidth, height: pHeight } = page.getSize();
        const currentNum = startNumber + (i - (startPage - 1));
        const text = format
          .replace('{n}', currentNum.toString())
          .replace('{total}', numPages.toString());
        const textWidth = helvetica.widthOfTextAtSize(text, fontSize);

        let pnX = (pWidth - textWidth) / 2;
        let pnY = 24;

        if (position === 'bottom-left') { pnX = 36; pnY = 24; }
        else if (position === 'bottom-center') { pnX = (pWidth - textWidth) / 2; pnY = 24; }
        else if (position === 'bottom-right') { pnX = pWidth - textWidth - 36; pnY = 24; }
        else if (position === 'top-left') { pnX = 36; pnY = pHeight - 34; }
        else if (position === 'top-center') { pnX = (pWidth - textWidth) / 2; pnY = pHeight - 34; }
        else if (position === 'top-right') { pnX = pWidth - textWidth - 36; pnY = pHeight - 34; }

        page.drawText(text, {
          x: pnX,
          y: pnY,
          size: fontSize,
          font: helvetica,
          color: textColor
        });
      }
      finalDoc.addPage(page);
    }

    return await finalDoc.save();
  }

  /**
   * Applies an electronic signature image and optional date stamp to PDF page(s).
   */
  static async signPdf(rawBytes, options = {}) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const helvetica = await finalDoc.embedFont(StandardFonts.Helvetica);
    const numPages = sourceDoc.getPageCount();

    const imageBytes = options.imageBytes;
    const isPng = options.isPng !== false;
    const position = options.position || 'bottom-right';
    const dateText = options.dateText || '';
    const targetPage = options.targetPage !== undefined ? parseInt(options.targetPage, 10) : numPages - 1;
    const signWidth = Math.min(220, Math.max(80, parseInt(options.width, 10) || 160));
    const signHeight = Math.min(100, Math.max(30, parseInt(options.height, 10) || 60));

    let embeddedSig = null;
    if (imageBytes) {
      try {
        embeddedSig = isPng ? await finalDoc.embedPng(imageBytes) : await finalDoc.embedJpg(imageBytes);
      } catch (e) {
        embeddedSig = isPng ? await finalDoc.embedJpg(imageBytes) : await finalDoc.embedPng(imageBytes);
      }
    }

    for (let i = 0; i < numPages; i++) {
      const [page] = await finalDoc.copyPages(sourceDoc, [i]);
      const shouldSign = options.applyToAll ? true : (i === targetPage);

      if (shouldSign && embeddedSig) {
        const { width: pWidth, height: pHeight } = page.getSize();
        let sigX = pWidth - signWidth - 40;
        let sigY = 50;

        if (position === 'bottom-left') { sigX = 40; sigY = 50; }
        else if (position === 'bottom-center') { sigX = (pWidth - signWidth) / 2; sigY = 50; }
        else if (position === 'bottom-right') { sigX = pWidth - signWidth - 40; sigY = 50; }
        else if (position === 'top-left') { sigX = 40; sigY = pHeight - signHeight - 50; }
        else if (position === 'top-center') { sigX = (pWidth - signWidth) / 2; sigY = pHeight - signHeight - 50; }
        else if (position === 'top-right') { sigX = pWidth - signWidth - 40; sigY = pHeight - signHeight - 50; }

        page.drawImage(embeddedSig, {
          x: sigX,
          y: sigY,
          width: signWidth,
          height: signHeight
        });

        if (dateText) {
          const dtText = `Signed: ${dateText}`;
          const dtWidth = helvetica.widthOfTextAtSize(dtText, 9);
          page.drawText(dtText, {
            x: sigX + (signWidth - dtWidth) / 2,
            y: Math.max(10, sigY - 14),
            size: 9,
            font: helvetica,
            color: rgb(0.35, 0.35, 0.35)
          });
        }
      }

      finalDoc.addPage(page);
    }

    return await finalDoc.save();
  }
}


