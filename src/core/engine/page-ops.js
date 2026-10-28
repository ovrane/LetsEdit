/**
 * Page Operations Facade
 * Delegates multi-document merge, range/page splitting, book-scan bisecting,
 * duplex alternate & mix, N-up imposition, page flipping, conversion, and stamping
 * to focused, maintainable operation sub-modules in ./operations/
 */

import { MergeOps } from './operations/merge-ops.js';
import { SplitOps } from './operations/split-ops.js';
import { GeometryOps } from './operations/geometry-ops.js';
import { ConvertOps } from './operations/convert-ops.js';
import { StampOps } from './operations/stamp-ops.js';
import { MultiSignOps } from './operations/multi-sign-ops.js';
import { FormOps } from './operations/form-ops.js';
import { RepairOps } from './operations/repair-ops.js';
import { MetadataOps } from './operations/metadata-ops.js';
import { PageLabelsOps } from './operations/pagelabels-ops.js';
import { SanitizeOps } from './operations/sanitize-ops.js';
import { OutlineOps } from './operations/outline-ops.js';
import { HeaderFooterOps } from './operations/header-footer-ops.js';
import { NupOps } from './operations/nup-ops.js';
import { ResizeOps } from './operations/resize-ops.js';
import { WatermarkOps } from './operations/watermark-ops.js';
import { BatesOps } from './operations/bates-ops.js';
import { PageNumbersOps } from './operations/pagenumbers-ops.js';
import { FlattenOps } from './operations/flatten-ops.js';
import { RedactOps } from './operations/redact-ops.js';
import { GrayscaleOps } from './operations/grayscale-ops.js';
import { DeskewOps } from './operations/deskew-ops.js';
import { PdfToImageOps } from './operations/pdf-to-image-ops.js';
import { ImageToPdfOps } from './operations/image-to-pdf-ops.js';
import { WordToPdfOps } from './operations/word-to-pdf-ops.js';
import { PdfToWordOps } from './operations/pdf-to-word-ops.js';
import { ExcelToPdfOps } from './operations/excel-to-pdf-ops.js';
import { PdfToExcelOps } from './operations/pdf-to-excel-ops.js';
import { PptxToPdfOps } from './operations/pptx-to-pdf-ops.js';
import { PdfToPptxOps } from './operations/pdf-to-pptx-ops.js';
import { HtmlToPdfOps } from './operations/html-to-pdf-ops.js';
import { ExtractImagesOps } from './operations/extract-images-ops.js';

export { MergeOps, SplitOps, GeometryOps, ConvertOps, StampOps, MultiSignOps, FormOps, RepairOps, MetadataOps, PageLabelsOps, SanitizeOps, OutlineOps, HeaderFooterOps, NupOps, ResizeOps, WatermarkOps, BatesOps, PageNumbersOps, FlattenOps, RedactOps, GrayscaleOps, DeskewOps, PdfToImageOps, ImageToPdfOps, WordToPdfOps, PdfToWordOps, ExcelToPdfOps, PdfToExcelOps, PptxToPdfOps, PdfToPptxOps, HtmlToPdfOps, ExtractImagesOps };

export class PageOperations {
  // Merge & Organize
  static appendBlankPage(...args) { return MergeOps.appendBlankPage(...args); }
  static insertBlankPage(...args) { return MergeOps.insertBlankPage(...args); }
  static duplicatePage(...args) { return MergeOps.duplicatePage(...args); }
  static mergeExternalPdf(...args) { return MergeOps.mergeExternalPdf(...args); }
  static mergePdf(...args) { return MergeOps.mergePdf(...args); }
  static mergePdfAdvanced(...args) { return MergeOps.mergePdfAdvanced(...args); }
  static organizePages(...args) { return MergeOps.organizePages(...args); }

  // Split & Extract
  static splitPdf(...args) { return SplitOps.splitPdf(...args); }
  static splitBySize(...args) { return SplitOps.splitBySize(...args); }
  static splitByBookmarks(...args) { return SplitOps.splitByBookmarks(...args); }
  static splitByText(...args) { return SplitOps.splitByText(...args); }
  static splitEveryN(...args) { return SplitOps.splitEveryN(...args); }
  static splitInHalf(...args) { return SplitOps.splitInHalf(...args); }
  static alternateMix(...args) { return SplitOps.alternateMix(...args); }

  // Geometry & Imposition
  static nUpPdf(...args) { return GeometryOps.nUpPdf(...args); }
  static flipPages(...args) { return GeometryOps.flipPages(...args); }
  static async deskewPdf(rawBytes, options = 0) {
    const res = await DeskewOps.deskewPdf(rawBytes, options);
    if (res && res.pdfBytes) {
      res.pdfBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pdfBytes;
    }
    return res;
  }
  static detectDeskewAngle(...args) { return GeometryOps.detectDeskewAngle(...args); }
  static detectSkewAngleFromPixels(...args) { return DeskewOps.detectSkewAngleFromPixels(...args); }
  static createSampleSkewedPdf(...args) { return DeskewOps.createSampleSkewedPdf(...args); }
  static cropPdf(...args) { return GeometryOps.cropPdf(...args); }
  static detectWhitespaceCrop(...args) { return GeometryOps.detectWhitespaceCrop(...args); }

  // Document Format Converters
  static async imagesToPdf(imagesList, options = {}) {
    const res = await ImageToPdfOps.imagesToPdf(imagesList, options);
    if (res && res.pdfBytes) {
      res.pdfBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pdfBytes;
    }
    return res;
  }
  static createSampleImageBatch(...args) { return ImageToPdfOps.createSampleImageBatch(...args); }
  static async htmlToPdf(htmlString, options = {}) {
    const res = await HtmlToPdfOps.convertHtmlToPdf(htmlString, options);
    if (res && res.pdfBytes) {
      res.pdfBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pdfBytes;
    }
    return res;
  }
  static async markdownToPdf(markdownString, options = {}) {
    const res = await HtmlToPdfOps.convertMarkdownToPdf(markdownString, options);
    if (res && res.pdfBytes) {
      res.pdfBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pdfBytes;
    }
    return res;
  }
  static createSampleHtmlString() { return HtmlToPdfOps.createSampleHtmlString(); }
  static createSampleMarkdownString() { return HtmlToPdfOps.createSampleMarkdownString(); }
  static async extractImages(rawBytes, options = {}) {
    const res = await ExtractImagesOps.extractImages(rawBytes, options);
    if (res && res.zipBytes) {
      res.zipBytes.report = res.report;
      res.zipBytes.images = res.images;
      res.zipBytes.manifest = res.manifest;
      return typeof options === 'object' && options.withReport ? res : res.zipBytes;
    }
    return res;
  }
  static analyzeImages(rawBytes) { return ExtractImagesOps.analyzeImages(rawBytes); }
  static createSampleMultiImagePdf() { return ExtractImagesOps.createSampleMultiImagePdf(); }
  static async wordToPdf(docxBytes, options = {}) {
    const res = await WordToPdfOps.wordToPdf(docxBytes, options);
    if (res && res.pdfBytes) {
      res.pdfBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pdfBytes;
    }
    return res;
  }
  static createSampleDocxFile(...args) { return WordToPdfOps.createSampleDocxFile(...args); }
  static async pdfToWord(pdfBytes, options = {}) {
    const res = await PdfToWordOps.pdfToWord(pdfBytes, options);
    if (res && res.docxBytes) {
      res.docxBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.docxBytes;
    }
    return res;
  }
  static createSampleStructuredPdf(...args) { return PdfToWordOps.createSampleStructuredPdf(...args); }
  static async excelToPdf(fileInput, options = {}) {
    const res = await ExcelToPdfOps.excelToPdf(fileInput, options);
    if (res && res.pdfBytes) {
      res.pdfBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pdfBytes;
    }
    return res;
  }
  static createSampleXlsxFile(...args) { return ExcelToPdfOps.createSampleXlsxFile(...args); }
  static async pdfToExcel(pdfBytes, options = {}) {
    const res = await PdfToExcelOps.pdfToExcel(pdfBytes, options);
    if (res && res.fileBytes) {
      res.fileBytes.report = res.report;
      res.fileBytes.csvText = res.csvText;
      return typeof options === 'object' && options.withReport ? res : res.fileBytes;
    }
    return res;
  }
  static createSampleFinancialTablePdf(...args) { return PdfToExcelOps.createSampleFinancialTablePdf(...args); }
  static async pptToPdf(pptxBytes, options = {}) {
    const res = await PptxToPdfOps.pptToPdf(pptxBytes, options);
    if (res && res.pdfBytes) {
      res.pdfBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pdfBytes;
    }
    return res;
  }
  static pptxToPdf(...args) { return this.pptToPdf(...args); }
  static createSamplePptxFile(...args) { return PptxToPdfOps.createSamplePptxFile(...args); }
  static async pdfToPpt(pdfBytes, options = {}) {
    const res = await PdfToPptxOps.pdfToPptx(pdfBytes, options);
    if (res && res.pptxBytes) {
      res.pptxBytes.report = res.report;
      return typeof options === 'object' && options.withReport ? res : res.pptxBytes;
    }
    return res;
  }
  static pdfToPptx(...args) { return this.pdfToPpt(...args); }
  static createSamplePresentationPdf(...args) { return PdfToPptxOps.createSamplePresentationPdf(...args); }
  static renderPageToImage(...args) { return PdfToImageOps.renderPageToImage(...args); }
  static renderPagesToZip(...args) { return PdfToImageOps.renderPagesToZip(...args); }
  static createSampleRasterPdf(...args) { return PdfToImageOps.createSampleRasterPdf(...args); }

  // Stamping & Numbering
  static batesNumberPdf(...args) { return BatesOps.applyBatesNumbering(...args); }
  static applyBatesNumbering(...args) { return BatesOps.applyBatesNumbering(...args); }
  static sequenceBatesBatch(...args) { return BatesOps.sequenceBatch(...args); }
  static addPageNumbers(...args) { return PageNumbersOps.applyPageNumbers(...args); }
  static applyPageNumbers(...args) { return PageNumbersOps.applyPageNumbers(...args); }
  static createSamplePageNumbersPdf(...args) { return PageNumbersOps.createSamplePageNumbersPdf(...args); }
  static signPdf(...args) { return StampOps.signPdf(...args); }
  static generateAuditCertificate(...args) { return StampOps.generateAuditCertificate(...args); }

  // Multi-Signer & Field Placement
  static burnSignatureFields(...args) { return MultiSignOps.burnSignatureFields(...args); }
  static compileCompletedDocument(...args) { return MultiSignOps.compileCompletedDocument(...args); }

  // Form Filler & Form Data Export/Import
  static inspectFormFields(...args) { return FormOps.inspectFormFields(...args); }
  static fillFormFields(...args) { return FormOps.fillFormFields(...args); }
  static exportFormData(...args) { return FormOps.exportFormData(...args); }
  static importFormData(...args) { return FormOps.importFormData(...args); }
  static createSampleFillableFormPdf(...args) { return FormOps.createSampleFillableFormPdf(...args); }

  // PDF Repair & Diagnostic Suite
  static repairPdfAdvanced(...args) { return RepairOps.repairPdfAdvanced(...args); }
  static diagnosePdf(...args) { return RepairOps.diagnosePdf(...args); }
  static createCorruptTestPdf(...args) { return RepairOps.createCorruptTestPdf(...args); }

  // PDF Metadata & Adobe XMP Operations
  static inspectMetadata(...args) { return MetadataOps.inspectMetadata(...args); }
  static updateMetadata(...args) { return MetadataOps.updateMetadata(...args); }
  static stripMetadata(...args) { return MetadataOps.stripMetadata(...args); }
  static generateXmpPacket(...args) { return MetadataOps.generateXmpPacket(...args); }
  static createSampleMetadataPdf(...args) { return MetadataOps.createSampleMetadataPdf(...args); }

  // ISO 32000-1 PageLabels Operations
  static inspectPageLabels(...args) { return PageLabelsOps.inspectPageLabels(...args); }
  static applyPageLabels(...args) { return PageLabelsOps.applyPageLabels(...args); }
  static removePageLabels(...args) { return PageLabelsOps.removePageLabels(...args); }
  static createSamplePageLabelsPdf(...args) { return PageLabelsOps.createSamplePageLabelsPdf(...args); }

  // Deep Document Sanitization & Hidden Information Cleaner
  static inspectHiddenData(...args) { return SanitizeOps.inspectHiddenData(...args); }
  static sanitizeDocument(...args) { return SanitizeOps.sanitizeDocument(...args); }
  static createSampleExposedPdf(...args) { return SanitizeOps.createSampleExposedPdf(...args); }

  // Document Outlines & Hierarchical Bookmarks (ISO 32000-1 Clause 12.3.3)
  static inspectOutlines(...args) { return OutlineOps.inspectOutlines(...args); }
  static applyOutlines(...args) { return OutlineOps.applyOutlines(...args); }
  static removeOutlines(...args) { return OutlineOps.removeOutlines(...args); }
  static exportToMarkdownTOC(...args) { return OutlineOps.exportToMarkdownTOC(...args); }
  static createSampleOutlinesPdf(...args) { return OutlineOps.createSampleOutlinesPdf(...args); }

  // Multi-Zone Dynamic Header & Footer Engine
  static applyHeaderFooter(...args) { return HeaderFooterOps.applyHeaderFooter(...args); }
  static interpolateMacros(...args) { return HeaderFooterOps.interpolateMacros(...args); }
  static isPageIncluded(...args) { return HeaderFooterOps.isPageIncluded(...args); }
  static createSampleHeaderFooterPdf(...args) { return HeaderFooterOps.createSampleHeaderFooterPdf(...args); }

  // Adobe Acrobat Pro & iLovePDF N-Up Page Imposition Engine
  static applyNup(...args) { return NupOps.applyNup(...args); }
  static createSampleNupPdf(...args) { return NupOps.createSampleNupPdf(...args); }

  // Adobe Acrobat Pro & Sejda Page Geometry Resizing & Margins Engine
  static resizePdf(...args) { return ResizeOps.resizePdf(...args); }
  static createSampleResizePdf(...args) { return ResizeOps.createSampleResizePdf(...args); }

  // Adobe Acrobat Pro & iLovePDF Dynamic Watermark & Stamp Engine
  static applyWatermark(...args) { return WatermarkOps.applyWatermark(...args); }
  static createSampleWatermarkPdf(...args) { return WatermarkOps.createSampleWatermarkPdf(...args); }

  // Legal Production Bates Numbering Engine
  static batesNumberPdf(...args) { return BatesOps.applyBatesNumbering(...args); }
  static applyBatesNumbering(...args) { return BatesOps.applyBatesNumbering(...args); }
  static sequenceBatesBatch(...args) { return BatesOps.sequenceBatch(...args); }
  static createSampleBatesPdf(...args) { return BatesOps.createSampleBatesPdf(...args); }

  // Adobe Acrobat Pro & iLovePDF Dynamic Page Numbering Engine
  static addPageNumbers(...args) { return PageNumbersOps.applyPageNumbers(...args); }
  static applyPageNumbers(...args) { return PageNumbersOps.applyPageNumbers(...args); }
  static createSamplePageNumbersPdf(...args) { return PageNumbersOps.createSamplePageNumbersPdf(...args); }

  // Adobe Acrobat Pro & iLovePDF Document Flattening & Form AcroForm Baker
  static flattenPdf(...args) { return FlattenOps.flattenPdf(...args); }
  static inspectFlattenTargets(...args) { return FlattenOps.inspectFlattenTargets(...args); }
  static createSampleFlattenPdf(...args) { return FlattenOps.createSampleFlattenPdf(...args); }

  // Adobe Acrobat Pro & iLovePDF Permanent Vector Redaction Suite
  static applyRedaction(...args) { return RedactOps.applyRedaction(...args); }
  static searchSensitiveData(...args) { return RedactOps.searchSensitiveData(...args); }
  static createSampleRedactPdf(...args) { return RedactOps.createSampleRedactPdf(...args); }

  // Adobe Acrobat Pro & iLovePDF DeviceGray Grayscale Toner Saver Engine
  static convertToGrayscale(...args) { return GrayscaleOps.convertToGrayscale(...args); }
  static createSampleGrayscalePdf(...args) { return GrayscaleOps.createSampleGrayscalePdf(...args); }
}

