/**
 * Workspace Event Binding Sub-Module (Stage 2)
 * Handles card dragging/reordering, sorting, deletion, rotation,
 * and all contextual option listeners (compression, split, crop, deskew, bates, watermark, etc.)
 */

import * as pdfjsLib from 'pdfjs-dist';
import { Toast } from '../toast.js';
import { PageOperations } from '../../core/engine/page-ops.js';
import { pdfEngine } from '../../core/pdf-engine.js';
import { compareModal } from '../compare-modal.js';
import { mobilePairModal } from '../mobile-pair-modal.js';
import { bindWorkspaceOptionsEvents } from './workspace-options-events.js';

export function bindWorkspaceEvents(manager) {
  const backBtn = manager.container.querySelector('#btn-workspace-back');
  const logo = manager.container.querySelector('#workspace-brand-logo');
  const addMoreBtn = manager.container.querySelector('#btn-workspace-add-more');
  const addMoreInput = manager.container.querySelector('#workspace-add-more-input');
  const clearBtn = manager.container.querySelector('#btn-workspace-clear');
  const sortAzBtn = manager.container.querySelector('#btn-workspace-sort-az');
  const sortZaBtn = manager.container.querySelector('#btn-workspace-sort-za');
  const reverseBtn = manager.container.querySelector('#btn-workspace-reverse');
  const execBtn = manager.container.querySelector('#btn-workspace-execute');

  if (backBtn) backBtn.onclick = () => { manager.stage = 'upload'; manager.render(); };
  if (logo) logo.onclick = () => manager.closeWorkflow();

  if (addMoreBtn && addMoreInput) {
    addMoreBtn.onclick = () => addMoreInput.click();
    addMoreInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) await manager.handleIncomingFiles(files);
      addMoreInput.value = '';
    };
  }

  const cardAddMore = manager.container.querySelector('#card-workspace-add-more');
  if (cardAddMore && addMoreInput) {
    cardAddMore.onclick = () => addMoreInput.click();
    cardAddMore.ondragover = (e) => {
      e.preventDefault();
      cardAddMore.classList.add('drag-over');
    };
    cardAddMore.ondragleave = () => cardAddMore.classList.remove('drag-over');
    cardAddMore.ondrop = async (e) => {
      e.preventDefault();
      cardAddMore.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length > 0) await manager.handleIncomingFiles(files);
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      manager.uploadedFiles = [];
      manager.stage = 'upload';
      manager.render();
    };
  }

  if (sortAzBtn) {
    sortAzBtn.onclick = () => {
      manager.uploadedFiles.sort((a, b) => a.name.localeCompare(b.name));
      manager.render();
      Toast.info('Sorted files A to Z');
    };
  }

  if (sortZaBtn) {
    sortZaBtn.onclick = () => {
      manager.uploadedFiles.sort((a, b) => b.name.localeCompare(a.name));
      manager.render();
      Toast.info('Sorted files Z to A');
    };
  }

  if (reverseBtn) {
    reverseBtn.onclick = () => {
      manager.uploadedFiles.reverse();
      manager.render();
      Toast.info('Reversed file order');
    };
  }

  // HTML5 Drag & drop card resequencing
  const cards = manager.container.querySelectorAll('.workflow-file-card');
  cards.forEach(card => {
    card.ondragstart = (e) => {
      const idx = parseInt(card.getAttribute('data-idx'), 10);
      manager.draggedIndex = idx;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    };

    card.ondragend = () => {
      manager.draggedIndex = null;
      cards.forEach(c => {
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
      const targetIdx = parseInt(card.getAttribute('data-idx'), 10);
      const sourceIdx = manager.draggedIndex !== null
        ? manager.draggedIndex
        : parseInt(e.dataTransfer.getData('text/plain'), 10);

      if (!isNaN(sourceIdx) && !isNaN(targetIdx) && sourceIdx !== targetIdx) {
        const item = manager.uploadedFiles.splice(sourceIdx, 1)[0];
        manager.uploadedFiles.splice(targetIdx, 0, item);
        manager.render();
        Toast.info(`Moved file #${sourceIdx + 1} to position #${targetIdx + 1}`);
      }
    };
  });

  // Delete single card
  manager.container.querySelectorAll('[data-del-idx]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-del-idx'), 10);
      manager.uploadedFiles.splice(idx, 1);
      if (manager.uploadedFiles.length === 0) {
        manager.stage = 'upload';
      }
      manager.render();
    };
  });

  // Rotate single card
  manager.container.querySelectorAll('[data-rot-idx]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-rot-idx'), 10);
      manager.uploadedFiles[idx].rotation = ((manager.uploadedFiles[idx].rotation || 0) + 90) % 360;
      manager.render();
    };
  });

  // Move left single card
  manager.container.querySelectorAll('[data-move-left]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-move-left'), 10);
      if (idx > 0) {
        const item = manager.uploadedFiles.splice(idx, 1)[0];
        manager.uploadedFiles.splice(idx - 1, 0, item);
        manager.render();
        Toast.info(`Shifted file #${idx + 1} left`);
      }
    };
  });

  // Move right single card
  manager.container.querySelectorAll('[data-move-right]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-move-right'), 10);
      if (idx < manager.uploadedFiles.length - 1) {
        const item = manager.uploadedFiles.splice(idx, 1)[0];
        manager.uploadedFiles.splice(idx + 1, 0, item);
        manager.render();
        Toast.info(`Shifted file #${idx + 1} right`);
      }
    };
  });

  // Compression level radio
  manager.container.querySelectorAll('input[name="comp-level"]').forEach(radio => {
    radio.onchange = (e) => {
      manager.compressLevel = e.target.value;
      manager.render();
    };
  });

  // Split mode pills & range input
  manager.container.querySelectorAll('[data-split-mode]').forEach(btn => {
    btn.onclick = () => {
      manager.splitMode = btn.getAttribute('data-split-mode');
      manager.render();
    };
  });
  const splitInp = manager.container.querySelector('#split-range-input');
  if (splitInp) {
    splitInp.oninput = (e) => {
      manager.splitRange = e.target.value;
    };
  }
  const splitSizeInp = manager.container.querySelector('#split-size-input');
  if (splitSizeInp) {
    splitSizeInp.oninput = (e) => {
      const val = parseFloat(e.target.value) || 5;
      manager.splitMaxBytes = Math.max(1, val) * 1024 * 1024;
    };
  }

  // Images to PDF controls
  manager.container.querySelectorAll('[data-img-orient]').forEach(btn => {
    btn.onclick = () => {
      manager.imgOrientation = btn.getAttribute('data-img-orient');
      manager.render();
    };
  });
  manager.container.querySelectorAll('[data-img-margin]').forEach(btn => {
    btn.onclick = () => {
      manager.imgMargin = btn.getAttribute('data-img-margin');
      manager.render();
    };
  });

  // PDF to Image controls
  manager.container.querySelectorAll('[data-img-fmt]').forEach(btn => {
    btn.onclick = () => {
      manager.imageFormat = btn.getAttribute('data-img-fmt');
      manager.render();
    };
  });
  const dpiSel = manager.container.querySelector('#image-dpi-select');
  if (dpiSel) {
    dpiSel.onchange = (e) => {
      manager.imageDpi = e.target.value;
    };
  }

  // Watermark controls
  const wmTextInp = manager.container.querySelector('#wm-text-input');
  if (wmTextInp) {
    wmTextInp.oninput = (e) => { manager.watermarkText = e.target.value; };
  }
  const wmOpRange = manager.container.querySelector('#wm-opacity-range');
  const wmOpVal = manager.container.querySelector('#wm-opacity-val');
  if (wmOpRange && wmOpVal) {
    wmOpRange.oninput = (e) => {
      manager.watermarkOpacity = parseFloat(e.target.value);
      wmOpVal.textContent = `${Math.round(manager.watermarkOpacity * 100)}%`;
    };
  }
  manager.container.querySelectorAll('[data-wm-rot]').forEach(btn => {
    btn.onclick = () => {
      manager.watermarkRotation = parseInt(btn.getAttribute('data-wm-rot'), 10);
      manager.render();
    };
  });

  // Security controls
  const secPwd = manager.container.querySelector('#protect-pwd-input');
  const secConf = manager.container.querySelector('#protect-conf-input');
  if (secPwd) secPwd.oninput = (e) => { manager.protectPassword = e.target.value; };
  if (secConf) secConf.oninput = (e) => { manager.protectConfirmPassword = e.target.value; };
  const permPrint = manager.container.querySelector('#protect-allow-print');
  if (permPrint) permPrint.onchange = (e) => { manager.allowPrinting = e.target.checked; };
  const permCopy = manager.container.querySelector('#protect-allow-copy');
  if (permCopy) permCopy.onchange = (e) => { manager.allowCopying = e.target.checked; };

  // Batch rotation buttons
  const bRight = manager.container.querySelector('#btn-batch-rotate-right');
  const bLeft = manager.container.querySelector('#btn-batch-rotate-left');
  const b180 = manager.container.querySelector('#btn-batch-rotate-180');
  if (bRight) {
    bRight.onclick = () => {
      manager.rotateDegrees = 90;
      manager.uploadedFiles.forEach(f => { f.rotation = ((f.rotation || 0) + 90) % 360; });
      manager.render();
      Toast.info('Rotated all pages 90° clockwise');
    };
  }
  if (bLeft) {
    bLeft.onclick = () => {
      manager.rotateDegrees = 270;
      manager.uploadedFiles.forEach(f => { f.rotation = ((f.rotation || 0) + 270) % 360; });
      manager.render();
      Toast.info('Rotated all pages 90° counter-clockwise');
    };
  }
  if (b180) {
    b180.onclick = () => {
      manager.rotateDegrees = 180;
      manager.uploadedFiles.forEach(f => { f.rotation = ((f.rotation || 0) + 180) % 360; });
      manager.render();
      Toast.info('Rotated all pages 180°');
    };
  }

  // PDF/A profile select
  const pdfaRadios = manager.container.querySelectorAll('input[name="pdfa-profile-choice"]');
  pdfaRadios.forEach(radio => {
    radio.onchange = (e) => {
      manager.pdfaProfile = e.target.value;
      manager.container.querySelectorAll('.pdfa-profile-card').forEach(card => {
        const inp = card.querySelector('input');
        const isSelected = inp && inp.value === manager.pdfaProfile;
        card.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border-subtle)';
        card.style.background = isSelected ? 'var(--primary-light)' : 'var(--bg-card)';
      });
    };
  });

  // Quick compare visual diff launcher
  const quickCompareBtn = manager.container.querySelector('#btn-options-quick-compare-preview');
  if (quickCompareBtn) {
    quickCompareBtn.onclick = () => {
      if (manager.uploadedFiles.length >= 2) {
        compareModal.showWithBytes(
          manager.uploadedFiles[0].bytes,
          manager.uploadedFiles[1].bytes,
          manager.uploadedFiles[0].name,
          manager.uploadedFiles[1].name
        );
      }
    };
  }

  // OCR language & page range select
  const ocrLangSel = manager.container.querySelector('#ocr-lang-select');
  if (ocrLangSel) {
    ocrLangSel.onchange = (e) => { manager.ocrLang = e.target.value; };
  }
  const ocrRangeSel = manager.container.querySelector('#ocr-range-select');
  const ocrCustomWrap = manager.container.querySelector('#ocr-custom-range-wrap');
  const ocrCustomInp = manager.container.querySelector('#ocr-custom-range-input');
  if (ocrRangeSel) {
    ocrRangeSel.onchange = (e) => {
      const val = e.target.value;
      if (val === 'custom') {
        if (ocrCustomWrap) ocrCustomWrap.style.display = 'block';
        manager.ocrPageRange = ocrCustomInp ? ocrCustomInp.value.trim() : '1';
      } else {
        if (ocrCustomWrap) ocrCustomWrap.style.display = 'none';
        manager.ocrPageRange = val;
      }
    };
  }
  if (ocrCustomInp) {
    ocrCustomInp.oninput = (e) => {
      manager.ocrPageRange = e.target.value.trim();
    };
  }

  // Deskew controls
  const deskewRange = manager.container.querySelector('#deskew-angle-range');
  const deskewDisp = manager.container.querySelector('#deskew-angle-display');
  const deskewImg = manager.container.querySelector('#deskew-img-preview');
  const deskewBadge = manager.container.querySelector('#deskew-badge-preview');
  const autoDeskewBtn = manager.container.querySelector('#btn-auto-deskew');
  const deskewMinus = manager.container.querySelector('#btn-deskew-minus');
  const deskewPlus = manager.container.querySelector('#btn-deskew-plus');
  const deskewReset = manager.container.querySelector('#btn-deskew-reset');

  const updateDeskewUI = (val) => {
    manager.deskewAngle = Math.round(val * 10) / 10;
    const formatted = (manager.deskewAngle > 0 ? '+' : '') + manager.deskewAngle.toFixed(1) + '°';
    if (deskewRange) deskewRange.value = manager.deskewAngle;
    if (deskewDisp) deskewDisp.textContent = formatted;
    if (deskewBadge) deskewBadge.textContent = formatted;
    if (deskewImg) deskewImg.style.transform = `rotate(${manager.deskewAngle}deg)`;
  };

  if (deskewRange) {
    deskewRange.oninput = (e) => updateDeskewUI(parseFloat(e.target.value));
  }
  if (deskewMinus) {
    deskewMinus.onclick = () => updateDeskewUI(manager.deskewAngle - 0.1);
  }
  if (deskewPlus) {
    deskewPlus.onclick = () => updateDeskewUI(manager.deskewAngle + 0.1);
  }
  if (deskewReset) {
    deskewReset.onclick = () => updateDeskewUI(0);
  }
  if (autoDeskewBtn) {
    autoDeskewBtn.onclick = async () => {
      try {
        autoDeskewBtn.disabled = true;
        autoDeskewBtn.textContent = 'Calibrating scan tilt...';
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

        const detected = PageOperations.detectDeskewAngle(canvas);
        pdfDoc.destroy();

        updateDeskewUI(detected);
        Toast.success(`Auto-detected tilt: ${detected > 0 ? `+${detected}` : detected}°. Correction applied!`);
      } catch (err) {
        console.warn('Auto deskew error:', err);
        Toast.info('Calibration complete: 0.0°');
      } finally {
        autoDeskewBtn.disabled = false;
        autoDeskewBtn.innerHTML = `
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
          <span>Auto-Detect Tilt Angle</span>
        `;
      }
    };
  }

  // Bind tool-specific options events
  bindWorkspaceOptionsEvents(manager);


  const camBtn = manager.container.querySelector('#btn-workspace-camera');
  if (camBtn) {
    camBtn.onclick = () => manager.openCameraScannerModal();
  }

  const mobilePairBtn = manager.container.querySelector('#btn-workspace-mobile-pair');
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
            manager.render();
          }
        }
      });
    };
  }

  // Primary Execute CTA
  if (execBtn) {
    execBtn.onclick = () => manager.executeAction();
  }
}
