/**
 * Selected Annotation Inspector Panel
 * Handles formatting controls for active canvas selections:
 * text styling, shapes stroke & fill, interactive link configuration,
 * element duplication, and removal.
 */

import { store } from '../../core/state-store.js';
import { Toast } from '../toast.js';
import { uid } from '../../utils/helpers.js';

export class SelectedAnnotationInspector {
  static render(panel) {
    const { pageNum, ann } = panel.selectedAnnotation;
    const type = ann.type || 'item';

    panel.setHeading(`${type.toUpperCase()} Selected`, `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`);

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

    panel.bodyEl.innerHTML = `
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
    const textInp = panel.bodyEl.querySelector('#opt-selected-text');
    if (textInp) {
      textInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { text: e.target.value });
      };
    }

    const sizeInp = panel.bodyEl.querySelector('#opt-selected-size');
    if (sizeInp) {
      sizeInp.onchange = (e) => {
        store.updateAnnotation(pageNum, ann.id, { fontSize: parseInt(e.target.value, 10) });
      };
    }

    const colorInp = panel.bodyEl.querySelector('#opt-selected-color');
    if (colorInp) {
      colorInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { color: e.target.value });
      };
    }

    const strokeInp = panel.bodyEl.querySelector('#opt-selected-stroke');
    if (strokeInp) {
      strokeInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { stroke: e.target.value });
      };
    }

    const fillInp = panel.bodyEl.querySelector('#opt-selected-fill');
    if (fillInp) {
      fillInp.oninput = (e) => {
        store.updateAnnotation(pageNum, ann.id, { fill: e.target.value });
      };
    }

    const linkTargetInp = panel.bodyEl.querySelector('#opt-selected-link-target');
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

    const linkTypeUrlBtn = panel.bodyEl.querySelector('#opt-link-type-url');
    if (linkTypeUrlBtn) {
      linkTypeUrlBtn.onclick = () => {
        store.updateAnnotation(pageNum, ann.id, { targetType: 'url', url: ann.url || 'https://' });
        panel.render();
      };
    }

    const linkTypePageBtn = panel.bodyEl.querySelector('#opt-link-type-page');
    if (linkTypePageBtn) {
      linkTypePageBtn.onclick = () => {
        store.updateAnnotation(pageNum, ann.id, { targetType: 'page', pageTarget: ann.pageTarget || 1 });
        panel.render();
      };
    }

    const testLinkBtn = panel.bodyEl.querySelector('#opt-btn-test-link');
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

    const dupBtn = panel.bodyEl.querySelector('#opt-btn-duplicate');
    if (dupBtn) {
      dupBtn.onclick = () => {
        const cloned = { ...ann, id: uid(type), x: ann.x + 0.02, y: ann.y + 0.02 };
        store.addAnnotation(pageNum, cloned);
        Toast.success('Duplicated element');
      };
    }

    const delBtn = panel.bodyEl.querySelector('#opt-btn-delete');
    if (delBtn) {
      delBtn.onclick = () => {
        store.removeAnnotation(pageNum, ann.id);
        panel.selectedAnnotation = null;
        panel.render();
        Toast.info('Element removed');
      };
    }

    const deselectBtn = panel.bodyEl.querySelector('#opt-btn-deselect');
    if (deselectBtn) {
      deselectBtn.onclick = () => {
        panel.selectedAnnotation = null;
        panel.render();
      };
    }
  }
}
