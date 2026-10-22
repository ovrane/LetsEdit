/**
 * Page Operations Sub-Module
 * Handles multi-document merge, range/page splitting, book-scan bisecting (split-in-half),
 * duplex alternate & mix, N-up imposition, page flipping/mirroring, and image compilation.
 */

import { PDFDocument, PDFName, degrees } from 'pdf-lib';

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
        srcPage.node.set(PDFName.of('Contents'), srcDoc.context.register(sourceDoc.context.stream('')));
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
}
