/**
 * Eraser Sub-Module
 * Handles continuous stroke-intersection erasing for freehand pen drawings,
 * highlighter paths, vector shapes, and bounding-box annotations.
 */

import { store } from '../state-store.js';

export class EraserHandler {
  static eraseAtPosition(pageNum, pos, wrap) {
    const annotations = store.getAnnotations(pageNum);
    if (!annotations || annotations.length === 0) return;

    const eraseRadius = 22; // Pixel collision radius
    const toRemove = [];

    for (const ann of annotations) {
      if (ann.type === 'drawing') {
        if (!ann.points) continue;
        for (const pt of ann.points) {
          const dx = (pt.x - pos.normX) * wrap.clientWidth;
          const dy = (pt.y - pos.normY) * wrap.clientHeight;
          if (dx * dx + dy * dy <= eraseRadius * eraseRadius) {
            toRemove.push(ann.id);
            break;
          }
        }
      } else if (['shape', 'whiteout', 'image', 'text', 'signature'].includes(ann.type)) {
        const annLeft = ann.x * wrap.clientWidth;
        const annTop = ann.y * wrap.clientHeight;
        const annRight = annLeft + (ann.width * wrap.clientWidth);
        const annBottom = annTop + (ann.height * wrap.clientHeight);

        if (pos.px >= annLeft - eraseRadius &&
            pos.px <= annRight + eraseRadius &&
            pos.py >= annTop - eraseRadius &&
            pos.py <= annBottom + eraseRadius) {
          toRemove.push(ann.id);
        }
      }
    }

    if (toRemove.length > 0) {
      toRemove.forEach(id => store.removeAnnotation(pageNum, id));
    }
  }
}
