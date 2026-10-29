/**
 * Desktop & Mobile Offline Apps Showcase Component
 */

export function getLandingAppsHtml() {
  return `
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
  `;
}
