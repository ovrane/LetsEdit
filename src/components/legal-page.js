/**
 * Dedicated Legal & Policy Hub Page
 * Standalone page serving comprehensive, production-grade legal documents:
 * 1. Privacy Policy (GDPR / CCPA / Zero-Cloud Processing Guarantee)
 * 2. Terms of Service (ESIGN & eIDAS Electronic Signature Compliance)
 * 3. Security & Cryptographic Whitepaper
 * 4. Cookie & Local Storage Disclosure
 */

import { router } from '../core/router.js';
import { toggleTheme } from '../utils/theme.js';

export class LegalPage {
  constructor() {
    this.container = null;
    this.activeTab = 'privacy'; // 'privacy' | 'terms' | 'security' | 'cookies'
    this.isMounted = false;
  }

  mount(container) {
    this.container = container;
    this.isMounted = true;
  }

  show({ tab = 'privacy', updateUrl = true } = {}) {
    this.activeTab = tab;
    if (!this.container) {
      let el = document.getElementById('legal-page-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'legal-page-container';
        document.body.appendChild(el);
      }
      this.mount(el);
    }

    this.container.style.display = 'block';
    this.render();
    this.bindEvents();

    if (updateUrl) {
      const canonicalPath = this.getTabPath(this.activeTab);
      window.history.pushState({}, '', canonicalPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setTab(tab, updateUrl = true) {
    this.show({ tab, updateUrl });
  }

  switchTab(tab) {
    this.show({ tab, updateUrl: false });
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  getTabPath(tab) {
    switch (tab) {
      case 'terms': return '/terms';
      case 'security': return '/security-whitepaper';
      case 'cookies': return '/cookies';
      case 'privacy':
      default: return '/privacy';
    }
  }

  render() {
    this.container.className = 'legal-page-container';
    this.container.innerHTML = `
      <header class="legal-header">
        <div class="legal-header-inner">
          <div class="legal-header-left">
            <div class="lets-logo" id="legal-logo" style="cursor: pointer;">
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
            <a href="/" data-route="/" class="legal-nav-link" id="legal-nav-home">Home</a>
            <a href="/#landing-tools-section" data-route="/#landing-tools-section" class="legal-nav-link" id="legal-nav-tools">All Tools</a>
            <a href="/docs" data-route="/docs" class="legal-nav-link" id="legal-nav-docs">Docs &amp; Guide</a>
          </div>

          <div class="legal-header-right">
            <button class="icon-btn" id="btn-legal-theme" title="Toggle Theme" aria-label="Toggle theme">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
            <a href="/edit_pdf" data-route="/edit_pdf" class="btn btn-primary btn-sm" id="btn-legal-studio" style="padding: 8px 16px; font-weight: 700;">
              <span>Open Studio</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </div>
      </header>

      <section class="legal-hero-banner">
        <div class="legal-hero-inner">
          <span class="legal-badge-pill">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>LEGAL &amp; COMPLIANCE HUB</span>
          </span>
          <h1 class="legal-hero-title">${this.getHeroTitle()}</h1>
          <p class="legal-hero-desc">
            Transparent, uncompromising privacy guarantees built on 100% client-side WebAssembly execution.
            Your documents never touch cloud storage, remote servers, or third-party AI models.
          </p>
        </div>
      </section>

      <main class="legal-main-body">
        <aside class="legal-sidebar">
          <div class="legal-nav-group">
            <button class="legal-sidebar-item ${this.activeTab === 'privacy' ? 'active' : ''}" data-tab="privacy">
              <svg class="legal-sidebar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Privacy Policy</span>
            </button>
            <button class="legal-sidebar-item ${this.activeTab === 'terms' ? 'active' : ''}" data-tab="terms">
              <svg class="legal-sidebar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Terms of Service</span>
            </button>
            <button class="legal-sidebar-item ${this.activeTab === 'security' ? 'active' : ''}" data-tab="security">
              <svg class="legal-sidebar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Security Whitepaper</span>
            </button>
            <button class="legal-sidebar-item ${this.activeTab === 'cookies' ? 'active' : ''}" data-tab="cookies">
              <svg class="legal-sidebar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              <span>Cookie Policy</span>
            </button>
          </div>

          <div class="legal-sidebar-actions">
            <button class="legal-action-btn" id="btn-print-policy">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Print / Save as PDF</span>
            </button>
            <a href="mailto:privacy@letsedit.io" class="legal-action-btn">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>Contact Privacy Officer</span>
            </a>
          </div>
        </aside>

        <section class="legal-content-card">
          <div class="legal-content-meta">
            <div><strong>Document Version:</strong> 3.4.0 (Global Enterprise Edition)</div>
            <div><strong>Last Updated:</strong> October 2026</div>
          </div>

          <!-- Zero-Cloud Guarantee Banner -->
          <div class="legal-promise-box">
            <svg class="legal-promise-icon" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            <div class="legal-promise-text">
              <h4>The 100% In-Browser Privacy Guarantee</h4>
              <p>
                Unlike traditional PDF editors (such as Smallpdf or iLovePDF), LetsEdit processes your documents
                directly in your local device's memory using compiled WebAssembly. No document content, text, form inputs,
                signatures, or uploaded files are ever sent to our servers.
              </p>
            </div>
          </div>

          <div class="legal-article-body">
            ${this.getTabContent()}
          </div>
        </section>
      </main>
    `;
  }

  getHeroTitle() {
    switch (this.activeTab) {
      case 'terms': return 'Terms of Service & E-Sign Compliance';
      case 'security': return 'Security & Cryptographic Whitepaper';
      case 'cookies': return 'Cookie Policy & Tracking Disclosure';
      case 'privacy':
      default: return 'Zero-Cloud Privacy Policy';
    }
  }

  getTabContent() {
    switch (this.activeTab) {
      case 'terms': return this.renderTerms();
      case 'security': return this.renderSecurity();
      case 'cookies': return this.renderCookies();
      case 'privacy':
      default: return this.renderPrivacy();
    }
  }

  renderPrivacy() {
    return `
      <h2>1. Introduction &amp; Core Architecture</h2>
      <p>
        LetsEdit ("we", "us", or "our") operates a privacy-first, client-side document workstation.
        This Privacy Policy explains how our service processes data, our strict zero-telemetry document architecture,
        and your rights under global privacy laws including the <strong>General Data Protection Regulation (GDPR)</strong>,
        the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>, and HIPAA business associate rules.
      </p>

      <h3>2. The Zero-Cloud Processing Guarantee</h3>
      <p>
        Every PDF tool on LetsEdit (including Merge, Split, Edit, Sign, Redact, Compress, OCR, and Convert)
        executes entirely within your client web browser through compiled WebAssembly and Web Worker pipelines.
      </p>
      <ul>
        <li><strong>No File Uploads:</strong> When you drag and drop or select a document, it is read into the browser's local sandbox memory (ArrayBuffer/Blob). No bytes are transmitted over HTTP/HTTPS to remote processing backends.</li>
        <li><strong>0-Second Data Retention:</strong> Because we never receive your files, our server retention time is permanently zero (0) seconds. Closing your browser tab or clicking "Clear Canvas" immediately flushes the memory heap.</li>
        <li><strong>No AI Model Training:</strong> Your private legal documents, health records, and balance sheets are never used to train machine learning models.</li>
      </ul>

      <h3>3. Optional Account Data We Collect</h3>
      <p>
        You are never required to create an account or provide payment credentials to edit, merge, or convert documents.
        However, if you choose to create a registered account (e.g. to save signature presets or manage team signing requests),
        we collect only the bare minimum:
      </p>
      <table>
        <thead>
          <tr>
            <th>Data Field</th>
            <th>Purpose</th>
            <th>Legal Basis (GDPR Art. 6)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email Address</td>
            <td>Account authentication and multi-signer verification tokens</td>
            <td>Contract Performance</td>
          </tr>
          <tr>
            <td>Name / Display Name</td>
            <td>Displayed on audit trail certificates when you sign contracts</td>
            <td>Legitimate Interest / Consent</td>
          </tr>
          <tr>
            <td>SHA-256 Document Hashes</td>
            <td>Cryptographic proof of non-tampering for Multi-Party e-Signatures</td>
            <td>Legal Obligation / Contract</td>
          </tr>
        </tbody>
      </table>
      <p><em>Note: A SHA-256 hash is a one-way mathematical fingerprint. It is mathematically impossible to reverse-engineer or reconstruct your document from its hash.</em></p>

      <h3>4. Your Rights Under GDPR &amp; CCPA</h3>
      <p>Regardless of your geographic location, you retain full sovereignty over your personal data:</p>
      <ul>
        <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can delete your registered account at any time from your Account Settings. All database entries are permanently purged within 60 seconds.</li>
        <li><strong>Right to Portability:</strong> Export all audit records and account logs in machine-readable JSON format.</li>
        <li><strong>No Sale of Personal Information:</strong> We do not sell, rent, monetize, or broker personal information to data brokers or ad networks.</li>
      </ul>

      <h3>5. Contacting the Data Protection Officer</h3>
      <p>
        If you have questions regarding this Privacy Policy or require enterprise compliance documentation (SOC 2 / ISO 27001),
        contact our privacy team at <a href="mailto:privacy@letsedit.io">privacy@letsedit.io</a>.
      </p>
    `;
  }

  renderTerms() {
    return `
      <h2>1. Agreement to Terms</h2>
      <p>
        By accessing or using LetsEdit, you agree to be bound by these Terms of Service and all applicable laws and regulations.
        If you do not agree with any of these terms, you are prohibited from using or accessing this site.
      </p>

      <h3>2. Electronic Signature Legal Validity (ESIGN &amp; eIDAS)</h3>
      <p>
        LetsEdit provides electronic signature tools engineered in compliance with major international standards:
      </p>
      <ul>
        <li><strong>United States:</strong> Electronic Signatures in Global and National Commerce Act (ESIGN, 15 U.S.C. § 7001) and the Uniform Electronic Transactions Act (UETA).</li>
        <li><strong>European Union:</strong> Regulation (EU) No 910/2014 (eIDAS) regarding electronic transactions in the internal market.</li>
      </ul>
      <p>
        When you apply an electronic signature or sign a document through our multi-party workflow, you affirm your intent to sign,
        consent to do business electronically, and acknowledge that the generated document and accompanying SHA-256 Audit Certificate
        shall have the same legal force and effect as a handwritten pen-and-paper signature.
      </p>

      <h3>3. Acceptable Use Policy</h3>
      <p>You agree not to use LetsEdit to:</p>
      <ul>
        <li>Process, forge, or alter documents for fraudulent, unlawful, or deceitful purposes.</li>
        <li>Reverse-engineer or bypass client-side security controls or attempt to inject malicious JavaScript into PDF AcroForm streams.</li>
        <li>Transmit malware, viruses, or Trojan payloads disguised as PDF attachments.</li>
      </ul>

      <h3>4. Intellectual Property &amp; Document Ownership</h3>
      <p>
        <strong>You own 100% of your documents and content.</strong> LetsEdit claims zero copyright, ownership, or licensing rights
        over documents loaded into or created with our software. Because files are processed in your client browser,
        we do not obtain any license to view, index, or distribute your intellectual property.
      </p>

      <h3>5. Limitation of Liability</h3>
      <p>
        To the maximum extent permitted by applicable law, LetsEdit shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising out of your use of the service.
      </p>
    `;
  }

  renderSecurity() {
    return `
      <h2>1. Security Architecture Overview</h2>
      <p>
        LetsEdit is architected from the ground up on the principle of <strong>Zero-Trust Client Isolation</strong>.
        Traditional web software operates as a "thin client" that uploads heavy files to a cloud server cluster.
        LetsEdit operates as an "edge workstation" where your CPU and GPU perform the processing locally via WebAssembly.
      </p>

      <h3>2. Cryptographic Integrity &amp; SHA-256 Fingerprinting</h3>
      <p>
        Every document signed, flattened, or audited on LetsEdit is fingerprinted using the <strong>SHA-256 (Secure Hash Algorithm 256-bit)</strong> standard.
      </p>
      <ul>
        <li>A tamper-evident digest is generated before and after modifications.</li>
        <li>If a third party alters even a single pixel or character of the finalized PDF, the computed cryptographic hash changes completely, immediately proving tampering in a court of law.</li>
      </ul>

      <h3>3. Permanent Vector Redaction vs. "Black Box" Annotations</h3>
      <p>
        Most basic PDF editors commit a catastrophic security mistake: they draw a black rectangular vector shape on top of secret text,
        leaving the underlying text stream intact and easily extractable via simple copy-paste or text export.
      </p>
      <p>
        <strong>LetsEdit's Permanent Redaction Standard:</strong> Our vector redaction engine parses the low-level PDF stream tokenizers (<code>Tj</code>, <code>TJ</code>, <code>Do</code>),
        calculates spatial bounding boxes down to 1/72nd of an inch, and <em>physically purges the glyph tokens from the underlying PDF content stream</em>.
        The data is irrecoverable and permanently destroyed.
      </p>

      <h3>4. AcroForm Vector Flattening</h3>
      <p>
        Fillable PDF forms (AcroForms) contain editable widget annotations that can be surreptitiously modified after signing.
        Our flattening engine iterates through all <code>/Annots</code> dictionaries, renders the form field contents directly onto the
        static page content stream (<code>/Contents</code>), and destroys the interactive widget definitions. The resulting document is completely immutable.
      </p>

      <h3>5. Sandboxed Web Worker Isolation</h3>
      <p>
        All file parsing operations run inside sandboxed background Web Workers with strict Content Security Policies (CSP).
        Even malformed or weaponized PDF exploit payloads are isolated from browser DOM access and cannot execute unauthorized scripts.
      </p>
    `;
  }

  renderCookies() {
    return `
      <h2>1. Our Zero-Tracking Cookie Philosophy</h2>
      <p>
        LetsEdit believes the modern web is plagued by invasive cross-site tracking and surveillance advertising.
        We have designed our service to function completely without third-party tracking cookies or advertising pixels.
      </p>

      <h3>2. What We Store Locally (Essential Only)</h3>
      <p>
        We do not use tracking cookies. We utilize your browser's local sandbox storage (<code>localStorage</code>) solely for essential functional features:
      </p>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Expiration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>letsedit_theme</code></td>
            <td>LocalStorage</td>
            <td>Remembers your Light/Dark mode visual preference</td>
            <td>Persistent (Local only)</td>
          </tr>
          <tr>
            <td><code>letsedit_recent_tools</code></td>
            <td>LocalStorage</td>
            <td>Displays your recently used tools for fast 1-click access</td>
            <td>Persistent (Local only)</td>
          </tr>
          <tr>
            <td><code>letsedit_auth_token</code></td>
            <td>SessionStorage</td>
            <td>Maintains session login token if you explicitly sign in</td>
            <td>Browser session close</td>
          </tr>
        </tbody>
      </table>

      <h3>3. Third-Party Analytics &amp; Advertising</h3>
      <ul>
        <li><strong>No Google Analytics or Facebook Pixels:</strong> We do not load third-party ad tracking scripts or tracking beacons.</li>
        <li><strong>No Cross-Site Identification:</strong> We cannot identify you across other websites or build an advertising profile.</li>
        <li><strong>No Cloudflare Cookies:</strong> Cloudflare Turnstile bot verification runs only during public signature requests without storing tracking cookies.</li>
      </ul>
    `;
  }

  bindEvents() {
    // Logo and Nav links
    const logo = this.container.querySelector('#legal-logo');
    if (logo) logo.onclick = () => router.navigate('/');

    const homeLink = this.container.querySelector('#legal-nav-home');
    if (homeLink) homeLink.onclick = (e) => { e.preventDefault(); router.navigate('/'); };

    const toolsLink = this.container.querySelector('#legal-nav-tools');
    if (toolsLink) toolsLink.onclick = (e) => { e.preventDefault(); router.navigate('/#landing-tools-section'); };

    const docsLink = this.container.querySelector('#legal-nav-docs');
    if (docsLink) docsLink.onclick = (e) => { e.preventDefault(); router.navigate('/docs'); };

    const themeBtn = this.container.querySelector('#btn-legal-theme');
    if (themeBtn) themeBtn.onclick = () => toggleTheme();

    const studioBtn = this.container.querySelector('#btn-legal-studio');
    if (studioBtn) studioBtn.onclick = (e) => { e.preventDefault(); router.navigate('/edit_pdf'); };

    // Sidebar Tab Switching
    const tabBtns = this.container.querySelectorAll('.legal-sidebar-item');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const targetTab = btn.getAttribute('data-tab');
        this.show({ tab: targetTab, updateUrl: true });
      };
    });

    // Print Button
    const printBtn = this.container.querySelector('#btn-print-policy');
    if (printBtn) {
      printBtn.onclick = () => {
        window.print();
      };
    }
  }
}

export const legalPage = new LegalPage();
