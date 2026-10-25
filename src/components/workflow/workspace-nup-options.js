/**
 * Workspace N-Up Page Imposition HUD Sub-Module
 * Reverse-engineered from Adobe Acrobat Pro ("Multiple Pages Per Sheet")
 * and iLovePDF / Sejda N-Up Imposition specifications:
 * - Layout Presets: 2-up, 4-up, 6-up, 8-up
 * - Orientation: Portrait & Landscape
 * - Imposition Flow Order: Horizontal (Across then Down) vs Vertical (Down then Across)
 * - Margins & Cell Gutters (in points)
 * - Page Borders & Border Color Picker
 * - Background Color
 * - Page Range Filtering (All, Odd, Even, Custom Range)
 * - Live Output Sheet Estimator
 */

import { NupOps } from '../../core/engine/operations/nup-ops.js';
import { Toast } from '../toast.js';

export function renderNupOptionsHtml(instance) {
  const totalPages = instance.uploadedFiles[0]?.pageCount || 8;
  const cfg = instance.nupConfig || {
    layout: instance.nupCount || 2,
    orientation: 'auto',
    margin: 20,
    gutter: 8,
    order: 'horizontal',
    showBorder: true,
    borderColor: '#94a3b8',
    backgroundColor: '#ffffff',
    rangeRule: 'all'
  };

  const layout = Number(cfg.layout || 2);
  const spec = NupOps.LAYOUT_SPECS[layout] || NupOps.LAYOUT_SPECS[2];
  const effectiveOrientation = cfg.orientation === 'auto' || !cfg.orientation ? spec.defaultOrientation : cfg.orientation;
  const grid = spec[effectiveOrientation] || spec[spec.defaultOrientation];
  const pagesPerSheet = grid.cols * grid.rows;
  const includedCount = NupOps.getIncludedPageIndices(totalPages, cfg.rangeRule || 'all').length;
  const estimatedSheets = Math.ceil(includedCount / pagesPerSheet);

  return `
    <div class="nup-workspace-panel" style="display:flex; flex-direction:column; gap:16px;">
      <!-- Header HUD / Acrobat Pro N-Up Banner -->
      <div style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📑</span>
            <span style="font-weight:700; font-size:14px; color:#f8fafc; letter-spacing:0.02em;">Adobe Acrobat & iLovePDF N-Up Imposition</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(59, 130, 246, 0.15); color:#93c5fd; border:1px solid rgba(59, 130, 246, 0.3);">
              Multi-Page Imposition
            </span>
            <button id="nup-btn-load-sample" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Load 8-page sample document with corporate sections">
              <span>🎲</span> Sample
            </button>
          </div>
        </div>
        <div style="font-size:12px; color:#94a3b8; line-height:1.5;">
          Combine multiple pages onto a single sheet of paper with precision scale calculations, custom margins, gutters, border outlines, and sheet orientation.
        </div>
      </div>

      <!-- Layout Selection Tiles (2, 4, 6, 8) -->
      <div>
        <label style="display:block; font-size:12px; font-weight:600; color:#e2e8f0; margin-bottom:8px;">
          Pages Per Sheet (Layout)
        </label>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px;">
          ${renderLayoutTile(2, '2-Up', '2 Pages / Sheet', layout === 2, `
            <rect x="5" y="5" width="22" height="30" rx="2" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="5" width="22" height="30" rx="2" fill="currentColor" fill-opacity="0.3"/>
          `)}
          ${renderLayoutTile(4, '4-Up', '4 Pages / Sheet', layout === 4, `
            <rect x="7" y="4" width="20" height="15" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="4" width="20" height="15" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
            <rect x="7" y="21" width="20" height="15" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="21" width="20" height="15" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
          `)}
          ${renderLayoutTile(6, '6-Up', '6 Pages / Sheet', layout === 6, `
            <rect x="7" y="3" width="20" height="9.5" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="3" width="20" height="9.5" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="7" y="15" width="20" height="9.5" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="15" width="20" height="9.5" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="7" y="27" width="20" height="9.5" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="27" width="20" height="9.5" rx="1" fill="currentColor" fill-opacity="0.3"/>
          `)}
          ${renderLayoutTile(8, '8-Up', '8 Pages / Sheet', layout === 8, `
            <rect x="7" y="2" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="2" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="7" y="11" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="11" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="7" y="20" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="20" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="7" y="29" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
            <rect x="33" y="29" width="20" height="7" rx="1" fill="currentColor" fill-opacity="0.3"/>
          `)}
        </div>
      </div>

      <!-- Orientation & Order Configuration -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px;">
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:8px;">
            Sheet Orientation
          </label>
          <div style="display:flex; gap:6px;">
            <button type="button" class="nup-btn-orient ${effectiveOrientation === 'portrait' ? 'active' : ''}" data-orient="portrait" style="flex:1; padding:7px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid ${effectiveOrientation === 'portrait' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; background:${effectiveOrientation === 'portrait' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)'}; color:${effectiveOrientation === 'portrait' ? '#93c5fd' : '#cbd5e1'}; cursor:pointer;">
              📄 Portrait
            </button>
            <button type="button" class="nup-btn-orient ${effectiveOrientation === 'landscape' ? 'active' : ''}" data-orient="landscape" style="flex:1; padding:7px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid ${effectiveOrientation === 'landscape' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; background:${effectiveOrientation === 'landscape' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)'}; color:${effectiveOrientation === 'landscape' ? '#93c5fd' : '#cbd5e1'}; cursor:pointer;">
              📑 Landscape
            </button>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px;">
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:8px;">
            Page Order Flow
          </label>
          <select id="nup-sel-order" style="width:100%; padding:7px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#f8fafc; font-size:12px; outline:none;">
            <option value="horizontal" ${cfg.order === 'horizontal' ? 'selected' : ''}>Horizontal (Across, then down)</option>
            <option value="vertical" ${cfg.order === 'vertical' ? 'selected' : ''}>Vertical (Down, then across)</option>
          </select>
        </div>
      </div>

      <!-- Spacing Controls: Margin & Gutter -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:11px; font-weight:600; color:#cbd5e1;">Outer Margin</span>
              <span id="nup-lbl-margin" style="font-size:11px; color:#38bdf8; font-family:monospace;">${cfg.margin ?? 20} pt</span>
            </div>
            <input id="nup-rng-margin" type="range" min="0" max="60" step="2" value="${cfg.margin ?? 20}" style="width:100%; cursor:pointer;">
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:11px; font-weight:600; color:#cbd5e1;">Cell Gutter</span>
              <span id="nup-lbl-gutter" style="font-size:11px; color:#38bdf8; font-family:monospace;">${cfg.gutter ?? 8} pt</span>
            </div>
            <input id="nup-rng-gutter" type="range" min="0" max="30" step="2" value="${cfg.gutter ?? 8}" style="width:100%; cursor:pointer;">
          </div>
        </div>
      </div>

      <!-- Visual Styling: Border & Background -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:center;">
        <div>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:#f1f5f9; font-weight:500;">
            <input id="nup-chk-border" type="checkbox" ${cfg.showBorder ? 'checked' : ''} style="cursor:pointer; accent-color:#3b82f6;">
            <span>Draw Page Borders</span>
          </label>
          <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
            <input id="nup-col-border" type="color" value="${cfg.borderColor || '#94a3b8'}" style="width:28px; height:24px; padding:0; border:none; background:transparent; cursor:pointer;">
            <span id="nup-lbl-border-color" style="font-size:11px; color:#94a3b8; font-family:monospace;">${cfg.borderColor || '#94a3b8'}</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:6px;">
            Page Range / Filter
          </label>
          <select id="nup-sel-range" style="width:100%; padding:6px 8px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#f8fafc; font-size:11px; outline:none;">
            <option value="all" ${cfg.rangeRule === 'all' ? 'selected' : ''}>All Pages (1-${totalPages})</option>
            <option value="odd" ${cfg.rangeRule === 'odd' ? 'selected' : ''}>Odd Pages Only</option>
            <option value="even" ${cfg.rangeRule === 'even' ? 'selected' : ''}>Even Pages Only</option>
          </select>
        </div>
      </div>

      <!-- Imposition Live Summary Telemetry -->
      <div id="nup-summary-box" style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(59, 130, 246, 0.2); border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; border-radius:8px; background:rgba(59, 130, 246, 0.15); display:flex; align-items:center; justify-content:center; color:#60a5fa; font-weight:700; font-size:13px;">
            ${layout}x
          </div>
          <div>
            <div style="font-size:12px; font-weight:600; color:#f8fafc;">
              ${layout}-Up (${grid.cols} cols × ${grid.rows} rows)
            </div>
            <div style="font-size:11px; color:#94a3b8;">
              ${effectiveOrientation.toUpperCase()} A4 • ${grid.cols * grid.rows} pages per sheet
            </div>
          </div>
        </div>

        <div style="text-align:right;">
          <div style="font-size:11px; color:#94a3b8;">Estimated Output</div>
          <div style="font-size:14px; font-weight:700; color:#38bdf8;">
            ${estimatedSheets} sheet${estimatedSheets === 1 ? '' : 's'} <span style="font-size:11px; font-weight:400; color:#64748b;">(from ${includedCount} pp)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLayoutTile(count, label, sublabel, isActive, svgInner) {
  return `
    <button type="button" class="nup-layout-tile ${isActive ? 'active' : ''}" data-layout="${count}" style="
      background:${isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)'};
      border:1.5px solid ${isActive ? '#3b82f6' : 'rgba(255,255,255,0.08)'};
      border-radius:10px;
      padding:10px 8px;
      cursor:pointer;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:6px;
      transition:all 0.15s ease;
      color:${isActive ? '#93c5fd' : '#cbd5e1'};
    ">
      <svg width="60" height="40" viewBox="0 0 60 40" style="border:1px dashed rgba(255,255,255,0.15); border-radius:4px; background:rgba(0,0,0,0.2);">
        ${svgInner}
      </svg>
      <div style="font-size:12px; font-weight:700; color:${isActive ? '#60a5fa' : '#f1f5f9'};">${label}</div>
      <div style="font-size:10px; color:#94a3b8;">${sublabel}</div>
    </button>
  `;
}

export function bindNupEvents(manager) {
  const container = document.querySelector('.nup-workspace-panel');
  if (!container) return;

  if (!manager.nupConfig) {
    manager.nupConfig = {
      layout: manager.nupCount || 2,
      orientation: 'auto',
      margin: 20,
      gutter: 8,
      order: 'horizontal',
      showBorder: true,
      borderColor: '#94a3b8',
      backgroundColor: '#ffffff',
      rangeRule: 'all'
    };
  }

  // Layout tile clicks
  container.querySelectorAll('.nup-layout-tile').forEach((btn) => {
    btn.onclick = () => {
      const layout = parseInt(btn.getAttribute('data-layout'), 10) || 2;
      manager.nupConfig.layout = layout;
      manager.nupCount = layout;
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  });

  // Orientation buttons
  container.querySelectorAll('.nup-btn-orient').forEach((btn) => {
    btn.onclick = () => {
      const orient = btn.getAttribute('data-orient');
      manager.nupConfig.orientation = orient;
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  });

  // Order selection
  const selOrder = container.querySelector('#nup-sel-order');
  if (selOrder) {
    selOrder.onchange = (e) => {
      manager.nupConfig.order = e.target.value;
    };
  }

  // Margin range
  const rngMargin = container.querySelector('#nup-rng-margin');
  const lblMargin = container.querySelector('#nup-lbl-margin');
  if (rngMargin) {
    rngMargin.oninput = (e) => {
      const val = parseInt(e.target.value, 10);
      manager.nupConfig.margin = val;
      if (lblMargin) lblMargin.innerText = `${val} pt`;
    };
  }

  // Gutter range
  const rngGutter = container.querySelector('#nup-rng-gutter');
  const lblGutter = container.querySelector('#nup-lbl-gutter');
  if (rngGutter) {
    rngGutter.oninput = (e) => {
      const val = parseInt(e.target.value, 10);
      manager.nupConfig.gutter = val;
      if (lblGutter) lblGutter.innerText = `${val} pt`;
    };
  }

  // Border toggle & color
  const chkBorder = container.querySelector('#nup-chk-border');
  if (chkBorder) {
    chkBorder.onchange = (e) => {
      manager.nupConfig.showBorder = e.target.checked;
    };
  }

  const colBorder = container.querySelector('#nup-col-border');
  const lblBorderColor = container.querySelector('#nup-lbl-border-color');
  if (colBorder) {
    colBorder.oninput = (e) => {
      manager.nupConfig.borderColor = e.target.value;
      if (lblBorderColor) lblBorderColor.innerText = e.target.value;
    };
  }

  // Range rule
  const selRange = container.querySelector('#nup-sel-range');
  if (selRange) {
    selRange.onchange = (e) => {
      manager.nupConfig.rangeRule = e.target.value;
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  }

  // Load sample button
  const btnSample = container.querySelector('#nup-btn-load-sample');
  if (btnSample) {
    btnSample.onclick = async () => {
      try {
        btnSample.disabled = true;
        btnSample.innerText = 'Loading...';
        Toast.info('Generating 8-page sample document...');
        const sampleBytes = await NupOps.createSampleNupPdf();
        const file = new File([sampleBytes], 'sample_imposition_document.pdf', { type: 'application/pdf' });
        await manager.setFiles([file]);
        if (typeof manager.renderOptionsPanel === 'function') {
          manager.renderOptionsPanel();
        }
        Toast.success('Loaded 8-page sample document.');
      } catch (err) {
        console.error('Failed to load sample:', err);
        Toast.error(`Could not load sample: ${err.message}`);
      } finally {
        btnSample.disabled = false;
        btnSample.innerHTML = '<span>🎲</span> Sample';
      }
    };
  }
}
