/**
 * Adobe Acrobat Pro & iLovePDF Dynamic Watermark & Stamp Engine
 * Supports:
 * - Dual Mode: Vector Text & Raster/Vector Image stamping (PNG/JPG with alpha)
 * - Layer Placement: Over page content (foreground) vs Under page content (background)
 * - Rotation: -180° to +180° (presets: 45° diagonal, 0° horizontal, 90° vertical, -45°)
 * - Layout Modes: Single 9-point anchor alignment or Mosaic / Tile repeat grid
 * - Dynamic Variable Macro Interpolation (<<Page>>, <<TotalPages>>, <<Date>>, <<FileName>>)
 * - Page Range Filtering: All, Odd, Even, and custom ranges
 */

import { PDFDocument, PDFName, StandardFonts, rgb, degrees } from 'pdf-lib';

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

export class WatermarkOps {
  /**
   * Replaces dynamic macros in watermark text
   */
  static interpolateMacros(template = '', context = {}) {
    if (!template || typeof template !== 'string') return '';
    const now = new Date();
    const dateStr = context.date || now.toISOString().split('T')[0];
    const timeStr = context.time || now.toTimeString().split(' ')[0].substring(0, 5);

    return template
      .replace(/<<Page>>/gi, String(context.pageNumber ?? 1))
      .replace(/<<TotalPages>>/gi, String(context.totalPages ?? 1))
      .replace(/<<Date>>/gi, dateStr)
      .replace(/<<Time>>/gi, timeStr)
      .replace(/<<FileName>>/gi, context.fileName || 'document.pdf')
      .replace(/<<Title>>/gi, context.title || 'Document')
      .replace(/<<Author>>/gi, context.author || 'Author');
  }

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
   * Resolves alignment coordinates on a page given anchor and item dimensions
   */
  static calculateAnchorPosition(anchor, pageWidth, pageHeight, itemWidth, itemHeight, offsetX = 0, offsetY = 0) {
    let x = (pageWidth - itemWidth) / 2;
    let y = (pageHeight - itemHeight) / 2;

    switch (anchor) {
      case 'top-left':
        x = 36;
        y = pageHeight - itemHeight - 36;
        break;
      case 'top-center':
        x = (pageWidth - itemWidth) / 2;
        y = pageHeight - itemHeight - 36;
        break;
      case 'top-right':
        x = pageWidth - itemWidth - 36;
        y = pageHeight - itemHeight - 36;
        break;
      case 'center-left':
        x = 36;
        y = (pageHeight - itemHeight) / 2;
        break;
      case 'center':
        x = (pageWidth - itemWidth) / 2;
        y = (pageHeight - itemHeight) / 2;
        break;
      case 'center-right':
        x = pageWidth - itemWidth - 36;
        y = (pageHeight - itemHeight) / 2;
        break;
      case 'bottom-left':
        x = 36;
        y = 36;
        break;
      case 'bottom-center':
        x = (pageWidth - itemWidth) / 2;
        y = 36;
        break;
      case 'bottom-right':
        x = pageWidth - itemWidth - 36;
        y = 36;
        break;
    }

    return {
      x: x + Number(offsetX || 0),
      y: y + Number(offsetY || 0)
    };
  }

  /**
   * Core Watermark Application Engine
   */
  static async applyWatermark(rawBytes, config = {}, options = {}) {
    if (!rawBytes) throw new Error('No PDF bytes loaded for watermark operation');

    const sourceDoc = await PDFDocument.load(rawBytes);
    const numPages = sourceDoc.getPageCount();
    if (numPages === 0) throw new Error('PDF document contains no pages');

    const mode = (config.mode || config.type || 'text').toLowerCase(); // 'text' or 'image'
    const opacity = typeof config.opacity === 'number' ? Math.max(0.01, Math.min(1.0, config.opacity)) : 0.3;
    const rotationDeg = typeof config.rotation === 'number' ? config.rotation : 45;
    const layer = (config.layer || 'over').toLowerCase(); // 'over' (foreground) or 'under' (background)
    const layout = (config.layout || 'single').toLowerCase(); // 'single' or 'mosaic'
    const anchor = (config.anchor || config.position || 'center').toLowerCase();
    const rangeRule = config.rangeRule || config.pageRange || config.pages || 'all';

    const includedIndices = new Set(this.getIncludedPageIndices(numPages, rangeRule));

    // Choose doc to edit: If layer === 'under', we create a fresh doc and embed pages over the watermark
    let finalDoc = sourceDoc;
    let newDoc = null;
    if (layer === 'under') {
      newDoc = await PDFDocument.create();
      finalDoc = newDoc;
    }

    // Embed font for text mode
    let font = null;
    if (mode === 'text') {
      const family = config.fontFamily || 'HelveticaBold';
      if (family === 'TimesRoman') font = await finalDoc.embedFont(StandardFonts.TimesRomanBold);
      else if (family === 'Courier') font = await finalDoc.embedFont(StandardFonts.CourierBold);
      else font = await finalDoc.embedFont(StandardFonts.HelveticaBold);
    }

    // Embed image for image mode
    let embeddedImg = null;
    if (mode === 'image' && (config.imageBase64 || config.imageBytes)) {
      const imgBuffer = config.imageBytes || Buffer.from(config.imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const isPng = (config.imageType || '').includes('png') || (config.imageBase64 && config.imageBase64.startsWith('data:image/png'));
      if (isPng) {
        embeddedImg = await finalDoc.embedPng(imgBuffer);
      } else {
        try {
          embeddedImg = await finalDoc.embedJpg(imgBuffer);
        } catch {
          embeddedImg = await finalDoc.embedPng(imgBuffer);
        }
      }
    }

    const textColor = hexToRgb(config.color || config.textColor || '#94a3b8') || rgb(0.58, 0.64, 0.72);
    let appliedCount = 0;

    for (let i = 0; i < numPages; i++) {
      const srcPage = sourceDoc.getPage(i);
      const { width, height } = srcPage.getSize();

      if (!includedIndices.has(i)) {
        if (layer === 'under') {
          const [copied] = await newDoc.copyPages(sourceDoc, [i]);
          newDoc.addPage(copied);
        }
        continue;
      }

      appliedCount++;

      let targetPage = srcPage;
      if (layer === 'under') {
        targetPage = newDoc.addPage([width, height]);
      }

      // Macro-interpolated text
      const pageNum = i + 1;
      const textRaw = config.text || 'CONFIDENTIAL';
      const text = this.interpolateMacros(textRaw, {
        pageNumber: pageNum,
        totalPages: numPages,
        fileName: options.fileName || 'document.pdf',
        title: options.title || 'Document'
      });

      // Watermark Drawer function
      const drawWatermarkItem = (cx, cy) => {
        if (mode === 'image' && embeddedImg) {
          const imgSize = embeddedImg.scale(config.scale || 0.4);
          const drawW = imgSize.width;
          const drawH = imgSize.height;
          targetPage.drawImage(embeddedImg, {
            x: cx - drawW / 2,
            y: cy - drawH / 2,
            width: drawW,
            height: drawH,
            opacity,
            rotate: degrees(rotationDeg)
          });
        } else {
          // Text mode
          const fontSize = Number(config.fontSize || Math.max(14, Math.min(width, height) / 9));
          const textW = font.widthOfTextAtSize(text, fontSize);
          const rad = (rotationDeg * Math.PI) / 180;
          targetPage.drawText(text, {
            x: cx - (textW * Math.cos(rad)) / 2,
            y: cy - (textW * Math.sin(rad)) / 2,
            size: fontSize,
            font,
            color: textColor,
            opacity,
            rotate: degrees(rotationDeg)
          });
        }
      };

      if (layout === 'mosaic') {
        // Tiled repeat grid: 3 columns x 4 rows
        const cols = 3;
        const rows = 4;
        const cellW = width / cols;
        const cellH = height / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = (c + 0.5) * cellW;
            const cy = (r + 0.5) * cellH;
            drawWatermarkItem(cx, cy);
          }
        }
      } else {
        // Single anchored stamp
        const pos = this.calculateAnchorPosition(anchor, width, height, 0, 0, config.offsetX, config.offsetY);
        drawWatermarkItem(pos.x, pos.y);
      }

      // If under layer, now draw original source page over the background watermark
      if (layer === 'under') {
        if (!srcPage.node.get(PDFName.of('Contents'))) {
          srcPage.node.set(PDFName.of('Contents'), sourceDoc.context.register(sourceDoc.context.stream('')));
        }
        const embeddedSrc = await newDoc.embedPage(srcPage);
        targetPage.drawPage(embeddedSrc, {
          x: 0,
          y: 0,
          width,
          height
        });
      }
    }

    const outputBytes = await finalDoc.save({ updateMetadata: false });

    const report = {
      mode,
      layer,
      layout,
      rotation: rotationDeg,
      rotationDeg,
      text: config.text || '',
      opacity,
      appliedCount,
      totalPages: numPages,
      timestamp: new Date().toISOString()
    };

    outputBytes.bytes = outputBytes;
    outputBytes.appliedCount = appliedCount;
    outputBytes.totalPages = numPages;
    outputBytes.watermarkMode = mode;
    outputBytes.report = report;

    return outputBytes;
  }

  /**
   * Generates a 4-page test PDF document for watermark testing
   */
  static async createSampleWatermarkPdf() {
    const doc = await PDFDocument.create();
    doc.setTitle('Quarterly Financial & Security Audit');

    const pages = [
      { title: 'NON-DISCLOSURE AGREEMENT', color: rgb(0.12, 0.23, 0.38) },
      { title: 'FINANCIAL STATEMENTS Q4', color: rgb(0.18, 0.31, 0.49) },
      { title: 'PATENT APPLICATION SPECIFICATION', color: rgb(0.09, 0.44, 0.42) },
      { title: 'PROPRIETARY SOURCE AUDIT', color: rgb(0.48, 0.18, 0.22) }
    ];

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      // Header card
      page.drawRectangle({
        x: 40,
        y: height - 100,
        width: width - 80,
        height: 50,
        color: p.color
      });

      // Body container
      page.drawRectangle({
        x: 40,
        y: 60,
        width: width - 80,
        height: height - 180,
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 1,
        color: rgb(0.98, 0.99, 1.0)
      });

      // Content strips
      for (let r = 0; r < 8; r++) {
        page.drawRectangle({
          x: 60,
          y: height - 160 - r * 60,
          width: width - 120,
          height: 35,
          color: rgb(0.92, 0.94, 0.97)
        });
      }
    }

    return await doc.save();
  }
}
