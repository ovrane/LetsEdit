/**
 * Adobe Acrobat Pro & iLovePDF Microsoft Excel (XLSX & CSV) to Vector PDF Typesetter
 * Conforms to LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md (Cluster 5 & Task 60)
 *
 * Capabilities:
 * 1. OpenXML XLSX unpacker via JSZip (workbook.xml, sheet*.xml, sharedStrings.xml, styles.xml)
 * 2. RFC-4180 compliant multi-line CSV parser with quoted delimiter handling
 * 3. Tabular layout engine with auto-fit column widths and text width constraints
 * 4. Multi-sheet workbook support rendering distinct sections or tabs
 * 5. Page pagination & fit modes: Fit All Columns to 1 Page Width, Fit Whole Sheet, No Scaling
 * 6. Visual styling: corporate header styling, zebra striping, vector gridlines, right-aligned numbers
 * 7. createSampleXlsxFile() generating multi-sheet financial forecast workbook for testing
 * 8. 100% client-side zero-telemetry architecture
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

function colLetterToIndex(colStr) {
  let index = 0;
  for (let i = 0; i < colStr.length; i++) {
    index = index * 26 + (colStr.charCodeAt(i) - 64);
  }
  return index - 1;
}

function parseCellRef(ref) {
  const match = ref.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return { col: 0, row: 0 };
  return {
    col: colLetterToIndex(match[1]),
    row: parseInt(match[2], 10) - 1
  };
}

function decodeXmlEntities(str) {
  if (!str) return '';
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export class ExcelToPdfOps {
  /**
   * Generates a valid multi-sheet binary Microsoft Excel (.xlsx) archive
   * containing a realistic Q4 Financial Forecast and Operating Expenses model.
   */
  static async createSampleXlsxFile() {
    const zip = new JSZip();

    // 1. [Content_Types].xml
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
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
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

    // 4. xl/workbook.xml
    zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Revenue &amp; Margins" sheetId="1" r:id="rId1"/>
    <sheet name="Operating Expenses" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`);

    // 5. xl/styles.xml
    zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/></border></borders>
  <cellXfs count="1"><xf fontId="0" fillId="0" borderId="0"/></cellXfs>
</styleSheet>`);

    // 6. xl/sharedStrings.xml
    const sharedStrings = [
      'Product Line', 'Q1 Actual', 'Q2 Actual', 'Q3 Forecast', 'Q4 Target', 'Annual Total', 'Margin %',
      'Enterprise PDF SDK', '124,500', '142,000', '168,000', '195,000', '629,500', '84.2%',
      'Cloud Document API', '88,000', '96,500', '112,000', '135,000', '431,500', '78.5%',
      'Desktop Pro Editor', '45,200', '52,100', '58,400', '66,000', '221,700', '71.0%',
      'Expense Category', 'Budget (USD)', 'Actual (USD)', 'Variance', 'Status',
      'Cloud Infrastructure', '45,000', '42,300', '-2,700', 'On Track',
      'Security & Audits', '25,000', '24,800', '-200', 'Completed',
      'Engineering Payroll', '180,000', '178,500', '-1,500', 'On Target'
    ];

    const sstXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">
  ${sharedStrings.map(s => `<si><t>${s.replace(/&/g, '&amp;')}</t></si>`).join('')}
</sst>`;
    zip.file('xl/sharedStrings.xml', sstXml);

    // 7. xl/worksheets/sheet1.xml (Revenue & Margins)
    zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c>
      <c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c><c r="F1" t="s"><v>5</v></c><c r="G1" t="s"><v>6</v></c>
    </row>
    <row r="2">
      <c r="A2" t="s"><v>7</v></c><c r="B2" t="s"><v>8</v></c><c r="C2" t="s"><v>9</v></c>
      <c r="D2" t="s"><v>10</v></c><c r="E2" t="s"><v>11</v></c><c r="F2" t="s"><v>12</v></c><c r="G2" t="s"><v>13</v></c>
    </row>
    <row r="3">
      <c r="A3" t="s"><v>14</v></c><c r="B3" t="s"><v>15</v></c><c r="C3" t="s"><v>16</v></c>
      <c r="D3" t="s"><v>17</v></c><c r="E3" t="s"><v>18</v></c><c r="F3" t="s"><v>19</v></c><c r="G3" t="s"><v>20</v></c>
    </row>
    <row r="4">
      <c r="A4" t="s"><v>21</v></c><c r="B4" t="s"><v>22</v></c><c r="C4" t="s"><v>23</v></c>
      <c r="D4" t="s"><v>24</v></c><c r="E4" t="s"><v>25</v></c><c r="F4" t="s"><v>26</v></c><c r="G4" t="s"><v>27</v></c>
    </row>
  </sheetData>
</worksheet>`);

    // 8. xl/worksheets/sheet2.xml (Operating Expenses)
    zip.file('xl/worksheets/sheet2.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="s"><v>28</v></c><c r="B1" t="s"><v>29</v></c><c r="C1" t="s"><v>30</v></c><c r="D1" t="s"><v>31</v></c><c r="E1" t="s"><v>32</v></c>
    </row>
    <row r="2">
      <c r="A2" t="s"><v>33</v></c><c r="B2" t="s"><v>34</v></c><c r="C2" t="s"><v>35</v></c><c r="D2" t="s"><v>36</v></c><c r="E2" t="s"><v>37</v></c>
    </row>
    <row r="3">
      <c r="A3" t="s"><v>38</v></c><c r="B3" t="s"><v>39</v></c><c r="C3" t="s"><v>40</v></c><c r="D3" t="s"><v>41</v></c><c r="E3" t="s"><v>42</v></c>
    </row>
    <row r="4">
      <c r="A4" t="s"><v>43</v></c><c r="B4" t="s"><v>44</v></c><c r="C4" t="s"><v>45</v></c><c r="D4" t="s"><v>46</v></c><c r="E4" t="s"><v>47</v></c>
    </row>
  </sheetData>
</worksheet>`);

    return await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  /**
   * Parses raw file input (XLSX binary or CSV text) into structured sheets and 2D row/cell matrices.
   */
  static async parseSpreadsheetInput(fileInput) {
    let bytes = fileInput;
    if (typeof fileInput === 'string') {
      // Check if it's a CSV string
      if (fileInput.includes(',') || fileInput.includes('\n')) {
        return [{
          name: 'Sheet1',
          rows: this._parseCsvString(fileInput)
        }];
      }
      bytes = new TextEncoder().encode(fileInput);
    }

    const u8 = new Uint8Array(bytes);
    const isZip = u8[0] === 0x50 && u8[1] === 0x4B; // 'PK'

    if (!isZip) {
      // Treat as UTF-8 CSV text
      const csvText = new TextDecoder('utf-8').decode(u8);
      return [{
        name: 'Sheet1',
        rows: this._parseCsvString(csvText)
      }];
    }

    // Unpack OpenXML XLSX archive
    const zip = await JSZip.loadAsync(bytes);

    // 1. Parse shared strings table
    const sharedStrings = [];
    const sstFile = zip.file('xl/sharedStrings.xml');
    if (sstFile) {
      const sstXml = await sstFile.async('text');
      const siMatches = sstXml.match(/<si>[\s\S]*?<\/si>/g) || [];
      for (const si of siMatches) {
        const tMatches = si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
        const text = tMatches.map(t => decodeXmlEntities(t.replace(/<[^>]+>/g, ''))).join('');
        sharedStrings.push(text);
      }
    }

    // 2. Parse sheet definitions from workbook.xml
    const sheetsMeta = [];
    const wbFile = zip.file('xl/workbook.xml');
    if (wbFile) {
      const wbXml = await wbFile.async('text');
      const sheetMatches = wbXml.match(/<sheet\s+[^>]*\/>/g) || [];
      let index = 1;
      for (const sm of sheetMatches) {
        const nameMatch = sm.match(/name="([^"]+)"/);
        const name = nameMatch ? decodeXmlEntities(nameMatch[1]) : `Sheet${index}`;
        sheetsMeta.push({ name, path: `xl/worksheets/sheet${index}.xml` });
        index++;
      }
    }

    if (sheetsMeta.length === 0) {
      // Fallback: discover any sheet*.xml files
      zip.forEach((path) => {
        if (/xl\/worksheets\/sheet\d+\.xml/i.test(path)) {
          const num = path.replace(/[^0-9]/g, '') || '1';
          sheetsMeta.push({ name: `Sheet${num}`, path });
        }
      });
    }

    const resultSheets = [];

    // 3. Parse each worksheet
    for (const meta of sheetsMeta) {
      const sheetFile = zip.file(meta.path);
      if (!sheetFile) continue;

      const sheetXml = await sheetFile.async('text');
      const rowGrid = [];

      const rowMatches = sheetXml.match(/<row\s+[^>]*>[\s\S]*?<\/row>/g) || [];
      for (const rXml of rowMatches) {
        const cMatches = rXml.match(/<c\s+[^>]*>[\s\S]*?<\/c>|<c\s+[^>]*\/>/g) || [];
        const rowCells = [];

        for (const cXml of cMatches) {
          const rAttr = cXml.match(/r="([A-Z0-9]+)"/);
          const tAttr = cXml.match(/t="([a-z]+)"/);
          const vMatch = cXml.match(/<v>([\s\S]*?)<\/v>/);
          const isMatch = cXml.match(/<is><t[^>]*>([\s\S]*?)<\/t><\/is>/);

          const cellRef = rAttr ? parseCellRef(rAttr[1]) : { col: rowCells.length, row: 0 };
          const cellType = tAttr ? tAttr[1] : 'n';

          let val = '';
          if (cellType === 's' && vMatch) {
            const sstIdx = parseInt(vMatch[1], 10);
            val = sharedStrings[sstIdx] || '';
          } else if (cellType === 'inlineStr' && isMatch) {
            val = decodeXmlEntities(isMatch[1]);
          } else if (vMatch) {
            val = decodeXmlEntities(vMatch[1]);
          }

          while (rowCells.length < cellRef.col) {
            rowCells.push('');
          }
          rowCells[cellRef.col] = val.trim();
        }

        if (rowCells.some(c => c !== '')) {
          rowGrid.push(rowCells);
        }
      }

      if (rowGrid.length > 0) {
        resultSheets.push({
          name: meta.name,
          rows: rowGrid
        });
      }
    }

    return resultSheets.length > 0 ? resultSheets : [{ name: 'Sheet1', rows: [['No Data Found']] }];
  }

  /**
   * RFC-4180 compliant CSV parser.
   */
  static _parseCsvString(csvText) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;
    let i = 0;

    while (i < csvText.length) {
      const char = csvText[i];
      const next = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          currentCell += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }

      if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      }

      if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && next === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        i++;
        continue;
      }

      currentCell += char;
      i++;
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c !== '')) {
        rows.push(currentRow);
      }
    }

    return rows.length > 0 ? rows : [['']];
  }

  /**
   * Typesets parsed spreadsheet sheets into a vector PDF document with custom fit modes,
   * page orientation, corporate headers, zebra striping, and vector cell borders.
   */
  static async excelToPdf(fileInput, options = {}) {
    if (!fileInput) throw new Error('No spreadsheet file provided for conversion to PDF');

    const sheets = await this.parseSpreadsheetInput(fileInput);
    const pdfDoc = await PDFDocument.create();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fitMode = options.fitMode || 'fit-columns'; // 'fit-columns' | 'fit-sheet' | 'none'
    const requestedOrientation = options.orientation || 'auto'; // 'auto' | 'landscape' | 'portrait'
    const pageSize = options.pageSize || 'a4'; // 'a4' | 'letter' | 'legal'
    const showGridlines = options.gridlines !== false;
    const showZebra = options.zebra !== false;

    // Dimensions in points
    let baseWidth = 595.28;
    let baseHeight = 841.89;
    if (pageSize === 'letter') {
      baseWidth = 612.0;
      baseHeight = 792.0;
    } else if (pageSize === 'legal') {
      baseWidth = 612.0;
      baseHeight = 1008.0;
    }

    const margin = 36;
    let totalPagesGenerated = 0;
    let totalRowsRendered = 0;

    for (const sheet of sheets) {
      const rows = sheet.rows;
      if (!rows || rows.length === 0) continue;

      // Determine maximum columns count
      const maxCols = Math.max(...rows.map(r => r.length), 1);

      // Determine page orientation
      let isLandscape = requestedOrientation === 'landscape';
      if (requestedOrientation === 'auto') {
        isLandscape = maxCols >= 6;
      } else if (requestedOrientation === 'portrait') {
        isLandscape = false;
      }

      const pageWidth = isLandscape ? baseHeight : baseWidth;
      const pageHeight = isLandscape ? baseWidth : baseHeight;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      // Calculate natural column widths based on maximum content
      const colWidths = new Array(maxCols).fill(0);
      for (const row of rows) {
        for (let c = 0; c < maxCols; c++) {
          const text = String(row[c] || '');
          const w = fontRegular.widthOfTextAtSize(text, 9) + 16;
          if (w > colWidths[c]) colWidths[c] = w;
        }
      }

      // Ensure minimum column width
      for (let c = 0; c < maxCols; c++) {
        if (colWidths[c] < 45) colWidths[c] = 45;
      }

      const totalNaturalWidth = colWidths.reduce((a, b) => a + b, 0);

      // Scale column widths to fit page width if fitMode === 'fit-columns' or 'fit-sheet'
      let effectiveColWidths = [...colWidths];
      let rowHeight = 22;
      let fontSize = 9;
      let headerFontSize = 9.5;

      if (fitMode === 'fit-columns' || (fitMode === 'fit-sheet' && totalNaturalWidth > printableWidth)) {
        const scaleFactor = printableWidth / totalNaturalWidth;
        effectiveColWidths = colWidths.map(w => Math.max(30, w * scaleFactor));
      }

      // In fit-sheet mode, scale row height if necessary to fit on one page
      if (fitMode === 'fit-sheet') {
        const availableTableH = printableHeight - 50;
        const naturalTableH = rows.length * rowHeight;
        if (naturalTableH > availableTableH) {
          rowHeight = Math.max(14, availableTableH / rows.length);
          fontSize = Math.max(7, Math.min(9, rowHeight * 0.45));
          headerFontSize = fontSize + 0.5;
        }
      }

      const effectiveTableWidth = effectiveColWidths.reduce((a, b) => a + b, 0);

      // Pagination rendering
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      totalPagesGenerated++;

      let cursorY = pageHeight - margin;

      // Draw Sheet Header
      page.drawText(sheet.name, {
        x: margin,
        y: cursorY - 14,
        size: 14,
        font: fontBold,
        color: rgb(0.12, 0.16, 0.28)
      });
      cursorY -= 32;

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const isHeader = r === 0;

        // Check if row exceeds printable height (except in fit-sheet mode)
        if (fitMode !== 'fit-sheet' && cursorY - rowHeight < margin + 20) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          totalPagesGenerated++;
          cursorY = pageHeight - margin - 20;

          // Repeat header row on new page
          this._renderRow(page, rows[0], 0, true, margin, cursorY, effectiveColWidths, effectiveTableWidth, rowHeight, headerFontSize, fontBold, showGridlines, showZebra);
          cursorY -= rowHeight;
        }

        this._renderRow(page, row, r, isHeader, margin, cursorY, effectiveColWidths, effectiveTableWidth, rowHeight, isHeader ? headerFontSize : fontSize, isHeader ? fontBold : fontRegular, showGridlines, showZebra);
        cursorY -= rowHeight;
        totalRowsRendered++;
      }
    }

    const pdfBytes = await pdfDoc.save();

    return {
      pdfBytes,
      report: {
        success: true,
        sheetsCount: sheets.length,
        pagesGenerated: totalPagesGenerated,
        rowsRendered: totalRowsRendered,
        fitMode,
        orientation: requestedOrientation
      }
    };
  }

  static _renderRow(page, row, rowIndex, isHeader, margin, y, colWidths, tableWidth, rowHeight, fontSize, font, showGridlines, showZebra) {
    const rowTop = y;
    const rowBottom = y - rowHeight;

    // Background Fill
    if (isHeader) {
      page.drawRectangle({
        x: margin,
        y: rowBottom,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.12, 0.24, 0.54) // Corporate Navy Blue
      });
    } else if (showZebra && rowIndex % 2 === 1) {
      page.drawRectangle({
        x: margin,
        y: rowBottom,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.97, 0.98, 0.99) // Subtle Zebra Stripe
      });
    }

    let cellX = margin;
    for (let c = 0; c < colWidths.length; c++) {
      const cellText = String(row[c] || '');
      const cellW = colWidths[c];
      const isNumeric = /^-?\$?[\d,]+(\.\d+)?%?$/.test(cellText.trim()) && cellText.trim() !== '';

      // Truncate text if needed
      let display = cellText;
      while (display.length > 0 && font.widthOfTextAtSize(display, fontSize) > cellW - 10) {
        display = display.slice(0, -1);
      }
      if (display.length < cellText.length && display.length > 2) {
        display = display.slice(0, -1) + '…';
      }

      const textWidth = font.widthOfTextAtSize(display, fontSize);
      // Right-align numbers, left-align text
      const textX = isNumeric && !isHeader
        ? cellX + cellW - textWidth - 6
        : cellX + 6;

      const textY = rowBottom + (rowHeight - fontSize) / 2 + 1;

      page.drawText(display, {
        x: textX,
        y: textY,
        size: fontSize,
        font,
        color: isHeader ? rgb(1, 1, 1) : rgb(0.15, 0.18, 0.22)
      });

      // Gridline vertical divider
      if (showGridlines && c > 0) {
        page.drawLine({
          start: { x: cellX, y: rowBottom },
          end: { x: cellX, y: rowTop },
          thickness: 0.5,
          color: isHeader ? rgb(0.2, 0.35, 0.65) : rgb(0.88, 0.9, 0.93)
        });
      }

      cellX += cellW;
    }

    // Gridline horizontal bottom border
    if (showGridlines) {
      page.drawLine({
        start: { x: margin, y: rowBottom },
        end: { x: margin + tableWidth, y: rowBottom },
        thickness: 0.5,
        color: isHeader ? rgb(0.1, 0.2, 0.45) : rgb(0.86, 0.88, 0.92)
      });
    }
  }
}
