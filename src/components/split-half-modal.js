/**
 * Split in Half Modal Component
 * Slices 2-page book scans, magazines, or A3 spreads down the middle into individual A4 pages.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob } from '../utils/helpers.js';

export class SplitHalfModal {
  constructor() {
    this.modal = null;
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'split-half-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21" stroke-dasharray="3 3"></line></svg>
            <h3 style="margin:0;">Split in Half (Book Scan Slicer)</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Split two-page book scans or booklet spreads down the center into separate individual pages.
          </p>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            <button class="btn btn-outline half-cut-opt active" data-dir="vertical" style="padding:14px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; border-color:var(--accent-primary);">
              <div style="width:40px; height:28px; border:2px solid var(--accent-primary); border-radius:3px; display:flex; position:relative;">
                <div style="position:absolute; left:50%; top:0; bottom:0; border-left:2px dashed var(--accent-primary);"></div>
              </div>
              <strong style="font-size:13px;">Vertical Split</strong>
              <span style="font-size:11px; color:var(--text-muted);">Left & Right halves</span>
            </button>

            <button class="btn btn-outline half-cut-opt" data-dir="horizontal" style="padding:14px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;">
              <div style="width:28px; height:40px; border:2px solid var(--border-color); border-radius:3px; display:flex; position:relative;">
                <div style="position:absolute; top:50%; left:0; right:0; border-top:2px dashed var(--border-color);"></div>
              </div>
              <strong style="font-size:13px;">Horizontal Split</strong>
              <span style="font-size:11px; color:var(--text-muted);">Top & Bottom halves</span>
            </button>
          </div>

          <div style="background:var(--bg-secondary); border-radius:6px; padding:12px; font-size:12px; color:var(--text-muted);">
            <div>Source Pages: <strong id="half-source-pages" style="color:var(--text-main);">0</strong></div>
            <div id="half-output-summary" style="margin-top:4px;">Will generate 0 separate output pages.</div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-cancel-half">Cancel</button>
          <button class="btn btn-primary" id="btn-execute-half">Split in Half & Download</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-half');
    const executeBtn = this.modal.querySelector('#btn-execute-half');
    const options = this.modal.querySelectorAll('.half-cut-opt');
    let selectedDir = 'vertical';

    const hide = () => this.hide();
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) hide();
    });

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => {
          o.classList.remove('active');
          o.style.borderColor = 'var(--border-color)';
        });
        opt.classList.add('active');
        opt.style.borderColor = 'var(--accent-primary)';
        selectedDir = opt.dataset.dir;
      });
    });

    executeBtn.addEventListener('click', async () => {
      try {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Slicing...';

        const slicedBytes = await pdfEngine.splitInHalf(selectedDir);
        const state = store.getState();
        const baseName = (state.filename || 'document').replace('.pdf', '');
        const filename = `${baseName}_split_half.pdf`;

        const blob = new Blob([slicedBytes], { type: 'application/pdf' });
        downloadBlob(blob, filename);

        Toast.success('PDF successfully split in half!');
        hide();
      } catch (err) {
        console.error('Split in half error:', err);
        Toast.error('Failed to split document: ' + err.message);
      } finally {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Split in Half & Download';
      }
    });
  }

  show() {
    if (!this.modal) return;
    const pages = store.getState().pageCount || 1;
    this.modal.querySelector('#half-source-pages').textContent = pages.toString();
    this.modal.querySelector('#half-output-summary').textContent = `Will generate ${pages * 2} separate output pages.`;
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const splitHalfModal = new SplitHalfModal();
