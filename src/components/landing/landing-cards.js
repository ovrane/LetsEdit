/**
 * Landing Cards & Filter Renderer
 * Manages category filtering, live text search, tool card HTML markup,
 * docs & specifications rendering, and card click dispatching.
 */

import { TOOLS_CATALOG, LETSEDIT_TOOL_CATEGORIES, SMALLPDF_DIRECTORIES, renderDirectoryItemHtml } from '../tools-catalog-data.js';
import { getTwoToneIconSvg } from './landing-icons.js';

export const DOCS_DIRECTORIES = [
  {
    col: 1,
    sections: [
      {
        title: 'User Guide & Tutorials',
        tools: [
          { id: 'docs-user-intro', title: 'Beginner Quickstart', action: 'navigate:/docs', iconColor: '#2563eb' },
          { id: 'docs-user-edit', title: 'Edit Existing Text', action: 'navigate:/docs#ch-edit-text', iconColor: '#059669' },
          { id: 'docs-user-sign', title: 'E-Sign & Multi-Signer', action: 'navigate:/docs#ch-signatures', iconColor: '#7c3aed' },
          { id: 'docs-user-redact', title: 'Permanent Redaction', action: 'navigate:/docs#ch-redaction', iconColor: '#dc2626' }
        ]
      }
    ]
  },
  {
    col: 2,
    sections: [
      {
        title: 'Document Processing',
        tools: [
          { id: 'docs-user-bates', title: 'Bates Numbering', action: 'navigate:/docs#ch-bates', iconColor: '#d97706' },
          { id: 'docs-user-organize', title: 'Page Organizer', action: 'navigate:/docs#ch-organize', iconColor: '#0284c7' },
          { id: 'docs-user-forms', title: 'AcroForms Designer', action: 'navigate:/docs#ch-forms', iconColor: '#0891b2' },
          { id: 'docs-user-security', title: 'Security & Permissions', action: 'navigate:/docs#ch-security', iconColor: '#4f46e5' }
        ]
      }
    ]
  },
  {
    col: 3,
    sections: [
      {
        title: 'Core Engine Architecture',
        tools: [
          { id: 'docs-proj-wasm', title: 'Zero-Cloud WASM Engine', action: 'navigate:/docs?tab=project#proj-wasm-core', iconColor: '#ea580c' },
          { id: 'docs-proj-clustering', title: 'Text Clustering Math', action: 'navigate:/docs?tab=project#proj-clustering-math', iconColor: '#16a34a' },
          { id: 'docs-proj-canvas', title: '4-Layer Canvas Stack', action: 'navigate:/docs?tab=project#proj-canvas-compositing', iconColor: '#2563eb' },
          { id: 'docs-proj-audit', title: 'SHA-256 Audit Trail', action: 'navigate:/docs?tab=project#proj-audit-crypto', iconColor: '#9333ea' }
        ]
      }
    ]
  },
  {
    col: 4,
    sections: [
      {
        title: 'APIs & Maintenance',
        tools: [
          { id: 'docs-proj-api', title: 'REST API Reference', action: 'navigate:/docs?tab=project#proj-api-endpoints', iconColor: '#0d9488' },
          { id: 'docs-proj-standards', title: '<1,000 Lines Standard', action: 'navigate:/docs?tab=project#proj-code-standards', iconColor: '#e11d48' },
          { id: 'docs-proj-workers', title: 'Web Worker Pool', action: 'navigate:/docs?tab=project#proj-worker-pool', iconColor: '#4338ca' },
          { id: 'docs-proj-faq', title: 'Engineering FAQ', action: 'navigate:/docs?tab=project#proj-dev-faq', iconColor: '#65a30d' }
        ]
      }
    ]
  }
];

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

      // Include docs if query relates to docs or architecture
      if (q.includes('doc') || q.includes('guide') || q.includes('api') || q.includes('spec') || q.includes('wasm') || q.includes('code') || q.includes('canvas')) {
        DOCS_DIRECTORIES.forEach(col => {
          col.sections.forEach(sec => {
            sec.tools.forEach(t => {
              if (!seen.has(t.title.toLowerCase())) {
                seen.add(t.title.toLowerCase());
                allTools.push(t);
              }
            });
          });
        });
      }

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

      // Check if user clicked the Docs chip
      if (target === 'docs') {
        grid.className = 'landing-dir-wrapper';
        grid.innerHTML = `
          <div class="tools-dir-grid" style="grid-template-columns: repeat(4, minmax(180px, 1fr));">
            ${DOCS_DIRECTORIES.map(col => `
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
