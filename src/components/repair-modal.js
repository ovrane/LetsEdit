/**
 * Repair PDF Modal Component
 * Reconstructs damaged and corrupted PDF files, repairs broken cross-reference tables,
 * fixes missing EOF markers, and recovers orphaned page and stream objects.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';

export class RepairModal {
  constructor() {
    this.modal = null;
    this.targetBytes = null;
    this.fileName = 'corrupted_document.pdf';
    this.repairedResult = null;
    this.isRepairing = false;
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'repair-pdf-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(239,68,68,0.12); color:#ef4444; display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" style="margin:0; font-size:18px;">Repair Damaged PDF</h2>
              <p class="modal-subtitle" style="margin:0; font-size:12px; color:var(--text-muted);">Recover corrupted xref tables, broken headers, and orphaned pages</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-repair">&times;</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          <!-- Dropzone -->
          <div id="repair-dropzone" style="border:2px dashed var(--border-subtle); border-radius:12px; padding:24px 16px; text-align:center; background:var(--bg-secondary); margin-bottom:16px; cursor:pointer;">
            <input type="file" id="input-repair-pdf" accept="application/pdf" style="display:none;" />
            <div style="width:48px; height:48px; border-radius:50%; background:rgba(239,68,68,0.1); color:#ef4444; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <div id="repair-file-label" style="font-weight:600; font-size:14px; color:var(--text-main); margin-bottom:4px;">Click or drag damaged PDF here</div>
            <div style="font-size:12px; color:var(--text-muted);">Supports unreadable, truncated, or header-damaged PDFs</div>
          </div>

          <!-- Loading State -->
          <div id="repair-loading-state" style="display:none; text-align:center; padding:24px 16px;">
            <div class="spinner" style="width:36px; height:36px; border:3px solid var(--border-subtle); border-top-color:#ef4444; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px;"></div>
            <p style="font-size:14px; color:var(--text-muted); margin:0;">Reconstructing cross-reference tables and streams...</p>
          </div>

          <!-- Recovery Stats Card -->
          <div id="repair-success-card" style="display:none; background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:12px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; color:#10b981; font-weight:700; font-size:14px;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Document Successfully Repaired!</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-subtle);">
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Recovered Pages</div>
                <div style="font-size:18px; font-weight:700; color:var(--text-main);" id="repair-stat-pages">0</div>
              </div>
              <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-subtle);">
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Recovered Objects</div>
                <div style="font-size:18px; font-weight:700; color:var(--text-main);" id="repair-stat-objects">0</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-outline" id="btn-cancel-repair">Cancel</button>
            <button class="btn btn-primary" id="btn-run-repair" style="background:#ef4444; border-color:#ef4444;" disabled>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              <span>Repair PDF</span>
            </button>
            <button class="btn btn-primary" id="btn-download-repaired" style="display:none;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download Repaired PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('#btn-close-repair').addEventListener('click', () => this.hide());
    this.modal.querySelector('#btn-cancel-repair').addEventListener('click', () => this.hide());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    const dropzone = this.modal.querySelector('#repair-dropzone');
    const input = this.modal.querySelector('#input-repair-pdf');
    const btnRun = this.modal.querySelector('#btn-run-repair');
    const btnDownload = this.modal.querySelector('#btn-download-repaired');

    dropzone.addEventListener('click', () => input.click());

    input.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        this.fileName = file.name;
        this.targetBytes = await readFileAsArrayBuffer(file);
        this.modal.querySelector('#repair-file-label').textContent = file.name;
        btnRun.disabled = false;
        this.modal.querySelector('#repair-success-card').style.display = 'none';
        btnDownload.style.display = 'none';
        btnRun.style.display = 'inline-flex';
      }
    });

    btnRun.addEventListener('click', () => this.runRepair());
    btnDownload.addEventListener('click', () => this.downloadRepaired());
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    this.modal.style.display = 'flex';

    if (pdfEngine.rawBytes) {
      this.targetBytes = pdfEngine.rawBytes;
      this.fileName = store.getState().metadata?.title || 'current_document.pdf';
      this.modal.querySelector('#repair-file-label').textContent = this.fileName;
      this.modal.querySelector('#btn-run-repair').disabled = false;
    }
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }

  async runRepair() {
    if (!this.targetBytes || this.isRepairing) return;

    this.isRepairing = true;
    const loading = this.modal.querySelector('#repair-loading-state');
    const successCard = this.modal.querySelector('#repair-success-card');
    const btnRun = this.modal.querySelector('#btn-run-repair');
    const btnDownload = this.modal.querySelector('#btn-download-repaired');

    loading.style.display = 'block';
    successCard.style.display = 'none';
    btnRun.disabled = true;

    try {
      this.repairedResult = await pdfEngine.repairPdf(this.targetBytes);

      this.modal.querySelector('#repair-stat-pages').textContent = this.repairedResult.pageCount;
      this.modal.querySelector('#repair-stat-objects').textContent = this.repairedResult.recoveredObjects;

      successCard.style.display = 'block';
      btnRun.style.display = 'none';
      btnDownload.style.display = 'inline-flex';
      Toast.show(`Successfully repaired ${this.repairedResult.pageCount} page(s)!`, 'success');
    } catch (err) {
      console.error('Repair failed:', err);
      Toast.show('Unable to repair this file: ' + err.message, 'error');
    } finally {
      this.isRepairing = false;
      loading.style.display = 'none';
      btnRun.disabled = false;
    }
  }

  downloadRepaired() {
    if (!this.repairedResult || !this.repairedResult.pdfBytes) return;
    const blob = new Blob([this.repairedResult.pdfBytes], { type: 'application/pdf' });
    const cleanName = this.fileName.replace(/\.pdf$/i, '') + '-repaired.pdf';
    downloadBlob(blob, cleanName);
    Toast.show('Repaired PDF downloaded!', 'success');
  }
}

export const repairModal = new RepairModal();
