/**
 * PDF Engine: PDF.js rendering & PDF-Lib compilation
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { hexToRgb } from '../utils/helpers.js';

// Setup PDF.js worker
const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export class PdfEngine {
  constructor() {
    this.pdfDoc = null;
    this.rawBytes = null;
  }

  async loadPdf(arrayBuffer) {
    this.rawBytes = arrayBuffer;
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
      cMapPacked: true
    });
    this.pdfDoc = await loadingTask.promise;
    return {
      numPages: this.pdfDoc.numPages,
      doc: this.pdfDoc
    };
  }

  async createSamplePdf() {
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Page 1: Sample Document
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page1.getSize();

    page1.drawText('Sample PDF Contract & Document', {
      x: 50,
      y: height - 80,
      size: 22,
      font: helveticaBold,
      color: rgb(0.12, 0.44, 0.72)
    });

    page1.drawText('Welcome to the next-generation Online PDF Editor.', {
      x: 50,
      y: height - 110,
      size: 13,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });

    // Content section
    const lines = [
      'This document is ready for interactive editing. You can test all core features:',
      '1. Text Editing: Click on any existing text above or below to edit, or add new text.',
      '2. Redaction / Whiteout: Mask sensitive details with opaque whiteout boxes.',
      '3. Annotate & Draw: Sketch freehand notes or highlight key clauses with the pen.',
      '4. Shapes & Lines: Insert rectangles, circles, or directional arrows.',
      '5. Signatures: Place electronic signatures using typing, drawing, or image upload.',
      '6. Form Controls: Add interactive text input fields and checkboxes.',
      '7. Page Controls: Use the left sidebar to rotate, reorder, or delete pages.'
    ];

    let yPos = height - 160;
    for (const line of lines) {
      page1.drawText(line, {
        x: 50,
        y: yPos,
        size: 11,
        font: times,
        color: rgb(0.2, 0.2, 0.2)
      });
      yPos -= 28;
    }

    // Add a decorative box
    page1.drawRectangle({
      x: 50,
      y: height - 480,
      width: width - 100,
      height: 70,
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
      color: rgb(0.96, 0.98, 1.0)
    });

    page1.drawText('Section 4: Agreement & Signatures', {
      x: 65,
      y: height - 440,
      size: 12,
      font: helveticaBold,
      color: rgb(0.15, 0.2, 0.3)
    });

    page1.drawText('Both parties agree to execute this agreement electronically.', {
      x: 65,
      y: height - 460,
      size: 10,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4)
    });

    // Signature Area
    page1.drawText('Authorized Signature:', {
      x: 50,
      y: height - 580,
      size: 11,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3)
    });

    page1.drawLine({
      start: { x: 50, y: height - 640 },
      end: { x: 250, y: height - 640 },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6)
    });

    page1.drawText('Date: ____________________', {
      x: 320,
      y: height - 640,
      size: 11,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });

    // Page 2: Second page for multi-page demo
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    page2.drawText('Page 2: Terms & Conditions Exhibit', {
      x: 50,
      y: height - 80,
      size: 18,
      font: helveticaBold,
      color: rgb(0.15, 0.2, 0.3)
    });

    page2.drawText('Detailed Terms and Policy Information:', {
      x: 50,
      y: height - 120,
      size: 12,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer;
  }

  async getPage(pageNum) {
    if (!this.pdfDoc) throw new Error('No PDF loaded');
    return await this.pdfDoc.getPage(pageNum);
  }

  async renderPageToCanvas(page, canvas, scale = 1.0, rotation = 0) {
    const totalRotation = (page.rotate + rotation) % 360;
    const viewport = page.getViewport({ scale, rotation: totalRotation });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    return viewport;
  }

  async extractTextItems(page, scale = 1.0, rotation = 0) {
    const totalRotation = (page.rotate + rotation) % 360;
    const viewport = page.getViewport({ scale, rotation: totalRotation });
    const textContent = await page.getTextContent();
    return {
      items: textContent.items,
      viewport
    };
  }

  async appendBlankPage(width = 595.28, height = 841.89) {
    if (!this.rawBytes) throw new Error('No PDF loaded');
    const doc = await PDFDocument.load(this.rawBytes);
    doc.addPage([width, height]);
    const newBytes = await doc.save();
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  async mergeExternalPdf(externalBytes) {
    if (!this.rawBytes) throw new Error('No PDF loaded');
    const primaryDoc = await PDFDocument.load(this.rawBytes);
    const extDoc = await PDFDocument.load(externalBytes);
    const pages = await primaryDoc.copyPages(extDoc, extDoc.getPageIndices());
    pages.forEach(p => primaryDoc.addPage(p));
    const newBytes = await primaryDoc.save();
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  /**
   * Compiles all edits back into a vector PDF file using pdf-lib.
   */
  async exportPdf(state) {
    if (!this.rawBytes) throw new Error('No source PDF to export');

    const sourceDoc = await PDFDocument.load(this.rawBytes);
    const finalDoc = await PDFDocument.create();

    const helvetica = await finalDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await finalDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await finalDoc.embedFont(StandardFonts.TimesRoman);
    const courier = await finalDoc.embedFont(StandardFonts.Courier);

    const fontMap = {
      Helvetica: helvetica,
      HelveticaBold: helveticaBold,
      TimesRoman: timesRoman,
      Courier: courier
    };

    const numSourcePages = sourceDoc.getPageCount();

    // Determine target page sequence from pageOrder
    const targetOrder = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder.filter(p => !state.deletedPages.has(p) && p <= numSourcePages)
      : Array.from({ length: numSourcePages }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));

    const totalPages = targetOrder.length;

    for (let outIdx = 0; outIdx < totalPages; outIdx++) {
      const origPage = targetOrder[outIdx];
      const [copiedPage] = await finalDoc.copyPages(sourceDoc, [origPage - 1]);
      finalDoc.addPage(copiedPage);

      const { width: pWidth, height: pHeight } = copiedPage.getSize();

      // Apply rotation if any
      const addRotation = state.pageRotations[origPage] || 0;
      if (addRotation !== 0) {
        const curRot = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees((curRot + addRotation) % 360));
      }

      // Get annotations for this page
      const annotations = state.annotations[origPage] || [];

      for (const ann of annotations) {
        const pdfX = ann.x * pWidth;
        const pdfY = pHeight - (ann.y * pHeight) - (ann.height * pHeight);
        const pdfW = ann.width * pWidth;
        const pdfH = ann.height * pHeight;

        if (ann.type === 'whiteout') {
          copiedPage.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH,
            color: rgb(1, 1, 1),
            borderWidth: 0
          });
        } else if (ann.type === 'text') {
          if (ann.hasUnderlay) {
            copiedPage.drawRectangle({
              x: pdfX - 2,
              y: pdfY - 2,
              width: pdfW + 4,
              height: pdfH + 4,
              color: rgb(1, 1, 1),
              borderWidth: 0
            });
          }

          const font = fontMap[ann.fontFamily] || helvetica;
          const { r, g, b } = hexToRgb(ann.color || '#000000');
          const fontSize = (ann.fontSize || 14) * (pWidth / 600);

          copiedPage.drawText(ann.text || '', {
            x: pdfX,
            y: pdfY + (pdfH * 0.2),
            size: fontSize,
            font: font,
            color: rgb(r / 255, g / 255, b / 255)
          });
        } else if (ann.type === 'shape') {
          const { r: sr, g: sg, b: sb } = hexToRgb(ann.strokeColor || '#000000');
          const hasFill = ann.fillColor && ann.fillColor !== 'transparent';
          const fill = hasFill ? hexToRgb(ann.fillColor) : null;

          if (ann.shapeType === 'rectangle') {
            copiedPage.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: pdfW,
              height: pdfH,
              borderColor: rgb(sr / 255, sg / 255, sb / 255),
              borderWidth: ann.strokeWidth || 2,
              color: fill ? rgb(fill.r / 255, fill.g / 255, fill.b / 255) : undefined
            });
          } else if (ann.shapeType === 'ellipse') {
            copiedPage.drawEllipse({
              x: pdfX + (pdfW / 2),
              y: pdfY + (pdfH / 2),
              xScale: pdfW / 2,
              yScale: pdfH / 2,
              borderColor: rgb(sr / 255, sg / 255, sb / 255),
              borderWidth: ann.strokeWidth || 2,
              color: fill ? rgb(fill.r / 255, fill.g / 255, fill.b / 255) : undefined
            });
          } else if (ann.shapeType === 'line') {
            copiedPage.drawLine({
              start: { x: pdfX, y: pdfY + pdfH },
              end: { x: pdfX + pdfW, y: pdfY },
              thickness: ann.strokeWidth || 2,
              color: rgb(sr / 255, sg / 255, sb / 255)
            });
          }
        } else if (ann.type === 'image' || ann.type === 'signature') {
          try {
            if (ann.dataUrl) {
              const imgBytes = await fetch(ann.dataUrl).then(r => r.arrayBuffer());
              let embeddedImg;
              if (ann.dataUrl.includes('image/jpeg') || ann.dataUrl.includes('image/jpg')) {
                embeddedImg = await finalDoc.embedJpg(imgBytes);
              } else {
                embeddedImg = await finalDoc.embedPng(imgBytes);
              }

              copiedPage.drawImage(embeddedImg, {
                x: pdfX,
                y: pdfY,
                width: pdfW,
                height: pdfH
              });
            }
          } catch (imgErr) {
            console.error('Failed to embed image in export:', imgErr);
          }
        } else if (ann.type === 'drawing') {
          if (ann.points && ann.points.length > 1) {
            const { r, g, b } = hexToRgb(ann.color || '#ff0000');
            const strokeColor = rgb(r / 255, g / 255, b / 255);
            const thickness = (ann.strokeWidth || 3) * (pWidth / 600);

            for (let i = 0; i < ann.points.length - 1; i++) {
              const pt1 = ann.points[i];
              const pt2 = ann.points[i + 1];
              copiedPage.drawLine({
                start: { x: pt1.x * pWidth, y: pHeight - (pt1.y * pHeight) },
                end: { x: pt2.x * pWidth, y: pHeight - (pt2.y * pHeight) },
                thickness,
                color: strokeColor,
                opacity: ann.isHighlighter ? 0.4 : 1.0
              });
            }
          }
        } else if (ann.type === 'form') {
          // Native Interactive AcroForm Fields
          try {
            const form = finalDoc.getForm();
            if (ann.formType === 'checkbox') {
              const cb = form.createCheckBox(`cb_${ann.id}`);
              cb.addToPage(copiedPage, { x: pdfX, y: pdfY, width: Math.max(16, pdfW), height: Math.max(16, pdfH) });
              if (ann.checked) cb.check();
            } else if (ann.formType === 'radio') {
              const radioGroup = form.createRadioGroup(`rg_${ann.groupName || 'default'}`);
              radioGroup.addOptionToPage(`opt_${ann.id}`, copiedPage, { x: pdfX, y: pdfY, width: Math.max(16, pdfW), height: Math.max(16, pdfH) });
              if (ann.checked) radioGroup.select(`opt_${ann.id}`);
            } else {
              const tf = form.createTextField(`tf_${ann.id}`);
              tf.addToPage(copiedPage, { x: pdfX, y: pdfY, width: pdfW, height: pdfH });
              if (ann.value) tf.setText(ann.value);
            }
          } catch (formErr) {
            console.error('Failed to create interactive AcroForm field:', formErr);
          }
        }
      }

      // Add Document-wide Watermark if configured
      if (state.watermark && state.watermark.text) {
        const wmColor = hexToRgb(state.watermark.color || '#94a3b8');
        copiedPage.drawText(state.watermark.text, {
          x: pWidth * 0.2,
          y: pHeight * 0.5,
          size: state.watermark.fontSize || 42,
          font: helveticaBold,
          color: rgb(wmColor.r / 255, wmColor.g / 255, wmColor.b / 255),
          opacity: state.watermark.opacity || 0.3,
          rotate: degrees(state.watermark.rotation || 45)
        });
      }

      // Add Header / Footer Page Numbers if configured
      if (state.pageNumbers) {
        const pnFormat = state.pageNumbers.format || 'Page {n} of {total}';
        const pnText = pnFormat.replace('{n}', (outIdx + 1).toString()).replace('{total}', totalPages.toString());
        const pnSize = 10;
        const pnWidth = helvetica.widthOfTextAtSize(pnText, pnSize);
        let pnX = (pWidth - pnWidth) / 2;
        let pnY = 25;

        if (state.pageNumbers.position === 'bottom-left') pnX = 36;
        else if (state.pageNumbers.position === 'bottom-right') pnX = pWidth - pnWidth - 36;
        else if (state.pageNumbers.position === 'top-center') pnY = pHeight - 35;
        else if (state.pageNumbers.position === 'top-left') { pnX = 36; pnY = pHeight - 35; }
        else if (state.pageNumbers.position === 'top-right') { pnX = pWidth - pnWidth - 36; pnY = pHeight - 35; }

        copiedPage.drawText(pnText, {
          x: pnX,
          y: pnY,
          size: pnSize,
          font: helvetica,
          color: rgb(0.35, 0.35, 0.35)
        });
      }
    }

    // Save with password encryption if configured
    if (state.exportPassword && state.exportPassword.userPassword) {
      return await finalDoc.save({
        userPassword: state.exportPassword.userPassword,
        ownerPassword: state.exportPassword.ownerPassword || state.exportPassword.userPassword
      });
    }

    return await finalDoc.save();
  }
}

export const pdfEngine = new PdfEngine();
