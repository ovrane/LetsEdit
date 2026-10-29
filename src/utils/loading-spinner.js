/**
 * Minimal Loading SVG Helper
 * Provides a clean, ultra-lightweight, and high-performance loading SVG.
 * Designed to look crisp at 12px, 14px, 16px, or 20px without heavy DOM overhead.
 */

export function getMiniLoadingSvg(size = 14, className = '') {
  return `<svg class="mini-loading-svg ${className}" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke-opacity="0.2"/><path d="M8 2a6 6 0 0 1 6 6"/></svg>`;
}
