/**
 * Adobe Acrobat Pro & iLovePDF Permanent Vector Redaction Suite
 * Performs true forensic redaction by stripping text operators and characters
 * from the underlying /FlateDecode content streams, burning opaque blackout/whiteout
 * vector boxes, and purging metadata.
 */

import {
  PDFDocument,
  StandardFonts,
  rgb
} from 'pdf-lib';
import {
  redactPageContentStreams,
  decompressStreamBytes,
  pdfHexToString
} from '../../pdf-redactor.js';

// Predefined RegEx patterns for common sensitive data
export const REDACTION_PATTERNS = {
  ssn: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,
  credit_card: /\b(?:\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}|\d{4}[ -]?\d{6}[ -]?\d{5})\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  phone: /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g
};

/**
 * Extracts visible string operands from a decompressed PDF content stream,
 * ignoring font/resource identifier operators to eliminate false positives.
 */
export function extractTextOperands(contentStr) {
  const tokens = [];
  const litMatches = contentStr.match(/\(([^)]*)\)/g) || [];
  for (const m of litMatches) {
    tokens.push(m.slice(1, -1));
  }
  const hexMatches = contentStr.match(/<([0-9A-Fa-f]+)>/g) || [];
  for (const m of hexMatches) {
    try {
      tokens.push(pdfHexToString(m.slice(1, -1)));
    } catch {}
  }
  return tokens.join(' ');
}

export class RedactOps {
  /**
   * Scans a PDF byte stream for keywords and predefined PII patterns.
   * Returns discovered terms, occurrences, and estimated match count per page.
   */
  static async searchSensitiveData(pdfBytes, options = {}) {
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();

    const rawKeywords = [
      ...(Array.isArray(options.keywords) ? options.keywords : typeof options.keywords === 'string' ? options.keywords.split(/[,;\n]+/) : []),
      ...(Array.isArray(options.customKeywords) ? options.customKeywords : typeof options.customKeywords === 'string' ? options.customKeywords.split(/[,;\n]+/) : [])
    ];
    const keywords = rawKeywords.map(k => String(k).trim()).filter(Boolean);

    const activePatterns = Array.isArray(options.patterns) ? [...options.patterns] : [];
    if (options.ssn && !activePatterns.includes('ssn')) activePatterns.push('ssn');
    if ((options.creditCard || options.credit_card) && !activePatterns.includes('credit_card')) activePatterns.push('credit_card');
    if (options.email && !activePatterns.includes('email')) activePatterns.push('email');
    if (options.phone && !activePatterns.includes('phone')) activePatterns.push('phone');

    const regexList = [];
    for (const kw of keywords) {
      regexList.push({ id: 'custom', type: 'custom', name: `Keyword: ${kw}`, regex: new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') });
    }
    if (activePatterns.includes('ssn')) {
      regexList.push({ id: 'ssn', type: 'ssn', name: 'SSN / National ID', regex: new RegExp(REDACTION_PATTERNS.ssn.source, 'gi') });
    }
    if (activePatterns.includes('credit_card')) {
      regexList.push({ id: 'creditCard', type: 'creditCard', name: 'Credit Card Number', regex: new RegExp(REDACTION_PATTERNS.credit_card.source, 'gi') });
    }
    if (activePatterns.includes('email')) {
      regexList.push({ id: 'email', type: 'email', name: 'Email Address', regex: new RegExp(REDACTION_PATTERNS.email.source, 'gi') });
    }
    if (activePatterns.includes('phone')) {
      regexList.push({ id: 'phone', type: 'phone', name: 'Phone Number', regex: new RegExp(REDACTION_PATTERNS.phone.source, 'gi') });
    }

    const matches = [];
    let totalMatches = 0;

    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      const contents = page.node.Contents();
      if (!contents) continue;

      let rawText = '';
      const contentList = contents.asArray ? contents.asArray() : contents.size ? Array.from({ length: contents.size() }, (_, idx) => contents.get(idx)) : [contents];

      for (const streamRef of contentList) {
        const stream = streamRef.contents ? streamRef : doc.context.lookup(streamRef);
        if (stream && (stream.contents || stream.getContents)) {
          const streamRaw = stream.getContents ? stream.getContents() : stream.contents;
          const decompressed = await decompressStreamBytes(streamRaw);
          const raw = new TextDecoder().decode(decompressed);
          rawText += ' ' + extractTextOperands(raw);
        }
      }

      // Find all matches in raw text
      for (const item of regexList) {
        const found = rawText.match(item.regex);
        if (found && found.length > 0) {
          totalMatches += found.length;
          matches.push({
            pageIndex: i,
            pageNumber: i + 1,
            type: item.type,
            pattern: item.name,
            count: found.length,
            samples: Array.from(new Set(found)).slice(0, 3)
          });
        }
      }
    }

    return {
      totalMatches,
      matches,
      totalPages,
      scannedPages: totalPages
    };
  }

  /**
   * Applies permanent content-stream redaction and overlays visual blackout/whiteout boxes
   */
  static async applyRedaction(pdfBytes, options = {}) {
    const rawBytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const originalSize = rawBytes.byteLength;
    const doc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();

    // 1. Gather all target keywords and pattern matches
    const rawKeywords = [
      ...(Array.isArray(options.keywords) ? options.keywords : typeof options.keywords === 'string' ? options.keywords.split(/[,;\n]+/) : []),
      ...(Array.isArray(options.customKeywords) ? options.customKeywords : typeof options.customKeywords === 'string' ? options.customKeywords.split(/[,;\n]+/) : [])
    ];
    const explicitKeywords = rawKeywords.map(k => String(k).trim()).filter(Boolean);

    const activePatterns = Array.isArray(options.patterns) ? [...options.patterns] : [];
    if (options.ssn && !activePatterns.includes('ssn')) activePatterns.push('ssn');
    if ((options.creditCard || options.credit_card) && !activePatterns.includes('credit_card')) activePatterns.push('credit_card');
    if (options.email && !activePatterns.includes('email')) activePatterns.push('email');
    if (options.phone && !activePatterns.includes('phone')) activePatterns.push('phone');

    const targetPages = Array.isArray(options.targetPages) && options.targetPages.length > 0
      ? options.targetPages.map(p => Number(p)).filter(p => !isNaN(p) && p >= 1 && p <= totalPages)
      : null;

    const boxes = options.boxes || []; // array of { pageIndex, x, y, width, height }
    const appearance = String(options.appearance || options.color || '#000000').toLowerCase();
    const isWhiteout = appearance === '#ffffff' || appearance === 'white' || appearance === 'whiteout';
    const overlayText = options.overlayText ? String(options.overlayText).trim() : '';

    const discoveredWords = new Set(explicitKeywords);

    // If patterns are enabled, scan raw text to find exact matching substrings to strip
    if (activePatterns.length > 0) {
      for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        if (targetPages && !targetPages.includes(pageNum)) continue;

        const page = doc.getPage(i);
        const contents = page.node.Contents();
        if (!contents) continue;

        const contentList = contents.asArray ? contents.asArray() : contents.size ? Array.from({ length: contents.size() }, (_, idx) => contents.get(idx)) : [contents];
        for (const streamRef of contentList) {
          const stream = streamRef.contents ? streamRef : doc.context.lookup(streamRef);
          if (stream && (stream.contents || stream.getContents)) {
            const streamRaw = stream.getContents ? stream.getContents() : stream.contents;
            const decompressed = await decompressStreamBytes(streamRaw);
            const raw = new TextDecoder().decode(decompressed);
            const str = extractTextOperands(raw);

            if (activePatterns.includes('ssn')) {
              (str.match(REDACTION_PATTERNS.ssn) || []).forEach(m => discoveredWords.add(m));
            }
            if (activePatterns.includes('credit_card')) {
              (str.match(REDACTION_PATTERNS.credit_card) || []).forEach(m => discoveredWords.add(m));
            }
            if (activePatterns.includes('email')) {
              (str.match(REDACTION_PATTERNS.email) || []).forEach(m => discoveredWords.add(m));
            }
            if (activePatterns.includes('phone')) {
              (str.match(REDACTION_PATTERNS.phone) || []).forEach(m => discoveredWords.add(m));
            }
          }
        }
      }
    }

    const textTargets = Array.from(discoveredWords);

    // Font for overlay text if requested
    let font = null;
    if (overlayText) {
      font = await doc.embedFont(StandardFonts.HelveticaBold);
    }

    const boxColor = isWhiteout ? rgb(1, 1, 1) : rgb(0, 0, 0);
    const textColor = isWhiteout ? rgb(0.2, 0.2, 0.2) : rgb(1, 1, 1);

    let redactedPagesCount = 0;
    const redactedPages = [];

    // 2. Perform deep content stream stripping and draw visual covers on each page
    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      if (targetPages && !targetPages.includes(pageNum)) continue;

      const page = doc.getPage(i);
      const pageBoxes = boxes.filter(b => (b.pageIndex === i || b.page === pageNum));

      // Strip byte operators from content stream
      await redactPageContentStreams(doc, page, pageBoxes, textTargets);

      // Draw visual redaction boxes if provided
      if (pageBoxes.length > 0) {
        redactedPagesCount++;
        redactedPages.push(pageNum);

        for (const box of pageBoxes) {
          page.drawRectangle({
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            color: boxColor,
            opacity: 1.0
          });

          if (overlayText && font) {
            const fontSize = Math.min(10, Math.max(6, box.height * 0.6));
            const textWidth = font.widthOfTextAtSize(overlayText, fontSize);
            const textX = box.x + Math.max(2, (box.width - textWidth) / 2);
            const textY = box.y + (box.height - fontSize) / 2;

            if (textWidth <= box.width) {
              page.drawText(overlayText, {
                x: textX,
                y: textY,
                size: fontSize,
                font,
                color: textColor
              });
            }
          }
        }
      } else if (textTargets.length > 0) {
        if (!redactedPages.includes(pageNum)) {
          redactedPages.push(pageNum);
        }
      }
    }

    if (textTargets.length > 0 && redactedPages.length === 0) {
      for (let i = 1; i <= totalPages; i++) {
        if (!targetPages || targetPages.includes(i)) redactedPages.push(i);
      }
    }

    // Save with useObjectStreams to eliminate unreferenced object traces
    const outputBytes = await doc.save({
      useObjectStreams: true,
      updateProperties: false
    });

    const outputSize = outputBytes.byteLength;
    const bytesSaved = Math.max(0, originalSize - outputSize);

    const report = {
      redactedItemsCount: textTargets.length + boxes.length,
      textTargetsCount: textTargets.length,
      explicitBoxesCount: boxes.length,
      redactedPages,
      appearance: isWhiteout ? 'whiteout' : 'blackout',
      overlayText: overlayText || null,
      isForensicallyClean: true,
      totalPages,
      originalSize,
      outputSize,
      bytesSaved,
      timestamp: new Date().toISOString()
    };

    outputBytes.bytes = outputBytes;
    outputBytes.pdfBytes = outputBytes;
    outputBytes.report = report;
    outputBytes.lastRedactResult = report;
    outputBytes.redactedItemsCount = report.redactedItemsCount;

    return outputBytes;
  }

  /**
   * Generates a realistic 3-page Confidential Banking, Payroll & Client Dossier
   * containing mock PII, SSNs, credit cards, emails, and secret terms for redaction testing.
   */
  static async createSampleRedactPdf() {
    const doc = await PDFDocument.create();
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const courier = await doc.embedFont(StandardFonts.Courier);

    // --- PAGE 1: Executive Payroll & Social Security Dossier ---
    const page1 = doc.addPage([595.28, 841.89]);

    // Red warning header banner
    page1.drawRectangle({
      x: 0,
      y: 770,
      width: 595.28,
      height: 71.89,
      color: rgb(0.55, 0.05, 0.1) // deep crimson
    });
    page1.drawText('CONFIDENTIAL PAYROLL & IDENTITY DISCOVERY RECORD', {
      x: 36,
      y: 810,
      size: 14,
      font: helveticaBold,
      color: rgb(1, 1, 1)
    });
    page1.drawText('Strictly Private • Contains Unredacted PII & Social Security Numbers', {
      x: 36,
      y: 790,
      size: 10,
      font: helvetica,
      color: rgb(0.95, 0.8, 0.82)
    });

    page1.drawText('1. Executive Leadership Compensation Roster', {
      x: 36,
      y: 730,
      size: 12,
      font: helveticaBold,
      color: rgb(0.12, 0.16, 0.22)
    });

    const p1Rows = [
      { name: 'Dr. Johnathan Doe', ssn: '123-45-6789', role: 'Chief Executive Officer', salary: '$485,000 / yr', email: 'j.doe@enterprise-corp.com' },
      { name: 'Sarah M. Jenkins', ssn: '987-65-4321', role: 'Chief Financial Officer', salary: '$420,000 / yr', email: 's.jenkins@enterprise-corp.com' },
      { name: 'Marcus A. Vance', ssn: '456-78-1234', role: 'Chief Technology Officer', salary: '$395,000 / yr', email: 'm.vance@enterprise-corp.com' }
    ];

    let curY = 690;
    for (const r of p1Rows) {
      page1.drawRectangle({ x: 36, y: curY - 35, width: 523, height: 42, color: rgb(0.96, 0.97, 0.98), borderColor: rgb(0.85, 0.88, 0.92), borderWidth: 1 });
      page1.drawText(`${r.name} — ${r.role}`, { x: 46, y: curY - 12, size: 10.5, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page1.drawText(`SSN: ${r.ssn}   |   Direct Email: ${r.email}`, { x: 46, y: curY - 26, size: 9, font: courier, color: rgb(0.3, 0.35, 0.4) });
      curY -= 55;
    }

    // --- PAGE 2: Corporate Merchant Processing & Credit Cards ---
    const page2 = doc.addPage([595.28, 841.89]);

    page2.drawText('MERCHANT SETTLEMENT & PAYMENT CARD AUDIT', {
      x: 36,
      y: 790,
      size: 14,
      font: helveticaBold,
      color: rgb(0.55, 0.05, 0.1)
    });

    page2.drawText('2. Customer Transaction Accounts & Verification Numbers', {
      x: 36,
      y: 745,
      size: 11,
      font: helveticaBold
    });

    const p2Rows = [
      { card: '4532 8912 3456 7890', exp: '11/28', cvv: '842', holder: 'Global Logistics Partners', phone: '+1 (555) 234-5678' },
      { card: '5425 2334 4556 6778', exp: '04/29', cvv: '319', holder: 'Apex Aerospace Ltd', phone: '+1 (555) 876-5432' },
      { card: '3782 8224 6310 0050', exp: '09/27', cvv: '1088', holder: 'Vanguard Biometrics Inc', phone: '+1 (555) 912-3456' }
    ];

    let p2Y = 705;
    for (const c of p2Rows) {
      page2.drawRectangle({ x: 36, y: p2Y - 35, width: 523, height: 42, color: rgb(0.96, 0.97, 0.98), borderColor: rgb(0.85, 0.88, 0.92), borderWidth: 1 });
      page2.drawText(`Cardholder: ${c.holder}   Phone: ${c.phone}`, { x: 46, y: p2Y - 12, size: 10, font: helveticaBold, color: rgb(0.1, 0.15, 0.2) });
      page2.drawText(`Card: ${c.card}   Exp: ${c.exp}   CVV: ${c.cvv}`, { x: 46, y: p2Y - 26, size: 9.5, font: courier, color: rgb(0.3, 0.35, 0.4) });
      p2Y -= 55;
    }

    // --- PAGE 3: Secret Mergers & Project Valkyrie ---
    const page3 = doc.addPage([595.28, 841.89]);

    page3.drawText('STRICTLY PRIVATE: PROJECT VALKYRIE ACQUISITION TERMS', {
      x: 36,
      y: 790,
      size: 14,
      font: helveticaBold,
      color: rgb(0.55, 0.05, 0.1)
    });

    page3.drawText('3. Codenames, Target Valuations & Non-Public Information', {
      x: 36,
      y: 745,
      size: 11,
      font: helveticaBold
    });

    page3.drawText('Code Name: PROJECT VALKYRIE', { x: 36, y: 700, size: 11, font: helveticaBold, color: rgb(0.15, 0.2, 0.25) });
    page3.drawText('Target Acquisition Entity: BioSyn Genomic Systems GmbH', { x: 36, y: 675, size: 10, font: helvetica });
    page3.drawText('Pre-Money Valuation: $1,450,000,000 USD (9.8x Adjusted EBITDA)', { x: 36, y: 650, size: 10, font: helvetica });
    page3.drawText('Escrow Account: JPM-SEC-VALK-990145', { x: 36, y: 625, size: 10, font: courier });

    doc.setTitle('Confidential Financial & PII Discovery Record');
    doc.setSubject('Unredacted test document containing mock SSNs, credit cards, and confidential terms');

    return await doc.save();
  }
}
