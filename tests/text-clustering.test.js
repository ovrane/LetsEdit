/**
 * Text Clustering Engine Tests
 * Validates glyph & baseline proximity clustering, font matching, whitespace reconstruction,
 * line break recognition, and multi-column separation.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { TextClustering } from '../src/core/canvas/text-clustering.js';

describe('Text Clustering Engine Tests', () => {
  // Mock viewport with convertToViewportPoint
  const mockViewport = {
    convertToViewportPoint: (x, y) => [x * 1.5, 800 - (y * 1.5)]
  };

  test('detectFontFamily identifies standard PDF font families and weights', () => {
    assert.strictEqual(TextClustering.detectFontFamily('Helvetica'), 'Helvetica');
    assert.strictEqual(TextClustering.detectFontFamily('Helvetica-Bold'), 'HelveticaBold');
    assert.strictEqual(TextClustering.detectFontFamily('Arial-BoldMT'), 'HelveticaBold');
    assert.strictEqual(TextClustering.detectFontFamily('TimesNewRomanPSMT'), 'TimesRoman');
    assert.strictEqual(TextClustering.detectFontFamily('CourierNewPS-BoldMT'), 'Courier');
    assert.strictEqual(TextClustering.detectFontFamily('CustomSans-Black'), 'HelveticaBold');
  });

  test('getCssFontFamily generates valid web-safe CSS font stack', () => {
    const timesStack = TextClustering.getCssFontFamily('Times-Roman');
    assert.ok(timesStack.includes('Times New Roman'));

    const courierStack = TextClustering.getCssFontFamily('Courier-Oblique');
    assert.ok(courierStack.includes('Courier New'));

    const sansStack = TextClustering.getCssFontFamily('Arial');
    assert.ok(sansStack.includes('Inter') || sansStack.includes('sans-serif'));
  });

  test('returns empty array when given empty or null items', () => {
    assert.deepStrictEqual(TextClustering.clusterTextItems([], mockViewport), []);
    assert.deepStrictEqual(TextClustering.clusterTextItems(null, mockViewport), []);
    assert.deepStrictEqual(TextClustering.clusterTextItems([{ str: '' }], mockViewport), []);
  });

  test('merges fragmented syllables into a single coherent phrase on the same baseline', () => {
    // Simulated PDF.js items for "Invoice #1002" split across 3 fragments
    const rawItems = [
      {
        str: 'Inv',
        transform: [14, 0, 0, 14, 40, 500],
        width: 18,
        fontName: 'Helvetica-Bold'
      },
      {
        str: 'oice ',
        transform: [14, 0, 0, 14, 58, 500],
        width: 25,
        fontName: 'Helvetica-Bold'
      },
      {
        str: '#1002',
        transform: [14, 0, 0, 14, 83, 500],
        width: 32,
        fontName: 'Helvetica-Bold'
      }
    ];

    const clusters = TextClustering.clusterTextItems(rawItems, mockViewport, 1.0);
    assert.strictEqual(clusters.length, 1);
    assert.strictEqual(clusters[0].str, 'Invoice #1002');
    assert.ok(clusters[0].width > 70);
    assert.strictEqual(clusters[0].isBold, true);
  });

  test('automatically inserts space between words separated by horizontal gap', () => {
    const rawItems = [
      {
        str: 'Hello',
        transform: [12, 0, 0, 12, 50, 400],
        width: 30,
        fontName: 'Helvetica'
      },
      {
        str: 'World',
        transform: [12, 0, 0, 12, 85, 400], // gap of 5px (~0.4 fontSize)
        width: 30,
        fontName: 'Helvetica'
      }
    ];

    const clusters = TextClustering.clusterTextItems(rawItems, mockViewport, 1.0);
    assert.strictEqual(clusters.length, 1);
    assert.strictEqual(clusters[0].str, 'Hello World');
  });

  test('keeps different lines on distinct baselines separated', () => {
    const rawItems = [
      {
        str: 'Line 1 Title',
        transform: [16, 0, 0, 16, 50, 600],
        width: 80,
        fontName: 'Helvetica-Bold'
      },
      {
        str: 'Line 2 Subtitle',
        transform: [12, 0, 0, 12, 50, 560], // Different Y
        width: 75,
        fontName: 'Helvetica'
      }
    ];

    const clusters = TextClustering.clusterTextItems(rawItems, mockViewport, 1.0);
    assert.strictEqual(clusters.length, 2);
    assert.strictEqual(clusters[0].str, 'Line 1 Title');
    assert.strictEqual(clusters[1].str, 'Line 2 Subtitle');
  });

  test('keeps wide multi-column table data on same baseline separated', () => {
    const rawItems = [
      {
        str: 'Item 1: Premium Widget',
        transform: [12, 0, 0, 12, 40, 400],
        width: 120,
        fontName: 'Helvetica'
      },
      {
        str: '$250.00',
        transform: [12, 0, 0, 12, 350, 400], // Wide horizontal gap > maxGap
        width: 45,
        fontName: 'Helvetica'
      }
    ];

    const clusters = TextClustering.clusterTextItems(rawItems, mockViewport, 1.0);
    assert.strictEqual(clusters.length, 2);
    assert.strictEqual(clusters[0].str, 'Item 1: Premium Widget');
    assert.strictEqual(clusters[1].str, '$250.00');
  });

  test('respects hasEOL line break delimiter', () => {
    const rawItems = [
      {
        str: 'First sentence ending here.',
        transform: [12, 0, 0, 12, 50, 400],
        width: 150,
        hasEOL: true,
        fontName: 'Helvetica'
      },
      {
        str: 'Second sentence right after.',
        transform: [12, 0, 0, 12, 205, 400],
        width: 140,
        fontName: 'Helvetica'
      }
    ];

    const clusters = TextClustering.clusterTextItems(rawItems, mockViewport, 1.0);
    assert.strictEqual(clusters.length, 2);
    assert.strictEqual(clusters[0].str, 'First sentence ending here.');
    assert.strictEqual(clusters[1].str, 'Second sentence right after.');
  });
});
