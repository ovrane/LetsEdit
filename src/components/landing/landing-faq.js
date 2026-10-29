/**
 * Landing FAQ Accordion Component
 */

export function getLandingFaqHtml() {
  return `
    <!-- FAQ Section (2-Column Grid Matching Screenshot Design) -->
    <section class="landing-faq-section" id="faq-section">
      <div class="faq-container">
        <!-- Section Header with Blue Pill Badge -->
        <div class="faq-header-wrap">
          <div class="faq-pill-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 class="faq-main-heading">Frequently Asked <span class="faq-theme-accent">Questions</span></h2>
          <p class="faq-sub-heading">Everything you need to know about our privacy architecture, performance engine, and legal compliance.</p>
        </div>

        <!-- 2-Column Responsive FAQ Grid -->
        <div class="faq-two-column-grid">
          <!-- Left Column (Items 01 - 04) -->
          <div class="faq-grid-col">
            <details class="faq-card-item" open>
              <summary class="faq-card-trigger">
                <div class="faq-num-badge">01</div>
                <span class="faq-question-text">Is LetsEdit truly 100% free with no file size limits or paywalls?</span>
                <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="faq-card-content">
                <p>Yes. LetsEdit is completely free for all 50+ PDF tools. Because all document operations execute client-side inside your browser via WebAssembly, we don't have costly server conversion clusters to maintain. You can edit, merge, sign, and compress as many files as you want with no artificial paywalls or watermarks.</p>
              </div>
            </details>

            <details class="faq-card-item">
              <summary class="faq-card-trigger">
                <div class="faq-num-badge">02</div>
                <span class="faq-question-text">Are my files and sensitive documents safe and private?</span>
                <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="faq-card-content">
                <p>Your documents never leave your computer. Unlike traditional online PDF services that upload your confidential files to remote cloud servers, LetsEdit executes all manipulations locally in your browser memory using PDF.js and pdf-lib WebAssembly. No data is stored, cached, or transmitted to any server.</p>
              </div>
            </details>

            <details class="faq-card-item">
              <summary class="faq-card-trigger">
                <div class="faq-num-badge">03</div>
                <span class="faq-question-text">How does client-side redaction permanently delete hidden data?</span>
                <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="faq-card-content">
                <p>Unlike basic tools that merely draw a black rectangle over sensitive text (leaving underlying characters easily copyable), our redaction engine parses the low-level PDF content stream tokens. It computes the exact glyph bounding boxes, permanently purges the glyph tokens from the stream, and draws an opaque vector fill, rendering recovery impossible.</p>
              </div>
            </details>

            <details class="faq-card-item">
              <summary class="faq-card-trigger">
                <div class="faq-num-badge">04</div>
                <span class="faq-question-text">Can I use LetsEdit offline without an active internet connection?</span>
                <svg class="faq-toggle-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="faq-card-content">
                <p>Absolutely. LetsEdit is built as a Progressive Web Application (PWA) with fully offline Service Workers. Once cached on your machine, you can launch LetsEdit, edit documents, sign contracts, and convert files on airplanes, remote locations, or secure air-gapped environments without any Wi-Fi or cellular network.</p>
              </div>
            </details>
          </div>

          <!-- Right Column (Items 05 - 08) -->
          <div class="faq-grid-col">
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
