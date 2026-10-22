/**
 * Right-Side Tool Options Sidebar Component (Sejda & Canva Style)
 * Dynamically displays contextual options, presets, and formatting controls
 * for the currently active tool or selected canvas annotation.
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { uid } from '../utils/helpers.js';
import { searchReplace } from '../tools/search-replace.js';
import { FormTool } from '../tools/form-tool.js';

export class ToolOptionsPanel {
  constructor() {
    this.container = null;
    this.selectedAnnotation = null;
    this.isOpen = true;
  }

  mount(container) {
    this.container = container;
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="tool-options-header">
        <div class="tool-options-title">
          <span class="tool-options-icon" id="opt-panel-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </span>
          <span class="tool-options-label" id="opt-panel-label">Tool Options</span>
        </div>
        <button class="icon-btn icon-btn-sm" id="btn-close-tool-sidebar" title="Collapse Panel">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="tool-options-body" id="opt-panel-body"></div>
    `;

    this.iconEl = this.container.querySelector('#opt-panel-icon');
    this.labelEl = this.container.querySelector('#opt-panel-label');
    this.bodyEl = this.container.querySelector('#opt-panel-body');

    // Close button
    const closeBtn = this.container.querySelector('#btn-close-tool-sidebar');
    if (closeBtn) {
      closeBtn.onclick = () => this.toggle(false);
    }

    // Toggle button in navbar
    const toggleBtn = document.getElementById('btn-toggle-tool-sidebar');
    if (toggleBtn) {
      toggleBtn.onclick = () => this.toggle();
    }

    // Event listeners
    window.addEventListener('letsedit:annotation-selected', (e) => {
      this.selectedAnnotation = e.detail;
      this.render();
    });

    window.addEventListener('letsedit:annotation-deselected', () => {
      this.selectedAnnotation = null;
      this.render();
    });

    store.subscribe((event, state) => {
      if (event === 'tool-changed' && !this.selectedAnnotation) {
        this.render();
      }
    });

    // Initial render
    this.render();
  }

  toggle(force) {
    this.isOpen = force !== undefined ? force : !this.isOpen;
    if (this.isOpen) {
      document.body.classList.add('tool-sidebar-open');
    } else {
      document.body.classList.remove('tool-sidebar-open');
    }
  }

  render() {
    if (!this.bodyEl) return;

    if (this.selectedAnnotation) {
      this.renderSelectedAnnotation();
    } else {
      const activeTool = store.getState().activeTool || 'select';
      this.renderTool(activeTool);
    }
  }

  renderTool(tool) {
    const state = store.getState();

    switch (tool) {
      case 'text':
        this.setHeading('Text Options', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Font Family</label>
            <select class="select-sm w-full" id="opt-text-font">
              <option value="Helvetica" ${state.activeFontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica / Arial</option>
              <option value="TimesRoman" ${state.activeFontFamily === 'TimesRoman' ? 'selected' : ''}>Times New Roman</option>
              <option value="Courier" ${state.activeFontFamily === 'Courier' ? 'selected' : ''}>Courier Monospace</option>
              <option value="Roboto" ${state.activeFontFamily === 'Roboto' ? 'selected' : ''}>Roboto</option>
              <option value="Montserrat" ${state.activeFontFamily === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
              <option value="Caveat" ${state.activeFontFamily === 'Caveat' ? 'selected' : ''}>Caveat (Signature)</option>
            </select>
          </div>

          <div class="opt-group">
            <label class="opt-label">Font Size (${state.activeFontSize || 16}px)</label>
            <div class="flex items-center gap-2">
              <button class="btn btn-sm btn-outline" id="opt-text-size-minus" style="padding:4px 10px;">-</button>
              <select class="select-sm flex-1" id="opt-text-size">
                ${[10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map(s => `
                  <option value="${s}" ${state.activeFontSize === s ? 'selected' : ''}>${s} px</option>
                `).join('')}
              </select>
              <button class="btn btn-sm btn-outline" id="opt-text-size-plus" style="padding:4px 10px;">+</button>
            </div>
          </div>

          <div class="opt-group">
            <label class="opt-label">Text Color</label>
            <div class="color-palette-grid">
              ${['#000000', '#1e293b', '#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#0891b2'].map(c => `
                <button class="color-swatch-btn ${state.activeColor === c ? 'active' : ''}" style="background-color:${c};" data-color="${c}"></button>
              `).join('')}
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input type="color" id="opt-text-custom-color" class="color-input-badge" value="${state.activeColor || '#000000'}" />
              <span class="text-xs text-muted">Custom Hex</span>
            </div>
          </div>

          <div class="opt-group">
            <label class="opt-label">Quick Presets</label>
            <div class="flex flex-col gap-2">
              <button class="btn btn-outline btn-sm w-full" id="btn-add-heading" style="text-align:left; font-weight:700;">+ Heading (24px Bold)</button>
              <button class="btn btn-outline btn-sm w-full" id="btn-add-subheading" style="text-align:left; font-weight:600;">+ Subheading (18px)</button>
              <button class="btn btn-outline btn-sm w-full" id="btn-add-body" style="text-align:left;">+ Body Text (14px)</button>
            </div>
          </div>
        `;

        this.bindTextOptions();
        break;

      case 'shape':
        this.setHeading('Shape Options', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`);
        const subTool = state.subTool || 'rectangle';
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Shape Geometry</label>
            <div class="segmented-control w-full">
              <button class="segment-btn ${subTool === 'rectangle' ? 'active' : ''}" data-shape="rectangle">Rectangle</button>
              <button class="segment-btn ${subTool === 'ellipse' ? 'active' : ''}" data-shape="ellipse">Circle</button>
              <button class="segment-btn ${subTool === 'line' ? 'active' : ''}" data-shape="line">Line</button>
              <button class="segment-btn ${subTool === 'arrow' ? 'active' : ''}" data-shape="arrow">Arrow</button>
            </div>
          </div>

          <div class="opt-group">
            <label class="opt-label">Stroke & Border Color</label>
            <div class="color-palette-grid">
              ${['#000000', '#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#64748b', '#ffffff'].map(c => `
                <button class="color-swatch-btn ${state.activeColor === c ? 'active' : ''}" style="background-color:${c};" data-color="${c}"></button>
              `).join('')}
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input type="color" id="opt-shape-custom-color" class="color-input-badge" value="${state.activeColor || '#000000'}" />
              <span class="text-xs text-muted">Custom Color</span>
            </div>
          </div>

          <div class="opt-group">
            <label class="opt-label">Stroke Thickness (${state.activeStrokeWidth || 2}px)</label>
            <input type="range" id="opt-shape-thickness" min="1" max="10" step="1" value="${state.activeStrokeWidth || 2}" class="range-slider w-full" />
            <div class="flex justify-between text-xs text-muted mt-1">
              <span>1px Thin</span>
              <span>5px Medium</span>
              <span>10px Bold</span>
            </div>
          </div>
        `;

        this.bindShapeOptions();
        break;

      case 'draw':
        this.setHeading('Freehand Pen', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Ink Color</label>
            <div class="color-palette-grid">
              ${['#000000', '#1e3a8a', '#2563eb', '#dc2626', '#059669', '#7c3aed'].map(c => `
                <button class="color-swatch-btn ${state.activeColor === c ? 'active' : ''}" style="background-color:${c};" data-color="${c}"></button>
              `).join('')}
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input type="color" id="opt-draw-custom-color" class="color-input-badge" value="${state.activeColor || '#000000'}" />
              <span class="text-xs text-muted">Custom Ink</span>
            </div>
          </div>

          <div class="opt-group">
            <label class="opt-label">Pen Tip Width (${state.activeStrokeWidth || 2}px)</label>
            <input type="range" id="opt-draw-width" min="1" max="12" step="1" value="${state.activeStrokeWidth || 2}" class="range-slider w-full" />
          </div>

          <div class="opt-group">
            <div class="info-callout text-xs text-muted">
              💡 Drag smoothly across the page to draw. Drawings are preserved as high-resolution vector lines on export.
            </div>
          </div>
        `;

        this.bindDrawOptions();
        break;

      case 'highlight':
        this.setHeading('Highlighter', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2l4 4L7 17H3v-4L14 2z"></path><path d="M3 22h18"></path></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Highlighter Color</label>
            <div class="color-palette-grid">
              ${[
                { c: '#fef08a', name: 'Yellow' },
                { c: '#bbf7d0', name: 'Green' },
                { c: '#a5f3fc', name: 'Cyan' },
                { c: '#fbcfe8', name: 'Pink' },
                { c: '#fed7aa', name: 'Orange' }
              ].map(item => `
                <button class="color-swatch-btn ${state.activeColor === item.c ? 'active' : ''}" style="background-color:${item.c}; border:1px solid #cbd5e1;" data-color="${item.c}" title="${item.name}"></button>
              `).join('')}
            </div>
          </div>

          <div class="opt-group">
            <label class="opt-label">Highlight Width (${state.activeStrokeWidth || 16}px)</label>
            <input type="range" id="opt-hl-width" min="8" max="28" step="2" value="${state.activeStrokeWidth || 16}" class="range-slider w-full" />
          </div>

          <div class="opt-group">
            <div class="info-callout text-xs text-muted">
              ✨ Translucent highlighter strokes allow underlying document text to remain crisp and readable.
            </div>
          </div>
        `;

        this.bindHighlightOptions();
        break;

      case 'eraser':
        this.setHeading('Continuous Eraser', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13l-7-7L3 14l7 7 8-8z"></path><line x1="14" y1="22" x2="22" y2="22"></line></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Eraser Radius (20px)</label>
            <input type="range" id="opt-eraser-radius" min="10" max="40" step="2" value="20" class="range-slider w-full" />
          </div>

          <div class="opt-group">
            <div class="info-callout text-xs text-muted">
              🧹 Hold and drag over any freehand drawing or highlight stroke to erase it dynamically.
            </div>
          </div>
        `;
        break;

      case 'whiteout':
        this.setHeading('Redact & Whiteout', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Redaction Type</label>
            <div class="flex flex-col gap-2">
              <label class="radio-label">
                <input type="radio" name="whiteout-mode" value="white" checked />
                <span>Whiteout Box (Visual clean cover)</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="whiteout-mode" value="black" />
                <span>Black Redaction (Permanent purge)</span>
              </label>
            </div>
          </div>

          <div class="opt-group">
            <div class="info-callout text-xs text-muted">
              🔒 Draw a box over any sensitive data, numbers, or addresses. Whiteout masks pixels; black permanent redaction strips underlying byte streams on export.
            </div>
          </div>
        `;

        const radios = this.bodyEl.querySelectorAll('input[name="whiteout-mode"]');
        radios.forEach(r => {
          r.onchange = () => {
            store.getState().activeColor = r.value === 'black' ? '#000000' : '#ffffff';
          };
        });
        break;

      case 'sign':
        this.setHeading('Signatures', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"></path><path d="M14 7h7v7"></path></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <button class="btn btn-primary w-full" id="opt-btn-new-signature">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
              <span>Create / Add Signature</span>
            </button>
          </div>

          <div class="opt-group">
            <label class="opt-label">4 Ways to Sign</label>
            <ul class="text-xs text-muted list-disc pl-4 space-y-1">
              <li><strong>Draw:</strong> Smooth cubic Bezier ink pad</li>
              <li><strong>Type:</strong> Beautiful handwriting fonts</li>
              <li><strong>Upload:</strong> Image with transparent background</li>
              <li><strong>Camera:</strong> Instant ink scanner from paper</li>
            </ul>
          </div>
        `;

        const signBtn = this.bodyEl.querySelector('#opt-btn-new-signature');
        if (signBtn) {
          signBtn.onclick = () => {
            const toolBtn = document.querySelector('[data-tool="sign"]');
            if (toolBtn) toolBtn.click();
          };
        }
        break;

      case 'image':
        this.setHeading('Stamps & Badges', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <button class="btn btn-outline btn-sm w-full mb-3" id="opt-btn-upload-image">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <span>Upload Custom Image</span>
            </button>
          </div>

          <div class="opt-group">
            <label class="opt-label">One-Click Document Stamps</label>
            <div class="stamp-grid">
              ${[
                { text: 'APPROVED', color: '#16a34a' },
                { text: 'REJECTED', color: '#dc2626' },
                { text: 'CONFIDENTIAL', color: '#2563eb' },
                { text: 'PAID', color: '#059669' },
                { text: 'VOID', color: '#ea580c' },
                { text: 'FINAL', color: '#7c3aed' }
              ].map(s => `
                <button class="stamp-badge-btn" data-stamp="${s.text}" data-color="${s.color}" style="border-color:${s.color}; color:${s.color};">
                  ${s.text}
                </button>
              `).join('')}
            </div>
          </div>
        `;

        const uploadImgBtn = this.bodyEl.querySelector('#opt-btn-upload-image');
        if (uploadImgBtn) {
          uploadImgBtn.onclick = () => {
            const imgToolBtn = document.querySelector('[data-tool="image"]');
            if (imgToolBtn) imgToolBtn.click();
          };
        }

        const stampBtns = this.bodyEl.querySelectorAll('.stamp-badge-btn');
        stampBtns.forEach(b => {
          b.onclick = () => {
            const text = b.dataset.stamp;
            const color = b.dataset.color;
            this.insertStampAnnotation(text, color);
          };
        });
        break;

      case 'form':
        this.setHeading('Form Fields', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Insert Field</label>
            <div class="flex flex-col gap-2">
              <button class="btn btn-outline btn-sm w-full" id="opt-btn-add-textbox">+ Text Box</button>
              <button class="btn btn-outline btn-sm w-full" id="opt-btn-add-checkbox">+ Checkbox</button>
              <button class="btn btn-outline btn-sm w-full" id="opt-btn-add-radio">+ Radio Button</button>
              <button class="btn btn-outline btn-sm w-full" id="opt-btn-add-dropdown">+ Dropdown Menu</button>
            </div>
          </div>

          <div class="opt-group">
            <div class="info-callout text-xs text-muted">
              📝 Interactive AcroForm fields can be filled by recipients in standard PDF readers (Acrobat, Chrome, Edge).
            </div>
          </div>
        `;

        const addTxt = this.bodyEl.querySelector('#opt-btn-add-textbox');
        const addCb = this.bodyEl.querySelector('#opt-btn-add-checkbox');
        const addRad = this.bodyEl.querySelector('#opt-btn-add-radio');
        const addDd = this.bodyEl.querySelector('#opt-btn-add-dropdown');

        if (addTxt) addTxt.onclick = () => document.getElementById('btn-add-form-text')?.click();
        if (addCb) addCb.onclick = () => document.getElementById('btn-add-form-checkbox')?.click();
        if (addRad) addRad.onclick = () => document.getElementById('btn-add-form-radio')?.click();
        if (addDd) addDd.onclick = () => {
          FormTool.addField('dropdown');
        };
        break;

      case 'link':
        this.setHeading('Link Options', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <div class="info-callout text-xs text-muted" style="margin-bottom:12px;">
              🔗 <strong>Click & drag</strong> across any text or area on the page to create a clickable Link Hotspot.
            </div>
            <label class="opt-label">Quick Actions</label>
            <div class="flex flex-col gap-2">
              <button class="btn btn-sm btn-outline flex items-center justify-center gap-2" id="btn-opt-add-url-link">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>Add Web Link (URL)</span>
              </button>
              <button class="btn btn-sm btn-outline flex items-center justify-center gap-2" id="btn-opt-add-page-link">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Add Internal Page Jump</span>
              </button>
            </div>
          </div>
          <div class="opt-group">
            <label class="opt-label">Compatibility</label>
            <p class="text-xs text-muted">Links will be permanently embedded into vector PDF format compliant with ISO 32000-1 and clickable in Acrobat, Chrome, and Apple Preview.</p>
          </div>
        `;
        const addUrlBtn = this.bodyEl.querySelector('#btn-opt-add-url-link');
        if (addUrlBtn) {
          addUrlBtn.onclick = () => {
            const url = prompt('Enter Website URL:', 'https://example.com');
            if (url) {
              store.addAnnotation(1, {
                id: uid('link'),
                type: 'link',
                targetType: 'url',
                url: url.startsWith('http') ? url : 'https://' + url,
                x: 0.3,
                y: 0.3,
                width: 0.35,
                height: 0.05
              });
              Toast.success('Link hotspot placed! Drag to position over text.');
            }
          };
        }
        const addPageBtn = this.bodyEl.querySelector('#btn-opt-add-page-link');
        if (addPageBtn) {
          addPageBtn.onclick = () => {
            const pageStr = prompt('Enter Target Page Number (e.g. 2):', '2');
            if (pageStr && !isNaN(parseInt(pageStr, 10))) {
              const pageNum = parseInt(pageStr, 10);
              store.addAnnotation(1, {
                id: uid('link'),
                type: 'link',
                targetType: 'page',
                pageTarget: pageNum,
                x: 0.3,
                y: 0.3,
                width: 0.25,
                height: 0.05
              });
              Toast.success(`Page jump to Page ${pageNum} placed!`);
            }
          };
        }
        break;

      case 'replace':
        this.setHeading('Find & Replace', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <label class="opt-label">Find Query</label>
            <input type="text" id="opt-find-q" class="input-sm w-full" placeholder="Search document..." />
          </div>
          <div class="opt-group">
            <label class="opt-label">Replace With</label>
            <input type="text" id="opt-replace-q" class="input-sm w-full" placeholder="Replacement text..." />
          </div>
          <div class="opt-group">
            <div class="flex items-center justify-between mb-2">
              <span id="opt-search-count" class="text-xs font-semibold text-muted">0 matches</span>
              <div class="flex items-center gap-1">
                <button class="btn btn-sm btn-outline" id="opt-find-prev">◀</button>
                <button class="btn btn-sm btn-outline" id="opt-find-next">▶</button>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-outline flex-1" id="opt-btn-replace-one">Replace</button>
              <button class="btn btn-sm btn-primary flex-1" id="opt-btn-replace-all">Replace All</button>
            </div>
          </div>
        `;

        this.bindReplaceOptions();
        break;

      case 'select':
      default:
        this.setHeading('Selection & Layout', `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3l7 18 3-7 7-3L3 3z"></path></svg>`);
        this.bodyEl.innerHTML = `
          <div class="opt-group">
            <div class="info-callout text-xs text-muted" style="margin-bottom:12px;">
              🖱️ Click on any text, drawing, shape, or form element in the document to select and customize its properties.
            </div>
          </div>

          <div class="opt-group">
            <label class="opt-label">Keyboard Shortcuts</label>
            <div class="space-y-1 text-xs text-muted">
              <div class="flex justify-between py-1 border-b border-subtle">
                <span>Select & Move</span>
                <kbd class="kbd-badge">V</kbd>
              </div>
              <div class="flex justify-between py-1 border-b border-subtle">
                <span>Text Tool</span>
                <kbd class="kbd-badge">T</kbd>
              </div>
              <div class="flex justify-between py-1 border-b border-subtle">
                <span>Undo / Redo</span>
                <span><kbd class="kbd-badge">Ctrl+Z</kbd> / <kbd class="kbd-badge">Ctrl+Y</kbd></span>
              </div>
              <div class="flex justify-between py-1 border-b border-subtle">
                <span>All Tools Hub</span>
                <kbd class="kbd-badge">/</kbd>
              </div>
              <div class="flex justify-between py-1">
                <span>Delete Selected</span>
                <kbd class="kbd-badge">Del</kbd>
              </div>
            </div>
          </div>
        `;
        break;
    }
  }

  renderSelectedAnnotation() {
    const { pageNum, ann } = this.selectedAnnotation;
    const type = ann.type || 'item';

    this.setHeading(`${type.toUpperCase()} Selected`, `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`);

    let specificControls = '';

    if (type === 'text') {
      specificControls = `
        <div class="opt-group">
          <label class="opt-label">Edit Text</label>
          <textarea class="textarea-sm w-full" id="opt-selected-text" rows="2">${ann.text || ''}</textarea>
        </div>
        <div class="opt-group">
          <label class="opt-label">Font Size</label>
          <input type="number" class="input-sm w-full" id="opt-selected-size" value="${ann.fontSize || 16}" min="8" max="72" />
        </div>
        <div class="opt-group">
          <label class="opt-label">Text Color</label>
          <input type="color" class="color-input-badge" id="opt-selected-color" value="${ann.color || '#000000'}" />
        </div>
      `;
    } else if (type === 'shape') {
      specificControls = `
        <div class="opt-group">
          <label class="opt-label">Border / Stroke Color</label>
          <input type="color" class="color-input-badge" id="opt-selected-stroke" value="${ann.stroke || '#000000'}" />
        </div>
        <div class="opt-group">
          <label class="opt-label">Fill Color</label>
          <input type="color" class="color-input-badge" id="opt-selected-fill" value="${ann.fill && ann.fill !== 'transparent' ? ann.fill : '#ffffff'}" />
        </div>
      `;
    } else if (type === 'link') {
      const isPage = ann.targetType === 'page';
      specificControls = `
        <div class="opt-group">
          <label class="opt-label">Link Destination Type</label>
          <div class="flex gap-2">
            <button class="btn btn-sm ${!isPage ? 'btn-primary' : 'btn-outline'} flex-1" id="opt-link-type-url">Web URL</button>
            <button class="btn btn-sm ${isPage ? 'btn-primary' : 'btn-outline'} flex-1" id="opt-link-type-page">Page Jump</button>
          </div>
        </div>
        <div class="opt-group">
          <label class="opt-label">${isPage ? 'Target Page Number' : 'Web URL'}</label>
          <input type="${isPage ? 'number' : 'text'}" class="input-sm w-full" id="opt-selected-link-target" value="${isPage ? (ann.pageTarget || 1) : (ann.url || 'https://')}" />
        </div>
        <div class="opt-group">
          <button class="btn btn-sm btn-outline w-full" id="opt-btn-test-link">
            🔗 Test Link (${isPage ? `Jump to Page ${ann.pageTarget || 1}` : 'Open URL'})
          </button>
        </div>
      `;
    }

    this.bodyEl.innerHTML = `
      ${specificControls}

      <div class="opt-group">
        <label class="opt-label">Actions</label>
        <div class="flex flex-col gap-2">
          <button class="btn btn-outline btn-sm w-full" id="opt-btn-duplicate">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Duplicate Element (Ctrl+D)</span>
          </button>
          <button class="btn btn-danger btn-sm w-full" id="opt-btn-delete">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete Selected</span>
          </button>
          <button class="btn btn-outline btn-sm w-full" id="opt-btn-deselect">Deselect</button>
        </div>
      </div>
    `;

    // Bind selected annotation controls
    const textInp = this.bodyEl.querySelector('#opt-selected-text');
    if (textInp) {
      textInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { text: e.target.value });
      };
    }

    const sizeInp = this.bodyEl.querySelector('#opt-selected-size');
    if (sizeInp) {
      sizeInp.onchange = (e) => {
        store.updateAnnotation(pageNum, ann.id, { fontSize: parseInt(e.target.value, 10) });
      };
    }

    const colorInp = this.bodyEl.querySelector('#opt-selected-color');
    if (colorInp) {
      colorInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { color: e.target.value });
      };
    }

    const strokeInp = this.bodyEl.querySelector('#opt-selected-stroke');
    if (strokeInp) {
      strokeInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { stroke: e.target.value });
      };
    }

    const fillInp = this.bodyEl.querySelector('#opt-selected-fill');
    if (fillInp) {
      fillInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { fill: e.target.value });
      };
    }

    const linkTargetInp = this.bodyEl.querySelector('#opt-selected-link-target');
    if (linkTargetInp) {
      linkTargetInp.oninput = (e) => {
        const val = e.target.value.trim();
        if (ann.targetType === 'page') {
          const p = parseInt(val, 10);
          if (!isNaN(p)) store.updateAnnotation(pageNum, ann.id, { pageTarget: p });
        } else {
          store.updateAnnotation(pageNum, ann.id, { url: val });
        }
      };
    }

    const linkTypeUrlBtn = this.bodyEl.querySelector('#opt-link-type-url');
    if (linkTypeUrlBtn) {
      linkTypeUrlBtn.onclick = () => {
        store.updateAnnotation(pageNum, ann.id, { targetType: 'url', url: ann.url || 'https://' });
        this.render();
      };
    }

    const linkTypePageBtn = this.bodyEl.querySelector('#opt-link-type-page');
    if (linkTypePageBtn) {
      linkTypePageBtn.onclick = () => {
        store.updateAnnotation(pageNum, ann.id, { targetType: 'page', pageTarget: ann.pageTarget || 1 });
        this.render();
      };
    }

    const testLinkBtn = this.bodyEl.querySelector('#opt-btn-test-link');
    if (testLinkBtn) {
      testLinkBtn.onclick = () => {
        if (ann.targetType === 'page') {
          window.dispatchEvent(new CustomEvent('letsedit:scroll-to-page', { detail: { pageNum: ann.pageTarget || 1 } }));
          Toast.info(`Jumped to Page ${ann.pageTarget || 1}`);
        } else if (ann.url) {
          window.open(ann.url, '_blank');
        }
      };
    }

    const dupBtn = this.bodyEl.querySelector('#opt-btn-duplicate');
    if (dupBtn) {
      dupBtn.onclick = () => {
        const cloned = { ...ann, id: uid(type), x: ann.x + 0.02, y: ann.y + 0.02 };
        store.addAnnotation(pageNum, cloned);
        Toast.success('Duplicated element');
      };
    }

    const delBtn = this.bodyEl.querySelector('#opt-btn-delete');
    if (delBtn) {
      delBtn.onclick = () => {
        store.removeAnnotation(pageNum, ann.id);
        this.selectedAnnotation = null;
        this.render();
        Toast.info('Element removed');
      };
    }

    const deselectBtn = this.bodyEl.querySelector('#opt-btn-deselect');
    if (deselectBtn) {
      deselectBtn.onclick = () => {
        this.selectedAnnotation = null;
        this.render();
      };
    }
  }

  setHeading(label, iconSvg) {
    if (this.labelEl) this.labelEl.textContent = label;
    if (this.iconEl && iconSvg) this.iconEl.innerHTML = iconSvg;
  }

  bindTextOptions() {
    const fontSel = this.bodyEl.querySelector('#opt-text-font');
    if (fontSel) {
      fontSel.onchange = (e) => {
        store.getState().activeFontFamily = e.target.value;
      };
    }

    const sizeSel = this.bodyEl.querySelector('#opt-text-size');
    const sizeMinus = this.bodyEl.querySelector('#opt-text-size-minus');
    const sizePlus = this.bodyEl.querySelector('#opt-text-size-plus');

    if (sizeSel) {
      sizeSel.onchange = (e) => {
        store.getState().activeFontSize = parseInt(e.target.value, 10);
      };
    }
    if (sizeMinus && sizeSel) {
      sizeMinus.onclick = () => {
        const cur = parseInt(sizeSel.value, 10);
        if (cur > 8) {
          sizeSel.value = (cur - 2).toString();
          store.getState().activeFontSize = cur - 2;
        }
      };
    }
    if (sizePlus && sizeSel) {
      sizePlus.onclick = () => {
        const cur = parseInt(sizeSel.value, 10);
        if (cur < 72) {
          sizeSel.value = (cur + 2).toString();
          store.getState().activeFontSize = cur + 2;
        }
      };
    }

    const swatches = this.bodyEl.querySelectorAll('.color-swatch-btn');
    swatches.forEach(s => {
      s.onclick = () => {
        swatches.forEach(b => b.classList.remove('active'));
        s.classList.add('active');
        store.getState().activeColor = s.dataset.color;
        const customColor = this.bodyEl.querySelector('#opt-text-custom-color');
        if (customColor) customColor.value = s.dataset.color;
      };
    });

    const customColor = this.bodyEl.querySelector('#opt-text-custom-color');
    if (customColor) {
      customColor.oninput = (e) => {
        store.getState().activeColor = e.target.value;
        swatches.forEach(b => b.classList.remove('active'));
      };
    }

    const headingBtn = this.bodyEl.querySelector('#btn-add-heading');
    if (headingBtn) {
      headingBtn.onclick = () => {
        store.getState().activeFontSize = 24;
        store.getState().activeFontFamily = 'Helvetica';
        store.setTool('text');
        Toast.info('Click anywhere on the document to place Heading');
      };
    }

    const subheadBtn = this.bodyEl.querySelector('#btn-add-subheading');
    if (subheadBtn) {
      subheadBtn.onclick = () => {
        store.getState().activeFontSize = 18;
        store.setTool('text');
        Toast.info('Click anywhere on the document to place Subheading');
      };
    }

    const bodyBtn = this.bodyEl.querySelector('#btn-add-body');
    if (bodyBtn) {
      bodyBtn.onclick = () => {
        store.getState().activeFontSize = 14;
        store.setTool('text');
        Toast.info('Click anywhere on the document to place Body text');
      };
    }
  }

  bindShapeOptions() {
    const segmentBtns = this.bodyEl.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
      btn.onclick = () => {
        segmentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.getState().subTool = btn.dataset.shape;
      };
    });

    const swatches = this.bodyEl.querySelectorAll('.color-swatch-btn');
    swatches.forEach(s => {
      s.onclick = () => {
        swatches.forEach(b => b.classList.remove('active'));
        s.classList.add('active');
        store.getState().activeColor = s.dataset.color;
      };
    });

    const thickSlider = this.bodyEl.querySelector('#opt-shape-thickness');
    if (thickSlider) {
      thickSlider.oninput = (e) => {
        store.getState().activeStrokeWidth = parseInt(e.target.value, 10);
      };
    }
  }

  bindDrawOptions() {
    const swatches = this.bodyEl.querySelectorAll('.color-swatch-btn');
    swatches.forEach(s => {
      s.onclick = () => {
        swatches.forEach(b => b.classList.remove('active'));
        s.classList.add('active');
        store.getState().activeColor = s.dataset.color;
      };
    });

    const widthSlider = this.bodyEl.querySelector('#opt-draw-width');
    if (widthSlider) {
      widthSlider.oninput = (e) => {
        store.getState().activeStrokeWidth = parseInt(e.target.value, 10);
      };
    }
  }

  bindHighlightOptions() {
    const swatches = this.bodyEl.querySelectorAll('.color-swatch-btn');
    swatches.forEach(s => {
      s.onclick = () => {
        swatches.forEach(b => b.classList.remove('active'));
        s.classList.add('active');
        store.getState().activeColor = s.dataset.color;
      };
    });

    const widthSlider = this.bodyEl.querySelector('#opt-hl-width');
    if (widthSlider) {
      widthSlider.oninput = (e) => {
        store.getState().activeStrokeWidth = parseInt(e.target.value, 10);
      };
    }
  }

  bindReplaceOptions() {
    const findInp = this.bodyEl.querySelector('#opt-find-q');
    const replaceInp = this.bodyEl.querySelector('#opt-replace-q');
    const countBadge = this.bodyEl.querySelector('#opt-search-count');
    const prevBtn = this.bodyEl.querySelector('#opt-find-prev');
    const nextBtn = this.bodyEl.querySelector('#opt-find-next');
    const repOneBtn = this.bodyEl.querySelector('#opt-btn-replace-one');
    const repAllBtn = this.bodyEl.querySelector('#opt-btn-replace-all');

    const updateSearch = () => {
      const q = findInp.value;
      searchReplace.search(q);
      const count = searchReplace.matches.length;
      countBadge.textContent = count > 0 ? `${searchReplace.currentIndex + 1} of ${count}` : '0 matches';
    };

    if (findInp) findInp.oninput = updateSearch;
    if (prevBtn) {
      prevBtn.onclick = () => {
        searchReplace.prevMatch();
        updateSearch();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        searchReplace.nextMatch();
        updateSearch();
      };
    }
    if (repAllBtn && replaceInp) {
      repAllBtn.onclick = () => {
        const count = searchReplace.replaceAll(replaceInp.value);
        Toast.success(`Replaced ${count} occurrences!`);
        updateSearch();
      };
    }
  }

  insertStampAnnotation(text, color) {
    const pageNum = 1;
    // Generate clean canvas stamp data URL
    const cvs = document.createElement('canvas');
    cvs.width = 300;
    cvs.height = 100;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, 300, 100);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 284, 84);

    ctx.font = 'bold 32px Helvetica, Arial, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 150, 50);
    ctx.restore();

    const dataUrl = cvs.toDataURL('image/png');
    const ann = {
      id: uid('stamp'),
      type: 'image',
      dataUrl,
      x: 0.35,
      y: 0.15,
      width: 0.3,
      height: 0.1
    };

    store.addAnnotation(pageNum, ann);
    Toast.success(`Placed ${text} stamp on page 1`);
  }
}

export const toolOptionsPanel = new ToolOptionsPanel();
