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
import { recipientSignPage } from './components/recipient-sign-page.js';
import { router } from './core/router.js';
import { applyTheme, toggleTheme, getPreferredTheme } from './utils/theme.js';
import { Toast } from './components/toast.js';
import { downloadBlob, readFileAsArrayBuffer } from './utils/helpers.js';
import { pwaManager } from './core/pwa-manager.js';
import { legalModal } from './components/legal-modal.js';
import { legalPage } from './components/legal-page.js';
import { docsPage } from './components/docs-page.js';
import { populateFontSelect, loadAllEditorFonts } from './core/font-registry.js';
import { studioExportModal } from './components/studio-export-modal.js';

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

    // On mobile / small screens, start with clean full canvas view
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      document.body.classList.remove('sidebar-open', 'tool-sidebar-open');
    }

    if (viewport) {
      viewport.addEventListener('click', (e) => {
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
          if (!e.target.closest('#app-sidebar') && !e.target.closest('#tool-options-sidebar')) {
            document.body.classList.remove('sidebar-open', 'tool-sidebar-open');
          }
        }
      });
    }

    // Check for autosave / recovery
    const recovered = this.tryRestoreAutosave();
    if (!recovered) {
      this.canvasManager.renderEmptyState();
      const filenameEl = document.getElementById('current-filename');
      if (filenameEl) filenameEl.textContent = 'No document selected';
    }

    // Wire HTML5 URL Router for distinct iLovePDF routes (/merge_pdf, /compress_pdf, /split_pdf, etc.)
    router.subscribe((route) => {
      const mobileContainer = document.getElementById('mobile-pair-container');
      const recContainer = document.getElementById('recipient-sign-container');
      const accountContainer = document.getElementById('account-page-container');
      const toolWfContainer = document.getElementById('tool-workflow-container');

      const setView = (viewClass) => {
        const allClasses = [
          'show-landing',
          'show-studio',
          'show-tool-workflow',
          'show-account',
          'show-docs',
          'show-legal',
          'show-mobile-pair',
          'show-recipient-sign'
        ];
        document.body.classList.remove(...allClasses);
        if (viewClass) {
          document.body.classList.add(viewClass);
        }
        legalPage.hide();
        docsPage.hide();
        if (mobileContainer) mobileContainer.style.display = 'none';
        if (recContainer) recContainer.style.display = 'none';
        if (accountContainer) accountContainer.style.display = 'none';
        if (toolWfContainer) toolWfContainer.style.display = 'none';
      };

      if (route.isLanding) {
        setView('show-landing');
        landingPage.switchToLanding({ updateUrl: false });
      } else if (route.isEditor) {
        setView('show-studio');
        landingPage.switchToStudio({ updateUrl: false });
      } else if (route.isAccount) {
        setView('show-account');
        accountPage.show({ updateUrl: false });
      } else if (route.isLogin) {
        setView('show-account');
        accountPage.showLogin({ updateUrl: false });
      } else if (route.isRegister) {
        setView('show-account');
        accountPage.showRegister({ updateUrl: false });
      } else if (route.isLegal) {
        setView('show-legal');
        legalPage.show({ tab: route.legalTab || 'privacy', updateUrl: false });
      } else if (route.isDocs) {
        setView('show-docs');
        docsPage.show({ updateUrl: false });
      } else if (route.toolId === 'mobile-pair') {
        setView('show-mobile-pair');
        let mc = document.getElementById('mobile-pair-container');
        if (!mc) {
          mc = document.createElement('div');
          mc.id = 'mobile-pair-container';
          document.body.appendChild(mc);
        }
        mc.style.display = 'flex';
        mobilePairPage.mount(mc);
      } else if (route.isRecipientSigning || route.toolId === 'sign-document') {
        setView('show-recipient-sign');
        let rc = document.getElementById('recipient-sign-container');
        if (!rc) {
          rc = document.createElement('div');
          rc.id = 'recipient-sign-container';
          document.body.appendChild(rc);
        }
        rc.style.display = 'flex';
        recipientSignPage.mount(rc);
      } else if (route.toolId) {
        setView('show-tool-workflow');
        toolWorkflow.openTool(route.toolId, { updateUrl: false });
      }
    });

    router.init();

    // Register PWA Service Worker for offline execution
    pwaManager.registerServiceWorker();
  }

  setupAutosave() {
    store.subscribe((event, state) => {
      if (['annotation-added', 'annotation-updated', 'annotation-removed', 'watermark-updated', 'pagenumbers-updated'].includes(event)) {
        try {
          const rawAnnots = state.annotations;
          const serializedAnnots = rawAnnots instanceof Map
            ? Object.fromEntries(rawAnnots.entries())
            : (rawAnnots && typeof rawAnnots === 'object' ? rawAnnots : {});
          const serializable = {
            filename: state.filename || state.documentName || 'Document.pdf',
            pageCount: state.pageCount,
            annotations: serializedAnnots,
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

    // Open PDF file (Try Native File System Access API first, fallback to input file)
    const fileInput = document.getElementById('upload-pdf-input');
    document.getElementById('btn-open-pdf').onclick = async () => {
      const fsResult = await pwaManager.openLocalPdfWithFsApi();
      if (fsResult && fsResult.file) {
        try {
          Toast.info('Loading PDF document...');
          const arrayBuffer = await readFileAsArrayBuffer(fsResult.file);
          const info = await pdfEngine.loadPdf(arrayBuffer);
          store.setDocument(arrayBuffer, fsResult.file.name, info.numPages);
          document.getElementById('current-filename').textContent = fsResult.file.name;
          Toast.success(`Loaded ${fsResult.file.name} (${info.numPages} pages)`);
          return;
        } catch (err) {
          console.error(err);
        }
      }
      fileInput.click();
    };

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

    // Page Navigation (Adobe Acrobat Style)
    const curPageNum = document.getElementById('current-page-num');
    const totalPageNum = document.getElementById('total-page-num');
    const pagePrevBtn = document.getElementById('btn-page-prev');
    if (pagePrevBtn) {
      pagePrevBtn.onclick = () => {
        const cur = store.getState().currentPage || 1;
        if (cur > 1) store.setCurrentPage(cur - 1);
      };
    }
    const pageNextBtn = document.getElementById('btn-page-next');
    if (pageNextBtn) {
      pageNextBtn.onclick = () => {
        const cur = store.getState().currentPage || 1;
        const total = store.getState().pageCount || 1;
        if (cur < total) store.setCurrentPage(cur + 1);
      };
    }

    // Fit to Width & Fit Entire Page
    const fitWidthBtn = document.getElementById('btn-fit-width');
    if (fitWidthBtn) {
      fitWidthBtn.onclick = () => {
        const viewport = document.getElementById('viewport');
        if (viewport) {
          const availableW = viewport.clientWidth - 80;
          store.setScale(Math.max(0.4, Math.min(2.5, availableW / 612)));
        }
      };
    }
    const fitPageBtn = document.getElementById('btn-fit-page');
    if (fitPageBtn) {
      fitPageBtn.onclick = () => {
        const viewport = document.getElementById('viewport');
        if (viewport) {
          const availableH = viewport.clientHeight - 80;
          store.setScale(Math.max(0.4, Math.min(2.0, availableH / 792)));
        }
      };
    }

    store.subscribe((event, state) => {
      if (event === 'scale-changed') {
        if (zoomText) zoomText.textContent = `${Math.round(state.scale * 100)}%`;
      } else if (event === 'page-changed' || event === 'document-loaded' || event === 'document-set') {
        if (curPageNum) curPageNum.textContent = state.currentPage || 1;
        if (totalPageNum) totalPageNum.textContent = state.pageCount || 1;
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

    // Apply Changes -> Process -> Export Workflow (Sejda & Smallpdf architecture)
    const triggerApplyWorkflow = () => {
      studioExportModal.startWorkflow(store.getState());
    };

    const saveBtn = document.getElementById('btn-save-pdf');
    if (saveBtn) saveBtn.onclick = triggerApplyWorkflow;

    const floatingApplyBtn = document.getElementById('btn-floating-apply');
    if (floatingApplyBtn) floatingApplyBtn.onclick = triggerApplyWorkflow;

    // Initialize & Wire theme toggle
    applyTheme(getPreferredTheme());
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.onclick = () => {
        toggleTheme();
      };
    }

    // All Tools Hub modal
    const allToolsBtn = document.getElementById('btn-open-all-tools');
    if (allToolsBtn) allToolsBtn.onclick = () => allToolsModal.show();

    // Docs & Guide navigation from Studio
    const openDocsBtn = document.getElementById('btn-open-docs');
    if (openDocsBtn) openDocsBtn.onclick = () => router.navigate('/docs');

    // Inline rename document title
    const filenameEl = document.getElementById('current-filename');
    const filenamePill = document.getElementById('current-filename-pill');
    const triggerRename = () => {
      const current = store.getState().filename || 'Sample_Document.pdf';
      const newName = prompt('Rename document:', current);
      if (newName && newName.trim() !== '') {
        const finalName = newName.trim().endsWith('.pdf') ? newName.trim() : `${newName.trim()}.pdf`;
        store.getState().filename = finalName;
        store.getState().documentName = finalName;
        if (filenameEl) filenameEl.textContent = finalName;
        Toast.success(`Renamed document to ${finalName}`);
      }
    };
    if (filenamePill) filenamePill.onclick = triggerRename;
    else if (filenameEl) filenameEl.onclick = triggerRename;
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

    const sanitizeBtn = document.getElementById('btn-open-sanitize');
    if (sanitizeBtn) sanitizeBtn.onclick = () => toolWorkflow.openTool('sanitize');

    const flattenBtn = document.getElementById('btn-open-flatten');
    if (flattenBtn) flattenBtn.onclick = () => toolWorkflow.openTool('flatten');

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

    // Initialize 150+ font catalog and preload Google Fonts
    const fontFamilySel = document.getElementById('prop-font-family');
    if (fontFamilySel) populateFontSelect(fontFamilySel, 'Helvetica');
    loadAllEditorFonts();

    const formatWrap = document.getElementById('prop-format-wrap');
    const highlightWrap = document.getElementById('prop-highlight-wrap');
    const btnBold = document.getElementById('prop-btn-bold');
    const btnItalic = document.getElementById('prop-btn-italic');
    const btnUnderline = document.getElementById('prop-btn-underline');
    const btnStrike = document.getElementById('prop-btn-strike');
    const btnAlignLeft = document.getElementById('prop-btn-align-left');
    const btnAlignCenter = document.getElementById('prop-btn-align-center');
    const btnAlignRight = document.getElementById('prop-btn-align-right');
    const highlightInp = document.getElementById('prop-highlight-color');

    // Adjust properties bar based on tool
    const syncToolbarProperties = (tool) => {
      colorWrap.style.display = ['text', 'draw', 'highlight', 'shape', 'note'].includes(tool) ? 'flex' : 'none';
      fontSizeWrap.style.display = tool === 'text' ? 'flex' : 'none';
      fontFamilyWrap.style.display = tool === 'text' ? 'flex' : 'none';
      if (formatWrap) formatWrap.style.display = tool === 'text' ? 'flex' : 'none';
      if (highlightWrap) highlightWrap.style.display = tool === 'text' ? 'flex' : 'none';
      strokeWidthWrap.style.display = ['draw', 'highlight', 'shape'].includes(tool) ? 'flex' : 'none';
      shapeTypeWrap.style.display = tool === 'shape' ? 'flex' : 'none';
      formTypeWrap.style.display = tool === 'form' ? 'flex' : 'none';
      replaceWrap.style.display = tool === 'replace' ? 'flex' : 'none';
    };

    toolBtns.forEach(btn => {
      btn.onclick = () => {
        let tool = btn.dataset.tool;
        if (!tool) return;
        if (tool === 'redact') tool = 'whiteout';
        if (tool === 'signature') tool = 'sign';
        if (tool === 'stamp') tool = 'image';

        if (tool === 'sign') {
          this.signatureTool.open();
          return;
        }

        if (tool === 'image') {
          this.imageTool.open();
        }

        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setTool(tool);

        // Update Right Tool Options Sidebar and open if closed
        toolOptionsPanel.render();
        toolOptionsPanel.toggle(true);

        syncToolbarProperties(tool);
      };
    });

    // Format buttons (Bold, Italic, Underline, Strike, Align, Highlight)
    if (btnBold) {
      btnBold.onclick = () => {
        const next = !store.getState().activeBold;
        store.getState().activeBold = next;
        btnBold.classList.toggle('active', next);
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { bold: next });
        }
      };
    }

    if (btnItalic) {
      btnItalic.onclick = () => {
        const next = !store.getState().activeItalic;
        store.getState().activeItalic = next;
        btnItalic.classList.toggle('active', next);
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { italic: next });
        }
      };
    }

    if (btnUnderline) {
      btnUnderline.onclick = () => {
        const next = !store.getState().activeUnderline;
        store.getState().activeUnderline = next;
        btnUnderline.classList.toggle('active', next);
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { underline: next });
        }
      };
    }

    if (btnStrike) {
      btnStrike.onclick = () => {
        const next = !store.getState().activeStrikethrough;
        store.getState().activeStrikethrough = next;
        btnStrike.classList.toggle('active', next);
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { strikethrough: next });
        }
      };
    }

    const setAlignment = (align) => {
      store.getState().activeTextAlign = align;
      if (btnAlignLeft) btnAlignLeft.classList.toggle('active', align === 'left');
      if (btnAlignCenter) btnAlignCenter.classList.toggle('active', align === 'center');
      if (btnAlignRight) btnAlignRight.classList.toggle('active', align === 'right');
      if (this.canvasManager && this.canvasManager.selectedAnnotation) {
        const { pageNum, ann } = this.canvasManager.selectedAnnotation;
        if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { align });
      }
    };

    if (btnAlignLeft) btnAlignLeft.onclick = () => setAlignment('left');
    if (btnAlignCenter) btnAlignCenter.onclick = () => setAlignment('center');
    if (btnAlignRight) btnAlignRight.onclick = () => setAlignment('right');

    if (highlightInp) {
      highlightInp.oninput = (e) => {
        const val = e.target.value;
        store.getState().activeTextBgColor = val;
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { bgColor: val });
        }
      };
    }

    // Keyboard Shortcuts (Ctrl+B / Ctrl+I / Ctrl+U)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          if (btnBold) btnBold.click();
        } else if (key === 'i') {
          e.preventDefault();
          if (btnItalic) btnItalic.click();
        } else if (key === 'u') {
          e.preventDefault();
          if (btnUnderline) btnUnderline.click();
        }
      }
    });

    // Inspector inputs & bidirectional sync with selected annotations
    const colorInp = document.getElementById('prop-color');
    if (colorInp) {
      colorInp.oninput = (e) => {
        const val = e.target.value;
        store.getState().activeColor = val;
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { color: val });
          else if (ann.type === 'shape') store.updateAnnotation(pageNum, ann.id, { strokeColor: val });
        }
      };
    }

    const fontSizeSel = document.getElementById('prop-font-size');
    if (fontSizeSel) {
      fontSizeSel.onchange = (e) => {
        const val = parseInt(e.target.value, 10);
        store.getState().activeFontSize = val;
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { fontSize: val });
        }
      };
    }

    if (fontFamilySel) {
      fontFamilySel.onchange = (e) => {
        const val = e.target.value;
        store.getState().activeFontFamily = val;
        store.getState().activeFontId = val;
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'text') store.updateAnnotation(pageNum, ann.id, { fontId: val, fontFamily: val });
        }
      };
    }

    const strokeWidthSel = document.getElementById('prop-stroke-width');
    if (strokeWidthSel) {
      strokeWidthSel.onchange = (e) => {
        const val = parseInt(e.target.value, 10);
        store.getState().activeStrokeWidth = val;
        if (this.canvasManager && this.canvasManager.selectedAnnotation) {
          const { pageNum, ann } = this.canvasManager.selectedAnnotation;
          if (ann.type === 'shape') store.updateAnnotation(pageNum, ann.id, { strokeWidth: val });
        }
      };
    }

    const shapeTypeSel = document.getElementById('prop-shape-type');
    if (shapeTypeSel) {
      shapeTypeSel.onchange = (e) => {
        store.getState().subTool = e.target.value;
      };
    }

    // Bidirectional event listeners for selection in workspace
    window.addEventListener('letsedit:annotation-selected', (e) => {
      const { ann } = e.detail || {};
      if (!ann) return;
      if (ann.type === 'text') {
        colorWrap.style.display = 'flex';
        fontSizeWrap.style.display = 'flex';
        fontFamilyWrap.style.display = 'flex';
        if (fontFamilySel) fontFamilySel.value = ann.fontId || ann.fontFamily || 'Helvetica';
        if (fontSizeSel) fontSizeSel.value = String(ann.fontSize || 16);
        if (colorInp) colorInp.value = ann.color || '#000000';
      } else if (ann.type === 'shape') {
        colorWrap.style.display = 'flex';
        strokeWidthWrap.style.display = 'flex';
        if (colorInp) colorInp.value = ann.strokeColor || '#000000';
        if (strokeWidthSel) strokeWidthSel.value = String(ann.strokeWidth || 2);
      }
    });

    window.addEventListener('letsedit:annotation-deselected', () => {
      const curTool = store.getState().activeTool || 'select';
      colorWrap.style.display = ['text', 'draw', 'highlight', 'shape'].includes(curTool) ? 'flex' : 'none';
      fontSizeWrap.style.display = curTool === 'text' ? 'flex' : 'none';
      fontFamilyWrap.style.display = curTool === 'text' ? 'flex' : 'none';
      strokeWidthWrap.style.display = ['draw', 'highlight', 'shape'].includes(curTool) ? 'flex' : 'none';
    });

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
  window.letseditStudio = app;
  app.init();
});
