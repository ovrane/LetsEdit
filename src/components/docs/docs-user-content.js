/**
 * User Guide & Walkthrough Documentation Content
 * Beginner-friendly, visual, and intuitive explanations for all core PDF operations:
 * text editing, organizing, conversions, redaction, e-signatures, AcroForms, Bates numbering,
 * and keyboard shortcuts.
 * Adheres strictly to the < 1,000 lines per file modular architecture standard.
 */

export function getUserDocsNavHtml() {
  return `
    <div class="docs-nav-group">
      <div class="docs-nav-header">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <span>Getting Started</span>
      </div>
      <button class="docs-nav-item active" data-chapter="ch-what-is-pdf">
        <span class="docs-nav-num">1</span>
        <span class="docs-nav-text">What is a PDF?</span>
        <span class="docs-nav-badge">Core</span>
      </button>
      <button class="docs-nav-item" data-chapter="ch-edit-text">
        <span class="docs-nav-num">2</span>
        <span class="docs-nav-text">Editing Text &amp; Images</span>
        <span class="docs-nav-badge badge-popular">Popular</span>
      </button>
      <button class="docs-nav-item" data-chapter="ch-organize">
        <span class="docs-nav-num">3</span>
        <span class="docs-nav-text">Merging &amp; Splitting</span>
        <span class="docs-nav-badge">Pages</span>
      </button>
      <button class="docs-nav-item" data-chapter="ch-convert">
        <span class="docs-nav-num">4</span>
        <span class="docs-nav-text">Conversions &amp; OCR</span>
        <span class="docs-nav-badge">Office</span>
      </button>
    </div>

    <div class="docs-nav-group">
      <div class="docs-nav-header">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Security &amp; Legal</span>
      </div>
      <button class="docs-nav-item" data-chapter="ch-redaction">
        <span class="docs-nav-num">5</span>
        <span class="docs-nav-text">Permanent Redaction</span>
        <span class="docs-nav-badge badge-safety">Safety</span>
      </button>
      <button class="docs-nav-item" data-chapter="ch-signatures">
        <span class="docs-nav-num">6</span>
        <span class="docs-nav-text">Digital E-Signatures</span>
        <span class="docs-nav-badge">ESIGN</span>
      </button>
      <button class="docs-nav-item" data-chapter="ch-forms">
        <span class="docs-nav-num">7</span>
        <span class="docs-nav-text">AcroForms &amp; Flatten</span>
        <span class="docs-nav-badge">Forms</span>
      </button>
      <button class="docs-nav-item" data-chapter="ch-bates">
        <span class="docs-nav-num">8</span>
        <span class="docs-nav-text">Bates Numbering</span>
        <span class="docs-nav-badge">Legal</span>
      </button>
    </div>

    <div class="docs-nav-group">
      <div class="docs-nav-header">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="m9 9 3 3-3 3M13 15h2"/></svg>
        <span>Reference &amp; Tips</span>
      </div>
      <button class="docs-nav-item" data-chapter="ch-shortcuts">
        <span class="docs-nav-num">9</span>
        <span class="docs-nav-text">Keyboard Shortcuts</span>
        <span class="docs-nav-badge">Cheatsheet</span>
      </button>
    </div>
  `;
}

export function getUserDocsQuickGridHtml() {
  return `
    <div class="docs-quick-card" data-target="ch-edit-text">
      <div class="docs-quick-icon" style="background: rgba(47, 116, 238, 0.1); color: #2F74EE;">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </div>
      <div class="docs-quick-body">
        <h4>Edit Existing Text &amp; Fix Typos</h4>
        <p>Double-click words to edit them with matching fonts, line height, and color.</p>
        <span class="docs-quick-link">Read guide &rarr;</span>
      </div>
    </div>

    <div class="docs-quick-card" data-target="ch-organize">
      <div class="docs-quick-icon" style="background: rgba(0, 180, 216, 0.1); color: #00B4D8;">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      </div>
      <div class="docs-quick-body">
        <h4>Merge &amp; Split Documents</h4>
        <p>Combine multiple PDFs into one, rearrange pages, or burst pages into files.</p>
        <span class="docs-quick-link">Read guide &rarr;</span>
      </div>
    </div>

    <div class="docs-quick-card" data-target="ch-redaction">
      <div class="docs-quick-icon" style="background: rgba(238, 64, 76, 0.1); color: #EE404C;">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div class="docs-quick-body">
        <h4>Permanent Vector Redaction</h4>
        <p>Purge SSNs, account numbers, and names permanently from PDF stream tokens.</p>
        <span class="docs-quick-link">Read guide &rarr;</span>
      </div>
    </div>

    <div class="docs-quick-card" data-target="ch-signatures">
      <div class="docs-quick-icon" style="background: rgba(16, 185, 129, 0.1); color: #10B981;">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="docs-quick-body">
        <h4>Sign &amp; Request Signatures</h4>
        <p>Add legally binding ESIGN signatures or send automated signing requests.</p>
        <span class="docs-quick-link">Read guide &rarr;</span>
      </div>
    </div>
  `;
}

export function getUserDocsContentHtml() {
  return `
    <!-- Chapter 1 -->
    <article class="docs-chapter" id="ch-what-is-pdf" data-category="basics">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-core">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          Chapter 1 • Foundation
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          2 min read
        </span>
      </div>
      
      <h2 class="docs-chapter-title">What is a PDF &amp; How Does In-Browser Editing Work?</h2>
      <p class="docs-chapter-desc">
        If you have ever tried editing a PDF, you may have noticed it behaves differently than a Microsoft Word document.
        Here is how PDFs actually work and how LetsEdit makes editing them effortless, fast, and 100% private.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">PDF vs. Word Documents</h3>
        </div>
        <p class="docs-step-body">
          A Word document (<code>.docx</code>) stores fluid paragraphs of text that reflow dynamically whenever you insert words or adjust margins.
          In contrast, a <strong>PDF (Portable Document Format)</strong> was invented to act like a digital sheet of printed paper.
          Every letter, logo, line, and image is fixed at exact coordinates (down to 1/72nd of an inch) on each page.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">How LetsEdit Solves This: Smart Text Clustering</h3>
        </div>
        <p class="docs-step-body">
          In raw PDF files, sentences are often fragmented into random pieces, syllables, or even single letters scattered across the file stream.
          LetsEdit includes a built-in <strong>Smart Text Clustering Engine</strong> that analyzes baseline coordinates, font sizes, and character spacing in real time.
          It seamlessly regroups scattered characters into natural, clickable words and paragraphs that you can edit just like a Word document.
        </p>
      </div>

      <div class="docs-callout tip">
        <div class="docs-callout-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="docs-callout-text">
          <strong>100% Client-Side Privacy:</strong> When you open a PDF on LetsEdit, your file is loaded directly into your browser's local memory via WebAssembly (WASM). Your confidential files never leave your device and are never sent to external cloud servers.
        </div>
      </div>

      <div class="docs-action-bar">
        <a href="/edit_pdf" data-route="/edit_pdf" class="docs-action-link">
          <span>Open Studio to Practice</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </article>

    <!-- Chapter 2 -->
    <article class="docs-chapter" id="ch-edit-text" data-category="editing">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-popular">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Chapter 2 • Text &amp; Image Editing
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          3 min read
        </span>
      </div>

      <h2 class="docs-chapter-title">How to Edit Existing Text, Fix Typos &amp; Add Images</h2>
      <p class="docs-chapter-desc">
        Need to update a price in a contract, correct a misspelled name, or insert a company logo? Here is how to do it in three quick steps.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Activate the Text Tool (<kbd class="docs-kbd">T</kbd>)</h3>
        </div>
        <p class="docs-step-body">
          Click the <strong>Text Tool</strong> in the studio top toolbar or press <kbd class="docs-kbd">T</kbd> on your keyboard.
          As you move your mouse over the document, LetsEdit displays subtle highlight boxes around detected words and headings.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Double-Click Any Existing Word</h3>
        </div>
        <p class="docs-step-body">
          Double-click on the word you want to modify. A blinking text cursor will appear, and LetsEdit automatically detects and matches the original font family (Helvetica, Times New Roman, Courier), font weight, color, and size. Type your changes directly.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">3</span>
          <h3 class="docs-step-title">Adding New Text Blocks &amp; Images</h3>
        </div>
        <p class="docs-step-body">
          To add new text, simply click any blank area on the page and start typing. To insert a signature, stamp, or logo, click <strong>Images</strong> in the toolbar, select your PNG/JPG file, and resize or reposition it anywhere on the page.
        </p>
      </div>

      <div class="docs-callout tip">
        <div class="docs-callout-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div class="docs-callout-text">
          <strong>Font Matching Guarantee:</strong> If the original PDF uses an unusual embedded font, LetsEdit gracefully substitutes the closest open-source metric equivalent to preserve formatting without shifting surrounding lines.
        </div>
      </div>

      <div class="docs-action-bar">
        <a href="/edit_pdf" data-route="/edit_pdf" class="docs-action-link">
          <span>Edit a PDF Now</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </article>

    <!-- Chapter 3 -->
    <article class="docs-chapter" id="ch-organize" data-category="organize">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-pages">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          Chapter 3 • Organization
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          2 min read
        </span>
      </div>

      <h2 class="docs-chapter-title">Merging Multiple PDFs, Reordering &amp; Splitting Pages</h2>
      <p class="docs-chapter-desc">
        Assemble documents from different sources into a single presentation, or extract individual pages to send via email.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Merge PDFs in Any Order</h3>
        </div>
        <p class="docs-step-body">
          Open the <a href="/merge-pdf" class="docs-inline-link">Merge PDF</a> tool and drag in multiple files. Drag thumbnail cards horizontally to reorder documents. You can also check <em>Generate Table of Contents</em> to automatically build a clickable outline.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Split by Page Ranges or Keywords</h3>
        </div>
        <p class="docs-step-body">
          With the <a href="/split-pdf" class="docs-inline-link">Split PDF</a> tool, you can extract custom page ranges (for example: <code>1-4, 7, 10-15</code>), burst every page into a standalone PDF, or split automatically whenever a keyword like "Invoice" or "Appendix" appears.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">3</span>
          <h3 class="docs-step-title">Rotate, Reorder &amp; Delete Pages</h3>
        </div>
        <p class="docs-step-body">
          Use the <a href="/organize-pdf" class="docs-inline-link">Organize PDF</a> visual grid to rotate sideways scans 90° or 180°, duplicate key pages, or delete unnecessary cover pages with one click.
        </p>
      </div>

      <div class="docs-action-bar">
        <a href="/merge-pdf" data-route="/merge-pdf" class="docs-action-link">
          <span>Try Merge PDF</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/split-pdf" data-route="/split-pdf" class="docs-action-link secondary">
          <span>Try Split PDF</span>
        </a>
      </div>
    </article>

    <!-- Chapter 4 -->
    <article class="docs-chapter" id="ch-convert" data-category="convert">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-convert">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Chapter 4 • Conversions
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          3 min read
        </span>
      </div>

      <h2 class="docs-chapter-title">Converting Files to &amp; from PDF (Word, Excel, JPG, OCR)</h2>
      <p class="docs-chapter-desc">
        Seamless bidirectional conversion between PDF and popular formats without losing layout formatting or images.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">PDF to Editable Word (.docx)</h3>
        </div>
        <p class="docs-step-body">
          Use the <a href="/pdf-to-word" class="docs-inline-link">PDF to Word</a> converter to extract clean flowing paragraphs, bullet points, and tables into Microsoft Word format rather than chaotic fixed-position text boxes.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Image Conversions &amp; Extraction</h3>
        </div>
        <p class="docs-step-body">
          Convert high-resolution photos into standardized PDF files with <a href="/jpg-to-pdf" class="docs-inline-link">JPG to PDF</a>, or export individual page slides as crisp 300 DPI images with <a href="/pdf-to-jpg" class="docs-inline-link">PDF to JPG</a>.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">3</span>
          <h3 class="docs-step-title">OCR (Optical Character Recognition) for Scans</h3>
        </div>
        <p class="docs-step-body">
          If you have a scanned paper contract that cannot be selected or searched, run <a href="/ocr-pdf" class="docs-inline-link">OCR PDF</a>. The built-in client neural OCR engine will scan characters in 20+ languages and embed a searchable text layer directly into your PDF.
        </p>
      </div>

      <div class="docs-action-bar">
        <a href="/pdf-to-word" data-route="/pdf-to-word" class="docs-action-link">
          <span>Convert PDF to Word</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/ocr-pdf" data-route="/ocr-pdf" class="docs-action-link secondary">
          <span>Make Scans Searchable</span>
        </a>
      </div>
    </article>

    <!-- Chapter 5 -->
    <article class="docs-chapter" id="ch-redaction" data-category="security">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-safety">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Chapter 5 • Security Priority
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          3 min read
        </span>
      </div>

      <h2 class="docs-chapter-title">Permanent Vector Redaction vs. Cosmetic "Black Boxes"</h2>
      <p class="docs-chapter-desc">
        Learn why drawing a black rectangle over sensitive text is dangerous and how LetsEdit protects you from data breaches.
      </p>

      <div class="docs-callout warning">
        <div class="docs-callout-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="docs-callout-text">
          <strong>The "Black Box" Trap:</strong> Drawing a black annotation or shape over confidential text in standard PDF viewers does <em>not</em> delete the text. Anyone who opens the file can press <kbd class="docs-kbd">Ctrl+C</kbd> to copy the text underneath, or simply select and delete the black box.
        </div>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">✓</span>
          <h3 class="docs-step-title">How LetsEdit True Redaction Protects You</h3>
        </div>
        <p class="docs-step-body">
          When you use LetsEdit's <a href="/redact-pdf" class="docs-inline-link">Redact PDF</a> tool, our WebAssembly engine permanently removes the underlying font glyphs, character coordinates, and stream instructions from the document. The text is mathematically purged and cannot be recovered by any software or forensic tool.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Automated Pattern Search &amp; Redact</h3>
        </div>
        <p class="docs-step-body">
          Need to sanitize an entire 100-page document? Use the <strong>Auto-Redact Pattern Matcher</strong> to automatically find and redact all Social Security Numbers (SSNs), credit card numbers, email addresses, and phone numbers in one sweep.
        </p>
      </div>

      <div class="docs-action-bar">
        <a href="/redact-pdf" data-route="/redact-pdf" class="docs-action-link">
          <span>Open Redact Tool</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </article>

    <!-- Chapter 6 -->
    <article class="docs-chapter" id="ch-signatures" data-category="signatures">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-legal">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Chapter 6 • Legally-Binding E-Signatures
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          3 min read
        </span>
      </div>

      <h2 class="docs-chapter-title">Signing PDFs &amp; Requesting Signatures from Others</h2>
      <p class="docs-chapter-desc">
        Create compliant, legally binding electronic signatures under the U.S. ESIGN Act and EU eIDAS regulations.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Three Ways to Create Your Signature</h3>
        </div>
        <p class="docs-step-body">
          Open <a href="/sign-pdf" class="docs-inline-link">Sign PDF</a>. You can choose from three flexible methods:
          <br>&bull; <strong>Draw:</strong> Sign smoothly using your mouse, trackpad, or touchscreen with Bezier curve ink smoothing.
          <br>&bull; <strong>Type:</strong> Enter your full legal name and choose from curated calligraphic legal script fonts.
          <br>&bull; <strong>Upload:</strong> Take a photo of your signature on paper; our tool automatically removes background paper shadows.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Dispatch Signature Requests</h3>
        </div>
        <p class="docs-step-body">
          Need clients or vendors to sign? Use <a href="/sign-request" class="docs-inline-link">Request Signatures</a> to define signer emails, place required signature, initial, and date fields on any page, and dispatch signing links with automatic reminders.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">3</span>
          <h3 class="docs-step-title">Cryptographic Audit Certificate</h3>
        </div>
        <p class="docs-step-body">
          Every signed document includes a verifiable cryptographic hash (SHA-256), timestamp, IP record, and tamper-evident audit certificate appended to the final PDF for full legal compliance.
        </p>
      </div>

      <div class="docs-action-bar">
        <a href="/sign-pdf" data-route="/sign-pdf" class="docs-action-link">
          <span>Sign a Document</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/sign-request" data-route="/sign-request" class="docs-action-link secondary">
          <span>Request Signatures</span>
        </a>
      </div>
    </article>

    <!-- Chapter 7 -->
    <article class="docs-chapter" id="ch-forms" data-category="forms">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-forms">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6M7 16h8"/></svg>
          Chapter 7 • Interactive Forms
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          2 min read
        </span>
      </div>

      <h2 class="docs-chapter-title">Filling Interactive AcroForms &amp; Permanent Flattening</h2>
      <p class="docs-chapter-desc">
        Fill government paperwork, tax forms, and job applications without printing, and lock your answers permanently.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Smart Field Detection</h3>
        </div>
        <p class="docs-step-body">
          When you upload an official PDF containing interactive form fields (such as IRS W-9 or immigration forms), LetsEdit highlights text inputs, checkboxes, radio options, and dropdown lists in clear interactive blue overlays.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Why Flattening Your Form is Essential</h3>
        </div>
        <p class="docs-step-body">
          Before emailing or submitting a completed form, use <a href="/flatten-pdf" class="docs-inline-link">Flatten PDF</a>.
          Flattening bakes your typed answers and checkboxes directly into the permanent page artwork. This prevents recipients from accidentally or intentionally altering your entries.
        </p>
      </div>

      <div class="docs-action-bar">
        <a href="/edit_pdf" data-route="/edit_pdf" class="docs-action-link">
          <span>Fill a Form in Studio</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/flatten-pdf" data-route="/flatten-pdf" class="docs-action-link secondary">
          <span>Flatten Form Fields</span>
        </a>
      </div>
    </article>

    <!-- Chapter 8 -->
    <article class="docs-chapter" id="ch-bates" data-category="legal">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-bates">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Chapter 8 • Discovery &amp; Legal
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          2 min read
        </span>
      </div>

      <h2 class="docs-chapter-title">Legal Bates Numbering Suite for Litigation &amp; Audits</h2>
      <p class="docs-chapter-desc">
        Standardized sequence indexing for law firms, litigators, and regulatory discovery productions.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Prefixes, Suffixes &amp; Zero-Padding</h3>
        </div>
        <p class="docs-step-body">
          Open <a href="/bates-numbering" class="docs-inline-link">Bates Numbering</a>. Specify your case prefix (such as <code>CASE-2026-</code> or <code>EXHIBIT-</code>), starting sequence number (e.g. <code>1</code>), and zero-padding digits (e.g. 6 digits produces <code>CASE-2026-000001</code>).
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">6-Zone Precision Margin Placement</h3>
        </div>
        <p class="docs-step-body">
          Select from 6 standardized header and footer zones (Top-Left, Top-Center, Top-Right, Bottom-Left, Bottom-Center, Bottom-Right). Smart margin offsets ensure your Bates numbers never collide with existing page numbers or letterhead.
        </p>
      </div>

      <div class="docs-action-bar">
        <a href="/bates-numbering" data-route="/bates-numbering" class="docs-action-link">
          <span>Apply Bates Numbering</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </article>

    <!-- Chapter 9 -->
    <article class="docs-chapter" id="ch-shortcuts" data-category="shortcuts">
      <div class="docs-chapter-meta">
        <span class="docs-chapter-tag tag-shortcuts">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="m9 9 3 3-3 3M13 15h2"/></svg>
          Chapter 9 • Pro Reference
        </span>
        <span class="docs-read-time">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Quick Reference
        </span>
      </div>

      <h2 class="docs-chapter-title">Studio Keyboard Shortcuts Cheat Sheet</h2>
      <p class="docs-chapter-desc">
        Accelerate your editing workflow with fast one-key shortcuts inside the LetsEdit Studio.
      </p>

      <div class="docs-shortcut-wrapper">
        <table class="docs-shortcut-table">
          <thead>
            <tr>
              <th style="width: 220px;">Shortcut</th>
              <th style="width: 180px;">Tool / Action</th>
              <th>Description &amp; Workflow Use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">Z</kbd></td>
              <td><strong>Undo</strong></td>
              <td>Revert the most recent text modification, stamp, or drawing stroke.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">Y</kbd></td>
              <td><strong>Redo</strong></td>
              <td>Re-apply the previously undone action.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">V</kbd></td>
              <td><strong>Selection Pointer</strong></td>
              <td>Select, move, resize, or delete existing annotations and blocks.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">T</kbd></td>
              <td><strong>Text Tool</strong></td>
              <td>Double-click words to edit them or click blank space to create new text.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">D</kbd></td>
              <td><strong>Freehand Pen</strong></td>
              <td>Draw freehand smooth ink with pressure sensitivity.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">H</kbd></td>
              <td><strong>Highlighter</strong></td>
              <td>Highlight contracts with semi-transparent yellow/green ink.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">E</kbd></td>
              <td><strong>Eraser</strong></td>
              <td>Erase ink strokes and annotations with one touch.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">R</kbd></td>
              <td><strong>Rectangle Tool</strong></td>
              <td>Draw clean geometric boxes, callout borders, or redaction zones.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">F</kbd></td>
              <td><strong>Find &amp; Replace</strong></td>
              <td>Search text across all document pages and replace matches instantly.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">S</kbd></td>
              <td><strong>Download / Save</strong></td>
              <td>Export and download your finalized PDF immediately.</td>
            </tr>
            <tr>
              <td><kbd class="docs-kbd">Delete</kbd> or <kbd class="docs-kbd">Backspace</kbd></td>
              <td><strong>Delete Item</strong></td>
              <td>Delete the currently selected object, image, or annotation.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="docs-action-bar">
        <a href="/edit_pdf" data-route="/edit_pdf" class="docs-action-link">
          <span>Launch Studio &amp; Start Editing</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </article>
  `;
}
