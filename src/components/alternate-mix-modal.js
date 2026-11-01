/**
 * Alternate & Mix PDF Modal Component
 * Interleaves odd/even pages from duplex scanner feeds into a unified document.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';

export class AlternateMixModal {
  constructor() {
    this.modal = null;
    this.secondDocBytes = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'alternate-mix-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path></svg>
            <h3 style="margin:0;">Alternate & Mix PDF (Duplex Scanner)</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Perfect for duplex scanner scans: interleave odd pages from Document A with even pages from Document B.
          </p>

          <div style="background:var(--bg-secondary); border-radius:6px; padding:12px; margin-bottom:14px; font-size:12px;">
            <div>Document A (Odd Pages): <strong id="mix-doc-a-name" style="color:var(--text-main);">Active Document</strong></div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px;">Select Document B (Even Pages)</label>
            <input type="file" id="mix-doc-b-file" accept="application/pdf" class="form-input" />
            <div id="mix-doc-b-info" style="font-size:11px; color:var(--text-muted); margin-top:4px;">No second file chosen yet.</div>
          </div>

          <div class="form-group" style="padding-top:10px; border-top:1px solid var(--border-color); margin-bottom:16px;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-weight:500;">
              <input type="checkbox" id="mix-reverse-b" checked style="accent-color:var(--accent-primary);" />
              <span>Reverse Document B pages (common for back-side sheet scanner stacks)</span>
            </label>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-cancel-mix">Cancel</button>
          <button class="btn btn-primary" id="btn-execute-mix" disabled>Mix & Interleave</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-mix');
    const executeBtn = this.modal.querySelector('#btn-execute-mix');
    const fileInput = this.modal.querySelector('#mix-doc-b-file');
    const docBInfo = this.modal.querySelector('#mix-doc-b-info');

    const hide = () => this.hide();
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) hide();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        this.secondDocBytes = null;
        executeBtn.disabled = true;
        docBInfo.textContent = 'No second file chosen.';
        return;
      }

      try {
        docBInfo.textContent = `Reading ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`;
        this.secondDocBytes = await readFileAsArrayBuffer(file);
        docBInfo.textContent = `Loaded ${file.name} successfully!`;
        executeBtn.disabled = false;
      } catch (err) {
        docBInfo.textContent = 'Failed to read file: ' + err.message;
        executeBtn.disabled = true;
      }
    });

    executeBtn.addEventListener('click', async () => {
      if (!this.secondDocBytes) {
        Toast.warning('Please select a second PDF file first');
        return;
      }

      try {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Mixing...';

        const state = store.getState();
        const docABytes = state.pdfBytes;
        if (!docABytes) throw new Error('No active PDF loaded in editor');

        const reverseB = this.modal.querySelector('#mix-reverse-b').checked;
        const mixedBytes = await pdfEngine.alternateMix(docABytes, this.secondDocBytes, { reverseB });

        const baseName = (state.filename || 'document').replace('.pdf', '');
        const filename = `${baseName}_interleaved.pdf`;
        const blob = new Blob([mixedBytes], { type: 'application/pdf' });
        downloadBlob(blob, filename);

        Toast.success('Documents successfully interleaved and downloaded!');
        hide();
      } catch (err) {
        console.error('Alternate mix error:', err);
        Toast.error('Failed to alternate & mix PDFs: ' + err.message);
      } finally {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Mix & Interleave';
      }
    });
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    const state = store.getState();
    const docAName = this.modal.querySelector('#mix-doc-a-name');
    if (docAName) docAName.textContent = `${state.filename || 'Untitled.pdf'} (${state.pageCount} pages)`;

    this.secondDocBytes = null;
    this.modal.querySelector('#mix-doc-b-file').value = '';
    this.modal.querySelector('#mix-doc-b-info').textContent = 'No second file chosen yet.';
    this.modal.querySelector('#btn-execute-mix').disabled = true;

    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const alternateMixModal = new AlternateMixModal();
