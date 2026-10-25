/**
 * Landing Page HTML Template
 * Produces clean semantic HTML structure for executive header, Smallpdf-style mega menu,
 * hero (no dropzone), What's New showcase, filter rail, feature trust metrics, FAQ,
 * and comprehensive Smallpdf-style footer.
 * Strict Constraint: No file dropzone on the landing page hero.
 */

export function getLandingTemplateHtml() {
  return `
    <!-- Landing Header / Top Navigation (Smallpdf Executive Style) -->
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

        <!-- Desktop Quick Links (Smallpdf Pill + Nav Style) -->
        <nav class="landing-desktop-nav">
          <!-- Smallpdf-Style Tools Mega Menu Trigger Button -->
          <div class="landing-dropdown mega-dropdown">
            <button class="landing-tools-pill-btn dropdown-toggle" id="btn-landing-mega-menu" title="Browse all 43+ PDF tools">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/></svg>
              <span>Tools</span>
              <svg class="chevron-icon" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
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

          <!-- Smallpdf Direct Top Header Nav Links -->
          <button class="landing-nav-link" data-tool="compress">Compress</button>
          <button class="landing-nav-link" data-tool="pdf-to-word">Convert</button>
          <button class="landing-nav-link" data-tool="merge">Merge</button>
          <button class="landing-nav-link" data-tool="edit">Edit</button>
          <button class="landing-nav-link" data-tool="sign">Sign</button>
          <button class="landing-nav-link" data-tool="security">Protect</button>
        </nav>

        <!-- Right Header CTAs: Theme, Log In, Open Studio -->
        <div class="landing-header-right">
          <button class="icon-btn" id="btn-landing-theme" title="Toggle Theme (Dark / Light)">
            <svg class="theme-icon-sun" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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

          <div class="user-account-wrapper" id="landing-account-wrapper" style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-outline btn-sm user-account-btn" id="btn-landing-auth">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span class="user-name-label">Log in</span>
            </button>
            <button class="btn btn-primary btn-sm" id="btn-landing-studio-cta" style="padding: 6px 14px; font-weight: 600; font-size: 13px;">
              <span>Open Studio</span>
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-left: 4px;"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Landing Content (Scrollable) -->
    <main class="landing-main-content">
      <!-- Hero Section (Elevated, High-Converting Hero - NO DROPZONE) -->
      <section class="landing-hero-section">
        <div class="landing-hero-container">
          <div class="hero-chip-badge">
            <span class="hero-chip-dot"></span>
            <span>Client-Side WebAssembly &bull; Zero Cloud Uploads</span>
          </div>

          <h1 class="landing-hero-title">
            The Professional PDF Suite Built for <span class="hero-title-accent">Speed, Precision & Total Privacy</span>.
          </h1>
          <p class="landing-hero-subtitle">
            Edit existing typography, permanently redact sensitive data, imprint Bates numbers, flatten forms, sign, and convert documents locally in your browser. Pure vector mathematics with zero telemetry.
          </p>

          <!-- Hero Fast Search & Popular Tools Launch Hub -->
          <div class="hero-actions-hub">
            <div class="hero-search-bar-wrap">
              <div class="hero-search-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input type="text" id="hero-quick-search-input" class="hero-search-input" placeholder="Search 43+ tools (e.g. Redact, Flatten, Bates, Merge, Split, OCR, Sign)..." autocomplete="off" />
              <div class="hero-search-kbd" title="Search shortcut">⌘K</div>
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
                <span>Merge</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:compress">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path></svg>
                <span>Compress</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:split">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22V2"></path></svg>
                <span>Split</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:redact">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>
                <span>Redact</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:bates">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Bates Number</span>
              </button>
              <button class="hero-popular-pill" data-action="workflow:sign">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"></path><path d="M14 7h7v7"></path></svg>
                <span>Fill & Sign</span>
              </button>
            </div>
          </div>

          <!-- Hero Value & Trust Bar -->
          <div class="hero-trust-bar">
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span><strong>100% Client-Side</strong> &bull; Zero Server Uploads</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#30050d" stroke-width="2.2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              <span><strong>Sub-Second Speed</strong> &bull; Client-Side WASM</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#8b5cf6" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              <span><strong>43+ Pro Tools</strong> &bull; Edit, Redact, Bates & Sign</span>
            </div>
            <div class="trust-pill">
              <svg width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
              <span><strong>ISO Compliant</strong> &bull; PDF/A & PDF 1.7 Standards</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Executive Feature Showcase: What's New in LetsEdit -->
      <section class="landing-showcase-section">
        <div class="landing-showcase-container">
          <div class="showcase-header">
            <span class="showcase-tag">ADVANCED CAPABILITIES</span>
            <h2 class="showcase-title">Enterprise Document Operations In Your Browser</h2>
            <p class="showcase-subtitle">Industry-standard PDF manipulations previously exclusive to desktop suites like Adobe Acrobat Pro.</p>
          </div>

          <div class="landing-whats-new-grid">
            <!-- Card 1: Permanent Redaction -->
            <div class="whats-new-card" data-action="workflow:redact">
              <div class="whats-new-badge badge-pro">PRO FEATURE</div>
              <div class="whats-new-icon" style="background: rgba(15, 23, 42, 0.08); color: #0f172a;">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
              </div>
              <h3 class="whats-new-card-title">Permanent Vector Redaction</h3>
              <p class="whats-new-card-desc">Forensically sanitizes glyph streams, content stream tokens, and text matrices. Purged words cannot be extracted or uncovered.</p>
              <div class="whats-new-meta">
                <span>Stream Tokenization</span> &bull; <span>Coordinate Masking</span>
              </div>
            </div>

            <!-- Card 2: Form Flattening -->
            <div class="whats-new-card" data-action="workflow:flatten">
              <div class="whats-new-badge badge-new">NEW</div>
              <div class="whats-new-icon" style="background: rgba(13, 148, 136, 0.1); color: #0d9488;">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3 class="whats-new-card-title">Document Flattening</h3>
              <p class="whats-new-card-desc">Bakes interactive form fields, checkboxes, and signatures into static document vector art. Prevents subsequent alteration or tampering.</p>
              <div class="whats-new-meta">
                <span>AcroForm Flatten</span> &bull; <span>Immutable Vector Art</span>
              </div>
            </div>

            <!-- Card 3: Legal Bates Numbering -->
            <div class="whats-new-card" data-action="workflow:bates">
              <div class="whats-new-badge badge-legal">LEGAL</div>
              <div class="whats-new-icon" style="background: rgba(30, 41, 59, 0.1); color: #1e293b;">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 class="whats-new-card-title">Bates Numbering Suite</h3>
              <p class="whats-new-card-desc">Standardized legal discovery sequence indexing. Custom prefixes, suffixes, zero-padding (e.g. ABC-000001), and 6-zone dynamic page alignment.</p>
              <div class="whats-new-meta">
                <span>Multi-File Sequencing</span> &bull; <span>Legal E-Discovery</span>
              </div>
            </div>

            <!-- Card 4: Deep Sanitization -->
            <div class="whats-new-card" data-action="workflow:sanitize">
              <div class="whats-new-badge badge-pro">PRO FEATURE</div>
              <div class="whats-new-icon" style="background: rgba(5, 150, 105, 0.1); color: #059669;">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 class="whats-new-card-title">Deep Document Sanitization</h3>
              <p class="whats-new-card-desc">Strips hidden object metadata, embedded file attachments, automated JavaScript actions, thumbnail streams, and private vendor application data.</p>
              <div class="whats-new-meta">
                <span>Adobe Acrobat Standard</span> &bull; <span>XMP Schema Purge</span>
              </div>
            </div>

            <!-- Card 5: Page Labels & Outlines -->
            <div class="whats-new-card" data-action="workflow:pagelabels">
              <div class="whats-new-badge badge-iso">ISO 32000-1</div>
              <div class="whats-new-icon" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
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

      <!-- Tool Filter Rail & Live Search Directory -->
      <section class="landing-tools-section">
        <div class="landing-tools-container">
          <div class="landing-tools-header">
            <div class="landing-tools-heading-wrap">
              <h2 class="landing-tools-heading">Explore All PDF Tools</h2>
              <p class="landing-tools-subheading">Choose a tool to launch immediately or open inside the interactive studio.</p>
            </div>
            <div class="landing-search-wrapper">
              <svg class="landing-search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="landing-tool-search" class="landing-search-input" placeholder="Quick find any tool (redact, flatten, bates, merge, split, OCR, sign)..." autocomplete="off" />
              <button id="landing-search-clear" class="landing-search-clear" style="display:none;" title="Clear search">&times;</button>
            </div>
          </div>

          <div class="landing-filter-rail" id="landing-filter-rail">
            <button class="landing-filter-chip active" data-filter="all">All Tools (43)</button>
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

      <!-- Feature Trust Badges Section -->
      <section class="landing-features-section">
        <div class="features-inner">
          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(48,5,13,0.08); color: #30050d;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3>100% Private & Confidential</h3>
            <p>Your documents never leave your browser. Processing runs in client-side WebAssembly with zero telemetry or third-party servers.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            </div>
            <h3>Sub-Second Speed</h3>
            <p>Instant loading with PDF.js and PDF-Lib vector compilation. No slow upload delays, file size throttling, or server queues.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(139,92,246,0.1); color: #8b5cf6;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            </div>
            <h3>No Paywalls or Hourly Limits</h3>
            <p>Unlimited document sizes, unlimited pages, and unlimited daily tasks. Enterprise-grade tools completely free for everyone.</p>
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
                Yes, LetsEdit is 100% free with no hidden subscriptions, credit card requirements, or artificial hourly caps. You can edit, merge, compress, split, redact, and sign as many PDFs as you need.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Are my files and sensitive data safe?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Absolutely. Unlike traditional PDF web apps that upload your confidential files to remote cloud servers, LetsEdit executes 100% locally on your machine using client-side WebAssembly. Your files never touch any external server.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Is Permanent Redaction truly permanent and safe?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes. Our Permanent Redaction engine decompresses the raw content streams and removes the text tokens, glyph matrices, and metadata permanently before drawing an opaque masking box. Unlike cosmetic black boxes in simple editors, the underlying text cannot be recovered via text selection, copy-paste, or forensic stream decompilation.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>Can I use Bates Numbering for legal discovery?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Yes! Our Bates Numbering tool conforms to legal discovery standards. It supports custom prefixes (e.g. 'PLAINTIFF-CONFIDENTIAL'), variable zero-padding (up to 8 digits), start numbers, and precise 6-zone header/footer placement with custom margins.
              </div>
            </details>

            <details class="faq-item">
              <summary class="faq-question">
                <span>What does Document Flattening do?</span>
                <svg class="faq-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </summary>
              <div class="faq-answer">
                Document flattening converts interactive form elements (text fields, radio buttons, dropdowns, and digital signature widgets) into permanent, read-only vector artwork embedded directly into the page stream. This locks the document and prevents subsequent form editing.
              </div>
            </details>
          </div>
        </div>
      </section>

      <!-- Comprehensive Smallpdf-Style Footer -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-grid-wrapper">
            <!-- Left Brand Column -->
            <div class="footer-brand-column">
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
              <p class="footer-brand-tagline">We make PDF easy, fast & 100% private.</p>

              <!-- Social Links -->
              <div class="footer-social-links">
                <a href="https://linkedin.com" target="_blank" rel="noopener" class="footer-social-icon" title="LinkedIn">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener" class="footer-social-icon" title="Facebook">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener" class="footer-social-icon" title="YouTube">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener" class="footer-social-icon" title="X (Twitter)">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>

              <!-- Store Badges -->
              <div class="footer-store-badges">
                <a class="footer-badge-item" title="Download for Windows" href="#" onclick="event.preventDefault()">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
                  <div>
                    <span class="badge-sub">Download for</span>
                    <strong class="badge-main">Windows</strong>
                  </div>
                </a>
                <a class="footer-badge-item" title="Get it on Google Play" href="#" onclick="event.preventDefault()">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.3 0 .58.09.81.25l13.5 8.5c.67.42.67 1.08 0 1.5l-13.5 8.5c-.23.16-.51.25-.81.25-.83 0-1.5-.67-1.5-1.5z"/></svg>
                  <div>
                    <span class="badge-sub">GET IT ON</span>
                    <strong class="badge-main">Google Play</strong>
                  </div>
                </a>
                <a class="footer-badge-item" title="Download on the App Store" href="#" onclick="event.preventDefault()">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.87.94-2.96-.92.04-2.02.61-2.67 1.38-.58.67-1.09 1.76-.95 2.83 1.02.08 2.05-.47 2.68-1.25z"/></svg>
                  <div>
                    <span class="badge-sub">Download on the</span>
                    <strong class="badge-main">App Store</strong>
                  </div>
                </a>
              </div>
            </div>

            <!-- Solutions Column -->
            <div class="footer-col">
              <h4>Solutions</h4>
              <a href="#" data-tool="edit">Sales Teams</a>
              <a href="#" data-tool="bates">Legal & Compliance</a>
              <a href="#" data-tool="sign">Finance & Contracts</a>
              <a href="#" data-tool="merge">Real Estate</a>
              <a href="#" data-tool="flatten">Education & Research</a>
              <a href="#" data-tool="sanitize">Healthcare Records</a>
            </div>

            <!-- Company Column -->
            <div class="footer-col">
              <h4>Company</h4>
              <a href="#" data-tool="edit">About Us</a>
              <a href="#" data-tool="security">Zero-Cloud Security</a>
              <a href="#" data-tool="compress">Client WASM Engine</a>
              <a href="#" data-tool="pdfa">ISO Compliance</a>
              <a href="#" data-tool="edit">Help Center</a>
              <a href="#" data-tool="edit">PDF Statistics</a>
            </div>

            <!-- Product Column -->
            <div class="footer-col">
              <h4>Product</h4>
              <a href="#" data-tool="edit">43+ Free Tools</a>
              <a href="#" data-tool="edit">Studio Editor</a>
              <a href="#" data-tool="sign">Digital Signatures</a>
              <a href="#" data-tool="bates">Bates Numbering</a>
              <a href="#" data-tool="redact">Permanent Redaction</a>
              <a href="#" data-tool="compare">Compare PDF</a>
            </div>

            <!-- Apps Column -->
            <div class="footer-col">
              <h4>Apps</h4>
              <a href="#" data-tool="edit">Web Browser App</a>
              <a href="#" data-tool="scan">PDF Scanner</a>
              <a href="#" data-tool="sign">Mobile Signer</a>
              <a href="#" data-tool="edit">Windows Desktop App</a>
              <a href="#" data-tool="edit">Chrome Extension</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-bottom-inner">
            <span class="footer-copy">© 2026 LetsEdit. 100% Client-Side WebAssembly. Zero Cloud Uploads.</span>
            <div class="footer-status-pill">
              <span class="status-dot-green"></span>
              <span>All Services Operational &bull; 0 Byte Server Telemetry</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  `;
}
