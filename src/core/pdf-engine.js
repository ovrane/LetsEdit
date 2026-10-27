/**
 * PDF Engine Orchestrator
 * High-performance, pure client-side PDF vector & rendering orchestrator.
 * Delegates to specialized sub-modules in ./engine/ for clean separation of concerns,
 * maintainability, and sub-second execution speed.
 */

import { DocumentLoader } from './engine/document-loader.js';
import { PageOperations } from './engine/page-ops.js';
import { TransformOperations } from './engine/transform-ops.js';
import { SecurityOperations } from './engine/security-ops.js';
import { RepairCompareOperations } from './engine/repair-compare.js';
import { ExtractionOcrOperations } from './engine/extraction-ocr.js';
import { PdfExporter } from './engine/exporter.js';

export class PdfEngine {
  constructor() {
    this.loader = new DocumentLoader();
  }

  // Backward-compatible accessors for pdfDoc and rawBytes
  get pdfDoc() {
    return this.loader.pdfDoc;
  }
  set pdfDoc(val) {
    this.loader.pdfDoc = val;
  }

  get rawBytes() {
    return this.loader.rawBytes;
  }
  set rawBytes(val) {
    this.loader.rawBytes = val;
  }

  // --- Document Loading & Canvas Viewport Rendering ---

  async loadPdf(arrayBuffer) {
    return await this.loader.loadPdf(arrayBuffer);
  }

  async createSamplePdf() {
    return await this.loader.createSamplePdf();
  }

  async createBlankPdf() {
    return await this.loader.createBlankPdf();
  }

  async getPage(pageNum) {
    return await this.loader.getPage(pageNum);
  }

  async renderPageToCanvas(page, canvas, scale = 1.0, rotation = 0) {
    return await this.loader.renderPageToCanvas(page, canvas, scale, rotation);
  }

  async extractTextItems(page, scale = 1.0, rotation = 0) {
    return await this.loader.extractTextItems(page, scale, rotation);
  }

  async renderPageToImageBlob(pageNum, dpiScale = 2.0, format = 'image/png') {
    return await this.loader.renderPageToImageBlob(pageNum, dpiScale, format);
  }

  // --- Page Operations (Merge, Split, Alternate, N-Up, Flip) ---

  async appendBlankPage(width = 595.28, height = 841.89) {
    const newBytes = await PageOperations.appendBlankPage(this.rawBytes, width, height);
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  async insertBlankPage(afterPageIndex = null, width = 595.28, height = 841.89) {
    const newBytes = await PageOperations.insertBlankPage(this.rawBytes, afterPageIndex, width, height);
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  async duplicatePage(pageIndex) {
    const newBytes = await PageOperations.duplicatePage(this.rawBytes, pageIndex);
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  async mergeExternalPdf(externalBytes) {
    const newBytes = await PageOperations.mergeExternalPdf(this.rawBytes, externalBytes);
    this.rawBytes = newBytes.buffer;
    const info = await this.loadPdf(this.rawBytes);
    return info.numPages;
  }

  async mergePdf(pdfBytesList) {
    return await PageOperations.mergePdf(pdfBytesList);
  }

  async splitPdf(pdfBytesOrRange = null, maybeRange = null, options = {}) {
    let bytes = this.rawBytes;
    let range = 'all';
    let opts = options;
    if (pdfBytesOrRange instanceof ArrayBuffer || pdfBytesOrRange instanceof Uint8Array) {
      bytes = pdfBytesOrRange;
      range = maybeRange || 'all';
    } else if (typeof pdfBytesOrRange === 'string') {
      range = pdfBytesOrRange;
      if (typeof maybeRange === 'object' && maybeRange !== null) {
        opts = maybeRange;
      }
    }
    return await PageOperations.splitPdf(bytes, range, opts);
  }

  async splitBySize(pdfBytesOrMax = null, maybeMax = 5242880) {
    let bytes = this.rawBytes;
    let maxBytes = 5242880;
    if (pdfBytesOrMax instanceof ArrayBuffer || pdfBytesOrMax instanceof Uint8Array) {
      bytes = pdfBytesOrMax;
      maxBytes = maybeMax || 5242880;
    } else if (typeof pdfBytesOrMax === 'number') {
      maxBytes = pdfBytesOrMax;
    }
    return await PageOperations.splitBySize(bytes, maxBytes);
  }

  async splitByBookmarks(pdfBytes = null) {
    const bytes = pdfBytes || this.rawBytes;
    return await PageOperations.splitByBookmarks(bytes);
  }

  async splitEveryN(pdfBytesOrN = null, maybeN = 1) {
    let bytes = this.rawBytes;
    let n = 1;
    if (pdfBytesOrN instanceof ArrayBuffer || pdfBytesOrN instanceof Uint8Array) {
      bytes = pdfBytesOrN;
      n = maybeN || 1;
    } else if (typeof pdfBytesOrN === 'number') {
      n = pdfBytesOrN;
    }
    return await PageOperations.splitEveryN(bytes, n);
  }

  async splitInHalf(direction = 'vertical') {
    return await PageOperations.splitInHalf(this.rawBytes, direction);
  }

  async alternateMix(docABytes, docBBytes, options = {}) {
    return await PageOperations.alternateMix(docABytes, docBBytes, options);
  }

  async nUpPdf(nUpCount = 2) {
    return await PageOperations.nUpPdf(this.rawBytes, nUpCount);
  }

  async flipPages(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    return await PageOperations.flipPages(bytes, options);
  }

  async imagesToPdf(imagesList, options = {}) {
    return await PageOperations.imagesToPdf(imagesList, options);
  }

  async deskewPdf(pdfBytes = null, angle = 0) {
    const bytes = pdfBytes || this.rawBytes;
    return await PageOperations.deskewPdf(bytes, angle);
  }

  async organizePages(pdfBytes = null, pageList = []) {
    const bytes = pdfBytes || this.rawBytes;
    return await PageOperations.organizePages(bytes, pageList);
  }

  async cropPdf(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    return await PageOperations.cropPdf(bytes, options);
  }

  async batesNumberPdf(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    return await PageOperations.batesNumberPdf(bytes, options);
  }

  // --- Transform Operations (Margins, Compression, Grayscale) ---

  async resizePdfMargins(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    return await TransformOperations.resizePdfMargins(bytes, options);
  }

  async compressPdf(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    return await TransformOperations.compressPdf(bytes, options);
  }

  async convertToGrayscale(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    const res = await PageOperations.convertToGrayscale(bytes, options);
    return res.pdfBytes || res;
  }

  // --- Security Operations ---

  async unlockPdf(encryptedBytes = null, password = '') {
    const bytes = encryptedBytes || this.rawBytes;
    return await SecurityOperations.unlockPdf(bytes, password);
  }

  // --- Repair, Compare & Archival ---

  async repairPdf(corruptedBytes) {
    return await RepairCompareOperations.repairPdf(corruptedBytes);
  }

  async comparePdfs(pdfABytes, pdfBBytes) {
    return await RepairCompareOperations.comparePdfs(pdfABytes, pdfBBytes);
  }

  async convertToPdfA(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    return await RepairCompareOperations.convertToPdfA(bytes, options);
  }

  async validatePdfA(pdfBytes = null) {
    const bytes = pdfBytes || this.rawBytes;
    return await RepairCompareOperations.validatePdfA(bytes);
  }

  // --- Extraction & Client-Side OCR ---

  async extractDocumentText(pdfBytes = null) {
    const bytes = pdfBytes || this.rawBytes;
    return await ExtractionOcrOperations.extractDocumentText(bytes, this.pdfDoc);
  }

  async extractImages(pdfBytes = null) {
    const bytes = pdfBytes || this.rawBytes;
    return await ExtractionOcrOperations.extractImages(bytes);
  }

  async applyOcr(pdfBytes = null, options = {}) {
    const bytes = pdfBytes || this.rawBytes;
    return await ExtractionOcrOperations.applyOcr(bytes, this.pdfDoc, options);
  }

  // --- Vector Compilation & Exporter ---

  async exportPdf(state) {
    return await PdfExporter.exportPdf(this.rawBytes, state);
  }

  async htmlToPdf(htmlString, options = {}) {
    return await PageOperations.htmlToPdf(htmlString, options);
  }

  async wordToPdf(docxBytes, options = {}) {
    return await PageOperations.wordToPdf(docxBytes, options);
  }

  async excelToPdf(fileBytes, options = {}) {
    return await PageOperations.excelToPdf(fileBytes, options);
  }

  async pptToPdf(pptxBytes, options = {}) {
    return await PageOperations.pptToPdf(pptxBytes, options);
  }
}

export const pdfEngine = new PdfEngine();
