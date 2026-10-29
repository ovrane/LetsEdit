/**
 * Embedded Images Extraction Workspace Options Component
 * Interactive HUD controls for image size filtering, format selection, and deduplication.
 */

export function renderExtractImagesOptionsHtml(instance) {
  const minSize = instance.extractMinSize || '0';
  const deduplicate = instance.extractDeduplicate !== false;
  const targetFormat = instance.extractTargetFormat || 'all';

  return `
    <div class="workflow-options-group" style="padding: 4px 0;">
      <label class="workflow-options-label" style="font-weight: 700; margin-bottom: 8px; display: block;">Image Filter & Quality</label>
      
      <div style="margin-bottom: 14px;">
        <label class="workflow-options-label" style="font-size: 12px; margin-bottom: 6px; display: block;">Minimum Resolution Threshold</label>
        <select id="extract-minsize-select" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 12.5px;">
          <option value="0" ${minSize === '0' ? 'selected' : ''}>Extract All Images (Icons, Stamps & Photos)</option>
          <option value="100" ${minSize === '100' ? 'selected' : ''}>Ignore Small Icons (&gt; 100 × 100 px)</option>
          <option value="300" ${minSize === '300' ? 'selected' : ''}>High-Resolution Photos Only (&gt; 300 × 300 px)</option>
        </select>
      </div>

      <div style="margin-bottom: 14px;">
        <label class="workflow-options-label" style="font-size: 12px; margin-bottom: 6px; display: block;">Format Selection</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
          <button type="button" class="btn btn-sm ${targetFormat === 'all' ? 'btn-primary' : 'btn-outline'}" data-extract-format="all" style="border-radius: 6px; font-size: 11.5px;">All Formats</button>
          <button type="button" class="btn btn-sm ${targetFormat === 'jpg' ? 'btn-primary' : 'btn-outline'}" data-extract-format="jpg" style="border-radius: 6px; font-size: 11.5px;">JPG Only</button>
          <button type="button" class="btn btn-sm ${targetFormat === 'png' ? 'btn-primary' : 'btn-outline'}" data-extract-format="png" style="border-radius: 6px; font-size: 11.5px;">PNG Only</button>
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-bottom: 14px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: var(--text-main);">
          <input type="checkbox" id="extract-deduplicate-check" ${deduplicate ? 'checked' : ''} style="accent-color: var(--primary);" />
          <span><strong>Deduplicate images:</strong> Skip repeating header/footer stamps</span>
        </label>
      </div>

      <div style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; font-size: 12px; color: var(--text-muted); line-height: 1.5;">
        <span>📦 <strong>Output Packaging:</strong> All images are extracted at original vector and raster resolutions and packaged into a ZIP archive along with an <code>image-manifest.json</code> metadata inventory.</span>
      </div>
    </div>
  `;
}
