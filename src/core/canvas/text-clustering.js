/**
 * Text Clustering Sub-Module
 * Groups fragmented glyphs and word segments emitted by PDF.js getTextContent()
 * into coherent, selectable, editable lines and phrases.
 *
 * Font detection delegates to FontRegistry for 150+ font support and
 * pixel-perfect visual matching between the PDF viewer and the inline editor.
 */

import { uid } from '../../utils/helpers.js';
import { detectFontIdFromPdf, getCssFontFamily } from '../font-registry.js';

export class TextClustering {
  /**
   * Identifies the canonical PDF standard font name from raw PDF font descriptor.
   * @param {string} fontName - Raw PDF font name
   * @returns {string} Standard PDF font name ('Helvetica', 'HelveticaBold', 'TimesRoman', 'Courier')
   */
  static detectFontFamily(fontName) {
    if (!fontName) return 'Helvetica';
    const name = String(fontName).toLowerCase();
    const isBold = name.includes('bold') || name.includes('black') || name.includes('heavy') || name.includes('w7') || name.includes('w8') || name.includes('w9');

    if (name.includes('times') || name.includes('cambria') || name.includes('georgia') || name.includes('serif') || name.includes('roman')) {
      return 'TimesRoman';
    }
    if (name.includes('courier') || name.includes('mono') || name.includes('code') || name.includes('consolas')) {
      return 'Courier';
    }
    return isBold ? 'HelveticaBold' : 'Helvetica';
  }

  /**
   * Auto-detects the 150+ canonical FontRegistry ID from a raw PDF font descriptor.
   * @param {string} fontName - Raw PDF font name
   * @returns {string} Canonical FontRegistry font ID
   */
  static detectFontId(fontName) {
    return detectFontIdFromPdf(fontName);
  }

  /**
   * Returns the CSS font-family stack for a raw PDF font name.
   * @param {string} fontName - Raw PDF font name
   * @returns {string} CSS font-family value
   */
  static getCssFontFamily(fontName) {
    const fontId = detectFontIdFromPdf(fontName);
    return getCssFontFamily(fontId);
  }

  /**
   * Clusters raw PDF.js TextContent items into coherent lines/phrases.
   *
   * @param {Array} rawItems - Array of raw TextContent items from PDF.js
   * @param {Object} viewport - PDF.js PageViewport instance
   * @param {number} scale - Current rendering scale factor
   * @returns {Array} Array of clustered text block objects
   */
  static clusterTextItems(rawItems, viewport, scale = 1.0) {
    if (!rawItems || rawItems.length === 0) return [];

    const effectiveScale = (viewport && typeof viewport.scale === 'number') ? viewport.scale : scale;

    // Step 1: Pre-calculate viewport coordinates for each valid item
    const mapped = [];
    for (const item of rawItems) {
      if (!item || typeof item.str !== 'string' || item.str === '') continue;

      const tx = item.transform || [12, 0, 0, 12, 0, 0];
      let vx = 0;
      let vy = 0;
      let itemWidth = 0;

      if (viewport && typeof viewport.convertToViewportPoint === 'function') {
        const pt = viewport.convertToViewportPoint(tx[4], tx[5]);
        vx = pt[0];
        vy = pt[1];
        const ptRight = viewport.convertToViewportPoint(tx[4] + (item.width || 0), tx[5]);
        itemWidth = Math.abs(ptRight[0] - pt[0]);
      } else {
        vx = (tx[4] || 0) * effectiveScale;
        vy = (tx[5] || 0) * effectiveScale;
        itemWidth = (item.width || 0) * effectiveScale;
      }

      // Calculate approximate font height in viewport pixels
      let fontHeight = Math.hypot(tx[2], tx[3]) * effectiveScale;
      if (fontHeight <= 0) fontHeight = Math.hypot(tx[0], tx[1]) * effectiveScale;
      if (fontHeight <= 0) fontHeight = 13 * effectiveScale;

      if (itemWidth <= 0) {
        itemWidth = item.str.length * fontHeight * 0.55;
      }

      const rawFontName = item.fontName || 'Helvetica';
      const isBold = /bold|heavy|black|w[789]/i.test(rawFontName);

      mapped.push({
        str: item.str,
        fontName: rawFontName,
        // Resolved canonical font ID for this item
        fontId: detectFontIdFromPdf(rawFontName),
        isBold,
        hasEOL: !!item.hasEOL,
        vx,
        vy,
        top: vy - fontHeight,
        width: itemWidth,
        height: fontHeight,
        fontSize: fontHeight,
        raw: item
      });
    }

    if (mapped.length === 0) return [];

    // Step 2: Sort items in natural reading order (Y baseline ascending, then X ascending)
    mapped.sort((a, b) => {
      const dy = a.vy - b.vy;
      if (Math.abs(dy) > 3.5) return dy;
      return a.vx - b.vx;
    });

    // Step 3: Proximity clustering along baselines
    const clusters = [];
    let cur = null;

    for (const item of mapped) {
      if (!cur) {
        cur = {
          id: uid('txtcl'),
          str: item.str,
          fontName: item.fontName,
          fontId: item.fontId,
          isBold: item.isBold,
          vx: item.vx,
          vy: item.vy,
          top: item.top,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          hasEOL: item.hasEOL,
          items: [item]
        };
        continue;
      }

      // 1. Baseline tolerance: are items on the same horizontal line?
      const baselineTol = Math.max(3.5, Math.min(item.height, cur.height) * 0.35);
      const isSameBaseline = Math.abs(item.vy - cur.vy) <= baselineTol;

      // 2. Horizontal gap: is the next item immediately following or within standard word space?
      const curRight = cur.vx + cur.width;
      const gap = item.vx - curRight;
      const maxGap = Math.max(16, cur.fontSize * 1.6);
      const isCloseEnough = gap >= -cur.fontSize * 0.5 && gap <= maxGap;

      // 3. Font size consistency
      const sizeRatio = Math.abs(item.fontSize - cur.fontSize) / Math.max(item.fontSize, cur.fontSize);
      const isSimilarSize = sizeRatio < 0.4;

      if (isSameBaseline && isCloseEnough && isSimilarSize && !cur.hasEOL) {
        // Insert space between words if visible gap exists and neither boundary has a space
        if (gap > cur.fontSize * 0.22 && !cur.str.endsWith(' ') && !item.str.startsWith(' ')) {
          cur.str += ' ';
        }
        cur.str += item.str;

        // Expand cluster bounding box
        const newRight = Math.max(curRight, item.vx + item.width);
        cur.width   = newRight - cur.vx;
        cur.top     = Math.min(cur.top, item.top);
        cur.height  = Math.max(cur.height, item.height);
        cur.fontSize = Math.max(cur.fontSize, item.fontSize);
        cur.hasEOL  = item.hasEOL;
        cur.items.push(item);
      } else {
        if (cur.str.trim() !== '') clusters.push(cur);
        cur = {
          id: uid('txtcl'),
          str: item.str,
          fontName: item.fontName,
          fontId: item.fontId,
          isBold: item.isBold,
          vx: item.vx,
          vy: item.vy,
          top: item.top,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          hasEOL: item.hasEOL,
          items: [item]
        };
      }
    }

    if (cur && cur.str.trim() !== '') clusters.push(cur);

    return clusters;
  }
}
