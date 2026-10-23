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
import { AuthModal, authModal } from './components/auth-modal.js';
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
import { extractImagesModal } from './components/extract-images-modal.js';
import { ocrModal } from './components/ocr-modal.js';
import { allToolsModal } from './components/all-tools-modal.js';
import { landingPage } from './components/landing-page.js';
import { toolOptionsPanel } from './components/tool-options-panel.js';
import { toolWorkflow } from './components/tool-workflow.js';
import { accountPage } from './components/account-page.js';
import { mobilePairPage } from './components/mobile-pair-page.js';
import { router } from './core/router.js';
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
    const toolSidebarEl = document.getElementById('tool-options-sidebar');

    // Initialize core components
    this.canvasManager = new CanvasManager(viewport);
    this.sidebar = new Sidebar(sidebarEl);
    this.signatureTool = new SignatureTool();
    this.imageTool = new ImageTool();
    this.authModal = authModal;
    this.watermarkModal = new WatermarkModal();
    this.pageNumbersModal = new PageNumbersModal();
    this.securityModal = new SecurityModal();

    if (toolSidebarEl) {
      toolOptionsPanel.mount(toolSidebarEl);
    }

    this.bindNavbarEvents();
    this.bindToolbarEvents();
    this.bindKeyboardShortcuts();
    this.setupAutosave();

    // Check for autosave / recovery
    const recovered = this.tryRestoreAutosave();
    if (!recovered) {
      this.canvasManager.renderEmptyState();
      const filenameEl = document.getElementById('current-filename');
      if (filenameEl) filenameEl.textContent = 'No document selected';
    }

    // Wire HTML5 URL Router for distinct iLovePDF routes (/merge_pdf, /compress_pdf, /split_pdf, etc.)
    router.subscribe((route) => {
      if (route.isLanding) {
        landingPage.switchToLanding({ updateUrl: false });
      } else if (route.isEditor) {
        landingPage.switchToStudio({ updateUrl: false });
      } else if (route.isAccount) {
        accountPage.show({ updateUrl: false });
      } else if (route.isLogin) {
        accountPage.showLogin({ updateUrl: false });
      } else if (route.isRegister) {
        accountPage.showRegister({ updateUrl: false });
      } else if (route.toolId === 'mobile-pair') {
        const landingView = document.getElementById('landing-view');
        const studioView = document.getElementById('studio-view');
        if (landingView) landingView.style.display = 'none';
        if (studioView) studioView.style.display = 'none';
        let mobileContainer = document.getElementById('mobile-pair-container');
        if (!mobileContainer) {
          mobileContainer = document.createElement('div');
          mobileContainer.id = 'mobile-pair-container';
          document.body.appendChild(mobileContainer);
        }
        mobileContainer.style.display = 'block';
        mobilePairPage.mount(mobileContainer);
      } else if (route.toolId) {
        toolWorkflow.openTool(route.toolId, { updateUrl: false });
      }
    });

    router.init();
  }

  setupAutosave() {
    store.subscribe((event, state) => {
      if (['annotation-added', 'annotation-updated', 'annotation-removed', 'watermark-updated', 'pagenumbers-updated'].includes(event)) {
        try {
          const serializable = {
            filename: state.filename || state.documentName || 'Document.pdf',
            pageCount: state.pageCount,
            annotations: Object.fromEntries(
              Array.from(state.annotations.entries()).map(([k, v]) => [k, v])
            ),
            timestamp: Date.now()
          };
          localStorage.setItem('pdf_editor_recovery_v2', JSON.stringify(serializable));
        } catch (e) {
          console.warn('Autosave serialization failed:', e);
        }
      }
    });
  }

  tryRestoreAutosave() {
    try {
      const raw = localStorage.getItem('pdf_editor_recovery_v2');
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.annotations && Object.keys(data.annotations).length > 0) {
          const totalAnnots = Object.values(data.annotations).reduce((sum, arr) => sum + (arr?.length || 0), 0);
          if (totalAnnots > 0) {
            const banner = document.createElement('div');
            banner.id = 'pdf-editor-recovery';
            banner.className = 'recovery-alert-banner';
            banner.innerHTML = `
              <div class="recovery-alert-content">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Found unsaved edits for <strong>${data.filename || 'Document'}</strong> (${totalAnnots} annotations). Restore your previous session?</span>
              </div>
              <div class="recovery-alert-actions">
                <button class="btn btn-sm btn-primary" id="btn-restore-session">Restore Work</button>
                <button class="btn btn-sm btn-outline" id="btn-discard-session">Discard</button>
              </div>
            `;
            document.body.appendChild(banner);

            const restoreBtn = banner.querySelector('#btn-restore-session');
            if (restoreBtn) {
              restoreBtn.onclick = async () => {
                banner.remove();
                Toast.info('Restoring session annotations...');
                if (!store.getState().pdfBytes) {
                  const sampleBytes = await pdfEngine.createSamplePdf();
                  const info = await pdfEngine.loadPdf(sampleBytes);
                  store.setDocument(sampleBytes, data.filename || 'Recovered_Document.pdf', info.numPages);
                }
                for (const [pageNumStr, annList] of Object.entries(data.annotations)) {
                  const pNum = parseInt(pageNumStr, 10);
                  if (Array.isArray(annList)) {
                    annList.forEach(ann => store.addAnnotation(pNum, ann));
                  }
                }
                Toast.success(`Successfully restored ${totalAnnots} annotations!`);
              };
            }

            const discardBtn = banner.querySelector('#btn-discard-session');
            if (discardBtn) {
              discardBtn.onclick = () => {
                banner.remove();
                localStorage.removeItem('pdf_editor_recovery_v2');
                Toast.info('Previous recovery data cleared.');
              };
            }

            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Autosave recovery error:', e);
    }
    return false;
  }

  bindNavbarEvents() {
    // Back to Landing / Home
    const homeBtn = document.getElementById('btn-studio-home');
    if (homeBtn) {
      homeBtn.onclick = () => {
        router.navigate('/');
      };
    }
    const editorLogo = document.getElementById('editor-brand-logo');
    if (editorLogo) {
      editorLogo.onclick = () => {
        router.navigate('/');
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
        this.authModal.updateAllUserWidgets(state.user);
      }
    });

    // Initial user status sync
    this.authModal.updateAllUserWidgets(store.getState().user);

    // Auth Modal & User Account Menu trigger
    const authBtn = document.getElementById('btn-open-auth');
    if (authBtn) {
      authBtn.onclick = (e) => {
        e.stopPropagation();
        this.authModal.toggleAccountMenu(authBtn);
      };
    }

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

    // Initialize theme
    applyTheme(getPreferredTheme());

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

    const extractImagesBtn = document.getElementById('btn-open-extract-images');
    if (extractImagesBtn) extractImagesBtn.onclick = () => extractImagesModal.open();

    const resizeBtn = document.getElementById('btn-open-resize');
    if (resizeBtn) resizeBtn.onclick = () => resizeModal.show();

    const flipBtn = document.getElementById('btn-open-flip');
    if (flipBtn) flipBtn.onclick = () => flipModal.show();

    const compressBtn = document.getElementById('btn-open-compress');
    if (compressBtn) compressBtn.onclick = () => compressModal.show();

    const grayscaleBtn = document.getElementById('btn-open-grayscale');
    if (grayscaleBtn) grayscaleBtn.onclick = () => grayscaleModal.show();

    const ocrBtn = document.getElementById('btn-open-ocr');
    if (ocrBtn) ocrBtn.onclick = () => ocrModal.show();

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

        // Update Right Tool Options Sidebar and open if closed
        toolOptionsPanel.render();
        toolOptionsPanel.toggle(true);

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
      // Save / Export
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const saveBtn = document.getElementById('btn-save-pdf');
        if (saveBtn) saveBtn.click();
      }
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
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        store.setScale(store.getState().scale + 0.15);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        store.setScale(store.getState().scale - 0.15);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        store.setScale(1.0);
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
