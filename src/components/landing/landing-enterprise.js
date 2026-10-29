/**
 * Landing Enterprise Showcase Component
 * Showcases permanent redaction, form flattening, bates numbering, document sanitization, and page labels.
 */

export function getLandingEnterpriseHtml() {
  return `
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
  `;
}
