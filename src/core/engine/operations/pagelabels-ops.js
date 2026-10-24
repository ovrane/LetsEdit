/**
 * Advanced PDF Page Labels & Multi-Section Pagination Engine
 * Implements ISO 32000-1 Clause 12.4.2 (Page Labels):
 * - Direct construction & inspection of the /Catalog /PageLabels Number Tree (/Nums)
 * - Numbering Scheme styles:
 *   - /D : Decimal Arabic numerals (1, 2, 3...)
 *   - /R : Uppercase Roman numerals (I, II, III...)
 *   - /r : Lowercase Roman numerals (i, ii, iii...)
 *   - /A : Uppercase letters (A, B, C... Z, AA, BB...)
 *   - /a : Lowercase letters (a, b, c... z, aa, bb...)
 * - Custom prefixes (/P e.g., "Sec. ", "Appendix ", "Vol-1 ")
 * - Starting numbers (/St)
 * - Optional visual header/footer stamping with synchronized formatting
 */

import { PDFDocument, PDFName, PDFNumber, PDFString, PDFDict, PDFArray, StandardFonts, rgb } from 'pdf-lib';

/**
 * Converts integer (1-indexed) to Roman numeral string
 */
export function toRoman(num, uppercase = false) {
  if (num <= 0 || !Number.isInteger(num)) return String(num);
  const lookup = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let roman = '';
  let n = num;
  for (const [letter, value] of lookup) {
    while (n >= value) {
      roman += letter;
      n -= value;
    }
  }
  return uppercase ? roman : roman.toLowerCase();
}

/**
 * Converts integer (1-indexed) to Alphabetic string (A, B... Z, AA, BB...)
 */
export function toAlpha(num, uppercase = false) {
  if (num <= 0 || !Number.isInteger(num)) return String(num);
  let result = '';
  let n = num;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode((uppercase ? 65 : 97) + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

/**
 * Formats a label given style, start number, and offset
 */
export function formatPageLabel(style = 'D', prefix = '', startAt = 1, indexOffset = 0) {
  const currentNumber = (startAt || 1) + indexOffset;
  let formattedNumber = String(currentNumber);

  switch (style) {
    case 'R':
      formattedNumber = toRoman(currentNumber, true);
      break;
    case 'r':
      formattedNumber = toRoman(currentNumber, false);
      break;
    case 'A':
      formattedNumber = toAlpha(currentNumber, true);
      break;
    case 'a':
      formattedNumber = toAlpha(currentNumber, false);
      break;
    case 'D':
    default:
      formattedNumber = String(currentNumber);
      break;
  }

  return `${prefix || ''}${formattedNumber}`;
}

export class PageLabelsOps {
  /**
   * Inspects existing /PageLabels number tree on the document catalog.
   */
  static async inspectPageLabels(pdfBytes) {
    if (!pdfBytes) throw new Error('No PDF provided to inspect page labels');
    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
    const totalPages = doc.getPageCount();

    const catalog = doc.catalog;
    const pageLabelsRef = catalog.get(PDFName.of('PageLabels'));

    if (!pageLabelsRef) {
      // Return default 1-to-N decimal scheme
      const defaultLabels = [];
      for (let i = 0; i < totalPages; i++) {
        defaultLabels.push({ pageIndex: i, pageNumber: i + 1, label: String(i + 1), sectionIndex: 0 });
      }
      return {
        hasPageLabels: false,
        totalPages,
        sections: [
          { fromPage: 1, toPage: totalPages, style: 'D', prefix: '', startAt: 1 }
        ],
        pageLabels: defaultLabels
      };
    }

    const pageLabelsDict = doc.context.lookup(pageLabelsRef);
    if (!(pageLabelsDict instanceof PDFDict)) {
      return { hasPageLabels: false, totalPages, sections: [], pageLabels: [] };
    }

    const numsArray = pageLabelsDict.get(PDFName.of('Nums'));
    if (!(numsArray instanceof PDFArray)) {
      return { hasPageLabels: false, totalPages, sections: [], pageLabels: [] };
    }

    const sections = [];
    const size = numsArray.size();

    for (let i = 0; i < size; i += 2) {
      const pageIndexObj = numsArray.get(i);
      const dictObj = numsArray.get(i + 1);

      const pageIndex = (pageIndexObj instanceof PDFNumber) ? pageIndexObj.asNumber() : Number(pageIndexObj);
      const dict = doc.context.lookup(dictObj);

      let style = 'D';
      let prefix = '';
      let startAt = 1;

      if (dict instanceof PDFDict) {
        const sObj = dict.get(PDFName.of('S'));
        if (sObj instanceof PDFName) {
          style = sObj.asString().replace(/^\//, '');
        }
        const pObj = dict.get(PDFName.of('P'));
        if (pObj instanceof PDFString) {
          prefix = pObj.asString();
        }
        const stObj = dict.get(PDFName.of('St'));
        if (stObj instanceof PDFNumber) {
          startAt = stObj.asNumber();
        }
      }

      sections.push({
        fromIndex: pageIndex,
        fromPage: pageIndex + 1,
        style,
        prefix,
        startAt
      });
    }

    // Sort sections by starting page index
    sections.sort((a, b) => a.fromIndex - b.fromIndex);

    // Compute toPage for each section
    for (let j = 0; j < sections.length; j++) {
      if (j < sections.length - 1) {
        sections[j].toPage = sections[j + 1].fromPage - 1;
      } else {
        sections[j].toPage = totalPages;
      }
    }

    // Generate computed labels for every single page
    const pageLabels = [];
    let curSecIdx = 0;

    for (let p = 0; p < totalPages; p++) {
      while (curSecIdx < sections.length - 1 && p >= sections[curSecIdx + 1].fromIndex) {
        curSecIdx++;
      }
      const sec = sections[curSecIdx] || { style: 'D', prefix: '', startAt: 1, fromIndex: 0 };
      const offset = p - (sec.fromIndex || 0);
      const label = formatPageLabel(sec.style, sec.prefix, sec.startAt, offset);

      pageLabels.push({
        pageIndex: p,
        pageNumber: p + 1,
        label,
        sectionIndex: curSecIdx
      });
    }

    return {
      hasPageLabels: true,
      totalPages,
      sections,
      pageLabels
    };
  }

  /**
   * Applies ISO 32000-1 /PageLabels Number Tree to document catalog and optionally stamps visual page numbers.
   */
  static async applyPageLabels(pdfBytes, sections = [], options = {}) {
    if (!pdfBytes) throw new Error('No PDF provided to apply page labels');
    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
    const totalPages = doc.getPageCount();

    if (!Array.isArray(sections) || sections.length === 0) {
      sections = [{ fromPage: 1, toPage: totalPages, style: 'D', prefix: '', startAt: 1 }];
    }

    // Normalize and sort sections
    const normalizedSections = sections.map((sec, idx) => {
      const fromPage = Math.max(1, Math.min(totalPages, parseInt(sec.fromPage, 10) || 1));
      const toPage = Math.max(fromPage, Math.min(totalPages, parseInt(sec.toPage, 10) || totalPages));
      const style = ['D', 'R', 'r', 'A', 'a'].includes(sec.style) ? sec.style : 'D';
      const prefix = String(sec.prefix || '');
      const startAt = Math.max(1, parseInt(sec.startAt, 10) || 1);
      return {
        fromIndex: fromPage - 1,
        fromPage,
        toPage,
        style,
        prefix,
        startAt,
        sectionIndex: idx
      };
    }).sort((a, b) => a.fromIndex - b.fromIndex);

    // 1. Build ISO 32000-1 /PageLabels Number Tree
    const numsArray = doc.context.obj([]);

    normalizedSections.forEach(sec => {
      // Key: page index (0-based)
      numsArray.push(PDFNumber.of(sec.fromIndex));

      // Value: Page Label Dictionary << /S /D /P (prefix) /St 1 >>
      const labelDict = doc.context.obj({
        S: PDFName.of(sec.style),
        St: PDFNumber.of(sec.startAt)
      });

      if (sec.prefix) {
        labelDict.set(PDFName.of('P'), PDFString.of(sec.prefix));
      }

      numsArray.push(labelDict);
    });

    const pageLabelsRoot = doc.context.obj({
      Nums: numsArray
    });

    const pageLabelsRef = doc.context.register(pageLabelsRoot);
    doc.catalog.set(PDFName.of('PageLabels'), pageLabelsRef);

    // 2. Optional visual stamping
    const stampVisual = Boolean(options.stampVisual);
    if (stampVisual) {
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const fontSize = parseFloat(options.fontSize) || 10;
      const position = options.position || 'bottom-center'; // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
      const fontColor = options.fontColor || { r: 0.2, g: 0.2, b: 0.2 };

      let curSecIdx = 0;
      for (let p = 0; p < totalPages; p++) {
        while (curSecIdx < normalizedSections.length - 1 && p >= normalizedSections[curSecIdx + 1].fromIndex) {
          curSecIdx++;
        }
        const sec = normalizedSections[curSecIdx];
        const offset = p - sec.fromIndex;
        const label = formatPageLabel(sec.style, sec.prefix, sec.startAt, offset);

        const page = doc.getPage(p);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const margin = 24;

        let x = width / 2 - textWidth / 2;
        let y = margin;

        if (position === 'top-left') {
          x = margin;
          y = height - margin;
        } else if (position === 'top-center') {
          x = width / 2 - textWidth / 2;
          y = height - margin;
        } else if (position === 'top-right') {
          x = width - margin - textWidth;
          y = height - margin;
        } else if (position === 'bottom-left') {
          x = margin;
          y = margin;
        } else if (position === 'bottom-center') {
          x = width / 2 - textWidth / 2;
          y = margin;
        } else if (position === 'bottom-right') {
          x = width - margin - textWidth;
          y = margin;
        }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(fontColor.r, fontColor.g, fontColor.b)
        });
      }
    }

    const updatedBytes = await doc.save({ updateProperties: false });
    updatedBytes.pdfBytes = updatedBytes;
    updatedBytes.sections = normalizedSections;
    return updatedBytes;
  }

  /**
   * Removes /PageLabels number tree from document catalog, reverting to default numbering.
   */
  static async removePageLabels(pdfBytes) {
    if (!pdfBytes) throw new Error('No PDF provided to remove page labels');
    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });

    if (doc.catalog.has(PDFName.of('PageLabels'))) {
      doc.catalog.delete(PDFName.of('PageLabels'));
    }

    const updatedBytes = await doc.save({ updateProperties: false });
    updatedBytes.pdfBytes = updatedBytes;
    return updatedBytes;
  }

  /**
   * Synthesizes a sample multi-section PDF document for 1-click test exploration:
   * - Section 1: Pages 1-2 with Lowercase Roman (i, ii) - Preface & Executive Summary
   * - Section 2: Pages 3-5 with Arabic Numerals (1, 2, 3) - Core Report Content
   */
  static async createSamplePageLabelsPdf() {
    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    // Page 1: Preface (i)
    const p1 = doc.addPage([500, 650]);
    p1.drawText('PREFACE & EXECUTIVE OVERVIEW', { x: 40, y: 580, size: 16, font: fontBold, color: rgb(0.18, 0.02, 0.05) });
    p1.drawText('This preliminary section demonstrates ISO 32000-1 Lowercase Roman Page Labeling (i).', { x: 40, y: 540, size: 11, font, color: rgb(0.25, 0.25, 0.25) });

    // Page 2: Table of Contents (ii)
    const p2 = doc.addPage([500, 650]);
    p2.drawText('TABLE OF CONTENTS', { x: 40, y: 580, size: 16, font: fontBold, color: rgb(0.18, 0.02, 0.05) });
    p2.drawText('Preface .............................................................. Page i', { x: 40, y: 540, size: 11, font, color: rgb(0.25, 0.25, 0.25) });
    p2.drawText('Chapter 1: Strategic Architecture ......................... Page 1', { x: 40, y: 510, size: 11, font, color: rgb(0.25, 0.25, 0.25) });

    // Page 3: Chapter 1 (1)
    const p3 = doc.addPage([500, 650]);
    p3.drawText('CHAPTER 1: STRATEGIC ARCHITECTURE', { x: 40, y: 580, size: 16, font: fontBold, color: rgb(0.05, 0.2, 0.4) });
    p3.drawText('The main body restarts at Arabic numeral 1 as configured in the /PageLabels dictionary.', { x: 40, y: 540, size: 11, font, color: rgb(0.25, 0.25, 0.25) });

    // Page 4: Chapter 1 Continued (2)
    const p4 = doc.addPage([500, 650]);
    p4.drawText('CHAPTER 1: IMPLEMENTATION METRICS', { x: 40, y: 580, size: 16, font: fontBold, color: rgb(0.05, 0.2, 0.4) });
    p4.drawText('Technical metrics and throughput analysis (Page 2 of body).', { x: 40, y: 540, size: 11, font, color: rgb(0.25, 0.25, 0.25) });

    // Page 5: Chapter 2 (3)
    const p5 = doc.addPage([500, 650]);
    p5.drawText('CHAPTER 2: PERFORMANCE VERIFICATION', { x: 40, y: 580, size: 16, font: fontBold, color: rgb(0.05, 0.2, 0.4) });
    p5.drawText('Benchmarking results against ISO 32000-1 specifications (Page 3 of body).', { x: 40, y: 540, size: 11, font, color: rgb(0.25, 0.25, 0.25) });

    const rawBytes = await doc.save({ updateProperties: false });

    // Apply Sections: Pages 1-2 -> Roman 'r' (i, ii); Pages 3-5 -> Decimal 'D' (1, 2, 3)
    const labeledBytes = await this.applyPageLabels(rawBytes, [
      { fromPage: 1, toPage: 2, style: 'r', prefix: '', startAt: 1 },
      { fromPage: 3, toPage: 5, style: 'D', prefix: '', startAt: 1 }
    ], { stampVisual: true, position: 'bottom-center' });

    return labeledBytes;
  }
}
