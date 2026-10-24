/**
 * Advanced Multi-Zone Header & Footer Dynamic Variable Engine
 * Reverse-engineered from Adobe Acrobat Pro ("Add Header and Footer")
 * and iLovePDF/Sejda specifications:
 * - 6-Zone Coordinate Placement:
 *   1. Left Header    2. Center Header    3. Right Header
 *   4. Left Footer    5. Center Footer    6. Right Footer
 * - Dynamic Variable Interpolation:
 *   <<Page>>, <<TotalPages>>, <<Date>>, <<Time>>, <<FileName>>, <<Title>>, <<Author>>
 * - Custom Margins (Top, Bottom, Left, Right in points or inches)
 * - Page Selection Filters (All, Odd only, Even only, Custom Range, Skip First / Cover Page)
 * - Typography Styles: Helvetica, Times-Roman, Courier, Helvetica-Bold, custom font size & RGB hex
 * - Optional separator divider lines below header and above footer
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class HeaderFooterOps {
  /**
   * Interpolates template macros like <<Page>>, <<TotalPages>>, <<Date>>, <<FileName>>
   */
  static interpolateMacros(template, context = {}) {
    if (!template || typeof template !== 'string') return '';

    const page = String(context.pageNumber ?? 1);
    const total = String(context.totalPages ?? 1);
    const date = context.date || new Date().toISOString().slice(0, 10);
    const time = context.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fileName = context.fileName || 'document.pdf';
    const title = context.title || '';
    const author = context.author || '';

    return template
      .replace(/<<Page>>|\[Page\]|\{page\}|<<PAGE>>/gi, page)
      .replace(/<<TotalPages>>|\[TotalPages\]|\{totalPages\}|<<TOTALPAGES>>/gi, total)
      .replace(/<<Date>>|\[Date\]|\{date\}|<<DATE>>/gi, date)
      .replace(/<<Time>>|\[Time\]|\{time\}|<<TIME>>/gi, time)
      .replace(/<<FileName>>|\[FileName\]|\{fileName\}|<<FILENAME>>/gi, fileName)
      .replace(/<<Title>>|\[Title\]|\{title\}|<<TITLE>>/gi, title)
      .replace(/<<Author>>|\[Author\]|\{author\}|<<AUTHOR>>/gi, author);
  }

  /**
   * Parses page range rule and returns a function to check if page is included
   */
  static isPageIncluded(pageNumber, totalPages, rangeRule = 'all', skipFirst = false) {
    if (skipFirst && pageNumber === 1) return false;

    if (!rangeRule || rangeRule === 'all') return true;
    if (rangeRule === 'odd') return pageNumber % 2 !== 0;
    if (rangeRule === 'even') return pageNumber % 2 === 0;

    // Parse specific ranges like "2-5, 8, 10-12"
    const parts = String(rangeRule).split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && pageNumber >= start && pageNumber <= end) {
          return true;
        }
      } else {
        const single = parseInt(part, 10);
        if (!isNaN(single) && pageNumber === single) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Applies 6-zone headers and footers with macro interpolation to PDF document.
   */
  static async applyHeaderFooter(pdfBytes, config = {}, options = {}) {
    if (!pdfBytes) throw new Error('No PDF provided to apply header & footer');
    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const sourceDoc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
    const finalDoc = await PDFDocument.create();

    const totalPages = sourceDoc.getPageCount();

    // Typography configuration
    const fontFamilyName = config.fontFamily || 'Helvetica';
    let selectedFont;
    switch (fontFamilyName) {
      case 'TimesRoman':
      case 'Times-Roman':
        selectedFont = await finalDoc.embedFont(StandardFonts.TimesRoman);
        break;
      case 'Courier':
        selectedFont = await finalDoc.embedFont(StandardFonts.Courier);
        break;
      case 'HelveticaBold':
      case 'Helvetica-Bold':
        selectedFont = await finalDoc.embedFont(StandardFonts.HelveticaBold);
        break;
      case 'Helvetica':
      default:
        selectedFont = await finalDoc.embedFont(StandardFonts.Helvetica);
        break;
    }

    const fontSize = Math.max(6, Math.min(36, parseInt(config.fontSize, 10) || 10));

    // Color conversion
    const hexToRgb = (hex) => {
      const clean = (hex || '#334155').replace('#', '');
      const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
      return rgb(((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
    };
    const textColor = hexToRgb(config.color || '#334155');
    const dividerColor = hexToRgb(config.dividerColor || '#cbd5e1');

    // Margins (in points, 72 pt = 1 inch)
    const topMargin = Math.max(10, parseInt(config.topMargin, 10) || 36);
    const bottomMargin = Math.max(10, parseInt(config.bottomMargin, 10) || 36);
    const leftMargin = Math.max(10, parseInt(config.leftMargin, 10) || 36);
    const rightMargin = Math.max(10, parseInt(config.rightMargin, 10) || 36);

    const rangeRule = config.rangeRule || config.pageRange || 'all';
    const skipFirst = Boolean(config.skipFirst);
    const startNumber = parseInt(config.startNumber, 10) || 1;
    const hasHeaderDivider = Boolean(config.showHeaderDivider ?? config.hasHeaderDivider);
    const hasFooterDivider = Boolean(config.showFooterDivider ?? config.hasFooterDivider);

    const docTitle = sourceDoc.getTitle() || options.title || '';
    const docAuthor = sourceDoc.getAuthor() || options.author || '';
    const fileName = options.fileName || 'document.pdf';
    const customDate = config.customDate || new Date().toISOString().slice(0, 10);
    const customTime = config.customTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let stampedPagesCount = 0;

    for (let i = 0; i < totalPages; i++) {
      const [page] = await finalDoc.copyPages(sourceDoc, [i]);
      finalDoc.addPage(page);

      const pageNumber = i + 1;
      const displayPageNumber = (startNumber - 1) + pageNumber;

      if (!this.isPageIncluded(pageNumber, totalPages, rangeRule, skipFirst)) {
        continue;
      }

      stampedPagesCount++;
      const { width: pWidth, height: pHeight } = page.getSize();

      const context = {
        pageNumber: displayPageNumber,
        totalPages,
        date: customDate,
        time: customTime,
        fileName,
        title: docTitle,
        author: docAuthor
      };

      // 1. Headers (Top)
      const headerY = pHeight - topMargin - fontSize;

      // Left Header
      if (config.leftHeader) {
        const text = this.interpolateMacros(config.leftHeader, context);
        if (text) {
          page.drawText(text, {
            x: leftMargin,
            y: headerY,
            size: fontSize,
            font: selectedFont,
            color: textColor
          });
        }
      }

      // Center Header
      if (config.centerHeader) {
        const text = this.interpolateMacros(config.centerHeader, context);
        if (text) {
          const textWidth = selectedFont.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: (pWidth - textWidth) / 2,
            y: headerY,
            size: fontSize,
            font: selectedFont,
            color: textColor
          });
        }
      }

      // Right Header
      if (config.rightHeader) {
        const text = this.interpolateMacros(config.rightHeader, context);
        if (text) {
          const textWidth = selectedFont.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: pWidth - rightMargin - textWidth,
            y: headerY,
            size: fontSize,
            font: selectedFont,
            color: textColor
          });
        }
      }

      // Header Divider Line
      if (hasHeaderDivider && (config.leftHeader || config.centerHeader || config.rightHeader)) {
        page.drawLine({
          start: { x: leftMargin, y: headerY - 6 },
          end: { x: pWidth - rightMargin, y: headerY - 6 },
          thickness: 0.75,
          color: dividerColor
        });
      }

      // 2. Footers (Bottom)
      const footerY = bottomMargin;

      // Left Footer
      if (config.leftFooter) {
        const text = this.interpolateMacros(config.leftFooter, context);
        if (text) {
          page.drawText(text, {
            x: leftMargin,
            y: footerY,
            size: fontSize,
            font: selectedFont,
            color: textColor
          });
        }
      }

      // Center Footer
      if (config.centerFooter) {
        const text = this.interpolateMacros(config.centerFooter, context);
        if (text) {
          const textWidth = selectedFont.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: (pWidth - textWidth) / 2,
            y: footerY,
            size: fontSize,
            font: selectedFont,
            color: textColor
          });
        }
      }

      // Right Footer
      if (config.rightFooter) {
        const text = this.interpolateMacros(config.rightFooter, context);
        if (text) {
          const textWidth = selectedFont.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: pWidth - rightMargin - textWidth,
            y: footerY,
            size: fontSize,
            font: selectedFont,
            color: textColor
          });
        }
      }

      // Footer Divider Line
      if (hasFooterDivider && (config.leftFooter || config.centerFooter || config.rightFooter)) {
        page.drawLine({
          start: { x: leftMargin, y: footerY + fontSize + 6 },
          end: { x: pWidth - rightMargin, y: footerY + fontSize + 6 },
          thickness: 0.75,
          color: dividerColor
        });
      }
    }

    const updatedBytes = await finalDoc.save({ updateProperties: false });
    updatedBytes.bytes = updatedBytes;
    updatedBytes.pdfBytes = updatedBytes;
    updatedBytes.appliedCount = stampedPagesCount;
    updatedBytes.totalPages = totalPages;
    updatedBytes.zones = {
      leftHeader: config.leftHeader || '',
      centerHeader: config.centerHeader || '',
      rightHeader: config.rightHeader || '',
      leftFooter: config.leftFooter || '',
      centerFooter: config.centerFooter || '',
      rightFooter: config.rightFooter || ''
    };
    updatedBytes.report = {
      totalPages,
      appliedCount: stampedPagesCount,
      stampedPagesCount,
      rangeRule,
      skipFirst,
      zones: updatedBytes.zones,
      appliedZones: [
        config.leftHeader ? 'leftHeader' : null,
        config.centerHeader ? 'centerHeader' : null,
        config.rightHeader ? 'rightHeader' : null,
        config.leftFooter ? 'leftFooter' : null,
        config.centerFooter ? 'centerFooter' : null,
        config.rightFooter ? 'rightFooter' : null
      ].filter(Boolean)
    };

    return updatedBytes;
  }

  /**
   * Generates a sample 4-page PDF document ideal for header & footer exploration.
   */
  static async createSampleHeaderFooterPdf() {
    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const pagesData = [
      {
        isCover: true,
        title: 'GLOBAL ANNUAL ENTERPRISE REPORT',
        subtitle: 'Confidential Client Architecture & Standards Compliance 2026',
        desc: 'Page 1 acts as a formal document cover sheet (often excluded from headers/footers).'
      },
      {
        isCover: false,
        title: 'EXECUTIVE OVERVIEW',
        subtitle: 'Section 1: Operational Performance & Metrics',
        desc: 'Detailed summary of automated document workflows and client-side processing metrics.'
      },
      {
        isCover: false,
        title: 'SYSTEM ARCHITECTURE',
        subtitle: 'Section 2: PDF ISO 32000-1 Standards Engine',
        desc: 'Analysis of indirect object streams, multi-zone coordinate geometry, and macro interpolation.'
      },
      {
        isCover: false,
        title: 'APPENDIX & AUDIT TRAIL',
        subtitle: 'Section 3: Cryptographic Verification Logs',
        desc: 'Tamper-evident verification, eIDAS compliance, and digital signing audit logs.'
      }
    ];

    for (let idx = 0; idx < pagesData.length; idx++) {
      const data = pagesData[idx];
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      if (data.isCover) {
        page.drawRectangle({
          x: 0,
          y: height - 160,
          width,
          height: 160,
          color: rgb(0.12, 0.16, 0.28)
        });

        page.drawText(data.title, {
          x: 40,
          y: height - 80,
          size: 18,
          font: fontBold,
          color: rgb(1, 1, 1)
        });

        page.drawText(data.subtitle, {
          x: 40,
          y: height - 115,
          size: 12,
          font,
          color: rgb(0.8, 0.88, 1)
        });
      } else {
        page.drawRectangle({
          x: 0,
          y: height - 100,
          width,
          height: 100,
          color: rgb(0.94, 0.96, 0.98)
        });

        page.drawText(data.title, {
          x: 40,
          y: height - 55,
          size: 16,
          font: fontBold,
          color: rgb(0.1, 0.15, 0.3)
        });

        page.drawText(data.subtitle, {
          x: 40,
          y: height - 80,
          size: 11,
          font,
          color: rgb(0.35, 0.4, 0.5)
        });
      }

      page.drawText(data.desc, {
        x: 40,
        y: height - 200,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2)
      });

      page.drawText('Header & Footer Feature Capabilities:', {
        x: 40,
        y: height - 260,
        size: 12,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });

      const bullets = [
        '• Left, Center, and Right alignment for both Header and Footer zones.',
        '• Dynamic macros: <<Page>>, <<TotalPages>>, <<Date>>, <<Time>>, and <<FileName>>.',
        '• "Skip Cover Page" feature skips Page 1 while numbering Page 2 onwards.',
        '• Fine-tuned margins from Top, Bottom, Left, and Right borders.'
      ];

      bullets.forEach((b, i) => {
        page.drawText(b, {
          x: 45,
          y: height - 290 - (i * 26),
          size: 11,
          font,
          color: rgb(0.35, 0.35, 0.35)
        });
      });
    }

    doc.setTitle('Enterprise Technical Architecture Report 2026');
    doc.setAuthor('Antigravity PDF Core Team');

    return await doc.save({ updateProperties: false });
  }
}
