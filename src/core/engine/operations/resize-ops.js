/**
 * Adobe Acrobat Pro & Sejda Page Geometry Resizing & Margins Engine
 * Handles standard paper size fitting (A4, A3, A5, Letter, Legal, Tabloid),
 * custom margins, spiral/binder gutter offset with duplex mirroring,
 * anchoring, and MediaBox/CropBox coordinate transformation.
 */

import { PDFDocument, PDFName, rgb } from 'pdf-lib';

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return rgb(r, g, b);
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  }
  return null;
}

export class ResizeOps {
  static STANDARD_SIZES = {
    a4: [595.28, 841.89],
    a3: [841.89, 1190.55],
    a5: [419.53, 595.28],
    letter: [612.0, 792.0],
    legal: [612.0, 1008.0],
    tabloid: [792.0, 1224.0]
  };

  /**
   * Filter page indices by range rule (all, odd, even, or range string '1-5')
   */
  static getIncludedPageIndices(totalCount, rangeRule = 'all') {
    const rule = String(rangeRule || 'all').trim().toLowerCase();
    const indices = [];

    if (rule === 'all') {
      for (let i = 0; i < totalCount; i++) indices.push(i);
      return indices;
    }
    if (rule === 'odd') {
      for (let i = 0; i < totalCount; i += 2) indices.push(i);
      return indices;
    }
    if (rule === 'even') {
      for (let i = 1; i < totalCount; i += 2) indices.push(i);
      return indices;
    }

    const set = new Set();
    const parts = rule.split(/[,;\s]+/).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const s = parseInt(startStr, 10);
        const e = parseInt(endStr, 10);
        if (!isNaN(s) && !isNaN(e)) {
          const from = Math.max(1, Math.min(s, e));
          const to = Math.min(totalCount, Math.max(s, e));
          for (let p = from; p <= to; p++) set.add(p - 1);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= totalCount) {
          set.add(num - 1);
        }
      }
    }

    if (set.size > 0) {
      return Array.from(set).sort((a, b) => a - b);
    }
    for (let i = 0; i < totalCount; i++) indices.push(i);
    return indices;
  }

  /**
   * Resolves target sheet dimensions based on preset, orientation, and source dimensions
   */
  static resolveTargetDimensions(pageSize, orientation, origW, origH) {
    const key = String(pageSize || 'original').toLowerCase().trim();
    if (key === 'original') {
      let w = origW;
      let h = origH;
      if (orientation === 'portrait' && w > h) [w, h] = [h, w];
      if (orientation === 'landscape' && w < h) [w, h] = [h, w];
      return [w, h];
    }

    if (Array.isArray(pageSize) && pageSize.length === 2) {
      let [w, h] = pageSize.map(Number);
      if (orientation === 'portrait' && w > h) [w, h] = [h, w];
      if (orientation === 'landscape' && w < h) [w, h] = [h, w];
      return [w, h];
    }

    const standard = this.STANDARD_SIZES[key] || this.STANDARD_SIZES.a4;
    let [targetW, targetH] = standard;

    if (orientation === 'landscape') {
      if (targetW < targetH) [targetW, targetH] = [targetH, targetW];
    } else if (orientation === 'portrait') {
      if (targetW > targetH) [targetW, targetH] = [targetH, targetW];
    } else {
      // Auto: match source aspect ratio
      const sourceIsLandscape = origW > origH;
      const targetIsLandscape = targetW > targetH;
      if (sourceIsLandscape !== targetIsLandscape) {
        [targetW, targetH] = [targetH, targetW];
      }
    }

    return [targetW, targetH];
  }

  /**
   * Core Resize & Margin Imposition Method
   */
  static async resizePdf(rawBytes, config = {}, options = {}) {
    if (!rawBytes) throw new Error('No PDF bytes loaded for resize operation');

    const srcDoc = await PDFDocument.load(rawBytes);
    const numPages = srcDoc.getPageCount();
    if (numPages === 0) throw new Error('PDF document contains no pages');

    const pageSize = config.pageSize || config.standardSize || 'original';
    const orientation = (config.orientation || 'auto').toLowerCase();
    const scaleMode = config.scaleMode || 'fit'; // 'fit' or 'none'

    const marginTop = Number(config.marginTop ?? config.topMargin ?? config.margin ?? 0);
    const marginBottom = Number(config.marginBottom ?? config.bottomMargin ?? config.margin ?? 0);
    const marginLeft = Number(config.marginLeft ?? config.leftMargin ?? config.margin ?? 0);
    const marginRight = Number(config.marginRight ?? config.rightMargin ?? config.margin ?? 0);

    const bindingGutter = Number(config.bindingGutter ?? config.gutter ?? 0);
    const mirrorMargins = Boolean(config.mirrorMargins ?? config.duplex ?? false);

    const bgColor = hexToRgb(config.backgroundColor || '#ffffff') || rgb(1, 1, 1);
    const rangeRule = config.rangeRule || config.pageRange || 'all';

    const includedIndices = new Set(this.getIncludedPageIndices(numPages, rangeRule));
    const newDoc = await PDFDocument.create();

    let appliedCount = 0;
    const pageReports = [];

    for (let i = 0; i < numPages; i++) {
      const srcPage = srcDoc.getPage(i);
      const { width: origW, height: origH } = srcPage.getSize();

      // Ensure contents stream exists for embedding
      if (!srcPage.node.get(PDFName.of('Contents'))) {
        srcPage.node.set(
          PDFName.of('Contents'),
          srcDoc.context.register(srcDoc.context.stream(''))
        );
      }

      if (!includedIndices.has(i)) {
        // Copy untouched
        const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copiedPage);
        continue;
      }

      appliedCount++;

      // Compute binding gutter offset:
      // In duplex/mirror margins: Odd pages (0, 2, 4...) have gutter added to Left,
      // Even pages (1, 3, 5...) have gutter added to Right.
      let effectiveLeft = marginLeft;
      let effectiveRight = marginRight;
      if (bindingGutter > 0) {
        if (mirrorMargins) {
          const isOddPage = i % 2 === 0; // 0-indexed: Page 1 is odd (index 0)
          if (isOddPage) {
            effectiveLeft += bindingGutter;
          } else {
            effectiveRight += bindingGutter;
          }
        } else {
          effectiveLeft += bindingGutter;
        }
      }

      let newWidth, newHeight, drawX, drawY, drawW, drawH, scale = 1.0;

      if (pageSize !== 'original') {
        [newWidth, newHeight] = this.resolveTargetDimensions(pageSize, orientation, origW, origH);
        const availW = Math.max(10, newWidth - (effectiveLeft + effectiveRight));
        const availH = Math.max(10, newHeight - (marginTop + marginBottom));

        if (scaleMode === 'fit') {
          scale = Math.min(availW / origW, availH / origH, 1.0);
        } else {
          scale = 1.0;
        }

        drawW = origW * scale;
        drawH = origH * scale;

        // Centering inside printable bounds
        drawX = effectiveLeft + (availW - drawW) / 2;
        drawY = marginBottom + (availH - drawH) / 2;
      } else {
        // Margin Expansion mode on original page dimensions
        newWidth = origW + effectiveLeft + effectiveRight;
        newHeight = origH + marginTop + marginBottom;
        drawW = origW;
        drawH = origH;
        drawX = effectiveLeft;
        drawY = marginBottom;
      }

      const embedded = await newDoc.embedPage(srcPage);
      const newPage = newDoc.addPage([newWidth, newHeight]);

      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: newWidth,
        height: newHeight,
        color: bgColor
      });

      newPage.drawPage(embedded, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });

      pageReports.push({
        pageIndex: i + 1,
        origWidth: origW,
        origHeight: origH,
        newWidth,
        newHeight,
        scale,
        drawX,
        drawY,
        leftMargin: effectiveLeft,
        rightMargin: effectiveRight,
        topMargin: marginTop,
        bottomMargin: marginBottom
      });
    }

    const outputBytes = await newDoc.save({ updateMetadata: false });

    const report = {
      pageSize: String(pageSize),
      orientation,
      appliedCount,
      totalPages: numPages,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      bindingGutter,
      mirrorMargins,
      scaleMode,
      pages: pageReports,
      timestamp: new Date().toISOString()
    };

    // Attach metadata properties directly to Uint8Array instance
    outputBytes.bytes = outputBytes;
    outputBytes.appliedCount = appliedCount;
    outputBytes.totalPages = numPages;
    outputBytes.targetPageSize = String(pageSize);
    outputBytes.report = report;

    return outputBytes;
  }

  /**
   * Generates a 4-page sample document for testing margin & resize transformations
   */
  static async createSampleResizePdf() {
    const doc = await PDFDocument.create();

    const pagesMeta = [
      { title: 'Executive Document Cover', color: rgb(0.12, 0.23, 0.38), badge: 'COVER PAGE' },
      { title: 'Chapter 1: Standard Margins & Bounds', color: rgb(0.18, 0.31, 0.49), badge: 'ODD PAGE 1' },
      { title: 'Chapter 2: Duplex Binder Offset Testing', color: rgb(0.09, 0.44, 0.42), badge: 'EVEN PAGE 2' },
      { title: 'Appendix: Full Bleed Vector Layout', color: rgb(0.48, 0.18, 0.22), badge: 'ODD PAGE 3' }
    ];

    for (let i = 0; i < pagesMeta.length; i++) {
      const m = pagesMeta[i];
      const page = doc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();

      // Top banner
      page.drawRectangle({
        x: 36,
        y: height - 110,
        width: width - 72,
        height: 60,
        color: m.color
      });

      // Banner text box indicator
      page.drawRectangle({
        x: 48,
        y: height - 100,
        width: 12,
        height: 40,
        color: rgb(1, 1, 1)
      });

      // Central article box
      page.drawRectangle({
        x: 36,
        y: 60,
        width: width - 72,
        height: height - 190,
        borderColor: rgb(0.82, 0.86, 0.91),
        borderWidth: 1.5,
        color: rgb(0.98, 0.99, 1.0)
      });

      // Simulated text lines
      for (let r = 0; r < 6; r++) {
        page.drawRectangle({
          x: 56,
          y: height - 170 - r * 50,
          width: width - 112,
          height: 28,
          color: rgb(0.92, 0.94, 0.98)
        });
      }

      // Page footer boundary line
      page.drawRectangle({
        x: 36,
        y: 45,
        width: width - 72,
        height: 2,
        color: rgb(0.75, 0.8, 0.88)
      });
    }

    return await doc.save();
  }
}
