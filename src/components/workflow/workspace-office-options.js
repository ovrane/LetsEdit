/**
 * Workspace Office Conversion Options Panels
 * Handles HTML options generation for:
 * - word-to-pdf: Page size, orientation, margins, font family
 * - pdf-to-word: Reflow mode (Flow vs Frame), table detector sensitivity
 * - excel-to-pdf: Fit mode (fit-columns, fit-sheet, none), orientation, gridlines, zebra stripes
 * - pdf-to-excel: Output format (.xlsx vs .csv), number normalization toggle
 * - ppt-to-pdf: Handout layout modes (1-up, 2-up, 3-up with notes lines, 6-up grid)
 * - pdf-to-ppt: Conversion mode (Fully Editable vs Hybrid Visual Slides), Aspect ratio (Auto, 16:9, 4:3)
 */

export function renderWordToPdfOptionsHtml(instance) {
  const size = instance.wordPageSize || 'a4';
  const font = instance.wordFontFamily || 'calibri';

  return `
    <div class="workflow-options-group">
      <label class="workflow-options-label">Output Page Size</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
        <button type="button" class="btn btn-xs ${size === 'a4' ? 'btn-primary' : 'btn-outline'} btn-word-size" data-size="a4">A4 (210 × 297 mm)</button>
        <button type="button" class="btn btn-xs ${size === 'letter' ? 'btn-primary' : 'btn-outline'} btn-word-size" data-size="letter">US Letter (8.5 × 11 in)</button>
      </div>

      <label class="workflow-options-label">Default Typography</label>
      <select id="word-font-select" class="select-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
        <option value="calibri" ${font === 'calibri' ? 'selected' : ''}>Calibri (Standard Executive)</option>
        <option value="helvetica" ${font === 'helvetica' ? 'selected' : ''}>Helvetica / Arial (Modern Clean Sans)</option>
        <option value="times" ${font === 'times' ? 'selected' : ''}>Times Roman (Classic Serif)</option>
        <option value="courier" ${font === 'courier' ? 'selected' : ''}>Courier (Monospace Code / Terminal)</option>
      </select>

      <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
        Parses OpenXML Word document elements, preserving Heading 1 & 2 styles, bold & italic character formatting, bulleted lists, and structured data tables.
      </div>
    </div>
  `;
}

export function renderPdfToWordOptionsHtml(instance) {
  const mode = instance.pdfToWordMode || 'flow';
  const sensitivity = instance.pdfToWordTableSensitivity || 'balanced';

  return `
    <div class="workflow-options-group">
      <label class="workflow-options-label">Conversion Mode</label>
      <select id="pdf-to-word-mode-select" class="select-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
        <option value="flow" ${mode === 'flow' ? 'selected' : ''}>Flowing Paragraphs (Reflowable text for easy editing)</option>
        <option value="frame" ${mode === 'frame' ? 'selected' : ''}>Exact Visual Frame (Fixed layout line preservation)</option>
      </select>

      <label class="workflow-options-label">Table Structural Detector</label>
      <select id="pdf-to-word-table-select" class="select-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 14px;">
        <option value="balanced" ${sensitivity === 'balanced' ? 'selected' : ''}>Balanced (Auto-detect aligned text grids)</option>
        <option value="strict" ${sensitivity === 'strict' ? 'selected' : ''}>Strict (High precision column coordinate matching)</option>
        <option value="aggressive" ${sensitivity === 'aggressive' ? 'selected' : ''}>Aggressive (Extract all spaced gutters as tables)</option>
      </select>

      <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
        Reconstructs continuous paragraphs, Heading 1 &amp; 2 hierarchy, and native Word &lt;w:tbl&gt; data grids with pure client-side zero-telemetry.
      </div>
    </div>
  `;
}

export function renderExcelToPdfOptionsHtml(instance) {
  const fit = instance.excelFitMode || 'fit-columns';

  return `
    <div class="workflow-options-group">
      <label class="workflow-options-label">Table Fit Mode</label>
      <select id="excel-fitmode-select" class="select-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
        <option value="fit-columns" ${fit === 'fit-columns' ? 'selected' : ''}>Fit All Columns to 1 Page Width</option>
        <option value="fit-sheet" ${fit === 'fit-sheet' ? 'selected' : ''}>Fit Entire Sheet on 1 Page</option>
        <option value="none" ${fit === 'none' ? 'selected' : ''}>No Scaling (100% Natural Size)</option>
      </select>

      <label class="workflow-options-label">Page Orientation</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px;">
        <button type="button" class="btn btn-xs ${(!instance.excelOrientation || instance.excelOrientation === 'auto') ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="auto">Auto</button>
        <button type="button" class="btn btn-xs ${instance.excelOrientation === 'portrait' ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="portrait">Portrait</button>
        <button type="button" class="btn btn-xs ${instance.excelOrientation === 'landscape' ? 'btn-primary' : 'btn-outline'} btn-excel-orient" data-orient="landscape">Landscape</button>
      </div>

      <div style="display: flex; gap: 14px; margin-bottom: 12px;">
        <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
          <input type="checkbox" id="excel-gridlines-chk" ${instance.excelGridlines !== false ? 'checked' : ''} /> Gridlines
        </label>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
          <input type="checkbox" id="excel-zebra-chk" ${instance.excelZebra !== false ? 'checked' : ''} /> Zebra Stripes
        </label>
      </div>

      <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
        Parses OpenXML Excel workbooks and RFC-4180 CSV streams with auto-fit column calculations and vector table styling.
      </div>
    </div>
  `;
}

export function renderPdfToExcelOptionsHtml(instance) {
  const fmt = instance.pdfToExcelFormat || 'xlsx';
  const norm = instance.pdfToExcelNormalize !== false;

  return `
    <div class="workflow-options-group">
      <label class="workflow-options-label">Output Spreadsheet Format</label>
      <select id="pdf-to-excel-format-select" class="select-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
        <option value="xlsx" ${fmt === 'xlsx' ? 'selected' : ''}>Microsoft Excel (.xlsx)</option>
        <option value="csv" ${fmt === 'csv' ? 'selected' : ''}>Comma-Separated Values (.csv)</option>
      </select>

      <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 12px; cursor: pointer;">
        <input type="checkbox" id="pdf-to-excel-normalize-chk" ${norm ? 'checked' : ''} />
        <span>Format Numbers for Calculation ($1,234.56 &rarr; 1234.56)</span>
      </label>

      <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--bg-surface); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
        Extracts multi-column tabular grids into styled Excel worksheets with auto-detected headers and vector borders.
      </div>
    </div>
  `;
}

export function renderPptToPdfOptionsHtml(instance) {
  const layout = instance.pptHandoutLayout || '1-up';

  return `
    <div class="workflow-options-group">
      <label class="workflow-options-label">Handout Layout Mode</label>
      <select id="ppt-handout-select" class="select-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
        <option value="1-up" ${layout === '1-up' ? 'selected' : ''}>1 Slide Per Page (16:9 Widescreen)</option>
        <option value="2-up" ${layout === '2-up' ? 'selected' : ''}>2 Slides Per Page (Stacked Handout)</option>
        <option value="3-up" ${layout === '3-up' ? 'selected' : ''}>3 Slides Per Page + Meeting Notes Lines</option>
        <option value="6-up" ${layout === '6-up' ? 'selected' : ''}>6 Slides Overview Grid</option>
      </select>
      <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
        Converts PowerPoint (.pptx) presentation decks into vector slides or executive meeting handouts.
      </div>
    </div>
  `;
}

export function renderPdfToPptOptionsHtml(instance) {
  const mode = instance.pdfToPptMode || 'editable';
  const ratio = instance.pdfToPptAspectRatio || 'auto';

  return `
    <div class="workflow-options-group">
      <label class="workflow-options-label">Conversion Mode</label>
      <select id="pdf-to-ppt-mode-select" class="select-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); margin-bottom: 12px;">
        <option value="editable" ${mode === 'editable' ? 'selected' : ''}>Fully Editable Slides (Native Shapes & Text)</option>
        <option value="hybrid" ${mode === 'hybrid' ? 'selected' : ''}>Hybrid Visual (High-Fidelity Structure + Overlaid Text)</option>
      </select>

      <label class="workflow-options-label">Slide Aspect Ratio</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px;">
        <button type="button" class="btn btn-xs ${ratio === 'auto' ? 'btn-primary' : 'btn-outline'} btn-pdf-ppt-ratio" data-ratio="auto">Auto</button>
        <button type="button" class="btn btn-xs ${ratio === '16:9' ? 'btn-primary' : 'btn-outline'} btn-pdf-ppt-ratio" data-ratio="16:9">16:9 Wide</button>
        <button type="button" class="btn btn-xs ${ratio === '4:3' ? 'btn-primary' : 'btn-outline'} btn-pdf-ppt-ratio" data-ratio="4:3">4:3 Standard</button>
      </div>

      <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); line-height: 1.5;">
        Decomposes PDF pages into editable PowerPoint (.pptx) presentations with native titles, bullet lists, and cards.
      </div>
    </div>
  `;
}
