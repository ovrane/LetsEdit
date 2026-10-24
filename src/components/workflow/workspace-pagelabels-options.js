/**
 * Workspace PageLabels & Multi-Section Pagination HUD Sub-Module
 * Reverse-engineered from Adobe Acrobat Pro Multi-Section Page Labeling & ISO 32000-1 Clause 12.4.2.
 * Modular sub-component keeping workspace-options.js safely < 1,000 lines.
 */

import { PageLabelsOps, formatPageLabel } from '../../core/engine/operations/pagelabels-ops.js';
import { Toast } from '../toast.js';

export function renderPageLabelsOptionsHtml(instance) {
  const totalPages = instance.uploadedFiles[0]?.pageCount || 1;
  const sections = instance.pageLabelSections || [
    { fromPage: 1, toPage: Math.min(2, totalPages), style: 'r', prefix: '', startAt: 1 },
    { fromPage: Math.min(3, totalPages), toPage: totalPages, style: 'D', prefix: '', startAt: 1 }
  ];

  // Compute live label preview list
  const previewRows = [];
  let curSecIdx = 0;
  for (let p = 1; p <= totalPages; p++) {
    while (curSecIdx < sections.length - 1 && p >= (sections[curSecIdx + 1].fromPage || 1)) {
      curSecIdx++;
    }
    const sec = sections[curSecIdx] || { style: 'D', prefix: '', startAt: 1, fromPage: 1 };
    const offset = p - (sec.fromPage || 1);
    const label = formatPageLabel(sec.style, sec.prefix, sec.startAt, offset);
    previewRows.push({ page: p, label, secIndex: curSecIdx + 1 });
  }

  return `
    <div class="pagelabels-workspace-panel" style="display:flex; flex-direction:column; gap:16px;">
      <!-- Technical Summary Header / Acrobat Page Labels -->
      <div style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📑</span>
            <span style="font-weight:700; font-size:14px; color:#f8fafc; letter-spacing:0.02em;">Adobe Acrobat Multi-Section Page Labeling</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(99, 102, 241, 0.15); color:#a5b4fc; border:1px solid rgba(99, 102, 241, 0.3);">
              ISO 32000-1 /PageLabels
            </span>
            <button id="pl-btn-load-sample" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Load pre-built multi-section PDF (preface Roman + body Arabic)">
              <span>🎲</span> Sample
            </button>
          </div>
        </div>

        <div style="font-size:12px; color:#94a3b8; line-height:1.5;">
          Divide your document into logical sections with custom numbering schemes (e.g., Roman <em>i, ii</em> for preface, Arabic <em>1, 2, 3</em> for chapters, or <em>App. A-1</em> for appendices). Embedded directly into the PDF catalog for native Adobe Acrobat & browser page counter support.
        </div>
      </div>

      <!-- Sections List -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; font-weight:700; color:#e2e8f0; text-transform:uppercase; letter-spacing:0.04em;">Configured Document Sections (${sections.length})</span>
          <button id="pl-btn-add-section" type="button" style="background:rgba(99, 102, 241, 0.2); border:1px solid rgba(99, 102, 241, 0.4); color:#c7d2fe; font-size:11px; font-weight:600; padding:4px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            <span>+</span> Add Section
          </button>
        </div>

        <div id="pl-sections-container" style="display:flex; flex-direction:column; gap:10px;">
          ${sections.map((sec, idx) => `
            <div class="pl-section-card" data-sec-idx="${idx}" style="background:rgba(15, 23, 42, 0.7); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; font-size:12px; color:#e2e8f0;">Section ${idx + 1}</span>
                ${sections.length > 1 ? `
                  <button type="button" class="pl-btn-remove-sec" data-remove-idx="${idx}" style="background:none; border:none; color:#ef4444; font-size:14px; cursor:pointer; padding:0 4px;" title="Remove this section">&times;</button>
                ` : ''}
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div>
                  <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:2px;">From Page</label>
                  <input type="number" min="1" max="${totalPages}" value="${sec.fromPage}" class="pl-input-from" data-idx="${idx}" style="width:100%; box-sizing:border-box; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.12); color:#f8fafc; border-radius:4px; padding:5px 8px; font-size:12px;" />
                </div>
                <div>
                  <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:2px;">To Page</label>
                  <input type="number" min="1" max="${totalPages}" value="${sec.toPage}" class="pl-input-to" data-idx="${idx}" style="width:100%; box-sizing:border-box; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.12); color:#f8fafc; border-radius:4px; padding:5px 8px; font-size:12px;" />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1.2fr 1fr 0.8fr; gap:8px;">
                <div>
                  <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:2px;">Numbering Style</label>
                  <select class="pl-select-style" data-idx="${idx}" style="width:100%; box-sizing:border-box; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.12); color:#f8fafc; border-radius:4px; padding:5px 8px; font-size:12px;">
                    <option value="D" ${sec.style === 'D' ? 'selected' : ''}>Decimal: 1, 2, 3...</option>
                    <option value="r" ${sec.style === 'r' ? 'selected' : ''}>Roman (lower): i, ii, iii...</option>
                    <option value="R" ${sec.style === 'R' ? 'selected' : ''}>Roman (upper): I, II, III...</option>
                    <option value="a" ${sec.style === 'a' ? 'selected' : ''}>Letters (lower): a, b, c...</option>
                    <option value="A" ${sec.style === 'A' ? 'selected' : ''}>Letters (upper): A, B, C...</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:2px;">Prefix (Optional)</label>
                  <input type="text" value="${sec.prefix || ''}" placeholder="e.g., Sec. " class="pl-input-prefix" data-idx="${idx}" style="width:100%; box-sizing:border-box; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.12); color:#f8fafc; border-radius:4px; padding:5px 8px; font-size:12px;" />
                </div>
                <div>
                  <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:2px;">Start At</label>
                  <input type="number" min="1" value="${sec.startAt || 1}" class="pl-input-startat" data-idx="${idx}" style="width:100%; box-sizing:border-box; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.12); color:#f8fafc; border-radius:4px; padding:5px 8px; font-size:12px;" />
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Stamping & Synchronization Options -->
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#e2e8f0; cursor:pointer;">
          <input type="checkbox" id="pl-chk-stamp-visual" ${instance.pageLabelsStampVisual !== false ? 'checked' : ''} style="accent-color:#6366f1;" />
          <span>Stamp visual label text onto page headers/footers</span>
        </label>

        <div id="pl-stamp-options-wrap" style="display:${instance.pageLabelsStampVisual !== false ? 'flex' : 'none'}; flex-direction:column; gap:8px; margin-top:4px;">
          <label style="display:block; font-size:11px; color:#94a3b8;">Stamp Position</label>
          <select id="pl-select-position" style="width:100%; box-sizing:border-box; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.12); color:#f8fafc; border-radius:4px; padding:6px 10px; font-size:12px;">
            <option value="bottom-center" ${(!instance.pageLabelsPosition || instance.pageLabelsPosition === 'bottom-center') ? 'selected' : ''}>Bottom Center</option>
            <option value="bottom-right" ${instance.pageLabelsPosition === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
            <option value="bottom-left" ${instance.pageLabelsPosition === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
            <option value="top-center" ${instance.pageLabelsPosition === 'top-center' ? 'selected' : ''}>Top Center</option>
            <option value="top-right" ${instance.pageLabelsPosition === 'top-right' ? 'selected' : ''}>Top Right</option>
            <option value="top-left" ${instance.pageLabelsPosition === 'top-left' ? 'selected' : ''}>Top Left</option>
          </select>
        </div>
      </div>

      <!-- Live Page Mapping Summary Drawer -->
      <details style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 12px; cursor:pointer;">
        <summary style="font-size:12px; font-weight:600; color:#94a3b8; outline:none; user-select:none;">
          👁️ Live Computed Page Labels Mapping (${previewRows.length} pages)
        </summary>
        <div style="margin-top:10px; max-height:160px; overflow-y:auto; cursor:default;">
          <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:#64748b;">
                <th style="padding:4px 6px;">Page #</th>
                <th style="padding:4px 6px;">Section</th>
                <th style="padding:4px 6px;">Resulting Label</th>
              </tr>
            </thead>
            <tbody>
              ${previewRows.map(r => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:4px 6px; color:#94a3b8;">${r.page}</td>
                  <td style="padding:4px 6px; color:#cbd5e1;">Sec. ${r.secIndex}</td>
                  <td style="padding:4px 6px; font-weight:600; color:#38bdf8;">${r.label}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </details>

      <!-- Quick Action: Remove PageLabels -->
      <div style="display:flex; justify-content:flex-end;">
        <button id="pl-btn-remove-all" type="button" style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.25); color:#fca5a5; font-size:11px; padding:4px 10px; border-radius:6px; cursor:pointer;" title="Reverts to unsectioned 1-to-N numbering">
          Reset to Default Numbering
        </button>
      </div>
    </div>
  `;
}

export function bindPageLabelsEvents(manager) {
  const container = document.querySelector('.pagelabels-workspace-panel');
  if (!container) return;

  const totalPages = manager.uploadedFiles[0]?.pageCount || 1;

  if (!manager.pageLabelSections) {
    manager.pageLabelSections = [
      { fromPage: 1, toPage: Math.min(2, totalPages), style: 'r', prefix: '', startAt: 1 },
      { fromPage: Math.min(3, totalPages), toPage: totalPages, style: 'D', prefix: '', startAt: 1 }
    ];
  }

  // 1. Add Section
  const addBtn = document.getElementById('pl-btn-add-section');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const lastSec = manager.pageLabelSections[manager.pageLabelSections.length - 1];
      const fromPage = lastSec ? Math.min(totalPages, lastSec.toPage + 1) : 1;
      manager.pageLabelSections.push({
        fromPage,
        toPage: totalPages,
        style: 'D',
        prefix: '',
        startAt: 1
      });
      manager.renderOptions();
    });
  }

  // 2. Remove Section
  container.querySelectorAll('.pl-btn-remove-sec').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
      if (manager.pageLabelSections.length > 1) {
        manager.pageLabelSections.splice(idx, 1);
        manager.renderOptions();
      }
    });
  });

  // 3. Inputs sync
  container.querySelectorAll('.pl-input-from').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      if (manager.pageLabelSections[idx]) {
        manager.pageLabelSections[idx].fromPage = Math.max(1, parseInt(e.target.value, 10) || 1);
        manager.renderOptions();
      }
    });
  });

  container.querySelectorAll('.pl-input-to').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      if (manager.pageLabelSections[idx]) {
        manager.pageLabelSections[idx].toPage = Math.min(totalPages, parseInt(e.target.value, 10) || totalPages);
        manager.renderOptions();
      }
    });
  });

  container.querySelectorAll('.pl-select-style').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = parseInt(sel.getAttribute('data-idx'), 10);
      if (manager.pageLabelSections[idx]) {
        manager.pageLabelSections[idx].style = e.target.value;
        manager.renderOptions();
      }
    });
  });

  container.querySelectorAll('.pl-input-prefix').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      if (manager.pageLabelSections[idx]) {
        manager.pageLabelSections[idx].prefix = e.target.value;
      }
    });
  });

  container.querySelectorAll('.pl-input-startat').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      if (manager.pageLabelSections[idx]) {
        manager.pageLabelSections[idx].startAt = Math.max(1, parseInt(e.target.value, 10) || 1);
        manager.renderOptions();
      }
    });
  });

  // 4. Stamping visual toggle & position
  const stampChk = document.getElementById('pl-chk-stamp-visual');
  const stampWrap = document.getElementById('pl-stamp-options-wrap');
  if (stampChk) {
    stampChk.addEventListener('change', (e) => {
      manager.pageLabelsStampVisual = e.target.checked;
      if (stampWrap) stampWrap.style.display = e.target.checked ? 'flex' : 'none';
    });
  }

  const posSel = document.getElementById('pl-select-position');
  if (posSel) {
    posSel.addEventListener('change', (e) => {
      manager.pageLabelsPosition = e.target.value;
    });
  }

  // 5. Sample Document Load
  const sampleBtn = document.getElementById('pl-btn-load-sample');
  if (sampleBtn) {
    sampleBtn.addEventListener('click', async () => {
      try {
        Toast.info('Loading multi-section sample document...');
        const sampleBytes = await PageLabelsOps.createSamplePageLabelsPdf();
        const inspection = await PageLabelsOps.inspectPageLabels(sampleBytes);
        manager.currentPdfBytes = sampleBytes;
        manager.currentFileName = 'sample_pagelabels_document.pdf';
        manager.pageLabelSections = inspection.sections || [];
        manager.pageLabelsInspection = inspection;
        manager.render();
      } catch (err) {
        console.error('Failed to load sample page labels document:', err);
      }
    });
  }

  // 6. Reset to default numbering
  const removeAllBtn = document.getElementById('pl-btn-remove-all');
  if (removeAllBtn) {
    removeAllBtn.addEventListener('click', () => {
      manager.pageLabelSections = [
        { fromPage: 1, toPage: totalPages, style: 'D', prefix: '', startAt: 1 }
      ];
      manager.pageLabelsPendingRemove = true;
      manager.renderOptions();
      Toast.info('Configured reset to standard 1-to-N numbering on execute');
    });
  }
}
