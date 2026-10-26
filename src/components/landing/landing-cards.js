/**
 * Landing Cards & Filter Renderer
 * Manages category filtering, live text search, tool card HTML markup,
 * and card click dispatching.
 */

import { TOOLS_CATALOG, LETSEDIT_TOOL_CATEGORIES, SMALLPDF_DIRECTORIES, renderDirectoryItemHtml } from '../all-tools-modal.js';
import { getTwoToneIconSvg } from './landing-icons.js';

export class LandingCardsRenderer {
  static renderSingleCardHtml(tool) {
    return renderDirectoryItemHtml(tool);
  }

  static renderCards(landing) {
    const grid = landing.container.querySelector('#landing-cards-grid');
    if (!grid) return;

    const q = (landing.searchQuery || '').trim().toLowerCase();

    // 1. Search Query active: render filtered cards flat
    if (q) {
      const allTools = [];
      const seen = new Set();
      SMALLPDF_DIRECTORIES.forEach(col => {
        col.sections.forEach(sec => {
          sec.tools.forEach(t => {
            if (!seen.has(t.title.toLowerCase())) {
              seen.add(t.title.toLowerCase());
              allTools.push(t);
            }
          });
        });
      });

      const filtered = allTools.filter(tool =>
        tool.title.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        grid.className = 'landing-cards-grid';
        grid.innerHTML = `
          <div class="landing-empty-tools">
            <p>No tools found matching "<strong>${landing.searchQuery}</strong>".</p>
            <button class="btn btn-sm btn-outline" id="btn-reset-tool-filter">Show All Tools</button>
          </div>
        `;
        const resetBtn = grid.querySelector('#btn-reset-tool-filter');
        if (resetBtn) {
          resetBtn.onclick = () => {
            const searchInput = landing.container.querySelector('#landing-header-search-input');
            if (searchInput) searchInput.value = '';
            landing.activeFilter = 'all';
            const chips = landing.container.querySelectorAll('.landing-filter-chip');
            chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === 'all'));
            LandingCardsRenderer.renderCards(landing);
          };
        }
        return;
      }

      grid.className = 'landing-dir-wrapper';
      grid.innerHTML = `
        <div class="tools-dir-search-grid">
          ${filtered.map(tool => renderDirectoryItemHtml(tool)).join('')}
        </div>
      `;
      LandingCardsRenderer.attachLandingCardEvents(grid, landing);
      return;
    }

    // 2. Specific Category selected: render matching sections
    if (landing.activeFilter !== 'all') {
      const target = landing.activeFilter.toLowerCase();
      const matchedCols = [];

      SMALLPDF_DIRECTORIES.forEach(col => {
        const matchedSections = col.sections.filter(sec => {
          if (target === 'popular') return sec.title === 'Compress' || sec.title === 'Organize' || sec.title === 'Edit' || sec.title === 'Fill & Sign';
          if (target === 'merge') return sec.title === 'Organize';
          if (target === 'split') return sec.title === 'Organize';
          if (target === 'edit-sign') return sec.title === 'Edit' || sec.title === 'Fill & Sign';
          if (target === 'compress-scans') return sec.title === 'Compress' || sec.title === 'Scan';
          if (target === 'security') return sec.title === 'Protect';
          if (target === 'convert-from') return sec.title === 'Convert' || sec.title === 'PDF to Image' || sec.title === 'PDF to Office';
          if (target === 'convert-to') return sec.title === 'Image to PDF' || sec.title === 'Office to PDF' || sec.title === 'OpenOffice to PDF' || sec.title === 'Convert to PDF' || sec.title === 'iWork to PDF';
          return sec.title.toLowerCase().includes(target);
        });

        if (matchedSections.length > 0) {
          matchedCols.push({ col: col.col, sections: matchedSections });
        }
      });

      if (matchedCols.length > 0) {
        grid.className = 'landing-dir-wrapper';
        grid.innerHTML = `
          <div class="tools-dir-grid" style="grid-template-columns: repeat(${Math.min(matchedCols.length, 6)}, minmax(130px, 1fr));">
            ${matchedCols.map(col => `
              <div class="tools-dir-col">
                ${col.sections.map(sec => `
                  <div class="tools-dir-section">
                    <div class="tools-dir-sec-title">${sec.title}</div>
                    ${sec.tools.map(tool => renderDirectoryItemHtml(tool)).join('')}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        `;
        LandingCardsRenderer.attachLandingCardEvents(grid, landing);
        return;
      }
    }

    // 3. Default (All Tools): Render exact 8-column Smallpdf directory!
    grid.className = 'landing-dir-wrapper';
    grid.innerHTML = `
      <div class="tools-dir-grid">
        ${SMALLPDF_DIRECTORIES.map(col => `
          <div class="tools-dir-col">
            ${col.sections.map(sec => `
              <div class="tools-dir-section">
                <div class="tools-dir-sec-title">${sec.title}</div>
                ${sec.tools.map(tool => renderDirectoryItemHtml(tool)).join('')}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;

    LandingCardsRenderer.attachLandingCardEvents(grid, landing);
  }

  static attachLandingCardEvents(container, landing) {
    container.querySelectorAll('.tools-dir-item, .landing-tool-card').forEach(card => {
      card.onclick = () => {
        const action = card.getAttribute('data-action');
        const toolId = card.getAttribute('data-tool-id');
        landing.handleToolAction(action, toolId);
      };
    });
  }
}
