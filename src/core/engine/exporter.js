/**
 * PDF Exporter Sub-Module
 * Compiles all edits, annotations, form controls, vector shapes, signatures,
 * watermarks, bates numbering, page numbers, content-stream redactions, and
 * standard ISO 32000-1 AES encryption back into a compliant PDF.
 */

import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFString } from 'pdf-lib';
import { hexToRgb } from '../../utils/helpers.js';
import { applyPdfEncryption } from '../pdf-crypto.js';
import { redactPageContentStreams } from '../pdf-redactor.js';

export class PdfExporter {
  /**
   * Compiles all edits back into a vector PDF file using pdf-lib.
   */
  static async exportPdf(rawBytes, state) {
    if (!rawBytes) throw new Error('No source PDF to export');

    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();

    const helvetica = await finalDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await finalDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await finalDoc.embedFont(StandardFonts.TimesRoman);
    const courier = await finalDoc.embedFont(StandardFonts.Courier);

    const fontMap = {
      Helvetica: helvetica,
      HelveticaBold: helveticaBold,
      TimesRoman: timesRoman,
      Courier: courier,
      Roboto: helvetica,
      Montserrat: helveticaBold,
      Caveat: timesRoman
    };

    if (state.metadata) {
      if (state.metadata.title) finalDoc.setTitle(state.metadata.title);
      if (state.metadata.author) finalDoc.setAuthor(state.metadata.author);
      if (state.metadata.subject) finalDoc.setSubject(state.metadata.subject);
      if (state.metadata.keywords) {
        const kwList = Array.isArray(state.metadata.keywords)
          ? state.metadata.keywords
          : String(state.metadata.keywords).split(',').map(s => s.trim()).filter(Boolean);
        finalDoc.setKeywords(kwList);
      }
      if (state.metadata.creator) finalDoc.setCreator(state.metadata.creator);
      if (state.metadata.producer) finalDoc.setProducer(state.metadata.producer);
    }

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

      // Apply crop margins if configured
      if (state.cropSettings) {
        const cs = state.cropSettings;
        if (cs.applyToAll || cs.pageNum === origPage) {
          const top = Number(cs.top) || 0;
          const right = Number(cs.right) || 0;
          const bottom = Number(cs.bottom) || 0;
          const left = Number(cs.left) || 0;

          const cropX = left;
          const cropY = bottom;
          const cropW = Math.max(20, pWidth - left - right);
          const cropH = Math.max(20, pHeight - top - bottom);

          copiedPage.setCropBox(cropX, cropY, cropW, cropH);
        }
      }

      // Apply rotation if any
      const addRotation = state.pageRotations[origPage] || 0;
      if (addRotation !== 0) {
        const curRot = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees((curRot + addRotation) % 360));
      }

      // Get annotations for this page
      const annotations = state.annotations[origPage] || [];

      // Pass 1: True Redaction - Purge underlying text content streams
      const redactionBoxes = [];
      const textTargets = [];

      for (const ann of annotations) {
        if (ann.type === 'whiteout' || (ann.type === 'text' && ann.hasUnderlay)) {
          const pdfX = ann.x * pWidth;
          const pdfY = pHeight - (ann.y * pHeight) - (ann.height * pHeight);
          const pdfW = ann.width * pWidth;
          const pdfH = ann.height * pHeight;
          redactionBoxes.push({ x: pdfX, y: pdfY, width: pdfW, height: pdfH });
          if (ann.replacedText) textTargets.push(ann.replacedText);
        }
      }

      if (redactionBoxes.length > 0 || textTargets.length > 0) {
        try {
          await redactPageContentStreams(finalDoc, copiedPage, redactionBoxes, textTargets);
        } catch (redactErr) {
          console.warn('Content stream redaction skipped for page:', redactErr);
        }
      }

      // Pass 2: Draw visual annotations
      for (const ann of annotations) {
        const pdfX = ann.x * pWidth;
        const pdfY = pHeight - (ann.y * pHeight) - (ann.height * pHeight);
        const pdfW = ann.width * pWidth;
        const pdfH = ann.height * pHeight;

        if (ann.type === 'whiteout') {
          const isBlackout = ann.color === '#000000' || ann.isBlackout;
          copiedPage.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: pdfW,
            height: pdfH,
            color: isBlackout ? rgb(0, 0, 0) : rgb(1, 1, 1),
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
        } else if (ann.type === 'link') {
          try {
            const isPageTarget = ann.targetType === 'page';
            const targetPageIndex = Math.max(0, Math.min(finalDoc.getPageCount() - 1, (ann.pageTarget || 1) - 1));
            const targetPageRef = finalDoc.getPage(targetPageIndex).ref;

            const linkAction = isPageTarget
              ? {
                  Type: 'Action',
                  S: 'GoTo',
                  D: [targetPageRef, PDFName.of('Fit')]
                }
              : {
                  Type: 'Action',
                  S: 'URI',
                  URI: PDFString.of(ann.url || 'https://letsedit.dev')
                };

            const linkAnnot = finalDoc.context.obj({
              Type: 'Annot',
              Subtype: 'Link',
              Rect: [pdfX, pdfY, pdfX + pdfW, pdfY + pdfH],
              Border: [0, 0, 0],
              C: [0.15, 0.45, 0.95],
              A: linkAction
            });
            const linkRef = finalDoc.context.register(linkAnnot);
            copiedPage.node.addAnnot(linkRef);
          } catch (linkErr) {
            console.error('Failed to create PDF Link annotation:', linkErr);
          }
        } else if (ann.type === 'form') {
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
            } else if (ann.formType === 'dropdown') {
              const dd = form.createDropdown(`dd_${ann.id}`);
              dd.addToPage(copiedPage, { x: pdfX, y: pdfY, width: Math.max(80, pdfW), height: Math.max(20, pdfH) });
              const opts = ann.options || ['Option 1', 'Option 2', 'Option 3'];
              dd.addOptions(opts);
              if (ann.value && opts.includes(ann.value)) {
                dd.select(ann.value);
              }
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

      // Add Legal Bates Numbering if configured
      if (state.batesNumbering) {
        const bn = state.batesNumbering;
        const start = Number(bn.startNumber) || 1;
        const currentNum = start + outIdx;
        const digits = Number(bn.digits) || 6;
        const padded = String(currentNum).padStart(digits, '0');
        const batesText = `${bn.prefix || ''}${padded}${bn.suffix || ''}`;
        const batesSize = Number(bn.fontSize) || 10;
        const batesWidth = helveticaBold.widthOfTextAtSize(batesText, batesSize);
        const { r, g, b } = hexToRgb(bn.color || '#1e293b');

        let bnX = pWidth - batesWidth - 36;
        let bnY = 24;

        if (bn.position === 'bottom-left') { bnX = 36; bnY = 24; }
        else if (bn.position === 'bottom-center') { bnX = (pWidth - batesWidth) / 2; bnY = 24; }
        else if (bn.position === 'bottom-right') { bnX = pWidth - batesWidth - 36; bnY = 24; }
        else if (bn.position === 'top-left') { bnX = 36; bnY = pHeight - 34; }
        else if (bn.position === 'top-center') { bnX = (pWidth - batesWidth) / 2; bnY = pHeight - 34; }
        else if (bn.position === 'top-right') { bnX = pWidth - batesWidth - 36; bnY = pHeight - 34; }

        copiedPage.drawText(batesText, {
          x: bnX,
          y: bnY,
          size: batesSize,
          font: helveticaBold,
          color: rgb(r / 255, g / 255, b / 255)
        });
      }
    }

    // Flatten interactive forms into read-only vector page content if configured
    if (state.flattenForms || state.flatten) {
      try {
        const form = finalDoc.getForm();
        form.flatten();
      } catch (flattenErr) {}
    }

    // Apply standard PDF encryption if configured
    if (state.exportPassword && state.exportPassword.userPassword) {
      applyPdfEncryption(
        finalDoc,
        state.exportPassword.userPassword,
        state.exportPassword.ownerPassword,
        state.exportPassword.permissions
      );
    }

    return await finalDoc.save({ updateMetadata: false });
  }
}
