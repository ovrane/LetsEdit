/**
 * Repair Diagnostic View Sub-Module
 * Reverse-engineered from iLovePDF Repair & Sejda PDF Recovery:
 * Renders structural diagnostic telemetry, health scores, detected anomalies,
 * and multi-tier recovery status in Stage 2 Workspace and Success screens.
 */

import { PageOperations } from '../../core/engine/page-ops.js';
import { Toast } from '../toast.js';
import { downloadBlob } from '../../utils/helpers.js';

export function renderRepairDiagnosticOptionsHtml(manager) {
  const file = manager.uploadedFiles[0];
  const diagnostic = manager.repairDiagnostic || (file?.bytes ? PageOperations.diagnosePdf(file.bytes) : null);
  manager.repairDiagnostic = diagnostic;

  const score = diagnostic ? diagnostic.healthScore : 100;
  const scoreColor = score >= 90 ? '#10b981' : (score >= 50 ? '#f59e0b' : '#ef4444');
  const anomalies = diagnostic?.anomalies || [];

  return `
    <div class="workflow-options-group repair-diagnostic-options-group">
      <!-- Health Score Gauge -->
      <div style="background: var(--bg-surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border-subtle); margin-bottom: 16px; text-align: center;">
        <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">
          Structural Integrity Health
        </div>
        <div style="font-size: 36px; font-weight: 900; color: ${scoreColor}; line-height: 1; margin-bottom: 6px;">
          ${score}%
        </div>
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">
          PDF Spec Version: <strong style="color: var(--text-main); font-family: monospace;">${diagnostic?.pdfVersion || '1.7'}</strong>
        </div>
      </div>

      <!-- Structural Inventory Metrics -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
        <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Discovered Objects</div>
          <div style="font-size: 18px; font-weight: 700; color: var(--text-main);">${diagnostic?.objectCount || 0}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Estimated Pages</div>
          <div style="font-size: 18px; font-weight: 700; color: #10b981;">${diagnostic?.estimatedPages || 1}</div>
        </div>
      </div>

      <!-- Detected Structural Anomalies List -->
      <div style="margin-bottom: 16px;">
        <label class="workflow-options-label" style="display: flex; align-items: center; justify-content: space-between;">
          <span>Detected Anomalies</span>
          <span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: ${anomalies.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: ${anomalies.length > 0 ? '#ef4444' : '#10b981'}; font-weight: 700;">
            ${anomalies.length} Issue${anomalies.length === 1 ? '' : 's'}
          </span>
        </label>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${anomalies.length === 0 ? `
            <div style="padding: 10px 12px; background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; font-size: 12px; color: #10b981; display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Document structure is fully intact. Standard re-indexing will apply.</span>
            </div>
          ` : anomalies.map((a, idx) => `
            <div style="padding: 8px 10px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.18); border-radius: 8px; font-size: 11.5px; color: #ef4444; line-height: 1.4; display: flex; align-items: flex-start; gap: 6px;">
              <span style="font-weight: 700; flex-shrink: 0;">#${idx + 1}</span>
              <span>${a}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Multi-tier Repair Pipeline Checklist -->
      <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 16px;">
        <label class="workflow-options-label" style="margin-bottom: 8px; font-size: 11px;">Automatic Recovery Pipeline</label>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; color: var(--text-muted);">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Tier 1: Header signature alignment & offset strip</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Tier 2: Trailer reconstruction & %%EOF resurrection</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Tier 3: Xref table & indirect object resync</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Tier 4: Orphan page recovery & Pages tree rebuild</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Tier 5: FontDescriptor injection & clean serialization</span>
          </div>
        </div>
      </div>

      <!-- Download Diagnostic Log Button -->
      <button type="button" class="btn btn-xs btn-outline" id="btn-download-diagnostic-log" style="width: 100%; justify-content: center; gap: 6px; font-weight: 600; padding: 7px 10px;">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
        <span>Download Diagnostic Log (.txt)</span>
      </button>
    </div>
  `;
}

export function bindRepairDiagnosticEvents(manager) {
  const container = manager.container;
  if (!container) return;

  const downloadLogBtn = container.querySelector('#btn-download-diagnostic-log');
  if (downloadLogBtn) {
    downloadLogBtn.onclick = () => {
      const file = manager.uploadedFiles[0];
      const diag = manager.repairDiagnostic || (file?.bytes ? PageOperations.diagnosePdf(file.bytes) : null);
      if (!diag) {
        Toast.info('No diagnostic data available.');
        return;
      }

      const logText = [
        `=============================================================`,
        `LETS_EDIT PDF STRUCTURAL DIAGNOSTIC & REPAIR AUDIT REPORT`,
        `=============================================================`,
        `Timestamp:           ${new Date().toISOString()}`,
        `Filename:            ${file?.name || 'document.pdf'}`,
        `File Size:           ${file?.size || file?.bytes?.byteLength || 0} bytes`,
        `Health Score:        ${diag.healthScore} / 100`,
        `PDF Specification:   ${diag.pdfVersion}`,
        `Header Offset:       ${diag.headerOffset >= 0 ? `${diag.headerOffset} bytes` : 'Missing'}`,
        `Has %%EOF:           ${diag.hasEof ? 'Yes' : 'No (Truncated)'}`,
        `Has startxref:       ${diag.hasStartxref ? 'Yes' : 'No'}`,
        `Discovered Objects:  ${diag.objectCount}`,
        `Estimated Pages:     ${diag.estimatedPages}`,
        `Embedded Fonts:      ${diag.fontCount}`,
        `=============================================================`,
        `DETECTED ANOMALIES (${diag.anomalies.length}):`,
        ...(diag.anomalies.length === 0 ? ['  None (Document structure is healthy)'] : diag.anomalies.map((a, i) => `  ${i + 1}. ${a}`)),
        `=============================================================`,
        `RECOMMENDED RECOVERY PLAN:`,
        `  ${diag.recipe}`,
        `=============================================================`
      ].join('\n');

      const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, `${(file?.name || 'document').replace(/\.[^/.]+$/, '')}_diagnostic_report.txt`);
      Toast.success('Diagnostic report downloaded!');
    };
  }
}
