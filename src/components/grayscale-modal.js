/**
 * Grayscale PDF Modal Component
 * Converts PDF color content to monochrome grayscale per Sejda specifications.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob } from '../utils/helpers.js';

export class GrayscaleModal {
  constructor() {
    this.modal = null;
    this.lastResult = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'grayscale-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"></path>
            </svg>
            <h3 style="margin:0;">Grayscale PDF</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Convert full-color documents into monochrome grayscale (black, white, and shades of gray). Ideal for cost-effective printing and official government or legal filings.
          </p>

          <!-- Feature comparison cards -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            <div style="border:1px solid var(--border-subtle, #e2e8f0); border-radius:8px; padding:12px; text-align:center; background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
              <div style="font-size:18px; margin-bottom:4px;">🖨️</div>
              <div style="font-size:12px; font-weight:700; color:#166534;">Save Printing Costs</div>
              <div style="font-size:11px; color:#15803d; margin-top:2px;">Prevents expensive color toner or ink usage</div>
            </div>

            <div style="border:1px solid var(--border-subtle, #e2e8f0); border-radius:8px; padding:12px; text-align:center; background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
              <div style="font-size:18px; margin-bottom:4px;">⚖️</div>
              <div style="font-size:12px; font-weight:700; color:#334155;">Archival & Court Filing</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">Meets monochrome standard filing regulations</div>
            </div>
          </div>

          <!-- Technical description details -->
          <div style="background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-subtle, #e2e8f0); border-radius:8px; padding:12px 14px; margin-bottom:16px; font-size:12px; color:var(--text-muted);">
            <div style="font-weight:600; color:var(--text-main, #0f172a); margin-bottom:4px;">How Grayscale Conversion Works:</div>
            <ul style="margin:0; padding-left:18px; line-height:1.6;">
              <li>Converts all vector RGB & CMYK fills, strokes, and shapes into standard luminance DeviceGray ($0.299R + 0.587G + 0.114B$).</li>
              <li>Text sharpness and vector resolution remain 100% crisp.</li>
              <li>Processed 100% locally in your browser with zero document uploading.</li>
            </ul>
          </div>

          <!-- Status badge / result box -->
          <div id="grayscale-result-box" style="display:none; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:12px 14px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg width="18" height="18" fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>
              <span style="font-size:13px; font-weight:700; color:#065f46;">Document Converted to Grayscale!</span>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-grayscale-cancel">Cancel</button>
          <button class="btn btn-outline" id="btn-grayscale-download" style="display:none;">Download Grayscale PDF</button>
          <button class="btn btn-primary" id="btn-grayscale-run">Convert to Grayscale</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('.modal-close-btn').onclick = () => this.hide();
    this.modal.querySelector('#btn-grayscale-cancel').onclick = () => this.hide();

    const runBtn = this.modal.querySelector('#btn-grayscale-run');
    const dlBtn = this.modal.querySelector('#btn-grayscale-download');
    const resBox = this.modal.querySelector('#grayscale-result-box');

    runBtn.onclick = async () => {
      const state = store.getState();
      if (!state.pdfBytes) {
        Toast.error('No document loaded');
        return;
      }

      try {
        runBtn.disabled = true;
        runBtn.innerText = 'Converting...';
        Toast.info('Desaturating color streams to DeviceGray...');

        const grayBytes = await pdfEngine.convertToGrayscale(state.pdfBytes);
        this.lastResult = grayBytes;

        resBox.style.display = 'block';
        dlBtn.style.display = 'inline-block';
        runBtn.innerText = 'Apply to Workspace';

        runBtn.onclick = async () => {
          const info = await pdfEngine.loadPdf(grayBytes);
          store.setDocument(grayBytes, state.documentName || 'Grayscale.pdf', info.numPages);
          this.hide();
          Toast.success('Grayscale PDF loaded into workspace!');
        };

        Toast.success('Document converted to grayscale!');
      } catch (err) {
        console.error('Grayscale error:', err);
        Toast.error(`Failed to convert to grayscale: ${err.message}`);
        runBtn.disabled = false;
        runBtn.innerText = 'Convert to Grayscale';
      }
    };

    dlBtn.onclick = () => {
      if (this.lastResult) {
        const state = store.getState();
        const blob = new Blob([this.lastResult], { type: 'application/pdf' });
        const name = (state.documentName || 'Document').replace(/\.pdf$/i, '') + '_grayscale.pdf';
        downloadBlob(blob, name);
        Toast.success('Grayscale PDF downloaded!');
      }
    };
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    this.modal.querySelector('#grayscale-result-box').style.display = 'none';
    this.modal.querySelector('#btn-grayscale-download').style.display = 'none';
    const runBtn = this.modal.querySelector('#btn-grayscale-run');
    runBtn.disabled = false;
    runBtn.innerText = 'Convert to Grayscale';
    this.bindEvents();
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }
}

export const grayscaleModal = new GrayscaleModal();
