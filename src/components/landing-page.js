/**
 * Landing Home Page Component
 * High-converting, SEO-optimized landing page styled after iLovePDF and Sejda PDF.
 * Features a direct drag-and-drop hero, category filter chips, and a 34+ tool card grid.
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { TOOLS_CATALOG, allToolsModal } from './all-tools-modal.js';
import { Toast } from './toast.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { applyTheme, toggleTheme, getPreferredTheme } from '../utils/theme.js';

export class LandingPage {
  constructor() {
    this.container = null;
    this.activeFilter = 'all';
    this.onOpenStudioCallback = null;
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  setOpenStudioCallback(cb) {
    this.onOpenStudioCallback = cb;
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'landing-view';
    this.container.className = 'landing-view-container';

    this.container.innerHTML = `
      <!-- Landing Header / Top Navigation -->
      <header class="landing-header">
        <div class="landing-nav-inner">
          <div class="landing-brand" id="landing-brand-logo">
            <div class="brand-badge-square">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <span class="brand-text">Lets<span class="brand-highlight">Edit</span></span>
          </div>

          <!-- Desktop Quick Links (iLovePDF Style) -->
          <nav class="landing-desktop-nav">
            <button class="landing-nav-link" data-tool="merge">Merge PDF</button>
            <button class="landing-nav-link" data-tool="split">Split PDF</button>
            <button class="landing-nav-link" data-tool="compress">Compress PDF</button>

            <!-- Convert Dropdown -->
            <div class="landing-dropdown">
              <button class="landing-nav-link dropdown-toggle">
                <span>Convert PDF</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </button>
              <div class="landing-dropdown-menu">
                <button class="landing-dropdown-item" data-action="action:images-to-pdf">
                  <span class="dropdown-item-title">Images to PDF</span>
                  <span class="dropdown-item-desc">Convert JPG/PNG to PDF</span>
                </button>
                <button class="landing-dropdown-item" data-action="modal:to-image">
                  <span class="dropdown-item-title">PDF to JPG / PNG</span>
                  <span class="dropdown-item-desc">Extract pages as images</span>
                </button>
                <button class="landing-dropdown-item" data-action="action:extract-text">
                  <span class="dropdown-item-title">PDF to Text</span>
                  <span class="dropdown-item-desc">Extract plain text</span>
                </button>
                <button class="landing-dropdown-item" data-action="modal:extract-images">
                  <span class="dropdown-item-title">Extract Images</span>
                  <span class="dropdown-item-desc">Extract embedded JPEG/PNGs</span>
                </button>
                <button class="landing-dropdown-item" data-action="modal:pdfa">
                  <span class="dropdown-item-title">PDF to PDF/A</span>
                  <span class="dropdown-item-desc">ISO 19005-1 compliance</span>
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
                    <button class="mega-item" data-action="modal:split">Let's Split Pages</button>
                    <button class="mega-item" data-action="sidebar:merge">Let's Merge PDF</button>
                    <button class="mega-item" data-action="sidebar:delete">Let's Delete Pages</button>
                    <button class="mega-item" data-action="sidebar:open">Let's Organize Pages</button>
                    <button class="mega-item" data-action="modal:split-half">Let's Split in Half</button>
                    <button class="mega-item" data-action="modal:alternate-mix">Let's Alternate & Mix</button>
                    <button class="mega-item" data-action="modal:nup">Let's N-Up Imposition</button>
                    <button class="mega-item" data-action="modal:flip">Let's Flip Pages</button>
                    <button class="mega-item" data-action="modal:crop">Let's Crop Margins</button>
                    <button class="mega-item" data-action="modal:resize">Let's Resize Margins</button>
                  </div>

                  <div class="mega-column">
                    <div class="mega-col-title">EDIT & SIGN</div>
                    <button class="mega-item" data-action="tool:select">Let's Edit PDF</button>
                    <button class="mega-item" data-action="tool:text">Let's Add & Edit Text</button>
                    <button class="mega-item" data-action="tool:sign">Let's Fill & Sign</button>
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
                    <button class="mega-item" data-action="modal:compress">Let's Compress PDF</button>
                    <button class="mega-item" data-action="modal:ocr">Let's OCR PDF</button>
                    <button class="mega-item" data-action="modal:compare">Let's Compare PDF</button>
                    <button class="mega-item" data-action="modal:repair">Let's Repair PDF</button>
                    <button class="mega-item" data-action="modal:security">Let's Protect & Encrypt</button>
                    <button class="mega-item" data-action="modal:watermark">Let's Watermark PDF</button>
                    <button class="mega-item" data-action="modal:grayscale">Let's Grayscale PDF</button>
                    <button class="mega-item" data-action="modal:pagenumbers">Let's Number Pages</button>
                    <button class="mega-item" data-action="modal:bates">Let's Bates Number</button>
                    <button class="mega-item" data-action="modal:metadata">Let's Edit Metadata</button>
                    <button class="mega-item" data-action="action:flatten">Let's Flatten Forms</button>
                  </div>

                  <div class="mega-column">
                    <div class="mega-col-title">CONVERT</div>
                    <button class="mega-item" data-action="modal:to-image">Let's Convert to JPG</button>
                    <button class="mega-item" data-action="modal:extract-images">Let's Extract Images</button>
                    <button class="mega-item" data-action="modal:pdfa">Let's PDF to PDF/A</button>
                    <button class="mega-item" data-action="action:images-to-pdf">Let's Images to PDF</button>
                    <button class="mega-item" data-action="action:extract-text">Let's Extract Text</button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <!-- Right Header CTAs -->
          <div class="landing-header-right">
            <button class="icon-btn" id="btn-landing-theme" title="Toggle Light / Dark Mode">
              <svg id="landing-theme-sun" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:none;"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
              <svg id="landing-theme-moon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
            </button>
            <button class="btn btn-primary" id="btn-enter-studio">Open Editor Studio</button>
          </div>
        </div>
      </header>

      <!-- Main Landing Content (Scrollable) -->
      <main class="landing-main-content">
        <!-- Hero Section (iLovePDF Style Headline & Dropzone) -->
        <section class="landing-hero-section">
          <div class="landing-hero-container">
            <div class="hero-badge-pill">
              <span class="badge-dot"></span>
              <span>100% Free, Private & Client-Side • Zero Cloud Uploads</span>
            </div>

            <h1 class="landing-hero-title">LetsEdit: Every tool you need to work with PDFs in one place</h1>
            <p class="landing-hero-subtitle">
              Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock, and watermark PDFs with just a few clicks.
            </p>

            <!-- Interactive Dropzone Hero -->
            <div class="hero-dropzone-card" id="landing-dropzone">
              <input type="file" id="landing-file-input" accept="application/pdf" style="display:none;" />
              <div class="dropzone-icon-circle">
                <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
              </div>
              <button class="btn btn-primary btn-lg dropzone-cta-btn" id="btn-select-file">
                Select PDF file
              </button>
              <div class="dropzone-subtext">or drop PDF here</div>
              <div class="dropzone-footer-actions">
                <button class="dropzone-sample-btn" id="btn-sample-pdf">Or edit sample document →</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Tool Filter Rail (iLovePDF Filter Pills) -->
        <section class="landing-tools-section">
          <div class="landing-tools-container">
            <div class="landing-filter-rail" id="landing-filter-rail">
              <button class="landing-filter-chip active" data-filter="all">All</button>
              <button class="landing-filter-chip" data-filter="popular">🔥 Popular</button>
              <button class="landing-filter-chip" data-filter="pages">Organize PDF</button>
              <button class="landing-filter-chip" data-filter="tools">Optimize PDF</button>
              <button class="landing-filter-chip" data-filter="edit">Edit PDF</button>
              <button class="landing-filter-chip" data-filter="security">PDF Security</button>
              <button class="landing-filter-chip" data-filter="convert">Convert PDF</button>
            </div>

            <!-- Responsive Cards Grid (34+ Tools matching reference images 1 & 2) -->
            <div class="landing-cards-grid" id="landing-cards-grid"></div>
          </div>
        </section>

        <!-- Feature Trust Badges Section -->
        <section class="landing-features-section">
          <div class="features-inner">
            <div class="feature-item">
              <div class="feature-icon" style="background: rgba(37,99,235,0.1); color: #2563eb;">
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
              <div class="brand-text">Lets<span class="brand-highlight">Edit</span></div>
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

    document.body.prepend(this.container);
    this.bindEvents();
    this.renderCards();
  }

  getTwoToneIconSvg(id, color) {
    // Generate clean, modern two-tone SVG iconography matching iLovePDF reference
    const iconSvgs = {
      merge: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg>`,
      split: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 3h5v5M8 3H3v5M12 22V2"></path></svg>`,
      compress: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"></path></svg>`,
      edit: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
      sign: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 17l6-6 4 4 8-8"></path><path d="M14 7h7v7"></path></svg>`,
      delete: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
      crop: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>`,
      'to-image': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
      organize: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
      'split-half': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
      'alternate-mix': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line></svg>`,
      nup: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line><line x1="12" y1="3" x2="12" y2="21"></line></svg>`,
      flip: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M12 4v16"></path></svg>`,
      resize: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>`,
      rotate: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>`,
      text: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`,
      draw: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`,
      highlight: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2l4 4L7 17H3v-4L14 2z"></path><path d="M3 22h18"></path></svg>`,
      eraser: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13l-7-7L3 14l7 7 8-8z"></path><line x1="14" y1="22" x2="22" y2="22"></line></svg>`,
      whiteout: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`,
      shapes: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 22 22 22"></polygon></svg>`,
      forms: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
      stamps: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 22h14"></path><path d="M12 2v10"></path><path d="M8 7l4-5 4 5"></path><rect x="5" y="16" width="14" height="6" rx="2"></rect></svg>`,
      'search-replace': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
      security: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
      watermark: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
      pagenumbers: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`,
      bates: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      metadata: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
      grayscale: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"></path></svg>`,
      flatten: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
      'images-to-pdf': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
      'pdf-to-text': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>`
    };

    return iconSvgs[id] || iconSvgs.edit;
  }

  renderCards() {
    const grid = this.container.querySelector('#landing-cards-grid');
    if (!grid) return;

    const filtered = TOOLS_CATALOG.filter(tool => {
      if (this.activeFilter === 'all') return true;
      if (this.activeFilter === 'popular') return tool.popular;
      return tool.category === this.activeFilter;
    });

    grid.innerHTML = filtered.map(tool => `
      <div class="landing-tool-card" data-action="${tool.action}" data-tool-id="${tool.id}">
        <div class="card-icon-badge" style="background: ${tool.color}15; color: ${tool.color};">
          ${this.getTwoToneIconSvg(tool.id, tool.color)}
        </div>
        <h3 class="card-title">${tool.title}</h3>
        <p class="card-desc">${tool.desc}</p>
      </div>
    `).join('');

    // Attach card click handlers
    grid.querySelectorAll('.landing-tool-card').forEach(card => {
      card.onclick = () => {
        const action = card.getAttribute('data-action');
        this.handleToolAction(action);
      };
    });
  }

  handleToolAction(action) {
    // Switch to studio mode and trigger target action
    this.switchToStudio();
    setTimeout(() => {
      allToolsModal.dispatchToolAction(action);
    }, 150);
  }

  bindEvents() {
    const fileInput = this.container.querySelector('#landing-file-input');
    const selectBtn = this.container.querySelector('#btn-select-file');
    const dropzone = this.container.querySelector('#landing-dropzone');
    const sampleBtn = this.container.querySelector('#btn-sample-pdf');
    const enterStudioBtn = this.container.querySelector('#btn-enter-studio');

    // Select file button
    selectBtn.onclick = () => fileInput.click();

    // File input change
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        await this.loadSelectedFile(file);
      }
      fileInput.value = '';
    };

    // Drag-and-drop on hero dropzone
    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    };
    dropzone.ondragleave = () => {
      dropzone.classList.remove('drag-over');
    };
    dropzone.ondrop = async (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        await this.loadSelectedFile(file);
      } else {
        Toast.error('Please drop a valid PDF document');
      }
    };

    // Edit Sample Document button
    sampleBtn.onclick = () => {
      this.switchToStudio();
      Toast.info('Editing sample document');
    };

    // Open Studio button in header
    enterStudioBtn.onclick = () => {
      this.switchToStudio();
    };

    // Filter Chips
    const chips = this.container.querySelectorAll('.landing-filter-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.getAttribute('data-filter');
        this.renderCards();
      };
    });

    // Theme toggle on landing header
    const themeBtn = this.container.querySelector('#btn-landing-theme');
    applyTheme(getPreferredTheme());

    if (themeBtn) {
      themeBtn.onclick = () => {
        const nextTheme = toggleTheme();
        Toast.info(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} theme`);
      };
    }

    // Navbar quick links
    this.container.querySelectorAll('.landing-nav-link[data-tool]').forEach(btn => {
      btn.onclick = () => {
        const tool = btn.getAttribute('data-tool');
        this.switchToStudio();
        setTimeout(() => {
          if (tool === 'merge') allToolsModal.dispatchToolAction('sidebar:merge');
          else if (tool === 'split') allToolsModal.dispatchToolAction('modal:split');
          else if (tool === 'compress') allToolsModal.dispatchToolAction('modal:compress');
        }, 150);
      };
    });

    // Mega menu dropdown action items
    this.container.querySelectorAll('.mega-item, .landing-dropdown-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        if (action) this.handleToolAction(action);
      };
    });

    // Footer links
    this.container.querySelectorAll('.footer-links a[data-tool]').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const tool = link.getAttribute('data-tool');
        const match = TOOLS_CATALOG.find(t => t.id === tool);
        if (match) this.handleToolAction(match.action);
        else this.switchToStudio();
      };
    });
  }

  async loadSelectedFile(file) {
    try {
      Toast.info('Loading PDF into Studio...');
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const info = await pdfEngine.loadPdf(arrayBuffer);
      store.setDocument(arrayBuffer, file.name, info.numPages);
      const filenameEl = document.getElementById('current-filename');
      if (filenameEl) filenameEl.textContent = file.name;
      this.switchToStudio();
      Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
    } catch (err) {
      console.error(err);
      Toast.error('Failed to open PDF document');
    }
  }

  switchToStudio() {
    document.body.classList.remove('show-landing');
    document.body.classList.add('show-studio');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (this.onOpenStudioCallback) {
      this.onOpenStudioCallback();
    }
  }

  switchToLanding() {
    document.body.classList.remove('show-studio');
    document.body.classList.add('show-landing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export const landingPage = new LandingPage();
