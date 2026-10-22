/**
 * Transform Operations Sub-Module
 * Handles Grayscale desaturation (DeviceGray), page margin resizing with standard bounds,
 * and cross-reference stream compression (PDF 1.5+ object streams).
 */

import { PDFDocument, PDFName, rgb } from 'pdf-lib';
import { decompressStreamBytes } from '../pdf-redactor.js';
import { hexToRgb } from '../../utils/helpers.js';

export class TransformOperations {
  /**
   * Resizes page margins or bounds per Sejda's Resize PDF tool.
   */
  static async resizePdfMargins(pdfBytes, options = {}) {
    const {
      marginTop = 0,
      marginRight = 0,
      marginBottom = 0,
      marginLeft = 0,
      pageSize = 'original',
      backgroundColor = '#ffffff'
    } = options;

    const srcDoc = await PDFDocument.load(pdfBytes);
    const newDoc = await PDFDocument.create();
    const pageCount = srcDoc.getPageCount();

    const STANDARD_SIZES = {
      a4: [595.28, 841.89],
      letter: [612.0, 792.0],
      legal: [612.0, 1008.0]
    };

    const { r, g, b } = hexToRgb(backgroundColor || '#ffffff');
    const bgCol = rgb(r / 255, g / 255, b / 255);

    for (let i = 0; i < pageCount; i++) {
      const srcPage = srcDoc.getPage(i);
      const { width: origWidth, height: origHeight } = srcPage.getSize();

      if (!srcPage.node.get(PDFName.of('Contents'))) {
        srcPage.node.set(PDFName.of('Contents'), srcDoc.context.register(srcDoc.context.stream('')));
      }

      let newWidth, newHeight, drawX, drawY, drawW, drawH;

      if (pageSize !== 'original' && STANDARD_SIZES[pageSize.toLowerCase()]) {
        [newWidth, newHeight] = STANDARD_SIZES[pageSize.toLowerCase()];
        const availableW = Math.max(10, newWidth - (Number(marginLeft) + Number(marginRight)));
        const availableH = Math.max(10, newHeight - (Number(marginTop) + Number(marginBottom)));
        const scale = Math.min(availableW / origWidth, availableH / origHeight, 1.0);
        drawW = origWidth * scale;
        drawH = origHeight * scale;
        drawX = Number(marginLeft) + (availableW - drawW) / 2;
        drawY = Number(marginBottom) + (availableH - drawH) / 2;
      } else {
        newWidth = origWidth + Number(marginLeft) + Number(marginRight);
        newHeight = origHeight + Number(marginTop) + Number(marginBottom);
        drawX = Number(marginLeft);
        drawY = Number(marginBottom);
        drawW = origWidth;
        drawH = origHeight;
      }

      const embedded = await newDoc.embedPage(srcPage);
      const newPage = newDoc.addPage([newWidth, newHeight]);
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: newWidth,
        height: newHeight,
        color: bgCol
      });
      newPage.drawPage(embedded, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });
    }

    return await newDoc.save({ updateMetadata: false });
  }

  /**
   * Compresses PDF documents via cross-reference object stream compression and metadata optimization.
   */
  static async compressPdf(pdfBytes, options = {}) {
    const originalSize = pdfBytes.byteLength || pdfBytes.length;
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    if (options.removeMetadata) {
      doc.context.trailerInfo.Info = undefined;
    }

    const compressedBytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateMetadata: false
    });

    let finalBytes = compressedBytes;
    let finalSize = compressedBytes.byteLength || compressedBytes.length;

    if (finalSize > originalSize && !options.removeMetadata) {
      finalBytes = new Uint8Array(pdfBytes);
      finalSize = originalSize;
    }

    const savings = Math.max(0, originalSize - finalSize);
    const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

    return {
      bytes: finalBytes,
      originalSize,
      compressedSize: finalSize,
      savingsPercent
    };
  }

  /**
   * Converts a PDF to monochrome grayscale per Sejda Grayscale tool specifications.
   */
  static async convertToGrayscale(pdfBytes) {
    const doc = await PDFDocument.load(pdfBytes);
    const count = doc.getPageCount();

    for (let i = 0; i < count; i++) {
      const page = doc.getPage(i);
      const contents = page.node.Contents();
      if (!contents) continue;

      const streamRefs = [];
      if (contents.asArray) {
        const arr = contents.asArray();
        for (let j = 0; j < arr.length; j++) streamRefs.push(contents.get(j));
      } else if (contents.size) {
        for (let j = 0; j < contents.size(); j++) streamRefs.push(contents.get(j));
      } else {
        streamRefs.push(contents);
      }

      for (const ref of streamRefs) {
        const stream = doc.context.lookup(ref);
        if (!stream || !stream.getContents) continue;

        const rawBytes = stream.getContents();
        const decompressed = await decompressStreamBytes(rawBytes);
        const text = new TextDecoder('latin1').decode(decompressed);

        // Replace RGB fill (r g b rg) with DeviceGray (lum g)
        let converted = text.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+rg\b/g, (match, r, g, b) => {
          const lum = Math.min(1, Math.max(0, 0.299 * parseFloat(r) + 0.587 * parseFloat(g) + 0.114 * parseFloat(b)));
          return `${lum.toFixed(3)} g`;
        });

        // Replace RGB stroke (r g b RG) with DeviceGray (lum G)
        converted = converted.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+RG\b/g, (match, r, g, b) => {
          const lum = Math.min(1, Math.max(0, 0.299 * parseFloat(r) + 0.587 * parseFloat(g) + 0.114 * parseFloat(b)));
          return `${lum.toFixed(3)} G`;
        });

        // Replace CMYK fill (c m y k k) with DeviceGray
        converted = converted.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+k\b/g, (match, c, m, y, k) => {
          const lum = Math.min(1, Math.max(0, 1 - Math.min(1, parseFloat(c) * (1 - parseFloat(k)) + parseFloat(k))));
          return `${lum.toFixed(3)} g`;
        });

        // Replace CMYK stroke (c m y k K) with DeviceGray
        converted = converted.replace(/([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+K\b/g, (match, c, m, y, k) => {
          const lum = Math.min(1, Math.max(0, 1 - Math.min(1, parseFloat(c) * (1 - parseFloat(k)) + parseFloat(k))));
          return `${lum.toFixed(3)} G`;
        });

        if (converted !== text) {
          const newStream = doc.context.flateStream(new TextEncoder().encode(converted));
          doc.context.assign(ref, newStream);
        }
      }
    }

    return await doc.save({ updateMetadata: false });
  }
}
