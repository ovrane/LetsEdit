/**
 * Dedicated Documentation & Beginner's Guide Hub Page
 * Designed specifically for users who may be new to PDF editing,
 * providing crystal-clear, step-by-step visual walkthroughs for every tool.
 */

import { router } from '../core/router.js';
import { toggleTheme } from '../utils/theme.js';

export class DocsPage {
  constructor() {
    this.container = null;
    this.searchQuery = '';
    this.isMounted = false;
  }

  mount(container) {
    this.container = container;
    this.isMounted = true;
  }

  show({ updateUrl = true } = {}) {
    if (!this.container) {
      let el = document.getElementById('docs-page-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'docs-page-container';
        document.body.appendChild(el);
      }
      this.mount(el);
    }

    this.container.style.display = 'block';
    this.render();
    this.bindEvents();

    if (updateUrl) {
      window.history.pushState({}, '', '/docs');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  render() {
    this.container.className = 'docs-page-container';
    this.container.innerHTML = `
      <header class="docs-header">
        <div class="docs-header-inner">
          <div class="docs-header-left">
            <div class="lets-logo" id="docs-logo" style="cursor: pointer;">
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
            <a href="/" data-route="/" class="legal-nav-link" id="docs-nav-home">Home</a>
            <a href="/#landing-tools-section" data-route="/#landing-tools-section" class="legal-nav-link" id="docs-nav-tools">All Tools</a>
            <a href="/privacy" data-route="/privacy" class="legal-nav-link" id="docs-nav-policy">Privacy &amp; Terms</a>
          </div>

          <div class="docs-header-right">
            <div class="docs-search-input-wrap">
              <svg class="docs-search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="docs-search-input" class="docs-search-input" placeholder="Search documentation..." aria-label="Search docs" />
            </div>
            <button class="icon-btn" id="btn-docs-theme" title="Toggle Theme" aria-label="Toggle theme">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
            <a href="/edit_pdf" data-route="/edit_pdf" class="btn btn-primary btn-sm" id="btn-docs-studio" style="padding: 8px 16px; font-weight: 700;">
              <span>Launch Studio</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </div>
      </header>

      <section class="docs-hero-section">
        <div class="docs-hero-inner">
          <span class="docs-badge-pill">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            <span>LEARN PDF EDITING</span>
          </span>
          <h1 class="docs-hero-title">Documentation &amp; <span class="docs-theme-accent">Beginner's Guide</span></h1>
          <p class="docs-hero-desc">
            Everything you need to know about working with PDFs, from editing existing text to legal Bates numbering,
            e-signatures, and permanent redaction. Simple, friendly, and complete.
          </p>

          <div class="docs-quick-grid">
            <div class="docs-quick-card" data-target="ch-what-is-pdf">
              <h4><span>💡</span> What is a PDF?</h4>
              <p>Understand how PDFs differ from Word docs and how client-side WebAssembly works.</p>
            </div>
            <div class="docs-quick-card" data-target="ch-edit-text">
              <h4><span>✏️</span> Edit Existing Text</h4>
              <p>Learn how to click and fix typos, replace words, and change fonts in any PDF.</p>
            </div>
            <div class="docs-quick-card" data-target="ch-redaction">
              <h4><span>🛡️</span> True Redaction</h4>
              <p>Why black boxes fail and how to permanently purge confidential information.</p>
            </div>
          </div>
        </div>
      </section>

      <main class="docs-main-body">
        <aside class="docs-sidebar">
          <div class="docs-nav-card">
            <div class="docs-nav-header">Getting Started</div>
            <button class="docs-nav-item active" data-chapter="ch-what-is-pdf">
              <span>1. What is a PDF?</span>
              <span class="docs-nav-badge">Core</span>
            </button>
            <button class="docs-nav-item" data-chapter="ch-edit-text">
              <span>2. Editing Text</span>
              <span class="docs-nav-badge">Popular</span>
            </button>
            <button class="docs-nav-item" data-chapter="ch-organize">
              <span>3. Merging &amp; Splitting</span>
            </button>
            <button class="docs-nav-item" data-chapter="ch-convert">
              <span>4. File Conversions</span>
            </button>

            <div class="docs-nav-header" style="margin-top: 10px;">Security &amp; Legal</div>
            <button class="docs-nav-item" data-chapter="ch-redaction">
              <span>5. Permanent Redaction</span>
              <span class="docs-nav-badge">Safety</span>
            </button>
            <button class="docs-nav-item" data-chapter="ch-signatures">
              <span>6. Digital Signatures</span>
            </button>
            <button class="docs-nav-item" data-chapter="ch-forms">
              <span>7. AcroForms &amp; Flattening</span>
            </button>
            <button class="docs-nav-item" data-chapter="ch-bates">
              <span>8. Bates Numbering</span>
            </button>

            <div class="docs-nav-header" style="margin-top: 10px;">Reference</div>
            <button class="docs-nav-item" data-chapter="ch-shortcuts">
              <span>9. Keyboard Shortcuts</span>
            </button>
          </div>
        </aside>

        <section class="docs-content" id="docs-content-container">
          <!-- Chapter 1 -->
          <article class="docs-chapter" id="ch-what-is-pdf">
            <span class="docs-chapter-tag">Chapter 1 • Foundation</span>
            <h2 class="docs-chapter-title">What is a PDF &amp; How Does In-Browser Editing Work?</h2>
            <p class="docs-chapter-desc">
              If you've ever tried editing a PDF, you may have noticed it behaves differently than a Microsoft Word document.
              Here is why, and how LetsEdit makes editing simple and safe.
            </p>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">PDF vs. Word Documents</h3>
              </div>
              <p class="docs-step-body">
                A Word document (<code>.docx</code>) stores continuous text that flows and reflows across pages dynamically.
                In contrast, a <strong>PDF (Portable Document Format)</strong> is designed like a digital printed sheet of paper.
                Every character, logo, and line has an exact coordinate position (down to 1/72nd of an inch) on the page.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">2</span>
                <h3 class="docs-step-title">How LetsEdit Solves This (The Text Clustering Engine)</h3>
              </div>
              <p class="docs-step-body">
                In raw PDF files, sentences are often fragmented into individual syllables or single letters.
                LetsEdit uses an advanced <strong>Text Clustering Algorithm</strong> that automatically inspects horizontal baselines,
                detects natural character spacing, and reunites scattered letters into editable text boxes you can click and type into.
              </p>
            </div>

            <div class="docs-callout tip">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <strong>Zero Cloud Uploads:</strong> When you open a PDF on LetsEdit, your file is loaded into your web browser's local memory via WebAssembly. It never gets sent to any cloud server, ensuring 100% data confidentiality.
              </div>
            </div>

            <a href="/edit_pdf" class="docs-action-link">
              <span>Open the Studio to Practice</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </article>

          <!-- Chapter 2 -->
          <article class="docs-chapter" id="ch-edit-text">
            <span class="docs-chapter-tag">Chapter 2 • Text Editing</span>
            <h2 class="docs-chapter-title">How to Edit Existing Text &amp; Add New Content</h2>
            <p class="docs-chapter-desc">
              Fix typos, update numbers, replace names, or add fresh headings to existing PDFs in seconds.
            </p>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">Editing Existing Words</h3>
              </div>
              <p class="docs-step-body">
                1. Click <strong>Edit PDF</strong> from the tools menu or launch the Studio.<br/>
                2. Click on the <strong>Edit Text</strong> tool (pencil icon).<br/>
                3. Hover over the text you wish to change. A subtle bounding box will appear around the line.<br/>
                4. Click inside the box. A live cursor appears — simply backspace or type your new text.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">2</span>
                <h3 class="docs-step-title">Matching Fonts &amp; Formatting</h3>
              </div>
              <p class="docs-step-body">
                Our font detector automatically analyzes the embedded font and matches it to standard PDF font families (Helvetica, Times New Roman, Courier) or over 150+ Google Web Fonts.
                You can adjust <strong>Font Size</strong>, <strong>Bold</strong>, <em>Italic</em>, <u>Underline</u>, text alignment, and text color using the floating toolbar.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">3</span>
                <h3 class="docs-step-title">Adding New Text Blocks &amp; Sticky Notes</h3>
              </div>
              <p class="docs-step-body">
                Click <strong>Text</strong> on the top toolbar and click anywhere on the page to insert a new text box.
                To leave review comments, select the <strong>Sticky Note</strong> tool and drop an Adobe Acrobat-style annotation note.
              </p>
            </div>

            <a href="/edit_pdf" class="docs-action-link">
              <span>Try Editing Text in Studio</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </article>

          <!-- Chapter 3 -->
          <article class="docs-chapter" id="ch-organize">
            <span class="docs-chapter-tag">Chapter 3 • Page Management</span>
            <h2 class="docs-chapter-title">Merging, Splitting, Reordering &amp; Rotating Pages</h2>
            <p class="docs-chapter-desc">
              Organize multi-page documents, combine separate reports, or extract specific pages.
            </p>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">Merging Multiple PDFs</h3>
              </div>
              <p class="docs-step-body">
                Open <strong>Merge PDF</strong> (<code>/merge_pdf</code>). Drag and drop two or more files.
                Drag the file cards left or right to set the desired order.
                You can optionally enable <em>Generate Table of Contents</em> or <em>Add Cover Page</em> with automatic continuous numbering.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">2</span>
                <h3 class="docs-step-title">Splitting a PDF</h3>
              </div>
              <p class="docs-step-body">
                Open <strong>Split PDF</strong> (<code>/split_pdf</code>). You have multiple splitting modes:<br/>
                • <strong>By Page Range:</strong> Enter ranges like <code>1-3, 5, 8-12</code>.<br/>
                • <strong>By Bookmarks:</strong> Automatically cuts into separate files based on document chapters.<br/>
                • <strong>By Keyword:</strong> Splits the PDF whenever a specific word (such as "Invoice #") appears.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">3</span>
                <h3 class="docs-step-title">Rotating &amp; Rearranging in Studio</h3>
              </div>
              <p class="docs-step-body">
                In the Studio left sidebar, click the page thumbnail options icon. Click <strong>Rotate 90°</strong> to fix upside-down scans, or drag thumbnail cards to change the sequence.
              </p>
            </div>

            <a href="/merge_pdf" class="docs-action-link">
              <span>Open Merge Tool</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </article>

          <!-- Chapter 4 -->
          <article class="docs-chapter" id="ch-convert">
            <span class="docs-chapter-tag">Chapter 4 • Conversion Suite</span>
            <h2 class="docs-chapter-title">Converting Files To &amp; From PDF</h2>
            <p class="docs-chapter-desc">
              Transform PDF documents into editable Office formats or convert images and documents into vector PDFs.
            </p>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">PDF to Word, Excel &amp; PowerPoint</h3>
              </div>
              <p class="docs-step-body">
                • <strong>PDF to Word (<code>/pdf_to_word</code>):</strong> Reconstructs paragraphs, tables, bold styling, and headings into a standard <code>.docx</code> document.<br/>
                • <strong>PDF to Excel (<code>/pdf_to_excel</code>):</strong> Detects grid lines and spatial columns, turning financial statements into <code>.xlsx</code> spreadsheets.<br/>
                • <strong>PDF to PowerPoint (<code>/pdf_to_powerpoint</code>):</strong> Converts document pages into clean presentation slides.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">2</span>
                <h3 class="docs-step-title">Scanned Documents &amp; OCR (Optical Character Recognition)</h3>
              </div>
              <p class="docs-step-body">
                If your PDF is an image scanned from paper, regular text selection won't work.
                Use our <strong>OCR Tool (<code>/ocr_pdf</code>)</strong>. The browser runs an in-browser neural engine to identify printed letters and adds an invisible text layer over the image so you can search, copy, and edit it.
              </p>
            </div>
          </article>

          <!-- Chapter 5 -->
          <article class="docs-chapter" id="ch-redaction">
            <span class="docs-chapter-tag">Chapter 5 • Privacy &amp; Redaction</span>
            <h2 class="docs-chapter-title">Permanent Vector Redaction vs. "Black Boxes"</h2>
            <p class="docs-chapter-desc">
              Why drawing a black rectangle over sensitive text is dangerous, and how LetsEdit guarantees safety.
            </p>

            <div class="docs-callout warning">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <strong>CRITICAL SECURITY WARNING:</strong> If you use a basic tool to draw a black shape over a Social Security Number or address, anyone can highlight and copy the text underneath! This has caused major legal leaks in federal courts.
              </div>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">How LetsEdit's Redaction Engine Works</h3>
              </div>
              <p class="docs-step-body">
                When you use <strong>Redact PDF (<code>/redact_pdf</code>)</strong>, our engine doesn't just cover the text.
                It analyzes the exact coordinate stream and <strong>physically deletes the character glyphs</strong> from the PDF stream.
                Once saved, the information is completely non-existent and cannot be recovered by any software.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">2</span>
                <h3 class="docs-step-title">1-Click Metadata &amp; Anti-Forensics Strip</h3>
              </div>
              <p class="docs-step-body">
                PDFs contain hidden metadata tags: author name, software version, editing timestamps, and GPS coordinates from phone cameras.
                Use <strong>Sanitize PDF (<code>/sanitize_pdf</code>)</strong> to strip all tracking tags before sharing documents publicly.
              </p>
            </div>

            <a href="/redact_pdf" class="docs-action-link">
              <span>Open Redact Tool</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </article>

          <!-- Chapter 6 -->
          <article class="docs-chapter" id="ch-signatures">
            <span class="docs-chapter-tag">Chapter 6 • Signatures</span>
            <h2 class="docs-chapter-title">Drawing, Typing &amp; Requesting Digital Signatures</h2>
            <p class="docs-chapter-desc">
              Execute legally binding electronic signatures conforming to US ESIGN and EU eIDAS standards.
            </p>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">Signing a Document Yourself</h3>
              </div>
              <p class="docs-step-body">
                Open <strong>Sign PDF (<code>/sign_pdf</code>)</strong>. You have 3 options:<br/>
                • <strong>Draw:</strong> Use your mouse, touchpad, or touchscreen stylus.<br/>
                • <strong>Type:</strong> Enter your name and select a clean handwritten calligraphic style.<br/>
                • <strong>Upload:</strong> Upload a photo or scan of your handwritten signature.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">2</span>
                <h3 class="docs-step-title">Cryptographic SHA-256 Audit Trail</h3>
              </div>
              <p class="docs-step-body">
                When you finalize a signed document, check <em>Append Audit Certificate</em>.
                LetsEdit appends a formal legal audit sheet recording the document's SHA-256 hash, timestamp, signer IP, and verification QR code.
              </p>
            </div>

            <a href="/sign_pdf" class="docs-action-link">
              <span>Open Sign Tool</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </article>

          <!-- Chapter 7 -->
          <article class="docs-chapter" id="ch-forms">
            <span class="docs-chapter-tag">Chapter 7 • Forms</span>
            <h2 class="docs-chapter-title">Fillable AcroForms &amp; Form Flattening</h2>
            <p class="docs-chapter-desc">
              Fill interactive form fields and flatten forms into permanent, immutable documents.
            </p>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">Filling Interactive Forms</h3>
              </div>
              <p class="docs-step-body">
                Upload any fillable PDF to <strong>Fill PDF (<code>/fill_pdf</code>)</strong>. Click into text fields, check checkboxes, and choose dropdown options directly in your browser.
              </p>
            </div>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">2</span>
                <h3 class="docs-step-title">What is Form Flattening?</h3>
              </div>
              <p class="docs-step-body">
                When sending a finalized contract or tax form, you don't want the recipient to edit your answers.
                Using <strong>Flatten PDF (<code>/flatten_pdf</code>)</strong> merges the form text into the background drawing layer, permanently freezing the inputs so they can never be altered.
              </p>
            </div>
          </article>

          <!-- Chapter 8 -->
          <article class="docs-chapter" id="ch-bates">
            <span class="docs-chapter-tag">Chapter 8 • Legal Discovery</span>
            <h2 class="docs-chapter-title">Bates Numbering for Legal Case Files</h2>
            <p class="docs-chapter-desc">
              Format legal discovery exhibits with standardized, zero-padded serial numbers.
            </p>

            <div class="docs-step-card">
              <div class="docs-step-header">
                <span class="docs-step-num">1</span>
                <h3 class="docs-step-title">Configuring Bates Sequences</h3>
              </div>
              <p class="docs-step-body">
                Open <strong>Bates Numbering (<code>/bates_numbering_pdf</code>)</strong>. You can customize:<br/>
                • <strong>Prefix:</strong> e.g., <code>CONFIDENTIAL-</code> or <code>PLAINTIFF-</code><br/>
                • <strong>Start Number:</strong> e.g., <code>1</code> with 6-digit zero padding (<code>PLAINTIFF-000001</code>)<br/>
                • <strong>Position:</strong> Choose Bottom Right, Bottom Center, or Top Right.
              </p>
            </div>
          </article>

          <!-- Chapter 9 -->
          <article class="docs-chapter" id="ch-shortcuts">
            <span class="docs-chapter-tag">Chapter 9 • Reference</span>
            <h2 class="docs-chapter-title">Keyboard Shortcuts &amp; Studio Cheatsheet</h2>
            <p class="docs-chapter-desc">
              Boost your productivity inside the interactive editor studio with these handy hotkeys.
            </p>

            <table class="docs-shortcut-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">Z</kbd></td>
                  <td>Undo</td>
                  <td>Revert the previous text change, annotation, or page edit</td>
                </tr>
                <tr>
                  <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">Y</kbd></td>
                  <td>Redo</td>
                  <td>Reapply the undone action</td>
                </tr>
                <tr>
                  <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">F</kbd></td>
                  <td>Find &amp; Replace</td>
                  <td>Open the in-document search and text replacement panel</td>
                </tr>
                <tr>
                  <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">S</kbd></td>
                  <td>Quick Export</td>
                  <td>Compile and download the modified PDF directly to your device</td>
                </tr>
                <tr>
                  <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">K</kbd></td>
                  <td>Spotlight Search</td>
                  <td>Open quick tool search from anywhere on the landing page</td>
                </tr>
                <tr>
                  <td><kbd class="docs-kbd">Space</kbd> + Drag</td>
                  <td>Hand Pan</td>
                  <td>Pan across large canvas pages effortlessly</td>
                </tr>
                <tr>
                  <td><kbd class="docs-kbd">Delete</kbd></td>
                  <td>Delete Object</td>
                  <td>Delete the currently selected annotation, text block, or shape</td>
                </tr>
              </tbody>
            </table>
          <!-- Empty State for Search -->
          <div id="docs-search-empty" style="display: none; text-align: center; padding: 48px 24px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: 12px; margin-top: 24px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" style="margin: 0 auto 12px;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px;">No documentation matches found</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Try searching for terms like "split", "merge", "redact", "ocr", or "signature".</p>
          </div>
        </section>
      </main>
    `;
  }

  filterContent(query = '') {
    if (!this.container) return;
    const q = query.toLowerCase().trim();
    const chapters = this.container.querySelectorAll('.docs-chapter');
    let visibleCount = 0;
    chapters.forEach(ch => {
      const text = (ch.innerText || ch.textContent || '').toLowerCase();
      if (!q || text.includes(q)) {
        ch.style.display = 'block';
        visibleCount++;
      } else {
        ch.style.display = 'none';
      }
    });

    const empty = this.container.querySelector('#docs-search-empty');
    if (empty) {
      empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  bindEvents() {
    const logo = this.container.querySelector('#docs-logo');
    if (logo) logo.onclick = () => router.navigate('/');

    const homeLink = this.container.querySelector('#docs-nav-home');
    if (homeLink) homeLink.onclick = (e) => { e.preventDefault(); router.navigate('/'); };

    const toolsLink = this.container.querySelector('#docs-nav-tools');
    if (toolsLink) toolsLink.onclick = (e) => { e.preventDefault(); router.navigate('/#landing-tools-section'); };

    const policyLink = this.container.querySelector('#docs-nav-policy');
    if (policyLink) policyLink.onclick = (e) => { e.preventDefault(); router.navigate('/privacy'); };

    const themeBtn = this.container.querySelector('#btn-docs-theme');
    if (themeBtn) themeBtn.onclick = () => toggleTheme();

    const studioBtn = this.container.querySelector('#btn-docs-studio');
    if (studioBtn) studioBtn.onclick = (e) => { e.preventDefault(); router.navigate('/edit_pdf'); };

    // Quick card clicks in hero
    const quickCards = this.container.querySelectorAll('.docs-quick-card');
    quickCards.forEach(card => {
      card.onclick = () => {
        const target = card.getAttribute('data-target');
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      };
    });

    // Sidebar navigation
    const navItems = this.container.querySelectorAll('.docs-nav-item');
    navItems.forEach(item => {
      item.onclick = () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const chapterId = item.getAttribute('data-chapter');
        const el = document.getElementById(chapterId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      };
    });

    // Search inside documentation
    const searchInput = this.container.querySelector('#docs-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.filterContent(e.target.value);
      };
    }
  }
}

export const docsPage = new DocsPage();
