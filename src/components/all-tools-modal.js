/**
 * All Tools Hub Modal Component (Canva & Sejda style)
 * Provides a clean, visual grid of all 34 PDF studio tools with instant search and categories.
 */

import { store } from '../core/state-store.js';
import { cropModal } from './crop-modal.js';
import { resizeModal } from './resize-modal.js';
import { compressModal } from './compress-modal.js';
import { metadataModal } from './metadata-modal.js';
import { batesModal } from './bates-modal.js';
import { splitModal } from './split-modal.js';
import { splitHalfModal } from './split-half-modal.js';
import { alternateMixModal } from './alternate-mix-modal.js';
import { nUpModal } from './nup-modal.js';
import { pdfToImageModal } from './pdf-to-image-modal.js';
import { flipModal } from './flip-modal.js';
import { grayscaleModal } from './grayscale-modal.js';
import { extractImagesModal } from './extract-images-modal.js';
import { ocrModal } from './ocr-modal.js';
import { compareModal } from './compare-modal.js';
import { repairModal } from './repair-modal.js';
import { pdfaModal } from './pdfa-modal.js';
import { toolWorkflow, WORKFLOW_TOOLS_CONFIG } from './tool-workflow.js';
import { downloadBlob } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { Toast } from './toast.js';
import { getTwoToneIconSvg } from './landing/landing-icons.js';

export const LETSEDIT_TOOL_CATEGORIES = [
  {
    id: 'popular',
    name: 'Most popular',
    desc: 'The most frequently used tools for fast PDF tasks',
    icon: 'star',
    tools: [
      { id: 'edit', title: 'PDF Editor', desc: 'Edit PDF files for free. Fill & sign PDF. Add text, links, images and shapes. Edit existing PDF text. Annotate PDF', icon: 'edit', color: '#30050d', popular: true, action: 'tool:select' },
      { id: 'compress', title: 'Compress', desc: 'Reduce the size of your PDF', icon: 'compress', color: '#059669', popular: true, action: 'workflow:compress' },
      { id: 'delete', title: 'Delete Pages', desc: 'Remove pages from a PDF document', icon: 'trash', color: '#ef4444', popular: true, action: 'sidebar:delete' },
      { id: 'merge', title: 'Merge', desc: 'Combine multiple PDFs and images into one', icon: 'merge', color: '#30050d', popular: true, action: 'workflow:merge' },
      { id: 'split', title: 'Split', desc: 'Split specific page ranges or extract every page into a separate document', icon: 'split', color: '#ea580c', popular: true, action: 'workflow:split' },
      { id: 'crop', title: 'Crop', desc: 'Trim PDF margins, change PDF page size', icon: 'crop', color: '#0d9488', popular: true, action: 'workflow:crop' },
      { id: 'sign', title: 'Fill & Sign', desc: 'Add signature to PDF. Fill out PDF forms', icon: 'sign', color: '#7c3aed', popular: true, action: 'workflow:sign' },
      { id: 'pdf-to-word', title: 'PDF to Word', desc: 'Convert from PDF to DOC online', icon: 'word', color: '#30050d', popular: true, action: 'workflow:pdf-to-word' },
      { id: 'extract-pages', title: 'Extract Pages', desc: 'Get a new document containing only the desired pages', icon: 'extract', color: '#ea580c', popular: true, action: 'workflow:extract-pages' }
    ]
  },
  {
    id: 'merge',
    name: 'Merge',
    desc: 'Combine and interleave documents in any custom order',
    icon: 'merge',
    tools: [
      { id: 'alternate-mix', title: 'Alternate & Mix', desc: 'Mixes pages from 2 or more documents, alternating between them', icon: 'shuffle', color: '#0891b2', action: 'workflow:alternate-mix' },
      { id: 'merge', title: 'Merge', desc: 'Combine multiple PDFs and images into one', icon: 'merge', color: '#30050d', action: 'workflow:merge' },
      { id: 'organize', title: 'Organize', desc: 'Arrange and reorder PDF pages', icon: 'grid', color: '#30050d', action: 'workflow:organize' }
    ]
  },
  {
    id: 'split',
    name: 'Split',
    desc: 'Extract chapters, split ranges, and book spreads',
    icon: 'split',
    tools: [
      { id: 'extract-pages', title: 'Extract Pages', desc: 'Get a new document containing only the desired pages', icon: 'extract', color: '#ea580c', action: 'workflow:extract-pages' },
      { id: 'split', title: 'Split by pages', desc: 'Split specific page ranges or extract every page into a separate document', icon: 'split', color: '#ea580c', action: 'workflow:split' },
      { id: 'split-bookmarks', title: 'Split by bookmarks', desc: 'Extract chapters to separate documents based on the bookmarks in the table of contents', icon: 'bookmark', color: '#f59e0b', action: 'workflow:split' },
      { id: 'split-half', title: 'Split in half', desc: 'Split two page layout scans, A3 to double A4 or A4 to double A5', icon: 'book', color: '#4f46e5', action: 'workflow:split-half' },
      { id: 'split-size', title: 'Split by size', desc: 'Get multiple smaller documents with specific file sizes', icon: 'layers', color: '#6366f1', action: 'workflow:split' },
      { id: 'split-text', title: 'Split by text', desc: 'Extract separate documents when specific text changes from page to page', icon: 'type', color: '#30050d', action: 'workflow:split' }
    ]
  },
  {
    id: 'edit-sign',
    name: 'Edit & Sign',
    desc: 'Full editing, handwriting signatures, and interactive forms',
    icon: 'edit',
    tools: [
      { id: 'edit', title: 'PDF Editor', desc: 'Edit PDF files for free. Fill & sign PDF. Add text, links, images and shapes. Edit existing PDF text. Annotate PDF', icon: 'edit', color: '#30050d', action: 'tool:select' },
      { id: 'sign', title: 'Fill & Sign', desc: 'Add signature to PDF. Fill out PDF forms', icon: 'sign', color: '#7c3aed', action: 'workflow:sign' },
      { id: 'forms', title: 'Create Forms', desc: 'Free PDF forms creator. Make existing PDF documents fillable', icon: 'check-square', color: '#10b981', action: 'tool:form' },
      { id: 'delete', title: 'Delete Pages', desc: 'Remove pages from a PDF document', icon: 'trash', color: '#ef4444', action: 'sidebar:delete' }
    ]
  },
  {
    id: 'compress-scans',
    name: 'Compress & Scans',
    desc: 'File size reduction, scan deskewing, and OCR text extraction',
    icon: 'compress',
    tools: [
      { id: 'compress', title: 'Compress', desc: 'Reduce the size of your PDF', icon: 'compress', color: '#059669', action: 'workflow:compress' },
      { id: 'scan', title: 'Scan to PDF', desc: 'Capture documents using camera or mobile scanner into clean PDF', icon: 'camera', color: '#30050d', action: 'workflow:scan' },
      { id: 'deskew', title: 'Deskew', desc: 'Automatically straighten and deskew scanned PDF pages', icon: 'rotate', color: '#0891b2', action: 'workflow:deskew' },
      { id: 'ocr-pdf', title: 'OCR', desc: 'Convert PDF scans to searchable text and PDFs. Extract text from scans', icon: 'file-text', color: '#6366f1', badge: 'PRO', action: 'workflow:ocr-pdf' },
      { id: 'compare', title: 'Compare PDF', desc: 'Find differences and visually compare two PDF documents side by side', icon: 'git-pull-request', color: '#8b5cf6', badge: 'POPULAR', action: 'workflow:compare' }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    desc: 'Passwords, permissions, watermarks, and form flattening',
    icon: 'lock',
    tools: [
      { id: 'security', title: 'Protect', desc: 'Protect file with password and permissions', icon: 'lock', color: '#dc2626', action: 'workflow:security' },
      { id: 'unlock', title: 'Unlock', desc: 'Remove restrictions and password from PDF files', icon: 'unlock', color: '#10b981', action: 'workflow:unlock' },
      { id: 'sanitize', title: 'Sanitize Document', desc: 'Remove hidden metadata, embedded files, JavaScript actions, and private app data (Adobe Acrobat Pro standard)', icon: 'shield', color: '#059669', badge: 'PRO', action: 'workflow:sanitize' },
      { id: 'redact', title: 'Redact', desc: 'Permanently remove sensitive text, words and coordinates from PDF streams', icon: 'shield', color: '#0f172a', badge: 'PRO', action: 'workflow:redact' },
      { id: 'watermark', title: 'Watermark', desc: 'Add image or text watermark to PDF documents', icon: 'droplet', color: '#30050d', action: 'workflow:watermark' },
      { id: 'flatten', title: 'Flatten', desc: 'Makes fillable PDFs read-only. Print & scan in one step', icon: 'layers', color: '#0d9488', badge: 'NEW', action: 'workflow:flatten' }
    ]
  },
  {
    id: 'convert-from',
    name: 'Convert from PDF',
    desc: 'Export PDF documents to DOC, Excel, PPT, JPG, or Plain Text',
    icon: 'file-text',
    tools: [
      { id: 'pdf-to-excel', title: 'PDF to Excel', desc: 'Convert PDF to Excel or CSV online for free. Extract table data from PDF', icon: 'excel', color: '#107c41', action: 'workflow:pdf-to-excel' },
      { id: 'to-image', title: 'PDF to JPG', desc: 'Get PDF pages converted to JPG, PNG or TIFF images', icon: 'image', color: '#d97706', action: 'workflow:to-image' },
      { id: 'pdf-to-ppt', title: 'PDF to PPT', desc: 'Convert PDF to PowerPoint online', icon: 'ppt', color: '#d24726', action: 'workflow:pdf-to-ppt' },
      { id: 'pdf-to-text', title: 'PDF to Text', desc: 'Copies all text from the PDF document and extracts it to a separate text file', icon: 'align-left', color: '#334155', action: 'workflow:pdf-to-text' },
      { id: 'pdf-to-word', title: 'PDF to Word', desc: 'Convert from PDF to DOC online', icon: 'word', color: '#30050d', action: 'workflow:pdf-to-word' }
    ]
  },
  {
    id: 'convert-to',
    name: 'Convert to PDF',
    desc: 'Generate PDF documents from Web, Images, and Word files',
    icon: 'upload-cloud',
    tools: [
      { id: 'html-to-pdf', title: 'HTML to PDF', desc: 'Convert web pages or HTML files to PDF documents', icon: 'code', color: '#30050d', action: 'workflow:html-to-pdf' },
      { id: 'images-to-pdf', title: 'JPG to PDF', desc: 'Convert Images to PDF', icon: 'images', color: '#d97706', action: 'workflow:images-to-pdf' },
      { id: 'word-to-pdf', title: 'Word to PDF', desc: 'Creates a PDF document from Microsoft Word .docx', icon: 'word', color: '#30050d', action: 'workflow:word-to-pdf' },
      { id: 'excel-to-pdf', title: 'Excel to PDF', desc: 'Convert Excel spreadsheets and CSV tables into styled PDF tables', icon: 'excel', color: '#107c41', action: 'workflow:excel-to-pdf' },
      { id: 'ppt-to-pdf', title: 'PowerPoint to PDF', desc: 'Convert PowerPoint PPTX presentation slides into formatted PDF slide decks', icon: 'ppt', color: '#d24726', action: 'workflow:ppt-to-pdf' }
    ]
  },
  {
    id: 'others',
    name: 'Others',
    desc: 'Bates numbering, margins, n-up imposition, metadata, and repair',
    icon: 'more-horizontal',
    tools: [
      { id: 'bates', title: 'Bates Numbering', desc: 'Bates stamp multiple files at once for legal indexing', icon: 'shield', color: '#1e293b', badge: 'LEGAL', action: 'workflow:bates' },
      { id: 'create-bookmarks', title: 'Create Bookmarks', desc: 'Create PDF Bookmarks', icon: 'bookmark', color: '#7c3aed', action: 'modal:metadata' },
      { id: 'crop', title: 'Crop', desc: 'Trim PDF margins, change PDF page size', icon: 'crop', color: '#0d9488', action: 'workflow:crop' },
      { id: 'metadata', title: 'Edit Metadata & XMP', desc: 'Change PDF Author, Title, Keywords, Subject and synchronize Adobe XMP schemas', icon: 'file-text', color: '#6366f1', action: 'workflow:edit-metadata' },
      { id: 'extract-images', title: 'Extract Images', desc: 'Extract images from PDF', icon: 'image', color: '#ec4899', action: 'workflow:extract-images' },
      { id: 'flip', title: 'Flip', desc: 'Mirror pages horizontally or vertically', icon: 'flip', color: '#8b5cf6', action: 'workflow:flip' },
      { id: 'grayscale', title: 'Grayscale', desc: 'Make a PDF text and images grayscale', icon: 'circle-half', color: '#475569', action: 'workflow:grayscale' },
      { id: 'header-footer', title: 'Header & Footer', desc: 'Stamp 6-zone dynamic headers and footers with page numbers, date macros, and custom margins', icon: 'hash', color: '#4338ca', badge: 'PRO', action: 'workflow:header-footer' },
      { id: 'nup', title: 'N-up Imposition', desc: 'Impose multiple pages per sheet (2-up, 4-up, 6-up, 8-up) with custom margins, gutters & page borders', icon: 'layout', color: '#3b82f6', badge: 'NEW', action: 'workflow:nup' },
      { id: 'pagenumbers', title: 'Page Numbers', desc: 'Add PDF page numbers', icon: 'hash', color: '#4b5563', action: 'workflow:pagenumbers' },
      { id: 'pagelabels', title: 'Page Labels (Multi-Section)', desc: 'Divide documents into sections with Roman, Arabic, or alphabetic schemes in ISO 32000-1 /PageLabels', icon: 'hash', color: '#6366f1', badge: 'ISO', action: 'workflow:pagelabels' },
      { id: 'bookmarks', title: 'Bookmarks & Outline', desc: 'Create, nest, color-code, and manage PDF navigation bookmarks in ISO 32000-1 /Outlines', icon: 'bookmark', color: '#6366f1', badge: 'NEW', action: 'workflow:bookmarks' },
      { id: 'rename', title: 'Rename', desc: 'Change document filename based on text from the PDF pages', icon: 'edit', color: '#059669', action: 'workflow:rename' },
      { id: 'repair', title: 'Repair', desc: 'Recover data from a corrupted or damaged PDF document', icon: 'tool', color: '#ef4444', action: 'workflow:repair' },
      { id: 'resize', title: 'Resize Margins & Pages', desc: 'Add page margins, spiral/binder gutters with duplex mirroring, and standardize sheet dimensions (A4/Letter)', icon: 'maximize', color: '#6366f1', badge: 'PRO', action: 'workflow:resize' },
      { id: 'rotate', title: 'Rotate', desc: 'Rotate and save PDF pages permanently', icon: 'rotate', color: '#f59e0b', action: 'workflow:rotate' },
      { id: 'remove-annotations', title: 'Remove annotations', desc: 'Batch remove highlights, strikeouts or any other annotations from a PDF document', icon: 'trash-2', color: '#dc2626', action: 'workflow:remove-annotations' },
      { id: 'pdfa', title: 'PDF to PDF/A', desc: 'Convert PDF documents to PDF/A for ISO 19005-1 long-term archiving', icon: 'shield', color: '#059669', badge: 'ISO ARCHIVAL', action: 'workflow:pdfa' }
    ]
  }
];

export const SMALLPDF_DIRECTORIES = [
  {
    col: 1,
    sections: [
      {
        title: 'Compress',
        tools: [
          { id: 'compress', title: 'Compress PDF', icon: 'compress', color: '#ef4444', action: 'workflow:compress' }
        ]
      },
      {
        title: 'Convert',
        tools: [
          { id: 'pdf-to-word', title: 'PDF Converter', icon: 'file-text', color: '#ef4444', action: 'workflow:pdf-to-word' },
          { id: 'ocr-pdf', title: 'PDF OCR', icon: 'ocr', color: '#ef4444', action: 'workflow:ocr-pdf' },
          { id: 'pdfa', title: 'PDF to PDF/A', icon: 'pdfa', color: '#ef4444', action: 'workflow:pdfa' }
        ]
      },
      {
        title: 'PDF to Image',
        tools: [
          { id: 'to-image', title: 'PDF to JPG', icon: 'image', color: '#f59e0b', action: 'workflow:to-image' },
          { id: 'to-png', title: 'PDF to PNG', icon: 'image', color: '#f59e0b', action: 'workflow:to-image' }
        ]
      }
    ]
  },
  {
    col: 2,
    sections: [
      {
        title: 'Image to PDF',
        tools: [
          { id: 'images-to-pdf', title: 'JPG to PDF', icon: 'images', color: '#f59e0b', action: 'workflow:images-to-pdf' }
        ]
      },
      {
        title: 'PDF to Office',
        tools: [
          { id: 'pdf-to-word', title: 'PDF to Word', tag: 'W', color: '#2563eb', action: 'workflow:pdf-to-word' },
          { id: 'pdf-to-excel', title: 'PDF to Excel', tag: 'X', color: '#16a34a', action: 'workflow:pdf-to-excel' },
          { id: 'pdf-to-ppt', title: 'PDF to PPT', tag: 'P', color: '#ea580c', action: 'workflow:pdf-to-ppt' }
        ]
      },
      {
        title: 'Office to PDF',
        tools: [
          { id: 'word-to-pdf', title: 'Word to PDF', tag: 'W', color: '#2563eb', action: 'workflow:word-to-pdf' },
          { id: 'excel-to-pdf', title: 'Excel to PDF', tag: 'X', color: '#16a34a', action: 'workflow:excel-to-pdf' },
          { id: 'ppt-to-pdf', title: 'PPT to PDF', tag: 'P', color: '#ea580c', action: 'workflow:ppt-to-pdf' }
        ]
      }
    ]
  },
  {
    col: 3,
    sections: [
      {
        title: 'OpenOffice to PDF',
        tools: [
          { id: 'odt-to-pdf', title: 'ODT to PDF', tag: 'ODT', color: '#2563eb', action: 'workflow:word-to-pdf' },
          { id: 'ods-to-pdf', title: 'ODS to PDF', tag: 'ODS', color: '#16a34a', action: 'workflow:excel-to-pdf' },
          { id: 'odp-to-pdf', title: 'ODP to PDF', tag: 'ODP', color: '#ea580c', action: 'workflow:ppt-to-pdf' }
        ]
      }
    ]
  },
  {
    col: 4,
    sections: [
      {
        title: 'Convert to PDF',
        tools: [
          { id: 'txt-to-pdf', title: 'TXT to PDF', tag: 'TXT', color: '#2563eb', action: 'workflow:pdf-to-text' },
          { id: 'rtf-to-pdf', title: 'RTF to PDF', tag: 'RTF', color: '#2563eb', action: 'workflow:word-to-pdf' },
          { id: 'hwp-to-pdf', title: 'HWP to PDF', tag: 'HWP', color: '#2563eb', action: 'workflow:word-to-pdf' },
          { id: 'html-to-pdf', title: 'HTML to PDF', tag: 'HTML', color: '#2563eb', action: 'workflow:html-to-pdf' },
          { id: 'epub-to-pdf', title: 'EPUB to PDF', tag: 'EPUB', color: '#2563eb', action: 'workflow:word-to-pdf' },
          { id: 'zip-to-pdf', title: 'ZIP to PDF', tag: 'ZIP', color: '#2563eb', action: 'workflow:images-to-pdf' },
          { id: 'csv-to-pdf', title: 'CSV to PDF', tag: 'CSV', color: '#16a34a', action: 'workflow:excel-to-pdf' }
        ]
      },
      {
        title: 'iWork to PDF',
        tools: [
          { id: 'pages-to-pdf', title: 'Pages to PDF', icon: 'file-text', color: '#2563eb', action: 'workflow:word-to-pdf' }
        ]
      }
    ]
  },
  {
    col: 5,
    sections: [
      {
        title: 'Organize',
        tools: [
          { id: 'merge', title: 'Merge PDF', icon: 'merge', color: '#7c3aed', action: 'workflow:merge' },
          { id: 'split', title: 'Split PDF', icon: 'split', color: '#7c3aed', action: 'workflow:split' },
          { id: 'rotate', title: 'Rotate PDF', icon: 'rotate', color: '#7c3aed', action: 'workflow:rotate' },
          { id: 'delete', title: 'Delete PDF Pages', icon: 'trash', color: '#7c3aed', action: 'sidebar:delete' },
          { id: 'extract-pages', title: 'Extract PDF Pages', icon: 'extract', color: '#7c3aed', action: 'workflow:extract-pages' },
          { id: 'organize', title: 'Organize PDF', icon: 'grid', color: '#7c3aed', action: 'workflow:organize' }
        ]
      }
    ]
  },
  {
    col: 6,
    sections: [
      {
        title: 'Edit',
        tools: [
          { id: 'edit', title: 'Edit PDF', icon: 'edit', color: '#0d9488', action: 'tool:select' },
          { id: 'annotator', title: 'PDF Annotator', icon: 'edit', color: '#0d9488', action: 'tool:text' },
          { id: 'reader', title: 'PDF Reader', icon: 'book', color: '#0d9488', action: 'tool:select' },
          { id: 'pagenumbers', title: 'Number Pages', icon: 'hash', color: '#0d9488', action: 'workflow:pagenumbers' },
          { id: 'crop', title: 'Crop PDF', icon: 'crop', color: '#0d9488', action: 'workflow:crop' },
          { id: 'redact', title: 'Redact PDF', icon: 'shield', color: '#0d9488', action: 'workflow:redact' },
          { id: 'watermark', title: 'Watermark PDF', icon: 'droplet', color: '#0d9488', action: 'workflow:watermark' },
          { id: 'forms', title: 'PDF Form Filler', icon: 'forms', color: '#0d9488', action: 'tool:form' },
          { id: 'share', title: 'Share PDF', icon: 'share', color: '#0d9488', action: 'tool:select' }
        ]
      }
    ]
  },
  {
    col: 7,
    sections: [
      {
        title: 'Fill & Sign',
        tools: [
          { id: 'sign', title: 'Sign PDF', icon: 'sign', color: '#db2777', action: 'workflow:sign' },
          { id: 'sign-request', title: 'Request Signatures (Sign.com)', icon: 'sign', color: '#ca8a04', action: 'workflow:sign-request' }
        ]
      },
      {
        title: 'Protect',
        tools: [
          { id: 'unlock', title: 'Unlock PDF', icon: 'unlock', color: '#ef4444', action: 'workflow:unlock' },
          { id: 'security', title: 'Protect PDF', icon: 'lock', color: '#ef4444', action: 'workflow:security' },
          { id: 'flatten', title: 'Flatten PDF', icon: 'flatten', color: '#ef4444', action: 'workflow:flatten' }
        ]
      }
    ]
  },
  {
    col: 8,
    sections: [
      {
        title: 'AI PDF',
        tools: [
          { id: 'ai-assistant', title: 'AI PDF Assistant', tag: 'AI', color: '#2563eb', action: 'workflow:ocr-pdf' },
          { id: 'chat-pdf', title: 'Chat with PDF', icon: 'message', color: '#2563eb', action: 'workflow:ocr-pdf' },
          { id: 'ai-summarizer', title: 'AI PDF Summarizer', icon: 'file-text', color: '#2563eb', action: 'workflow:pdf-to-text' },
          { id: 'translate-pdf', title: 'Translate PDF', icon: 'globe', color: '#2563eb', action: 'workflow:ocr-pdf' },
          { id: 'ai-questions', title: 'AI Question Generator', icon: 'help', color: '#2563eb', action: 'workflow:ocr-pdf' }
        ]
      },
      {
        title: 'Scan',
        tools: [
          { id: 'scan', title: 'PDF Scanner', icon: 'camera', color: '#2563eb', action: 'workflow:scan' }
        ]
      }
    ]
  }
];
export const SEJDA_TOOL_CATEGORIES = LETSEDIT_TOOL_CATEGORIES;

// Deduplicated flat catalog
const seen = new Set();
export const TOOLS_CATALOG = [];
LETSEDIT_TOOL_CATEGORIES.forEach(cat => {
  cat.tools.forEach(t => {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      TOOLS_CATALOG.push({ ...t, category: cat.id });
    }
  });
});
SMALLPDF_DIRECTORIES.forEach(col => {
  col.sections.forEach(sec => {
    sec.tools.forEach(t => {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        TOOLS_CATALOG.push(t);
      }
    });
  });
});

export function getMiniIconSvg(icon) {
  const icons = {
    compress: '<path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"/>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    ocr: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    pdfa: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    images: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    merge: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    split: '<path d="M16 3h5v5M8 3H3v5M12 22V2"/>',
    rotate: '<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    extract: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    forms: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    sign: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    flatten: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'
  };
  return `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">${icons[icon] || icons['file-text']}</svg>`;
}

export function getSmallpdfIconHtml(tool) {
  if (tool.tag) {
    const isLong = tool.tag.length > 2;
    return `<span class="tools-dir-icon-box ${isLong ? 'tag-long' : ''}" style="background: ${tool.color}; color: #ffffff;">${tool.tag}</span>`;
  }
  const svg = getMiniIconSvg(tool.icon || 'file-text');
  return `<span class="tools-dir-icon-box" style="background: ${tool.color}; color: #ffffff;">${svg}</span>`;
}

export function renderDirectoryItemHtml(tool) {
  return `
    <button class="tools-dir-item" data-action="${tool.action}" data-tool-id="${tool.id}" title="${tool.title}">
      ${getSmallpdfIconHtml(tool)}
      <span class="tools-dir-title">${tool.title}</span>
    </button>
  `;
}

export class AllToolsModal {
  constructor() {
    this.modal = null;
    this.activeFilter = 'all';
    this.searchQuery = '';
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'all-tools-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog tools-hub-dialog">
        <div class="modal-header tools-hub-header">
          <div class="tools-hub-brand">
            <div>
              <div class="tools-hub-title-row">
                <h3 class="tools-hub-title">PDF Studio Tools Hub</h3>
              </div>
              <p class="tools-hub-subtitle">Quickly find, filter, and launch any PDF editing, organization, or conversion tool</p>
            </div>
          </div>
          <button class="modal-close-icon-btn modal-close-btn" aria-label="Close modal">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Search & Filter Rail -->
        <div class="tools-hub-controls">
          <div class="modal-search-wrapper">
            <svg class="modal-search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
            <input type="text" id="all-tools-search" class="modal-search-input" placeholder="Search 35+ PDF tools (e.g. compress, split, crop, sign, word, bates, redact)..." autocomplete="off" />
            <div class="modal-search-meta">
              <button id="all-tools-search-clear" class="modal-search-clear" style="display: none;" title="Clear search" aria-label="Clear">&times;</button>
              <span class="modal-shortcut-badge"><kbd>ESC</kbd></span>
            </div>
          </div>

          <div class="modal-filter-rail" id="all-tools-filter-chips">
            <button class="tool-filter-chip active" data-filter="all"><span class="chip-dot"></span>All Tools</button>
            <button class="tool-filter-chip" data-filter="popular">⭐ Most Popular</button>
            <button class="tool-filter-chip" data-filter="merge">🔗 Merge & Combine</button>
            <button class="tool-filter-chip" data-filter="split">✂ Split & Extract</button>
            <button class="tool-filter-chip" data-filter="edit-sign">✏ Edit & Sign</button>
            <button class="tool-filter-chip" data-filter="compress-scans">🗜 Compress & OCR</button>
            <button class="tool-filter-chip" data-filter="security">🔒 Security & Redact</button>
            <button class="tool-filter-chip" data-filter="convert-from">📤 Convert from PDF</button>
            <button class="tool-filter-chip" data-filter="convert-to">📥 Convert to PDF</button>
            <button class="tool-filter-chip" data-filter="others">⚡ Page Operations</button>
          </div>
        </div>

        <!-- Cards Grid Container -->
        <div class="modal-body tools-hub-body">
          <div id="all-tools-grid"></div>
        </div>

        <div class="modal-footer tools-hub-footer">
          <div class="tools-hub-footer-hint">
            <kbd class="tools-hub-kbd">ESC</kbd>
            <span>to close</span>
            <span class="tools-hub-divider">•</span>
            <span class="tools-hub-sec-hint">Select any card to launch immediately</span>
          </div>
          <button class="btn btn-outline btn-sm modal-close-btn tools-hub-close-cta">Close Hub</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
    this.renderGrid();
  }

  getToolIconSvg(icon) {
    const icons = {
      edit: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
      compress: '<path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path>',
      sign: '<path d="M3 17l6-6 4 4 8-8"></path><path d="M14 7h7v7"></path>',
      trash: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
      split: '<path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22V2"></path>',
      merge: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>',
      crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path>',
      image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
      grid: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
      shuffle: '<polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line>',
      layout: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line><line x1="12" y1="3" x2="12" y2="21"></line>',
      maximize: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>',
      rotate: '<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>',
      type: '<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>',
      pen: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>',
      marker: '<path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>',
      eraser: '<path d="M18 13l-7-7L3 14l7 7 8-8z"></path><line x1="14" y1="22" x2="22" y2="22"></line>',
      square: '<rect x="3" y="3" width="18" height="18" rx="2"></rect>',
      shapes: '<polygon points="12 2 2 22 22 22"></polygon>',
      'check-square': '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
      stamp: '<path d="M5 22h14"></path><path d="M12 2v10"></path><path d="M8 7l4-5 4 5"></path><rect x="5" y="16" width="14" height="6" rx="2"></rect>',
      search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
      droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>',
      hash: '<line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
      layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
      images: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
      flip: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path>',
      'circle-half': '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"></path>',
      'align-left': '<line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line>',
      tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
      star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
      word: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
      excel: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line>',
      ppt: '<rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
      code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
      bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>',
      unlock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>',
      'trash-2': '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
      camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>',
      extract: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>'
    };

    return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${icons[icon] || icons.edit}</svg>`;
  }

  bindEvents() {
    this.modal.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.onclick = () => this.hide();
    });

    const searchInput = this.modal.querySelector('#all-tools-search');
    const clearBtn = this.modal.querySelector('#all-tools-search-clear');

    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) clearBtn.style.display = e.target.value ? 'flex' : 'none';
        this.renderGrid();
      };
    }

    if (clearBtn && searchInput) {
      clearBtn.onclick = () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        this.renderGrid();
      };
    }

    const chips = this.modal.querySelectorAll('.tool-filter-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.dataset.filter;
        this.renderGrid();
      };
    });
  }

  renderGrid() {
    const grid = this.modal.querySelector('#all-tools-grid');
    if (!grid) return;

    // 1. If searching, flat filter across all tools
    if (this.searchQuery) {
      const q = this.searchQuery;
      const allTools = [];
      const seen = new Set();
      SMALLPDF_DIRECTORIES.forEach(col => {
        col.sections.forEach(sec => {
          sec.tools.forEach(t => {
            if (!seen.has(t.title.toLowerCase())) {
              seen.add(t.title.toLowerCase());
              allTools.push(t);
            }
          });
        });
      });

      const filtered = allTools.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
            <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 10px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">No tools found matching "${this.searchQuery}"</div>
            <p style="font-size: 13px; margin-top: 6px; color: var(--text-muted);">Try searching for "compress", "split", "word", "sign", or "redact"</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = `
        <div class="tools-dir-search-grid">
          ${filtered.map(tool => renderDirectoryItemHtml(tool)).join('')}
        </div>
      `;
      this.attachCardEvents(grid);
      return;
    }

    // 2. If a specific category filter is chosen
    if (this.activeFilter !== 'all') {
      const target = this.activeFilter.toLowerCase();
      const matchedCols = [];

      SMALLPDF_DIRECTORIES.forEach(col => {
        const matchedSections = col.sections.filter(sec => {
          if (target === 'popular') return sec.title === 'Compress' || sec.title === 'Organize' || sec.title === 'Edit' || sec.title === 'Fill & Sign';
          if (target === 'merge') return sec.title === 'Organize';
          if (target === 'split') return sec.title === 'Organize';
          if (target === 'edit-sign') return sec.title === 'Edit' || sec.title === 'Fill & Sign';
          if (target === 'compress-scans') return sec.title === 'Compress' || sec.title === 'Scan';
          if (target === 'security') return sec.title === 'Protect';
          if (target === 'convert-from') return sec.title === 'Convert' || sec.title === 'PDF to Image' || sec.title === 'PDF to Office';
          if (target === 'convert-to') return sec.title === 'Image to PDF' || sec.title === 'Office to PDF' || sec.title === 'OpenOffice to PDF' || sec.title === 'Convert to PDF' || sec.title === 'iWork to PDF';
          return sec.title.toLowerCase().includes(target);
        });

        if (matchedSections.length > 0) {
          matchedCols.push({ col: col.col, sections: matchedSections });
        }
      });

      if (matchedCols.length > 0) {
        grid.innerHTML = `
          <div class="tools-dir-grid" style="grid-template-columns: repeat(${Math.min(matchedCols.length, 6)}, minmax(130px, 1fr));">
            ${matchedCols.map(col => `
              <div class="tools-dir-col">
                ${col.sections.map(sec => `
                  <div class="tools-dir-section">
                    <div class="tools-dir-sec-title">${sec.title}</div>
                    ${sec.tools.map(tool => renderDirectoryItemHtml(tool)).join('')}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        `;
        this.attachCardEvents(grid);
        return;
      }
    }

    // 3. Default: Render EXACT 8-COLUMN DIRECTORY from user screenshot!
    grid.innerHTML = `
      <div class="tools-dir-grid">
        ${SMALLPDF_DIRECTORIES.map(col => `
          <div class="tools-dir-col">
            ${col.sections.map(sec => `
              <div class="tools-dir-section">
                <div class="tools-dir-sec-title">${sec.title}</div>
                ${sec.tools.map(tool => renderDirectoryItemHtml(tool)).join('')}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;

    this.attachCardEvents(grid);
  }

  attachCardEvents(container) {
    container.querySelectorAll('.tools-dir-item, .landing-tool-card, .tool-card-item').forEach(card => {
      card.onclick = () => {
        const action = card.getAttribute('data-action');
        const toolId = card.getAttribute('data-tool-id');
        this.dispatchToolAction(action, toolId);
      };
    });
  }

  dispatchToolAction(action, toolId = null) {
    this.hide();
    if (!action) return;

    // 1. Dedicated tool workflow
    if (action.startsWith('workflow:')) {
      const toolKey = action.replace('workflow:', '');
      router.navigate(router.getCanonicalPath(toolKey));
      return;
    }

    if (toolId && WORKFLOW_TOOLS_CONFIG[toolId]) {
      router.navigate(router.getCanonicalPath(toolId));
      return;
    }

    // 2. Editor in-studio modals & canvas tools
    this.executeAction(action);
  }

  executeAction(action) {
    if (!action) return;

    if (action.startsWith('workflow:')) {
      const toolKey = action.replace('workflow:', '');
      router.navigate(router.getCanonicalPath(toolKey));
      return;
    }

    // Ensure studio view is visible if navigating from landing page
    if (document.body.classList.contains('show-landing')) {
      document.body.classList.remove('show-landing');
      document.body.classList.add('show-studio');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    if (action.startsWith('tool:')) {
      const tool = action.replace('tool:', '');
      const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
      if (btn) btn.click();
    } else if (action === 'modal:compress') {
      compressModal.show();
    } else if (action === 'modal:split') {
      splitModal.show();
    } else if (action === 'modal:split-half') {
      splitHalfModal.show();
    } else if (action === 'modal:alternate-mix') {
      alternateMixModal.show();
    } else if (action === 'modal:nup') {
      nUpModal.show();
    } else if (action === 'modal:crop') {
      cropModal.show();
    } else if (action === 'modal:resize') {
      resizeModal.show();
    } else if (action === 'modal:flip') {
      flipModal.show();
    } else if (action === 'modal:grayscale') {
      grayscaleModal.show();
    } else if (action === 'modal:to-image') {
      pdfToImageModal.show();
    } else if (action === 'modal:extract-images') {
      extractImagesModal.open();
    } else if (action === 'modal:ocr') {
      ocrModal.show();
    } else if (action === 'modal:compare') {
      compareModal.show();
    } else if (action === 'modal:repair') {
      repairModal.show();
    } else if (action === 'modal:pdfa') {
      pdfaModal.show();
    } else if (action === 'modal:security') {
      const btn = document.getElementById('btn-open-security');
      if (btn) btn.click();
    } else if (action === 'modal:watermark') {
      const btn = document.getElementById('btn-open-watermark');
      if (btn) btn.click();
    } else if (action === 'modal:pagenumbers') {
      const btn = document.getElementById('btn-open-pagenumbers');
      if (btn) btn.click();
    } else if (action === 'modal:bates') {
      batesModal.show();
    } else if (action === 'modal:metadata') {
      metadataModal.show();
    } else if (action === 'sidebar:open' || action === 'sidebar:delete' || action === 'sidebar:merge') {
      document.body.classList.add('sidebar-open');
      Toast.info('Opened page organization sidebar');
    } else if (action === 'action:flatten') {
      store.setFlattenForms(true);
      Toast.success('Form fields set to flatten into vectors on export');
    } else if (action === 'action:images-to-pdf') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          const buffers = await Promise.all(files.map(f => f.arrayBuffer()));
          const newPdf = await pdfEngine.imagesToPdf(buffers);
          const info = await pdfEngine.loadPdf(newPdf);
          store.setDocument(newPdf, 'Images_Combined.pdf', info.numPages);
          Toast.success(`Created PDF from ${files.length} images!`);
        }
      };
      input.click();
    } else if (action === 'action:extract-text') {
      const state = store.getState();
      if (!state.pdfBytes) return Toast.error('No document loaded');
      pdfEngine.extractDocumentText(state.pdfBytes).then(text => {
        const blob = new Blob([text], { type: 'text/plain' });
        downloadBlob(blob, (state.documentName || 'Document').replace('.pdf', '') + '_text.txt');
        Toast.success('Extracted plain text downloaded!');
      });
    }
  }

  show() {
    if (this.modal) {
      this.modal.style.display = 'flex';
      const search = this.modal.querySelector('#all-tools-search');
      const clearBtn = this.modal.querySelector('#all-tools-search-clear');
      if (search) {
        search.value = '';
        this.searchQuery = '';
        if (clearBtn) clearBtn.style.display = 'none';
        setTimeout(() => search.focus(), 50);
      }
      this.renderGrid();
    }
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }
}

export const allToolsModal = new AllToolsModal();
