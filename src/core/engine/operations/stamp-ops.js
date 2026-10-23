/**
 * Stamping, Page Numbering & Signature Operations
 * Handles legal Bates numbering, customizable page numbering tokens, and electronic signatures.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class StampOps {
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
