/**
 * Canvas Manager: Orchestrates multi-layer page rendering & interactions
 */

import { pdfEngine } from './pdf-engine.js';
import { store } from './state-store.js';
import { uid, readFileAsArrayBuffer } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';
import { ResizeGizmo } from './canvas/resize-gizmo.js';
import { EraserHandler } from './canvas/eraser.js';
import { TextClustering } from './canvas/text-clustering.js';
import { FloatingBubbleBar } from './canvas/bubble-toolbar.js';

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
            // Update active visible page in paging bar
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
    const pagingBar = document.getElementById('editor-paging-bar');
    if (pagingBar) pagingBar.style.display = 'none';

    const emptyWrap = document.createElement('div');
    emptyWrap.className = 'editor-upload-card';
    emptyWrap.id = 'editor-empty-dropzone';
    emptyWrap.innerHTML = `
      <div class="editor-upload-icon-circle">
        <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M12 18v-6m-3 3l3-3 3 3"></path>
        </svg>
      </div>
      <h2 class="editor-upload-title">Upload PDF to Start Editing</h2>
      <p class="editor-upload-subtitle">
        Edit existing text, fill & sign forms, add shapes, whiteout sensitive data, and annotate directly in your browser.
      </p>

      <div class="editor-upload-actions">
        <input type="file" id="editor-empty-file-input" accept="application/pdf" style="display:none;" />
        <button class="btn btn-primary btn-lg" id="btn-editor-upload-pdf">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
          <span>Choose PDF Document</span>
        </button>
        <button class="btn btn-outline btn-lg" id="btn-editor-blank-doc">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"></rect><line x1="8" y1="8" x2="16" y2="8"></line></svg>
          <span>Start with Blank Page</span>
        </button>
      </div>

      <div class="editor-upload-drop-hint">
        or drag and drop your PDF anywhere in this window
      </div>

      <div class="editor-upload-sample-link">
        Want to test all features first? <button class="btn-link" id="btn-editor-load-sample">Load a sample contract</button>
      </div>

      <div class="editor-upload-features">
        <div class="feature-pill"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> 100% Private (No Cloud Uploads)</div>
        <div class="feature-pill"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Edit Original Text</div>
        <div class="feature-pill"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Sub-Second WASM Engine</div>
      </div>
    `;

    this.container.appendChild(emptyWrap);

    const fileInp = emptyWrap.querySelector('#editor-empty-file-input');
    const uploadBtn = emptyWrap.querySelector('#btn-editor-upload-pdf');
    const blankBtn = emptyWrap.querySelector('#btn-editor-blank-doc');
    const sampleBtn = emptyWrap.querySelector('#btn-editor-load-sample');

    if (uploadBtn && fileInp) {
      uploadBtn.onclick = () => fileInp.click();
      fileInp.onchange = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
          try {
            Toast.info('Loading PDF document...');
            const ab = await readFileAsArrayBuffer(file);
            const info = await pdfEngine.loadPdf(ab);
            store.setDocument(ab, file.name, info.numPages);
            const filenameEl = document.getElementById('current-filename');
            if (filenameEl) filenameEl.textContent = file.name;
            Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
          } catch (err) {
            console.error(err);
            Toast.error('Could not load PDF');
          }
        }
      };
    }

    if (blankBtn) {
      blankBtn.onclick = async () => {
        try {
          Toast.info('Creating clean blank page...');
          const blankBytes = await pdfEngine.createBlankPdf();
          const info = await pdfEngine.loadPdf(blankBytes);
          store.setDocument(blankBytes, 'Blank_Document.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Blank_Document.pdf';
          Toast.success('Blank document ready! Add text, shapes, or signatures.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to create blank page');
        }
      };
    }

    if (sampleBtn) {
      sampleBtn.onclick = async () => {
        try {
          Toast.info('Loading sample agreement...');
          const sampleBytes = await pdfEngine.createSamplePdf();
          const info = await pdfEngine.loadPdf(sampleBytes);
          store.setDocument(sampleBytes, 'Sample_Agreement.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Sample_Agreement.pdf';
          Toast.success('Sample document loaded! Ready to edit.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to load sample document');
        }
      };
    }

    emptyWrap.ondragover = (e) => {
      e.preventDefault();
      emptyWrap.classList.add('drag-over');
    };
    emptyWrap.ondragleave = () => {
      emptyWrap.classList.remove('drag-over');
    };
    emptyWrap.ondrop = async (e) => {
      e.preventDefault();
      emptyWrap.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        try {
          Toast.info('Loading PDF document...');
          const ab = await readFileAsArrayBuffer(file);
          const info = await pdfEngine.loadPdf(ab);
          store.setDocument(ab, file.name, info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = file.name;
          Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
        } catch (err) {
          console.error(err);
          Toast.error('Could not load PDF');
        }
      } else {
        Toast.error('Please drop a valid PDF document');
      }
    };
  }

  renderPagingBar(activePages) {
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
    const currentNum = this.currentPageNumber || 1;

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
      prevBtn.onclick = () => this.goToPrevPage();
    }

    if (nextBtn) {
      nextBtn.onclick = () => this.goToNextPage();
    }

    if (pageInp) {
      pageInp.onchange = () => {
        const val = parseInt(pageInp.value, 10);
        if (val >= 1 && val <= activePages.length) {
          this.scrollToPage(activePages[val - 1]);
        } else {
          pageInp.value = this.currentPageNumber;
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

  goToNextPage() {
    const state = store.getState();
    const activePages = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder.filter(p => !state.deletedPages.has(p))
      : Array.from({ length: state.pageCount }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));
    const idx = activePages.indexOf(this.currentPageNumber);
    if (idx !== -1 && idx < activePages.length - 1) {
      this.scrollToPage(activePages[idx + 1]);
    }
  }

  goToPrevPage() {
    const state = store.getState();
    const activePages = state.pageOrder && state.pageOrder.length > 0
      ? state.pageOrder.filter(p => !state.deletedPages.has(p))
      : Array.from({ length: state.pageCount }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));
    const idx = activePages.indexOf(this.currentPageNumber);
    if (idx > 0) {
      this.scrollToPage(activePages[idx - 1]);
    }
  }

  initScrollSync() {
    if (this._scrollBound) return;
    this._scrollBound = true;

    let scrollRaf = null;
    this.container.addEventListener('scroll', () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const state = store.getState();
        if (!state.pdfBytes || state.pageCount === 0) return;

        const viewportRect = this.container.getBoundingClientRect();
        const viewportCenterY = viewportRect.top + viewportRect.height / 2;

        let closestPage = null;
        let minDistance = Infinity;

        const activePages = state.pageOrder && state.pageOrder.length > 0
          ? state.pageOrder.filter(p => !state.deletedPages.has(p))
          : Array.from({ length: state.pageCount }, (_, i) => i + 1).filter(p => !state.deletedPages.has(p));

        for (const pageNum of activePages) {
          const el = document.getElementById(`page-wrap-${pageNum}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            const pageCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenterY - pageCenterY);
            if (distance < minDistance) {
              minDistance = distance;
              closestPage = pageNum;
            }
          }
        }

        if (closestPage && closestPage !== this.currentPageNumber) {
          this.updateCurrentPage(closestPage);
        }
      });
    }, { passive: true });
  }

  scrollToPage(pageNum) {
    const el = document.getElementById(`page-wrap-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.updateCurrentPage(pageNum);
    }
  }

  updateCurrentPage(pageNum) {
    this.currentPageNumber = pageNum;
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
      span.style.fontFamily = TextClustering.getCssFontFamily(cluster.fontName);
      if (cluster.isBold) span.style.fontWeight = 'bold';

      span.dataset.clusterId = cluster.id;
      span.dataset.originalText = cluster.str;
      span.dataset.fontName = cluster.fontName;

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

            // Immediately simulate mousedown on new annotation element to continue dragging
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
    const refs = this.pageElements.get(pageNum);
    if (!refs) return;

    span.style.visibility = 'hidden';

    const wrapW = refs.wrap.clientWidth;
    const wrapH = refs.wrap.clientHeight;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-text-editor';
    input.value = cluster.str;
    input.style.left = `${cluster.vx - 3}px`;
    input.style.top = `${cluster.top - 2}px`;
    input.style.width = `${Math.max(cluster.width + 16, 90)}px`;
    input.style.height = `${cluster.height + 6}px`;
    input.style.fontSize = `${cluster.fontSize}px`;
    input.style.fontFamily = TextClustering.getCssFontFamily(cluster.fontName);
    if (cluster.isBold) input.style.fontWeight = 'bold';

    // Auto-grow width dynamically while typing
    const updateInputWidth = () => {
      const charW = (cluster.fontSize || 14) * 0.62;
      const dynamicWidth = Math.max(cluster.width + 16, (input.value.length * charW) + 28);
      input.style.width = `${dynamicWidth}px`;
    };
    input.addEventListener('input', updateInputWidth);

    let isCommitted = false;
    const commitChange = () => {
      if (isCommitted) return;
      isCommitted = true;
      const newText = input.value;
      input.remove();

      if (newText && newText !== cluster.str) {
        const charW = (cluster.fontSize || 14) * 0.62;
        const finalW = Math.max(cluster.width, newText.length * charW);
        store.addAnnotation(pageNum, {
          id: uid('text'),
          replacedClusterId: cluster.id,
          type: 'text',
          text: newText,
          x: (cluster.vx - 2) / wrapW,
          y: (cluster.top - 2) / wrapH,
          width: (finalW + 14) / wrapW,
          height: (cluster.height + 6) / wrapH,
          fontSize: cluster.fontSize,
          fontFamily: TextClustering.detectFontFamily(cluster.fontName),
          bold: cluster.isBold,
          color: '#000000',
          hasUnderlay: true // Whiteout underlay covers full cluster
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
        isCommitted = true;
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

      // Interactive DOM elements (Text, Images, Signatures, Form Controls, Links)
      if (['text', 'image', 'signature', 'form', 'whiteout', 'link'].includes(ann.type)) {
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

  attachResizeHandles(el, pageNum, ann) {
    ResizeGizmo.attachResizeHandles(el, pageNum, ann, this.pageElements, (p, a, e) => this.selectAnnotation(p, a, e));
  }

  makeDraggable(el, pageNum, ann) {
    ResizeGizmo.makeDraggable(el, pageNum, ann, this.pageElements, (p, a, e) => this.selectAnnotation(p, a, e));
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
      } else if (state.activeTool === 'link') {
        this.startBoxDrawing(pageNum, 'link', pos, wrap);
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
    EraserHandler.eraseAtPosition(pageNum, pos, wrap);
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
        } else if (toolType === 'link') {
          const defaultUrl = 'https://';
          const linkInput = prompt('Enter Web URL (e.g. https://example.com) or Page Number (e.g. 2):', defaultUrl);
          if (linkInput && linkInput.trim()) {
            const trimmed = linkInput.trim();
            const isPage = /^\d+$/.test(trimmed);
            store.addAnnotation(pageNum, {
              id: uid('link'),
              type: 'link',
              targetType: isPage ? 'page' : 'url',
              url: isPage ? undefined : (trimmed.startsWith('http') ? trimmed : 'https://' + trimmed),
              pageTarget: isPage ? parseInt(trimmed, 10) : undefined,
              x: left / w,
              y: top / h,
              width: Math.max(0.12, width / w),
              height: Math.max(0.04, height / h)
            });
            Toast.success(isPage ? `Link to page ${trimmed} added!` : `Link to ${trimmed} added!`);
          }
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
