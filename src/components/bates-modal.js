/**
 * Bates Numbering Modal Component
 * Legal indexing tool: generates sequential zero-padded Bates stamps across all pages.
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class BatesModal {
  constructor() {
    this.modal = null;
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'bates-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <h3 style="margin:0;">Bates Numbering (Legal Indexing)</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Apply sequential alphanumeric identification stamps to every page in your document.
          </p>

          <!-- Live Sample Preview -->
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; padding:12px; margin-bottom:16px; text-align:center;">
            <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Live Preview (Page 1)</div>
            <div id="bates-live-preview" style="font-size:16px; font-weight:700; color:var(--text-main); font-family:monospace; letter-spacing:1px;">CASE-000001</div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Prefix</label>
              <input type="text" id="bates-prefix" class="form-input" placeholder="e.g. CASE-" value="CASE-" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Suffix</label>
              <input type="text" id="bates-suffix" class="form-input" placeholder="e.g. -EXHIBIT" value="" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Start Number</label>
              <input type="number" id="bates-start" class="form-input" min="1" value="1" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Number of Digits (Padding)</label>
              <select id="bates-digits" class="form-input">
                <option value="4">4 digits (e.g. 0001)</option>
                <option value="5">5 digits (e.g. 00001)</option>
                <option value="6" selected>6 digits (e.g. 000001)</option>
                <option value="8">8 digits (e.g. 00000001)</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Position</label>
              <select id="bates-pos" class="form-input">
                <option value="bottom-right" selected>Bottom Right</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-center">Top Center</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Color</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="color" id="bates-color" class="color-input-badge" value="#1e293b" />
                <span id="bates-color-label" style="font-size:12px; color:var(--text-muted);">#1e293b</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-outline btn-sm" id="btn-remove-bates" style="color:#ef4444;">Remove Bates</button>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" id="btn-cancel-bates">Cancel</button>
            <button class="btn btn-primary" id="btn-apply-bates">Apply Bates Stamps</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  updatePreview() {
    const prefix = this.modal.querySelector('#bates-prefix').value;
    const suffix = this.modal.querySelector('#bates-suffix').value;
    const start = parseInt(this.modal.querySelector('#bates-start').value, 10) || 1;
    const digits = parseInt(this.modal.querySelector('#bates-digits').value, 10) || 6;
    const padded = String(start).padStart(digits, '0');
    const previewEl = this.modal.querySelector('#bates-live-preview');
    if (previewEl) {
      previewEl.textContent = `${prefix}${padded}${suffix}`;
    }
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-bates');
    const applyBtn = this.modal.querySelector('#btn-apply-bates');
    const removeBtn = this.modal.querySelector('#btn-remove-bates');
    const colorInput = this.modal.querySelector('#bates-color');
    const colorLabel = this.modal.querySelector('#bates-color-label');

    const hide = () => this.hide();
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) hide();
    });

    ['#bates-prefix', '#bates-suffix', '#bates-start', '#bates-digits'].forEach(selector => {
      this.modal.querySelector(selector).addEventListener('input', () => this.updatePreview());
      this.modal.querySelector(selector).addEventListener('change', () => this.updatePreview());
    });

    colorInput.addEventListener('input', () => {
      colorLabel.textContent = colorInput.value;
    });

    removeBtn.addEventListener('click', () => {
      store.clearBatesNumbering();
      Toast.info('Bates numbering removed');
      hide();
    });

    applyBtn.addEventListener('click', () => {
      const prefix = this.modal.querySelector('#bates-prefix').value;
      const suffix = this.modal.querySelector('#bates-suffix').value;
      const startNumber = parseInt(this.modal.querySelector('#bates-start').value, 10) || 1;
      const digits = parseInt(this.modal.querySelector('#bates-digits').value, 10) || 6;
      const position = this.modal.querySelector('#bates-pos').value;
      const color = colorInput.value;

      store.setBatesNumbering({
        prefix,
        suffix,
        startNumber,
        digits,
        position,
        fontSize: 10,
        color
      });

      Toast.success(`Bates numbering configured (${prefix}${String(startNumber).padStart(digits, '0')})`);
      hide();
    });
  }

  show() {
    if (!this.modal) return;
    const state = store.getState();
    const bn = state.batesNumbering || {
      prefix: 'CASE-',
      suffix: '',
      startNumber: 1,
      digits: 6,
      position: 'bottom-right',
      color: '#1e293b'
    };

    this.modal.querySelector('#bates-prefix').value = bn.prefix || '';
    this.modal.querySelector('#bates-suffix').value = bn.suffix || '';
    this.modal.querySelector('#bates-start').value = bn.startNumber || 1;
    this.modal.querySelector('#bates-digits').value = bn.digits || 6;
    this.modal.querySelector('#bates-pos').value = bn.position || 'bottom-right';
    this.modal.querySelector('#bates-color').value = bn.color || '#1e293b';
    this.modal.querySelector('#bates-color-label').textContent = bn.color || '#1e293b';

    this.updatePreview();
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const batesModal = new BatesModal();
