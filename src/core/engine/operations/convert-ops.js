/**
 * Document Format Conversion Operations
 * Handles images to PDF, HTML to PDF, Word (DOCX) to PDF, Excel (XLSX/CSV) to PDF,
 * and PowerPoint (PPTX) to PDF.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export class ConvertOps {
  /**
   * Converts an array of images into a clean PDF with custom orientation and margins.
   */
  static async imagesToPdf(imagesList, options = {}) {
    const finalDoc = await PDFDocument.create();
    const orientation = options.orientation || 'portrait';
    const margin = typeof options.margin === 'number' ? options.margin : (parseInt(options.margin, 10) || 0);

    const baseW = 595.28;
    const baseH = 841.89;
    const pageW = orientation === 'landscape' ? baseH : baseW;
    const pageH = orientation === 'landscape' ? baseW : baseH;

    for (const item of imagesList) {
      let imgBytes = item.bytes;
      if (!imgBytes && item.dataUrl) {
        if (typeof fetch !== 'undefined') {
          imgBytes = await fetch(item.dataUrl).then(r => r.arrayBuffer());
        }
      }
      if (!imgBytes) continue;

      let embeddedImg;
      const u8 = new Uint8Array(imgBytes);
      const isPng = u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47;
      const isJpg = (u8[0] === 0xFF && u8[1] === 0xD8) || (!isPng && (item.isJpg || (item.name && (item.name.toLowerCase().endsWith('.jpg') || item.name.toLowerCase().endsWith('.jpeg')))));

      if (isJpg) {
        embeddedImg = await finalDoc.embedJpg(imgBytes);
      } else {
        embeddedImg = await finalDoc.embedPng(imgBytes);
      }

      const imgDims = embeddedImg.scale(1.0);
      const availW = Math.max(20, pageW - margin * 2);
      const availH = Math.max(20, pageH - margin * 2);
      const scale = Math.min(availW / imgDims.width, availH / imgDims.height);
      const scaledW = imgDims.width * scale;
      const scaledH = imgDims.height * scale;

      const page = finalDoc.addPage([pageW, pageH]);
      page.drawImage(embeddedImg, {
        x: margin + (availW - scaledW) / 2,
        y: margin + (availH - scaledH) / 2,
        width: scaledW,
        height: scaledH
      });
    }

    return await finalDoc.save();
  }

  /**
   * Converts HTML string / text into a vector PDF document.
   */
  static async htmlToPdf(htmlString, options = {}) {
    const title = options.title || 'HTML Document';
    const lines = htmlString.replace(/<[^>]+>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 800;

    page.drawText(title, { x: 50, y, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 30;

    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }
      const words = line.split(' ');
      let curLine = '';
      for (const w of words) {
        const testLine = curLine ? `${curLine} ${w}` : w;
        if (font.widthOfTextAtSize(testLine, 10.5) > 495) {
          page.drawText(curLine, { x: 50, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
          y -= 15;
          if (y < 60) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 800;
          }
          curLine = w;
        } else {
          curLine = testLine;
        }
      }
      if (curLine) {
        page.drawText(curLine, { x: 50, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 18;
      }
    }

    return await pdfDoc.save();
  }

  /**
   * Converts Word DOCX byte stream or plain text into a vector PDF document.
   */
  static async wordToPdf(docxBytes, options = {}) {
    let paragraphs = [];
    try {
      const zip = await JSZip.loadAsync(docxBytes);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
        if (parser) {
          const xmlDoc = parser.parseFromString(docXml, 'text/xml');
          paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p')).map(p => {
            return Array.from(p.getElementsByTagName('w:t')).map(t => t.textContent).join('');
          }).filter(Boolean);
        } else {
          // Node.js regex fallback for testing environment
          const matches = docXml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
          paragraphs = matches.map(m => m.replace(/<[^>]+>/g, '')).filter(Boolean);
        }
      }
    } catch (e) {
      // Fallback
    }

    if (paragraphs.length === 0) {
      const textDecoder = new TextDecoder('utf-8');
      paragraphs = textDecoder.decode(docxBytes).replace(/[^\x20-\x7E\n]/g, ' ').split('\n').map(l => l.trim()).filter(l => l.length > 2);
    }

    const title = options.title || 'Word Document';
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 800;

    page.drawText(title, { x: 50, y, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 30;

    for (const para of paragraphs) {
      if (y < 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }
      const words = para.split(' ');
      let curLine = '';
      for (const w of words) {
        const testLine = curLine ? `${curLine} ${w}` : w;
        if (font.widthOfTextAtSize(testLine, 11) > 495) {
          page.drawText(curLine, { x: 50, y, size: 11, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 16;
          if (y < 60) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 800;
          }
          curLine = w;
        } else {
          curLine = testLine;
        }
      }
      if (curLine) {
        page.drawText(curLine, { x: 50, y, size: 11, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 20;
      }
    }

    return await pdfDoc.save();
  }

  /**
   * Converts Excel spreadsheets (.xlsx, .xls, .csv) into a styled vector PDF table document.
   */
  static async excelToPdf(fileBytes, options = {}) {
    let rows = [];
    const isCsv = options.isCsv || false;

    // 1. Try parsing as OpenXML XLSX package
    if (!isCsv) {
      try {
        const zip = await JSZip.loadAsync(fileBytes);
        // Shared strings table
        const sharedStrings = [];
        const ssXml = await zip.file('xl/sharedStrings.xml')?.async('text');
        if (ssXml) {
          const ssMatches = ssXml.match(/<t[^>]*>([^<]+)<\/t>/g) || [];
          for (const m of ssMatches) {
            sharedStrings.push(m.replace(/<[^>]+>/g, ''));
          }
        }

        // Sheet 1 worksheet
        const sheetXml = await zip.file('xl/worksheets/sheet1.xml')?.async('text');
        if (sheetXml) {
          const rowMatches = sheetXml.match(/<row[^>]*>[\s\S]*?<\/row>/g) || [];
          for (const rMatch of rowMatches) {
            const cells = [];
            const cellMatches = rMatch.match(/<c[^>]*>[\s\S]*?<\/c>/g) || [];
            for (const cMatch of cellMatches) {
              const isShared = cMatch.includes('t="s"');
              const valMatch = cMatch.match(/<v>([^<]+)<\/v>/);
              if (valMatch) {
                const val = valMatch[1];
                if (isShared && sharedStrings[parseInt(val, 10)] !== undefined) {
                  cells.push(sharedStrings[parseInt(val, 10)]);
                } else {
                  cells.push(val);
                }
              } else {
                const tMatch = cMatch.match(/<t[^>]*>([^<]+)<\/t>/);
                cells.push(tMatch ? tMatch[1] : '');
              }
            }
            if (cells.some(c => c && c.trim())) {
              rows.push(cells);
            }
          }
        }
      } catch (e) {
        // Fall through to CSV parsing
      }
    }

    // 2. CSV / Plain Text Fallback
    if (rows.length === 0) {
      const textDecoder = new TextDecoder('utf-8');
      const text = typeof fileBytes === 'string' ? fileBytes : textDecoder.decode(fileBytes);
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        // Split by tab or comma (handling quoted values simply)
        const delimiter = line.includes('\t') ? '\t' : ',';
        const cols = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cols.some(c => c)) {
          rows.push(cols);
        }
      }
    }

    if (rows.length === 0) {
      rows = [['No data available']];
    }

    // Determine max columns
    const maxCols = Math.max(...rows.map(r => r.length), 1);
    // Pad rows so each has maxCols
    rows = rows.map(r => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    const isLandscape = options.orientation === 'landscape' || maxCols > 4;
    const pageWidth = isLandscape ? 841.89 : 595.28;
    const pageHeight = isLandscape ? 595.28 : 841.89;
    const margin = 40;
    const tableWidth = pageWidth - (margin * 2);

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Compute column widths proportionally
    const colWidth = tableWidth / maxCols;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin - 20;

    // Document Title
    const title = options.title || 'Spreadsheet Report';
    page.drawText(title, {
      x: margin,
      y,
      size: 16,
      font: helveticaBold,
      color: rgb(0.12, 0.16, 0.22)
    });
    y -= 30;

    const rowHeight = 22;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      if (y < margin + 25) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin - 20;
      }

      const row = rows[rIdx];
      const isHeader = rIdx === 0;

      // Row background
      if (isHeader) {
        page.drawRectangle({
          x: margin,
          y: y - 5,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.15, 0.39, 0.92) // Primary Blue
        });
      } else if (rIdx % 2 === 1) {
        page.drawRectangle({
          x: margin,
          y: y - 5,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.96, 0.97, 0.98) // Light zebra
        });
      }

      // Draw cell text
      for (let cIdx = 0; cIdx < maxCols; cIdx++) {
        const cellText = String(row[cIdx] || '');
        const font = isHeader ? helveticaBold : helvetica;
        const fontColor = isHeader ? rgb(1, 1, 1) : rgb(0.15, 0.15, 0.15);
        const fontSize = isHeader ? 10 : 9;

        // Truncate text if it overflows cell width
        let displayStr = cellText;
        while (displayStr.length > 0 && font.widthOfTextAtSize(displayStr, fontSize) > colWidth - 10) {
          displayStr = displayStr.slice(0, -1);
        }
        if (displayStr.length < cellText.length && displayStr.length > 3) {
          displayStr = displayStr.slice(0, -2) + '…';
        }

        const cellX = margin + (cIdx * colWidth) + 5;
        const cellY = y + 2;

        page.drawText(displayStr, {
          x: cellX,
          y: cellY,
          size: fontSize,
          font,
          color: fontColor
        });

        // Vertical cell divider
        if (cIdx > 0) {
          page.drawLine({
            start: { x: margin + (cIdx * colWidth), y: y - 5 },
            end: { x: margin + (cIdx * colWidth), y: y - 5 + rowHeight },
            thickness: 0.5,
            color: isHeader ? rgb(0.3, 0.5, 0.95) : rgb(0.85, 0.88, 0.92)
          });
        }
      }

      // Horizontal row line
      page.drawLine({
        start: { x: margin, y: y - 5 },
        end: { x: margin + tableWidth, y: y - 5 },
        thickness: 0.5,
        color: rgb(0.82, 0.85, 0.9)
      });

      y -= rowHeight;
    }

    return await pdfDoc.save();
  }

  /**
   * Converts PowerPoint presentation (.pptx) packages into formatted presentation PDF slides.
   */
  static async pptToPdf(pptxBytes, options = {}) {
    let slides = [];

    // 1. Try unpacking OpenXML PPTX slides via JSZip
    try {
      const zip = await JSZip.loadAsync(pptxBytes);
      const slideFiles = [];

      zip.forEach((relativePath) => {
        if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
          slideFiles.push(relativePath);
        }
      });

      // Sort slide files numerically (slide1, slide2, ..., slide10)
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
        return numA - numB;
      });

      for (const slidePath of slideFiles) {
        const xml = await zip.file(slidePath)?.async('text');
        if (!xml) continue;

        // Extract shape text blocks
        const textBlocks = [];
        const shapeMatches = xml.match(/<p:sp>[\s\S]*?<\/p:sp>/g) || [];
        for (const sp of shapeMatches) {
          const tMatches = sp.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
          const text = tMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
          if (text) {
            textBlocks.push(text);
          }
        }

        if (textBlocks.length > 0) {
          const title = textBlocks[0];
          const content = textBlocks.slice(1);
          slides.push({ title, content });
        }
      }
    } catch (e) {
      // Fallback
    }

    // 2. Text fallback if PPTX extraction yielded nothing
    if (slides.length === 0) {
      const textDecoder = new TextDecoder('utf-8');
      const text = typeof pptxBytes === 'string' ? pptxBytes : textDecoder.decode(pptxBytes);
      const clean = text.replace(/[^\x20-\x7E\n]/g, ' ').trim();
      const chunks = clean.split(/(?:---|===|Slide \d+)/i).map(c => c.trim()).filter(c => c.length > 5);

      if (chunks.length > 0) {
        for (let i = 0; i < chunks.length; i++) {
          const lines = chunks[i].split('\n').map(l => l.trim()).filter(Boolean);
          slides.push({
            title: lines[0] || `Slide ${i + 1}`,
            content: lines.slice(1)
          });
        }
      } else {
        slides.push({
          title: options.title || 'Presentation Slide Deck',
          content: ['Slide content converted from presentation format client-side.']
        });
      }
    }

    // Slide Dimensions: Standard 16:9 Landscape (841.89 × 595.28 pt)
    const slideWidth = 841.89;
    const slideHeight = 595.28;
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const docTitle = options.title || 'Executive Presentation';

    for (let sIdx = 0; sIdx < slides.length; sIdx++) {
      const slide = slides[sIdx];
      const page = pdfDoc.addPage([slideWidth, slideHeight]);

      // Header Banner (Top Gradient Card)
      page.drawRectangle({
        x: 0,
        y: slideHeight - 110,
        width: slideWidth,
        height: 110,
        color: rgb(0.08, 0.12, 0.22) // Modern dark navy banner
      });

      // Accent Stripe
      page.drawRectangle({
        x: 0,
        y: slideHeight - 114,
        width: slideWidth,
        height: 4,
        color: rgb(0.14, 0.45, 0.95) // Vibrant blue accent line
      });

      // Slide Title
      page.drawText(slide.title, {
        x: 50,
        y: slideHeight - 65,
        size: 24,
        font: helveticaBold,
        color: rgb(1, 1, 1)
      });

      // Slide Content Bullet Points
      let contentY = slideHeight - 160;
      for (const item of slide.content) {
        if (contentY < 70) break;

        // Bullet Dot
        page.drawCircle({
          x: 60,
          y: contentY + 4,
          size: 4,
          color: rgb(0.14, 0.45, 0.95)
        });

        // Wrapped bullet text
        const words = item.split(' ');
        let curLine = '';
        for (const w of words) {
          const testLine = curLine ? `${curLine} ${w}` : w;
          if (helvetica.widthOfTextAtSize(testLine, 13) > 710) {
            page.drawText(curLine, { x: 75, y: contentY, size: 13, font: helvetica, color: rgb(0.2, 0.25, 0.3) });
            contentY -= 20;
            if (contentY < 70) break;
            curLine = w;
          } else {
            curLine = testLine;
          }
        }
        if (curLine && contentY >= 70) {
          page.drawText(curLine, { x: 75, y: contentY, size: 13, font: helvetica, color: rgb(0.2, 0.25, 0.3) });
          contentY -= 28;
        }
      }

      // Footer Bar
      page.drawLine({
        start: { x: 50, y: 40 },
        end: { x: slideWidth - 50, y: 40 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92)
      });

      page.drawText(docTitle, {
        x: 50,
        y: 24,
        size: 9,
        font: helvetica,
        color: rgb(0.45, 0.5, 0.55)
      });

      const slideNumText = `Slide ${sIdx + 1} of ${slides.length}`;
      const numWidth = helvetica.widthOfTextAtSize(slideNumText, 9);
      page.drawText(slideNumText, {
        x: slideWidth - 50 - numWidth,
        y: 24,
        size: 9,
        font: helvetica,
        color: rgb(0.45, 0.5, 0.55)
      });
    }

    return await pdfDoc.save();
  }
}
