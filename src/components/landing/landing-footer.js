/**
 * Landing Footer & Search Overlay Component
 */

export function getLandingFooterHtml() {
  return `
    <!-- Redesigned Elite UX/UI Footer Matching Design Specification -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-grid-wrapper">
          <!-- Left Brand Column -->
          <div class="footer-brand-column">
            <a href="/" class="footer-brand-logo" aria-label="LetsEdit Homepage">
              <div class="footer-logo-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
                  <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
                  <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
                  <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
                </svg>
              </div>
              <span class="footer-brand-name">LetsEdit</span>
            </a>
            <p class="footer-brand-tagline">
              A privacy-first PDF web app with 100% client-side WebAssembly processing and zero cloud uploads.
            </p>

            <!-- Social Links (GitHub, LinkedIn, X, YouTube) -->
            <div class="footer-social-links">
              <a href="https://github.com" target="_blank" rel="noopener" class="footer-social-icon" title="GitHub">
                <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" class="footer-social-icon" title="LinkedIn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener" class="footer-social-icon" title="X (Twitter)">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener" class="footer-social-icon" title="YouTube">
                <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <!-- Column 1: Popular Tools -->
          <div class="footer-col">
            <h4 class="footer-col-title">Popular Tools</h4>
            <div class="footer-col-list">
              <a href="/edit_pdf" data-tool="edit" class="footer-link-item">
                <span>PDF Editor</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/compress-pdf" data-tool="compress" class="footer-link-item">
                <span>Compress PDF</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/merge-pdf" data-tool="merge" class="footer-link-item">
                <span>Merge PDF</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/split-pdf" data-tool="split" class="footer-link-item">
                <span>Split PDF</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/pdf-to-word" data-tool="pdf-to-word" class="footer-link-item">
                <span>PDF to Word</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/pdf-to-excel" data-tool="pdf-to-excel" class="footer-link-item">
                <span>PDF to Excel</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/pdf-to-jpg" data-tool="to-image" class="footer-link-item">
                <span>PDF to JPG/PNG</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/edit_pdf" data-action="workflow:edit" class="footer-link-item">
                <span>Add Text & Annotations</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </div>
          </div>

          <!-- Column 2: Organize & Legal -->
          <div class="footer-col">
            <h4 class="footer-col-title">Organize & Legal</h4>
            <div class="footer-col-list">
              <a href="/reorder-pdf-pages" data-tool="organize" class="footer-link-item">
                <span>Reorder Pages</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/delete-pdf-pages" data-action="workflow:organize" class="footer-link-item">
                <span>Delete PDF Pages</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/extract-pdf-pages" data-tool="extract-pages" class="footer-link-item">
                <span>Extract Pages</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/rotate-pdf-pages" data-tool="rotate" class="footer-link-item">
                <span>Rotate Pages</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/add-page-numbers-to-pdf" data-tool="pagenumbers" class="footer-link-item">
                <span>Add Page Numbers</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/add-watermark-to-pdf" data-tool="watermark" class="footer-link-item">
                <span>Add Watermark</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/protect-pdf" data-tool="protect" class="footer-link-item">
                <span>Protect PDF</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/unlock-pdf" data-tool="unlock" class="footer-link-item">
                <span>Unlock PDF</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </div>
          </div>

          <!-- Column 3: Convert & OCR -->
          <div class="footer-col">
            <h4 class="footer-col-title">Convert & OCR</h4>
            <div class="footer-col-list">
              <a href="/ocr-pdf" data-tool="ocr-pdf" class="footer-link-item">
                <span>PDF to Word (OCR)</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/pdf-to-excel" data-tool="pdf-to-excel" class="footer-link-item">
                <span>PDF to Excel</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/pdf-to-powerpoint" data-tool="pdf-to-ppt" class="footer-link-item">
                <span>PDF to PowerPoint</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/pdf-to-jpg" data-tool="to-image" class="footer-link-item">
                <span>PDF to JPG/PNG</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/jpg-to-pdf" data-tool="images-to-pdf" class="footer-link-item">
                <span>JPG/PNG to PDF</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/pdf-to-text" data-action="workflow:ocr-pdf" class="footer-link-item">
                <span>PDF to Text</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/scan-to-pdf" data-action="workflow:ocr-pdf" class="footer-link-item">
                <span>Scan to PDF (OCR)</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/html-to-pdf" data-tool="html-to-pdf" class="footer-link-item">
                <span>HTML to PDF</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </div>
          </div>

          <!-- Column 4: Solutions & Trust -->
          <div class="footer-col">
            <h4 class="footer-col-title">Solutions & Trust</h4>
            <div class="footer-col-list">
              <a href="#" data-legal="privacy" class="footer-link-item">
                <span>For Students</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="#" data-legal="security" class="footer-link-item">
                <span>For Professionals</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="#" data-legal="terms" class="footer-link-item">
                <span>For Business</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="#" data-legal="security" class="footer-link-item">
                <span>Security & Privacy</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="#" data-legal="security" class="footer-link-item">
                <span>Why Client-Side</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="#" data-action="app:install" class="footer-link-item">
                <span>Supported Platforms</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="/docs" data-route="/docs" class="footer-link-item">
                <span>Documentation</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <a href="#" data-legal="terms" class="footer-link-item">
                <span>Help & Support</span>
                <svg class="footer-link-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Copyright & Live Operational Status Bar -->
      <div class="footer-bottom-bar">
        <div class="footer-container">
          <div class="footer-bottom-flex">
            <div class="footer-copy-block">
              <p class="footer-copy-primary">
                © 2026 LetsEdit. Built with privacy in mind. All processing happens on your device.
              </p>
              <p class="footer-copy-secondary">
                A browser-native PDF suite powered by WebAssembly. No uploads. No data leaves your device.
              </p>
            </div>

            <div class="footer-meta-block">
              <div class="footer-status-indicator">
                <span>We Sure You Will Love Editing With Us!</span>
              </div>
              <span class="footer-divider-pipe">|</span>
              <button type="button" class="footer-legal-anchor" data-legal="privacy">Privacy Policy</button>
              <span class="footer-divider-pipe">|</span>
              <button type="button" class="footer-legal-anchor" data-legal="terms">Terms of Service</button>
              <span class="footer-divider-pipe">|</span>
              <button type="button" class="footer-legal-anchor" data-legal="security">Security Whitepaper</button>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Quick Search Tools Modal (Triggered by Header Search Icon / Ctrl+K) -->
    <div class="landing-search-overlay" id="landing-search-modal" style="display: none;" aria-hidden="true">
      <div class="landing-search-backdrop" id="landing-search-backdrop"></div>
      <div class="landing-search-dialog">
        <div class="landing-search-box">
          <svg class="landing-search-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="landing-header-search-input" class="landing-header-search-input" placeholder="Search 50+ tools (e.g., word, excel, pptx, ocr, redact, compare, sign)..." autocomplete="off" />
          <button class="landing-search-close-btn" id="btn-close-search-modal" title="Close search">&times;</button>
        </div>
        <div class="landing-search-results-list" id="landing-search-results">
          <!-- Live tool search results rendered here -->
        </div>
      </div>
    </div>
  `;
}
