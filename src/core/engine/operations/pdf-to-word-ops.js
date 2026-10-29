/**
 * Adobe Acrobat Pro & iLovePDF PDF to Editable Microsoft Word DOCX Converter
 * Conforms to LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md (Cluster 5 & Task 59)
 *
 * Capabilities:
 * 1. Text flow & paragraph reconstruction from PDF character positions and baseline offsets
 * 2. Heading hierarchy detector (Heading 1, Heading 2, Normal) based on font metrics and scale
 * 3. Tabular structural grid detection constructing native Word <w:tbl> elements
 * 4. Synthetic OpenXML DOCX compilation with JSZip (document.xml, styles.xml, [Content_Types].xml)
 * 5. createSampleStructuredPdf() generating multi-heading, multi-paragraph, and 3-column table test PDFs
 * 6. 100% client-side zero-telemetry architecture
 */

import { PDFDocument, StandardFonts, rgb, PDFName, PDFArray, PDFRawStream, PDFStream } from 'pdf-lib';
import JSZip from 'jszip';
import { decompressStreamBytes, pdfHexToString } from '../../pdf-redactor.js';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class PdfToWordOps {
  /**
   * Generates a realistic structured test PDF with:
   * - Document title & subtitle (large bold fonts)
   * - Multi-level headings (Heading 1, Heading 2)
   * - Reflowable multi-line body paragraphs
   * - A structured 3-column data table with vector borders and cell contents
   * - Bulleted list items
   */
  static async createSampleStructuredPdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const marginX = 54;
    let cursorY = height - 60;

    // 1. Document Title
    page.drawText('Enterprise Professional Services Agreement', {
      x: marginX,
      y: cursorY,
      size: 22,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.5)
    });
    cursorY -= 28;

    // Subtitle
    page.drawText('Confidential Client Statement of Work (SOW-2026-X89)', {
      x: marginX,
      y: cursorY,
      size: 13,
      font: fontOblique,
      color: rgb(0.3, 0.4, 0.5)
    });
    cursorY -= 36;

    // 2. Heading 1
    page.drawText('1. Scope of Services & Architectural Objectives', {
      x: marginX,
      y: cursorY,
      size: 16,
      font: fontBold,
      color: rgb(0.12, 0.15, 0.2)
    });
    cursorY -= 22;

    // Paragraph 1
    const p1 = 'The Service Provider shall engineer and deliver an enterprise-grade document transformation platform. The solution operates completely within the client browser runtime under a strict zero-telemetry data governance policy, eliminating unencrypted network hops and remote cache persistence.';
    cursorY = this._renderWrappedText(page, p1, marginX, cursorY, width - marginX * 2, fontRegular, 10.5, 15);
    cursorY -= 14;

    // 3. Heading 2
    page.drawText('1.1 Data Privacy & Security Mandates', {
      x: marginX,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: rgb(0.15, 0.2, 0.3)
    });
    cursorY -= 18;

    // Bullet points
    const bullets = [
      '• Pure client-side WebAssembly execution with zero cloud storage dependencies',
      '• Bidirectional OpenXML document structure preservation for Microsoft Word and Excel',
      '• Cryptographic signature verification and verifiable tamper-evident auditing'
    ];
    for (const b of bullets) {
      page.drawText(b, {
        x: marginX + 10,
        y: cursorY,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3)
      });
      cursorY -= 16;
    }
    cursorY -= 16;

    // 4. Heading 1: Table Section
    page.drawText('2. Milestone Deliverables & Compensation Matrix', {
      x: marginX,
      y: cursorY,
      size: 16,
      font: fontBold,
      color: rgb(0.12, 0.15, 0.2)
    });
    cursorY -= 24;

    // 3-Column Table
    const tableTop = cursorY;
    const colWidths = [120, 240, 127];
    const rowHeight = 24;
    const tableData = [
      ['Milestone', 'Deliverable Description', 'Contract Value (USD)'],
      ['Phase 1: Engine', 'Vector layout analyzer & PDF token stream decoder', '$24,500.00'],
      ['Phase 2: Typesetter', 'OpenXML WordprocessingML packaging & reflow parser', '$32,000.00'],
      ['Phase 3: Validation', 'Full browser test suite & memory leak audit', '$18,500.00']
    ];

    let currentY = tableTop;
    for (let r = 0; r < tableData.length; r++) {
      const row = tableData[r];
      const isHeader = r === 0;
      let currentX = marginX;

      // Draw row background for header
      if (isHeader) {
        page.drawRectangle({
          x: marginX,
          y: currentY - rowHeight + 4,
          width: colWidths.reduce((a, b) => a + b, 0),
          height: rowHeight,
          color: rgb(0.92, 0.94, 0.98)
        });
      }

      for (let c = 0; c < row.length; c++) {
        const text = row[c];
        const cellW = colWidths[c];

        // Draw cell border
        page.drawRectangle({
          x: currentX,
          y: currentY - rowHeight + 4,
          width: cellW,
          height: rowHeight,
          borderColor: rgb(0.8, 0.82, 0.86),
          borderWidth: 0.75
        });

        // Cell Text
        page.drawText(text, {
          x: currentX + 6,
          y: currentY - rowHeight + 11,
          size: isHeader ? 10 : 9.5,
          font: isHeader ? fontBold : fontRegular,
          color: isHeader ? rgb(0.1, 0.15, 0.3) : rgb(0.2, 0.2, 0.2)
        });

        currentX += cellW;
      }
      currentY -= rowHeight;
    }

    cursorY = currentY - 24;

    // Paragraph concluding
    const concluding = 'Both parties acknowledge that milestone acceptance is contingent upon successful verification of automated unit and end-to-end regression test suites.';
    this._renderWrappedText(page, concluding, marginX, cursorY, width - marginX * 2, fontRegular, 10, 14);

    return await pdfDoc.save();
  }

  static _renderWrappedText(page, text, x, startY, maxWidth, font, fontSize, lineHeight) {
    const words = text.split(' ');
    let currentLine = '';
    let y = startY;

    for (const w of words) {
      const candidate = currentLine ? `${currentLine} ${w}` : w;
      const textWidth = font.widthOfTextAtSize(candidate, fontSize);
      if (textWidth > maxWidth && currentLine) {
        page.drawText(currentLine, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
        y -= lineHeight;
        currentLine = w;
      } else {
        currentLine = candidate;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      y -= lineHeight;
    }
    return y;
  }

  /**
   * Extracts text items, bounding boxes, lines, tables, and paragraphs from PDF bytes.
   * Works in both browser (with PDF.js if available) and Node.js headless environment.
   */
  static async extractLayout(pdfBytes, options = {}) {
    const rawItems = [];

    // Path 1: Browser PDF.js if passed in options
    if (options.pdfjsDoc) {
      const pdfJsDoc = options.pdfjsDoc;
      const numPages = pdfJsDoc.numPages || 1;
      for (let p = 1; p <= numPages; p++) {
        const page = await pdfJsDoc.getPage(p);
        const textContent = await page.getTextContent();
        for (const item of textContent.items) {
          if (!item.str || !item.str.trim()) continue;
          const tx = item.transform || [12, 0, 0, 12, 0, 0];
          const fontSize = Math.abs(tx[0]) || Math.abs(tx[3]) || 11;
          rawItems.push({
            page: p,
            x: tx[4],
            y: tx[5],
            text: item.str,
            fontSize,
            fontName: item.fontName || 'Helvetica',
            isBold: /bold|heavy|black/i.test(item.fontName || '')
          });
        }
      }
    } else {
      // Path 2: Direct PDF Content Stream Parsing (safe in Node.js & browser)
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const numPages = doc.getPageCount();

      for (let i = 0; i < numPages; i++) {
        const page = doc.getPage(i);
        const pageNum = i + 1;
        const pageHeight = page.getHeight ? page.getHeight() : 842;
        const contentsRef = page.node.get(PDFName.of('Contents'));
        if (!contentsRef) continue;

        const streamObjects = contentsRef instanceof PDFArray
          ? contentsRef.asArray()
          : (Array.isArray(contentsRef) ? contentsRef : [contentsRef]);

        for (const ref of streamObjects) {
          const stream = doc.context.lookup(ref);
          if (!stream || !stream.getContents) continue;

          let streamBytes = stream.getContents();
          try {
            const filter = stream.dict?.get(PDFName.of('Filter'));
            if (filter && (filter.encodedName === '/FlateDecode' || filter === PDFName.of('FlateDecode'))) {
              streamBytes = await decompressStreamBytes(streamBytes);
            }
          } catch (e) {
            // fallback to raw stream if decompression fails
          }

          const streamStr = new TextDecoder('latin1').decode(streamBytes);
          this._parsePdfStreamTokens(streamStr, pageNum, pageHeight, rawItems);
        }
      }
    }

    // Sort items top-to-bottom (descending Y), then left-to-right (ascending X)
    rawItems.sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 3) return yDiff;
      return a.x - b.x;
    });

    // Group items into horizontal lines
    const lines = this._groupIntoLines(rawItems);

    // Classify lines into Headings, Tables, Lists, and Body Paragraphs
    const structuredElements = this._classifyAndReflow(lines, options);

    return {
      itemsCount: rawItems.length,
      linesCount: lines.length,
      elements: structuredElements
    };
  }

  /**
   * Parses PDF content stream operators to extract text tokens and positions.
   */
  static _parsePdfStreamTokens(streamStr, pageNum, pageHeight, rawItems) {
    let currentX = 54;
    let currentY = pageHeight - 60;
    let currentFontSize = 11;
    let currentFontName = 'Helvetica';

    const tokenRegex = /\/([\w\-]+)\s+([0-9.]+)\s+Tf|([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+Tm|([0-9.-]+)\s+([0-9.-]+)\s+Td|\(([^)]*)\)\s*(?:Tj|'|")|<([0-9a-fA-F]*)>\s*Tj|\[([^\]]*)\]\s*TJ/g;

    let match;
    while ((match = tokenRegex.exec(streamStr)) !== null) {
      // 1. Font specification: /F1 14 Tf or /Helvetica-Bold-7098480789 22 Tf
      if (match[1] && match[2]) {
        currentFontName = match[1];
        currentFontSize = parseFloat(match[2]) || currentFontSize;
        continue;
      }

      // 2. Text matrix: a b c d e f Tm
      if (match[3] && match[7] && match[8]) {
        const scaleA = Math.abs(parseFloat(match[3]));
        if (scaleA > 1 && currentFontSize <= 1) {
          currentFontSize = scaleA;
        }
        currentX = parseFloat(match[7]);
        currentY = parseFloat(match[8]);
        continue;
      }

      // 3. Text positioning: tx ty Td
      if (match[9] && match[10]) {
        currentX += parseFloat(match[9]);
        currentY += parseFloat(match[10]);
        continue;
      }

      // 4. Literal text: (string) Tj
      if (match[11] !== undefined) {
        const text = match[11].trim();
        if (text) {
          rawItems.push({
            page: pageNum,
            x: currentX,
            y: currentY,
            text,
            fontSize: currentFontSize,
            fontName: currentFontName,
            isBold: /bold|heavy|black/i.test(currentFontName)
          });
        }
        continue;
      }

      // 5. Hex text: <hex> Tj
      if (match[12]) {
        const decoded = pdfHexToString(match[12]).trim();
        if (decoded) {
          rawItems.push({
            page: pageNum,
            x: currentX,
            y: currentY,
            text: decoded,
            fontSize: currentFontSize,
            fontName: currentFontName,
            isBold: /bold|heavy|black/i.test(currentFontName)
          });
        }
        continue;
      }

      // 6. Text array: [(str) 20 (str2)] TJ
      if (match[13]) {
        const inside = match[13];
        const subLiterals = inside.match(/\(([^)]*)\)/g) || [];
        const fullStr = subLiterals.map(s => s.replace(/^\(|\)$/g, '')).join('').trim();
        if (fullStr) {
          rawItems.push({
            page: pageNum,
            x: currentX,
            y: currentY,
            text: fullStr,
            fontSize: currentFontSize,
            fontName: currentFontName,
            isBold: /bold|heavy|black/i.test(currentFontName)
          });
        }
      }
    }
  }

  /**
   * Groups text tokens sharing approximately the same vertical baseline into lines.
   */
  static _groupIntoLines(rawItems) {
    const lines = [];
    let currentLine = null;

    for (const item of rawItems) {
      if (!currentLine || currentLine.page !== item.page || Math.abs(currentLine.y - item.y) > 3.5) {
        if (currentLine) lines.push(currentLine);
        currentLine = {
          page: item.page,
          y: item.y,
          fontSize: item.fontSize,
          isBold: item.isBold,
          items: [item]
        };
      } else {
        currentLine.items.push(item);
        if (item.fontSize > currentLine.fontSize) currentLine.fontSize = item.fontSize;
        if (item.isBold) currentLine.isBold = true;
      }
    }
    if (currentLine) lines.push(currentLine);

    // For each line, sort items horizontally and join text
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);
      line.text = line.items.map(it => it.text).join(' ').trim();
      line.startX = line.items[0]?.x || 54;
      line.endX = line.items[line.items.length - 1]?.x || 54;
    }

    return lines;
  }

  /**
   * Reflows lines into structured paragraphs, headings, bullet lists, and tables.
   */
  static _classifyAndReflow(lines, options = {}) {
    const mode = options.mode || 'flow';
    const elements = [];
    let i = 0;

    // Detect median body font size
    const fontSizes = lines.map(l => l.fontSize).filter(Boolean);
    fontSizes.sort((a, b) => a - b);
    const medianSize = fontSizes[Math.floor(fontSizes.length / 2)] || 11;

    while (i < lines.length) {
      const line = lines[i];

      // Check if this line looks like part of a multi-column table
      const isTableCandidate = this._isTableLine(line, lines, i);
      if (isTableCandidate) {
        const table = this._extractTable(lines, i);
        if (table && table.rows.length >= 2) {
          elements.push(table);
          i += table.lineCount;
          continue;
        }
      }

      // Check for Heading 1 (title / large font)
      if (line.fontSize >= 18 || (line.fontSize >= medianSize * 1.45 && line.isBold)) {
        elements.push({
          type: 'heading',
          level: line.fontSize >= 20 ? 1 : 2,
          text: line.text,
          page: line.page
        });
        i++;
        continue;
      }

      // Check for Heading 2 (subheading)
      if (line.fontSize >= 13.5 && (line.isBold || line.fontSize > medianSize * 1.2)) {
        elements.push({
          type: 'heading',
          level: 2,
          text: line.text,
          page: line.page
        });
        i++;
        continue;
      }

      // Check for Bullet or Numbered List
      if (/^[•▪\-\*]\s+|^\d+\.\s+/.test(line.text)) {
        elements.push({
          type: 'list',
          text: line.text.replace(/^[•▪\-\*]\s+|^\d+\.\s+/, ''),
          page: line.page
        });
        i++;
        continue;
      }

      // In exact visual frame mode, keep each line independent
      if (mode === 'frame') {
        elements.push({
          type: 'paragraph',
          text: line.text,
          page: line.page
        });
        i++;
        continue;
      }

      // In Flow mode, merge consecutive lines into continuous reflowable paragraphs
      let paragraphText = line.text;
      const startPage = line.page;
      let nextIdx = i + 1;

      while (nextIdx < lines.length) {
        const nextLine = lines[nextIdx];
        if (nextLine.page !== startPage) break;
        if (this._isTableLine(nextLine, lines, nextIdx)) break;
        if (nextLine.fontSize >= 13.5) break;
        if (/^[•▪\-\*]\s+|^\d+\.\s+/.test(nextLine.text)) break;

        const verticalGap = Math.abs(lines[nextIdx - 1].y - nextLine.y);
        // Paragraph break if vertical gap is unusually large
        if (verticalGap > line.fontSize * 2.2) break;

        paragraphText += ' ' + nextLine.text;
        nextIdx++;
      }

      elements.push({
        type: 'paragraph',
        text: paragraphText.trim(),
        page: startPage
      });

      i = nextIdx;
    }

    return elements;
  }

  /**
   * Tests whether a line represents a multi-column table row.
   */
  static _isTableLine(line, allLines, index) {
    if (!line || !line.items) return false;
    // Condition 1: 3 or more separate items spaced across the page
    if (line.items.length >= 3) {
      const minGap = 28;
      let hasSignificantGaps = true;
      for (let j = 1; j < line.items.length; j++) {
        if (line.items[j].x - line.items[j - 1].x < minGap) {
          hasSignificantGaps = false;
          break;
        }
      }
      if (hasSignificantGaps) return true;
    }

    // Condition 2: 2 distinct items that align with previous or next line's columns
    if (line.items.length >= 2) {
      const nextLine = allLines[index + 1];
      if (nextLine && nextLine.items.length >= 2) {
        const col1Dist = Math.abs(line.items[0].x - nextLine.items[0].x);
        const col2Dist = Math.abs(line.items[1].x - nextLine.items[1].x);
        if (col1Dist < 12 && col2Dist < 12) return true;
      }
    }

    return false;
  }

  /**
   * Groups contiguous table-candidate lines into a structured table element.
   */
  static _extractTable(allLines, startIndex) {
    const tableLines = [];
    let idx = startIndex;

    while (idx < allLines.length) {
      const line = allLines[idx];
      if (this._isTableLine(line, allLines, idx)) {
        tableLines.push(line);
        idx++;
      } else {
        break;
      }
    }

    if (tableLines.length < 2) return null;

    // Build row representations
    const rows = [];
    for (const tLine of tableLines) {
      const cells = tLine.items.map(it => ({ text: it.text.trim() }));
      rows.push(cells);
    }

    return {
      type: 'table',
      rows,
      lineCount: tableLines.length,
      page: tableLines[0].page
    };
  }

  /**
   * Compiles structured elements into standard Microsoft Word OpenXML (.docx) archive.
   */
  static async compileDocx(elements, options = {}) {
    const zip = new JSZip();

    // 1. [Content_Types].xml
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

    // 2. _rels/.rels
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    // 3. word/_rels/document.xml.rels
    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

    // 4. word/styles.xml
    zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:sz w:val="22"/>
      <w:color w:val="2D3748"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="36"/>
      <w:color w:val="1E3A8A"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="180" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="2563EB"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E5E7EB"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E5E7EB"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>`);

    // 5. word/document.xml
    const bodyXml = [];
    let headingsCount = 0;
    let paragraphsCount = 0;
    let tablesCount = 0;

    for (const elem of elements) {
      if (elem.type === 'heading') {
        headingsCount++;
        const styleId = elem.level === 1 ? 'Heading1' : 'Heading2';
        bodyXml.push(`
          <w:p>
            <w:pPr><w:pStyle w:val="${styleId}"/></w:pPr>
            <w:r><w:t xml:space="preserve">${escapeXml(elem.text)}</w:t></w:r>
          </w:p>
        `);
      } else if (elem.type === 'list') {
        paragraphsCount++;
        bodyXml.push(`
          <w:p>
            <w:pPr>
              <w:ind w:left="480" w:hanging="240"/>
            </w:pPr>
            <w:r><w:t xml:space="preserve">• </w:t></w:r>
            <w:r><w:t xml:space="preserve">${escapeXml(elem.text)}</w:t></w:r>
          </w:p>
        `);
      } else if (elem.type === 'table') {
        tablesCount++;
        const tableRowsXml = [];
        for (let r = 0; r < elem.rows.length; r++) {
          const row = elem.rows[r];
          const isHeader = r === 0;
          const cellsXml = [];
          for (const cell of row) {
            cellsXml.push(`
              <w:tc>
                <w:tcPr>
                  <w:tcMar>
                    <w:top w:w="120" w:type="dxa"/>
                    <w:bottom w:w="120" w:type="dxa"/>
                    <w:left w:w="160" w:type="dxa"/>
                    <w:right w:w="160" w:type="dxa"/>
                  </w:tcMar>
                  ${isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/>' : ''}
                </w:tcPr>
                <w:p>
                  <w:r>
                    ${isHeader ? '<w:rPr><w:b/></w:rPr>' : ''}
                    <w:t xml:space="preserve">${escapeXml(cell.text)}</w:t>
                  </w:r>
                </w:p>
              </w:tc>
            `);
          }
          tableRowsXml.push(`<w:tr>${cellsXml.join('')}</w:tr>`);
        }

        bodyXml.push(`
          <w:tbl>
            <w:tblPr>
              <w:tblStyle w:val="TableGrid"/>
              <w:tblW w:w="0" w:type="auto"/>
            </w:tblPr>
            ${tableRowsXml.join('')}
          </w:tbl>
          <w:p/>
        `);
      } else {
        // Normal reflowable body paragraph
        paragraphsCount++;
        bodyXml.push(`
          <w:p>
            <w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto"/></w:pPr>
            <w:r><w:t xml:space="preserve">${escapeXml(elem.text)}</w:t></w:r>
          </w:p>
        `);
      }
    }

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml.join('')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    zip.file('word/document.xml', documentXml);

    const docxBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return {
      docxBytes,
      report: {
        success: true,
        elementsCount: elements.length,
        headingsCount,
        paragraphsCount,
        tablesCount,
        mode: options.mode || 'flow'
      }
    };
  }

  /**
   * Main entry point: converts PDF bytes into Microsoft Word (.docx) archive.
   */
  static async pdfToWord(pdfBytes, options = {}) {
    if (!pdfBytes) throw new Error('No PDF file provided for conversion to Word');

    if (typeof options.onProgress === 'function') {
      options.onProgress({ status: 'analyzing-pdf-tokens', current: 1, total: 3 });
    }

    // 1. Extract layout and structure
    const layout = await this.extractLayout(pdfBytes, options);

    if (typeof options.onProgress === 'function') {
      options.onProgress({ status: 'compiling-docx-xml', current: 2, total: 3 });
    }

    // 2. Compile into OpenXML DOCX archive
    const { docxBytes, report } = await this.compileDocx(layout.elements, options);

    if (typeof options.onProgress === 'function') {
      options.onProgress({ status: 'complete', current: 3, total: 3 });
    }

    return {
      docxBytes,
      report: {
        ...report,
        tokensFound: layout.itemsCount,
        linesExtracted: layout.linesCount
      }
    };
  }
}
