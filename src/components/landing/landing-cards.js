/**
 * Landing Cards & Filter Renderer
 * Manages category filtering, live text search, tool card HTML markup,
 * and card click dispatching.
 */

import { TOOLS_CATALOG, SEJDA_TOOL_CATEGORIES } from '../all-tools-modal.js';
import { getTwoToneIconSvg } from './landing-icons.js';

export class LandingCardsRenderer {
  static renderSingleCardHtml(tool) {
    return `
      <div class="landing-tool-card" data-action="${tool.action}" data-tool-id="${tool.id}" style="--tool-accent: ${tool.color};">
        <div class="card-icon-badge" style="background: ${tool.color}15; color: ${tool.color};">
          ${getTwoToneIconSvg(tool.id, tool.color)}
        </div>
        <h3 class="card-title">${tool.title}</h3>
        <p class="card-desc">${tool.desc}</p>
      </div>
    `;
  }

  static renderCards(landing) {
    const grid = landing.container.querySelector('#landing-cards-grid');
    if (!grid) return;

    const q = (landing.searchQuery || '').trim().toLowerCase();

    // 1. Search Query active: render filtered cards flat
    if (q) {
      const filtered = TOOLS_CATALOG.filter(tool =>
        tool.title.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
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
            landing.searchQuery = '';
            const searchInput = landing.container.querySelector('#landing-tool-search');
            if (searchInput) searchInput.value = '';
            const clearBtn = landing.container.querySelector('#landing-search-clear');
            if (clearBtn) clearBtn.style.display = 'none';
            landing.activeFilter = 'all';
            const chips = landing.container.querySelectorAll('.landing-filter-chip');
            chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === 'all'));
            LandingCardsRenderer.renderCards(landing);
          };
        }
        return;
      }

      grid.className = 'landing-cards-grid';
      grid.innerHTML = filtered.map(tool => LandingCardsRenderer.renderSingleCardHtml(tool)).join('');
      LandingCardsRenderer.attachLandingCardEvents(grid, landing);
      return;
    }

    // 2. Specific Category selected: render cards for that category
    if (landing.activeFilter !== 'all') {
      const cat = SEJDA_TOOL_CATEGORIES.find(c => c.id === landing.activeFilter);
      const tools = cat ? cat.tools : [];

      grid.className = 'landing-cards-grid';
      grid.innerHTML = tools.map(tool => LandingCardsRenderer.renderSingleCardHtml(tool)).join('');
      LandingCardsRenderer.attachLandingCardEvents(grid, landing);
      return;
    }

    // 3. Default (All Tools): Render all 9 Sejda categories in structured groups
    grid.className = 'landing-categories-wrapper';
    grid.innerHTML = SEJDA_TOOL_CATEGORIES.map(cat => `
      <div class="landing-category-group" data-category="${cat.id}">
        <div class="landing-category-header">
          <div class="landing-category-title-wrap">
            <h3 class="landing-category-title">${cat.name}</h3>
            <span class="landing-category-desc">${cat.desc}</span>
          </div>
        </div>
        <div class="landing-cards-grid">
          ${cat.tools.map(tool => LandingCardsRenderer.renderSingleCardHtml(tool)).join('')}
        </div>
      </div>
    `).join('');

    LandingCardsRenderer.attachLandingCardEvents(grid, landing);
  }

  static attachLandingCardEvents(container, landing) {
    container.querySelectorAll('.landing-tool-card').forEach(card => {
      card.onclick = () => {
        const action = card.getAttribute('data-action');
        const toolId = card.getAttribute('data-tool-id');
        landing.handleToolAction(action, toolId);
      };
    });
  }
}
