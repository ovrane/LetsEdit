/**
 * Studio Export & Processing Workflow Modal
 * Replicates the Sejda / Smallpdf executive workflow:
 * 1. "Apply Changes" trigger
 * 2. Real-time compilation & optimization processing modal
 * 3. Executive Export / Ready Screen (Download, Save to Device via FS API, Print, Share, and Tool Chaining)
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { pwaManager } from '../core/pwa-manager.js';
import { Toast } from './toast.js';
import { downloadBlob, formatFileSize } from '../utils/helpers.js';
import { router } from '../core/router.js';

export class StudioExportModal {
  constructor() {
    this.modalEl = null;
    this.stage = 'processing'; // 'processing' | 'ready'
    this.pdfBytes = null;
    this.pdfBlob = null;
    this.filename = 'document_edited.pdf';
    this.numPages = 1;
    this.fileSizeStr = '0 KB';
    this.isProcessing = false;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'studio-export-overlay';
    this.modalEl.id = 'studio-export-overlay';
    this.modalEl.style.display = 'none';

    this.modalEl.innerHTML = `
      <div class="studio-export-dialog" role="dialog" aria-modal="true" aria-labelledby="studio-export-title">
        <div class="studio-export-header">
          <div class="studio-export-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="studio-header-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span id="studio-export-title">Document Processing</span>
          </div>
          <button class="studio-export-close-btn" id="btn-close-studio-export" aria-label="Close dialog">&times;</button>
        </div>

        <div class="studio-export-body" id="studio-export-body">
          <!-- Dynamically swapped between Processing and Ready Views -->
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    // Close on overlay backdrop click
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl && !this.isProcessing) {
        this.hide();
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.style.display === 'flex' && !this.isProcessing) {
        this.hide();
      }
    });

    const closeBtn = this.modalEl.querySelector('#btn-close-studio-export');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (!this.isProcessing) this.hide();
      };
    }
  }

  show() {
    if (!this.modalEl) this.init();
    if (this.modalEl) this.modalEl.style.display = 'flex';
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
    }
    this.isProcessing = false;
  }

  /**
   * Start the end-to-end Apply Changes -> Process -> Export workflow
   */
  async startWorkflow(state = store.getState()) {
    if (!state || (!state.pdfBytes && !pdfEngine.rawBytes)) {
      Toast.error('No document loaded to export');
      return;
    }

    this.show();
    this.isProcessing = true;
    this.stage = 'processing';
    this.renderProcessing();

    const titleEl = this.modalEl?.querySelector('#studio-export-title');
    if (titleEl) titleEl.textContent = 'Applying changes to your PDF...';

    // Step 1: Initialize progress animation
    this.updateProgress(15, 1);

    try {
      await new Promise(r => setTimeout(r, 200));
      this.updateProgress(35, 2);

      // Step 2: Compile PDF in background
      const rawName = state.filename || state.documentName || 'document';
      const cleanBase = rawName.replace(/\.pdf$/i, '').replace(/_edited$/i, '');
      this.filename = `${cleanBase}_edited.pdf`;
      this.numPages = state.pages?.length || state.numPages || 1;

      await new Promise(r => setTimeout(r, 150));
      this.updateProgress(70, 3);

      const exported = await pdfEngine.exportPdf(state);
      this.pdfBytes = exported;
      this.pdfBlob = new Blob([exported], { type: 'application/pdf' });
      this.fileSizeStr = formatFileSize(exported.byteLength);

      this.updateProgress(100, 4);
      await new Promise(r => setTimeout(r, 300));

      // Step 3: Transition to Ready / Download View
      this.isProcessing = false;
      this.stage = 'ready';
      if (titleEl) titleEl.textContent = 'Document Ready';
      this.renderReady();
      Toast.success('Changes applied and PDF compiled successfully!');
    } catch (err) {
      console.error('[StudioExport] Error compiling PDF:', err);
      this.isProcessing = false;
      this.renderError(err.message || 'Failed to compile PDF document');
      Toast.error('Export failed: ' + (err.message || 'Unknown error'));
    }
  }

  updateProgress(percentage, stepIndex) {
    if (!this.modalEl) return;
    const bar = this.modalEl.querySelector('#studio-progress-fill');
    const pctLabel = this.modalEl.querySelector('#studio-progress-pct');
    if (bar) bar.style.width = `${percentage}%`;
    if (pctLabel) pctLabel.textContent = `${percentage}%`;

    const stepItems = this.modalEl.querySelectorAll('.studio-process-step');
    stepItems.forEach((item, idx) => {
      const stepNum = idx + 1;
      const statusIcon = item.querySelector('.step-status-icon');
      if (stepNum < stepIndex) {
        item.classList.remove('active');
        item.classList.add('completed');
        if (statusIcon) statusIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else if (stepNum === stepIndex) {
        item.classList.add('active');
        item.classList.remove('completed');
        if (statusIcon) statusIcon.innerHTML = `<span class="step-spinner"></span>`;
      } else {
        item.classList.remove('active', 'completed');
        if (statusIcon) statusIcon.innerHTML = `<span class="step-dot"></span>`;
      }
    });
  }

  renderProcessing() {
    const body = this.modalEl?.querySelector('#studio-export-body');
    if (!body) return;

    body.innerHTML = `
      <div class="studio-process-view">
        <div class="studio-process-header">
          <div class="studio-process-spinner-large"></div>
          <h4>Processing your document...</h4>
          <p class="studio-process-subtitle">Compiling vector annotations, text layers, and optimizing PDF streams</p>
        </div>

        <div class="studio-progress-container">
          <div class="studio-progress-track">
            <div class="studio-progress-fill" id="studio-progress-fill" style="width: 15%;"></div>
          </div>
          <div class="studio-progress-meta">
            <span>Client-side Vector Synthesis</span>
            <span id="studio-progress-pct">15%</span>
          </div>
        </div>

        <div class="studio-process-steps-list">
          <div class="studio-process-step active" data-step="1">
            <span class="step-status-icon"><span class="step-spinner"></span></span>
            <span class="step-title">Compiling text additions, fonts & edits</span>
          </div>
          <div class="studio-process-step" data-step="2">
            <span class="step-status-icon"><span class="step-dot"></span></span>
            <span class="step-title">Embedding annotations, stamps & drawings</span>
          </div>
          <div class="studio-process-step" data-step="3">
            <span class="step-status-icon"><span class="step-dot"></span></span>
            <span class="step-title">Synthesizing AcroForms & interactive fields</span>
          </div>
          <div class="studio-process-step" data-step="4">
            <span class="step-status-icon"><span class="step-dot"></span></span>
            <span class="step-title">Finalizing binary PDF structure & compression</span>
          </div>
        </div>
      </div>
    `;
  }

  renderReady() {
    const body = this.modalEl?.querySelector('#studio-export-body');
    if (!body) return;

    body.innerHTML = `
      <div class="studio-ready-view">
        <div class="studio-ready-hero">
          <div class="studio-ready-check-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3>Your document is ready!</h3>
          <p class="studio-ready-subtitle">All edits, vector layers, and formatting have been saved.</p>
        </div>

        <!-- Document Details Card -->
        <div class="studio-doc-summary-card">
          <div class="doc-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="doc-meta-info">
            <div class="doc-filename-input-wrap">
              <input type="text" id="studio-export-filename-input" class="doc-filename-input" value="${this.filename}" spellcheck="false" title="Click to rename before downloading" />
              <svg class="doc-rename-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <div class="doc-meta-badges">
              <span class="meta-pill"><strong id="studio-ready-pages">${this.numPages}</strong> page${this.numPages === 1 ? '' : 's'}</span>
              <span class="meta-pill"><strong id="studio-ready-size">${this.fileSizeStr}</strong></span>
              <span class="meta-pill pill-success">Vector Optimized</span>
            </div>
          </div>
        </div>

        <!-- Primary Action -->
        <div class="studio-ready-cta-block">
          <button class="btn btn-primary btn-lg studio-btn-download" id="btn-studio-download">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download PDF</span>
          </button>
        </div>

        <!-- Executive Secondary Actions Row -->
        <div class="studio-ready-actions-grid">
          <button class="btn btn-outline studio-btn-action" id="btn-studio-save-fs" title="Save directly to a folder on your computer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Save to Device</span>
          </button>

          <button class="btn btn-outline studio-btn-action" id="btn-studio-print" title="Print this document immediately">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print</span>
          </button>

          <button class="btn btn-outline studio-btn-action" id="btn-studio-share" title="Share via device share sheet or copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>

          <button class="btn btn-ghost studio-btn-action" id="btn-studio-back-editor" title="Return to canvas to make further edits">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Continue Editing</span>
          </button>
        </div>

        <!-- Follow-up Quick Tools Chain -->
        <div class="studio-ready-next-tools">
          <div class="next-tools-label">Next Tools (Optional):</div>
          <div class="next-tools-chips">
            <button class="next-tool-chip" data-tool="compress" title="Compress this PDF to reduce size">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path></svg>
              <span>Compress PDF</span>
            </button>
            <button class="next-tool-chip" data-tool="protect" title="Add password encryption to this PDF">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Protect</span>
            </button>
            <button class="next-tool-chip" data-tool="to-image" title="Convert PDF pages to JPG or PNG">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span>PDF to JPG</span>
            </button>
            <button class="next-tool-chip" data-tool="merge" title="Combine this PDF with other files">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
              <span>Merge</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindReadyEvents();
  }

  bindReadyEvents() {
    if (!this.modalEl) return;
    const filenameInput = this.modalEl.querySelector('#studio-export-filename-input');
    if (filenameInput) {
      filenameInput.onchange = () => {
        let val = filenameInput.value.trim();
        if (!val) val = 'document_edited.pdf';
        if (!val.toLowerCase().endsWith('.pdf')) val += '.pdf';
        this.filename = val;
        filenameInput.value = val;
      };
      filenameInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          filenameInput.blur();
        }
      };
    }

    // 1. Direct Download
    const downloadBtn = this.modalEl.querySelector('#btn-studio-download');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        if (!this.pdfBlob) return;
        downloadBlob(this.pdfBlob, this.filename);
        Toast.success(`Downloaded ${this.filename}`);
      };
    }

    // 2. Save to Device via File System Access API
    const saveFsBtn = this.modalEl.querySelector('#btn-studio-save-fs');
    if (saveFsBtn) {
      saveFsBtn.onclick = async () => {
        if (!this.pdfBytes) return;
        try {
          const res = await pwaManager.saveLocalPdfWithFsApi(this.pdfBytes, this.filename);
          if (res && res.success) {
            Toast.success(`Saved ${res.name} to device!`);
          } else if (res && !res.aborted) {
            // Fallback to normal download
            downloadBlob(this.pdfBlob, this.filename);
            Toast.success(`Downloaded ${this.filename}`);
          }
        } catch (err) {
          console.error(err);
          downloadBlob(this.pdfBlob, this.filename);
        }
      };
    }

    // 3. Print PDF
    const printBtn = this.modalEl.querySelector('#btn-studio-print');
    if (printBtn) {
      printBtn.onclick = () => {
        if (!this.pdfBlob) return;
        this.printPdf(this.pdfBlob);
      };
    }

    // 4. Share PDF
    const shareBtn = this.modalEl.querySelector('#btn-studio-share');
    if (shareBtn) {
      shareBtn.onclick = async () => {
        if (!this.pdfBlob) return;
        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
          try {
            const file = new File([this.pdfBlob], this.filename, { type: 'application/pdf' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: this.filename,
                text: 'Here is your edited PDF document from LetsEdit.',
                files: [file]
              });
              Toast.success('Shared successfully!');
              return;
            }
          } catch (err) {
            if (err.name !== 'AbortError') console.warn('Share error:', err);
          }
        }
        // Fallback: download blob and notify
        downloadBlob(this.pdfBlob, this.filename);
        Toast.info('Downloaded document to share with your apps');
      };
    }

    // 5. Continue Editing
    const backBtn = this.modalEl.querySelector('#btn-studio-back-editor');
    if (backBtn) {
      backBtn.onclick = () => {
        this.hide();
        Toast.info('Returned to editor. All changes are preserved.');
      };
    }

    // 6. Next Tool Chips
    this.modalEl.querySelectorAll('.next-tool-chip').forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        const tool = chip.getAttribute('data-tool');
        this.hide();
        if (tool === 'compress') {
          router.navigate('/tools/compress');
        } else if (tool === 'protect') {
          router.navigate('/tools/protect');
        } else if (tool === 'to-image') {
          router.navigate('/tools/pdf-to-jpg');
        } else if (tool === 'merge') {
          router.navigate('/tools/merge');
        }
      };
    });
  }

  printPdf(blob) {
    try {
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch {
          window.open(blobUrl, '_blank');
        }
        setTimeout(() => {
          if (iframe.parentNode) document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      };
    } catch (err) {
      console.error('Print error:', err);
      Toast.error('Failed to trigger print dialog');
    }
  }

  renderError(msg) {
    const body = this.modalEl?.querySelector('#studio-export-body');
    if (!body) return;

    body.innerHTML = `
      <div class="studio-error-view" style="text-align: center; padding: 24px 16px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h4 style="margin: 0 0 8px; color: var(--text-main);">Compilation Error</h4>
        <p style="margin: 0 0 20px; font-size: 13px; color: var(--text-muted); line-height: 1.5;">${msg}</p>
        <button class="btn btn-outline" id="btn-studio-error-close">Back to Editor</button>
      </div>
    `;

    const closeBtn = body.querySelector('#btn-studio-error-close');
    if (closeBtn) closeBtn.onclick = () => this.hide();
  }
}

export const studioExportModal = new StudioExportModal();
