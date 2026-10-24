/**
 * Workspace Document Sanitization & Hidden Information Cleaner HUD Sub-Module
 * Reverse-engineered from Adobe Acrobat Pro ("Remove Hidden Information" / "Sanitize Document")
 * and iLovePDF/Sejda document privacy specifications.
 * Modular sub-component keeping workspace-options.js safely < 1,000 lines.
 */

import { SanitizeOps } from '../../core/engine/operations/sanitize-ops.js';
import { Toast } from '../toast.js';

export function renderSanitizeOptionsHtml(instance) {
  const inspection = instance.sanitizeInspection || null;
  const options = instance.sanitizeOptions || {
    purgeMetadata: true,
    purgeEmbeddedFiles: true,
    purgeScripts: true,
    purgeAnnotations: true,
    purgePrivateData: true,
    flattenForms: true
  };

  const riskLevel = inspection ? inspection.riskLevel : 'clean';
  const totalThreats = inspection ? inspection.findings.totalThreats : 0;

  const riskBadgeStyle = riskLevel === 'high'
    ? 'background:rgba(239, 68, 68, 0.2); color:#fca5a5; border:1px solid rgba(239, 68, 68, 0.4);'
    : riskLevel === 'moderate'
    ? 'background:rgba(245, 158, 11, 0.2); color:#fde68a; border:1px solid rgba(245, 158, 11, 0.4);'
    : 'background:rgba(16, 185, 129, 0.2); color:#a7f3d0; border:1px solid rgba(16, 185, 129, 0.4);';

  const riskBadgeText = riskLevel === 'high'
    ? '🔴 High Privacy Risk Detected'
    : riskLevel === 'moderate'
    ? '🟡 Moderate Privacy Risk'
    : inspection ? '🟢 Document Appears Clean' : '🔍 Inspection Ready';

  return `
    <div class="sanitize-workspace-panel" style="display:flex; flex-direction:column; gap:16px;">
      <!-- Technical Summary Header / Acrobat Sanitize Document -->
      <div style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🛡️</span>
            <span style="font-weight:700; font-size:14px; color:#f8fafc; letter-spacing:0.02em;">Adobe Acrobat Document Sanitization Suite</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(239, 68, 68, 0.15); color:#fca5a5; border:1px solid rgba(239, 68, 68, 0.3);">
              Anti-Forensics & Privacy
            </span>
            <button id="sn-btn-load-sample" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Load sample document containing hidden metadata, tracking scripts & private PieceInfo">
              <span>🎲</span> Sample
            </button>
          </div>
        </div>

        <div style="font-size:12px; color:#94a3b8; line-height:1.5; margin-bottom:12px;">
          Permanently remove sensitive hidden information, invisible tracking markers, embedded file payloads, private application design data, and executable JavaScript actions before distributing your document.
        </div>

        <!-- 1-Click Quick Action -->
        <div style="display:flex; gap:8px; align-items:center;">
          <button id="sn-btn-quick-clean" type="button" style="flex:1; background:linear-gradient(135deg, #4f46e5, #06b6d4); color:#fff; font-size:12px; font-weight:700; padding:8px 14px; border-radius:8px; border:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 4px 12px rgba(79, 70, 229, 0.3);">
            <span>⚡</span> 1-Click Full Sanitize (Recommended)
          </button>
          <button id="sn-btn-reinspect" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:12px; padding:8px 12px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Scan document again for hidden vectors">
            <span>🔄</span> Scan
          </button>
        </div>
      </div>

      <!-- Threat & Exposure Inspection Status Card -->
      <div style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <span style="font-size:12px; font-weight:700; color:#e2e8f0; text-transform:uppercase; letter-spacing:0.04em;">Hidden Information Scan</span>
          <span style="font-size:11px; font-weight:700; padding:2px 10px; border-radius:12px; ${riskBadgeStyle}">
            ${riskBadgeText}
          </span>
        </div>

        ${inspection ? `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; margin-top:4px;">
            <div style="background:rgba(30, 41, 59, 0.5); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
              <div style="font-size:10px; color:#94a3b8;">Metadata & XMP</div>
              <div style="font-size:13px; font-weight:700; color:${inspection.findings.metadata || inspection.findings.xmpStream ? '#fca5a5' : '#a7f3d0'};">
                ${inspection.findings.metadata || inspection.findings.xmpStream ? 'Detected ⚠️' : 'None'}
              </div>
            </div>
            <div style="background:rgba(30, 41, 59, 0.5); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
              <div style="font-size:10px; color:#94a3b8;">Embedded Files</div>
              <div style="font-size:13px; font-weight:700; color:${inspection.findings.embeddedFiles > 0 ? '#fca5a5' : '#a7f3d0'};">
                ${inspection.findings.embeddedFiles > 0 ? `${inspection.findings.embeddedFiles} Found ⚠️` : '0 Attached'}
              </div>
            </div>
            <div style="background:rgba(30, 41, 59, 0.5); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
              <div style="font-size:10px; color:#94a3b8;">JS / OpenActions</div>
              <div style="font-size:13px; font-weight:700; color:${inspection.findings.javaScriptActions > 0 || inspection.findings.openActions ? '#fca5a5' : '#a7f3d0'};">
                ${inspection.findings.javaScriptActions > 0 || inspection.findings.openActions ? 'Active Scripts ⚠️' : '0 Scripts'}
              </div>
            </div>
            <div style="background:rgba(30, 41, 59, 0.5); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
              <div style="font-size:10px; color:#94a3b8;">Annotations / Notes</div>
              <div style="font-size:13px; font-weight:700; color:${inspection.findings.annotations > 0 ? '#fde68a' : '#a7f3d0'};">
                ${inspection.findings.annotations > 0 ? `${inspection.findings.annotations} Item(s)` : '0 Found'}
              </div>
            </div>
            <div style="background:rgba(30, 41, 59, 0.5); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
              <div style="font-size:10px; color:#94a3b8;">Private App Data</div>
              <div style="font-size:13px; font-weight:700; color:${inspection.findings.privateData ? '#fca5a5' : '#a7f3d0'};">
                ${inspection.findings.privateData ? '/PieceInfo Found ⚠️' : 'None'}
              </div>
            </div>
            <div style="background:rgba(30, 41, 59, 0.5); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
              <div style="font-size:10px; color:#94a3b8;">Form Fields</div>
              <div style="font-size:13px; font-weight:700; color:${inspection.findings.formFields > 0 ? '#cbd5e1' : '#a7f3d0'};">
                ${inspection.findings.formFields > 0 ? `${inspection.findings.formFields} Interactive` : '0 Fields'}
              </div>
            </div>
          </div>
        ` : `
          <div style="font-size:11px; color:#94a3b8; padding:8px 0;">
            Click <strong>Scan</strong> or upload a document to run a forensic sweep across Info dictionaries, XMP metadata streams, and Name trees.
          </div>
        `}
      </div>

      <!-- Granular Purge Controls -->
      <div style="display:flex; flex-direction:column; gap:10px;">
        <span style="font-size:12px; font-weight:700; color:#e2e8f0; text-transform:uppercase; letter-spacing:0.04em;">
          Sanitization Options
        </span>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <!-- 1. Metadata -->
          <label style="display:flex; align-items:flex-start; gap:10px; background:rgba(30, 41, 59, 0.4); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;">
            <input type="checkbox" id="sn-opt-metadata" ${options.purgeMetadata ? 'checked' : ''} style="margin-top:2px; accent-color:#6366f1;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:12px; font-weight:600; color:#f1f5f9;">Purge Document Info & Adobe XMP Metadata</span>
              <span style="font-size:11px; color:#94a3b8;">Clears Title, Author, Subject, Keywords, Creator, and raw XML metadata packets.</span>
            </div>
          </label>

          <!-- 2. Embedded Files -->
          <label style="display:flex; align-items:flex-start; gap:10px; background:rgba(30, 41, 59, 0.4); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;">
            <input type="checkbox" id="sn-opt-attachments" ${options.purgeEmbeddedFiles ? 'checked' : ''} style="margin-top:2px; accent-color:#6366f1;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:12px; font-weight:600; color:#f1f5f9;">Purge Embedded File Attachments & Name Trees</span>
              <span style="font-size:11px; color:#94a3b8;">Removes attached spreadsheets, files, and catalog /EmbeddedFiles dictionary references.</span>
            </div>
          </label>

          <!-- 3. JavaScript & OpenActions -->
          <label style="display:flex; align-items:flex-start; gap:10px; background:rgba(30, 41, 59, 0.4); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;">
            <input type="checkbox" id="sn-opt-scripts" ${options.purgeScripts ? 'checked' : ''} style="margin-top:2px; accent-color:#6366f1;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:12px; font-weight:600; color:#f1f5f9;">Purge JavaScript Actions, OpenActions & Triggers</span>
              <span style="font-size:11px; color:#94a3b8;">Eliminates auto-executing scripts, /OpenAction triggers, and catalog /AA handlers.</span>
            </div>
          </label>

          <!-- 4. Annotations & Popups -->
          <label style="display:flex; align-items:flex-start; gap:10px; background:rgba(30, 41, 59, 0.4); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;">
            <input type="checkbox" id="sn-opt-annots" ${options.purgeAnnotations ? 'checked' : ''} style="margin-top:2px; accent-color:#6366f1;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:12px; font-weight:600; color:#f1f5f9;">Purge Annotations, Comments & Sticky Notes</span>
              <span style="font-size:11px; color:#94a3b8;">Removes review popups, sticky notes, highlights, and unprinted page markups.</span>
            </div>
          </label>

          <!-- 5. Private Application Data -->
          <label style="display:flex; align-items:flex-start; gap:10px; background:rgba(30, 41, 59, 0.4); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;">
            <input type="checkbox" id="sn-opt-private" ${options.purgePrivateData ? 'checked' : ''} style="margin-top:2px; accent-color:#6366f1;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:12px; font-weight:600; color:#f1f5f9;">Purge Private App Data (/PieceInfo) & Hidden Layers</span>
              <span style="font-size:11px; color:#94a3b8;">Strips Illustrator/Photoshop/InDesign private data and optional content groups.</span>
            </div>
          </label>

          <!-- 6. Flatten Form Fields -->
          <label style="display:flex; align-items:flex-start; gap:10px; background:rgba(30, 41, 59, 0.4); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;">
            <input type="checkbox" id="sn-opt-forms" ${options.flattenForms ? 'checked' : ''} style="margin-top:2px; accent-color:#6366f1;">
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:12px; font-weight:600; color:#f1f5f9;">Flatten Interactive Form Fields into Permanent Text</span>
              <span style="font-size:11px; color:#94a3b8;">Converts filled forms into read-only vector artwork so values cannot be edited.</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Adobe Acrobat Pro Engine Note -->
      <div style="font-size:11px; color:#64748b; line-height:1.4; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
        💡 <strong>Orphaned Object Purge:</strong> When saving, LetsEdit rebuilds the cross-reference table using object streams (<code>useObjectStreams: true</code>), permanently purging unreferenced indirect objects and old revisions.
      </div>
    </div>
  `;
}

export function bindSanitizeEvents(manager) {
  if (!manager) return;

  // Initialize sanitizeOptions if not present
  if (!manager.sanitizeOptions) {
    manager.sanitizeOptions = {
      purgeMetadata: true,
      purgeEmbeddedFiles: true,
      purgeScripts: true,
      purgeAnnotations: true,
      purgePrivateData: true,
      flattenForms: true
    };
  }

  // 1. Checkbox listeners
  const optMetadata = document.getElementById('sn-opt-metadata');
  if (optMetadata) {
    optMetadata.onchange = (e) => {
      manager.sanitizeOptions.purgeMetadata = e.target.checked;
    };
  }

  const optAttachments = document.getElementById('sn-opt-attachments');
  if (optAttachments) {
    optAttachments.onchange = (e) => {
      manager.sanitizeOptions.purgeEmbeddedFiles = e.target.checked;
    };
  }

  const optScripts = document.getElementById('sn-opt-scripts');
  if (optScripts) {
    optScripts.onchange = (e) => {
      manager.sanitizeOptions.purgeScripts = e.target.checked;
    };
  }

  const optAnnots = document.getElementById('sn-opt-annots');
  if (optAnnots) {
    optAnnots.onchange = (e) => {
      manager.sanitizeOptions.purgeAnnotations = e.target.checked;
    };
  }

  const optPrivate = document.getElementById('sn-opt-private');
  if (optPrivate) {
    optPrivate.onchange = (e) => {
      manager.sanitizeOptions.purgePrivateData = e.target.checked;
    };
  }

  const optForms = document.getElementById('sn-opt-forms');
  if (optForms) {
    optForms.onchange = (e) => {
      manager.sanitizeOptions.flattenForms = e.target.checked;
    };
  }

  // 2. Load Sample Exposed Document
  const btnSample = document.getElementById('sn-btn-load-sample');
  if (btnSample) {
    btnSample.onclick = async () => {
      try {
        btnSample.disabled = true;
        btnSample.innerText = 'Loading...';
        Toast.info('Generating sample exposed document...');
        const sampleBytes = await SanitizeOps.createSampleExposedPdf();
        const file = new File([sampleBytes], 'sample_exposed_document.pdf', { type: 'application/pdf' });
        await manager.setFiles([file]);
        await runSanitizeScan(manager);
        Toast.success('Sample document loaded with hidden metadata and tracking script.');
      } catch (err) {
        console.error('Failed to load sample document:', err);
        Toast.error(`Could not load sample: ${err.message}`);
      } finally {
        btnSample.disabled = false;
        btnSample.innerHTML = '<span>🎲</span> Sample';
      }
    };
  }

  // 3. Scan / Re-inspect Button
  const btnScan = document.getElementById('sn-btn-reinspect');
  if (btnScan) {
    btnScan.onclick = async () => {
      await runSanitizeScan(manager);
    };
  }

  // 4. Quick Clean Button
  const btnQuick = document.getElementById('sn-btn-quick-clean');
  if (btnQuick) {
    btnQuick.onclick = async () => {
      // Check all options
      manager.sanitizeOptions = {
        purgeMetadata: true,
        purgeEmbeddedFiles: true,
        purgeScripts: true,
        purgeAnnotations: true,
        purgePrivateData: true,
        flattenForms: true
      };
      // Trigger execution directly via action button if available
      const actionBtn = document.getElementById('workflow-execute-btn');
      if (actionBtn) {
        actionBtn.click();
      } else if (typeof manager.executeActiveTool === 'function') {
        await manager.executeActiveTool();
      }
    };
  }

  // Automatically run scan if file is already loaded and not yet scanned
  if (manager.uploadedFiles && manager.uploadedFiles.length > 0 && !manager.sanitizeInspection) {
    runSanitizeScan(manager);
  }
}

async function runSanitizeScan(manager) {
  try {
    if (!manager.uploadedFiles || manager.uploadedFiles.length === 0) return;
    const fileObj = manager.uploadedFiles[0];
    const bytes = fileObj.bytes || (fileObj.file ? new Uint8Array(await fileObj.file.arrayBuffer()) : null);
    if (!bytes) return;

    const inspection = await SanitizeOps.inspectHiddenData(bytes);
    manager.sanitizeInspection = inspection;

    // Refresh options panel if still active
    if (manager.activeTool && (manager.activeTool.id === 'sanitize' || manager.activeTool.id === 'sanitize-pdf')) {
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    }
  } catch (err) {
    console.warn('Document sanitization scan error:', err);
  }
}
