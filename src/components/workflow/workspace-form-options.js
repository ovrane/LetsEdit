/**
 * Workspace Form Filler Options & Event Handlers
 * Reverse-engineered from Adobe Acrobat Pro & Sejda Form Filler:
 * - Dynamic AcroForm inspector & 2-way value bindings
 * - Demo auto-fill & clear all
 * - Bi-directional XFDF, FDF, JSON, and CSV export & import
 * - Vector flattening vs live AcroForm persistence toggle
 */

import { PageOperations } from '../../core/engine/page-ops.js';
import { Toast } from '../toast.js';
import { downloadBlob } from '../../utils/helpers.js';

export function renderFormFillerOptionsHtml(manager) {
  const fields = manager.detectedFormFields || [];
  const fieldCount = fields.length;
  const values = manager.formFieldValues || {};
  const isFlatten = Boolean(manager.flattenForms);

  return `
    <div class="workflow-options-group form-filler-options-group">
      <!-- Header Badge & Counter -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <label class="workflow-options-label" style="margin: 0; display: flex; align-items: center; gap: 6px;">
          <svg width="16" height="16" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15h6"></path><path d="M9 11h6"></path><path d="M9 19h4"></path></svg>
          <span>Form Fields</span>
        </label>
        <span class="badge" style="background: rgba(37, 99, 235, 0.1); color: #2563eb; font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 12px;">
          ${fieldCount} Field${fieldCount === 1 ? '' : 's'} Detected
        </span>
      </div>

      <!-- Quick Action Toolbar -->
      <div style="display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;">
        <button type="button" class="btn btn-xs btn-outline" id="btn-form-autofill" style="flex: 1; min-width: 90px; justify-content: center; gap: 4px; font-weight: 600;">
          <span>⚡ Demo Fill</span>
        </button>
        <button type="button" class="btn btn-xs btn-outline" id="btn-form-clear" style="flex: 1; min-width: 80px; justify-content: center; gap: 4px; font-weight: 600;">
          <span>🗑️ Clear</span>
        </button>
        <button type="button" class="btn btn-xs btn-outline" id="btn-form-import-trigger" style="flex: 1; min-width: 90px; justify-content: center; gap: 4px; font-weight: 600;">
          <span>📥 Import</span>
        </button>
        <input type="file" id="form-import-file-input" accept=".xfdf,.fdf,.json,.csv,application/json,text/csv,text/xml" style="display: none;" />
      </div>

      <!-- Export Form Data Dropdown Row -->
      <div style="margin-bottom: 16px; background: var(--bg-surface); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span>Export Form Data</span>
          <span style="font-size: 10.5px; opacity: 0.75;">XFDF / JSON / CSV</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
          <button type="button" class="btn btn-xs btn-outline btn-form-export" data-format="xfdf" style="background: var(--bg-card); font-weight: 600; font-size: 11px;">
            .XFDF
          </button>
          <button type="button" class="btn btn-xs btn-outline btn-form-export" data-format="json" style="background: var(--bg-card); font-weight: 600; font-size: 11px;">
            .JSON
          </button>
          <button type="button" class="btn btn-xs btn-outline btn-form-export" data-format="csv" style="background: var(--bg-card); font-weight: 600; font-size: 11px;">
            .CSV
          </button>
        </div>
      </div>

      <!-- Output Mode (Live AcroForm vs Flatten) -->
      <div style="margin-bottom: 16px; background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; cursor: pointer; color: var(--text-main); line-height: 1.4;">
          <input type="checkbox" id="chk-form-flatten" ${isFlatten ? 'checked' : ''} style="width: 16px; height: 16px; margin-top: 2px;" />
          <div>
            <strong style="display: block;">Flatten Form Fields on Export</strong>
            <span style="font-size: 11px; color: var(--text-muted); display: block;">Turn fields into permanent static vectors to prevent further editing or tampering.</span>
          </div>
        </label>
      </div>

      <!-- Itemized Field Editor List -->
      <div class="form-fields-scroll-wrap" style="max-height: 380px; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 12px;">
        ${fieldCount === 0 ? `
          <div style="text-align: center; padding: 24px 12px; background: var(--bg-surface); border-radius: 8px; border: 1px dashed var(--border-subtle); color: var(--text-muted);">
            <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 8px; display: block; opacity: 0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            <strong style="font-size: 13px; color: var(--text-main); display: block; margin-bottom: 4px;">No Fillable AcroForm Fields</strong>
            <span style="font-size: 11.5px; display: block; margin-bottom: 12px;">This document does not contain native interactive form fields.</span>
            <button type="button" class="btn btn-xs btn-primary" id="btn-load-sample-fillable-form" style="margin: 0 auto;">
              Load Sample Fillable Form
            </button>
          </div>
        ` : fields.map((f, idx) => {
          const curVal = values[f.name] !== undefined ? values[f.name] : (f.type === 'checkbox' ? f.isChecked : f.value);
          const typeLabel = f.type.toUpperCase();

          return `
            <div class="form-field-card" style="background: var(--bg-card); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <label style="font-size: 12px; font-weight: 700; color: var(--text-main); margin: 0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 170px;" title="${f.name}">
                  ${f.name}
                </label>
                <span style="font-size: 9.5px; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.05); color: var(--text-muted);">
                  ${typeLabel} • P.${(f.pageIndex || 0) + 1}
                </span>
              </div>

              ${f.type === 'checkbox' ? `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-muted);">
                  <input type="checkbox" class="interactive-form-input" data-name="${f.name}" data-type="checkbox" ${curVal ? 'checked' : ''} style="width: 16px; height: 16px;" />
                  <span>${curVal ? 'Checked (Yes)' : 'Unchecked (Off)'}</span>
                </label>
              ` : f.type === 'radio' ? `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  ${f.options.map(opt => `
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; cursor: pointer; color: var(--text-main);">
                      <input type="radio" class="interactive-form-input" name="radio_${f.name}" data-name="${f.name}" data-type="radio" value="${opt}" ${curVal === opt ? 'checked' : ''} style="width: 14px; height: 14px;" />
                      <span>${opt}</span>
                    </label>
                  `).join('')}
                </div>
              ` : f.type === 'dropdown' ? `
                <select class="form-select input-sm interactive-form-input" data-name="${f.name}" data-type="dropdown" style="width: 100%; font-size: 12px; padding: 5px 8px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-surface); color: var(--text-main);">
                  ${f.options.map(opt => `
                    <option value="${opt}" ${curVal === opt ? 'selected' : ''}>${opt}</option>
                  `).join('')}
                </select>
              ` : f.isMultiline ? `
                <textarea class="interactive-form-input" data-name="${f.name}" data-type="text" style="width: 100%; min-height: 54px; font-size: 12px; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-surface); color: var(--text-main); resize: vertical;">${curVal || ''}</textarea>
              ` : `
                <input type="text" class="interactive-form-input" data-name="${f.name}" data-type="text" value="${curVal || ''}" style="width: 100%; font-size: 12px; padding: 5px 8px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-surface); color: var(--text-main);" />
              `}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function bindFormFillerEvents(manager) {
  const container = manager.container;
  if (!container) return;

  // 1. Two-way binding for live input values
  const inputs = container.querySelectorAll('.interactive-form-input');
  inputs.forEach(inp => {
    const handler = (e) => {
      const name = inp.getAttribute('data-name');
      const type = inp.getAttribute('data-type');
      if (!name) return;

      if (!manager.formFieldValues) manager.formFieldValues = {};

      if (type === 'checkbox') {
        manager.formFieldValues[name] = inp.checked;
        const span = inp.parentNode?.querySelector('span');
        if (span) span.textContent = inp.checked ? 'Checked (Yes)' : 'Unchecked (Off)';
      } else if (type === 'radio') {
        if (inp.checked) manager.formFieldValues[name] = inp.value;
      } else {
        manager.formFieldValues[name] = inp.value;
      }
    };

    inp.addEventListener('input', handler);
    inp.addEventListener('change', handler);
  });

  // 2. Flatten checkbox toggle
  const flattenChk = container.querySelector('#chk-form-flatten');
  if (flattenChk) {
    flattenChk.onchange = () => {
      manager.flattenForms = flattenChk.checked;
    };
  }

  // 3. Demo Autofill Button
  const autofillBtn = container.querySelector('#btn-form-autofill');
  if (autofillBtn) {
    autofillBtn.onclick = () => {
      if (!manager.detectedFormFields || manager.detectedFormFields.length === 0) {
        Toast.info('No form fields to autofill');
        return;
      }

      const sampleValues = {
        full_name: 'Alex Sterling, Esq.',
        email_address: 'alex.sterling@enterprise-legal.com',
        phone_number: '+1 (555) 789-0123',
        department: 'Legal & Compliance',
        engagement_type: 'Full-Time Employee',
        notes_and_comments: 'Duly submitted with complete verified AcroForm electronic records under ISO 32000-1 specifications.',
        terms_accepted: true,
        subscribe_updates: true,
        submission_date: new Date().toISOString().split('T')[0]
      };

      if (!manager.formFieldValues) manager.formFieldValues = {};

      manager.detectedFormFields.forEach(f => {
        if (sampleValues[f.name] !== undefined) {
          manager.formFieldValues[f.name] = sampleValues[f.name];
        } else if (f.type === 'checkbox') {
          manager.formFieldValues[f.name] = true;
        } else if (f.type === 'dropdown' && f.options && f.options.length > 0) {
          manager.formFieldValues[f.name] = f.options[0];
        } else if (f.type === 'radio' && f.options && f.options.length > 0) {
          manager.formFieldValues[f.name] = f.options[0];
        } else {
          manager.formFieldValues[f.name] = `Sample ${f.name.replace(/_/g, ' ')}`;
        }
      });

      manager.render();
      Toast.success('Populated realistic demo values into all fields!');
    };
  }

  // 4. Clear All Button
  const clearBtn = container.querySelector('#btn-form-clear');
  if (clearBtn) {
    clearBtn.onclick = () => {
      manager.formFieldValues = {};
      if (manager.detectedFormFields) {
        manager.detectedFormFields.forEach(f => {
          manager.formFieldValues[f.name] = f.type === 'checkbox' ? false : '';
        });
      }
      manager.render();
      Toast.info('Cleared all form field entries');
    };
  }

  // 5. Export Form Data Buttons (XFDF, JSON, CSV)
  const exportBtns = container.querySelectorAll('.btn-form-export');
  exportBtns.forEach(btn => {
    btn.onclick = async () => {
      const format = btn.getAttribute('data-format') || 'json';
      const file = manager.uploadedFiles[0];
      if (!file?.bytes) {
        Toast.error('No document available to export form data from');
        return;
      }

      try {
        // Apply current in-memory edits to PDF bytes first
        const currentBytes = await PageOperations.fillFormFields(file.bytes, manager.formFieldValues || {}, { flatten: false });
        const exportRes = await PageOperations.exportFormData(currentBytes, format);

        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_form_data.${exportRes.extension}`;
        const blob = new Blob([exportRes.content], { type: exportRes.mimeType });
        downloadBlob(blob, filename);

        Toast.success(`Exported ${format.toUpperCase()} form data!`);
      } catch (err) {
        console.error('Export form data error:', err);
        Toast.error(`Failed to export ${format.toUpperCase()}: ${err.message}`);
      }
    };
  }
  );

  // 6. Import Form Data Trigger & File Ingestion
  const importTrigger = container.querySelector('#btn-form-import-trigger');
  const importInput = container.querySelector('#form-import-file-input');

  if (importTrigger && importInput) {
    importTrigger.onclick = () => importInput.click();

    importInput.onchange = async (e) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      const file = manager.uploadedFiles[0];
      if (!file?.bytes) {
        Toast.error('Please upload a PDF document before importing form data');
        return;
      }

      try {
        Toast.info(`Importing ${selectedFile.name}...`);
        const textContent = await selectedFile.text();
        const updatedBytes = await PageOperations.importFormData(file.bytes, textContent, 'auto');

        // Re-inspect updated fields to refresh UI values
        const inspection = await PageOperations.inspectFormFields(updatedBytes);
        manager.detectedFormFields = inspection.fields;
        manager.formFieldValues = {};
        inspection.fields.forEach(f => {
          manager.formFieldValues[f.name] = f.type === 'checkbox' ? f.isChecked : f.value;
        });

        manager.render();
        Toast.success(`Successfully imported data from ${selectedFile.name}!`);
      } catch (err) {
        console.error('Import form data error:', err);
        Toast.error('Failed to import form data: ' + err.message);
      } finally {
        importInput.value = '';
      }
    };
  }

  // 7. Load Sample Fillable Form button (when no fields detected)
  const sampleFormBtn = container.querySelector('#btn-load-sample-fillable-form');
  if (sampleFormBtn) {
    sampleFormBtn.onclick = async () => {
      Toast.info('Generating interactive AcroForm document...');
      const sampleBytes = await PageOperations.createSampleFillableFormPdf();
      manager.uploadedFiles = [{
        name: 'Sample_Fillable_Form.pdf',
        size: sampleBytes.byteLength,
        type: 'application/pdf',
        bytes: sampleBytes,
        rotation: 0,
        pageCount: 1,
        thumbnailUrl: null
      }];

      const inspection = await PageOperations.inspectFormFields(sampleBytes);
      manager.detectedFormFields = inspection.fields;
      manager.formFieldValues = {};
      inspection.fields.forEach(f => {
        manager.formFieldValues[f.name] = f.type === 'checkbox' ? f.isChecked : f.value;
      });

      manager.render();
      Toast.success('Interactive fillable AcroForm loaded!');
    };
  }
}
