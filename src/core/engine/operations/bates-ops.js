/**
/**
 * Adobe Acrobat Pro Legal Production Bates Numbering Engine
 * ISO 32000-1 Compliant Stamping & Sequential Document Production
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class BatesOps {
  /**
   * Helper: Converts hex color string (#rrggbb) to rgb object (0..1)
   */
  static hexToRgb(hex = '#1e293b') {
    const clean = String(hex || '#1e293b').replace('#', '');
    const num = parseInt(clean, 16);
    if (isNaN(num)) return rgb(0.12, 0.16, 0.23);
    return rgb(
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    );
  }

  /**
   * Interpolate dynamic macro tokens in prefix/suffix strings
   * Supported: <<Date>>, <<Year>>, <<FileName>>, <<CaseNo>>
   */
  static interpolateMacros(pattern = '', context = {}) {
    if (!pattern || typeof pattern !== 'string') return '';
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const yearStr = String(now.getFullYear());
    const fileBase = context.fileName ? String(context.fileName).replace(/\.pdf$/i, '') : 'DOCUMENT';
    const caseNo = context.caseNo || 'CASE-2026';

    return pattern
      .replace(/<<Date>>/gi, dateStr)
      .replace(/<<Year>>/gi, yearStr)
      .replace(/<<FileName>>/gi, fileBase)
      .replace(/<<CaseNo>>/gi, caseNo);
  }

  /**
   * Formats a sequential Bates stamp label
   */
  static formatBatesStamp(sequenceNum, digits = 6, prefix = 'CASE-', suffix = '', context = {}) {
    const interpPrefix = this.interpolateMacros(prefix, context);
    const interpSuffix = this.interpolateMacros(suffix, context);
    const padded = String(Math.max(0, sequenceNum)).padStart(Math.max(1, digits), '0');
    return `${interpPrefix}${padded}${interpSuffix}`;
  }

  /**
   * Filters pages by range rule (all, odd, even, range string, or skip-cover)
   */
  static getIncludedPageIndices(totalCount, rangeRule = 'all') {
    const rule = String(rangeRule || 'all').trim().toLowerCase();
    const indices = [];

    if (rule === 'all') {
      for (let i = 0; i < totalCount; i++) indices.push(i);
      return indices;
    }
    if (rule === 'skip-cover' || rule === 'skip_cover') {
      for (let i = 1; i < totalCount; i++) indices.push(i);
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
   * Calculates anchor coordinates on page for the 6 standard Bates positions
   */
  static calculatePosition(position = 'bottom-right', pageWidth, pageHeight, textWidth, fontSize, margins = {}) {
    const mTop = Number(margins.top ?? 28);
    const mBottom = Number(margins.bottom ?? 24);
    const mLeft = Number(margins.left ?? 36);
    const mRight = Number(margins.right ?? 36);

    let x = pageWidth - textWidth - mRight;
    let y = mBottom;

    switch (position) {
      case 'bottom-left':
        x = mLeft;
        y = mBottom;
        break;
      case 'bottom-center':
        x = (pageWidth - textWidth) / 2;
        y = mBottom;
        break;
      case 'bottom-right':
        x = pageWidth - textWidth - mRight;
        y = mBottom;
        break;
      case 'top-left':
        x = mLeft;
        y = pageHeight - mTop - fontSize;
        break;
      case 'top-center':
        x = (pageWidth - textWidth) / 2;
        y = pageHeight - mTop - fontSize;
        break;
      case 'top-right':
        x = pageWidth - textWidth - mRight;
        y = pageHeight - mTop - fontSize;
        break;
    }

    return { x, y };
  }

  /**
   * Core Legal Bates Numbering Engine
   */
  static async applyBatesNumbering(rawBytes, config = {}, context = {}) {
    if (!rawBytes) throw new Error('No PDF bytes provided for Bates numbering operation');

    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const numPages = sourceDoc.getPageCount();
    if (numPages === 0) throw new Error('PDF document contains no pages');

    const prefix = config.prefix !== undefined ? config.prefix : 'CASE-';
    const suffix = config.suffix !== undefined ? config.suffix : '';
    const startNumber = parseInt(config.startNumber ?? config.start ?? 1, 10) || 1;
    const digits = Math.max(1, Math.min(12, parseInt(config.digits ?? 6, 10) || 6));
    const increment = parseInt(config.increment ?? 1, 10) || 1;
    const position = (config.position ?? config.pos ?? 'bottom-right').toLowerCase();
    const fontSize = Math.max(6, Math.min(36, parseInt(config.fontSize ?? 10, 10) || 10));
    const colorHex = config.color || config.colorHex || '#1e293b';
    const opacity = typeof config.opacity === 'number' ? Math.max(0.01, Math.min(1.0, config.opacity)) : 1.0;
    const rangeRule = config.rangeRule || config.pageRange || config.pages || 'all';

    // Embed chosen font
    let font = null;
    const family = (config.fontFamily || 'HelveticaBold').toLowerCase();
    if (family.includes('courier')) {
      font = family.includes('bold') ? await finalDoc.embedFont(StandardFonts.CourierBold) : await finalDoc.embedFont(StandardFonts.Courier);
    } else if (family.includes('times')) {
      font = family.includes('bold') ? await finalDoc.embedFont(StandardFonts.TimesRomanBold) : await finalDoc.embedFont(StandardFonts.TimesRoman);
    } else {
      font = family.includes('bold') || family === 'helveticabold' ? await finalDoc.embedFont(StandardFonts.HelveticaBold) : await finalDoc.embedFont(StandardFonts.Helvetica);
    }

    const textColor = this.hexToRgb(colorHex);
    const includedIndices = new Set(this.getIncludedPageIndices(numPages, rangeRule));

    let currentNumber = startNumber;
    let stampedCount = 0;
    let firstStampedText = '';
    let lastStampedText = '';

    const margins = {
      top: config.marginTop ?? 28,
      bottom: config.marginBottom ?? 24,
      left: config.marginLeft ?? 36,
      right: config.marginRight ?? 36
    };

    for (let i = 0; i < numPages; i++) {
      const [page] = await finalDoc.copyPages(sourceDoc, [i]);
      const { width, height } = page.getSize();

      if (includedIndices.has(i)) {
        const batesText = this.formatBatesStamp(currentNumber, digits, prefix, suffix, context);
        if (!firstStampedText) firstStampedText = batesText;
        lastStampedText = batesText;

        const textWidth = font.widthOfTextAtSize(batesText, fontSize);
        const { x, y } = this.calculatePosition(position, width, height, textWidth, fontSize, margins);

        page.drawText(batesText, {
          x,
          y,
          size: fontSize,
          font,
          color: textColor,
          opacity
        });

        currentNumber += increment;
        stampedCount++;
      }

      finalDoc.addPage(page);
    }

    const outputBytes = await finalDoc.save({ updateMetadata: false });

    const report = {
      startNumber,
      nextNumber: currentNumber,
      digits,
      prefix,
      suffix,
      startBates: firstStampedText || this.formatBatesStamp(startNumber, digits, prefix, suffix, context),
      endBates: lastStampedText || firstStampedText,
      position,
      fontSize,
      color: colorHex,
      stampedCount,
      appliedCount: stampedCount,
      totalPages: numPages,
      timestamp: new Date().toISOString()
    };

    outputBytes.bytes = outputBytes;
    outputBytes.appliedCount = stampedCount;
    outputBytes.totalPages = numPages;
    outputBytes.report = report;
    outputBytes.lastBatesResult = report;

    return outputBytes;
  }

  /**
   * Applies sequential Bates numbering across an entire multi-document batch
   */
  static async sequenceBatch(documents = [], commonConfig = {}) {
    let nextStart = parseInt(commonConfig.startNumber || 1, 10);
    const results = [];
    let totalStamped = 0;
    let initialBates = '';
    let finalBates = '';

    for (let d = 0; d < documents.length; d++) {
      const docItem = documents[d];
      const docBytes = docItem.bytes || docItem;
      const docName = docItem.name || `Document_${d + 1}.pdf`;

      const docConfig = { ...commonConfig, startNumber: nextStart };
      const stampedBytes = await this.applyBatesNumbering(docBytes, docConfig, { fileName: docName });

      if (!initialBates) initialBates = stampedBytes.report.startBates;
      finalBates = stampedBytes.report.endBates;
      totalStamped += stampedBytes.report.stampedCount;
      nextStart = stampedBytes.report.nextNumber;

      results.push({
        name: `Bates_${docName}`,
        bytes: stampedBytes,
        report: stampedBytes.report
      });
    }

    return {
      documents: results,
      totalStampedPages: totalStamped,
      startBates: initialBates,
      endBates: finalBates,
      nextAvailableNumber: nextStart
    };
  }

  /**
   * Generates a 4-page legal brief sample document for Bates testing
   */
  static async createSampleBatesPdf() {
    const doc = await PDFDocument.create();
    doc.setTitle('Legal Production Master Discovery Brief');

    const pages = [
      {
        tag: 'PLEADING',
        title: 'PETITION FOR DECLARATORY JUDGMENT & RELIEF',
        court: 'UNITED STATES DISTRICT COURT FOR THE SOUTHERN DISTRICT',
        color: rgb(0.12, 0.22, 0.38)
      },
      {
        tag: 'SCHEDULE A',
        title: 'EXHIBIT A: TRANSACTION LEDGER & DISCOVERY SCHEDULE',
        court: 'CASE DOCKET NO. 2026-CV-09412-JSD',
        color: rgb(0.18, 0.32, 0.48)
      },
      {
        tag: 'SCHEDULE B',
        title: 'EXHIBIT B: CERTIFICATE OF CONFIDENTIAL DISCLOSURE',
        court: 'UNDER PROTECTIVE ORDER DATED OCTOBER 14, 2026',
        color: rgb(0.09, 0.44, 0.42)
      },
      {
        tag: 'AFFIDAVIT',
        title: 'AFFIDAVIT OF COUNSEL & ATTESTATION OF RECORDS',
        court: 'SWORN AND SUBSCRIBED BEFORE ME THIS DAY',
        color: rgb(0.48, 0.18, 0.22)
      }
    ];

    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      // Top Header Bar
      page.drawRectangle({
        x: 36,
        y: height - 60,
        width: width - 72,
        height: 3,
        color: p.color
      });

      page.drawText(p.court, {
        x: 40,
        y: height - 50,
        size: 9,
        font: helveticaBold,
        color: p.color
      });

      // Tag Badge
      page.drawRectangle({
        x: 40,
        y: height - 100,
        width: 100,
        height: 20,
        color: rgb(0.94, 0.96, 0.98),
        borderColor: p.color,
        borderWidth: 1
      });
      page.drawText(p.tag, {
        x: 46,
        y: height - 94,
        size: 9,
        font: helveticaBold,
        color: p.color
      });

      // Heading Title
      page.drawText(p.title, {
        x: 40,
        y: height - 130,
        size: 14,
        font: helveticaBold,
        color: rgb(0.09, 0.13, 0.20)
      });

      // Sample Pleading Content Lines
      for (let row = 0; row < 12; row++) {
        page.drawRectangle({
          x: 40,
          y: height - 170 - row * 45,
          width: width - 80,
          height: 24,
          color: rgb(0.96, 0.97, 0.99),
          borderColor: rgb(0.90, 0.92, 0.95),
          borderWidth: 0.5
        });
      }

      // Bottom Footer Bar
      page.drawRectangle({
        x: 36,
        y: 45,
        width: width - 72,
        height: 1,
        color: rgb(0.82, 0.86, 0.90)
      });
      page.drawText(`Page ${i + 1} of ${pages.length} — Legal Discovery Production Record`, {
        x: 40,
        y: 32,
        size: 8,
        font: helvetica,
        color: rgb(0.48, 0.54, 0.62)
      });
    }

    return await doc.save();
  }
}
