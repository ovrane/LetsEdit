/**
 * Landing Hero Section Component
 * Strict Constraint: No file dropzone on the landing page hero.
 */

import { getPopularToolsHtml } from './landing-popular.js';

export function getLandingHeroHtml() {
  return `
    <!-- Hero Section (Clean Smallpdf-Style 2-Column Hero) -->
    <section class="landing-hero-section">
      <div class="landing-hero-container">
        <div class="landing-hero-grid">
          <!-- Left Column: Copy & Actions -->
          <div class="landing-hero-left">
            <h1 class="landing-hero-title">Work on your <span style="color: var(--primary);">PDF</span><br>With Ease</h1>
            <p class="landing-hero-subtitle">Powerful PDF &amp; Office tools to simplify your workflow convert Word, Excel &amp; PPTX, OCR scanned pages, compare diffs, and sign with zero cloud upload.</p>
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
  `;
}
