/**
 * Legal & Compliance Modal Component
 * Displays production-ready Privacy Policy, Terms of Service, and Security Whitepaper.
 * Features tabs for fast switching, zero-cloud privacy architecture guarantees, and e-sign compliance.
 */

export class LegalModal {
  constructor() {
    this.modal = null;
    this.activeTab = 'privacy'; // 'privacy' | 'terms' | 'security'
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop legal-modal-backdrop';
    this.modal.id = 'legal-modal';
    this.modal.style.display = 'none';

    this.render();
    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  open(tab = 'privacy') {
    this.activeTab = tab;
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    this.render();
    this.bindEvents();
    if (this.modal) {
      this.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  render() {
    if (!this.modal) return;

    this.modal.innerHTML = `
      <div class="modal-dialog legal-dialog">
        <div class="modal-header legal-modal-header">
          <div class="legal-header-title-wrap">
            <div class="lets-logo-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
                <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
                <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
                <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
              </svg>
            </div>
            <div>
              <h3 class="legal-modal-title">Legal & Security Documentation</h3>
              <p class="legal-modal-subtitle">Official policy governing LetsEdit client-side document processing</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-legal">&times;</button>
        </div>

        <div class="legal-tabs-bar">
          <button class="legal-tab-btn ${this.activeTab === 'privacy' ? 'active' : ''}" data-legal-tab="privacy">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Privacy Policy</span>
          </button>
          <button class="legal-tab-btn ${this.activeTab === 'terms' ? 'active' : ''}" data-legal-tab="terms">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
            <span>Terms of Service</span>
          </button>
          <button class="legal-tab-btn ${this.activeTab === 'security' ? 'active' : ''}" data-legal-tab="security">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <span>Security & Compliance</span>
          </button>
        </div>

        <div class="legal-modal-body">
          ${this.renderActiveTabContent()}
        </div>

        <div class="legal-modal-footer">
          <span class="legal-footer-note">Last Updated: October 2026 &bull; Version 2.4</span>
          <button class="btn btn-primary btn-sm" id="btn-legal-accept">I Understand &amp; Close</button>
        </div>
      </div>
    `;
  }

  renderActiveTabContent() {
    if (this.activeTab === 'terms') {
      return `
        <article class="legal-article">
          <h2>Terms of Service</h2>
          <p class="legal-lead">Please read these Terms of Service carefully before utilizing the LetsEdit online document manipulation suite.</p>

          <section>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using LetsEdit ("the Service"), you agree to be bound by these Terms. The Service is provided free of charge for both personal and commercial use without requiring registration.</p>
          </section>

          <section>
            <h3>2. User Content &amp; Intellectual Property</h3>
            <p><strong>You retain 100% full ownership, copyright, and intellectual property rights to all documents, images, and files you open with LetsEdit.</strong></p>
            <p>Because all file operations execute strictly in your local browser sandbox through WebAssembly, LetsEdit never acquires any license, copyright, or possession over your content.</p>
          </section>

          <section>
            <h3>3. Electronic Signatures Legality</h3>
            <p>LetsEdit e-sign signatures and certificates conform to standard digital signature statutory frameworks including:</p>
            <ul>
              <li><strong>United States:</strong> Electronic Signatures in Global and National Commerce Act (E-SIGN, 15 U.S.C. § 7001) and Uniform Electronic Transactions Act (UETA).</li>
              <li><strong>European Union:</strong> Electronic Identification and Trust Services Regulation (eIDAS, Regulation (EU) No 910/2014) for Simple Electronic Signatures (SES) and Advanced Audit Trail Records.</li>
            </ul>
            <p>Each signed document generates a SHA-256 cryptographic audit record verifying integrity, timestamp, transaction ID, and participant metadata.</p>
          </section>

          <section>
            <h3>4. Acceptable Use</h3>
            <p>You agree not to use LetsEdit to forge documents, infringe upon copyright or intellectual property, or circulate illicit materials. Because processing is local, you are solely responsible for compliance with applicable local laws.</p>
          </section>

          <section>
            <h3>5. Disclaimer of Warranty &amp; Limitation of Liability</h3>
            <p>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. To the maximum extent permitted by applicable law, LetsEdit shall not be liable for any indirect, incidental, or consequential damages resulting from document modification or corruption.</p>
          </section>
        </article>
      `;
    }

    if (this.activeTab === 'security') {
      return `
        <article class="legal-article">
          <h2>Security &amp; Architectural Whitepaper</h2>
          <p class="legal-lead">An engineering overview of LetsEdit's zero-cloud, client-side WebAssembly execution model.</p>

          <section class="security-callout-box">
            <div class="callout-badge">SECURITY FIRST</div>
            <h4>Pure Client-Side Sandboxing</h4>
            <p>Unlike conventional web PDF suites that upload multi-gigabyte client documents to remote cloud worker servers, LetsEdit executes the entire PDF processing pipeline directly in your browser's V8 WebAssembly virtual machine.</p>
          </section>

          <section>
            <h3>1. Cryptographic File Integrity</h3>
            <p>When you edit, sign, or sanitize documents, cryptographic digests are generated locally:</p>
            <ul>
              <li><strong>Algorithm:</strong> Web Cryptography API (SubtleCrypto) SHA-256 (FIPS 180-4 standard).</li>
              <li><strong>Tamper Detection:</strong> Any subsequent bit alteration after export invalidates the certificate hash.</li>
            </ul>
          </section>

          <section>
            <h3>2. Permanent Forensic Vector Redaction</h3>
            <p>When redacting documents using LetsEdit:</p>
            <ul>
              <li>Black boxes are not simple graphical overlays; content stream tokens, glyph matrices, and metadata strings within the bounding coordinates are forensically severed from the PDF stream dictionary.</li>
              <li>Underlying text cannot be recovered via copy-pasting, script extraction, or layer peeling.</li>
            </ul>
          </section>

          <section>
            <h3>3. ISO 32000-1 / PDF/A Compliance</h3>
            <p>Exports generated by LetsEdit adhere to the ISO 32000-1 specification and ISO 19005 (PDF/A archiving standards), ensuring long-term rendering fidelity across all compliant desktop readers (Adobe Acrobat, Apple Preview, PDFium, Chrome, Foxit).</p>
          </section>

          <section>
            <h3>4. Transport &amp; Storage Security</h3>
            <p>All network communications (including PWA asset updates and Firebase Authentication tokens) are strictly enforced over TLS 1.3 with HSTS (HTTP Strict Transport Security) and Content Security Policy (CSP) headers.</p>
          </section>
        </article>
      `;
    }

    // Default: Privacy Policy
    return `
      <article class="legal-article">
        <h2>Privacy Policy</h2>
        <p class="legal-lead">Your documents never leave your computer. LetsEdit was engineered from day one on a zero-knowledge, zero-cloud architecture.</p>

        <section class="privacy-guarantee-card">
          <div class="guarantee-header">
            <svg width="20" height="20" fill="none" stroke="#10b981" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <strong>The LetsEdit Zero-Cloud Guarantee</strong>
          </div>
          <p>We do not store, copy, inspect, or transfer your PDF files. When you drop or open a document, it is read into your device's browser memory (RAM) via JavaScript FileReader and WebAssembly. When you close the browser tab, the document memory is wiped completely.</p>
        </section>

        <section>
          <h3>1. What Information We Collect</h3>
          <ul>
            <li><strong>Document Data:</strong> ZERO bytes collected or transmitted to our servers.</li>
            <li><strong>Personal Information:</strong> If you choose to log in via Firebase Authentication (Google SSO), we receive only your public authentication token, verified email address, and display name to sync your user profile.</li>
            <li><strong>Telemetry:</strong> We do not track document contents, filenames, or reading habits. Anonymous error crash reports contain zero user document bytes.</li>
          </ul>
        </section>

        <section>
          <h3>2. GDPR &amp; CCPA Compliance</h3>
          <p>Under the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA):</p>
          <ul>
            <li><strong>Data Minimization:</strong> We adhere to the strictest principle of data minimization by never receiving document data in the first place.</li>
            <li><strong>Right to Deletion:</strong> Any local session data saved to your browser (such as favorite tools or recent file names in IndexedDB) can be purged instantly by clearing your browser cache or clicking "Sign out" in Account settings.</li>
          </ul>
        </section>

        <section>
          <h3>3. HIPAA &amp; FERPA Suitability</h3>
          <p>Because document processing executes entirely on the user's client machine without transmission over third-party networks, LetsEdit satisfies HIPAA (Health Insurance Portability and Accountability Act) and FERPA data isolation standards for sensitive healthcare, financial, and educational records.</p>
        </section>

        <section>
          <h3>4. Cookies &amp; Local Storage</h3>
          <p>We use minimal <code>localStorage</code> and <code>IndexedDB</code> exclusively to preserve your theme preference (Dark/Light mode) and maintain your local PWA offline document cache. We do not use third-party advertising tracking cookies.</p>
        </section>

        <section>
          <h3>5. Contact Information</h3>
          <p>If you have any questions or security disclosures regarding this policy, please reach out to our privacy team at <a href="mailto:privacy@letsedit.io">privacy@letsedit.io</a>.</p>
        </section>
      </article>
    `;
  }

  bindEvents() {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('#btn-close-legal');
    if (closeBtn) closeBtn.onclick = () => this.close();

    const acceptBtn = this.modal.querySelector('#btn-legal-accept');
    if (acceptBtn) acceptBtn.onclick = () => this.close();

    // Close on clicking backdrop outside dialog
    this.modal.onclick = (e) => {
      if (e.target === this.modal) this.close();
    };

    // Tab buttons
    this.modal.querySelectorAll('.legal-tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-legal-tab');
        if (tab) {
          this.activeTab = tab;
          this.render();
          this.bindEvents();
        }
      };
    });
  }
}

export const legalModal = new LegalModal();
