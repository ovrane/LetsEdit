/**
 * Adobe Acrobat Pro & iLovePDF PDF to Microsoft Excel (XLSX & CSV) Table Extraction Engine
 * Conforms to LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md (Cluster 5 & Task 61)
 *
 * Capabilities:
 * 1. Geometric table boundary recognition & baseline token clustering
 * 2. 2D grid matrix mapping (row, col) with multi-column gutter detection
 * 3. Number, currency, and percentage parser with optional formula normalization
 * 4. Dual output compilation: OpenXML Spreadsheet (.xlsx) via JSZip and RFC-4180 CSV
 * 5. createSampleFinancialTablePdf() generating realistic financial statements for testing
 * 6. 100% client-side zero-telemetry architecture
 */

import { PDFDocument, StandardFonts, rgb, PDFName, PDFArray } from 'pdf-lib';
import JSZip from 'jszip';
import { decompressStreamBytes, pdfHexToString } from '../../pdf-redactor.js';

function indexToColLetter(index) {
  let col = '';
  let temp = index + 1;
  while (temp > 0) {
    let rem = (temp - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    temp = Math.floor((temp - 1) / 26);
  }
  return col;
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class PdfToExcelOps {
  /**
   * Generates a realistic structured financial statement PDF with multi-tier headers,
   * vector table borders, and right-aligned numeric data.
   */
  static async createSampleFinancialTablePdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const marginX = 48;
    let cursorY = height - 54;

    // Document Header
    page.drawText('Q3 Condensed Consolidated Financial Statement', {
      x: marginX,
      y: cursorY,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.45)
    });
    cursorY -= 22;

    page.drawText('For the Nine Months Ended September 30, 2026 (Unaudited in USD)', {
      x: marginX,
      y: cursorY,
      size: 11,
      font: fontOblique,
      color: rgb(0.35, 0.4, 0.48)
    });
    cursorY -= 32;

    page.drawText('1. Statement of Financial Position (Consolidated Balance Sheet)', {
      x: marginX,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: rgb(0.15, 0.18, 0.25)
    });
    cursorY -= 24;

    // 4-Column Financial Table
    const colWidths = [190, 100, 105, 104];
    const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
    const rowHeight = 22;

    const tableData = [
      ['Asset Category', '2025 (USD)', '2026 (USD)', 'Growth %'],
      ['Cash and Liquid Equivalents', '$45,200,000', '$58,400,000', '+29.2%'],
      ['Short-Term Marketable Securities', '$12,800,000', '$15,100,000', '+18.0%'],
      ['Accounts Receivable', '$8,450,000', '$7,900,000', '-6.5%'],
      ['Property, Plant & Equipment', '$31,200,000', '$34,600,000', '+10.9%'],
      ['Total Operating Assets', '$97,650,000', '$116,000,000', '+18.8%']
    ];

    let currentY = cursorY;
    for (let r = 0; r < tableData.length; r++) {
      const row = tableData[r];
      const isHeader = r === 0;
      const isTotal = r === tableData.length - 1;
      let currentX = marginX;

      // Draw background
      if (isHeader) {
        page.drawRectangle({
          x: marginX,
          y: currentY - rowHeight + 4,
          width: totalTableWidth,
          height: rowHeight,
          color: rgb(0.12, 0.24, 0.54)
        });
      } else if (r % 2 === 1) {
        page.drawRectangle({
          x: marginX,
          y: currentY - rowHeight + 4,
          width: totalTableWidth,
          height: rowHeight,
          color: rgb(0.96, 0.97, 0.99)
        });
      }

      for (let c = 0; c < row.length; c++) {
        const text = row[c];
        const cellW = colWidths[c];
        const isNumericCol = c > 0 && !isHeader;

        // Draw cell border
        page.drawRectangle({
          x: currentX,
          y: currentY - rowHeight + 4,
          width: cellW,
          height: rowHeight,
          borderColor: isHeader ? rgb(0.2, 0.35, 0.65) : rgb(0.85, 0.88, 0.92),
          borderWidth: isTotal ? 1.0 : 0.5
        });

        const font = (isHeader || isTotal) ? fontBold : fontRegular;
        const fontSize = isHeader ? 9.5 : 9;
        const fontColor = isHeader
          ? rgb(1, 1, 1)
          : (isTotal ? rgb(0.08, 0.12, 0.22) : rgb(0.18, 0.2, 0.24));

        const textW = font.widthOfTextAtSize(text, fontSize);
        const textX = isNumericCol
          ? currentX + cellW - textW - 8
          : currentX + 8;
        const textY = currentY - rowHeight + 10;

        page.drawText(text, {
          x: textX,
          y: textY,
          size: fontSize,
          font,
          color: fontColor
        });

        currentX += cellW;
      }

      currentY -= rowHeight;
    }

    return await pdfDoc.save();
  }

  /**
   * Extracts text items and geometric coordinates from PDF bytes.
   */
  static async extractPdfTokens(pdfBytes, options = {}) {
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
          rawItems.push({
            page: p,
            x: tx[4],
            y: tx[5],
            text: item.str.trim(),
            fontSize: Math.abs(tx[0]) || 11
          });
        }
      }
    } else {
      // Path 2: Direct headless content stream parsing
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
            if (filter && (filter.encodedName === '/FlateDecode' || filter.toString() === '/FlateDecode')) {
              streamBytes = await decompressStreamBytes(streamBytes);
            }
          } catch (e) {}

          const streamStr = new TextDecoder('latin1').decode(streamBytes);
          this._parseStreamTokens(streamStr, pageNum, pageHeight, rawItems);
        }
      }
    }

    // Sort items top-to-bottom, left-to-right
    rawItems.sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 3.5) return yDiff;
      return a.x - b.x;
    });

    return rawItems;
  }

  static _parseStreamTokens(streamStr, pageNum, pageHeight, rawItems) {
    let currentX = 48;
    let currentY = pageHeight - 54;
    let currentFontSize = 11;

    const tokenRegex = /\/([\w\-]+)\s+([0-9.]+)\s+Tf|([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+Tm|([0-9.-]+)\s+([0-9.-]+)\s+Td|\(([^)]*)\)\s*(?:Tj|'|")|<([0-9a-fA-F]*)>\s*Tj|\[([^\]]*)\]\s*TJ/g;

    let match;
    while ((match = tokenRegex.exec(streamStr)) !== null) {
      if (match[1] && match[2]) {
        currentFontSize = parseFloat(match[2]) || currentFontSize;
        continue;
      }
      if (match[3] && match[7] && match[8]) {
        currentX = parseFloat(match[7]);
        currentY = parseFloat(match[8]);
        continue;
      }
      if (match[9] && match[10]) {
        currentX += parseFloat(match[9]);
        currentY += parseFloat(match[10]);
        continue;
      }
      if (match[11] !== undefined) {
        const text = match[11].trim();
        if (text) {
          rawItems.push({ page: pageNum, x: currentX, y: currentY, text, fontSize: currentFontSize });
        }
        continue;
      }
      if (match[12]) {
        const decoded = pdfHexToString(match[12]).trim();
        if (decoded) {
          rawItems.push({ page: pageNum, x: currentX, y: currentY, text: decoded, fontSize: currentFontSize });
        }
        continue;
      }
      if (match[13]) {
        const inside = match[13];
        const subLits = inside.match(/\(([^)]*)\)/g) || [];
        const fullStr = subLits.map(s => s.replace(/^\(|\)$/g, '')).join('').trim();
        if (fullStr) {
          rawItems.push({ page: pageNum, x: currentX, y: currentY, text: fullStr, fontSize: currentFontSize });
        }
      }
    }
  }

  /**
   * Clusters extracted tokens into lines and identifies tabular 2D row/column matrices.
   */
  static extractTablesFromTokens(tokens, options = {}) {
    const lines = [];
    let curLine = null;

    for (const t of tokens) {
      if (!curLine || curLine.page !== t.page || Math.abs(curLine.y - t.y) > 3.5) {
        if (curLine) lines.push(curLine);
        curLine = { page: t.page, y: t.y, items: [t] };
      } else {
        curLine.items.push(t);
      }
    }
    if (curLine) lines.push(curLine);

    // Identify candidate table lines (2 or more distinct columns)
    const tableCandidateLines = [];
    for (const l of lines) {
      l.items.sort((a, b) => a.x - b.x);
      if (l.items.length >= 2) {
        tableCandidateLines.push(l);
      }
    }

    if (tableCandidateLines.length === 0) {
      return [{
        name: 'Table 1',
        headers: ['Column 1'],
        rows: lines.map(l => [l.items.map(it => it.text).join(' ')])
      }];
    }

    // Cluster column X intervals across all candidate lines
    const colXPositions = [];
    for (const l of tableCandidateLines) {
      for (const it of l.items) {
        let matched = false;
        for (let c = 0; c < colXPositions.length; c++) {
          if (Math.abs(colXPositions[c] - it.x) < 24) {
            colXPositions[c] = (colXPositions[c] + it.x) / 2;
            matched = true;
            break;
          }
        }
        if (!matched) {
          colXPositions.push(it.x);
        }
      }
    }
    colXPositions.sort((a, b) => a - b);

    // Map each line's tokens into the nearest column slot
    const extractedRows = [];
    for (const l of tableCandidateLines) {
      const row = new Array(colXPositions.length).fill('');
      for (const it of l.items) {
        let bestCol = 0;
        let minDiff = Infinity;
        for (let c = 0; c < colXPositions.length; c++) {
          const diff = Math.abs(colXPositions[c] - it.x);
          if (diff < minDiff) {
            minDiff = diff;
            bestCol = c;
          }
        }
        row[bestCol] = row[bestCol] ? `${row[bestCol]} ${it.text}` : it.text;
      }
      extractedRows.push(row);
    }

    // Strip empty trailing columns
    const maxCols = Math.max(...extractedRows.map(r => {
      let lastNonEmpty = -1;
      for (let i = r.length - 1; i >= 0; i--) {
        if (r[i] && r[i].trim() !== '') {
          lastNonEmpty = i;
          break;
        }
      }
      return lastNonEmpty + 1;
    }), 1);

    const cleanRows = extractedRows.map(r => r.slice(0, maxCols));

    return [{
      name: 'Extracted Financial Table',
      headers: cleanRows[0] || [],
      rows: cleanRows
    }];
  }

  /**
   * Normalizes financial and formatted values into clean raw numbers if enabled.
   * e.g. "$45,200,000" -> 45200000, "29.2%" -> 0.292, "(1,500.00)" -> -1500.00
   */
  static normalizeCellValue(val, shouldNormalize = false) {
    if (!val || typeof val !== 'string') return { value: '', isNumeric: false };
    const clean = val.trim();
    if (!shouldNormalize) {
      return { value: clean, isNumeric: false };
    }

    // Percentage: 29.2% -> 0.292 or 29.2
    if (/^-?[\d,]+(\.\d+)?%$/.test(clean)) {
      const num = parseFloat(clean.replace(/[%,]/g, ''));
      if (!isNaN(num)) return { value: num / 100, isNumeric: true };
    }

    // Parentheses negative: ($1,500.00) -> -1500
    if (/^\([$€£¥]?[\d,]+(\.\d+)?\)$/.test(clean)) {
      const num = parseFloat(clean.replace(/[\(\)$€£¥,]/g, ''));
      if (!isNaN(num)) return { value: -num, isNumeric: true };
    }

    // Standard Currency or Integer/Float: $45,200,000 -> 45200000
    if (/^-?[$€£¥]?[\d,]+(\.\d+)?$/.test(clean)) {
      const num = parseFloat(clean.replace(/[$€£¥,]/g, ''));
      if (!isNaN(num)) return { value: num, isNumeric: true };
    }

    return { value: clean, isNumeric: false };
  }

  /**
   * Compiles extracted 2D table rows into a valid Microsoft Excel OpenXML (.xlsx) archive.
   */
  static async compileXlsx(tables, options = {}) {
    const zip = new JSZip();
    const normalize = options.normalizeNumbers === true;

    // 1. [Content_Types].xml
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`);

    // 2. _rels/.rels
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

    // 3. xl/_rels/workbook.xml.rels
    zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

    // 4. xl/workbook.xml
    const sheetTitle = options.sheetName || 'Extracted Table';
    zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetTitle)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`);

    // 5. xl/styles.xml
    zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/></border>
    <border>
      <left style="thin"><color rgb="FFD1D5DB"/></left>
      <right style="thin"><color rgb="FFD1D5DB"/></right>
      <top style="thin"><color rgb="FFD1D5DB"/></top>
      <bottom style="thin"><color rgb="FFD1D5DB"/></bottom>
    </border>
  </borders>
  <cellXfs count="3">
    <xf fontId="0" fillId="0" borderId="1" applyBorder="1"/>
    <xf fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf fontId="0" fillId="0" borderId="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`);

    // 6. Collect cells, shared strings, and build sheet1.xml
    const sharedStrings = [];
    const stringMap = new Map();

    function getSharedStringIndex(str) {
      if (stringMap.has(str)) return stringMap.get(str);
      const idx = sharedStrings.length;
      sharedStrings.push(str);
      stringMap.set(str, idx);
      return idx;
    }

    const rowsXml = [];
    let rowNum = 1;

    for (const table of tables) {
      for (let rIdx = 0; rIdx < table.rows.length; rIdx++) {
        const rowData = table.rows[rIdx];
        const isHeader = rIdx === 0;
        const cellsXml = [];

        for (let cIdx = 0; cIdx < rowData.length; cIdx++) {
          const colLetter = indexToColLetter(cIdx);
          const cellRef = `${colLetter}${rowNum}`;
          const rawCell = rowData[cIdx] || '';
          const normalized = this.normalizeCellValue(rawCell, normalize && !isHeader);

          if (normalized.isNumeric) {
            // Write native Excel number
            cellsXml.push(`<c r="${cellRef}" s="0"><v>${normalized.value}</v></c>`);
          } else {
            // Write shared string
            const sstIdx = getSharedStringIndex(normalized.value);
            const styleIdx = isHeader ? 1 : 0;
            cellsXml.push(`<c r="${cellRef}" t="s" s="${styleIdx}"><v>${sstIdx}</v></c>`);
          }
        }

        rowsXml.push(`<row r="${rowNum}">${cellsXml.join('')}</row>`);
        rowNum++;
      }
      rowNum++; // blank row between multiple tables
    }

    // 7. xl/sharedStrings.xml
    const sstXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">
  ${sharedStrings.map(s => `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`).join('')}
</sst>`;
    zip.file('xl/sharedStrings.xml', sstXml);

    // 8. xl/worksheets/sheet1.xml
    zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${rowsXml.join('')}
  </sheetData>
</worksheet>`);

    const xlsxBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return xlsxBytes;
  }

  /**
   * Compiles extracted 2D table rows into RFC-4180 compliant CSV string.
   */
  static compileCsv(tables) {
    const lines = [];
    for (const table of tables) {
      for (const row of table.rows) {
        const escapedCells = row.map(cell => {
          const str = String(cell || '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        lines.push(escapedCells.join(','));
      }
      lines.push(''); // blank row separating tables
    }
    return lines.join('\r\n');
  }

  /**
   * Main entry point: extracts tables from PDF and returns XLSX or CSV.
   */
  static async pdfToExcel(pdfBytes, options = {}) {
    if (!pdfBytes) throw new Error('No PDF file provided for table extraction');

    const format = options.format === 'csv' ? 'csv' : 'xlsx';
    const tokens = await this.extractPdfTokens(pdfBytes, options);
    const tables = this.extractTablesFromTokens(tokens, options);

    const totalRows = tables.reduce((acc, t) => acc + t.rows.length, 0);
    const maxCols = Math.max(...tables.map(t => t.rows[0]?.length || 0), 1);

    if (format === 'csv') {
      const csvText = this.compileCsv(tables);
      const csvBytes = new TextEncoder().encode(csvText);
      return {
        csvText,
        fileBytes: csvBytes,
        report: {
          success: true,
          format: 'csv',
          tablesCount: tables.length,
          rowsExtracted: totalRows,
          columnsCount: maxCols
        }
      };
    }

    const xlsxBytes = await this.compileXlsx(tables, options);
    return {
      xlsxBytes,
      fileBytes: xlsxBytes,
      report: {
        success: true,
        format: 'xlsx',
        tablesCount: tables.length,
        rowsExtracted: totalRows,
        columnsCount: maxCols
      }
    };
  }
}
