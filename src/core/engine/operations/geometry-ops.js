/**
 * Geometry & Page Layout Operations
 * Handles N-up sheet imposition, page flipping / mirroring, deskew / tilt detection,
 * and crop box margins / whitespace margin auto-detection.
 */

import { PDFDocument, PDFName, degrees } from 'pdf-lib';

export class GeometryOps {
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
}
