/**
 * Text Clustering Sub-Module
 * Reverse-engineered text reconstruction algorithm based on Sejda PDF & PDF.js text layer.
 * Groups fragmented glyphs and word segments emitted by PDF.js getTextContent()
 * into coherent, selectable, editable lines and phrases.
 */

import { uid } from '../../utils/helpers.js';

export class TextClustering {
  /**
   * Identifies the canonical PDF standard font name from raw PDF font descriptor.
   */
  static detectFontFamily(fontName) {
    if (!fontName) return 'Helvetica';
    const name = String(fontName).toLowerCase();
    const isBold = name.includes('bold') || name.includes('black') || name.includes('heavy') || name.includes('w7') || name.includes('w8');

    if (name.includes('times') || name.includes('cambria') || name.includes('georgia') || name.includes('serif') || name.includes('roman')) {
      return 'TimesRoman';
    }
    if (name.includes('courier') || name.includes('mono') || name.includes('code') || name.includes('consolas')) {
      return 'Courier';
    }
    return isBold ? 'HelveticaBold' : 'Helvetica';
  }

  /**
   * Generates a web-safe CSS font-family stack corresponding to the detected font.
   */
  static getCssFontFamily(fontName) {
    const canonical = this.detectFontFamily(fontName);
    if (canonical === 'TimesRoman') {
      return '"Times New Roman", Times, Georgia, serif';
    }
    if (canonical === 'Courier') {
      return '"Courier New", Courier, monospace';
    }
    return 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
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

      const isBold = item.fontName ? (/bold|heavy|black|w[789]/i).test(item.fontName) : false;

      mapped.push({
        str: item.str,
        fontName: item.fontName || 'Helvetica',
        isBold,
        hasEOL: !!item.hasEOL,
        vx,
        vy, // Baseline in viewport space
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
        // Merge into current cluster
        // If there's a visible word gap (> 0.2 * fontSize) and neither ends/starts with space, insert space
        if (gap > cur.fontSize * 0.22 && !cur.str.endsWith(' ') && !item.str.startsWith(' ')) {
          cur.str += ' ';
        }
        cur.str += item.str;

        // Expand cluster bounding box
        const newRight = Math.max(curRight, item.vx + item.width);
        cur.width = newRight - cur.vx;
        cur.top = Math.min(cur.top, item.top);
        cur.height = Math.max(cur.height, item.height);
        cur.fontSize = Math.max(cur.fontSize, item.fontSize);
        cur.hasEOL = item.hasEOL;
        cur.items.push(item);
      } else {
        // Finalize cluster if it has non-whitespace content
        if (cur.str.trim() !== '') {
          clusters.push(cur);
        }
        cur = {
          id: uid('txtcl'),
          str: item.str,
          fontName: item.fontName,
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

    if (cur && cur.str.trim() !== '') {
      clusters.push(cur);
    }

    return clusters;
  }
}
