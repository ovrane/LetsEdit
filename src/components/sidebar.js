/**
 * Thumbnails & Page Management Sidebar with Drag-and-Drop Reordering,
 * Blank Page Insertion, and External PDF Merging
 */

const getPdfEngine = async () => (await import('../core/pdf-engine.js')).pdfEngine;
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { router } from '../core/router.js';

export class Sidebar {
  constructor(container) {
    this.container = container;
    this.draggedIndex = null;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="sidebar-header">
        <h4>Pages (<span id="sidebar-page-count">0</span>)</h4>
        <button id="sidebar-close-btn" class="icon-btn" title="Close Panel">&times;</button>
      </div>
      <div class="sidebar-actions">
        <button class="btn btn-sm btn-outline w-full" id="sidebar-add-page-btn" style="margin-bottom:6px;">
          <span>+ Add Blank Page</span>
        </button>
        <button class="btn btn-sm btn-outline w-full" id="sidebar-merge-pdf-btn">
          <span>+ Merge PDF Files</span>
        </button>
        <input type="file" id="sidebar-merge-input" accept="application/pdf" style="display:none;" />
      </div>
      <div class="thumbnail-list" id="thumbnail-list"></div>
    `;

    this.listEl = this.container.querySelector('#thumbnail-list');
    this.pageCountEl = this.container.querySelector('#sidebar-page-count');
    const mergeInput = this.container.querySelector('#sidebar-merge-input');

    this.container.querySelector('#sidebar-close-btn').onclick = () => {
      document.body.classList.remove('sidebar-open');
    };

    // Add Blank Page
    this.container.querySelector('#sidebar-add-page-btn').onclick = async () => {
      try {
        Toast.info('Appending blank page...');
        const engine = await getPdfEngine();
        const newCount = await engine.appendBlankPage();
        store.addBlankPage();
        Toast.success(`Added page ${newCount}!`);
      } catch (err) {
        console.error(err);
        Toast.error('Failed to append blank page: ' + err.message);
      }
    };

    // Merge External PDF Workflow
    this.container.querySelector('#sidebar-merge-pdf-btn').onclick = () => {
      router.navigate('/merge_pdf');
    };

    mergeInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        try {
          Toast.info(`Merging ${file.name}...`);
          const bytes = await readFileAsArrayBuffer(file);
          const engine = await getPdfEngine();
          const totalPages = await engine.mergeExternalPdf(bytes);
          store.setDocument(engine.rawBytes, store.getState().filename, totalPages);
          Toast.success(`Merged ${file.name}! Total pages: ${totalPages}`);
        } catch (err) {
          console.error(err);
          Toast.error('Failed to merge PDF: ' + err.message);
        }
      }
      mergeInput.value = '';
    };

    store.subscribe((event, state) => {
      if (['document-loaded', 'page-rotated', 'page-deleted', 'pages-reordered', 'page-added'].includes(event)) {
        this.renderThumbnails(state);
      }
    });
  }

  async renderThumbnails(state) {
    this.listEl.innerHTML = '';
    if (!state.pdfBytes || state.pageCount === 0) {
      this.pageCountEl.textContent = '0';
      return;
    }

    const pageOrder = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder.filter(p => !state.deletedPages.has(p))
      : Array.from({ length: state.pageCount }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));

    const activeCount = pageOrder.length;
    this.pageCountEl.textContent = activeCount.toString();

    pageOrder.forEach((p, seqIdx) => {
      const card = document.createElement('div');
      card.className = 'thumb-card';
      card.dataset.page = p;
      card.dataset.index = seqIdx;
      card.draggable = true;

      const canvas = document.createElement('canvas');
      canvas.className = 'thumb-canvas';

      const footer = document.createElement('div');
      footer.className = 'thumb-footer';
      footer.innerHTML = `
        <span class="thumb-num">${seqIdx + 1} <small style="color:#94a3b8;">(orig ${p})</small></span>
        <div class="thumb-actions">
          <button class="thumb-btn rotate-btn" title="Rotate 90°">↻</button>
          <button class="thumb-btn duplicate-btn" title="Duplicate Page">⧉</button>
          <button class="thumb-btn insert-btn" title="Insert Blank Page After">+</button>
          <button class="thumb-btn delete-btn" title="Delete Page">🗑</button>
        </div>
      `;

      card.appendChild(canvas);
      card.appendChild(footer);
      this.listEl.appendChild(card);

      // Drag and drop reordering
      card.addEventListener('dragstart', (e) => {
        this.draggedIndex = seqIdx;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', seqIdx.toString());
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.listEl.querySelectorAll('.thumb-card').forEach(c => c.classList.remove('drag-over-top', 'drag-over-bottom'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          card.classList.add('drag-over-top');
          card.classList.remove('drag-over-bottom');
        } else {
          card.classList.add('drag-over-bottom');
          card.classList.remove('drag-over-top');
        }
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over-top', 'drag-over-bottom');
        const fromIdx = this.draggedIndex;
        let toIdx = seqIdx;
        const rect = card.getBoundingClientRect();
        if (e.clientY >= rect.top + rect.height / 2 && fromIdx < seqIdx) {
          toIdx = seqIdx;
        }

        if (fromIdx !== null && fromIdx !== toIdx) {
          store.reorderPages(fromIdx, toIdx);
          Toast.success(`Moved page to position ${toIdx + 1}`);
        }
      });

      // Click to scroll into view
      card.onclick = (e) => {
        if (e.target.closest('.thumb-actions')) return;
        window.dispatchEvent(new CustomEvent('letsedit:scroll-to-page', { detail: { pageNum: p } }));
      };

      // Actions
      footer.querySelector('.rotate-btn').onclick = () => {
        store.rotatePage(p, 90);
        Toast.info(`Rotated page ${seqIdx + 1}`);
      };

      const dupBtn = footer.querySelector('.duplicate-btn');
      if (dupBtn) {
        dupBtn.onclick = () => {
          store.duplicatePage(p);
          Toast.success(`Duplicated page ${seqIdx + 1}`);
        };
      }

      const insBtn = footer.querySelector('.insert-btn');
      if (insBtn) {
        insBtn.onclick = () => {
          store.addBlankPage(seqIdx);
          Toast.success(`Inserted blank page after page ${seqIdx + 1}`);
        };
      }

      footer.querySelector('.delete-btn').onclick = () => {
        if (activeCount <= 1) {
          Toast.warning('Cannot delete the only remaining page');
          return;
        }
        store.deletePage(p);
        Toast.info(`Deleted page ${seqIdx + 1}`);
      };

      // Render thumbnail canvas
      this.renderThumbCanvas(p, canvas, state.pageRotations[p] || 0);
    });
  }

  async renderThumbCanvas(pageNum, canvas, rotation) {
    try {
      const engine = await getPdfEngine();
      const page = await engine.getPage(pageNum);
      const totalRotation = (page.rotate + rotation) % 360;
      const viewport = page.getViewport({ scale: 0.25, rotation: totalRotation });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.warn('Thumb render error:', e);
    }
  }
}
