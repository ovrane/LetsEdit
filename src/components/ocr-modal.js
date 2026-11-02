/**
 * Client-Side OCR Modal Component
 * Turns scanned paper PDFs and photos into 100% searchable, selectable PDF documents
 * by recognizing text with Tesseract WASM and injecting an invisible vector text layer.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';

export class OcrModal {
  constructor() {
    this.modal = null;
    this.ocrResult = null;
    this.isProcessing = false;
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'ocr-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog modal-lg" style="max-width: 680px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(48,5,13,0.08); color:#30050d; display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 7V4h16v3M9 20h6M12 4v16"></path>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" style="margin:0; font-size:18px;">OCR Searchable PDF</h2>
              <p class="modal-subtitle" style="margin:0; font-size:12px; color:var(--text-muted);">Make scanned documents searchable & selectable with client-side OCR</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-ocr">&times;</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          <!-- Options Form -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:var(--text-main); margin-bottom:6px;">OCR Language</label>
              <select id="ocr-language-select" class="form-input" style="width:100%; padding:8px 12px; font-size:13px; border-radius:8px; border:1px solid var(--border-subtle); background:var(--bg-surface); color:var(--text-main);">
                <option value="eng" selected>English (eng)</option>
                <option value="spa">Spanish (Español)</option>
                <option value="fra">French (Français)</option>
                <option value="deu">German (Deutsch)</option>
                <option value="ita">Italian (Italiano)</option>
                <option value="por">Portuguese (Português)</option>
                <option value="chi_sim">Chinese Simplified (中文)</option>
                <option value="jpn">Japanese (日本語)</option>
                <option value="rus">Russian (Русский)</option>
                <option value="ara">Arabic (العربية)</option>
              </select>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:var(--text-main); margin-bottom:6px;">Page Range</label>
              <select id="ocr-range-select" class="form-input" style="width:100%; padding:8px 12px; font-size:13px; border-radius:8px; border:1px solid var(--border-subtle); background:var(--bg-surface); color:var(--text-main);">
                <option value="all" selected>All Document Pages</option>
                <option value="current">Current Page Only</option>
                <option value="custom">Custom Range (e.g. 1-2)</option>
              </select>
            </div>
          </div>

          <div id="ocr-custom-range-wrap" style="display:none; margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; color:var(--text-main); margin-bottom:4px;">Custom Page Range</label>
            <input type="text" id="ocr-custom-range-input" class="form-input" placeholder="e.g. 1-3, 5" style="width:100%; padding:8px 12px; font-size:13px; border-radius:8px; border:1px solid var(--border-subtle); background:var(--bg-surface); color:var(--text-main);" />
          </div>

          <!-- Progress Section -->
          <div id="ocr-progress-box" style="display:none; background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:12px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span id="ocr-progress-label" style="font-size:12.5px; font-weight:600; color:var(--text-main);">Initializing WebAssembly OCR...</span>
              <span id="ocr-progress-percent" style="font-size:12px; font-weight:700; color:var(--primary);">0%</span>
            </div>
            <div style="width:100%; height:8px; background:var(--border-subtle); border-radius:4px; overflow:hidden;">
              <div id="ocr-progress-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #30050d, #5e0b1a); transition:width 0.2s ease;"></div>
            </div>
          </div>

          <!-- Preview & Results Container -->
          <div id="ocr-results-box" style="display:none; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:12px; font-weight:600; color:var(--text-main);">Recognized Text Transcript:</span>
              <span id="ocr-stats-badge" style="font-size:11px; font-weight:600; color:var(--text-muted); background:var(--bg-secondary); padding:2px 8px; border-radius:4px;">0 words recognized</span>
            </div>
            <textarea id="ocr-transcript-area" readonly style="width:100%; height:140px; font-family:monospace; font-size:11.5px; padding:10px; border-radius:8px; border:1px solid var(--border-subtle); background:var(--bg-secondary); color:var(--text-main); resize:vertical; outline:none;"></textarea>
          </div>

          <div style="background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.18); border-radius:10px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start;">
            <svg width="18" height="18" fill="none" stroke="#30050d" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:1px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <p style="font-size:11.5px; color:var(--text-muted); line-height:1.5; margin:0;">
              <strong>100% In-Browser Privacy:</strong> OCR recognition runs locally inside your browser via WebAssembly. Your documents are never transmitted to any external server.
            </p>
          </div>
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-outline" id="btn-cancel-ocr">Cancel</button>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" id="btn-copy-ocr-text" style="display:none;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Text</span>
            </button>
            <button class="btn btn-outline" id="btn-download-ocr-txt" style="display:none;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download .txt</span>
            </button>
            <button class="btn btn-primary" id="btn-run-ocr">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"></path></svg>
              <span>Start OCR Recognition</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('#btn-close-ocr');
    const cancelBtn = this.modal.querySelector('#btn-cancel-ocr');
    const runBtn = this.modal.querySelector('#btn-run-ocr');
    const rangeSelect = this.modal.querySelector('#ocr-range-select');
    const customWrap = this.modal.querySelector('#ocr-custom-range-wrap');
    const copyBtn = this.modal.querySelector('#btn-copy-ocr-text');
    const txtBtn = this.modal.querySelector('#btn-download-ocr-txt');

    const closeHandler = () => this.close();
    closeBtn.onclick = closeHandler;
    cancelBtn.onclick = closeHandler;

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    rangeSelect.onchange = () => {
      customWrap.style.display = rangeSelect.value === 'custom' ? 'block' : 'none';
    };

    runBtn.onclick = () => this.executeOcr();

    copyBtn.onclick = () => {
      const text = this.modal.querySelector('#ocr-transcript-area').value;
      if (text) {
        navigator.clipboard.writeText(text);
        Toast.success('Extracted text copied to clipboard!');
      }
    };

    txtBtn.onclick = () => {
      const text = this.modal.querySelector('#ocr-transcript-area').value;
      if (text) {
        const state = store.getState();
        const filename = (state.documentTitle || 'document').replace(/\.pdf$/i, '') + '_ocr.txt';
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, filename);
        Toast.success('Downloaded transcript .txt file!');
      }
    };
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    const state = store.getState();
    if (!state.pdfBytes && !pdfEngine.rawBytes) {
      Toast.warning('Please open a PDF document first');
      return;
    }
    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
  }

  async ensureTesseractLoaded() {
    if (typeof window !== 'undefined' && window.Tesseract) return true;
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = resolve;
        script.onerror = () => {
          // If CDN fails (e.g. offline), continue with built-in layout OCR
          resolve();
        };
        document.head.appendChild(script);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async executeOcr() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const runBtn = this.modal.querySelector('#btn-run-ocr');
    const progressBox = this.modal.querySelector('#ocr-progress-box');
    const progressBar = this.modal.querySelector('#ocr-progress-bar');
    const progressLabel = this.modal.querySelector('#ocr-progress-label');
    const progressPercent = this.modal.querySelector('#ocr-progress-percent');
    const resultsBox = this.modal.querySelector('#ocr-results-box');
    const transcriptArea = this.modal.querySelector('#ocr-transcript-area');
    const statsBadge = this.modal.querySelector('#ocr-stats-badge');
    const copyBtn = this.modal.querySelector('#btn-copy-ocr-text');
    const txtBtn = this.modal.querySelector('#btn-download-ocr-txt');

    runBtn.disabled = true;
    progressBox.style.display = 'block';
    resultsBox.style.display = 'none';
    progressBar.style.width = '5%';
    progressPercent.textContent = '5%';
    progressLabel.textContent = 'Preparing OCR engine...';

    await this.ensureTesseractLoaded();

    const lang = this.modal.querySelector('#ocr-language-select').value || 'eng';
    const rangeType = this.modal.querySelector('#ocr-range-select').value;
    let pageRange = 'all';

    const state = store.getState();
    if (rangeType === 'current') {
      pageRange = [state.currentPage || 1];
    } else if (rangeType === 'custom') {
      pageRange = this.modal.querySelector('#ocr-custom-range-input').value.trim() || 'all';
    }

    try {
      const ocrResult = await pdfEngine.applyOcr(state.pdfBytes || pdfEngine.rawBytes, {
        language: lang,
        pageRange,
        onProgress: (p) => {
          progressBar.style.width = `${p.progress}%`;
          progressPercent.textContent = `${p.progress}%`;
          progressLabel.textContent = `Recognizing text on Page ${p.page} of ${p.totalPages}...`;
        }
      });

      this.ocrResult = ocrResult;
      progressBar.style.width = '100%';
      progressPercent.textContent = '100%';
      progressLabel.textContent = 'Searchable PDF ready!';

      // Show results
      resultsBox.style.display = 'block';
      transcriptArea.value = ocrResult.fullText;
      const totalWords = ocrResult.pagesOcr.reduce((acc, p) => acc + p.wordCount, 0);
      statsBadge.textContent = `${totalWords} words recognized across ${ocrResult.pagesOcr.length} page(s)`;

      copyBtn.style.display = 'inline-flex';
      txtBtn.style.display = 'inline-flex';

      // Update button to download searchable PDF
      runBtn.disabled = false;
      runBtn.innerHTML = `
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Download Searchable PDF</span>
      `;
      runBtn.onclick = () => {
        const docName = (state.documentTitle || 'document').replace(/\.pdf$/i, '');
        const blob = new Blob([ocrResult.pdfBytes], { type: 'application/pdf' });
        downloadBlob(blob, `${docName}_searchable.pdf`);
        Toast.success('Downloaded searchable PDF with text layer!');
      };

      Toast.success(`OCR complete: ${totalWords} words recognized!`);
    } catch (err) {
      progressBox.style.display = 'none';
      runBtn.disabled = false;
      Toast.error('OCR processing error: ' + err.message);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const ocrModal = new OcrModal();
