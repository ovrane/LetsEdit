/**
 * Compress PDF Modal Component
 * Compresses PDF file size per Sejda's Compress PDF tool specifications.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from './toast.js';
import { downloadBlob } from '../utils/helpers.js';

export class CompressModal {
  constructor() {
    this.modal = null;
    this.lastResult = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'compress-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path></svg>
            <h3 style="margin:0;">Compress PDF</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0; margin-bottom:14px;">
            Reduce document file size for easy email sharing, web uploads, and storage optimization.
          </p>

          <!-- Current File Info -->
          <div style="background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-subtle, #e2e8f0); border-radius:8px; padding:12px 14px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div id="compress-file-name" style="font-size:13px; font-weight:600; color:var(--text-main, #0f172a);">Document.pdf</div>
              <div id="compress-orig-size" style="font-size:12px; color:var(--text-muted, #64748b);">Original Size: --</div>
            </div>
            <span style="font-size:11px; font-weight:600; padding:3px 8px; border-radius:12px; background:rgba(48,5,13,0.08); color:var(--primary, #30050d);">Ready</span>
          </div>

          <!-- Compression Levels -->
          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:8px;">Compression Level</label>
            <div style="display:grid; grid-template-columns: 1fr; gap:8px;">
              <label style="display:flex; align-items:flex-start; gap:10px; padding:10px; border:1px solid var(--border-subtle, #e2e8f0); border-radius:6px; cursor:pointer;">
                <input type="radio" name="compress-level" value="recommended" checked style="margin-top:3px;" />
                <div>
                  <div style="font-size:13px; font-weight:600;">Recommended Compression</div>
                  <div style="font-size:11px; color:var(--text-muted, #64748b);">Balanced file size reduction with crisp visual quality. Ideal for email.</div>
                </div>
              </label>

              <label style="display:flex; align-items:flex-start; gap:10px; padding:10px; border:1px solid var(--border-subtle, #e2e8f0); border-radius:6px; cursor:pointer;">
                <input type="radio" name="compress-level" value="extreme" style="margin-top:3px;" />
                <div>
                  <div style="font-size:13px; font-weight:600;">Extreme Compression</div>
                  <div style="font-size:11px; color:var(--text-muted, #64748b);">Maximum file size reduction. Recompresses object streams and removes extra metadata.</div>
                </div>
              </label>

              <label style="display:flex; align-items:flex-start; gap:10px; padding:10px; border:1px solid var(--border-subtle, #e2e8f0); border-radius:6px; cursor:pointer;">
                <input type="radio" name="compress-level" value="low" style="margin-top:3px;" />
                <div>
                  <div style="font-size:13px; font-weight:600;">Low Compression</div>
                  <div style="font-size:11px; color:var(--text-muted, #64748b);">High image preservation with structural optimization.</div>
                </div>
              </label>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer;">
              <input type="checkbox" id="compress-strip-meta" checked />
              <span>Strip unnecessary document metadata and thumbnails to save space</span>
            </label>
          </div>

          <!-- Result Card (Hidden by default) -->
          <div id="compress-result-box" style="display:none; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:12px 14px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:13px; font-weight:700; color:#065f46;">Compression Successful!</span>
              <span id="compress-savings-badge" style="font-size:12px; font-weight:700; background:#059669; color:#ffffff; padding:2px 8px; border-radius:12px;">-0%</span>
            </div>
            <div style="display:flex; gap:16px; font-size:12px; color:#047857;">
              <div>Before: <b id="res-orig-size">--</b></div>
              <div>After: <b id="res-comp-size">--</b></div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" id="btn-compress-cancel">Cancel</button>
          <button class="btn btn-outline" id="btn-compress-download" style="display:none;">Download Compressed PDF</button>
          <button class="btn btn-primary" id="btn-compress-run">Compress PDF</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  bindEvents() {
    this.modal.querySelector('.modal-close-btn').onclick = () => this.hide();
    this.modal.querySelector('#btn-compress-cancel').onclick = () => this.hide();

    const runBtn = this.modal.querySelector('#btn-compress-run');
    const dlBtn = this.modal.querySelector('#btn-compress-download');
    const resBox = this.modal.querySelector('#compress-result-box');

    runBtn.onclick = async () => {
      const state = store.getState();
      if (!state.pdfBytes) {
        Toast.error('No document loaded');
        return;
      }

      const quality = this.modal.querySelector('input[name="compress-level"]:checked')?.value || 'recommended';
      const removeMetadata = this.modal.querySelector('#compress-strip-meta').checked;

      try {
        runBtn.disabled = true;
        runBtn.innerText = 'Compressing...';
        Toast.info('Compressing PDF stream structures...');

        const result = await pdfEngine.compressPdf(state.pdfBytes, { quality, removeMetadata });
        this.lastResult = result;

        // Show result box
        resBox.style.display = 'block';
        this.modal.querySelector('#res-orig-size').innerText = this.formatBytes(result.originalSize);
        this.modal.querySelector('#res-comp-size').innerText = this.formatBytes(result.compressedSize);
        this.modal.querySelector('#compress-savings-badge').innerText = `-${result.savingsPercent}%`;

        dlBtn.style.display = 'inline-block';
        runBtn.innerText = 'Apply to Document';

        // Clicking runBtn again applies compressed version to store
        runBtn.onclick = async () => {
          const info = await pdfEngine.loadPdf(result.bytes);
          store.setDocument(result.bytes, state.documentName || 'Compressed.pdf', info.numPages);
          this.hide();
          Toast.success('Compressed PDF loaded in workspace!');
        };

        Toast.success(`Compression finished! Size reduced by ${result.savingsPercent}%.`);
      } catch (err) {
        console.error('Compression error:', err);
        Toast.error(`Compression failed: ${err.message}`);
        runBtn.disabled = false;
        runBtn.innerText = 'Compress PDF';
      }
    };

    dlBtn.onclick = () => {
      if (this.lastResult && this.lastResult.bytes) {
        const state = store.getState();
        const blob = new Blob([this.lastResult.bytes], { type: 'application/pdf' });
        const name = (state.documentName || 'Document').replace(/\.pdf$/i, '') + '_compressed.pdf';
        downloadBlob(blob, name);
        Toast.success('Compressed PDF downloaded!');
      }
    };
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    const state = store.getState();
    const size = state.pdfBytes ? (state.pdfBytes.byteLength || state.pdfBytes.length) : 0;
    this.modal.querySelector('#compress-file-name').innerText = state.documentName || 'Document.pdf';
    this.modal.querySelector('#compress-orig-size').innerText = `Original Size: ${this.formatBytes(size)}`;
    this.modal.querySelector('#compress-result-box').style.display = 'none';
    this.modal.querySelector('#btn-compress-download').style.display = 'none';
    const runBtn = this.modal.querySelector('#btn-compress-run');
    runBtn.disabled = false;
    runBtn.innerText = 'Compress PDF';
    this.bindEvents(); // Re-bind in case runBtn.onclick was modified
    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }
}

export const compressModal = new CompressModal();
