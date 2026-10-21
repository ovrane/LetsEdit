/**
 * Search & Replace Tool across Document
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';

export class SearchReplaceTool {
  constructor() {
    this.matches = [];
    this.currentMatchIndex = -1;
  }

  async search(query) {
    this.clearHighlights();
    this.matches = [];
    if (!query || query.trim() === '') return { total: 0 };

    const state = store.getState();
    const q = query.toLowerCase();

    for (let p = 1; p <= state.pageCount; p++) {
      if (state.deletedPages.has(p)) continue;
      const page = await pdfEngine.getPage(p);
      const { items, viewport } = await pdfEngine.extractTextItems(page, state.scale, state.pageRotations[p] || 0);

      for (const item of items) {
        if (!item.str) continue;
        const text = item.str.toLowerCase();
        if (text.includes(q)) {
          const tx = item.transform;
          const [vx, vy] = viewport.convertToViewportPoint(tx[4], tx[5]);
          const fontHeight = Math.hypot(tx[2], tx[3]) * state.scale;

          this.matches.push({
            pageNum: p,
            originalText: item.str,
            x: vx,
            y: vy - fontHeight,
            width: item.width * state.scale,
            height: fontHeight
          });
        }
      }
    }

    this.highlightMatches();
    return { total: this.matches.length };
  }

  highlightMatches() {
    this.matches.forEach((m, idx) => {
      const pageWrap = document.getElementById(`page-wrap-${m.pageNum}`);
      if (!pageWrap) return;
      const overlay = pageWrap.querySelector('.pdf-dom-layer');
      if (!overlay) return;

      const hl = document.createElement('div');
      hl.className = 'search-match-highlight';
      hl.style.left = `${m.x}px`;
      hl.style.top = `${m.y}px`;
      hl.style.width = `${m.width}px`;
      hl.style.height = `${m.height}px`;
      hl.dataset.matchIdx = idx;
      overlay.appendChild(hl);
    });
  }

  clearHighlights() {
    document.querySelectorAll('.search-match-highlight').forEach(el => el.remove());
  }

  replaceAll(searchQuery, replaceText) {
    if (this.matches.length === 0) {
      Toast.info('No matches found to replace');
      return 0;
    }

    let count = 0;
    for (const m of this.matches) {
      const pageWrap = document.getElementById(`page-wrap-${m.pageNum}`);
      if (!pageWrap) continue;
      const w = pageWrap.clientWidth;
      const h = pageWrap.clientHeight;

      const newText = m.originalText.replace(new RegExp(searchQuery, 'gi'), replaceText);

      store.addAnnotation(m.pageNum, {
        id: uid('text'),
        type: 'text',
        text: newText,
        x: m.x / w,
        y: m.y / h,
        width: m.width / w,
        height: m.height / h,
        fontSize: m.height,
        fontFamily: 'Helvetica',
        color: '#000000',
        hasUnderlay: true
      });
      count++;
    }

    this.clearHighlights();
    this.matches = [];
    Toast.success(`Replaced ${count} instance${count > 1 ? 's' : ''}!`);
    return count;
  }
}

export const searchReplace = new SearchReplaceTool();
