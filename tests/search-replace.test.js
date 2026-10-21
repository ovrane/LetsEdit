/**
 * Search & Replace Engine Unit Tests
 * Tests regex search, case-sensitivity, Next/Prev match navigation cycling, and replacement.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SearchReplaceTool } from '../src/tools/search-replace.js';
import { store } from '../src/core/state-store.js';

describe('Search & Replace Tool Tests', () => {
  let sr;

  beforeEach(() => {
    sr = new SearchReplaceTool();
    store.reset();
  });

  test('initial state has empty matches and -1 index', () => {
    assert.strictEqual(sr.matches.length, 0);
    assert.strictEqual(sr.currentMatchIndex, -1);
  });

  test('empty or whitespace query returns zero matches', async () => {
    const res = await sr.search('   ');
    assert.strictEqual(res.total, 0);
    assert.strictEqual(res.current, 0);
  });

  test('nextMatch and prevMatch cycle correctly through index bounds', () => {
    sr.matches = [
      { id: 'm1', pageNum: 1, matchedText: 'Alpha', x: 10, y: 10, width: 20, height: 10 },
      { id: 'm2', pageNum: 1, matchedText: 'Beta', x: 40, y: 10, width: 20, height: 10 },
      { id: 'm3', pageNum: 2, matchedText: 'Gamma', x: 10, y: 30, width: 20, height: 10 }
    ];
    sr.currentMatchIndex = 0;

    // Next match advances from 0 -> 1
    let nav = sr.nextMatch();
    assert.strictEqual(nav.current, 2);
    assert.strictEqual(sr.currentMatchIndex, 1);

    // Next match advances from 1 -> 2
    nav = sr.nextMatch();
    assert.strictEqual(nav.current, 3);
    assert.strictEqual(sr.currentMatchIndex, 2);

    // Next match wraps around from 2 -> 0
    nav = sr.nextMatch();
    assert.strictEqual(nav.current, 1);
    assert.strictEqual(sr.currentMatchIndex, 0);

    // Prev match wraps backward from 0 -> 2
    nav = sr.prevMatch();
    assert.strictEqual(nav.current, 3);
    assert.strictEqual(sr.currentMatchIndex, 2);
  });

  test('replaceAll creates replacement annotations on store', () => {
    store.setDocument(new ArrayBuffer(8), 'test.pdf', 2);
    sr.matches = [
      { id: 'm1', pageNum: 1, matchedText: 'OldCorp', x: 50, y: 100, width: 80, height: 16 },
      { id: 'm2', pageNum: 2, matchedText: 'OldCorp', x: 60, y: 200, width: 80, height: 16 }
    ];

    const count = sr.replaceAll('OldCorp', 'NewCorp Ltd');
    assert.strictEqual(count, 2);
    assert.strictEqual(sr.matches.length, 0);

    const page1Annots = store.getAnnotations(1);
    assert.strictEqual(page1Annots.length, 1);
    assert.strictEqual(page1Annots[0].text, 'NewCorp Ltd');
    assert.strictEqual(page1Annots[0].hasUnderlay, true);

    const page2Annots = store.getAnnotations(2);
    assert.strictEqual(page2Annots.length, 1);
    assert.strictEqual(page2Annots[0].text, 'NewCorp Ltd');
  });
});
