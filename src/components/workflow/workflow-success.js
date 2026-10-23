/**
 * Workflow Success Screen Sub-Module (Stage 3)
 * Handles the completed task presentation, download triggers,
 * cloud storage export modals, QR mobile download, zero-friction tool chaining,
 * memory wiping, and web share.
 */

import { CHAIN_TOOLS, WORKFLOW_TOOLS_CONFIG } from './tools-config.js';
import { openMobileQrModal, openCloudStorageModal } from './workflow-modals.js';
import { Toast } from '../toast.js';
import { downloadBlob, formatFileSize } from '../../utils/helpers.js';

export function renderSuccessScreen(manager) {
  const t = manager.activeTool;
  const isPdf = manager.processedBlob && (manager.processedBlob.type === 'application/pdf' || (manager.processedFilename && manager.processedFilename.toLowerCase().endsWith('.pdf')));

  let subtitleText = 'Your document has been processed in your browser and is ready to download.';
  if (manager.lastOperationMetrics && manager.lastOperationMetrics.savingsPercent > 0) {
    subtitleText = `Your PDF is now ${manager.lastOperationMetrics.savingsPercent}% smaller! Reduced from ${formatFileSize(manager.lastOperationMetrics.originalSize)} to ${formatFileSize(manager.lastOperationMetrics.compressedSize)}.`;
  } else if (t.id === 'merge') {
    subtitleText = 'Your documents have been seamlessly combined into 1 unified PDF document.';
  } else if (t.id === 'split') {
    subtitleText = 'Your document was extracted into individual PDF files.';
  } else if (t.id === 'security' || t.id === 'protect') {
    subtitleText = 'Your PDF is now encrypted with standard ISO 32000-1 AES-256 password protection.';
  } else if (t.id === 'watermark') {
    subtitleText = 'Custom text watermark was embedded across all pages.';
  } else if (t.id === 'sign') {
    subtitleText = 'Signature and verified timestamp have been applied.';
  }

  // Filter chaining tools to prioritize complementary tools
  const availableChainTools = CHAIN_TOOLS.filter(ct => ct.id !== t.id && (ct.id !== 'security' || t.id !== 'protect'));

  manager.container.innerHTML = `
    <header class="workflow-header">
      <div class="workflow-header-inner">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="workflow-back-btn" id="btn-success-back" title="Back to All Tools">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
            <span>All Tools</span>
          </button>
          <div class="lets-logo" id="success-brand-logo" style="cursor: pointer;">
            <div class="lets-logo-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
              </svg>
            </div>
            <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
          </div>
        </div>
      </div>
    </header>

    <main class="workflow-main" style="padding: 40px 16px;">
      <div class="workflow-hero-card" style="max-width: 680px; width: 100%;">
        <div class="workflow-success-ring">
          <svg width="48" height="48" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1 class="workflow-title" style="margin-top: 16px;">Task Complete!</h1>
        <p class="workflow-subtitle">${subtitleText}</p>

        <div style="background: var(--bg-surface); padding: 16px 20px; border-radius: 12px; border: 1px solid var(--border-subtle); margin: 24px 0; text-align: left; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: ${t.color}18; color: ${t.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div style="overflow: hidden;">
              <strong style="display: block; font-size: 15px; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${manager.processedFilename}</strong>
              <span style="font-size: 13px; color: var(--text-muted);">${formatFileSize(manager.processedBlob ? manager.processedBlob.size : 0)}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="workflow-format-chip" style="margin: 0; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">
              🔒 100% Client-Side Private
            </span>
          </div>
        </div>

        <!-- Primary Download Button -->
        <button class="workflow-primary-cta" id="btn-success-download" style="background: ${t.color}; width: 100%; justify-content: center; font-size: 16px; padding: 14px 20px;">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
          <span>Download ${manager.processedFilename}</span>
        </button>

        <!-- iLovePDF-Style Quick Cloud Export & Sharing Bar -->
        <div class="workflow-export-group">
          <button class="workflow-export-btn" id="btn-success-gdrive" title="Save directly to Google Drive">
            <svg width="18" height="18" viewBox="0 0 87.3 78" fill="none"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.55h27.5L43.65 25z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.2 7.85 13.6z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832d"/><path d="M59.8 48.55H27.5L13.75 72.35c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25L59.8 48.55z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 23.55h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-17.55z" fill="#ffba00"/></svg>
            <span>Google Drive</span>
          </button>

          <button class="workflow-export-btn" id="btn-success-dropbox" title="Save directly to Dropbox">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0061ff"><path d="M6 2l6 3.92-6 3.92L0 5.92 6 2zm12 0l6 3.92-6 3.92-6-3.92L18 2zM0 13.76l6-3.92 6 3.92-6 3.92-6-3.92zm24 0l-6-3.92-6 3.92 6 3.92 6-3.92zM6 18.52l6-3.92 6 3.92-6 3.92-6-3.92z"/></svg>
            <span>Dropbox</span>
          </button>

          <button class="workflow-export-btn" id="btn-success-qr" title="Scan QR Code to download on mobile">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Mobile QR</span>
          </button>

          <button class="workflow-export-btn" id="btn-success-share" title="Share link or copy download reference">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            <span>Share</span>
          </button>

          <button class="workflow-export-btn workflow-delete-btn" id="btn-success-delete" title="Immediately wipe document memory for extreme privacy">
            <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete now</span>
          </button>
        </div>

        <!-- One-Click Tool Chaining Panel (Exclusive Advantage over Legacy Tools) -->
        ${isPdf ? `
          <div class="workflow-chaining-panel">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <div>
                <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                  <span>Next Steps: Continue with this Document</span>
                  <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
                    Instant • No Re-upload
                  </span>
                </h3>
                <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-muted);">
                  Apply additional compression, encryption, or formatting seamlessly.
                </p>
              </div>
            </div>

            <div class="workflow-chain-grid">
              ${availableChainTools.slice(0, 6).map(ct => `
                <div class="workflow-chain-card" data-chain-tool="${ct.id}" style="--chain-color: ${ct.color};">
                  <div class="workflow-chain-icon" style="background: ${ct.color}18; color: ${ct.color};">
                    ${ct.icon}
                  </div>
                  <div class="workflow-chain-content">
                    <span class="workflow-chain-title">${ct.title}</span>
                    <span class="workflow-chain-desc">${ct.desc}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Secondary Actions -->
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button class="btn btn-outline" id="btn-success-open-studio" style="flex: 1; padding: 12px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>Continue in PDF Editor</span>
          </button>
          <button class="btn btn-outline" id="btn-success-again" style="flex: 1; padding: 12px;">
            <span>Process Another File</span>
          </button>
        </div>
      </div>
    </main>
  `;

  bindSuccessEvents(manager);
}

export function bindSuccessEvents(manager) {
  const backBtn = manager.container.querySelector('#btn-success-back');
  const logo = manager.container.querySelector('#success-brand-logo');
  const downloadBtn = manager.container.querySelector('#btn-success-download');
  const gdriveBtn = manager.container.querySelector('#btn-success-gdrive');
  const dropboxBtn = manager.container.querySelector('#btn-success-dropbox');
  const qrBtn = manager.container.querySelector('#btn-success-qr');
  const shareBtn = manager.container.querySelector('#btn-success-share');
  const deleteBtn = manager.container.querySelector('#btn-success-delete');
  const openStudioBtn = manager.container.querySelector('#btn-success-open-studio');
  const againBtn = manager.container.querySelector('#btn-success-again');

  if (backBtn) backBtn.onclick = () => manager.closeWorkflow();
  if (logo) logo.onclick = () => manager.closeWorkflow();

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      downloadBlob(manager.processedBlob, manager.processedFilename);
      Toast.success(`Downloaded ${manager.processedFilename}`);
    };
  }

  if (gdriveBtn) {
    gdriveBtn.onclick = () => openCloudStorageModal(manager, 'gdrive');
  }

  if (dropboxBtn) {
    dropboxBtn.onclick = () => openCloudStorageModal(manager, 'dropbox');
  }

  if (qrBtn) {
    qrBtn.onclick = () => openMobileQrModal(manager);
  }

  if (shareBtn) {
    shareBtn.onclick = () => shareDocument(manager);
  }

  if (deleteBtn) {
    deleteBtn.onclick = () => purgeDocumentMemory(manager);
  }

  // Tool Chaining click handlers
  const chainCards = manager.container.querySelectorAll('.workflow-chain-card');
  chainCards.forEach(card => {
    card.onclick = () => {
      const toolId = card.getAttribute('data-chain-tool');
      if (toolId) chainIntoTool(manager, toolId);
    };
  });

  if (openStudioBtn) {
    openStudioBtn.onclick = async () => {
      if (manager.processedBlob && (manager.processedBlob.type === 'application/pdf' || manager.processedFilename.toLowerCase().endsWith('.pdf'))) {
        const ab = await manager.processedBlob.arrayBuffer();
        manager.switchToStudioWithBuffer(ab, manager.processedFilename);
      } else {
        manager.closeWorkflow();
      }
    };
  }

  if (againBtn) {
    againBtn.onclick = () => {
      manager.uploadedFiles = [];
      manager.processedBlob = null;
      manager.stage = 'upload';
      manager.render();
    };
  }
}

export async function chainIntoTool(manager, toolKey) {
  if (!manager.processedBlob) {
    Toast.error('No processed document available to continue with');
    return;
  }
  const resolvedKey = toolKey === 'protect' ? 'security' : toolKey;
  const config = WORKFLOW_TOOLS_CONFIG[resolvedKey];
  if (!config) {
    Toast.error(`Tool ${toolKey} not found`);
    return;
  }

  const currentBlob = manager.processedBlob;
  const currentFilename = manager.processedFilename || 'document.pdf';
  const isPdf = currentBlob.type === 'application/pdf' || currentFilename.toLowerCase().endsWith('.pdf');

  if (!isPdf && config.accept && config.accept.includes('.pdf') && !config.accept.includes(currentBlob.type)) {
    Toast.error('The selected tool requires a PDF document.');
    return;
  }

  const file = new File([currentBlob], currentFilename, {
    type: currentBlob.type || 'application/pdf',
    lastModified: Date.now()
  });

  manager.openTool(resolvedKey, { updateUrl: true });
  await manager.handleIncomingFiles([file]);
  Toast.success(`Transferred directly into ${config.title}`);
}

export function purgeDocumentMemory(manager) {
  manager.processedBlob = null;
  manager.processedFilename = '';
  manager.uploadedFiles = [];
  manager.stage = 'upload';
  manager.render();
  Toast.info('Document memory purged. 100% privacy maintained.');
}

export async function shareDocument(manager) {
  if (!manager.processedBlob) {
    Toast.warning('No document processed to share.');
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([manager.processedBlob], manager.processedFilename, {
        type: manager.processedBlob.type || 'application/pdf'
      });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: manager.processedFilename,
          text: 'Here is your processed document from LetsEdit PDF Studio.'
        });
        Toast.success('Document shared successfully!');
        return;
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn('Native share failed:', e);
      } else {
        return;
      }
    }
  }

  // Fallback to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      Toast.success('Tool link copied to clipboard!');
    } else {
      Toast.info(`Document ready: ${manager.processedFilename}`);
    }
  } catch {
    Toast.info(`Document ready: ${manager.processedFilename}`);
  }
}
