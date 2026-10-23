/**
 * Merge & Page Organization Operations
 * Handles appending blank pages, merging external PDFs, multi-document batch merge,
 * and page reordering/rotation/deletion.
 */

import { PDFDocument, degrees } from 'pdf-lib';

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
   * Merges multiple independent PDF buffers into one document.
   */
  static async mergePdf(fileList) {
    if (!Array.isArray(fileList) || fileList.length === 0) {
      throw new Error('No files provided to merge');
    }
    const finalDoc = await PDFDocument.create();
    for (const item of fileList) {
      const bytes = item.bytes || item;
      const u8 = new Uint8Array(bytes);
      // Check if PDF (starts with %PDF: 0x25, 0x50, 0x44, 0x46)
      const isPdf = u8.length >= 4 && u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46;
      if (isPdf) {
        const doc = await PDFDocument.load(bytes);
        const pages = await finalDoc.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => finalDoc.addPage(p));
      } else {
        // Embed image file (PNG or JPG/JPEG)
        const isJpg = (u8[0] === 0xFF && u8[1] === 0xD8) || (item.name && /\.(jpe?g)$/i.test(item.name));
        let embeddedImg;
        try {
          embeddedImg = isJpg ? await finalDoc.embedJpg(bytes) : await finalDoc.embedPng(bytes);
        } catch {
          // Fallback try opposite format if header mismatched
          embeddedImg = isJpg ? await finalDoc.embedPng(bytes) : await finalDoc.embedJpg(bytes);
        }
        const pageW = 595.28; // Standard A4 width
        const pageH = 841.89; // Standard A4 height
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
      }
    }
    return await finalDoc.save();
  }

  /**
   * Reorders, deletes, and rotates pages in a PDF document according to pageList.
   * pageList: Array of page descriptors:
   *   - number (0-indexed page index from original document)
   *   - object: { index: number, rotation?: number }
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
