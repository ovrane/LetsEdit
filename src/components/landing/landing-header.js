/**
 * Landing Header Component
 * Contains top announcement banner, primary navigation bar, and secondary mega dropdowns.
 */

export function getLandingHeaderHtml() {
  return `
    <!-- Top Announcement Banner -->
    <div class="landing-top-banner">
      <div class="top-banner-content">
        <span class="banner-pill">100% PRIVATE</span>
        <span class="banner-text">Everything runs entirely inside your browser using WebAssembly. Your files never leave your device.</span>
        <a href="#landing-why-choose-section" class="banner-link">Learn How &rarr;</a>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <header class="landing-header">
      <div class="landing-nav-container">
        <!-- Brand / Logo -->
        <a href="/" class="landing-brand" aria-label="LetsEdit Home">
          <div class="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#EE404C"/>
              <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#00B4D8"/>
              <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#2F74EE"/>
              <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#F0A500"/>
            </svg>
          </div>
          <span class="brand-name">LetsEdit</span>
        </a>

        <!-- Desktop Navigation Items -->
        <nav class="landing-nav-menu">
          <!-- All Tools Dropdown Trigger -->
          <div class="nav-item-dropdown" id="nav-dropdown-all-tools">
            <button class="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true">
              <span>All Tools</span>
              <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="mega-dropdown-menu">
              <div class="mega-dropdown-grid">
                <!-- Column 1: Popular & Core -->
                <div class="mega-dropdown-col">
                  <h4 class="mega-dropdown-heading">POPULAR TOOLS</h4>
                  <a href="/edit_pdf" data-tool="edit" class="mega-dropdown-link">
                    <div class="mega-link-icon edit-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
                    <div class="mega-link-text"><strong>Edit PDF</strong><span>Modify text, shapes & signatures</span></div>
                  </a>
                  <a href="/compress-pdf" data-tool="compress" class="mega-dropdown-link">
                    <div class="mega-link-icon compress-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg></div>
                    <div class="mega-link-text"><strong>Compress PDF</strong><span>Reduce file size with MRC & JBIG2</span></div>
                  </a>
                  <a href="/merge-pdf" data-tool="merge" class="mega-dropdown-link">
                    <div class="mega-link-icon merge-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h12"/></svg></div>
                    <div class="mega-link-text"><strong>Merge PDF</strong><span>Combine multiple PDFs into one</span></div>
                  </a>
                  <a href="/split-pdf" data-tool="split" class="mega-dropdown-link">
                    <div class="mega-link-icon split-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/></svg></div>
                    <div class="mega-link-text"><strong>Split PDF</strong><span>Extract pages or split into files</span></div>
                  </a>
                </div>

                <!-- Column 2: Conversions -->
                <div class="mega-dropdown-col">
                  <h4 class="mega-dropdown-heading">CONVERT &amp; OCR</h4>
                  <a href="/pdf-to-word" data-tool="pdf-to-word" class="mega-dropdown-link">
                    <div class="mega-link-icon word-icon">W</div>
                    <div class="mega-link-text"><strong>PDF to Word</strong><span>Convert to editable DOCX</span></div>
                  </a>
                  <a href="/pdf-to-excel" data-tool="pdf-to-excel" class="mega-dropdown-link">
                    <div class="mega-link-icon excel-icon">X</div>
                    <div class="mega-link-text"><strong>PDF to Excel</strong><span>Extract tables to XLSX / CSV</span></div>
                  </a>
                  <a href="/pdf-to-powerpoint" data-tool="pdf-to-ppt" class="mega-dropdown-link">
                    <div class="mega-link-icon ppt-icon">P</div>
                    <div class="mega-link-text"><strong>PDF to PowerPoint</strong><span>Convert slides to PPTX</span></div>
                  </a>
                  <a href="/ocr-pdf" data-tool="ocr-pdf" class="mega-dropdown-link">
                    <div class="mega-link-icon ocr-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg></div>
                    <div class="mega-link-text"><strong>OCR Text Recognition</strong><span>Extract text from scans locally</span></div>
                  </a>
                </div>

                <!-- Column 3: Security & Enterprise -->
                <div class="mega-dropdown-col">
                  <h4 class="mega-dropdown-heading">SECURITY &amp; LEGAL</h4>
                  <a href="/redact-pdf" data-action="workflow:redact" class="mega-dropdown-link">
                    <div class="mega-link-icon redact-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg></div>
                    <div class="mega-link-text"><strong>Permanent Redaction</strong><span>Forensically erase sensitive data</span></div>
                  </a>
                  <a href="/bates-numbering-pdf" data-action="workflow:bates" class="mega-dropdown-link">
                    <div class="mega-link-icon bates-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                    <div class="mega-link-text"><strong>Bates Numbering</strong><span>Legal discovery indexing</span></div>
                  </a>
                  <a href="/flatten-pdf" data-action="workflow:flatten" class="mega-dropdown-link">
                    <div class="mega-link-icon flatten-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></div>
                    <div class="mega-link-text"><strong>Flatten PDF</strong><span>Lock forms, annotations &amp; layers</span></div>
                  </a>
                  <a href="/sign-pdf" data-tool="sign" class="mega-dropdown-link">
                    <div class="mega-link-icon sign-icon"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg></div>
                    <div class="mega-link-text"><strong>Sign PDF</strong><span>Legally binding e-signatures</span></div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Direct Quick Links -->
          <a href="/edit_pdf" data-tool="edit" class="nav-link">Edit</a>
          <a href="/compress-pdf" data-tool="compress" class="nav-link">Compress</a>
          <a href="/merge-pdf" data-tool="merge" class="nav-link">Merge</a>
          <a href="/sign-pdf" data-tool="sign" class="nav-link">Sign</a>
          <a href="/ocr-pdf" data-tool="ocr-pdf" class="nav-link">OCR</a>
          <a href="/docs" data-route="/docs" class="nav-link">Docs</a>
        </nav>

        <!-- Right Action Items (Search, Theme, Launch App) -->
        <div class="landing-nav-actions">
          <!-- Search Icon Button -->
          <button class="nav-action-btn search-trigger-btn" id="btn-header-search" aria-label="Search tools" title="Search all tools (Ctrl+K)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>

          <!-- Theme Toggle -->
          <button class="nav-action-btn" id="landing-theme-toggle" aria-label="Toggle dark/light mode" title="Toggle theme">
            <svg class="theme-icon-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg class="theme-icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="display:none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>

          <!-- Account Avatar / Login Button -->
          <button class="nav-action-btn" id="landing-user-profile-btn" aria-label="Account Settings" title="Account & Preferences">
            <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          <!-- Open Editor CTA Button -->
          <button class="btn landing-cta-primary" id="btn-landing-launch-editor">
            <span>Open Studio</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button class="landing-mobile-toggle" id="landing-mobile-menu-toggle" aria-label="Toggle navigation menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- Mobile Collapsible Navigation Menu -->
      <div class="landing-mobile-nav" id="landing-mobile-nav" style="display:none;">
        <div class="mobile-nav-inner">
          <a href="/edit_pdf" data-tool="edit" class="mobile-nav-link">PDF Editor</a>
          <a href="/compress-pdf" data-tool="compress" class="mobile-nav-link">Compress PDF</a>
          <a href="/merge-pdf" data-tool="merge" class="mobile-nav-link">Merge PDF</a>
          <a href="/split-pdf" data-tool="split" class="mobile-nav-link">Split PDF</a>
          <a href="/pdf-to-word" data-tool="pdf-to-word" class="mobile-nav-link">PDF to Word</a>
          <a href="/pdf-to-excel" data-tool="pdf-to-excel" class="mobile-nav-link">PDF to Excel</a>
          <a href="/pdf-to-powerpoint" data-tool="pdf-to-ppt" class="mobile-nav-link">PDF to PowerPoint</a>
          <a href="/ocr-pdf" data-tool="ocr-pdf" class="mobile-nav-link">OCR Text Recognition</a>
          <a href="/sign-pdf" data-tool="sign" class="mobile-nav-link">Sign PDF</a>
          <a href="/docs" data-route="/docs" class="mobile-nav-link">Documentation</a>
          <div class="mobile-nav-cta">
            <button class="btn btn-primary" id="btn-mobile-launch-studio">Launch PDF Studio</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Subnav / Category Strip (All Tools Quick Filters) -->
    <div class="landing-subnav-strip">
      <div class="subnav-container">
        <a href="/edit_pdf" data-action="workflow:edit" class="subnav-item active"><span class="subnav-dot blue"></span>Edit PDF</a>
        <a href="/compress-pdf" data-action="workflow:compress" class="subnav-item"><span class="subnav-dot red"></span>Compress</a>
        <a href="/merge-pdf" data-action="workflow:merge" class="subnav-item"><span class="subnav-dot purple"></span>Merge</a>
        <a href="/split-pdf" data-action="workflow:split" class="subnav-item"><span class="subnav-dot orange"></span>Split</a>
        <a href="/sign-pdf" data-action="workflow:sign" class="subnav-item"><span class="subnav-dot emerald"></span>Sign</a>
        <a href="/ocr-pdf" data-action="workflow:ocr-pdf" class="subnav-item"><span class="subnav-dot violet"></span>OCR Scans</a>
        <a href="/pdf-to-word" data-action="workflow:pdf-to-word" class="subnav-item"><span class="subnav-dot cyan"></span>PDF to Word</a>
        <a href="/pdf-to-excel" data-action="workflow:pdf-to-excel" class="subnav-item"><span class="subnav-dot green"></span>PDF to Excel</a>
        <a href="/pdf-to-powerpoint" data-action="workflow:pdf-to-pptx" class="subnav-item"><span class="subnav-dot amber"></span>PDF to PPTX</a>
        <a href="/html-to-pdf" data-action="workflow:html-to-pdf" class="subnav-item"><span class="subnav-dot teal"></span>HTML to PDF</a>
        <a href="/extract-images-pdf" data-action="workflow:extract-images-pdf" class="subnav-item"><span class="subnav-dot pink"></span>Extract Images</a>
        <a href="/redact-pdf" data-action="workflow:redact" class="subnav-item"><span class="subnav-dot slate"></span>Redact</a>
        <a href="/flatten-pdf" data-action="workflow:flatten" class="subnav-item"><span class="subnav-dot indigo"></span>Flatten</a>
        <a href="/bates-numbering-pdf" data-action="workflow:bates" class="subnav-item"><span class="subnav-dot yellow"></span>Bates Stamp</a>
      </div>
    </div>
  `;
}
