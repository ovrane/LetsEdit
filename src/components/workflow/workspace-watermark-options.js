/**
 * Workspace Dynamic Watermark & Stamp HUD Sub-Module
 * Reverse-engineered from Adobe Acrobat Pro ("Add Watermark")
 * and iLovePDF / Sejda Watermark specifications:
 * - Dual Mode: Vector Text & Image Stamping (PNG/JPG with alpha)
 * - Layer Placement: Over page content (foreground) vs Behind page content (background)
 * - Rotation: 45° diagonal, 0° horizontal, 90° vertical, or custom (-180° to +180°)
 * - Layout Modes: Single 9-point anchor alignment or Mosaic / Tile repeat grid
 * - Dynamic Variable Macro tokens (<<Page>>, <<TotalPages>>, <<Date>>, <<FileName>>)
 * - Page Range Filtering: All, Odd, Even, Custom
 */

import { WatermarkOps } from '../../core/engine/operations/watermark-ops.js';
import { Toast } from '../toast.js';

export function renderWatermarkOptionsHtml(instance) {
  const totalPages = instance.uploadedFiles[0]?.pageCount || 4;
  const cfg = instance.watermarkConfig || {
    mode: instance.watermarkMode || 'text',
    text: instance.watermarkText || 'CONFIDENTIAL',
    color: instance.watermarkColor || '#94a3b8',
    opacity: typeof instance.watermarkOpacity === 'number' ? instance.watermarkOpacity : 0.3,
    rotation: typeof instance.watermarkRotation === 'number' ? instance.watermarkRotation : 45,
    layer: 'over',
    layout: 'single',
    anchor: 'center',
    fontFamily: 'HelveticaBold',
    fontSize: 0, // 0 = auto
    scale: 0.4,
    rangeRule: 'all',
    imageBase64: null,
    imageFileName: null
  };

  const isText = cfg.mode !== 'image';
  const opacityPct = Math.round((cfg.opacity ?? 0.3) * 100);

  return `
    <div class="watermark-workspace-panel" style="display:flex; flex-direction:column; gap:16px;">
      <!-- Header HUD / Acrobat Pro Banner -->
      <div style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">💧</span>
            <span style="font-weight:700; font-size:14px; color:#f8fafc; letter-spacing:0.02em;">Adobe Acrobat & iLovePDF Dynamic Watermark</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(59, 130, 246, 0.15); color:#93c5fd; border:1px solid rgba(59, 130, 246, 0.3);">
              Vector & Raster Engine
            </span>
            <button id="wm-btn-load-sample" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Load 4-page sample document for watermark testing">
              <span>🎲</span> Sample
            </button>
          </div>
        </div>
        <div style="font-size:12px; color:#94a3b8; line-height:1.5;">
          Protect and classify documents with dynamic text macros, PNG stamps, 9-point anchor alignment, mosaic repeat tiling, and background/foreground layer positioning.
        </div>
      </div>

      <!-- Mode Switcher (Text vs Image) -->
      <div style="display:flex; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:3px;">
        <button type="button" class="wm-btn-mode ${isText ? 'active' : ''}" data-mode="text" style="flex:1; padding:7px; border-radius:6px; font-size:12px; font-weight:600; border:none; background:${isText ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}; color:${isText ? '#93c5fd' : '#94a3b8'}; cursor:pointer;">
          🔤 Text Watermark
        </button>
        <button type="button" class="wm-btn-mode ${!isText ? 'active' : ''}" data-mode="image" style="flex:1; padding:7px; border-radius:6px; font-size:12px; font-weight:600; border:none; background:${!isText ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}; color:${!isText ? '#93c5fd' : '#94a3b8'}; cursor:pointer;">
          🖼️ Image Stamp (PNG/JPG)
        </button>
      </div>

      <!-- Text Mode Controls -->
      <div id="wm-section-text" style="display:${isText ? 'flex' : 'none'}; flex-direction:column; gap:12px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label style="font-size:11px; font-weight:600; color:#cbd5e1;">Watermark Text & Macros</label>
            <div style="display:flex; gap:4px;">
              <button type="button" class="wm-btn-macro" data-token="<<Date>>" style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:#38bdf8; cursor:pointer;" title="Insert current date">+ Date</button>
              <button type="button" class="wm-btn-macro" data-token="<<Page>>" style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:#38bdf8; cursor:pointer;" title="Insert current page number">+ Page</button>
              <button type="button" class="wm-btn-macro" data-token="<<FileName>>" style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:#38bdf8; cursor:pointer;" title="Insert document filename">+ File</button>
            </div>
          </div>
          <input id="wm-in-text" type="text" value="${escapeHtml(cfg.text || 'CONFIDENTIAL')}" placeholder="e.g. CONFIDENTIAL <<Date>>" style="width:100%; padding:8px 12px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#f8fafc; font-size:12px; outline:none;">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:6px;">Font Family</label>
            <select id="wm-sel-font" style="width:100%; padding:6px 10px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#f8fafc; font-size:11px; outline:none;">
              <option value="HelveticaBold" ${cfg.fontFamily === 'HelveticaBold' ? 'selected' : ''}>Helvetica Bold</option>
              <option value="TimesRoman" ${cfg.fontFamily === 'TimesRoman' ? 'selected' : ''}>Times Roman Bold</option>
              <option value="Courier" ${cfg.fontFamily === 'Courier' ? 'selected' : ''}>Courier Monospace</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:6px;">Color</label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input id="wm-col-text" type="color" value="${cfg.color || '#94a3b8'}" style="width:32px; height:28px; padding:0; border:none; background:transparent; cursor:pointer;">
              <span id="wm-lbl-color" style="font-size:11px; color:#94a3b8; font-family:monospace;">${cfg.color || '#94a3b8'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Mode Controls -->
      <div id="wm-section-image" style="display:${!isText ? 'flex' : 'none'}; flex-direction:column; gap:12px;">
        <div style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.15); border-radius:8px; padding:12px; text-align:center;">
          <input type="file" id="wm-file-image" accept="image/png,image/jpeg" style="display:none;">
          <button type="button" id="wm-btn-browse-image" style="background:rgba(59, 130, 246, 0.2); border:1px solid #3b82f6; color:#93c5fd; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">
            Browse Image (PNG / JPG)
          </button>
          <div id="wm-lbl-image-name" style="font-size:11px; color:#94a3b8; margin-top:6px;">
            ${cfg.imageFileName ? `Loaded: ${escapeHtml(cfg.imageFileName)}` : 'No custom stamp image selected'}
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:11px; color:#94a3b8;">Image Scale</span>
            <span id="wm-lbl-scale" style="font-size:11px; color:#38bdf8; font-family:monospace;">${Math.round((cfg.scale || 0.4) * 100)}%</span>
          </div>
          <input id="wm-rng-scale" type="range" min="0.1" max="1.0" step="0.05" value="${cfg.scale || 0.4}" style="width:100%; cursor:pointer;">
        </div>
      </div>

      <!-- Rotation & Opacity -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:14px;">
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:600; color:#cbd5e1;">Rotation Angle</span>
            <span id="wm-lbl-rot" style="font-size:11px; color:#38bdf8; font-family:monospace;">${cfg.rotation ?? 45}°</span>
          </div>
          <div style="display:flex; gap:4px; margin-bottom:6px;">
            <button type="button" class="wm-btn-rot" data-rot="45" style="flex:1; padding:4px; border-radius:4px; font-size:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#cbd5e1; cursor:pointer;">45°</button>
            <button type="button" class="wm-btn-rot" data-rot="0" style="flex:1; padding:4px; border-radius:4px; font-size:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#cbd5e1; cursor:pointer;">0°</button>
            <button type="button" class="wm-btn-rot" data-rot="90" style="flex:1; padding:4px; border-radius:4px; font-size:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#cbd5e1; cursor:pointer;">90°</button>
            <button type="button" class="wm-btn-rot" data-rot="-45" style="flex:1; padding:4px; border-radius:4px; font-size:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#cbd5e1; cursor:pointer;">-45°</button>
          </div>
          <input id="wm-rng-rot" type="range" min="-180" max="180" step="5" value="${cfg.rotation ?? 45}" style="width:100%; cursor:pointer;">
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:600; color:#cbd5e1;">Opacity Transparency</span>
            <span id="wm-lbl-opacity" style="font-size:11px; color:#38bdf8; font-family:monospace;">${opacityPct}%</span>
          </div>
          <input id="wm-rng-opacity" type="range" min="0.05" max="1.0" step="0.05" value="${cfg.opacity ?? 0.3}" style="width:100%; cursor:pointer; margin-top:14px;">
        </div>
      </div>

      <!-- Alignment Anchor & Layering -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:center;">
        <div>
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:8px;">
            9-Point Anchor Placement
          </label>
          <div style="display:grid; grid-template-columns:repeat(3, 28px); gap:6px;">
            ${renderAnchorBtn('top-left', cfg.anchor === 'top-left')}
            ${renderAnchorBtn('top-center', cfg.anchor === 'top-center')}
            ${renderAnchorBtn('top-right', cfg.anchor === 'top-right')}
            ${renderAnchorBtn('center-left', cfg.anchor === 'center-left')}
            ${renderAnchorBtn('center', cfg.anchor === 'center' || !cfg.anchor)}
            ${renderAnchorBtn('center-right', cfg.anchor === 'center-right')}
            ${renderAnchorBtn('bottom-left', cfg.anchor === 'bottom-left')}
            ${renderAnchorBtn('bottom-center', cfg.anchor === 'bottom-center')}
            ${renderAnchorBtn('bottom-right', cfg.anchor === 'bottom-right')}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Layer Placement</label>
            <div style="display:flex; gap:6px;">
              <button type="button" class="wm-btn-layer ${cfg.layer !== 'under' ? 'active' : ''}" data-layer="over" style="flex:1; padding:6px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid ${cfg.layer !== 'under' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; background:${cfg.layer !== 'under' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)'}; color:${cfg.layer !== 'under' ? '#93c5fd' : '#cbd5e1'}; cursor:pointer;">
                Foreground
              </button>
              <button type="button" class="wm-btn-layer ${cfg.layer === 'under' ? 'active' : ''}" data-layer="under" style="flex:1; padding:6px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid ${cfg.layer === 'under' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; background:${cfg.layer === 'under' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)'}; color:${cfg.layer === 'under' ? '#93c5fd' : '#cbd5e1'}; cursor:pointer;">
                Background
              </button>
            </div>
          </div>

          <div>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:11px; color:#f1f5f9; font-weight:500;">
              <input id="wm-chk-mosaic" type="checkbox" ${cfg.layout === 'mosaic' ? 'checked' : ''} style="cursor:pointer; accent-color:#3b82f6;">
              <span>Mosaic Repeat Grid (Tile Pattern)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Page Range Selector -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; font-weight:600; color:#cbd5e1;">Target Pages</div>
          <div style="font-size:10px; color:#94a3b8;">Stamp only specific ranges or skip cover page</div>
        </div>
        <select id="wm-sel-range" style="padding:6px 10px; background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#f8fafc; font-size:11px; outline:none;">
          <option value="all" ${cfg.rangeRule === 'all' ? 'selected' : ''}>All Pages (1-${totalPages})</option>
          <option value="odd" ${cfg.rangeRule === 'odd' ? 'selected' : ''}>Odd Pages Only</option>
          <option value="even" ${cfg.rangeRule === 'even' ? 'selected' : ''}>Even Pages Only</option>
        </select>
      </div>

      <!-- Summary Telemetry Box -->
      <div id="wm-summary-box" style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(59, 130, 246, 0.2); border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; border-radius:8px; background:rgba(59, 130, 246, 0.15); display:flex; align-items:center; justify-content:center; color:#60a5fa; font-weight:700; font-size:14px;">
            💧
          </div>
          <div>
            <div style="font-size:12px; font-weight:600; color:#f8fafc;">
              ${isText ? `Text: "${escapeHtml(cfg.text || 'CONFIDENTIAL')}"` : 'Image Stamp'}
            </div>
            <div style="font-size:11px; color:#94a3b8;">
              ${cfg.rotation}° Angle • ${opacityPct}% Opacity • ${cfg.layer === 'under' ? 'Background' : 'Foreground'} • ${cfg.layout === 'mosaic' ? 'Mosaic' : cfg.anchor.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAnchorBtn(pos, isActive) {
  return `
    <button type="button" class="wm-btn-anchor ${isActive ? 'active' : ''}" data-anchor="${pos}" style="width:28px; height:28px; border-radius:4px; border:1px solid ${isActive ? '#3b82f6' : 'rgba(255,255,255,0.15)'}; background:${isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.05)'}; cursor:pointer;" title="${pos}">
    </button>
  `;
}

export function bindWatermarkEvents(manager) {
  const container = document.querySelector('.watermark-workspace-panel');
  if (!container) return;

  if (!manager.watermarkConfig) {
    manager.watermarkConfig = {
      mode: manager.watermarkMode || 'text',
      text: manager.watermarkText || 'CONFIDENTIAL',
      color: manager.watermarkColor || '#94a3b8',
      opacity: typeof manager.watermarkOpacity === 'number' ? manager.watermarkOpacity : 0.3,
      rotation: typeof manager.watermarkRotation === 'number' ? manager.watermarkRotation : 45,
      layer: 'over',
      layout: 'single',
      anchor: 'center',
      fontFamily: 'HelveticaBold',
      fontSize: 0,
      scale: 0.4,
      rangeRule: 'all',
      imageBase64: null,
      imageFileName: null
    };
  }

  // Mode switcher
  container.querySelectorAll('.wm-btn-mode').forEach((btn) => {
    btn.onclick = () => {
      const mode = btn.getAttribute('data-mode');
      manager.watermarkConfig.mode = mode;
      manager.watermarkMode = mode;
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  });

  // Text input
  const inText = container.querySelector('#wm-in-text');
  if (inText) {
    inText.oninput = (e) => {
      manager.watermarkConfig.text = e.target.value;
      manager.watermarkText = e.target.value;
    };
  }

  // Macro token buttons
  container.querySelectorAll('.wm-btn-macro').forEach((btn) => {
    btn.onclick = () => {
      const token = btn.getAttribute('data-token');
      if (inText) {
        inText.value = (inText.value ? `${inText.value} ` : '') + token;
        manager.watermarkConfig.text = inText.value;
        manager.watermarkText = inText.value;
      }
    };
  });

  // Font family
  const selFont = container.querySelector('#wm-sel-font');
  if (selFont) {
    selFont.onchange = (e) => {
      manager.watermarkConfig.fontFamily = e.target.value;
    };
  }

  // Text color
  const colText = container.querySelector('#wm-col-text');
  const lblColor = container.querySelector('#wm-lbl-color');
  if (colText) {
    colText.oninput = (e) => {
      manager.watermarkConfig.color = e.target.value;
      manager.watermarkColor = e.target.value;
      if (lblColor) lblColor.innerText = e.target.value;
    };
  }

  // Image file browse
  const fileImg = container.querySelector('#wm-file-image');
  const btnBrowseImg = container.querySelector('#wm-btn-browse-image');
  const lblImgName = container.querySelector('#wm-lbl-image-name');
  if (btnBrowseImg && fileImg) {
    btnBrowseImg.onclick = () => fileImg.click();
    fileImg.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          manager.watermarkConfig.imageBase64 = re.target.result;
          manager.watermarkConfig.imageFileName = file.name;
          manager.watermarkConfig.imageType = file.type;
          if (lblImgName) lblImgName.innerText = `Loaded: ${file.name}`;
          Toast.success(`Loaded stamp image: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    };
  }

  // Image scale
  const rngScale = container.querySelector('#wm-rng-scale');
  const lblScale = container.querySelector('#wm-lbl-scale');
  if (rngScale) {
    rngScale.oninput = (e) => {
      const val = parseFloat(e.target.value);
      manager.watermarkConfig.scale = val;
      if (lblScale) lblScale.innerText = `${Math.round(val * 100)}%`;
    };
  }

  // Rotation presets
  container.querySelectorAll('.wm-btn-rot').forEach((btn) => {
    btn.onclick = () => {
      const rot = parseInt(btn.getAttribute('data-rot'), 10);
      manager.watermarkConfig.rotation = rot;
      manager.watermarkRotation = rot;
      const rngRot = container.querySelector('#wm-rng-rot');
      const lblRot = container.querySelector('#wm-lbl-rot');
      if (rngRot) rngRot.value = rot;
      if (lblRot) lblRot.innerText = `${rot}°`;
    };
  });

  // Rotation slider
  const rngRot = container.querySelector('#wm-rng-rot');
  const lblRot = container.querySelector('#wm-lbl-rot');
  if (rngRot) {
    rngRot.oninput = (e) => {
      const rot = parseInt(e.target.value, 10);
      manager.watermarkConfig.rotation = rot;
      manager.watermarkRotation = rot;
      if (lblRot) lblRot.innerText = `${rot}°`;
    };
  }

  // Opacity slider
  const rngOpacity = container.querySelector('#wm-rng-opacity');
  const lblOpacity = container.querySelector('#wm-lbl-opacity');
  if (rngOpacity) {
    rngOpacity.oninput = (e) => {
      const op = parseFloat(e.target.value);
      manager.watermarkConfig.opacity = op;
      manager.watermarkOpacity = op;
      if (lblOpacity) lblOpacity.innerText = `${Math.round(op * 100)}%`;
    };
  }

  // Anchor buttons
  container.querySelectorAll('.wm-btn-anchor').forEach((btn) => {
    btn.onclick = () => {
      container.querySelectorAll('.wm-btn-anchor').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      manager.watermarkConfig.anchor = btn.getAttribute('data-anchor');
    };
  });

  // Layer buttons
  container.querySelectorAll('.wm-btn-layer').forEach((btn) => {
    btn.onclick = () => {
      const layer = btn.getAttribute('data-layer');
      manager.watermarkConfig.layer = layer;
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
    };
  });

  // Mosaic checkbox
  const chkMosaic = container.querySelector('#wm-chk-mosaic');
  if (chkMosaic) {
    chkMosaic.onchange = (e) => {
      manager.watermarkConfig.layout = e.target.checked ? 'mosaic' : 'single';
    };
  }

  // Page range
  const selRange = container.querySelector('#wm-sel-range');
  if (selRange) {
    selRange.onchange = (e) => {
      manager.watermarkConfig.rangeRule = e.target.value;
    };
  }

  // Sample document button
  const btnSample = container.querySelector('#wm-btn-load-sample');
  if (btnSample) {
    btnSample.onclick = async () => {
      try {
        btnSample.disabled = true;
        btnSample.innerText = 'Loading...';
        Toast.info('Generating 4-page sample document...');
        const sampleBytes = await WatermarkOps.createSampleWatermarkPdf();
        const file = new File([sampleBytes], 'sample_watermark_document.pdf', { type: 'application/pdf' });
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

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
