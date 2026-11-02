/**
 * Crop PDF Modal Component
 * Trims margins and resizes page crop box per Sejda's Crop PDF tool specifications.
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class CropModal {
  constructor() {
    this.modal = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'crop-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
            <h3 style="margin:0;">Crop & Trim PDF Margins</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Specify crop margins to trim whitespace, scanner borders, or resize pages.
          </p>

          <!-- Quick Presets -->
          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px;">Crop Presets</label>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <button class="btn btn-sm btn-outline crop-preset" data-top="24" data-right="24" data-bottom="24" data-left="24">Trim White Borders (24pt)</button>
              <button class="btn btn-sm btn-outline crop-preset" data-top="36" data-right="36" data-bottom="36" data-left="36">Standard Margins (36pt)</button>
              <button class="btn btn-sm btn-outline crop-preset" data-top="50" data-right="40" data-bottom="50" data-left="40">Header & Footer Trim</button>
              <button class="btn btn-sm btn-outline crop-preset" data-top="0" data-right="0" data-bottom="0" data-left="0">Reset to 0</button>
            </div>
          </div>

          <!-- Visual Margin Diagram -->
          <div style="position:relative; width:220px; height:180px; margin:0 auto 20px auto; background:var(--bg-secondary); border:2px dashed var(--border-color); border-radius:6px; display:flex; align-items:center; justify-content:center;">
            <div id="crop-preview-box" style="position:absolute; background:rgba(37,99,235,0.08); border:2px solid var(--accent-primary); border-radius:4px; transition:all 0.2s ease; inset:20px;"></div>
            <span style="font-size:11px; font-weight:600; color:var(--text-muted); z-index:2;">Active Crop Area</span>
          </div>

          <!-- Margin Inputs Grid -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Top Margin (pt)</label>
              <input type="number" id="crop-top" class="form-input" min="0" max="300" value="0" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Bottom Margin (pt)</label>
              <input type="number" id="crop-bottom" class="form-input" min="0" max="300" value="0" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Left Margin (pt)</label>
              <input type="number" id="crop-left" class="form-input" min="0" max="300" value="0" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Right Margin (pt)</label>
              <input type="number" id="crop-right" class="form-input" min="0" max="300" value="0" />
            </div>
          </div>

          <!-- Page Scope Selector -->
          <div class="form-group" style="padding-top:10px; border-top:1px solid var(--border-color);">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-weight:500;">
              <input type="checkbox" id="crop-apply-all" checked style="accent-color:var(--accent-primary);" />
              <span>Apply crop margins across all pages in document</span>
            </label>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-outline btn-sm" id="btn-reset-crop" style="color:#ef4444;">Reset Margins</button>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" id="btn-cancel-crop">Cancel</button>
            <button class="btn btn-primary" id="btn-apply-crop">Apply Crop</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  updateDiagram() {
    const top = Math.min(60, (Number(this.modal.querySelector('#crop-top').value) || 0) * 0.4);
    const right = Math.min(60, (Number(this.modal.querySelector('#crop-right').value) || 0) * 0.4);
    const bottom = Math.min(60, (Number(this.modal.querySelector('#crop-bottom').value) || 0) * 0.4);
    const left = Math.min(60, (Number(this.modal.querySelector('#crop-left').value) || 0) * 0.4);

    const box = this.modal.querySelector('#crop-preview-box');
    if (box) {
      box.style.inset = `${top + 10}px ${right + 10}px ${bottom + 10}px ${left + 10}px`;
    }
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-crop');
    const applyBtn = this.modal.querySelector('#btn-apply-crop');
    const resetBtn = this.modal.querySelector('#btn-reset-crop');

    const inputs = this.modal.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.updateDiagram());
    });

    this.modal.querySelectorAll('.crop-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        this.modal.querySelector('#crop-top').value = btn.dataset.top;
        this.modal.querySelector('#crop-right').value = btn.dataset.right;
        this.modal.querySelector('#crop-bottom').value = btn.dataset.bottom;
        this.modal.querySelector('#crop-left').value = btn.dataset.left;
        this.updateDiagram();
      });
    });

    const hide = () => this.hide();
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) hide();
    });

    resetBtn.addEventListener('click', () => {
      this.modal.querySelector('#crop-top').value = 0;
      this.modal.querySelector('#crop-right').value = 0;
      this.modal.querySelector('#crop-bottom').value = 0;
      this.modal.querySelector('#crop-left').value = 0;
      this.updateDiagram();
      store.clearCropSettings();
      Toast.info('Crop margins reset');
      hide();
    });

    applyBtn.addEventListener('click', () => {
      const top = Math.max(0, Number(this.modal.querySelector('#crop-top').value) || 0);
      const right = Math.max(0, Number(this.modal.querySelector('#crop-right').value) || 0);
      const bottom = Math.max(0, Number(this.modal.querySelector('#crop-bottom').value) || 0);
      const left = Math.max(0, Number(this.modal.querySelector('#crop-left').value) || 0);
      const applyToAll = this.modal.querySelector('#crop-apply-all').checked;

      if (top === 0 && right === 0 && bottom === 0 && left === 0) {
        store.clearCropSettings();
        Toast.info('Margins reset to full page');
      } else {
        store.setCropSettings({
          top,
          right,
          bottom,
          left,
          applyToAll,
          pageNum: 1
        });
        Toast.success(`Applied crop margins (${left}pt, ${top}pt, ${right}pt, ${bottom}pt)`);
      }
      hide();
    });
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    const state = store.getState();
    const cs = state.cropSettings || { top: 0, right: 0, bottom: 0, left: 0, applyToAll: true };

    this.modal.querySelector('#crop-top').value = cs.top || 0;
    this.modal.querySelector('#crop-right').value = cs.right || 0;
    this.modal.querySelector('#crop-bottom').value = cs.bottom || 0;
    this.modal.querySelector('#crop-left').value = cs.left || 0;
    this.modal.querySelector('#crop-apply-all').checked = cs.applyToAll !== false;

    this.updateDiagram();
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const cropModal = new CropModal();
