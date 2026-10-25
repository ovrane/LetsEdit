/**
 * Workspace Renderer Sub-Module
 * Renders the Stage 2 interactive workspace layout, preview cards,
 * tools sidebars, and execution button labels.
 */

import { formatFileSize } from '../../utils/helpers.js';

export function getExecuteButtonLabel(manager) {
  const id = manager.activeTool.id;
  const isCombiner = ['merge', 'compare', 'images-to-pdf', 'alternate-mix', 'scan', 'organize'].includes(id);
  const count = manager.uploadedFiles.length;
  const batchPrefix = (!isCombiner && id !== 'split' && count > 1) ? `Batch (${count} files) — ` : '';

  if (id === 'merge') return `Merge PDF (${count} files)`;
  if (id === 'compress') return `${batchPrefix}Compress PDF`;
  if (id === 'split') {
    if (manager.splitMode === 'size') return `Split by Size (${Math.round(manager.splitMaxBytes / (1024 * 1024))}MB)`;
    if (manager.splitMode === 'bookmarks') return 'Split by Bookmarks';
    if (manager.splitMode === 'all') return 'Extract All Pages';
    return 'Split PDF Ranges';
  }
  if (id === 'images-to-pdf') return 'Convert to PDF';
  if (id === 'to-image') return `${batchPrefix}Convert to ${manager.imageFormat === 'image/jpeg' ? 'JPG' : 'PNG'}`;
  if (id === 'ocr-pdf') return `${batchPrefix}Run OCR`;
  if (id === 'watermark') return `${batchPrefix}Apply Watermark`;
  if (id === 'security') return `${batchPrefix}Encrypt & Protect PDF`;
  if (id === 'rotate') return `${batchPrefix}Rotate PDF Pages`;
  if (id === 'crop') return `${batchPrefix}Apply Crop`;
  if (['resize', 'resize-pdf', 'resize-margins', 'page-margins'].includes(id)) return `${batchPrefix}Apply Page Margins & Resize`;
  if (id === 'grayscale') return `${batchPrefix}Convert to Grayscale`;
  if (id === 'flip') return `${batchPrefix}Mirror / Flip Pages`;
  if (id === 'repair') return `${batchPrefix}Repair PDF`;
  if (id === 'compare') return 'Compare Documents';
  if (id === 'pdfa') return `${batchPrefix}Convert to PDF/A`;
  if (id === 'extract-images') return `${batchPrefix}Extract All Images`;
  if (id === 'pdf-to-text') return `${batchPrefix}Extract Text`;
  if (id === 'deskew') return `${batchPrefix}Straighten & Save PDF`;
  if (id === 'organize') return `Save Organized PDF (${manager.organizePages.length} pages)`;
  if (id === 'bates') return `${batchPrefix}Apply Bates Numbering`;
  if (['nup', 'n-up', 'nup-pdf'].includes(id)) return `${batchPrefix}Apply ${manager.nupConfig?.layout || manager.nupCount || 2}-Up Imposition`;
  if (id === 'split-half') return `${batchPrefix}Split in Half (${manager.splitHalfDirection})`;
  if (id === 'alternate-mix') return 'Mix & Interleave Documents';
  if (id === 'html-to-pdf') return `${batchPrefix}Convert HTML to PDF`;
  if (id === 'word-to-pdf') return `${batchPrefix}Convert DOCX to PDF`;
  if (id === 'pdf-to-word') return `${batchPrefix}Convert to Word DOC`;
  if (id === 'pdf-to-excel') return `${batchPrefix}Export to CSV / Excel`;
  if (id === 'pdf-to-ppt') return `${batchPrefix}Export to PPT Slides`;
  if (id === 'unlock') return `${batchPrefix}Unlock & Decrypt PDF`;
  if (id === 'remove-annotations') return `${batchPrefix}Clean Annotations`;
  if (id === 'rename') return `${batchPrefix}Save Renamed PDF`;
  if (id === 'sign') return 'Sign Document & Finish';
  if (id === 'pagenumbers') return `${batchPrefix}Apply Page Numbers`;
  if (id === 'flatten') return `${batchPrefix}Flatten PDF Forms`;
  if (id === 'redact') return `${batchPrefix}Permanently Redact PDF`;
  if (id === 'scan') return 'Compile Scanned PDF';
  if (id === 'excel-to-pdf') return `${batchPrefix}Convert Excel to PDF`;
  if (id === 'ppt-to-pdf') return `${batchPrefix}Convert PowerPoint to PDF`;
  if (id === 'edit-metadata') return 'Apply Metadata & Sync XMP';
  if (id === 'pagelabels') return 'Apply Multi-Section Page Labels';
  if (['sanitize', 'sanitize-pdf'].includes(id)) return `${batchPrefix}Sanitize & Remove Hidden Data`;
  if (['bookmarks', 'outlines', 'pdf-bookmarks'].includes(id)) return 'Apply Bookmarks & Outline Tree';
  if (['header-footer', 'header_footer', 'add-header-footer'].includes(id)) return `${batchPrefix}Apply Headers & Footers`;
  return `${batchPrefix}Process with ${manager.activeTool.title}`;
}

export function renderToolWorkspace(manager) {
  const t = manager.activeTool;

  manager.container.innerHTML = `
    <header class="workflow-header">
      <div class="workflow-header-inner">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="workflow-back-btn" id="btn-workspace-back" title="Back to upload">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
            <span>Change Files</span>
          </button>
          <div class="lets-logo" id="workspace-brand-logo" style="cursor: pointer;">
            <div class="lets-logo-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
              </svg>
            </div>
            <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
          </div>
          <span class="workflow-active-badge">${t.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${t.id === 'scan' ? `
            <button class="btn btn-sm btn-primary" id="btn-workspace-camera" style="display: flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <span>Snap with Camera</span>
            </button>
            <button class="btn btn-sm btn-outline" id="btn-workspace-mobile-pair" style="display: flex; align-items: center; gap: 6px; border-color: var(--primary); color: var(--primary);">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              <span>Phone QR</span>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline" id="btn-workspace-add-more">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
            <span>Add more files</span>
          </button>
          <button class="btn btn-sm btn-outline" id="btn-workspace-gdrive" title="Add files from Google Drive" style="display: flex; align-items: center; gap: 5px; padding: 6px 10px;">
            <svg width="15" height="15" viewBox="0 0 87.3 78" fill="none"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.55h27.5L43.65 25z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.2 7.85 13.6z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832d"/><path d="M59.8 48.55H27.5L13.75 72.35c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25L59.8 48.55z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 23.55h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-17.55z" fill="#ffba00"/></svg>
            <span class="hide-mobile" style="font-size: 11.5px; font-weight: 600;">Drive</span>
          </button>
          <button class="btn btn-sm btn-outline" id="btn-workspace-dropbox" title="Add files from Dropbox" style="display: flex; align-items: center; gap: 5px; padding: 6px 10px;">
            <svg width="15" height="15" fill="#0061ff" viewBox="0 0 24 24"><path d="M7.05 3.5L1.5 7.14l4.5 3.59 5.55-3.64-4.5-3.59zm9.9 0l-4.5 3.59 5.55 3.64 4.5-3.59-5.55-3.64zM1.5 14.33l5.55 3.64 4.5-3.59-5.55-3.64-4.5 3.59zm21 0l-4.5-3.59-5.55 3.64 4.5 3.59 5.55-3.64zM7.05 19.06l4.5 3.59 4.5-3.59-4.5-3.59-4.5 3.59z"/></svg>
            <span class="hide-mobile" style="font-size: 11.5px; font-weight: 600;">Dropbox</span>
          </button>
          <input type="file" id="workspace-add-more-input" accept="${t.accept}" ${t.multiple ? 'multiple' : ''} style="display:none;" />
        </div>
      </div>
    </header>

    <main class="workflow-workspace-main">
      <div class="workflow-workspace-layout">
        <!-- Left/Center: Visual File Cards & Previews with Drag-and-Drop Reordering -->
        <div class="workflow-cards-area">
          ${t.id === 'deskew' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Scan Alignment & Straighten</span>
                <span style="font-size: 11px; color: #0891b2; background: rgba(8, 145, 178, 0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(8, 145, 178, 0.25);">
                  Grid Guidelines Active
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="deskew-workspace-wrap">
              <div class="deskew-preview-container">
                <div class="deskew-grid-overlay"></div>
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="deskew-img-preview" class="deskew-preview-image" style="transform: rotate(${manager.deskewAngle}deg); transition: transform 0.08s ease-out;" />
                <div class="deskew-angle-badge" id="deskew-badge-preview">
                  ${manager.deskewAngle > 0 ? `+${manager.deskewAngle.toFixed(1)}` : manager.deskewAngle.toFixed(1)}°
                </div>
              </div>
            </div>
          ` : t.id === 'organize' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">
                  ${manager.organizePages.length} page(s)
                </span>
                <span style="font-size: 11px; color: var(--text-muted); background: var(--bg-surface); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                  Drag page cards to resequence
                </span>
              </div>
              <div style="display: gap: 8px;">
                <button class="btn btn-sm btn-outline" id="btn-organize-top-rotate" title="Rotate all 90°">
                  <span>Rotate All</span>
                </button>
                <button class="btn btn-sm btn-outline" id="btn-organize-top-reset" title="Reset order">
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <!-- Pages Grid for Organize Tool -->
            <div class="workflow-file-grid" id="organize-pages-grid">
              ${manager.organizePages.map((p, idx) => `
                <div class="workflow-file-card organize-page-card ${manager.draggedPageIndex === idx ? 'dragging' : ''}" data-page-idx="${idx}" draggable="true" title="Drag to reorder Page #${idx + 1}">
                  <button class="file-card-delete btn-delete-page" data-del-page="${idx}" title="Delete this page">&times;</button>
                  <div class="file-card-preview">
                    <img src="${p.thumbnailUrl}" alt="page preview" class="file-card-thumb" style="transform: rotate(${p.rotation || 0}deg); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);" />
                  </div>
                  <div class="file-card-details">
                    <span class="file-card-name">Page ${p.pageNum}</span>
                    <span class="file-card-size">${p.rotation ? `${p.rotation}° rotated` : 'Standard'}</span>
                  </div>
                  <div class="file-card-actions">
                    <button class="btn-icon btn-sm btn-rotate-page" data-rot-page="${idx}" title="Rotate 90° Clockwise">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                    </button>
                    <span class="file-card-order">#${idx + 1}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : t.id === 'crop' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Crop Margins Preview</span>
                <span id="crop-dimensions-badge" style="font-size: 11px; color: #0d9488; background: rgba(13, 148, 136, 0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(13, 148, 136, 0.25);">
                  Active Area: ${Math.max(20, Math.round(595.28 - manager.cropLeft - manager.cropRight))} × ${Math.max(20, Math.round(841.89 - manager.cropTop - manager.cropBottom))} pt
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="crop-workspace-wrap">
              <div class="crop-preview-container" id="crop-preview-container">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="crop-page-img" class="crop-page-img" />
                <div class="crop-marquee-box" id="crop-marquee-box" style="inset: ${manager.cropTop * 0.35}px ${manager.cropRight * 0.35}px ${manager.cropBottom * 0.35}px ${manager.cropLeft * 0.35}px;">
                  <div class="crop-handle crop-handle-nw"></div>
                  <div class="crop-handle crop-handle-n"></div>
                  <div class="crop-handle crop-handle-ne"></div>
                  <div class="crop-handle crop-handle-e"></div>
                  <div class="crop-handle crop-handle-se"></div>
                  <div class="crop-handle crop-handle-s"></div>
                  <div class="crop-handle crop-handle-sw"></div>
                  <div class="crop-handle crop-handle-w"></div>
                </div>
              </div>
            </div>
          ` : ['resize', 'resize-pdf', 'resize-margins', 'page-margins'].includes(t.id) ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Page Margins & Bounds Preview</span>
                <span style="font-size: 11px; color: #6366f1; background: rgba(99, 102, 241, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.25);">
                  ${(manager.resizeConfig?.pageSize || 'original').toUpperCase()} Standard
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="resize-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div id="resize-outer-sheet" style="position: relative; width: 300px; height: 420px; background: ${manager.resizeConfig?.backgroundColor || '#ffffff'}; border: 2px solid var(--border-strong); border-radius: 4px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); display: flex; align-items: center; justify-content: center;">
                <div id="resize-inner-page" style="position: absolute; top: ${(manager.resizeConfig?.marginTop || 0) * 0.35}px; bottom: ${(manager.resizeConfig?.marginBottom || 0) * 0.35}px; left: ${((manager.resizeConfig?.marginLeft || 0) + (manager.resizeConfig?.bindingGutter || 0)) * 0.35}px; right: ${(manager.resizeConfig?.marginRight || 0) * 0.35}px; background: rgba(99, 102, 241, 0.08); border: 1.5px dashed #6366f1; border-radius: 2px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;">
                  <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: 100%; object-fit: contain; opacity: 0.85;" />
                  <div style="position: absolute; bottom: 8px; font-size: 10px; color: #6366f1; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                    Printable Content
                  </div>
                </div>
              </div>
            </div>
          ` : t.id === 'bates' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Bates Numbering Preview</span>
                <span id="bates-preview-badge" style="font-size: 11px; color: #1e293b; background: rgba(30, 41, 59, 0.1); padding: 3px 8px; border-radius: 6px; font-family: monospace; font-weight: 700; border: 1px solid rgba(30, 41, 59, 0.25);">
                  ${manager.batesPrefix}${String(manager.batesStart).padStart(manager.batesDigits, '0')}${manager.batesSuffix}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="bates-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="bates-page-img" style="width: 100%; height: auto; display: block;" />
                <div id="bates-overlay-stamp" style="position: absolute; ${manager.getBatesPositionCss()}; background: rgba(255, 255, 255, 0.9); padding: 4px 8px; border-radius: 4px; border: 1px dashed ${manager.batesColor}; font-family: monospace; font-size: 11px; font-weight: 700; color: ${manager.batesColor}; pointer-events: none; transition: all 0.2s ease;">
                  ${manager.batesPrefix}${String(manager.batesStart).padStart(manager.batesDigits, '0')}${manager.batesSuffix}
                </div>
              </div>
            </div>
          ` : ['nup', 'n-up', 'nup-pdf'].includes(t.id) ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Imposition Layout Preview</span>
                <span style="font-size: 11px; color: #3b82f6; background: rgba(59, 130, 246, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(59, 130, 246, 0.25);">
                  ${manager.nupConfig?.layout || manager.nupCount || 2}-Up Layout
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="nup-workspace-wrap" style="display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="background: ${manager.nupConfig?.backgroundColor || '#ffffff'}; border: 2px solid var(--border-strong); box-shadow: 0 12px 28px rgba(0,0,0,0.2); border-radius: 6px; padding: 16px; ${(manager.nupConfig?.orientation === 'landscape' || (!manager.nupConfig?.orientation && (manager.nupConfig?.layout || manager.nupCount || 2) === 2)) ? 'width: 420px; height: 297px;' : 'width: 297px; height: 420px;'} display: grid; grid-template-columns: repeat(${(manager.nupConfig?.layout || manager.nupCount || 2) === 2 && (manager.nupConfig?.orientation === 'landscape' || !manager.nupConfig?.orientation) ? 2 : (manager.nupConfig?.layout || 2) === 6 && manager.nupConfig?.orientation === 'landscape' ? 3 : (manager.nupConfig?.layout || 2) === 8 && manager.nupConfig?.orientation === 'landscape' ? 4 : 2}, 1fr); gap: 10px;">
                ${Array.from({ length: manager.nupConfig?.layout || manager.nupCount || 2 }).map((_, i) => `
                  <div style="border: ${manager.nupConfig?.showBorder ? `1px solid ${manager.nupConfig?.borderColor || '#94a3b8'}` : '1px dashed #64748b'}; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; color: #475569; font-size: 11px; font-weight: 600; min-height: 50px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <span style="margin-top: 2px;">Page ${i + 1}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : t.id === 'split-half' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Book Scan Bisecting Preview</span>
                <span style="font-size: 11px; color: #4f46e5; background: rgba(79, 70, 229, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(79, 70, 229, 0.25);">
                  ${manager.splitHalfDirection === 'vertical' ? 'Vertical Center Cut (Left & Right)' : 'Horizontal Center Cut (Top & Bottom)'}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="split-half-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 340px;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />
                ${manager.splitHalfDirection === 'vertical' ? `
                  <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; border-left: 2px dashed #ef4444; transform: translateX(-1px); pointer-events: none;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">✂</div>
                  </div>
                ` : `
                  <div style="position: absolute; left: 0; right: 0; top: 50%; height: 2px; border-top: 2px dashed #ef4444; transform: translateY(-1px); pointer-events: none;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">✂</div>
                  </div>
                `}
              </div>
            </div>
          ` : t.id === 'flip' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Mirror & Flip Preview</span>
                <span style="font-size: 11px; color: #8b5cf6; background: rgba(139, 92, 246, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(139, 92, 246, 0.25);">
                  ${manager.flipDirection === 'horizontal' ? 'Horizontal (Left-Right)' : (manager.flipDirection === 'vertical' ? 'Vertical (Top-Bottom)' : 'Both Axes')}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="flip-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="flip-page-img" style="width: 100%; height: auto; display: block; transform: ${manager.flipDirection === 'horizontal' ? 'scaleX(-1)' : (manager.flipDirection === 'vertical' ? 'scaleY(-1)' : 'scale(-1, -1)')}; transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);" />
              </div>
            </div>
          ` : t.id === 'grayscale' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Monochrome Desaturation Preview</span>
                <span style="font-size: 11px; color: #475569; background: rgba(71, 85, 105, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(71, 85, 105, 0.25);">
                  DeviceGray Simulation
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="grayscale-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="grayscale-page-img" style="width: 100%; height: auto; display: block; filter: ${manager.grayscalePreviewActive !== false ? 'grayscale(100%) contrast(105%)' : 'none'}; transition: filter 0.25s ease;" />
                <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(15, 23, 42, 0.85); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; backdrop-filter: blur(4px);">
                  ${manager.grayscalePreviewActive !== false ? '● Grayscale Preview' : '● Original Color'}
                </div>
              </div>
            </div>
          ` : t.id === 'fill-forms' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Interactive Form Visual Inspection</span>
                <span style="font-size: 11px; color: #2563eb; background: rgba(37, 99, 235, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(37, 99, 235, 0.25);">
                  ${manager.detectedFormFields?.length || 0} AcroForm Fields Active
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="form-filler-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 6px; overflow: hidden; background: white; max-width: 480px; width: 100%;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="form-filler-page-preview" style="width: 100%; height: auto; display: block;" />
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(15, 23, 42, 0.85); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; backdrop-filter: blur(4px);">
                  Page 1 of ${manager.uploadedFiles[0]?.pageCount || 1}
                </div>
              </div>
              <div style="margin-top: 14px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Edit values in the right panel to live-populate fields</span>
              </div>
            </div>
          ` : t.id === 'edit-metadata' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Document Properties & XMP Schema Inspection</span>
                <span style="font-size: 11px; color: #6366f1; background: rgba(99, 102, 241, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.25);">
                  ${manager.documentMetadata?.hasXmp ? 'ISO 16684-1 Synced' : 'Ready to Sync'}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="metadata-center-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 12px 36px rgba(0,0,0,0.18); border-radius: 6px; overflow: hidden; background: white; max-width: 380px; width: 100%;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="metadata-page-preview" style="width: 100%; height: auto; display: block;" />
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(15, 23, 42, 0.85); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; backdrop-filter: blur(4px);">
                  ${manager.uploadedFiles[0]?.pageCount || 1} Page${manager.uploadedFiles[0]?.pageCount === 1 ? '' : 's'}
                </div>
              </div>
              <div style="margin-top: 16px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Adobe Acrobat Pro standard document properties & Dublin Core XMP metadata editor</span>
              </div>
            </div>
          ` : t.id === 'pagelabels' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Multi-Section Page Labels Preview</span>
                <span style="font-size: 11px; color: #6366f1; background: rgba(99, 102, 241, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.25);">
                  ${manager.pageLabelSections?.length || 1} Section${manager.pageLabelSections?.length === 1 ? '' : 's'} Configured
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="pagelabels-center-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 12px 36px rgba(0,0,0,0.18); border-radius: 6px; overflow: hidden; background: white; max-width: 380px; width: 100%;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="pagelabels-page-preview" style="width: 100%; height: auto; display: block;" />
                <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.9); color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; backdrop-filter: blur(4px); border: 1px solid rgba(56, 189, 248, 0.3);">
                  Label: ${manager.pageLabelsInspection?.pageLabels?.[0]?.label || 'i'}
                </div>
              </div>
              <div style="margin-top: 16px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>ISO 32000-1 PageLabels number tree embedded in PDF catalog</span>
              </div>
            </div>
          ` : ['sanitize', 'sanitize-pdf'].includes(t.id) ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Document Privacy & Anti-Forensics Preview</span>
                <span style="font-size: 11px; color: ${manager.sanitizeInspection?.riskLevel === 'high' ? '#ef4444' : manager.sanitizeInspection?.riskLevel === 'moderate' ? '#f59e0b' : '#10b981'}; background: ${manager.sanitizeInspection?.riskLevel === 'high' ? 'rgba(239, 68, 68, 0.1)' : manager.sanitizeInspection?.riskLevel === 'moderate' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid currentColor;">
                  ${manager.sanitizeInspection?.riskLevel === 'high' ? '🔴 High Risk Hidden Vectors' : manager.sanitizeInspection?.riskLevel === 'moderate' ? '🟡 Moderate Risk' : '🟢 Ready to Sanitize'}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="sanitize-center-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 12px 36px rgba(0,0,0,0.18); border-radius: 6px; overflow: hidden; background: white; max-width: 380px; width: 100%;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(15, 23, 42, 0.85); color: #f8fafc; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.15); display: flex; align-items: center; gap: 4px;">
                  <span>🛡️</span> Zero-Trace Sanitization
                </div>
              </div>
              <div style="margin-top: 16px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>Full catalog strip: XMP, PieceInfo, OpenActions, and orphaned object stream purge</span>
              </div>
            </div>
          ` : ['bookmarks', 'outlines', 'pdf-bookmarks'].includes(t.id) ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Document Bookmarks & Outline Tree</span>
                <span style="font-size: 11px; color: #6366f1; background: rgba(99, 102, 241, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.25);">
                  ${manager.outlineItems?.length || 0} Root Section${manager.outlineItems?.length === 1 ? '' : 's'}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="bookmarks-center-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 12px 36px rgba(0,0,0,0.18); border-radius: 6px; overflow: hidden; background: white; max-width: 380px; width: 100%;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="bookmarks-page-preview" style="width: 100%; height: auto; display: block;" />
                <div style="position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); color: #a5b4fc; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; backdrop-filter: blur(4px); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; gap: 4px;">
                  <span>📑</span> ${manager.outlineItems?.[0]?.title || 'Interactive Outline'}
                </div>
              </div>
              <div style="margin-top: 16px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                <span>ISO 32000-1 /Outlines hierarchy embedded in document catalog</span>
              </div>
            </div>
          ` : ['header-footer', 'header_footer', 'add-header-footer'].includes(t.id) ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Multi-Zone Header & Footer Preview</span>
                <span style="font-size: 11px; color: #4338ca; background: rgba(99, 102, 241, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.25);">
                  ${manager.headerFooterConfig?.skipFirst ? 'Cover Page Excluded' : 'All Pages'}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="hf-center-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 30px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 12px 36px rgba(0,0,0,0.18); border-radius: 6px; overflow: hidden; background: white; max-width: 380px; width: 100%;">
                <!-- Header Stamp Simulation -->
                <div style="position: absolute; top: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; font-size: 9px; color: ${manager.headerFooterConfig?.color || '#334155'}; font-weight: 600; pointer-events: none; border-bottom: ${manager.headerFooterConfig?.hasHeaderDivider ? '0.75px solid #cbd5e1' : 'none'}; padding-bottom: 2px;">
                  <span>${manager.headerFooterConfig?.leftHeader || ''}</span>
                  <span>${manager.headerFooterConfig?.centerHeader ? '<<Title>>' : ''}</span>
                  <span>${manager.headerFooterConfig?.rightHeader ? '<<Date>>' : ''}</span>
                </div>

                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />

                <!-- Footer Stamp Simulation -->
                <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; font-size: 9px; color: ${manager.headerFooterConfig?.color || '#334155'}; font-weight: 600; pointer-events: none; border-top: ${manager.headerFooterConfig?.hasFooterDivider ? '0.75px solid #cbd5e1' : 'none'}; padding-top: 2px;">
                  <span>${manager.headerFooterConfig?.leftFooter ? 'document.pdf' : ''}</span>
                  <span>${manager.headerFooterConfig?.centerFooter ? 'Page 1 of ' + (manager.uploadedFiles[0]?.pageCount || 1) : ''}</span>
                  <span>${manager.headerFooterConfig?.rightFooter || ''}</span>
                </div>
              </div>
              <div style="margin-top: 16px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" fill="none" stroke="#4338ca" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Dynamic macros interpolated and stamped directly into page vector content streams</span>
              </div>
            </div>
          ` : t.id === 'pdf-to-text' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Extracted Plain Text Preview</span>
                <span id="text-word-count-badge" style="font-size: 11px; color: #334155; background: rgba(51, 65, 85, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(51, 65, 85, 0.25);">
                  ${manager.extractedTextPreview ? `${manager.extractedTextPreview.split(/\s+/).filter(Boolean).length} words` : 'Inspecting text...'}
                </span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-outline" id="btn-copy-extracted-text">
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Copy Text</span>
                </button>
              </div>
            </div>

            <div class="text-extract-workspace-wrap" style="display: grid; grid-template-columns: 240px 1fr; gap: 20px; background: var(--bg-surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; background: white; align-self: start;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; height: 100%;">
                <textarea id="extracted-text-area" readonly style="width: 100%; flex: 1; min-height: 380px; padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; line-height: 1.6; resize: none;" placeholder="Extracting searchable text from document...">${manager.extractedTextPreview || 'Loading plain text streams...'}</textarea>
              </div>
            </div>
          ` : t.id === 'unlock' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Unlock Security & Permissions</span>
                <span style="font-size: 11px; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.25);">
                  Zero Restrictions
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="unlock-workspace-wrap" style="position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-surface); padding: 36px 20px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px; text-align: center;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
              </div>
              <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Remove PDF Password & Permissions</h3>
              <p style="font-size: 13px; color: var(--text-muted); max-width: 420px; line-height: 1.5; margin-bottom: 24px;">
                Strip owner passwords, printing blocks, copying limitations, and editing restrictions permanently from this document.
              </p>
              <div style="box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12); border-radius: 4px; overflow: hidden; background: white; max-width: 200px;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" style="width: 100%; height: auto; display: block;" />
              </div>
            </div>
          ` : t.id === 'sign' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Electronic Signature Stamp</span>
                <span style="font-size: 11px; color: #30050d; background: rgba(48, 5, 13, 0.08); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(48, 5, 13, 0.25);">
                  ${manager.signMode === 'draw' ? 'Handwritten Ink' : (manager.signMode === 'type' ? 'Calligraphic Stamp' : 'Uploaded Signature')}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="sign-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="sign-page-img" style="width: 100%; height: auto; display: block;" />
                <div id="sign-preview-overlay" style="position: absolute; ${manager.getSignPositionCss()}; background: rgba(255, 255, 255, 0.95); padding: 6px 12px; border-radius: 6px; border: 1.5px dashed #30050d; box-shadow: 0 4px 12px rgba(48, 5, 13, 0.15); pointer-events: none; transition: all 0.2s ease; text-align: center;">
                  ${manager.signDataUrl ? `
                    <img src="${manager.signDataUrl}" style="height: 38px; width: auto; max-width: 120px; display: block; margin: 0 auto;" />
                  ` : `
                    <div style="font-family: '${manager.signFont}', cursive, sans-serif; font-size: 20px; color: #0f172a; line-height: 1.2;">
                      ${manager.signName || 'Authorized Signature'}
                    </div>
                  `}
                  ${manager.includeSignDate ? `
                    <div style="font-size: 9px; color: #64748b; margin-top: 2px; font-family: sans-serif;">Signed: ${manager.signDate}</div>
                  ` : ''}
                </div>
              </div>
            </div>
          ` : t.id === 'pagenumbers' ? `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">Page Numbering Preview</span>
                <span style="font-size: 11px; color: #30050d; background: rgba(48, 5, 13, 0.08); padding: 3px 8px; border-radius: 6px; font-weight: 600; border: 1px solid rgba(48, 5, 13, 0.25);">
                  ${manager.getPnPositionLabel()}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                ${manager.uploadedFiles[0]?.name || ''}
              </div>
            </div>

            <div class="pn-workspace-wrap" style="position: relative; display: flex; justify-content: center; align-items: center; background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-subtle); min-height: 440px;">
              <div style="position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden; background: white; max-width: 320px;">
                <img src="${manager.uploadedFiles[0]?.thumbnailUrl || ''}" id="pn-page-img" style="width: 100%; height: auto; display: block;" />
                <div id="pn-preview-badge-overlay" style="position: absolute; ${manager.getPnPositionCss()}; background: rgba(255, 255, 255, 0.92); padding: 3px 8px; border-radius: 4px; border: 1px dashed #30050d; font-size: 10px; font-weight: 600; color: #1e293b; pointer-events: none; transition: all 0.2s ease;">
                  ${(manager.pnFormat || 'Page {n} of {total}').replace('{n}', '1').replace('{total}', String(manager.uploadedFiles[0]?.pageCount || 5))}
                </div>
              </div>
            </div>
          ` : `
            <div class="workflow-cards-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 14px;">
                  ${manager.uploadedFiles.length} file(s) selected
                </span>
                <span style="font-size: 11px; color: var(--text-muted); background: var(--bg-surface); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                  Drag cards to reorder
                </span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-outline" id="btn-workspace-sort-az" title="Sort A to Z">
                  <span>A-Z</span>
                </button>
                <button class="btn btn-sm btn-outline" id="btn-workspace-sort-za" title="Sort Z to A">
                  <span>Z-A</span>
                </button>
                <button class="btn btn-sm btn-outline" id="btn-workspace-reverse" title="Reverse order">
                  <span>⇄ Reverse</span>
                </button>
                <button class="btn btn-sm btn-outline" id="btn-workspace-clear" title="Clear all">
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            <!-- Cards Grid -->
            <div class="workflow-file-grid" id="workflow-file-grid">
              ${manager.uploadedFiles.map((f, idx) => `
                <div class="workflow-file-card" data-idx="${idx}" draggable="true" title="Drag to reorder file #${idx + 1}">
                  <button class="file-card-delete" data-del-idx="${idx}" title="Remove file">&times;</button>
                  <div class="file-card-preview">
                    ${f.thumbnailUrl
                      ? `<img src="${f.thumbnailUrl}" alt="page preview" class="file-card-thumb" style="transform: rotate(${f.rotation || 0}deg);" />`
                      : `<div class="file-card-pdf-icon" style="transform: rotate(${f.rotation || 0}deg);">
                          <svg width="40" height="40" fill="none" stroke="${t.color}" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <span style="font-size: 10px; font-weight: 700; color: ${t.color}; margin-top: 4px;">PDF</span>
                        </div>`
                    }
                  </div>
                  <div class="file-card-details">
                    <span class="file-card-name" title="${f.name}">${f.name}</span>
                    <span class="file-card-size">
                      ${f.pageCount ? `${f.pageCount} ${f.pageCount === 1 ? 'page' : 'pages'} • ` : ''}${formatFileSize(f.size)}
                    </span>
                  </div>
                  <div class="file-card-actions">
                    <button class="btn-icon btn-sm" data-move-left="${idx}" title="Move left" ${idx === 0 ? 'disabled style="opacity:0.35;cursor:default;"' : ''}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg>
                    </button>
                    <button class="btn-icon btn-sm" data-move-right="${idx}" title="Move right" ${idx === manager.uploadedFiles.length - 1 ? 'disabled style="opacity:0.35;cursor:default;"' : ''}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
                    </button>
                    <button class="btn-icon btn-sm" data-rot-idx="${idx}" title="Rotate 90°">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                    </button>
                    <span class="file-card-order">#${idx + 1}</span>
                  </div>
                </div>
              `).join('')}
              ${t.multiple ? `
                <div class="workflow-file-card workflow-file-add-card" id="card-workspace-add-more" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px; border: 2px dashed var(--border-color); border-radius: 12px; cursor: pointer; background: var(--bg-surface); transition: all 0.2s ease;" title="Add more files">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: ${t.color}18; color: ${t.color}; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                  </div>
                  <span style="font-weight: 600; font-size: 13px; color: var(--text-main);">Add more files</span>
                  <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Click or drop files</span>
                </div>
              ` : ''}
            </div>
          `}
        </div>

        <!-- Right: Dedicated Tool Options & Primary Action Sidebar -->
        <aside class="workflow-sidebar-card">
          <h3 class="workflow-sidebar-title">${t.title}</h3>
          <p class="workflow-sidebar-desc">${t.subtitle}</p>

          ${manager.renderToolOptionsHtml()}

          <button class="workflow-execute-btn" id="btn-workspace-execute" style="background: ${t.color};">
            <span>${getExecuteButtonLabel(manager)}</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
          </button>
        </aside>
      </div>
    </main>
  `;

  manager.bindWorkspaceEvents();
}
