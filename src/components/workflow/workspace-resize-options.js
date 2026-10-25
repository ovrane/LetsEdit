/**
 * Workspace Page Resizing & Margins HUD Sub-Module
 * Reverse-engineered from Adobe Acrobat Pro ("Page Setup / Margins")
 * and Sejda PDF ("Resize PDF Margins & Page Size"):
 * - Paper size standardization (A4, A3, A5, Letter, Legal, Tabloid, Original)
 * - Custom 4-side margins (Top, Bottom, Left, Right in points)
 * - Spiral/Ring Binder gutter offset with duplex alternate page mirroring
 * - Auto / Portrait / Landscape sheet orientation
 * - Background color fill and page range filtering
 */

import { ResizeOps } from '../../core/engine/operations/resize-ops.js';
import { Toast } from '../toast.js';

export function renderResizeOptionsHtml(instance) {
  const totalPages = instance.uploadedFiles[0]?.pageCount || 4;
  const cfg = instance.resizeConfig || {
    pageSize: 'original',
    orientation: 'auto',
    scaleMode: 'fit',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    bindingGutter: 0,
    mirrorMargins: false,
    backgroundColor: '#ffffff',
    rangeRule: 'all'
  };

  const pageSize = cfg.pageSize || 'original';
  const orientation = cfg.orientation || 'auto';
  const origW = 595.28;
  const origH = 841.89;
  const [targetW, targetH] = ResizeOps.resolveTargetDimensions(pageSize, orientation, origW, origH);
  const totalMarginX = (cfg.marginLeft || 0) + (cfg.marginRight || 0) + (cfg.bindingGutter || 0);
  const totalMarginY = (cfg.marginTop || 0) + (cfg.marginBottom || 0);

  return `
    <div class="resize-workspace-panel" style="display:flex; flex-direction:column; gap:16px;">
      <!-- Header HUD / Acrobat Pro Banner -->
      <div style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📐</span>
            <span style="font-weight:700; font-size:14px; color:#f8fafc; letter-spacing:0.02em;">Adobe Acrobat & Sejda Page Margins & Resize</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(99, 102, 241, 0.15); color:#a5b4fc; border:1px solid rgba(99, 102, 241, 0.3);">
              Geometry Engine
            </span>
            <button id="resize-btn-load-sample" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Load 4-page sample document for margin and resizing tests">
              <span>🎲</span> Sample
            </button>
          </div>
        </div>
        <div style="font-size:12px; color:#94a3b8; line-height:1.5;">
          Expand page margins, standardize sheet formats (A4/Letter/Legal), and inject binding gutters with automatic duplex page mirroring.
        </div>
      </div>

      <!-- Quick Preset Buttons -->
      <div>
        <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:6px;">
          Quick Imposition Presets
        </label>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px;">
          <button type="button" class="btn-resize-preset" data-preset="spiral" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px; text-align:left; cursor:pointer; color:#e2e8f0; font-size:11px;">
            <div style="font-weight:700; color:#60a5fa; margin-bottom:2px;">🌀 Spiral / Binder</div>
            <div style="font-size:10px; color:#94a3b8;">+72pt Duplex Gutter</div>
          </button>
          <button type="button" class="btn-resize-preset" data-preset="header" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px; text-align:left; cursor:pointer; color:#e2e8f0; font-size:11px;">
            <div style="font-weight:700; color:#38bdf8; margin-bottom:2px;">📑 Header Clear</div>
            <div style="font-size:10px; color:#94a3b8;">Top/Bottom +40pt</div>
          </button>
          <button type="button" class="btn-resize-preset" data-preset="uniform" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px; text-align:left; cursor:pointer; color:#e2e8f0; font-size:11px;">
            <div style="font-weight:700; color:#34d399; margin-bottom:2px;">⬜ Uniform Margin</div>
            <div style="font-size:10px; color:#94a3b8;">All Sides +36pt</div>
          </button>
          <button type="button" class="btn-resize-preset" data-preset="a4" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px; text-align:left; cursor:pointer; color:#e2e8f0; font-size:11px;">
            <div style="font-weight:700; color:#a78bfa; margin-bottom:2px;">📄 Fit to A4</div>
            <div style="font-size:10px; color:#94a3b8;">Standard A4 + 20pt</div>
          </button>
          <button type="button" class="btn-resize-preset" data-preset="reset" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px; text-align:left; cursor:pointer; color:#e2e8f0; font-size:11px;">
            <div style="font-weight:700; color:#cbd5e1; margin-bottom:2px;">↺ Reset to 0</div>
            <div style="font-size:10px; color:#94a3b8;">Original Geometry</div>
          </button>
        </div>
      </div>

      <!-- Paper Size & Sheet Orientation -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:6px;">
            Target Paper Standard
          </label>
          <select id="resize-sel-size" style="width:100%; padding:7px 10px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#f8fafc; font-size:12px; outline:none;">
            <option value="original" ${pageSize === 'original' ? 'selected' : ''}>Maintain Original Size</option>
            <option value="a4" ${pageSize === 'a4' ? 'selected' : ''}>ISO A4 (210 × 297 mm)</option>
            <option value="a3" ${pageSize === 'a3' ? 'selected' : ''}>ISO A3 (297 × 420 mm)</option>
            <option value="a5" ${pageSize === 'a5' ? 'selected' : ''}>ISO A5 (148 × 210 mm)</option>
            <option value="letter" ${pageSize === 'letter' ? 'selected' : ''}>US Letter (8.5 × 11 in)</option>
            <option value="legal" ${pageSize === 'legal' ? 'selected' : ''}>US Legal (8.5 × 14 in)</option>
            <option value="tabloid" ${pageSize === 'tabloid' ? 'selected' : ''}>US Tabloid (11 × 17 in)</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:6px;">
            Sheet Orientation
          </label>
          <div style="display:flex; gap:6px;">
            <button type="button" class="resize-btn-orient ${orientation === 'auto' ? 'active' : ''}" data-orient="auto" style="flex:1; padding:7px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid ${orientation === 'auto' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; background:${orientation === 'auto' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)'}; color:${orientation === 'auto' ? '#93c5fd' : '#cbd5e1'}; cursor:pointer;">
              Auto
            </button>
            <button type="button" class="resize-btn-orient ${orientation === 'portrait' ? 'active' : ''}" data-orient="portrait" style="flex:1; padding:7px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid ${orientation === 'portrait' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; background:${orientation === 'portrait' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)'}; color:${orientation === 'portrait' ? '#93c5fd' : '#cbd5e1'}; cursor:pointer;">
              📄 Portrait
            </button>
            <button type="button" class="resize-btn-orient ${orientation === 'landscape' ? 'active' : ''}" data-orient="landscape" style="flex:1; padding:7px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid ${orientation === 'landscape' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; background:${orientation === 'landscape' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)'}; color:${orientation === 'landscape' ? '#93c5fd' : '#cbd5e1'}; cursor:pointer;">
              📑 Landscape
            </button>
          </div>
        </div>
      </div>

      <!-- 4-Side Margins Grid -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:11px; font-weight:600; color:#cbd5e1;">Custom Margins (in points, 72 pt = 1 inch)</span>
          <span style="font-size:10px; color:#38bdf8; font-family:monospace;">+${totalMarginX} pt (H) / +${totalMarginY} pt (V)</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:11px; color:#94a3b8;">Top Margin</span>
              <span id="resize-lbl-top" style="font-size:11px; color:#38bdf8; font-family:monospace;">${cfg.marginTop || 0} pt</span>
            </div>
            <input id="resize-rng-top" type="range" min="0" max="150" step="2" value="${cfg.marginTop || 0}" style="width:100%; cursor:pointer;">
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:11px; color:#94a3b8;">Bottom Margin</span>
              <span id="resize-lbl-bottom" style="font-size:11px; color:#38bdf8; font-family:monospace;">${cfg.marginBottom || 0} pt</span>
            </div>
            <input id="resize-rng-bottom" type="range" min="0" max="150" step="2" value="${cfg.marginBottom || 0}" style="width:100%; cursor:pointer;">
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:11px; color:#94a3b8;">Left Margin</span>
              <span id="resize-lbl-left" style="font-size:11px; color:#38bdf8; font-family:monospace;">${cfg.marginLeft || 0} pt</span>
            </div>
            <input id="resize-rng-left" type="range" min="0" max="150" step="2" value="${cfg.marginLeft || 0}" style="width:100%; cursor:pointer;">
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:11px; color:#94a3b8;">Right Margin</span>
              <span id="resize-lbl-right" style="font-size:11px; color:#38bdf8; font-family:monospace;">${cfg.marginRight || 0} pt</span>
            </div>
            <input id="resize-rng-right" type="range" min="0" max="150" step="2" value="${cfg.marginRight || 0}" style="width:100%; cursor:pointer;">
          </div>
        </div>
      </div>

      <!-- Binding Gutter & Duplex Mirroring -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:center;">
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:600; color:#cbd5e1;">Binding Gutter Offset</span>
            <span id="resize-lbl-gutter" style="font-size:11px; color:#a78bfa; font-family:monospace;">${cfg.bindingGutter || 0} pt</span>
          </div>
          <input id="resize-rng-gutter" type="range" min="0" max="100" step="4" value="${cfg.bindingGutter || 0}" style="width:100%; cursor:pointer;">
        </div>

        <div>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:#f1f5f9; font-weight:500;">
            <input id="resize-chk-mirror" type="checkbox" ${cfg.mirrorMargins ? 'checked' : ''} style="cursor:pointer; accent-color:#8b5cf6;">
            <span>Mirror Margins (Duplex)</span>
          </label>
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">
            Places gutter on left for odd pages and right for even pages.
          </div>
        </div>
      </div>

      <!-- Background & Page Range -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <input id="resize-col-bg" type="color" value="${cfg.backgroundColor || '#ffffff'}" style="width:28px; height:26px; padding:0; border:none; background:transparent; cursor:pointer;">
          <div>
            <div style="font-size:11px; font-weight:600; color:#cbd5e1;">Background Color</div>
            <div id="resize-lbl-bg" style="font-size:10px; color:#94a3b8; font-family:monospace;">${cfg.backgroundColor || '#ffffff'}</div>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:6px;">
            Apply to Pages
          </label>
          <select id="resize-sel-range" style="width:100%; padding:6px 8px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#f8fafc; font-size:11px; outline:none;">
            <option value="all" ${cfg.rangeRule === 'all' ? 'selected' : ''}>All Pages (1-${totalPages})</option>
            <option value="odd" ${cfg.rangeRule === 'odd' ? 'selected' : ''}>Odd Pages Only</option>
            <option value="even" ${cfg.rangeRule === 'even' ? 'selected' : ''}>Even Pages Only</option>
          </select>
        </div>
      </div>

      <!-- Geometry Summary Box -->
      <div id="resize-summary-box" style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(99, 102, 241, 0.2); border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; border-radius:8px; background:rgba(99, 102, 241, 0.15); display:flex; align-items:center; justify-content:center; color:#a5b4fc; font-weight:700; font-size:13px;">
            📐
          </div>
          <div>
            <div style="font-size:12px; font-weight:600; color:#f8fafc;">
              Target Sheet: ${pageSize.toUpperCase()} (${targetW.toFixed(1)} × ${targetH.toFixed(1)} pt)
            </div>
            <div style="font-size:11px; color:#94a3b8;">
              ${orientation.toUpperCase()} • Margins: +${totalMarginX}pt W, +${totalMarginY}pt H
            </div>
          </div>
        </div>

        <div style="text-align:right;">
          <div style="font-size:11px; color:#94a3b8;">Binding Offset</div>
          <div style="font-size:13px; font-weight:700; color:#38bdf8;">
            ${cfg.bindingGutter || 0} pt ${cfg.mirrorMargins ? '(Duplex)' : '(Single)'}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindResizeEvents(manager) {
  const container = document.querySelector('.resize-workspace-panel');
  if (!container) return;

  if (!manager.resizeConfig) {
    manager.resizeConfig = {
      pageSize: 'original',
      orientation: 'auto',
      scaleMode: 'fit',
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      bindingGutter: 0,
      mirrorMargins: false,
      backgroundColor: '#ffffff',
      rangeRule: 'all'
    };
  }

  // Preset buttons
  container.querySelectorAll('.btn-resize-preset').forEach((btn) => {
    btn.onclick = () => {
      const preset = btn.getAttribute('data-preset');
      const cfg = manager.resizeConfig;
      if (preset === 'spiral') {
        cfg.bindingGutter = 72;
        cfg.mirrorMargins = true;
      } else if (preset === 'header') {
        cfg.marginTop = 40;
        cfg.marginBottom = 40;
      } else if (preset === 'uniform') {
        cfg.marginTop = 36;
        cfg.marginBottom = 36;
        cfg.marginLeft = 36;
        cfg.marginRight = 36;
      } else if (preset === 'a4') {
        cfg.pageSize = 'a4';
        cfg.marginTop = 20;
        cfg.marginBottom = 20;
        cfg.marginLeft = 20;
        cfg.marginRight = 20;
      } else if (preset === 'reset') {
        cfg.pageSize = 'original';
        cfg.marginTop = 0;
        cfg.marginBottom = 0;
        cfg.marginLeft = 0;
        cfg.marginRight = 0;
        cfg.bindingGutter = 0;
        cfg.mirrorMargins = false;
      }
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  });

  // Page Size dropdown
  const selSize = container.querySelector('#resize-sel-size');
  if (selSize) {
    selSize.onchange = (e) => {
      manager.resizeConfig.pageSize = e.target.value;
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  }

  // Orientation buttons
  container.querySelectorAll('.resize-btn-orient').forEach((btn) => {
    btn.onclick = () => {
      manager.resizeConfig.orientation = btn.getAttribute('data-orient');
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  });

  // Margin sliders
  const bindMarginSlider = (sliderId, labelId, prop) => {
    const slider = container.querySelector(sliderId);
    const label = container.querySelector(labelId);
    if (slider) {
      slider.oninput = (e) => {
        const val = parseInt(e.target.value, 10) || 0;
        manager.resizeConfig[prop] = val;
        if (label) label.innerText = `${val} pt`;
      };
    }
  };

  bindMarginSlider('#resize-rng-top', '#resize-lbl-top', 'marginTop');
  bindMarginSlider('#resize-rng-bottom', '#resize-lbl-bottom', 'marginBottom');
  bindMarginSlider('#resize-rng-left', '#resize-lbl-left', 'marginLeft');
  bindMarginSlider('#resize-rng-right', '#resize-lbl-right', 'marginRight');
  bindMarginSlider('#resize-rng-gutter', '#resize-lbl-gutter', 'bindingGutter');

  // Mirror margins checkbox
  const chkMirror = container.querySelector('#resize-chk-mirror');
  if (chkMirror) {
    chkMirror.onchange = (e) => {
      manager.resizeConfig.mirrorMargins = e.target.checked;
    };
  }

  // Background color
  const colBg = container.querySelector('#resize-col-bg');
  const lblBg = container.querySelector('#resize-lbl-bg');
  if (colBg) {
    colBg.oninput = (e) => {
      manager.resizeConfig.backgroundColor = e.target.value;
      if (lblBg) lblBg.innerText = e.target.value;
    };
  }

  // Range rule
  const selRange = container.querySelector('#resize-sel-range');
  if (selRange) {
    selRange.onchange = (e) => {
      manager.resizeConfig.rangeRule = e.target.value;
    };
  }

  // Load sample button
  const btnSample = container.querySelector('#resize-btn-load-sample');
  if (btnSample) {
    btnSample.onclick = async () => {
      try {
        btnSample.disabled = true;
        btnSample.innerText = 'Loading...';
        Toast.info('Generating 4-page sample document...');
        const sampleBytes = await ResizeOps.createSampleResizePdf();
        const file = new File([sampleBytes], 'sample_resize_document.pdf', { type: 'application/pdf' });
        await manager.setFiles([file]);
        if (typeof manager.renderOptionsPanel === 'function') {
          manager.renderOptionsPanel();
        }
        Toast.success('Loaded 4-page sample document.');
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
