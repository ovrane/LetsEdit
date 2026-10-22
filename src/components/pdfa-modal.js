/**
 * PDF to PDF/A Modal Component
 * Converts PDF documents to ISO 19005-1 compliant PDF/A-1b archival format
 * with standard DeviceRGB OutputIntents, sanitized metadata, and uncompressed object streams.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';

export class PdfaModal {
  constructor() {
    this.modal = null;
    this.targetBytes = null;
    this.fileName = 'document.pdf';
    this.pdfaBytes = null;
    this.isConverting = false;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'pdfa-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 580px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(16,185,129,0.12); color:#10b981; display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" style="margin:0; font-size:18px;">Convert PDF to PDF/A</h2>
              <p class="modal-subtitle" style="margin:0; font-size:12px; color:var(--text-muted);">ISO 19005-1 Long-Term Archival Standard for legal & compliance</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-pdfa">&times;</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          <!-- Dropzone -->
          <div id="pdfa-dropzone" style="border:2px dashed var(--border-subtle); border-radius:12px; padding:20px 16px; text-align:center; background:var(--bg-secondary); margin-bottom:16px; cursor:pointer;">
            <input type="file" id="input-pdfa-pdf" accept="application/pdf" style="display:none;" />
            <div id="pdfa-file-label" style="font-weight:600; font-size:14px; color:var(--text-main); margin-bottom:4px;">Current Loaded Document</div>
            <div style="font-size:12px; color:var(--text-muted);">Click to change PDF or drag a file here</div>
          </div>

          <!-- Conformance Information -->
          <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:10px; padding:14px 16px; margin-bottom:20px;">
            <div style="font-size:13px; font-weight:700; color:var(--text-main); margin-bottom:8px;">ISO 19005-1 Features Enforced:</div>
            <ul style="margin:0; padding-left:18px; font-size:12px; color:var(--text-muted); line-height:1.6;">
              <li>PDF/A-1b compliance dictionary & XMP schema embedding</li>
              <li>Standardized sRGB IEC61966-2.1 OutputIntent registry</li>
              <li>Uncompressed object streams for universal reader longevity</li>
              <li>100% Client-Side conversion — zero cloud uploads</li>
            </ul>
          </div>

          <!-- Loading State -->
          <div id="pdfa-loading-state" style="display:none; text-align:center; padding:24px 16px;">
            <div class="spinner" style="width:36px; height:36px; border:3px solid var(--border-subtle); border-top-color:#10b981; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px;"></div>
            <p style="font-size:14px; color:var(--text-muted); margin:0;">Synthesizing OutputIntents and compiling PDF/A archive...</p>
          </div>

          <!-- Actions -->
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-outline" id="btn-cancel-pdfa">Cancel</button>
            <button class="btn btn-primary" id="btn-run-pdfa" style="background:#10b981; border-color:#10b981;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Convert to PDF/A</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('#btn-close-pdfa').addEventListener('click', () => this.hide());
    this.modal.querySelector('#btn-cancel-pdfa').addEventListener('click', () => this.hide());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    const dropzone = this.modal.querySelector('#pdfa-dropzone');
    const input = this.modal.querySelector('#input-pdfa-pdf');
    const btnRun = this.modal.querySelector('#btn-run-pdfa');

    dropzone.addEventListener('click', () => input.click());

    input.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        this.fileName = file.name;
        this.targetBytes = await readFileAsArrayBuffer(file);
        this.modal.querySelector('#pdfa-file-label').textContent = file.name;
        btnRun.disabled = false;
      }
    });

    btnRun.addEventListener('click', () => this.runConvert());
  }

  show() {
    if (!this.modal) return;
    this.modal.style.display = 'flex';

    if (pdfEngine.rawBytes) {
      this.targetBytes = pdfEngine.rawBytes;
      this.fileName = store.getState().metadata?.title || 'document.pdf';
      this.modal.querySelector('#pdfa-file-label').textContent = this.fileName;
      this.modal.querySelector('#btn-run-pdfa').disabled = false;
    }
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }

  async runConvert() {
    if (!this.targetBytes || this.isConverting) return;

    this.isConverting = true;
    const loading = this.modal.querySelector('#pdfa-loading-state');
    const btnRun = this.modal.querySelector('#btn-run-pdfa');

    loading.style.display = 'block';
    btnRun.disabled = true;

    try {
      this.pdfaBytes = await pdfEngine.convertToPdfA(this.targetBytes);
      const blob = new Blob([this.pdfaBytes], { type: 'application/pdf' });
      const cleanName = this.fileName.replace(/\.pdf$/i, '') + '-PDFA.pdf';
      downloadBlob(blob, cleanName);
      Toast.show('Converted & downloaded ISO 19005-1 PDF/A document!', 'success');
      this.hide();
    } catch (err) {
      console.error('PDF/A conversion failed:', err);
      Toast.show('Conversion failed: ' + err.message, 'error');
    } finally {
      this.isConverting = false;
      loading.style.display = 'none';
      btnRun.disabled = false;
    }
  }
}

export const pdfaModal = new PdfaModal();
