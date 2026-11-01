/**
 * All Tools Hub Modal Component (Canva & Sejda style)
 * Provides a clean, visual grid of all 34 PDF studio tools with instant search and categories.
 */

import { store } from '../core/state-store.js';
import { WORKFLOW_TOOLS_CONFIG } from './workflow/tools-config.js';
import { downloadBlob } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { Toast } from './toast.js';
import { getTwoToneIconSvg } from './landing/landing-icons.js';

import {
  LETSEDIT_TOOL_CATEGORIES,
  SMALLPDF_DIRECTORIES,
  TOOLS_CATALOG,
  getMiniIconSvg,
  getSmallpdfIconHtml,
  renderDirectoryItemHtml
} from "./tools-catalog-data.js";

export {
  LETSEDIT_TOOL_CATEGORIES,
  SMALLPDF_DIRECTORIES,
  TOOLS_CATALOG,
  getMiniIconSvg,
  getSmallpdfIconHtml,
  renderDirectoryItemHtml
};

export class AllToolsModal {
  constructor() {
    this.modal = null;
    this.activeFilter = 'all';
    this.searchQuery = '';
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'all-tools-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog tools-hub-dialog">
        <div class="modal-header tools-hub-header">
          <div class="tools-hub-brand">
            <div>
              <div class="tools-hub-title-row">
                <h3 class="tools-hub-title">PDF Studio Tools Hub</h3>
              </div>
              <p class="tools-hub-subtitle">Quickly find, filter, and launch any PDF editing, organization, or conversion tool</p>
            </div>
          </div>
          <button class="modal-close-icon-btn modal-close-btn" aria-label="Close modal">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Search & Filter Rail -->
        <div class="tools-hub-controls">
          <div class="modal-search-wrapper">
            <svg class="modal-search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
            <input type="text" id="all-tools-search" class="modal-search-input" placeholder="Search 35+ PDF tools (e.g. compress, split, crop, sign, word, bates, redact)..." autocomplete="off" />
            <div class="modal-search-meta">
              <button id="all-tools-search-clear" class="modal-search-clear" style="display: none;" title="Clear search" aria-label="Clear">&times;</button>
              <span class="modal-shortcut-badge"><kbd>ESC</kbd></span>
            </div>
          </div>

          <div class="modal-filter-rail" id="all-tools-filter-chips">
            <button class="tool-filter-chip active" data-filter="all"><span class="chip-dot"></span>All Tools</button>
            <button class="tool-filter-chip" data-filter="popular">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Most Popular</span>
            </button>
            <button class="tool-filter-chip" data-filter="merge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>Merge &amp; Combine</span>
            </button>
            <button class="tool-filter-chip" data-filter="split">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
              <span>Split &amp; Extract</span>
            </button>
            <button class="tool-filter-chip" data-filter="edit-sign">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Edit &amp; Sign</span>
            </button>
            <button class="tool-filter-chip" data-filter="compress-scans">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              <span>Compress &amp; OCR</span>
            </button>
            <button class="tool-filter-chip" data-filter="security">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Security &amp; Redact</span>
            </button>
            <button class="tool-filter-chip" data-filter="convert-from">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              <span>Convert from PDF</span>
            </button>
            <button class="tool-filter-chip" data-filter="convert-to">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="12" x2="12" y2="18"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              <span>Convert to PDF</span>
            </button>
            <button class="tool-filter-chip" data-filter="others">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18M6 8l6-5 6 5M6 8l-3 7h6L6 8zm12 0l-3 7h6l-3-7z"></path></svg>
              <span>Page Operations</span>
            </button>
          </div>
        </div>

        <!-- Cards Grid Container -->
        <div class="modal-body tools-hub-body">
          <div id="all-tools-grid"></div>
        </div>

        <div class="modal-footer tools-hub-footer">
          <div class="tools-hub-footer-hint">
            <kbd class="tools-hub-kbd">ESC</kbd>
            <span>to close</span>
            <span class="tools-hub-divider">•</span>
            <span class="tools-hub-sec-hint">Select any card to launch immediately</span>
          </div>
          <button class="btn btn-outline btn-sm modal-close-btn tools-hub-close-cta">Close Hub</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
    this.renderGrid();
  }

  getToolIconSvg(icon) {
    const icons = {
      edit: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
      compress: '<path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path>',
      sign: '<path d="M3 17l6-6 4 4 8-8"></path><path d="M14 7h7v7"></path>',
      trash: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
      split: '<path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22V2"></path>',
      merge: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>',
      crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path>',
      image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
      grid: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
      shuffle: '<polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line>',
      layout: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line><line x1="12" y1="3" x2="12" y2="21"></line>',
      maximize: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>',
      rotate: '<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>',
      type: '<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>',
      pen: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>',
      marker: '<path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>',
      eraser: '<path d="M18 13l-7-7L3 14l7 7 8-8z"></path><line x1="14" y1="22" x2="22" y2="22"></line>',
      square: '<rect x="3" y="3" width="18" height="18" rx="2"></rect>',
      shapes: '<polygon points="12 2 2 22 22 22"></polygon>',
      'check-square': '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
      stamp: '<path d="M5 22h14"></path><path d="M12 2v10"></path><path d="M8 7l4-5 4 5"></path><rect x="5" y="16" width="14" height="6" rx="2"></rect>',
      search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
      droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>',
      hash: '<line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
      layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
      images: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
      flip: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path>',
      'circle-half': '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"></path>',
      'align-left': '<line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line>',
      tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
      star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
      word: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
      excel: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line>',
      ppt: '<rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
      code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
      bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>',
      unlock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>',
      'trash-2': '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
      camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>',
      extract: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>'
    };

    return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${icons[icon] || icons.edit}</svg>`;
  }

  bindEvents() {
    this.modal.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.onclick = () => this.hide();
    });

    const searchInput = this.modal.querySelector('#all-tools-search');
    const clearBtn = this.modal.querySelector('#all-tools-search-clear');

    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) clearBtn.style.display = e.target.value ? 'flex' : 'none';
        this.renderGrid();
      };
    }

    if (clearBtn && searchInput) {
      clearBtn.onclick = () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        this.renderGrid();
      };
    }

    const chips = this.modal.querySelectorAll('.tool-filter-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.dataset.filter;
        this.renderGrid();
      };
    });
  }

  renderGrid() {
    const grid = this.modal.querySelector('#all-tools-grid');
    if (!grid) return;

    // 1. If searching, flat filter across all tools
    if (this.searchQuery) {
      const q = this.searchQuery;
      const allTools = [];
      const seen = new Set();
      SMALLPDF_DIRECTORIES.forEach(col => {
        col.sections.forEach(sec => {
          sec.tools.forEach(t => {
            if (!seen.has(t.title.toLowerCase())) {
              seen.add(t.title.toLowerCase());
              allTools.push(t);
            }
          });
        });
      });

      const filtered = allTools.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
            <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 10px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">No tools found matching "${this.searchQuery}"</div>
            <p style="font-size: 13px; margin-top: 6px; color: var(--text-muted);">Try searching for "compress", "split", "word", "sign", or "redact"</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = `
        <div class="tools-dir-search-grid">
          ${filtered.map(tool => renderDirectoryItemHtml(tool)).join('')}
        </div>
      `;
      this.attachCardEvents(grid);
      return;
    }

    // 2. If a specific category filter is chosen
    if (this.activeFilter !== 'all') {
      const target = this.activeFilter.toLowerCase();
      const matchedCols = [];

      SMALLPDF_DIRECTORIES.forEach(col => {
        const matchedSections = col.sections.filter(sec => {
          if (target === 'popular') return sec.title === 'Compress' || sec.title === 'Organize' || sec.title === 'Edit' || sec.title === 'Fill & Sign';
          if (target === 'merge') return sec.title === 'Organize';
          if (target === 'split') return sec.title === 'Organize';
          if (target === 'edit-sign') return sec.title === 'Edit' || sec.title === 'Fill & Sign';
          if (target === 'compress-scans') return sec.title === 'Compress' || sec.title === 'Scan';
          if (target === 'security') return sec.title === 'Protect';
          if (target === 'convert-from') return sec.title === 'Convert' || sec.title === 'PDF to Image' || sec.title === 'PDF to Office';
          if (target === 'convert-to') return sec.title === 'Image to PDF' || sec.title === 'Office to PDF' || sec.title === 'OpenOffice to PDF' || sec.title === 'Convert to PDF' || sec.title === 'iWork to PDF';
          return sec.title.toLowerCase().includes(target);
        });

        if (matchedSections.length > 0) {
          matchedCols.push({ col: col.col, sections: matchedSections });
        }
      });

      if (matchedCols.length > 0) {
        grid.innerHTML = `
          <div class="tools-dir-grid" style="grid-template-columns: repeat(${Math.min(matchedCols.length, 6)}, minmax(130px, 1fr));">
            ${matchedCols.map(col => `
              <div class="tools-dir-col">
                ${col.sections.map(sec => `
                  <div class="tools-dir-section">
                    <div class="tools-dir-sec-title">${sec.title}</div>
                    ${sec.tools.map(tool => renderDirectoryItemHtml(tool)).join('')}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        `;
        this.attachCardEvents(grid);
        return;
      }
    }

    // 3. Default: Render EXACT 8-COLUMN DIRECTORY from user screenshot!
    grid.innerHTML = `
      <div class="tools-dir-grid">
        ${SMALLPDF_DIRECTORIES.map(col => `
          <div class="tools-dir-col">
            ${col.sections.map(sec => `
              <div class="tools-dir-section">
                <div class="tools-dir-sec-title">${sec.title}</div>
                ${sec.tools.map(tool => renderDirectoryItemHtml(tool)).join('')}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;

    this.attachCardEvents(grid);
  }

  attachCardEvents(container) {
    container.querySelectorAll('.tools-dir-item, .landing-tool-card, .tool-card-item').forEach(card => {
      card.onclick = () => {
        const action = card.getAttribute('data-action');
        const toolId = card.getAttribute('data-tool-id');
        this.dispatchToolAction(action, toolId);
      };
    });
  }

  dispatchToolAction(action, toolId = null) {
    this.hide();
    if (!action) return;

    // 1. Dedicated tool workflow
    if (action.startsWith('workflow:')) {
      const toolKey = action.replace('workflow:', '');
      router.navigate(router.getCanonicalPath(toolKey));
      return;
    }

    if (toolId && WORKFLOW_TOOLS_CONFIG[toolId]) {
      router.navigate(router.getCanonicalPath(toolId));
      return;
    }

    // 2. Editor in-studio modals & canvas tools
    this.executeAction(action);
  }

  executeAction(action) {
    if (!action) return;

    if (action.startsWith('workflow:')) {
      const toolKey = action.replace('workflow:', '');
      router.navigate(router.getCanonicalPath(toolKey));
      return;
    }

    // Ensure studio view is visible if navigating from landing page
    if (document.body.classList.contains('show-landing')) {
      document.body.classList.remove('show-landing');
      document.body.classList.add('show-studio');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    if (action.startsWith('tool:')) {
      const tool = action.replace('tool:', '');
      const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
      if (btn) btn.click();
    } else if (action === 'modal:compress') {
      import('./compress-modal.js').then(m => m.compressModal.show());
    } else if (action === 'modal:split') {
      import('./split-modal.js').then(m => m.splitModal.show());
    } else if (action === 'modal:split-half') {
      import('./split-half-modal.js').then(m => m.splitHalfModal.show());
    } else if (action === 'modal:alternate-mix') {
      import('./alternate-mix-modal.js').then(m => m.alternateMixModal.show());
    } else if (action === 'modal:nup') {
      import('./nup-modal.js').then(m => m.nUpModal.show());
    } else if (action === 'modal:crop') {
      import('./crop-modal.js').then(m => m.cropModal.show());
    } else if (action === 'modal:resize') {
      import('./resize-modal.js').then(m => m.resizeModal.show());
    } else if (action === 'modal:flip') {
      import('./flip-modal.js').then(m => m.flipModal.show());
    } else if (action === 'modal:grayscale') {
      import('./grayscale-modal.js').then(m => m.grayscaleModal.show());
    } else if (action === 'modal:to-image') {
      import('./pdf-to-image-modal.js').then(m => m.pdfToImageModal.show());
    } else if (action === 'modal:extract-images') {
      import('./extract-images-modal.js').then(m => m.extractImagesModal.open());
    } else if (action === 'modal:ocr') {
      import('./ocr-modal.js').then(m => m.ocrModal.show());
    } else if (action === 'modal:compare') {
      import('./compare-modal.js').then(m => m.compareModal.show());
    } else if (action === 'modal:repair') {
      import('./repair-modal.js').then(m => m.repairModal.show());
    } else if (action === 'modal:pdfa') {
      import('./pdfa-modal.js').then(m => m.pdfaModal.show());
    } else if (action === 'modal:security') {
      const btn = document.getElementById('btn-open-security');
      if (btn) btn.click();
    } else if (action === 'modal:watermark') {
      const btn = document.getElementById('btn-open-watermark');
      if (btn) btn.click();
    } else if (action === 'modal:pagenumbers') {
      const btn = document.getElementById('btn-open-pagenumbers');
      if (btn) btn.click();
    } else if (action === 'modal:bates') {
      import('./bates-modal.js').then(m => m.batesModal.show());
    } else if (action === 'modal:metadata') {
      import('./metadata-modal.js').then(m => m.metadataModal.show());
    } else if (action === 'sidebar:open' || action === 'sidebar:delete' || action === 'sidebar:merge') {
      document.body.classList.add('sidebar-open');
      Toast.info('Opened page organization sidebar');
    } else if (action === 'action:flatten') {
      store.setFlattenForms(true);
      Toast.success('Form fields set to flatten into vectors on export');
    } else if (action === 'action:images-to-pdf') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          const buffers = await Promise.all(files.map(f => f.arrayBuffer()));
          const { pdfEngine } = await import('../core/pdf-engine.js');
          const newPdf = await pdfEngine.imagesToPdf(buffers);
          const info = await pdfEngine.loadPdf(newPdf);
          store.setDocument(newPdf, 'Images_Combined.pdf', info.numPages);
          Toast.success(`Created PDF from ${files.length} images!`);
        }
      };
      input.click();
    } else if (action === 'action:extract-text') {
      const state = store.getState();
      if (!state.pdfBytes) return Toast.error('No document loaded');
      import('../core/pdf-engine.js').then(({ pdfEngine }) => {
        pdfEngine.extractDocumentText(state.pdfBytes).then(text => {
          const blob = new Blob([text], { type: 'text/plain' });
          downloadBlob(blob, (state.documentName || 'Document').replace('.pdf', '') + '_text.txt');
          Toast.success('Extracted plain text downloaded!');
        });
      });
    }
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (this.modal) {
      this.modal.style.display = 'flex';
      const search = this.modal.querySelector('#all-tools-search');
      const clearBtn = this.modal.querySelector('#all-tools-search-clear');
      if (search) {
        search.value = '';
        this.searchQuery = '';
        if (clearBtn) clearBtn.style.display = 'none';
        setTimeout(() => search.focus(), 50);
      }
      this.renderGrid();
    }
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }
}

export const allToolsModal = new AllToolsModal();
