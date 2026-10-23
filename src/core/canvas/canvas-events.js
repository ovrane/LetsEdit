/**
 * Canvas Events & Interaction Handler
 * Handles mouse interactions, freehand drawing, live stroke preview,
 * eraser gestures, bounding box drawing (whiteout/shape/link), and inline text editing.
 */

import { store } from '../state-store.js';
import { uid } from '../../utils/helpers.js';
import { Toast } from '../../components/toast.js';
import { EraserHandler } from './eraser.js';
import { TextClustering } from './text-clustering.js';

export class CanvasEventsHandler {
  static bindPageEvents(manager, pageNum, wrap, annotCanvas) {
    let drawingPoints = [];

    const getPos = (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      return {
        px: x,
        py: y,
        normX: x / rect.width,
        normY: y / rect.height
      };
    };

    wrap.addEventListener('mousedown', (e) => {
      if (e.target.closest('.annot-item') || e.target.closest('.inline-text-editor')) return;

      const state = store.getState();
      const pos = getPos(e);

      if (state.activeTool === 'eraser') {
        manager.isErasing = true;
        EraserHandler.eraseAtPosition(pageNum, pos, wrap);
        return;
      } else if (state.activeTool === 'draw' || state.activeTool === 'highlight') {
        manager.isDrawing = true;
        drawingPoints = [{ x: pos.normX, y: pos.normY }];
      } else if (state.activeTool === 'whiteout') {
        CanvasEventsHandler.startBoxDrawing(pageNum, 'whiteout', pos, wrap);
      } else if (state.activeTool === 'shape') {
        CanvasEventsHandler.startBoxDrawing(pageNum, 'shape', pos, wrap);
      } else if (state.activeTool === 'link') {
        CanvasEventsHandler.startBoxDrawing(pageNum, 'link', pos, wrap);
      } else if (state.activeTool === 'text') {
        CanvasEventsHandler.promptNewText(pageNum, pos, wrap);
      }
    });

    wrap.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      if (manager.isErasing) {
        EraserHandler.eraseAtPosition(pageNum, pos, wrap);
        return;
      }
      if (!manager.isDrawing) return;
      drawingPoints.push({ x: pos.normX, y: pos.normY });

      // Live sketch on annotCanvas
      const ctx = annotCanvas.getContext('2d');
      const state = store.getState();
      ctx.save();
      ctx.strokeStyle = state.activeColor || (state.activeTool === 'highlight' ? '#ffff00' : '#ff0000');
      ctx.lineWidth = (state.activeStrokeWidth || 3) * (wrap.clientWidth / 600);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (state.activeTool === 'highlight') ctx.globalAlpha = 0.4;

      const p1 = drawingPoints[drawingPoints.length - 2];
      const p2 = drawingPoints[drawingPoints.length - 1];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * wrap.clientWidth, p1.y * wrap.clientHeight);
        ctx.lineTo(p2.x * wrap.clientWidth, p2.y * wrap.clientHeight);
        ctx.stroke();
      }
      ctx.restore();
    });

    const stopAction = () => {
      manager.isErasing = false;
      if (!manager.isDrawing) return;
      manager.isDrawing = false;
      const state = store.getState();
      if (drawingPoints.length > 1) {
        store.addAnnotation(pageNum, {
          id: uid('draw'),
          type: 'drawing',
          points: drawingPoints,
          color: state.activeColor || (state.activeTool === 'highlight' ? '#ffd700' : '#ff0000'),
          strokeWidth: state.activeStrokeWidth || 3,
          isHighlighter: state.activeTool === 'highlight'
        });
      }
      drawingPoints = [];
    };

    wrap.addEventListener('mouseup', stopAction);
    wrap.addEventListener('mouseleave', stopAction);
  }

  static promptNewText(pageNum, pos, wrap) {
    const state = store.getState();
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-text-editor new-text-editor';
    input.placeholder = 'Type text here...';
    input.style.left = `${pos.px}px`;
    input.style.top = `${pos.py}px`;
    input.style.fontSize = `${state.activeFontSize || 16}px`;
    input.style.color = state.activeColor || '#000000';
    input.style.fontFamily = state.activeFontFamily || 'Helvetica';

    const commit = () => {
      const text = input.value.trim();
      input.remove();
      if (text) {
        store.addAnnotation(pageNum, {
          id: uid('text'),
          type: 'text',
          text,
          x: pos.normX,
          y: pos.normY,
          width: Math.min(0.4, (text.length * 10) / w),
          height: 30 / h,
          fontSize: state.activeFontSize || 16,
          fontFamily: state.activeFontFamily || 'Helvetica',
          color: state.activeColor || '#000000',
          hasUnderlay: false
        });
      }
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') input.remove();
    });

    wrap.querySelector('.pdf-dom-layer').appendChild(input);
    input.focus();
  }

  static startBoxDrawing(pageNum, toolType, startPos, wrap) {
    const state = store.getState();
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    const box = document.createElement('div');
    box.className = 'live-drag-box';
    wrap.appendChild(box);

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const left = Math.min(startPos.px, curX);
      const top = Math.min(startPos.py, curY);
      const width = Math.abs(curX - startPos.px);
      const height = Math.abs(curY - startPos.py);

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      const left = parseFloat(box.style.left) || 0;
      const top = parseFloat(box.style.top) || 0;
      const width = parseFloat(box.style.width) || 0;
      const height = parseFloat(box.style.height) || 0;

      box.remove();

      if (width > 5 && height > 5) {
        if (toolType === 'whiteout') {
          store.addAnnotation(pageNum, {
            id: uid('whiteout'),
            type: 'whiteout',
            x: left / w,
            y: top / h,
            width: width / w,
            height: height / h
          });
        } else if (toolType === 'shape') {
          store.addAnnotation(pageNum, {
            id: uid('shape'),
            type: 'shape',
            shapeType: state.subTool || 'rectangle',
            x: left / w,
            y: top / h,
            width: width / w,
            height: height / h,
            strokeColor: state.activeColor || '#000000',
            strokeWidth: state.activeStrokeWidth || 2,
            fillColor: state.activeFillColor || 'transparent'
          });
        } else if (toolType === 'link') {
          const defaultUrl = 'https://';
          const linkInput = prompt('Enter Web URL (e.g. https://example.com) or Page Number (e.g. 2):', defaultUrl);
          if (linkInput && linkInput.trim()) {
            const trimmed = linkInput.trim();
            const isPage = /^\d+$/.test(trimmed);
            store.addAnnotation(pageNum, {
              id: uid('link'),
              type: 'link',
              targetType: isPage ? 'page' : 'url',
              url: isPage ? undefined : (trimmed.startsWith('http') ? trimmed : 'https://' + trimmed),
              pageTarget: isPage ? parseInt(trimmed, 10) : undefined,
              x: left / w,
              y: top / h,
              width: Math.max(0.12, width / w),
              height: Math.max(0.04, height / h)
            });
            Toast.success(isPage ? `Link to page ${trimmed} added!` : `Link to ${trimmed} added!`);
          }
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  static makeExistingTextEditable(manager, span, pageNum, cluster) {
    const refs = manager.pageElements.get(pageNum);
    if (!refs) return;

    span.style.visibility = 'hidden';

    const wrapW = refs.wrap.clientWidth;
    const wrapH = refs.wrap.clientHeight;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-text-editor';
    input.value = cluster.str;
    input.style.left = `${cluster.vx - 3}px`;
    input.style.top = `${cluster.top - 2}px`;
    input.style.width = `${Math.max(cluster.width + 16, 90)}px`;
    input.style.height = `${cluster.height + 6}px`;
    input.style.fontSize = `${cluster.fontSize}px`;
    input.style.fontFamily = TextClustering.getCssFontFamily(cluster.fontName);
    if (cluster.isBold) input.style.fontWeight = 'bold';

    const updateInputWidth = () => {
      const charW = (cluster.fontSize || 14) * 0.62;
      const dynamicWidth = Math.max(cluster.width + 16, (input.value.length * charW) + 28);
      input.style.width = `${dynamicWidth}px`;
    };
    input.addEventListener('input', updateInputWidth);

    let isCommitted = false;
    const commitChange = () => {
      if (isCommitted) return;
      isCommitted = true;
      const newText = input.value;
      input.remove();

      if (newText && newText !== cluster.str) {
        const charW = (cluster.fontSize || 14) * 0.62;
        const finalW = Math.max(cluster.width, newText.length * charW);
        store.addAnnotation(pageNum, {
          id: uid('text'),
          replacedClusterId: cluster.id,
          type: 'text',
          text: newText,
          x: (cluster.vx - 2) / wrapW,
          y: (cluster.top - 2) / wrapH,
          width: (finalW + 14) / wrapW,
          height: (cluster.height + 6) / wrapH,
          fontSize: cluster.fontSize,
          fontFamily: TextClustering.detectFontFamily(cluster.fontName),
          bold: cluster.isBold,
          color: '#000000',
          hasUnderlay: true
        });
      } else {
        span.style.visibility = 'visible';
      }
    };

    input.addEventListener('blur', commitChange);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        isCommitted = true;
        input.remove();
        span.style.visibility = 'visible';
      }
    });

    refs.domLayer.appendChild(input);
    input.focus();
    input.select();
  }
}
