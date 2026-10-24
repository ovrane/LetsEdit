/**
 * Workspace Multi-Zone Header & Footer HUD Sub-Module
 * Reverse-engineered from Adobe Acrobat Pro ("Add Header & Footer")
 * and iLovePDF/Sejda specifications:
 * - 6-Zone Grid: Left Header, Center Header, Right Header, Left Footer, Center Footer, Right Footer
 * - Dynamic Macro Injection: <<Page>>, <<TotalPages>>, <<Date>>, <<Time>>, <<FileName>>, <<Title>>
 * - Custom Margins (Top, Bottom, Left, Right in points)
 * - Page Filtering: All, Odd, Even, Custom Range & Skip First / Cover Page
 * - Typography Styles: Font selection, Font size, RGB color picker, and Divider lines
 * Modular sub-component keeping workspace-options.js safely < 1,000 lines.
 */

import { HeaderFooterOps } from '../../core/engine/operations/header-footer-ops.js';
import { Toast } from '../toast.js';

export function renderHeaderFooterOptionsHtml(instance) {
  const totalPages = instance.uploadedFiles[0]?.pageCount || 1;
  const cfg = instance.headerFooterConfig || {
    leftHeader: '',
    centerHeader: '<<Title>>',
    rightHeader: '<<Date>>',
    leftFooter: '<<FileName>>',
    centerFooter: 'Page <<Page>> of <<TotalPages>>',
    rightFooter: 'CONFIDENTIAL',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
    topMargin: 36,
    bottomMargin: 36,
    leftMargin: 36,
    rightMargin: 36,
    pageRange: 'all',
    skipFirst: true,
    startNumber: 1,
    hasHeaderDivider: false,
    hasFooterDivider: true
  };

  return `
    <div class="header-footer-workspace-panel" style="display:flex; flex-direction:column; gap:16px;">
      <!-- Technical Summary Header / Acrobat Header & Footer -->
      <div style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📑</span>
            <span style="font-weight:700; font-size:14px; color:#f8fafc; letter-spacing:0.02em;">Adobe Acrobat Multi-Zone Header & Footer</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(99, 102, 241, 0.15); color:#a5b4fc; border:1px solid rgba(99, 102, 241, 0.3);">
              6-Zone Dynamic Macros
            </span>
            <button id="hf-btn-load-sample" type="button" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Load sample document with cover page and executive sections">
              <span>🎲</span> Sample
            </button>
          </div>
        </div>

        <div style="font-size:12px; color:#94a3b8; line-height:1.5; margin-bottom:12px;">
          Stamp customized headers and footers across 6 independent zones with dynamic macros (<code>&lt;&lt;Page&gt;&gt;</code>, <code>&lt;&lt;Date&gt;&gt;</code>, <code>&lt;&lt;FileName&gt;&gt;</code>), cover page omission, and divider lines.
        </div>

        <!-- Quick Template Presets -->
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <span style="font-size:11px; color:#94a3b8; font-weight:600;">Presets:</span>
          <button type="button" class="hf-preset-btn" data-preset="formal" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            Corporate Standard
          </button>
          <button type="button" class="hf-preset-btn" data-preset="page-only" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            Page X of Y
          </button>
          <button type="button" class="hf-preset-btn" data-preset="confidential" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            Confidential Audit
          </button>
        </div>
      </div>

      <!-- Macro Insert Quick Toolbar -->
      <div style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
        <span style="font-size:11px; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.04em;">
          Insert Macro at Active Field:
        </span>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="hf-macro-btn" data-macro="<<Page>>" style="background:rgba(99, 102, 241, 0.15); border:1px solid rgba(99, 102, 241, 0.3); color:#c7d2fe; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            + Page Number
          </button>
          <button type="button" class="hf-macro-btn" data-macro="<<TotalPages>>" style="background:rgba(99, 102, 241, 0.15); border:1px solid rgba(99, 102, 241, 0.3); color:#c7d2fe; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            + Total Pages
          </button>
          <button type="button" class="hf-macro-btn" data-macro="<<Date>>" style="background:rgba(99, 102, 241, 0.15); border:1px solid rgba(99, 102, 241, 0.3); color:#c7d2fe; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            + Current Date
          </button>
          <button type="button" class="hf-macro-btn" data-macro="<<Time>>" style="background:rgba(99, 102, 241, 0.15); border:1px solid rgba(99, 102, 241, 0.3); color:#c7d2fe; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            + Timestamp
          </button>
          <button type="button" class="hf-macro-btn" data-macro="<<FileName>>" style="background:rgba(99, 102, 241, 0.15); border:1px solid rgba(99, 102, 241, 0.3); color:#c7d2fe; font-size:11px; padding:3px 8px; border-radius:4px; cursor:pointer;">
            + File Name
          </button>
        </div>
      </div>

      <!-- 6-Zone Interactive Input Grid -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        <!-- Header Section -->
        <div style="background:rgba(30, 41, 59, 0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:700; color:#e2e8f0;">HEADER ZONES (TOP)</span>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px; color:#cbd5e1; cursor:pointer;">
              <input type="checkbox" id="hf-chk-header-divider" ${cfg.hasHeaderDivider ? 'checked' : ''} style="accent-color:#6366f1;">
              <span>Separator line</span>
            </label>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
            <div style="display:flex; flex-direction:column; gap:3px;">
              <span style="font-size:10px; color:#94a3b8;">Left Header</span>
              <input type="text" id="hf-in-left-header" class="input-sm hf-zone-input" value="${escapeHtml(cfg.leftHeader)}" placeholder="e.g. Project Titanium" style="width:100%; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px;" />
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
              <span style="font-size:10px; color:#94a3b8;">Center Header</span>
              <input type="text" id="hf-in-center-header" class="input-sm hf-zone-input" value="${escapeHtml(cfg.centerHeader)}" placeholder="e.g. <<Title>>" style="width:100%; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px; text-align:center;" />
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
              <span style="font-size:10px; color:#94a3b8;">Right Header</span>
              <input type="text" id="hf-in-right-header" class="input-sm hf-zone-input" value="${escapeHtml(cfg.rightHeader)}" placeholder="e.g. <<Date>>" style="width:100%; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px; text-align:right;" />
            </div>
          </div>
        </div>

        <!-- Footer Section -->
        <div style="background:rgba(30, 41, 59, 0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:700; color:#e2e8f0;">FOOTER ZONES (BOTTOM)</span>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px; color:#cbd5e1; cursor:pointer;">
              <input type="checkbox" id="hf-chk-footer-divider" ${cfg.hasFooterDivider ? 'checked' : ''} style="accent-color:#6366f1;">
              <span>Separator line</span>
            </label>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
            <div style="display:flex; flex-direction:column; gap:3px;">
              <span style="font-size:10px; color:#94a3b8;">Left Footer</span>
              <input type="text" id="hf-in-left-footer" class="input-sm hf-zone-input" value="${escapeHtml(cfg.leftFooter)}" placeholder="e.g. <<FileName>>" style="width:100%; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px;" />
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
              <span style="font-size:10px; color:#94a3b8;">Center Footer</span>
              <input type="text" id="hf-in-center-footer" class="input-sm hf-zone-input" value="${escapeHtml(cfg.centerFooter)}" placeholder="e.g. Page <<Page>> of <<TotalPages>>" style="width:100%; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px; text-align:center;" />
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
              <span style="font-size:10px; color:#94a3b8;">Right Footer</span>
              <input type="text" id="hf-in-right-footer" class="input-sm hf-zone-input" value="${escapeHtml(cfg.rightFooter)}" placeholder="e.g. CONFIDENTIAL" style="width:100%; background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px; text-align:right;" />
            </div>
          </div>
        </div>
      </div>

      <!-- Typography & Formatting Settings -->
      <div style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
        <span style="font-size:11px; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.04em;">
          Typography & Margins
        </span>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          <!-- Font Family -->
          <div style="display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:10px; color:#94a3b8;">Font Family</span>
            <select id="hf-sel-font" style="background:rgba(30, 41, 59, 0.8); border:1px solid rgba(255,255,255,0.1); color:#cbd5e1; border-radius:4px; padding:4px; font-size:11px;">
              <option value="Helvetica" ${cfg.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
              <option value="HelveticaBold" ${cfg.fontFamily === 'HelveticaBold' ? 'selected' : ''}>Helvetica Bold</option>
              <option value="TimesRoman" ${cfg.fontFamily === 'TimesRoman' ? 'selected' : ''}>Times Roman</option>
              <option value="Courier" ${cfg.fontFamily === 'Courier' ? 'selected' : ''}>Courier</option>
            </select>
          </div>

          <!-- Font Size -->
          <div style="display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:10px; color:#94a3b8;">Size (pt)</span>
            <input type="number" id="hf-in-size" min="6" max="36" value="${cfg.fontSize || 10}" style="background:rgba(30, 41, 59, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px;" />
          </div>

          <!-- Color -->
          <div style="display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:10px; color:#94a3b8;">Color</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <input type="color" id="hf-in-color" value="${cfg.color || '#334155'}" style="width:28px; height:24px; border:none; padding:0; background:transparent; cursor:pointer;" />
              <span id="hf-lbl-color" style="font-size:11px; color:#94a3b8; font-family:monospace;">${cfg.color || '#334155'}</span>
            </div>
          </div>

          <!-- Top / Bottom Margin -->
          <div style="display:flex; flex-direction:column; gap:3px;">
            <span style="font-size:10px; color:#94a3b8;">Top / Bottom (pt)</span>
            <input type="number" id="hf-in-top-margin" min="10" max="150" value="${cfg.topMargin || 36}" style="background:rgba(30, 41, 59, 0.8); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; border-radius:4px; padding:4px 6px; font-size:11px;" />
          </div>
        </div>
      </div>

      <!-- Page Range & Cover Page Rules -->
      <div style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
        <span style="font-size:11px; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.04em;">
          Page Range Options
        </span>

        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
          <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:#f8fafc; cursor:pointer;">
            <input type="checkbox" id="hf-chk-skip-first" ${cfg.skipFirst ? 'checked' : ''} style="accent-color:#6366f1;">
            <span style="font-weight:600;">Different First Page (Skip Cover Page)</span>
          </label>

          <div style="display:flex; align-items:center; gap:6px; margin-left:auto;">
            <span style="font-size:11px; color:#94a3b8;">Apply to:</span>
            <select id="hf-sel-range" style="background:rgba(30, 41, 59, 0.8); border:1px solid rgba(255,255,255,0.1); color:#cbd5e1; border-radius:4px; padding:3px 6px; font-size:11px;">
              <option value="all" ${cfg.pageRange === 'all' ? 'selected' : ''}>All Pages (1 - ${totalPages})</option>
              <option value="odd" ${cfg.pageRange === 'odd' ? 'selected' : ''}>Odd Pages Only</option>
              <option value="even" ${cfg.pageRange === 'even' ? 'selected' : ''}>Even Pages Only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindHeaderFooterEvents(manager) {
  if (!manager) return;

  if (!manager.headerFooterConfig) {
    manager.headerFooterConfig = {
      leftHeader: '',
      centerHeader: '<<Title>>',
      rightHeader: '<<Date>>',
      leftFooter: '<<FileName>>',
      centerFooter: 'Page <<Page>> of <<TotalPages>>',
      rightFooter: 'CONFIDENTIAL',
      fontFamily: 'Helvetica',
      fontSize: 10,
      color: '#334155',
      topMargin: 36,
      bottomMargin: 36,
      leftMargin: 36,
      rightMargin: 36,
      pageRange: 'all',
      skipFirst: true,
      startNumber: 1,
      hasHeaderDivider: false,
      hasFooterDivider: true
    };
  }

  const container = document.querySelector('.header-footer-workspace-panel');
  if (!container) return;

  let activeInputElement = container.querySelector('#hf-in-center-footer');

  // Track active input for macro chip insertion
  container.querySelectorAll('.hf-zone-input').forEach(input => {
    input.onfocus = () => {
      activeInputElement = input;
    };
    input.oninput = () => {
      syncConfigFromForm(manager, container);
    };
  });

  // Macro button insertion
  container.querySelectorAll('.hf-macro-btn').forEach(btn => {
    btn.onclick = () => {
      const macro = btn.getAttribute('data-macro');
      if (activeInputElement && macro) {
        const start = activeInputElement.selectionStart ?? activeInputElement.value.length;
        const end = activeInputElement.selectionEnd ?? activeInputElement.value.length;
        const currentVal = activeInputElement.value;
        activeInputElement.value = currentVal.substring(0, start) + macro + currentVal.substring(end);
        activeInputElement.selectionStart = activeInputElement.selectionEnd = start + macro.length;
        activeInputElement.focus();
        syncConfigFromForm(manager, container);
      } else {
        Toast.info(`Click inside any header or footer field to insert ${macro}`);
      }
    };
  });

  // Presets
  container.querySelectorAll('.hf-preset-btn').forEach(btn => {
    btn.onclick = () => {
      const preset = btn.getAttribute('data-preset');
      if (preset === 'formal') {
        manager.headerFooterConfig.leftHeader = '';
        manager.headerFooterConfig.centerHeader = '<<Title>>';
        manager.headerFooterConfig.rightHeader = '<<Date>>';
        manager.headerFooterConfig.leftFooter = '<<FileName>>';
        manager.headerFooterConfig.centerFooter = 'Page <<Page>> of <<TotalPages>>';
        manager.headerFooterConfig.rightFooter = 'CONFIDENTIAL';
        manager.headerFooterConfig.hasFooterDivider = true;
      } else if (preset === 'page-only') {
        manager.headerFooterConfig.leftHeader = '';
        manager.headerFooterConfig.centerHeader = '';
        manager.headerFooterConfig.rightHeader = '';
        manager.headerFooterConfig.leftFooter = '';
        manager.headerFooterConfig.centerFooter = 'Page <<Page>> of <<TotalPages>>';
        manager.headerFooterConfig.rightFooter = '';
        manager.headerFooterConfig.hasFooterDivider = false;
      } else if (preset === 'confidential') {
        manager.headerFooterConfig.leftHeader = 'INTERNAL USE ONLY';
        manager.headerFooterConfig.centerHeader = '';
        manager.headerFooterConfig.rightHeader = 'DRAFT';
        manager.headerFooterConfig.leftFooter = 'Generated <<Date>> <<Time>>';
        manager.headerFooterConfig.centerFooter = '- <<Page>> -';
        manager.headerFooterConfig.rightFooter = 'DO NOT DISTRIBUTE';
        manager.headerFooterConfig.hasHeaderDivider = true;
        manager.headerFooterConfig.hasFooterDivider = true;
      }
      if (typeof manager.renderOptionsPanel === 'function') {
        manager.renderOptionsPanel();
      }
      Toast.success('Applied preset layout.');
    };
  });

  // Form controls sync
  const chkHeaderDiv = container.querySelector('#hf-chk-header-divider');
  if (chkHeaderDiv) chkHeaderDiv.onchange = (e) => { manager.headerFooterConfig.hasHeaderDivider = e.target.checked; };

  const chkFooterDiv = container.querySelector('#hf-chk-footer-divider');
  if (chkFooterDiv) chkFooterDiv.onchange = (e) => { manager.headerFooterConfig.hasFooterDivider = e.target.checked; };

  const chkSkipFirst = container.querySelector('#hf-chk-skip-first');
  if (chkSkipFirst) chkSkipFirst.onchange = (e) => { manager.headerFooterConfig.skipFirst = e.target.checked; };

  const selFont = container.querySelector('#hf-sel-font');
  if (selFont) selFont.onchange = (e) => { manager.headerFooterConfig.fontFamily = e.target.value; };

  const inSize = container.querySelector('#hf-in-size');
  if (inSize) inSize.onchange = (e) => { manager.headerFooterConfig.fontSize = parseInt(e.target.value, 10) || 10; };

  const inColor = container.querySelector('#hf-in-color');
  const lblColor = container.querySelector('#hf-lbl-color');
  if (inColor) inColor.oninput = (e) => {
    manager.headerFooterConfig.color = e.target.value;
    if (lblColor) lblColor.innerText = e.target.value;
  };

  const inTopMargin = container.querySelector('#hf-in-top-margin');
  if (inTopMargin) inTopMargin.onchange = (e) => {
    const val = parseInt(e.target.value, 10) || 36;
    manager.headerFooterConfig.topMargin = val;
    manager.headerFooterConfig.bottomMargin = val;
  };

  const selRange = container.querySelector('#hf-sel-range');
  if (selRange) selRange.onchange = (e) => { manager.headerFooterConfig.pageRange = e.target.value; };

  // Sample button
  const btnSample = container.querySelector('#hf-btn-load-sample');
  if (btnSample) {
    btnSample.onclick = async () => {
      try {
        btnSample.disabled = true;
        btnSample.innerText = 'Loading...';
        Toast.info('Loading sample document...');
        const sampleBytes = await HeaderFooterOps.createSampleHeaderFooterPdf();
        const file = new File([sampleBytes], 'sample_header_footer_document.pdf', { type: 'application/pdf' });
        await manager.setFiles([file]);
        if (typeof manager.renderOptionsPanel === 'function') {
          manager.renderOptionsPanel();
        }
        Toast.success('Loaded sample report document.');
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

function syncConfigFromForm(manager, container) {
  const cfg = manager.headerFooterConfig;
  cfg.leftHeader = container.querySelector('#hf-in-left-header')?.value || '';
  cfg.centerHeader = container.querySelector('#hf-in-center-header')?.value || '';
  cfg.rightHeader = container.querySelector('#hf-in-right-header')?.value || '';
  cfg.leftFooter = container.querySelector('#hf-in-left-footer')?.value || '';
  cfg.centerFooter = container.querySelector('#hf-in-center-footer')?.value || '';
  cfg.rightFooter = container.querySelector('#hf-in-right-footer')?.value || '';
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
