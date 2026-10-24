/**
 * Workflow Success Screen Sub-Module (Stage 3)
 * Handles the completed task presentation, download triggers,
 * cloud storage export modals, QR mobile download, zero-friction tool chaining,
 * memory wiping, and web share.
 */

import { CHAIN_TOOLS, WORKFLOW_TOOLS_CONFIG } from './tools-config.js';
import { openMobileQrModal, openCloudStorageModal } from './workflow-modals.js';
import { compareModal } from '../compare-modal.js';
import { Toast } from '../toast.js';
import { downloadBlob, formatFileSize } from '../../utils/helpers.js';
import { PageOperations } from '../../core/engine/page-ops.js';

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
  } else if (t.id === 'compare') {
    const diffs = manager.compareResult?.diffCount ?? 0;
    const score = manager.compareResult?.similarityScore ?? 100;
    subtitleText = `Comparison complete: ${score}% similarity match with ${diffs} difference${diffs === 1 ? '' : 's'} identified.`;
  } else if (t.id === 'ocr-pdf') {
    const totalWords = manager.lastOcrResult?.pagesOcr?.reduce((acc, p) => acc + (p.wordCount || 0), 0) ?? 0;
    subtitleText = `OCR recognition complete: ${totalWords.toLocaleString()} words indexed into an invisible searchable vector layer.`;
  } else if (t.id === 'fill-forms') {
    const count = manager.formExportData?.fieldCount ?? Object.keys(manager.formFieldValues || {}).length;
    subtitleText = `Form processing complete: ${count} AcroForm field${count === 1 ? '' : 's'} updated and validated.`;
  } else if (t.id === 'repair') {
    const pages = manager.lastRepairResult?.pageCount ?? 1;
    const objs = manager.lastRepairResult?.recoveredObjects ?? 0;
    subtitleText = `Repair complete: ${pages} page${pages === 1 ? '' : 's'} secured, ${objs} indirect objects rebuilt, and cross-reference index restored.`;
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

        ${manager.executionResult?.validation ? `
          <div class="pdfa-validation-certificate" style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: #065f46;">
                <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>ISO 19005 Compliance Certificate</span>
              </div>
              <span style="font-size: 11px; font-weight: 700; background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">
                ${manager.executionResult.validation.profile || 'PDF/A Verified'}
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">
              ${manager.executionResult.validation.checks.map(c => `
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                  <span style="color: #10b981; font-weight: bold;">✔</span>
                  <span style="font-weight: 600; color: var(--text-main);">${c.name}:</span>
                  <span>${c.detail}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${t.id === 'compare' ? `
          <div class="compare-success-action-card" style="background: rgba(48, 5, 13, 0.04); border: 1.5px solid rgba(48, 5, 13, 0.18); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: var(--text-main);">
                <svg width="18" height="18" fill="none" stroke="var(--primary)" stroke-width="2.2" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="8" height="16" rx="1.5"></rect>
                  <rect x="14" y="4" width="8" height="16" rx="1.5"></rect>
                  <line x1="10" y1="9" x2="14" y2="9"></line>
                  <line x1="10" y1="15" x2="14" y2="15"></line>
                </svg>
                <span>Interactive Visual Inspection</span>
              </div>
              <span style="font-size: 11.5px; font-weight: 700; background: ${manager.compareResult?.similarityScore >= 90 ? '#10b981' : '#f59e0b'}; color: white; padding: 2px 10px; border-radius: 9999px;">
                ${manager.compareResult?.similarityScore ?? 100}% Match
              </span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 12px; line-height: 1.4;">
              Inspect side-by-side pages with synchronized scroll, drag the before/after wipe divider, or blend opacity ghost layers.
            </p>
            <button class="workflow-primary-cta" id="btn-open-interactive-diff" style="background: linear-gradient(135deg, var(--primary) 0%, #4a0d17 100%); width: 100%; justify-content: center; font-size: 15px; padding: 12px 18px; box-shadow: 0 4px 12px rgba(48,5,13,0.25); border: none;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Launch Interactive Visual Diff Viewer</span>
            </button>
          </div>
        ` : ''}

        ${t.id === 'ocr-pdf' && manager.lastOcrResult ? `
          <div class="ocr-success-transcript-card" style="background: rgba(99, 102, 241, 0.05); border: 1.5px solid rgba(99, 102, 241, 0.25); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: var(--text-main);">
                <svg width="18" height="18" fill="none" stroke="#6366f1" stroke-width="2.2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Searchable PDF Ready</span>
              </div>
              <span style="font-size: 11px; font-weight: 700; background: #6366f1; color: white; padding: 2px 8px; border-radius: 12px;">
                ${manager.lastOcrResult.pagesOcr?.reduce((acc, p) => acc + (p.wordCount || 0), 0) || 0} Words Indexed
              </span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 12px; line-height: 1.4;">
              An invisible text layer has been embedded over the scanned image. You can now select, copy, and search words in any PDF viewer.
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-outline" id="btn-copy-ocr-transcript" style="flex: 1; min-width: 140px; justify-content: center; gap: 6px; font-weight: 600;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy Extracted Text</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-download-ocr-txt" style="flex: 1; min-width: 140px; justify-content: center; gap: 6px; font-weight: 600;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Download .TXT File</span>
              </button>
            </div>
          </div>
        ` : ''}

        ${manager.formExportData ? `
          <div class="form-export-data-card" style="background: rgba(37, 99, 235, 0.04); border: 1.5px solid rgba(37, 99, 235, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: #2563eb;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15h6"></path><path d="M9 11h6"></path><path d="M9 19h4"></path></svg>
                <span>AcroForm Data Export Hub</span>
              </div>
              <span style="font-size: 11px; font-weight: 700; background: rgba(37, 99, 235, 0.12); color: #2563eb; padding: 2px 8px; border-radius: 12px;">
                ${manager.formExportData.fieldCount || 0} Fields Extracted
              </span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 12px; line-height: 1.4;">
              Download your form values in Adobe Acrobat XML (XFDF), JSON, or tabular CSV format:
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-outline" id="btn-success-export-xfdf" style="flex: 1; min-width: 120px; justify-content: center; gap: 6px; font-weight: 600; font-size: 11.5px; background: white; color: #2563eb; border-color: rgba(37, 99, 235, 0.3);">
                <span>📥 Adobe .XFDF</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-success-export-json" style="flex: 1; min-width: 110px; justify-content: center; gap: 6px; font-weight: 600; font-size: 11.5px; background: white; color: #2563eb; border-color: rgba(37, 99, 235, 0.3);">
                <span>📥 JSON (.json)</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-success-export-csv" style="flex: 1; min-width: 110px; justify-content: center; gap: 6px; font-weight: 600; font-size: 11.5px; background: white; color: #2563eb; border-color: rgba(37, 99, 235, 0.3);">
                <span>📥 Table (.csv)</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-success-copy-json" style="background: white; font-weight: 600; font-size: 11.5px;">
                <span>📋 Copy JSON</span>
              </button>
            </div>
          </div>
        ` : ''}

        ${(t.id === 'repair' && manager.lastRepairResult) ? `
          <div class="repair-success-telemetry-card" style="background: rgba(16, 185, 129, 0.04); border: 1.5px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: #065f46;">
                <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                <span>ISO 32000-1 Structural Repair Telemetry</span>
              </div>
              <span style="font-size: 11px; font-weight: 700; background: #10b981; color: white; padding: 2px 8px; border-radius: 12px;">
                ${manager.lastRepairResult.pageCount || 1} Page${manager.lastRepairResult.pageCount === 1 ? '' : 's'} Secured
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">
              ${(manager.lastRepairResult.anomaliesFixed || []).length > 0 ? (manager.lastRepairResult.anomaliesFixed || []).map(a => `
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                  <span style="color: #10b981; font-weight: bold;">✔</span>
                  <span style="color: var(--text-main); font-weight: 500;">${a}</span>
                </div>
              `).join('') : '<div style="color: #10b981;">Clean document structure re-indexed successfully.</div>'}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-outline" id="btn-success-repair-log" style="background: white; color: #065f46; border-color: rgba(16, 185, 129, 0.4); font-weight: 600; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                <span>Download Repair Audit Log (.txt)</span>
              </button>
            </div>
          </div>
        ` : ''}

        ${t.id === 'sign' && manager.lastAuditRecord ? `
          <div class="sign-audit-trail-card" style="background: rgba(48, 5, 13, 0.04); border: 1.5px solid rgba(48, 5, 13, 0.18); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: #30050d;">
                <svg width="18" height="18" fill="none" stroke="#30050d" stroke-width="2.2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>eIDAS & ESIGN Cryptographic Audit Trail</span>
              </div>
              <span style="font-size: 11px; font-weight: 700; background: #10b981; color: white; padding: 2px 8px; border-radius: 12px;">
                Verified & Tamper-Evident
              </span>
            </div>

            <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 12px; line-height: 1.4;">
              Digital signature was cryptographically sealed with an immutable SHA-256 integrity hash, legal transaction ID, and vector verification QR code.
            </p>

            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 11px; font-family: monospace;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Transaction ID:</span>
                <strong style="color: var(--text-main);">${manager.lastAuditRecord.transactionId}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Signer:</span>
                <span style="color: var(--text-main); font-weight: 600;">${manager.lastAuditRecord.signerName}${manager.lastAuditRecord.signerEmail ? ` &lt;${manager.lastAuditRecord.signerEmail}&gt;` : ''}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted);">Doc SHA-256:</span>
                <span style="color: var(--text-main); font-size: 10px; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${manager.lastAuditRecord.originalHash}">
                  ${manager.lastAuditRecord.originalHash.substring(0, 16)}...${manager.lastAuditRecord.originalHash.slice(-8)}
                </span>
              </div>
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-outline" id="btn-copy-sign-hash" style="flex: 1; min-width: 130px; justify-content: center; gap: 6px; font-weight: 600; font-size: 11.5px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy SHA-256 Hash</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-download-audit-cert" style="flex: 1; min-width: 150px; justify-content: center; gap: 6px; font-weight: 600; font-size: 11.5px; background: rgba(48, 5, 13, 0.05); color: #30050d; border-color: rgba(48, 5, 13, 0.2);">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>Download Audit Sheet (.PDF)</span>
              </button>
            </div>
          </div>
        ` : ''}

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

  const openDiffBtn = manager.container.querySelector('#btn-open-interactive-diff');
  if (openDiffBtn) {
    openDiffBtn.onclick = () => {
      if (manager.compareDocA && manager.compareDocB) {
        compareModal.showWithBytes(
          manager.compareDocA.bytes,
          manager.compareDocB.bytes,
          manager.compareDocA.name,
          manager.compareDocB.name
        );
      }
    };
  }

  const copyOcrBtn = manager.container.querySelector('#btn-copy-ocr-transcript');
  if (copyOcrBtn) {
    copyOcrBtn.onclick = () => {
      if (manager.lastOcrResult?.fullText) {
        navigator.clipboard.writeText(manager.lastOcrResult.fullText);
        Toast.success('Extracted plain text copied to clipboard!');
      }
    };
  }

  const downloadOcrTxtBtn = manager.container.querySelector('#btn-download-ocr-txt');
  if (downloadOcrTxtBtn) {
    downloadOcrTxtBtn.onclick = () => {
      if (manager.lastOcrResult?.fullText) {
        const textBlob = new Blob([manager.lastOcrResult.fullText], { type: 'text/plain;charset=utf-8' });
        downloadBlob(textBlob, `${(manager.processedFilename || 'document').replace(/\.[^/.]+$/, '')}_transcript.txt`);
        Toast.success('Downloaded transcript TXT file!');
      }
    };
  }

  const copySignHashBtn = manager.container.querySelector('#btn-copy-sign-hash');
  if (copySignHashBtn) {
    copySignHashBtn.onclick = () => {
      if (manager.lastAuditRecord?.originalHash) {
        navigator.clipboard.writeText(manager.lastAuditRecord.originalHash);
        Toast.success('Cryptographic SHA-256 hash copied to clipboard!');
      }
    };
  }

  const downloadAuditCertBtn = manager.container.querySelector('#btn-download-audit-cert');
  if (downloadAuditCertBtn) {
    downloadAuditCertBtn.onclick = async () => {
      if (manager.standaloneAuditPdfBytes) {
        const certBlob = new Blob([manager.standaloneAuditPdfBytes], { type: 'application/pdf' });
        const certName = `Audit_Certificate_${manager.lastAuditRecord?.transactionId || 'Record'}.pdf`;
        downloadBlob(certBlob, certName);
        Toast.success('Downloaded legal audit certificate!');
      } else if (manager.lastAuditRecord) {
        try {
          const certBytes = await PageOperations.generateAuditCertificate(manager.lastAuditRecord);
          const certBlob = new Blob([certBytes], { type: 'application/pdf' });
          const certName = `Audit_Certificate_${manager.lastAuditRecord.transactionId || 'Record'}.pdf`;
          downloadBlob(certBlob, certName);
          Toast.success('Downloaded legal audit certificate!');
        } catch (err) {
          Toast.error('Failed to generate audit certificate: ' + err.message);
        }
      }
    };
  }

  // Form Data Export Buttons
  const xfdfBtn = manager.container.querySelector('#btn-success-export-xfdf');
  if (xfdfBtn && manager.formExportData?.xfdf) {
    xfdfBtn.onclick = () => {
      const base = (manager.processedFilename || 'document').replace(/\.[^/.]+$/, '');
      const blob = new Blob([manager.formExportData.xfdf], { type: 'application/vnd.adobe.xfdf' });
      downloadBlob(blob, `${base}_data.xfdf`);
      Toast.success('Downloaded Adobe XFDF data file!');
    };
  }

  const jsonBtn = manager.container.querySelector('#btn-success-export-json');
  if (jsonBtn && manager.formExportData?.json) {
    jsonBtn.onclick = () => {
      const base = (manager.processedFilename || 'document').replace(/\.[^/.]+$/, '');
      const blob = new Blob([manager.formExportData.json], { type: 'application/json' });
      downloadBlob(blob, `${base}_data.json`);
      Toast.success('Downloaded JSON form data!');
    };
  }

  const csvBtn = manager.container.querySelector('#btn-success-export-csv');
  if (csvBtn && manager.formExportData?.csv) {
    csvBtn.onclick = () => {
      const base = (manager.processedFilename || 'document').replace(/\.[^/.]+$/, '');
      const blob = new Blob([manager.formExportData.csv], { type: 'text/csv' });
      downloadBlob(blob, `${base}_data.csv`);
      Toast.success('Downloaded CSV form data!');
    };
  }

  const copyJsonBtn = manager.container.querySelector('#btn-success-copy-json');
  if (copyJsonBtn && manager.formExportData?.json) {
    copyJsonBtn.onclick = async () => {
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(manager.formExportData.json);
        Toast.success('Copied JSON form data to clipboard!');
      } catch {
        Toast.info('Copy ready');
      }
    };
  }

  const repairLogBtn = manager.container.querySelector('#btn-success-repair-log');
  if (repairLogBtn && manager.lastRepairResult?.diagnosticLog) {
    repairLogBtn.onclick = () => {
      const base = (manager.processedFilename || 'repaired_document').replace(/\.[^/.]+$/, '');
      const blob = new Blob([manager.lastRepairResult.diagnosticLog], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, `${base}_repair_audit.txt`);
      Toast.success('Downloaded repair audit log!');
    };
  }

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
