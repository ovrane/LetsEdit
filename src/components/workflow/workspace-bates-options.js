/**
 * Workspace Options Sub-Module: Adobe Acrobat Pro Legal Bates Numbering
 * Supports: prefix/suffix with macros, zero-padded digit counts, 6-zone anchor positions,
 * custom margins, font styling, color picker, and range filtering.
 */

import { Toast } from '../toast.js';
import { PageOperations } from '../../core/engine/page-ops.js';

export function renderBatesOptionsHtml(instance) {
  const prefix = instance.batesPrefix !== undefined ? instance.batesPrefix : 'CASE-';
  const suffix = instance.batesSuffix !== undefined ? instance.batesSuffix : '';
  const startNum = parseInt(instance.batesStart ?? 1, 10) || 1;
  const digits = parseInt(instance.batesDigits ?? 6, 10) || 6;
  const pos = instance.batesPos || 'bottom-right';
  const font = instance.batesFont || 'HelveticaBold';
  const fontSize = instance.batesFontSize || 10;
  const color = instance.batesColor || '#1e293b';
  const rangeRule = instance.batesRangeRule || 'all';
  const mTop = instance.batesMarginTop ?? 28;
  const mBottom = instance.batesMarginBottom ?? 24;
  const mLeft = instance.batesMarginLeft ?? 36;
  const mRight = instance.batesMarginRight ?? 36;

  const sampleStamp = `${prefix}${String(startNum).padStart(digits, '0')}${suffix}`;

  return `
    <div class="workflow-options-group" style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Format Preview Card -->
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.05) 0%, rgba(30, 41, 59, 0.02) 100%); border: 1.5px solid rgba(30, 41, 59, 0.18); border-radius: 10px; padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Bates Sequence Stamp</span>
          <span style="font-size: 10px; background: #1e293b; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600;">ISO 32000 Legal</span>
        </div>
        <div id="bates-live-format-badge" style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; font-weight: 700; color: ${color}; background: rgba(255,255,255,0.85); padding: 8px 12px; border-radius: 6px; border: 1px dashed ${color}; text-align: center; word-break: break-all;">
          ${sampleStamp}
        </div>
      </div>

      <!-- Prefix and Suffix Fields -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Prefix</label>
          <input type="text" id="bates-prefix-input" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: monospace;" value="${prefix}" placeholder="e.g. CASE-" />
        </div>
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Suffix</label>
          <input type="text" id="bates-suffix-input" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-family: monospace;" value="${suffix}" placeholder="e.g. -PROD" />
        </div>
      </div>

      <!-- Dynamic Macro Insertion Pills -->
      <div>
        <div style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 5px;">Dynamic Macro Tokens:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="btn btn-xs btn-outline bates-token-pill" data-token="<<CaseNo>>" style="font-size: 10.5px; padding: 2px 7px;">+ CaseNo</button>
          <button type="button" class="btn btn-xs btn-outline bates-token-pill" data-token="<<Year>>" style="font-size: 10.5px; padding: 2px 7px;">+ Year</button>
          <button type="button" class="btn btn-xs btn-outline bates-token-pill" data-token="<<Date>>" style="font-size: 10.5px; padding: 2px 7px;">+ Date</button>
          <button type="button" class="btn btn-xs btn-outline bates-token-pill" data-token="<<FileName>>" style="font-size: 10.5px; padding: 2px 7px;">+ File</button>
        </div>
      </div>

      <!-- Start Number & Digit Count -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Start Number</label>
          <input type="number" id="bates-start-input" min="1" step="1" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);" value="${startNum}" />
        </div>
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Number of Digits</label>
          <select id="bates-digits-select" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            ${[3, 4, 5, 6, 7, 8, 9, 10].map(d => `<option value="${d}" ${d === digits ? 'selected' : ''}>${d} Digits (${String(startNum).padStart(d, '0')})</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- 6-Zone Position Selector -->
      <div>
        <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 6px; display: block;">Stamp Position</label>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <button type="button" class="btn btn-xs btn-bates-zone ${pos === 'top-left' ? 'btn-primary' : 'btn-outline'}" data-pos="top-left" style="font-size: 11px; padding: 6px 4px;">Top Left</button>
          <button type="button" class="btn btn-xs btn-bates-zone ${pos === 'top-center' ? 'btn-primary' : 'btn-outline'}" data-pos="top-center" style="font-size: 11px; padding: 6px 4px;">Top Center</button>
          <button type="button" class="btn btn-xs btn-bates-zone ${pos === 'top-right' ? 'btn-primary' : 'btn-outline'}" data-pos="top-right" style="font-size: 11px; padding: 6px 4px;">Top Right</button>
          <button type="button" class="btn btn-xs btn-bates-zone ${pos === 'bottom-left' ? 'btn-primary' : 'btn-outline'}" data-pos="bottom-left" style="font-size: 11px; padding: 6px 4px;">Bottom Left</button>
          <button type="button" class="btn btn-xs btn-bates-zone ${pos === 'bottom-center' ? 'btn-primary' : 'btn-outline'}" data-pos="bottom-center" style="font-size: 11px; padding: 6px 4px;">Bottom Center</button>
          <button type="button" class="btn btn-xs btn-bates-zone ${pos === 'bottom-right' ? 'btn-primary' : 'btn-outline'}" data-pos="bottom-right" style="font-size: 11px; padding: 6px 4px;">Bottom Right</button>
        </div>
      </div>

      <!-- Font Family & Font Size -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Font Family</label>
          <select id="bates-font-select" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="HelveticaBold" ${font === 'HelveticaBold' ? 'selected' : ''}>Helvetica Bold</option>
            <option value="Helvetica" ${font === 'Helvetica' ? 'selected' : ''}>Helvetica Regular</option>
            <option value="CourierBold" ${font === 'CourierBold' ? 'selected' : ''}>Courier Mono Bold</option>
            <option value="TimesRomanBold" ${font === 'TimesRomanBold' ? 'selected' : ''}>Times Roman Bold</option>
          </select>
        </div>
        <div>
          <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Font Size</label>
          <select id="bates-fontsize-select" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
            <option value="8" ${fontSize === 8 ? 'selected' : ''}>8 pt (Small)</option>
            <option value="9" ${fontSize === 9 ? 'selected' : ''}>9 pt</option>
            <option value="10" ${fontSize === 10 ? 'selected' : ''}>10 pt (Standard Legal)</option>
            <option value="12" ${fontSize === 12 ? 'selected' : ''}>12 pt (Large)</option>
            <option value="14" ${fontSize === 14 ? 'selected' : ''}>14 pt</option>
          </select>
        </div>
      </div>

      <!-- Color Picker -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin: 0;">Stamp Color</label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="color" id="bates-color-picker" value="${color}" style="width: 32px; height: 30px; border-radius: 6px; border: 1px solid var(--border-subtle); cursor: pointer; padding: 2px;" />
          <span id="bates-color-code" style="font-size: 11px; font-family: monospace; color: var(--text-muted);">${color}</span>
        </div>
      </div>

      <!-- Page Range Target -->
      <div>
        <label class="workflow-options-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; display: block;">Apply To Pages</label>
        <select id="bates-range-select" class="input-sm" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main);">
          <option value="all" ${rangeRule === 'all' ? 'selected' : ''}>All Pages (Entire Document)</option>
          <option value="skip-cover" ${rangeRule === 'skip-cover' ? 'selected' : ''}>Skip First Page (Pleading Cover)</option>
          <option value="odd" ${rangeRule === 'odd' ? 'selected' : ''}>Odd Pages Only (1, 3, 5...)</option>
          <option value="even" ${rangeRule === 'even' ? 'selected' : ''}>Even Pages Only (2, 4, 6...)</option>
        </select>
      </div>

      <!-- Sample Legal Brief Action -->
      <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 4px;">
        <button type="button" class="btn btn-sm btn-outline" id="btn-load-bates-sample" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <span>Load Legal Brief Discovery Sample</span>
        </button>
      </div>
    </div>
  `;
}

export function bindBatesEvents(manager) {
  const container = manager.container;
  if (!container) return;

  const prefixInp = container.querySelector('#bates-prefix-input');
  const suffixInp = container.querySelector('#bates-suffix-input');
  const startInp = container.querySelector('#bates-start-input');
  const digitsSel = container.querySelector('#bates-digits-select');
  const fontSel = container.querySelector('#bates-font-select');
  const fontSizeSel = container.querySelector('#bates-fontsize-select');
  const colorPicker = container.querySelector('#bates-color-picker');
  const colorCode = container.querySelector('#bates-color-code');
  const rangeSel = container.querySelector('#bates-range-select');
  const zoneBtns = container.querySelectorAll('.btn-bates-zone');
  const tokenPills = container.querySelectorAll('.bates-token-pill');
  const loadSampleBtn = container.querySelector('#btn-load-bates-sample');
  const liveBadge = container.querySelector('#bates-live-format-badge');
  const overlayStamp = container.querySelector('#bates-overlay-stamp');

  const updateFormatLive = () => {
    const p = manager.batesPrefix !== undefined ? manager.batesPrefix : 'CASE-';
    const s = manager.batesSuffix !== undefined ? manager.batesSuffix : '';
    const st = parseInt(manager.batesStart ?? 1, 10) || 1;
    const dg = parseInt(manager.batesDigits ?? 6, 10) || 6;
    const clr = manager.batesColor || '#1e293b';
    const stampText = `${p}${String(st).padStart(dg, '0')}${s}`;

    if (liveBadge) {
      liveBadge.textContent = stampText;
      liveBadge.style.color = clr;
      liveBadge.style.borderColor = clr;
    }
    if (overlayStamp) {
      overlayStamp.textContent = stampText;
      overlayStamp.style.color = clr;
      overlayStamp.style.borderColor = clr;
      overlayStamp.style.cssText = `position: absolute; ${manager.getBatesPositionCss()}; background: rgba(255, 255, 255, 0.9); padding: 4px 8px; border-radius: 4px; border: 1px dashed ${clr}; font-family: monospace; font-size: 11px; font-weight: 700; color: ${clr}; pointer-events: none; transition: all 0.2s ease;`;
    }
  };

  if (prefixInp) {
    prefixInp.oninput = (e) => {
      manager.batesPrefix = e.target.value;
      updateFormatLive();
    };
  }

  if (suffixInp) {
    suffixInp.oninput = (e) => {
      manager.batesSuffix = e.target.value;
      updateFormatLive();
    };
  }

  if (startInp) {
    startInp.oninput = (e) => {
      manager.batesStart = parseInt(e.target.value, 10) || 1;
      updateFormatLive();
    };
  }

  if (digitsSel) {
    digitsSel.onchange = (e) => {
      manager.batesDigits = parseInt(e.target.value, 10) || 6;
      updateFormatLive();
    };
  }

  if (fontSel) {
    fontSel.onchange = (e) => {
      manager.batesFont = e.target.value;
      updateFormatLive();
    };
  }

  if (fontSizeSel) {
    fontSizeSel.onchange = (e) => {
      manager.batesFontSize = parseInt(e.target.value, 10) || 10;
      updateFormatLive();
    };
  }

  if (colorPicker) {
    colorPicker.oninput = (e) => {
      manager.batesColor = e.target.value;
      if (colorCode) colorCode.textContent = manager.batesColor;
      updateFormatLive();
    };
  }

  if (rangeSel) {
    rangeSel.onchange = (e) => {
      manager.batesRangeRule = e.target.value;
    };
  }

  zoneBtns.forEach(btn => {
    btn.onclick = () => {
      manager.batesPos = btn.getAttribute('data-pos') || 'bottom-right';
      zoneBtns.forEach(b => {
        b.className = b === btn ? 'btn btn-xs btn-bates-zone btn-primary' : 'btn btn-xs btn-bates-zone btn-outline';
      });
      updateFormatLive();
    };
  });

  tokenPills.forEach(pill => {
    pill.onclick = () => {
      const token = pill.getAttribute('data-token');
      if (prefixInp && token) {
        prefixInp.value += token;
        manager.batesPrefix = prefixInp.value;
        updateFormatLive();
      }
    };
  });

  if (loadSampleBtn) {
    loadSampleBtn.onclick = async () => {
      try {
        const sampleBytes = await PageOperations.createSampleBatesPdf();
        if (manager.loadFiles) {
          await manager.loadFiles([{
            name: 'Sample_Legal_Brief_Discovery.pdf',
            bytes: sampleBytes
          }]);
          Toast.success('Loaded Legal Discovery Brief sample document');
        }
      } catch (err) {
        Toast.error(`Failed to load sample: ${err.message}`);
      }
    };
  }
}
