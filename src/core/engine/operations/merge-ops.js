/**
 * Merge & Page Organization Operations
 * Handles appending blank pages, merging external PDFs, multi-document batch merge,
 * Table of Contents (TOC) page generation, PDF bookmark outline trees (/Outlines),
 * cover page creation, continuous page numbering, and page reordering/rotation/deletion.
 */

import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, degrees } from 'pdf-lib';

export class MergeOps {
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
   * Inserts a blank page after the specified 0-indexed page index into rawBytes.
   */
  static async insertBlankPage(rawBytes, afterPageIndex = null, width = 595.28, height = 841.89) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const doc = await PDFDocument.load(rawBytes);
    const numPages = doc.getPageCount();
    const insertIdx = (afterPageIndex === null || afterPageIndex >= numPages - 1)
      ? numPages
      : Math.max(0, afterPageIndex + 1);
    doc.insertPage(insertIdx, [width, height]);
    return await doc.save();
  }

  /**
   * Duplicates a page at the specified 0-indexed page index in rawBytes.
   */
  static async duplicatePage(rawBytes, pageIndex) {
    if (!rawBytes) throw new Error('No PDF loaded');
    const doc = await PDFDocument.load(rawBytes);
    const numPages = doc.getPageCount();
    const idx = Math.max(0, Math.min(numPages - 1, pageIndex));
    const [copiedPage] = await doc.copyPages(doc, [idx]);
    doc.insertPage(idx + 1, copiedPage);
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
   * Standard merge delegating to mergePdfAdvanced.
   */
  static async mergePdf(fileList, options = {}) {
    return await this.mergePdfAdvanced(fileList, options);
  }

  /**
   * Advanced multi-document merge supporting:
   * - Table of Contents (TOC) page with dot leaders
   * - PDF Outline Bookmark tree (/Outlines)
   * - Cover Page with title & subtitle
   * - Continuous footer page numbering
   */
  static async mergePdfAdvanced(fileList, options = {}) {
    if (!Array.isArray(fileList) || fileList.length === 0) {
      throw new Error('No files provided to merge');
    }

    const finalDoc = await PDFDocument.create();
    const font = await finalDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await finalDoc.embedFont(StandardFonts.HelveticaBold);

    const generateToc = Boolean(options.generateToc);
    const includeBookmarks = options.includeBookmarks !== false;
    const addPageNumbers = Boolean(options.addPageNumbers);
    const addCoverPage = Boolean(options.addCoverPage);

    // Calculate preface page offset for accurate page numbers and destinations
    const docEntries = [];
    let prefacePageCount = 0;
    if (addCoverPage) prefacePageCount++;
    if (generateToc) prefacePageCount++;

    let runningPageNum = prefacePageCount + 1;

    for (let i = 0; i < fileList.length; i++) {
      const item = fileList[i];
      const bytes = item.bytes || item;
      const u8 = new Uint8Array(bytes);
      const isPdf = u8.length >= 4 && u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46;

      const rawName = item.name || `Document_${i + 1}.pdf`;
      const docTitle = rawName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      const startPageIdx = finalDoc.getPageCount();

      if (isPdf) {
        const doc = await PDFDocument.load(bytes);
        const pages = await finalDoc.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => finalDoc.addPage(p));
        docEntries.push({
          title: docTitle,
          targetPageNum: runningPageNum,
          startPageIdx: startPageIdx + prefacePageCount,
          pageCount: pages.length
        });
        runningPageNum += pages.length;
      } else {
        // Embed image file (PNG or JPG/JPEG)
        const isJpg = (u8[0] === 0xFF && u8[1] === 0xD8) || (item.name && /\.(jpe?g)$/i.test(item.name));
        let embeddedImg;
        try {
          embeddedImg = isJpg ? await finalDoc.embedJpg(bytes) : await finalDoc.embedPng(bytes);
        } catch {
          embeddedImg = isJpg ? await finalDoc.embedPng(bytes) : await finalDoc.embedJpg(bytes);
        }
        const pageW = 595.28;
        const pageH = 841.89;
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
        docEntries.push({
          title: docTitle,
          targetPageNum: runningPageNum,
          startPageIdx: startPageIdx + prefacePageCount,
          pageCount: 1
        });
        runningPageNum += 1;
      }

      if (typeof options.onProgress === 'function') {
        options.onProgress({
          current: i + 1,
          total: fileList.length,
          item,
          percent: Math.round(((i + 1) / fileList.length) * 100)
        });
      }
    }

    // Insert Table of Contents if requested
    if (generateToc) {
      const tocPage = finalDoc.insertPage(addCoverPage ? 1 : 0, [595.28, 841.89]);
      const { width, height } = tocPage.getSize();

      // Top decorative header banner
      tocPage.drawRectangle({
        x: 0,
        y: height - 10,
        width,
        height: 10,
        color: rgb(0.188, 0.02, 0.051) // brand primary #30050d
      });

      const tocTitle = options.tocTitle || 'Table of Contents';
      tocPage.drawText(tocTitle, {
        x: 50,
        y: height - 65,
        size: 22,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });

      tocPage.drawLine({
        start: { x: 50, y: height - 80 },
        end: { x: width - 50, y: height - 80 },
        thickness: 1.5,
        color: rgb(0.85, 0.85, 0.85)
      });

      let lineY = height - 115;
      for (let idx = 0; idx < docEntries.length && lineY > 60; idx++) {
        const entry = docEntries[idx];
        const numLabel = `${idx + 1}.`;
        const titleText = entry.title.length > 40 ? entry.title.substring(0, 37) + '...' : entry.title;
        const pageLabel = `Page ${entry.targetPageNum}`;

        tocPage.drawText(numLabel, { x: 50, y: lineY, size: 10.5, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
        tocPage.drawText(titleText, { x: 70, y: lineY, size: 10.5, font, color: rgb(0.1, 0.1, 0.1) });

        const titleWidth = font.widthOfTextAtSize(titleText, 10.5);
        const pageWidth = font.widthOfTextAtSize(pageLabel, 10.5);
        const dotStart = 75 + titleWidth + 6;
        const dotEnd = width - 50 - pageWidth - 8;

        if (dotEnd > dotStart) {
          const dots = '.'.repeat(Math.floor((dotEnd - dotStart) / 4));
          tocPage.drawText(dots, { x: dotStart, y: lineY, size: 10, font, color: rgb(0.65, 0.65, 0.65) });
        }

        tocPage.drawText(pageLabel, { x: width - 50 - pageWidth, y: lineY, size: 10.5, font: fontBold, color: rgb(0.188, 0.02, 0.051) });
        lineY -= 26;
      }
    }

    // Insert Cover Page if requested
    if (addCoverPage) {
      const coverPage = finalDoc.insertPage(0, [595.28, 841.89]);
      const { width, height } = coverPage.getSize();

      coverPage.drawRectangle({
        x: 0,
        y: height - 180,
        width,
        height: 180,
        color: rgb(0.188, 0.02, 0.051)
      });

      const coverTitle = options.coverTitle || 'Combined Document Package';
      const coverSubtitle = options.coverSubtitle || 'Compiled with LetsEdit PDF Studio';
      const coverAuthor = options.coverAuthor || 'PDF Studio Document Engine';

      coverPage.drawText(coverTitle, {
        x: 50,
        y: height - 90,
        size: 24,
        font: fontBold,
        color: rgb(1, 1, 1)
      });

      coverPage.drawText(coverSubtitle, {
        x: 50,
        y: height - 125,
        size: 13,
        font,
        color: rgb(0.9, 0.85, 0.85)
      });

      coverPage.drawText(`Date Compiled: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 80,
        size: 10,
        font,
        color: rgb(0.45, 0.45, 0.45)
      });
      coverPage.drawText(`Prepared By: ${coverAuthor}`, {
        x: 50,
        y: 65,
        size: 10,
        font,
        color: rgb(0.45, 0.45, 0.45)
      });
    }

    // Inject PDF Outline Bookmarks
    if (includeBookmarks && docEntries.length > 0) {
      try {
        const allPages = finalDoc.getPages();
        const ctx = finalDoc.context;
        const outlinesDict = ctx.obj({
          Type: 'Outlines',
          Count: docEntries.length
        });
        const outlinesRef = ctx.register(outlinesDict);
        finalDoc.catalog.set(PDFName.of('Outlines'), outlinesRef);

        const itemRefs = docEntries.map(() => ctx.nextRef());

        for (let i = 0; i < docEntries.length; i++) {
          const entry = docEntries[i];
          const targetPageIndex = Math.min(entry.startPageIdx, allPages.length - 1);
          const targetPage = allPages[targetPageIndex];

          const itemObj = {
            Title: PDFString.of(entry.title),
            Parent: outlinesRef,
            Dest: [targetPage.ref, PDFName.of('Fit')]
          };

          if (i > 0) itemObj.Prev = itemRefs[i - 1];
          if (i < docEntries.length - 1) itemObj.Next = itemRefs[i + 1];

          ctx.assign(itemRefs[i], ctx.obj(itemObj));
        }

        outlinesDict.set(PDFName.of('First'), itemRefs[0]);
        outlinesDict.set(PDFName.of('Last'), itemRefs[itemRefs.length - 1]);
      } catch (bookmarkErr) {
        console.warn('PDF Outline bookmark generation skipped:', bookmarkErr);
      }
    }

    // Continuous page numbering
    if (addPageNumbers) {
      const allPages = finalDoc.getPages();
      const totalPages = allPages.length;
      const startNumberingIndex = prefacePageCount;

      for (let i = startNumberingIndex; i < totalPages; i++) {
        const page = allPages[i];
        const { width } = page.getSize();
        const pageLabel = `Page ${i + 1 - startNumberingIndex} of ${totalPages - startNumberingIndex}`;
        const labelWidth = font.widthOfTextAtSize(pageLabel, 9);
        page.drawText(pageLabel, {
          x: (width - labelWidth) / 2,
          y: 20,
          size: 9,
          font,
          color: rgb(0.35, 0.35, 0.35)
        });
      }
    }

    return await finalDoc.save();
  }

  /**
   * Reorders, deletes, and rotates pages in a PDF document according to pageList.
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
