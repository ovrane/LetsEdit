/**
 * HTML5 & Markdown to PDF Workspace Options Component
 * Interactive HUD controls for typography themes, page sizes, margins, and running headers/footers.
 */

export function renderHtmlToPdfOptionsHtml(instance) {
  const theme = instance.htmlPdfTheme || 'modern';
  const pageSize = instance.htmlPdfPageSize || 'A4';
  const orientation = instance.htmlPdfOrientation || 'portrait';
  const margin = instance.htmlPdfMargin || 40;
  const showHeader = instance.htmlPdfShowHeader !== false;
  const showFooter = instance.htmlPdfShowFooter !== false;
  const primary = instance.uploadedFiles[0] || {};
  const defaultTitle = primary.name ? primary.name.replace(/\.[^/.]+$/, '') : 'Web Document';
  const docTitle = instance.htmlPdfDocTitle || defaultTitle;

  return `
    <div class="workflow-options-group" style="padding: 4px 0;">
      <label class="workflow-options-label" style="font-weight: 700; margin-bottom: 8px; display: block;">Document Title</label>
      <input type="text" id="html-pdf-title-input" value="${docTitle}" placeholder="Document Title..." style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 13px; margin-bottom: 16px;" />

      <label class="workflow-options-label" style="font-weight: 700; margin-bottom: 8px; display: block;">Typography Theme</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
        <button type="button" class="btn btn-sm ${theme === 'modern' ? 'btn-primary' : 'btn-outline'}" data-html-theme="modern" style="justify-content: flex-start; padding: 8px 12px; text-align: left; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; font-size: 12.5px;">Executive Modern</div>
            <div style="font-size: 10.5px; opacity: 0.8;">Clean Blue Accents</div>
          </div>
        </button>
        <button type="button" class="btn btn-sm ${theme === 'technical' ? 'btn-primary' : 'btn-outline'}" data-html-theme="technical" style="justify-content: flex-start; padding: 8px 12px; text-align: left; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; font-size: 12.5px;">Technical Doc</div>
            <div style="font-size: 10.5px; opacity: 0.8;">Emerald & Code Boxes</div>
          </div>
        </button>
        <button type="button" class="btn btn-sm ${theme === 'academic' ? 'btn-primary' : 'btn-outline'}" data-html-theme="academic" style="justify-content: flex-start; padding: 8px 12px; text-align: left; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; font-size: 12.5px;">Academic Paper</div>
            <div style="font-size: 10.5px; opacity: 0.8;">Formal Maroon Serif</div>
          </div>
        </button>
        <button type="button" class="btn btn-sm ${theme === 'elegant' ? 'btn-primary' : 'btn-outline'}" data-html-theme="elegant" style="justify-content: flex-start; padding: 8px 12px; text-align: left; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; font-size: 12.5px;">Executive Slate</div>
            <div style="font-size: 10.5px; opacity: 0.8;">Minimalist Dark Slate</div>
          </div>
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
        <div>
          <label class="workflow-options-label" style="font-size: 12px; margin-bottom: 6px; display: block;">Page Format</label>
          <select id="html-pdf-pagesize-select" style="width: 100%; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 12.5px;">
            <option value="A4" ${pageSize === 'A4' ? 'selected' : ''}>A4 (210 × 297 mm)</option>
            <option value="Letter" ${pageSize === 'Letter' ? 'selected' : ''}>US Letter (8.5 × 11 in)</option>
          </select>
        </div>

        <div>
          <label class="workflow-options-label" style="font-size: 12px; margin-bottom: 6px; display: block;">Orientation</label>
          <select id="html-pdf-orientation-select" style="width: 100%; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 12.5px;">
            <option value="portrait" ${orientation === 'portrait' ? 'selected' : ''}>Portrait</option>
            <option value="landscape" ${orientation === 'landscape' ? 'selected' : ''}>Landscape</option>
          </select>
        </div>
      </div>

      <div style="margin-bottom: 14px;">
        <label class="workflow-options-label" style="font-size: 12px; margin-bottom: 6px; display: block;">Page Margins</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
          <button type="button" class="btn btn-sm ${margin === 25 ? 'btn-primary' : 'btn-outline'}" data-html-margin="25" style="border-radius: 6px; font-size: 11.5px;">Compact (25pt)</button>
          <button type="button" class="btn btn-sm ${margin === 40 ? 'btn-primary' : 'btn-outline'}" data-html-margin="40" style="border-radius: 6px; font-size: 11.5px;">Normal (40pt)</button>
          <button type="button" class="btn btn-sm ${margin === 60 ? 'btn-primary' : 'btn-outline'}" data-html-margin="60" style="border-radius: 6px; font-size: 11.5px;">Wide (60pt)</button>
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: var(--text-main);">
          <input type="checkbox" id="html-pdf-check-header" ${showHeader ? 'checked' : ''} style="accent-color: var(--primary);" />
          <span>Include running document header</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: var(--text-main);">
          <input type="checkbox" id="html-pdf-check-footer" ${showFooter ? 'checked' : ''} style="accent-color: var(--primary);" />
          <span>Include running footer with page numbers (Page X of Y)</span>
        </label>
      </div>
    </div>
  `;
}
