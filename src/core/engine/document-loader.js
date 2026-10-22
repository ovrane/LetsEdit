/**
 * Document Loader Sub-Module
 * Handles PDF.js worker setup, loading documents from ArrayBuffer/Uint8Array,
 * sample document generation, page rendering to canvas, and image blob rasterization.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configure PDF.js worker safely across browser and Node test runtimes
const workerSrc = typeof window !== 'undefined'
  ? new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  : '';
if (workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export class DocumentLoader {
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

    // Page 2: Terms & Conditions Exhibit
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

  async createBlankPdf() {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
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

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

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

  async renderPageToImageBlob(pageNum, dpiScale = 2.0, format = 'image/png') {
    if (!this.pdfDoc) throw new Error('No PDF loaded');
    const page = await this.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: dpiScale });
    if (typeof document === 'undefined') {
      return new Uint8Array(0);
    }
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    return new Promise(resolve => canvas.toBlob(resolve, format, 0.95));
  }
}
