/**
 * Adobe Acrobat Pro & iLovePDF Document Flattening Workspace Options
 * Interactive HUD for selecting flatten mode (all, forms, annotations),
 * live AcroForm field inspection, XFA cleanup, and sample testing.
 */

import { PageOperations } from '../../core/engine/page-ops.js';

export function renderFlattenOptionsHtml(instance) {
  const mode = instance.flattenMode || 'all';
  const stripXFA = instance.flattenStripXFA !== false;
  const cleanNeedAppearances = instance.flattenCleanNeedAppearances !== false;
  const inspection = instance.flattenInspection || null;

  return `
    <div class="flatten-options-pane" style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Hero Banner -->
      <div style="background: rgba(13, 148, 136, 0.06); border: 1px solid rgba(13, 148, 136, 0.2); border-radius: 10px; padding: 12px 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 6px; background: #0d9488; color: white; display: flex; align-items: center; justify-content: center;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <span style="font-weight: 700; font-size: 13px; color: #0f766e;">AcroForm & Vector Baker</span>
          </div>
          <span style="font-size: 10px; font-weight: 700; color: #0d9488; background: rgba(13, 148, 136, 0.12); padding: 2px 7px; border-radius: 10px;">
            ISO 32000-1 Read-Only
          </span>
        </div>
        <p style="font-size: 11px; color: var(--text-muted); margin: 0; line-height: 1.45;">
          Permanently burns interactive fillable form fields and markup annotations directly into underlying vector content streams, ensuring universal rendering across all devices.
        </p>
      </div>

      <!-- Live Inspection Badge -->
      <div id="flatten-inspection-badge-container" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px;">Document Form Audit</span>
          <span id="flatten-status-indicator" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; ${inspection?.hasAcroForm ? 'background: rgba(16, 185, 129, 0.12); color: #059669;' : 'background: rgba(100, 116, 139, 0.1); color: #64748b;'}">
            ${inspection ? (inspection.hasAcroForm ? `● ${inspection.fieldCount} AcroForm Fields Detected` : '● Ready to Inspect') : '● Ready to Inspect'}
          </span>
        </div>
        <div id="flatten-inspection-summary" style="font-size: 11.5px; color: var(--text-muted); line-height: 1.5;">
          ${inspection ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px;">
              <div style="background: rgba(13, 148, 136, 0.05); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(13, 148, 136, 0.15);">
                <div style="font-size: 10px; color: #0d9488; font-weight: 600;">FORM FIELDS</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f766e;">${inspection.fieldCount}</div>
                <div style="font-size: 10px; color: #64748b;">${inspection.fieldTypes?.text || 0} text, ${inspection.fieldTypes?.checkbox || 0} cb, ${inspection.fieldTypes?.dropdown || 0} drop</div>
              </div>
              <div style="background: rgba(100, 116, 139, 0.05); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(100, 116, 139, 0.15);">
                <div style="font-size: 10px; color: #64748b; font-weight: 600;">ANNOTATIONS</div>
                <div style="font-size: 13px; font-weight: 700; color: #334155;">${inspection.annotCount}</div>
                <div style="font-size: 10px; color: #64748b;">${inspection.annotTypes?.stamp || 0} stamps, ${inspection.annotTypes?.highlight || 0} markups</div>
              </div>
            </div>
          ` : `
            Click "Analyze Document" or load the interactive sample to detect fillable fields.
          `}
        </div>
      </div>

      <!-- Flatten Mode Cards -->
      <div>
        <label style="display: block; font-size: 11.5px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
          FLATTEN SCOPE & MODE
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 8px; border: 1.5px solid ${mode === 'all' ? '#0d9488' : 'var(--border-subtle)'}; background: ${mode === 'all' ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-surface)'}; cursor: pointer; transition: all 0.15s ease;">
            <input type="radio" name="flatten-mode-radio" value="all" ${mode === 'all' ? 'checked' : ''} style="margin-top: 3px; accent-color: #0d9488;" />
            <div>
              <div style="font-weight: 700; font-size: 12px; color: var(--text-main);">Flatten Entire Document (Recommended)</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Bakes both AcroForm interactive form fields and all annotations into permanent vector content.</div>
            </div>
          </label>

          <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 8px; border: 1.5px solid ${mode === 'forms' ? '#0d9488' : 'var(--border-subtle)'}; background: ${mode === 'forms' ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-surface)'}; cursor: pointer; transition: all 0.15s ease;">
            <input type="radio" name="flatten-mode-radio" value="forms" ${mode === 'forms' ? 'checked' : ''} style="margin-top: 3px; accent-color: #0d9488;" />
            <div>
              <div style="font-weight: 700; font-size: 12px; color: var(--text-main);">Flatten Form Fields Only</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Renders fillable inputs as static text while preserving interactive comments, markups, and stamps.</div>
            </div>
          </label>

          <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 8px; border: 1.5px solid ${mode === 'annotations' ? '#0d9488' : 'var(--border-subtle)'}; background: ${mode === 'annotations' ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-surface)'}; cursor: pointer; transition: all 0.15s ease;">
            <input type="radio" name="flatten-mode-radio" value="annotations" ${mode === 'annotations' ? 'checked' : ''} style="margin-top: 3px; accent-color: #0d9488;" />
            <div>
              <div style="font-weight: 700; font-size: 12px; color: var(--text-main);">Flatten Annotations Only</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Removes/flattens interactive annotations while leaving fillable AcroForm fields editable.</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Advanced Options -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px;">
        <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; text-transform: uppercase;">
          Standards & Hygiene
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11.5px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="chk-flatten-strip-xfa" ${stripXFA ? 'checked' : ''} style="accent-color: #0d9488;" />
            <span>Purge Deprecated Adobe XFA XML Packets</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="chk-flatten-clean-na" ${cleanNeedAppearances ? 'checked' : ''} style="accent-color: #0d9488;" />
            <span>Clear /NeedAppearances Catalog Flag</span>
          </label>
        </div>
      </div>

      <!-- Sample Loader Button -->
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn btn-sm btn-outline" id="btn-flatten-load-sample" style="flex: 1; border-color: rgba(13, 148, 136, 0.35); color: #0d9488; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          <span>Load Fillable Form Sample</span>
        </button>
      </div>
    </div>
  `;
}

export function bindFlattenEvents(manager) {
  const container = manager.container;
  if (!container) return;

  // Initialize manager state
  if (!manager.flattenMode) manager.flattenMode = 'all';
  if (manager.flattenStripXFA === undefined) manager.flattenStripXFA = true;
  if (manager.flattenCleanNeedAppearances === undefined) manager.flattenCleanNeedAppearances = true;

  // Auto-inspect first uploaded file if not yet inspected
  const primaryFile = manager.uploadedFiles?.[0];
  if (primaryFile?.bytes && !manager.flattenInspection) {
    PageOperations.inspectFlattenTargets(primaryFile.bytes).then((info) => {
      manager.flattenInspection = info;
      const indicator = container.querySelector('#flatten-status-indicator');
      const summary = container.querySelector('#flatten-inspection-summary');
      if (indicator && summary) {
        indicator.textContent = info.hasAcroForm ? `● ${info.fieldCount} AcroForm Fields Detected` : '● Static Document (0 fields)';
        indicator.style.background = info.hasAcroForm ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)';
        indicator.style.color = info.hasAcroForm ? '#059669' : '#64748b';

        summary.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px;">
            <div style="background: rgba(13, 148, 136, 0.05); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(13, 148, 136, 0.15);">
              <div style="font-size: 10px; color: #0d9488; font-weight: 600;">FORM FIELDS</div>
              <div style="font-size: 13px; font-weight: 700; color: #0f766e;">${info.fieldCount}</div>
              <div style="font-size: 10px; color: #64748b;">${info.fieldTypes?.text || 0} text, ${info.fieldTypes?.checkbox || 0} cb, ${info.fieldTypes?.dropdown || 0} drop</div>
            </div>
            <div style="background: rgba(100, 116, 139, 0.05); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(100, 116, 139, 0.15);">
              <div style="font-size: 10px; color: #64748b; font-weight: 600;">ANNOTATIONS</div>
              <div style="font-size: 13px; font-weight: 700; color: #334155;">${info.annotCount}</div>
              <div style="font-size: 10px; color: #64748b;">${info.annotTypes?.stamp || 0} stamps, ${info.annotTypes?.highlight || 0} markups</div>
            </div>
          </div>
        `;
      }
    }).catch(() => {});
  }

  // Radio mode changes
  const radios = container.querySelectorAll('input[name="flatten-mode-radio"]');
  radios.forEach((r) => {
    r.addEventListener('change', (e) => {
      manager.flattenMode = e.target.value;
      manager.renderOptions();
    });
  });

  // Checkbox options
  const xfaChk = container.querySelector('#chk-flatten-strip-xfa');
  if (xfaChk) {
    xfaChk.addEventListener('change', (e) => {
      manager.flattenStripXFA = e.target.checked;
    });
  }

  const naChk = container.querySelector('#chk-flatten-clean-na');
  if (naChk) {
    naChk.addEventListener('change', (e) => {
      manager.flattenCleanNeedAppearances = e.target.checked;
    });
  }

  // Sample loader button
  const sampleBtn = container.querySelector('#btn-flatten-load-sample');
  if (sampleBtn) {
    sampleBtn.addEventListener('click', async () => {
      sampleBtn.disabled = true;
      sampleBtn.textContent = 'Generating Form Sample...';
      try {
        const sampleBytes = await PageOperations.createSampleFlattenPdf();
        const sampleFile = new File([sampleBytes], 'Sample_Corporate_NDA_Form.pdf', { type: 'application/pdf' });
        manager.uploadedFiles = [{
          file: sampleFile,
          name: sampleFile.name,
          size: sampleBytes.byteLength,
          bytes: sampleBytes,
          pageCount: 3,
          rotation: 0
        }];
        manager.flattenInspection = await PageOperations.inspectFlattenTargets(sampleBytes);
        manager.render();
      } catch (err) {
        console.error('Error generating sample form:', err);
        sampleBtn.disabled = false;
        sampleBtn.textContent = 'Load Fillable Form Sample';
      }
    });
  }
}
