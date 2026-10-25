/**
 * Adobe Acrobat Pro & iLovePDF Dynamic Page Numbering Engine
 * Supports: Arabic, Roman numerals, Alphabetical numbering, format templates,
 * 6-zone anchor positions, cover page skip, custom ranges, and font customization.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class PageNumbersOps {
  /**
   * Helper: Converts hex color string (#rrggbb) to rgb object (0..1)
   */
  static hexToRgb(hex = '#475569') {
    const clean = String(hex || '#475569').replace('#', '');
    const num = parseInt(clean, 16);
    if (isNaN(num)) return rgb(0.28, 0.33, 0.41);
    return rgb(
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    );
  }

  /**
   * Converts integer (1..3999) to Roman numeral
   */
  static toRoman(num, uppercase = false) {
    let n = Math.max(1, Math.min(3999, parseInt(num, 10) || 1));
    const lookup = [
      ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
      ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
      ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
    ];
    let roman = '';
    for (const [letter, val] of lookup) {
      while (n >= val) {
        roman += letter;
        n -= val;
      }
    }
    return uppercase ? roman : roman.toLowerCase();
  }

  /**
   * Converts integer (1..702) to Alphabetical column sequence (a..z, aa..zz)
   */
  static toLetters(num, uppercase = false) {
    let n = Math.max(1, parseInt(num, 10) || 1);
    let str = '';
    while (n > 0) {
      const rem = (n - 1) % 26;
      str = String.fromCharCode(65 + rem) + str;
      n = Math.floor((n - 1) / 26);
    }
    return uppercase ? str : str.toLowerCase();
  }

  /**
   * Formats a page number text according to style and format template
   * Styles: 'arabic', 'roman-lower', 'roman-upper', 'letters-lower', 'letters-upper'
   */
  static formatNumber(num, total, format = 'Page {n} of {total}', style = 'arabic', context = {}) {
    let nStr = String(num);
    const s = String(style || 'arabic').toLowerCase();

    if (s.startsWith('roman') && s.includes('upper')) {
      nStr = this.toRoman(num, true);
    } else if (s.startsWith('roman')) {
      nStr = this.toRoman(num, false);
    } else if ((s.startsWith('alpha') || s.startsWith('letter')) && s.includes('upper')) {
      nStr = this.toLetters(num, true);
    } else if (s.startsWith('alpha') || s.startsWith('letter')) {
      nStr = this.toLetters(num, false);
    }

    const fileBase = context.fileName ? String(context.fileName).replace(/\.pdf$/i, '') : 'DOCUMENT';
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const yearStr = String(now.getFullYear());

    return String(format || 'Page {n} of {total}')
      .replace(/\{n\}/g, nStr)
      .replace(/\{total\}/g, String(total))
      .replace(/<<Date>>/gi, dateStr)
      .replace(/<<Year>>/gi, yearStr)
      .replace(/<<FileName>>/gi, fileBase);
  }

  /**
   * Filters pages by range rule (all, skip-cover, odd, even, or range string '1-5')
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
   * Calculates anchor coordinates on page for the 6 standard positions
   */
  static calculatePosition(position = 'bottom-center', pageWidth, pageHeight, textWidth, fontSize, margins = {}) {
    const mTop = Number(margins.top ?? 28);
    const mBottom = Number(margins.bottom ?? 24);
    const mLeft = Number(margins.left ?? 36);
    const mRight = Number(margins.right ?? 36);

    let x = (pageWidth - textWidth) / 2;
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
   * Core Dynamic Page Numbering Application Engine
   */
  static async applyPageNumbers(rawBytes, config = {}, context = {}) {
    if (!rawBytes) throw new Error('No PDF bytes provided for Page Numbering operation');

    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const numPages = sourceDoc.getPageCount();
    if (numPages === 0) throw new Error('PDF document contains no pages');

    const format = config.format || config.formatTemplate || 'Page {n} of {total}';
    const style = (config.style || 'arabic').toLowerCase();
    const position = (config.position || config.pos || 'bottom-center').toLowerCase();
    const startNumber = parseInt(config.startNumber ?? config.firstNumber ?? config.start ?? 1, 10) || 1;
    const startPage = Math.max(1, parseInt(config.startPage ?? 1, 10) || 1);
    const fontSize = Math.max(6, Math.min(36, parseInt(config.fontSize ?? 10, 10) || 10));
    const colorHex = config.textColor || config.color || config.colorHex || '#475569';
    const opacity = typeof config.opacity === 'number' ? Math.max(0.01, Math.min(1.0, config.opacity)) : 1.0;
    const rangeRule = config.range || config.rangeRule || config.pageRange || config.pages || (startPage > 1 ? `${startPage}-${numPages}` : 'all');

    // Embed font
    let font = null;
    const family = (config.fontFamily || config.font || 'Helvetica').toLowerCase();
    if (family.includes('courier')) {
      font = family.includes('bold') ? await finalDoc.embedFont(StandardFonts.CourierBold) : await finalDoc.embedFont(StandardFonts.Courier);
    } else if (family.includes('times')) {
      font = family.includes('bold') ? await finalDoc.embedFont(StandardFonts.TimesRomanBold) : await finalDoc.embedFont(StandardFonts.TimesRoman);
    } else {
      font = family.includes('bold') ? await finalDoc.embedFont(StandardFonts.HelveticaBold) : await finalDoc.embedFont(StandardFonts.Helvetica);
    }

    const textColor = this.hexToRgb(colorHex);
    const includedIndices = new Set(this.getIncludedPageIndices(numPages, rangeRule));

    let currentNumber = startNumber;
    let stampedCount = 0;
    let firstFormatted = '';
    let lastFormatted = '';
    const stampedPages = [];

    const margins = {
      top: config.marginTop ?? 28,
      bottom: config.marginBottom ?? 24,
      left: config.marginLeft ?? 36,
      right: config.marginRight ?? 36
    };

    for (let i = 0; i < numPages; i++) {
      const [page] = await finalDoc.copyPages(sourceDoc, [i]);
      const { width, height } = page.getSize();

      if (includedIndices.has(i) && (i + 1 >= startPage)) {
        const text = this.formatNumber(currentNumber, numPages, format, style, context);
        if (!firstFormatted) firstFormatted = text;
        lastFormatted = text;

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const { x, y } = this.calculatePosition(position, width, height, textWidth, fontSize, margins);

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: textColor,
          opacity
        });

        stampedPages.push(i + 1);
        currentNumber++;
        stampedCount++;
      }

      finalDoc.addPage(page);
    }

    const outputBytes = await finalDoc.save({ updateMetadata: false });

    const report = {
      startNumber,
      format,
      formatTemplate: format,
      style,
      position,
      fontFamily: family,
      fontSize,
      color: colorHex,
      textColor: colorHex,
      startFormatted: firstFormatted || this.formatNumber(startNumber, numPages, format, style, context),
      endFormatted: lastFormatted || firstFormatted,
      stampedCount,
      appliedCount: stampedCount,
      totalPages: numPages,
      stampedPages,
      timestamp: new Date().toISOString()
    };

    outputBytes.bytes = outputBytes;
    outputBytes.pdfBytes = outputBytes;
    outputBytes.appliedCount = stampedCount;
    outputBytes.totalPages = numPages;
    outputBytes.report = report;
    outputBytes.lastPageNumbersResult = report;

    return outputBytes;
  }

  /**
   * Generates a 4-page academic research paper test document for Page Numbers testing
   */
  static async createSamplePageNumbersPdf() {
    const doc = await PDFDocument.create();
    doc.setTitle('Peer-Reviewed Computational Linguistics Whitepaper');

    const pages = [
      {
        tag: 'COVER SHEET',
        title: 'ADVANCEMENTS IN TRANSFORMER VECTOR ATTENTION',
        abstract: 'An empirical evaluation of latency optimizations in low-precision inference models.',
        color: rgb(0.15, 0.23, 0.42)
      },
      {
        tag: 'SECTION 1',
        title: '1. BACKGROUND & ARCHITECTURAL FOUNDATIONS',
        abstract: 'Formalization of multi-head self-attention mechanisms and dense KV cache projection.',
        color: rgb(0.18, 0.32, 0.48)
      },
      {
        tag: 'SECTION 2',
        title: '2. EXPERIMENTAL BENCHMARKS & HARDWARE METRICS',
        abstract: 'Comparison of FP8 and INT4 quantization kernels across cluster workloads.',
        color: rgb(0.09, 0.44, 0.42)
      },
      {
        tag: 'SECTION 3',
        title: '3. CONCLUSION & REPRODUCIBILITY STATEMENTS',
        abstract: 'Summary of findings, open source artifact manifest, and grant acknowledgments.',
        color: rgb(0.35, 0.18, 0.38)
      }
    ];

    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      // Top Header Border
      page.drawRectangle({
        x: 40,
        y: height - 55,
        width: width - 80,
        height: 2,
        color: p.color
      });

      page.drawText('JOURNAL OF COMPUTATIONAL INTELLIGENCE — VOL. 48, ISSUE 2', {
        x: 40,
        y: height - 48,
        size: 8,
        font: helveticaBold,
        color: rgb(0.45, 0.52, 0.60)
      });

      // Section Tag
      page.drawText(p.tag, {
        x: 40,
        y: height - 90,
        size: 10,
        font: helveticaBold,
        color: p.color
      });

      // Heading
      page.drawText(p.title, {
        x: 40,
        y: height - 118,
        size: 13,
        font: helveticaBold,
        color: rgb(0.09, 0.13, 0.20)
      });

      // Abstract Callout
      page.drawRectangle({
        x: 40,
        y: height - 165,
        width: width - 80,
        height: 36,
        color: rgb(0.96, 0.97, 0.99),
        borderColor: rgb(0.88, 0.91, 0.95),
        borderWidth: 1
      });

      page.drawText(p.abstract, {
        x: 50,
        y: height - 146,
        size: 9,
        font: helvetica,
        color: rgb(0.32, 0.38, 0.46)
      });

      // Body Mockup
      for (let r = 0; r < 9; r++) {
        page.drawRectangle({
          x: 40,
          y: height - 215 - r * 50,
          width: width - 80,
          height: 28,
          color: rgb(0.98, 0.99, 1.0),
          borderColor: rgb(0.92, 0.94, 0.97),
          borderWidth: 0.5
        });
      }
    }

    return await doc.save();
  }
}
