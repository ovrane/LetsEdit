/**
 * Workspace PDF Metadata & Adobe XMP Options HUD Sub-Module
 * Reverse-engineered from Adobe Acrobat Pro Document Properties & Sejda Metadata Editor.
 * Modular sub-component keeping workspace-options.js safely < 1,000 lines.
 */

import { MetadataOps } from '../../core/engine/operations/metadata-ops.js';

export function renderMetadataOptionsHtml(instance) {
  const meta = instance.documentMetadata || {};
  const stats = meta.stats || {};
  const info = meta.info || {};
  const hasXmp = !!meta.hasXmp;

  return `
    <div class="metadata-workspace-panel" style="display:flex; flex-direction:column; gap:16px;">
      <!-- Technical Summary Header / Acrobat Document Properties -->
      <div style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🏷️</span>
            <span style="font-weight:700; font-size:14px; color:#f8fafc; letter-spacing:0.02em;">Adobe Acrobat Document Properties & XMP</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:${hasXmp ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)'}; color:${hasXmp ? '#4ade80' : '#facc15'}; border:1px solid ${hasXmp ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'};">
              ${hasXmp ? '✓ ISO 16684-1 XMP Synced' : 'ℹ️ Standard Info Dict'}
            </span>
            <button id="meta-btn-load-sample" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Load pre-filled document with complete metadata & XMP packet">
              <span>🎲</span> Sample
            </button>
          </div>
        </div>

        <!-- Document Badges -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; font-size:11px; color:#94a3b8;">
          <div style="background:rgba(0,0,0,0.25); padding:8px; border-radius:8px;">
            <div style="color:#64748b; font-size:10px; text-transform:uppercase;">Pages</div>
            <div style="font-weight:600; color:#e2e8f0; font-size:13px;" id="meta-stat-pages">${stats.pageCount || '—'}</div>
          </div>
          <div style="background:rgba(0,0,0,0.25); padding:8px; border-radius:8px;">
            <div style="color:#64748b; font-size:10px; text-transform:uppercase;">Size</div>
            <div style="font-weight:600; color:#e2e8f0; font-size:13px;" id="meta-stat-size">${stats.fileSizeBytes ? (stats.fileSizeBytes / 1024).toFixed(1) + ' KB' : '—'}</div>
          </div>
          <div style="background:rgba(0,0,0,0.25); padding:8px; border-radius:8px;">
            <div style="color:#64748b; font-size:10px; text-transform:uppercase;">PDF Spec</div>
            <div style="font-weight:600; color:#e2e8f0; font-size:13px;" id="meta-stat-version">${stats.pdfVersion || 'v1.7'}</div>
          </div>
          <div style="background:rgba(0,0,0,0.25); padding:8px; border-radius:8px;">
            <div style="color:#64748b; font-size:10px; text-transform:uppercase;">Security</div>
            <div style="font-weight:600; color:#e2e8f0; font-size:13px;" id="meta-stat-security">${stats.isEncrypted ? '🔒 Password Protected' : '🔓 Unencrypted'}</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Utilities -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:12px; color:#cbd5e1; font-weight:500;">Quick Privacy & Audit Tools:</span>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="meta-btn-strip-all" type="button" style="background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.3); color:#fca5a5; font-size:11px; padding:4px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" title="Permanently strip all author tags, tracking markers, and metadata for full privacy">
            <span>🛡️</span> 1-Click Privacy Strip
          </button>
          <button id="meta-btn-export-xmp" type="button" style="background:rgba(99, 102, 241, 0.15); border:1px solid rgba(99, 102, 241, 0.3); color:#a5b4fc; font-size:11px; padding:4px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" title="Export standard Adobe .xmp sidecar packet">
            <span>📄</span> Export .XMP
          </button>
          <button id="meta-btn-export-json" type="button" style="background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.3); color:#6ee7b7; font-size:11px; padding:4px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" title="Export metadata schema as JSON">
            <span>📋</span> Export JSON
          </button>
        </div>
      </div>

      <!-- Form Inputs: Standard Dublin Core & Adobe Document Info -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
        <!-- Title -->
        <div style="grid-column:1 / -1;">
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:4px;">Document Title</label>
          <input id="meta-input-title" type="text" value="${escapeHtml(info.title || '')}" placeholder="e.g., Annual Financial Report 2026" style="width:100%; box-sizing:border-box; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.15); color:#f8fafc; border-radius:6px; padding:8px 12px; font-size:13px;" />
        </div>

        <!-- Author / Creator -->
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:4px;">Author / Creator</label>
          <input id="meta-input-author" type="text" value="${escapeHtml(info.author || '')}" placeholder="e.g., Jane Doe, Executive VP" style="width:100%; box-sizing:border-box; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.15); color:#f8fafc; border-radius:6px; padding:8px 12px; font-size:13px;" />
        </div>

        <!-- Subject -->
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:4px;">Subject / Topic</label>
          <input id="meta-input-subject" type="text" value="${escapeHtml(info.subject || '')}" placeholder="e.g., Fiscal Q4 Performance & Strategy" style="width:100%; box-sizing:border-box; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.15); color:#f8fafc; border-radius:6px; padding:8px 12px; font-size:13px;" />
        </div>

        <!-- Keywords -->
        <div style="grid-column:1 / -1;">
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:4px;">Keywords (Comma-separated)</label>
          <input id="meta-input-keywords" type="text" value="${escapeHtml(info.keywords || '')}" placeholder="e.g., audit, revenue, projections, confidential" style="width:100%; box-sizing:border-box; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.15); color:#f8fafc; border-radius:6px; padding:8px 12px; font-size:13px;" />
        </div>

        <!-- Application / Creator Tool -->
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:4px;">Application / Creator Tool</label>
          <input id="meta-input-creator" type="text" value="${escapeHtml(info.creator || 'LetsEdit PDF Studio')}" placeholder="e.g., Adobe InDesign 2026" style="width:100%; box-sizing:border-box; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.15); color:#f8fafc; border-radius:6px; padding:8px 12px; font-size:13px;" />
        </div>

        <!-- PDF Producer -->
        <div>
          <label style="display:block; font-size:12px; font-weight:600; color:#cbd5e1; margin-bottom:4px;">PDF Producer Engine</label>
          <input id="meta-input-producer" type="text" value="${escapeHtml(info.producer || 'LetsEdit Pro PDF Engine')}" placeholder="e.g., Adobe PDF Library 17.0" style="width:100%; box-sizing:border-box; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.15); color:#f8fafc; border-radius:6px; padding:8px 12px; font-size:13px;" />
        </div>
      </div>

      <!-- Sync Options & Timestamps -->
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#e2e8f0; cursor:pointer;">
          <input type="checkbox" id="meta-chk-sync-xmp" checked style="accent-color:#6366f1;" />
          <span>Synchronize Adobe XMP stream (ISO 16684-1 standard Dublin Core & PDF Schemas)</span>
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#e2e8f0; cursor:pointer;">
          <input type="checkbox" id="meta-chk-update-modtime" checked style="accent-color:#6366f1;" />
          <span>Update Document Modification Date (<code style="color:#94a3b8; font-size:11px;">/ModDate</code>) to Current Timestamp</span>
        </label>
      </div>

      <!-- Raw XMP Viewer Accordion -->
      <details style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 12px; cursor:pointer;">
        <summary style="font-size:12px; font-weight:600; color:#94a3b8; outline:none; user-select:none;">
          👁️ Raw XMP RDF Packet Stream Preview
        </summary>
        <div style="margin-top:10px; cursor:default;">
          <pre id="meta-raw-xmp" style="background:rgba(0,0,0,0.5); padding:10px; border-radius:6px; font-size:11px; color:#38bdf8; max-height:180px; overflow:auto; white-space:pre-wrap; word-break:break-all; font-family:monospace; margin:0;">${escapeHtml(meta.xmpPacket || '(No raw XMP packet present. One will be synthesized and injected upon saving)')}</pre>
        </div>
      </details>
    </div>
  `;
}

function escapeHtml(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function bindMetadataEvents(manager) {
  const container = document.querySelector('.metadata-workspace-panel');
  if (!container) return;

  // 1. 1-Click Privacy Strip
  const stripBtn = document.getElementById('meta-btn-strip-all');
  if (stripBtn) {
    stripBtn.addEventListener('click', async () => {
      const confirmed = window.confirm(
        'Are you sure you want to sanitize this document? All author names, application tags, keywords, and XMP streams will be cleared.'
      );
      if (!confirmed) return;

      document.getElementById('meta-input-title').value = '';
      document.getElementById('meta-input-author').value = '';
      document.getElementById('meta-input-subject').value = '';
      document.getElementById('meta-input-keywords').value = '';
      document.getElementById('meta-input-creator').value = '';
      document.getElementById('meta-input-producer').value = '';
      const rawXmp = document.getElementById('meta-raw-xmp');
      if (rawXmp) rawXmp.textContent = '(Metadata stripped - ready to sanitize on Apply)';
      manager.metadataPendingStrip = true;
    });
  }

  // 2. Load Sample Document
  const sampleBtn = document.getElementById('meta-btn-load-sample');
  if (sampleBtn) {
    sampleBtn.addEventListener('click', async () => {
      try {
        const sampleBytes = await MetadataOps.createSampleMetadataPdf();
        const inspection = await MetadataOps.inspectMetadata(sampleBytes);
        manager.currentPdfBytes = sampleBytes;
        manager.currentFileName = 'sample_metadata_document.pdf';
        manager.documentMetadata = inspection;
        manager.renderOptions();
      } catch (err) {
        console.error('Failed to load sample metadata PDF:', err);
      }
    });
  }

  // 3. Export .XMP packet sidecar
  const exportXmpBtn = document.getElementById('meta-btn-export-xmp');
  if (exportXmpBtn) {
    exportXmpBtn.addEventListener('click', () => {
      const title = document.getElementById('meta-input-title')?.value || '';
      const author = document.getElementById('meta-input-author')?.value || '';
      const subject = document.getElementById('meta-input-subject')?.value || '';
      const keywords = document.getElementById('meta-input-keywords')?.value || '';
      const creator = document.getElementById('meta-input-creator')?.value || '';
      const producer = document.getElementById('meta-input-producer')?.value || '';

      const xmpText = MetadataOps.generateXmpPacket({ title, author, subject, keywords, creator, producer });
      const blob = new Blob([xmpText], { type: 'application/rdf+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (manager.currentFileName ? manager.currentFileName.replace(/\.pdf$/i, '') : 'metadata') + '.xmp';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // 4. Export JSON
  const exportJsonBtn = document.getElementById('meta-btn-export-json');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const payload = {
        title: document.getElementById('meta-input-title')?.value || '',
        author: document.getElementById('meta-input-author')?.value || '',
        subject: document.getElementById('meta-input-subject')?.value || '',
        keywords: document.getElementById('meta-input-keywords')?.value || '',
        creator: document.getElementById('meta-input-creator')?.value || '',
        producer: document.getElementById('meta-input-producer')?.value || '',
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (manager.currentFileName ? manager.currentFileName.replace(/\.pdf$/i, '') : 'metadata') + '.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
