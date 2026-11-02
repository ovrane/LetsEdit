/**
 * PDF to PDF/A Modal & Conformance Validator Component
 * Converts PDF documents to ISO 19005-1, 19005-2, or 19005-3 compliant PDF/A archival format
 * with standard DeviceRGB OutputIntents, XMP schema embedding, and deep validation reports.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';

export class PdfaModal {
  constructor() {
    this.modal = null;
    this.targetBytes = null;
    this.fileName = 'document.pdf';
    this.pdfaBytes = null;
    this.isConverting = false;
    this.selectedProfile = 'pdfa-1b';
    this.embeddedFile = null;
    this.activeTab = 'convert'; // 'convert' | 'validate'
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'pdfa-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 640px; width:95%;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(16,185,129,0.12); color:#10b981; display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" style="margin:0; font-size:18px;">PDF/A Archival & Validator</h2>
              <p class="modal-subtitle" style="margin:0; font-size:12px; color:var(--text-muted);">ISO 19005-1, 19005-2 & 19005-3 Long-Term Preservation</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-pdfa">&times;</button>
        </div>

        <!-- Mode Segmented Tabs -->
        <div style="padding: 12px 20px 0; border-bottom: 1px solid var(--border-subtle); display:flex; gap:12px;">
          <button class="tab-btn active" id="tab-pdfa-convert" style="padding:8px 14px; font-size:13px; font-weight:600; background:none; border:none; border-bottom:2px solid #10b981; color:#10b981; cursor:pointer;">
            Convert to PDF/A
          </button>
          <button class="tab-btn" id="tab-pdfa-validate" style="padding:8px 14px; font-size:13px; font-weight:600; background:none; border:none; border-bottom:2px solid transparent; color:var(--text-muted); cursor:pointer;">
            Validate Conformance
          </button>
        </div>

        <div class="modal-body" style="padding:20px; max-height:75vh; overflow-y:auto;">
          <!-- Dropzone -->
          <div id="pdfa-dropzone" style="border:2px dashed var(--border-subtle); border-radius:12px; padding:16px; text-align:center; background:var(--bg-secondary); margin-bottom:16px; cursor:pointer;">
            <input type="file" id="input-pdfa-pdf" accept="application/pdf" style="display:none;" />
            <div id="pdfa-file-label" style="font-weight:600; font-size:13px; color:var(--text-main); margin-bottom:2px;">Current Loaded Document</div>
            <div style="font-size:11px; color:var(--text-muted);">Click to change PDF or drag a file here</div>
          </div>

          <!-- CONVERT TAB VIEW -->
          <div id="view-pdfa-convert">
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:8px;">
              Select PDF/A Profile
            </label>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
              <label class="pdfa-card-opt" style="display:flex; gap:10px; padding:10px 14px; border:1.5px solid #10b981; border-radius:10px; cursor:pointer; background:rgba(16,185,129,0.06);">
                <input type="radio" name="pdfa-profile" value="pdfa-1b" checked style="margin-top:3px;" />
                <div>
                  <div style="font-weight:600; font-size:13px; color:var(--text-main);">PDF/A-1b (ISO 19005-1:2005)</div>
                  <div style="font-size:11px; color:var(--text-muted);">Universal visual preservation. Recommended for government, tax, & legal archives.</div>
                </div>
              </label>

              <label class="pdfa-card-opt" style="display:flex; gap:10px; padding:10px 14px; border:1.5px solid var(--border-subtle); border-radius:10px; cursor:pointer;">
                <input type="radio" name="pdfa-profile" value="pdfa-2b" style="margin-top:3px;" />
                <div>
                  <div style="font-weight:600; font-size:13px; color:var(--text-main);">PDF/A-2b (ISO 19005-2:2011)</div>
                  <div style="font-size:11px; color:var(--text-muted);">Supports PDF 1.7 vector features, transparency, and JPEG 2000 compression.</div>
                </div>
              </label>

              <label class="pdfa-card-opt" style="display:flex; gap:10px; padding:10px 14px; border:1.5px solid var(--border-subtle); border-radius:10px; cursor:pointer;">
                <input type="radio" name="pdfa-profile" value="pdfa-3b" style="margin-top:3px;" />
                <div>
                  <div style="font-weight:600; font-size:13px; color:var(--text-main);">PDF/A-3b (ISO 19005-3:2012)</div>
                  <div style="font-size:11px; color:var(--text-muted);">Allows embedding electronic invoice XML (ZUGFeRD, Factur-X) and raw files.</div>
                </div>
              </label>
            </div>

            <!-- PDF/A-3b XML Attachment Container -->
            <div id="pdfa-3b-attachment-wrap" style="display:none; background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:10px; padding:12px 14px; margin-bottom:16px;">
              <div style="font-weight:600; font-size:12px; margin-bottom:6px; color:var(--text-main);">Attach E-Invoice XML (Optional for PDF/A-3b):</div>
              <input type="file" id="input-pdfa-xml" accept=".xml,text/xml,application/xml" style="font-size:12px;" />
              <div id="pdfa-xml-status" style="font-size:11px; color:var(--text-muted); margin-top:4px;">No XML attached (optional)</div>
            </div>

            <!-- Specifications Checklist -->
            <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:10px; padding:12px 14px; margin-bottom:16px;">
              <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:6px;">Enforced Preservation Standards:</div>
              <ul style="margin:0; padding-left:18px; font-size:11px; color:var(--text-muted); line-height:1.6;">
                <li>Standardized sRGB IEC61966-2.1 OutputIntent catalog registry</li>
                <li>ISO XMP metadata stream packet injection (&lt;pdfaid:part&gt; and &lt;pdfaid:conformance&gt;)</li>
                <li>Font character encoding integrity and clean stream serialization</li>
                <li>100% in-browser client-side execution — absolute privacy</li>
              </ul>
            </div>
          </div>

          <!-- VALIDATE TAB VIEW -->
          <div id="view-pdfa-validate" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span style="font-size:13px; font-weight:600; color:var(--text-main);">ISO 19005 Validation Telemetry</span>
              <button class="btn btn-sm btn-outline" id="btn-revalidate-pdfa">Run Validation</button>
            </div>

            <div id="pdfa-validation-report" style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:10px; padding:14px;">
              <div style="font-size:12px; color:var(--text-muted); text-align:center;">Click "Run Validation" to verify compliance.</div>
            </div>
          </div>

          <!-- Loading State -->
          <div id="pdfa-loading-state" style="display:none; text-align:center; padding:20px 16px;">
            <div class="spinner" style="width:32px; height:32px; border:3px solid var(--border-subtle); border-top-color:#10b981; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 10px;"></div>
            <p style="font-size:13px; color:var(--text-muted); margin:0;" id="pdfa-loading-text">Synthesizing OutputIntents and compiling PDF/A archive...</p>
          </div>

          <!-- Footer Actions -->
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
            <button class="btn btn-outline" id="btn-cancel-pdfa">Close</button>
            <button class="btn btn-primary" id="btn-run-pdfa" style="background:#10b981; border-color:#10b981;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Convert to PDF/A</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('#btn-close-pdfa').addEventListener('click', () => this.hide());
    this.modal.querySelector('#btn-cancel-pdfa').addEventListener('click', () => this.hide());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    const dropzone = this.modal.querySelector('#pdfa-dropzone');
    const input = this.modal.querySelector('#input-pdfa-pdf');
    const btnRun = this.modal.querySelector('#btn-run-pdfa');
    const tabConvert = this.modal.querySelector('#tab-pdfa-convert');
    const tabValidate = this.modal.querySelector('#tab-pdfa-validate');
    const viewConvert = this.modal.querySelector('#view-pdfa-convert');
    const viewValidate = this.modal.querySelector('#view-pdfa-validate');
    const xmlWrap = this.modal.querySelector('#pdfa-3b-attachment-wrap');
    const xmlInput = this.modal.querySelector('#input-pdfa-xml');
    const xmlStatus = this.modal.querySelector('#pdfa-xml-status');
    const btnRevalidate = this.modal.querySelector('#btn-revalidate-pdfa');

    // Switch Tabs
    tabConvert.addEventListener('click', () => {
      this.activeTab = 'convert';
      tabConvert.style.borderBottomColor = '#10b981';
      tabConvert.style.color = '#10b981';
      tabValidate.style.borderBottomColor = 'transparent';
      tabValidate.style.color = 'var(--text-muted)';
      viewConvert.style.display = 'block';
      viewValidate.style.display = 'none';
      btnRun.style.display = 'inline-flex';
    });

    tabValidate.addEventListener('click', () => {
      this.activeTab = 'validate';
      tabValidate.style.borderBottomColor = '#10b981';
      tabValidate.style.color = '#10b981';
      tabConvert.style.borderBottomColor = 'transparent';
      tabConvert.style.color = 'var(--text-muted)';
      viewConvert.style.display = 'none';
      viewValidate.style.display = 'block';
      btnRun.style.display = 'none';
      this.runValidation();
    });

    if (btnRevalidate) {
      btnRevalidate.addEventListener('click', () => this.runValidation());
    }

    dropzone.addEventListener('click', () => input.click());

    input.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        this.fileName = file.name;
        this.targetBytes = await readFileAsArrayBuffer(file);
        this.modal.querySelector('#pdfa-file-label').textContent = file.name;
        btnRun.disabled = false;
        if (this.activeTab === 'validate') this.runValidation();
      }
    });

    // Profile Radios
    this.modal.querySelectorAll('input[name="pdfa-profile"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedProfile = e.target.value;
        this.modal.querySelectorAll('.pdfa-card-opt').forEach(card => {
          card.style.borderColor = 'var(--border-subtle)';
          card.style.background = 'transparent';
        });
        const parent = e.target.closest('.pdfa-card-opt');
        if (parent) {
          parent.style.borderColor = '#10b981';
          parent.style.background = 'rgba(16,185,129,0.06)';
        }
        if (xmlWrap) {
          xmlWrap.style.display = this.selectedProfile === 'pdfa-3b' ? 'block' : 'none';
        }
      });
    });

    // XML Attachment for PDF/A-3b
    if (xmlInput) {
      xmlInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
          const f = e.target.files[0];
          const bytes = await readFileAsArrayBuffer(f);
          this.embeddedFile = {
            name: f.name,
            bytes: new Uint8Array(bytes),
            mimeType: 'text/xml',
            description: 'Electronic Invoice Attachment'
          };
          if (xmlStatus) xmlStatus.textContent = `Attached: ${f.name} (${Math.round(f.size / 1024)} KB)`;
        } else {
          this.embeddedFile = null;
          if (xmlStatus) xmlStatus.textContent = 'No XML attached (optional)';
        }
      });
    }

    btnRun.addEventListener('click', () => this.runConvert());
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    this.modal.style.display = 'flex';

    if (pdfEngine.rawBytes) {
      this.targetBytes = pdfEngine.rawBytes;
      this.fileName = store.getState().metadata?.title || store.getState().filename || 'document.pdf';
      this.modal.querySelector('#pdfa-file-label').textContent = this.fileName;
      this.modal.querySelector('#btn-run-pdfa').disabled = false;
    }
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }

  async runValidation() {
    if (!this.targetBytes) return;
    const reportEl = this.modal.querySelector('#pdfa-validation-report');
    if (!reportEl) return;

    reportEl.innerHTML = `<div style="text-align:center; padding:12px; font-size:12px; color:var(--text-muted);">Inspecting catalog OutputIntents & XMP streams...</div>`;

    try {
      const res = await pdfEngine.validatePdfA(this.targetBytes);
      const badgeColor = res.isValid ? '#10b981' : '#f59e0b';
      const badgeBg = res.isValid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';

      let checksHtml = (res.checks || []).map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border-subtle); font-size:12px;">
          <div>
            <div style="font-weight:600; color:var(--text-main);">${c.name}</div>
            <div style="color:var(--text-muted); font-size:11px;">${c.detail}</div>
          </div>
          <span style="font-weight:700; color:${c.passed ? '#10b981' : '#ef4444'}; font-size:12px;">
            ${c.passed ? '✓ PASS' : '✗ FAIL'}
          </span>
        </div>
      `).join('');

      reportEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <div style="font-size:14px; font-weight:700; color:var(--text-main);">${this.fileName}</div>
            <div style="font-size:11px; color:var(--text-muted);">Analyzed against ISO 19005 specification</div>
          </div>
          <span style="font-size:11px; font-weight:700; padding:4px 10px; border-radius:9999px; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeColor};">
            ${res.isValid ? `COMPLIANT (${res.profile.toUpperCase()})` : 'NOT COMPLIANT'}
          </span>
        </div>
        <div>${checksHtml}</div>
      `;
    } catch (e) {
      reportEl.innerHTML = `<div style="color:#ef4444; font-size:12px; padding:8px;">Validation error: ${e.message}</div>`;
    }
  }

  async runConvert() {
    if (!this.targetBytes || this.isConverting) return;

    this.isConverting = true;
    const loading = this.modal.querySelector('#pdfa-loading-state');
    const btnRun = this.modal.querySelector('#btn-run-pdfa');
    const loadingText = this.modal.querySelector('#pdfa-loading-text');

    loading.style.display = 'block';
    btnRun.disabled = true;

    if (loadingText) {
      loadingText.textContent = `Compiling ISO 19005 OutputIntents (${this.selectedProfile.toUpperCase()})...`;
    }

    try {
      this.pdfaBytes = await pdfEngine.convertToPdfA(this.targetBytes, {
        profile: this.selectedProfile,
        embeddedFile: this.embeddedFile
      });

      const blob = new Blob([this.pdfaBytes], { type: 'application/pdf' });
      const suffix = this.selectedProfile.toUpperCase();
      const cleanName = this.fileName.replace(/\.pdf$/i, '') + `-${suffix}.pdf`;
      downloadBlob(blob, cleanName);

      Toast.show(`Converted & downloaded ${suffix} compliant archive!`, 'success');
      this.hide();
    } catch (err) {
      console.error('PDF/A conversion failed:', err);
      Toast.show('Conversion failed: ' + err.message, 'error');
    } finally {
      this.isConverting = false;
      loading.style.display = 'none';
      btnRun.disabled = false;
    }
  }
}

export const pdfaModal = new PdfaModal();
