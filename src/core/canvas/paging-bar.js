/**
 * Canvas Paging Bar & Scroll Synchronizer
 * Handles bottom floating paging bar, zoom controls, and smooth scroll synchronization.
 */

import { store } from '../state-store.js';

export class PagingBarHandler {
  static renderPagingBar(manager, activePages) {
    if (!activePages || activePages.length === 0) {
      const existing = document.getElementById('editor-paging-bar');
      if (existing) existing.style.display = 'none';
      return;
    }

    let bar = document.getElementById('editor-paging-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'editor-paging-bar';
      bar.className = 'editor-paging-bar';
      document.body.appendChild(bar);
    }
    bar.style.display = 'flex';

    const totalPages = activePages.length;
    const currentNum = manager.currentPageNumber || 1;

    bar.innerHTML = `
      <div class="paging-group">
        <button class="paging-btn" id="paging-btn-prev" title="Previous Page (PgUp)">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg>
        </button>
        <span class="paging-label">
          Page <input type="number" id="paging-input-page" class="paging-input" min="1" max="${totalPages}" value="${currentNum}" /> of ${totalPages}
        </span>
        <button class="paging-btn" id="paging-btn-next" title="Next Page (PgDn)">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
        </button>
      </div>

      <div class="paging-divider"></div>

      <div class="paging-group">
        <button class="paging-btn" id="paging-btn-zoom-out" title="Zoom Out (-)">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <span class="paging-zoom-text" id="paging-zoom-val">${Math.round((store.getState().scale || 1.0) * 100)}%</span>
        <button class="paging-btn" id="paging-btn-zoom-in" title="Zoom In (+)">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div class="paging-divider"></div>

      <button class="paging-fit-btn" id="paging-btn-fit" title="Fit to 100% Zoom">100%</button>
    `;

    const prevBtn = bar.querySelector('#paging-btn-prev');
    const nextBtn = bar.querySelector('#paging-btn-next');
    const pageInp = bar.querySelector('#paging-input-page');
    const zoomOut = bar.querySelector('#paging-btn-zoom-out');
    const zoomIn = bar.querySelector('#paging-btn-zoom-in');
    const zoomFit = bar.querySelector('#paging-btn-fit');

    if (prevBtn) {
      prevBtn.onclick = () => manager.goToPrevPage();
    }

    if (nextBtn) {
      nextBtn.onclick = () => manager.goToNextPage();
    }

    if (pageInp) {
      pageInp.onchange = () => {
        const val = parseInt(pageInp.value, 10);
        if (val >= 1 && val <= activePages.length) {
          manager.scrollToPage(activePages[val - 1]);
        } else {
          pageInp.value = manager.currentPageNumber;
        }
      };
    }

    if (zoomOut) {
      zoomOut.onclick = () => {
        const cur = store.getState().scale;
        store.setScale(cur - 0.15);
      };
    }

    if (zoomIn) {
      zoomIn.onclick = () => {
        const cur = store.getState().scale;
        store.setScale(cur + 0.15);
      };
    }

    if (zoomFit) {
      zoomFit.onclick = () => {
        store.setScale(1.0);
      };
    }
  }

  static initScrollSync(manager) {
    if (manager._scrollBound) return;
    manager._scrollBound = true;

    let scrollRaf = null;
    manager.container.addEventListener('scroll', () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const state = store.getState();
        if (!state.pdfBytes || state.pageCount === 0) return;

        const containerScrollCenter = manager.container.scrollTop + (manager.container.clientHeight / 2);

        let closestPage = null;
        let minDistance = Infinity;

        const activePages = state.pageOrder && state.pageOrder.length > 0
          ? state.pageOrder.filter(p => !state.deletedPages.has(p))
          : Array.from({ length: state.pageCount }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));

        for (const pageNum of activePages) {
          const el = document.getElementById(`page-wrap-${pageNum}`);
          if (el) {
            const pageCenterY = el.offsetTop + (el.offsetHeight / 2);
            const distance = Math.abs(containerScrollCenter - pageCenterY);
            if (distance < minDistance) {
              minDistance = distance;
              closestPage = pageNum;
            }
          }
        }

        if (closestPage && closestPage !== manager.currentPageNumber) {
          manager.updateCurrentPage(closestPage);
        }
      });
    }, { passive: true });
  }

  static scrollToPage(manager, pageNum) {
    const el = document.getElementById(`page-wrap-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      manager.updateCurrentPage(pageNum);
    }
  }

  static updateCurrentPage(manager, pageNum) {
    manager.currentPageNumber = pageNum;
    const pageInp = document.getElementById('paging-input-page');
    if (pageInp) {
      const state = store.getState();
      const pageOrder = state.pageOrder && state.pageOrder.length > 0
        ? state.pageOrder.filter(p => !state.deletedPages.has(p))
        : [];
      const idx = pageOrder.indexOf(pageNum);
      if (idx !== -1) {
        pageInp.value = (idx + 1).toString();
      }
    }

    // Highlight active page thumbnail in sidebar
    const thumbs = document.querySelectorAll('.thumb-card');
    thumbs.forEach(t => {
      if (Number(t.dataset.page) === pageNum) {
        t.classList.add('active-page-thumb');
      } else {
        t.classList.remove('active-page-thumb');
      }
    });
  }

  static goToNextPage(manager) {
    const state = store.getState();
    const activePages = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder.filter(p => !state.deletedPages.has(p))
      : Array.from({ length: state.pageCount }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));
    const idx = activePages.indexOf(manager.currentPageNumber);
    if (idx !== -1 && idx < activePages.length - 1) {
      manager.scrollToPage(activePages[idx + 1]);
    }
  }

  static goToPrevPage(manager) {
    const state = store.getState();
    const activePages = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder.filter(p => !state.deletedPages.has(p))
      : Array.from({ length: state.pageCount }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));
    const idx = activePages.indexOf(manager.currentPageNumber);
    if (idx > 0) {
      manager.scrollToPage(activePages[idx - 1]);
    }
  }
}
