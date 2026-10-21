/**
 * Flip PDF Modal Component
 * Mirrors PDF pages horizontally, vertically, or both per Sejda Flip PDF specifications.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob } from '../utils/helpers.js';

export class FlipModal {
  constructor() {
    this.modal = null;
    this.lastResult = null;
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'flip-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 2v20M4 12l8-8 8 8M4 12l8 8 8-8"></path>
            </svg>
            <h3 style="margin:0;">Flip / Mirror PDF</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Mirror PDF pages horizontally or vertically. Useful for iron-on transfers, backlit transparencies, or inverted book scans.
          </p>

          <!-- Flip Direction Cards -->
          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:8px;">Flip Direction</label>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
              <label class="flip-option-card" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 8px; border:2px solid var(--primary, #2563eb); border-radius:8px; cursor:pointer; background:rgba(37,99,235,0.04);">
                <input type="radio" name="flip-direction" value="horizontal" checked style="display:none;" />
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom:6px; color:var(--primary, #2563eb);">
                  <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path>
                </svg>
                <div style="font-size:12px; font-weight:600;">Horizontal</div>
                <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Left ⇄ Right</div>
              </label>

              <label class="flip-option-card" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 8px; border:1px solid var(--border-subtle, #e2e8f0); border-radius:8px; cursor:pointer; background:var(--bg-card, #ffffff);">
                <input type="radio" name="flip-direction" value="vertical" style="display:none;" />
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom:6px; color:var(--text-main, #334155);">
                  <path d="M7 8l5-5 5 5M7 16l5 5 5-5M4 12h16"></path>
                </svg>
                <div style="font-size:12px; font-weight:600;">Vertical</div>
                <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Top ↕ Bottom</div>
              </label>

              <label class="flip-option-card" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 8px; border:1px solid var(--border-subtle, #e2e8f0); border-radius:8px; cursor:pointer; background:var(--bg-card, #ffffff);">
                <input type="radio" name="flip-direction" value="both" style="display:none;" />
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom:6px; color:var(--text-main, #334155);">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                <div style="font-size:12px; font-weight:600;">Both</div>
                <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">180° Inverted</div>
              </label>
            </div>
          </div>

          <!-- Page Scope Selector -->
          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:8px;">Pages to Flip</label>
            <select id="flip-page-scope" style="width:100%; padding:8px 12px; border:1px solid var(--border-subtle, #e2e8f0); border-radius:6px; font-size:13px; background:var(--bg-card, #ffffff); color:var(--text-main, #0f172a);">
              <option value="all">All Pages in Document</option>
              <option value="odd">Odd Pages Only (1, 3, 5...)</option>
              <option value="even">Even Pages Only (2, 4, 6...)</option>
              <option value="custom">Custom Page Range</option>
            </select>
          </div>

          <div id="flip-custom-range-container" style="display:none; margin-bottom:16px;">
            <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:var(--text-muted);">Specify Page Numbers (e.g. 1, 3-5)</label>
            <input type="text" id="flip-custom-range" placeholder="e.g. 1, 3-5" style="width:100%; padding:8px 12px; border:1px solid var(--border-subtle, #e2e8f0); border-radius:6px; font-size:13px;" />
          </div>

          <!-- Notice banner -->
          <div style="background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-subtle, #e2e8f0); border-radius:6px; padding:10px 12px; font-size:12px; color:var(--text-muted); display:flex; gap:8px; align-items:flex-start;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:1px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Pure vector coordinate transformation: text clarity, resolution, and vector shapes remain 100% loss-free.</span>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-flip-cancel">Cancel</button>
          <button class="btn btn-outline" id="btn-flip-download" style="display:none;">Download PDF</button>
          <button class="btn btn-primary" id="btn-flip-apply">Flip Pages</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('.modal-close-btn').onclick = () => this.hide();
    this.modal.querySelector('#btn-flip-cancel').onclick = () => this.hide();

    // Radio card visual toggles
    const cards = this.modal.querySelectorAll('.flip-option-card');
    cards.forEach(card => {
      card.onclick = () => {
        cards.forEach(c => {
          c.style.borderColor = 'var(--border-subtle, #e2e8f0)';
          c.style.background = 'var(--bg-card, #ffffff)';
          const svg = c.querySelector('svg');
          if (svg) svg.style.color = 'var(--text-main, #334155)';
        });
        card.style.borderColor = 'var(--primary, #2563eb)';
        card.style.background = 'rgba(37,99,235,0.04)';
        const svg = card.querySelector('svg');
        if (svg) svg.style.color = 'var(--primary, #2563eb)';
        const input = card.querySelector('input');
        if (input) input.checked = true;
      };
    });

    // Custom range visibility toggle
    const scopeSelect = this.modal.querySelector('#flip-page-scope');
    const customRangeContainer = this.modal.querySelector('#flip-custom-range-container');
    scopeSelect.onchange = () => {
      customRangeContainer.style.display = scopeSelect.value === 'custom' ? 'block' : 'none';
    };

    const applyBtn = this.modal.querySelector('#btn-flip-apply');
    const dlBtn = this.modal.querySelector('#btn-flip-download');

    applyBtn.onclick = async () => {
      const state = store.getState();
      if (!state.pdfBytes) {
        Toast.error('No document loaded');
        return;
      }

      const direction = this.modal.querySelector('input[name="flip-direction"]:checked')?.value || 'horizontal';
      const scope = scopeSelect.value;
      const totalPages = state.pageCount || 1;
      let targetPages = 'all';

      if (scope === 'odd') {
        targetPages = [];
        for (let p = 1; p <= totalPages; p += 2) targetPages.push(p);
      } else if (scope === 'even') {
        targetPages = [];
        for (let p = 2; p <= totalPages; p += 2) targetPages.push(p);
      } else if (scope === 'custom') {
        const val = this.modal.querySelector('#flip-custom-range').value.trim();
        if (val) {
          targetPages = [];
          const parts = val.split(',');
          for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
              const [start, end] = trimmed.split('-').map(Number);
              if (!isNaN(start) && !isNaN(end)) {
                for (let k = Math.min(start, end); k <= Math.max(start, end); k++) {
                  if (k >= 1 && k <= totalPages) targetPages.push(k);
                }
              }
            } else {
              const num = Number(trimmed);
              if (!isNaN(num) && num >= 1 && num <= totalPages) targetPages.push(num);
            }
          }
        }
      }

      try {
        applyBtn.disabled = true;
        applyBtn.innerText = 'Flipping...';
        Toast.info('Mirroring page vector coordinates...');

        const flippedBytes = await pdfEngine.flipPages(state.pdfBytes, {
          direction,
          pageRange: targetPages
        });

        this.lastResult = flippedBytes;
        dlBtn.style.display = 'inline-block';
        applyBtn.innerText = 'Apply to Workspace';

        applyBtn.onclick = async () => {
          const info = await pdfEngine.loadPdf(flippedBytes);
          store.setDocument(flippedBytes, state.documentName || 'Flipped.pdf', info.numPages);
          this.hide();
          Toast.success('Flipped pages loaded into editor!');
        };

        Toast.success('Pages mirrored successfully!');
      } catch (err) {
        console.error('Flip error:', err);
        Toast.error(`Failed to flip pages: ${err.message}`);
        applyBtn.disabled = false;
        applyBtn.innerText = 'Flip Pages';
      }
    };

    dlBtn.onclick = () => {
      if (this.lastResult) {
        const state = store.getState();
        const blob = new Blob([this.lastResult], { type: 'application/pdf' });
        const name = (state.documentName || 'Document').replace(/\.pdf$/i, '') + '_flipped.pdf';
        downloadBlob(blob, name);
        Toast.success('Flipped PDF downloaded!');
      }
    };
  }

  show() {
    if (!this.modal) return;
    this.modal.querySelector('#btn-flip-download').style.display = 'none';
    const applyBtn = this.modal.querySelector('#btn-flip-apply');
    applyBtn.disabled = false;
    applyBtn.innerText = 'Flip Pages';
    this.bindEvents();
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }
}

export const flipModal = new FlipModal();
