/**
 * Canvas Manager: Orchestrates multi-layer page rendering & interactions
 * Decomposed into modular sub-modules in ./canvas/:
 * - empty-state.js: Drag-and-drop zone and initialization prompts
 * - paging-bar.js: Paging bar navigation, zoom levels, and scroll sync
 * - annotation-renderer.js: Vector paths, shapes, form controls, and watermark overlays
 * - canvas-events.js: Mouse interactions, freehand drawing, and inline editing
 * - text-clustering.js, eraser.js, resize-gizmo.js, bubble-toolbar.js
 */

const getPdfEngine = async () => (await import('./pdf-engine.js')).pdfEngine;
import { store } from './state-store.js';
import { uid } from '../utils/helpers.js';
import { CanvasEmptyState } from './canvas/empty-state.js';
import { PagingBarHandler } from './canvas/paging-bar.js';
import { AnnotationRenderer } from './canvas/annotation-renderer.js';
import { CanvasEventsHandler } from './canvas/canvas-events.js';
import { TextClustering } from './canvas/text-clustering.js';
import { FloatingBubbleBar } from './canvas/bubble-toolbar.js';
import { getCssFontFamily } from './font-registry.js';
import { Toast } from '../components/toast.js';

export class CanvasManager {
  constructor(container) {
    this.container = container;
    this.pageElements = new Map(); // pageNum -> { wrap, canvas, textLayer, annotCanvas, domLayer }
    this.activeAnnotation = null;
    this.selectedAnnotation = null;
    this.isDrawing = false;
    this.isErasing = false;
    this.currentPoints = [];
    this.dragTarget = null;
    this.renderedPages = new Set();
    this.pageObserver = null;
    this.currentPageNumber = 1;

    this.bindGlobalEvents();
  }

  async renderDocument() {
    this.container.innerHTML = '';
    this.pageElements.clear();
    this.renderedPages.clear();

    const state = store.getState();
    if (!state.pdfBytes || state.pageCount === 0) {
      this.renderEmptyState();
      return;
    }

    const pageOrder = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder
      : Array.from({ length: state.pageCount }, (_, i) => i + 1);

    const activePages = pageOrder.filter(p => !state.deletedPages.has(p));

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
            this.updateCurrentPage(pageNum);
          }
        }
      }, {
        root: null,
        rootMargin: '600px 0px 600px 0px',
        threshold: 0.1
      });
    }

    for (const p of pageOrder) {
      if (state.deletedPages.has(p)) continue;
      const pageWrapper = this.createPageElement(p);
      this.container.appendChild(pageWrapper);

      // Render first page immediately; lazy-render remaining pages on viewport proximity
      if (p === activePages[0] || !this.pageObserver) {
        this.renderedPages.add(p);
        await this.renderPage(p);
      } else {
        this.pageObserver.observe(pageWrapper);
      }
    }

    this.renderPagingBar(activePages);
    this.initScrollSync();
  }

  renderEmptyState() {
    CanvasEmptyState.render(this.container);
  }

  renderPagingBar(activePages) {
    PagingBarHandler.renderPagingBar(this, activePages);
  }

  goToNextPage() {
    PagingBarHandler.goToNextPage(this);
  }

  goToPrevPage() {
    PagingBarHandler.goToPrevPage(this);
  }

  initScrollSync() {
    PagingBarHandler.initScrollSync(this);
  }

  scrollToPage(pageNum) {
    PagingBarHandler.scrollToPage(this, pageNum);
  }

  updateCurrentPage(pageNum) {
    PagingBarHandler.updateCurrentPage(this, pageNum);
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

    // Floating Quick Page Action Bar (Adobe Acrobat / Smallpdf reverse engineered)
    const quickBar = document.createElement('div');
    quickBar.className = 'page-quick-actions';
    quickBar.innerHTML = `
      <button type="button" class="quick-page-btn" data-action="rotate-cw" title="Rotate Clockwise 90°" aria-label="Rotate Clockwise 90°">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M23 4v6h-6"></path>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
      <button type="button" class="quick-page-btn" data-action="rotate-ccw" title="Rotate Counterclockwise 90°" aria-label="Rotate Counterclockwise 90°">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M1 4v6h6"></path>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
      </button>
      <button type="button" class="quick-page-btn" data-action="duplicate" title="Duplicate Page" aria-label="Duplicate Page">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button type="button" class="quick-page-btn" data-action="add-blank" title="Insert Blank Page After" aria-label="Insert Blank Page After">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </button>
      <button type="button" class="quick-page-btn quick-page-delete" data-action="delete" title="Delete Page" aria-label="Delete Page">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    quickBar.querySelectorAll('.quick-page-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const action = btn.dataset.action;
        if (action === 'rotate-cw') {
          store.rotatePage(pageNum, 90);
          Toast.show(`Page ${pageNum} rotated 90° clockwise`, 'info');
        } else if (action === 'rotate-ccw') {
          store.rotatePage(pageNum, 270);
          Toast.show(`Page ${pageNum} rotated 90° counterclockwise`, 'info');
        } else if (action === 'duplicate') {
          try {
            btn.disabled = true;
            Toast.show(`Duplicating page ${pageNum}...`, 'info');
            const engine = await getPdfEngine();
            await engine.duplicatePage(pageNum - 1);
            store.duplicatePage(pageNum);
            Toast.show(`Page ${pageNum} duplicated!`, 'success');
          } catch (err) {
            console.error(err);
            Toast.show('Failed to duplicate page: ' + err.message, 'error');
          } finally {
            btn.disabled = false;
          }
        } else if (action === 'add-blank') {
          try {
            btn.disabled = true;
            Toast.show(`Inserting blank page after page ${pageNum}...`, 'info');
            const engine = await getPdfEngine();
            await engine.insertBlankPage(pageNum - 1);
            store.addBlankPage(pageNum - 1);
            Toast.show(`Blank page inserted after page ${pageNum}!`, 'success');
          } catch (err) {
            console.error(err);
            Toast.show('Failed to insert blank page: ' + err.message, 'error');
          } finally {
            btn.disabled = false;
          }
        } else if (action === 'delete') {
          const activeCount = store.getState().pageOrder.filter(p => !store.getState().deletedPages.has(p)).length;
          if (activeCount <= 1) {
            Toast.show('Cannot delete the only page in the document', 'warning');
            return;
          }
          store.deletePage(pageNum);
          Toast.show(`Page ${pageNum} deleted`, 'info');
        }
      });
    });

    wrap.appendChild(canvas);
    wrap.appendChild(textLayer);
    wrap.appendChild(annotCanvas);
    wrap.appendChild(domLayer);
    wrap.appendChild(badge);
    wrap.appendChild(quickBar);

    this.pageElements.set(pageNum, { wrap, canvas, textLayer, annotCanvas, domLayer });
    this.bindPageEvents(pageNum, wrap, annotCanvas, domLayer);

    return wrap;
  }

  async renderPage(pageNum) {
    const refs = this.pageElements.get(pageNum);
    if (!refs) return;

    this.renderedPages.add(pageNum);

    const state = store.getState();
    const engine = await getPdfEngine();
    const page = await engine.getPage(pageNum);
    const rotation = state.pageRotations[pageNum] || 0;

    // Render PDF base canvas
    const viewport = await engine.renderPageToCanvas(page, refs.canvas, state.scale, rotation);

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
    const engine = await getPdfEngine();
    const { items, viewport } = await engine.extractTextItems(page, scale, rotation);
    const clusters = TextClustering.clusterTextItems(items, viewport, scale);

    const currentAnnotations = store.getAnnotations(pageNum) || [];
    const activeReplacedIds = new Set(
      currentAnnotations.filter(a => a.replacedClusterId).map(a => a.replacedClusterId)
    );

    for (const cluster of clusters) {
      if (!cluster.str || cluster.str.trim() === '') continue;

      const span = document.createElement('span');
      span.className = 'text-item';
      span.id = `text-cluster-${cluster.id}`;
      span.textContent = cluster.str;
      span.style.left = `${cluster.vx}px`;
      span.style.top = `${cluster.top}px`;
      span.style.width = `${cluster.width}px`;
      span.style.height = `${cluster.height}px`;
      span.style.fontSize = `${cluster.fontSize}px`;
      // Use FontRegistry for accurate CSS font matching
      const clusterFontId = cluster.fontId || TextClustering.detectFontFamily(cluster.fontName);
      span.style.fontFamily = getCssFontFamily(clusterFontId);
      if (cluster.isBold) span.style.fontWeight = 'bold';

      span.dataset.clusterId = cluster.id;
      span.dataset.originalText = cluster.str;
      span.dataset.fontName = cluster.fontName;
      span.dataset.fontId = clusterFontId;

      // Hide if there is already an active annotation replacing this cluster
      if (activeReplacedIds.has(cluster.id)) {
        span.style.visibility = 'hidden';
      }

      // Click or drag to move/edit existing text
      let dragStartX, dragStartY;
      let hasDragged = false;

      span.addEventListener('mousedown', (e) => {
        const state = store.getState();
        if (state.activeTool !== 'text' && state.activeTool !== 'select') return;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        hasDragged = false;

        const onTextMove = (moveEv) => {
          if (Math.hypot(moveEv.clientX - dragStartX, moveEv.clientY - dragStartY) > 4) {
            hasDragged = true;
            window.removeEventListener('mousemove', onTextMove);
            window.removeEventListener('mouseup', onTextUp);

            // Convert to movable annotation immediately with full cluster geometry
            const refs = this.pageElements.get(pageNum);
            if (!refs) return;
            span.style.visibility = 'hidden';
            const wrapW = refs.wrap.clientWidth || 1;
            const wrapH = refs.wrap.clientHeight || 1;

            const textAnn = {
              id: uid('text'),
              replacedClusterId: cluster.id,
              type: 'text',
              text: cluster.str,
              x: cluster.vx / wrapW,
              y: cluster.top / wrapH,
              width: (cluster.width + 12) / wrapW,
              height: (cluster.height + 6) / wrapH,
              fontSize: cluster.fontSize,
              fontFamily: TextClustering.detectFontFamily(cluster.fontName),
              bold: cluster.isBold,
              color: '#000000',
              hasUnderlay: true
            };
            store.addAnnotation(pageNum, textAnn);

            setTimeout(() => {
              const newEl = refs.domLayer.querySelector(`#annot-${textAnn.id}`);
              if (newEl) {
                const simulatedEvent = new MouseEvent('mousedown', {
                  clientX: moveEv.clientX,
                  clientY: moveEv.clientY,
                  bubbles: true
                });
                newEl.dispatchEvent(simulatedEvent);
              }
            }, 10);
          }
        };

        const onTextUp = () => {
          window.removeEventListener('mousemove', onTextMove);
          window.removeEventListener('mouseup', onTextUp);
          if (!hasDragged) {
            this.makeExistingTextEditable(span, pageNum, cluster);
          }
        };

        window.addEventListener('mousemove', onTextMove);
        window.addEventListener('mouseup', onTextUp);
      });

      textLayerEl.appendChild(span);
    }
  }

  makeExistingTextEditable(span, pageNum, cluster) {
    CanvasEventsHandler.makeExistingTextEditable(this, span, pageNum, cluster);
  }

  makeExistingAnnotationEditable(pageNum, ann, el) {
    CanvasEventsHandler.makeExistingAnnotationEditable(this, pageNum, ann, el);
  }

  renderAnnotations(pageNum) {
    AnnotationRenderer.renderAnnotations(this, pageNum);
  }

  drawArrow(ctx, fromX, fromY, toX, toY, width) {
    AnnotationRenderer.drawArrow(ctx, fromX, fromY, toX, toY, width);
  }

  renderDomElement(pageNum, ann, px, py, pw, ph, container) {
    AnnotationRenderer.renderDomElement(this, pageNum, ann, px, py, pw, ph, container);
  }

  selectAnnotation(pageNum, ann, el) {
    this.deselectAnnotation();
    this.selectedAnnotation = { pageNum, ann, el };
    el.classList.add('selected');
    FloatingBubbleBar.show(pageNum, ann, el, () => this.deselectAnnotation());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('letsedit:annotation-selected', { detail: { pageNum, ann, el } }));
    }
  }

  deselectAnnotation() {
    if (this.selectedAnnotation) {
      if (this.selectedAnnotation.el) {
        this.selectedAnnotation.el.classList.remove('selected');
      }
      FloatingBubbleBar.hide();
      this.selectedAnnotation = null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('letsedit:annotation-deselected'));
      }
    }
  }

  bindPageEvents(pageNum, wrap, annotCanvas, domLayer) {
    CanvasEventsHandler.bindPageEvents(this, pageNum, wrap, annotCanvas);
  }

  eraseAtPosition(pageNum, pos, wrap) {
    CanvasEventsHandler.eraseAtPosition(pageNum, pos, wrap);
  }

  promptNewText(pageNum, pos, wrap) {
    CanvasEventsHandler.promptNewText(pageNum, pos, wrap);
  }

  startBoxDrawing(pageNum, toolType, startPos, wrap) {
    CanvasEventsHandler.startBoxDrawing(pageNum, toolType, startPos, wrap);
  }

  bindGlobalEvents() {
    store.subscribe((event, state, payload) => {
      if (event === 'document-loaded' || event === 'scale-changed' || event === 'pages-reordered' || event === 'page-added' || event === 'page-duplicated') {
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
        if (!e.target.matches('input, textarea, [contenteditable="true"]')) {
          if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedAnnotation) {
            e.preventDefault();
            const { pageNum, ann } = this.selectedAnnotation;
            store.removeAnnotation(pageNum, ann.id);
            this.deselectAnnotation();
          } else if (e.key === 'PageDown') {
            e.preventDefault();
            this.goToNextPage();
          } else if (e.key === 'PageUp') {
            e.preventDefault();
            this.goToPrevPage();
          }
        }
      });

      window.addEventListener('letsedit:scroll-to-page', (e) => {
        if (e.detail?.pageNum) {
          this.scrollToPage(e.detail.pageNum);
        }
      });
    }
  }
}
