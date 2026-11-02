/**
 * N-Up Imposition Modal Component
 * Combines 2 or 4 pages per sheet onto an A4 document.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob } from '../utils/helpers.js';

export class NUpModal {
  constructor() {
    this.modal = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'nup-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line></svg>
            <h3 style="margin:0;">N-Up Imposition (Pages per Sheet)</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Print multiple pages per single sheet of paper to save toner and paper.
          </p>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            <button class="btn btn-outline nup-option active" data-nup="2" style="padding:14px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;">
              <div style="width:40px; height:28px; border:2px dashed var(--accent-primary); border-radius:3px; display:flex;">
                <div style="flex:1; border-right:1px dashed var(--accent-primary);"></div>
                <div style="flex:1;"></div>
              </div>
              <strong style="font-size:13px;">2-Up per Sheet</strong>
              <span style="font-size:11px; color:var(--text-muted);">Side-by-side (Landscape)</span>
            </button>

            <button class="btn btn-outline nup-option" data-nup="4" style="padding:14px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;">
              <div style="width:30px; height:40px; border:2px dashed var(--text-muted); border-radius:3px; display:grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;">
                <div style="border-right:1px dashed var(--border-color); border-bottom:1px dashed var(--border-color);"></div>
                <div style="border-bottom:1px dashed var(--border-color);"></div>
                <div style="border-right:1px dashed var(--border-color);"></div>
                <div></div>
              </div>
              <strong style="font-size:13px;">4-Up per Sheet</strong>
              <span style="font-size:11px; color:var(--text-muted);">2x2 Grid (Portrait)</span>
            </button>
          </div>

          <div style="background:var(--bg-secondary); border-radius:6px; padding:12px; font-size:12px; color:var(--text-muted);">
            <div>Active Pages: <strong id="nup-page-count" style="color:var(--text-main);">0</strong></div>
            <div id="nup-sheet-summary" style="margin-top:4px;">Will generate 0 sheets.</div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-cancel-nup">Cancel</button>
          <button class="btn btn-primary" id="btn-generate-nup">Generate N-Up PDF</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-nup');
    const generateBtn = this.modal.querySelector('#btn-generate-nup');
    const options = this.modal.querySelectorAll('.nup-option');
    let selectedNUp = 2;

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
        selectedNUp = parseInt(opt.dataset.nup, 10);
        this.updateSummary(selectedNUp);
      });
    });

    generateBtn.addEventListener('click', async () => {
      try {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        const nupBytes = await pdfEngine.nUpPdf(selectedNUp);
        const state = store.getState();
        const baseName = (state.filename || 'document').replace('.pdf', '');
        const filename = `${baseName}_${selectedNUp}up.pdf`;

        const blob = new Blob([nupBytes], { type: 'application/pdf' });
        downloadBlob(blob, filename);

        Toast.success(`Successfully exported ${selectedNUp}-Up PDF!`);
        hide();
      } catch (err) {
        console.error('N-Up error:', err);
        Toast.error('Failed to generate N-Up PDF: ' + err.message);
      } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate N-Up PDF';
      }
    });
  }

  updateSummary(nup = 2) {
    const pages = store.getState().pageCount || 1;
    const sheets = Math.ceil(pages / nup);
    this.modal.querySelector('#nup-page-count').textContent = pages.toString();
    this.modal.querySelector('#nup-sheet-summary').textContent = `Will generate ${sheets} sheet${sheets > 1 ? 's' : ''} (${pages} pages).`;
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    this.updateSummary(2);
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const nUpModal = new NUpModal();
