/**
 * Floating Contextual Bubble Toolbar (Canva & Sejda Style)
 * Floats immediately above the selected canvas annotation for instantaneous micro-actions:
 * font size stepping, color cycling, quick duplicate, and delete.
 */

import { store } from '../state-store.js';
import { uid } from '../../utils/helpers.js';
import { generateFontOptionsHtml } from '../font-registry.js';

export class FloatingBubbleBar {
  static currentBar = null;

  static show(pageNum, ann, el, onDeselect) {
    this.hide();

    if (!el || !ann) return;

    const bar = document.createElement('div');
    bar.className = 'annot-bubble-toolbar';
    bar.id = 'annot-bubble-toolbar';

    const isText = ann.type === 'text';
    const isShape = ann.type === 'shape';

    let controlsHtml = '';

    if (isText) {
      const activeFont = ann.fontId || ann.fontFamily || 'Helvetica';
      const curAlign = ann.align || 'left';
      controlsHtml += `
        <select class="bubble-font-select" id="bubble-font-select" title="Change font family">
          ${generateFontOptionsHtml(activeFont)}
        </select>
        <button class="bubble-btn bubble-btn-step" id="bubble-size-minus" title="Decrease font size">-</button>
        <span class="bubble-text-val" id="bubble-size-val">${ann.fontSize || 16}px</span>
        <button class="bubble-btn bubble-btn-step" id="bubble-size-plus" title="Increase font size">+</button>
        <div class="bubble-divider"></div>
        <button class="bubble-btn ${ann.bold ? 'active' : ''}" id="bubble-btn-bold" title="Bold (Ctrl+B)"><b>B</b></button>
        <button class="bubble-btn ${ann.italic ? 'active' : ''}" id="bubble-btn-italic" title="Italic (Ctrl+I)"><i>I</i></button>
        <button class="bubble-btn ${ann.underline ? 'active' : ''}" id="bubble-btn-underline" title="Underline (Ctrl+U)"><u>U</u></button>
        <button class="bubble-btn ${ann.strikethrough ? 'active' : ''}" id="bubble-btn-strike" title="Strikethrough"><s>S</s></button>
        <button class="bubble-btn" id="bubble-btn-align" title="Align: ${curAlign}">
          ${curAlign === 'center' ? '≡' : curAlign === 'right' ? '⇥' : '⇤'}
        </button>
        <div class="bubble-divider"></div>
      `;
    }

    // Color dot picker (Text or stroke)
    const currentColor = ann.color || ann.strokeColor || '#000000';
    controlsHtml += `
      <div class="bubble-color-dot" id="bubble-color-dot" style="background-color: ${currentColor};" title="Text / Stroke Color"></div>
    `;

    if (isText) {
      const bgHighlight = ann.bgColor && ann.bgColor !== 'transparent' ? ann.bgColor : 'rgba(255,255,255,0.2)';
      controlsHtml += `
        <div class="bubble-color-dot bubble-bg-dot" id="bubble-bg-dot" style="background-color: ${bgHighlight};" title="Text Highlight / Background"></div>
      `;
    }

    controlsHtml += `
      <div class="bubble-divider"></div>
      <button class="bubble-btn" id="bubble-btn-duplicate" title="Duplicate (Ctrl+D)">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button class="bubble-btn bubble-btn-danger" id="bubble-btn-delete" title="Delete (Del)">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;

    bar.innerHTML = controlsHtml;
    el.appendChild(bar);
    this.currentBar = bar;

    // Prevent dragging / selection loss when clicking bubble buttons
    bar.onmousedown = (e) => e.stopPropagation();
    bar.onclick = (e) => e.stopPropagation();

    // Event bindings
    const fontSel = bar.querySelector('#bubble-font-select');
    const sizeMinus = bar.querySelector('#bubble-size-minus');
    const sizePlus = bar.querySelector('#bubble-size-plus');
    const colorDot = bar.querySelector('#bubble-color-dot');
    const dupBtn = bar.querySelector('#bubble-btn-duplicate');
    const delBtn = bar.querySelector('#bubble-btn-delete');

    const boldBtn = bar.querySelector('#bubble-btn-bold');
    const italicBtn = bar.querySelector('#bubble-btn-italic');
    const underlineBtn = bar.querySelector('#bubble-btn-underline');
    const strikeBtn = bar.querySelector('#bubble-btn-strike');
    const alignBtn = bar.querySelector('#bubble-btn-align');
    const bgDot = bar.querySelector('#bubble-bg-dot');

    if (boldBtn) {
      boldBtn.onclick = (e) => {
        e.stopPropagation();
        ann.bold = !ann.bold;
        boldBtn.classList.toggle('active', !!ann.bold);
        store.updateAnnotation(pageNum, ann.id, { bold: ann.bold });
      };
    }

    if (italicBtn) {
      italicBtn.onclick = (e) => {
        e.stopPropagation();
        ann.italic = !ann.italic;
        italicBtn.classList.toggle('active', !!ann.italic);
        store.updateAnnotation(pageNum, ann.id, { italic: ann.italic });
      };
    }

    if (underlineBtn) {
      underlineBtn.onclick = (e) => {
        e.stopPropagation();
        ann.underline = !ann.underline;
        underlineBtn.classList.toggle('active', !!ann.underline);
        store.updateAnnotation(pageNum, ann.id, { underline: ann.underline });
      };
    }

    if (strikeBtn) {
      strikeBtn.onclick = (e) => {
        e.stopPropagation();
        ann.strikethrough = !ann.strikethrough;
        strikeBtn.classList.toggle('active', !!ann.strikethrough);
        store.updateAnnotation(pageNum, ann.id, { strikethrough: ann.strikethrough });
      };
    }

    if (alignBtn) {
      alignBtn.onclick = (e) => {
        e.stopPropagation();
        const aligns = ['left', 'center', 'right'];
        const curIdx = aligns.indexOf(ann.align || 'left');
        const nextAlign = aligns[(curIdx + 1) % aligns.length];
        ann.align = nextAlign;
        alignBtn.textContent = nextAlign === 'center' ? '≡' : nextAlign === 'right' ? '⇥' : '⇤';
        alignBtn.title = `Align: ${nextAlign}`;
        store.updateAnnotation(pageNum, ann.id, { align: nextAlign });
      };
    }

    if (bgDot) {
      const bgPalette = ['transparent', '#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#fed7aa', '#ffffff'];
      bgDot.onclick = (e) => {
        e.stopPropagation();
        const cur = (ann.bgColor || 'transparent').toLowerCase();
        let nextIdx = (bgPalette.indexOf(cur) + 1) % bgPalette.length;
        const nextBg = bgPalette[nextIdx];
        ann.bgColor = nextBg;
        bgDot.style.backgroundColor = nextBg === 'transparent' ? 'rgba(255,255,255,0.2)' : nextBg;
        store.updateAnnotation(pageNum, ann.id, { bgColor: nextBg });
      };
    }

    if (fontSel) {
      fontSel.onchange = (e) => {
        e.stopPropagation();
        const fId = e.target.value;
        ann.fontId = fId;
        ann.fontFamily = fId;
        store.updateAnnotation(pageNum, ann.id, { fontId: fId, fontFamily: fId });
      };
    }

    if (sizeMinus) {
      sizeMinus.onclick = (e) => {
        e.stopPropagation();
        const newSize = Math.max(8, (ann.fontSize || 16) - 2);
        ann.fontSize = newSize;
        store.updateAnnotation(pageNum, ann.id, { fontSize: newSize });
        const valEl = bar.querySelector('#bubble-size-val');
        if (valEl) valEl.textContent = `${newSize}px`;
      };
    }

    if (sizePlus) {
      sizePlus.onclick = (e) => {
        e.stopPropagation();
        const newSize = Math.min(96, (ann.fontSize || 16) + 2);
        ann.fontSize = newSize;
        store.updateAnnotation(pageNum, ann.id, { fontSize: newSize });
        const valEl = bar.querySelector('#bubble-size-val');
        if (valEl) valEl.textContent = `${newSize}px`;
      };
    }

    if (colorDot) {
      const palette = ['#000000', '#30050d', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#ffffff'];
      colorDot.onclick = (e) => {
        e.stopPropagation();
        const cur = (ann.color || ann.strokeColor || '#000000').toLowerCase();
        let nextIdx = (palette.indexOf(cur) + 1) % palette.length;
        const nextColor = palette[nextIdx];
        if (isText) {
          ann.color = nextColor;
          store.updateAnnotation(pageNum, ann.id, { color: nextColor });
        } else {
          ann.strokeColor = nextColor;
          store.updateAnnotation(pageNum, ann.id, { strokeColor: nextColor });
        }
        colorDot.style.backgroundColor = nextColor;
      };
    }

    if (dupBtn) {
      dupBtn.onclick = (e) => {
        e.stopPropagation();
        const cloned = JSON.parse(JSON.stringify(ann));
        cloned.id = uid();
        cloned.x = (cloned.x || 0) + 16;
        cloned.y = (cloned.y || 0) + 16;
        store.addAnnotation(pageNum, cloned);
      };
    }

    if (delBtn) {
      delBtn.onclick = (e) => {
        e.stopPropagation();
        store.removeAnnotation(pageNum, ann.id);
        this.hide();
        if (onDeselect) onDeselect();
      };
    }
  }

  static hide() {
    if (this.currentBar && this.currentBar.parentElement) {
      this.currentBar.remove();
    }
    this.currentBar = null;
  }
}
