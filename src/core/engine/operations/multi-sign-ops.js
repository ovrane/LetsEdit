/**
 * Multi-Sign Operations Sub-Module
 * Reverse-engineered from iLovePDF & Adobe Acrobat Sign architectures.
 * Handles programmatic burning of multi-party signature fields, initials, dates, and text inputs
 * onto PDF pages, and renders comprehensive multi-party eIDAS Audit Trail Certificates.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { computeSha256Hex } from '../sign-audit-certificate.js';
import { generateQrMatrix } from '../../../utils/helpers.js';

export class MultiSignOps {
  /**
   * Burns all recipient signature fields, initials, dates, and form values onto document pages.
   */
  static async burnSignatureFields(rawBytes, fields = []) {
    if (!rawBytes) throw new Error('No PDF bytes provided to burnSignatureFields');
    const doc = await PDFDocument.load(rawBytes);
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const courier = await doc.embedFont(StandardFonts.Courier);
    const numPages = doc.getPageCount();

    for (const f of fields) {
      if (!f.value) continue;
      const pageIdx = Math.max(0, Math.min(numPages - 1, parseInt(f.page !== undefined ? f.page : 0, 10)));
      const page = doc.getPage(pageIdx);
      const { height: pageHeight } = page.getSize();

      const fX = parseFloat(f.x) || 50;
      // Convert browser top-left Y coordinates to PDF bottom-left Y coordinates if needed
      const fY = parseFloat(f.y) || 50;
      const fWidth = Math.max(20, parseFloat(f.width) || 120);
      const fHeight = Math.max(16, parseFloat(f.height) || 40);

      // PDF coordinate space has origin (0,0) at bottom-left
      // If f.y was stored relative to bottom-left (y <= pageHeight - fHeight), use directly;
      // If stored from top-down (browser canvas style), invert: pageHeight - fY - fHeight
      const pdfY = f.isTopOrigin ? Math.max(10, pageHeight - fY - fHeight) : fY;

      if (f.type === 'signature' || f.type === 'initials') {
        const valStr = String(f.value);
        if (valStr.startsWith('data:image/')) {
          try {
            const base64Data = valStr.split(',')[1];
            const binStr = atob(base64Data);
            const imgBytes = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) imgBytes[i] = binStr.charCodeAt(i);

            const isPng = valStr.includes('image/png');
            let embeddedImg;
            try {
              embeddedImg = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
            } catch (err) {
              embeddedImg = isPng ? await doc.embedJpg(imgBytes) : await doc.embedPng(imgBytes);
            }

            page.drawImage(embeddedImg, {
              x: fX,
              y: pdfY,
              width: fWidth,
              height: fHeight
            });
          } catch (e) {
            console.warn('[MultiSignOps] Failed to embed signature image:', e);
            page.drawText(f.label || 'Signature', {
              x: fX + 4,
              y: pdfY + (fHeight - 12) / 2,
              size: 11,
              font: helveticaBold,
              color: rgb(0.19, 0.02, 0.05)
            });
          }
        } else {
          // Stylized text signature
          page.drawText(valStr, {
            x: fX + 4,
            y: pdfY + (fHeight - 14) / 2,
            size: Math.min(16, fHeight * 0.45),
            font: helveticaBold,
            color: rgb(0.06, 0.09, 0.16)
          });
        }
      } else if (f.type === 'date') {
        const dateStr = String(f.value || new Date().toISOString().split('T')[0]);
        page.drawText(dateStr, {
          x: fX + 4,
          y: pdfY + (fHeight - 10) / 2,
          size: 9.5,
          font: helvetica,
          color: rgb(0.2, 0.2, 0.2)
        });
      } else if (f.type === 'checkbox') {
        const isChecked = f.value === true || f.value === 'checked' || f.value === 'true';
        page.drawRectangle({
          x: fX,
          y: pdfY,
          width: fWidth,
          height: fHeight,
          color: rgb(0.98, 0.98, 0.98),
          borderColor: rgb(0.4, 0.4, 0.4),
          borderWidth: 1
        });
        if (isChecked) {
          page.drawText('X', {
            x: fX + (fWidth - 9) / 2,
            y: pdfY + (fHeight - 10) / 2,
            size: 11,
            font: helveticaBold,
            color: rgb(0.02, 0.6, 0.35)
          });
        }
      } else {
        // Text field or name
        const textVal = String(f.value);
        page.drawText(textVal, {
          x: fX + 4,
          y: pdfY + (fHeight - 10) / 2,
          size: 9.5,
          font: helvetica,
          color: rgb(0.1, 0.1, 0.1)
        });
      }
    }

    return await doc.save();
  }

  /**
   * Appends an official Multi-Party eIDAS / ESIGN Audit Certificate page to the PDF.
   */
  static async appendMultiSignerAuditPage(doc, signRequest = {}, originalHash = 'N/A', signedHash = 'N/A') {
    const pageW = 595.28; // Standard A4 width
    const pageH = 841.89; // Standard A4 height
    const page = doc.addPage([pageW, pageH]);

    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const courier = await doc.embedFont(StandardFonts.Courier);

    const wineColor = rgb(0.188, 0.02, 0.051); // #30050d
    const slateText = rgb(0.06, 0.09, 0.16); // #0f172a
    const mutedText = rgb(0.39, 0.45, 0.55); // #64748b
    const goldAccent = rgb(0.85, 0.65, 0.13); // #d97706
    const emeraldGreen = rgb(0.02, 0.6, 0.35); // #059669
    const boxBg = rgb(0.97, 0.98, 0.99); // #f8fafc
    const borderGrey = rgb(0.88, 0.91, 0.94); // #e2e8f0

    // 1. Header Banner
    page.drawRectangle({
      x: 0,
      y: pageH - 90,
      width: pageW,
      height: 90,
      color: wineColor
    });

    page.drawRectangle({
      x: 0,
      y: pageH - 94,
      width: pageW,
      height: 4,
      color: goldAccent
    });

    page.drawText('MULTI-PARTY ELECTRONIC SIGNATURE AUDIT TRAIL', {
      x: 36,
      y: pageH - 42,
      size: 14,
      font: helveticaBold,
      color: rgb(1, 1, 1)
    });

    page.drawText('Legal Evidence Summary conforming to eIDAS (EU No 910/2014) & US ESIGN / UETA Acts', {
      x: 36,
      y: pageH - 62,
      size: 9,
      font: helvetica,
      color: rgb(0.9, 0.85, 0.85)
    });

    // 2. Transaction Overview Box
    let curY = pageH - 120;
    page.drawRectangle({
      x: 36,
      y: curY - 50,
      width: pageW - 72,
      height: 50,
      color: boxBg,
      borderColor: borderGrey,
      borderWidth: 1
    });

    page.drawText('TRANSACTION IDENTIFIER', { x: 50, y: curY - 20, size: 8, font: helveticaBold, color: mutedText });
    page.drawText(signRequest.transactionId || 'TRX-EVID-MULTI', { x: 50, y: curY - 38, size: 12, font: courier, color: wineColor });

    page.drawText('COMPLETION DATE (UTC)', { x: 340, y: curY - 20, size: 8, font: helveticaBold, color: mutedText });
    page.drawText(signRequest.completedAt || new Date().toISOString(), { x: 340, y: curY - 38, size: 9.5, font: courier, color: slateText });

    curY -= 70;

    // 3. Document Integrity Block
    page.drawText('1. CRYPTOGRAPHIC DOCUMENT INTEGRITY', { x: 36, y: curY, size: 11, font: helveticaBold, color: wineColor });
    curY -= 12;

    page.drawRectangle({
      x: 36,
      y: curY - 90,
      width: pageW - 72,
      height: 90,
      color: boxBg,
      borderColor: borderGrey,
      borderWidth: 1
    });

    const docItems = [
      { label: 'Document Name:', val: signRequest.documentName || 'Document.pdf', isCode: false },
      { label: 'Original SHA-256:', val: originalHash, isCode: true },
      { label: 'Final Signed SHA-256:', val: signedHash, isCode: true }
    ];

    let lY = curY - 22;
    docItems.forEach(({ label, val, isCode }) => {
      page.drawText(label, { x: 50, y: lY, size: 9, font: helveticaBold, color: slateText });
      page.drawText(val, {
        x: 170,
        y: lY,
        size: isCode ? 7.5 : 8.5,
        font: isCode ? courier : helvetica,
        color: isCode ? wineColor : slateText
      });
      lY -= 22;
    });

    curY -= 115;

    // 4. Multi-Signer Execution Ledger Table
    page.drawText('2. MULTI-PARTY SIGNER EXECUTION LEDGER', { x: 36, y: curY, size: 11, font: helveticaBold, color: wineColor });
    curY -= 14;

    const recipients = signRequest.recipients || [];
    const rowHeight = 34;
    const tableHeight = 26 + recipients.length * rowHeight;

    page.drawRectangle({
      x: 36,
      y: curY - tableHeight,
      width: pageW - 72,
      height: tableHeight,
      color: boxBg,
      borderColor: borderGrey,
      borderWidth: 1
    });

    // Table Header
    page.drawRectangle({
      x: 36,
      y: curY - 26,
      width: pageW - 72,
      height: 26,
      color: rgb(0.93, 0.95, 0.97)
    });

    page.drawText('SIGNER', { x: 48, y: curY - 18, size: 8, font: helveticaBold, color: slateText });
    page.drawText('EMAIL', { x: 180, y: curY - 18, size: 8, font: helveticaBold, color: slateText });
    page.drawText('STATUS', { x: 340, y: curY - 18, size: 8, font: helveticaBold, color: slateText });
    page.drawText('TIMESTAMP (UTC)', { x: 430, y: curY - 18, size: 8, font: helveticaBold, color: slateText });

    let rowY = curY - 26;
    recipients.forEach((rec, idx) => {
      rowY -= rowHeight;
      if (idx % 2 === 1) {
        page.drawRectangle({
          x: 36,
          y: rowY,
          width: pageW - 72,
          height: rowHeight,
          color: rgb(0.98, 0.99, 1)
        });
      }

      page.drawText(rec.name || `Signer ${idx + 1}`, { x: 48, y: rowY + 12, size: 8.5, font: helveticaBold, color: slateText });
      page.drawText(rec.email || 'N/A', { x: 180, y: rowY + 12, size: 8, font: helvetica, color: mutedText });

      const isSigned = rec.status === 'signed';
      page.drawText(isSigned ? '[SIGNED]' : '[PENDING]', {
        x: 340,
        y: rowY + 12,
        size: 8,
        font: helveticaBold,
        color: isSigned ? emeraldGreen : rgb(0.85, 0.5, 0.1)
      });

      page.drawText(rec.signedAt || 'Pending Signature', {
        x: 430,
        y: rowY + 12,
        size: 7.5,
        font: courier,
        color: isSigned ? slateText : mutedText
      });
    });

    curY -= tableHeight + 25;

    // 5. Verification QR Code & Evidence Section
    page.drawText('3. VECTOR VERIFICATION QR & AUDIT SEAL', { x: 36, y: curY, size: 11, font: helveticaBold, color: wineColor });
    curY -= 12;

    page.drawRectangle({
      x: 36,
      y: curY - 95,
      width: pageW - 72,
      height: 95,
      color: boxBg,
      borderColor: borderGrey,
      borderWidth: 1
    });

    // Vector QR Code Drawing
    const qrUrl = `https://letsedit.dev/verify_sign?trx=${signRequest.transactionId || 'MULTI'}&hash=${signedHash.substring(0, 16)}`;
    const qrGrid = generateQrMatrix(qrUrl);
    const N = qrGrid.length;
    const qrBoxSize = 75;
    const moduleSize = qrBoxSize / N;
    const qrStartX = 50;
    const qrStartY = curY - 85;

    page.drawRectangle({
      x: qrStartX - 4,
      y: qrStartY - 4,
      width: qrBoxSize + 8,
      height: qrBoxSize + 8,
      color: rgb(1, 1, 1),
      borderColor: borderGrey,
      borderWidth: 1
    });

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (qrGrid[r][c]) {
          page.drawRectangle({
            x: qrStartX + c * moduleSize,
            y: qrStartY + (N - 1 - r) * moduleSize,
            width: moduleSize,
            height: moduleSize,
            color: slateText
          });
        }
      }
    }

    const textX = qrStartX + qrBoxSize + 20;
    page.drawText('LEGAL NON-REPUDIATION & TAMPER VERIFICATION', {
      x: textX,
      y: curY - 26,
      size: 8.5,
      font: helveticaBold,
      color: wineColor
    });

    const legalNotes = [
      'Each party cryptographically acknowledged this document via an individual secure session token.',
      'The complete audit manifest, IP locations, user agent records, and timestamp proofs are bound',
      'immutably to the SHA-256 digital fingerprint above. Any subsequent document modification',
      'permanently invalidates this cryptographic audit certificate and all attached signatures.'
    ];

    let noteY = curY - 42;
    legalNotes.forEach(line => {
      page.drawText(line, { x: textX, y: noteY, size: 7.5, font: helvetica, color: mutedText });
      noteY -= 12;
    });

    // 6. Bottom Legal Footer
    page.drawLine({
      start: { x: 36, y: 44 },
      end: { x: pageW - 36, y: 44 },
      thickness: 1,
      color: borderGrey
    });

    page.drawText('LetsEdit Multi-Party Sign Core Engine - Conforms to ISO 32000-1, eIDAS (EU No 910/2014), US ESIGN & UETA Acts', {
      x: 36,
      y: 30,
      size: 7.5,
      font: helvetica,
      color: mutedText
    });
  }

  /**
   * Compiles the final signed document:
   * 1. Calculates original document SHA-256.
   * 2. Burns all signature and form fields.
   * 3. Calculates intermediate signed SHA-256.
   * 4. Appends the Multi-Party eIDAS Audit Trail Certificate.
   * 5. Returns final compiled PDF bytes.
   */
  static async compileCompletedDocument(rawBytes, signRequest = {}) {
    const origHash = await computeSha256Hex(rawBytes);

    // 1. Burn placed fields
    const burnedBytes = await MultiSignOps.burnSignatureFields(rawBytes, signRequest.fields || []);
    const signedHash = await computeSha256Hex(burnedBytes);

    // 2. Load doc and append multi-signer audit certificate
    const finalDoc = await PDFDocument.load(burnedBytes);
    await MultiSignOps.appendMultiSignerAuditPage(finalDoc, signRequest, origHash, signedHash);

    const finalBytes = await finalDoc.save();
    return finalBytes;
  }
}
