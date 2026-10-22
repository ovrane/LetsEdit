/**
 * Resize Gizmo & Drag Handler
 * Provides 8-point interactive bounding handles (nw, n, ne, e, se, s, sw, w)
 * and drag-and-drop repositioning for canvas annotations.
 */

import { store } from '../state-store.js';

export class ResizeGizmo {
  static attachResizeHandles(el, pageNum, ann, pageElements, onSelect) {
    const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    for (const dir of directions) {
      const handle = document.createElement('div');
      handle.className = `resize-handle handle-${dir}`;
      handle.dataset.dir = dir;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const origX = ann.x;
        const origY = ann.y;
        const origW = ann.width;
        const origH = ann.height;

        const refs = pageElements.get(pageNum);
        if (!refs) return;
        const w = refs.wrap.clientWidth;
        const h = refs.wrap.clientHeight;

        const onMouseMove = (moveEv) => {
          const dx = (moveEv.clientX - startX) / w;
          const dy = (moveEv.clientY - startY) / h;

          let newX = origX;
          let newY = origY;
          let newW = origW;
          let newH = origH;

          if (dir.includes('e')) {
            newW = Math.max(0.02, origW + dx);
          }
          if (dir.includes('w')) {
            const possibleW = Math.max(0.02, origW - dx);
            newX = origX + (origW - possibleW);
            newW = possibleW;
          }
          if (dir.includes('s')) {
            newH = Math.max(0.015, origH + dy);
          }
          if (dir.includes('n')) {
            const possibleH = Math.max(0.015, origH - dy);
            newY = origY + (origH - possibleH);
            newH = possibleH;
          }

          ann.x = newX;
          ann.y = newY;
          ann.width = newW;
          ann.height = newH;

          el.style.left = `${ann.x * w}px`;
          el.style.top = `${ann.y * h}px`;
          el.style.width = `${ann.width * w}px`;
          el.style.height = `${ann.height * h}px`;
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          store.updateAnnotation(pageNum, ann.id, {
            x: ann.x,
            y: ann.y,
            width: ann.width,
            height: ann.height
          });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      el.appendChild(handle);
    }
  }

  static makeDraggable(el, pageNum, ann, pageElements, onSelect) {
    let startX, startY, origX, origY;

    const onMouseDown = (e) => {
      if (e.target.closest('.annot-delete-btn') || e.target.tagName === 'INPUT') return;

      e.stopPropagation();
      if (onSelect) onSelect(pageNum, ann, el);

      startX = e.clientX;
      startY = e.clientY;
      origX = Number.isFinite(ann.x) ? ann.x : 0;
      origY = Number.isFinite(ann.y) ? ann.y : 0;

      const refs = pageElements.get(pageNum);
      if (!refs) return;
      const w = refs.wrap.clientWidth || 1;
      const h = refs.wrap.clientHeight || 1;

      const annW = (Number.isFinite(ann.width) && ann.width > 0) ? ann.width : Math.max(0.04, el.offsetWidth / w);
      const annH = (Number.isFinite(ann.height) && ann.height > 0) ? ann.height : Math.max(0.02, el.offsetHeight / h);

      let hasMoved = false;

      const onMouseMove = (moveEv) => {
        const dx = (moveEv.clientX - startX) / w;
        const dy = (moveEv.clientY - startY) / h;
        if (Math.abs(moveEv.clientX - startX) > 2 || Math.abs(moveEv.clientY - startY) > 2) {
          hasMoved = true;
        }
        ann.x = Math.max(0, Math.min(Math.max(0, 1 - annW), origX + dx));
        ann.y = Math.max(0, Math.min(Math.max(0, 1 - annH), origY + dy));
        ann.width = annW;
        ann.height = annH;
        el.style.left = `${ann.x * w}px`;
        el.style.top = `${ann.y * h}px`;
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (hasMoved) {
          store.updateAnnotation(pageNum, ann.id, {
            x: ann.x,
            y: ann.y,
            width: ann.width || annW,
            height: ann.height || annH
          });
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', onMouseDown);
  }
}
