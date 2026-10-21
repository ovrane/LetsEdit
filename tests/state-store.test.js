/**
 * StateStore Comprehensive Unit Tests
 * Tests document state, annotation management, undo/redo stacks, page reordering, and event dispatch.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { StateStore } from '../src/core/state-store.js';

describe('StateStore Engine Tests', () => {
  let store;

  beforeEach(() => {
    store = new StateStore();
  });

  test('initial state has expected defaults', () => {
    const s = store.getState();
    assert.strictEqual(s.pageCount, 0);
    assert.strictEqual(s.activeTool, 'select');
    assert.strictEqual(s.scale, 1.2);
    assert.deepStrictEqual(s.pageOrder, []);
    assert.strictEqual(s.watermark, null);
    assert.strictEqual(s.pageNumbers, null);
    assert.strictEqual(s.exportPassword, null);
  });

  test('setDocument initializes pages and page sequence', () => {
    const dummyBytes = new Uint8Array([1, 2, 3]).buffer;
    let notified = false;

    store.subscribe((event, state) => {
      if (event === 'document-loaded') {
        notified = true;
        assert.strictEqual(state.pageCount, 3);
        assert.deepStrictEqual(state.pageOrder, [1, 2, 3]);
      }
    });

    store.setDocument(dummyBytes, 'contract.pdf', 3);
    const s = store.getState();
    assert.strictEqual(s.filename, 'contract.pdf');
    assert.strictEqual(s.pageCount, 3);
    assert.deepStrictEqual(s.pageOrder, [1, 2, 3]);
    assert.strictEqual(notified, true);
  });

  test('page reordering maintains active sequence', () => {
    store.setDocument(new ArrayBuffer(8), 'test.pdf', 4);
    assert.deepStrictEqual(store.getState().pageOrder, [1, 2, 3, 4]);

    // Move page index 0 (page 1) to index 2
    store.reorderPages(0, 2);
    assert.deepStrictEqual(store.getState().pageOrder, [2, 3, 1, 4]);

    // Move last page to first
    store.reorderPages(3, 0);
    assert.deepStrictEqual(store.getState().pageOrder, [4, 2, 3, 1]);
  });

  test('addBlankPage inserts clean page at desired index', () => {
    store.setDocument(new ArrayBuffer(8), 'test.pdf', 2);
    assert.deepStrictEqual(store.getState().pageOrder, [1, 2]);

    // Insert blank page after first page (index 0)
    store.addBlankPage(0);
    const s = store.getState();
    assert.strictEqual(s.pageCount, 3);
    assert.deepStrictEqual(s.pageOrder, [1, 3, 2]);
    assert.deepStrictEqual(s.annotations[3], []);
  });

  test('annotation add, update, and remove with undo/redo', () => {
    store.setDocument(new ArrayBuffer(8), 'doc.pdf', 2);

    // Add annotation
    const ann1 = { id: 'text-1', type: 'text', text: 'Hello World', x: 0.1, y: 0.2, width: 0.2, height: 0.05 };
    store.addAnnotation(1, ann1);

    assert.strictEqual(store.getAnnotations(1).length, 1);
    assert.strictEqual(store.getAnnotations(1)[0].text, 'Hello World');

    // Update annotation
    store.updateAnnotation(1, 'text-1', { text: 'Updated Text' });
    assert.strictEqual(store.getAnnotations(1)[0].text, 'Updated Text');

    // Undo update
    store.undo();
    assert.strictEqual(store.getAnnotations(1)[0].text, 'Hello World');

    // Undo addition
    store.undo();
    assert.strictEqual(store.getAnnotations(1).length, 0);

    // Redo addition
    store.redo();
    assert.strictEqual(store.getAnnotations(1).length, 1);
    assert.strictEqual(store.getAnnotations(1)[0].text, 'Hello World');

    // Redo update
    store.redo();
    assert.strictEqual(store.getAnnotations(1)[0].text, 'Updated Text');

    // Remove annotation
    store.removeAnnotation(1, 'text-1');
    assert.strictEqual(store.getAnnotations(1).length, 0);

    // Undo removal
    store.undo();
    assert.strictEqual(store.getAnnotations(1).length, 1);
  });

  test('watermark configuration and clear', () => {
    const wm = { text: 'STRICTLY CONFIDENTIAL', rotation: 45, opacity: 0.35, color: '#dc2626', fontSize: 50 };
    store.setWatermark(wm);

    assert.deepStrictEqual(store.getState().watermark, wm);

    store.setWatermark(null);
    assert.strictEqual(store.getState().watermark, null);
  });

  test('page numbers formatting and positions', () => {
    const pn = { format: 'Page {n} of {total}', position: 'bottom-right' };
    store.setPageNumbers(pn);

    assert.deepStrictEqual(store.getState().pageNumbers, pn);
  });

  test('password security configuration', () => {
    const sec = {
      userPassword: 'SecretPassword99!',
      ownerPassword: 'MasterPassword00!',
      permissions: { printing: false, copying: false, modifying: false }
    };
    store.setExportPassword(sec);

    assert.deepStrictEqual(store.getState().exportPassword, sec);
  });

  test('page rotation updates in 90-degree increments', () => {
    store.setDocument(new ArrayBuffer(8), 'doc.pdf', 1);
    assert.strictEqual(store.getState().pageRotations[1], 0);

    store.rotatePage(1, 90);
    assert.strictEqual(store.getState().pageRotations[1], 90);

    store.rotatePage(1, 90);
    assert.strictEqual(store.getState().pageRotations[1], 180);

    store.rotatePage(1, 180);
    assert.strictEqual(store.getState().pageRotations[1], 0);
  });

  test('page deletion marks page deleted and updates order', () => {
    store.setDocument(new ArrayBuffer(8), 'doc.pdf', 3);
    assert.deepStrictEqual(store.getState().pageOrder, [1, 2, 3]);

    store.deletePage(2);
    const s = store.getState();
    assert.strictEqual(s.deletedPages.has(2), true);
    assert.deepStrictEqual(s.pageOrder, [1, 3]);

    // Undo deletion
    store.undo();
    const undone = store.getState();
    assert.strictEqual(undone.deletedPages.has(2), false);
    assert.deepStrictEqual(undone.pageOrder, [1, 2, 3]);
  });
});
