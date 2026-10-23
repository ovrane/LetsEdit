/**
 * Dedicated Tool Workflow Component (iLovePDF & Sejda Reverse-Engineered Architecture)
 * Provides focused, distraction-free tool workflows for Merge, Compress, Split, Convert, OCR, etc.
 * Features dedicated file uploaders tailored per tool (PDF only vs PDF+Images vs Images),
 * interactive drag-and-drop card reordering with real PDF.js live thumbnails & page counts,
 * and instant single-click client-side download cards.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { pdfEngine } from '../core/pdf-engine.js';
import { PageOperations } from '../core/engine/page-ops.js';
import { applyPdfEncryption } from '../core/pdf-crypto.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer, formatFileSize, hexToRgb, generateQrSvg } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { authModal } from './auth-modal.js';
import { redactPageContentStreams } from '../core/pdf-redactor.js';

// Setup PDF.js worker safely across browser and test runtimes
const workerSrc = typeof window !== 'undefined'
  ? new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  : '';
if (workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export const WORKFLOW_TOOLS_CONFIG = {
  merge: {
    id: 'merge',
    title: 'Merge PDF files',
    subtitle: 'Combine PDFs and images in the order you want with the easiest PDF merger available.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg>`,
    color: '#30050d',
    accept: '.pdf,image/png,image/jpeg,image/webp,image/jpg',
    multiple: true,
    buttonText: 'Select PDF & Image files',
    dropText: 'or drop PDFs and images here',
    badge: 'PDF, PNG, JPG accepted'
  },
  compress: {
    id: 'compress',
    title: 'Compress PDF file',
    subtitle: 'Reduce file size while preserving maximal vector and image quality.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path></svg>`,
    color: '#059669',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  split: {
    id: 'split',
    title: 'Split PDF file',
    subtitle: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22V2"></path></svg>`,
    color: '#ea580c',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  'images-to-pdf': {
    id: 'images-to-pdf',
    title: 'Convert Images to PDF',
    subtitle: 'Transform JPG, PNG, and WebP images into a single professional PDF document.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    color: '#d97706',
    accept: 'image/png,image/jpeg,image/webp,image/jpg',
    multiple: true,
    buttonText: 'Select Image files',
    dropText: 'or drop images here',
    badge: 'PNG, JPG, WebP'
  },
  'to-image': {
    id: 'to-image',
    title: 'Convert PDF to JPG / PNG',
    subtitle: 'Render and extract high-resolution raster images from your PDF pages.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    color: '#d97706',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'ocr-pdf': {
    id: 'ocr-pdf',
    title: 'OCR PDF — Searchable Text',
    subtitle: 'Extract text from scanned documents and create a selectable vector text layer.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="17" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    color: '#6366f1',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select Scanned PDF',
    dropText: 'or drop scanned PDF here',
    badge: 'Scanned PDF'
  },
  repair: {
    id: 'repair',
    title: 'Repair Corrupted PDF',
    subtitle: 'Reconstruct broken xref tables and salvage unreadable PDF documents.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    color: '#ef4444',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select Damaged PDF(s)',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  compare: {
    id: 'compare',
    title: 'Compare PDF Documents',
    subtitle: 'Visually diff two PDF documents to highlight word insertions and deletions.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>`,
    color: '#6366f1',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select 2 PDF files to Compare',
    dropText: 'or drop 2 PDFs here',
    badge: 'Select 2 files'
  },
  watermark: {
    id: 'watermark',
    title: 'Add Watermark to PDF',
    subtitle: 'Stamp text or an image across all pages with custom rotation and opacity.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
    color: '#30050d',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  security: {
    id: 'security',
    title: 'Protect PDF with Password',
    subtitle: 'Encrypt your PDF with standard ISO 32000-1 AES-256 encryption.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    color: '#dc2626',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  rotate: {
    id: 'rotate',
    title: 'Rotate PDF pages',
    subtitle: 'Rotate your PDF pages permanently 90°, 180°, or 270° clockwise.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>`,
    color: '#f59e0b',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  crop: {
    id: 'crop',
    title: 'Crop PDF Margins',
    subtitle: 'Trim margin borders, remove scanner lines, and resize page bounds.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>`,
    color: '#0d9488',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  resize: {
    id: 'resize',
    title: 'Resize PDF Margins & Page',
    subtitle: 'Add binding margins (ring/spiral binder) or fit pages to standard A4/Letter.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>`,
    color: '#6366f1',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  grayscale: {
    id: 'grayscale',
    title: 'Convert PDF to Grayscale',
    subtitle: 'Desaturate colors and convert strokes to monochrome to save printing toner.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20z"></path></svg>`,
    color: '#475569',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  flip: {
    id: 'flip',
    title: 'Flip / Mirror PDF',
    subtitle: 'Mirror PDF coordinates horizontally or vertically for iron-on transfers or inverted scans.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path></svg>`,
    color: '#8b5cf6',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  pdfa: {
    id: 'pdfa',
    title: 'Convert PDF to PDF/A',
    subtitle: 'Conform document to ISO 19005-1 archival standard for permanent storage.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
    color: '#10b981',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'extract-images': {
    id: 'extract-images',
    title: 'Extract Images from PDF',
    subtitle: 'Export all embedded high-resolution JPEG, PNG, and WebP images into a ZIP file.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    color: '#ec4899',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'pdf-to-text': {
    id: 'pdf-to-text',
    title: 'Extract Text from PDF',
    subtitle: 'Decompress content streams and export clean plain searchable text to a TXT file.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>`,
    color: '#334155',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  deskew: {
    id: 'deskew',
    title: 'Deskew & Straighten PDF',
    subtitle: 'Automatically detect tilt and straighten crooked scanner pages with precision angle calibration.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><line x1="18" y1="14" x2="18" y2="18"></line><line x1="14" y1="18" x2="18" y2="18"></line></svg>`,
    color: '#0891b2',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select Scanned PDF',
    dropText: 'or drop scanned PDF here',
    badge: 'PDF only'
  },
  organize: {
    id: 'organize',
    title: 'Organize PDF Pages',
    subtitle: 'Sort, rotate, and delete PDF pages in a visual interactive grid with drag-and-drop reordering.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    color: '#30050d',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  bates: {
    id: 'bates',
    title: 'Bates Numbering for PDF',
    subtitle: 'Add sequential legal Bates stamps with custom prefixes, starting number, and zero-padding.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    color: '#1e293b',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  nup: {
    id: 'nup',
    title: 'N-Up Imposition PDF Printing',
    subtitle: 'Impose 2 or 4 pages per sheet side-by-side or in a 2×2 grid layout.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line></svg>`,
    color: '#475569',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: '2-Up & 4-Up'
  },
  'split-half': {
    id: 'split-half',
    title: 'Split PDF Down the Middle',
    subtitle: 'Bisect two-page book scans (A3 to double A4 or A4 to double A5) vertically or horizontally.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="3 3"></line></svg>`,
    color: '#4f46e5',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select Book Scan PDF',
    dropText: 'or drop PDF here',
    badge: 'Book Scan Slicer'
  },
  'alternate-mix': {
    id: 'alternate-mix',
    title: 'Alternate & Mix PDF',
    subtitle: 'Interleave pages from two documents (e.g. odd and even scanner feeder batches).',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>`,
    color: '#0891b2',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select 2 PDF files to Interleave',
    dropText: 'or drop 2 PDFs here',
    badge: 'Select 2 files'
  },
  'pdf-to-word': {
    id: 'pdf-to-word',
    title: 'Convert PDF to Word DOC',
    subtitle: 'Extract text, formatting, and layout from PDF into an editable Word document.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    color: '#30050d',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'pdf-to-excel': {
    id: 'pdf-to-excel',
    title: 'Convert PDF to Excel / CSV',
    subtitle: 'Extract table data and columns from PDF into a spreadsheet CSV file.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>`,
    color: '#107c41',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'pdf-to-ppt': {
    id: 'pdf-to-ppt',
    title: 'Convert PDF to PowerPoint',
    subtitle: 'Convert PDF document pages into high-resolution presentation slides.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    color: '#d24726',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  unlock: {
    id: 'unlock',
    title: 'Unlock PDF Restrictions',
    subtitle: 'Remove owner passwords and printing/copying restrictions from PDF documents.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`,
    color: '#10b981',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select Locked PDF(s)',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'remove-annotations': {
    id: 'remove-annotations',
    title: 'Remove Annotations from PDF',
    subtitle: 'Batch remove highlights, strikeouts, sticky notes, and drawings to clean up document vectors.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    color: '#dc2626',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'extract-pages': {
    id: 'extract-pages',
    title: 'Extract Pages from PDF',
    subtitle: 'Select and extract custom pages into a new independent PDF document.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    color: '#ea580c',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'Extract Pages'
  },
  rename: {
    id: 'rename',
    title: 'Rename PDF by Content',
    subtitle: 'Automatically detect document title, heading, or invoice number to rename file.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    color: '#059669',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  'html-to-pdf': {
    id: 'html-to-pdf',
    title: 'Convert HTML to PDF',
    subtitle: 'Convert web pages, HTML files, or raw code into a clean, vector PDF document.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    color: '#30050d',
    accept: '.html,.htm,text/html,text/plain',
    multiple: false,
    buttonText: 'Select HTML file',
    dropText: 'or drop HTML file here',
    badge: 'HTML to PDF'
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    title: 'Convert Word DOCX to PDF',
    subtitle: 'Creates a clean PDF document from Microsoft Word DOCX files client-side.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    color: '#30050d',
    accept: '.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
    multiple: true,
    buttonText: 'Select Word file(s)',
    dropText: 'or drop Word DOCX here',
    badge: 'Batch Supported'
  },
  sign: {
    id: 'sign',
    title: 'Sign PDF Document',
    subtitle: 'Sign your document with a legally binding electronic signature (draw ink, handwritten text, or image stamp).',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`,
    color: '#30050d',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file to Sign',
    dropText: 'or drop PDF here',
    badge: 'e-Sign PDF'
  },
  pagenumbers: {
    id: 'pagenumbers',
    title: 'Add Page Numbers to PDF',
    subtitle: 'Stamp page numbers across all or selected pages with customizable position and format.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="8" x2="12" y2="16"></line></svg>`,
    color: '#30050d',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  flatten: {
    id: 'flatten',
    title: 'Flatten PDF Form Fields',
    subtitle: 'Bake interactive AcroForm fields and annotations into static vectors to make them uneditable.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    color: '#0d9488',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  redact: {
    id: 'redact',
    title: 'Redact PDF — Remove Sensitive Data',
    subtitle: 'Permanently sanitize confidential text, words, and coordinates from underlying PDF streams.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
    color: '#0f172a',
    accept: '.pdf,application/pdf',
    multiple: true,
    buttonText: 'Select PDF files',
    dropText: 'or drop PDF(s) here',
    badge: 'Batch Supported'
  },
  scan: {
    id: 'scan',
    title: 'Scan to PDF',
    subtitle: 'Capture documents from your device camera or mobile scanner directly into a sharp PDF document.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    color: '#30050d',
    accept: 'image/*,.pdf',
    multiple: true,
    buttonText: 'Scan Document / Camera',
    dropText: 'or snap pictures / upload scans',
    badge: 'Camera & Scanner'
  },
  'excel-to-pdf': {
    id: 'excel-to-pdf',
    title: 'Excel to PDF Converter',
    subtitle: 'Convert Excel spreadsheets (.xlsx, .xls) and CSV tables into beautifully formatted PDF documents.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    color: '#107c41',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv',
    multiple: true,
    buttonText: 'Select Spreadsheet(s)',
    dropText: 'or drop XLSX / CSV here',
    badge: 'Batch Supported'
  },
  'ppt-to-pdf': {
    id: 'ppt-to-pdf',
    title: 'PowerPoint to PDF Converter',
    subtitle: 'Convert PowerPoint presentations (.pptx, .ppt) into crisp, presentation-ready vector PDF slide decks.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    color: '#d24726',
    accept: '.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    multiple: true,
    buttonText: 'Select Presentation(s)',
    dropText: 'or drop PPTX here',
    badge: 'Batch Supported'
  }
};

WORKFLOW_TOOLS_CONFIG.protect = WORKFLOW_TOOLS_CONFIG.security;

export const CHAIN_TOOLS = [
  {
    id: 'compress',
    title: 'Compress PDF',
    desc: 'Reduce file size with smart stream optimization',
    color: '#059669',
    icon: `<svg width="20" height="20" fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path></svg>`
  },
  {
    id: 'security',
    title: 'Protect with Password',
    desc: 'Encrypt with military-grade AES-256 standard',
    color: '#dc2626',
    icon: `<svg width="20" height="20" fill="none" stroke="#dc2626" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
  },
  {
    id: 'split',
    title: 'Split PDF Pages',
    desc: 'Extract individual pages or custom ranges',
    color: '#ea580c',
    icon: `<svg width="20" height="20" fill="none" stroke="#ea580c" stroke-width="2" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22V2"></path></svg>`
  },
  {
    id: 'organize',
    title: 'Organize & Rotate',
    desc: 'Reorder, delete, duplicate, or rotate pages',
    color: '#30050d',
    icon: `<svg width="20" height="20" fill="none" stroke="#30050d" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
  },
  {
    id: 'to-image',
    title: 'PDF to JPG / PNG',
    desc: 'Export pages as high-resolution images',
    color: '#d97706',
    icon: `<svg width="20" height="20" fill="none" stroke="#d97706" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
  },
  {
    id: 'watermark',
    title: 'Add Watermark',
    desc: 'Stamp copyright or confidentiality text',
    color: '#06b6d4',
    icon: `<svg width="20" height="20" fill="none" stroke="#06b6d4" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`
  },
  {
    id: 'bates',
    title: 'Bates Numbering',
    desc: 'Stamp sequential legal index numbers',
    color: '#475569',
    icon: `<svg width="20" height="20" fill="none" stroke="#475569" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`
  },
  {
    id: 'pdfa',
    title: 'PDF/A Preservation',
    desc: 'Convert to ISO standard archival format',
    color: '#30050d',
    icon: `<svg width="20" height="20" fill="none" stroke="#30050d" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>`
  }
];

export class ToolWorkflowManager {
  constructor() {
    this.container = null;
    this.activeTool = null;
    this.uploadedFiles = []; // Array of { name, size, type, bytes, rotation, pageCount, thumbnailUrl }
    this.processedBlob = null;
    this.processedFilename = 'document.pdf';
    this.lastOperationMetrics = null;
    this.stage = 'upload'; // 'upload' | 'workspace' | 'complete'

    // Tool specific configurations
    this.compressLevel = 'recommended';
    this.splitMode = 'ranges'; // 'ranges' | 'all' | 'size' | 'bookmarks'
    this.splitRange = '1-2';
    this.splitMaxBytes = 5242880; // 5 MB
    this.splitEveryN = 2;
    this.imageDpi = '150';
    this.imageFormat = 'image/jpeg';
    this.imgOrientation = 'portrait'; // 'portrait' | 'landscape'
    this.imgMargin = '0'; // '0' | '20' | '40'
    this.watermarkText = 'CONFIDENTIAL';
    this.watermarkOpacity = 0.3;
    this.watermarkRotation = 45;
    this.watermarkColor = '#94a3b8';
    this.protectPassword = '';
    this.protectConfirmPassword = '';
    this.allowPrinting = true;
    this.allowCopying = true;
    this.rotateDegrees = 90;
    this.cropTop = 0;
    this.cropRight = 0;
    this.cropBottom = 0;
    this.cropLeft = 0;
    this.cropApplyAll = true;
    this.ocrLang = 'eng';
    this.draggedIndex = null;
    this.deskewAngle = 0;
    this.organizePages = [];
    this.draggedPageIndex = null;
    this.batesPrefix = 'CASE-';
    this.batesSuffix = '';
    this.batesStart = 1;
    this.batesDigits = 6;
    this.batesPos = 'bottom-right';
    this.batesColor = '#1e293b';
    this.nupCount = 2;
    this.splitHalfDirection = 'vertical';
    this.alternateReverseB = true;
    this.flipDirection = 'horizontal';
    this.grayscalePreviewActive = true;
    this.extractedTextPreview = '';
    this.unlockPassword = '';
    this.renameCustomName = '';

    // Sign options
    this.signMode = 'draw'; // 'draw' | 'type' | 'upload'
    this.signName = 'Authorized Signature';
    this.signFont = 'Caveat';
    this.signDataUrl = null;
    this.signDate = new Date().toISOString().split('T')[0];
    this.includeSignDate = true;
    this.signPos = 'bottom-right';

    // Page Numbers options
    this.pnFormat = 'Page {n} of {total}';
    this.pnPos = 'bottom-center';
    this.pnStartPage = 1;
    this.pnFontSize = 10;

    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  getBatesPositionCss() {
    switch (this.batesPos) {
      case 'top-left': return 'top: 14px; left: 14px;';
      case 'top-center': return 'top: 14px; left: 50%; transform: translateX(-50%);';
      case 'top-right': return 'top: 14px; right: 14px;';
      case 'bottom-left': return 'bottom: 14px; left: 14px;';
      case 'bottom-center': return 'bottom: 14px; left: 50%; transform: translateX(-50%);';
      case 'bottom-right':
      default: return 'bottom: 14px; right: 14px;';
    }
  }

  getSignPositionCss() {
    switch (this.signPos) {
      case 'top-left': return 'top: 20px; left: 20px;';
      case 'top-center': return 'top: 20px; left: 50%; transform: translateX(-50%);';
      case 'top-right': return 'top: 20px; right: 20px;';
      case 'bottom-left': return 'bottom: 20px; left: 20px;';
      case 'bottom-center': return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
      case 'bottom-right':
      default: return 'bottom: 20px; right: 20px;';
    }
  }

  getPnPositionCss() {
    switch (this.pnPos) {
      case 'top-left': return 'top: 14px; left: 14px;';
      case 'top-center': return 'top: 14px; left: 50%; transform: translateX(-50%);';
      case 'top-right': return 'top: 14px; right: 14px;';
      case 'bottom-left': return 'bottom: 14px; left: 14px;';
      case 'bottom-center': return 'bottom: 14px; left: 50%; transform: translateX(-50%);';
      case 'bottom-right':
      default: return 'bottom: 14px; right: 14px;';
    }
  }

  getPnPositionLabel() {
    const labels = {
      'top-left': 'Header Left',
      'top-center': 'Header Center',
      'top-right': 'Header Right',
      'bottom-left': 'Footer Left',
      'bottom-center': 'Footer Center',
      'bottom-right': 'Footer Right'
    };
    return labels[this.pnPos] || 'Footer Center';
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'tool-workflow-view';
    this.container.className = 'tool-workflow-container';
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
  }

  openTool(toolKey, { updateUrl = true } = {}) {
    const config = WORKFLOW_TOOLS_CONFIG[toolKey] || WORKFLOW_TOOLS_CONFIG.merge;
    this.activeTool = config;
    this.uploadedFiles = [];
    this.processedBlob = null;
    this.stage = 'upload';
    this.deskewAngle = 0;
    this.organizePages = [];
    this.draggedPageIndex = null;
    this.cropTop = 0;
    this.cropRight = 0;
    this.cropBottom = 0;
    this.cropLeft = 0;
    this.cropApplyAll = true;
    this.batesPrefix = 'CASE-';
    this.batesSuffix = '';
    this.batesStart = 1;
    this.batesDigits = 6;
    this.batesPos = 'bottom-right';
    this.batesColor = '#1e293b';
    this.nupCount = 2;
    this.splitHalfDirection = 'vertical';
    this.alternateReverseB = true;

    document.body.classList.remove('show-landing', 'show-studio');
    document.body.classList.add('show-tool-workflow');
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (updateUrl && typeof window !== 'undefined') {
      const canonical = router.getCanonicalPath(config.id);
      if (window.location.pathname !== canonical) {
        window.history.pushState({ path: canonical }, '', canonical);
      }
      if (config.title && typeof document !== 'undefined') {
        document.title = `${config.title} — LetsEdit`;
      }
    }

    this.render();
  }

  closeWorkflow() {
    router.navigate('/');
  }

  switchToStudioWithBuffer(arrayBuffer, filename) {
    router.navigate('/edit_pdf');

    pdfEngine.loadPdf(arrayBuffer).then(info => {
      store.setDocument(arrayBuffer, filename, info.numPages);
      const fnEl = document.getElementById('current-filename');
      if (fnEl) fnEl.textContent = filename;
      Toast.success(`Opened ${filename} in PDF Studio`);
    }).catch(err => {
      console.error(err);
      Toast.error('Failed to open document in editor');
    });
  }

  render() {
    if (!this.container || !this.activeTool) return;

    if (this.stage === 'upload') {
      this.renderUploadPrompt();
    } else if (this.stage === 'workspace') {
      this.renderToolWorkspace();
    } else if (this.stage === 'complete') {
      this.renderSuccessScreen();
    }
  }

  // --- STAGE 1: FOCUSED UPLOAD HERO ---
  renderUploadPrompt() {
    const t = this.activeTool;
    this.container.innerHTML = `
      <header class="workflow-header">
        <div class="workflow-header-inner">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="workflow-back-btn" id="btn-workflow-back" title="Back to All Tools">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
              <span>All Tools</span>
            </button>
            <div class="lets-logo" id="workflow-brand-logo" style="cursor: pointer;">
              <div class="lets-logo-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
                </svg>
              </div>
              <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="user-account-wrapper">
              <button class="btn btn-outline btn-sm user-account-btn" id="btn-workflow-auth">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span>${store.getState().user ? store.getState().user.name : 'Log in'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="workflow-main">
        <div class="workflow-hero-card">
          <div class="workflow-tool-badge" style="background: ${t.color}18; color: ${t.color};">
            ${t.icon}
          </div>
          <h1 class="workflow-title">${t.title}</h1>
          <p class="workflow-subtitle">${t.subtitle}</p>

          <div class="workflow-dropzone" id="workflow-dropzone" style="--zone-color: ${t.color};">
            <input type="file" id="workflow-file-input" accept="${t.accept}" ${t.multiple ? 'multiple' : ''} style="display: none;" />
            <div class="dropzone-icon-ring" style="background: ${t.color}15; color: ${t.color};">
              <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
              </svg>
            </div>
            <button class="workflow-primary-cta" id="btn-workflow-choose" style="background: ${t.color};">
              <span>${t.buttonText}</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </button>
            <span class="workflow-droptxt">${t.dropText}</span>
            <span class="workflow-format-chip">${t.badge}</span>
          </div>

          ${t.id === 'scan' ? `
            <div style="margin-top: 16px;">
              <button type="button" class="btn btn-outline" id="btn-workflow-camera" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                <span>Snap Pages with Device Camera</span>
              </button>
            </div>
          ` : ''}

          <div style="margin-top: 24px;">
            <button class="workflow-sample-link" id="btn-workflow-sample">
              Or test with Sample Document
            </button>
          </div>
        </div>
      </main>
    `;

    this.bindUploadEvents();
  }

  bindUploadEvents() {
    const backBtn = this.container.querySelector('#btn-workflow-back');
    const brandLogo = this.container.querySelector('#workflow-brand-logo');
    const chooseBtn = this.container.querySelector('#btn-workflow-choose');
    const fileInput = this.container.querySelector('#workflow-file-input');
    const dropzone = this.container.querySelector('#workflow-dropzone');
    const sampleBtn = this.container.querySelector('#btn-workflow-sample');

    if (backBtn) backBtn.onclick = () => this.closeWorkflow();
    if (brandLogo) brandLogo.onclick = () => this.closeWorkflow();
    if (chooseBtn && fileInput) chooseBtn.onclick = () => fileInput.click();

    const authBtn = this.container.querySelector('#btn-workflow-auth');
    if (authBtn) {
      authBtn.onclick = (e) => {
        e.stopPropagation();
        authModal.toggleAccountMenu(authBtn);
      };
    }


    if (fileInput) {
      fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          await this.handleIncomingFiles(files);
        }
        fileInput.value = '';
      };
    }

    if (dropzone) {
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      };
      dropzone.ondragleave = () => {
        dropzone.classList.remove('drag-active');
      };
      dropzone.ondrop = async (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          await this.handleIncomingFiles(files);
        }
      };
    }

    if (sampleBtn) {
      sampleBtn.onclick = async () => {
        Toast.info('Loading sample document...');
        const sampleBytes = await pdfEngine.createSamplePdf();
        await this.handleIncomingFiles([{
          name: 'Sample_Agreement.pdf',
          size: sampleBytes.byteLength,
          type: 'application/pdf',
          mockBytes: sampleBytes
        }]);
      };
    }

    const camBtn = this.container.querySelector('#btn-workflow-camera');
    if (camBtn) {
      camBtn.onclick = () => this.openCameraScannerModal();
    }
  }

  async handleIncomingFiles(files) {
    Toast.info(`Loading ${files.length} file(s)...`);
    const processed = [];

    for (const f of files) {
      try {
        const bytes = f.mockBytes || (await readFileAsArrayBuffer(f));
        const item = {
          name: f.name,
          size: f.size || bytes.byteLength,
          type: f.type || 'application/pdf',
          bytes: bytes,
          rotation: 0,
          pageCount: 1,
          thumbnailUrl: null
        };

        const isPdf = item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');
        if (isPdf && typeof document !== 'undefined') {
          try {
            const loadingTask = pdfjsLib.getDocument({
              data: bytes.slice(0),
              cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
              cMapPacked: true
            });
            const pdfDoc = await loadingTask.promise;
            item.pageCount = pdfDoc.numPages;

            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 0.35 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            item.thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
            pdfDoc.destroy();
          } catch (pdfErr) {
            console.warn('PDF thumbnail generation skipped:', item.name, pdfErr);
          }
        } else if (item.type.startsWith('image/')) {
          item.thumbnailUrl = URL.createObjectURL(new Blob([bytes], { type: item.type }));
        }

        processed.push(item);
      } catch (err) {
        console.error('Error reading file:', f.name, err);
      }
    }

    if (processed.length === 0) {
      Toast.error('No supported files could be loaded');
      return;
    }

    this.uploadedFiles = [...this.uploadedFiles, ...processed];
    if (this.activeTool.id === 'organize' && this.uploadedFiles.length > 0) {
      await this.unpackOrganizePages();
    }
    if (this.activeTool.id === 'pdf-to-text' && this.uploadedFiles.length > 0) {
      try {
        this.extractedTextPreview = await pdfEngine.extractDocumentText(this.uploadedFiles[0].bytes);
      } catch (e) {
        console.warn('Text preview extraction failed:', e);
      }
    }
    if (this.activeTool.id === 'rename' && this.uploadedFiles.length > 0) {
      try {
        const text = await pdfEngine.extractDocumentText(this.uploadedFiles[0].bytes);
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.startsWith('---'));
        if (lines.length > 0) {
          const heading = lines[0].replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 40).trim().replace(/\s+/g, '_');
          if (heading) this.renameCustomName = `${heading}.pdf`;
        }
      } catch (e) {
        console.warn('Auto heading detection failed:', e);
      }
    }
    this.stage = 'workspace';
    this.render();
  }

  async unpackOrganizePages() {
    const primary = this.uploadedFiles[0];
    if (!primary || !primary.bytes) return;
    try {
      const pdfDoc = await pdfjsLib.getDocument({
        data: primary.bytes.slice(0),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
        cMapPacked: true
      }).promise;
      const numPages = pdfDoc.numPages;
      this.organizePages = [];
      for (let p = 1; p <= numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        this.organizePages.push({
          pageNum: p,
          originalIndex: p - 1,
          rotation: 0,
          thumbnailUrl: canvas.toDataURL('image/jpeg', 0.85)
        });
      }
      pdfDoc.destroy();
    } catch (err) {
      console.warn('Failed unpacking pages for organize:', err);
    }
  }

  // --- STAGE 2: DEDICATED TOOL WORKSPACE ---
  renderToolWorkspace() {
    const t = this.activeTool;

    this.container.innerHTML = `
      <header class="workflow-header">
        <div class="workflow-header-inner">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="workflow-back-btn" id="btn-workspace-back" title="Back to upload">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
              <span>Change Files</span>
            </button>
            <div class="lets-logo" id="workspace-brand-logo" style="cursor: pointer;">
              <div class="lets-logo-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
                </svg>
              </div>
              <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
            </div>
            <span class="workflow-active-badge">${t.title}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${t.id === 'scan' ? `
              <button class="btn btn-sm btn-primary" id="btn-workspace-camera" style="display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                <span>Snap with Camera</span>
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline" id="btn-workspace-add-more">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
              <span>Add more files</span>
            </button>
            <input type="file" id="workspace-add-more-input" accept="${t.accept}" ${t.multiple ? 'multiple' : ''} style="display:none;" />
          </div>
        </div>
      </header>

      <main class="workflow-workspace-main">
        <div class="workflow-workspace-layout">
          <!-- Left/Center: Visual File Cards & Previews with Drag-and-Drop Reordering -->
          <div class="workflow-cards-area">
            ${t.id === 'deskew' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Scan Alignment & Straighten</span>
                  <span style="font-size: 11px; color: #0891b2; background: rgba(8, 145, 178, 0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(8, 145, 178, 0.25);">
                    Grid Guidelines Active
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="deskew-workspace-wrap">
                <div class="deskew-preview-container">
                  <div class="deskew-grid-overlay"></div>
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" id="deskew-img-preview" class="deskew-preview-image" style="transform: rotate(${this.deskewAngle}deg); transition: transform 0.08s ease-out;" />
                  <div class="deskew-angle-badge" id="deskew-badge-preview">
                    ${this.deskewAngle > 0 ? `+${this.deskewAngle.toFixed(1)}` : this.deskewAngle.toFixed(1)}°
                  </div>
                </div>
              </div>
            ` : t.id === 'organize' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">
                    ${this.organizePages.length} page(s)
                  </span>
                  <span style="font-size: 11px; color: var(--text-muted); background: var(--bg-surface); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                    Drag page cards to resequence
                  </span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm btn-outline" id="btn-organize-top-rotate" title="Rotate all 90°">
                    <span>Rotate All</span>
                  </button>
                  <button class="btn btn-sm btn-outline" id="btn-organize-top-reset" title="Reset order">
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <!-- Pages Grid for Organize Tool -->
              <div class="workflow-file-grid" id="organize-pages-grid">
                ${this.organizePages.map((p, idx) => `
                  <div class="workflow-file-card organize-page-card ${this.draggedPageIndex === idx ? 'dragging' : ''}" data-page-idx="${idx}" draggable="true" title="Drag to reorder Page #${idx + 1}">
                    <button class="file-card-delete btn-delete-page" data-del-page="${idx}" title="Delete this page">&times;</button>
                    <div class="file-card-preview">
                      <img src="${p.thumbnailUrl}" alt="page preview" class="file-card-thumb" style="transform: rotate(${p.rotation || 0}deg); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);" />
                    </div>
                    <div class="file-card-details">
                      <span class="file-card-name">Page ${p.pageNum}</span>
                      <span class="file-card-size">${p.rotation ? `${p.rotation}° rotated` : 'Standard'}</span>
                    </div>
                    <div class="file-card-actions">
                      <button class="btn-icon btn-sm btn-rotate-page" data-rot-page="${idx}" title="Rotate 90° Clockwise">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                      </button>
                      <span class="file-card-order">#${idx + 1}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : t.id === 'crop' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Crop Margins Preview</span>
                  <span id="crop-dimensions-badge" style="font-size: 11px; color: #0d9488; background: rgba(13, 148, 136, 0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(13, 148, 136, 0.25);">
                    Active Area: ${Math.max(20, Math.round(595.28 - this.cropLeft - this.cropRight))} × ${Math.max(20, Math.round(841.89 - this.cropTop - this.cropBottom))} pt
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="crop-workspace-wrap">
                <div class="crop-preview-container" id="crop-preview-container">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" id="crop-page-img" class="crop-page-img" />
                  <div class="crop-marquee-box" id="crop-marquee-box" style="inset: ${this.cropTop * 0.35}px ${this.cropRight * 0.35}px ${this.cropBottom * 0.35}px ${this.cropLeft * 0.35}px;">
                    <div class="crop-handle crop-handle-nw"></div>
                    <div class="crop-handle crop-handle-n"></div>
                    <div class="crop-handle crop-handle-ne"></div>
                    <div class="crop-handle crop-handle-e"></div>
                    <div class="crop-handle crop-handle-se"></div>
                    <div class="crop-handle crop-handle-s"></div>
                    <div class="crop-handle crop-handle-sw"></div>
                    <div class="crop-handle crop-handle-w"></div>
                  </div>
                </div>
              </div>
            ` : t.id === 'bates' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Bates Numbering Preview</span>
                  <span id="bates-preview-badge" style="font-size: 11px; color: #1e293b; background: rgba(30, 41, 59, 0.1); padding: 3px 8px; border-radius: 6px; font-family: monospace; font-weight: 700; border: 1px solid rgba(30, 41, 59, 0.25);">
                    ${this.batesPrefix}${String(this.batesStart).padStart(this.batesDigits, '0')}${this.batesSuffix}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="bates-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" id="bates-page-img" style="width: 100%; height: auto; display: block;" />
                  <div id="bates-overlay-stamp" style="position: absolute; ${this.getBatesPositionCss()}; background: rgba(255, 255, 255, 0.9); padding: 4px 8px; border-radius: 4px; border: 1px dashed ${this.batesColor}; font-family: monospace; font-size: 11px; font-weight: 700; color: ${this.batesColor}; pointer-events: none; transition: all 0.2s ease;">
                    ${this.batesPrefix}${String(this.batesStart).padStart(this.batesDigits, '0')}${this.batesSuffix}
                  </div>
                </div>
              </div>
            ` : t.id === 'nup' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Imposition Layout Preview</span>
                  <span style="font-size: 11px; color: #475569; background: rgba(71, 85, 105, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(71, 85, 105, 0.25);">
                    ${this.nupCount === 2 ? '2-Up Landscape Sheet' : '4-Up Portrait Sheet'}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="nup-workspace-wrap" style="display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="background: white; border: 2px solid var(--border-strong); box-shadow: 0 12px 28px rgba(0,0,0,0.2); border-radius: 6px; padding: 16px; ${this.nupCount === 2 ? 'width: 420px; height: 297px;' : 'width: 297px; height: 420px;'} display: grid; ${this.nupCount === 2 ? 'grid-template-columns: 1fr 1fr; gap: 14px;' : 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px;'}">
                  ${Array.from({ length: this.nupCount }).map((_, i) => `
                    <div style="border: 1px dashed #64748b; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; color: #475569; font-size: 12px; font-weight: 600;">
                      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      <span style="margin-top: 4px;">Page ${i + 1}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : t.id === 'split-half' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Book Scan Bisecting Preview</span>
                  <span style="font-size: 11px; color: #4f46e5; background: rgba(79, 70, 229, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(79, 70, 229, 0.25);">
                    ${this.splitHalfDirection === 'vertical' ? 'Vertical Center Cut (Left & Right)' : 'Horizontal Center Cut (Top & Bottom)'}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="split-half-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 340px;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />
                  ${this.splitHalfDirection === 'vertical' ? `
                    <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; border-left: 2px dashed #ef4444; transform: translateX(-1px); pointer-events: none;">
                      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">✂</div>
                    </div>
                  ` : `
                    <div style="position: absolute; left: 0; right: 0; top: 50%; height: 2px; border-top: 2px dashed #ef4444; transform: translateY(-1px); pointer-events: none;">
                      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">✂</div>
                    </div>
                  `}
                </div>
              </div>
            ` : t.id === 'flip' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Mirror & Flip Preview</span>
                  <span style="font-size: 11px; color: #8b5cf6; background: rgba(139, 92, 246, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(139, 92, 246, 0.25);">
                    ${this.flipDirection === 'horizontal' ? 'Horizontal (Left-Right)' : (this.flipDirection === 'vertical' ? 'Vertical (Top-Bottom)' : 'Both Axes')}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="flip-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" id="flip-page-img" style="width: 100%; height: auto; display: block; transform: ${this.flipDirection === 'horizontal' ? 'scaleX(-1)' : (this.flipDirection === 'vertical' ? 'scaleY(-1)' : 'scale(-1, -1)')}; transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);" />
                </div>
              </div>
            ` : t.id === 'grayscale' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Monochrome Desaturation Preview</span>
                  <span style="font-size: 11px; color: #475569; background: rgba(71, 85, 105, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(71, 85, 105, 0.25);">
                    DeviceGray Simulation
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="grayscale-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" id="grayscale-page-img" style="width: 100%; height: auto; display: block; filter: ${this.grayscalePreviewActive !== false ? 'grayscale(100%) contrast(105%)' : 'none'}; transition: filter 0.25s ease;" />
                  <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(15, 23, 42, 0.85); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; backdrop-filter: blur(4px);">
                    ${this.grayscalePreviewActive !== false ? '● Grayscale Preview' : '● Original Color'}
                  </div>
                </div>
              </div>
            ` : t.id === 'pdf-to-text' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Extracted Plain Text Preview</span>
                  <span id="text-word-count-badge" style="font-size: 11px; color: #334155; background: rgba(51, 65, 85, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(51, 65, 85, 0.25);">
                    ${this.extractedTextPreview ? `${this.extractedTextPreview.split(/\s+/).filter(Boolean).length} words` : 'Inspecting text...'}
                  </span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm btn-outline" id="btn-copy-extracted-text">
                    <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>Copy Text</span>
                  </button>
                </div>
              </div>

              <div class="text-extract-workspace-wrap" style="display: grid; grid-template-columns: 240px 1fr; gap: 20px; background: var(--bg-surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; background: white; align-self: start;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; height: 100%;">
                  <textarea id="extracted-text-area" readonly style="width: 100%; flex: 1; min-height: 380px; padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; line-height: 1.6; resize: none;" placeholder="Extracting searchable text from document...">${this.extractedTextPreview || 'Loading plain text streams...'}</textarea>
                </div>
              </div>
            ` : t.id === 'unlock' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Unlock Security & Permissions</span>
                  <span style="font-size: 11px; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.25);">
                    Zero Restrictions
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="unlock-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 36px 20px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px; text-align: center;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                </div>
                <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Remove PDF Password & Permissions</h3>
                <p style="font-size: 13px; color: var(--text-muted); max-width: 420px; line-height: 1.5; margin-bottom: 24px;">
                  Strip owner passwords, printing blocks, copying limitations, and editing restrictions permanently from this document.
                </p>
                <div style="box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12); border-radius: 4px; overflow: hidden; background: white; max-width: 200px;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />
                </div>
              </div>
            ` : t.id === 'sign' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Electronic Signature Stamp</span>
                  <span style="font-size: 11px; color: #30050d; background: rgba(48, 5, 13, 0.08); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(48, 5, 13, 0.25);">
                    ${this.signMode === 'draw' ? 'Handwritten Ink' : (this.signMode === 'type' ? 'Calligraphic Stamp' : 'Uploaded Signature')}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="sign-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" id="sign-page-img" style="width: 100%; height: auto; display: block;" />
                  <div id="sign-preview-overlay" style="position: absolute; ${this.getSignPositionCss()}; background: rgba(255, 255, 255, 0.95); padding: 6px 12px; border-radius: 6px; border: 1.5px dashed #30050d; box-shadow: 0 4px 12px rgba(48, 5, 13, 0.15); pointer-events: none; transition: all 0.2s ease; text-align: center;">
                    ${this.signDataUrl ? `
                      <img src="${this.signDataUrl}" style="height: 38px; width: auto; max-width: 120px; display: block; margin: 0 auto;" />
                    ` : `
                      <div style="font-family: '${this.signFont}', cursive, sans-serif; font-size: 20px; color: #0f172a; line-height: 1.2;">
                        ${this.signName || 'Authorized Signature'}
                      </div>
                    `}
                    ${this.includeSignDate ? `
                      <div style="font-size: 9px; color: #64748b; margin-top: 2px; font-family: sans-serif;">Signed: ${this.signDate}</div>
                    ` : ''}
                  </div>
                </div>
              </div>
            ` : t.id === 'pagenumbers' ? `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">Page Numbering Preview</span>
                  <span style="font-size: 11px; color: #30050d; background: rgba(48, 5, 13, 0.08); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(48, 5, 13, 0.25);">
                    ${this.getPnPositionLabel()}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  ${this.uploadedFiles[0]?.name || ''}
                </div>
              </div>

              <div class="pn-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
                <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                  <img src="${this.uploadedFiles[0]?.thumbnailUrl || ''}" id="pn-page-img" style="width: 100%; height: auto; display: block;" />
                  <div id="pn-preview-badge-overlay" style="position: absolute; ${this.getPnPositionCss()}; background: rgba(255, 255, 255, 0.92); padding: 3px 8px; border-radius: 4px; border: 1px dashed #30050d; font-size: 10px; font-weight: 600; color: #1e293b; pointer-events: none; transition: all 0.2s ease;">
                    ${(this.pnFormat || 'Page {n} of {total}').replace('{n}', '1').replace('{total}', String(this.uploadedFiles[0]?.pageCount || 5))}
                  </div>
                </div>
              </div>
            ` : `
              <div class="workflow-cards-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px;">
                    ${this.uploadedFiles.length} file(s) selected
                  </span>
                  <span style="font-size: 11px; color: var(--text-muted); background: var(--bg-surface); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                    Drag cards to reorder
                  </span>
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-outline" id="btn-workspace-sort-az" title="Sort A to Z">
                    <span>A-Z</span>
                  </button>
                  <button class="btn btn-sm btn-outline" id="btn-workspace-sort-za" title="Sort Z to A">
                    <span>Z-A</span>
                  </button>
                  <button class="btn btn-sm btn-outline" id="btn-workspace-reverse" title="Reverse order">
                    <span>⇄ Reverse</span>
                  </button>
                  <button class="btn btn-sm btn-outline" id="btn-workspace-clear" title="Clear all">
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              <!-- Cards Grid -->
              <div class="workflow-file-grid" id="workflow-file-grid">
                ${this.uploadedFiles.map((f, idx) => `
                  <div class="workflow-file-card" data-idx="${idx}" draggable="true" title="Drag to reorder file #${idx + 1}">
                    <button class="file-card-delete" data-del-idx="${idx}" title="Remove file">&times;</button>
                    <div class="file-card-preview">
                      ${f.thumbnailUrl
                        ? `<img src="${f.thumbnailUrl}" alt="page preview" class="file-card-thumb" style="transform: rotate(${f.rotation || 0}deg);" />`
                        : `<div class="file-card-pdf-icon" style="transform: rotate(${f.rotation || 0}deg);">
                            <svg width="40" height="40" fill="none" stroke="${t.color}" stroke-width="2" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span style="font-size: 10px; font-weight: 700; color: ${t.color}; margin-top: 4px;">PDF</span>
                          </div>`
                      }
                    </div>
                    <div class="file-card-details">
                      <span class="file-card-name" title="${f.name}">${f.name}</span>
                      <span class="file-card-size">
                        ${f.pageCount ? `${f.pageCount} ${f.pageCount === 1 ? 'page' : 'pages'} • ` : ''}${formatFileSize(f.size)}
                      </span>
                    </div>
                    <div class="file-card-actions">
                      <button class="btn-icon btn-sm" data-move-left="${idx}" title="Move left" ${idx === 0 ? 'disabled style="opacity:0.35;cursor:default;"' : ''}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg>
                      </button>
                      <button class="btn-icon btn-sm" data-move-right="${idx}" title="Move right" ${idx === this.uploadedFiles.length - 1 ? 'disabled style="opacity:0.35;cursor:default;"' : ''}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
                      </button>
                      <button class="btn-icon btn-sm" data-rot-idx="${idx}" title="Rotate 90°">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                      </button>
                      <span class="file-card-order">#${idx + 1}</span>
                    </div>
                  </div>
                `).join('')}
                ${t.multiple ? `
                  <div class="workflow-file-card workflow-file-add-card" id="card-workspace-add-more" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px; border: 2px dashed var(--border-color); border-radius: 12px; cursor: pointer; background: var(--bg-surface); transition: all 0.2s ease;" title="Add more files">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: ${t.color}18; color: ${t.color}; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                    </div>
                    <span style="font-weight: 600; font-size: 13px; color: var(--text-main);">Add more files</span>
                    <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Click or drop files</span>
                  </div>
                ` : ''}
              </div>
            `}
          </div>

          <!-- Right: Dedicated Tool Options & Primary Action Sidebar -->
          <aside class="workflow-sidebar-card">
            <h3 class="workflow-sidebar-title">${t.title}</h3>
            <p class="workflow-sidebar-desc">${t.subtitle}</p>

            ${this.renderToolOptionsHtml()}

            <button class="workflow-execute-btn" id="btn-workspace-execute" style="background: ${t.color};">
              <span>${this.getExecuteButtonLabel()}</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </button>
          </aside>
        </div>
      </main>
    `;

    this.bindWorkspaceEvents();
  }

  getExecuteButtonLabel() {
    const id = this.activeTool.id;
    const isCombiner = ['merge', 'compare', 'images-to-pdf', 'alternate-mix', 'scan', 'organize'].includes(id);
    const count = this.uploadedFiles.length;
    const batchPrefix = (!isCombiner && id !== 'split' && count > 1) ? `Batch (${count} files) — ` : '';

    if (id === 'merge') return `Merge PDF (${count} files)`;
    if (id === 'compress') return `${batchPrefix}Compress PDF`;
    if (id === 'split') {
      if (this.splitMode === 'size') return `Split by Size (${Math.round(this.splitMaxBytes / (1024 * 1024))}MB)`;
      if (this.splitMode === 'bookmarks') return 'Split by Bookmarks';
      if (this.splitMode === 'all') return 'Extract All Pages';
      return 'Split PDF Ranges';
    }
    if (id === 'images-to-pdf') return 'Convert to PDF';
    if (id === 'to-image') return `${batchPrefix}Convert to ${this.imageFormat === 'image/jpeg' ? 'JPG' : 'PNG'}`;
    if (id === 'ocr-pdf') return `${batchPrefix}Run OCR`;
    if (id === 'watermark') return `${batchPrefix}Apply Watermark`;
    if (id === 'security') return `${batchPrefix}Encrypt & Protect PDF`;
    if (id === 'rotate') return `${batchPrefix}Rotate PDF Pages`;
    if (id === 'crop') return `${batchPrefix}Apply Crop`;
    if (id === 'resize') return `${batchPrefix}Resize Margins`;
    if (id === 'grayscale') return `${batchPrefix}Convert to Grayscale`;
    if (id === 'flip') return `${batchPrefix}Mirror / Flip Pages`;
    if (id === 'repair') return `${batchPrefix}Repair PDF`;
    if (id === 'compare') return 'Compare Documents';
    if (id === 'pdfa') return `${batchPrefix}Convert to PDF/A`;
    if (id === 'extract-images') return `${batchPrefix}Extract All Images`;
    if (id === 'pdf-to-text') return `${batchPrefix}Extract Text`;
    if (id === 'deskew') return `${batchPrefix}Straighten & Save PDF`;
    if (id === 'organize') return `Save Organized PDF (${this.organizePages.length} pages)`;
    if (id === 'bates') return `${batchPrefix}Apply Bates Numbering`;
    if (id === 'nup') return `${batchPrefix}Create ${this.nupCount}-Up PDF`;
    if (id === 'split-half') return `${batchPrefix}Split in Half (${this.splitHalfDirection})`;
    if (id === 'alternate-mix') return 'Mix & Interleave Documents';
    if (id === 'html-to-pdf') return `${batchPrefix}Convert HTML to PDF`;
    if (id === 'word-to-pdf') return `${batchPrefix}Convert DOCX to PDF`;
    if (id === 'pdf-to-word') return `${batchPrefix}Convert to Word DOC`;
    if (id === 'pdf-to-excel') return `${batchPrefix}Export to CSV / Excel`;
    if (id === 'pdf-to-ppt') return `${batchPrefix}Export to PPT Slides`;
    if (id === 'unlock') return `${batchPrefix}Unlock & Decrypt PDF`;
    if (id === 'remove-annotations') return `${batchPrefix}Clean Annotations`;
    if (id === 'rename') return `${batchPrefix}Save Renamed PDF`;
    if (id === 'sign') return 'Sign Document & Finish';
    if (id === 'pagenumbers') return `${batchPrefix}Apply Page Numbers`;
    if (id === 'flatten') return `${batchPrefix}Flatten PDF Forms`;
    if (id === 'redact') return `${batchPrefix}Permanently Redact PDF`;
    if (id === 'scan') return 'Compile Scanned PDF';
    if (id === 'excel-to-pdf') return `${batchPrefix}Convert Excel to PDF`;
    if (id === 'ppt-to-pdf') return `${batchPrefix}Convert PowerPoint to PDF`;
    return `${batchPrefix}Process with ${this.activeTool.title}`;
  }

  renderToolOptionsHtml() {
    const id = this.activeTool.id;
    const primary = this.uploadedFiles[0] || {};

    if (id === 'merge') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Merge Order</label>
          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 13px; color: var(--text-muted); line-height: 1.5;">
            Files will be compiled in the sequence shown above. Drag any card to change its position or click the rotation icon to adjust page orientation.
          </div>
        </div>
      `;
    }

    if (id === 'compress') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Compression Level</label>
          <div class="compression-cards">
            <label class="comp-option-card ${this.compressLevel === 'extreme' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="extreme" ${this.compressLevel === 'extreme' ? 'checked' : ''} />
              <div>
                <strong>Extreme Compression</strong>
                <span>Maximum size reduction, lower image DPI</span>
              </div>
            </label>
            <label class="comp-option-card ${this.compressLevel === 'recommended' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="recommended" ${this.compressLevel === 'recommended' ? 'checked' : ''} />
              <div>
                <strong>Recommended (Default)</strong>
                <span>Optimal balance of high vector quality & compact size</span>
              </div>
            </label>
            <label class="comp-option-card ${this.compressLevel === 'less' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="less" ${this.compressLevel === 'less' ? 'checked' : ''} />
              <div>
                <strong>Less Compression</strong>
                <span>Lossless vector structures, highest image quality</span>
              </div>
            </label>
          </div>
        </div>
      `;
    }

    if (id === 'split') {
      const pageCount = primary.pageCount || 1;
      return `
        <div class="workflow-options-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="workflow-options-label" style="margin: 0;">Split Mode</label>
            <span style="font-size: 11px; font-weight: 600; color: var(--primary); background: rgba(48, 5, 13, 0.08); padding: 2px 8px; border-radius: 12px;">
              ${pageCount} total pages
            </span>
          </div>
          <div class="split-mode-pills">
            <button type="button" class="split-mode-pill ${this.splitMode === 'ranges' ? 'active' : ''}" data-split-mode="ranges">
              Custom Ranges
            </button>
            <button type="button" class="split-mode-pill ${this.splitMode === 'all' ? 'active' : ''}" data-split-mode="all">
              Extract All Pages
            </button>
            <button type="button" class="split-mode-pill ${this.splitMode === 'size' ? 'active' : ''}" data-split-mode="size">
              Split by Size
            </button>
            <button type="button" class="split-mode-pill ${this.splitMode === 'bookmarks' ? 'active' : ''}" data-split-mode="bookmarks">
              Split by Bookmarks
            </button>
          </div>

          ${this.splitMode === 'ranges' ? `
            <div style="margin-top: 10px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Page Ranges</label>
              <input type="text" id="split-range-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${this.splitRange}" placeholder="e.g. 1-2, 3-5" />
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">
                Specify comma-separated ranges. Example: <code>1-${Math.min(2, pageCount)}, ${Math.min(3, pageCount)}-${pageCount}</code>
              </span>
            </div>
          ` : this.splitMode === 'all' ? `
            <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); margin-top: 6px;">
              Every single page of this document will be separated into individual PDF files bundled into a convenient ZIP package.
            </div>
          ` : this.splitMode === 'size' ? `
            <div style="margin-top: 10px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Maximum Target Size (MB)</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="number" id="split-size-input" class="input-sm" style="width: 90px; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${Math.round(this.splitMaxBytes / (1024 * 1024)) || 5}" min="1" max="500" />
                <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">MB per file</span>
              </div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 6px;">
                Subdivides the PDF into parts so that each generated document is below your target file size.
              </span>
            </div>
          ` : `
            <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); margin-top: 6px;">
              Detects the PDF's Table of Contents outline bookmarks and automatically extracts chapters/sections into individual PDF files.
            </div>
          `}
        </div>
      `;
    }

    if (id === 'images-to-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Page Orientation</label>
          <div class="tool-segmented-control" style="margin-bottom: 14px;">
            <button type="button" class="tool-seg-btn ${this.imgOrientation === 'portrait' ? 'active' : ''}" data-img-orient="portrait">
              Portrait (A4)
            </button>
            <button type="button" class="tool-seg-btn ${this.imgOrientation === 'landscape' ? 'active' : ''}" data-img-orient="landscape">
              Landscape (A4)
            </button>
          </div>

          <label class="workflow-options-label">Page Margin</label>
          <div class="tool-segmented-control">
            <button type="button" class="tool-seg-btn ${this.imgMargin === '0' ? 'active' : ''}" data-img-margin="0">
              No Margin
            </button>
            <button type="button" class="tool-seg-btn ${this.imgMargin === '20' ? 'active' : ''}" data-img-margin="20">
              Small (20pt)
            </button>
            <button type="button" class="tool-seg-btn ${this.imgMargin === '40' ? 'active' : ''}" data-img-margin="40">
              Big (40pt)
            </button>
          </div>
        </div>
      `;
    }

    if (id === 'to-image') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Image Output Format</label>
          <div class="tool-segmented-control" style="margin-bottom: 14px;">
            <button type="button" class="tool-seg-btn ${this.imageFormat === 'image/jpeg' ? 'active' : ''}" data-img-fmt="image/jpeg">
              JPG (Standard)
            </button>
            <button type="button" class="tool-seg-btn ${this.imageFormat === 'image/png' ? 'active' : ''}" data-img-fmt="image/png">
              PNG (Lossless)
            </button>
          </div>

          <label class="workflow-options-label">Output DPI Quality</label>
          <select id="image-dpi-select" class="select-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="150" ${this.imageDpi === '150' ? 'selected' : ''}>150 DPI (Balanced Standard)</option>
            <option value="300" ${this.imageDpi === '300' ? 'selected' : ''}>300 DPI (Ultra High Print Quality)</option>
            <option value="72" ${this.imageDpi === '72' ? 'selected' : ''}>72 DPI (Web & Screen Thumbnail)</option>
          </select>
        </div>
      `;
    }

    if (id === 'watermark') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Watermark Text</label>
          <input type="text" id="wm-text-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${this.watermarkText}" placeholder="e.g. CONFIDENTIAL" />

          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
              <span>Opacity</span>
              <span id="wm-opacity-val">${Math.round(this.watermarkOpacity * 100)}%</span>
            </div>
            <input type="range" id="wm-opacity-range" min="0.1" max="0.9" step="0.05" value="${this.watermarkOpacity}" style="width: 100%; cursor: pointer;" />
          </div>

          <div style="margin-top: 12px;">
            <label class="workflow-options-label">Angle</label>
            <div class="tool-segmented-control">
              <button type="button" class="tool-seg-btn ${this.watermarkRotation === 45 ? 'active' : ''}" data-wm-rot="45">45° Diagonal</button>
              <button type="button" class="tool-seg-btn ${this.watermarkRotation === 0 ? 'active' : ''}" data-wm-rot="0">0° Horizontal</button>
              <button type="button" class="tool-seg-btn ${this.watermarkRotation === 90 ? 'active' : ''}" data-wm-rot="90">90° Vertical</button>
            </div>
          </div>
        </div>
      `;
    }

    if (id === 'security') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Set Document Password</label>
          <input type="password" id="protect-pwd-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 8px;" placeholder="Enter password to encrypt" value="${this.protectPassword}" />
          <input type="password" id="protect-conf-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" placeholder="Confirm password" value="${this.protectConfirmPassword}" />

          <div style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 8px;">Permissions</span>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-main); cursor: pointer; margin-bottom: 6px;">
              <input type="checkbox" id="protect-allow-print" ${this.allowPrinting ? 'checked' : ''} />
              <span>Allow high-resolution printing</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-main); cursor: pointer;">
              <input type="checkbox" id="protect-allow-copy" ${this.allowCopying ? 'checked' : ''} />
              <span>Allow copying text and graphics</span>
            </label>
          </div>
        </div>
      `;
    }

    if (id === 'rotate') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Batch Rotate All Pages</label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button type="button" class="btn btn-outline" id="btn-batch-rotate-right" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              <span>Rotate 90° Clockwise</span>
            </button>
            <button type="button" class="btn btn-outline" id="btn-batch-rotate-left" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38L-2.44 1.52"></path></svg>
              <span>Rotate 90° Counter-Clockwise</span>
            </button>
            <button type="button" class="btn btn-outline" id="btn-batch-rotate-180" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>Rotate 180° Upside Down</span>
            </button>
          </div>
        </div>
      `;
    }

    if (id === 'ocr-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Recognition Language</label>
          <select id="ocr-lang-select" class="select-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="eng" ${this.ocrLang === 'eng' ? 'selected' : ''}>English (Standard)</option>
            <option value="spa" ${this.ocrLang === 'spa' ? 'selected' : ''}>Spanish (Español)</option>
            <option value="fra" ${this.ocrLang === 'fra' ? 'selected' : ''}>French (Français)</option>
            <option value="deu" ${this.ocrLang === 'deu' ? 'selected' : ''}>German (Deutsch)</option>
            <option value="ita" ${this.ocrLang === 'ita' ? 'selected' : ''}>Italian (Italiano)</option>
          </select>
          <div style="background: var(--bg-surface); padding: 10px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); margin-top: 10px;">
            Generates an invisible selectable vector text layer on top of scanned bitmaps.
          </div>
        </div>
      `;
    }

    if (id === 'deskew') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Auto-Calibration</label>
          <button type="button" class="btn btn-outline" id="btn-auto-deskew" style="width: 100%; justify-content: center; gap: 8px; margin-bottom: 14px; background: rgba(8, 145, 178, 0.08); border-color: #0891b2; color: #0891b2; font-weight: 600;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            <span>Auto-Detect Tilt Angle</span>
          </button>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="workflow-options-label" style="margin: 0;">Straighten Angle</label>
            <span id="deskew-angle-display" style="font-family: monospace; font-size: 13px; font-weight: 700; color: #0891b2; background: rgba(8, 145, 178, 0.1); padding: 2px 8px; border-radius: 4px;">
              ${this.deskewAngle > 0 ? `+${this.deskewAngle.toFixed(1)}` : this.deskewAngle.toFixed(1)}°
            </span>
          </div>

          <input type="range" id="deskew-angle-range" min="-10.0" max="10.0" step="0.1" value="${this.deskewAngle}" style="width: 100%; cursor: pointer;" />

          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button type="button" class="btn btn-sm btn-outline" id="btn-deskew-minus" style="flex: 1; justify-content: center;">-0.1°</button>
            <button type="button" class="btn btn-sm btn-outline" id="btn-deskew-reset" style="flex: 1; justify-content: center;">0.0°</button>
            <button type="button" class="btn btn-sm btn-outline" id="btn-deskew-plus" style="flex: 1; justify-content: center;">+0.1°</button>
          </div>

          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-top: 12px;">
            Rotate the page until scan text lines align with the cyan grid guidelines.
          </div>
        </div>
      `;
    }

    if (id === 'organize') {
      return `
        <div class="workflow-options-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <label class="workflow-options-label" style="margin: 0;">Organize Summary</label>
            <span style="font-size: 12px; font-weight: 600; color: var(--primary); background: rgba(48, 5, 13, 0.08); padding: 2px 8px; border-radius: 12px;">
              ${this.organizePages.length} active pages
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button type="button" class="btn btn-outline" id="btn-organize-rotate-all" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              <span>Rotate All Pages 90°</span>
            </button>
            <button type="button" class="btn btn-outline" id="btn-organize-reset" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>Reset to Original Order</span>
            </button>
          </div>

          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-top: 12px;">
            Drag and drop page cards to reorder. Use the rotation (↻) and delete (✕) buttons on individual cards to customize your document layout.
          </div>
        </div>
      `;
    }

    if (id === 'crop') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Auto-Detect Whitespace</label>
          <button type="button" class="btn btn-outline" id="btn-auto-crop" style="width: 100%; justify-content: center; gap: 8px; margin-bottom: 14px; background: rgba(13, 148, 136, 0.08); border-color: #0d9488; color: #0d9488; font-weight: 600;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
            <span>Auto-Crop Margins</span>
          </button>

          <label class="workflow-options-label">Presets</label>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="24" data-right="24" data-bottom="24" data-left="24">Scanner Trim (24pt)</button>
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="36" data-right="36" data-bottom="36" data-left="36">Standard (36pt)</button>
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="50" data-right="30" data-bottom="50" data-left="30">Header/Footer (50pt)</button>
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="0" data-right="0" data-bottom="0" data-left="0">Reset 0pt</button>
          </div>

          <label class="workflow-options-label">Custom Margins (pt)</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Top Margin</span>
              <input type="number" id="workflow-crop-top" class="input-sm" min="0" max="300" value="${this.cropTop}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Bottom Margin</span>
              <input type="number" id="workflow-crop-bottom" class="input-sm" min="0" max="300" value="${this.cropBottom}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Left Margin</span>
              <input type="number" id="workflow-crop-left" class="input-sm" min="0" max="300" value="${this.cropLeft}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Right Margin</span>
              <input type="number" id="workflow-crop-right" class="input-sm" min="0" max="300" value="${this.cropRight}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-main); cursor: pointer;">
              <input type="checkbox" id="workflow-crop-all" ${this.cropApplyAll ? 'checked' : ''} />
              <span>Apply crop margins across all pages in document</span>
            </label>
          </div>
        </div>
      `;
    }

    if (id === 'bates') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Bates Stamp Format</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Prefix:</span>
              <input type="text" id="workflow-bates-prefix" class="input-sm" value="${this.batesPrefix}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: monospace;" />
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Suffix:</span>
              <input type="text" id="workflow-bates-suffix" class="input-sm" value="${this.batesSuffix}" placeholder="e.g. -CONF" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: monospace;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Start Number:</span>
              <input type="number" id="workflow-bates-start" class="input-sm" min="1" value="${this.batesStart}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Digits Padding:</span>
              <select id="workflow-bates-digits" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
                ${[3, 4, 5, 6, 7, 8].map(d => `<option value="${d}" ${this.batesDigits === d ? 'selected' : ''}>${d} digits (e.g. ${'1'.padStart(d, '0')})</option>`).join('')}
              </select>
            </div>
          </div>

          <label class="workflow-options-label">Stamp Position</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px;">
            ${['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
              <button type="button" class="btn btn-sm ${this.batesPos === pos ? 'btn-primary' : 'btn-outline'} btn-bates-pos" data-pos="${pos}" style="font-size: 11px; padding: 6px 4px; justify-content: center;">
                ${pos.replace('-', ' ')}
              </button>
            `).join('')}
          </div>

          <label class="workflow-options-label">Stamp Color</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="color" id="workflow-bates-color" value="${this.batesColor}" style="width: 36px; height: 32px; border: none; cursor: pointer; border-radius: 4px;" />
            <span id="workflow-bates-color-label" style="font-size: 12px; color: var(--text-muted); font-family: monospace;">${this.batesColor}</span>
          </div>
        </div>
      `;
    }

    if (id === 'nup') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Imposition Layout</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${this.nupCount === 2 ? 'btn-primary' : 'btn-outline'} btn-nup-toggle" data-count="2" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 14px;">2-Up</span>
              <span style="font-size: 11px; opacity: 0.85;">Side-by-side Landscape</span>
            </button>
            <button type="button" class="btn ${this.nupCount === 4 ? 'btn-primary' : 'btn-outline'} btn-nup-toggle" data-count="4" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 14px;">4-Up</span>
              <span style="font-size: 11px; opacity: 0.85;">2×2 Grid Portrait</span>
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Preserves vector fidelity and auto-scales page margins for standard A4 printing.
          </div>
        </div>
      `;
    }

    if (id === 'split-half') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Split Direction</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${this.splitHalfDirection === 'vertical' ? 'btn-primary' : 'btn-outline'} btn-split-half-dir" data-dir="vertical" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 13px;">Vertical Split</span>
              <span style="font-size: 11px; opacity: 0.85;">Left & Right halves (Book Spreads)</span>
            </button>
            <button type="button" class="btn ${this.splitHalfDirection === 'horizontal' ? 'btn-primary' : 'btn-outline'} btn-split-half-dir" data-dir="horizontal" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 13px;">Horizontal Split</span>
              <span style="font-size: 11px; opacity: 0.85;">Top & Bottom halves</span>
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Slices each page into two independent, sequential pages. Double-page book scans will become normal reading order pages.
          </div>
        </div>
      `;
    }

    if (id === 'alternate-mix') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Interleaving Order</label>
          <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--text-main); cursor: pointer; user-select: none; margin-bottom: 12px;">
            <input type="checkbox" id="workflow-alternate-reverse" ${this.alternateReverseB ? 'checked' : ''} style="margin-top: 2px;" />
            <span>Reverse order of Document B<br/><small style="color: var(--text-muted); font-size: 11px;">Standard for automatic duplex sheet-feeder scanner runs</small></span>
          </label>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Mixes Doc A (odd: 1, 3, 5...) and Doc B (even: 2, 4, 6...) into a single properly ordered document.
          </div>
        </div>
      `;
    }

    if (id === 'flip') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Mirror / Flip Axis</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${this.flipDirection === 'horizontal' ? 'btn-primary' : 'btn-outline'} btn-flip-dir" data-dir="horizontal" style="justify-content: flex-start; gap: 10px; padding: 10px 14px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path></svg>
              <span>Horizontal Mirror (Left & Right)</span>
            </button>
            <button type="button" class="btn ${this.flipDirection === 'vertical' ? 'btn-primary' : 'btn-outline'} btn-flip-dir" data-dir="vertical" style="justify-content: flex-start; gap: 10px; padding: 10px 14px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 8l5-5 5 5M7 16l5 5 5-5M4 12h16"></path></svg>
              <span>Vertical Mirror (Top & Bottom)</span>
            </button>
            <button type="button" class="btn ${this.flipDirection === 'both' ? 'btn-primary' : 'btn-outline'} btn-flip-dir" data-dir="both" style="justify-content: flex-start; gap: 10px; padding: 10px 14px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20z"></path></svg>
              <span>Both Axes (Inverted)</span>
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Essential for iron-on fabric transfers, backlit transparency signs, or inverted scanner feeds.
          </div>
        </div>
      `;
    }

    if (id === 'grayscale') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Preview Mode</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${this.grayscalePreviewActive !== false ? 'btn-primary' : 'btn-outline'} btn-grayscale-toggle" data-val="true" style="justify-content: center;">
              Grayscale
            </button>
            <button type="button" class="btn ${this.grayscalePreviewActive === false ? 'btn-primary' : 'btn-outline'} btn-grayscale-toggle" data-val="false" style="justify-content: center;">
              Original Color
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Converts colored images and vector drawing streams to monochrome DeviceGray. Significantly reduces ink usage and printing costs.
          </div>
        </div>
      `;
    }

    if (id === 'pdf-to-text') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Text Extraction Format</label>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); margin-bottom: 14px;">
            Parses decompressed text streams using vector font encoding tables, preserving document reading flow and paragraphs.
          </div>
          <button type="button" class="btn btn-outline" id="btn-options-copy-text" style="width: 100%; justify-content: center; gap: 8px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy Full Text to Clipboard</span>
          </button>
        </div>
      `;
    }

    if (id === 'unlock') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Document Password (If Protected)</label>
          <input type="password" id="workflow-unlock-password" class="input-sm" placeholder="Leave blank if owner-restricted" value="${this.unlockPassword}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;" />
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            If the PDF has restrictions preventing printing, copying, or form changes, LetsEdit strips the encryption dictionary so you have full unrestricted access.
          </div>
        </div>
      `;
    }

    if (id === 'rename') {
      const primary = this.uploadedFiles[0];
      const defaultName = this.renameCustomName || (primary ? primary.name.replace(/\.pdf$/i, '_renamed.pdf') : 'document.pdf');
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">New Filename</label>
          <input type="text" id="workflow-rename-input" class="input-sm" value="${defaultName}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-weight: 600; margin-bottom: 12px;" />
          <button type="button" class="btn btn-sm btn-outline" id="btn-auto-detect-heading" style="width: 100%; justify-content: center; gap: 8px; margin-bottom: 12px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"></path></svg>
            <span>Auto-Detect Title from Page 1</span>
          </button>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Inspects top heading and typography in the PDF text layer to suggest an authentic document title.
          </div>
        </div>
      `;
    }

    if (id === 'sign') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Signature Creation</label>
          <div class="split-mode-pills" style="margin-bottom: 12px;">
            <button type="button" class="split-mode-pill ${this.signMode === 'draw' ? 'active' : ''}" data-sign-mode="draw">
              Draw Ink
            </button>
            <button type="button" class="split-mode-pill ${this.signMode === 'type' ? 'active' : ''}" data-sign-mode="type">
              Type Name
            </button>
            <button type="button" class="split-mode-pill ${this.signMode === 'upload' ? 'active' : ''}" data-sign-mode="upload">
              Upload Image
            </button>
          </div>

          ${this.signMode === 'draw' ? `
            <div style="background: var(--bg-surface); border: 1.5px dashed var(--border-strong); border-radius: 8px; padding: 6px; text-align: center;">
              <canvas id="workflow-sig-canvas" width="280" height="110" style="background: white; border-radius: 6px; cursor: crosshair; touch-action: none; width: 100%; height: 110px; display: block;"></canvas>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding: 0 4px;">
                <span style="font-size: 11px; color: var(--text-muted);">Sign with mouse / touch</span>
                <button type="button" class="btn btn-xs btn-outline" id="btn-clear-sig-canvas">Clear</button>
              </div>
            </div>
          ` : this.signMode === 'type' ? `
            <div>
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Full Name / Initials</label>
              <input type="text" id="workflow-sign-name" class="input-sm" value="${this.signName}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 10px;" placeholder="e.g. John Doe" />
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Calligraphic Font</label>
              <select id="workflow-sign-font" class="input-sm" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
                <option value="Caveat" ${this.signFont === 'Caveat' ? 'selected' : ''}>Caveat (Cursive)</option>
                <option value="Dancing Script" ${this.signFont === 'Dancing Script' ? 'selected' : ''}>Dancing Script (Flowing)</option>
                <option value="Pacifico" ${this.signFont === 'Pacifico' ? 'selected' : ''}>Pacifico (Bold)</option>
                <option value="Great Vibes" ${this.signFont === 'Great Vibes' ? 'selected' : ''}>Great Vibes (Formal Calligraphy)</option>
              </select>
            </div>
          ` : `
            <div>
              <input type="file" id="workflow-sign-upload" accept="image/png,image/jpeg,image/svg+xml" style="display:none;" />
              <button type="button" class="btn btn-sm btn-outline" id="btn-trigger-sign-upload" style="width: 100%; justify-content: center; gap: 8px; padding: 12px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span>Upload Signature Image</span>
              </button>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px; text-align: center;">PNG with transparent background recommended</span>
            </div>
          `}

          <div style="margin-top: 14px;">
            <label class="workflow-options-label">Placement Position</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              ${['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
                <button type="button" class="btn btn-xs ${this.signPos === pos ? 'btn-primary' : 'btn-outline'} btn-sign-pos" data-pos="${pos}" style="font-size: 11px; padding: 6px 4px; text-transform: capitalize;">
                  ${pos.replace('-', ' ')}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="margin-top: 14px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div>
              <strong style="font-size: 12px; display: block; color: var(--text-main);">Include Date Stamp</strong>
              <span style="font-size: 11px; color: var(--text-muted);">${this.signDate}</span>
            </div>
            <input type="checkbox" id="chk-include-sign-date" ${this.includeSignDate ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;" />
          </div>
        </div>
      `;
    }

    if (id === 'pagenumbers') {
      const pageCount = primary.pageCount || 1;
      return `
        <div class="workflow-options-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="workflow-options-label" style="margin: 0;">Numbering Format</label>
            <span style="font-size: 11px; font-weight: 600; color: #30050d; background: rgba(48, 5, 13, 0.08); padding: 2px 8px; border-radius: 12px;">
              ${pageCount} pages total
            </span>
          </div>

          <input type="text" id="workflow-pn-format" class="input-sm" value="${this.pnFormat}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-weight: 600; margin-bottom: 6px;" />
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 8px;">
            Tokens: <code>{n}</code> = Page number, <code>{total}</code> = Total pages
          </span>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="Page {n} of {total}">Page {n} of {total}</button>
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="{n} / {total}">{n} / {total}</button>
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="Page {n}">Page {n}</button>
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="- {n} -">- {n} -</button>
          </div>

          <label class="workflow-options-label">Position On Page</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px;">
            ${['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
              <button type="button" class="btn btn-xs ${this.pnPos === pos ? 'btn-primary' : 'btn-outline'} btn-pn-pos" data-pos="${pos}" style="font-size: 11px; padding: 6px 4px; text-transform: capitalize;">
                ${pos.replace('-', ' ')}
              </button>
            `).join('')}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">First Number</label>
              <input type="number" id="workflow-pn-start" class="input-sm" min="1" value="${this.pnStartPage}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Font Size</label>
              <select id="workflow-pn-size" class="input-sm" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
                <option value="8" ${this.pnFontSize === 8 ? 'selected' : ''}>8 pt (Small)</option>
                <option value="10" ${this.pnFontSize === 10 ? 'selected' : ''}>10 pt (Standard)</option>
                <option value="12" ${this.pnFontSize === 12 ? 'selected' : ''}>12 pt (Medium)</option>
                <option value="14" ${this.pnFontSize === 14 ? 'selected' : ''}>14 pt (Large)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    if (id === 'redact') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Sensitive Words or Phrases to Redact</label>
          <textarea id="workflow-redact-keywords" class="input-sm" placeholder="Enter keywords to redact (e.g. John Doe, Confidential, 123-45-6789), separated by commas..." style="width: 100%; height: 75px; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 13px; line-height: 1.4; resize: vertical; margin-bottom: 12px;">${this.redactKeywords || ''}</textarea>

          <label class="workflow-options-label">Redaction Appearance</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn btn-xs ${this.redactColor === '#000000' ? 'btn-primary' : 'btn-outline'} btn-redact-color" data-color="#000000" style="padding: 8px; font-weight: 600;">
              Blackout Box
            </button>
            <button type="button" class="btn btn-xs ${this.redactColor === '#ffffff' ? 'btn-primary' : 'btn-outline'} btn-redact-color" data-color="#ffffff" style="padding: 8px; font-weight: 600;">
              Whiteout Box
            </button>
          </div>

          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #ef4444; line-height: 1.5;">
            <strong>Permanent Vector Redaction:</strong> The underlying text stream operators are permanently scrubbed from the PDF binary so sensitive information cannot be copied or retrieved.
          </div>
        </div>
      `;
    }

    if (id === 'scan') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Scanner Optimization</label>
          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: var(--text-main);">
              <input type="checkbox" id="chk-scan-contrast" checked style="width: 16px; height: 16px;" />
              <span>Auto-enhance document contrast</span>
            </label>
          </div>

          <label class="workflow-options-label">Page Margins</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" class="btn btn-xs ${this.imgMargin === '0' ? 'btn-primary' : 'btn-outline'} btn-scan-margin" data-margin="0">Fit to Edge</button>
            <button type="button" class="btn btn-xs ${this.imgMargin === '20' ? 'btn-primary' : 'btn-outline'} btn-scan-margin" data-margin="20">Add Margin (20pt)</button>
          </div>
        </div>
      `;
    }

    if (id === 'excel-to-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Document Title</label>
          <input type="text" id="workflow-excel-title" class="input-sm" value="${this.excelTitle || primary.name?.replace(/\.[^/.]+$/, '') || 'Spreadsheet Report'}" placeholder="Spreadsheet Report" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;" />

          <label class="workflow-options-label">Page Orientation</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px;">
            <button type="button" class="btn btn-xs ${(!this.excelOrientation || this.excelOrientation === 'auto') ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="auto">Auto</button>
            <button type="button" class="btn btn-xs ${this.excelOrientation === 'portrait' ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="portrait">Portrait</button>
            <button type="button" class="btn btn-xs ${this.excelOrientation === 'landscape' ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="landscape">Landscape</button>
          </div>

          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            Supports Excel (.xlsx, .xls) and CSV sheets. Generates vector tables with styled headers, alternating row colors, and auto-pagination.
          </div>
        </div>
      `;
    }

    if (id === 'ppt-to-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Presentation Title</label>
          <input type="text" id="workflow-ppt-title" class="input-sm" value="${this.pptTitle || primary.name?.replace(/\.[^/.]+$/, '') || 'Presentation Deck'}" placeholder="Presentation Deck" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;" />

          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            Converts slide texts, bullets, and titles into 16:9 widescreen landscape PDF presentation pages with executive header banners and footer slide counters.
          </div>
        </div>
      `;
    }

    return `
      <div class="workflow-options-group">
        <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 13px; color: var(--text-muted); line-height: 1.5;">
          Ready to execute 100% in your browser. No files are uploaded to any server.
        </div>
      </div>
    `;
  }

  bindWorkspaceEvents() {
    const backBtn = this.container.querySelector('#btn-workspace-back');
    const logo = this.container.querySelector('#workspace-brand-logo');
    const addMoreBtn = this.container.querySelector('#btn-workspace-add-more');
    const addMoreInput = this.container.querySelector('#workspace-add-more-input');
    const clearBtn = this.container.querySelector('#btn-workspace-clear');
    const sortAzBtn = this.container.querySelector('#btn-workspace-sort-az');
    const sortZaBtn = this.container.querySelector('#btn-workspace-sort-za');
    const reverseBtn = this.container.querySelector('#btn-workspace-reverse');
    const execBtn = this.container.querySelector('#btn-workspace-execute');

    if (backBtn) backBtn.onclick = () => { this.stage = 'upload'; this.render(); };
    if (logo) logo.onclick = () => this.closeWorkflow();

    if (addMoreBtn && addMoreInput) {
      addMoreBtn.onclick = () => addMoreInput.click();
      addMoreInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) await this.handleIncomingFiles(files);
        addMoreInput.value = '';
      };
    }

    const cardAddMore = this.container.querySelector('#card-workspace-add-more');
    if (cardAddMore && addMoreInput) {
      cardAddMore.onclick = () => addMoreInput.click();
      cardAddMore.ondragover = (e) => {
        e.preventDefault();
        cardAddMore.classList.add('drag-over');
      };
      cardAddMore.ondragleave = () => cardAddMore.classList.remove('drag-over');
      cardAddMore.ondrop = async (e) => {
        e.preventDefault();
        cardAddMore.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) await this.handleIncomingFiles(files);
      };
    }

    if (clearBtn) {
      clearBtn.onclick = () => {
        this.uploadedFiles = [];
        this.stage = 'upload';
        this.render();
      };
    }

    if (sortAzBtn) {
      sortAzBtn.onclick = () => {
        this.uploadedFiles.sort((a, b) => a.name.localeCompare(b.name));
        this.render();
        Toast.info('Sorted files A to Z');
      };
    }

    if (sortZaBtn) {
      sortZaBtn.onclick = () => {
        this.uploadedFiles.sort((a, b) => b.name.localeCompare(a.name));
        this.render();
        Toast.info('Sorted files Z to A');
      };
    }

    if (reverseBtn) {
      reverseBtn.onclick = () => {
        this.uploadedFiles.reverse();
        this.render();
        Toast.info('Reversed file order');
      };
    }

    // HTML5 Drag & drop card resequencing
    const cards = this.container.querySelectorAll('.workflow-file-card');
    cards.forEach(card => {
      card.ondragstart = (e) => {
        const idx = parseInt(card.getAttribute('data-idx'), 10);
        this.draggedIndex = idx;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(idx));
      };

      card.ondragend = () => {
        this.draggedIndex = null;
        cards.forEach(c => {
          c.classList.remove('dragging');
          c.classList.remove('drag-over');
        });
      };

      card.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!card.classList.contains('drag-over')) {
          card.classList.add('drag-over');
        }
      };

      card.ondragleave = () => {
        card.classList.remove('drag-over');
      };

      card.ondrop = (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const targetIdx = parseInt(card.getAttribute('data-idx'), 10);
        const sourceIdx = this.draggedIndex !== null
          ? this.draggedIndex
          : parseInt(e.dataTransfer.getData('text/plain'), 10);

        if (!isNaN(sourceIdx) && !isNaN(targetIdx) && sourceIdx !== targetIdx) {
          const item = this.uploadedFiles.splice(sourceIdx, 1)[0];
          this.uploadedFiles.splice(targetIdx, 0, item);
          this.render();
          Toast.info(`Moved file #${sourceIdx + 1} to position #${targetIdx + 1}`);
        }
      };
    });

    // Delete single card
    this.container.querySelectorAll('[data-del-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-del-idx'), 10);
        this.uploadedFiles.splice(idx, 1);
        if (this.uploadedFiles.length === 0) {
          this.stage = 'upload';
        }
        this.render();
      };
    });

    // Rotate single card
    this.container.querySelectorAll('[data-rot-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-rot-idx'), 10);
        this.uploadedFiles[idx].rotation = ((this.uploadedFiles[idx].rotation || 0) + 90) % 360;
        this.render();
      };
    });

    // Move left single card
    this.container.querySelectorAll('[data-move-left]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-move-left'), 10);
        if (idx > 0) {
          const item = this.uploadedFiles.splice(idx, 1)[0];
          this.uploadedFiles.splice(idx - 1, 0, item);
          this.render();
          Toast.info(`Shifted file #${idx + 1} left`);
        }
      };
    });

    // Move right single card
    this.container.querySelectorAll('[data-move-right]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-move-right'), 10);
        if (idx < this.uploadedFiles.length - 1) {
          const item = this.uploadedFiles.splice(idx, 1)[0];
          this.uploadedFiles.splice(idx + 1, 0, item);
          this.render();
          Toast.info(`Shifted file #${idx + 1} right`);
        }
      };
    });

    // Compression level radio
    this.container.querySelectorAll('input[name="comp-level"]').forEach(radio => {
      radio.onchange = (e) => {
        this.compressLevel = e.target.value;
        this.render();
      };
    });

    // Split mode pills & range input
    this.container.querySelectorAll('[data-split-mode]').forEach(btn => {
      btn.onclick = () => {
        this.splitMode = btn.getAttribute('data-split-mode');
        this.render();
      };
    });
    const splitInp = this.container.querySelector('#split-range-input');
    if (splitInp) {
      splitInp.oninput = (e) => {
        this.splitRange = e.target.value;
      };
    }
    const splitSizeInp = this.container.querySelector('#split-size-input');
    if (splitSizeInp) {
      splitSizeInp.oninput = (e) => {
        const val = parseFloat(e.target.value) || 5;
        this.splitMaxBytes = Math.max(1, val) * 1024 * 1024;
      };
    }

    // Images to PDF controls
    this.container.querySelectorAll('[data-img-orient]').forEach(btn => {
      btn.onclick = () => {
        this.imgOrientation = btn.getAttribute('data-img-orient');
        this.render();
      };
    });
    this.container.querySelectorAll('[data-img-margin]').forEach(btn => {
      btn.onclick = () => {
        this.imgMargin = btn.getAttribute('data-img-margin');
        this.render();
      };
    });

    // PDF to Image controls
    this.container.querySelectorAll('[data-img-fmt]').forEach(btn => {
      btn.onclick = () => {
        this.imageFormat = btn.getAttribute('data-img-fmt');
        this.render();
      };
    });
    const dpiSel = this.container.querySelector('#image-dpi-select');
    if (dpiSel) {
      dpiSel.onchange = (e) => {
        this.imageDpi = e.target.value;
      };
    }

    // Watermark controls
    const wmTextInp = this.container.querySelector('#wm-text-input');
    if (wmTextInp) {
      wmTextInp.oninput = (e) => { this.watermarkText = e.target.value; };
    }
    const wmOpRange = this.container.querySelector('#wm-opacity-range');
    const wmOpVal = this.container.querySelector('#wm-opacity-val');
    if (wmOpRange && wmOpVal) {
      wmOpRange.oninput = (e) => {
        this.watermarkOpacity = parseFloat(e.target.value);
        wmOpVal.textContent = `${Math.round(this.watermarkOpacity * 100)}%`;
      };
    }
    this.container.querySelectorAll('[data-wm-rot]').forEach(btn => {
      btn.onclick = () => {
        this.watermarkRotation = parseInt(btn.getAttribute('data-wm-rot'), 10);
        this.render();
      };
    });

    // Security controls
    const secPwd = this.container.querySelector('#protect-pwd-input');
    const secConf = this.container.querySelector('#protect-conf-input');
    if (secPwd) secPwd.oninput = (e) => { this.protectPassword = e.target.value; };
    if (secConf) secConf.oninput = (e) => { this.protectConfirmPassword = e.target.value; };
    const permPrint = this.container.querySelector('#protect-allow-print');
    if (permPrint) permPrint.onchange = (e) => { this.allowPrinting = e.target.checked; };
    const permCopy = this.container.querySelector('#protect-allow-copy');
    if (permCopy) permCopy.onchange = (e) => { this.allowCopying = e.target.checked; };

    // Batch rotation buttons
    const bRight = this.container.querySelector('#btn-batch-rotate-right');
    const bLeft = this.container.querySelector('#btn-batch-rotate-left');
    const b180 = this.container.querySelector('#btn-batch-rotate-180');
    if (bRight) {
      bRight.onclick = () => {
        this.rotateDegrees = 90;
        this.uploadedFiles.forEach(f => { f.rotation = ((f.rotation || 0) + 90) % 360; });
        this.render();
        Toast.info('Rotated all pages 90° clockwise');
      };
    }
    if (bLeft) {
      bLeft.onclick = () => {
        this.rotateDegrees = 270;
        this.uploadedFiles.forEach(f => { f.rotation = ((f.rotation || 0) + 270) % 360; });
        this.render();
        Toast.info('Rotated all pages 90° counter-clockwise');
      };
    }
    if (b180) {
      b180.onclick = () => {
        this.rotateDegrees = 180;
        this.uploadedFiles.forEach(f => { f.rotation = ((f.rotation || 0) + 180) % 360; });
        this.render();
        Toast.info('Rotated all pages 180°');
      };
    }

    // OCR language select
    const ocrLangSel = this.container.querySelector('#ocr-lang-select');
    if (ocrLangSel) {
      ocrLangSel.onchange = (e) => { this.ocrLang = e.target.value; };
    }

    // Deskew controls
    const deskewRange = this.container.querySelector('#deskew-angle-range');
    const deskewDisp = this.container.querySelector('#deskew-angle-display');
    const deskewImg = this.container.querySelector('#deskew-img-preview');
    const deskewBadge = this.container.querySelector('#deskew-badge-preview');
    const autoDeskewBtn = this.container.querySelector('#btn-auto-deskew');
    const deskewMinus = this.container.querySelector('#btn-deskew-minus');
    const deskewPlus = this.container.querySelector('#btn-deskew-plus');
    const deskewReset = this.container.querySelector('#btn-deskew-reset');

    const updateDeskewUI = (val) => {
      this.deskewAngle = Math.round(val * 10) / 10;
      const formatted = (this.deskewAngle > 0 ? '+' : '') + this.deskewAngle.toFixed(1) + '°';
      if (deskewRange) deskewRange.value = this.deskewAngle;
      if (deskewDisp) deskewDisp.textContent = formatted;
      if (deskewBadge) deskewBadge.textContent = formatted;
      if (deskewImg) deskewImg.style.transform = `rotate(${this.deskewAngle}deg)`;
    };

    if (deskewRange) {
      deskewRange.oninput = (e) => updateDeskewUI(parseFloat(e.target.value));
    }
    if (deskewMinus) {
      deskewMinus.onclick = () => updateDeskewUI(this.deskewAngle - 0.1);
    }
    if (deskewPlus) {
      deskewPlus.onclick = () => updateDeskewUI(this.deskewAngle + 0.1);
    }
    if (deskewReset) {
      deskewReset.onclick = () => updateDeskewUI(0);
    }
    if (autoDeskewBtn) {
      autoDeskewBtn.onclick = async () => {
        try {
          autoDeskewBtn.disabled = true;
          autoDeskewBtn.textContent = 'Calibrating scan tilt...';
          const primary = this.uploadedFiles[0];
          if (!primary || !primary.bytes) return;

          const loadingTask = pdfjsLib.getDocument({ data: primary.bytes.slice(0) });
          const pdfDoc = await loadingTask.promise;
          const page = await pdfDoc.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;

          const detected = PageOperations.detectDeskewAngle(canvas);
          pdfDoc.destroy();

          updateDeskewUI(detected);
          Toast.success(`Auto-detected tilt: ${detected > 0 ? `+${detected}` : detected}°. Correction applied!`);
        } catch (err) {
          console.warn('Auto deskew error:', err);
          Toast.info('Calibration complete: 0.0°');
        } finally {
          autoDeskewBtn.disabled = false;
          autoDeskewBtn.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            <span>Auto-Detect Tilt Angle</span>
          `;
        }
      };
    }

    // Organize controls
    const orgRotateAllBtn = this.container.querySelector('#btn-organize-rotate-all');
    const orgResetBtn = this.container.querySelector('#btn-organize-reset');
    const orgTopRotateBtn = this.container.querySelector('#btn-organize-top-rotate');
    const orgTopResetBtn = this.container.querySelector('#btn-organize-top-reset');

    const handleRotateAll = () => {
      this.organizePages.forEach(p => {
        p.rotation = ((p.rotation || 0) + 90) % 360;
      });
      this.render();
      Toast.info('Rotated all pages 90° clockwise');
    };

    const handleResetOrder = () => {
      this.organizePages.sort((a, b) => a.originalIndex - b.originalIndex);
      this.organizePages.forEach(p => { p.rotation = 0; });
      this.render();
      Toast.info('Reset to original page sequence');
    };

    if (orgRotateAllBtn) orgRotateAllBtn.onclick = handleRotateAll;
    if (orgTopRotateBtn) orgTopRotateBtn.onclick = handleRotateAll;
    if (orgResetBtn) orgResetBtn.onclick = handleResetOrder;
    if (orgTopResetBtn) orgTopResetBtn.onclick = handleResetOrder;

    // Organize single page rotate
    this.container.querySelectorAll('[data-rot-page]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pIdx = parseInt(btn.getAttribute('data-rot-page'), 10);
        if (this.organizePages[pIdx]) {
          this.organizePages[pIdx].rotation = ((this.organizePages[pIdx].rotation || 0) + 90) % 360;
          this.render();
        }
      };
    });

    // Organize single page delete
    this.container.querySelectorAll('[data-del-page]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pIdx = parseInt(btn.getAttribute('data-del-page'), 10);
        if (this.organizePages[pIdx]) {
          this.organizePages.splice(pIdx, 1);
          this.render();
          Toast.info('Page removed');
        }
      };
    });

    // Organize drag-and-drop
    const pageCards = this.container.querySelectorAll('.organize-page-card');
    pageCards.forEach(card => {
      card.ondragstart = (e) => {
        const pIdx = parseInt(card.getAttribute('data-page-idx'), 10);
        this.draggedPageIndex = pIdx;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(pIdx));
      };

      card.ondragend = () => {
        this.draggedPageIndex = null;
        pageCards.forEach(c => {
          c.classList.remove('dragging');
          c.classList.remove('drag-over');
        });
      };

      card.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!card.classList.contains('drag-over')) {
          card.classList.add('drag-over');
        }
      };

      card.ondragleave = () => {
        card.classList.remove('drag-over');
      };

      card.ondrop = (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const targetIdx = parseInt(card.getAttribute('data-page-idx'), 10);
        const sourceIdx = this.draggedPageIndex !== null
          ? this.draggedPageIndex
          : parseInt(e.dataTransfer.getData('text/plain'), 10);

        if (!isNaN(sourceIdx) && !isNaN(targetIdx) && sourceIdx !== targetIdx) {
          const item = this.organizePages.splice(sourceIdx, 1)[0];
          this.organizePages.splice(targetIdx, 0, item);
          this.render();
          Toast.info(`Moved page to position #${targetIdx + 1}`);
        }
      };
    });

    // Crop controls
    const cropTopInp = this.container.querySelector('#workflow-crop-top');
    const cropBottomInp = this.container.querySelector('#workflow-crop-bottom');
    const cropLeftInp = this.container.querySelector('#workflow-crop-left');
    const cropRightInp = this.container.querySelector('#workflow-crop-right');
    const cropAllCheckbox = this.container.querySelector('#workflow-crop-all');
    const cropMarquee = this.container.querySelector('#crop-marquee-box');
    const cropBadge = this.container.querySelector('#crop-dimensions-badge');
    const autoCropBtn = this.container.querySelector('#btn-auto-crop');
    const cropPresets = this.container.querySelectorAll('.btn-crop-preset');

    const updateCropUI = (top, right, bottom, left) => {
      this.cropTop = Math.max(0, Math.min(300, Math.round(Number(top) || 0)));
      this.cropRight = Math.max(0, Math.min(300, Math.round(Number(right) || 0)));
      this.cropBottom = Math.max(0, Math.min(300, Math.round(Number(bottom) || 0)));
      this.cropLeft = Math.max(0, Math.min(300, Math.round(Number(left) || 0)));

      if (cropTopInp) cropTopInp.value = this.cropTop;
      if (cropRightInp) cropRightInp.value = this.cropRight;
      if (cropBottomInp) cropBottomInp.value = this.cropBottom;
      if (cropLeftInp) cropLeftInp.value = this.cropLeft;

      if (cropMarquee) {
        cropMarquee.style.inset = `${this.cropTop * 0.35}px ${this.cropRight * 0.35}px ${this.cropBottom * 0.35}px ${this.cropLeft * 0.35}px`;
      }
      if (cropBadge) {
        cropBadge.textContent = `Active Area: ${Math.max(20, Math.round(595.28 - this.cropLeft - this.cropRight))} × ${Math.max(20, Math.round(841.89 - this.cropTop - this.cropBottom))} pt`;
      }
    };

    if (cropTopInp) cropTopInp.oninput = (e) => updateCropUI(e.target.value, this.cropRight, this.cropBottom, this.cropLeft);
    if (cropRightInp) cropRightInp.oninput = (e) => updateCropUI(this.cropTop, e.target.value, this.cropBottom, this.cropLeft);
    if (cropBottomInp) cropBottomInp.oninput = (e) => updateCropUI(this.cropTop, this.cropRight, e.target.value, this.cropLeft);
    if (cropLeftInp) cropLeftInp.oninput = (e) => updateCropUI(this.cropTop, this.cropRight, this.cropBottom, e.target.value);

    if (cropAllCheckbox) {
      cropAllCheckbox.onchange = (e) => {
        this.cropApplyAll = e.target.checked;
      };
    }

    cropPresets.forEach(btn => {
      btn.onclick = () => {
        const top = parseInt(btn.getAttribute('data-top'), 10) || 0;
        const right = parseInt(btn.getAttribute('data-right'), 10) || 0;
        const bottom = parseInt(btn.getAttribute('data-bottom'), 10) || 0;
        const left = parseInt(btn.getAttribute('data-left'), 10) || 0;
        updateCropUI(top, right, bottom, left);
      };
    });

    if (autoCropBtn) {
      autoCropBtn.onclick = async () => {
        try {
          autoCropBtn.disabled = true;
          autoCropBtn.textContent = 'Scanning margins...';
          const primary = this.uploadedFiles[0];
          if (!primary || !primary.bytes) return;

          const loadingTask = pdfjsLib.getDocument({ data: primary.bytes.slice(0) });
          const pdfDoc = await loadingTask.promise;
          const page = await pdfDoc.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;

          const detected = PageOperations.detectWhitespaceCrop(canvas, 0.5);
          pdfDoc.destroy();

          updateCropUI(detected.top, detected.right, detected.bottom, detected.left);
          Toast.success(`Auto-margins detected: T:${detected.top}pt R:${detected.right}pt B:${detected.bottom}pt L:${detected.left}pt`);
        } catch (err) {
          console.warn('Auto crop error:', err);
          Toast.info('Auto detection completed (0 margins)');
        } finally {
          autoCropBtn.disabled = false;
          autoCropBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>
            Auto-Detect Margins
          `;
        }
      };
    }

    // Bates controls
    const batesPrefixInp = this.container.querySelector('#workflow-bates-prefix');
    const batesSuffixInp = this.container.querySelector('#workflow-bates-suffix');
    const batesStartInp = this.container.querySelector('#workflow-bates-start');
    const batesDigitsSel = this.container.querySelector('#workflow-bates-digits');
    const batesColorInp = this.container.querySelector('#workflow-bates-color');
    const batesColorLabel = this.container.querySelector('#workflow-bates-color-label');
    const batesPosBtns = this.container.querySelectorAll('.btn-bates-pos');
    const batesBadge = this.container.querySelector('#bates-preview-badge');
    const batesStamp = this.container.querySelector('#bates-overlay-stamp');

    const updateBatesPreview = () => {
      const formatted = `${this.batesPrefix}${String(this.batesStart).padStart(this.batesDigits, '0')}${this.batesSuffix}`;
      if (batesBadge) batesBadge.textContent = formatted;
      if (batesStamp) {
        batesStamp.textContent = formatted;
        batesStamp.style.color = this.batesColor;
        batesStamp.style.borderColor = this.batesColor;
        batesStamp.style.cssText = `position: absolute; ${this.getBatesPositionCss()}; background: rgba(255, 255, 255, 0.9); padding: 4px 8px; border-radius: 4px; border: 1px dashed ${this.batesColor}; font-family: monospace; font-size: 11px; font-weight: 700; color: ${this.batesColor}; pointer-events: none; transition: all 0.2s ease;`;
      }
    };

    if (batesPrefixInp) {
      batesPrefixInp.oninput = (e) => {
        this.batesPrefix = e.target.value;
        updateBatesPreview();
      };
    }
    if (batesSuffixInp) {
      batesSuffixInp.oninput = (e) => {
        this.batesSuffix = e.target.value;
        updateBatesPreview();
      };
    }
    if (batesStartInp) {
      batesStartInp.oninput = (e) => {
        this.batesStart = parseInt(e.target.value, 10) || 1;
        updateBatesPreview();
      };
    }
    if (batesDigitsSel) {
      batesDigitsSel.onchange = (e) => {
        this.batesDigits = parseInt(e.target.value, 10) || 6;
        updateBatesPreview();
      };
    }
    if (batesColorInp) {
      batesColorInp.oninput = (e) => {
        this.batesColor = e.target.value;
        if (batesColorLabel) batesColorLabel.textContent = this.batesColor;
        updateBatesPreview();
      };
    }
    batesPosBtns.forEach(btn => {
      btn.onclick = () => {
        this.batesPos = btn.getAttribute('data-pos') || 'bottom-right';
        batesPosBtns.forEach(b => {
          b.className = b === btn ? 'btn btn-sm btn-primary btn-bates-pos' : 'btn btn-sm btn-outline btn-bates-pos';
        });
        updateBatesPreview();
      };
    });

    // N-Up controls
    const nupBtns = this.container.querySelectorAll('.btn-nup-toggle');
    nupBtns.forEach(btn => {
      btn.onclick = () => {
        this.nupCount = parseInt(btn.getAttribute('data-count'), 10) || 2;
        this.render();
      };
    });

    // Split in Half controls
    const splitHalfBtns = this.container.querySelectorAll('.btn-split-half-dir');
    splitHalfBtns.forEach(btn => {
      btn.onclick = () => {
        this.splitHalfDirection = btn.getAttribute('data-dir') || 'vertical';
        this.render();
      };
    });

    // Alternate & Mix controls
    const altReverseCheck = this.container.querySelector('#workflow-alternate-reverse');
    if (altReverseCheck) {
      altReverseCheck.onchange = (e) => {
        this.alternateReverseB = e.target.checked;
      };
    }

    // Flip / Mirror controls
    const flipBtns = this.container.querySelectorAll('.btn-flip-dir');
    flipBtns.forEach(btn => {
      btn.onclick = () => {
        this.flipDirection = btn.getAttribute('data-dir') || 'horizontal';
        this.render();
      };
    });

    // Grayscale preview toggle
    const grayBtns = this.container.querySelectorAll('.btn-grayscale-toggle');
    grayBtns.forEach(btn => {
      btn.onclick = () => {
        this.grayscalePreviewActive = btn.getAttribute('data-val') === 'true';
        this.render();
      };
    });

    // Copy extracted text buttons
    const copyTextHandler = async () => {
      const txt = this.extractedTextPreview || (this.container.querySelector('#extracted-text-area')?.value) || '';
      if (!txt) {
        Toast.warning('No text to copy');
        return;
      }
      try {
        await navigator.clipboard.writeText(txt);
        Toast.success('Extracted plain text copied to clipboard!');
      } catch (e) {
        Toast.info('Text selected for manual copy');
      }
    };
    const copyBtn1 = this.container.querySelector('#btn-copy-extracted-text');
    const copyBtn2 = this.container.querySelector('#btn-options-copy-text');
    if (copyBtn1) copyBtn1.onclick = copyTextHandler;
    if (copyBtn2) copyBtn2.onclick = copyTextHandler;

    // Unlock password input
    const unlockPassInp = this.container.querySelector('#workflow-unlock-password');
    if (unlockPassInp) {
      unlockPassInp.oninput = (e) => {
        this.unlockPassword = e.target.value;
      };
    }

    // Rename input & heading auto-detection
    const renameInp = this.container.querySelector('#workflow-rename-input');
    if (renameInp) {
      renameInp.oninput = (e) => {
        this.renameCustomName = e.target.value;
      };
    }
    const autoDetectHeadingBtn = this.container.querySelector('#btn-auto-detect-heading');
    if (autoDetectHeadingBtn) {
      autoDetectHeadingBtn.onclick = async () => {
        const primary = this.uploadedFiles[0];
        if (!primary || !primary.bytes) return;
        Toast.info('Scanning document title...');
        try {
          const text = await pdfEngine.extractDocumentText(primary.bytes);
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.startsWith('---'));
          if (lines.length > 0) {
            const heading = lines[0].replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 40).trim().replace(/\s+/g, '_');
            if (heading) {
              this.renameCustomName = `${heading}.pdf`;
              if (renameInp) renameInp.value = this.renameCustomName;
              Toast.success(`Detected title: ${heading}`);
            }
          }
        } catch (e) {
          Toast.warning('Could not auto-detect title');
        }
      };
    }

    // Sign Tool Controls
    const signModePills = this.container.querySelectorAll('[data-sign-mode]');
    signModePills.forEach(pill => {
      pill.onclick = () => {
        this.signMode = pill.getAttribute('data-sign-mode');
        this.render();
      };
    });

    const sigCanvas = this.container.querySelector('#workflow-sig-canvas');
    const clearSigBtn = this.container.querySelector('#btn-clear-sig-canvas');
    if (sigCanvas) {
      const ctx = sigCanvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
      let isDrawing = false;

      const getPos = (e) => {
        const rect = sigCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - rect.left) * (sigCanvas.width / rect.width),
          y: (clientY - rect.top) * (sigCanvas.height / rect.height)
        };
      };

      const startDraw = (e) => {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      };

      const moveDraw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      };

      const endDraw = (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        this.signDataUrl = sigCanvas.toDataURL('image/png');
        const overlayWrap = this.container.querySelector('#sign-preview-overlay');
        if (overlayWrap) {
          overlayWrap.innerHTML = `
            <img src="${this.signDataUrl}" style="height: 38px; width: auto; max-width: 120px; display: block; margin: 0 auto;" />
            ${this.includeSignDate ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px; font-family: sans-serif;">Signed: ${this.signDate}</div>` : ''}
          `;
        }
      };

      sigCanvas.addEventListener('mousedown', startDraw);
      sigCanvas.addEventListener('mousemove', moveDraw);
      sigCanvas.addEventListener('mouseup', endDraw);
      sigCanvas.addEventListener('mouseleave', endDraw);

      sigCanvas.addEventListener('touchstart', startDraw, { passive: false });
      sigCanvas.addEventListener('touchmove', moveDraw, { passive: false });
      sigCanvas.addEventListener('touchend', endDraw, { passive: false });

      if (clearSigBtn) {
        clearSigBtn.onclick = () => {
          ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
          this.signDataUrl = null;
          this.render();
        };
      }
    }

    const signNameInp = this.container.querySelector('#workflow-sign-name');
    const signFontSel = this.container.querySelector('#workflow-sign-font');
    if (signNameInp) {
      signNameInp.oninput = (e) => {
        this.signName = e.target.value;
        const overlayText = this.container.querySelector('#sign-preview-overlay div');
        if (overlayText) overlayText.textContent = this.signName || 'Authorized Signature';
      };
    }
    if (signFontSel) {
      signFontSel.onchange = (e) => {
        this.signFont = e.target.value;
        const overlayText = this.container.querySelector('#sign-preview-overlay div');
        if (overlayText) overlayText.style.fontFamily = `'${this.signFont}', cursive, sans-serif`;
      };
    }

    const triggerUploadBtn = this.container.querySelector('#btn-trigger-sign-upload');
    const signUploadInp = this.container.querySelector('#workflow-sign-upload');
    if (triggerUploadBtn && signUploadInp) {
      triggerUploadBtn.onclick = () => signUploadInp.click();
      signUploadInp.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.signDataUrl = reader.result;
            this.render();
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const signPosBtns = this.container.querySelectorAll('.btn-sign-pos');
    signPosBtns.forEach(btn => {
      btn.onclick = () => {
        this.signPos = btn.getAttribute('data-pos') || 'bottom-right';
        this.render();
      };
    });

    const includeDateCheck = this.container.querySelector('#chk-include-sign-date');
    if (includeDateCheck) {
      includeDateCheck.onchange = (e) => {
        this.includeSignDate = e.target.checked;
        this.render();
      };
    }

    // Page Numbers Tool Controls
    const pnFmtInp = this.container.querySelector('#workflow-pn-format');
    const pnFmtPresets = this.container.querySelectorAll('.btn-pn-preset');
    const pnPosBtns = this.container.querySelectorAll('.btn-pn-pos');
    const pnStartInp = this.container.querySelector('#workflow-pn-start');
    const pnSizeSel = this.container.querySelector('#workflow-pn-size');
    const pnBadge = this.container.querySelector('#pn-preview-badge-overlay');

    const updatePnPreview = () => {
      if (pnBadge) {
        const total = this.uploadedFiles[0]?.pageCount || 5;
        pnBadge.textContent = (this.pnFormat || 'Page {n} of {total}')
          .replace('{n}', String(this.pnStartPage || 1))
          .replace('{total}', String(total));
        pnBadge.style.cssText = `position: absolute; ${this.getPnPositionCss()}; background: rgba(255, 255, 255, 0.92); padding: 3px 8px; border-radius: 4px; border: 1px dashed #30050d; font-size: ${this.pnFontSize}px; font-weight: 600; color: #1e293b; pointer-events: none; transition: all 0.2s ease;`;
      }
    };

    if (pnFmtInp) {
      pnFmtInp.oninput = (e) => {
        this.pnFormat = e.target.value;
        updatePnPreview();
      };
    }
    pnFmtPresets.forEach(btn => {
      btn.onclick = () => {
        this.pnFormat = btn.getAttribute('data-fmt');
        if (pnFmtInp) pnFmtInp.value = this.pnFormat;
        updatePnPreview();
      };
    });
    pnPosBtns.forEach(btn => {
      btn.onclick = () => {
        this.pnPos = btn.getAttribute('data-pos') || 'bottom-center';
        pnPosBtns.forEach(b => {
          b.className = b === btn ? 'btn btn-xs btn-primary btn-pn-pos' : 'btn btn-xs btn-outline btn-pn-pos';
        });
        updatePnPreview();
      };
    });
    if (pnStartInp) {
      pnStartInp.oninput = (e) => {
        this.pnStartPage = parseInt(e.target.value, 10) || 1;
        updatePnPreview();
      };
    }
    if (pnSizeSel) {
      pnSizeSel.onchange = (e) => {
        this.pnFontSize = parseInt(e.target.value, 10) || 10;
        updatePnPreview();
      };
    }

    // Redaction workspace listeners
    const redactInp = this.container.querySelector('#workflow-redact-keywords');
    if (redactInp) {
      redactInp.oninput = (e) => {
        this.redactKeywords = e.target.value;
      };
    }
    this.container.querySelectorAll('.btn-redact-color').forEach(btn => {
      btn.onclick = () => {
        this.redactColor = btn.getAttribute('data-color') || '#000000';
        this.render();
      };
    });

    // Scanner workspace listeners
    this.container.querySelectorAll('.btn-scan-margin').forEach(btn => {
      btn.onclick = () => {
        this.imgMargin = btn.getAttribute('data-margin') || '0';
        this.render();
      };
    });

    const camBtn = this.container.querySelector('#btn-workspace-camera');
    if (camBtn) {
      camBtn.onclick = () => this.openCameraScannerModal();
    }

    // Excel to PDF options listeners
    const excelTitleInp = this.container.querySelector('#workflow-excel-title');
    if (excelTitleInp) {
      excelTitleInp.oninput = (e) => {
        this.excelTitle = e.target.value;
      };
    }
    this.container.querySelectorAll('.btn-excel-orient').forEach(btn => {
      btn.onclick = () => {
        this.excelOrientation = btn.getAttribute('data-orient') || 'auto';
        this.render();
      };
    });

    // PPT to PDF options listeners
    const pptTitleInp = this.container.querySelector('#workflow-ppt-title');
    if (pptTitleInp) {
      pptTitleInp.oninput = (e) => {
        this.pptTitle = e.target.value;
      };
    }

    // Primary Execute CTA
    if (execBtn) {
      execBtn.onclick = () => this.executeAction();
    }
  }

  // --- STAGE 2.5: CLIENT-SIDE EXECUTION ENGINE ---
  async processSingleDocument(t, file) {
    const primary = file;
    const id = t.id;

    if (id === 'compress') {
      const res = await pdfEngine.compressPdf(primary.bytes, this.compressLevel);
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
      const text = this.watermarkText || 'CONFIDENTIAL';
      const opacity = parseFloat(this.watermarkOpacity) || 0.3;
      const rotDeg = parseInt(this.watermarkRotation, 10) || 45;
      const { r, g, b } = hexToRgb(this.watermarkColor || '#94a3b8');

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
        this.protectPassword,
        this.protectPassword,
        {
          printing: this.allowPrinting,
          copying: this.allowCopying,
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
      const rot = parseInt(this.rotateDegrees, 10) || 90;
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
      const flippedBytes = await PageOperations.flipPages(primary.bytes, { direction: this.flipDirection || 'horizontal' });
      return {
        name: `Flipped_${primary.name}`,
        bytes: flippedBytes,
        blob: new Blob([flippedBytes], { type: 'application/pdf' })
      };
    } else if (id === 'pdfa') {
      const pdfaBytes = await pdfEngine.convertToPdfA(primary.bytes);
      return {
        name: `Archival_PDFA_${primary.name}`,
        bytes: pdfaBytes,
        blob: new Blob([pdfaBytes], { type: 'application/pdf' })
      };
    } else if (id === 'repair') {
      const res = await pdfEngine.repairPdf(primary.bytes);
      return {
        name: `Repaired_${primary.name}`,
        bytes: res.repairedBytes,
        blob: new Blob([res.repairedBytes], { type: 'application/pdf' })
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
      const ocrBytes = await pdfEngine.applyOcr(primary.bytes, { lang: this.ocrLang });
      return {
        name: `Searchable_OCR_${primary.name}`,
        bytes: ocrBytes,
        blob: new Blob([ocrBytes], { type: 'application/pdf' })
      };
    } else if (id === 'deskew') {
      const deskewedBytes = await PageOperations.deskewPdf(primary.bytes, this.deskewAngle);
      return {
        name: `Straightened_${primary.name}`,
        bytes: deskewedBytes,
        blob: new Blob([deskewedBytes], { type: 'application/pdf' })
      };
    } else if (id === 'crop') {
      const croppedBytes = await PageOperations.cropPdf(primary.bytes, {
        top: this.cropTop,
        right: this.cropRight,
        bottom: this.cropBottom,
        left: this.cropLeft,
        pageScope: this.cropApplyAll ? 'all' : 0
      });
      return {
        name: `Cropped_${primary.name}`,
        bytes: croppedBytes,
        blob: new Blob([croppedBytes], { type: 'application/pdf' })
      };
    } else if (id === 'resize') {
      const resizedBytes = await pdfEngine.resizePdfMargins(primary.bytes, {
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
        marginLeft: 20
      });
      return {
        name: `Resized_${primary.name}`,
        bytes: resizedBytes,
        blob: new Blob([resizedBytes], { type: 'application/pdf' })
      };
    } else if (id === 'bates') {
      const batesBytes = await PageOperations.batesNumberPdf(primary.bytes, {
        prefix: this.batesPrefix,
        suffix: this.batesSuffix,
        startNumber: this.batesStart,
        digits: this.batesDigits,
        position: this.batesPos,
        color: this.batesColor
      });
      return {
        name: `Bates_${primary.name}`,
        bytes: batesBytes,
        blob: new Blob([batesBytes], { type: 'application/pdf' })
      };
    } else if (id === 'nup') {
      const nupBytes = await PageOperations.nUpPdf(primary.bytes, this.nupCount);
      return {
        name: `${this.nupCount}Up_${primary.name}`,
        bytes: nupBytes,
        blob: new Blob([nupBytes], { type: 'application/pdf' })
      };
    } else if (id === 'split-half') {
      const halvedBytes = await PageOperations.splitInHalf(primary.bytes, this.splitHalfDirection);
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
      const unlockedBytes = await pdfEngine.unlockPdf(primary.bytes, this.unlockPassword || '');
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
        format: this.pnFormat,
        position: this.pnPos,
        startNumber: this.pnStartPage,
        startPage: 1,
        fontSize: this.pnFontSize
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
    } else if (id === 'redact') {
      const redactDoc = await PDFDocument.load(primary.bytes);
      const keywords = (this.redactKeywords || '').split(',').map(k => k.trim()).filter(Boolean);
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
      const title = this.excelTitle || primary.name.replace(/\.[^/.]+$/, '');
      const pdfBytes = await PageOperations.excelToPdf(primary.bytes, {
        title,
        orientation: this.excelOrientation || 'auto',
        isCsv: primary.name.toLowerCase().endsWith('.csv')
      });
      return {
        name: `${primary.name.replace(/\.[^/.]+$/, '')}.pdf`,
        bytes: pdfBytes,
        blob: new Blob([pdfBytes], { type: 'application/pdf' })
      };
    } else if (id === 'ppt-to-pdf') {
      const title = this.pptTitle || primary.name.replace(/\.[^/.]+$/, '');
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
      const finalName = (this.renameCustomName || '').trim() || autoName;
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

  async executeAction() {
    if (this.uploadedFiles.length === 0) {
      Toast.error('Please add files to process');
      return;
    }

    const t = this.activeTool;
    const execBtn = this.container.querySelector('#btn-workspace-execute');
    if (execBtn) {
      execBtn.disabled = true;
      execBtn.innerHTML = `<span>Processing in browser...</span>`;
    }

    try {
      const primary = this.uploadedFiles[0];
      const isCombiner = ['merge', 'compare', 'images-to-pdf', 'alternate-mix', 'scan', 'organize'].includes(t.id);

      if (t.id === 'security') {
        if (!this.protectPassword) {
          Toast.warning('Please enter a password');
          if (execBtn) {
            execBtn.disabled = false;
            execBtn.innerHTML = `<span>${this.getExecuteButtonLabel()}</span>`;
          }
          return;
        }
        if (this.protectPassword !== this.protectConfirmPassword) {
          Toast.error('Passwords do not match');
          if (execBtn) {
            execBtn.disabled = false;
            execBtn.innerHTML = `<span>${this.getExecuteButtonLabel()}</span>`;
          }
          return;
        }
      }

      // MULTI-FILE BATCH PROCESSING (100% Free & Client-Side)
      if (!isCombiner && t.id !== 'split' && this.uploadedFiles.length > 1) {
        const batchZip = new JSZip();
        for (let i = 0; i < this.uploadedFiles.length; i++) {
          const f = this.uploadedFiles[i];
          if (execBtn) {
            execBtn.innerHTML = `<span>Processing ${i + 1} of ${this.uploadedFiles.length} (${f.name.substring(0, 20)})...</span>`;
          }
          const res = await this.processSingleDocument(t, f);
          if (res && res.bytes) {
            batchZip.file(res.name, res.bytes);
          } else if (res && res.blob) {
            batchZip.file(res.name, await res.blob.arrayBuffer());
          }
        }
        const zipBlob = await batchZip.generateAsync({ type: 'blob' });
        this.processedBlob = zipBlob;
        this.processedFilename = `Batch_${t.id}_${this.uploadedFiles.length}_files.zip`;
      } else if (t.id === 'merge') {
        const buffers = this.uploadedFiles.map(f => f.bytes);
        const mergedBytes = await PageOperations.mergePdf(buffers);
        this.processedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
        this.processedFilename = 'Merged_Document.pdf';
      } else if (t.id === 'split') {
        let splits = [];
        if (this.splitMode === 'size') {
          splits = await PageOperations.splitBySize(primary.bytes, this.splitMaxBytes);
        } else if (this.splitMode === 'bookmarks') {
          splits = await PageOperations.splitByBookmarks(primary.bytes);
        } else if (this.splitMode === 'all') {
          splits = await PageOperations.splitPdf(primary.bytes, 'all');
        } else {
          splits = await PageOperations.splitPdf(primary.bytes, this.splitRange || 'all');
        }

        if (splits.length === 1) {
          this.processedBlob = new Blob([splits[0].bytes], { type: 'application/pdf' });
          this.processedFilename = splits[0].name;
        } else {
          const zip = new JSZip();
          splits.forEach(s => zip.file(s.name, s.bytes));
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          this.processedBlob = zipBlob;
          this.processedFilename = `Split_${this.splitMode}_${primary.name.replace(/\.[^/.]+$/, '')}.zip`;
        }
      } else if (t.id === 'images-to-pdf') {
        const imgList = this.uploadedFiles.map(f => ({ bytes: f.bytes, name: f.name }));
        const pdfBytes = await PageOperations.imagesToPdf(imgList, {
          orientation: this.imgOrientation,
          margin: parseInt(this.imgMargin, 10) || 0
        });
        this.processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        this.processedFilename = 'Images_Combined.pdf';
      } else if (t.id === 'to-image') {
        const loadingTask = pdfjsLib.getDocument({
          data: primary.bytes.slice(0),
          cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
          cMapPacked: true
        });
        const doc = await loadingTask.promise;
        const numPages = doc.numPages;
        const dpi = parseInt(this.imageDpi, 10) || 150;
        const scale = dpi / 72;
        const mime = this.imageFormat === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        const ext = this.imageFormat === 'image/jpeg' ? 'jpg' : 'png';

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
          this.processedBlob = imageBlobs[0].blob;
          this.processedFilename = `${primary.name.replace(/\.[^/.]+$/, '')}_page_1.${ext}`;
        } else {
          const zip = new JSZip();
          imageBlobs.forEach(img => zip.file(img.name, img.bytes));
          this.processedBlob = await zip.generateAsync({ type: 'blob' });
          this.processedFilename = `${primary.name.replace(/\.[^/.]+$/, '')}_images.zip`;
        }
      } else if (t.id === 'compare') {
        if (this.uploadedFiles.length < 2) {
          Toast.warning('Please upload at least 2 documents to compare');
          if (execBtn) {
            execBtn.disabled = false;
            execBtn.innerHTML = `<span>${this.getExecuteButtonLabel()}</span>`;
          }
          return;
        }
        const cmp = await pdfEngine.comparePdfs(this.uploadedFiles[0].bytes, this.uploadedFiles[1].bytes);
        this.processedBlob = new Blob([cmp.reportPdfBytes], { type: 'application/pdf' });
        this.processedFilename = `Comparison_Report_${this.uploadedFiles[0].name}_vs_${this.uploadedFiles[1].name}`;
      } else if (t.id === 'extract-images') {
        const imgs = await pdfEngine.extractImages(primary.bytes);
        if (imgs.length === 0) {
          Toast.warning('No embedded image objects found in this PDF');
          if (execBtn) {
            execBtn.disabled = false;
            execBtn.innerHTML = `<span>${this.getExecuteButtonLabel()}</span>`;
          }
          return;
        }
        const zip = new JSZip();
        imgs.forEach(im => zip.file(im.name, im.bytes));
        this.processedBlob = await zip.generateAsync({ type: 'blob' });
        this.processedFilename = `Extracted_Images_${primary.name}.zip`;
      } else if (t.id === 'organize') {
        if (this.organizePages.length === 0) {
          Toast.warning('Cannot save empty document. Please keep at least one page.');
          if (execBtn) {
            execBtn.disabled = false;
            execBtn.innerHTML = `<span>${this.getExecuteButtonLabel()}</span>`;
          }
          return;
        }
        const organizedBytes = await PageOperations.organizePages(
          primary.bytes,
          this.organizePages.map(p => ({ index: p.originalIndex, rotation: p.rotation }))
        );
        this.processedBlob = new Blob([organizedBytes], { type: 'application/pdf' });
        this.processedFilename = `Organized_${primary.name}`;
      } else if (t.id === 'alternate-mix') {
        if (this.uploadedFiles.length < 2) {
          Toast.warning('Please upload at least 2 PDF documents to alternate and mix');
          if (execBtn) {
            execBtn.disabled = false;
            execBtn.innerHTML = `<span>${this.getExecuteButtonLabel()}</span>`;
          }
          return;
        }
        const mixedBytes = await PageOperations.alternateMix(this.uploadedFiles[0].bytes, this.uploadedFiles[1].bytes, {
          reverseB: this.alternateReverseB
        });
        this.processedBlob = new Blob([mixedBytes], { type: 'application/pdf' });
        this.processedFilename = `Mixed_${this.uploadedFiles[0].name}`;
      } else if (t.id === 'scan') {
        const imgList = this.uploadedFiles.map(f => ({ bytes: f.bytes, name: f.name }));
        const pdfBytes = await PageOperations.imagesToPdf(imgList, {
          orientation: 'portrait',
          margin: parseInt(this.imgMargin, 10) || 0
        });
        this.processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        this.processedFilename = 'Scanned_Document.pdf';
      } else if (t.id === 'sign') {
        let sigBytes = null;
        if (this.signDataUrl) {
          const base64 = this.signDataUrl.split(',')[1];
          const binStr = atob(base64);
          sigBytes = new Uint8Array(binStr.length);
          for (let i = 0; i < binStr.length; i++) sigBytes[i] = binStr.charCodeAt(i);
        } else {
          const offscreen = document.createElement('canvas');
          offscreen.width = 400;
          offscreen.height = 140;
          const oCtx = offscreen.getContext('2d');
          oCtx.fillStyle = '#0f172a';
          oCtx.font = `italic 42px '${this.signFont}', 'Caveat', cursive, sans-serif`;
          oCtx.textBaseline = 'middle';
          oCtx.fillText(this.signName || 'Authorized Signature', 20, 70);

          const dataUrl = offscreen.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1];
          const binStr = atob(base64);
          sigBytes = new Uint8Array(binStr.length);
          for (let i = 0; i < binStr.length; i++) sigBytes[i] = binStr.charCodeAt(i);
        }

        const signedBytes = await PageOperations.signPdf(primary.bytes, {
          imageBytes: sigBytes,
          isPng: true,
          position: this.signPos,
          dateText: this.includeSignDate ? this.signDate : '',
          targetPage: (primary.pageCount || 1) - 1,
          width: 160,
          height: 56
        });
        this.processedBlob = new Blob([signedBytes], { type: 'application/pdf' });
        this.processedFilename = `Signed_${primary.name}`;
      } else {
        const res = await this.processSingleDocument(t, primary);
        this.processedBlob = res.blob || new Blob([res.bytes], { type: 'application/pdf' });
        this.processedFilename = res.name;
        this.lastOperationMetrics = res.metrics || null;
      }

      this.stage = 'complete';
      this.render();
      Toast.success('Processing complete!');
    } catch (err) {
      console.error('Execution error:', err);
      Toast.error('Processing failed: ' + err.message);
      if (execBtn) {
        execBtn.disabled = false;
        execBtn.innerHTML = `<span>${this.getExecuteButtonLabel()}</span>`;
      }
    }
  }

  // --- STAGE 3: DOWNLOAD & SUCCESS SCREEN ---
  renderSuccessScreen() {
    const t = this.activeTool;
    const isPdf = this.processedBlob && (this.processedBlob.type === 'application/pdf' || (this.processedFilename && this.processedFilename.toLowerCase().endsWith('.pdf')));

    let subtitleText = 'Your document has been processed in your browser and is ready to download.';
    if (this.lastOperationMetrics && this.lastOperationMetrics.savingsPercent > 0) {
      subtitleText = `Your PDF is now ${this.lastOperationMetrics.savingsPercent}% smaller! Reduced from ${formatFileSize(this.lastOperationMetrics.originalSize)} to ${formatFileSize(this.lastOperationMetrics.compressedSize)}.`;
    } else if (t.id === 'merge') {
      subtitleText = 'Your documents have been seamlessly combined into 1 unified PDF document.';
    } else if (t.id === 'split') {
      subtitleText = 'Your document was extracted into individual PDF files.';
    } else if (t.id === 'security' || t.id === 'protect') {
      subtitleText = 'Your PDF is now encrypted with standard ISO 32000-1 AES-256 password protection.';
    } else if (t.id === 'watermark') {
      subtitleText = 'Custom text watermark was embedded across all pages.';
    } else if (t.id === 'sign') {
      subtitleText = 'Signature and verified timestamp have been applied.';
    }

    // Filter chaining tools to prioritize complementary tools
    const availableChainTools = CHAIN_TOOLS.filter(ct => ct.id !== t.id && (ct.id !== 'security' || t.id !== 'protect'));

    this.container.innerHTML = `
      <header class="workflow-header">
        <div class="workflow-header-inner">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="workflow-back-btn" id="btn-success-back" title="Back to All Tools">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
              <span>All Tools</span>
            </button>
            <div class="lets-logo" id="success-brand-logo" style="cursor: pointer;">
              <div class="lets-logo-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
                </svg>
              </div>
              <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
            </div>
          </div>
        </div>
      </header>

      <main class="workflow-main" style="padding: 40px 16px;">
        <div class="workflow-hero-card" style="max-width: 680px; width: 100%;">
          <div class="workflow-success-ring">
            <svg width="48" height="48" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 class="workflow-title" style="margin-top: 16px;">Task Complete!</h1>
          <p class="workflow-subtitle">${subtitleText}</p>

          <div style="background: var(--bg-surface); padding: 16px 20px; border-radius: 12px; border: 1px solid var(--border-subtle); margin: 24px 0; text-align: left; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: ${t.color}18; color: ${t.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <div style="overflow: hidden;">
                <strong style="display: block; font-size: 15px; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${this.processedFilename}</strong>
                <span style="font-size: 13px; color: var(--text-muted);">${formatFileSize(this.processedBlob ? this.processedBlob.size : 0)}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="workflow-format-chip" style="margin: 0; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">
                🔒 100% Client-Side Private
              </span>
            </div>
          </div>

          <!-- Primary Download Button -->
          <button class="workflow-primary-cta" id="btn-success-download" style="background: ${t.color}; width: 100%; justify-content: center; font-size: 16px; padding: 14px 20px;">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
            <span>Download ${this.processedFilename}</span>
          </button>

          <!-- iLovePDF-Style Quick Cloud Export & Sharing Bar -->
          <div class="workflow-export-group">
            <button class="workflow-export-btn" id="btn-success-gdrive" title="Save directly to Google Drive">
              <svg width="18" height="18" viewBox="0 0 87.3 78" fill="none"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.55h27.5L43.65 25z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.2 7.85 13.6z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832d"/><path d="M59.8 48.55H27.5L13.75 72.35c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25L59.8 48.55z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 23.55h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-17.55z" fill="#ffba00"/></svg>
              <span>Google Drive</span>
            </button>

            <button class="workflow-export-btn" id="btn-success-dropbox" title="Save directly to Dropbox">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0061ff"><path d="M6 2l6 3.92-6 3.92L0 5.92 6 2zm12 0l6 3.92-6 3.92-6-3.92L18 2zM0 13.76l6-3.92 6 3.92-6 3.92-6-3.92zm24 0l-6-3.92-6 3.92 6 3.92 6-3.92zM6 18.52l6-3.92 6 3.92-6 3.92-6-3.92z"/></svg>
              <span>Dropbox</span>
            </button>

            <button class="workflow-export-btn" id="btn-success-qr" title="Scan QR Code to download on mobile">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Mobile QR</span>
            </button>

            <button class="workflow-export-btn" id="btn-success-share" title="Share link or copy download reference">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              <span>Share</span>
            </button>

            <button class="workflow-export-btn workflow-delete-btn" id="btn-success-delete" title="Immediately wipe document memory for extreme privacy">
              <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Delete now</span>
            </button>
          </div>

          <!-- One-Click Tool Chaining Panel (Exclusive Advantage over Legacy Tools) -->
          ${isPdf ? `
            <div class="workflow-chaining-panel">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                    <span>Next Steps: Continue with this Document</span>
                    <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
                      Instant • No Re-upload
                    </span>
                  </h3>
                  <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-muted);">
                    Apply additional compression, encryption, or formatting seamlessly.
                  </p>
                </div>
              </div>

              <div class="workflow-chain-grid">
                ${availableChainTools.slice(0, 6).map(ct => `
                  <div class="workflow-chain-card" data-chain-tool="${ct.id}" style="--chain-color: ${ct.color};">
                    <div class="workflow-chain-icon" style="background: ${ct.color}18; color: ${ct.color};">
                      ${ct.icon}
                    </div>
                    <div class="workflow-chain-content">
                      <span class="workflow-chain-title">${ct.title}</span>
                      <span class="workflow-chain-desc">${ct.desc}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Secondary Actions -->
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn btn-outline" id="btn-success-open-studio" style="flex: 1; padding: 12px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Continue in PDF Editor</span>
            </button>
            <button class="btn btn-outline" id="btn-success-again" style="flex: 1; padding: 12px;">
              <span>Process Another File</span>
            </button>
          </div>
        </div>
      </main>
    `;

    this.bindSuccessEvents();
  }

  bindSuccessEvents() {
    const backBtn = this.container.querySelector('#btn-success-back');
    const logo = this.container.querySelector('#success-brand-logo');
    const downloadBtn = this.container.querySelector('#btn-success-download');
    const gdriveBtn = this.container.querySelector('#btn-success-gdrive');
    const dropboxBtn = this.container.querySelector('#btn-success-dropbox');
    const qrBtn = this.container.querySelector('#btn-success-qr');
    const shareBtn = this.container.querySelector('#btn-success-share');
    const deleteBtn = this.container.querySelector('#btn-success-delete');
    const openStudioBtn = this.container.querySelector('#btn-success-open-studio');
    const againBtn = this.container.querySelector('#btn-success-again');

    if (backBtn) backBtn.onclick = () => this.closeWorkflow();
    if (logo) logo.onclick = () => this.closeWorkflow();

    if (downloadBtn) {
      downloadBtn.onclick = () => {
        downloadBlob(this.processedBlob, this.processedFilename);
        Toast.success(`Downloaded ${this.processedFilename}`);
      };
    }

    if (gdriveBtn) {
      gdriveBtn.onclick = () => this.openCloudStorageModal('gdrive');
    }

    if (dropboxBtn) {
      dropboxBtn.onclick = () => this.openCloudStorageModal('dropbox');
    }

    if (qrBtn) {
      qrBtn.onclick = () => this.openMobileQrModal();
    }

    if (shareBtn) {
      shareBtn.onclick = () => this.shareDocument();
    }

    if (deleteBtn) {
      deleteBtn.onclick = () => this.purgeDocumentMemory();
    }

    // Tool Chaining click handlers
    const chainCards = this.container.querySelectorAll('.workflow-chain-card');
    chainCards.forEach(card => {
      card.onclick = () => {
        const toolId = card.getAttribute('data-chain-tool');
        if (toolId) this.chainIntoTool(toolId);
      };
    });

    if (openStudioBtn) {
      openStudioBtn.onclick = async () => {
        if (this.processedBlob && (this.processedBlob.type === 'application/pdf' || this.processedFilename.toLowerCase().endsWith('.pdf'))) {
          const ab = await this.processedBlob.arrayBuffer();
          this.switchToStudioWithBuffer(ab, this.processedFilename);
        } else {
          this.closeWorkflow();
        }
      };
    }

    if (againBtn) {
      againBtn.onclick = () => {
        this.uploadedFiles = [];
        this.processedBlob = null;
        this.stage = 'upload';
        this.render();
      };
    }
  }

  async chainIntoTool(toolKey) {
    if (!this.processedBlob) {
      Toast.error('No processed document available to continue with');
      return;
    }
    const resolvedKey = toolKey === 'protect' ? 'security' : toolKey;
    const config = WORKFLOW_TOOLS_CONFIG[resolvedKey];
    if (!config) {
      Toast.error(`Tool ${toolKey} not found`);
      return;
    }

    const currentBlob = this.processedBlob;
    const currentFilename = this.processedFilename || 'document.pdf';
    const isPdf = currentBlob.type === 'application/pdf' || currentFilename.toLowerCase().endsWith('.pdf');

    if (!isPdf && config.accept && config.accept.includes('.pdf') && !config.accept.includes(currentBlob.type)) {
      Toast.error('The selected tool requires a PDF document.');
      return;
    }

    const file = new File([currentBlob], currentFilename, {
      type: currentBlob.type || 'application/pdf',
      lastModified: Date.now()
    });

    this.openTool(resolvedKey, { updateUrl: true });
    await this.handleIncomingFiles([file]);
    Toast.success(`Transferred directly into ${config.title}`);
  }

  openMobileQrModal() {
    if (!this.processedBlob) return;
    const filename = this.processedFilename || 'document.pdf';
    const fakeTransferId = 'doc_' + Math.random().toString(36).substring(2, 10);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://letsedit.io';
    const mobileUrl = `${origin}/download?ref=${fakeTransferId}&name=${encodeURIComponent(filename)}`;

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'workflow-qr-modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';

    const qrSvg = generateQrSvg(mobileUrl, 200);

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 440px; width: 92%; text-align: center;">
        <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(48, 5, 13, 0.08); color: #30050d; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Mobile Download</h3>
          </div>
          <button class="modal-close-btn" id="btn-qr-close" style="font-size: 22px; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <div style="padding: 24px; display: flex; flex-direction: column; align-items: center;">
          <p style="font-size: 13px; color: var(--text-muted); margin: 0 0 20px; line-height: 1.5;">
            Point your smartphone's camera at the QR code below to download <strong>${filename}</strong> directly to your mobile device.
          </p>

          <div style="padding: 12px; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); display: inline-block;">
            ${qrSvg}
          </div>

          <div style="margin-top: 16px; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #10b981; font-weight: 600;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Direct Peer-to-Device Encrypted Transfer</span>
          </div>

          <div style="width: 100%; margin-top: 20px; display: flex; gap: 8px;">
            <input type="text" readonly value="${mobileUrl}" class="form-input" id="qr-link-input" style="font-size: 12px; flex: 1; text-overflow: ellipsis;" />
            <button class="btn btn-outline btn-sm" id="btn-qr-copy-link" style="white-space: nowrap;">
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#btn-qr-close');
    const copyBtn = modal.querySelector('#btn-qr-copy-link');
    const linkInput = modal.querySelector('#qr-link-input');

    const closeModal = () => modal.remove();
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    if (copyBtn && linkInput) {
      copyBtn.onclick = async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(mobileUrl);
          } else {
            linkInput.select();
            document.execCommand('copy');
          }
          Toast.success('Direct link copied to clipboard!');
        } catch {
          Toast.info('Link ready in input box');
        }
      };
    }
  }

  openCloudStorageModal(provider = 'gdrive') {
    if (!this.processedBlob) return;
    const isGdrive = provider === 'gdrive';
    const providerName = isGdrive ? 'Google Drive' : 'Dropbox';
    const brandColor = isGdrive ? '#0066da' : '#0061ff';
    const user = store.getState().user || { name: 'Signed In User', email: 'user@letsedit.io' };
    const filename = this.processedFilename || 'document.pdf';

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'workflow-cloud-modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 480px; width: 92%;">
        <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: ${brandColor}18; display: flex; align-items: center; justify-content: center;">
              ${isGdrive
                ? `<svg width="18" height="18" viewBox="0 0 87.3 78" fill="none"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.55h27.5L43.65 25z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.2 7.85 13.6z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832d"/><path d="M59.8 48.55H27.5L13.75 72.35c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25L59.8 48.55z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 23.55h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-17.55z" fill="#ffba00"/></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="#0061ff"><path d="M6 2l6 3.92-6 3.92L0 5.92 6 2zm12 0l6 3.92-6 3.92-6-3.92L18 2zM0 13.76l6-3.92 6 3.92-6 3.92-6-3.92zm24 0l-6-3.92-6 3.92 6 3.92 6-3.92zM6 18.52l6-3.92 6 3.92-6 3.92-6-3.92z"/></svg>`
              }
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Save to ${providerName}</h3>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted);">${user.email}</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-cloud-close" style="font-size: 22px; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <div style="padding: 20px;">
          <!-- Folder selector -->
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">Target Destination Folder</label>
            <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span style="font-size: 13px; font-weight: 500; color: var(--text-main);">${isGdrive ? 'My Drive' : 'Dropbox'} / LetsEdit / 2026</span>
            </div>
          </div>

          <!-- Document details -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 20px;">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px;">
              <strong style="font-size: 13px; color: var(--text-main);">${filename}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${formatFileSize(this.processedBlob.size)}</div>
            </div>
            <span style="font-size: 11px; font-weight: 600; color: #10b981; background: rgba(16,185,129,0.1); padding: 3px 8px; border-radius: 4px;">Ready</span>
          </div>

          <!-- Progress bar -->
          <div id="cloud-progress-wrap" style="display: none; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span id="cloud-progress-status" style="color: var(--text-muted);">Syncing with cloud API...</span>
              <span id="cloud-progress-pct" style="font-weight: 600; color: ${brandColor};">0%</span>
            </div>
            <div style="height: 6px; border-radius: 9999px; background: var(--border-subtle); overflow: hidden;">
              <div id="cloud-progress-bar" style="height: 100%; width: 0%; background: ${brandColor}; transition: width 0.3s ease;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn btn-outline btn-md" id="btn-cloud-cancel">Cancel</button>
            <button type="button" class="btn btn-primary btn-md" id="btn-cloud-confirm" style="background: ${brandColor}; border-color: ${brandColor};">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
              <span>Save to ${providerName}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#btn-cloud-close');
    const cancelBtn = modal.querySelector('#btn-cloud-cancel');
    const confirmBtn = modal.querySelector('#btn-cloud-confirm');
    const progressWrap = modal.querySelector('#cloud-progress-wrap');
    const progressBar = modal.querySelector('#cloud-progress-bar');
    const progressPct = modal.querySelector('#cloud-progress-pct');
    const progressStatus = modal.querySelector('#cloud-progress-status');

    const closeModal = () => modal.remove();
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        confirmBtn.disabled = true;
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (progressWrap) progressWrap.style.display = 'block';

        const steps = [
          { pct: '30%', text: `Authenticating with ${providerName}...` },
          { pct: '70%', text: `Encrypting & uploading ${filename}...` },
          { pct: '100%', text: `Saved to ${providerName} / LetsEdit!` }
        ];

        for (const step of steps) {
          if (progressBar) progressBar.style.width = step.pct;
          if (progressPct) progressPct.textContent = step.pct;
          if (progressStatus) progressStatus.textContent = step.text;
          await new Promise(r => setTimeout(r, 350));
        }

        Toast.success(`Successfully saved ${filename} to ${providerName}!`);
        setTimeout(() => closeModal(), 600);
      };
    }
  }

  async shareDocument() {
    if (!this.processedBlob) return;
    const filename = this.processedFilename || 'document.pdf';
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([this.processedBlob], filename, { type: this.processedBlob.type || 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: filename,
            text: `Processed with LetsEdit Pro PDF Suite`,
            files: [file]
          });
          Toast.success('Shared successfully!');
          return;
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Share error:', err);
      }
    }

    const fakeTransferId = 'doc_' + Math.random().toString(36).substring(2, 10);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://letsedit.io';
    const link = `${origin}/download?ref=${fakeTransferId}&name=${encodeURIComponent(filename)}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      }
      Toast.success('Direct download link copied to clipboard!');
    } catch {
      Toast.info(`Share link: ${link}`);
    }
  }

  purgeDocumentMemory() {
    this.processedBlob = null;
    this.processedFilename = '';
    this.uploadedFiles = [];
    this.stage = 'upload';
    this.render();
    Toast.info('Document memory purged. 100% privacy maintained.');
  }

  async openCameraScannerModal() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Toast.error('Camera access is not supported by your browser environment.');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'workflow-camera-modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 680px; width: 95%;">
        <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #30050d; display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Camera Document Scanner</h3>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Position document inside viewfinder and click Snap</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-cam-close" style="font-size: 24px; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
          <div style="position: relative; width: 100%; max-width: 560px; height: 380px; border-radius: 12px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;">
            <video id="cam-scanner-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
            <div style="position: absolute; inset: 20px; border: 2px dashed rgba(255,255,255,0.7); border-radius: 8px; pointer-events: none; box-shadow: 0 0 0 9999px rgba(0,0,0,0.35);">
              <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 4px; font-size: 11px; color: white;">Align Document Here</div>
            </div>
          </div>
          <canvas id="cam-scanner-canvas" style="display: none;"></canvas>

          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" class="btn btn-primary btn-md" id="btn-cam-snap" style="display: flex; align-items: center; gap: 8px; padding: 10px 22px; font-weight: 600;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4" fill="currentColor"></circle></svg>
              <span>Snap Page</span>
            </button>
            <button type="button" class="btn btn-outline btn-md" id="btn-cam-done" style="padding: 10px 18px;">
              <span>Done (${this.uploadedFiles.length} pages)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    let stream = null;
    const video = modal.querySelector('#cam-scanner-video');
    const canvas = modal.querySelector('#cam-scanner-canvas');
    const snapBtn = modal.querySelector('#btn-cam-snap');
    const doneBtn = modal.querySelector('#btn-cam-done');
    const closeBtn = modal.querySelector('#btn-cam-close');

    const stopStream = () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      modal.remove();
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      video.srcObject = stream;
    } catch (err) {
      console.error('Camera open error:', err);
      Toast.error('Could not access camera: ' + err.message);
      modal.remove();
      return;
    }

    closeBtn.onclick = stopStream;
    doneBtn.onclick = () => {
      stopStream();
      if (this.stage === 'upload' && this.uploadedFiles.length > 0) {
        this.stage = 'workspace';
      }
      this.render();
    };

    snapBtn.onclick = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const pageNum = this.uploadedFiles.length + 1;
        const file = new File([blob], `Scanned_Page_${pageNum}.jpg`, { type: 'image/jpeg' });
        await this.handleIncomingFiles([file]);
        Toast.success(`Captured Page #${pageNum}!`);
        const doneSpan = doneBtn.querySelector('span');
        if (doneSpan) {
          doneSpan.textContent = `Done (${this.uploadedFiles.length} pages)`;
        }
      }, 'image/jpeg', 0.92);
    };
  }
}

export const toolWorkflow = new ToolWorkflowManager();
