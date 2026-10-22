/**
 * Advanced Document Search & Replace Engine
 * Supports literal text, case-sensitivity, regular expressions, Next/Prev navigation with
 * viewport auto-scrolling, active match highlighting, and single or batch replacement.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';
import { TextClustering } from '../core/canvas/text-clustering.js';

export class SearchReplaceTool {
  constructor() {
    this.matches = [];
    this.currentMatchIndex = -1;
  }

  async search(query, options = {}) {
    this.clearHighlights();
    this.matches = [];
    this.currentMatchIndex = -1;

    if (!query || query.trim() === '') return { total: 0, current: 0 };

    const state = store.getState();
    const isRegex = !!options.isRegex;
    const matchCase = !!options.matchCase;

    let regex;
    try {
      if (isRegex) {
        regex = new RegExp(query, matchCase ? 'g' : 'gi');
      } else {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(escaped, matchCase ? 'g' : 'gi');
      }
    } catch (err) {
      Toast.error('Invalid regular expression: ' + err.message);
      return { total: 0, current: 0 };
    }

    const pageOrder = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder
      : Array.from({ length: state.pageCount }, (_, i) => i + 1);

    for (const p of pageOrder) {
      if (state.deletedPages.has(p)) continue;
      const page = await pdfEngine.getPage(p);
      const { items, viewport } = await pdfEngine.extractTextItems(page, state.scale, state.pageRotations[p] || 0);
      const clusters = TextClustering.clusterTextItems(items, viewport, state.scale);

      for (const cluster of clusters) {
        if (!cluster.str) continue;
        const text = cluster.str;

        // Reset regex state for global flag
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const charWidth = cluster.width / (text.length || 1);
          const matchX = cluster.vx + (match.index * charWidth);
          const matchW = Math.max(8, match[0].length * charWidth);

          this.matches.push({
            id: uid('m'),
            pageNum: p,
            matchedText: match[0],
            fullItemText: text,
            x: matchX,
            y: cluster.top,
            width: matchW,
            height: cluster.height,
            fontSize: cluster.fontSize,
            fontFamily: cluster.fontName
          });

          if (!regex.global) break;
        }
      }
    }

    this.highlightMatches();

    if (this.matches.length > 0) {
      this.currentMatchIndex = 0;
      this.focusMatch(0);
    }

    return { total: this.matches.length, current: this.matches.length > 0 ? 1 : 0 };
  }

  highlightMatches() {
    if (typeof document === 'undefined') return;
    this.matches.forEach((m, idx) => {
      const pageWrap = document.getElementById(`page-wrap-${m.pageNum}`);
      if (!pageWrap) return;
      const overlay = pageWrap.querySelector('.pdf-dom-layer');
      if (!overlay) return;

      const hl = document.createElement('div');
      hl.className = 'search-match-highlight';
      hl.id = `match-hl-${idx}`;
      hl.style.left = `${m.x}px`;
      hl.style.top = `${m.y}px`;
      hl.style.width = `${m.width}px`;
      hl.style.height = `${m.height}px`;
      hl.dataset.matchIdx = idx;

      hl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusMatch(idx);
      });

      overlay.appendChild(hl);
    });
  }

  focusMatch(index) {
    if (this.matches.length === 0) return { current: 0, total: 0 };

    this.currentMatchIndex = (index + this.matches.length) % this.matches.length;
    const m = this.matches[this.currentMatchIndex];

    if (typeof document !== 'undefined') {
      document.querySelectorAll('.search-match-highlight').forEach(el => {
        el.classList.remove('active-match');
      });

      const activeEl = document.getElementById(`match-hl-${this.currentMatchIndex}`);
      if (activeEl) {
        activeEl.classList.add('active-match');
        if (typeof activeEl.scrollIntoView === 'function') {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    return { current: this.currentMatchIndex + 1, total: this.matches.length };
  }

  nextMatch() {
    return this.focusMatch(this.currentMatchIndex + 1);
  }

  prevMatch() {
    return this.focusMatch(this.currentMatchIndex - 1);
  }

  replaceCurrent(replaceText) {
    if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matches.length) {
      Toast.info('No active match to replace');
      return null;
    }

    const m = this.matches[this.currentMatchIndex];
    let w = 600;
    let h = 800;
    if (typeof document !== 'undefined') {
      const pageWrap = document.getElementById(`page-wrap-${m.pageNum}`);
      if (pageWrap) {
        w = pageWrap.clientWidth || 600;
        h = pageWrap.clientHeight || 800;
      }
    }

    store.addAnnotation(m.pageNum, {
      id: uid('text'),
      type: 'text',
      text: replaceText,
      replacedText: m.matchedText,
      x: m.x / w,
      y: m.y / h,
      width: Math.max(0.04, (replaceText.length * 9) / w),
      height: m.height / h,
      fontSize: m.height,
      fontFamily: 'Helvetica',
      color: '#000000',
      hasUnderlay: true
    });

    // Remove current match from list and re-index
    if (typeof document !== 'undefined') {
      const activeEl = document.getElementById(`match-hl-${this.currentMatchIndex}`);
      if (activeEl) activeEl.remove();
    }

    this.matches.splice(this.currentMatchIndex, 1);
    this.clearHighlights();
    this.highlightMatches();

    if (this.matches.length > 0) {
      return this.focusMatch(this.currentMatchIndex);
    } else {
      this.currentMatchIndex = -1;
      return { current: 0, total: 0 };
    }
  }

  replaceAll(searchQuery, replaceText, options = {}) {
    if (this.matches.length === 0) {
      Toast.info('No matches found to replace');
      return 0;
    }

    let count = 0;
    for (const m of this.matches) {
      let w = 600;
      let h = 800;
      if (typeof document !== 'undefined') {
        const pageWrap = document.getElementById(`page-wrap-${m.pageNum}`);
        if (pageWrap) {
          w = pageWrap.clientWidth || 600;
          h = pageWrap.clientHeight || 800;
        }
      }

      store.addAnnotation(m.pageNum, {
        id: uid('text'),
        type: 'text',
        text: replaceText,
        replacedText: m.matchedText,
        x: m.x / w,
        y: m.y / h,
        width: Math.max(0.04, (replaceText.length * 9) / w),
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
    this.currentMatchIndex = -1;
    Toast.success(`Replaced ${count} instance${count > 1 ? 's' : ''}!`);
    return count;
  }

  clearHighlights() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.search-match-highlight').forEach(el => el.remove());
  }
}

export const searchReplace = new SearchReplaceTool();
