/**
 * Workspace Tool Options Event Binding Sub-Module (Stage 2)
 * Handles contextual options listeners for specific tools:
 * Organize, Crop, Bates, N-Up, Split-in-Half, Alternate Mix, Flip,
 * Grayscale, Unlock, Rename, Sign, Page Numbers, Redaction, Scan Margins,
 * Excel to PDF, and PPT to PDF.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { Toast } from '../toast.js';
import { PageOperations } from '../../core/engine/page-ops.js';
import { pdfEngine } from '../../core/pdf-engine.js';
import { signRequestModal } from './sign-request-modal.js';
import { bindFormFillerEvents } from './workspace-form-options.js';
import { bindRepairDiagnosticEvents } from './repair-diagnostic-view.js';
import { bindSplitMergeEvents } from './workspace-split-merge-options.js';
import { bindMetadataEvents } from './workspace-metadata-options.js';
import { bindPageLabelsEvents } from './workspace-pagelabels-options.js';
import { bindSanitizeEvents } from './workspace-sanitize-options.js';

export function bindWorkspaceOptionsEvents(manager) {
  // Organize controls
  const orgRotateAllBtn = manager.container.querySelector('#btn-organize-rotate-all');
  const orgResetBtn = manager.container.querySelector('#btn-organize-reset');
  const orgTopRotateBtn = manager.container.querySelector('#btn-organize-top-rotate');
  const orgTopResetBtn = manager.container.querySelector('#btn-organize-top-reset');

  const handleRotateAll = () => {
    manager.organizePages.forEach(p => {
      p.rotation = ((p.rotation || 0) + 90) % 360;
    });
    manager.render();
    Toast.info('Rotated all pages 90° clockwise');
  };

  const handleResetOrder = () => {
    manager.organizePages.sort((a, b) => a.originalIndex - b.originalIndex);
    manager.organizePages.forEach(p => { p.rotation = 0; });
    manager.render();
    Toast.info('Reset to original page sequence');
  };

  if (orgRotateAllBtn) orgRotateAllBtn.onclick = handleRotateAll;
  if (orgTopRotateBtn) orgTopRotateBtn.onclick = handleRotateAll;
  if (orgResetBtn) orgResetBtn.onclick = handleResetOrder;
  if (orgTopResetBtn) orgTopResetBtn.onclick = handleResetOrder;

  // Organize single page rotate
  manager.container.querySelectorAll('[data-rot-page]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const pIdx = parseInt(btn.getAttribute('data-rot-page'), 10);
      if (manager.organizePages[pIdx]) {
        manager.organizePages[pIdx].rotation = ((manager.organizePages[pIdx].rotation || 0) + 90) % 360;
        manager.render();
      }
    };
  });

  // Organize single page delete
  manager.container.querySelectorAll('[data-del-page]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const pIdx = parseInt(btn.getAttribute('data-del-page'), 10);
      if (manager.organizePages[pIdx]) {
        manager.organizePages.splice(pIdx, 1);
        manager.render();
        Toast.info('Page removed');
      }
    };
  });

  // Organize drag-and-drop
  const pageCards = manager.container.querySelectorAll('.organize-page-card');
  pageCards.forEach(card => {
    card.ondragstart = (e) => {
      const pIdx = parseInt(card.getAttribute('data-page-idx'), 10);
      manager.draggedPageIndex = pIdx;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(pIdx));
    };

    card.ondragend = () => {
      manager.draggedPageIndex = null;
      pageCards.forEach(c => {
        c.classList.remove('dragging');
        c.classList.remove('drag-over');
      });
    };

    card.ondragover = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!card.classList.contains('drag-over')) {
        card.classList.add('drag-over');
      }
    };

    card.ondragleave = () => {
      card.classList.remove('drag-over');
    };

    card.ondrop = (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const targetIdx = parseInt(card.getAttribute('data-page-idx'), 10);
      const sourceIdx = manager.draggedPageIndex !== null
        ? manager.draggedPageIndex
        : parseInt(e.dataTransfer.getData('text/plain'), 10);

      if (!isNaN(sourceIdx) && !isNaN(targetIdx) && sourceIdx !== targetIdx) {
        const item = manager.organizePages.splice(sourceIdx, 1)[0];
        manager.organizePages.splice(targetIdx, 0, item);
        manager.render();
        Toast.info(`Moved page to position #${targetIdx + 1}`);
      }
    };
  });

  // Crop controls
  const cropTopInp = manager.container.querySelector('#workflow-crop-top');
  const cropBottomInp = manager.container.querySelector('#workflow-crop-bottom');
  const cropLeftInp = manager.container.querySelector('#workflow-crop-left');
  const cropRightInp = manager.container.querySelector('#workflow-crop-right');
  const cropAllCheckbox = manager.container.querySelector('#workflow-crop-all');
  const cropMarquee = manager.container.querySelector('#crop-marquee-box');
  const cropBadge = manager.container.querySelector('#crop-dimensions-badge');
  const autoCropBtn = manager.container.querySelector('#btn-auto-crop');
  const cropPresets = manager.container.querySelectorAll('.btn-crop-preset');

  const updateCropUI = (top, right, bottom, left) => {
    manager.cropTop = Math.max(0, Math.min(300, Math.round(Number(top) || 0)));
    manager.cropRight = Math.max(0, Math.min(300, Math.round(Number(right) || 0)));
    manager.cropBottom = Math.max(0, Math.min(300, Math.round(Number(bottom) || 0)));
    manager.cropLeft = Math.max(0, Math.min(300, Math.round(Number(left) || 0)));

    if (cropTopInp) cropTopInp.value = manager.cropTop;
    if (cropRightInp) cropRightInp.value = manager.cropRight;
    if (cropBottomInp) cropBottomInp.value = manager.cropBottom;
    if (cropLeftInp) cropLeftInp.value = manager.cropLeft;

    if (cropMarquee) {
      cropMarquee.style.inset = `${manager.cropTop * 0.35}px ${manager.cropRight * 0.35}px ${manager.cropBottom * 0.35}px ${manager.cropLeft * 0.35}px`;
    }
    if (cropBadge) {
      cropBadge.textContent = `Active Area: ${Math.max(20, Math.round(595.28 - manager.cropLeft - manager.cropRight))} × ${Math.max(20, Math.round(841.89 - manager.cropTop - manager.cropBottom))} pt`;
    }
  };

  if (cropTopInp) cropTopInp.oninput = (e) => updateCropUI(e.target.value, manager.cropRight, manager.cropBottom, manager.cropLeft);
  if (cropRightInp) cropRightInp.oninput = (e) => updateCropUI(manager.cropTop, e.target.value, manager.cropBottom, manager.cropLeft);
  if (cropBottomInp) cropBottomInp.oninput = (e) => updateCropUI(manager.cropTop, manager.cropRight, e.target.value, manager.cropLeft);
  if (cropLeftInp) cropLeftInp.oninput = (e) => updateCropUI(manager.cropTop, manager.cropRight, manager.cropBottom, e.target.value);

  if (cropAllCheckbox) {
    cropAllCheckbox.onchange = (e) => {
      manager.cropApplyAll = e.target.checked;
    };
  }

  cropPresets.forEach(btn => {
    btn.onclick = () => {
      const top = parseInt(btn.getAttribute('data-top'), 10) || 0;
      const right = parseInt(btn.getAttribute('data-right'), 10) || 0;
      const bottom = parseInt(btn.getAttribute('data-bottom'), 10) || 0;
      const left = parseInt(btn.getAttribute('data-left'), 10) || 0;
      updateCropUI(top, right, bottom, left);
    };
  });

  if (autoCropBtn) {
    autoCropBtn.onclick = async () => {
      try {
        autoCropBtn.disabled = true;
        autoCropBtn.textContent = 'Scanning margins...';
        const primary = manager.uploadedFiles[0];
        if (!primary || !primary.bytes) return;

        const loadingTask = pdfjsLib.getDocument({ data: primary.bytes.slice(0) });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const detected = PageOperations.detectWhitespaceCrop(canvas, 0.5);
        pdfDoc.destroy();

        updateCropUI(detected.top, detected.right, detected.bottom, detected.left);
        Toast.success(`Auto-margins detected: T:${detected.top}pt R:${detected.right}pt B:${detected.bottom}pt L:${detected.left}pt`);
      } catch (err) {
        console.warn('Auto crop error:', err);
        Toast.info('Auto detection completed (0 margins)');
      } finally {
        autoCropBtn.disabled = false;
        autoCropBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>
          Auto-Detect Margins
        `;
      }
    };
  }

  // Bates controls
  const batesPrefixInp = manager.container.querySelector('#workflow-bates-prefix');
  const batesSuffixInp = manager.container.querySelector('#workflow-bates-suffix');
  const batesStartInp = manager.container.querySelector('#workflow-bates-start');
  const batesDigitsSel = manager.container.querySelector('#workflow-bates-digits');
  const batesColorInp = manager.container.querySelector('#workflow-bates-color');
  const batesColorLabel = manager.container.querySelector('#workflow-bates-color-label');
  const batesPosBtns = manager.container.querySelectorAll('.btn-bates-pos');
  const batesBadge = manager.container.querySelector('#bates-preview-badge');
  const batesStamp = manager.container.querySelector('#bates-overlay-stamp');

  const updateBatesPreview = () => {
    const formatted = `${manager.batesPrefix}${String(manager.batesStart).padStart(manager.batesDigits, '0')}${manager.batesSuffix}`;
    if (batesBadge) batesBadge.textContent = formatted;
    if (batesStamp) {
      batesStamp.textContent = formatted;
      batesStamp.style.color = manager.batesColor;
      batesStamp.style.borderColor = manager.batesColor;
      batesStamp.style.cssText = `position: absolute; ${manager.getBatesPositionCss()}; background: rgba(255, 255, 255, 0.9); padding: 4px 8px; border-radius: 4px; border: 1px dashed ${manager.batesColor}; font-family: monospace; font-size: 11px; font-weight: 700; color: ${manager.batesColor}; pointer-events: none; transition: all 0.2s ease;`;
    }
  };

  if (batesPrefixInp) {
    batesPrefixInp.oninput = (e) => {
      manager.batesPrefix = e.target.value;
      updateBatesPreview();
    };
  }
  if (batesSuffixInp) {
    batesSuffixInp.oninput = (e) => {
      manager.batesSuffix = e.target.value;
      updateBatesPreview();
    };
  }
  if (batesStartInp) {
    batesStartInp.oninput = (e) => {
      manager.batesStart = parseInt(e.target.value, 10) || 1;
      updateBatesPreview();
    };
  }
  if (batesDigitsSel) {
    batesDigitsSel.onchange = (e) => {
      manager.batesDigits = parseInt(e.target.value, 10) || 6;
      updateBatesPreview();
    };
  }
  if (batesColorInp) {
    batesColorInp.oninput = (e) => {
      manager.batesColor = e.target.value;
      if (batesColorLabel) batesColorLabel.textContent = manager.batesColor;
      updateBatesPreview();
    };
  }
  batesPosBtns.forEach(btn => {
    btn.onclick = () => {
      manager.batesPos = btn.getAttribute('data-pos') || 'bottom-right';
      batesPosBtns.forEach(b => {
        b.className = b === btn ? 'btn btn-sm btn-primary btn-bates-pos' : 'btn btn-sm btn-outline btn-bates-pos';
      });
      updateBatesPreview();
    };
  });

  // N-Up controls
  const nupBtns = manager.container.querySelectorAll('.btn-nup-toggle');
  nupBtns.forEach(btn => {
    btn.onclick = () => {
      manager.nupCount = parseInt(btn.getAttribute('data-count'), 10) || 2;
      manager.render();
    };
  });

  // Split in Half controls
  const splitHalfBtns = manager.container.querySelectorAll('.btn-split-half-dir');
  splitHalfBtns.forEach(btn => {
    btn.onclick = () => {
      manager.splitHalfDirection = btn.getAttribute('data-dir') || 'vertical';
      manager.render();
    };
  });

  // Alternate & Mix controls
  const altReverseCheck = manager.container.querySelector('#workflow-alternate-reverse');
  if (altReverseCheck) {
    altReverseCheck.onchange = (e) => {
      manager.alternateReverseB = e.target.checked;
    };
  }

  // Flip / Mirror controls
  const flipBtns = manager.container.querySelectorAll('.btn-flip-dir');
  flipBtns.forEach(btn => {
    btn.onclick = () => {
      manager.flipDirection = btn.getAttribute('data-dir') || 'horizontal';
      manager.render();
    };
  });

  // Grayscale preview toggle
  const grayBtns = manager.container.querySelectorAll('.btn-grayscale-toggle');
  grayBtns.forEach(btn => {
    btn.onclick = () => {
      manager.grayscalePreviewActive = btn.getAttribute('data-val') === 'true';
      manager.render();
    };
  });

  // Copy extracted text buttons
  const copyTextHandler = async () => {
    const txt = manager.extractedTextPreview || (manager.container.querySelector('#extracted-text-area')?.value) || '';
    if (!txt) {
      Toast.warning('No text to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(txt);
      Toast.success('Extracted plain text copied to clipboard!');
    } catch (e) {
      Toast.info('Text selected for manual copy');
    }
  };
  const copyBtn1 = manager.container.querySelector('#btn-copy-extracted-text');
  const copyBtn2 = manager.container.querySelector('#btn-options-copy-text');
  if (copyBtn1) copyBtn1.onclick = copyTextHandler;
  if (copyBtn2) copyBtn2.onclick = copyTextHandler;

  // Unlock password input
  const unlockPassInp = manager.container.querySelector('#workflow-unlock-password');
  if (unlockPassInp) {
    unlockPassInp.oninput = (e) => {
      manager.unlockPassword = e.target.value;
    };
  }

  // Rename input & heading auto-detection
  const renameInp = manager.container.querySelector('#workflow-rename-input');
  if (renameInp) {
    renameInp.oninput = (e) => {
      manager.renameCustomName = e.target.value;
    };
  }
  const autoDetectHeadingBtn = manager.container.querySelector('#btn-auto-detect-heading');
  if (autoDetectHeadingBtn) {
    autoDetectHeadingBtn.onclick = async () => {
      const primary = manager.uploadedFiles[0];
      if (!primary || !primary.bytes) return;
      Toast.info('Scanning document title...');
      try {
        const text = await pdfEngine.extractDocumentText(primary.bytes);
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.startsWith('---'));
        if (lines.length > 0) {
          const heading = lines[0].replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 40).trim().replace(/\s+/g, '_');
          if (heading) {
            manager.renameCustomName = `${heading}.pdf`;
            if (renameInp) renameInp.value = manager.renameCustomName;
            Toast.success(`Detected title: ${heading}`);
          }
        }
      } catch (e) {
        Toast.warning('Could not auto-detect title');
      }
    };
  }

  // Sign Tool Controls
  const signModePills = manager.container.querySelectorAll('[data-sign-mode]');
  signModePills.forEach(pill => {
    pill.onclick = () => {
      manager.signMode = pill.getAttribute('data-sign-mode');
      manager.render();
    };
  });

  const sigCanvas = manager.container.querySelector('#workflow-sig-canvas');
  const clearSigBtn = manager.container.querySelector('#btn-clear-sig-canvas');
  if (sigCanvas) {
    const ctx = sigCanvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    let isDrawing = false;

    const getPos = (e) => {
      const rect = sigCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (sigCanvas.width / rect.width),
        y: (clientY - rect.top) * (sigCanvas.height / rect.height)
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const moveDraw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDraw = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      manager.signDataUrl = sigCanvas.toDataURL('image/png');
      const overlayWrap = manager.container.querySelector('#sign-preview-overlay');
      if (overlayWrap) {
        overlayWrap.innerHTML = `
          <img src="${manager.signDataUrl}" style="height: 38px; width: auto; max-width: 120px; display: block; margin: 0 auto;" />
          ${manager.includeSignDate ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px; font-family: sans-serif;">Signed: ${manager.signDate}</div>` : ''}
        `;
      }
    };

    sigCanvas.addEventListener('mousedown', startDraw);
    sigCanvas.addEventListener('mousemove', moveDraw);
    sigCanvas.addEventListener('mouseup', endDraw);
    sigCanvas.addEventListener('mouseleave', endDraw);

    sigCanvas.addEventListener('touchstart', startDraw, { passive: false });
    sigCanvas.addEventListener('touchmove', moveDraw, { passive: false });
    sigCanvas.addEventListener('touchend', endDraw, { passive: false });

    if (clearSigBtn) {
      clearSigBtn.onclick = () => {
        ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        manager.signDataUrl = null;
        manager.render();
      };
    }
  }

  const signNameInp = manager.container.querySelector('#workflow-sign-name');
  const signFontSel = manager.container.querySelector('#workflow-sign-font');
  if (signNameInp) {
    signNameInp.oninput = (e) => {
      manager.signName = e.target.value;
      const overlayText = manager.container.querySelector('#sign-preview-overlay div');
      if (overlayText) overlayText.textContent = manager.signName || 'Authorized Signature';
    };
  }
  if (signFontSel) {
    signFontSel.onchange = (e) => {
      manager.signFont = e.target.value;
      const overlayText = manager.container.querySelector('#sign-preview-overlay div');
      if (overlayText) overlayText.style.fontFamily = `'${manager.signFont}', cursive, sans-serif`;
    };
  }

  const triggerUploadBtn = manager.container.querySelector('#btn-trigger-sign-upload');
  const signUploadInp = manager.container.querySelector('#workflow-sign-upload');
  if (triggerUploadBtn && signUploadInp) {
    triggerUploadBtn.onclick = () => signUploadInp.click();
    signUploadInp.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          manager.signDataUrl = reader.result;
          manager.render();
        };
        reader.readAsDataURL(file);
      }
    };
  }

  const signPosBtns = manager.container.querySelectorAll('.btn-sign-pos');
  signPosBtns.forEach(btn => {
    btn.onclick = () => {
      manager.signPos = btn.getAttribute('data-pos') || 'bottom-right';
      manager.render();
    };
  });

  const includeDateCheck = manager.container.querySelector('#chk-include-sign-date');
  if (includeDateCheck) {
    includeDateCheck.onchange = (e) => {
      manager.includeSignDate = e.target.checked;
      manager.render();
    };
  }

  const signEmailInp = manager.container.querySelector('#workflow-sign-email');
  if (signEmailInp) {
    signEmailInp.oninput = (e) => {
      manager.signEmail = e.target.value.trim();
    };
  }

  const appendAuditCertCheck = manager.container.querySelector('#chk-append-audit-cert');
  if (appendAuditCertCheck) {
    appendAuditCertCheck.onchange = (e) => {
      manager.appendAuditCertificate = e.target.checked;
    };
  }

  const embedSignBadgeCheck = manager.container.querySelector('#chk-embed-sign-badge');
  if (embedSignBadgeCheck) {
    embedSignBadgeCheck.onchange = (e) => {
      manager.embedSignBadge = e.target.checked;
    };
  }

  const signFlowBtns = manager.container.querySelectorAll('.btn-sign-flow-mode');
  signFlowBtns.forEach(btn => {
    btn.onclick = () => {
      manager.signWorkflowMode = btn.getAttribute('data-flow') || 'self';
      manager.render();
    };
  });

  const openPlacerBtn = manager.container.querySelector('#btn-open-field-placer');
  if (openPlacerBtn) {
    openPlacerBtn.onclick = () => {
      const primary = manager.uploadedFiles[0];
      if (primary && primary.bytes) {
        signRequestModal.open(primary.bytes, primary.name);
      } else {
        Toast.error('Please upload a PDF document first.');
      }
    };
  }

  // Page Numbers Tool Controls
  const pnFmtInp = manager.container.querySelector('#workflow-pn-format');
  const pnFmtPresets = manager.container.querySelectorAll('.btn-pn-preset');
  const pnPosBtns = manager.container.querySelectorAll('.btn-pn-pos');
  const pnStartInp = manager.container.querySelector('#workflow-pn-start');
  const pnSizeSel = manager.container.querySelector('#workflow-pn-size');
  const pnBadge = manager.container.querySelector('#pn-preview-badge-overlay');

  const updatePnPreview = () => {
    if (pnBadge) {
      const total = manager.uploadedFiles[0]?.pageCount || 5;
      pnBadge.textContent = (manager.pnFormat || 'Page {n} of {total}')
        .replace('{n}', String(manager.pnStartPage || 1))
        .replace('{total}', String(total));
      pnBadge.style.cssText = `position: absolute; ${manager.getPnPositionCss()}; background: rgba(255, 255, 255, 0.92); padding: 3px 8px; border-radius: 4px; border: 1px dashed #30050d; font-size: ${manager.pnFontSize}px; font-weight: 600; color: #1e293b; pointer-events: none; transition: all 0.2s ease;`;
    }
  };

  if (pnFmtInp) {
    pnFmtInp.oninput = (e) => {
      manager.pnFormat = e.target.value;
      updatePnPreview();
    };
  }
  pnFmtPresets.forEach(btn => {
    btn.onclick = () => {
      manager.pnFormat = btn.getAttribute('data-fmt');
      if (pnFmtInp) pnFmtInp.value = manager.pnFormat;
      updatePnPreview();
    };
  });
  pnPosBtns.forEach(btn => {
    btn.onclick = () => {
      manager.pnPos = btn.getAttribute('data-pos') || 'bottom-center';
      pnPosBtns.forEach(b => {
        b.className = b === btn ? 'btn btn-xs btn-primary btn-pn-pos' : 'btn btn-xs btn-outline btn-pn-pos';
      });
      updatePnPreview();
    };
  });
  if (pnStartInp) {
    pnStartInp.oninput = (e) => {
      manager.pnStartPage = parseInt(e.target.value, 10) || 1;
      updatePnPreview();
    };
  }
  if (pnSizeSel) {
    pnSizeSel.onchange = (e) => {
      manager.pnFontSize = parseInt(e.target.value, 10) || 10;
      updatePnPreview();
    };
  }

  // Redaction workspace listeners
  const redactInp = manager.container.querySelector('#workflow-redact-keywords');
  if (redactInp) {
    redactInp.oninput = (e) => {
      manager.redactKeywords = e.target.value;
    };
  }
  manager.container.querySelectorAll('.btn-redact-color').forEach(btn => {
    btn.onclick = () => {
      manager.redactColor = btn.getAttribute('data-color') || '#000000';
      manager.render();
    };
  });

  // Scanner workspace listeners
  manager.container.querySelectorAll('.btn-scan-margin').forEach(btn => {
    btn.onclick = () => {
      manager.imgMargin = btn.getAttribute('data-margin') || '0';
      manager.render();
    };
  });

  // Excel to PDF options listeners
  const excelTitleInp = manager.container.querySelector('#workflow-excel-title');
  if (excelTitleInp) {
    excelTitleInp.oninput = (e) => {
      manager.excelTitle = e.target.value;
    };
  }
  manager.container.querySelectorAll('.btn-excel-orient').forEach(btn => {
    btn.onclick = () => {
      manager.excelOrientation = btn.getAttribute('data-orient') || 'auto';
      manager.render();
    };
  });

  // PPT to PDF options listeners
  const pptTitleInp = manager.container.querySelector('#workflow-ppt-title');
  if (pptTitleInp) {
    pptTitleInp.oninput = (e) => {
      manager.pptTitle = e.target.value;
    };
  }

  // Form Filler listeners
  if (manager.activeTool.id === 'fill-forms') {
    bindFormFillerEvents(manager);
  }

  // Repair & Diagnostic listeners
  if (manager.activeTool.id === 'repair') {
    bindRepairDiagnosticEvents(manager);
  }

  // Advanced Split & Merge listeners
  if (['merge', 'split'].includes(manager.activeTool.id)) {
    bindSplitMergeEvents(manager);
  }

  // PDF Metadata & XMP listeners
  if (manager.activeTool.id === 'edit-metadata') {
    bindMetadataEvents(manager);
  }

  // ISO 32000-1 PageLabels listeners
  if (manager.activeTool.id === 'pagelabels') {
    bindPageLabelsEvents(manager);
  }

  // Deep Document Sanitization listeners
  if (['sanitize', 'sanitize-pdf'].includes(manager.activeTool.id)) {
    bindSanitizeEvents(manager);
  }
}
