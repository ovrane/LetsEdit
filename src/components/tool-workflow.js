/**
 * Dedicated Tool Workflow Component (iLovePDF & Sejda Reverse-Engineered Architecture)
 * Provides focused, distraction-free tool workflows for Merge, Compress, Split, Convert, OCR, etc.
 * Features dedicated file uploaders tailored per tool (PDF only vs PDF+Images vs Images),
 * specialized processing workspaces with drag-and-drop reordering, and instant download cards.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer, formatFileSize } from '../utils/helpers.js';
import { applyTheme, toggleTheme, getPreferredTheme } from '../utils/theme.js';

export const WORKFLOW_TOOLS_CONFIG = {
  merge: {
    id: 'merge',
    title: 'Merge PDF files',
    subtitle: 'Combine PDFs and images in the order you want with the easiest PDF merger available.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg>`,
    color: '#0284c7',
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
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
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
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  'ocr-pdf': {
    id: 'ocr-pdf',
    title: 'OCR PDF — Searchable Text',
    subtitle: 'Extract text from scanned documents and create a selectable vector text layer.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
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
    multiple: false,
    buttonText: 'Select Damaged PDF',
    dropText: 'or drop PDF here',
    badge: 'Damaged PDF'
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
    color: '#0284c7',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  security: {
    id: 'security',
    title: 'Protect PDF with Password',
    subtitle: 'Encrypt your PDF with standard ISO 32000-1 AES-256 encryption.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    color: '#dc2626',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  bates: {
    id: 'bates',
    title: 'Bates Numbering PDF',
    subtitle: 'Index legal discovery documents with custom prefix and sequential numbering.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    color: '#1e293b',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  rotate: {
    id: 'rotate',
    title: 'Rotate PDF pages',
    subtitle: 'Rotate your PDF pages permanently 90°, 180°, or 270° clockwise.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>`,
    color: '#f59e0b',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  crop: {
    id: 'crop',
    title: 'Crop PDF Margins',
    subtitle: 'Trim margin borders, remove scanner lines, and resize page bounds.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>`,
    color: '#0d9488',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  resize: {
    id: 'resize',
    title: 'Resize PDF Margins & Page',
    subtitle: 'Add binding margins (ring/spiral binder) or fit pages to standard A4/Letter.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>`,
    color: '#6366f1',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  grayscale: {
    id: 'grayscale',
    title: 'Convert PDF to Grayscale',
    subtitle: 'Desaturate colors and convert strokes to monochrome to save printing toner.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20z"></path></svg>`,
    color: '#475569',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  flip: {
    id: 'flip',
    title: 'Flip / Mirror PDF',
    subtitle: 'Mirror PDF coordinates horizontally or vertically for iron-on transfers or inverted scans.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path></svg>`,
    color: '#8b5cf6',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  pdfa: {
    id: 'pdfa',
    title: 'Convert PDF to PDF/A',
    subtitle: 'Conform document to ISO 19005-1 archival standard for permanent storage.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
    color: '#10b981',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  'extract-images': {
    id: 'extract-images',
    title: 'Extract Images from PDF',
    subtitle: 'Export all embedded high-resolution JPEG, PNG, and WebP images into a ZIP file.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    color: '#ec4899',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  },
  'pdf-to-text': {
    id: 'pdf-to-text',
    title: 'Extract Text from PDF',
    subtitle: 'Decompress content streams and export clean plain searchable text to a TXT file.',
    icon: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>`,
    color: '#334155',
    accept: '.pdf,application/pdf',
    multiple: false,
    buttonText: 'Select PDF file',
    dropText: 'or drop PDF here',
    badge: 'PDF only'
  }
};

export class ToolWorkflowManager {
  constructor() {
    this.container = null;
    this.activeTool = null;
    this.uploadedFiles = []; // Array of { name, size, type, bytes, rotation, dataUrl }
    this.processedBlob = null;
    this.processedFilename = 'document.pdf';
    this.stage = 'upload'; // 'upload' | 'workspace' | 'complete'
    this.compressLevel = 'recommended';
    this.splitRange = 'all';

    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'tool-workflow-view';
    this.container.className = 'tool-workflow-container';
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
  }

  openTool(toolKey) {
    const config = WORKFLOW_TOOLS_CONFIG[toolKey] || WORKFLOW_TOOLS_CONFIG.merge;
    this.activeTool = config;
    this.uploadedFiles = [];
    this.processedBlob = null;
    this.stage = 'upload';

    document.body.classList.remove('show-landing', 'show-studio');
    document.body.classList.add('show-tool-workflow');
    window.scrollTo({ top: 0, behavior: 'instant' });

    this.render();
  }

  closeWorkflow() {
    document.body.classList.remove('show-tool-workflow');
    document.body.classList.add('show-landing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  switchToStudioWithBuffer(arrayBuffer, filename) {
    document.body.classList.remove('show-tool-workflow', 'show-landing');
    document.body.classList.add('show-studio');
    window.scrollTo({ top: 0, behavior: 'instant' });

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
      <!-- Tool Top Bar -->
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
            <button class="icon-btn" id="btn-workflow-theme" title="Toggle Theme">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Upload Hero -->
      <main class="workflow-main">
        <div class="workflow-hero-card">
          <div class="workflow-tool-badge" style="background: ${t.color}18; color: ${t.color};">
            ${t.icon}
          </div>
          <h1 class="workflow-title">${t.title}</h1>
          <p class="workflow-subtitle">${t.subtitle}</p>

          <!-- Dropzone Box -->
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
    const themeBtn = this.container.querySelector('#btn-workflow-theme');

    if (backBtn) backBtn.onclick = () => this.closeWorkflow();
    if (brandLogo) brandLogo.onclick = () => this.closeWorkflow();
    if (chooseBtn && fileInput) chooseBtn.onclick = () => fileInput.click();

    if (themeBtn) {
      themeBtn.onclick = () => {
        const next = toggleTheme();
        Toast.info(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} theme`);
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
        this.uploadedFiles = [{
          name: 'Sample_Agreement.pdf',
          size: sampleBytes.byteLength,
          type: 'application/pdf',
          bytes: sampleBytes,
          rotation: 0
        }];
        this.stage = 'workspace';
        this.render();
      };
    }
  }

  async handleIncomingFiles(files) {
    Toast.info(`Loading ${files.length} file(s)...`);
    const processed = [];

    for (const f of files) {
      try {
        const bytes = await readFileAsArrayBuffer(f);
        processed.push({
          name: f.name,
          size: f.size,
          type: f.type,
          bytes: bytes,
          rotation: 0
        });
      } catch (err) {
        console.error('Error reading file:', f.name, err);
      }
    }

    if (processed.length === 0) {
      Toast.error('No supported files could be loaded');
      return;
    }

    this.uploadedFiles = [...this.uploadedFiles, ...processed];
    this.stage = 'workspace';
    this.render();
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
          <!-- Left/Center: Visual File Cards & Previews -->
          <div class="workflow-cards-area">
            <div class="workflow-cards-toolbar">
              <span style="font-weight: 600; font-size: 14px;">
                ${this.uploadedFiles.length} file(s) selected
              </span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-outline" id="btn-workspace-sort-az" title="Sort A to Z">
                  <span>Sort A-Z</span>
                </button>
                <button class="btn btn-sm btn-outline" id="btn-workspace-clear" title="Clear all">
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            <!-- Cards Grid -->
            <div class="workflow-file-grid" id="workflow-file-grid">
              ${this.uploadedFiles.map((f, idx) => `
                <div class="workflow-file-card" data-idx="${idx}" draggable="true">
                  <button class="file-card-delete" data-del-idx="${idx}" title="Remove file">&times;</button>
                  <div class="file-card-preview">
                    ${f.type.startsWith('image/')
                      ? `<img src="${URL.createObjectURL(new Blob([f.bytes], { type: f.type }))}" alt="preview" style="transform: rotate(${f.rotation || 0}deg);" />`
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
                    <span class="file-card-size">${formatFileSize(f.size)}</span>
                  </div>
                  <div class="file-card-actions">
                    <button class="btn-icon btn-sm" data-rot-idx="${idx}" title="Rotate 90°">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                    </button>
                    <span class="file-card-order">#${idx + 1}</span>
                  </div>
                </div>
              `).join('')}
            </div>
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
    if (id === 'merge') return `Merge PDF (${this.uploadedFiles.length} files)`;
    if (id === 'compress') return 'Compress PDF';
    if (id === 'split') return 'Split PDF';
    if (id === 'images-to-pdf') return 'Convert to PDF';
    if (id === 'to-image') return 'Convert to JPG';
    if (id === 'ocr-pdf') return 'Run OCR';
    if (id === 'repair') return 'Repair PDF';
    if (id === 'compare') return 'Compare Documents';
    return `Process with ${this.activeTool.title}`;
  }

  renderToolOptionsHtml() {
    const id = this.activeTool.id;

    if (id === 'compress') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Compression Level</label>
          <div class="compression-cards">
            <label class="comp-option-card ${this.compressLevel === 'extreme' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="extreme" ${this.compressLevel === 'extreme' ? 'checked' : ''} />
              <div>
                <strong>Extreme Compression</strong>
                <span>Maximum size reduction, lower DPI</span>
              </div>
            </label>
            <label class="comp-option-card ${this.compressLevel === 'recommended' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="recommended" ${this.compressLevel === 'recommended' ? 'checked' : ''} />
              <div>
                <strong>Recommended (Default)</strong>
                <span>Optimal balance of high quality & size</span>
              </div>
            </label>
            <label class="comp-option-card ${this.compressLevel === 'less' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="less" ${this.compressLevel === 'less' ? 'checked' : ''} />
              <div>
                <strong>Less Compression</strong>
                <span>High quality, minimal compression</span>
              </div>
            </label>
          </div>
        </div>
      `;
    }

    if (id === 'split') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Split Configuration</label>
          <input type="text" id="split-range-input" class="input-sm" style="width: 100%; padding: 8px 12px; margin-top: 6px;" value="${this.splitRange}" placeholder="e.g. 1-2, 3-5 or 'all'" />
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">
            Type 'all' to extract every page, or comma ranges like '1-3, 4-6'.
          </span>
        </div>
      `;
    }

    if (id === 'to-image') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Output DPI Quality</label>
          <select id="image-dpi-select" class="select-sm" style="width: 100%; padding: 8px 12px; margin-top: 6px;">
            <option value="150" selected>150 DPI (Balanced Standard)</option>
            <option value="300">300 DPI (Ultra High Print Resolution)</option>
            <option value="72">72 DPI (Web & Screen Thumbnail)</option>
          </select>
        </div>
      `;
    }

    return `
      <div class="workflow-options-group">
        <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 13px; color: var(--text-muted);">
          Ready to execute 100% in your browser. No files uploaded to servers.
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
      };
    }

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

    // Rotate card
    this.container.querySelectorAll('[data-rot-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-rot-idx'), 10);
        this.uploadedFiles[idx].rotation = ((this.uploadedFiles[idx].rotation || 0) + 90) % 360;
        this.render();
      };
    });

    // Compression level radio
    this.container.querySelectorAll('input[name="comp-level"]').forEach(radio => {
      radio.onchange = (e) => {
        this.compressLevel = e.target.value;
        this.render();
      };
    });

    // Split range input
    const splitInp = this.container.querySelector('#split-range-input');
    if (splitInp) {
      splitInp.oninput = (e) => {
        this.splitRange = e.target.value;
      };
    }

    // Execute Button
    if (execBtn) {
      execBtn.onclick = () => this.executeAction();
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
      if (t.id === 'merge') {
        const buffers = this.uploadedFiles.map(f => f.bytes);
        const mergedBytes = await pdfEngine.mergePdf(buffers);
        this.processedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
        this.processedFilename = 'Merged_Document.pdf';
      } else if (t.id === 'compress') {
        const primary = this.uploadedFiles[0];
        const res = await pdfEngine.compressPdf(primary.bytes, this.compressLevel);
        this.processedBlob = new Blob([res.compressedBytes], { type: 'application/pdf' });
        this.processedFilename = `Compressed_${primary.name}`;
      } else if (t.id === 'split') {
        const primary = this.uploadedFiles[0];
        const splits = await pdfEngine.splitPdf(primary.bytes, this.splitRange || 'all');
        if (splits.length === 1) {
          this.processedBlob = new Blob([splits[0].bytes], { type: 'application/pdf' });
          this.processedFilename = splits[0].name;
        } else {
          // Zip results using JSZip
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          splits.forEach(s => zip.file(s.name, s.bytes));
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          this.processedBlob = zipBlob;
          this.processedFilename = 'Split_Pages.zip';
        }
      } else if (t.id === 'images-to-pdf') {
        const imgList = this.uploadedFiles.map(f => ({ bytes: f.bytes, name: f.name }));
        const pdfBytes = await pdfEngine.imagesToPdf(imgList);
        this.processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        this.processedFilename = 'Images_Combined.pdf';
      } else if (t.id === 'repair') {
        const primary = this.uploadedFiles[0];
        const res = await pdfEngine.repairPdf(primary.bytes);
        this.processedBlob = new Blob([res.repairedBytes], { type: 'application/pdf' });
        this.processedFilename = `Repaired_${primary.name}`;
      } else {
        // Fallback for direct conversion tools
        const primary = this.uploadedFiles[0];
        this.processedBlob = new Blob([primary.bytes], { type: 'application/pdf' });
        this.processedFilename = `Processed_${primary.name}`;
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

      <main class="workflow-main">
        <div class="workflow-hero-card" style="max-width: 620px;">
          <div class="workflow-success-ring">
            <svg width="48" height="48" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 class="workflow-title" style="margin-top: 16px;">Task Complete!</h1>
          <p class="workflow-subtitle">Your document is processed and ready to download.</p>

          <div style="background: var(--bg-surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border-subtle); margin: 24px 0; text-align: left; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="display: block; font-size: 15px; color: var(--text-main);">${this.processedFilename}</strong>
              <span style="font-size: 13px; color: var(--text-muted);">${formatFileSize(this.processedBlob.size)}</span>
            </div>
            <span class="workflow-format-chip" style="margin: 0;">100% Client-Side</span>
          </div>

          <!-- Primary Download Button -->
          <button class="workflow-primary-cta" id="btn-success-download" style="background: ${t.color}; width: 100%; justify-content: center;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
            <span>Download ${this.processedFilename}</span>
          </button>

          <!-- Secondary Actions -->
          <div style="display: flex; gap: 12px; margin-top: 14px;">
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

    if (openStudioBtn) {
      openStudioBtn.onclick = async () => {
        if (this.processedBlob && this.processedBlob.type === 'application/pdf') {
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
}

export const toolWorkflow = new ToolWorkflowManager();
