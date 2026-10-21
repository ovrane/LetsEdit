/**
 * Central State Store for PDF Editor
 * Manages document metadata, annotations per page, undo/redo, and autosave.
 */

export class StateStore {
  constructor() {
    this.subscribers = new Set();
    this.reset();
  }

  reset() {
    this.state = {
      file: null,              // File object or null
      filename: 'Untitled.pdf',
      pdfBytes: null,          // ArrayBuffer of the source PDF
      pageCount: 0,
      scale: 1.2,              // Zoom scale
      activeTool: 'select',    // 'select', 'text', 'draw', 'highlight', 'whiteout', 'shape', 'sign', 'image', 'form'
      subTool: null,
      activeColor: '#000000',
      activeFontSize: 16,
      activeFontFamily: 'Helvetica',
      activeStrokeWidth: 2,
      activeFillColor: 'transparent',
      pageRotations: {},       // pageNum (1-based) -> rotation (0, 90, 180, 270)
      pageOrder: [],           // array of page numbers representing active sequence, e.g. [1, 2, 3]
      deletedPages: new Set(), // Set of deleted page numbers
      annotations: {},         // pageNum -> array of annotation items
      watermark: null,         // { text, opacity, rotation, color, fontSize }
      pageNumbers: null,       // { format, position }
      exportPassword: null,    // { userPassword, ownerPassword }
      history: [],             // Undo stack
      future: [],              // Redo stack
      user: JSON.parse(localStorage.getItem('pdf_user') || 'null'),
      isSearching: false,
      searchQuery: '',
      replaceQuery: '',
      searchResults: []
    };
  }

  getState() {
    return this.state;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, payload) {
    this.saveRecoveryState();
    this.subscribers.forEach(cb => {
      try {
        cb(event, this.state, payload);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  setTool(tool, subTool = null) {
    this.state.activeTool = tool;
    this.state.subTool = subTool;
    this.notify('tool-changed', { tool, subTool });
  }

  setScale(scale) {
    this.state.scale = Math.min(Math.max(scale, 0.4), 3.0);
    this.notify('scale-changed', { scale: this.state.scale });
  }

  setDocument(pdfBytes, filename = 'document.pdf', pageCount = 0) {
    this.saveSnapshot('Load Document');
    this.state.pdfBytes = pdfBytes;
    this.state.filename = filename;
    this.state.pageCount = pageCount;
    this.state.pageRotations = {};
    this.state.pageOrder = [];
    this.state.deletedPages = new Set();
    this.state.annotations = {};
    for (let i = 1; i <= pageCount; i++) {
      this.state.pageOrder.push(i);
      this.state.annotations[i] = [];
      this.state.pageRotations[i] = 0;
    }
    this.notify('document-loaded', { pageCount, filename, pageOrder: this.state.pageOrder });
  }

  reorderPages(fromIndex, toIndex) {
    this.saveSnapshot('Reorder Pages');
    const [moved] = this.state.pageOrder.splice(fromIndex, 1);
    this.state.pageOrder.splice(toIndex, 0, moved);
    this.notify('pages-reordered', { pageOrder: this.state.pageOrder });
  }

  addBlankPage(afterPageIndex = null) {
    this.saveSnapshot('Add Blank Page');
    const newPageNum = ++this.state.pageCount;
    this.state.annotations[newPageNum] = [];
    this.state.pageRotations[newPageNum] = 0;
    if (afterPageIndex === null || afterPageIndex < 0 || afterPageIndex >= this.state.pageOrder.length) {
      this.state.pageOrder.push(newPageNum);
    } else {
      this.state.pageOrder.splice(afterPageIndex + 1, 0, newPageNum);
    }
    this.notify('page-added', { pageNum: newPageNum, isBlank: true });
  }

  setWatermark(watermark) {
    this.saveSnapshot('Set Watermark');
    this.state.watermark = watermark;
    this.notify('watermark-updated', { watermark });
  }

  setPageNumbers(pageNumbers) {
    this.saveSnapshot('Set Page Numbers');
    this.state.pageNumbers = pageNumbers;
    this.notify('pagenumbers-updated', { pageNumbers });
  }

  setExportPassword(pwdConfig) {
    this.state.exportPassword = pwdConfig;
    this.notify('password-updated', { exportPassword: pwdConfig });
  }

  getAnnotations(pageNum) {
    if (!this.state.annotations[pageNum]) {
      this.state.annotations[pageNum] = [];
    }
    return this.state.annotations[pageNum];
  }

  addAnnotation(pageNum, annotation, skipHistory = false) {
    if (!skipHistory) this.saveSnapshot('Add Annotation');
    if (!this.state.annotations[pageNum]) {
      this.state.annotations[pageNum] = [];
    }
    this.state.annotations[pageNum].push(annotation);
    this.notify('annotation-added', { pageNum, annotation });
  }

  updateAnnotation(pageNum, id, updates) {
    this.saveSnapshot('Update Annotation');
    const list = this.getAnnotations(pageNum);
    const item = list.find(a => a.id === id);
    if (item) {
      Object.assign(item, updates);
      this.notify('annotation-updated', { pageNum, id, annotation: item });
    }
  }

  removeAnnotation(pageNum, id) {
    this.saveSnapshot('Delete Annotation');
    const list = this.getAnnotations(pageNum);
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      const removed = list.splice(idx, 1)[0];
      this.notify('annotation-removed', { pageNum, annotation: removed });
    }
  }

  rotatePage(pageNum, angle = 90) {
    this.saveSnapshot('Rotate Page');
    const current = this.state.pageRotations[pageNum] || 0;
    this.state.pageRotations[pageNum] = (current + angle) % 360;
    this.notify('page-rotated', { pageNum, rotation: this.state.pageRotations[pageNum] });
  }

  deletePage(pageNum) {
    this.saveSnapshot('Delete Page');
    this.state.deletedPages.add(pageNum);
    this.notify('page-deleted', { pageNum });
  }

  saveSnapshot(actionName = 'Edit') {
    const snapshot = {
      actionName,
      annotations: JSON.parse(JSON.stringify(this.state.annotations)),
      pageRotations: { ...this.state.pageRotations },
      deletedPages: new Set(this.state.deletedPages)
    };
    this.state.history.push(snapshot);
    if (this.state.history.length > 30) {
      this.state.history.shift();
    }
    this.state.future = [];
    this.notify('history-changed', { canUndo: true, canRedo: false });
  }

  undo() {
    if (this.state.history.length === 0) return;
    const currentSnapshot = {
      annotations: JSON.parse(JSON.stringify(this.state.annotations)),
      pageRotations: { ...this.state.pageRotations },
      deletedPages: new Set(this.state.deletedPages)
    };
    this.state.future.push(currentSnapshot);

    const prev = this.state.history.pop();
    this.state.annotations = prev.annotations;
    this.state.pageRotations = prev.pageRotations;
    this.state.deletedPages = prev.deletedPages;
    this.notify('undo-performed', {
      canUndo: this.state.history.length > 0,
      canRedo: true
    });
  }

  redo() {
    if (this.state.future.length === 0) return;
    const currentSnapshot = {
      annotations: JSON.parse(JSON.stringify(this.state.annotations)),
      pageRotations: { ...this.state.pageRotations },
      deletedPages: new Set(this.state.deletedPages)
    };
    this.state.history.push(currentSnapshot);

    const next = this.state.future.pop();
    this.state.annotations = next.annotations;
    this.state.pageRotations = next.pageRotations;
    this.state.deletedPages = next.deletedPages;
    this.notify('redo-performed', {
      canUndo: true,
      canRedo: this.state.future.length > 0
    });
  }

  saveRecoveryState() {
    try {
      if (!this.state.pdfBytes) return;
      const data = {
        filename: this.state.filename,
        pageCount: this.state.pageCount,
        annotations: this.state.annotations,
        pageRotations: this.state.pageRotations,
        deletedPages: Array.from(this.state.deletedPages),
        timestamp: Date.now()
      };
      localStorage.setItem('pdf_editor_recovery_v2', JSON.stringify(data));
    } catch (e) {
      // Ignore quota errors
    }
  }

  setUser(user) {
    this.state.user = user;
    if (user) {
      localStorage.setItem('pdf_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pdf_user');
    }
    this.notify('user-changed', { user });
  }
}

export const store = new StateStore();
