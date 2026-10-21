/**
 * Page Numbers Modal Component
 * Allows users to configure headers/footers with dynamic page numbering across all pages.
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class PageNumbersModal {
  constructor() {
    this.modal = null;
    this.selectedPosition = 'bottom-center';
    this.init();
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'pagenumbers-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <h3>Header & Footer Page Numbers</h3>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Numbering Format</label>
            <input type="text" id="pn-format" class="form-input" value="Page {n} of {total}" placeholder="e.g. Page {n} of {total}" />
            <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">
              Tokens: <code>{n}</code> = current page number, <code>{total}</code> = total pages
            </p>
          </div>

          <div class="form-group" style="margin-top:12px;">
            <label style="font-size:12px; margin-bottom:6px;">Format Presets</label>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <button class="btn btn-sm btn-outline pn-preset" data-fmt="Page {n} of {total}">Page {n} of {total}</button>
              <button class="btn btn-sm btn-outline pn-preset" data-fmt="{n} / {total}">{n} / {total}</button>
              <button class="btn btn-sm btn-outline pn-preset" data-fmt="Page {n}">Page {n}</button>
              <button class="btn btn-sm btn-outline pn-preset" data-fmt="- {n} -">- {n} -</button>
            </div>
          </div>

          <div class="form-group" style="margin-top:16px;">
            <label>Position Alignment</label>
            <div class="pn-position-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-top:6px;">
              <button class="btn btn-outline pn-pos-btn" data-pos="top-left">Top Left</button>
              <button class="btn btn-outline pn-pos-btn" data-pos="top-center">Top Center</button>
              <button class="btn btn-outline pn-pos-btn" data-pos="top-right">Top Right</button>
              <button class="btn btn-outline pn-pos-btn" data-pos="bottom-left">Bottom Left</button>
              <button class="btn btn-outline pn-pos-btn active" data-pos="bottom-center">Bottom Center</button>
              <button class="btn btn-outline pn-pos-btn" data-pos="bottom-right">Bottom Right</button>
            </div>
          </div>

          <!-- Page Mockup Preview -->
          <div style="margin-top:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; display:flex; justify-content:center;">
            <div id="pn-mock-page" style="width:140px; height:180px; background:white; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.05); position:relative; padding:10px; font-size:9px; color:#64748b; font-family:sans-serif;">
              <div id="pn-preview-text" style="position:absolute; width:100%; left:0; text-align:center; bottom:8px;">
                Page 1 of 5
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          <button class="btn btn-outline" id="pn-clear-btn" style="color:#ef4444; border-color:#fca5a5;">Remove Numbers</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="pn-apply-btn">Apply Page Numbers</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const fmtInp = this.modal.querySelector('#pn-format');
    const preview = this.modal.querySelector('#pn-preview-text');
    const posBtns = this.modal.querySelectorAll('.pn-pos-btn');

    const updatePreview = () => {
      const state = store.getState();
      const total = state.pageCount || 5;
      const fmt = fmtInp.value || 'Page {n} of {total}';
      const sample = fmt.replace('{n}', '1').replace('{total}', total.toString());
      preview.textContent = sample;

      // Position preview text on mock page
      preview.style.top = '';
      preview.style.bottom = '';
      preview.style.left = '8px';
      preview.style.right = '8px';
      preview.style.width = 'calc(100% - 16px)';

      if (this.selectedPosition === 'top-left') {
        preview.style.top = '8px';
        preview.style.textAlign = 'left';
      } else if (this.selectedPosition === 'top-center') {
        preview.style.top = '8px';
        preview.style.textAlign = 'center';
      } else if (this.selectedPosition === 'top-right') {
        preview.style.top = '8px';
        preview.style.textAlign = 'right';
      } else if (this.selectedPosition === 'bottom-left') {
        preview.style.bottom = '8px';
        preview.style.textAlign = 'left';
      } else if (this.selectedPosition === 'bottom-center') {
        preview.style.bottom = '8px';
        preview.style.textAlign = 'center';
      } else if (this.selectedPosition === 'bottom-right') {
        preview.style.bottom = '8px';
        preview.style.textAlign = 'right';
      }
    };

    fmtInp.oninput = updatePreview;

    posBtns.forEach(btn => {
      btn.onclick = () => {
        posBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPosition = btn.dataset.pos;
        updatePreview();
      };
    });

    this.modal.querySelectorAll('.pn-preset').forEach(btn => {
      btn.onclick = () => {
        fmtInp.value = btn.dataset.fmt;
        updatePreview();
      };
    });

    const close = () => { this.modal.style.display = 'none'; };
    this.modal.querySelector('.modal-close-btn').onclick = close;
    this.modal.querySelector('.modal-cancel-btn').onclick = close;

    this.modal.querySelector('#pn-clear-btn').onclick = () => {
      store.setPageNumbers(null);
      close();
      Toast.info('Page numbers removed');
    };

    this.modal.querySelector('#pn-apply-btn').onclick = () => {
      const format = fmtInp.value.trim();
      if (!format) {
        Toast.warning('Please enter page number format');
        return;
      }

      store.setPageNumbers({
        format,
        position: this.selectedPosition
      });

      close();
      Toast.success('Page numbers configured across document!');
    };
  }

  open() {
    const cur = store.getState().pageNumbers;
    if (cur) {
      this.modal.querySelector('#pn-format').value = cur.format || 'Page {n} of {total}';
      this.selectedPosition = cur.position || 'bottom-center';
      this.modal.querySelectorAll('.pn-pos-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.pos === this.selectedPosition);
      });
    }
    this.modal.querySelector('#pn-format').dispatchEvent(new Event('input'));
    this.modal.style.display = 'flex';
  }
}
