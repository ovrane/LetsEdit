/**
 * Landing Page HTML Template
 * Produces clean semantic HTML structure for executive header, Smallpdf-style mega menu,
 * hero (no dropzone), What's New showcase, filter rail, feature trust metrics, FAQ,
 * and comprehensive Smallpdf-style footer.
 * Strict Constraint: No file dropzone on the landing page hero.
 */

import { getPopularToolsHtml } from './landing-popular.js';

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
            <a href="/docs" data-route="/docs" class="landing-nav-link" id="btn-nav-docs-link">Docs</a>
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
              <h1 class="landing-hero-title">Free Online <span style="color: var(--primary);">PDF Editor</span> &amp; Tools</h1>
              <p class="landing-hero-subtitle">Powerful PDF &amp; Office tools to simplify your workflow — convert Word, Excel &amp; PPTX, OCR scanned pages, compare diffs, and sign with zero cloud upload.</p>
              <div class="landing-hero-actions">
                <button class="btn landing-hero-btn-primary" id="btn-landing-upload-pdf" title="Upload a PDF and launch directly in Studio Editor">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span>Upload PDF to Edit</span>
                </button>
                <input type="file" id="landing-hero-file-input" accept="application/pdf" style="display:none;" />
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

        <!-- Most Popular PDF Tools (Smallpdf/Adobe Clean 3x2 Grid) -->
        ${getPopularToolsHtml()}

        <!-- Clean Scroll Indicator Cue -->
        <button class="landing-hero-scroll-cue" id="btn-landing-scroll-cue" aria-label="Scroll to explore 50+ tools">
          <span>Explore 50+ PDF Tools</span>
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </section>

      <!-- Executive Feature Showcase: Enterprise Document Operations -->
      <section class="landing-showcase-section">
        <!-- Floating Subtle Brand Accents -->
        <div class="showcase-float-icon left" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        </div>
        <div class="showcase-float-icon right" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>

        <div class="landing-showcase-container">
          <div class="showcase-header">
            <span class="showcase-tag">ENTERPRISE CAPABILITIES</span>
            <h2 class="showcase-title">Enterprise Document Operations <span class="showcase-theme-accent">In Your Browser</span></h2>
            <p class="showcase-subtitle">Industry-standard PDF manipulations engineered for legal, financial, and compliance workflows with zero cloud exposure.</p>
          </div>

          <div class="landing-enterprise-grid">
            <!-- Card 1: Permanent Redaction -->
            <div class="ent-card red" data-action="workflow:redact">
              <div class="ent-card-preview">
                <div class="ent-preview-sheet redact-sheet">
                  <div class="ent-pdf-badge">PDF</div>
                  <div class="ent-redact-voxels">
                    <span class="voxel v1"></span>
                    <span class="voxel v2"></span>
                    <span class="voxel v3"></span>
                    <span class="voxel v4"></span>
                    <span class="voxel v5"></span>
                    <span class="voxel v6"></span>
                  </div>
                </div>
              </div>
              <span class="ent-tag red">REDACTION</span>
              <h3 class="ent-card-title">Permanent Vector Redaction</h3>
              <p class="ent-card-desc">Forensically sanitizes glyph streams, content stream tokens, and text matrices. Purged words cannot be extracted or recovered.</p>
              <ul class="ent-feature-bullets">
                <li><span class="bullet-check red">✓</span> Stream Tokenization</li>
                <li><span class="bullet-check red">✓</span> Coordinate Masking</li>
                <li><span class="bullet-check red">✓</span> True Data Removal</li>
              </ul>
            </div>

            <!-- Card 2: Form Flattening (AcroForm) -->
            <div class="ent-card blue" data-action="workflow:flatten">
              <div class="ent-card-preview">
                <div class="ent-preview-sheet flatten-sheet">
                  <div class="ent-select-box">
                    <span class="ent-sel-handle nw"></span>
                    <span class="ent-sel-handle ne"></span>
                    <span class="ent-sel-handle sw"></span>
                    <span class="ent-sel-handle se"></span>
                    <div class="ent-sheet-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                  </div>
                  <div class="ent-cursor-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0f172a" stroke="#ffffff" stroke-width="1.5"><polygon points="3 3 10 21 13 14 20 11 3 3"/></svg>
                  </div>
                  <div class="ent-mini-dock">
                    <span>T</span>
                    <span>✏</span>
                    <span>🖼</span>
                    <span>✍</span>
                  </div>
                </div>
              </div>
              <span class="ent-tag blue">ACROFORM</span>
              <h3 class="ent-card-title">Document Flattening</h3>
              <p class="ent-card-desc">Bakes interactive form fields, checkboxes, and signatures into static document vector art. Prevents subsequent alteration or tampering.</p>
              <ul class="ent-feature-bullets">
                <li><span class="bullet-check blue">✓</span> AcroForm Flatten</li>
                <li><span class="bullet-check blue">✓</span> Immutable Output</li>
                <li><span class="bullet-check blue">✓</span> Vector Preservation</li>
              </ul>
            </div>

            <!-- Card 3: Bates Numbering Suite (Discovery) -->
            <div class="ent-card green" data-action="workflow:bates">
              <div class="ent-card-preview">
                <div class="ent-preview-sheet bates-sheet">
                  <div class="ent-bates-stack">
                    <div class="bates-page p3"></div>
                    <div class="bates-page p2"></div>
                    <div class="bates-page p1">
                      <div class="bates-badge-stamp b1">1</div>
                      <div class="bates-badge-stamp b2">2</div>
                      <div class="bates-badge-stamp b3">3</div>
                      <div class="bates-doc-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span class="ent-tag green">DISCOVERY</span>
              <h3 class="ent-card-title">Bates Numbering Suite</h3>
              <p class="ent-card-desc">Standardized legal discovery sequence indexing. Custom prefixes, suffixes, zero-padding (e.g. ABC-000001), and 6-zone dynamic page alignment.</p>
              <ul class="ent-feature-bullets">
                <li><span class="bullet-check green">✓</span> Multi-File Sequencing</li>
                <li><span class="bullet-check green">✓</span> Custom Formatting</li>
                <li><span class="bullet-check green">✓</span> Legal E-Discovery Ready</li>
              </ul>
            </div>

            <!-- Card 4: Deep Document Sanitization (Compliance) -->
            <div class="ent-card purple" data-action="workflow:sanitize">
              <div class="ent-card-preview">
                <div class="ent-preview-sheet sanitize-sheet">
                  <div class="ent-shield-badge">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#8b5cf6" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <svg class="ent-shield-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="ent-meta-lines">
                    <span class="m-line l1"></span>
                    <span class="m-line l2"></span>
                    <span class="m-line l3"></span>
                  </div>
                </div>
              </div>
              <span class="ent-tag purple">COMPLIANCE</span>
              <h3 class="ent-card-title">Deep Document Sanitization</h3>
              <p class="ent-card-desc">Strips hidden object metadata, embedded file attachments, automated JavaScript actions, thumbnail streams, and private vendor application data.</p>
              <ul class="ent-feature-bullets">
                <li><span class="bullet-check purple">✓</span> Metadata Removal</li>
                <li><span class="bullet-check purple">✓</span> Attachment &amp; Script Purge</li>
                <li><span class="bullet-check purple">✓</span> XMP Schema Cleanup</li>
              </ul>
            </div>

            <!-- Card 5: Page Labels & Bookmarks (ISO 32000-1) -->
            <div class="ent-card amber" data-action="workflow:pagelabels">
              <div class="ent-card-preview">
                <div class="ent-preview-sheet outline-sheet">
                  <div class="ent-outline-page">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="ent-tree-diagram">
                    <div class="tree-node root"></div>
                    <div class="tree-branch b1"></div>
                    <div class="tree-branch b2"></div>
                    <div class="tree-node child1"></div>
                    <div class="tree-node child2"></div>
                  </div>
                </div>
              </div>
              <span class="ent-tag amber">ISO 32000-1</span>
              <h3 class="ent-card-title">Page Labels &amp; Bookmarks</h3>
              <p class="ent-card-desc">ISO 32000-1 /PageLabels supporting Roman, Arabic, and alphabetic sections alongside a tree navigation outline editor.</p>
              <ul class="ent-feature-bullets">
                <li><span class="bullet-check amber">✓</span> Multi-Section Schemes</li>
                <li><span class="bullet-check amber">✓</span> Interactive Outline Hierarchy</li>
                <li><span class="bullet-check amber">✓</span> Standards Compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Tool Filter Rail Directory -->
      <section class="landing-tools-section" id="landing-tools-section">
        <div class="landing-tools-container">
          <div class="landing-tools-header">
            <span class="tools-tag-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>ALL PDF TOOLS</span>
            </span>
            <div class="landing-tools-heading-wrap">
              <h2 class="landing-tools-heading">Explore All PDF <span class="tools-theme-accent">Tools</span></h2>
              <p class="landing-tools-subheading">Choose a tool to launch immediately or open inside the interactive studio.</p>
            </div>
            <!-- Quick Search Bar with Instant In-Section Filtering -->
            <div class="tools-inline-search-wrap">
              <div class="tools-inline-search-box">
                <svg class="tools-inline-search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="tools-inline-search-input" class="tools-inline-search-input" placeholder="Search tools..." aria-label="Search all tools" autocomplete="off" />
                <kbd class="tools-inline-search-kbd">⌘K</kbd>
              </div>
            </div>
          </div>

          <div class="landing-filter-rail" id="landing-filter-rail">
            <button class="landing-filter-chip active" data-filter="all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>All Tools</span>
            </button>
            <button class="landing-filter-chip" data-filter="popular">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Most Popular</span>
            </button>
            <button class="landing-filter-chip" data-filter="merge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>Merge</span>
            </button>
            <button class="landing-filter-chip" data-filter="split">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
              <span>Split</span>
            </button>
            <button class="landing-filter-chip" data-filter="edit-sign">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Edit &amp; Sign</span>
            </button>
            <button class="landing-filter-chip" data-filter="compress-scans">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              <span>Compress &amp; Scans</span>
            </button>
            <button class="landing-filter-chip" data-filter="security">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Security &amp; Redact</span>
            </button>
            <button class="landing-filter-chip" data-filter="convert-from">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              <span>Convert from PDF</span>
            </button>
            <button class="landing-filter-chip" data-filter="convert-to">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="12" x2="12" y2="18"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              <span>Convert to PDF</span>
            </button>
            <button class="landing-filter-chip" data-filter="others">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v18M6 8l6-5 6 5M6 8l-3 7h6L6 8zm12 0l-3 7h6l-3-7z"></path></svg>
              <span>Legal &amp; Archival</span>
            </button>
            <button class="landing-filter-chip" data-filter="docs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>Docs &amp; Specs</span>
            </button>
          </div>

          <!-- Responsive Cards Grid -->
          <div class="landing-cards-grid" id="landing-cards-grid"></div>
        </div>
      </section>

      <!-- Security & Performance / Why Choose (Redesigned 3-Column Suite Showcase) -->
      <section class="landing-why-choose-section">
        <div class="why-choose-container">
          <!-- Section Header -->
          <div class="section-badge-header">
            <span class="section-tag-pill">SECURITY & PERFORMANCE</span>
            <h2 class="section-main-heading">The Safe, Fast, and Uncompromising <span class="suite-highlight">PDF Suite</span></h2>
            <p class="section-sub-heading">Built for legal professionals, enterprises, and everyday creators who demand 100% private in-browser speed with zero server uploads.</p>
          </div>

          <!-- 3-Column Flanked Grid -->
          <div class="why-flanked-layout">
            <!-- Left Features Column (01, 02, 03) -->
            <div class="why-col why-col-left">
              <!-- Feature 01 -->
              <div class="why-feat-row">
                <span class="why-num-label">01</span>
                <div class="why-feat-icon blue">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="why-feat-info">
                  <h3 class="why-feat-title">Zero Cloud Uploads &amp; Maximum Privacy</h3>
                  <p class="why-feat-desc">Your confidential contracts, financials, and medical records never leave your device. Processing runs entirely in your browser with zero server telemetry.</p>
                </div>
              </div>

              <!-- Feature 02 -->
              <div class="why-feat-row">
                <span class="why-num-label">02</span>
                <div class="why-feat-icon purple">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div class="why-feat-info">
                  <h3 class="why-feat-title">Blazing Fast WebAssembly Performance</h3>
                  <p class="why-feat-desc">Zero bandwidth lag, zero upload waiting, and no server timeouts. Split 500-page files or compress multi-gigabyte scans directly on your local hardware.</p>
                </div>
              </div>

              <!-- Feature 03 -->
              <div class="why-feat-row">
                <span class="why-num-label">03</span>
                <div class="why-feat-icon green">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div class="why-feat-info">
                  <h3 class="why-feat-title">Bates Numbering &amp; Form Flattening</h3>
                  <p class="why-feat-desc">Conform to legal discovery protocols with 8-digit zero-padded Bates sequencing, 6-zone layout alignment, and AcroForm vector flattening to lock finalized contracts.</p>
                </div>
              </div>
            </div>

            <!-- Center Interactive Studio Mockup Column -->
            <div class="why-col why-col-center">
              <!-- Subtle Connector Line Left -->
              <div class="connector-line-left" aria-hidden="true">
                <span class="connector-dot"></span>
              </div>
              <!-- Subtle Connector Line Right -->
              <div class="connector-line-right" aria-hidden="true">
                <span class="connector-dot"></span>
              </div>

              <!-- Studio Window Mockup -->
              <div class="why-center-window">
                <div class="why-window-header">
                  <div class="why-window-dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                  </div>
                  <div class="why-window-menu">
                    <span class="menu-pill">Edit <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span>
                    <span class="menu-icon">🔍</span>
                    <span class="menu-pill">100% <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  <div class="why-window-export">
                    <span>Export</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                <div class="why-window-body">
                  <!-- Left Thumbnails (3 Pages) -->
                  <div class="why-window-thumbs">
                    <div class="why-thumb-card active">
                      <div class="why-thumb-lines">
                        <div class="t-line"></div>
                        <div class="t-line"></div>
                        <div class="t-line"></div>
                      </div>
                      <span class="why-thumb-idx">1</span>
                    </div>
                    <div class="why-thumb-card">
                      <div class="why-thumb-lines">
                        <div class="t-line"></div>
                        <div class="t-line"></div>
                      </div>
                      <span class="why-thumb-idx">2</span>
                    </div>
                    <div class="why-thumb-card">
                      <div class="why-thumb-lines">
                        <div class="t-line"></div>
                        <div class="t-line"></div>
                      </div>
                      <span class="why-thumb-idx">3</span>
                    </div>
                  </div>

                  <!-- Center Document Page -->
                  <div class="why-window-canvas">
                    <div class="why-canvas-paper">
                      <h4 class="why-doc-title">Contract Agreement</h4>
                      <div class="why-doc-lines">
                        <div class="w-line full"></div>
                        <div class="w-line med"></div>
                      </div>
                      <!-- Selected bounding box with resize handles -->
                      <div class="why-selected-box">
                        <div class="why-sel-handle nw"></div>
                        <div class="why-sel-handle ne"></div>
                        <div class="why-sel-handle sw"></div>
                        <div class="why-sel-handle se"></div>
                        <div class="why-sel-fill"></div>
                      </div>
                      <div class="why-doc-lines">
                        <div class="w-line full"></div>
                        <div class="w-line med"></div>
                      </div>
                      <!-- Ink signature stroke -->
                      <div class="why-doc-signature">
                        <svg width="65" height="22" viewBox="0 0 100 35" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round">
                          <path d="M8 22 C 16 10, 24 26, 32 16 C 38 12, 44 24, 52 18 C 60 12, 66 22, 76 16 C 84 12, 90 22, 96 18"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Right Vertical Dock -->
                  <div class="why-window-dock">
                    <span class="w-dock-btn" title="Text">T</span>
                    <span class="w-dock-btn" title="Pen">✏</span>
                    <span class="w-dock-btn" title="Crop">▢</span>
                    <span class="w-dock-btn" title="Image">🖼</span>
                    <span class="w-dock-btn" title="Sign">✍</span>
                  </div>
                </div>
              </div>

              <!-- Beneath Window: Horizontal Micro-Trust Pillars Card -->
              <div class="why-trust-pill-bar">
                <div class="why-micro-pillar">
                  <div class="micro-pillar-icon blue">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div class="micro-pillar-text">
                    <strong>Private</strong>
                    <span>Stays on your device</span>
                  </div>
                </div>

                <div class="why-pillar-divider"></div>

                <div class="why-micro-pillar">
                  <div class="micro-pillar-icon blue">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <div class="micro-pillar-text">
                    <strong>Fast</strong>
                    <span>Powered by WebAssembly</span>
                  </div>
                </div>

                <div class="why-pillar-divider"></div>

                <div class="why-micro-pillar">
                  <div class="micro-pillar-icon green">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  </div>
                  <div class="micro-pillar-text">
                    <strong>Enterprise Ready</strong>
                    <span>Built for compliance</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Features Column (04, 05, 06) -->
            <div class="why-col why-col-right">
              <!-- Feature 04 -->
              <div class="why-feat-row">
                <span class="why-num-label">04</span>
                <div class="why-feat-icon orange">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div class="why-feat-info">
                  <h3 class="why-feat-title">True Text Editing In Your Browser</h3>
                  <p class="why-feat-desc">Correct typos and rewrite original paragraphs directly in your PDF. Our text engine matches font families, glyph weights, font sizes, and baseline alignments automatically.</p>
                </div>
              </div>

              <!-- Feature 05 -->
              <div class="why-feat-row">
                <span class="why-num-label">05</span>
                <div class="why-feat-icon red">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                </div>
                <div class="why-feat-info">
                  <h3 class="why-feat-title">Permanent Vector Redaction</h3>
                  <p class="why-feat-desc">True forensic sanitization: parses content streams and permanently deletes glyph tokens and underlying text matrices. Opaque redaction masks cannot be reversed.</p>
                </div>
              </div>

              <!-- Feature 06 -->
              <div class="why-feat-row">
                <span class="why-num-label">06</span>
                <div class="why-feat-icon sky">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
                </div>
                <div class="why-feat-info">
                  <h3 class="why-feat-title">Digital Signatures with Audit Trails</h3>
                  <p class="why-feat-desc">Sign documents electronically with tamper-evident SHA-256 verification, unique transaction UUIDs, timestamp certificates, and audit trails.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Redesigned Windows, Mac & Mobile Offline Apps Showcase (Image 2) -->
      <section class="landing-apps-section">
        <div class="apps-container">
          <div class="apps-banner">
            <div class="apps-content">
              <div class="apps-pill-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <span>WINDOWS, MAC & MOBILE</span>
              </div>
              <h2 class="apps-title">Work With PDFs Anywhere &mdash;<br><span class="apps-title-blue">Even Offline</span></h2>
              <p class="apps-desc">Install LetsEdit as a lightweight desktop application on Windows, macOS, or Linux, or use our mobile touch interface on iPhone and Android. Zero dependencies, 100% offline capability.</p>

              <div class="apps-feature-list">
                <div class="apps-feature-item">
                  <div class="apps-feat-icon blue">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </div>
                  <div class="apps-feat-content">
                    <strong class="apps-feat-heading">1-Click Desktop App</strong>
                    <span class="apps-feat-sub">Run native PWA with zero admin rights required</span>
                  </div>
                </div>

                <div class="apps-feature-item">
                  <div class="apps-feat-icon green">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                  </div>
                  <div class="apps-feat-content">
                    <strong class="apps-feat-heading">100% Offline Mode</strong>
                    <span class="apps-feat-sub">Edit, compress, merge, and sign without internet</span>
                  </div>
                </div>

                <div class="apps-feature-item">
                  <div class="apps-feat-icon purple">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  </div>
                  <div class="apps-feat-content">
                    <strong class="apps-feat-heading">Mobile Touch Ready</strong>
                    <span class="apps-feat-sub">Smooth signing, forms, and page organizing on mobile</span>
                  </div>
                </div>
              </div>

              <div class="apps-actions">
                <button class="btn apps-btn-dark" id="btn-install-desktop-app" title="Launch Windows desktop app">
                  <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
                  <span>Windows Desktop App</span>
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <button class="btn apps-btn-light" id="btn-open-web-app" title="Open Web Studio">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  <span>Launch Web Studio</span>
                </button>
              </div>
            </div>

            <div class="apps-preview-box">
              <!-- Ambient Ethereal Glow Mesh -->
              <div class="apps-glow-mesh"></div>

              <!-- 4-point Blue Sparkle Star (Reference matching) -->
              <div class="apps-sparkle-star" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z"/></svg>
              </div>

              <!-- Offline Ready Annotation Tag with Curved Arrow -->
              <div class="apps-offline-badge-callout">
                <span class="offline-callout-text">Offline Ready</span>
                <svg class="offline-wifi-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.56 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                <svg class="apps-curved-arrow" width="34" height="34" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 8 C 8 26, 26 28, 28 32 M 20 28 L 28 32 L 26 24" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>

              <div class="apps-devices-showcase">
                <!-- Floating Document Icon Badge -->
                <div class="floating-doc-badge" title="Local Client-Side Processing">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                </div>

                <!-- Laptop Mockup (MacBook Pro) -->
                <div class="laptop-mockup">
                  <div class="laptop-screen">
                    <div class="laptop-titlebar">
                      <div class="laptop-dots">
                        <span class="dot red"></span>
                        <span class="dot yellow"></span>
                        <span class="dot green"></span>
                      </div>
                      <div class="laptop-tools-bar">
                        <span class="mini-tool-icon">↶</span>
                        <span class="mini-tool-icon">↷</span>
                        <span class="mini-tool-divider"></span>
                        <span class="mini-tool-icon">🔍</span>
                        <span class="mini-tool-icon">⊡</span>
                      </div>
                      <div class="laptop-export-btn">Export</div>
                    </div>
                    <div class="laptop-workspace">
                      <!-- Left Page Thumbnails -->
                      <div class="laptop-thumbnails">
                        <div class="thumb-card active">
                          <div class="thumb-line title"></div>
                          <div class="thumb-line"></div>
                          <div class="thumb-line"></div>
                          <span class="thumb-num">1</span>
                        </div>
                        <div class="thumb-card">
                          <div class="thumb-line"></div>
                          <div class="thumb-line"></div>
                          <span class="thumb-num">2</span>
                        </div>
                      </div>
                      <!-- Center Canvas Document Page -->
                      <div class="laptop-canvas">
                        <div class="canvas-doc-page">
                          <div class="doc-header-text">Contract Agreement</div>
                          <div class="doc-paragraph-lines">
                            <div class="doc-line full"></div>
                            <div class="doc-line medium"></div>
                            <div class="doc-line short"></div>
                          </div>
                          <!-- Selected highlight box with 4 corner resize handles -->
                          <div class="doc-selected-box">
                            <div class="sel-handle nw"></div>
                            <div class="sel-handle ne"></div>
                            <div class="sel-handle sw"></div>
                            <div class="sel-handle se"></div>
                            <div class="sel-inner-fill"></div>
                          </div>
                          <div class="doc-paragraph-lines">
                            <div class="doc-line full"></div>
                            <div class="doc-line medium"></div>
                          </div>
                          <!-- Digital Ink Signature Stroke -->
                          <div class="doc-signature-line">
                            <svg class="sig-svg" width="70" height="24" viewBox="0 0 100 35">
                              <path d="M8 24 C 18 8, 26 28, 34 16 C 42 10, 46 25, 54 18 C 62 12, 68 22, 78 16 C 86 12, 92 22, 96 18" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <!-- Right Vertical Floating Tools Dock -->
                      <div class="laptop-right-dock">
                        <span class="dock-btn">T</span>
                        <span class="dock-btn">✏</span>
                        <span class="dock-btn">▢</span>
                        <span class="dock-btn">🖼</span>
                        <span class="dock-btn">···</span>
                      </div>
                    </div>
                  </div>
                  <div class="laptop-base"></div>
                </div>

                <!-- Overlapping iPhone Mockup with Dynamic Island -->
                <div class="phone-mockup">
                  <div class="phone-island"></div>
                  <div class="phone-screen">
                    <div class="phone-header">
                      <span class="phone-back">&lsaquo;</span>
                      <span class="phone-title">Edit PDF</span>
                    </div>
                    <div class="phone-doc">
                      <div class="p-line title"></div>
                      <div class="p-line"></div>
                      <div class="p-line"></div>
                      <div class="phone-selected-box"></div>
                      <div class="p-line"></div>
                      <div class="p-line"></div>
                    </div>
                    <div class="phone-dock">
                      <span class="p-dock-item">T<small>Text</small></span>
                      <span class="p-dock-item">✏<small>Draw</small></span>
                      <span class="p-dock-item">🖼<small>Image</small></span>
                      <span class="p-dock-item">✍<small>Sign</small></span>
                      <span class="p-dock-item">···<small>More</small></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Platform Compatibility Bar (Directly beneath devices) -->
              <div class="apps-platforms-bar">
                <div class="platform-chip">
                  <svg width="15" height="15" fill="#0078d4" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
                  <span>Windows 11/10</span>
                </div>
                <div class="platform-chip">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.06-1.82.94-2.87-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.75-.95 2.8 1.02.08 2.05-.54 2.68-1.3"/></svg>
                  <span>macOS Sonoma</span>
                </div>
                <div class="platform-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#f59e0b" d="M12 2C8.5 2 6 5 6 9c0 3 1.5 5.5 1 8-.5 2.5-2 3-2 3h14s-1.5-.5-2-3c-.5-2.5 1-5 1-8 0-4-2.5-7-6-7z"/><circle cx="10" cy="8" r="1.2" fill="#000"/><circle cx="14" cy="8" r="1.2" fill="#000"/><polygon points="12 10 10 12 14 12" fill="#ea580c"/><ellipse cx="12" cy="15" rx="3.5" ry="4" fill="#ffffff"/></svg>
                  <span>Linux</span>
                </div>
                <div class="platform-chip">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  <span>iOS & Android</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Redesigned Elite FAQ 2-Column Section (Image 1) -->
      <section class="landing-faq-section">
        <div class="faq-container">
          <div class="faq-section-header">
            <span class="faq-pill-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>HELP & KNOWLEDGE BASE</span>
            </span>
            <h2 class="faq-hero-title">Frequently Asked Questions</h2>
            <p class="faq-hero-subtitle">Everything you need to know about our browser-native WebAssembly PDF suite.</p>
          </div>

          <div class="faq-two-col-grid">
            <!-- Left Help & Support Card -->
            <div class="faq-help-card">
              <span class="help-eyebrow">HAVE A QUESTION?</span>
              <h3 class="help-title">We've got you covered.</h3>
              <p class="help-desc">Find answers to common questions about features, privacy, offline usage, and more. Still can't find what you're looking for? Our docs and support are just a click away.</p>

              <div class="help-btns-row">
                <a href="/docs" data-route="/docs" class="help-btn-dark" id="btn-faq-browse-docs">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <span>Browse Documentation</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
                <button type="button" class="help-btn-outline" data-legal="terms">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span>Contact Support</span>
                </button>
              </div>

              <!-- Illustrated Diagram Card -->
              <div class="help-diagram-card">
                <div class="diagram-canvas-wrap">
                  <!-- Mini Tool Dock -->
                  <div class="diagram-tool-dock">
                    <span class="d-tool">T</span>
                    <span class="d-tool">✏</span>
                    <span class="d-tool">▢</span>
                    <span class="d-tool">🖼</span>
                  </div>

                  <!-- Document Mockup Sheet -->
                  <div class="diagram-doc-sheet">
                    <div class="d-doc-badge">PDF</div>
                    <div class="d-doc-lines">
                      <div class="d-line"></div>
                      <div class="d-line"></div>
                    </div>
                    <div class="d-selected-rect">
                      <div class="d-sel-corner nw"></div>
                      <div class="d-sel-corner ne"></div>
                      <div class="d-sel-corner sw"></div>
                      <div class="d-sel-corner se"></div>
                      <div class="d-sel-fill"></div>
                      <svg class="d-cursor-pointer" width="16" height="16" viewBox="0 0 24 24" fill="#0f172a" stroke="#ffffff" stroke-width="1.5"><polygon points="3 3 10 21 13 14 20 11 3 3"></polygon></svg>
                    </div>
                    <div class="d-sig-line">
                      <svg width="50" height="20" viewBox="0 0 100 40">
                        <path d="M10 25 Q35 5, 50 22 T80 15 T95 28" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Connected Feature Pills -->
                  <div class="diagram-pills-col">
                    <div class="d-feature-pill">
                      <div class="d-pill-icon blue">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                      <div class="d-pill-text">
                        <strong>100% Private</strong>
                        <span>All processing happens on your device</span>
                      </div>
                    </div>

                    <div class="d-feature-pill">
                      <div class="d-pill-icon orange">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                      </div>
                      <div class="d-pill-text">
                        <strong>Works Offline</strong>
                        <span>No internet required</span>
                      </div>
                    </div>

                    <div class="d-feature-pill">
                      <div class="d-pill-icon green">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      </div>
                      <div class="d-pill-text">
                        <strong>Enterprise Ready</strong>
                        <span>Built for compliance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Numbered Accordion (01 to 08) -->
            <div class="faq-accordion-col">
              <details class="faq-card-item" open>
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">01</div>
                  <span class="faq-question-text">Is LetsEdit really 100% free with no hidden fees or daily limits?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>Yes. LetsEdit is completely free to use with no hidden fees, no registration required, and no daily limits. All processing happens locally in your browser using WebAssembly, so your files never leave your device. You can use all core features &mdash; editing, converting, signing, and more &mdash; without any paid plan.</p>
                </div>
              </details>

              <details class="faq-card-item">
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">02</div>
                  <span class="faq-question-text">How does 100% client-side WebAssembly protect my confidential files?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>When you open a PDF in LetsEdit, the document data is loaded directly into your browser's private memory sandbox via WebAssembly (WASM). At no point are your bytes uploaded to external servers, cloud databases, or third-party APIs. Your sensitive documents, financial reports, and legal contracts remain strictly on your physical machine.</p>
                </div>
              </details>

              <details class="faq-card-item">
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">03</div>
                  <span class="faq-question-text">How is Permanent Vector Redaction different from drawing black rectangles?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>Traditional editors often place a black graphic rectangle over text, leaving the underlying text stream readable to anyone who copies or extracts PDF text. LetsEdit's True Redaction engine parses the PDF binary syntax, permanently removes the underlying font glyphs and character operators from the content stream, and recompresses the page so sensitive information cannot be recovered.</p>
                </div>
              </details>

              <details class="faq-card-item">
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">04</div>
                  <span class="faq-question-text">Can I use LetsEdit offline without an internet connection?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>Absolutely. LetsEdit is built as a Progressive Web Application (PWA) with fully offline Service Workers. Once cached on your machine, you can launch LetsEdit, edit documents, sign contracts, and convert files on airplanes, remote locations, or secure air-gapped environments without any Wi-Fi or cellular network.</p>
                </div>
              </details>

              <details class="faq-card-item">
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">05</div>
                  <span class="faq-question-text">Does LetsEdit support legal discovery and Bates Numbering standards?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>Yes. Our Bates Stamping suite complies with federal and judicial e-discovery rules (FRCP). You can configure alphanumeric prefixes, custom suffixes, zero-padded serial increments (e.g., PROD-000001), 6-zone layout placements, and cryptographic indexing manifests.</p>
                </div>
              </details>

              <details class="faq-card-item">
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">06</div>
                  <span class="faq-question-text">Are digital signatures created on LetsEdit legally binding?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>Yes. LetsEdit creates electronic signatures compliant with the US ESIGN Act, UETA, and EU eIDAS (Regulation 910/2014). Each signed document generates a tamper-evident audit trail with SHA-256 cryptographic fingerprints, timestamps, and optional X.509 digital certificates.</p>
                </div>
              </details>

              <details class="faq-card-item">
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">07</div>
                  <span class="faq-question-text">Can I edit original PDF text directly instead of just adding text over it?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>Yes. LetsEdit features an advanced font clustering engine that detects embedded font matrices, baseline heights, and word gaps. You can click into existing paragraph blocks, replace or delete original characters, and typeset new text using matching standard fonts.</p>
                </div>
              </details>

              <details class="faq-card-item">
                <summary class="faq-card-trigger">
                  <div class="faq-num-badge">08</div>
                  <span class="faq-question-text">What file formats does LetsEdit support for conversion?</span>
                  <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-card-content">
                  <p>LetsEdit supports bidirectional conversions between PDF and Microsoft Word (.docx), Excel (.xlsx / .csv), PowerPoint (.pptx), high-resolution images (JPG, PNG, WebP), Markdown, and clean HTML5 web documents &mdash; all processed locally via WebAssembly.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

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
