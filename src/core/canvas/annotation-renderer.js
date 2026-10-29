/**
 * Annotation & DOM Overlay Renderer
 * Renders vector paths, shapes, interactive DOM form fields, links,
 * document watermarks, and dynamic page number overlays onto page viewports.
 */

import { store } from '../state-store.js';
import { Toast } from '../../components/toast.js';
import { FloatingBubbleBar } from './bubble-toolbar.js';
import { ResizeGizmo } from './resize-gizmo.js';
import { getCssFontFamily } from '../font-registry.js';

export class AnnotationRenderer {
  static renderAnnotations(manager, pageNum) {
    const refs = manager.pageElements.get(pageNum);
    if (!refs) return;

    const { annotCanvas, domLayer, wrap, textLayer } = refs;
    const ctx = annotCanvas.getContext('2d');
    ctx.clearRect(0, 0, annotCanvas.width, annotCanvas.height);
    domLayer.innerHTML = '';

    const annotations = store.getAnnotations(pageNum);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    // Synchronize replaced text clusters visibility
    if (textLayer) {
      const activeReplacedIds = new Set(
        annotations.filter(a => a.replacedClusterId).map(a => a.replacedClusterId)
      );
      textLayer.querySelectorAll('.text-item').forEach(itemEl => {
        const cId = itemEl.dataset.clusterId;
        if (cId && activeReplacedIds.has(cId)) {
          itemEl.style.visibility = 'hidden';
        } else if (itemEl.style.visibility === 'hidden' && (!cId || !activeReplacedIds.has(cId))) {
          itemEl.style.visibility = 'visible';
        }
      });
    }

    for (const ann of annotations) {
      const px = ann.x * w;
      const py = ann.y * h;
      const pw = ann.width * w;
      const ph = ann.height * h;

      if (ann.type === 'whiteout') {
        // Redaction whiteout box
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, pw, ph);

        // Visual subtle dashed border when hovered or in editor
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(px, py, pw, ph);
        ctx.setLineDash([]);
      } else if (ann.type === 'drawing') {
        if (ann.points && ann.points.length > 1) {
          ctx.save();
          ctx.strokeStyle = ann.color || '#ff0000';
          ctx.lineWidth = (ann.strokeWidth || 3) * (w / 600);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (ann.isHighlighter) {
            ctx.globalAlpha = 0.4;
          }
          ctx.beginPath();
          ctx.moveTo(ann.points[0].x * w, ann.points[0].y * h);
          for (let i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x * w, ann.points[i].y * h);
          }
          ctx.stroke();
          ctx.restore();
        }
      } else if (ann.type === 'shape') {
        ctx.save();
        ctx.strokeStyle = ann.strokeColor || '#000000';
        ctx.lineWidth = ann.strokeWidth || 2;
        if (ann.fillColor && ann.fillColor !== 'transparent') {
          ctx.fillStyle = ann.fillColor;
        }

        if (ann.shapeType === 'rectangle') {
          if (ann.fillColor && ann.fillColor !== 'transparent') ctx.fillRect(px, py, pw, ph);
          ctx.strokeRect(px, py, pw, ph);
        } else if (ann.shapeType === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(px + pw / 2, py + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
          if (ann.fillColor && ann.fillColor !== 'transparent') ctx.fill();
          ctx.stroke();
        } else if (ann.shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pw, py + ph);
          ctx.stroke();
        } else if (ann.shapeType === 'arrow') {
          this.drawArrow(ctx, px, py, px + pw, py + ph, ann.strokeWidth || 2);
        }
        ctx.restore();
      }

      // Interactive DOM elements (Text, Images, Signatures, Form Controls, Links, Notes)
      if (['text', 'image', 'signature', 'form', 'whiteout', 'link', 'note'].includes(ann.type)) {
        this.renderDomElement(manager, pageNum, ann, px, py, pw, ph, domLayer);
      }
    }

    // Document-wide Watermark overlay in canvas viewport
    const wm = store.getState().watermark;
    if (wm && wm.text) {
      ctx.save();
      ctx.font = `bold ${(wm.fontSize || 42) * (w / 600)}px Helvetica, Arial, sans-serif`;
      ctx.fillStyle = wm.color || '#94a3b8';
      ctx.globalAlpha = wm.opacity || 0.25;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(w / 2, h / 2);
      ctx.rotate(((wm.rotation || 45) * Math.PI) / 180);
      ctx.fillText(wm.text, 0, 0);
      ctx.restore();
    }

    // Live Page Numbers overlay
    const pn = store.getState().pageNumbers;
    if (pn) {
      const pageOrder = store.getState().pageOrder || [];
      const outIdx = pageOrder.indexOf(pageNum);
      const totalPages = pageOrder.length;
      if (outIdx !== -1) {
        const pnFormat = pn.format || 'Page {n} of {total}';
        const pnText = pnFormat.replace('{n}', (outIdx + 1).toString()).replace('{total}', totalPages.toString());
        ctx.save();
        ctx.font = '12px Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        let px = w / 2;
        let py = h - 20;
        ctx.textAlign = 'center';

        if (pn.position === 'bottom-left') { px = 30; ctx.textAlign = 'left'; }
        else if (pn.position === 'bottom-right') { px = w - 30; ctx.textAlign = 'right'; }
        else if (pn.position === 'top-center') { py = 25; }
        else if (pn.position === 'top-left') { px = 30; py = 25; ctx.textAlign = 'left'; }
        else if (pn.position === 'top-right') { px = w - 30; py = 25; ctx.textAlign = 'right'; }

        ctx.fillText(pnText, px, py);
        ctx.restore();
      }
    }
  }

  static drawArrow(ctx, fromX, fromY, toX, toY, width) {
    const headLength = 12 + width * 2;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }

  static renderDomElement(manager, pageNum, ann, px, py, pw, ph, container) {
    const el = document.createElement('div');
    el.className = `annot-item annot-${ann.type}`;
    el.id = `annot-${ann.id}`;
    el.style.left = `${px}px`;
    el.style.top = `${py}px`;
    el.style.width = `${pw}px`;
    el.style.height = `${ph}px`;

    if (ann.type === 'text') {
      if (ann.hasUnderlay) {
        el.classList.add('annot-text-underlay');
      }
      el.textContent = ann.text;
      el.style.fontSize = `${ann.fontSize || 16}px`;
      el.style.fontFamily = getCssFontFamily(ann.fontId || ann.fontFamily);
      el.style.color = ann.color || '#000000';
      if (ann.bold) el.style.fontWeight = 'bold';
      if (ann.italic) el.style.fontStyle = 'italic';
      if (ann.underline && ann.strikethrough) {
        el.style.textDecoration = 'underline line-through';
      } else if (ann.underline) {
        el.style.textDecoration = 'underline';
      } else if (ann.strikethrough) {
        el.style.textDecoration = 'line-through';
      } else {
        el.style.textDecoration = 'none';
      }
      if (ann.align) el.style.textAlign = ann.align;
      if (ann.opacity !== undefined) el.style.opacity = ann.opacity;
      if (ann.bgColor && ann.bgColor !== 'transparent') {
        el.style.backgroundColor = ann.bgColor;
        el.style.padding = '0 3px';
        el.style.borderRadius = '2px';
      }

      // Double-click to edit existing text annotation in place
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        manager.makeExistingAnnotationEditable(pageNum, ann, el);
      });
    } else if (ann.type === 'link') {
      el.classList.add('annot-link-hotspot');
      const badge = document.createElement('div');
      badge.className = 'annot-link-badge';
      const label = ann.targetType === 'page' ? `Page ${ann.pageTarget || 1}` : (ann.url || 'Link');
      badge.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> <span class="link-label">${label}</span>`;
      el.appendChild(badge);

      badge.onclick = (e) => {
        e.stopPropagation();
        if (ann.targetType === 'page') {
          window.dispatchEvent(new CustomEvent('letsedit:scroll-to-page', { detail: { pageNum: ann.pageTarget || 1 } }));
          Toast.info(`Jumped to Page ${ann.pageTarget || 1}`);
        } else if (ann.url) {
          window.open(ann.url, '_blank');
        }
      };
    } else if (ann.type === 'image' || ann.type === 'signature') {
      const img = document.createElement('img');
      img.src = ann.dataUrl;
      img.alt = ann.type;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      el.appendChild(img);
    } else if (ann.type === 'form') {
      if (ann.formType === 'checkbox') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!ann.checked;
        cb.onchange = (e) => store.updateAnnotation(pageNum, ann.id, { checked: e.target.checked });
        el.appendChild(cb);
      } else if (ann.formType === 'radio') {
        const rad = document.createElement('input');
        rad.type = 'radio';
        rad.name = ann.groupName || 'radio-group';
        rad.checked = !!ann.checked;
        rad.onchange = (e) => store.updateAnnotation(pageNum, ann.id, { checked: e.target.checked });
        el.appendChild(rad);
      } else if (ann.formType === 'dropdown') {
        const sel = document.createElement('select');
        sel.className = 'form-field-select';
        const options = ann.options || ['Option 1', 'Option 2', 'Option 3'];
        options.forEach(opt => {
          const optEl = document.createElement('option');
          optEl.value = opt;
          optEl.textContent = opt;
          if (opt === ann.value) optEl.selected = true;
          sel.appendChild(optEl);
        });
        sel.onchange = (e) => store.updateAnnotation(pageNum, ann.id, { value: e.target.value });
        el.appendChild(sel);
      } else {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'form-field-input';
        inp.value = ann.value || '';
        inp.placeholder = ann.placeholder || 'Type here...';
        inp.oninput = (e) => store.updateAnnotation(pageNum, ann.id, { value: e.target.value });
        el.appendChild(inp);
      }
    } else if (ann.type === 'note') {
      el.classList.add('annot-note-container');
      const noteColor = ann.color || '#f59e0b';

      const iconWrap = document.createElement('div');
      iconWrap.className = 'note-pin-badge';
      iconWrap.style.backgroundColor = noteColor;
      iconWrap.title = ann.text ? (ann.text.length > 50 ? ann.text.slice(0, 47) + '...' : ann.text) : 'Sticky Note';
      iconWrap.innerHTML = `<svg width="15" height="15" fill="none" stroke="white" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

      const card = document.createElement('div');
      card.className = `note-floating-card ${ann.isOpen ? 'open' : ''}`;

      const cardHeader = document.createElement('div');
      cardHeader.className = 'note-card-header';
      cardHeader.style.borderLeftColor = noteColor;
      cardHeader.innerHTML = `
        <div class="note-author-info">
          <span class="note-author-name">${ann.author || 'User'}</span>
          <span class="note-timestamp">${ann.date || ''}</span>
        </div>
        <div class="note-header-actions">
          <button class="note-card-close-btn" title="Minimize">&minus;</button>
        </div>
      `;

      const cardCloseBtn = cardHeader.querySelector('.note-card-close-btn');
      cardCloseBtn.onclick = (e) => {
        e.stopPropagation();
        ann.isOpen = false;
        card.classList.remove('open');
        store.updateAnnotation(pageNum, ann.id, { isOpen: false });
      };

      const textarea = document.createElement('textarea');
      textarea.className = 'note-textarea';
      textarea.value = ann.text || '';
      textarea.placeholder = 'Write a comment...';
      textarea.oninput = (e) => {
        ann.text = e.target.value;
        store.updateAnnotation(pageNum, ann.id, { text: e.target.value });
      };

      const palette = document.createElement('div');
      palette.className = 'note-palette';
      const colors = ['#f59e0b', '#0ea5e9', '#10b981', '#f43f5e', '#8b5cf6'];
      colors.forEach(col => {
        const dot = document.createElement('button');
        dot.className = `note-palette-dot ${col === noteColor ? 'active' : ''}`;
        dot.style.backgroundColor = col;
        dot.title = 'Change color';
        dot.onclick = (e) => {
          e.stopPropagation();
          store.updateAnnotation(pageNum, ann.id, { color: col });
        };
        palette.appendChild(dot);
      });

      card.appendChild(cardHeader);
      card.appendChild(textarea);
      card.appendChild(palette);

      iconWrap.onclick = (e) => {
        e.stopPropagation();
        const nextOpen = !card.classList.contains('open');
        card.classList.toggle('open', nextOpen);
        store.updateAnnotation(pageNum, ann.id, { isOpen: nextOpen });
        if (nextOpen) {
          setTimeout(() => textarea.focus(), 50);
        }
      };

      el.appendChild(iconWrap);
      el.appendChild(card);

      if (ann.isOpen) {
        setTimeout(() => textarea.focus(), 100);
      }
    }

    // Controls: Delete & drag handles
    const delBtn = document.createElement('button');
    delBtn.className = 'annot-delete-btn';
    delBtn.innerHTML = '&times;';
    delBtn.title = 'Remove';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      store.removeAnnotation(pageNum, ann.id);
    };
    el.appendChild(delBtn);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      manager.selectAnnotation(pageNum, ann, el);
    });

    if (ann.type !== 'note') {
      ResizeGizmo.attachResizeHandles(el, pageNum, ann, manager.pageElements, (p, a, e) => manager.selectAnnotation(p, a, e));
    }
    ResizeGizmo.makeDraggable(el, pageNum, ann, manager.pageElements, (p, a, e) => manager.selectAnnotation(p, a, e));
    container.appendChild(el);
  }
}
