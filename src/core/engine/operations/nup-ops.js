/**
 * Adobe Acrobat Pro & iLovePDF N-Up Page Imposition Engine
 * Supports 2-up, 4-up, 6-up, 8-up layouts, portrait/landscape, custom margins, gutters,
 * page borders, background color, ordering, and range filtering.
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

export class NupOps {
  static LAYOUT_SPECS = {
    2: {
      portrait: { cols: 1, rows: 2 },
      landscape: { cols: 2, rows: 1 },
      defaultOrientation: 'landscape'
    },
    4: {
      portrait: { cols: 2, rows: 2 },
      landscape: { cols: 2, rows: 2 },
      defaultOrientation: 'portrait'
    },
    6: {
      portrait: { cols: 2, rows: 3 },
      landscape: { cols: 3, rows: 2 },
      defaultOrientation: 'portrait'
    },
    8: {
      portrait: { cols: 2, rows: 4 },
      landscape: { cols: 4, rows: 2 },
      defaultOrientation: 'portrait'
    }
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
   * Core N-Up Page Imposition
   */
  static async applyNup(rawBytes, config = {}, options = {}) {
    if (!rawBytes) throw new Error('No PDF bytes loaded for N-Up imposition');

    const sourceDoc = await PDFDocument.load(rawBytes);
    const numPages = sourceDoc.getPageCount();
    if (numPages === 0) throw new Error('PDF document has no pages');

    const layout = Number(config.layout || config.nUpCount || 2);
    const spec = this.LAYOUT_SPECS[layout] || this.LAYOUT_SPECS[2];
    const orientation = (config.orientation || spec.defaultOrientation || 'portrait').toLowerCase();
    const grid = spec[orientation] || spec[spec.defaultOrientation];
    const cols = Number(config.cols || grid.cols);
    const rows = Number(config.rows || grid.rows);
    const pagesPerSheet = cols * rows;

    const margin = typeof config.margin === 'number' ? config.margin : 20;
    const gutter = typeof config.gutter === 'number' ? config.gutter : 8;
    const showBorder = Boolean(config.showBorder ?? false);
    const borderColor = hexToRgb(config.borderColor || '#94a3b8') || rgb(0.58, 0.64, 0.72);
    const borderWidth = Number(config.borderWidth || 0.75);
    const bgColor = hexToRgb(config.backgroundColor);
    const order = (config.order || 'horizontal').toLowerCase(); // 'horizontal' (row-major) or 'vertical' (col-major)
    const rangeRule = config.rangeRule || config.pageRange || 'all';

    // Sheet dimensions: A4 portrait (595.28 x 841.89) or landscape (841.89 x 595.28)
    const sheetW = orientation === 'landscape' ? 841.89 : 595.28;
    const sheetH = orientation === 'landscape' ? 595.28 : 841.89;

    const includedIndices = this.getIncludedPageIndices(numPages, rangeRule);
    if (includedIndices.length === 0) throw new Error('No pages selected by range filter');

    const finalDoc = await PDFDocument.create();

    // Usable grid area inside margins
    const usableW = sheetW - 2 * margin - (cols - 1) * gutter;
    const usableH = sheetH - 2 * margin - (rows - 1) * gutter;
    const cellW = usableW / cols;
    const cellH = usableH / rows;

    for (let sheetIdx = 0; sheetIdx < includedIndices.length; sheetIdx += pagesPerSheet) {
      const sheet = finalDoc.addPage([sheetW, sheetH]);

      if (bgColor) {
        sheet.drawRectangle({
          x: 0,
          y: 0,
          width: sheetW,
          height: sheetH,
          color: bgColor
        });
      }

      // Collect cell positions
      const positions = [];
      if (order === 'vertical') {
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            positions.push({ col: c, row: r });
          }
        }
      } else {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            positions.push({ col: c, row: r });
          }
        }
      }

      for (let sub = 0; sub < pagesPerSheet; sub++) {
        const itemIdx = sheetIdx + sub;
        if (itemIdx >= includedIndices.length) break;

        const sourcePageIdx = includedIndices[itemIdx];
        const srcPage = sourceDoc.getPage(sourcePageIdx);

        // Ensure contents stream exists for pdf-lib form XObject embedding
        if (!srcPage.node.get(PDFName.of('Contents'))) {
          srcPage.node.set(
            PDFName.of('Contents'),
            sourceDoc.context.register(sourceDoc.context.stream(''))
          );
        }

        const embeddedPage = await finalDoc.embedPage(srcPage);
        const { width: origW, height: origH } = embeddedPage.size();

        const { col, row } = positions[sub];
        const cellLeft = margin + col * (cellW + gutter);
        // Note: PDF coordinate system (0,0) is bottom-left. Row 0 is at top of sheet.
        const cellBottom = sheetH - margin - (row + 1) * cellH - row * gutter;

        const scale = Math.min(cellW / origW, cellH / origH);
        const placedW = origW * scale;
        const placedH = origH * scale;

        const placedX = cellLeft + (cellW - placedW) / 2;
        const placedY = cellBottom + (cellH - placedH) / 2;

        sheet.drawPage(embeddedPage, {
          x: placedX,
          y: placedY,
          xScale: scale,
          yScale: scale
        });

        if (showBorder) {
          sheet.drawRectangle({
            x: placedX,
            y: placedY,
            width: placedW,
            height: placedH,
            borderColor,
            borderWidth
          });
        }
      }
    }

    const outputBytes = await finalDoc.save();
    const outputPageCount = finalDoc.getPageCount();

    const report = {
      layout,
      orientation,
      cols,
      rows,
      pagesPerSheet,
      margin,
      gutter,
      showBorder,
      borderWidth,
      sourcePages: numPages,
      appliedCount: includedIndices.length,
      outputPageCount,
      timestamp: new Date().toISOString()
    };

    // Attach metadata properties directly to Uint8Array instance
    outputBytes.bytes = outputBytes;
    outputBytes.appliedCount = includedIndices.length;
    outputBytes.totalPages = numPages;
    outputBytes.outputPageCount = outputPageCount;
    outputBytes.layout = layout;
    outputBytes.report = report;

    return outputBytes;
  }

  /**
   * Generates an 8-page sample document for testing & demoing N-Up imposition
   */
  static async createSampleNupPdf() {
    const doc = await PDFDocument.create();

    const sections = [
      { title: 'Executive Summary', color: rgb(0.12, 0.23, 0.38), subtitle: 'Strategic Initiatives & Market Analysis 2026' },
      { title: 'Table of Contents', color: rgb(0.18, 0.31, 0.49), subtitle: 'Document Architecture & Section Outlines' },
      { title: 'Technical Architecture', color: rgb(0.09, 0.44, 0.42), subtitle: 'Microservices, Event Streams & Engine Topologies' },
      { title: 'Performance Metrics', color: rgb(0.15, 0.39, 0.65), subtitle: 'WASM Latency, Throughput & Resource Utilization' },
      { title: 'Security & Compliance', color: rgb(0.48, 0.18, 0.22), subtitle: 'SOC2 Type II, ISO 27001 & PDF Sanitization' },
      { title: 'Imposition Test Matrix', color: rgb(0.35, 0.24, 0.52), subtitle: 'Multi-Sheet N-Up Imposition Validation Sheet' },
      { title: 'Audit Telemetry', color: rgb(0.24, 0.36, 0.28), subtitle: 'XMP Packets, Object Hierarchy & Content Streams' },
      { title: 'Signoff & Certification', color: rgb(0.12, 0.23, 0.38), subtitle: 'Document Approval & Release Signatures' }
    ];

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const page = doc.addPage([595.28, 841.89]); // A4 Portrait
      const { width, height } = page.getSize();

      // Top Header Banner
      page.drawRectangle({
        x: 40,
        y: height - 120,
        width: width - 80,
        height: 70,
        color: s.color
      });

      // Banner text indicator
      page.drawRectangle({
        x: 48,
        y: height - 110,
        width: 14,
        height: 50,
        color: rgb(1, 1, 1)
      });

      // Body card
      page.drawRectangle({
        x: 40,
        y: 60,
        width: width - 80,
        height: height - 200,
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 1,
        color: rgb(0.98, 0.99, 1.0)
      });

      // Decorative mini grid simulation
      for (let r = 0; r < 5; r++) {
        page.drawRectangle({
          x: 60,
          y: height - 240 - r * 60,
          width: width - 120,
          height: 40,
          color: rgb(0.92, 0.94, 0.97)
        });
      }

      // Page footer bar
      page.drawRectangle({
        x: 40,
        y: 40,
        width: width - 80,
        height: 2,
        color: rgb(0.8, 0.84, 0.89)
      });
    }

    const bytes = await doc.save();
    return bytes;
  }
}
