/**
 * Split PDF Modal Component
 * Subdivides multi-page documents by page ranges or into individual pages.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob } from '../utils/helpers.js';

export class SplitModal {
  constructor() {
    this.modal = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'split-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <h3 style="margin:0;">Split & Extract Pages</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Separate pages into multiple documents by range or extract every page into its own file.
          </p>

          <div style="display:flex; gap:8px; margin-bottom:16px;">
            <button class="btn btn-sm btn-primary split-tab active" data-mode="range" style="flex:1;">By Page Ranges</button>
            <button class="btn btn-sm btn-outline split-tab" data-mode="all" style="flex:1;">Extract Every Page</button>
          </div>

          <!-- Range Input Section -->
          <div id="split-range-section">
            <div class="form-group" style="margin-bottom:12px;">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Page Ranges (e.g. 1-2, 3-4 or 1, 3)</label>
              <input type="text" id="split-ranges-input" class="form-input" placeholder="e.g. 1-2, 3" value="1-1, 2-2" />
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;">
              <button class="btn btn-sm btn-outline range-preset" data-range="1-1">Page 1</button>
              <button class="btn btn-sm btn-outline range-preset" data-range="1-2">Pages 1-2</button>
              <button class="btn btn-sm btn-outline range-preset" data-range="odd">Odd Pages</button>
              <button class="btn btn-sm btn-outline range-preset" data-range="even">Even Pages</button>
            </div>
          </div>

          <div style="background:var(--bg-secondary); border-radius:6px; padding:12px; font-size:12px; color:var(--text-muted); margin-bottom:16px;">
            <div>Total Pages in Document: <strong id="split-total-pages" style="color:var(--text-main);">0</strong></div>
            <div id="split-output-info" style="margin-top:4px;">Will generate individual PDF files ready for download.</div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-cancel-split">Cancel</button>
          <button class="btn btn-primary" id="btn-execute-split">Split & Download</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-split');
    const executeBtn = this.modal.querySelector('#btn-execute-split');
    const tabs = this.modal.querySelectorAll('.split-tab');
    const rangeInput = this.modal.querySelector('#split-ranges-input');
    const rangeSection = this.modal.querySelector('#split-range-section');
    let currentMode = 'range';

    const hide = () => this.hide();
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) hide();
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('btn-primary', 'active');
          t.classList.add('btn-outline');
        });
        tab.classList.add('btn-primary', 'active');
        tab.classList.remove('btn-outline');
        currentMode = tab.dataset.mode;

        if (currentMode === 'all') {
          rangeSection.style.display = 'none';
          this.modal.querySelector('#split-output-info').textContent = 'Every page will be extracted into a separate PDF file.';
        } else {
          rangeSection.style.display = 'block';
          this.modal.querySelector('#split-output-info').textContent = 'Pages will be grouped according to the comma-separated ranges.';
        }
      });
    });

    this.modal.querySelectorAll('.range-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const type = preset.dataset.range;
        const total = store.getState().pageCount || 2;
        if (type === 'odd') {
          const odds = [];
          for (let p = 1; p <= total; p += 2) odds.push(p);
          rangeInput.value = odds.join(', ');
        } else if (type === 'even') {
          const evens = [];
          for (let p = 2; p <= total; p += 2) evens.push(p);
          rangeInput.value = evens.join(', ');
        } else {
          rangeInput.value = type;
        }
      });
    });

    executeBtn.addEventListener('click', async () => {
      try {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Processing...';

        const expression = currentMode === 'all' ? 'all' : rangeInput.value.trim();
        const splits = await pdfEngine.splitPdf(expression);

        if (splits.length === 0) {
          Toast.error('No valid pages matched the specified range');
          return;
        }

        // Trigger download for each generated slice
        for (const s of splits) {
          const blob = new Blob([s.bytes], { type: 'application/pdf' });
          downloadBlob(blob, s.name);
        }

        Toast.success(`Successfully split into ${splits.length} PDF file${splits.length > 1 ? 's' : ''}!`);
        hide();
      } catch (err) {
        console.error('Split error:', err);
        Toast.error('Failed to split document: ' + err.message);
      } finally {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Split & Download';
      }
    });
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    const state = store.getState();
    const totalPages = state.pageCount || 1;
    this.modal.querySelector('#split-total-pages').textContent = totalPages.toString();

    if (totalPages > 1) {
      this.modal.querySelector('#split-ranges-input').value = `1-${Math.ceil(totalPages / 2)}, ${Math.ceil(totalPages / 2) + 1}-${totalPages}`;
    } else {
      this.modal.querySelector('#split-ranges-input').value = '1';
    }

    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const splitModal = new SplitModal();
