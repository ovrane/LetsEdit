/**
 * Watermark Modal Component
 * Allows users to configure document-wide watermarks with presets, rotation, opacity, and color.
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class WatermarkModal {
  constructor() {
    this.modal = null;
    this.init();
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'watermark-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <h3>Document Watermark</h3>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Watermark Text</label>
            <input type="text" id="wm-text" class="form-input" placeholder="e.g. CONFIDENTIAL" value="CONFIDENTIAL" />
          </div>

          <div class="form-group">
            <label style="font-size:12px; margin-bottom:6px;">Quick Presets</label>
            <div class="preset-badges" style="display:flex; flex-wrap:wrap; gap:6px;">
              <button class="btn btn-sm btn-outline wm-preset" data-text="CONFIDENTIAL">CONFIDENTIAL</button>
              <button class="btn btn-sm btn-outline wm-preset" data-text="DRAFT">DRAFT</button>
              <button class="btn btn-sm btn-outline wm-preset" data-text="SAMPLE">SAMPLE</button>
              <button class="btn btn-sm btn-outline wm-preset" data-text="DO NOT COPY">DO NOT COPY</button>
              <button class="btn btn-sm btn-outline wm-preset" data-text="APPROVED">APPROVED</button>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:16px;">
            <div class="form-group">
              <label>Rotation</label>
              <select id="wm-rotation" class="form-input">
                <option value="45" selected>Diagonal (45°)</option>
                <option value="0">Horizontal (0°)</option>
                <option value="90">Vertical (90°)</option>
                <option value="-45">Reverse Diagonal (-45°)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Color</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="color" id="wm-color" class="color-input-badge" value="#94a3b8" />
                <span id="wm-color-hex" style="font-size:13px; color:var(--text-muted);">#94a3b8</span>
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:12px;">
            <div class="form-group">
              <label>Opacity (<span id="wm-opacity-val">25%</span>)</label>
              <input type="range" id="wm-opacity" min="0.05" max="0.8" step="0.05" value="0.25" style="width:100%;" />
            </div>

            <div class="form-group">
              <label>Font Size (<span id="wm-size-val">46px</span>)</label>
              <input type="range" id="wm-size" min="20" max="80" step="2" value="46" style="width:100%;" />
            </div>
          </div>

          <div class="wm-preview-card" style="margin-top:18px; height:120px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;">
            <span id="wm-preview-text" style="font-weight:800; font-family:sans-serif; text-transform:uppercase; transform:rotate(45deg); opacity:0.25; color:#94a3b8; font-size:32px; pointer-events:none; user-select:none;">
              CONFIDENTIAL
            </span>
          </div>
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          <button class="btn btn-outline" id="wm-clear-btn" style="color:#ef4444; border-color:#fca5a5;">Remove</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="wm-apply-btn">Apply Watermark</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const textInp = this.modal.querySelector('#wm-text');
    const rotSel = this.modal.querySelector('#wm-rotation');
    const colorInp = this.modal.querySelector('#wm-color');
    const colorHex = this.modal.querySelector('#wm-color-hex');
    const opacityInp = this.modal.querySelector('#wm-opacity');
    const opacityVal = this.modal.querySelector('#wm-opacity-val');
    const sizeInp = this.modal.querySelector('#wm-size');
    const sizeVal = this.modal.querySelector('#wm-size-val');
    const preview = this.modal.querySelector('#wm-preview-text');

    const updatePreview = () => {
      const text = textInp.value.trim() || 'WATERMARK';
      const rot = rotSel.value;
      const color = colorInp.value;
      const op = opacityInp.value;
      const sz = sizeInp.value;

      colorHex.textContent = color;
      opacityVal.textContent = `${Math.round(op * 100)}%`;
      sizeVal.textContent = `${sz}px`;

      preview.textContent = text;
      preview.style.transform = `rotate(${rot}deg)`;
      preview.style.color = color;
      preview.style.opacity = op;
      preview.style.fontSize = `${Math.min(sz, 36)}px`;
    };

    textInp.oninput = updatePreview;
    rotSel.onchange = updatePreview;
    colorInp.oninput = updatePreview;
    opacityInp.oninput = updatePreview;
    sizeInp.oninput = updatePreview;

    // Presets
    this.modal.querySelectorAll('.wm-preset').forEach(btn => {
      btn.onclick = () => {
        textInp.value = btn.dataset.text;
        updatePreview();
      };
    });

    const close = () => { this.modal.style.display = 'none'; };
    this.modal.querySelector('.modal-close-btn').onclick = close;
    this.modal.querySelector('.modal-cancel-btn').onclick = close;

    // Remove
    this.modal.querySelector('#wm-clear-btn').onclick = () => {
      store.setWatermark(null);
      close();
      Toast.info('Watermark removed from document');
    };

    // Apply
    this.modal.querySelector('#wm-apply-btn').onclick = () => {
      const text = textInp.value.trim();
      if (!text) {
        Toast.warning('Please enter watermark text');
        return;
      }

      store.setWatermark({
        text,
        rotation: parseInt(rotSel.value, 10),
        color: colorInp.value,
        opacity: parseFloat(opacityInp.value),
        fontSize: parseInt(sizeInp.value, 10)
      });

      close();
      Toast.success(`Watermark "${text}" applied across all pages!`);
    };
  }

  open() {
    const cur = store.getState().watermark;
    if (cur) {
      this.modal.querySelector('#wm-text').value = cur.text || '';
      this.modal.querySelector('#wm-rotation').value = cur.rotation?.toString() || '45';
      this.modal.querySelector('#wm-color').value = cur.color || '#94a3b8';
      this.modal.querySelector('#wm-opacity').value = cur.opacity?.toString() || '0.25';
      this.modal.querySelector('#wm-size').value = cur.fontSize?.toString() || '46';
    }
    this.modal.querySelector('#wm-text').dispatchEvent(new Event('input'));
    this.modal.style.display = 'flex';
  }
}
