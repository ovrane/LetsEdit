/**
 * Landing Page HTML Template
 * Produces clean semantic HTML structure for executive header, Smallpdf-style mega menu,
 * hero (no dropzone), What's New showcase, filter rail, feature trust metrics, FAQ,
 * and comprehensive Smallpdf-style footer.
 * Strict Constraint: No file dropzone on the landing page hero.
 */

export function getLandingTemplateHtml() {
  return `
    <!-- Landing Header / Top Navigation (Pryzm Minimalist Executive Style) -->
    <header class="landing-header">
      <div class="landing-nav-inner">
        <!-- Left Cluster: Brand & Nav Links immediately grouped together (Pryzm Style) -->
        <div class="landing-nav-left-cluster">
          <div class="lets-logo" id="landing-brand-logo" title="LetsEdit — Home" style="cursor: pointer;">
            <div class="lets-logo-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
                <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
                <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
                <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
              </svg>
            </div>
            <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
          </div>

          <!-- Desktop Quick Links (Pryzm Style) -->
          <nav class="landing-desktop-nav">
            <!-- Tools Mega Menu Trigger Button -->
            <div class="landing-dropdown mega-dropdown">
              <button class="landing-nav-link dropdown-toggle" id="btn-landing-mega-menu" title="Browse all 50+ PDF tools">
                <span>Tools</span>
                <svg class="chevron-icon" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </button>

            <!-- Smallpdf Comprehensive Tools Grid Mega Menu -->
            <div class="landing-mega-menu-content" id="landing-mega-menu">
              <div class="smallpdf-mega-grid">
                <!-- Col 1: Compress & Convert -->
                <div class="smallpdf-mega-col">
                  <div class="smallpdf-sec-title">Compress</div>
                  <button class="smallpdf-tool-link" data-action="workflow:compress">
                    <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"/></svg></span>
                    <span>Compress PDF</span>
                  </button>

                  <div class="smallpdf-sec-title" style="margin-top:14px;">Convert</div>
                  <button class="smallpdf-tool-link" data-action="workflow:pdf-to-word">
                    <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></span>
                    <span>PDF Converter</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:ocr-pdf">
                    <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg></span>
                    <span>PDF OCR</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:pdfa">
                    <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                    <span>PDF to PDF/A</span>
                  </button>

                  <div class="smallpdf-sec-title" style="margin-top:14px;">PDF to Image</div>
                  <button class="smallpdf-tool-link" data-action="workflow:to-image">
                    <span class="smallpdf-icon-box" style="background:#fef3c7; color:#d97706;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
                    <span>PDF to JPG</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:to-image">
                    <span class="smallpdf-icon-box" style="background:#fef3c7; color:#d97706;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></span>
                    <span>PDF to PNG</span>
                  </button>
                </div>

                <!-- Col 2: Image to PDF & Office to PDF -->
                <div class="smallpdf-mega-col">
                  <div class="smallpdf-sec-title">Image to PDF</div>
                  <button class="smallpdf-tool-link" data-action="workflow:images-to-pdf">
                    <span class="smallpdf-icon-box" style="background:#fef3c7; color:#d97706;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg></span>
                    <span>JPG to PDF</span>
                  </button>

                  <div class="smallpdf-sec-title" style="margin-top:14px;">PDF to Office</div>
                  <button class="smallpdf-tool-link" data-action="workflow:pdf-to-word">
                    <span class="smallpdf-icon-box smallpdf-tag-word">W</span>
                    <span>PDF to Word</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:pdf-to-excel">
                    <span class="smallpdf-icon-box smallpdf-tag-excel">X</span>
                    <span>PDF to Excel</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:pdf-to-ppt">
                    <span class="smallpdf-icon-box smallpdf-tag-ppt">P</span>
                    <span>PDF to PPT</span>
                  </button>

                  <div class="smallpdf-sec-title" style="margin-top:14px;">Office to PDF</div>
                  <button class="smallpdf-tool-link" data-action="workflow:word-to-pdf">
                    <span class="smallpdf-icon-box smallpdf-tag-word">W</span>
                    <span>Word to PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:excel-to-pdf">
                    <span class="smallpdf-icon-box smallpdf-tag-excel">X</span>
                    <span>Excel to PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:ppt-to-pdf">
                    <span class="smallpdf-icon-box smallpdf-tag-ppt">P</span>
                    <span>PPT to PDF</span>
                  </button>
                </div>

                <!-- Col 3: Convert to PDF (HTML, TXT, CSV, etc.) -->
                <div class="smallpdf-mega-col">
                  <div class="smallpdf-sec-title">Convert to PDF</div>
                  <button class="smallpdf-tool-link" data-action="workflow:html-to-pdf">
                    <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
                    <span>HTML to PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:pdf-to-text">
                    <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></span>
                    <span>TXT to PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:excel-to-pdf">
                    <span class="smallpdf-icon-box" style="background:#dcfce7; color:#16a34a;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
                    <span>CSV to PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:extract-images">
                    <span class="smallpdf-icon-box" style="background:#fce7f3; color:#db2777;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg></span>
                    <span>Extract Images</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:repair">
                    <span class="smallpdf-icon-box" style="background:#fee2e2; color:#dc2626;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
                    <span>Repair PDF</span>
                  </button>
                </div>

                <!-- Col 4: Organize Pages -->
                <div class="smallpdf-mega-col">
                  <div class="smallpdf-sec-title">Organize</div>
                  <button class="smallpdf-tool-link" data-action="workflow:merge">
                    <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg></span>
                    <span>Merge PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:split">
                    <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22V2"/></svg></span>
                    <span>Split PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:rotate">
                    <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg></span>
                    <span>Rotate PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="sidebar:delete">
                    <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></span>
                    <span>Delete PDF Pages</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:extract-pages">
                    <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg></span>
                    <span>Extract PDF Pages</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:organize">
                    <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
                    <span>Organize PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:nup">
                    <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg></span>
                    <span>N-Up Imposition</span>
                  </button>
                </div>

                <!-- Col 5: Edit & Annotate -->
                <div class="smallpdf-mega-col">
                  <div class="smallpdf-sec-title">Edit</div>
                  <button class="smallpdf-tool-link" data-action="tool:select">
                    <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
                    <span>Edit PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="tool:text">
                    <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></span>
                    <span>PDF Annotator</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:pagenumbers">
                    <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg></span>
                    <span>Number Pages</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:crop">
                    <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/></svg></span>
                    <span>Crop PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:redact">
                    <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
                    <span>Redact PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:watermark">
                    <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg></span>
                    <span>Watermark PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="tool:form">
                    <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
                    <span>PDF Form Filler</span>
                  </button>
                </div>

                <!-- Col 6: Fill & Sign & Protect -->
                <div class="smallpdf-mega-col">
                  <div class="smallpdf-sec-title">Fill & Sign</div>
                  <button class="smallpdf-tool-link" data-action="workflow:sign">
                    <span class="smallpdf-icon-box" style="background:#f3e8ff; color:#9333ea;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg></span>
                    <span>Sign PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:sign-request">
                    <span class="smallpdf-icon-box" style="background:#fef08a; color:#854d0e;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></span>
                    <span>Request Signatures</span>
                  </button>

                  <div class="smallpdf-sec-title" style="margin-top:14px;">Protect</div>
                  <button class="smallpdf-tool-link" data-action="workflow:unlock">
                    <span class="smallpdf-icon-box" style="background:#fce7f3; color:#ec4899;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg></span>
                    <span>Unlock PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:security">
                    <span class="smallpdf-icon-box" style="background:#fce7f3; color:#ec4899;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                    <span>Protect PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:flatten">
                    <span class="smallpdf-icon-box" style="background:#fce7f3; color:#ec4899;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg></span>
                    <span>Flatten PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:sanitize">
                    <span class="smallpdf-icon-box" style="background:#dcfce7; color:#16a34a;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                    <span>Sanitize PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:bates">
                    <span class="smallpdf-icon-box" style="background:#f1f5f9; color:#475569;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                    <span>Bates Numbering</span>
                  </button>
                </div>

                <!-- Col 7: Scan & Smart Tools -->
                <div class="smallpdf-mega-col">
                  <div class="smallpdf-sec-title">Scan</div>
                  <button class="smallpdf-tool-link" data-action="workflow:scan">
                    <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
                    <span>PDF Scanner</span>
                  </button>

                  <div class="smallpdf-sec-title" style="margin-top:14px;">Smart Tools</div>
                  <button class="smallpdf-tool-link" data-action="workflow:compare">
                    <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7M6 9v12"/></svg></span>
                    <span>Compare PDF</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:bookmarks">
                    <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span>
                    <span>Bookmarks</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:pagelabels">
                    <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg></span>
                    <span>Page Labels</span>
                  </button>
                  <button class="smallpdf-tool-link" data-action="workflow:resize">
                    <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>
                    <span>Resize Margins</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

            <!-- Pryzm-style Nav items with badge -->
            <button class="landing-nav-link" id="btn-nav-studio-link" data-tool="edit">
              <span>Studio</span>
              <span class="nav-pill-badge">BETA</span>
            </button>
            <button class="landing-nav-link" data-tool="compress">Compress</button>
            <button class="landing-nav-link" data-tool="pdf-to-word">Convert</button>
            <button class="landing-nav-link" data-tool="merge">Merge</button>
            <button class="landing-nav-link" data-tool="sign">Sign</button>
          </nav>
        </div>

        <!-- Right Header CTAs: Search, Theme, Open studio, Sign in (Pryzm Style) -->
        <div class="landing-header-right">
          <button class="icon-btn" id="btn-landing-search" title="Search tools (Ctrl+K)" aria-label="Search all PDF tools">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <button class="icon-btn" id="btn-landing-theme" title="Toggle Theme (Dark / Light)">
            <svg class="theme-icon-sun" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>

          <div class="user-account-wrapper landing-nav-actions" id="landing-account-wrapper">
            <button class="landing-signin-pill-btn user-account-btn" id="btn-landing-auth" title="Sign in to your account">
              <span class="user-name-label">Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Landing Content (Scrollable) -->
    <main class="landing-main-content">
      <!-- Hero Section (Clean Smallpdf-Style 2-Column Hero) -->
      <section class="landing-hero-section">
        <div class="landing-hero-container">
          <div class="landing-hero-grid">
            <!-- Left Column: Copy & Actions -->
            <div class="landing-hero-left">
              <h1 class="landing-hero-title">Work on your <span style="color: var(--primary);">PDF</span><br>With Ease</h1>
              <p class="landing-hero-subtitle">Powerful PDF &amp; Office tools to simplify your workflow convert Word, Excel &amp; PPTX, OCR scanned pages, compare diffs, and sign with zero cloud upload.</p>
              <div class="landing-hero-actions">
                <button class="btn landing-hero-btn-primary" id="btn-landing-explore-tools">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon></svg>
                  <span>Explore 50+ Tools</span>
                </button>
                <button class="btn landing-hero-btn-outline" id="btn-landing-open-editor">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  <span>Open PDF Editor</span>
                </button>
              </div>
              <div class="landing-hero-trust-row">
                <span class="hero-trust-item"><svg width="15" height="15" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Free &amp; No installation</span>
                <span class="hero-trust-item"><svg width="15" height="15" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>100% In-Browser Privacy</span>
                <span class="hero-trust-item"><svg width="15" height="15" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>50+ Enterprise Tools</span>
              </div>
            </div>

            <!-- Right Column: Interactive Mockup Illustration with Floating Tool Badges & Confetti -->
            <div class="landing-hero-right" id="landing-hero-preview">
              <div class="hero-illustration-wrapper">
                <!-- Floating Decorative Accents (confetti matching screenshot) -->
                <div class="hero-accent-item accent-plus-orange">+</div>
                <div class="hero-accent-item accent-cross-cyan">&times;</div>
                <div class="hero-accent-item accent-circle-red"></div>
                <div class="hero-accent-item accent-plus-yellow">+</div>
                <div class="hero-accent-item accent-cross-coral">&times;</div>
                <div class="hero-accent-item accent-circle-teal"></div>

                <!-- Background Tilted Pastel Sheets -->
                <div class="hero-backdrop-sheet sheet-back"></div>
                <div class="hero-backdrop-sheet sheet-mid"></div>

                <!-- Main Application Window Mockup -->
                <div class="hero-mockup-window">
                  <!-- Window Header Bar -->
                  <div class="mockup-window-header">
                    <div class="mockup-brand">
                      <div class="mockup-logo-icon">
                        <span></span><span></span><span></span><span></span>
                      </div>
                      <span class="mockup-brand-text">LetsEdit</span>
                    </div>
                    <div class="mockup-toolbar">
                      <span class="mockup-tool-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7 17 3-7 7-3L3 3z"/></svg></span>
                      <span class="mockup-tool-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
                      <span class="mockup-tool-icon active"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg></span>
                      <span class="mockup-tool-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
                      <span class="mockup-tool-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></span>
                      <span class="mockup-tool-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/></svg></span>
                    </div>
                    <div class="mockup-window-dots">
                      <span></span><span></span>
                    </div>
                  </div>

                  <!-- Mockup Canvas / Document Sheet -->
                  <div class="mockup-window-body">
                    <div class="mockup-doc-sheet">
                      <!-- Skeleton Text Lines -->
                      <div class="mockup-line line-long"></div>
                      <div class="mockup-line line-med"></div>
                      <div class="mockup-line line-short"></div>

                      <!-- Selected Text Box ("Hello!") with 8 Blue Drag Handles -->
                      <div class="mockup-selected-text">
                        <div class="mockup-box-handle handle-tl"></div>
                        <div class="mockup-box-handle handle-tc"></div>
                        <div class="mockup-box-handle handle-tr"></div>
                        <div class="mockup-box-handle handle-ml"></div>
                        <div class="mockup-box-handle handle-mr"></div>
                        <div class="mockup-box-handle handle-bl"></div>
                        <div class="mockup-box-handle handle-bc"></div>
                        <div class="mockup-box-handle handle-br"></div>
                        <span class="mockup-selected-label">Hello!</span>
                      </div>

                      <!-- Selected Vector Circle with 8 Drag Handles -->
                      <div class="mockup-selected-circle">
                        <div class="mockup-box-handle handle-tl"></div>
                        <div class="mockup-box-handle handle-tc"></div>
                        <div class="mockup-box-handle handle-tr"></div>
                        <div class="mockup-box-handle handle-ml"></div>
                        <div class="mockup-box-handle handle-mr"></div>
                        <div class="mockup-box-handle handle-bl"></div>
                        <div class="mockup-box-handle handle-bc"></div>
                        <div class="mockup-box-handle handle-br"></div>
                        <div class="mockup-circle-shape"></div>
                      </div>

                      <!-- Middle lines -->
                      <div class="mockup-line line-full"></div>
                      <div class="mockup-line line-long"></div>
                      <div class="mockup-line line-med"></div>

                      <!-- Selected Red Signature Doodle with Mouse Cursor -->
                      <div class="mockup-selected-signature">
                        <div class="mockup-box-handle handle-tl"></div>
                        <div class="mockup-box-handle handle-tr"></div>
                        <div class="mockup-box-handle handle-bl"></div>
                        <div class="mockup-box-handle handle-br"></div>
                        <svg class="mockup-signature-path" viewBox="0 0 100 36" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M8 24c8-14 16-16 20-8s-4 16 6 12 18-22 24-10-8 18 10 12 18-20 22-8"></path>
                        </svg>
                        <!-- Black Mouse Pointer Cursor pointing at signature -->
                        <div class="mockup-cursor-pointer">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="#111827" stroke="#ffffff" stroke-width="1.5">
                            <path d="M3 3l7.5 18 3.5-7.5 7.5-3.5L3 3z"/>
                          </svg>
                        </div>
                      </div>

                      <!-- Bottom lines -->
                      <div class="mockup-line line-full"></div>
                      <div class="mockup-line line-long"></div>
                    </div>
                  </div>
                </div>

                <!-- Floating Colorful Tool Badges Orbiting the Window -->
                <div class="hero-float-badge badge-top-cyan" data-tool="workflow:edit" title="Edit PDF"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
                <div class="hero-float-badge badge-top-orange" data-tool="workflow:pdf-to-pptx" title="PDF to PowerPoint"><span class="badge-word-w">P</span></div>
                <div class="hero-float-badge badge-top-purple" data-tool="workflow:merge" title="Merge PDF"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h12"/></svg></div>
                <div class="hero-float-badge badge-left-green" data-tool="workflow:pdf-to-excel" title="PDF to Excel"><span class="badge-word-w">X</span></div>
                <div class="hero-float-badge badge-left-magenta" data-tool="workflow:sign" title="Sign PDF"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg></div>
                <div class="hero-float-badge badge-ocr-violet" data-tool="workflow:ocr" title="OCR Text Recognition"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg></div>
                <div class="hero-float-badge badge-right-yellow" data-tool="workflow:pdf-to-jpg" title="PDF to Image"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
                <div class="hero-float-badge badge-right-blue" data-tool="workflow:pdf-to-word" title="PDF to Word"><span class="badge-word-w">W</span></div>
                <div class="hero-float-badge badge-bottom-red" data-tool="workflow:compress" title="Compress PDF"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" stroke-dasharray="3 3"/><path d="M9 9h6v6H9z"/></svg></div>

                <!-- Drop Overlay on Illustration when dragging file -->
                <div class="hero-mockup-drop-overlay">
                  <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                  <span>Drop PDF to Edit Instantly</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clean Scroll Indicator Cue -->
        <button class="landing-hero-scroll-cue" id="btn-landing-scroll-cue" aria-label="Scroll to explore 50+ tools">
          <span>Explore 50+ PDF Tools</span>
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </section>

      <!-- Executive Feature Showcase: What's New in LetsEdit -->
      <section class="landing-showcase-section">
        <div class="landing-showcase-container">
          <div class="showcase-header">
            <span class="showcase-tag">ENTERPRISE CAPABILITIES</span>
            <h2 class="showcase-title">Enterprise Document Operations In Your Browser</h2>
            <p class="showcase-subtitle">Industry-standard PDF manipulations engineered for legal, financial, and compliance workflows with zero cloud exposure.</p>
          </div>

          <div class="landing-whats-new-grid">
            <!-- Card 1: Permanent Redaction -->
            <div class="whats-new-card" data-action="workflow:redact">
              <div class="whats-new-card-top">
                <div class="whats-new-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                </div>
                <span class="whats-new-badge">Redaction</span>
              </div>
              <h3 class="whats-new-card-title">Permanent Vector Redaction</h3>
              <p class="whats-new-card-desc">Forensically sanitizes glyph streams, content stream tokens, and text matrices. Purged words cannot be extracted or uncovered.</p>
              <div class="whats-new-meta">
                <span>Stream Tokenization</span> &bull; <span>Coordinate Masking</span>
              </div>
            </div>

            <!-- Card 2: Form Flattening -->
            <div class="whats-new-card" data-action="workflow:flatten">
              <div class="whats-new-card-top">
                <div class="whats-new-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <span class="whats-new-badge">AcroForm</span>
              </div>
              <h3 class="whats-new-card-title">Document Flattening</h3>
              <p class="whats-new-card-desc">Bakes interactive form fields, checkboxes, and signatures into static document vector art. Prevents subsequent alteration or tampering.</p>
              <div class="whats-new-meta">
                <span>AcroForm Flatten</span> &bull; <span>Immutable Vector Art</span>
              </div>
            </div>

            <!-- Card 3: Legal Bates Numbering -->
            <div class="whats-new-card" data-action="workflow:bates">
              <div class="whats-new-card-top">
                <div class="whats-new-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <span class="whats-new-badge">Discovery</span>
              </div>
              <h3 class="whats-new-card-title">Bates Numbering Suite</h3>
              <p class="whats-new-card-desc">Standardized legal discovery sequence indexing. Custom prefixes, suffixes, zero-padding (e.g. ABC-000001), and 6-zone dynamic page alignment.</p>
              <div class="whats-new-meta">
                <span>Multi-File Sequencing</span> &bull; <span>Legal E-Discovery</span>
              </div>
            </div>

            <!-- Card 4: Deep Sanitization -->
            <div class="whats-new-card" data-action="workflow:sanitize">
              <div class="whats-new-card-top">
                <div class="whats-new-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <span class="whats-new-badge">Compliance</span>
              </div>
              <h3 class="whats-new-card-title">Deep Document Sanitization</h3>
              <p class="whats-new-card-desc">Strips hidden object metadata, embedded file attachments, automated JavaScript actions, thumbnail streams, and private vendor application data.</p>
              <div class="whats-new-meta">
                <span>Adobe Acrobat Standard</span> &bull; <span>XMP Schema Purge</span>
              </div>
            </div>

            <!-- Card 5: Page Labels & Outlines -->
            <div class="whats-new-card" data-action="workflow:pagelabels">
              <div class="whats-new-card-top">
                <div class="whats-new-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <span class="whats-new-badge">ISO 32000-1</span>
              </div>
              <h3 class="whats-new-card-title">Page Labels & Bookmarks</h3>
              <p class="whats-new-card-desc">ISO 32000-1 /PageLabels supporting Roman, Arabic, and alphabetic sections alongside a tree navigation outline editor.</p>
              <div class="whats-new-meta">
                <span>Multi-Section Schemes</span> &bull; <span>Outline Hierarchy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tool Filter Rail Directory (Search moved to header) -->
      <section class="landing-tools-section" id="landing-tools-section">
        <div class="landing-tools-container">
          <div class="landing-tools-header">
            <div class="landing-tools-heading-wrap">
              <h2 class="landing-tools-heading">Explore All PDF Tools</h2>
              <p class="landing-tools-subheading">Choose a tool to launch immediately or open inside the interactive studio.</p>
            </div>
          </div>

          <div class="landing-filter-rail" id="landing-filter-rail">
            <button class="landing-filter-chip active" data-filter="all">All Tools</button>
            <button class="landing-filter-chip" data-filter="popular">⭐ Most Popular</button>
            <button class="landing-filter-chip" data-filter="merge">🔗 Merge</button>
            <button class="landing-filter-chip" data-filter="split">✂ Split</button>
            <button class="landing-filter-chip" data-filter="edit-sign">✏ Edit & Sign</button>
            <button class="landing-filter-chip" data-filter="compress-scans">🗜 Compress & Scans</button>
            <button class="landing-filter-chip" data-filter="security">🛡 Security & Redact</button>
            <button class="landing-filter-chip" data-filter="convert-from">📤 Convert from PDF</button>
            <button class="landing-filter-chip" data-filter="convert-to">📥 Convert to PDF</button>
            <button class="landing-filter-chip" data-filter="others">⚖ Legal & Archival</button>
          </div>

          <!-- Responsive Cards Grid -->
          <div class="landing-cards-grid" id="landing-cards-grid"></div>
        </div>
      </section>

      <!-- Why Choose LetsEdit (Clean Executive Value Props) -->
      <section class="landing-why-choose-section">
        <div class="why-choose-container">
          <div class="section-badge-header">
            <span class="section-tag-pill">SECURITY & PERFORMANCE</span>
            <h2 class="section-main-heading">The Safe, Fast, and Uncompromising PDF Suite</h2>
            <p class="section-sub-heading">Built for legal professionals, enterprises, and everyday creators who demand 100% private in-browser speed with zero server uploads.</p>
          </div>

          <div class="why-choose-grid">
            <div class="why-card">
              <div class="why-card-top">
                <div class="why-icon-box">
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span class="why-pill-badge">100% Client-Side</span>
              </div>
              <h3 class="why-card-title">Zero Cloud Uploads & Maximum Privacy</h3>
              <p class="why-card-desc">Your confidential contracts, financials, and medical records never leave your machine. Processing runs inside client-side WebAssembly with zero server telemetry.</p>
            </div>

            <div class="why-card">
              <div class="why-card-top">
                <div class="why-icon-box">
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <span class="why-pill-badge">Sub-Second Speed</span>
              </div>
              <h3 class="why-card-title">Blazing Fast WebAssembly Performance</h3>
              <p class="why-card-desc">Zero bandwidth lag, zero upload waiting, and no server timeouts. Split 500-page discovery files or compress multi-gigabyte scans directly on your local hardware.</p>
            </div>

            <div class="why-card">
              <div class="why-card-top">
                <div class="why-icon-box">
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <span class="why-pill-badge">Direct Editing</span>
              </div>
              <h3 class="why-card-title">True Text Editing In Your Browser</h3>
              <p class="why-card-desc">Correct typos and rewrite original paragraphs directly in your PDF. Our text engine matches font families, glyph weights, font sizes, and baseline alignments automatically.</p>
            </div>

            <div class="why-card">
              <div class="why-card-top">
                <div class="why-icon-box">
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                </div>
                <span class="why-pill-badge">Legal Grade</span>
              </div>
              <h3 class="why-card-title">Permanent Vector Redaction</h3>
              <p class="why-card-desc">True forensic sanitization: parses content streams and permanently deletes glyph tokens and underlying text matrices. Opaque redaction masks cannot be reversed.</p>
            </div>

            <div class="why-card">
              <div class="why-card-top">
                <div class="why-icon-box">
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span class="why-pill-badge">Bates & Flattening</span>
              </div>
              <h3 class="why-card-title">Bates Numbering & Form Flattening</h3>
              <p class="why-card-desc">Conform to legal discovery protocols with 8-digit zero-padded Bates sequencing, 6-zone layout alignment, and AcroForm vector flattening to lock finalized contracts.</p>
            </div>

            <div class="why-card">
              <div class="why-card-top">
                <div class="why-icon-box">
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
                </div>
                <span class="why-pill-badge">Audit Ready</span>
              </div>
              <h3 class="why-card-title">Digital Signatures with Audit Trails</h3>
              <p class="why-card-desc">Sign documents electronically with tamper-evident SHA-256 cryptographic verification, unique transaction UUIDs, timestamp certificates, and audit trails.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Windows, Mac & Mobile Apps Showcase (Smallpdf & Adobe Style) -->
      <section class="landing-apps-section">
        <div class="apps-container">
          <div class="apps-banner">
            <div class="apps-content">
              <span class="section-tag-pill apps-pill">WINDOWS, MAC & MOBILE</span>
              <h2 class="apps-title">Work With PDFs Anywhere — Even Offline</h2>
              <p class="apps-desc">Install LetsEdit as a lightweight desktop application on Windows, macOS, or Linux, or use our mobile touch interface on iPhone and Android. Zero dependencies, 100% offline capability.</p>

              <div class="apps-feature-list">
                <div class="apps-feature-item">
                  <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  <span><strong>1-Click Desktop App</strong> (Run native PWA with zero admin rights required)</span>
                </div>
                <div class="apps-feature-item">
                  <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  <span><strong>100% Offline Mode</strong> (Edit, compress, merge, and sign without internet)</span>
                </div>
                <div class="apps-feature-item">
                  <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  <span><strong>Mobile Touch Ready</strong> (Smooth signing, forms, and page organizing on mobile)</span>
                </div>
              </div>

              <div class="apps-actions">
                <button class="btn btn-primary apps-cta-btn" id="btn-install-desktop-app" title="Launch Windows desktop app">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
                  <span>Windows Desktop App</span>
                </button>
                <button class="btn btn-outline apps-cta-btn" id="btn-open-web-app" title="Open Web Studio">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  <span>Launch Web Studio</span>
                </button>
              </div>
            </div>

            <div class="apps-preview-box">
              <div class="apps-device-frame">
                <div class="device-window-header">
                  <span class="device-dot red"></span>
                  <span class="device-dot yellow"></span>
                  <span class="device-dot green"></span>
                  <span class="device-window-title">LetsEdit Studio — Windows & Offline</span>
                </div>
                <div class="device-window-body">
                  <div class="device-sample-tool">
                    <span class="device-tool-badge">OFFLINE READY</span>
                    <span class="device-tool-title">High-Performance Vector Engine</span>
                    <p class="device-tool-desc">Processed 4,200+ pages locally with 0-byte network footprint.</p>
                  </div>
                  <div class="device-badges-row">
                    <span class="device-chip">Windows 11 / 10</span>
                    <span class="device-chip">macOS Sonoma</span>
                    <span class="device-chip">Linux</span>
                    <span class="device-chip">iOS & Android</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SEO FAQ Accordion Section (Executive Adobe & Smallpdf Style) -->
      <section class="landing-faq-section">
        <div class="faq-container">
          <div class="section-badge-header">
            <span class="section-tag-pill">HELP & KNOWLEDGE BASE</span>
            <h2 class="faq-title">Frequently Asked Questions</h2>
            <p class="faq-subtitle">Everything you need to know about our browser-native WebAssembly PDF suite</p>
          </div>

          <div class="faq-accordion">
            <details class="faq-item" open>
              <summary class="faq-question">
                <span>Is LetsEdit really 100% free with no hidden fees or daily limits?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes, LetsEdit is completely free. We do not impose artificial 2-task hourly limits, file size throttles, or premium paywalls. All 43+ tools—including advanced capabilities like permanent redaction, Bates numbering, and digital signatures—are fully accessible without requiring a credit card or mandatory subscription.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>How does 100% client-side WebAssembly protect my confidential files?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Standard online PDF editors upload your sensitive files to remote cloud servers to process them, creating security and compliance risks. LetsEdit compiles enterprise PDF engines (PDF.js, PDF-Lib, and WebAssembly) to run directly inside your browser sandbox. Your PDF data, text, and images never leave your local machine.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>How is Permanent Vector Redaction different from drawing black rectangles?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                In basic editors, drawing a black box simply places a cosmetic layer over the text—meaning anyone can still select, copy, search, or forensically extract the underlying confidential words. LetsEdit's permanent redaction parses the raw PDF content streams, completely removes the underlying font tokens and glyph matrices, and burns an opaque mask into the page vector stream, guaranteeing irreversible data removal.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Can I use LetsEdit offline without an internet connection?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes! Because LetsEdit executes entirely in client-side WebAssembly, once the page or Progressive Web App (PWA) is loaded, you can disconnect from the internet or work on flights. You can install LetsEdit as a native desktop application on Windows, Mac, or Linux with a single click.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Does LetsEdit support legal discovery and Bates Numbering standards?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Absolutely. Our Bates Numbering suite complies with legal e-discovery requirements. You can customize alphanumeric prefixes (e.g., EXHIBIT-A-), set zero-padded sequential counters up to 8 digits (e.g., 00000001), define custom suffixes, and align numbers across 6 distinct header and footer zones with margin controls.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Are digital signatures created on LetsEdit legally binding?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes. Signatures generated with LetsEdit include cryptographic SHA-256 document hashing, timestamp tokens, signer metadata, and can append a standalone Multi-Party Legal Audit Certificate with verifiable transaction IDs, meeting ESIGN and UETA legal framework criteria.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Can I edit original PDF text directly instead of just adding text over it?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes! Our PDF Studio Editor includes an intelligent text clustering and replacement engine. It detects the original font family, size, line baseline, and color so you can edit, correct typos, or replace existing text paragraphs seamlessly.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>What file formats does LetsEdit support for conversion?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                LetsEdit supports bidirectional conversion across all standard formats: PDF to Word (DOCX), Excel (XLSX), PowerPoint (PPTX), JPG, PNG, and Text, as well as converting images, Office documents, OpenOffice (ODT, ODS, ODP), HTML, TXT, EPUB, and CSV into standard PDF and archival PDF/A documents.
              </div>
            </details>
          </div>
        </div>
      </section>

      <!-- Comprehensive Smallpdf & Adobe Style Informative Footer -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-grid-wrapper">
            <!-- Left Brand Column -->
            <div class="footer-brand-column">
              <div class="lets-logo" style="margin-bottom: 12px;">
                <div class="lets-logo-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
                    <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
                    <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
                    <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
                  </svg>
                </div>
                <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
              </div>
              <p class="footer-brand-tagline">Making PDF fast, private, and effortless. 100% in-browser WebAssembly processing with zero cloud uploads.</p>



              <!-- Social Links -->
              <div class="footer-social-links">
                <a href="https://linkedin.com" target="_blank" rel="noopener" class="footer-social-icon" title="LinkedIn">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener" class="footer-social-icon" title="X (Twitter)">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener" class="footer-social-icon" title="GitHub">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            <!-- Column 1: Popular PDF Tools -->
            <div class="footer-col">
              <h4>Popular Tools</h4>
              <a href="#" data-action="workflow:edit">Edit PDF Directly</a>
              <a href="#" data-action="workflow:compress">Compress PDF</a>
              <a href="#" data-action="workflow:merge">Merge PDF</a>
              <a href="#" data-action="workflow:split">Split PDF</a>
              <a href="#" data-action="workflow:pdf-to-word">PDF to Word</a>
              <a href="#" data-action="workflow:word-to-pdf">Word to PDF</a>
              <a href="#" data-action="workflow:sign">Fill & Sign Forms</a>
              <a href="#" data-action="workflow:redact">Permanent Redaction</a>
            </div>

            <!-- Column 2: Organize & Legal -->
            <div class="footer-col">
              <h4>Organize & Legal</h4>
              <a href="#" data-action="workflow:organize">Organize Pages</a>
              <a href="#" data-action="workflow:rotate">Rotate PDF Pages</a>
              <a href="#" data-action="workflow:extract-pages">Extract Pages</a>
              <a href="#" data-action="workflow:bates">Bates Numbering</a>
              <a href="#" data-action="workflow:flatten">Document Flattening</a>
              <a href="#" data-action="workflow:sanitize">Deep Sanitization</a>
              <a href="#" data-action="workflow:pagenumbers">Page Numbers</a>
              <a href="#" data-action="workflow:crop">Crop PDF Pages</a>
            </div>

            <!-- Column 3: Convert & OCR -->
            <div class="footer-col">
              <h4>Convert & OCR</h4>
              <a href="#" data-action="workflow:ocr-pdf">PDF OCR Recognition</a>
              <a href="#" data-action="workflow:pdf-to-excel">PDF to Excel</a>
              <a href="#" data-action="workflow:pdf-to-ppt">PDF to PowerPoint</a>
              <a href="#" data-action="workflow:to-image">PDF to JPG / PNG</a>
              <a href="#" data-action="workflow:images-to-pdf">JPG / PNG to PDF</a>
              <a href="#" data-action="workflow:html-to-pdf">HTML to PDF</a>
              <a href="#" data-action="workflow:pdfa">PDF to PDF/A</a>
              <a href="#" data-action="workflow:compare">Compare PDF Diffs</a>
            </div>

            <!-- Column 4: Solutions & Trust -->
            <div class="footer-col">
              <h4>Solutions & Trust</h4>
              <a href="#" data-legal="security">Zero-Cloud Security</a>
              <a href="#" data-legal="privacy">Privacy & GDPR</a>
              <a href="#" data-legal="terms">Terms & E-Sign</a>
              <a href="#" data-action="workflow:bates">Legal E-Discovery</a>
              <a href="#" data-action="workflow:sign">Finance & Contracts</a>
              <a href="#" data-action="workflow:redact">Healthcare & HIPAA</a>
              <a href="#" data-action="workflow:pdfa">ISO 32000 Compliance</a>
              <a href="#" data-legal="security">Security Whitepaper</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-bottom-inner">
            <span class="footer-copy">© 2026 LetsEdit. 100% Client-Side WebAssembly. Zero Cloud Uploads. Confidential & Private.</span>
            <div class="footer-legal-nav">
              <button class="footer-legal-btn" data-legal="privacy">Privacy Policy</button>
              <span class="footer-dot">&bull;</span>
              <button class="footer-legal-btn" data-legal="terms">Terms of Service</button>
              <span class="footer-dot">&bull;</span>
              <button class="footer-legal-btn" data-legal="security">Security Whitepaper</button>
            </div>
            <div class="footer-status-pill">
              <span>All Systems Operational &bull; 0 Byte Cloud Telemetry &bull; Client WASM v2.4</span>
            </div>
          </div>
        </div>
      </footer>
    </main>

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
