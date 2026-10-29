/**
 * Most Popular PDF Tools Section
 * Matches Smallpdf / Adobe style 3x2 responsive tool cards grid
 * Displays the 6 highest-frequency PDF actions with vibrant flat badges
 */

export function getPopularToolsHtml() {
  return `
    <div class="landing-hero-popular-container" id="landing-popular-tools-section">
      <div class="hero-popular-header">
        <h2 class="hero-popular-title">Most Popular PDF Tools</h2>
        <p class="hero-popular-subtitle">30 tools to convert, compress, and edit PDFs for free. Try it out today!</p>
      </div>

      <div class="hero-popular-grid">
        <!-- 1. PDF to Word -->
        <div class="hero-popular-card" data-tool="workflow:pdf-to-word" tabindex="0" role="button" title="Convert PDF to Word DOCX">
          <div class="popular-card-icon icon-blue">
            <span class="icon-letter">W</span>
          </div>
          <div class="popular-card-content">
            <h3 class="popular-card-title">PDF to Word</h3>
            <p class="popular-card-desc">Convert PDFs to editable Word documents</p>
          </div>
          <div class="popular-card-arrow" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- 2. Merge PDF -->
        <div class="hero-popular-card" data-tool="workflow:merge" tabindex="0" role="button" title="Merge multiple PDFs into one document">
          <div class="popular-card-icon icon-purple">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M4 16V4a2 2 0 0 1 2-2h12"></path></svg>
          </div>
          <div class="popular-card-content">
            <h3 class="popular-card-title">Merge PDF</h3>
            <p class="popular-card-desc">Combine multiple PDFs into one unified document</p>
          </div>
          <div class="popular-card-arrow" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- 3. JPG to PDF -->
        <div class="hero-popular-card" data-tool="workflow:jpg-to-pdf" tabindex="0" role="button" title="Convert Images to PDF">
          <div class="popular-card-icon icon-amber">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div class="popular-card-content">
            <h3 class="popular-card-title">JPG to PDF</h3>
            <p class="popular-card-desc">Transform JPG, PNG, BMP, GIF, and TIFF images to PDF</p>
          </div>
          <div class="popular-card-arrow" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- 4. Sign PDF -->
        <div class="hero-popular-card" data-tool="workflow:sign" tabindex="0" role="button" title="Sign PDF electronically">
          <div class="popular-card-icon icon-magenta">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><circle cx="11" cy="11" r="2"></circle></svg>
          </div>
          <div class="popular-card-content">
            <h3 class="popular-card-title">Sign PDF</h3>
            <p class="popular-card-desc">Create an electronic signature and sign your documents.</p>
          </div>
          <div class="popular-card-arrow" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- 5. Edit PDF -->
        <div class="hero-popular-card" data-tool="studio:edit" tabindex="0" role="button" title="Open PDF Studio Editor">
          <div class="popular-card-icon icon-teal">
            <span class="icon-letter">T</span>
          </div>
          <div class="popular-card-content">
            <h3 class="popular-card-title">Edit PDF</h3>
            <p class="popular-card-desc">Add text, shapes, images and freehand annotations to your PDF</p>
          </div>
          <div class="popular-card-arrow" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- 6. Compress PDF -->
        <div class="hero-popular-card" data-tool="workflow:compress" tabindex="0" role="button" title="Compress PDF file size">
          <div class="popular-card-icon icon-red">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" stroke-dasharray="3 3"></rect><path d="M9 9h6v6H9z"></path></svg>
          </div>
          <div class="popular-card-content">
            <h3 class="popular-card-title">Compress PDF</h3>
            <p class="popular-card-desc">Reduce the size of your PDF without losing quality</p>
          </div>
          <div class="popular-card-arrow" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
    </div>
  `;
}
