/**
 * Why Choose LetsEdit Showcase (3-Column Flanked Grid)
 */

export function getLandingWhyChooseHtml() {
  return `
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
  `;
}
