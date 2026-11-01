/**
 * PDF to Image Modal Component
 * Converts PDF pages into high-resolution PNG or JPEG images at 72, 150, or 300 DPI.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob } from '../utils/helpers.js';

export class PdfToImageModal {
  constructor() {
    this.modal = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'pdf-to-image-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <h3 style="margin:0;">PDF to JPG / PNG Image Export</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Render document pages as raster images for presentations, web graphics, or archiving.
          </p>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Format</label>
              <select id="img-export-format" class="form-input">
                <option value="image/png" selected>PNG (Lossless Quality)</option>
                <option value="image/jpeg">JPG (Standard Quality)</option>
              </select>
            </div>

            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Resolution / DPI</label>
              <select id="img-export-dpi" class="form-input">
                <option value="1.0">72 DPI (Web Screen)</option>
                <option value="2.0" selected>150 DPI (Standard Office)</option>
                <option value="4.16">300 DPI (High-Res Print)</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Pages to Export</label>
            <select id="img-export-scope" class="form-input">
              <option value="all" selected>All Pages</option>
              <option value="current">Current Page Only</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-cancel-img-export">Cancel</button>
          <button class="btn btn-primary" id="btn-execute-img-export">Convert & Download Images</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-img-export');
    const executeBtn = this.modal.querySelector('#btn-execute-img-export');

    const hide = () => this.hide();
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) hide();
    });

    executeBtn.addEventListener('click', async () => {
      try {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Rendering...';

        const format = this.modal.querySelector('#img-export-format').value;
        const dpiScale = parseFloat(this.modal.querySelector('#img-export-dpi').value) || 2.0;
        const scope = this.modal.querySelector('#img-export-scope').value;

        const state = store.getState();
        const ext = format === 'image/jpeg' ? 'jpg' : 'png';
        const baseName = (state.filename || 'document').replace('.pdf', '');

        const curPage = state.currentPage || 1;
        const targetPages = scope === 'current'
          ? [curPage]
          : Array.from({ length: state.pageCount }, (_, i) => i + 1);

        for (const p of targetPages) {
          const blob = await pdfEngine.renderPageToImageBlob(p, dpiScale, format);
          if (blob) {
            downloadBlob(blob, `${baseName}_page_${p}.${ext}`);
          }
        }

        Toast.success(`Exported ${targetPages.length} page image${targetPages.length > 1 ? 's' : ''}!`);
        hide();
      } catch (err) {
        console.error('Image export error:', err);
        Toast.error('Failed to export images: ' + err.message);
      } finally {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Convert & Download Images';
      }
    });
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const pdfToImageModal = new PdfToImageModal();
