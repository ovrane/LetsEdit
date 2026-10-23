/**
 * Tool Workspace Options HTML Templates & Helpers
 */

import { renderFormFillerOptionsHtml } from './workspace-form-options.js';

  export function getBatesPositionCss(instance) {
    switch (instance.batesPos) {
      case 'top-left': return 'top: 14px; left: 14px;';
      case 'top-center': return 'top: 14px; left: 50%; transform: translateX(-50%);';
      case 'top-right': return 'top: 14px; right: 14px;';
      case 'bottom-left': return 'bottom: 14px; left: 14px;';
      case 'bottom-center': return 'bottom: 14px; left: 50%; transform: translateX(-50%);';
      case 'bottom-right':
      default: return 'bottom: 14px; right: 14px;';
    }
  }

  export function getSignPositionCss(instance) {
    switch (instance.signPos) {
      case 'top-left': return 'top: 20px; left: 20px;';
      case 'top-center': return 'top: 20px; left: 50%; transform: translateX(-50%);';
      case 'top-right': return 'top: 20px; right: 20px;';
      case 'bottom-left': return 'bottom: 20px; left: 20px;';
      case 'bottom-center': return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
      case 'bottom-right':
      default: return 'bottom: 20px; right: 20px;';
    }
  }

  export function getPnPositionCss(instance) {
    switch (instance.pnPos) {
      case 'top-left': return 'top: 14px; left: 14px;';
      case 'top-center': return 'top: 14px; left: 50%; transform: translateX(-50%);';
      case 'top-right': return 'top: 14px; right: 14px;';
      case 'bottom-left': return 'bottom: 14px; left: 14px;';
      case 'bottom-center': return 'bottom: 14px; left: 50%; transform: translateX(-50%);';
      case 'bottom-right':
      default: return 'bottom: 14px; right: 14px;';
    }
  }

  export function getPnPositionLabel(instance) {
    const labels = {
      'top-left': 'Header Left',
      'top-center': 'Header Center',
      'top-right': 'Header Right',
      'bottom-left': 'Footer Left',
      'bottom-center': 'Footer Center',
      'bottom-right': 'Footer Right'
    };
    return labels[instance.pnPos] || 'Footer Center';
  }

  export function renderToolOptionsHtml(instance) {
    const id = instance.activeTool.id;
    const primary = instance.uploadedFiles[0] || {};

    if (id === 'fill-forms') {
      return renderFormFillerOptionsHtml(instance);
    }

    if (id === 'merge') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Merge Order</label>
          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 13px; color: var(--text-muted); line-height: 1.5;">
            Files will be compiled in the sequence shown above. Drag any card to change its position or click the rotation icon to adjust page orientation.
          </div>
        </div>
      `;
    }

    if (id === 'compress') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Compression Level</label>
          <div class="compression-cards">
            <label class="comp-option-card ${instance.compressLevel === 'extreme' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="extreme" ${instance.compressLevel === 'extreme' ? 'checked' : ''} />
              <div>
                <strong>Extreme Compression</strong>
                <span>Maximum size reduction, lower image DPI</span>
              </div>
            </label>
            <label class="comp-option-card ${instance.compressLevel === 'recommended' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="recommended" ${instance.compressLevel === 'recommended' ? 'checked' : ''} />
              <div>
                <strong>Recommended (Default)</strong>
                <span>Optimal balance of high vector quality & compact size</span>
              </div>
            </label>
            <label class="comp-option-card ${instance.compressLevel === 'less' ? 'selected' : ''}">
              <input type="radio" name="comp-level" value="less" ${instance.compressLevel === 'less' ? 'checked' : ''} />
              <div>
                <strong>Less Compression</strong>
                <span>Lossless vector structures, highest image quality</span>
              </div>
            </label>
          </div>
        </div>
      `;
    }

    if (id === 'split') {
      const pageCount = primary.pageCount || 1;
      return `
        <div class="workflow-options-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="workflow-options-label" style="margin: 0;">Split Mode</label>
            <span style="font-size: 11px; font-weight: 600; color: var(--primary); background: rgba(48, 5, 13, 0.08); padding: 2px 8px; border-radius: 12px;">
              ${pageCount} total pages
            </span>
          </div>
          <div class="split-mode-pills">
            <button type="button" class="split-mode-pill ${instance.splitMode === 'ranges' ? 'active' : ''}" data-split-mode="ranges">
              Custom Ranges
            </button>
            <button type="button" class="split-mode-pill ${instance.splitMode === 'all' ? 'active' : ''}" data-split-mode="all">
              Extract All Pages
            </button>
            <button type="button" class="split-mode-pill ${instance.splitMode === 'size' ? 'active' : ''}" data-split-mode="size">
              Split by Size
            </button>
            <button type="button" class="split-mode-pill ${instance.splitMode === 'bookmarks' ? 'active' : ''}" data-split-mode="bookmarks">
              Split by Bookmarks
            </button>
          </div>

          ${instance.splitMode === 'ranges' ? `
            <div style="margin-top: 10px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Page Ranges</label>
              <input type="text" id="split-range-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${instance.splitRange}" placeholder="e.g. 1-2, 3-5" />
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">
                Specify comma-separated ranges. Example: <code>1-${Math.min(2, pageCount)}, ${Math.min(3, pageCount)}-${pageCount}</code>
              </span>
            </div>
          ` : instance.splitMode === 'all' ? `
            <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); margin-top: 6px;">
              Every single page of this document will be separated into individual PDF files bundled into a convenient ZIP package.
            </div>
          ` : instance.splitMode === 'size' ? `
            <div style="margin-top: 10px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Maximum Target Size (MB)</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="number" id="split-size-input" class="input-sm" style="width: 90px; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${Math.round(instance.splitMaxBytes / (1024 * 1024)) || 5}" min="1" max="500" />
                <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">MB per file</span>
              </div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 6px;">
                Subdivides the PDF into parts so that each generated document is below your target file size.
              </span>
            </div>
          ` : `
            <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); margin-top: 6px;">
              Detects the PDF's Table of Contents outline bookmarks and automatically extracts chapters/sections into individual PDF files.
            </div>
          `}
        </div>
      `;
    }

    if (id === 'images-to-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Page Orientation</label>
          <div class="tool-segmented-control" style="margin-bottom: 14px;">
            <button type="button" class="tool-seg-btn ${instance.imgOrientation === 'portrait' ? 'active' : ''}" data-img-orient="portrait">
              Portrait (A4)
            </button>
            <button type="button" class="tool-seg-btn ${instance.imgOrientation === 'landscape' ? 'active' : ''}" data-img-orient="landscape">
              Landscape (A4)
            </button>
          </div>

          <label class="workflow-options-label">Page Margin</label>
          <div class="tool-segmented-control">
            <button type="button" class="tool-seg-btn ${instance.imgMargin === '0' ? 'active' : ''}" data-img-margin="0">
              No Margin
            </button>
            <button type="button" class="tool-seg-btn ${instance.imgMargin === '20' ? 'active' : ''}" data-img-margin="20">
              Small (20pt)
            </button>
            <button type="button" class="tool-seg-btn ${instance.imgMargin === '40' ? 'active' : ''}" data-img-margin="40">
              Big (40pt)
            </button>
          </div>
        </div>
      `;
    }

    if (id === 'to-image') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Image Output Format</label>
          <div class="tool-segmented-control" style="margin-bottom: 14px;">
            <button type="button" class="tool-seg-btn ${instance.imageFormat === 'image/jpeg' ? 'active' : ''}" data-img-fmt="image/jpeg">
              JPG (Standard)
            </button>
            <button type="button" class="tool-seg-btn ${instance.imageFormat === 'image/png' ? 'active' : ''}" data-img-fmt="image/png">
              PNG (Lossless)
            </button>
          </div>

          <label class="workflow-options-label">Output DPI Quality</label>
          <select id="image-dpi-select" class="select-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="150" ${instance.imageDpi === '150' ? 'selected' : ''}>150 DPI (Balanced Standard)</option>
            <option value="300" ${instance.imageDpi === '300' ? 'selected' : ''}>300 DPI (Ultra High Print Quality)</option>
            <option value="72" ${instance.imageDpi === '72' ? 'selected' : ''}>72 DPI (Web & Screen Thumbnail)</option>
          </select>
        </div>
      `;
    }

    if (id === 'watermark') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Watermark Text</label>
          <input type="text" id="wm-text-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${instance.watermarkText}" placeholder="e.g. CONFIDENTIAL" />

          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
              <span>Opacity</span>
              <span id="wm-opacity-val">${Math.round(instance.watermarkOpacity * 100)}%</span>
            </div>
            <input type="range" id="wm-opacity-range" min="0.1" max="0.9" step="0.05" value="${instance.watermarkOpacity}" style="width: 100%; cursor: pointer;" />
          </div>

          <div style="margin-top: 12px;">
            <label class="workflow-options-label">Angle</label>
            <div class="tool-segmented-control">
              <button type="button" class="tool-seg-btn ${instance.watermarkRotation === 45 ? 'active' : ''}" data-wm-rot="45">45° Diagonal</button>
              <button type="button" class="tool-seg-btn ${instance.watermarkRotation === 0 ? 'active' : ''}" data-wm-rot="0">0° Horizontal</button>
              <button type="button" class="tool-seg-btn ${instance.watermarkRotation === 90 ? 'active' : ''}" data-wm-rot="90">90° Vertical</button>
            </div>
          </div>
        </div>
      `;
    }

    if (id === 'security') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Set Document Password</label>
          <input type="password" id="protect-pwd-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 8px;" placeholder="Enter password to encrypt" value="${instance.protectPassword}" />
          <input type="password" id="protect-conf-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" placeholder="Confirm password" value="${instance.protectConfirmPassword}" />

          <div style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 8px;">Permissions</span>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-main); cursor: pointer; margin-bottom: 6px;">
              <input type="checkbox" id="protect-allow-print" ${instance.allowPrinting ? 'checked' : ''} />
              <span>Allow high-resolution printing</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-main); cursor: pointer;">
              <input type="checkbox" id="protect-allow-copy" ${instance.allowCopying ? 'checked' : ''} />
              <span>Allow copying text and graphics</span>
            </label>
          </div>
        </div>
      `;
    }

    if (id === 'rotate') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Batch Rotate All Pages</label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button type="button" class="btn btn-outline" id="btn-batch-rotate-right" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              <span>Rotate 90° Clockwise</span>
            </button>
            <button type="button" class="btn btn-outline" id="btn-batch-rotate-left" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38L-2.44 1.52"></path></svg>
              <span>Rotate 90° Counter-Clockwise</span>
            </button>
            <button type="button" class="btn btn-outline" id="btn-batch-rotate-180" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>Rotate 180° Upside Down</span>
            </button>
          </div>
        </div>
      `;
    }

    if (id === 'pdfa') {
      const currentProfile = instance.pdfaProfile || 'pdfa-1b';
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">ISO Conformance Profile</label>
          <div class="pdfa-profile-cards" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
            <label class="pdfa-profile-card ${currentProfile === 'pdfa-1b' ? 'active' : ''}" style="display: flex; gap: 10px; padding: 10px 12px; border: 1.5px solid ${currentProfile === 'pdfa-1b' ? 'var(--primary)' : 'var(--border-subtle)'}; border-radius: 8px; cursor: pointer; background: ${currentProfile === 'pdfa-1b' ? 'var(--primary-light)' : 'var(--bg-card)'};">
              <input type="radio" name="pdfa-profile-choice" value="pdfa-1b" ${currentProfile === 'pdfa-1b' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">PDF/A-1b (ISO 19005-1)</div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">Standard legal archival. Guarantees long-term visual appearance and uncompressed xref compatibility.</div>
              </div>
            </label>

            <label class="pdfa-profile-card ${currentProfile === 'pdfa-2b' ? 'active' : ''}" style="display: flex; gap: 10px; padding: 10px 12px; border: 1.5px solid ${currentProfile === 'pdfa-2b' ? 'var(--primary)' : 'var(--border-subtle)'}; border-radius: 8px; cursor: pointer; background: ${currentProfile === 'pdfa-2b' ? 'var(--primary-light)' : 'var(--bg-card)'};">
              <input type="radio" name="pdfa-profile-choice" value="pdfa-2b" ${currentProfile === 'pdfa-2b' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">PDF/A-2b (ISO 19005-2)</div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">Modern PDF 1.7 standard. Preserves transparencies, layers, JPEG 2000 images, and object streams.</div>
              </div>
            </label>

            <label class="pdfa-profile-card ${currentProfile === 'pdfa-3b' ? 'active' : ''}" style="display: flex; gap: 10px; padding: 10px 12px; border: 1.5px solid ${currentProfile === 'pdfa-3b' ? 'var(--primary)' : 'var(--border-subtle)'}; border-radius: 8px; cursor: pointer; background: ${currentProfile === 'pdfa-3b' ? 'var(--primary-light)' : 'var(--bg-card)'};">
              <input type="radio" name="pdfa-profile-choice" value="pdfa-3b" ${currentProfile === 'pdfa-3b' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">PDF/A-3b (ISO 19005-3)</div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">Electronic invoicing & attachments. Conforms to Factur-X / ZUGFeRD with XML attachment support.</div>
              </div>
            </label>
          </div>

          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 11.5px; color: var(--text-muted); line-height: 1.4;">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 600; color: #10b981; margin-bottom: 4px;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Automated Verification Enforced</span>
            </div>
            Embeds standard sRGB OutputIntents, ISO XMP Metadata packets, and strips non-compliant encryption.
          </div>
        </div>
      `;
    }

    if (id === 'ocr-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Recognition Language</label>
          <select id="ocr-lang-select" class="select-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
            <option value="eng" ${instance.ocrLang === 'eng' ? 'selected' : ''}>English (Standard)</option>
            <option value="spa" ${instance.ocrLang === 'spa' ? 'selected' : ''}>Spanish (Español)</option>
            <option value="fra" ${instance.ocrLang === 'fra' ? 'selected' : ''}>French (Français)</option>
            <option value="deu" ${instance.ocrLang === 'deu' ? 'selected' : ''}>German (Deutsch)</option>
            <option value="ita" ${instance.ocrLang === 'ita' ? 'selected' : ''}>Italian (Italiano)</option>
            <option value="por" ${instance.ocrLang === 'por' ? 'selected' : ''}>Portuguese (Português)</option>
            <option value="chi_sim" ${instance.ocrLang === 'chi_sim' ? 'selected' : ''}>Chinese Simplified (中文简体)</option>
            <option value="jpn" ${instance.ocrLang === 'jpn' ? 'selected' : ''}>Japanese (日本語)</option>
            <option value="rus" ${instance.ocrLang === 'rus' ? 'selected' : ''}>Russian (Русский)</option>
            <option value="ara" ${instance.ocrLang === 'ara' ? 'selected' : ''}>Arabic (العربية)</option>
          </select>

          <label class="workflow-options-label">Page Range</label>
          <select id="ocr-range-select" class="select-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
            <option value="all" ${(instance.ocrPageRange || 'all') === 'all' ? 'selected' : ''}>All Document Pages</option>
            <option value="1" ${instance.ocrPageRange === '1' ? 'selected' : ''}>First Page Only</option>
            <option value="custom" ${instance.ocrPageRange && instance.ocrPageRange !== 'all' && instance.ocrPageRange !== '1' ? 'selected' : ''}>Custom Range (e.g. 1-3)</option>
          </select>

          <div id="ocr-custom-range-wrap" style="display: ${instance.ocrPageRange && instance.ocrPageRange !== 'all' && instance.ocrPageRange !== '1' ? 'block' : 'none'}; margin-bottom: 12px;">
            <input type="text" id="ocr-custom-range-input" class="input-sm" placeholder="e.g. 1-2, 4" value="${instance.ocrPageRange && instance.ocrPageRange !== 'all' && instance.ocrPageRange !== '1' ? instance.ocrPageRange : ''}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
          </div>

          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            <div style="font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>⚡ WebAssembly OCR Engine</span>
            </div>
            Extracts character bounding boxes directly in your browser and injects an invisible vector text layer (ISO 32000-1 mode 3 Tr) over the scanned image. 100% private.
          </div>
        </div>
      `;
    }

    if (id === 'deskew') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Auto-Calibration</label>
          <button type="button" class="btn btn-outline" id="btn-auto-deskew" style="width: 100%; justify-content: center; gap: 8px; margin-bottom: 14px; background: rgba(8, 145, 178, 0.08); border-color: #0891b2; color: #0891b2; font-weight: 600;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            <span>Auto-Detect Tilt Angle</span>
          </button>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="workflow-options-label" style="margin: 0;">Straighten Angle</label>
            <span id="deskew-angle-display" style="font-family: monospace; font-size: 13px; font-weight: 700; color: #0891b2; background: rgba(8, 145, 178, 0.1); padding: 2px 8px; border-radius: 4px;">
              ${instance.deskewAngle > 0 ? `+${instance.deskewAngle.toFixed(1)}` : instance.deskewAngle.toFixed(1)}°
            </span>
          </div>

          <input type="range" id="deskew-angle-range" min="-10.0" max="10.0" step="0.1" value="${instance.deskewAngle}" style="width: 100%; cursor: pointer;" />

          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button type="button" class="btn btn-sm btn-outline" id="btn-deskew-minus" style="flex: 1; justify-content: center;">-0.1°</button>
            <button type="button" class="btn btn-sm btn-outline" id="btn-deskew-reset" style="flex: 1; justify-content: center;">0.0°</button>
            <button type="button" class="btn btn-sm btn-outline" id="btn-deskew-plus" style="flex: 1; justify-content: center;">+0.1°</button>
          </div>

          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-top: 12px;">
            Rotate the page until scan text lines align with the cyan grid guidelines.
          </div>
        </div>
      `;
    }

    if (id === 'organize') {
      return `
        <div class="workflow-options-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <label class="workflow-options-label" style="margin: 0;">Organize Summary</label>
            <span style="font-size: 12px; font-weight: 600; color: var(--primary); background: rgba(48, 5, 13, 0.08); padding: 2px 8px; border-radius: 12px;">
              ${instance.organizePages.length} active pages
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button type="button" class="btn btn-outline" id="btn-organize-rotate-all" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              <span>Rotate All Pages 90°</span>
            </button>
            <button type="button" class="btn btn-outline" id="btn-organize-reset" style="width: 100%; justify-content: center; gap: 8px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>Reset to Original Order</span>
            </button>
          </div>

          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-top: 12px;">
            Drag and drop page cards to reorder. Use the rotation (↻) and delete (✕) buttons on individual cards to customize your document layout.
          </div>
        </div>
      `;
    }

    if (id === 'crop') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Auto-Detect Whitespace</label>
          <button type="button" class="btn btn-outline" id="btn-auto-crop" style="width: 100%; justify-content: center; gap: 8px; margin-bottom: 14px; background: rgba(13, 148, 136, 0.08); border-color: #0d9488; color: #0d9488; font-weight: 600;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
            <span>Auto-Crop Margins</span>
          </button>

          <label class="workflow-options-label">Presets</label>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="24" data-right="24" data-bottom="24" data-left="24">Scanner Trim (24pt)</button>
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="36" data-right="36" data-bottom="36" data-left="36">Standard (36pt)</button>
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="50" data-right="30" data-bottom="50" data-left="30">Header/Footer (50pt)</button>
            <button type="button" class="btn btn-sm btn-outline btn-crop-preset" data-top="0" data-right="0" data-bottom="0" data-left="0">Reset 0pt</button>
          </div>

          <label class="workflow-options-label">Custom Margins (pt)</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Top Margin</span>
              <input type="number" id="workflow-crop-top" class="input-sm" min="0" max="300" value="${instance.cropTop}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Bottom Margin</span>
              <input type="number" id="workflow-crop-bottom" class="input-sm" min="0" max="300" value="${instance.cropBottom}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Left Margin</span>
              <input type="number" id="workflow-crop-left" class="input-sm" min="0" max="300" value="${instance.cropLeft}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Right Margin</span>
              <input type="number" id="workflow-crop-right" class="input-sm" min="0" max="300" value="${instance.cropRight}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-main); cursor: pointer;">
              <input type="checkbox" id="workflow-crop-all" ${instance.cropApplyAll ? 'checked' : ''} />
              <span>Apply crop margins across all pages in document</span>
            </label>
          </div>
        </div>
      `;
    }

    if (id === 'bates') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Bates Stamp Format</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Prefix:</span>
              <input type="text" id="workflow-bates-prefix" class="input-sm" value="${instance.batesPrefix}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: monospace;" />
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Suffix:</span>
              <input type="text" id="workflow-bates-suffix" class="input-sm" value="${instance.batesSuffix}" placeholder="e.g. -CONF" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: monospace;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Start Number:</span>
              <input type="number" id="workflow-bates-start" class="input-sm" min="1" value="${instance.batesStart}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Digits Padding:</span>
              <select id="workflow-bates-digits" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
                ${[3, 4, 5, 6, 7, 8].map(d => `<option value="${d}" ${instance.batesDigits === d ? 'selected' : ''}>${d} digits (e.g. ${'1'.padStart(d, '0')})</option>`).join('')}
              </select>
            </div>
          </div>

          <label class="workflow-options-label">Stamp Position</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px;">
            ${['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
              <button type="button" class="btn btn-sm ${instance.batesPos === pos ? 'btn-primary' : 'btn-outline'} btn-bates-pos" data-pos="${pos}" style="font-size: 11px; padding: 6px 4px; justify-content: center;">
                ${pos.replace('-', ' ')}
              </button>
            `).join('')}
          </div>

          <label class="workflow-options-label">Stamp Color</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="color" id="workflow-bates-color" value="${instance.batesColor}" style="width: 36px; height: 32px; border: none; cursor: pointer; border-radius: 4px;" />
            <span id="workflow-bates-color-label" style="font-size: 12px; color: var(--text-muted); font-family: monospace;">${instance.batesColor}</span>
          </div>
        </div>
      `;
    }

    if (id === 'nup') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Imposition Layout</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${instance.nupCount === 2 ? 'btn-primary' : 'btn-outline'} btn-nup-toggle" data-count="2" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 14px;">2-Up</span>
              <span style="font-size: 11px; opacity: 0.85;">Side-by-side Landscape</span>
            </button>
            <button type="button" class="btn ${instance.nupCount === 4 ? 'btn-primary' : 'btn-outline'} btn-nup-toggle" data-count="4" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 14px;">4-Up</span>
              <span style="font-size: 11px; opacity: 0.85;">2×2 Grid Portrait</span>
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Preserves vector fidelity and auto-scales page margins for standard A4 printing.
          </div>
        </div>
      `;
    }

    if (id === 'split-half') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Split Direction</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${instance.splitHalfDirection === 'vertical' ? 'btn-primary' : 'btn-outline'} btn-split-half-dir" data-dir="vertical" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 13px;">Vertical Split</span>
              <span style="font-size: 11px; opacity: 0.85;">Left & Right halves (Book Spreads)</span>
            </button>
            <button type="button" class="btn ${instance.splitHalfDirection === 'horizontal' ? 'btn-primary' : 'btn-outline'} btn-split-half-dir" data-dir="horizontal" style="flex-direction: column; padding: 12px 8px; text-align: center; gap: 4px;">
              <span style="font-weight: 700; font-size: 13px;">Horizontal Split</span>
              <span style="font-size: 11px; opacity: 0.85;">Top & Bottom halves</span>
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Slices each page into two independent, sequential pages. Double-page book scans will become normal reading order pages.
          </div>
        </div>
      `;
    }

    if (id === 'alternate-mix') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Interleaving Order</label>
          <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--text-main); cursor: pointer; user-select: none; margin-bottom: 12px;">
            <input type="checkbox" id="workflow-alternate-reverse" ${instance.alternateReverseB ? 'checked' : ''} style="margin-top: 2px;" />
            <span>Reverse order of Document B<br/><small style="color: var(--text-muted); font-size: 11px;">Standard for automatic duplex sheet-feeder scanner runs</small></span>
          </label>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Mixes Doc A (odd: 1, 3, 5...) and Doc B (even: 2, 4, 6...) into a single properly ordered document.
          </div>
        </div>
      `;
    }

    if (id === 'compare') {
      const fileCount = instance.uploadedFiles.length;
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Comparison Settings</label>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); margin-bottom: 14px;">
            ${fileCount < 2 
              ? 'Please upload at least 2 PDF documents (Base Document A and Modified Document B) to begin comparison.' 
              : `Comparing <strong>${instance.uploadedFiles[0].name}</strong> with <strong>${instance.uploadedFiles[1].name}</strong>.`
            }
          </div>

          <div style="margin-bottom: 14px;">
            <label class="workflow-options-label">Diff Inspection Modes</label>
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
              LetsEdit offers 4 client-side visual inspection modes:
            </div>
            <ul style="font-size: 12px; color: var(--text-main); margin: 0; padding-left: 18px; line-height: 1.6;">
              <li><strong>Side-by-Side:</strong> Synchronized dual-canvas viewport scroll.</li>
              <li><strong>Wipe Slider:</strong> Draggable split-handle wipe divider.</li>
              <li><strong>Opacity Ghost:</strong> 0–100% blend overlay for subtle alterations.</li>
              <li><strong>Diffs List:</strong> Word-by-word additions & deletions ledger.</li>
            </ul>
          </div>

          ${fileCount >= 2 ? `
            <button type="button" class="btn btn-outline" id="btn-options-quick-compare-preview" style="width: 100%; justify-content: center; gap: 8px; margin-bottom: 12px; border-color: var(--primary); color: var(--primary); font-weight: 600;">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="8" height="16" rx="1.5"></rect>
                <rect x="14" y="4" width="8" height="16" rx="1.5"></rect>
                <line x1="10" y1="9" x2="14" y2="9"></line>
                <line x1="10" y1="15" x2="14" y2="15"></line>
              </svg>
              <span>Launch Visual Diff Viewer</span>
            </button>
          ` : ''}

          <div style="font-size: 11px; color: var(--text-muted); background: var(--bg-surface); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            🔒 100% client-side. Neither document is ever transmitted to a server.
          </div>
        </div>
      `;
    }

    if (id === 'flip') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Mirror / Flip Axis</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${instance.flipDirection === 'horizontal' ? 'btn-primary' : 'btn-outline'} btn-flip-dir" data-dir="horizontal" style="justify-content: flex-start; gap: 10px; padding: 10px 14px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path></svg>
              <span>Horizontal Mirror (Left & Right)</span>
            </button>
            <button type="button" class="btn ${instance.flipDirection === 'vertical' ? 'btn-primary' : 'btn-outline'} btn-flip-dir" data-dir="vertical" style="justify-content: flex-start; gap: 10px; padding: 10px 14px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 8l5-5 5 5M7 16l5 5 5-5M4 12h16"></path></svg>
              <span>Vertical Mirror (Top & Bottom)</span>
            </button>
            <button type="button" class="btn ${instance.flipDirection === 'both' ? 'btn-primary' : 'btn-outline'} btn-flip-dir" data-dir="both" style="justify-content: flex-start; gap: 10px; padding: 10px 14px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20z"></path></svg>
              <span>Both Axes (Inverted)</span>
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Essential for iron-on fabric transfers, backlit transparency signs, or inverted scanner feeds.
          </div>
        </div>
      `;
    }

    if (id === 'grayscale') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Preview Mode</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn ${instance.grayscalePreviewActive !== false ? 'btn-primary' : 'btn-outline'} btn-grayscale-toggle" data-val="true" style="justify-content: center;">
              Grayscale
            </button>
            <button type="button" class="btn ${instance.grayscalePreviewActive === false ? 'btn-primary' : 'btn-outline'} btn-grayscale-toggle" data-val="false" style="justify-content: center;">
              Original Color
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Converts colored images and vector drawing streams to monochrome DeviceGray. Significantly reduces ink usage and printing costs.
          </div>
        </div>
      `;
    }

    if (id === 'pdf-to-text') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Text Extraction Format</label>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); margin-bottom: 14px;">
            Parses decompressed text streams using vector font encoding tables, preserving document reading flow and paragraphs.
          </div>
          <button type="button" class="btn btn-outline" id="btn-options-copy-text" style="width: 100%; justify-content: center; gap: 8px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy Full Text to Clipboard</span>
          </button>
        </div>
      `;
    }

    if (id === 'unlock') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Document Password (If Protected)</label>
          <input type="password" id="workflow-unlock-password" class="input-sm" placeholder="Leave blank if owner-restricted" value="${instance.unlockPassword}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;" />
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            If the PDF has restrictions preventing printing, copying, or form changes, LetsEdit strips the encryption dictionary so you have full unrestricted access.
          </div>
        </div>
      `;
    }

    if (id === 'rename') {
      const primary = instance.uploadedFiles[0];
      const defaultName = instance.renameCustomName || (primary ? primary.name.replace(/\.pdf$/i, '_renamed.pdf') : 'document.pdf');
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">New Filename</label>
          <input type="text" id="workflow-rename-input" class="input-sm" value="${defaultName}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-weight: 600; margin-bottom: 12px;" />
          <button type="button" class="btn btn-sm btn-outline" id="btn-auto-detect-heading" style="width: 100%; justify-content: center; gap: 8px; margin-bottom: 12px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"></path></svg>
            <span>Auto-Detect Title from Page 1</span>
          </button>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            Inspects top heading and typography in the PDF text layer to suggest an authentic document title.
          </div>
        </div>
      `;
    }

    if (id === 'sign') {
      const isRequest = instance.signWorkflowMode === 'request';
      return `
        <div class="workflow-options-group">
          <!-- Flow Switcher: Sign Myself vs Request Signatures -->
          <div style="display: flex; gap: 6px; margin-bottom: 14px; background: var(--bg-surface); padding: 4px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <button type="button" class="btn btn-xs ${!isRequest ? 'btn-primary' : 'btn-ghost'} btn-sign-flow-mode" data-flow="self" style="flex: 1; padding: 7px 4px; font-weight: 600;">
              👤 Sign Myself
            </button>
            <button type="button" class="btn btn-xs ${isRequest ? 'btn-primary' : 'btn-ghost'} btn-sign-flow-mode" data-flow="request" style="flex: 1; padding: 7px 4px; font-weight: 600;">
              👥 Request Signatures
            </button>
          </div>

          ${isRequest ? `
            <div style="background: rgba(48, 5, 13, 0.04); border: 1.5px solid rgba(48, 5, 13, 0.18); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <strong style="font-size: 13px; color: #30050d;">Multi-Signer Workflow</strong>
                <span style="font-size: 10.5px; font-weight: 700; background: #30050d; color: white; padding: 2px 8px; border-radius: 12px;">eIDAS / Adobe Sign</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin: 0 0 14px;">
                Place interactive signature, initials, date, and form fields onto pages and send private signing links to multiple recipients.
              </p>

              <button type="button" id="btn-open-field-placer" class="workflow-primary-cta" style="background: linear-gradient(135deg, #30050d 0%, #520815 100%); width: 100%; justify-content: center; font-size: 13.5px; padding: 12px; box-shadow: 0 4px 12px rgba(48,5,13,0.25);">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Launch Visual Field Placer</span>
              </button>
            </div>
          ` : `
          <label class="workflow-options-label">Signature Creation</label>
          <div class="split-mode-pills" style="margin-bottom: 12px;">
            <button type="button" class="split-mode-pill ${instance.signMode === 'draw' ? 'active' : ''}" data-sign-mode="draw">
              Draw Ink
            </button>
            <button type="button" class="split-mode-pill ${instance.signMode === 'type' ? 'active' : ''}" data-sign-mode="type">
              Type Name
            </button>
            <button type="button" class="split-mode-pill ${instance.signMode === 'upload' ? 'active' : ''}" data-sign-mode="upload">
              Upload Image
            </button>
          </div>

          ${instance.signMode === 'draw' ? `
            <div style="background: var(--bg-surface); border: 1.5px dashed var(--border-strong); border-radius: 8px; padding: 6px; text-align: center;">
              <canvas id="workflow-sig-canvas" width="280" height="110" style="background: white; border-radius: 6px; cursor: crosshair; touch-action: none; width: 100%; height: 110px; display: block;"></canvas>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding: 0 4px;">
                <span style="font-size: 11px; color: var(--text-muted);">Sign with mouse / touch</span>
                <button type="button" class="btn btn-xs btn-outline" id="btn-clear-sig-canvas">Clear</button>
              </div>
            </div>
          ` : instance.signMode === 'type' ? `
            <div>
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Full Name / Initials</label>
              <input type="text" id="workflow-sign-name" class="input-sm" value="${instance.signName}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 10px;" placeholder="e.g. John Doe" />
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Calligraphic Font</label>
              <select id="workflow-sign-font" class="input-sm" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
                <option value="Caveat" ${instance.signFont === 'Caveat' ? 'selected' : ''}>Caveat (Cursive)</option>
                <option value="Dancing Script" ${instance.signFont === 'Dancing Script' ? 'selected' : ''}>Dancing Script (Flowing)</option>
                <option value="Pacifico" ${instance.signFont === 'Pacifico' ? 'selected' : ''}>Pacifico (Bold)</option>
                <option value="Great Vibes" ${instance.signFont === 'Great Vibes' ? 'selected' : ''}>Great Vibes (Formal Calligraphy)</option>
              </select>
            </div>
          ` : `
            <div>
              <input type="file" id="workflow-sign-upload" accept="image/png,image/jpeg,image/svg+xml" style="display:none;" />
              <button type="button" class="btn btn-sm btn-outline" id="btn-trigger-sign-upload" style="width: 100%; justify-content: center; gap: 8px; padding: 12px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span>Upload Signature Image</span>
              </button>
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px; text-align: center;">PNG with transparent background recommended</span>
            </div>
          `}

          <div style="margin-top: 14px;">
            <label class="workflow-options-label">Placement Position</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              ${['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
                <button type="button" class="btn btn-xs ${instance.signPos === pos ? 'btn-primary' : 'btn-outline'} btn-sign-pos" data-pos="${pos}" style="font-size: 11px; padding: 6px 4px; text-transform: capitalize;">
                  ${pos.replace('-', ' ')}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="margin-top: 14px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div>
              <strong style="font-size: 12px; display: block; color: var(--text-main);">Include Date Stamp</strong>
              <span style="font-size: 11px; color: var(--text-muted);">${instance.signDate}</span>
            </div>
            <input type="checkbox" id="chk-include-sign-date" ${instance.includeSignDate ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;" />
          </div>

          <div style="margin-top: 14px;">
            <label class="workflow-options-label">Signer Email (Audit Record)</label>
            <input type="email" id="workflow-sign-email" class="input-sm" placeholder="signer@example.com" value="${instance.signEmail || ''}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 12px;" />
          </div>

          <div style="margin-top: 14px; padding: 12px; background: rgba(48, 5, 13, 0.04); border: 1px solid rgba(48, 5, 13, 0.15); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #30050d; color: #fff; font-size: 11px;">🔒</span>
              <strong style="font-size: 12px; color: #30050d;">eIDAS & ESIGN Cryptographic Audit</strong>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 10px 0; line-height: 1.4;">
              Generates SHA-256 tamper-evident integrity hashes, legal transaction IDs, and vector verification QR codes.
            </p>

            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-top: 1px dashed rgba(48, 5, 13, 0.1);">
              <div>
                <strong style="font-size: 12px; display: block; color: var(--text-main);">Append Audit Sheet to PDF</strong>
                <span style="font-size: 10.5px; color: var(--text-muted);">Adds official 1-page certificate to document</span>
              </div>
              <input type="checkbox" id="chk-append-audit-cert" ${instance.appendAuditCertificate !== false ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;" />
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-top: 1px dashed rgba(48, 5, 13, 0.1); margin-top: 4px;">
              <div>
                <strong style="font-size: 12px; display: block; color: var(--text-main);">Embed Tamper Badge</strong>
                <span style="font-size: 10.5px; color: var(--text-muted);">Displays verified seal under signature</span>
              </div>
              <input type="checkbox" id="chk-embed-sign-badge" ${instance.embedSignBadge !== false ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;" />
            </div>
          </div>
          `}
        </div>
      `;
    }

    if (id === 'pagenumbers') {
      const pageCount = primary.pageCount || 1;
      return `
        <div class="workflow-options-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="workflow-options-label" style="margin: 0;">Numbering Format</label>
            <span style="font-size: 11px; font-weight: 600; color: #30050d; background: rgba(48, 5, 13, 0.08); padding: 2px 8px; border-radius: 12px;">
              ${pageCount} pages total
            </span>
          </div>

          <input type="text" id="workflow-pn-format" class="input-sm" value="${instance.pnFormat}" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-weight: 600; margin-bottom: 6px;" />
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 8px;">
            Tokens: <code>{n}</code> = Page number, <code>{total}</code> = Total pages
          </span>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="Page {n} of {total}">Page {n} of {total}</button>
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="{n} / {total}">{n} / {total}</button>
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="Page {n}">Page {n}</button>
            <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="- {n} -">- {n} -</button>
          </div>

          <label class="workflow-options-label">Position On Page</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px;">
            ${['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
              <button type="button" class="btn btn-xs ${instance.pnPos === pos ? 'btn-primary' : 'btn-outline'} btn-pn-pos" data-pos="${pos}" style="font-size: 11px; padding: 6px 4px; text-transform: capitalize;">
                ${pos.replace('-', ' ')}
              </button>
            `).join('')}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">First Number</label>
              <input type="number" id="workflow-pn-start" class="input-sm" min="1" value="${instance.pnStartPage}" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Font Size</label>
              <select id="workflow-pn-size" class="input-sm" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
                <option value="8" ${instance.pnFontSize === 8 ? 'selected' : ''}>8 pt (Small)</option>
                <option value="10" ${instance.pnFontSize === 10 ? 'selected' : ''}>10 pt (Standard)</option>
                <option value="12" ${instance.pnFontSize === 12 ? 'selected' : ''}>12 pt (Medium)</option>
                <option value="14" ${instance.pnFontSize === 14 ? 'selected' : ''}>14 pt (Large)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    if (id === 'redact') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Sensitive Words or Phrases to Redact</label>
          <textarea id="workflow-redact-keywords" class="input-sm" placeholder="Enter keywords to redact (e.g. John Doe, Confidential, 123-45-6789), separated by commas..." style="width: 100%; height: 75px; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 13px; line-height: 1.4; resize: vertical; margin-bottom: 12px;">${instance.redactKeywords || ''}</textarea>

          <label class="workflow-options-label">Redaction Appearance</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn btn-xs ${instance.redactColor === '#000000' ? 'btn-primary' : 'btn-outline'} btn-redact-color" data-color="#000000" style="padding: 8px; font-weight: 600;">
              Blackout Box
            </button>
            <button type="button" class="btn btn-xs ${instance.redactColor === '#ffffff' ? 'btn-primary' : 'btn-outline'} btn-redact-color" data-color="#ffffff" style="padding: 8px; font-weight: 600;">
              Whiteout Box
            </button>
          </div>

          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #ef4444; line-height: 1.5;">
            <strong>Permanent Vector Redaction:</strong> The underlying text stream operators are permanently scrubbed from the PDF binary so sensitive information cannot be copied or retrieved.
          </div>
        </div>
      `;
    }

    if (id === 'scan') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Scanner Optimization</label>
          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: var(--text-main);">
              <input type="checkbox" id="chk-scan-contrast" checked style="width: 16px; height: 16px;" />
              <span>Auto-enhance document contrast</span>
            </label>
          </div>

          <label class="workflow-options-label">Page Margins</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" class="btn btn-xs ${instance.imgMargin === '0' ? 'btn-primary' : 'btn-outline'} btn-scan-margin" data-margin="0">Fit to Edge</button>
            <button type="button" class="btn btn-xs ${instance.imgMargin === '20' ? 'btn-primary' : 'btn-outline'} btn-scan-margin" data-margin="20">Add Margin (20pt)</button>
          </div>
        </div>
      `;
    }

    if (id === 'excel-to-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Document Title</label>
          <input type="text" id="workflow-excel-title" class="input-sm" value="${instance.excelTitle || primary.name?.replace(/\.[^/.]+$/, '') || 'Spreadsheet Report'}" placeholder="Spreadsheet Report" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;" />

          <label class="workflow-options-label">Page Orientation</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px;">
            <button type="button" class="btn btn-xs ${(!instance.excelOrientation || instance.excelOrientation === 'auto') ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="auto">Auto</button>
            <button type="button" class="btn btn-xs ${instance.excelOrientation === 'portrait' ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="portrait">Portrait</button>
            <button type="button" class="btn btn-xs ${instance.excelOrientation === 'landscape' ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="landscape">Landscape</button>
          </div>

          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            Supports Excel (.xlsx, .xls) and CSV sheets. Generates vector tables with styled headers, alternating row colors, and auto-pagination.
          </div>
        </div>
      `;
    }

    if (id === 'ppt-to-pdf') {
      return `
        <div class="workflow-options-group">
          <label class="workflow-options-label">Presentation Title</label>
          <input type="text" id="workflow-ppt-title" class="input-sm" value="${instance.pptTitle || primary.name?.replace(/\.[^/.]+$/, '') || 'Presentation Deck'}" placeholder="Presentation Deck" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;" />

          <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            Converts slide texts, bullets, and titles into 16:9 widescreen landscape PDF presentation pages with executive header banners and footer slide counters.
          </div>
        </div>
      `;
    }

    return `
      <div class="workflow-options-group">
        <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 13px; color: var(--text-muted); line-height: 1.5;">
          Ready to execute 100% in your browser. No files are uploaded to any server.
        </div>
      </div>
    `;
  }
