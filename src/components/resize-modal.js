/**
 * Resize PDF Margins Modal Component
 * Adjusts page margins and standardized page sizes per Sejda's Resize PDF tool.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';

export class ResizeModal {
  constructor() {
    this.modal = null;
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'resize-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
            <h3 style="margin:0;">Resize Page Margins & Bounds</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Add margins for spiral/ring binding, adjust document padding, or fit pages to standard sheet sizes (A4, US Letter, US Legal).
          </p>

          <!-- Quick Presets -->
          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px;">Quick Margin Presets</label>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <button class="btn btn-sm btn-outline resize-preset" data-top="0" data-right="0" data-bottom="0" data-left="72">Spiral / Binder (Left +72pt)</button>
              <button class="btn btn-sm btn-outline resize-preset" data-top="36" data-right="0" data-bottom="36" data-left="0">Header & Footer (+36pt)</button>
              <button class="btn btn-sm btn-outline resize-preset" data-top="36" data-right="36" data-bottom="36" data-left="36">All Sides (+36pt)</button>
              <button class="btn btn-sm btn-outline resize-preset" data-top="0" data-right="0" data-bottom="0" data-left="0">Reset to 0</button>
            </div>
          </div>

          <!-- Visual Margin Diagram -->
          <div style="position:relative; width:220px; height:180px; margin:0 auto 18px auto; background:var(--bg-secondary); border:2px dashed var(--border-color); border-radius:6px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
            <div id="resize-preview-outer" style="position:absolute; inset:8px; background:#ffffff; border:1px solid #cbd5e1; border-radius:4px; display:flex; align-items:center; justify-content:center;">
              <div id="resize-preview-inner" style="position:absolute; inset:0px; background:rgba(37,99,235,0.12); border:1.5px dashed var(--accent-primary); border-radius:2px; transition:all 0.2s ease;"></div>
              <span style="font-size:11px; font-weight:600; color:var(--text-muted); z-index:2;">Original Content</span>
            </div>
          </div>

          <!-- Margin Inputs Grid -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Top Margin (pt)</label>
              <input type="number" id="resize-top" class="form-input" min="0" max="300" value="0" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Bottom Margin (pt)</label>
              <input type="number" id="resize-bottom" class="form-input" min="0" max="300" value="0" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Left Margin (pt)</label>
              <input type="number" id="resize-left" class="form-input" min="0" max="300" value="0" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Right Margin (pt)</label>
              <input type="number" id="resize-right" class="form-input" min="0" max="300" value="0" />
            </div>
          </div>

          <!-- Page Size & Background -->
          <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:12px; margin-bottom:16px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Target Sheet Size</label>
              <select id="resize-page-size" class="form-input">
                <option value="original" selected>Keep Original Size (Expand Canvas)</option>
                <option value="a4">Standard A4 (595 × 842 pt)</option>
                <option value="letter">US Letter (612 × 792 pt)</option>
                <option value="legal">US Legal (612 × 1008 pt)</option>
              </select>
            </div>

            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Margin Fill</label>
              <input type="color" id="resize-bg-color" class="form-input" value="#ffffff" style="height:38px; padding:2px 6px; cursor:pointer;" />
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-resize-cancel">Cancel</button>
          <button class="btn btn-primary" id="btn-resize-apply">Apply Margins & Resize</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('.modal-close-btn').onclick = () => this.hide();
    this.modal.querySelector('#btn-resize-cancel').onclick = () => this.hide();

    const topInp = this.modal.querySelector('#resize-top');
    const rightInp = this.modal.querySelector('#resize-right');
    const bottomInp = this.modal.querySelector('#resize-bottom');
    const leftInp = this.modal.querySelector('#resize-left');
    const innerBox = this.modal.querySelector('#resize-preview-inner');

    const updatePreview = () => {
      const t = Math.min(60, (Number(topInp.value) || 0) * 0.3);
      const r = Math.min(60, (Number(rightInp.value) || 0) * 0.3);
      const b = Math.min(60, (Number(bottomInp.value) || 0) * 0.3);
      const l = Math.min(60, (Number(leftInp.value) || 0) * 0.3);

      innerBox.style.top = `${t}px`;
      innerBox.style.right = `${r}px`;
      innerBox.style.bottom = `${b}px`;
      innerBox.style.left = `${l}px`;
    };

    [topInp, rightInp, bottomInp, leftInp].forEach(inp => {
      inp.addEventListener('input', updatePreview);
    });

    // Preset buttons
    this.modal.querySelectorAll('.resize-preset').forEach(btn => {
      btn.onclick = () => {
        topInp.value = btn.dataset.top;
        rightInp.value = btn.dataset.right;
        bottomInp.value = btn.dataset.bottom;
        leftInp.value = btn.dataset.left;
        updatePreview();
      };
    });

    // Apply button
    this.modal.querySelector('#btn-resize-apply').onclick = async () => {
      const state = store.getState();
      const bytes = state.pdfBytes || pdfEngine.rawBytes;
      if (!bytes) {
        Toast.error('No document loaded');
        return;
      }

      const top = Number(topInp.value) || 0;
      const right = Number(rightInp.value) || 0;
      const bottom = Number(bottomInp.value) || 0;
      const left = Number(leftInp.value) || 0;
      const pageSize = this.modal.querySelector('#resize-page-size').value;
      const backgroundColor = this.modal.querySelector('#resize-bg-color').value;

      try {
        Toast.info('Resizing pages and margins...');
        const newBytes = await pdfEngine.resizePdfMargins(bytes, {
          marginTop: top,
          marginRight: right,
          marginBottom: bottom,
          marginLeft: left,
          pageSize,
          backgroundColor
        });

        const info = await pdfEngine.loadPdf(newBytes);
        store.setDocument(newBytes, state.documentName || 'Resized.pdf', info.numPages);
        this.hide();
        Toast.success('PDF margins resized successfully!');
      } catch (err) {
        console.error('Resize error:', err);
        Toast.error(`Failed to resize margins: ${err.message}`);
      }
    };
  }

  show() {
    if (this.modal) this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }
}

export const resizeModal = new ResizeModal();
