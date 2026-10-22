/**
 * Compare PDF Modal Component
 * Compares two PDF documents side-by-side, detects text and structural differences,
 * shows page-level insertion/deletion breakdowns and similarity score metrics,
 * and exports a visual comparison summary PDF report.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';

export class CompareModal {
  constructor() {
    this.modal = null;
    this.bytesA = null;
    this.bytesB = null;
    this.nameA = 'Document A';
    this.nameB = 'Document B';
    this.comparisonResult = null;
    this.isComparing = false;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'compare-pdf-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog modal-lg" style="max-width: 840px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(99,102,241,0.12); color:#6366f1; display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M16 3h5v5M4 20L20 4M21 16v5h-5M15 15l6 6M4 4l5 5"></path>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" style="margin:0; font-size:18px;">Compare PDF Documents</h2>
              <p class="modal-subtitle" style="margin:0; font-size:12px; color:var(--text-muted);">Side-by-side visual diff analysis and similarity metrics (Client-Side)</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-compare">&times;</button>
        </div>

        <div class="modal-body" style="padding:20px; max-height: 70vh; overflow-y: auto;">
          <!-- Dual Document Dropzones -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
            <!-- Document A -->
            <div style="border:2px dashed var(--border-subtle); border-radius:12px; padding:16px; text-align:center; background:var(--bg-secondary); position:relative;" id="drop-compare-a">
              <input type="file" id="input-compare-a" accept="application/pdf" style="display:none;" />
              <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--primary); margin-bottom:8px;">Base Document (A)</div>
              <div id="status-compare-a" style="font-size:13px; font-weight:500; color:var(--text-main); margin-bottom:8px; word-break:break-all;">Current Loaded Document</div>
              <button class="btn btn-sm btn-outline" id="btn-browse-compare-a">Choose PDF A</button>
            </div>

            <!-- Document B -->
            <div style="border:2px dashed var(--border-subtle); border-radius:12px; padding:16px; text-align:center; background:var(--bg-secondary); position:relative;" id="drop-compare-b">
              <input type="file" id="input-compare-b" accept="application/pdf" style="display:none;" />
              <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#ec4899; margin-bottom:8px;">Modified Document (B)</div>
              <div id="status-compare-b" style="font-size:13px; font-weight:500; color:var(--text-muted); margin-bottom:8px; word-break:break-all;">No document selected</div>
              <button class="btn btn-sm btn-outline" id="btn-browse-compare-b">Choose PDF B</button>
            </div>
          </div>

          <!-- Compare Action Button -->
          <div style="text-align:center; margin-bottom:20px;">
            <button class="btn btn-primary" id="btn-run-compare" style="min-width:200px; padding:10px 24px; font-size:15px;" disabled>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Compare Documents</span>
            </button>
          </div>

          <!-- Loading State -->
          <div id="compare-loading-state" style="display:none; text-align:center; padding:32px 20px;">
            <div class="spinner" style="width:36px; height:36px; border:3px solid var(--border-subtle); border-top-color:var(--primary); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px;"></div>
            <p style="font-size:14px; color:var(--text-muted); margin:0;">Parsing content streams and computing diffs...</p>
          </div>

          <!-- Comparison Results Panel -->
          <div id="compare-results-panel" style="display:none;">
            <!-- Metrics Bar -->
            <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:12px; padding:16px; margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div>
                  <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Similarity Match</span>
                  <div style="font-size:24px; font-weight:800; color:var(--text-main);" id="compare-score-badge">--%</div>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Differences Found</span>
                  <div style="font-size:24px; font-weight:800;" id="compare-diff-badge">0</div>
                </div>
              </div>
              <div style="height:8px; background:var(--border-subtle); border-radius:4px; overflow:hidden;">
                <div id="compare-score-bar" style="height:100%; width:0%; background:#10b981; transition:width 0.5s ease;"></div>
              </div>
            </div>

            <!-- Page Diff Table -->
            <div style="border:1px solid var(--border-subtle); border-radius:10px; overflow:hidden; margin-bottom:16px;">
              <div style="background:var(--bg-secondary); padding:10px 16px; font-weight:600; font-size:13px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between;">
                <span>Page Breakdown</span>
                <span>Status & Modifications</span>
              </div>
              <div id="compare-page-rows" style="max-height:220px; overflow-y:auto;">
              </div>
            </div>

            <!-- Download Report Button -->
            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button class="btn btn-outline" id="btn-download-compare-report">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Download Comparison Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('#btn-close-compare').addEventListener('click', () => this.hide());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    const fileA = this.modal.querySelector('#input-compare-a');
    const fileB = this.modal.querySelector('#input-compare-b');
    const btnA = this.modal.querySelector('#btn-browse-compare-a');
    const btnB = this.modal.querySelector('#btn-browse-compare-b');
    const btnRun = this.modal.querySelector('#btn-run-compare');
    const btnReport = this.modal.querySelector('#btn-download-compare-report');

    btnA.addEventListener('click', () => fileA.click());
    btnB.addEventListener('click', () => fileB.click());

    fileA.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        this.nameA = file.name;
        this.bytesA = await readFileAsArrayBuffer(file);
        this.modal.querySelector('#status-compare-a').textContent = file.name;
        this.modal.querySelector('#status-compare-a').style.color = 'var(--text-main)';
        this.checkCanRun();
      }
    });

    fileB.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        this.nameB = file.name;
        this.bytesB = await readFileAsArrayBuffer(file);
        this.modal.querySelector('#status-compare-b').textContent = file.name;
        this.modal.querySelector('#status-compare-b').style.color = 'var(--text-main)';
        this.checkCanRun();
      }
    });

    btnRun.addEventListener('click', () => this.runComparison());
    btnReport.addEventListener('click', () => this.downloadReport());
  }

  checkCanRun() {
    const btnRun = this.modal.querySelector('#btn-run-compare');
    if (this.bytesA && this.bytesB) {
      btnRun.disabled = false;
    } else {
      btnRun.disabled = true;
    }
  }

  async show() {
    if (!this.modal) return;
    this.modal.style.display = 'flex';

    // Populate Doc A from current engine if available
    if (pdfEngine.rawBytes) {
      this.bytesA = pdfEngine.rawBytes;
      this.nameA = store.getState().metadata?.title || 'Current Document.pdf';
      this.modal.querySelector('#status-compare-a').textContent = this.nameA;
      this.modal.querySelector('#status-compare-a').style.color = 'var(--text-main)';
    }

    this.checkCanRun();
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }

  async runComparison() {
    if (!this.bytesA || !this.bytesB || this.isComparing) return;

    this.isComparing = true;
    const loadingState = this.modal.querySelector('#compare-loading-state');
    const resultsPanel = this.modal.querySelector('#compare-results-panel');
    const btnRun = this.modal.querySelector('#btn-run-compare');

    loadingState.style.display = 'block';
    resultsPanel.style.display = 'none';
    btnRun.disabled = true;

    try {
      this.comparisonResult = await pdfEngine.comparePdfs(this.bytesA, this.bytesB);
      this.renderResults(this.comparisonResult);
      Toast.show(`Comparison complete: ${this.comparisonResult.similarityScore}% match`, 'success');
    } catch (err) {
      console.error('Comparison error:', err);
      Toast.show('Failed to compare documents: ' + err.message, 'error');
    } finally {
      this.isComparing = false;
      loadingState.style.display = 'none';
      btnRun.disabled = false;
    }
  }

  renderResults(result) {
    const resultsPanel = this.modal.querySelector('#compare-results-panel');
    const scoreBadge = this.modal.querySelector('#compare-score-badge');
    const scoreBar = this.modal.querySelector('#compare-score-bar');
    const diffBadge = this.modal.querySelector('#compare-diff-badge');
    const pageRows = this.modal.querySelector('#compare-page-rows');

    scoreBadge.textContent = `${result.similarityScore}%`;
    scoreBar.style.width = `${result.similarityScore}%`;

    if (result.similarityScore >= 90) {
      scoreBar.style.background = '#10b981'; // Green
      diffBadge.style.color = '#10b981';
    } else if (result.similarityScore >= 60) {
      scoreBar.style.background = '#f59e0b'; // Amber
      diffBadge.style.color = '#f59e0b';
    } else {
      scoreBar.style.background = '#ef4444'; // Red
      diffBadge.style.color = '#ef4444';
    }

    diffBadge.textContent = `${result.diffCount} diff${result.diffCount === 1 ? '' : 's'}`;

    pageRows.innerHTML = '';
    result.pageDiffs.forEach(p => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 16px; border-bottom:1px solid var(--border-subtle); font-size:13px;';

      let badgeColor = '#10b981';
      let badgeBg = 'rgba(16,185,129,0.12)';
      let label = 'Identical';

      if (p.diffType === 'modified') {
        badgeColor = '#f59e0b';
        badgeBg = 'rgba(245,158,11,0.12)';
        label = `Modified (+${p.addedWords.length}, -${p.removedWords.length})`;
      } else if (p.diffType === 'added') {
        badgeColor = '#3b82f6';
        badgeBg = 'rgba(59,130,246,0.12)';
        label = 'Added Page';
      } else if (p.diffType === 'removed') {
        badgeColor = '#ef4444';
        badgeBg = 'rgba(239,68,68,0.12)';
        label = 'Removed Page';
      }

      row.innerHTML = `
        <span style="font-weight:600; color:var(--text-main);">Page ${p.pageNum}</span>
        <span style="font-size:12px; font-weight:600; padding:3px 8px; border-radius:6px; background:${badgeBg}; color:${badgeColor};">${label}</span>
      `;
      pageRows.appendChild(row);
    });

    resultsPanel.style.display = 'block';
  }

  downloadReport() {
    if (!this.comparisonResult || !this.comparisonResult.reportPdfBytes) {
      Toast.show('No comparison report available', 'warning');
      return;
    }
    const blob = new Blob([this.comparisonResult.reportPdfBytes], { type: 'application/pdf' });
    downloadBlob(blob, 'LetsEdit-PDF-Comparison-Report.pdf');
    Toast.show('Comparison report downloaded!', 'success');
  }
}

export const compareModal = new CompareModal();
