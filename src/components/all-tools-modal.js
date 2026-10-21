/**
 * All Tools Hub Modal Component (Canva & Sejda style)
 * Provides a clean, visual grid of all 34 PDF studio tools with instant search and categories.
 */

import { store } from '../core/state-store.js';
import { cropModal } from './crop-modal.js';
import { resizeModal } from './resize-modal.js';
import { compressModal } from './compress-modal.js';
import { metadataModal } from './metadata-modal.js';
import { batesModal } from './bates-modal.js';
import { splitModal } from './split-modal.js';
import { splitHalfModal } from './split-half-modal.js';
import { alternateMixModal } from './alternate-mix-modal.js';
import { nUpModal } from './nup-modal.js';
import { pdfToImageModal } from './pdf-to-image-modal.js';
import { flipModal } from './flip-modal.js';
import { grayscaleModal } from './grayscale-modal.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { downloadBlob } from '../utils/helpers.js';
import { Toast } from './toast.js';

export const TOOLS_CATALOG = [
  // Most Popular
  { id: 'edit', category: 'edit', title: 'PDF Editor', desc: 'Edit text, annotate, add shapes, signatures, and stamps', icon: 'edit', color: '#2563eb', popular: true, action: 'tool:select' },
  { id: 'compress', category: 'tools', title: 'Compress PDF', desc: 'Reduce file size while preserving high visual quality', icon: 'compress', color: '#059669', popular: true, action: 'modal:compress' },
  { id: 'sign', category: 'edit', title: 'Fill & Sign', desc: 'Add signatures, type handwriting, or scan paper ink via webcam', icon: 'sign', color: '#7c3aed', popular: true, action: 'tool:sign' },
  { id: 'delete', category: 'pages', title: 'Delete Pages', desc: 'Remove unwanted pages permanently from the document', icon: 'trash', color: '#ef4444', popular: true, action: 'sidebar:delete' },
  { id: 'split', category: 'pages', title: 'Split Pages', desc: 'Extract custom page ranges or save every page as separate file', icon: 'split', color: '#ea580c', popular: true, action: 'modal:split' },
  { id: 'merge', category: 'pages', title: 'Merge PDF', desc: 'Combine multiple PDFs and external files into one document', icon: 'merge', color: '#0284c7', popular: true, action: 'sidebar:merge' },
  { id: 'crop', category: 'pages', title: 'Crop PDF', desc: 'Trim margins, whitespace borders, or resize crop boxes', icon: 'crop', color: '#0d9488', popular: true, action: 'modal:crop' },
  { id: 'to-image', category: 'convert', title: 'PDF to JPG / PNG', desc: 'Convert and download pages as high-resolution images', icon: 'image', color: '#d97706', popular: true, action: 'modal:to-image' },

  // Organize & Pages
  { id: 'organize', category: 'pages', title: 'Organize Pages', desc: 'Drag-and-drop page sequence reordering with thumbnail grid', icon: 'grid', color: '#2563eb', action: 'sidebar:open' },
  { id: 'split-half', category: 'pages', title: 'Split in Half', desc: 'Bisect two-page book scans (A3 to double A4 or A4 to double A5)', icon: 'book', color: '#4f46e5', action: 'modal:split-half' },
  { id: 'alternate-mix', category: 'pages', title: 'Alternate & Mix', desc: 'Interleave odd and even pages from duplex scanner feeder runs', icon: 'shuffle', color: '#0891b2', action: 'modal:alternate-mix' },
  { id: 'nup', category: 'pages', title: 'N-Up Imposition', desc: 'Print 2 or 4 pages per sheet side-by-side or in 2x2 grid', icon: 'layout', color: '#475569', action: 'modal:nup' },
  { id: 'flip', category: 'pages', title: 'Flip / Mirror Pages', desc: 'Mirror PDF coordinates horizontally or vertically for transfers or scans', icon: 'flip', color: '#8b5cf6', action: 'modal:flip' },
  { id: 'resize', category: 'pages', title: 'Resize Margins', desc: 'Add binding margins (spiral/binder) or fit to A4/Letter bounds', icon: 'maximize', color: '#6366f1', action: 'modal:resize' },
  { id: 'rotate', category: 'pages', title: 'Rotate Pages', desc: 'Permanently rotate pages 90°, 180°, or 270° clockwise', icon: 'rotate', color: '#f59e0b', action: 'sidebar:open' },

  // Edit & Annotate
  { id: 'text', category: 'edit', title: 'Add & Edit Text', desc: 'Insert new text or click existing text on the PDF to edit inline', icon: 'type', color: '#2563eb', action: 'tool:text' },
  { id: 'draw', category: 'edit', title: 'Freehand Draw', desc: 'Draw, sketch, and write with smooth cubic Bezier pen paths', icon: 'pen', color: '#059669', action: 'tool:draw' },
  { id: 'highlight', category: 'edit', title: 'Highlighter', desc: 'Semi-transparent highlighter pen for reviewing and proofreading', icon: 'marker', color: '#eab308', action: 'tool:highlight' },
  { id: 'eraser', category: 'edit', title: 'Stroke Eraser', desc: 'Continuously erase pen strokes, drawings, and highlighter paths', icon: 'eraser', color: '#dc2626', action: 'tool:eraser' },
  { id: 'whiteout', category: 'edit', title: 'Whiteout / Redact', desc: 'Place whiteout redaction boxes to permanently purge sensitive data', icon: 'square', color: '#1e293b', action: 'tool:whiteout' },
  { id: 'shapes', category: 'edit', title: 'Shapes & Arrows', desc: 'Add rectangles, circles, ellipses, lines, and callout arrows', icon: 'shapes', color: '#8b5cf6', action: 'tool:shape' },
  { id: 'forms', category: 'edit', title: 'Interactive Forms', desc: 'Create fillable text fields, checkboxes, and radio button groups', icon: 'check-square', color: '#10b981', action: 'tool:form' },
  { id: 'stamps', category: 'edit', title: 'Business Stamps', desc: 'Approved, Confidential, Draft, Void, and custom date badges', icon: 'stamp', color: '#b91c1c', action: 'tool:image' },
  { id: 'search-replace', category: 'edit', title: 'Find & Replace', desc: 'Cross-document literal or regex search with batch replacement', icon: 'search', color: '#0284c7', action: 'tool:replace' },

  // Document Security & Tools
  { id: 'security', category: 'security', title: 'Protect & Encrypt', desc: 'Standard ISO 32000-1 AES-256 encryption with password policy', icon: 'lock', color: '#dc2626', action: 'modal:security' },
  { id: 'watermark', category: 'tools', title: 'Watermark PDF', desc: 'Apply diagonal text or logo watermarks across all document pages', icon: 'droplet', color: '#0284c7', action: 'modal:watermark' },
  { id: 'pagenumbers', category: 'tools', title: 'Page Numbers', desc: 'Add Header or Footer page numbers with dynamic {n} and {total}', icon: 'hash', color: '#4b5563', action: 'modal:pagenumbers' },
  { id: 'bates', category: 'tools', title: 'Legal Bates Numbering', desc: 'Sequential legal indexing with prefix, digits pad, and suffix', icon: 'shield', color: '#1e293b', action: 'modal:bates' },
  { id: 'metadata', category: 'tools', title: 'Document Metadata', desc: 'Edit PDF Title, Author, Subject, Keywords, Creator, and Producer', icon: 'file-text', color: '#64748b', action: 'modal:metadata' },
  { id: 'grayscale', category: 'tools', title: 'Grayscale PDF', desc: 'Desaturate vector fills, strokes, and shapes to save ink and print costs', icon: 'circle-half', color: '#475569', action: 'modal:grayscale' },
  { id: 'flatten', category: 'tools', title: 'Flatten Forms', desc: 'Bake interactive fillable AcroForm fields permanently into vectors', icon: 'layers', color: '#0d9488', action: 'action:flatten' },

  // Conversions
  { id: 'images-to-pdf', category: 'convert', title: 'Images to PDF', desc: 'Pack multiple JPG, PNG, and WebP images into a multi-page A4 PDF', icon: 'images', color: '#d97706', action: 'action:images-to-pdf' },
  { id: 'pdf-to-text', category: 'convert', title: 'Extract Plain Text', desc: 'Decompress binary content streams and extract plain searchable text', icon: 'align-left', color: '#334155', action: 'action:extract-text' }
];

export class AllToolsModal {
  constructor() {
    this.modal = null;
    this.activeFilter = 'all';
    this.searchQuery = '';
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'all-tools-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 860px; max-height: 88vh; display: flex; flex-direction: column;">
        <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #2563eb, #7c3aed); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 17px; font-weight: 700;">PDF Studio Tools Hub</h3>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Quickly find and launch any PDF editing, organization, or conversion tool</p>
            </div>
          </div>
          <button class="modal-close-btn" style="font-size: 24px;">&times;</button>
        </div>

        <!-- Search & Filter Rail (Canva Style) -->
        <div style="padding: 14px 20px; background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 10px;">
          <div style="position: relative;">
            <svg style="position: absolute; left: 12px; top: 11px; color: var(--text-muted);" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
            <input type="text" id="all-tools-search" placeholder="Search 30+ PDF tools (e.g. compress, split, crop, sign, watermark, bates)..." style="width: 100%; padding: 9px 12px 9px 36px; font-size: 13px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--bg-app); color: var(--text-main);" />
          </div>

          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px;" id="all-tools-filter-chips">
            <button class="tool-filter-chip active" data-filter="all">All Tools (${TOOLS_CATALOG.length})</button>
            <button class="tool-filter-chip" data-filter="popular">🔥 Most Popular</button>
            <button class="tool-filter-chip" data-filter="edit">🎨 Edit & Annotate</button>
            <button class="tool-filter-chip" data-filter="pages">📄 Organize & Pages</button>
            <button class="tool-filter-chip" data-filter="tools">⚡ Document Tools</button>
            <button class="tool-filter-chip" data-filter="security">🔒 Security</button>
            <button class="tool-filter-chip" data-filter="convert">🔄 Convert</button>
          </div>
        </div>

        <!-- Cards Grid Container -->
        <div class="modal-body" style="padding: 18px 20px; overflow-y: auto; flex: 1;">
          <div id="all-tools-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;"></div>
        </div>

        <div class="modal-footer" style="padding: 12px 20px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: var(--text-muted);">Press <kbd style="background: var(--bg-app); padding: 2px 5px; border-radius: 4px; border: 1px solid var(--border-subtle); font-size: 10px;">Esc</kbd> to close</span>
          <button class="btn btn-outline btn-sm modal-close-btn">Close</button>
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
      'align-left': '<line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line>'
    };

    return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${icons[icon] || icons.edit}</svg>`;
  }

  bindEvents() {
    this.modal.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.onclick = () => this.hide();
    });

    const searchInput = this.modal.querySelector('#all-tools-search');
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderGrid();
    };

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

    let filtered = TOOLS_CATALOG;

    // Filter by chip category
    if (this.activeFilter === 'popular') {
      filtered = filtered.filter(t => t.popular);
    } else if (this.activeFilter !== 'all') {
      filtered = filtered.filter(t => t.category === this.activeFilter);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(this.searchQuery) ||
        t.desc.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 8px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
          <div style="font-size: 14px; font-weight: 600;">No tools found matching "${this.searchQuery}"</div>
          <p style="font-size: 12px; margin-top: 4px;">Try searching for "compress", "split", "watermark", or "sign"</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(tool => `
      <div class="tool-card-item" data-action="${tool.action}" style="
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: 10px;
        padding: 14px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="width: 34px; height: 34px; border-radius: 8px; background: ${tool.color}18; color: ${tool.color}; display: flex; align-items: center; justify-content: center;">
            ${this.getToolIconSvg(tool.icon)}
          </div>
          ${tool.popular ? '<span style="font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 10px;">POPULAR</span>' : ''}
        </div>
        <div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 3px;">${tool.title}</div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${tool.desc}</div>
        </div>
      </div>
    `).join('');

    // Bind card clicks
    grid.querySelectorAll('.tool-card-item').forEach(card => {
      card.onclick = () => {
        const action = card.dataset.action;
        this.hide();
        this.executeAction(action);
      };
    });
  }

  executeAction(action) {
    if (!action) return;

    if (action.startsWith('tool:')) {
      const tool = action.replace('tool:', '');
      const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
      if (btn) btn.click();
    } else if (action === 'modal:compress') {
      compressModal.show();
    } else if (action === 'modal:split') {
      splitModal.show();
    } else if (action === 'modal:split-half') {
      splitHalfModal.show();
    } else if (action === 'modal:alternate-mix') {
      alternateMixModal.show();
    } else if (action === 'modal:nup') {
      nUpModal.show();
    } else if (action === 'modal:crop') {
      cropModal.show();
    } else if (action === 'modal:resize') {
      resizeModal.show();
    } else if (action === 'modal:flip') {
      flipModal.show();
    } else if (action === 'modal:grayscale') {
      grayscaleModal.show();
    } else if (action === 'modal:to-image') {
      pdfToImageModal.show();
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
      batesModal.show();
    } else if (action === 'modal:metadata') {
      metadataModal.show();
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
      pdfEngine.extractDocumentText(state.pdfBytes).then(text => {
        const blob = new Blob([text], { type: 'text/plain' });
        downloadBlob(blob, (state.documentName || 'Document').replace('.pdf', '') + '_text.txt');
        Toast.success('Extracted plain text downloaded!');
      });
    }
  }

  show() {
    if (this.modal) {
      this.modal.style.display = 'flex';
      const search = this.modal.querySelector('#all-tools-search');
      if (search) {
        search.value = '';
        this.searchQuery = '';
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
