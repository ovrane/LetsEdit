/**
 * Workflow Uploader Sub-Module (Stage 1)
 * Handles upload prompt rendering, drag-and-drop dropzone, file input events,
 * sample document loading, camera capture, thumbnail generation, and page unpacking.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { pdfEngine } from '../../core/pdf-engine.js';
import { store } from '../../core/state-store.js';
import { Toast } from '../toast.js';
import { authModal } from '../auth-modal.js';
import { mobilePairModal } from '../mobile-pair-modal.js';
import { cloudPickerModal } from '../cloud-picker-modal.js';
import { PageOperations } from '../../core/engine/page-ops.js';
import { readFileAsArrayBuffer } from '../../utils/helpers.js';
import { getToolSeoContentHtml } from './workflow-seo-content.js';

export function renderUploadPrompt(manager) {
  const t = manager.activeTool;
  manager.container.innerHTML = `
    <header class="workflow-header">
      <div class="workflow-header-inner">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="workflow-back-btn" id="btn-workflow-back" title="Back to All Tools">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
            <span>All Tools</span>
          </button>
          <div class="lets-logo" id="workflow-brand-logo" style="cursor: pointer;">
            <div class="lets-logo-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
                <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
                <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
                <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
              </svg>
            </div>
            <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="user-account-wrapper">
            <button class="btn btn-outline btn-sm user-account-btn" id="btn-workflow-auth">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span>${store.getState().user ? store.getState().user.name : 'Log in'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="workflow-main">
      <div class="workflow-hero-card">
        <div class="workflow-tool-badge" style="background: ${t.color}18; color: ${t.color};">
          ${t.icon}
        </div>
        <h1 class="workflow-title">${t.title}</h1>
        <p class="workflow-subtitle">${t.subtitle}</p>

        <div class="workflow-dropzone" id="workflow-dropzone" style="--zone-color: ${t.color};">
          <input type="file" id="workflow-file-input" accept="${t.accept}" ${t.multiple ? 'multiple' : ''} style="display: none;" />
          <div class="dropzone-icon-ring" style="background: ${t.color}15; color: ${t.color};">
            <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
            </svg>
          </div>
          <button class="workflow-primary-cta" id="btn-workflow-choose" style="background: ${t.color};">
            <span>${t.buttonText}</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
          </button>
          <span class="workflow-droptxt">${t.dropText}</span>
          <span class="workflow-format-chip">${t.badge}</span>
        </div>

        <div class="workflow-cloud-quick-actions" style="margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">Or import from:</span>
          <button type="button" class="btn btn-outline btn-sm" id="btn-uploader-gdrive" title="Import from Google Drive" style="display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 12px; background: var(--bg-card);">
            <svg width="15" height="15" viewBox="0 0 87.3 78" fill="none"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.55h27.5L43.65 25z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.2 7.85 13.6z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832d"/><path d="M59.8 48.55H27.5L13.75 72.35c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25L59.8 48.55z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 23.55h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-17.55z" fill="#ffba00"/></svg>
            <span>Google Drive</span>
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-uploader-dropbox" title="Import from Dropbox" style="display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 12px; background: var(--bg-card);">
            <svg width="15" height="15" fill="#0061ff" viewBox="0 0 24 24"><path d="M7.05 3.5L1.5 7.14l4.5 3.59 5.55-3.64-4.5-3.59zm9.9 0l-4.5 3.59 5.55 3.64 4.5-3.59-5.55-3.64zM1.5 14.33l5.55 3.64 4.5-3.59-5.55-3.64-4.5 3.59zm21 0l-4.5-3.59-5.55 3.64 4.5 3.59 5.55-3.64zM7.05 19.06l4.5 3.59 4.5-3.59-4.5-3.59-4.5 3.59z"/></svg>
            <span>Dropbox</span>
          </button>
        </div>

        ${['scan', 'images-to-pdf'].includes(t.id) ? `
          <div style="margin-top: 16px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline" id="btn-workflow-camera" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 10px 18px; border-radius: 8px;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <span>Snap with Webcam</span>
            </button>
            <button type="button" class="btn btn-outline" id="btn-workflow-mobile-pair" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 10px 18px; border-radius: 8px; border-color: var(--primary); color: var(--primary);">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              <span>Scan with Phone (QR)</span>
            </button>
          </div>
        ` : ''}

        <div style="margin-top: 24px;">
          <button class="workflow-sample-link" id="btn-workflow-sample">
            Or test with Sample Document
          </button>
        </div>
      </div>

      ${getToolSeoContentHtml(t)}
    </main>
  `;

  bindUploadEvents(manager);
}

export function bindUploadEvents(manager) {
  const backBtn = manager.container.querySelector('#btn-workflow-back');
  const brandLogo = manager.container.querySelector('#workflow-brand-logo');
  const chooseBtn = manager.container.querySelector('#btn-workflow-choose');
  const fileInput = manager.container.querySelector('#workflow-file-input');
  const dropzone = manager.container.querySelector('#workflow-dropzone');
  const sampleBtn = manager.container.querySelector('#btn-workflow-sample');

  if (backBtn) backBtn.onclick = () => manager.closeWorkflow();
  if (brandLogo) brandLogo.onclick = () => manager.closeWorkflow();
  if (chooseBtn && fileInput) chooseBtn.onclick = () => fileInput.click();

  const authBtn = manager.container.querySelector('#btn-workflow-auth');
  if (authBtn) {
    authBtn.onclick = (e) => {
      e.stopPropagation();
      authModal.toggleAccountMenu(authBtn);
    };
  }

  if (fileInput) {
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        await handleIncomingFiles(manager, files);
      }
      fileInput.value = '';
    };
  }

  if (dropzone) {
    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-active');
    };
    dropzone.ondragleave = () => {
      dropzone.classList.remove('drag-active');
    };
    dropzone.ondrop = async (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-active');
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await handleIncomingFiles(manager, files);
      }
    };
  }

  if (sampleBtn) {
    sampleBtn.onclick = async () => {
      Toast.info('Loading sample document...');
      let sampleBytes;
      let sampleName = 'Sample_Agreement.pdf';
      if (manager.activeTool.id === 'fill-forms') {
        sampleBytes = await PageOperations.createSampleFillableFormPdf();
        sampleName = 'Sample_Fillable_Form.pdf';
      } else if (manager.activeTool.id === 'repair') {
        sampleBytes = await PageOperations.createCorruptTestPdf();
        sampleName = 'Corrupted_Sample_Document.pdf';
      } else if (manager.activeTool.id === 'edit-metadata') {
        sampleBytes = await PageOperations.createSampleMetadataPdf();
        sampleName = 'Sample_Metadata_Document.pdf';
      } else if (manager.activeTool.id === 'pagelabels') {
        sampleBytes = await PageOperations.createSamplePageLabelsPdf();
        sampleName = 'Sample_PageLabels_Document.pdf';
      } else if (['sanitize', 'sanitize-pdf'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleExposedPdf();
        sampleName = 'Sample_Exposed_Document.pdf';
      } else if (['bookmarks', 'outlines', 'pdf-bookmarks'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleOutlinesPdf();
        sampleName = 'Sample_Bookmarked_Document.pdf';
      } else if (['header-footer', 'header_footer', 'add-header-footer'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleHeaderFooterPdf();
        sampleName = 'Sample_Header_Footer_Document.pdf';
      } else if (['nup', 'n-up', 'nup-pdf'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleNupPdf();
        sampleName = 'Sample_Imposition_Document.pdf';
      } else if (['resize', 'resize-pdf', 'resize-margins', 'page-margins'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleResizePdf();
        sampleName = 'Sample_Resize_Document.pdf';
      } else if (['watermark', 'watermark-pdf', 'add-watermark'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleWatermarkPdf();
        sampleName = 'Sample_Watermark_Document.pdf';
      } else if (['bates', 'bates-numbering', 'bates-numbering-pdf', 'bates-pdf'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleBatesPdf();
        sampleName = 'Sample_Legal_Brief_Discovery.pdf';
      } else if (['pagenumbers', 'page-numbers', 'pagenumbers-pdf', 'add-page-numbers'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSamplePageNumbersPdf();
        sampleName = 'Sample_Research_Whitepaper.pdf';
      } else if (['flatten', 'flatten-pdf', 'flatten-forms'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleFlattenPdf();
        sampleName = 'Sample_Corporate_NDA_Form.pdf';
      } else if (['redact', 'redact-pdf'].includes(manager.activeTool.id)) {
        sampleBytes = await PageOperations.createSampleRedactPdf();
        sampleName = 'Sample_PII_Discovery_Record.pdf';
      } else {
        sampleBytes = await pdfEngine.createSamplePdf();
      }
      await handleIncomingFiles(manager, [{
        name: sampleName,
        size: sampleBytes.byteLength,
        type: 'application/pdf',
        mockBytes: sampleBytes
      }]);
    };
  }

  const camBtn = manager.container.querySelector('#btn-workflow-camera');
  if (camBtn) {
    camBtn.onclick = () => openCameraScannerModal(manager);
  }

  const mobilePairBtn = manager.container.querySelector('#btn-workflow-mobile-pair');
  if (mobilePairBtn) {
    mobilePairBtn.onclick = () => {
      mobilePairModal.open({
        action: 'camera',
        title: 'Scan Pages with Smartphone Camera',
        subtitle: 'Scan QR code to take high-resolution document photos with your phone',
        onComplete: async (payload) => {
          if (payload && payload.dataUrl) {
            const base64 = payload.dataUrl.split(',')[1];
            const binStr = atob(base64);
            const bytes = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);

            manager.uploadedFiles.push({
              name: payload.filename || `Phone_Scan_${manager.uploadedFiles.length + 1}.jpg`,
              size: bytes.byteLength,
              type: payload.mimeType || 'image/jpeg',
              bytes,
              rotation: 0
            });
            manager.stage = 'workspace';
            manager.render();
          }
        }
      });
    };
  }

  const gdriveBtn = manager.container.querySelector('#btn-uploader-gdrive');
  if (gdriveBtn) {
    gdriveBtn.onclick = () => {
      cloudPickerModal.open('gdrive', {
        onFilesSelected: async (selectedFiles) => {
          await handleIncomingFiles(manager, selectedFiles);
        }
      });
    };
  }

  const dropboxBtn = manager.container.querySelector('#btn-uploader-dropbox');
  if (dropboxBtn) {
    dropboxBtn.onclick = () => {
      cloudPickerModal.open('dropbox', {
        onFilesSelected: async (selectedFiles) => {
          await handleIncomingFiles(manager, selectedFiles);
        }
      });
    };
  }
}

export async function handleIncomingFiles(manager, files) {
  Toast.info(`Loading ${files.length} file(s)...`);
  const processed = [];

  for (const f of files) {
    try {
      const bytes = f.mockBytes || (await readFileAsArrayBuffer(f));
      const item = {
        name: f.name,
        size: f.size || bytes.byteLength,
        type: f.type || 'application/pdf',
        bytes: bytes,
        rotation: 0,
        pageCount: 1,
        thumbnailUrl: null
      };

      const isPdf = item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');
      if (isPdf && typeof document !== 'undefined') {
        try {
          const loadingTask = pdfjsLib.getDocument({
            data: bytes.slice(0),
            cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
            cMapPacked: true
          });
          const pdfDoc = await loadingTask.promise;
          item.pageCount = pdfDoc.numPages;

          const page = await pdfDoc.getPage(1);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          item.thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
          pdfDoc.destroy();
        } catch (pdfErr) {
          console.warn('PDF thumbnail generation skipped:', item.name, pdfErr);
        }
      } else if (item.type.startsWith('image/')) {
        item.thumbnailUrl = URL.createObjectURL(new Blob([bytes], { type: item.type }));
      }

      processed.push(item);
    } catch (err) {
      console.error('Error reading file:', f.name, err);
    }
  }

  if (processed.length === 0) {
    Toast.error('No supported files could be loaded');
    return;
  }

  manager.uploadedFiles = [...manager.uploadedFiles, ...processed];
  if (manager.activeTool.id === 'organize' && manager.uploadedFiles.length > 0) {
    await unpackOrganizePages(manager);
  }
  if (manager.activeTool.id === 'pdf-to-text' && manager.uploadedFiles.length > 0) {
    try {
      manager.extractedTextPreview = await pdfEngine.extractDocumentText(manager.uploadedFiles[0].bytes);
    } catch (e) {
      console.warn('Text preview extraction failed:', e);
    }
  }
  if (manager.activeTool.id === 'rename' && manager.uploadedFiles.length > 0) {
    try {
      const text = await pdfEngine.extractDocumentText(manager.uploadedFiles[0].bytes);
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.startsWith('---'));
      if (lines.length > 0) {
        const heading = lines[0].replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 40).trim().replace(/\s+/g, '_');
        if (heading) manager.renameCustomName = `${heading}.pdf`;
      }
    } catch (e) {
      console.warn('Auto heading detection failed:', e);
    }
  }
  if (manager.activeTool.id === 'fill-forms' && manager.uploadedFiles.length > 0) {
    try {
      const inspection = await PageOperations.inspectFormFields(manager.uploadedFiles[0].bytes);
      manager.detectedFormFields = inspection.fields || [];
      manager.formFieldValues = {};
      (inspection.fields || []).forEach(f => {
        manager.formFieldValues[f.name] = f.type === 'checkbox' ? f.isChecked : f.value;
      });
    } catch (e) {
      console.warn('Auto form inspection failed:', e);
      manager.detectedFormFields = [];
      manager.formFieldValues = {};
    }
  }
  if (manager.activeTool.id === 'edit-metadata' && manager.uploadedFiles.length > 0) {
    try {
      const inspection = await PageOperations.inspectMetadata(manager.uploadedFiles[0].bytes);
      manager.documentMetadata = inspection;
    } catch (e) {
      console.warn('Auto metadata inspection failed:', e);
      manager.documentMetadata = null;
    }
  }
  if (manager.activeTool.id === 'pagelabels' && manager.uploadedFiles.length > 0) {
    try {
      const inspection = await PageOperations.inspectPageLabels(manager.uploadedFiles[0].bytes);
      manager.pageLabelsInspection = inspection;
      manager.pageLabelSections = inspection.sections || [];
    } catch (e) {
      console.warn('Auto page labels inspection failed:', e);
      manager.pageLabelsInspection = null;
    }
  }
  if (['sanitize', 'sanitize-pdf'].includes(manager.activeTool.id) && manager.uploadedFiles.length > 0) {
    try {
      const inspection = await PageOperations.inspectHiddenData(manager.uploadedFiles[0].bytes);
      manager.sanitizeInspection = inspection;
    } catch (e) {
      console.warn('Auto sanitize inspection failed:', e);
      manager.sanitizeInspection = null;
    }
  }
  if (['bookmarks', 'outlines', 'pdf-bookmarks'].includes(manager.activeTool.id) && manager.uploadedFiles.length > 0) {
    try {
      const inspection = await PageOperations.inspectOutlines(manager.uploadedFiles[0].bytes);
      manager.outlinesInspection = inspection;
      manager.outlineItems = inspection.items || [];
    } catch (e) {
      console.warn('Auto outlines inspection failed:', e);
      manager.outlinesInspection = null;
    }
  }
  manager.stage = 'workspace';
  manager.render();
}

export async function unpackOrganizePages(manager) {
  const primary = manager.uploadedFiles[0];
  if (!primary || !primary.bytes) return;
  try {
    const pdfDoc = await pdfjsLib.getDocument({
      data: primary.bytes.slice(0),
      cMapUrl: 'https://unpkg.com/pdfjs-dist@6.4.299/cmaps/',
      cMapPacked: true
    }).promise;
    const numPages = pdfDoc.numPages;
    manager.organizePages = [];
    for (let p = 1; p <= numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: 0.35 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      manager.organizePages.push({
        pageNum: p,
        originalIndex: p - 1,
        rotation: 0,
        thumbnailUrl: canvas.toDataURL('image/jpeg', 0.85)
      });
    }
    pdfDoc.destroy();
  } catch (err) {
    console.warn('Failed unpacking pages for organize:', err);
  }
}

export async function openCameraScannerModal(manager) {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    Toast.error('Camera access is not supported by your browser environment.');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'workflow-camera-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '99999';

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 680px; width: 95%;">
      <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: #30050d; display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Camera Document Scanner</h3>
            <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Position document inside viewfinder and click Snap</p>
          </div>
        </div>
        <button class="modal-close-btn" id="btn-cam-close" style="font-size: 24px; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div style="position: relative; width: 100%; max-width: 560px; height: 380px; border-radius: 12px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;">
          <video id="cam-scanner-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
          <div style="position: absolute; inset: 20px; border: 2px dashed rgba(255,255,255,0.7); border-radius: 8px; pointer-events: none; box-shadow: 0 0 0 9999px rgba(0,0,0,0.35);">
            <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 4px; font-size: 11px; color: white;">Align Document Here</div>
          </div>
        </div>
        <canvas id="cam-scanner-canvas" style="display: none;"></canvas>

        <div style="display: flex; align-items: center; gap: 12px;">
          <button type="button" class="btn btn-primary btn-md" id="btn-cam-snap" style="display: flex; align-items: center; gap: 8px; padding: 10px 22px; font-weight: 600;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4" fill="currentColor"></circle></svg>
            <span>Snap Page</span>
          </button>
          <button type="button" class="btn btn-outline btn-md" id="btn-cam-done" style="padding: 10px 18px;">
            <span>Done (${manager.uploadedFiles.length} pages)</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  let stream = null;
  const video = modal.querySelector('#cam-scanner-video');
  const canvas = modal.querySelector('#cam-scanner-canvas');
  const snapBtn = modal.querySelector('#btn-cam-snap');
  const doneBtn = modal.querySelector('#btn-cam-done');
  const closeBtn = modal.querySelector('#btn-cam-close');

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    modal.remove();
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    video.srcObject = stream;
  } catch (err) {
    console.error('Camera open error:', err);
    Toast.error('Could not access camera: ' + err.message);
    modal.remove();
    return;
  }

  closeBtn.onclick = stopStream;
  doneBtn.onclick = () => {
    stopStream();
    if (manager.stage === 'upload' && manager.uploadedFiles.length > 0) {
      manager.stage = 'workspace';
    }
    manager.render();
  };

  snapBtn.onclick = () => {
    if (!video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const pageNum = manager.uploadedFiles.length + 1;
      const file = new File([blob], `Scanned_Page_${pageNum}.jpg`, { type: 'image/jpeg' });
      await handleIncomingFiles(manager, [file]);
      Toast.success(`Captured Page #${pageNum}!`);
      const doneSpan = doneBtn.querySelector('span');
      if (doneSpan) {
        doneSpan.textContent = `Done (${manager.uploadedFiles.length} pages)`;
      }
    }, 'image/jpeg', 0.92);
  };
}
