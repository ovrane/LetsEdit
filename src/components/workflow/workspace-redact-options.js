/**
 * Adobe Acrobat Pro & iLovePDF Permanent Vector Redaction Workspace Options
 * Interactive HUD for selecting PII pattern detectors (SSN, Cards, Email, Phone),
 * custom keywords, blackout vs whiteout masks, overlay text, and live discovery scanning.
 */

import { PageOperations } from '../../core/engine/page-ops.js';

export function renderRedactOptionsHtml(instance) {
  const keywords = instance.redactKeywords || '';
  const color = instance.redactColor || '#000000';
  const overlayText = instance.redactOverlayText !== undefined ? instance.redactOverlayText : '[REDACTED]';
  const patterns = instance.redactPatterns || ['ssn', 'credit_card'];
  const scanResult = instance.redactScanResult || null;

  return `
    <div class="redact-options-pane" style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Hero Banner -->
      <div style="background: rgba(225, 29, 72, 0.06); border: 1px solid rgba(225, 29, 72, 0.2); border-radius: 10px; padding: 12px 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 6px; background: #e11d48; color: white; display: flex; align-items: center; justify-content: center;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <span style="font-weight: 700; font-size: 13px; color: #be123c;">True Vector Stream Sanitizer</span>
          </div>
          <span style="font-size: 10px; font-weight: 700; color: #e11d48; background: rgba(225, 29, 72, 0.12); padding: 2px 7px; border-radius: 10px;">
            Forensic Defense
          </span>
        </div>
        <p style="font-size: 11px; color: var(--text-muted); margin: 0; line-height: 1.45;">
          Unlike basic drawing covers, this engine physically parses and deletes byte tokens from the decompressed PDF content stream. Redacted text cannot be copied, highlighted, or inspected.
        </p>
      </div>

      <!-- Live Scan Summary Badge -->
      <div id="redact-scan-badge-container" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px;">PII Forensic Scanner</span>
          <span id="redact-scan-indicator" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; ${scanResult && scanResult.totalMatches > 0 ? 'background: rgba(225, 29, 72, 0.12); color: #be123c;' : 'background: rgba(100, 116, 139, 0.1); color: #64748b;'}">
            ${scanResult ? `● ${scanResult.totalMatches} Threat${scanResult.totalMatches === 1 ? '' : 's'} Detected` : '● Ready to Scan'}
          </span>
        </div>
        <div id="redact-scan-summary" style="font-size: 11px; color: var(--text-muted); line-height: 1.5;">
          ${scanResult && scanResult.matches.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
              ${scanResult.matches.slice(0, 4).map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px;">
                  <span style="font-weight: 600; color: #be123c;">${m.pattern}</span>
                  <span style="font-size: 10px; color: var(--text-muted);">Page ${m.pageNumber} (${m.count})</span>
                </div>
              `).join('')}
              ${scanResult.matches.length > 4 ? `
                <div style="font-size: 10px; color: #94a3b8; text-align: center;">+ ${scanResult.matches.length - 4} more matches across document</div>
              ` : ''}
            </div>
          ` : `
            Click "Scan Document" below or enter custom keywords to identify target tokens.
          `}
        </div>
      </div>

      <!-- Automated PII Detection Presets -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px;">
        <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; text-transform: uppercase;">
          Automated Pattern Detectors
        </label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11.5px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" class="chk-redact-pattern" data-pattern="ssn" ${patterns.includes('ssn') ? 'checked' : ''} style="accent-color: #e11d48;" />
            <span>SSN & IDs</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" class="chk-redact-pattern" data-pattern="credit_card" ${patterns.includes('credit_card') ? 'checked' : ''} style="accent-color: #e11d48;" />
            <span>Credit Cards</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" class="chk-redact-pattern" data-pattern="email" ${patterns.includes('email') ? 'checked' : ''} style="accent-color: #e11d48;" />
            <span>Email Addresses</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" class="chk-redact-pattern" data-pattern="phone" ${patterns.includes('phone') ? 'checked' : ''} style="accent-color: #e11d48;" />
            <span>Phone Numbers</span>
          </label>
        </div>
      </div>

      <!-- Explicit Target Keywords -->
      <div>
        <label style="display: block; font-size: 11.5px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
          SPECIFIC WORDS OR PHRASES TO PURGE
        </label>
        <textarea id="workflow-redact-keywords" class="input-sm" placeholder="Enter sensitive terms (e.g. John Doe, Confidential, Project Apex, $500,000), separated by commas or lines..." style="width: 100%; height: 75px; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 12px; line-height: 1.45; resize: vertical;">${keywords}</textarea>
      </div>

      <!-- Redaction Appearance & Mask Style -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px;">
        <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; text-transform: uppercase;">
          Redaction Mask Appearance
        </label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <button type="button" class="btn btn-xs ${color === '#000000' ? 'btn-primary' : 'btn-outline'} btn-redact-color" data-color="#000000" style="padding: 7px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="width: 10px; height: 10px; background: black; border-radius: 2px;"></span>
            <span>Blackout Box</span>
          </button>
          <button type="button" class="btn btn-xs ${color === '#ffffff' ? 'btn-primary' : 'btn-outline'} btn-redact-color" data-color="#ffffff" style="padding: 7px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="width: 10px; height: 10px; background: white; border: 1px solid #cbd5e1; border-radius: 2px;"></span>
            <span>Whiteout Box</span>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Overlay Print Label (Optional)</label>
          <input type="text" id="workflow-redact-overlay-text" value="${overlayText}" placeholder="e.g. [REDACTED] or leave blank" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-main); font-size: 12px;" />
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn btn-sm btn-outline" id="btn-redact-scan-now" style="flex: 1; border-color: rgba(225, 29, 72, 0.35); color: #e11d48; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Scan Document</span>
        </button>
        <button type="button" class="btn btn-sm btn-outline" id="btn-redact-load-sample" style="flex: 1; border-color: var(--border-subtle); color: var(--text-muted); font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          <span>Load PII Sample</span>
        </button>
      </div>
    </div>
  `;
}

export function bindRedactEvents(manager) {
  const container = manager.container;
  if (!container) return;

  // Initialize defaults
  if (!manager.redactColor) manager.redactColor = '#000000';
  if (manager.redactOverlayText === undefined) manager.redactOverlayText = '[REDACTED]';
  if (!manager.redactPatterns) manager.redactPatterns = ['ssn', 'credit_card'];

  // Keywords input
  const redactInp = container.querySelector('#workflow-redact-keywords');
  if (redactInp) {
    redactInp.oninput = (e) => {
      manager.redactKeywords = e.target.value;
    };
  }

  // Overlay text input
  const overlayInp = container.querySelector('#workflow-redact-overlay-text');
  if (overlayInp) {
    overlayInp.oninput = (e) => {
      manager.redactOverlayText = e.target.value;
    };
  }

  // Appearance color buttons
  container.querySelectorAll('.btn-redact-color').forEach(btn => {
    btn.onclick = () => {
      manager.redactColor = btn.getAttribute('data-color') || '#000000';
      manager.renderOptions();
    };
  });

  // Pattern checkboxes
  container.querySelectorAll('.chk-redact-pattern').forEach(chk => {
    chk.onchange = () => {
      const p = chk.getAttribute('data-pattern');
      if (chk.checked) {
        if (!manager.redactPatterns.includes(p)) manager.redactPatterns.push(p);
      } else {
        manager.redactPatterns = manager.redactPatterns.filter(item => item !== p);
      }
    };
  });

  // Scan Document Now button
  const scanBtn = container.querySelector('#btn-redact-scan-now');
  if (scanBtn) {
    scanBtn.onclick = async () => {
      const primary = manager.uploadedFiles?.[0];
      if (!primary?.bytes) return;

      scanBtn.disabled = true;
      scanBtn.textContent = 'Scanning Content...';
      try {
        const kwList = (manager.redactKeywords || '').split(/[,;\n]+/).map(k => k.trim()).filter(Boolean);
        const scanRes = await PageOperations.searchSensitiveData(primary.bytes, {
          keywords: kwList,
          patterns: manager.redactPatterns || ['ssn', 'credit_card']
        });
        manager.redactScanResult = scanRes;
        manager.renderOptions();
      } catch (err) {
        console.error('Scan error:', err);
        scanBtn.disabled = false;
        scanBtn.textContent = 'Scan Document';
      }
    };
  }

  // Load PII Sample button
  const sampleBtn = container.querySelector('#btn-redact-load-sample');
  if (sampleBtn) {
    sampleBtn.onclick = async () => {
      sampleBtn.disabled = true;
      sampleBtn.textContent = 'Generating PII Sample...';
      try {
        const sampleBytes = await PageOperations.createSampleRedactPdf();
        const sampleFile = new File([sampleBytes], 'Sample_PII_Discovery_Record.pdf', { type: 'application/pdf' });
        manager.uploadedFiles = [{
          file: sampleFile,
          name: sampleFile.name,
          size: sampleBytes.byteLength,
          bytes: sampleBytes,
          pageCount: 3,
          rotation: 0
        }];
        manager.redactKeywords = 'Johnathan Doe, Project Valkyrie, $1,450,000,000';
        manager.redactScanResult = await PageOperations.searchSensitiveData(sampleBytes, {
          keywords: ['Johnathan Doe', 'Project Valkyrie', '$1,450,000,000'],
          patterns: ['ssn', 'credit_card', 'email', 'phone']
        });
        manager.render();
      } catch (err) {
        console.error('Sample generation error:', err);
        sampleBtn.disabled = false;
        sampleBtn.textContent = 'Load PII Sample';
      }
    };
  }
}
