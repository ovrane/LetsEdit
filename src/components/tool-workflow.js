/**
 * Dedicated Tool Workflow Component (iLovePDF & Sejda Reverse-Engineered Architecture)
 * Modular Orchestrator coordinating upload, workspace, options, execution, and success sub-modules.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { router } from '../core/router.js';

// Setup PDF.js worker safely across browser and test runtimes
const workerSrc = typeof window !== 'undefined'
  ? new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  : '';
if (workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export { WORKFLOW_TOOLS_CONFIG, CHAIN_TOOLS } from "./workflow/tools-config.js";
import { WORKFLOW_TOOLS_CONFIG } from "./workflow/tools-config.js";
import {
  getBatesPositionCss,
  getSignPositionCss,
  getPnPositionCss,
  getPnPositionLabel,
  renderToolOptionsHtml
} from "./workflow/workspace-options.js";
import { openMobileQrModal, openCloudStorageModal } from "./workflow/workflow-modals.js";
import {
  renderUploadPrompt,
  bindUploadEvents,
  handleIncomingFiles,
  unpackOrganizePages,
  openCameraScannerModal
} from "./workflow/workflow-uploader.js";
import { renderToolWorkspace, getExecuteButtonLabel } from "./workflow/workspace-renderer.js";
import { bindWorkspaceEvents } from "./workflow/workspace-events.js";
import { processSingleDocument, executeAction } from "./workflow/workflow-executor.js";
import {
  renderSuccessScreen,
  bindSuccessEvents,
  chainIntoTool,
  purgeDocumentMemory,
  shareDocument
} from "./workflow/workflow-success.js";

export class ToolWorkflowManager {
  constructor() {
    this.container = null;
    this.activeTool = null;
    this.uploadedFiles = []; // Array of { name, size, type, bytes, rotation, pageCount, thumbnailUrl }
    this.processedBlob = null;
    this.processedFilename = 'document.pdf';
    this.lastOperationMetrics = null;
    this.stage = 'upload'; // 'upload' | 'workspace' | 'complete'

    // Tool specific configurations
    this.compressLevel = 'recommended';
    this.splitMode = 'ranges'; // 'ranges' | 'all' | 'size' | 'bookmarks'
    this.splitRange = '1-2';
    this.splitMaxBytes = 5242880; // 5 MB
    this.splitEveryN = 2;
    this.imageDpi = '150';
    this.imageFormat = 'image/jpeg';
    this.imgOrientation = 'portrait'; // 'portrait' | 'landscape'
    this.imgMargin = '0'; // '0' | '20' | '40'
    this.watermarkText = 'CONFIDENTIAL';
    this.watermarkOpacity = 0.3;
    this.watermarkRotation = 45;
    this.watermarkColor = '#94a3b8';
    this.protectPassword = '';
    this.protectConfirmPassword = '';
    this.allowPrinting = true;
    this.allowCopying = true;
    this.rotateDegrees = 90;
    this.cropTop = 0;
    this.cropRight = 0;
    this.cropBottom = 0;
    this.cropLeft = 0;
    this.cropApplyAll = true;
    this.ocrLang = 'eng';
    this.draggedIndex = null;
    this.deskewAngle = 0;
    this.organizePages = [];
    this.draggedPageIndex = null;
    this.batesPrefix = 'CASE-';
    this.batesSuffix = '';
    this.batesStart = 1;
    this.batesDigits = 6;
    this.batesPos = 'bottom-right';
    this.batesColor = '#1e293b';
    this.nupCount = 2;
    this.splitHalfDirection = 'vertical';
    this.alternateReverseB = true;
    this.flipDirection = 'horizontal';
    this.grayscalePreviewActive = true;
    this.extractedTextPreview = '';
    this.unlockPassword = '';
    this.renameCustomName = '';

    // Sign options
    this.signMode = 'draw'; // 'draw' | 'type' | 'upload'
    this.signName = 'Authorized Signature';
    this.signFont = 'Caveat';
    this.signDataUrl = null;
    this.signDate = new Date().toISOString().split('T')[0];
    this.includeSignDate = true;
    this.signPos = 'bottom-right';

    // Page Numbers options
    this.pnFormat = 'Page {n} of {total}';
    this.pnPos = 'bottom-center';
    this.pnStartPage = 1;
    this.pnFontSize = 10;

    // Excel & PPT options
    this.excelTitle = '';
    this.excelOrientation = 'auto';
    this.pptTitle = '';

    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  getBatesPositionCss() {
    return getBatesPositionCss(this);
  }

  getSignPositionCss() {
    return getSignPositionCss(this);
  }

  getPnPositionCss() {
    return getPnPositionCss(this);
  }

  getPnPositionLabel() {
    return getPnPositionLabel(this);
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'tool-workflow-view';
    this.container.className = 'tool-workflow-container';
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
  }

  openTool(toolKey, { updateUrl = true } = {}) {
    const config = WORKFLOW_TOOLS_CONFIG[toolKey] || WORKFLOW_TOOLS_CONFIG.merge;
    this.activeTool = config;
    this.uploadedFiles = [];
    this.processedBlob = null;
    this.stage = 'upload';
    this.deskewAngle = 0;
    this.organizePages = [];
    this.draggedPageIndex = null;
    this.cropTop = 0;
    this.cropRight = 0;
    this.cropBottom = 0;
    this.cropLeft = 0;
    this.cropApplyAll = true;
    this.batesPrefix = 'CASE-';
    this.batesSuffix = '';
    this.batesStart = 1;
    this.batesDigits = 6;
    this.batesPos = 'bottom-right';
    this.batesColor = '#1e293b';
    this.nupCount = 2;
    this.splitHalfDirection = 'vertical';
    this.alternateReverseB = true;

    document.body.classList.remove('show-landing', 'show-studio');
    document.body.classList.add('show-tool-workflow');
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (updateUrl && typeof window !== 'undefined') {
      const canonical = router.getCanonicalPath(config.id);
      if (window.location.pathname !== canonical) {
        window.history.pushState({ path: canonical }, '', canonical);
      }
      if (config.title && typeof document !== 'undefined') {
        document.title = `${config.title} — LetsEdit`;
      }
    }

    this.render();
  }

  closeWorkflow() {
    router.navigate('/');
  }

  switchToStudioWithBuffer(arrayBuffer, filename) {
    router.navigate('/edit_pdf');

    pdfEngine.loadPdf(arrayBuffer).then(info => {
      store.setDocument(arrayBuffer, filename, info.numPages);
      const fnEl = document.getElementById('current-filename');
      if (fnEl) fnEl.textContent = filename;
      Toast.success(`Opened ${filename} in PDF Studio`);
    }).catch(err => {
      console.error(err);
      Toast.error('Failed to open document in editor');
    });
  }

  render() {
    if (!this.container || !this.activeTool) return;

    if (this.stage === 'upload') {
      this.renderUploadPrompt();
    } else if (this.stage === 'workspace') {
      this.renderToolWorkspace();
    } else if (this.stage === 'complete') {
      this.renderSuccessScreen();
    }
  }

  renderUploadPrompt() {
    return renderUploadPrompt(this);
  }

  bindUploadEvents() {
    return bindUploadEvents(this);
  }

  async handleIncomingFiles(files) {
    return await handleIncomingFiles(this, files);
  }

  async unpackOrganizePages() {
    return await unpackOrganizePages(this);
  }

  async openCameraScannerModal() {
    return await openCameraScannerModal(this);
  }

  renderToolWorkspace() {
    return renderToolWorkspace(this);
  }

  getExecuteButtonLabel() {
    return getExecuteButtonLabel(this);
  }

  renderToolOptionsHtml() {
    return renderToolOptionsHtml(this);
  }

  bindWorkspaceEvents() {
    return bindWorkspaceEvents(this);
  }

  async processSingleDocument(tool, file) {
    return await processSingleDocument(this, tool, file);
  }

  async executeAction() {
    return await executeAction(this);
  }

  renderSuccessScreen() {
    return renderSuccessScreen(this);
  }

  bindSuccessEvents() {
    return bindSuccessEvents(this);
  }

  async chainIntoTool(toolKey) {
    return await chainIntoTool(this, toolKey);
  }

  purgeDocumentMemory() {
    return purgeDocumentMemory(this);
  }

  async shareDocument() {
    return await shareDocument(this);
  }

  openMobileQrModal() {
    return openMobileQrModal(this);
  }

  openCloudStorageModal(provider = "gdrive") {
    return openCloudStorageModal(this, provider);
  }
}

export const toolWorkflow = new ToolWorkflowManager();
