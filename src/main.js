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
import { WatermarkModal } from './components/watermark-modal.js';
import { PageNumbersModal } from './components/pagenumbers-modal.js';
import { SecurityModal } from './components/security-modal.js';
import { cropModal } from './components/crop-modal.js';
import { metadataModal } from './components/metadata-modal.js';
import { batesModal } from './components/bates-modal.js';
import { splitModal } from './components/split-modal.js';
import { nUpModal } from './components/nup-modal.js';
import { alternateMixModal } from './components/alternate-mix-modal.js';
import { splitHalfModal } from './components/split-half-modal.js';
import { pdfToImageModal } from './components/pdf-to-image-modal.js';
import { resizeModal } from './components/resize-modal.js';
import { compressModal } from './components/compress-modal.js';
import { flipModal } from './components/flip-modal.js';
import { grayscaleModal } from './components/grayscale-modal.js';
import { allToolsModal } from './components/all-tools-modal.js';
import { landingPage } from './components/landing-page.js';
import { applyTheme, toggleTheme, getPreferredTheme } from './utils/theme.js';
import { Toast } from './components/toast.js';
import { downloadBlob, readFileAsArrayBuffer } from './utils/helpers.js';

class App {
  constructor() {
    this.canvasManager = null;
    this.sidebar = null;
    this.signatureTool = null;
    this.imageTool = null;
    this.authModal = null;
    this.watermarkModal = null;
    this.pageNumbersModal = null;
    this.securityModal = null;
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
    this.watermarkModal = new WatermarkModal();
    this.pageNumbersModal = new PageNumbersModal();
    this.securityModal = new SecurityModal();

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
    // Back to Landing / Home
    const homeBtn = document.getElementById('btn-studio-home');
    if (homeBtn) {
      homeBtn.onclick = () => {
        landingPage.switchToLanding();
      };
    }

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

    // Dark / Light Theme Toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    applyTheme(getPreferredTheme());

    if (themeBtn) {
      themeBtn.onclick = () => {
        const next = toggleTheme();
        Toast.info(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} theme`);
      };
    }

    // All Tools Hub modal
    const allToolsBtn = document.getElementById('btn-open-all-tools');
    if (allToolsBtn) allToolsBtn.onclick = () => allToolsModal.show();

    // Inline rename document title
    const filenameEl = document.getElementById('current-filename');
    if (filenameEl) {
      filenameEl.onclick = () => {
        const current = store.getState().filename || 'Sample_Document.pdf';
        const newName = prompt('Rename document:', current);
        if (newName && newName.trim() !== '') {
          const finalName = newName.trim().endsWith('.pdf') ? newName.trim() : `${newName.trim()}.pdf`;
          store.getState().filename = finalName;
          store.getState().documentName = finalName;
          filenameEl.textContent = finalName;
          Toast.success(`Renamed document to ${finalName}`);
        }
      };
    }
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

    // Standalone action buttons on toolbar
    const wmBtn = document.getElementById('btn-open-watermark');
    if (wmBtn) wmBtn.onclick = () => this.watermarkModal.open();

    const pnBtn = document.getElementById('btn-open-pagenumbers');
    if (pnBtn) pnBtn.onclick = () => this.pageNumbersModal.open();

    const secBtn = document.getElementById('btn-open-security');
    if (secBtn) secBtn.onclick = () => this.securityModal.open();

    const cropBtn = document.getElementById('btn-open-crop');
    if (cropBtn) cropBtn.onclick = () => cropModal.show();

    const metaBtn = document.getElementById('btn-open-metadata');
    if (metaBtn) metaBtn.onclick = () => metadataModal.show();

    const batesBtn = document.getElementById('btn-open-bates');
    if (batesBtn) batesBtn.onclick = () => batesModal.show();

    const splitBtn = document.getElementById('btn-open-split');
    if (splitBtn) splitBtn.onclick = () => splitModal.show();

    const nupBtn = document.getElementById('btn-open-nup');
    if (nupBtn) nupBtn.onclick = () => nUpModal.show();

    const mixBtn = document.getElementById('btn-open-mix');
    if (mixBtn) mixBtn.onclick = () => alternateMixModal.show();

    const splitHalfBtn = document.getElementById('btn-open-split-half');
    if (splitHalfBtn) splitHalfBtn.onclick = () => splitHalfModal.show();

    const toImageBtn = document.getElementById('btn-open-to-image');
    if (toImageBtn) toImageBtn.onclick = () => pdfToImageModal.show();

    const resizeBtn = document.getElementById('btn-open-resize');
    if (resizeBtn) resizeBtn.onclick = () => resizeModal.show();

    const flipBtn = document.getElementById('btn-open-flip');
    if (flipBtn) flipBtn.onclick = () => flipModal.show();

    const compressBtn = document.getElementById('btn-open-compress');
    if (compressBtn) compressBtn.onclick = () => compressModal.show();

    const grayscaleBtn = document.getElementById('btn-open-grayscale');
    if (grayscaleBtn) grayscaleBtn.onclick = () => grayscaleModal.show();

    // Convert dropdown quick actions
    const quickImgToPdf = document.getElementById('btn-quick-images-to-pdf');
    if (quickImgToPdf) {
      quickImgToPdf.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const files = Array.from(e.target.files);
          if (files.length > 0) {
            Toast.info(`Converting ${files.length} images to PDF...`);
            const buffers = await Promise.all(files.map(f => f.arrayBuffer()));
            const newPdf = await pdfEngine.imagesToPdf(buffers);
            const info = await pdfEngine.loadPdf(newPdf);
            store.setDocument(newPdf, 'Images_Combined.pdf', info.numPages);
            Toast.success(`Created PDF from ${files.length} images!`);
          }
        };
        input.click();
      };
    }

    const quickExtractText = document.getElementById('btn-quick-extract-text');
    if (quickExtractText) {
      quickExtractText.onclick = async () => {
        const state = store.getState();
        if (!state.pdfBytes) return Toast.error('No document loaded');
        Toast.info('Extracting searchable text...');
        const text = await pdfEngine.extractDocumentText(state.pdfBytes);
        const blob = new Blob([text], { type: 'text/plain' });
        const name = (state.documentName || 'Document').replace(/\.pdf$/i, '') + '_text.txt';
        downloadBlob(blob, name);
        Toast.success('Extracted plain text downloaded!');
      };
    }

    toolBtns.forEach(btn => {
      btn.onclick = () => {
        const tool = btn.dataset.tool;
        if (!tool) return;

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
    const chkCase = document.getElementById('chk-search-case');
    const chkRegex = document.getElementById('chk-search-regex');

    const updateBadge = (res) => {
      if (!res || res.total === 0) {
        searchCountBadge.textContent = '0/0';
      } else {
        searchCountBadge.textContent = `${res.current}/${res.total}`;
      }
    };

    document.getElementById('btn-do-search').onclick = async () => {
      const q = findInp.value.trim();
      const res = await searchReplace.search(q, {
        isRegex: chkRegex ? chkRegex.checked : false,
        matchCase: chkCase ? chkCase.checked : false
      });
      updateBadge(res);
      if (res.total > 0) Toast.info(`Found ${res.total} matches`);
      else Toast.info('No matches found');
    };

    const prevBtn = document.getElementById('btn-prev-match');
    if (prevBtn) {
      prevBtn.onclick = () => {
        const res = searchReplace.prevMatch();
        updateBadge(res);
      };
    }

    const nextBtn = document.getElementById('btn-next-match');
    if (nextBtn) {
      nextBtn.onclick = () => {
        const res = searchReplace.nextMatch();
        updateBadge(res);
      };
    }

    const repOneBtn = document.getElementById('btn-do-replace-one');
    if (repOneBtn) {
      repOneBtn.onclick = () => {
        const rep = repInp.value;
        const res = searchReplace.replaceCurrent(rep);
        updateBadge(res);
      };
    }

    document.getElementById('btn-do-replace').onclick = () => {
      const q = findInp.value.trim();
      const rep = repInp.value;
      if (!q) {
        Toast.warning('Enter search text first');
        return;
      }
      const count = searchReplace.replaceAll(q, rep, {
        isRegex: chkRegex ? chkRegex.checked : false,
        matchCase: chkCase ? chkCase.checked : false
      });
      searchCountBadge.textContent = '0/0';
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
      // Slash (/) to open All Tools Hub (Canva style)
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        allToolsModal.show();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
