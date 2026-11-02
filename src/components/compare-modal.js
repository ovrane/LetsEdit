/**
 * Compare PDF Modal Component
 * Compares two PDF documents with high-fidelity visual rendering,
 * featuring interactive Side-by-Side Split View, Before/After Wipe Slider,
 * and Opacity Blend Overlay, paired with text difference metrics and visual report export.
 */

import * as pdfjsLib from 'pdfjs-dist';
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
    this.pdfDocA = null;
    this.pdfDocB = null;
    this.comparisonResult = null;
    this.isComparing = false;
    this.activeViewMode = 'side-by-side';
    this.currentPage = 1;
    this.totalPages = 1;
    this.wipePercent = 50;
    this.opacityPercent = 50;
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'compare-pdf-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog modal-lg" style="max-width: 920px; width: 95%;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(48,5,13,0.1); color:var(--primary); display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="8" height="16" rx="1.5"></rect>
                <rect x="14" y="4" width="8" height="16" rx="1.5"></rect>
                <line x1="10" y1="9" x2="14" y2="9"></line>
                <line x1="10" y1="15" x2="14" y2="15"></line>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" style="margin:0; font-size:18px;">Compare PDF Documents</h2>
              <p class="modal-subtitle" style="margin:0; font-size:12px; color:var(--text-muted);">Visual Side-by-Side Diff, Wipe Slider & Opacity Ghost Overlay (100% Client-Side)</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-compare">&times;</button>
        </div>

        <div class="modal-body" style="padding:20px; max-height: 80vh; overflow-y: auto;">
          <!-- Dual Document Dropzones -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <!-- Document A -->
            <div style="border:2px dashed var(--border-subtle); border-radius:12px; padding:16px; text-align:center; background:var(--bg-secondary); position:relative;" id="drop-compare-a">
              <input type="file" id="input-compare-a" accept="application/pdf" style="display:none;" />
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--primary); margin-bottom:6px;">Base Document (A)</div>
              <div id="status-compare-a" style="font-size:13px; font-weight:600; color:var(--text-main); margin-bottom:8px; word-break:break-all;">Current Loaded Document</div>
              <button class="btn btn-sm btn-outline" id="btn-browse-compare-a">Choose PDF A</button>
            </div>

            <!-- Document B -->
            <div style="border:2px dashed var(--border-subtle); border-radius:12px; padding:16px; text-align:center; background:var(--bg-secondary); position:relative;" id="drop-compare-b">
              <input type="file" id="input-compare-b" accept="application/pdf" style="display:none;" />
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#ec4899; margin-bottom:6px;">Modified Document (B)</div>
              <div id="status-compare-b" style="font-size:13px; font-weight:600; color:var(--text-muted); margin-bottom:8px; word-break:break-all;">No document selected</div>
              <button class="btn btn-sm btn-outline" id="btn-browse-compare-b">Choose PDF B</button>
            </div>
          </div>

          <!-- Compare Action Button -->
          <div style="text-align:center; margin-bottom:16px;">
            <button class="btn btn-primary" id="btn-run-compare" style="min-width:220px; padding:10px 24px; font-size:14px; font-weight:600;" disabled>
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Compare Documents</span>
            </button>
          </div>

          <!-- Loading State -->
          <div id="compare-loading-state" style="display:none; text-align:center; padding:32px 20px;">
            <div class="spinner" style="width:36px; height:36px; border:3px solid var(--border-subtle); border-top-color:var(--primary); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px;"></div>
            <p style="font-size:14px; color:var(--text-muted); margin:0;" id="compare-loading-status-text">Parsing vector streams and computing visual diffs...</p>
          </div>

          <!-- Comparison Results Panel -->
          <div id="compare-results-panel" style="display:none;">
            <!-- Metrics Summary Bar -->
            <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:12px; padding:14px 18px; margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div>
                  <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Similarity Match</span>
                  <div style="font-size:24px; font-weight:800; color:var(--text-main);" id="compare-score-badge">--%</div>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">Differences Found</span>
                  <div style="font-size:24px; font-weight:800;" id="compare-diff-badge">0</div>
                </div>
              </div>
              <div style="height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
                <div id="compare-score-bar" style="height:100%; width:0%; background:#10b981; transition:width 0.4s ease;"></div>
              </div>
            </div>

            <!-- View Mode Switcher Tabs -->
            <div class="compare-mode-tabs">
              <button type="button" class="compare-mode-tab active" data-mode="side-by-side">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="18" rx="1"></rect><rect x="13" y="3" width="8" height="18" rx="1"></rect></svg>
                <span>Side-by-Side</span>
              </button>
              <button type="button" class="compare-mode-tab" data-mode="wipe">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21"></line><polyline points="8 8 4 12 8 16"></polyline><polyline points="16 8 20 12 16 16"></polyline></svg>
                <span>Wipe Slider</span>
              </button>
              <button type="button" class="compare-mode-tab" data-mode="opacity">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="12" r="7"></circle><circle cx="15" cy="12" r="7"></circle></svg>
                <span>Opacity Overlay</span>
              </button>
              <button type="button" class="compare-mode-tab" data-mode="table">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                <span>Differences List</span>
              </button>
            </div>

            <!-- Page Stepper Navigation Bar -->
            <div id="compare-page-nav-bar" style="display:flex; align-items:center; justify-content:space-between; padding:8px 14px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px; margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" class="btn btn-sm btn-outline" id="btn-compare-prev-page">◀ Prev</button>
                <span id="compare-page-indicator" style="font-size:13px; font-weight:700; color:var(--text-main);">Page 1 of 1</span>
                <button type="button" class="btn btn-sm btn-outline" id="btn-compare-next-page">Next ▶</button>
              </div>
              <div id="compare-current-page-diff-tag" style="font-size:11.5px; font-weight:700; padding:3px 10px; border-radius:9999px;"></div>
            </div>

            <!-- View 1: Side-by-Side Visual Diff -->
            <div id="compare-view-side-by-side" class="compare-view-stage" style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
              <div class="compare-doc-col">
                <div class="compare-doc-header">
                  <span class="compare-doc-badge badge-a">DOC A (BASE)</span>
                  <span id="compare-label-doc-a" class="compare-doc-name">Document A</span>
                </div>
                <div class="compare-canvas-scroll-wrap" id="compare-scroll-a">
                  <canvas id="compare-canvas-a" class="compare-preview-canvas"></canvas>
                </div>
              </div>
              <div class="compare-doc-col">
                <div class="compare-doc-header">
                  <span class="compare-doc-badge badge-b">DOC B (MODIFIED)</span>
                  <span id="compare-label-doc-b" class="compare-doc-name">Document B</span>
                </div>
                <div class="compare-canvas-scroll-wrap" id="compare-scroll-b">
                  <canvas id="compare-canvas-b" class="compare-preview-canvas"></canvas>
                </div>
              </div>
            </div>

            <!-- View 2: Wipe Slider View -->
            <div id="compare-view-wipe" class="compare-view-stage" style="display:none; flex-direction:column; align-items:center;">
              <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:12px; font-weight:600;">
                <span style="color:var(--primary);">◀ Document A (Base)</span>
                <span id="compare-wipe-pct-badge" style="background:var(--primary-light); color:var(--primary); padding:2px 8px; border-radius:4px; font-family:monospace; font-weight:700;">50% Wipe</span>
                <span style="color:#ec4899;">Document B (Modified) ▶</span>
              </div>
              <div class="compare-wipe-container" id="compare-wipe-box">
                <canvas id="compare-wipe-canvas-a" class="compare-wipe-canvas-base"></canvas>
                <div class="compare-wipe-overlay-wrap" id="compare-wipe-overlay" style="clip-path: inset(0 0 0 50%);">
                  <canvas id="compare-wipe-canvas-b" class="compare-wipe-canvas-overlay"></canvas>
                </div>
                <div class="compare-wipe-handle-line" id="compare-wipe-line" style="left: 50%;">
                  <div class="compare-wipe-knob">↔</div>
                </div>
              </div>
              <div style="width:100%; max-width:480px; margin-top:12px;">
                <input type="range" id="compare-wipe-range" min="0" max="100" value="50" style="width:100%; accent-color:var(--primary); cursor:ew-resize;" />
              </div>
            </div>

            <!-- View 3: Opacity Ghost Overlay View -->
            <div id="compare-view-opacity" class="compare-view-stage" style="display:none; flex-direction:column; align-items:center;">
              <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:12px; font-weight:600;">
                <span>100% Doc A</span>
                <span id="compare-opacity-pct-badge" style="background:var(--primary-light); color:var(--primary); padding:2px 8px; border-radius:4px; font-family:monospace; font-weight:700;">50% Blend</span>
                <span>100% Doc B</span>
              </div>
              <div class="compare-opacity-container">
                <canvas id="compare-opacity-canvas-a" class="compare-opacity-canvas-base"></canvas>
                <canvas id="compare-opacity-canvas-b" class="compare-opacity-canvas-overlay" style="opacity: 0.5;"></canvas>
              </div>
              <div style="width:100%; max-width:480px; margin-top:12px;">
                <input type="range" id="compare-opacity-range" min="0" max="100" value="50" style="width:100%; accent-color:var(--primary); cursor:pointer;" />
              </div>
            </div>

            <!-- View 4: Page Breakdown Table -->
            <div id="compare-view-table" class="compare-view-stage" style="display:none; border:1px solid var(--border-subtle); border-radius:10px; overflow:hidden;">
              <div style="background:var(--bg-secondary); padding:10px 16px; font-weight:600; font-size:13px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between;">
                <span>Page Breakdown</span>
                <span>Status & Modifications</span>
              </div>
              <div id="compare-page-rows" style="max-height:260px; overflow-y:auto;"></div>
            </div>

            <!-- Actions Footer -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
              <div style="font-size:12px; color:var(--text-muted);">
                Documents processed locally in client memory with zero server uploads.
              </div>
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

    // Mode tab switching
    const tabs = this.modal.querySelectorAll('.compare-mode-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeViewMode = tab.dataset.mode;
        this.updateViewModeUI();
      });
    });

    // Page navigation
    const prevBtn = this.modal.querySelector('#btn-compare-prev-page');
    const nextBtn = this.modal.querySelector('#btn-compare-next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderActivePageVisuals();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.renderActivePageVisuals();
        }
      });
    }

    // Wipe range slider and direct container drag
    const wipeRange = this.modal.querySelector('#compare-wipe-range');
    const wipeBox = this.modal.querySelector('#compare-wipe-box');
    if (wipeRange) {
      wipeRange.addEventListener('input', (e) => {
        this.wipePercent = parseInt(e.target.value, 10);
        this.updateWipeUI();
      });
    }

    if (wipeBox) {
      let isDraggingWipe = false;
      const updateFromPointer = (e) => {
        const rect = wipeBox.getBoundingClientRect();
        if (rect.width <= 0) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        this.wipePercent = Math.round((x / rect.width) * 100);
        if (wipeRange) wipeRange.value = this.wipePercent;
        this.updateWipeUI();
      };

      wipeBox.addEventListener('mousedown', (e) => {
        isDraggingWipe = true;
        updateFromPointer(e);
      });
      window.addEventListener('mousemove', (e) => {
        if (isDraggingWipe) updateFromPointer(e);
      });
      window.addEventListener('mouseup', () => {
        isDraggingWipe = false;
      });

      wipeBox.addEventListener('touchstart', (e) => {
        isDraggingWipe = true;
        updateFromPointer(e);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (isDraggingWipe) updateFromPointer(e);
      }, { passive: true });
      window.addEventListener('touchend', () => {
        isDraggingWipe = false;
      });
    }

    // Opacity range slider
    const opacityRange = this.modal.querySelector('#compare-opacity-range');
    if (opacityRange) {
      opacityRange.addEventListener('input', (e) => {
        this.opacityPercent = parseInt(e.target.value, 10);
        this.updateOpacityUI();
      });
    }

    // Synchronized scroll for Side-by-Side view
    const scrollA = this.modal.querySelector('#compare-scroll-a');
    const scrollB = this.modal.querySelector('#compare-scroll-b');
    let isSyncingA = false;
    let isSyncingB = false;

    if (scrollA && scrollB) {
      scrollA.addEventListener('scroll', () => {
        if (!isSyncingA) {
          isSyncingB = true;
          scrollB.scrollTop = scrollA.scrollTop;
          scrollB.scrollLeft = scrollA.scrollLeft;
        }
        isSyncingA = false;
      });

      scrollB.addEventListener('scroll', () => {
        if (!isSyncingB) {
          isSyncingA = true;
          scrollA.scrollTop = scrollB.scrollTop;
          scrollA.scrollLeft = scrollB.scrollLeft;
        }
        isSyncingB = false;
      });
    }
  }

  updateViewModeUI() {
    const sbs = this.modal.querySelector('#compare-view-side-by-side');
    const wipe = this.modal.querySelector('#compare-view-wipe');
    const opacity = this.modal.querySelector('#compare-view-opacity');
    const table = this.modal.querySelector('#compare-view-table');

    if (sbs) sbs.style.display = this.activeViewMode === 'side-by-side' ? 'grid' : 'none';
    if (wipe) wipe.style.display = this.activeViewMode === 'wipe' ? 'flex' : 'none';
    if (opacity) opacity.style.display = this.activeViewMode === 'opacity' ? 'flex' : 'none';
    if (table) table.style.display = this.activeViewMode === 'table' ? 'block' : 'none';

    this.renderActivePageVisuals();
  }

  updateWipeUI() {
    const overlay = this.modal.querySelector('#compare-wipe-overlay');
    const line = this.modal.querySelector('#compare-wipe-line');
    const badge = this.modal.querySelector('#compare-wipe-pct-badge');

    if (overlay) overlay.style.clipPath = `inset(0 0 0 ${this.wipePercent}%)`;
    if (line) line.style.left = `${this.wipePercent}%`;
    if (badge) badge.textContent = `${this.wipePercent}% Wipe`;
  }

  updateOpacityUI() {
    const canvasB = this.modal.querySelector('#compare-opacity-canvas-b');
    const badge = this.modal.querySelector('#compare-opacity-pct-badge');

    if (canvasB) canvasB.style.opacity = (this.opacityPercent / 100).toString();
    if (badge) badge.textContent = `${this.opacityPercent}% Blend`;
  }

  checkCanRun() {
    const btnRun = this.modal.querySelector('#btn-run-compare');
    if (btnRun) {
      btnRun.disabled = !(this.bytesA && this.bytesB);
    }
  }

  async show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    this.modal.style.display = 'flex';

    // Populate Doc A from current engine if available
    if (pdfEngine.rawBytes) {
      this.bytesA = pdfEngine.rawBytes;
      this.nameA = store.getState().metadata?.title || 'Current Document.pdf';
      const statusA = this.modal.querySelector('#status-compare-a');
      if (statusA) {
        statusA.textContent = this.nameA;
        statusA.style.color = 'var(--text-main)';
      }
    }

    this.checkCanRun();
  }

  async showWithBytes(bytesA, bytesB, nameA = 'Document A', nameB = 'Document B') {
    this.bytesA = bytesA;
    this.bytesB = bytesB;
    this.nameA = nameA;
    this.nameB = nameB;

    if (this.modal) {
      const statusA = this.modal.querySelector('#status-compare-a');
      const statusB = this.modal.querySelector('#status-compare-b');
      if (statusA) {
        statusA.textContent = nameA;
        statusA.style.color = 'var(--text-main)';
      }
      if (statusB) {
        statusB.textContent = nameB;
        statusB.style.color = 'var(--text-main)';
      }
      this.modal.style.display = 'flex';
      this.checkCanRun();
      await this.runComparison();
    }
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

    if (loadingState) loadingState.style.display = 'block';
    if (resultsPanel) resultsPanel.style.display = 'none';
    if (btnRun) btnRun.disabled = true;

    try {
      this.comparisonResult = await pdfEngine.comparePdfs(this.bytesA, this.bytesB);

      // Load PDF.js documents for interactive canvas rendering
      if (typeof window !== 'undefined' && pdfjsLib) {
        const loadTaskA = pdfjsLib.getDocument({ data: this.bytesA });
        const loadTaskB = pdfjsLib.getDocument({ data: this.bytesB });
        this.pdfDocA = await loadTaskA.promise;
        this.pdfDocB = await loadTaskB.promise;
        this.totalPages = Math.max(this.pdfDocA.numPages, this.pdfDocB.numPages);
      } else {
        this.totalPages = Math.max(this.comparisonResult.pageCountA, this.comparisonResult.pageCountB);
      }

      this.currentPage = 1;
      this.renderResults(this.comparisonResult);
      await this.renderActivePageVisuals();

      Toast.show(`Comparison complete: ${this.comparisonResult.similarityScore}% match`, 'success');
    } catch (err) {
      console.error('Comparison error:', err);
      Toast.show('Failed to compare documents: ' + err.message, 'error');
    } finally {
      this.isComparing = false;
      if (loadingState) loadingState.style.display = 'none';
      if (btnRun) btnRun.disabled = false;
    }
  }

  renderResults(result) {
    const resultsPanel = this.modal.querySelector('#compare-results-panel');
    const scoreBadge = this.modal.querySelector('#compare-score-badge');
    const scoreBar = this.modal.querySelector('#compare-score-bar');
    const diffBadge = this.modal.querySelector('#compare-diff-badge');
    const pageRows = this.modal.querySelector('#compare-page-rows');

    if (scoreBadge) scoreBadge.textContent = `${result.similarityScore}%`;
    if (scoreBar) scoreBar.style.width = `${result.similarityScore}%`;

    if (scoreBar && diffBadge) {
      if (result.similarityScore >= 90) {
        scoreBar.style.background = '#10b981';
        diffBadge.style.color = '#10b981';
      } else if (result.similarityScore >= 60) {
        scoreBar.style.background = '#f59e0b';
        diffBadge.style.color = '#f59e0b';
      } else {
        scoreBar.style.background = '#ef4444';
        diffBadge.style.color = '#ef4444';
      }
    }

    if (diffBadge) {
      diffBadge.textContent = `${result.diffCount} diff${result.diffCount === 1 ? '' : 's'}`;
    }

    // Populate labels
    const labelA = this.modal.querySelector('#compare-label-doc-a');
    const labelB = this.modal.querySelector('#compare-label-doc-b');
    if (labelA) labelA.textContent = this.nameA;
    if (labelB) labelB.textContent = this.nameB;

    if (pageRows) {
      pageRows.innerHTML = '';
      result.pageDiffs.forEach(p => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 16px; border-bottom:1px solid var(--border-subtle); font-size:13px; cursor:pointer;';
        row.onmouseover = () => { row.style.background = 'var(--bg-app)'; };
        row.onmouseout = () => { row.style.background = 'transparent'; };

        let badgeColor = '#10b981';
        let badgeBg = 'rgba(16,185,129,0.12)';
        let label = 'Identical';

        if (p.diffType === 'modified') {
          badgeColor = '#f59e0b';
          badgeBg = 'rgba(245,158,11,0.12)';
          label = `Modified (+${p.addedWords.length}, -${p.removedWords.length})`;
        } else if (p.diffType === 'added') {
          badgeColor = '#30050d';
          badgeBg = 'rgba(48,5,13,0.1)';
          label = 'Added Page';
        } else if (p.diffType === 'removed') {
          badgeColor = '#ef4444';
          badgeBg = 'rgba(239,68,68,0.12)';
          label = 'Removed Page';
        }

        row.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:700; color:var(--text-main);">Page ${p.pageNum}</span>
            <span style="font-size:11px; color:var(--text-muted);">${p.diffType === 'modified' ? `${p.addedWords.length} additions, ${p.removedWords.length} deletions` : ''}</span>
          </div>
          <span style="font-size:12px; font-weight:700; padding:3px 8px; border-radius:6px; background:${badgeBg}; color:${badgeColor};">${label}</span>
        `;

        row.onclick = () => {
          this.currentPage = p.pageNum;
          this.activeViewMode = 'side-by-side';
          const tabs = this.modal.querySelectorAll('.compare-mode-tab');
          tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === 'side-by-side'));
          this.updateViewModeUI();
        };

        pageRows.appendChild(row);
      });
    }

    if (resultsPanel) resultsPanel.style.display = 'block';
  }

  async renderActivePageVisuals() {
    // Update Stepper
    const ind = this.modal.querySelector('#compare-page-indicator');
    const prevBtn = this.modal.querySelector('#btn-compare-prev-page');
    const nextBtn = this.modal.querySelector('#btn-compare-next-page');
    const tag = this.modal.querySelector('#compare-current-page-diff-tag');

    if (ind) ind.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;

    // Diff status tag for current page
    if (tag && this.comparisonResult && this.comparisonResult.pageDiffs) {
      const pDiff = this.comparisonResult.pageDiffs.find(p => p.pageNum === this.currentPage);
      if (pDiff) {
        if (pDiff.diffType === 'identical') {
          tag.textContent = 'Identical Page';
          tag.style.background = 'rgba(16,185,129,0.15)';
          tag.style.color = '#10b981';
        } else if (pDiff.diffType === 'modified') {
          tag.textContent = `Modified (+${pDiff.addedWords.length}, -${pDiff.removedWords.length} words)`;
          tag.style.background = 'rgba(245,158,11,0.15)';
          tag.style.color = '#d97706';
        } else if (pDiff.diffType === 'added') {
          tag.textContent = 'Page Added in Doc B';
          tag.style.background = 'rgba(48,5,13,0.12)';
          tag.style.color = 'var(--primary)';
        } else if (pDiff.diffType === 'removed') {
          tag.textContent = 'Page Removed from Doc B';
          tag.style.background = 'rgba(239,68,68,0.15)';
          tag.style.color = '#ef4444';
        }
      } else {
        tag.textContent = '';
      }
    }

    if (!this.pdfDocA && !this.pdfDocB) return;

    // Render based on active view mode
    if (this.activeViewMode === 'side-by-side') {
      const canvasA = this.modal.querySelector('#compare-canvas-a');
      const canvasB = this.modal.querySelector('#compare-canvas-b');
      if (canvasA && this.pdfDocA) await this.drawPageToCanvas(this.pdfDocA, this.currentPage, canvasA);
      if (canvasB && this.pdfDocB) await this.drawPageToCanvas(this.pdfDocB, this.currentPage, canvasB);
    } else if (this.activeViewMode === 'wipe') {
      const canvasA = this.modal.querySelector('#compare-wipe-canvas-a');
      const canvasB = this.modal.querySelector('#compare-wipe-canvas-b');
      if (canvasA && this.pdfDocA) await this.drawPageToCanvas(this.pdfDocA, this.currentPage, canvasA);
      if (canvasB && this.pdfDocB) await this.drawPageToCanvas(this.pdfDocB, this.currentPage, canvasB);
      this.updateWipeUI();
    } else if (this.activeViewMode === 'opacity') {
      const canvasA = this.modal.querySelector('#compare-opacity-canvas-a');
      const canvasB = this.modal.querySelector('#compare-opacity-canvas-b');
      if (canvasA && this.pdfDocA) await this.drawPageToCanvas(this.pdfDocA, this.currentPage, canvasA);
      if (canvasB && this.pdfDocB) await this.drawPageToCanvas(this.pdfDocB, this.currentPage, canvasB);
      this.updateOpacityUI();
    }
  }

  async drawPageToCanvas(doc, pageNum, canvas, scale = 1.25) {
    if (!doc || !canvas) return;

    if (pageNum > doc.numPages) {
      canvas.width = 450;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('(Page does not exist in this document)', canvas.width / 2, canvas.height / 2);
      return;
    }

    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.warn('Canvas page render error:', e);
    }
  }

  downloadReport() {
    if (!this.comparisonResult || !this.comparisonResult.reportPdfBytes) {
      Toast.show('No comparison report available', 'warning');
      return;
    }
    const blob = new Blob([this.comparisonResult.reportPdfBytes], { type: 'application/pdf' });
    downloadBlob(blob, `Comparison_${this.nameA.replace('.pdf','')}_vs_${this.nameB.replace('.pdf','')}.pdf`);
    Toast.show('Comparison report downloaded!', 'success');
  }
}

export const compareModal = new CompareModal();
