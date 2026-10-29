/**
 * Landing Apps & FAQ Component
 * Windows/Mac/Mobile showcase and 2-column FAQ accordion.
 */

export function getLandingAppsFaqHtml() {
  return `
    <!-- Redesigned Windows, Mac & Mobile Offline Apps Showcase -->
    <section class="landing-apps-section" id="landing-apps-section">
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

            <!-- 4-point Blue Sparkle Star -->
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

    <!-- Redesigned Elite FAQ 2-Column Section -->
    <section class="landing-faq-section" id="landing-faq-section">
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
  `;
}
