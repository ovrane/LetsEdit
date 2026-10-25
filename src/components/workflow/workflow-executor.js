/**
 * Workflow Executor Sub-Module (Stage 2.5)
 * Handles client-side execution for single-document and multi-file batch operations:
 * Compress, Watermark, Security, Rotate, Grayscale, Flip, PDF/A, Repair,
 * Extract Text/Images, OCR, Deskew, Crop, Resize, Bates, N-Up, Split-in-Half,
 * Office Conversions (Word, Excel, PPT, HTML), Redaction, Organize, Split, and Sign.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFName, degrees, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { pdfEngine } from '../../core/pdf-engine.js';
import { PageOperations } from '../../core/engine/page-ops.js';
import { applyPdfEncryption } from '../../core/pdf-crypto.js';
import { redactPageContentStreams } from '../../core/pdf-redactor.js';
import { Toast } from '../toast.js';
import { hexToRgb } from '../../utils/helpers.js';
import { batchProgressModal } from './batch-progress-modal.js';

export async function processSingleDocument(manager, tool, file) {
  const primary = file;
  const id = tool.id;

  if (id === 'compress') {
    const res = await pdfEngine.compressPdf(primary.bytes, manager.compressLevel);
    return {
      name: `Compressed_${primary.name}`,
      bytes: res.compressedBytes,
      blob: new Blob([res.compressedBytes], { type: 'application/pdf' }),
      metrics: {
        originalSize: res.originalSize,
        compressedSize: res.compressedSize,
        savingsPercent: res.savingsPercent
      }
    };
  } else if (id === 'watermark') {
    const srcDoc = await PDFDocument.load(primary.bytes);
    const font = await srcDoc.embedFont(StandardFonts.HelveticaBold);
    const totalPages = srcDoc.getPageCount();
    const text = manager.watermarkText || 'CONFIDENTIAL';
    const opacity = parseFloat(manager.watermarkOpacity) || 0.3;
    const rotDeg = parseInt(manager.watermarkRotation, 10) || 45;
    const { r, g, b } = hexToRgb(manager.watermarkColor || '#94a3b8');

    for (let i = 0; i < totalPages; i++) {
      const page = srcDoc.getPage(i);
      const { width, height } = page.getSize();
      const fontSize = Math.min(width, height) / 8;
      const textW = font.widthOfTextAtSize(text, fontSize);

      page.drawText(text, {
        x: (width - textW * Math.cos((rotDeg * Math.PI) / 180)) / 2,
        y: (height - textW * Math.sin((rotDeg * Math.PI) / 180)) / 2,
        size: fontSize,
        font,
        color: rgb(r / 255, g / 255, b / 255),
        opacity,
        rotate: degrees(rotDeg)
      });
    }
    const wmBytes = await srcDoc.save();
    return {
      name: `Watermarked_${primary.name}`,
      bytes: wmBytes,
      blob: new Blob([wmBytes], { type: 'application/pdf' })
    };
  } else if (id === 'security') {
    const srcDoc = await PDFDocument.load(primary.bytes);
    applyPdfEncryption(
      srcDoc,
      manager.protectPassword,
      manager.protectPassword,
      {
        printing: manager.allowPrinting,
        copying: manager.allowCopying,
        modifying: false
      }
    );
    const encBytes = await srcDoc.save({ updateMetadata: false });
    return {
      name: `Protected_${primary.name}`,
      bytes: encBytes,
      blob: new Blob([encBytes], { type: 'application/pdf' })
    };
  } else if (id === 'rotate') {
    const srcDoc = await PDFDocument.load(primary.bytes);
    const totalPages = srcDoc.getPageCount();
    const rot = parseInt(manager.rotateDegrees, 10) || 90;
    for (let i = 0; i < totalPages; i++) {
      const page = srcDoc.getPage(i);
      const curRot = page.getRotation().angle;
      page.setRotation(degrees((curRot + rot) % 360));
    }
    const rotBytes = await srcDoc.save();
    return {
      name: `Rotated_${primary.name}`,
      bytes: rotBytes,
      blob: new Blob([rotBytes], { type: 'application/pdf' })
    };
  } else if (id === 'grayscale') {
    const grayBytes = await pdfEngine.convertToGrayscale(primary.bytes);
    return {
      name: `Grayscale_${primary.name}`,
      bytes: grayBytes,
      blob: new Blob([grayBytes], { type: 'application/pdf' })
    };
  } else if (id === 'flip') {
    const flippedBytes = await PageOperations.flipPages(primary.bytes, { direction: manager.flipDirection || 'horizontal' });
    return {
      name: `Flipped_${primary.name}`,
      bytes: flippedBytes,
      blob: new Blob([flippedBytes], { type: 'application/pdf' })
    };
  } else if (id === 'pdfa') {
    const profile = instance.pdfaProfile || 'pdfa-1b';
    const pdfaBytes = await pdfEngine.convertToPdfA(primary.bytes, { profile });
    const validation = await pdfEngine.validatePdfA(pdfaBytes);
    const cleanPrefix = profile.toUpperCase().replace('-', '_');
    return {
      name: `${cleanPrefix}_${primary.name}`,
      bytes: pdfaBytes,
      blob: new Blob([pdfaBytes], { type: 'application/pdf' }),
      validation
    };
  } else if (id === 'repair') {
    const res = await pdfEngine.repairPdf(primary.bytes);
    manager.lastRepairResult = res;
    const cleanBytes = res.pdfBytes || res.repairedBytes;
    return {
      name: `Repaired_${primary.name}`,
      bytes: cleanBytes,
      blob: new Blob([cleanBytes], { type: 'application/pdf' }),
      repairResult: res
    };
  } else if (id === 'pdf-to-text') {
    const text = await pdfEngine.extractDocumentText(primary.bytes);
    const enc = new TextEncoder();
    return {
      name: `${primary.name.replace(/\.[^/.]+$/, '')}_text.txt`,
      bytes: enc.encode(text),
      blob: new Blob([text], { type: 'text/plain;charset=utf-8' })
    };
  } else if (id === 'ocr-pdf') {
    const ocrResult = await pdfEngine.applyOcr(primary.bytes, {
      language: manager.ocrLang || 'eng',
      pageRange: manager.ocrPageRange || 'all'
    });
    const ocrBytes = ocrResult.pdfBytes || ocrResult;
    return {
      name: `Searchable_OCR_${primary.name.replace(/\.[^/.]+$/, '')}.pdf`,
      bytes: ocrBytes,
      blob: new Blob([ocrBytes], { type: 'application/pdf' }),
      ocrResult
    };
  } else if (id === 'deskew') {
    const deskewedBytes = await PageOperations.deskewPdf(primary.bytes, manager.deskewAngle);
    return {
      name: `Straightened_${primary.name}`,
      bytes: deskewedBytes,
      blob: new Blob([deskewedBytes], { type: 'application/pdf' })
    };
  } else if (id === 'crop') {
    const croppedBytes = await PageOperations.cropPdf(primary.bytes, {
      top: manager.cropTop,
      right: manager.cropRight,
      bottom: manager.cropBottom,
      left: manager.cropLeft,
      pageScope: manager.cropApplyAll ? 'all' : 0
    });
    return {
      name: `Cropped_${primary.name}`,
      bytes: croppedBytes,
      blob: new Blob([croppedBytes], { type: 'application/pdf' })
    };
  } else if (['resize', 'resize-pdf', 'resize-margins', 'page-margins'].includes(id)) {
    const config = manager.resizeConfig || { marginTop: 20, marginRight: 20, marginBottom: 20, marginLeft: 20 };
    const resizedBytes = await PageOperations.resizePdf(primary.bytes, config);
    manager.lastResizeResult = resizedBytes.report;
    return {
      name: `Resized_${primary.name}`,
      bytes: resizedBytes,
      blob: new Blob([resizedBytes], { type: 'application/pdf' }),
      resizeReport: resizedBytes.report
    };
  } else if (id === 'bates') {
    const batesBytes = await PageOperations.batesNumberPdf(primary.bytes, {
      prefix: manager.batesPrefix,
      suffix: manager.batesSuffix,
      startNumber: manager.batesStart,
      digits: manager.batesDigits,
      position: manager.batesPos,
      color: manager.batesColor
    });
    return {
      name: `Bates_${primary.name}`,
      bytes: batesBytes,
      blob: new Blob([batesBytes], { type: 'application/pdf' })
    };
  } else if (['nup', 'n-up', 'nup-pdf'].includes(id)) {
    const config = manager.nupConfig || { layout: manager.nupCount || 2 };
    const nupBytes = await PageOperations.applyNup(primary.bytes, config);
    manager.lastNupResult = nupBytes.report;
    return {
      name: `${nupBytes.layout || manager.nupCount || 2}Up_${primary.name}`,
      bytes: nupBytes,
      blob: new Blob([nupBytes], { type: 'application/pdf' }),
      nupReport: nupBytes.report
    };
  } else if (id === 'split-half') {
    const halvedBytes = await PageOperations.splitInHalf(primary.bytes, manager.splitHalfDirection);
    return {
      name: `Halved_${primary.name}`,
      bytes: halvedBytes,
      blob: new Blob([halvedBytes], { type: 'application/pdf' })
    };
  } else if (id === 'pdf-to-word') {
    const text = await pdfEngine.extractDocumentText(primary.bytes);
    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${primary.name}</title>
      <style>body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.6; padding: 36pt; } p { margin-bottom: 10pt; }</style>
      </head>
      <body>
        ${text.split('\n\n').filter(Boolean).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
      </body>
      </html>
    `;
    return {
      name: `${primary.name.replace(/\.[^/.]+$/, '')}.doc`,
      bytes: new TextEncoder().encode(htmlDoc),
      blob: new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' })
    };
  } else if (id === 'pdf-to-excel') {
    const text = await pdfEngine.extractDocumentText(primary.bytes);
    const csvRows = text.split('\n').map(line => {
      const cols = line.trim().split(/\s{2,}|\t/);
      return cols.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
    }).join('\n');
    return {
      name: `${primary.name.replace(/\.[^/.]+$/, '')}.csv`,
      bytes: new TextEncoder().encode(csvRows),
      blob: new Blob([csvRows], { type: 'text/csv;charset=utf-8' })
    };
  } else if (id === 'pdf-to-ppt') {
    const text = await pdfEngine.extractDocumentText(primary.bytes);
    const slides = text.split('\n\n\n').filter(Boolean);
    const htmlPpt = `
      <html><head><meta charset='utf-8'><title>${primary.name}</title>
      <style>body { font-family: Calibri, sans-serif; } .slide { page-break-after: always; padding: 40px; border: 1px solid #ccc; margin-bottom: 20px; }</style>
      </head><body>
      ${slides.map((s, i) => `<div class='slide'><h2>Slide ${i + 1}</h2><p>${s.replace(/\n/g, '<br/>')}</p></div>`).join('')}
      </body></html>
    `;
    return {
      name: `${primary.name.replace(/\.[^/.]+$/, '')}.ppt`,
      bytes: new TextEncoder().encode(htmlPpt),
      blob: new Blob([htmlPpt], { type: 'application/vnd.ms-powerpoint;charset=utf-8' })
    };
  } else if (id === 'unlock') {
    const unlockedBytes = await pdfEngine.unlockPdf(primary.bytes, manager.unlockPassword || '');
    return {
      name: `Unlocked_${primary.name}`,
      bytes: unlockedBytes,
      blob: new Blob([unlockedBytes], { type: 'application/pdf' })
    };
  } else if (id === 'remove-annotations') {
    const cleanDoc = await PDFDocument.load(primary.bytes);
    const pCount = cleanDoc.getPageCount();
    for (let i = 0; i < pCount; i++) {
      cleanDoc.getPage(i).node.delete(PDFName.of('Annots'));
    }
    const cleanBytes = await cleanDoc.save();
    return {
      name: `Cleaned_${primary.name}`,
      bytes: cleanBytes,
      blob: new Blob([cleanBytes], { type: 'application/pdf' })
    };
  } else if (id === 'pagenumbers') {
    const numberedBytes = await PageOperations.addPageNumbers(primary.bytes, {
      format: manager.pnFormat,
      position: manager.pnPos,
      startNumber: manager.pnStartPage,
      startPage: 1,
      fontSize: manager.pnFontSize
    });
    return {
      name: `Numbered_${primary.name}`,
      bytes: numberedBytes,
      blob: new Blob([numberedBytes], { type: 'application/pdf' })
    };
  } else if (id === 'flatten') {
    const flatDoc = await PDFDocument.load(primary.bytes, { ignoreEncryption: true });
    try {
      const form = flatDoc.getForm();
      form.flatten();
    } catch (e) {
      console.warn('Form flattening notice:', e);
    }
    const flatBytes = await flatDoc.save();
    return {
      name: `Flattened_${primary.name}`,
      bytes: flatBytes,
      blob: new Blob([flatBytes], { type: 'application/pdf' })
    };
  } else if (id === 'fill-forms') {
    const fieldVals = manager.formFieldValues || {};
    const flatten = Boolean(manager.flattenForms);
    const filledBytes = await PageOperations.fillFormFields(primary.bytes, fieldVals, { flatten });

    try {
      const xfdfRes = await PageOperations.exportFormData(filledBytes, 'xfdf');
      const jsonRes = await PageOperations.exportFormData(filledBytes, 'json');
      const csvRes = await PageOperations.exportFormData(filledBytes, 'csv');
      manager.formExportData = {
        xfdf: xfdfRes.content,
        json: jsonRes.content,
        csv: csvRes.content,
        fieldCount: Object.keys(fieldVals).length
      };
    } catch (e) {
      console.warn('Form data export caching warning:', e);
    }

    return {
      name: `Filled_${primary.name}`,
      bytes: filledBytes,
      blob: new Blob([filledBytes], { type: 'application/pdf' })
    };
  } else if (id === 'edit-metadata') {
    if (manager.metadataPendingStrip) {
      const sanitizedBytes = await PageOperations.stripMetadata(primary.bytes);
      const inspection = await PageOperations.inspectMetadata(sanitizedBytes);
      manager.lastMetadataResult = inspection;
      return {
        name: `Sanitized_${primary.name}`,
        bytes: sanitizedBytes,
        blob: new Blob([sanitizedBytes], { type: 'application/pdf' }),
        metadataResult: inspection
      };
    }

    const title = document.getElementById('meta-input-title')?.value ?? manager.documentMetadata?.info?.title ?? '';
    const author = document.getElementById('meta-input-author')?.value ?? manager.documentMetadata?.info?.author ?? '';
    const subject = document.getElementById('meta-input-subject')?.value ?? manager.documentMetadata?.info?.subject ?? '';
    const keywords = document.getElementById('meta-input-keywords')?.value ?? manager.documentMetadata?.info?.keywords ?? '';
    const creator = document.getElementById('meta-input-creator')?.value ?? manager.documentMetadata?.info?.creator ?? 'LetsEdit PDF Studio';
    const producer = document.getElementById('meta-input-producer')?.value ?? manager.documentMetadata?.info?.producer ?? 'LetsEdit Pro PDF Engine';

    const syncXmp = document.getElementById('meta-chk-sync-xmp')?.checked ?? true;
    const updateModTime = document.getElementById('meta-chk-update-modtime')?.checked ?? true;

    const updatedBytes = await PageOperations.updateMetadata(
      primary.bytes,
      { title, author, subject, keywords, creator, producer },
      { syncXmp, updateModificationDate: updateModTime }
    );

    const reInspection = await PageOperations.inspectMetadata(updatedBytes);
    manager.lastMetadataResult = reInspection;

    return {
      name: `Updated_${primary.name}`,
      bytes: updatedBytes,
      blob: new Blob([updatedBytes], { type: 'application/pdf' }),
      metadataResult: reInspection
    };
  } else if (id === 'pagelabels') {
    if (manager.pageLabelsPendingRemove) {
      const sanitizedBytes = await PageOperations.removePageLabels(primary.bytes);
      const inspection = await PageOperations.inspectPageLabels(sanitizedBytes);
      manager.lastPageLabelsResult = inspection;
      return {
        name: `DefaultNumbered_${primary.name}`,
        bytes: sanitizedBytes,
        blob: new Blob([sanitizedBytes], { type: 'application/pdf' }),
        pageLabelsResult: inspection
      };
    }

    const sections = manager.pageLabelSections || [
      { fromPage: 1, toPage: primary.pageCount || 1, style: 'D', prefix: '', startAt: 1 }
    ];
    const stampVisual = manager.pageLabelsStampVisual !== false;
    const position = manager.pageLabelsPosition || 'bottom-center';

    const updatedBytes = await PageOperations.applyPageLabels(primary.bytes, sections, {
      stampVisual,
      position
    });

    const inspection = await PageOperations.inspectPageLabels(updatedBytes);
    manager.lastPageLabelsResult = inspection;

    return {
      name: `PageLabeled_${primary.name}`,
      bytes: updatedBytes,
      blob: new Blob([updatedBytes], { type: 'application/pdf' }),
      pageLabelsResult: inspection
    };
  } else if (['sanitize', 'sanitize-pdf'].includes(id)) {
    const options = manager.sanitizeOptions || {
      purgeMetadata: true,
      purgeEmbeddedFiles: true,
      purgeScripts: true,
      purgeAnnotations: true,
      purgePrivateData: true,
      flattenForms: true
    };
    const sanitizedBytes = await PageOperations.sanitizeDocument(primary.bytes, options);
    manager.lastSanitizeResult = sanitizedBytes.report;
    return {
      name: `Sanitized_${primary.name}`,
      bytes: sanitizedBytes,
      blob: new Blob([sanitizedBytes], { type: 'application/pdf' }),
      sanitizeReport: sanitizedBytes.report
    };
  } else if (['bookmarks', 'outlines', 'pdf-bookmarks'].includes(id)) {
    let updatedBytes;
    if (manager.outlinesPendingRemove) {
      updatedBytes = await PageOperations.removeOutlines(primary.bytes);
    } else {
      const items = manager.outlineItems || [];
      updatedBytes = await PageOperations.applyOutlines(primary.bytes, items);
    }
    const inspection = await PageOperations.inspectOutlines(updatedBytes);
    manager.lastOutlinesResult = inspection;
    return {
      name: `Bookmarked_${primary.name}`,
      bytes: updatedBytes,
      blob: new Blob([updatedBytes], { type: 'application/pdf' }),
      outlinesResult: inspection
    };
  } else if (['header-footer', 'header_footer', 'add-header-footer'].includes(id)) {
    const config = manager.headerFooterConfig || {};
    const updatedBytes = await PageOperations.applyHeaderFooter(primary.bytes, config, {
      fileName: primary.name,
      title: primary.name?.replace(/\.[^/.]+$/, '')
    });
    manager.lastHeaderFooterResult = updatedBytes.report;
    return {
      name: `HeaderFooter_${primary.name}`,
      bytes: updatedBytes,
      blob: new Blob([updatedBytes], { type: 'application/pdf' }),
      headerFooterReport: updatedBytes.report
    };
  } else if (id === 'redact') {
    const redactDoc = await PDFDocument.load(primary.bytes);
    const keywords = (manager.redactKeywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const pCount = redactDoc.getPageCount();
    for (let i = 0; i < pCount; i++) {
      const page = redactDoc.getPage(i);
      if (keywords.length > 0) {
        await redactPageContentStreams(redactDoc, page, [], keywords);
      }
    }
    const redactedBytes = await redactDoc.save();
    return {
      name: `Redacted_${primary.name}`,
      bytes: redactedBytes,
      blob: new Blob([redactedBytes], { type: 'application/pdf' })
    };
  } else if (id === 'excel-to-pdf') {
    const title = manager.excelTitle || primary.name.replace(/\.[^/.]+$/, '');
    const pdfBytes = await PageOperations.excelToPdf(primary.bytes, {
      title,
      orientation: manager.excelOrientation || 'auto',
      isCsv: primary.name.toLowerCase().endsWith('.csv')
    });
    return {
      name: `${primary.name.replace(/\.[^/.]+$/, '')}.pdf`,
      bytes: pdfBytes,
      blob: new Blob([pdfBytes], { type: 'application/pdf' })
    };
  } else if (id === 'ppt-to-pdf') {
    const title = manager.pptTitle || primary.name.replace(/\.[^/.]+$/, '');
    const pdfBytes = await PageOperations.pptToPdf(primary.bytes, { title });
    return {
      name: `${primary.name.replace(/\.[^/.]+$/, '')}.pdf`,
      bytes: pdfBytes,
      blob: new Blob([pdfBytes], { type: 'application/pdf' })
    };
  } else if (id === 'html-to-pdf') {
    const textDecoder = new TextDecoder('utf-8');
    const rawHtml = textDecoder.decode(primary.bytes);
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const title = doc.querySelector('title')?.textContent || primary.name.replace(/\.[^/.]+$/, '');
    const elements = Array.from(doc.body.querySelectorAll('h1, h2, h3, p, li, pre, blockquote, div')).map(el => el.textContent.trim()).filter(Boolean);
    const lines = elements.length > 0 ? elements : rawHtml.replace(/<[^>]+>/g, ' ').split('\n').map(l => l.trim()).filter(Boolean);

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

    const outBytes = await pdfDoc.save();
    return {
      name: `${title.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
      bytes: outBytes,
      blob: new Blob([outBytes], { type: 'application/pdf' })
    };
  } else if (id === 'word-to-pdf') {
    let paragraphs = [];
    try {
      const zip = await JSZip.loadAsync(primary.bytes);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXml, 'text/xml');
        paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p')).map(p => {
          return Array.from(p.getElementsByTagName('w:t')).map(t => t.textContent).join('');
        }).filter(Boolean);
      }
    } catch (e) {
      console.warn('DOCX ZIP unpack fallback:', e);
    }

    if (paragraphs.length === 0) {
      const textDecoder = new TextDecoder('utf-8');
      paragraphs = textDecoder.decode(primary.bytes).replace(/[^\x20-\x7E\n]/g, ' ').split('\n').map(l => l.trim()).filter(l => l.length > 2);
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 800;

    const docTitle = primary.name.replace(/\.[^/.]+$/, '');
    page.drawText(docTitle, { x: 50, y, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
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

    const outBytes = await pdfDoc.save();
    return {
      name: `${docTitle}.pdf`,
      bytes: outBytes,
      blob: new Blob([outBytes], { type: 'application/pdf' })
    };
  } else if (id === 'rename') {
    const text = await pdfEngine.extractDocumentText(primary.bytes);
    const autoName = (text.split('\n').find(l => l.trim().length > 3) || 'Renamed_Document')
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '_')
      .substring(0, 40);
    const finalName = (manager.renameCustomName || '').trim() || autoName;
    const fn = finalName.toLowerCase().endsWith('.pdf') ? finalName : `${finalName}.pdf`;
    return {
      name: fn,
      bytes: primary.bytes,
      blob: new Blob([primary.bytes], { type: 'application/pdf' })
    };
  } else {
    return {
      name: `Processed_${primary.name}`,
      bytes: primary.bytes,
      blob: new Blob([primary.bytes], { type: 'application/pdf' })
    };
  }
}

export async function executeAction(manager) {
  if (manager.uploadedFiles.length === 0) {
    Toast.error('Please add files to process');
    return;
  }

  const t = manager.activeTool;
  const execBtn = manager.container.querySelector('#btn-workspace-execute');
  if (execBtn) {
    execBtn.disabled = true;
    execBtn.innerHTML = `<span>Processing in browser...</span>`;
  }

  try {
    const primary = manager.uploadedFiles[0];
    const isCombiner = ['merge', 'compare', 'images-to-pdf', 'alternate-mix', 'scan', 'organize'].includes(t.id);

    if (t.id === 'security') {
      if (!manager.protectPassword) {
        Toast.warning('Please enter a password');
        if (execBtn) {
          execBtn.disabled = false;
          execBtn.innerHTML = `<span>${manager.getExecuteButtonLabel()}</span>`;
        }
        return;
      }
      if (manager.protectPassword !== manager.protectConfirmPassword) {
        Toast.error('Passwords do not match');
        if (execBtn) {
          execBtn.disabled = false;
          execBtn.innerHTML = `<span>${manager.getExecuteButtonLabel()}</span>`;
        }
        return;
      }
    }

    // MULTI-FILE BATCH PROCESSING (100% Free & Client-Side)
    if (!isCombiner && t.id !== 'split' && manager.uploadedFiles.length > 1) {
      batchProgressModal.startBatch({
        title: `Batch ${t.name || 'Processing'}: ${manager.uploadedFiles.length} Documents`,
        subtitle: `Executing ${t.name || 'action'} across all files • Zero telemetry`,
        files: manager.uploadedFiles
      });

      const batchZip = new JSZip();
      for (let i = 0; i < manager.uploadedFiles.length; i++) {
        if (batchProgressModal.isCancelled) {
          Toast.info('Batch processing cancelled');
          break;
        }

        const f = manager.uploadedFiles[i];
        batchProgressModal.updateFileProgress(i, 20, 'Processing...');

        if (execBtn) {
          execBtn.innerHTML = `<span>Processing ${i + 1} of ${manager.uploadedFiles.length} (${f.name.substring(0, 16)})...</span>`;
        }

        try {
          const res = await processSingleDocument(manager, t, f);
          let metric = null;
          if (res && res.metrics && res.metrics.savingsPercent) {
            metric = `-${res.metrics.savingsPercent}%`;
          }
          if (res && res.bytes) {
            batchZip.file(res.name, res.bytes);
          } else if (res && res.blob) {
            batchZip.file(res.name, await res.blob.arrayBuffer());
          }
          batchProgressModal.completeFile(i, { metric });
        } catch (err) {
          console.error(`Error processing file ${f.name}:`, err);
          batchProgressModal.failFile(i, err);
        }
      }

      if (!batchProgressModal.isCancelled) {
        batchProgressModal.finish();
      }

      const zipBlob = await batchZip.generateAsync({ type: 'blob' });
      manager.processedBlob = zipBlob;
      manager.processedFilename = `Batch_${t.id}_${manager.uploadedFiles.length}_files.zip`;
    } else if (t.id === 'merge') {
      if (manager.uploadedFiles.length > 1) {
        batchProgressModal.startBatch({
          title: `Merging ${manager.uploadedFiles.length} Documents into Single PDF`,
          subtitle: 'Combining pages and streams in sequence • Zero telemetry',
          files: manager.uploadedFiles
        });
      }

      const fileItems = manager.uploadedFiles.map(f => ({ bytes: f.bytes, name: f.name }));
      const mergedBytes = await PageOperations.mergePdfAdvanced(fileItems, {
        generateToc: manager.mergeGenerateToc,
        tocTitle: manager.mergeTocTitle || 'Table of Contents',
        includeBookmarks: manager.mergeBookmarks !== false,
        addPageNumbers: manager.mergePageNums,
        addCoverPage: manager.mergeAddCover,
        coverTitle: manager.mergeCoverTitle,
        coverSubtitle: manager.mergeCoverSub,
        onProgress: ({ current, total }) => {
          if (manager.uploadedFiles.length > 1) {
            batchProgressModal.completeFile(current - 1);
            if (current < total) {
              batchProgressModal.updateFileProgress(current, 25, 'Merging...');
            }
          }
        }
      });

      if (manager.uploadedFiles.length > 1 && !batchProgressModal.isCancelled) {
        batchProgressModal.finish();
      }

      manager.processedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
      manager.processedFilename = 'Merged_Document.pdf';
    } else if (t.id === 'split') {
      let splits = [];
      if (manager.splitMode === 'text') {
        splits = await PageOperations.splitByText(primary.bytes, {
          keyword: manager.splitTextKeyword || 'Invoice',
          mode: manager.splitTextMode || 'contains',
          filenamePattern: manager.splitTextPattern || '[text]_[n].pdf'
        });
      } else if (manager.splitMode === 'size') {
        splits = await PageOperations.splitBySize(primary.bytes, manager.splitMaxBytes);
      } else if (manager.splitMode === 'bookmarks') {
        splits = await PageOperations.splitByBookmarks(primary.bytes);
      } else if (manager.splitMode === 'all') {
        splits = await PageOperations.splitPdf(primary.bytes, 'all');
      } else {
        splits = await PageOperations.splitPdf(primary.bytes, manager.splitRange || 'all');
      }

      if (splits.length === 1) {
        manager.processedBlob = new Blob([splits[0].bytes], { type: 'application/pdf' });
        manager.processedFilename = splits[0].name;
      } else {
        const zip = new JSZip();
        splits.forEach(s => zip.file(s.name, s.bytes));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        manager.processedBlob = zipBlob;
        manager.processedFilename = `Split_${manager.splitMode}_${primary.name.replace(/\.[^/.]+$/, '')}.zip`;
      }
    } else if (t.id === 'images-to-pdf') {
      if (manager.uploadedFiles.length > 1) {
        batchProgressModal.startBatch({
          title: `Converting ${manager.uploadedFiles.length} Images to PDF`,
          subtitle: `Generating vector A4 pages with ${manager.imgOrientation} layout`,
          files: manager.uploadedFiles
        });
      }

      const imgList = manager.uploadedFiles.map(f => ({ bytes: f.bytes, name: f.name }));
      const pdfBytes = await PageOperations.imagesToPdf(imgList, {
        orientation: manager.imgOrientation,
        margin: parseInt(manager.imgMargin, 10) || 0,
        onProgress: ({ current, total }) => {
          if (manager.uploadedFiles.length > 1) {
            batchProgressModal.completeFile(current - 1);
            if (current < total) {
              batchProgressModal.updateFileProgress(current, 35, 'Embedding...');
            }
          }
        }
      });

      if (manager.uploadedFiles.length > 1 && !batchProgressModal.isCancelled) {
        batchProgressModal.finish();
      }

      manager.processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      manager.processedFilename = 'Images_Combined.pdf';
    } else if (t.id === 'to-image') {
      const loadingTask = pdfjsLib.getDocument({
        data: primary.bytes.slice(0),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
        cMapPacked: true
      });
      const doc = await loadingTask.promise;
      const numPages = doc.numPages;
      const dpi = parseInt(manager.imageDpi, 10) || 150;
      const scale = dpi / 72;
      const mime = manager.imageFormat === 'image/jpeg' ? 'image/jpeg' : 'image/png';
      const ext = manager.imageFormat === 'image/jpeg' ? 'jpg' : 'png';

      const imageBlobs = [];
      for (let p = 1; p <= numPages; p++) {
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (mime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        await page.render({ canvasContext: ctx, viewport }).promise;
        const b = await new Promise(res => canvas.toBlob(res, mime, 0.92));
        imageBlobs.push({ name: `page_${p}.${ext}`, blob: b, bytes: await b.arrayBuffer() });
      }
      doc.destroy();

      if (imageBlobs.length === 1) {
        manager.processedBlob = imageBlobs[0].blob;
        manager.processedFilename = `${primary.name.replace(/\.[^/.]+$/, '')}_page_1.${ext}`;
      } else {
        const zip = new JSZip();
        imageBlobs.forEach(img => zip.file(img.name, img.bytes));
        manager.processedBlob = await zip.generateAsync({ type: 'blob' });
        manager.processedFilename = `${primary.name.replace(/\.[^/.]+$/, '')}_images.zip`;
      }
    } else if (t.id === 'compare') {
      if (manager.uploadedFiles.length < 2) {
        Toast.warning('Please upload at least 2 documents to compare');
        if (execBtn) {
          execBtn.disabled = false;
          execBtn.innerHTML = `<span>${manager.getExecuteButtonLabel()}</span>`;
        }
        return;
      }
      const cmp = await pdfEngine.comparePdfs(manager.uploadedFiles[0].bytes, manager.uploadedFiles[1].bytes);
      manager.processedBlob = new Blob([cmp.reportPdfBytes], { type: 'application/pdf' });
      manager.processedFilename = `Comparison_Report_${manager.uploadedFiles[0].name.replace(/\.[^/.]+$/, '')}_vs_${manager.uploadedFiles[1].name.replace(/\.[^/.]+$/, '')}.pdf`;
      manager.compareResult = cmp;
      manager.compareDocA = manager.uploadedFiles[0];
      manager.compareDocB = manager.uploadedFiles[1];
    } else if (t.id === 'extract-images') {
      const imgs = await pdfEngine.extractImages(primary.bytes);
      if (imgs.length === 0) {
        Toast.warning('No embedded image objects found in this PDF');
        if (execBtn) {
          execBtn.disabled = false;
          execBtn.innerHTML = `<span>${manager.getExecuteButtonLabel()}</span>`;
        }
        return;
      }
      const zip = new JSZip();
      imgs.forEach(im => zip.file(im.name, im.bytes));
      manager.processedBlob = await zip.generateAsync({ type: 'blob' });
      manager.processedFilename = `Extracted_Images_${primary.name}.zip`;
    } else if (t.id === 'organize') {
      if (manager.organizePages.length === 0) {
        Toast.warning('Cannot save empty document. Please keep at least one page.');
        if (execBtn) {
          execBtn.disabled = false;
          execBtn.innerHTML = `<span>${manager.getExecuteButtonLabel()}</span>`;
        }
        return;
      }
      const organizedBytes = await PageOperations.organizePages(
        primary.bytes,
        manager.organizePages.map(p => ({ index: p.originalIndex, rotation: p.rotation }))
      );
      manager.processedBlob = new Blob([organizedBytes], { type: 'application/pdf' });
      manager.processedFilename = `Organized_${primary.name}`;
    } else if (t.id === 'alternate-mix') {
      if (manager.uploadedFiles.length < 2) {
        Toast.warning('Please upload at least 2 PDF documents to alternate and mix');
        if (execBtn) {
          execBtn.disabled = false;
          execBtn.innerHTML = `<span>${manager.getExecuteButtonLabel()}</span>`;
        }
        return;
      }
      const mixedBytes = await PageOperations.alternateMix(manager.uploadedFiles[0].bytes, manager.uploadedFiles[1].bytes, {
        reverseB: manager.alternateReverseB
      });
      manager.processedBlob = new Blob([mixedBytes], { type: 'application/pdf' });
      manager.processedFilename = `Mixed_${manager.uploadedFiles[0].name}`;
    } else if (t.id === 'scan') {
      const imgList = manager.uploadedFiles.map(f => ({ bytes: f.bytes, name: f.name }));
      const pdfBytes = await PageOperations.imagesToPdf(imgList, {
        orientation: 'portrait',
        margin: parseInt(manager.imgMargin, 10) || 0
      });
      manager.processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      manager.processedFilename = 'Scanned_Document.pdf';
    } else if (t.id === 'sign') {
      let sigBytes = null;
      if (manager.signDataUrl) {
        const base64 = manager.signDataUrl.split(',')[1];
        const binStr = atob(base64);
        sigBytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) sigBytes[i] = binStr.charCodeAt(i);
      } else {
        const offscreen = document.createElement('canvas');
        offscreen.width = 400;
        offscreen.height = 140;
        const oCtx = offscreen.getContext('2d');
        oCtx.fillStyle = '#0f172a';
        oCtx.font = `italic 42px '${manager.signFont}', 'Caveat', cursive, sans-serif`;
        oCtx.textBaseline = 'middle';
        oCtx.fillText(manager.signName || 'Authorized Signature', 20, 70);

        const dataUrl = offscreen.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const binStr = atob(base64);
        sigBytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) sigBytes[i] = binStr.charCodeAt(i);
      }

      const signedBytes = await PageOperations.signPdf(primary.bytes, {
        imageBytes: sigBytes,
        isPng: true,
        position: manager.signPos,
        dateText: manager.includeSignDate ? manager.signDate : '',
        signerName: manager.signName || 'Authorized Signer',
        signerEmail: manager.signEmail || '',
        appendAuditCertificate: manager.appendAuditCertificate !== false,
        embedBadge: manager.embedSignBadge !== false,
        targetPage: (primary.pageCount || 1) - 1,
        width: 160,
        height: 56
      });
      manager.processedBlob = new Blob([signedBytes], { type: 'application/pdf' });
      manager.processedFilename = `Signed_${primary.name}`;
      manager.lastAuditRecord = signedBytes.auditRecord || null;
      if (manager.lastAuditRecord) {
        try {
          manager.standaloneAuditPdfBytes = await PageOperations.generateAuditCertificate(manager.lastAuditRecord, {
            signatureBytes: sigBytes,
            isPng: true
          });
        } catch (err) {
          console.warn('[WorkflowExecutor] Standalone audit cert generation failed:', err);
        }
      }
    } else if (t.id === 'ocr-pdf') {
      const ocrResult = await pdfEngine.applyOcr(primary.bytes, {
        language: manager.ocrLang || 'eng',
        pageRange: manager.ocrPageRange || 'all',
        onProgress: (p) => {
          if (execBtn) {
            execBtn.innerHTML = `<span>OCR Page ${p.page}/${p.totalPages} (${p.progress}%)</span>`;
          }
        }
      });
      const ocrBytes = ocrResult.pdfBytes || ocrResult;
      manager.processedBlob = new Blob([ocrBytes], { type: 'application/pdf' });
      manager.processedFilename = `Searchable_OCR_${primary.name.replace(/\.[^/.]+$/, '')}.pdf`;
      manager.lastOcrResult = ocrResult;
    } else {
      const res = await processSingleDocument(manager, t, primary);
      manager.processedBlob = res.blob || new Blob([res.bytes], { type: 'application/pdf' });
      manager.processedFilename = res.name;
      manager.lastOperationMetrics = res.metrics || null;
      if (res.ocrResult) manager.lastOcrResult = res.ocrResult;
    }

    manager.stage = 'complete';
    manager.render();
    Toast.success('Processing complete!');
  } catch (err) {
    console.error('Execution error:', err);
    Toast.error('Processing failed: ' + err.message);
    if (execBtn) {
      execBtn.disabled = false;
      execBtn.innerHTML = `<span>${manager.getExecuteButtonLabel()}</span>`;
    }
  }
}
