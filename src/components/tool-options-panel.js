/**
 * Right-Side Tool Options Sidebar Component (Sejda & Canva Style)
 * Dynamically displays contextual options, presets, and formatting controls
 * for the currently active tool or selected canvas annotation.
 * Decomposed into modular sub-modules in ./tool-options/:
 * - tool-renderers.js: Renders tool-specific options (Text, Shape, Pen, etc.)
 * - selected-annotation.js: Renders selected annotation inspector (Text, Shape, Link, etc.)
 */

import { store } from '../core/state-store.js';
import { ToolRenderers } from './tool-options/tool-renderers.js';
import { SelectedAnnotationInspector } from './tool-options/selected-annotation.js';

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

    const closeBtn = this.container.querySelector('#btn-close-tool-sidebar');
    if (closeBtn) {
      closeBtn.onclick = () => this.toggle(false);
    }

    const toggleBtn = document.getElementById('btn-toggle-tool-sidebar');
    if (toggleBtn) {
      toggleBtn.onclick = () => this.toggle();
    }

    window.addEventListener('letsedit:annotation-selected', (e) => {
      this.selectedAnnotation = e.detail;
      this.render();
    });

    window.addEventListener('letsedit:annotation-deselected', () => {
      this.selectedAnnotation = null;
      this.render();
    });

    store.subscribe((event) => {
      if (event === 'tool-changed' && !this.selectedAnnotation) {
        this.render();
      }
    });

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
      SelectedAnnotationInspector.render(this);
    } else {
      const activeTool = store.getState().activeTool || 'select';
      ToolRenderers.renderTool(this, activeTool);
    }
  }

  setHeading(label, iconSvg) {
    if (this.labelEl) this.labelEl.textContent = label;
    if (this.iconEl && iconSvg) this.iconEl.innerHTML = iconSvg;
  }
}

export const toolOptionsPanel = new ToolOptionsPanel();
