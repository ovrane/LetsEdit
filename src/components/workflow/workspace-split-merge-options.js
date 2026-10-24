/**
 * Workspace Split & Merge Options Sub-Module (Stage 2)
 * Reverse-engineered from Sejda & Adobe Acrobat Advanced Merge & Split specifications:
 * - Advanced Merge: Table of Contents (TOC) page, PDF Outline Bookmarks,
 *   Cover Page creation, and continuous page numbering.
 * - Advanced Split: Range extraction, All pages to ZIP, Split by Size,
 *   Split by Bookmarks, and Split by Text / Keyword / Invoice Change with dynamic patterns.
 */

export function renderAdvancedMergeOptionsHtml(manager) {
  return `
    <div class="workflow-options-group">
      <label class="workflow-options-label">Merge Order & Arrangement</label>
      <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px;">
        Files will be compiled in the sequence shown above. Drag cards to reorder or click the rotation icon to adjust page orientation.
      </div>

      <!-- Advanced Sejda/Adobe Merge Controls -->
      <label class="workflow-options-label" style="margin-top: 10px;">Executive Document Options</label>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <!-- Generate TOC -->
        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--text-main); cursor: pointer; padding: 8px 10px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-subtle);">
          <input type="checkbox" id="merge-opt-toc" ${manager.mergeGenerateToc ? 'checked' : ''} style="margin-top: 2px;" />
          <div>
            <strong style="display: block;">Table of Contents (TOC)</strong>
            <span style="font-size: 11px; color: var(--text-muted);">Generates a table of contents page at page 1 with dot leaders and page numbers.</span>
          </div>
        </label>

        <!-- Bookmarks Outline -->
        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--text-main); cursor: pointer; padding: 8px 10px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-subtle);">
          <input type="checkbox" id="merge-opt-bookmarks" ${manager.mergeBookmarks !== false ? 'checked' : ''} style="margin-top: 2px;" />
          <div>
            <strong style="display: block;">PDF Outline Bookmarks</strong>
            <span style="font-size: 11px; color: var(--text-muted);">Embeds PDF reader sidebar bookmarks pointing to each document's starting page.</span>
          </div>
        </label>

        <!-- Page Numbers -->
        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--text-main); cursor: pointer; padding: 8px 10px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-subtle);">
          <input type="checkbox" id="merge-opt-pagenums" ${manager.mergePageNums ? 'checked' : ''} style="margin-top: 2px;" />
          <div>
            <strong style="display: block;">Continuous Page Numbering</strong>
            <span style="font-size: 11px; color: var(--text-muted);">Stamps consecutive footer page numbers ("Page X of Y") across all merged sheets.</span>
          </div>
        </label>

        <!-- Cover Page -->
        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--text-main); cursor: pointer; padding: 8px 10px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-subtle);">
          <input type="checkbox" id="merge-opt-cover" ${manager.mergeAddCover ? 'checked' : ''} style="margin-top: 2px;" />
          <div>
            <strong style="display: block;">Include Executive Cover Page</strong>
            <span style="font-size: 11px; color: var(--text-muted);">Inserts an executive title sheet with custom project name, date, and author.</span>
          </div>
        </label>

        ${manager.mergeAddCover ? `
          <div style="background: var(--bg-card); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
            <div>
              <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 3px;">Cover Title</label>
              <input type="text" id="merge-cover-title" class="input-sm" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); font-size: 12px;" value="${manager.mergeCoverTitle || 'Combined Document Package'}" />
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 3px;">Subtitle / Notes</label>
              <input type="text" id="merge-cover-sub" class="input-sm" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); font-size: 12px;" value="${manager.mergeCoverSub || 'Compiled with LetsEdit PDF Studio'}" />
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function renderAdvancedSplitOptionsHtml(manager) {
  const primary = manager.uploadedFiles[0] || {};
  const pageCount = primary.pageCount || 1;
  const mode = manager.splitMode || 'ranges';

  return `
    <div class="workflow-options-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <label class="workflow-options-label" style="margin: 0;">Split Mode</label>
        <span style="font-size: 11px; font-weight: 600; color: var(--primary); background: rgba(48, 5, 13, 0.08); padding: 2px 8px; border-radius: 12px;">
          ${pageCount} total pages
        </span>
      </div>

      <div class="split-mode-pills" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
        <button type="button" class="split-mode-pill ${mode === 'ranges' ? 'active' : ''}" data-split-mode="ranges">
          Custom Ranges
        </button>
        <button type="button" class="split-mode-pill ${mode === 'all' ? 'active' : ''}" data-split-mode="all">
          Extract All
        </button>
        <button type="button" class="split-mode-pill ${mode === 'size' ? 'active' : ''}" data-split-mode="size">
          By Size
        </button>
        <button type="button" class="split-mode-pill ${mode === 'bookmarks' ? 'active' : ''}" data-split-mode="bookmarks">
          By Bookmarks
        </button>
        <button type="button" class="split-mode-pill ${mode === 'text' ? 'active' : ''}" data-split-mode="text" style="color: #2563eb; font-weight: 600;">
          ⚡ By Text / Invoice
        </button>
      </div>

      ${mode === 'ranges' ? `
        <div style="margin-top: 6px;">
          <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Page Ranges</label>
          <input type="text" id="split-range-input" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${manager.splitRange || '1'}" placeholder="e.g. 1-2, 3-5" />
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">
            Specify comma-separated ranges. Example: <code>1-${Math.min(2, pageCount)}, ${Math.min(3, pageCount)}-${pageCount}</code>
          </span>
        </div>
      ` : mode === 'all' ? `
        <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); margin-top: 6px;">
          Every single page of this document will be separated into individual PDF files bundled into a convenient ZIP package.
        </div>
      ` : mode === 'size' ? `
        <div style="margin-top: 6px;">
          <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">Maximum Target Size (MB)</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="number" id="split-size-input" class="input-sm" style="width: 90px; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${Math.round((manager.splitMaxBytes || 5242880) / (1024 * 1024)) || 5}" min="1" max="500" />
            <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">MB per file</span>
          </div>
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 6px;">
            Subdivides the PDF into parts so that each generated document is below your target file size.
          </span>
        </div>
      ` : mode === 'bookmarks' ? `
        <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-muted); margin-top: 6px;">
          Detects the PDF's Table of Contents outline bookmarks and automatically extracts chapters/sections into individual PDF files.
        </div>
      ` : `
        <!-- Split by Text / Invoice Change -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">
              Keyword or Regex Pattern
            </label>
            <input type="text" id="split-text-keyword" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${manager.splitTextKeyword || 'Invoice'}" placeholder="e.g. Invoice, Chapter, INV-\\d+" />
            <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">
              Regex capture groups supported: <code>Invoice\\s*#?\\s*(\\w+)</code>
            </span>
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">
              Split Trigger Rule
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button type="button" class="btn btn-xs ${manager.splitTextMode !== 'change' ? 'btn-primary' : 'btn-outline'} btn-split-trigger" data-trigger="contains" style="justify-content: center; padding: 6px 8px;">
                Keyword Appears
              </button>
              <button type="button" class="btn btn-xs ${manager.splitTextMode === 'change' ? 'btn-primary' : 'btn-outline'} btn-split-trigger" data-trigger="change" style="justify-content: center; padding: 6px 8px;">
                Value Changes
              </button>
            </div>
            <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">
              ${manager.splitTextMode === 'change' ? 'Starts a new document whenever the captured invoice/chapter ID changes.' : 'Starts a new document on every page containing the keyword.'}
            </span>
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 4px;">
              Filename Pattern
            </label>
            <input type="text" id="split-text-pattern" class="input-sm" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: monospace; font-size: 11.5px;" value="${manager.splitTextPattern || '[text]_[n].pdf'}" />
            <div style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
              <span class="badge-chip token-chip" data-token="[text]" style="cursor: pointer; font-size: 10.5px; padding: 1px 6px; background: rgba(37,99,235,0.1); color: #2563eb; border-radius: 4px;">+ [text]</span>
              <span class="badge-chip token-chip" data-token="[n]" style="cursor: pointer; font-size: 10.5px; padding: 1px 6px; background: rgba(37,99,235,0.1); color: #2563eb; border-radius: 4px;">+ [n]</span>
              <span class="badge-chip token-chip" data-token="[pages]" style="cursor: pointer; font-size: 10.5px; padding: 1px 6px; background: rgba(37,99,235,0.1); color: #2563eb; border-radius: 4px;">+ [pages]</span>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}

export function bindSplitMergeEvents(manager) {
  const container = manager.container;
  if (!container) return;

  // Merge options events
  const tocCb = container.querySelector('#merge-opt-toc');
  if (tocCb) {
    tocCb.onchange = (e) => {
      manager.mergeGenerateToc = e.target.checked;
    };
  }

  const bmCb = container.querySelector('#merge-opt-bookmarks');
  if (bmCb) {
    bmCb.onchange = (e) => {
      manager.mergeBookmarks = e.target.checked;
    };
  }

  const pnumsCb = container.querySelector('#merge-opt-pagenums');
  if (pnumsCb) {
    pnumsCb.onchange = (e) => {
      manager.mergePageNums = e.target.checked;
    };
  }

  const coverCb = container.querySelector('#merge-opt-cover');
  if (coverCb) {
    coverCb.onchange = (e) => {
      manager.mergeAddCover = e.target.checked;
      manager.render();
    };
  }

  const coverTitleInp = container.querySelector('#merge-cover-title');
  if (coverTitleInp) {
    coverTitleInp.oninput = (e) => {
      manager.mergeCoverTitle = e.target.value;
    };
  }

  const coverSubInp = container.querySelector('#merge-cover-sub');
  if (coverSubInp) {
    coverSubInp.oninput = (e) => {
      manager.mergeCoverSub = e.target.value;
    };
  }

  // Split mode pills
  container.querySelectorAll('.split-mode-pill').forEach(btn => {
    btn.onclick = () => {
      manager.splitMode = btn.getAttribute('data-split-mode');
      manager.render();
    };
  });

  // Split range input
  const splitRangeInp = container.querySelector('#split-range-input');
  if (splitRangeInp) {
    splitRangeInp.oninput = (e) => {
      manager.splitRange = e.target.value;
    };
  }

  // Split size input
  const splitSizeInp = container.querySelector('#split-size-input');
  if (splitSizeInp) {
    splitSizeInp.oninput = (e) => {
      const mb = parseInt(e.target.value, 10) || 5;
      manager.splitMaxBytes = mb * 1024 * 1024;
    };
  }

  // Split text keyword input
  const splitKeywordInp = container.querySelector('#split-text-keyword');
  if (splitKeywordInp) {
    splitKeywordInp.oninput = (e) => {
      manager.splitTextKeyword = e.target.value;
    };
  }

  // Split trigger rule
  container.querySelectorAll('.btn-split-trigger').forEach(btn => {
    btn.onclick = () => {
      manager.splitTextMode = btn.getAttribute('data-trigger');
      manager.render();
    };
  });

  // Split text pattern input
  const splitPatternInp = container.querySelector('#split-text-pattern');
  if (splitPatternInp) {
    splitPatternInp.oninput = (e) => {
      manager.splitTextPattern = e.target.value;
    };
  }

  // Pattern token chips
  container.querySelectorAll('.token-chip').forEach(chip => {
    chip.onclick = () => {
      const token = chip.getAttribute('data-token');
      if (splitPatternInp && token) {
        splitPatternInp.value += token;
        manager.splitTextPattern = splitPatternInp.value;
      }
    };
  });
}
