/**
 * Main Application Bootstrap & Event Orchestration
 */

import { store } from './core/state-store.js';
import { pdfEngine } from './core/pdf-engine.js';
import { CanvasManager } from './core/canvas-manager.js';
import { Sidebar } from './components/sidebar.js';
import { SignatureTool } from './tools/signature-tool.js';
import { ImageTool } from './tools/image-tool.js';
import { FormTool } from './tools/form-tool.js';
import { searchReplace } from './tools/search-replace.js';
import { AuthModal } from './components/auth-modal.js';
import { Toast } from './components/toast.js';
import { downloadBlob, readFileAsArrayBuffer } from './utils/helpers.js';

class App {
  constructor() {
    this.canvasManager = null;
    this.sidebar = null;
    this.signatureTool = null;
    this.imageTool = null;
    this.authModal = null;
  }

  async init() {
    const viewport = document.getElementById('document-viewport');
    const sidebarEl = document.getElementById('app-sidebar');

    // Initialize core components
    this.canvasManager = new CanvasManager(viewport);
    this.sidebar = new Sidebar(sidebarEl);
    this.signatureTool = new SignatureTool();
    this.imageTool = new ImageTool();
    this.authModal = new AuthModal();

    this.bindNavbarEvents();
    this.bindToolbarEvents();
    this.bindKeyboardShortcuts();

    // Check for autosave / recovery
    const recovered = this.tryRestoreAutosave();

    if (!recovered) {
      // Create and load default sample PDF
      try {
        const sampleBytes = await pdfEngine.createSamplePdf();
        const info = await pdfEngine.loadPdf(sampleBytes);
        store.setDocument(sampleBytes, 'Sample_Agreement.pdf', info.numPages);
        Toast.success('Sample PDF loaded! Ready to edit.');
      } catch (err) {
        console.error('Failed to create sample PDF:', err);
        Toast.error('Could not initialize sample document');
      }
    }
  }

  tryRestoreAutosave() {
    try {
      const raw = localStorage.getItem('pdf_editor_recovery_v2');
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.annotations && Object.keys(data.annotations).length > 0) {
          // Found recovery
          console.log('Recovery state found');
        }
      }
    } catch (e) {
      // Ignore
    }
    return false;
  }

  bindNavbarEvents() {
    // Toggle sidebar
    document.getElementById('toggle-sidebar-btn').onclick = () => {
      document.body.classList.toggle('sidebar-open');
    };

    // Open PDF file
    const fileInput = document.getElementById('upload-pdf-input');
    document.getElementById('btn-open-pdf').onclick = () => fileInput.click();

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        try {
          Toast.info('Loading PDF document...');
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const info = await pdfEngine.loadPdf(arrayBuffer);
          store.setDocument(arrayBuffer, file.name, info.numPages);
          document.getElementById('current-filename').textContent = file.name;
          Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
        } catch (err) {
          console.error(err);
          Toast.error('Failed to open PDF document');
        }
      }
      fileInput.value = '';
    };

    // Undo / Redo
    document.getElementById('btn-undo').onclick = () => store.undo();
    document.getElementById('btn-redo').onclick = () => store.redo();

    // Zoom
    const zoomText = document.getElementById('zoom-level-text');
    document.getElementById('btn-zoom-in').onclick = () => {
      const cur = store.getState().scale;
      store.setScale(cur + 0.15);
    };
    document.getElementById('btn-zoom-out').onclick = () => {
      const cur = store.getState().scale;
      store.setScale(cur - 0.15);
    };

    store.subscribe((event, state) => {
      if (event === 'scale-changed') {
        zoomText.textContent = `${Math.round(state.scale * 100)}%`;
      } else if (event === 'user-changed') {
        const userBtn = document.getElementById('user-display-name');
        if (state.user) {
          userBtn.textContent = state.user.name;
        } else {
          userBtn.textContent = 'Log in';
        }
      }
    });

    // Auth Modal trigger
    document.getElementById('btn-open-auth').onclick = () => {
      const state = store.getState();
      if (state.user) {
        if (confirm(`Logged in as ${state.user.name}. Would you like to log out?`)) {
          store.setUser(null);
          Toast.info('Signed out');
        }
      } else {
        this.authModal.open();
      }
    };

    // Export & Download
    document.getElementById('btn-save-pdf').onclick = async () => {
      try {
        Toast.info('Compiling & generating vector PDF...');
        const state = store.getState();
        const pdfBytes = await pdfEngine.exportPdf(state);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const name = (state.filename || 'document').replace('.pdf', '') + '_edited.pdf';
        downloadBlob(blob, name);
        Toast.success('PDF successfully exported!');
      } catch (err) {
        console.error('Export error:', err);
        Toast.error('Failed to export PDF: ' + err.message);
      }
    };
  }

  bindToolbarEvents() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const colorWrap = document.getElementById('prop-color-wrap');
    const fontSizeWrap = document.getElementById('prop-font-size-wrap');
    const fontFamilyWrap = document.getElementById('prop-font-family-wrap');
    const strokeWidthWrap = document.getElementById('prop-stroke-width-wrap');
    const shapeTypeWrap = document.getElementById('prop-shape-type-wrap');
    const formTypeWrap = document.getElementById('prop-form-type-wrap');
    const replaceWrap = document.getElementById('prop-replace-wrap');

    toolBtns.forEach(btn => {
      btn.onclick = () => {
        const tool = btn.dataset.tool;

        if (tool === 'sign') {
          this.signatureTool.open();
          return;
        }

        if (tool === 'image') {
          this.imageTool.triggerUpload();
          return;
        }

        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setTool(tool);

        // Adjust properties bar based on tool
        colorWrap.style.display = ['text', 'draw', 'highlight', 'shape'].includes(tool) ? 'flex' : 'none';
        fontSizeWrap.style.display = tool === 'text' ? 'flex' : 'none';
        fontFamilyWrap.style.display = tool === 'text' ? 'flex' : 'none';
        strokeWidthWrap.style.display = ['draw', 'highlight', 'shape'].includes(tool) ? 'flex' : 'none';
        shapeTypeWrap.style.display = tool === 'shape' ? 'flex' : 'none';
        formTypeWrap.style.display = tool === 'form' ? 'flex' : 'none';
        replaceWrap.style.display = tool === 'replace' ? 'flex' : 'none';
      };
    });

    // Inspector inputs
    const colorInp = document.getElementById('prop-color');
    colorInp.oninput = (e) => {
      store.getState().activeColor = e.target.value;
    };

    const fontSizeSel = document.getElementById('prop-font-size');
    fontSizeSel.onchange = (e) => {
      store.getState().activeFontSize = parseInt(e.target.value, 10);
    };

    const fontFamilySel = document.getElementById('prop-font-family');
    fontFamilySel.onchange = (e) => {
      store.getState().activeFontFamily = e.target.value;
    };

    const strokeWidthSel = document.getElementById('prop-stroke-width');
    strokeWidthSel.onchange = (e) => {
      store.getState().activeStrokeWidth = parseInt(e.target.value, 10);
    };

    const shapeTypeSel = document.getElementById('prop-shape-type');
    shapeTypeSel.onchange = (e) => {
      store.getState().subTool = e.target.value;
    };

    // Form button triggers
    document.getElementById('btn-add-form-text').onclick = () => FormTool.addField('text');
    document.getElementById('btn-add-form-checkbox').onclick = () => FormTool.addField('checkbox');
    document.getElementById('btn-add-form-radio').onclick = () => FormTool.addField('radio');

    // Find & replace
    const findInp = document.getElementById('find-query-input');
    const repInp = document.getElementById('replace-query-input');
    const searchCountBadge = document.getElementById('search-count-badge');

    document.getElementById('btn-do-search').onclick = async () => {
      const q = findInp.value.trim();
      const res = await searchReplace.search(q);
      searchCountBadge.textContent = `${res.total} found`;
      if (res.total > 0) Toast.info(`Found ${res.total} matches`);
      else Toast.info('No matches found');
    };

    document.getElementById('btn-do-replace').onclick = () => {
      const q = findInp.value.trim();
      const rep = repInp.value;
      if (!q) {
        Toast.warning('Enter search text first');
        return;
      }
      const count = searchReplace.replaceAll(q, rep);
      searchCountBadge.textContent = '0 found';
    };
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
          store.undo();
        }
      }
      // Redo
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
          store.redo();
        }
      }
      // Escape to select tool
      if (e.key === 'Escape') {
        const selectBtn = document.querySelector('.tool-btn[data-tool="select"]');
        if (selectBtn) selectBtn.click();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
