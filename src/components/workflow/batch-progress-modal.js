/**
 * Multi-File Batch Progress Modal & Real-Time Gauges Component
 * Conforms to iLovePDF & Adobe Acrobat Web multi-file batch execution specifications.
 * Displays individual per-file byte & percentage progress bars, live throughput
 * speedometers, remaining ETA, and cancellation queue controls.
 */

import { formatBytes } from '../../utils/helpers.js';

export class BatchProgressModal {
  constructor() {
    this.modal = null;
    this.files = [];
    this.totalBytes = 0;
    this.processedBytes = 0;
    this.startTime = null;
    this.isCancelled = false;
    this.onCancelCallback = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'batch-progress-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';
    this.modal.style.zIndex = '9999';
    this.modal.style.backdropFilter = 'blur(8px)';
    this.modal.style.webkitBackdropFilter = 'blur(8px)';
    this.modal.style.background = 'rgba(15, 23, 42, 0.65)';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 620px; width: 95%; background: var(--bg-surface, #ffffff); border: 1px solid var(--border-subtle, #e2e8f0); border-radius: 18px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header -->
        <div style="padding: 20px 24px 16px 24px; border-bottom: 1px solid var(--border-subtle, #e2e8f0); display: flex; align-items: center; justify-content: space-between; background: linear-gradient(to right, rgba(48, 5, 13, 0.04), transparent);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(48, 5, 13, 0.08); color: var(--primary, #30050d); display: flex; align-items: center; justify-content: center; font-size: 20px;">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path d="M19 11V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path>
                <path d="M14 2v6h6"></path>
                <path d="m18 16 2 2 4-4"></path>
              </svg>
            </div>
            <div>
              <h3 id="batch-progress-title" style="margin: 0; font-size: 17px; font-weight: 700; color: var(--text-main, #0f172a);">Batch Processing</h3>
              <p id="batch-progress-subtitle" style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted, #64748b);">Pure client-side processing • Zero telemetry</p>
            </div>
          </div>
          <button type="button" id="btn-cancel-batch" class="btn btn-outline btn-sm" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3); font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span>Cancel Batch</span>
          </button>
        </div>

        <!-- Master Dashboard Section -->
        <div style="padding: 20px 24px 16px 24px; background: var(--bg-surface, #ffffff);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span id="batch-master-percent" style="font-size: 32px; font-weight: 800; color: var(--primary, #30050d); line-height: 1;">0%</span>
              <span id="batch-master-count" style="font-size: 13px; font-weight: 600; color: var(--text-muted, #64748b);">0 of 0 files completed</span>
            </div>
            <div style="text-align: right;">
              <span id="batch-master-bytes" style="font-size: 12.5px; font-weight: 600; color: var(--text-main, #0f172a); display: block;">0 B / 0 B</span>
              <span id="batch-master-speed" style="font-size: 11.5px; color: var(--text-muted, #64748b);">Speed: -- MB/s • ETA: --</span>
            </div>
          </div>

          <!-- Overall Linear Master Progress Bar -->
          <div style="width: 100%; height: 10px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; position: relative;">
            <div id="batch-master-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #30050d, #6b1426, #b91c1c); border-radius: 9999px; transition: width 0.25s ease;"></div>
          </div>
        </div>

        <!-- Per-File Individual Gauges List -->
        <div style="padding: 0 24px 20px 24px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #64748b); margin-bottom: 10px;">
            Files in Queue
          </div>
          <div id="batch-files-container" style="max-height: 250px; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 8px;">
            <!-- File rows injected dynamically -->
          </div>
        </div>

        <!-- Footer Notification -->
        <div id="batch-footer-note" style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid var(--border-subtle, #e2e8f0); display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--text-muted, #64748b);">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block;"></span>
            <span>Files processed entirely within your device memory</span>
          </div>
          <span id="batch-elapsed-timer" style="font-variant-numeric: tabular-nums; font-weight: 600;">Elapsed: 0.0s</span>
        </div>

      </div>
    `;

    document.body.appendChild(this.modal);

    const cancelBtn = this.modal.querySelector('#btn-cancel-batch');
    if (cancelBtn) {
      cancelBtn.onclick = () => this.cancelBatch();
    }
  }

  /**
   * Starts a new batch progress monitoring session.
   */
  startBatch({ title, subtitle, files, onCancel }) {
    if (!this.modal) this.init();

    this.isCancelled = false;
    this.onCancelCallback = onCancel || null;
    this.startTime = Date.now();
    this.processedBytes = 0;

    this.files = files.map((f, idx) => ({
      index: idx,
      name: f.name || `Document_${idx + 1}.pdf`,
      size: f.size || (f.bytes ? f.bytes.byteLength : 0),
      bytes: f.bytes || null,
      status: 'queued', // 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
      progress: 0,
      metric: null,
      error: null
    }));

    this.totalBytes = this.files.reduce((acc, f) => acc + (f.size || 0), 0);

    if (!this.modal) return;

    const titleEl = this.modal.querySelector('#batch-progress-title');
    const subEl = this.modal.querySelector('#batch-progress-subtitle');
    const cancelBtn = this.modal.querySelector('#btn-cancel-batch');

    if (titleEl) titleEl.textContent = title || `Batch Processing (${this.files.length} Files)`;
    if (subEl) subEl.textContent = subtitle || 'Pure client-side processing • Zero telemetry';
    if (cancelBtn) {
      cancelBtn.style.display = 'inline-flex';
      cancelBtn.disabled = false;
      cancelBtn.innerHTML = `
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <span>Cancel Batch</span>
      `;
    }

    this.renderFilesList();
    this.updateMasterProgress();

    this.modal.style.display = 'flex';
  }

  /**
   * Renders the itemized list of files with their initial status.
   */
  renderFilesList() {
    const container = this.modal.querySelector('#batch-files-container');
    if (!container) return;

    container.innerHTML = this.files.map((file, idx) => {
      const ext = (file.name.split('.').pop() || 'PDF').toUpperCase();
      let badgeColor = '#30050d';
      let badgeBg = 'rgba(48, 5, 13, 0.08)';

      if (['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext)) {
        badgeColor = '#047857';
        badgeBg = 'rgba(4, 120, 87, 0.1)';
      } else if (['DOC', 'DOCX'].includes(ext)) {
        badgeColor = '#2563eb';
        badgeBg = 'rgba(37, 99, 235, 0.1)';
      } else if (['XLS', 'XLSX', 'CSV'].includes(ext)) {
        badgeColor = '#059669';
        badgeBg = 'rgba(5, 150, 105, 0.1)';
      } else if (['PPT', 'PPTX'].includes(ext)) {
        badgeColor = '#d97706';
        badgeBg = 'rgba(217, 119, 6, 0.1)';
      }

      return `
        <div id="batch-file-row-${idx}" style="background: var(--bg-card, #f8fafc); border: 1px solid var(--border-subtle, #e2e8f0); border-radius: 10px; padding: 10px 14px; transition: all 0.2s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
              <span style="font-size: 10px; font-weight: 800; color: ${badgeColor}; background: ${badgeBg}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                ${ext}
              </span>
              <span style="font-size: 13px; font-weight: 600; color: var(--text-main, #0f172a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px;" title="${file.name}">
                ${file.name}
              </span>
              <span style="font-size: 11px; color: var(--text-muted, #64748b);">
                (${formatBytes(file.size)})
              </span>
            </div>
            <div id="batch-file-status-${idx}" style="font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              <span style="color: #94a3b8;">Queued</span>
            </div>
          </div>
          <!-- Individual File Progress Bar -->
          <div style="width: 100%; height: 5px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
            <div id="batch-file-bar-${idx}" style="height: 100%; width: 0%; background: #30050d; border-radius: 9999px; transition: width 0.2s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Updates an individual file's progress and status pill.
   */
  updateFileProgress(fileIdx, percent, statusText = null) {
    if (!this.files[fileIdx]) return;
    const file = this.files[fileIdx];

    file.progress = Math.max(0, Math.min(100, Math.round(percent)));
    if (file.status === 'queued') file.status = 'processing';

    if (this.modal) {
      const row = this.modal.querySelector(`#batch-file-row-${fileIdx}`);
      const bar = this.modal.querySelector(`#batch-file-bar-${fileIdx}`);
      const status = this.modal.querySelector(`#batch-file-status-${fileIdx}`);

      if (row && file.status === 'processing') {
        row.style.borderColor = 'rgba(48, 5, 13, 0.3)';
        row.style.background = '#ffffff';
      }

      if (bar) {
        bar.style.width = `${file.progress}%`;
        bar.style.background = '#30050d';
      }

      if (status) {
        status.innerHTML = `
          <span class="spinner" style="width: 11px; height: 11px; border: 2px solid #e2e8f0; border-top-color: var(--primary, #30050d); border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite;"></span>
          <span style="color: var(--primary, #30050d);">${statusText || `${file.progress}%`}</span>
        `;
      }
    }

    this.updateMasterProgress();
  }

  /**
   * Marks an individual file as completed.
   */
  completeFile(fileIdx, { metric = null } = {}) {
    if (!this.files[fileIdx]) return;
    const file = this.files[fileIdx];

    file.status = 'completed';
    file.progress = 100;
    file.metric = metric;

    if (this.modal) {
      const row = this.modal.querySelector(`#batch-file-row-${fileIdx}`);
      const bar = this.modal.querySelector(`#batch-file-bar-${fileIdx}`);
      const status = this.modal.querySelector(`#batch-file-status-${fileIdx}`);

      if (row) {
        row.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        row.style.background = 'rgba(240, 253, 244, 0.5)';
      }

      if (bar) {
        bar.style.width = '100%';
        bar.style.background = '#22c55e';
      }

      if (status) {
        const metricLabel = metric ? `<span style="color: #15803d; font-size: 11px; margin-left: 4px;">(${metric})</span>` : '';
        status.innerHTML = `
          <svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="color: #15803d;">Done</span>
          ${metricLabel}
        `;
      }
    }

    this.updateMasterProgress();
  }

  /**
   * Marks an individual file as failed.
   */
  failFile(fileIdx, error) {
    if (!this.files[fileIdx]) return;
    const file = this.files[fileIdx];

    file.status = 'failed';
    file.error = error ? (error.message || String(error)) : 'Error';

    if (this.modal) {
      const row = this.modal.querySelector(`#batch-file-row-${fileIdx}`);
      const bar = this.modal.querySelector(`#batch-file-bar-${fileIdx}`);
      const status = this.modal.querySelector(`#batch-file-status-${fileIdx}`);

      if (row) {
        row.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        row.style.background = 'rgba(254, 242, 242, 0.5)';
      }

      if (bar) {
        bar.style.background = '#ef4444';
      }

      if (status) {
        status.innerHTML = `
          <svg width="14" height="14" fill="none" stroke="#ef4444" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span style="color: #b91c1c;">Failed</span>
        `;
      }
    }

    this.updateMasterProgress();
  }

  /**
   * Updates master progress gauge, byte totals, speed, and ETA.
   */
  updateMasterProgress() {
    const completedFiles = this.files.filter(f => f.status === 'completed').length;
    const totalFiles = this.files.length;

    // Calculate processed bytes weighted by file progress
    let currentProcessedBytes = 0;
    this.files.forEach(f => {
      const size = f.size || 0;
      currentProcessedBytes += size * (f.progress / 100);
    });
    this.processedBytes = Math.round(currentProcessedBytes);

    if (!this.modal) return;

    const percent = this.totalBytes > 0
      ? Math.max(0, Math.min(100, Math.round((this.processedBytes / this.totalBytes) * 100)))
      : Math.round((completedFiles / totalFiles) * 100);

    const elapsedSeconds = Math.max(0.1, (Date.now() - (this.startTime || Date.now())) / 1000);
    const speedBytesPerSec = this.processedBytes / elapsedSeconds;
    const remainingBytes = Math.max(0, this.totalBytes - this.processedBytes);
    const etaSeconds = speedBytesPerSec > 0 ? Math.round(remainingBytes / speedBytesPerSec) : 0;

    const masterPercentEl = this.modal.querySelector('#batch-master-percent');
    const masterCountEl = this.modal.querySelector('#batch-master-count');
    const masterBytesEl = this.modal.querySelector('#batch-master-bytes');
    const masterSpeedEl = this.modal.querySelector('#batch-master-speed');
    const masterBarEl = this.modal.querySelector('#batch-master-bar');
    const elapsedEl = this.modal.querySelector('#batch-elapsed-timer');

    if (masterPercentEl) masterPercentEl.textContent = `${percent}%`;
    if (masterCountEl) masterCountEl.textContent = `${completedFiles} of ${totalFiles} files completed`;
    if (masterBytesEl) masterBytesEl.textContent = `${formatBytes(this.processedBytes)} / ${formatBytes(this.totalBytes)}`;
    if (masterBarEl) masterBarEl.style.width = `${percent}%`;
    if (elapsedEl) elapsedEl.textContent = `Elapsed: ${elapsedSeconds.toFixed(1)}s`;

    if (masterSpeedEl) {
      if (percent >= 100) {
        masterSpeedEl.textContent = `Completed in ${elapsedSeconds.toFixed(1)}s (Avg ${formatBytes(speedBytesPerSec)}/s)`;
      } else {
        masterSpeedEl.textContent = `Speed: ${formatBytes(speedBytesPerSec)}/s • ETA: ~${etaSeconds}s`;
      }
    }
  }

  /**
   * Graceful user cancellation.
   */
  cancelBatch() {
    this.isCancelled = true;

    // Mark all currently queued or processing files as cancelled
    this.files.forEach((file, idx) => {
      if (file.status === 'queued' || file.status === 'processing') {
        file.status = 'cancelled';
        if (this.modal) {
          const row = this.modal.querySelector(`#batch-file-row-${idx}`);
          const status = this.modal.querySelector(`#batch-file-status-${idx}`);
          if (row) row.style.opacity = '0.6';
          if (status) {
            status.innerHTML = `<span style="color: #f97316;">Cancelled</span>`;
          }
        }
      }
    });

    if (this.modal) {
      const titleEl = this.modal.querySelector('#batch-progress-title');
      const cancelBtn = this.modal.querySelector('#btn-cancel-batch');

      if (titleEl) titleEl.textContent = 'Batch Cancelled';
      if (cancelBtn) {
        cancelBtn.disabled = true;
        cancelBtn.innerHTML = `<span>Batch Stopped</span>`;
      }
    }

    if (typeof this.onCancelCallback === 'function') {
      this.onCancelCallback();
    }

    setTimeout(() => {
      this.close();
    }, 1200);
  }

  /**
   * Finalizes batch execution and displays celebration state.
   */
  finish() {
    this.updateMasterProgress();

    const titleEl = this.modal.querySelector('#batch-progress-title');
    const masterBar = this.modal.querySelector('#batch-master-bar');
    const cancelBtn = this.modal.querySelector('#btn-cancel-batch');

    if (titleEl) titleEl.textContent = 'All Files Processed Successfully! 🎉';
    if (masterBar) masterBar.style.background = '#22c55e';
    if (cancelBtn) cancelBtn.style.display = 'none';

    setTimeout(() => {
      this.close();
    }, 900);
  }

  /**
   * Closes the batch progress modal.
   */
  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const batchProgressModal = new BatchProgressModal();
