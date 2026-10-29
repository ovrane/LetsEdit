/**
 * Landing Tools Section Component
 * Displays the filter tabs, search input, and dynamic tools grid container.
 */

export function getLandingToolsSectionHtml() {
  return `
    <!-- All PDF Tools Grid Section -->
    <section class="landing-tools-section" id="landing-all-tools-grid">
      <div class="landing-container">
        <!-- Section Header with Category Filter Buttons -->
        <div class="tools-section-header">
          <div class="section-title-wrap">
            <h2 class="section-title">All Document Tools</h2>
            <p class="section-subtitle">Comprehensive client-side PDF utility suite. Every tool executes completely offline in your browser.</p>
          </div>

          <!-- Category Filter Tabs -->
          <div class="tools-filter-tabs" role="tablist">
            <button class="filter-tab active" data-category="all" role="tab" aria-selected="true">
              <span>All</span>
              <span class="filter-count" id="count-all">50+</span>
            </button>
            <button class="filter-tab" data-category="popular" role="tab" aria-selected="false">
              <span>Popular</span>
            </button>
            <button class="filter-tab" data-category="organize" role="tab" aria-selected="false">
              <span>Organize</span>
            </button>
            <button class="filter-tab" data-category="convert" role="tab" aria-selected="false">
              <span>Convert</span>
            </button>
            <button class="filter-tab" data-category="edit" role="tab" aria-selected="false">
              <span>Edit &amp; Sign</span>
            </button>
            <button class="filter-tab" data-category="security" role="tab" aria-selected="false">
              <span>Security</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Tools Grid (Rendered by landing-cards.js) -->
        <div class="tools-grid-container" id="landing-tools-grid-container">
          <!-- Populated dynamically via JS -->
        </div>
      </div>
    </section>
  `;
}
