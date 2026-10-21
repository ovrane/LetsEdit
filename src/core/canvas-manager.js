/**
 * Canvas Manager: Orchestrates multi-layer page rendering & interactions
 */

import { pdfEngine } from './pdf-engine.js';
import { store } from './state-store.js';
import { uid } from '../utils/helpers.js';

export class CanvasManager {
  constructor(container) {
    this.container = container;
    this.pageElements = new Map(); // pageNum -> { wrap, canvas, textLayer, annotCanvas }
    this.activeAnnotation = null;
    this.selectedAnnotation = null;
    this.isDrawing = false;
    this.isErasing = false;
    this.currentPoints = [];
    this.dragTarget = null;
    this.renderedPages = new Set();
    this.pageObserver = null;

    this.bindGlobalEvents();
  }

  async renderDocument() {
    this.container.innerHTML = '';
    this.pageElements.clear();
    this.renderedPages.clear();

    const state = store.getState();
    if (!state.pdfBytes || state.pageCount === 0) return;

    const pageOrder = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder
      : Array.from({ length: state.pageCount }, (_, i) => i + 1);

    // Virtualized IntersectionObserver for large documents (50+ pages)
    if (typeof IntersectionObserver !== 'undefined') {
      if (this.pageObserver) {
        this.pageObserver.disconnect();
      }
      this.pageObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.dataset.page);
            if (pageNum && !this.renderedPages.has(pageNum)) {
              this.renderedPages.add(pageNum);
              this.renderPage(pageNum);
            }
          }
        }
      }, {
        root: null,
        rootMargin: '600px 0px 600px 0px',
        threshold: 0.01
      });
    }

    for (const p of pageOrder) {
      if (state.deletedPages.has(p)) continue;
      const pageWrapper = this.createPageElement(p);
      this.container.appendChild(pageWrapper);

      // Render first page immediately; lazy-render remaining pages on viewport proximity
      if (p === pageOrder[0] || !this.pageObserver) {
        this.renderedPages.add(p);
        await this.renderPage(p);
      } else {
        this.pageObserver.observe(pageWrapper);
      }
    }
  }

  createPageElement(pageNum) {
    const wrap = document.createElement('div');
    wrap.className = 'pdf-page-wrap';
    wrap.dataset.page = pageNum;
    wrap.id = `page-wrap-${pageNum}`;

    const state = store.getState();
    const approxW = Math.round(595 * (state.scale || 1.0));
    const approxH = Math.round(842 * (state.scale || 1.0));
    wrap.style.minWidth = `${approxW}px`;
    wrap.style.minHeight = `${approxH}px`;

    // 1. Background Canvas Layer
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';

    // 2. Text Layer
    const textLayer = document.createElement('div');
    textLayer.className = 'pdf-text-layer';

    // 3. Annotation & Interaction Canvas Layer
    const annotCanvas = document.createElement('canvas');
    annotCanvas.className = 'pdf-annotation-canvas';

    // 4. Dom Annotation Container (for interactive HTML elements like textboxes, form inputs)
    const domLayer = document.createElement('div');
    domLayer.className = 'pdf-dom-layer';

    // Page badge
    const badge = document.createElement('div');
    badge.className = 'page-number-badge';
    badge.innerText = `Page ${pageNum}`;

    wrap.appendChild(canvas);
    wrap.appendChild(textLayer);
    wrap.appendChild(annotCanvas);
    wrap.appendChild(domLayer);
    wrap.appendChild(badge);

    this.pageElements.set(pageNum, { wrap, canvas, textLayer, annotCanvas, domLayer });
    this.bindPageEvents(pageNum, wrap, annotCanvas, domLayer);

    return wrap;
  }

  async renderPage(pageNum) {
    const refs = this.pageElements.get(pageNum);
    if (!refs) return;

    this.renderedPages.add(pageNum);

    const state = store.getState();
    const page = await pdfEngine.getPage(pageNum);
    const rotation = state.pageRotations[pageNum] || 0;

    // Render PDF base canvas
    const viewport = await pdfEngine.renderPageToCanvas(page, refs.canvas, state.scale, rotation);

    // Size overlays to match viewport
    const width = viewport.width;
    const height = viewport.height;

    refs.wrap.style.width = `${width}px`;
    refs.wrap.style.height = `${height}px`;

    refs.annotCanvas.width = width;
    refs.annotCanvas.height = height;
    refs.annotCanvas.style.width = `${width}px`;
    refs.annotCanvas.style.height = `${height}px`;

    refs.textLayer.style.width = `${width}px`;
    refs.textLayer.style.height = `${height}px`;

    refs.domLayer.style.width = `${width}px`;
    refs.domLayer.style.height = `${height}px`;

    // Render text layer for search and inline editing
    await this.renderTextLayer(page, refs.textLayer, state.scale, rotation, pageNum);

    // Render annotations
    this.renderAnnotations(pageNum);
  }

  async renderTextLayer(page, textLayerEl, scale, rotation, pageNum) {
    textLayerEl.innerHTML = '';
    const { items, viewport } = await pdfEngine.extractTextItems(page, scale, rotation);

    for (const item of items) {
      if (!item.str || item.str.trim() === '') continue;

      // Calculate approximate bounding box from transform
      const tx = item.transform;
      // tx: [scaleX, skewY, skewX, scaleY, transX, transY]
      const [vx, vy] = viewport.convertToViewportPoint(tx[4], tx[5]);
      const fontHeight = Math.hypot(tx[2], tx[3]) * scale;

      const span = document.createElement('span');
      span.className = 'text-item';
      span.textContent = item.str;
      span.style.left = `${vx}px`;
      span.style.top = `${vy - fontHeight}px`;
      span.style.fontSize = `${fontHeight}px`;
      span.dataset.originalText = item.str;
      span.dataset.fontName = item.fontName;

      // Click to edit existing text inline
      span.addEventListener('click', (e) => {
        const state = store.getState();
        if (state.activeTool === 'text' || state.activeTool === 'select') {
          e.stopPropagation();
          this.makeExistingTextEditable(span, pageNum, vx, vy - fontHeight, item.width * scale, fontHeight, item.str);
        }
      });

      textLayerEl.appendChild(span);
    }
  }

  makeExistingTextEditable(span, pageNum, x, y, w, h, originalText) {
    const refs = this.pageElements.get(pageNum);
    if (!refs) return;

    span.style.visibility = 'hidden';

    const wrapW = refs.wrap.clientWidth;
    const wrapH = refs.wrap.clientHeight;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-text-editor';
    input.value = originalText;
    input.style.left = `${x}px`;
    input.style.top = `${y}px`;
    input.style.width = `${Math.max(w + 10, 80)}px`;
    input.style.height = `${h + 6}px`;
    input.style.fontSize = span.style.fontSize;

    const commitChange = () => {
      const newText = input.value;
      input.remove();
      if (newText && newText !== originalText) {
        store.addAnnotation(pageNum, {
          id: uid('text'),
          type: 'text',
          text: newText,
          x: x / wrapW,
          y: y / wrapH,
          width: (w + 10) / wrapW,
          height: (h + 6) / wrapH,
          fontSize: parseFloat(span.style.fontSize) || 14,
          fontFamily: 'Helvetica',
          color: '#000000',
          hasUnderlay: true // Whiteout old text
        });
      } else {
        span.style.visibility = 'visible';
      }
    };

    input.addEventListener('blur', commitChange);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        input.remove();
        span.style.visibility = 'visible';
      }
    });

    refs.domLayer.appendChild(input);
    input.focus();
    input.select();
  }

  renderAnnotations(pageNum) {
    const refs = this.pageElements.get(pageNum);
    if (!refs) return;

    const { annotCanvas, domLayer, wrap } = refs;
    const ctx = annotCanvas.getContext('2d');
    ctx.clearRect(0, 0, annotCanvas.width, annotCanvas.height);
    domLayer.innerHTML = '';

    const annotations = store.getAnnotations(pageNum);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

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

      // Interactive DOM elements (Text, Images, Signatures, Form Controls)
      if (['text', 'image', 'signature', 'form', 'whiteout'].includes(ann.type)) {
        this.renderDomElement(pageNum, ann, px, py, pw, ph, domLayer);
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

  drawArrow(ctx, fromX, fromY, toX, toY, width) {
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

  renderDomElement(pageNum, ann, px, py, pw, ph, container) {
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
      el.style.fontFamily = ann.fontFamily || 'Helvetica';
      el.style.color = ann.color || '#000000';
      if (ann.bold) el.style.fontWeight = 'bold';
      if (ann.italic) el.style.fontStyle = 'italic';
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
      } else {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'form-field-input';
        inp.value = ann.value || '';
        inp.placeholder = ann.placeholder || 'Type here...';
        inp.oninput = (e) => store.updateAnnotation(pageNum, ann.id, { value: e.target.value });
        el.appendChild(inp);
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
      this.selectAnnotation(pageNum, ann, el);
    });

    this.attachResizeHandles(el, pageNum, ann);
    this.makeDraggable(el, pageNum, ann);
    container.appendChild(el);
  }

  selectAnnotation(pageNum, ann, el) {
    this.deselectAnnotation();
    this.selectedAnnotation = { pageNum, ann, el };
    el.classList.add('selected');
  }

  deselectAnnotation() {
    if (this.selectedAnnotation) {
      if (this.selectedAnnotation.el) {
        this.selectedAnnotation.el.classList.remove('selected');
      }
      this.selectedAnnotation = null;
    }
  }

  attachResizeHandles(el, pageNum, ann) {
    const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    for (const dir of directions) {
      const handle = document.createElement('div');
      handle.className = `resize-handle handle-${dir}`;
      handle.dataset.dir = dir;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const origX = ann.x;
        const origY = ann.y;
        const origW = ann.width;
        const origH = ann.height;

        const refs = this.pageElements.get(pageNum);
        if (!refs) return;
        const w = refs.wrap.clientWidth;
        const h = refs.wrap.clientHeight;

        const onMouseMove = (moveEv) => {
          const dx = (moveEv.clientX - startX) / w;
          const dy = (moveEv.clientY - startY) / h;

          let newX = origX;
          let newY = origY;
          let newW = origW;
          let newH = origH;

          if (dir.includes('e')) {
            newW = Math.max(0.02, origW + dx);
          }
          if (dir.includes('w')) {
            const possibleW = Math.max(0.02, origW - dx);
            newX = origX + (origW - possibleW);
            newW = possibleW;
          }
          if (dir.includes('s')) {
            newH = Math.max(0.015, origH + dy);
          }
          if (dir.includes('n')) {
            const possibleH = Math.max(0.015, origH - dy);
            newY = origY + (origH - possibleH);
            newH = possibleH;
          }

          ann.x = newX;
          ann.y = newY;
          ann.width = newW;
          ann.height = newH;

          el.style.left = `${ann.x * w}px`;
          el.style.top = `${ann.y * h}px`;
          el.style.width = `${ann.width * w}px`;
          el.style.height = `${ann.height * h}px`;
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          store.updateAnnotation(pageNum, ann.id, {
            x: ann.x,
            y: ann.y,
            width: ann.width,
            height: ann.height
          });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      el.appendChild(handle);
    }
  }

  makeDraggable(el, pageNum, ann) {
    let startX, startY, origX, origY;

    const onMouseDown = (e) => {
      const state = store.getState();
      if (state.activeTool !== 'select' && state.activeTool !== ann.type) return;
      if (e.target.closest('.annot-delete-btn') || e.target.tagName === 'INPUT') return;

      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      origX = ann.x;
      origY = ann.y;

      const refs = this.pageElements.get(pageNum);
      const w = refs.wrap.clientWidth;
      const h = refs.wrap.clientHeight;

      const onMouseMove = (moveEv) => {
        const dx = (moveEv.clientX - startX) / w;
        const dy = (moveEv.clientY - startY) / h;
        ann.x = Math.max(0, Math.min(1 - ann.width, origX + dx));
        ann.y = Math.max(0, Math.min(1 - ann.height, origY + dy));
        el.style.left = `${ann.x * w}px`;
        el.style.top = `${ann.y * h}px`;
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        store.updateAnnotation(pageNum, ann.id, { x: ann.x, y: ann.y });
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', onMouseDown);
  }

  bindPageEvents(pageNum, wrap, annotCanvas, domLayer) {
    let drawingPoints = [];

    const getPos = (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      return {
        px: x,
        py: y,
        normX: x / rect.width,
        normY: y / rect.height
      };
    };

    wrap.addEventListener('mousedown', (e) => {
      if (e.target.closest('.annot-item') || e.target.closest('.inline-text-editor')) return;

      const state = store.getState();
      const pos = getPos(e);

      if (state.activeTool === 'eraser') {
        this.isErasing = true;
        this.eraseAtPosition(pageNum, pos, wrap);
        return;
      } else if (state.activeTool === 'draw' || state.activeTool === 'highlight') {
        this.isDrawing = true;
        drawingPoints = [{ x: pos.normX, y: pos.normY }];
      } else if (state.activeTool === 'whiteout') {
        this.startBoxDrawing(pageNum, 'whiteout', pos, wrap);
      } else if (state.activeTool === 'shape') {
        this.startBoxDrawing(pageNum, 'shape', pos, wrap);
      } else if (state.activeTool === 'text') {
        // Place new text at click location
        this.promptNewText(pageNum, pos, wrap);
      }
    });

    wrap.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      if (this.isErasing) {
        this.eraseAtPosition(pageNum, pos, wrap);
        return;
      }
      if (!this.isDrawing) return;
      drawingPoints.push({ x: pos.normX, y: pos.normY });

      // Live sketch on annotCanvas
      const ctx = annotCanvas.getContext('2d');
      const state = store.getState();
      ctx.save();
      ctx.strokeStyle = state.activeColor || (state.activeTool === 'highlight' ? '#ffff00' : '#ff0000');
      ctx.lineWidth = (state.activeStrokeWidth || 3) * (wrap.clientWidth / 600);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (state.activeTool === 'highlight') ctx.globalAlpha = 0.4;

      const p1 = drawingPoints[drawingPoints.length - 2];
      const p2 = drawingPoints[drawingPoints.length - 1];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * wrap.clientWidth, p1.y * wrap.clientHeight);
        ctx.lineTo(p2.x * wrap.clientWidth, p2.y * wrap.clientHeight);
        ctx.stroke();
      }
      ctx.restore();
    });

    const stopAction = () => {
      this.isErasing = false;
      if (!this.isDrawing) return;
      this.isDrawing = false;
      const state = store.getState();
      if (drawingPoints.length > 1) {
        store.addAnnotation(pageNum, {
          id: uid('draw'),
          type: 'drawing',
          points: drawingPoints,
          color: state.activeColor || (state.activeTool === 'highlight' ? '#ffd700' : '#ff0000'),
          strokeWidth: state.activeStrokeWidth || 3,
          isHighlighter: state.activeTool === 'highlight'
        });
      }
      drawingPoints = [];
    };

    wrap.addEventListener('mouseup', stopAction);
    wrap.addEventListener('mouseleave', stopAction);
  }

  eraseAtPosition(pageNum, pos, wrap) {
    const annotations = store.getAnnotations(pageNum);
    if (!annotations || annotations.length === 0) return;

    const eraseRadius = 22; // Pixel radius
    const toRemove = [];

    for (const ann of annotations) {
      if (ann.type === 'drawing') {
        if (!ann.points) continue;
        for (const pt of ann.points) {
          const dx = (pt.x - pos.normX) * wrap.clientWidth;
          const dy = (pt.y - pos.normY) * wrap.clientHeight;
          if (dx * dx + dy * dy <= eraseRadius * eraseRadius) {
            toRemove.push(ann.id);
            break;
          }
        }
      } else if (['shape', 'whiteout', 'image', 'text', 'signature'].includes(ann.type)) {
        const annLeft = ann.x * wrap.clientWidth;
        const annTop = ann.y * wrap.clientHeight;
        const annRight = annLeft + (ann.width * wrap.clientWidth);
        const annBottom = annTop + (ann.height * wrap.clientHeight);

        if (pos.px >= annLeft - eraseRadius &&
            pos.px <= annRight + eraseRadius &&
            pos.py >= annTop - eraseRadius &&
            pos.py <= annBottom + eraseRadius) {
          toRemove.push(ann.id);
        }
      }
    }

    if (toRemove.length > 0) {
      toRemove.forEach(id => store.removeAnnotation(pageNum, id));
    }
  }

  promptNewText(pageNum, pos, wrap) {
    const state = store.getState();
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-text-editor new-text-editor';
    input.placeholder = 'Type text here...';
    input.style.left = `${pos.px}px`;
    input.style.top = `${pos.py}px`;
    input.style.fontSize = `${state.activeFontSize || 16}px`;
    input.style.color = state.activeColor || '#000000';
    input.style.fontFamily = state.activeFontFamily || 'Helvetica';

    const commit = () => {
      const text = input.value.trim();
      input.remove();
      if (text) {
        store.addAnnotation(pageNum, {
          id: uid('text'),
          type: 'text',
          text,
          x: pos.normX,
          y: pos.normY,
          width: Math.min(0.4, (text.length * 10) / w),
          height: 30 / h,
          fontSize: state.activeFontSize || 16,
          fontFamily: state.activeFontFamily || 'Helvetica',
          color: state.activeColor || '#000000',
          hasUnderlay: false
        });
      }
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') input.remove();
    });

    wrap.querySelector('.pdf-dom-layer').appendChild(input);
    input.focus();
  }

  startBoxDrawing(pageNum, toolType, startPos, wrap) {
    const state = store.getState();
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    const box = document.createElement('div');
    box.className = 'live-drag-box';
    wrap.appendChild(box);

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const left = Math.min(startPos.px, curX);
      const top = Math.min(startPos.py, curY);
      const width = Math.abs(curX - startPos.px);
      const height = Math.abs(curY - startPos.py);

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };

    const onUp = (e) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      const rect = wrap.getBoundingClientRect();
      const endX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const endY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const left = Math.min(startPos.px, endX);
      const top = Math.min(startPos.py, endY);
      const width = Math.abs(endX - startPos.px);
      const height = Math.abs(endY - startPos.py);

      box.remove();

      if (width > 5 && height > 5) {
        if (toolType === 'whiteout') {
          store.addAnnotation(pageNum, {
            id: uid('whiteout'),
            type: 'whiteout',
            x: left / w,
            y: top / h,
            width: width / w,
            height: height / h
          });
        } else if (toolType === 'shape') {
          store.addAnnotation(pageNum, {
            id: uid('shape'),
            type: 'shape',
            shapeType: state.subTool || 'rectangle',
            x: left / w,
            y: top / h,
            width: width / w,
            height: height / h,
            strokeColor: state.activeColor || '#000000',
            strokeWidth: state.activeStrokeWidth || 2,
            fillColor: state.activeFillColor || 'transparent'
          });
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  bindGlobalEvents() {
    store.subscribe((event, state, payload) => {
      if (event === 'document-loaded' || event === 'scale-changed' || event === 'pages-reordered' || event === 'page-added') {
        this.renderDocument();
      } else if (event === 'annotation-added' || event === 'annotation-updated' || event === 'annotation-removed') {
        if (payload?.pageNum) {
          this.renderAnnotations(payload.pageNum);
        }
      } else if (event === 'page-rotated') {
        if (payload?.pageNum) {
          this.renderPage(payload.pageNum);
        }
      } else if (event === 'page-deleted') {
        if (payload?.pageNum) {
          const el = this.pageElements.get(payload.pageNum);
          if (el) el.wrap.remove();
        }
      } else if (event === 'undo-performed' || event === 'redo-performed' || event === 'watermark-updated' || event === 'pagenumbers-updated') {
        for (let p = 1; p <= state.pageCount; p++) {
          if (!state.deletedPages.has(p)) {
            this.renderAnnotations(p);
          }
        }
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('click', (e) => {
        if (!e.target.closest('.annot-item') && !e.target.closest('.tool-btn')) {
          this.deselectAnnotation();
        }
      });

      window.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedAnnotation) {
          if (!e.target.matches('input, textarea, [contenteditable="true"]')) {
            e.preventDefault();
            const { pageNum, ann } = this.selectedAnnotation;
            store.removeAnnotation(pageNum, ann.id);
            this.deselectAnnotation();
          }
        }
      });
    }
  }
}
