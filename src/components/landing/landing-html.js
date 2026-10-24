/**
 * Landing Page HTML Template
 * Produces clean semantic HTML structure for header, hero, features, FAQ, and footer.
 */

export function getLandingTemplateHtml() {
  return `
    <!-- Landing Header / Top Navigation -->
    <header class="landing-header">
      <div class="landing-nav-inner">
        <div class="lets-logo" id="landing-brand-logo" title="LetsEdit — Home">
          <div class="lets-logo-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
            </svg>
          </div>
          <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
        </div>

        <!-- Desktop Quick Links (AMD / Linear Pill Style) -->
        <nav class="landing-desktop-nav">
          <button class="landing-nav-link" data-tool="merge">Merge PDF</button>
          <button class="landing-nav-link" data-tool="split">Split PDF</button>
          <button class="landing-nav-link" data-tool="compress">Compress PDF</button>

          <!-- Convert Dropdown -->
          <div class="landing-dropdown">
            <button class="landing-nav-link dropdown-toggle" id="btn-convert-dropdown">
              <span>Convert PDF</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
            </button>
            <div class="landing-dropdown-menu">
              <button class="landing-dropdown-item" data-action="workflow:pdf-to-word">
                <span class="dropdown-item-title">PDF to Word</span>
                <span class="dropdown-item-desc">Convert PDF to editable DOCX</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:pdf-to-excel">
                <span class="dropdown-item-title">PDF to Excel</span>
                <span class="dropdown-item-desc">Extract tables to CSV / XLS</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:pdf-to-ppt">
                <span class="dropdown-item-title">PowerPoint to PDF</span>
                <span class="dropdown-item-desc">Convert pages to PPT slides</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:to-image">
                <span class="dropdown-item-title">PDF to JPG / PNG</span>
                <span class="dropdown-item-desc">Extract pages as images</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:word-to-pdf">
                <span class="dropdown-item-title">Word to PDF</span>
                <span class="dropdown-item-desc">Convert DOCX to PDF</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:images-to-pdf">
                <span class="dropdown-item-title">Images to PDF</span>
                <span class="dropdown-item-desc">Convert JPG/PNG to PDF</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:pdf-to-text">
                <span class="dropdown-item-title">PDF to Text</span>
                <span class="dropdown-item-desc">Extract plain text</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:extract-images">
                <span class="dropdown-item-title">Extract Images</span>
                <span class="dropdown-item-desc">Extract embedded JPEG/PNGs</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:pdfa">
                <span class="dropdown-item-title">PDF to PDF/A</span>
                <span class="dropdown-item-desc">ISO 19005-1 compliance</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:html-to-pdf">
                <span class="dropdown-item-title">HTML to PDF</span>
                <span class="dropdown-item-desc">Convert HTML or code to PDF</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:excel-to-pdf">
                <span class="dropdown-item-title">Excel to PDF</span>
                <span class="dropdown-item-desc">Convert XLS/CSV to PDF</span>
              </button>
              <button class="landing-dropdown-item" data-action="workflow:ppt-to-pdf">
                <span class="dropdown-item-title">PowerPoint to PDF</span>
                <span class="dropdown-item-desc">Convert PPTX to PDF slides</span>
              </button>
            </div>
          </div>

          <!-- Sejda-Style Mega Menu Trigger -->
          <div class="landing-dropdown mega-dropdown">
            <button class="landing-nav-link dropdown-toggle" id="btn-landing-mega-menu">
              <span>All PDF tools</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
            </button>
            <div class="landing-mega-menu-content" id="landing-mega-menu">
              <div class="mega-menu-grid">
                <div class="mega-column">
                  <div class="mega-col-title">ORGANIZE & PAGES</div>
                  <button class="mega-item" data-action="workflow:split">Let's Split Pages</button>
                  <button class="mega-item" data-action="workflow:merge">Let's Merge PDF</button>
                  <button class="mega-item" data-action="workflow:organize">Let's Organize Pages</button>
                  <button class="mega-item" data-action="workflow:organize">Let's Delete Pages</button>
                  <button class="mega-item" data-action="workflow:extract-pages">Let's Extract Pages</button>
                  <button class="mega-item" data-action="workflow:deskew">Let's Deskew Scans</button>
                  <button class="mega-item" data-action="workflow:split-half">Let's Split in Half</button>
                  <button class="mega-item" data-action="workflow:alternate-mix">Let's Alternate & Mix</button>
                  <button class="mega-item" data-action="workflow:nup">Let's N-Up Imposition</button>
                  <button class="mega-item" data-action="workflow:flip">Let's Flip Pages</button>
                  <button class="mega-item" data-action="workflow:crop">Let's Crop Margins</button>
                  <button class="mega-item" data-action="workflow:resize">Let's Resize Margins</button>
                </div>

                <div class="mega-column">
                  <div class="mega-col-title">EDIT & SIGN</div>
                  <button class="mega-item" data-action="tool:select">Let's Edit PDF</button>
                  <button class="mega-item" data-action="tool:text">Let's Add & Edit Text</button>
                  <button class="mega-item" data-action="workflow:sign">Let's Fill & Sign</button>
                  <button class="mega-item" data-action="tool:form">Let's Create Form Fields</button>
                  <button class="mega-item" data-action="tool:image">Let's Add Stamps</button>
                  <button class="mega-item" data-action="tool:whiteout">Let's Redact & Whiteout</button>
                  <button class="mega-item" data-action="tool:draw">Let's Freehand Draw</button>
                  <button class="mega-item" data-action="tool:highlight">Let's Highlight</button>
                  <button class="mega-item" data-action="tool:eraser">Let's Erase Strokes</button>
                  <button class="mega-item" data-action="tool:replace">Let's Find & Replace</button>
                </div>

                <div class="mega-column">
                  <div class="mega-col-title">OPTIMIZE & SECURITY</div>
                  <button class="mega-item" data-action="workflow:compress">Let's Compress PDF</button>
                  <button class="mega-item" data-action="workflow:scan">Let's Scan to PDF</button>
                  <button class="mega-item" data-action="workflow:ocr-pdf">Let's OCR PDF</button>
                  <button class="mega-item" data-action="workflow:compare">Let's Compare PDF</button>
                  <button class="mega-item" data-action="workflow:repair">Let's Repair PDF</button>
                  <button class="mega-item" data-action="workflow:security">Let's Protect & Encrypt</button>
                  <button class="mega-item" data-action="workflow:unlock">Let's Unlock PDF</button>
                  <button class="mega-item" data-action="workflow:redact">Let's Redact PDF</button>
                  <button class="mega-item" data-action="workflow:watermark">Let's Watermark PDF</button>
                  <button class="mega-item" data-action="workflow:grayscale">Let's Grayscale PDF</button>
                  <button class="mega-item" data-action="workflow:pagenumbers">Let's Number Pages</button>
                  <button class="mega-item" data-action="workflow:pagelabels">Let's Page Labels</button>
                  <button class="mega-item" data-action="workflow:bates">Let's Bates Number</button>
                  <button class="mega-item" data-action="workflow:edit-metadata">Let's Edit Metadata & XMP</button>
                  <button class="mega-item" data-action="workflow:flatten">Let's Flatten Forms</button>
                  <button class="mega-item" data-action="workflow:remove-annotations">Let's Clean Annotations</button>
                </div>

                <div class="mega-column">
                  <div class="mega-col-title">CONVERT</div>
                  <button class="mega-item" data-action="workflow:pdf-to-word">Let's PDF to Word</button>
                  <button class="mega-item" data-action="workflow:pdf-to-excel">Let's PDF to Excel</button>
                  <button class="mega-item" data-action="workflow:pdf-to-ppt">Let's PDF to PowerPoint</button>
                  <button class="mega-item" data-action="workflow:to-image">Let's Convert to JPG</button>
                  <button class="mega-item" data-action="workflow:extract-images">Let's Extract Images</button>
                  <button class="mega-item" data-action="workflow:pdfa">Let's PDF to PDF/A</button>
                  <button class="mega-item" data-action="workflow:images-to-pdf">Let's Images to PDF</button>
                  <button class="mega-item" data-action="workflow:pdf-to-text">Let's Extract Text</button>
                  <button class="mega-item" data-action="workflow:html-to-pdf">Let's HTML to PDF</button>
                  <button class="mega-item" data-action="workflow:word-to-pdf">Let's Word to PDF</button>
                  <button class="mega-item" data-action="workflow:excel-to-pdf">Let's Excel to PDF</button>
                  <button class="mega-item" data-action="workflow:ppt-to-pdf">Let's PowerPoint to PDF</button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <!-- Right Header CTAs -->
        <div class="landing-header-right">
          <div class="user-account-wrapper" id="landing-account-wrapper" style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-outline btn-sm user-account-btn" id="btn-landing-auth">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span class="user-name-label">Log in</span>
            </button>
            <button class="btn btn-primary btn-sm" id="btn-landing-signup" style="padding: 6px 14px; font-weight: 600; font-size: 13px;">Sign up</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Landing Content (Scrollable) -->
    <main class="landing-main-content">
      <!-- Hero Section (Elevated, High-Converting Hero) -->
      <section class="landing-hero-section">
        <div class="landing-hero-container">

          <h1 class="landing-hero-title">
            The Modern PDF Suite Built for <span class="hero-title-accent">Speed & Privacy</span>.
          </h1>
          <p class="landing-hero-subtitle">
            Edit existing text, merge, sign, compress, and convert documents directly in your browser. Powered by client-side WebAssembly — 100% free, unlimited, and your confidential files never leave your device.
          </p>

          <!-- Hero Fast Search & Popular Tools Launch Hub -->
          <div class="hero-actions-hub">
            <div class="hero-search-bar-wrap">
              <div class="hero-search-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input type="text" id="hero-quick-search-input" class="hero-search-input" placeholder="Search 43+ PDF tools (e.g. Edit, Merge, Compress, Split, Sign, OCR)..." autocomplete="off" />
              <button id="hero-search-clear-btn" class="hero-search-clear" style="display:none;" title="Clear search">&times;</button>
            </div>

            <div class="hero-popular-pills">
              <span class="hero-popular-label">Popular:</span>
              <button class="hero-popular-pill" data-action="workflow:edit">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Edit PDF</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:merge">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg>
                <span>Merge PDF</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:compress">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path></svg>
                <span>Compress</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:split">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22V2"></path></svg>
                <span>Split PDF</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:sign">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Fill & Sign</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:to-image">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>PDF to JPG</span>
              </button>
            </div>
          </div>

          <!-- Hero Value & Trust Bar -->
          <div class="hero-trust-bar">
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span><strong>100% Private</strong> &bull; Zero Server Uploads</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#30050d" stroke-width="2.2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              <span><strong>Sub-Second Speed</strong> &bull; Client-Side WASM</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#8b5cf6" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              <span><strong>43+ Pro Tools</strong> &bull; Edit, OCR, Compare & Sign</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
              <span><strong>Free</strong> &bull; No Signups or Caps</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Tool Filter Rail & Search Bar -->
      <section class="landing-tools-section">
        <div class="landing-tools-container">
          <div class="landing-tools-header">
            <div class="landing-search-wrapper">
              <svg class="landing-search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="landing-tool-search" class="landing-search-input" placeholder="Quick find any tool (merge, split, OCR, sign, compress, compare, watermark)..." autocomplete="off" />
              <button id="landing-search-clear" class="landing-search-clear" style="display:none;" title="Clear search">&times;</button>
            </div>
          </div>

          <div class="landing-filter-rail" id="landing-filter-rail">
            <button class="landing-filter-chip active" data-filter="all">All Tools</button>
            <button class="landing-filter-chip" data-filter="popular">⭐ Most Popular</button>
            <button class="landing-filter-chip" data-filter="merge">🔗 Merge</button>
            <button class="landing-filter-chip" data-filter="split">✂ Split</button>
            <button class="landing-filter-chip" data-filter="edit-sign">✏ Edit & Sign</button>
            <button class="landing-filter-chip" data-filter="compress-scans">🗜 Compress & Scans</button>
            <button class="landing-filter-chip" data-filter="security">🔒 Security</button>
            <button class="landing-filter-chip" data-filter="convert-from">📤 Convert from PDF</button>
            <button class="landing-filter-chip" data-filter="convert-to">📥 Convert to PDF</button>
            <button class="landing-filter-chip" data-filter="others">⚡ Others</button>
          </div>

          <!-- Responsive Cards Grid -->
          <div class="landing-cards-grid" id="landing-cards-grid"></div>
        </div>
      </section>

      <!-- Feature Trust Badges Section -->
      <section class="landing-features-section">
        <div class="features-inner">
          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(48,5,13,0.08); color: #30050d;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3>100% Private & Confidential</h3>
            <p>Your documents never leave your browser. Processing runs in client-side WebAssembly with zero telemetry.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            </div>
            <h3>Sub-Second Speed</h3>
            <p>Instant loading with PDF.js and PDF-Lib vector compilation. No slow upload delays or server queues.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(139,92,246,0.1); color: #8b5cf6;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            </div>
            <h3>No Paywalls or Hourly Limits</h3>
            <p>Unlimited document sizes, unlimited pages, and unlimited daily tasks. Completely free for everyone.</p>
          </div>
        </div>
      </section>

      <!-- SEO FAQ Accordion Section -->
      <section class="landing-faq-section">
        <div class="faq-container">
          <h2 class="faq-title">Frequently Asked Questions</h2>
          <p class="faq-subtitle">Everything you need to know about our browser-native PDF suite</p>

          <div class="faq-accordion">
            <details class="faq-item" open>
              <summary class="faq-question">
                <span>Is LetsEdit really free to use?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes, LetsEdit is 100% free with no hidden subscriptions, credit card requirements, or artificial 2-hour limits. You can edit, merge, compress, split, and sign as many PDFs as you need.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Are my files and sensitive data safe?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Absolutely. Unlike traditional PDF web apps that upload your confidential files to remote servers, LetsEdit executes 100% locally on your machine using modern web standards. Your files never touch any external server.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Can I edit existing text in a PDF document?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes! LetsEdit features inline text editing. Click any existing text block to edit text content, font family, size, or color, and the editor automatically re-embeds the updated vector typography on export.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>How does client-side compression work?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Our compression engine reorganizes PDF indirect objects into compressed cross-reference streams (PDF 1.5+ Object Streams) and removes unneeded metadata, reducing file size by up to 60% without downgrading visual sharpness.
              </div>
            </details>
          </div>
        </div>
      </section>

      <!-- Landing Footer -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-brand">
            <div class="lets-logo" style="margin-bottom: 12px;">
              <div class="lets-logo-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
                </svg>
              </div>
              <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
            </div>
            <p>The privacy-first, client-side PDF suite for editing, signing, and converting documents with ease.</p>
          </div>
          <div class="footer-links">
            <div>
              <h4>Popular Tools</h4>
              <a href="#" data-tool="edit">Let's Edit PDF</a>
              <a href="#" data-tool="compress">Let's Compress</a>
              <a href="#" data-tool="merge">Let's Merge PDF</a>
              <a href="#" data-tool="split">Let's Split PDF</a>
            </div>
            <div>
              <h4>Security & Legal</h4>
              <a href="#" data-tool="sign">Let's Sign PDF</a>
              <a href="#" data-tool="security">Let's Protect PDF</a>
              <a href="#" data-tool="bates">Let's Bates Number</a>
              <a href="#" data-tool="whiteout">Let's Redact PDF</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 LetsEdit. Built with client-side WebAssembly & pure vector mathematics.</span>
        </div>
      </footer>
    </main>
  `;
}
