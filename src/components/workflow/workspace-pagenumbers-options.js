/**
 * Workspace Options Sub-Module: Adobe Acrobat Pro & iLovePDF Dynamic Page Numbering
 * Supports: Arabic, Roman, Alphabetical numbering, customizable templates,
 * 6-zone anchor positions, cover page skip, margin offsets, font styling, and live preview.
 */

import { Toast } from '../toast.js';
import { PageOperations } from '../../core/engine/page-ops.js';

export function renderPageNumbersOptionsHtml(instance) {
  const primary = instance.uploadedFiles?.[0] || {};
  const pageCount = primary.pageCount || 1;

  const format = instance.pnFormat || 'Page {n} of {total}';
  const style = instance.pnStyle || 'arabic';
  const pos = instance.pnPos || 'bottom-center';
  const startNum = parseInt(instance.pnStartPage ?? 1, 10) || 1;
  const startPage = parseInt(instance.pnFirstPage ?? 1, 10) || 1;
  const fontSize = parseInt(instance.pnFontSize ?? 10, 10) || 10;
  const font = instance.pnFont || 'Helvetica';
  const color = instance.pnColor || '#475569';
  const rangeRule = instance.pnRangeRule || 'all';

  const previewText = format
    .replace('{n}', style.includes('roman') ? (style === 'roman-upper' ? 'I' : 'i') : (style.includes('letters') ? (style === 'letters-upper' ? 'A' : 'a') : String(startNum)))
    .replace('{total}', String(pageCount));

  return `
    <div class="workflow-options-group" style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Live Format Preview Badge -->
      <div style="background: linear-gradient(135deg, rgba(71, 85, 105, 0.05) 0%, rgba(71, 85, 105, 0.02) 100%); border: 1.5px solid rgba(71, 85, 105, 0.18); border-radius: 10px; padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Live Page Number Stamp</span>
          <span style="font-size: 10.5px; background: rgba(71, 85, 105, 0.12); color: #334155; padding: 2px 8px; border-radius: 12px; font-weight: 600;">
            ${pageCount} pages total
          </span>
        </div>
        <div id="pn-live-format-badge" style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13.5px; font-weight: 700; color: ${color}; background: rgba(255,255,255,0.85); padding: 8px 12px; border-radius: 6px; border: 1px dashed ${color}; text-align: center; word-break: break-all;">
          ${previewText}
        </div>
      </div>

      <!-- Format Template & Preset Buttons -->
      <div>
        <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Format Template</label>
        <input type="text" id="workflow-pn-format" class="input-sm" value="${format}" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-weight: 600; margin-bottom: 6px;" />
        <div style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 8px;">
          Tokens: <code>{n}</code> = Page number, <code>{total}</code> = Total pages
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="Page {n} of {total}" style="font-size: 11px; padding: 3px 8px;">Page {n} of {total}</button>
          <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="{n} / {total}" style="font-size: 11px; padding: 3px 8px;">{n} / {total}</button>
          <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="Page {n}" style="font-size: 11px; padding: 3px 8px;">Page {n}</button>
          <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="- {n} -" style="font-size: 11px; padding: 3px 8px;">- {n} -</button>
          <button type="button" class="btn btn-xs btn-outline btn-pn-preset" data-fmt="{n}" style="font-size: 11px; padding: 3px 8px;">{n}</button>
        </div>
      </div>

      <!-- Numbering Style & Range Rule -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Numbering Style</label>
          <select id="workflow-pn-style" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="arabic" ${style === 'arabic' ? 'selected' : ''}>1, 2, 3 (Arabic)</option>
            <option value="roman-lower" ${style === 'roman-lower' ? 'selected' : ''}>i, ii, iii (Roman Lower)</option>
            <option value="roman-upper" ${style === 'roman-upper' ? 'selected' : ''}>I, II, III (Roman Upper)</option>
            <option value="letters-lower" ${style === 'letters-lower' ? 'selected' : ''}>a, b, c (Alphabet Lower)</option>
            <option value="letters-upper" ${style === 'letters-upper' ? 'selected' : ''}>A, B, C (Alphabet Upper)</option>
          </select>
        </div>
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Page Target</label>
          <select id="workflow-pn-range" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="all" ${rangeRule === 'all' ? 'selected' : ''}>All Pages</option>
            <option value="skip-cover" ${rangeRule === 'skip-cover' ? 'selected' : ''}>Skip First Page (Cover)</option>
            <option value="odd" ${rangeRule === 'odd' ? 'selected' : ''}>Odd Pages (1, 3, 5...)</option>
            <option value="even" ${rangeRule === 'even' ? 'selected' : ''}>Even Pages (2, 4, 6...)</option>
          </select>
        </div>
      </div>

      <!-- 6-Zone Position Selector -->
      <div>
        <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 6px; display: block;">Position On Page</label>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          ${['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(p => `
            <button type="button" class="btn btn-xs ${pos === p ? 'btn-primary' : 'btn-outline'} btn-pn-zone" data-pos="${p}" style="font-size: 11px; padding: 6px 4px; text-transform: capitalize;">
              ${p.replace('-', ' ')}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- First Number & First Page Offset -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">First Number</label>
          <input type="number" id="workflow-pn-start" class="input-sm" min="1" value="${startNum}" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
        </div>
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Start On Page</label>
          <input type="number" id="workflow-pn-first-page" class="input-sm" min="1" max="${pageCount}" value="${startPage}" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" />
        </div>
      </div>

      <!-- Font Family & Font Size -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Font Family</label>
          <select id="workflow-pn-font" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="Helvetica" ${font === 'Helvetica' ? 'selected' : ''}>Helvetica Regular</option>
            <option value="HelveticaBold" ${font === 'HelveticaBold' ? 'selected' : ''}>Helvetica Bold</option>
            <option value="TimesRoman" ${font === 'TimesRoman' ? 'selected' : ''}>Times Roman</option>
            <option value="TimesRomanBold" ${font === 'TimesRomanBold' ? 'selected' : ''}>Times Roman Bold</option>
            <option value="Courier" ${font === 'Courier' ? 'selected' : ''}>Courier Mono</option>
          </select>
        </div>
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Font Size</label>
          <select id="workflow-pn-size" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="8" ${fontSize === 8 ? 'selected' : ''}>8 pt (Small)</option>
            <option value="9" ${fontSize === 9 ? 'selected' : ''}>9 pt</option>
            <option value="10" ${fontSize === 10 ? 'selected' : ''}>10 pt (Standard)</option>
            <option value="12" ${fontSize === 12 ? 'selected' : ''}>12 pt (Medium)</option>
            <option value="14" ${fontSize === 14 ? 'selected' : ''}>14 pt (Large)</option>
          </select>
        </div>
      </div>

      <!-- Color Picker -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin: 0;">Number Color</label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="color" id="workflow-pn-color" value="${color}" style="width: 32px; height: 30px; border-radius: 6px; border: 1px solid var(--border-subtle); cursor: pointer; padding: 2px;" />
          <span id="workflow-pn-color-label" style="font-size: 11px; font-family: monospace; color: var(--text-muted);">${color}</span>
        </div>
      </div>

      <!-- Sample Academic Whitepaper Document -->
      <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 4px;">
        <button type="button" class="btn btn-sm btn-outline" id="btn-load-pn-sample" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <span>Load Academic Research Whitepaper Sample</span>
        </button>
      </div>
    </div>
  `;
}

export function bindPageNumbersEvents(manager) {
  const container = manager.container;
  if (!container) return;

  const fmtInp = container.querySelector('#workflow-pn-format');
  const styleSel = container.querySelector('#workflow-pn-style');
  const rangeSel = container.querySelector('#workflow-pn-range');
  const startInp = container.querySelector('#workflow-pn-start');
  const firstPageInp = container.querySelector('#workflow-pn-first-page');
  const fontSel = container.querySelector('#workflow-pn-font');
  const sizeSel = container.querySelector('#workflow-pn-size');
  const colorPicker = container.querySelector('#workflow-pn-color');
  const colorLabel = container.querySelector('#workflow-pn-color-label');
  const presetBtns = container.querySelectorAll('.btn-pn-preset');
  const zoneBtns = container.querySelectorAll('.btn-pn-zone');
  const loadSampleBtn = container.querySelector('#btn-load-pn-sample');
  const liveBadge = container.querySelector('#pn-live-format-badge');

  const updateFormatLive = () => {
    const fmt = manager.pnFormat || 'Page {n} of {total}';
    const st = manager.pnStyle || 'arabic';
    const sn = parseInt(manager.pnStartPage ?? 1, 10) || 1;
    const clr = manager.pnColor || '#475569';
    const total = manager.uploadedFiles?.[0]?.pageCount || 4;

    let nVal = String(sn);
    if (st.includes('roman')) nVal = st === 'roman-upper' ? 'I' : 'i';
    else if (st.includes('letters')) nVal = st === 'letters-upper' ? 'A' : 'a';

    const formatted = fmt.replace('{n}', nVal).replace('{total}', String(total));

    if (liveBadge) {
      liveBadge.textContent = formatted;
      liveBadge.style.color = clr;
      liveBadge.style.borderColor = clr;
    }
  };

  if (fmtInp) {
    fmtInp.oninput = (e) => {
      manager.pnFormat = e.target.value;
      updateFormatLive();
    };
  }

  presetBtns.forEach(btn => {
    btn.onclick = () => {
      const f = btn.getAttribute('data-fmt');
      if (fmtInp && f) {
        fmtInp.value = f;
        manager.pnFormat = f;
        updateFormatLive();
      }
    };
  });

  if (styleSel) {
    styleSel.onchange = (e) => {
      manager.pnStyle = e.target.value;
      updateFormatLive();
    };
  }

  if (rangeSel) {
    rangeSel.onchange = (e) => {
      manager.pnRangeRule = e.target.value;
    };
  }

  if (startInp) {
    startInp.oninput = (e) => {
      manager.pnStartPage = parseInt(e.target.value, 10) || 1;
      updateFormatLive();
    };
  }

  if (firstPageInp) {
    firstPageInp.oninput = (e) => {
      manager.pnFirstPage = parseInt(e.target.value, 10) || 1;
    };
  }

  if (fontSel) {
    fontSel.onchange = (e) => {
      manager.pnFont = e.target.value;
    };
  }

  if (sizeSel) {
    sizeSel.onchange = (e) => {
      manager.pnFontSize = parseInt(e.target.value, 10) || 10;
    };
  }

  if (colorPicker) {
    colorPicker.oninput = (e) => {
      manager.pnColor = e.target.value;
      if (colorLabel) colorLabel.textContent = manager.pnColor;
      updateFormatLive();
    };
  }

  zoneBtns.forEach(btn => {
    btn.onclick = () => {
      manager.pnPos = btn.getAttribute('data-pos') || 'bottom-center';
      zoneBtns.forEach(b => {
        b.className = b === btn ? 'btn btn-xs btn-pn-zone btn-primary' : 'btn btn-xs btn-pn-zone btn-outline';
      });
      updateFormatLive();
    };
  });

  if (loadSampleBtn) {
    loadSampleBtn.onclick = async () => {
      try {
        const sampleBytes = await PageOperations.createSamplePageNumbersPdf();
        if (manager.loadFiles) {
          await manager.loadFiles([{
            name: 'Sample_Research_Whitepaper.pdf',
            bytes: sampleBytes
          }]);
          Toast.success('Loaded Academic Research Whitepaper sample document');
        }
      } catch (err) {
        Toast.error(`Failed to load sample: ${err.message}`);
      }
    };
  }
}
