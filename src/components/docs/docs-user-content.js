/**
 * User Guide & Walkthrough Documentation Content
 * Beginner-friendly explanations for core PDF operations, text editing,
 * permanent redaction, legal Bates numbering, and keyboard shortcuts.
 * Adheres strictly to the < 1,000 lines per file rule.
 */

export function getUserDocsNavHtml() {
  return `
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
  `;
}

export function getUserDocsQuickGridHtml() {
  return `
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
  `;
}

export function getUserDocsContentHtml() {
  return `
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
          <h3 class="docs-step-title">Select the Text Tool</h3>
        </div>
        <p class="docs-step-body">
          In the top toolbar or sidebar, click the <strong>Text Tool</strong> (shortcut: <kbd class="docs-kbd">T</kbd>).
          Hover your cursor over the document. You will see faint blue highlight boxes around detected words and paragraphs.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Click Directly into Any Word</h3>
        </div>
        <p class="docs-step-body">
          Double-click on any existing word. LetsEdit will place an active text cursor inside that word, match the existing font family (Helvetica, Times, Courier), font size, and color, and allow you to type immediately.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">3</span>
          <h3 class="docs-step-title">Adding New Paragraphs</h3>
        </div>
        <p class="docs-step-body">
          To add new text anywhere on a blank region of a page, simply click on that spot and begin typing. You can customize font weight, alignment, line spacing, and color from the floating properties panel.
        </p>
      </div>
    </article>

    <!-- Chapter 3 -->
    <article class="docs-chapter" id="ch-organize">
      <span class="docs-chapter-tag">Chapter 3 • Organization</span>
      <h2 class="docs-chapter-title">Merging Multiple PDFs &amp; Splitting Pages</h2>
      <p class="docs-chapter-desc">
        Combine multiple documents into one polished binder, or extract specific pages to share.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Merging Multiple PDFs</h3>
        </div>
        <p class="docs-step-body">
          Open the <a href="/merge-pdf" class="docs-inline-link">Merge PDF</a> tool. Drag and drop two or more PDF files into the dropzone. You can drag thumbnails to reorder pages or documents, choose whether to automatically generate a Table of Contents, and click <strong>Merge PDF</strong>.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Splitting by Page Range or Keywords</h3>
        </div>
        <p class="docs-step-body">
          With the <a href="/split-pdf" class="docs-inline-link">Split PDF</a> tool, you can extract custom ranges (e.g., <code>1-3, 5, 8-12</code>), burst every page into individual files, or split automatically whenever a keyword (like "Invoice #" or "Chapter") appears.
        </p>
      </div>
    </article>

    <!-- Chapter 4 -->
    <article class="docs-chapter" id="ch-convert">
      <span class="docs-chapter-tag">Chapter 4 • Conversions</span>
      <h2 class="docs-chapter-title">Converting Files to and from PDF</h2>
      <p class="docs-chapter-desc">
        Transform Word, Excel, PowerPoint, images, and HTML into high-quality PDFs, or export PDFs back into editable Office documents.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">PDF to Word &amp; Office</h3>
        </div>
        <p class="docs-step-body">
          Use <a href="/pdf-to-word" class="docs-inline-link">PDF to Word</a> to convert documents into clean <code>.docx</code> files while maintaining typography, lists, and table formatting without messy text frame artifacts.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Image Extraction &amp; OCR</h3>
        </div>
        <p class="docs-step-body">
          Need to pull out photos or charts from a PDF? Use <a href="/extract-images-pdf" class="docs-inline-link">Extract Images</a> to download all raster JPEG/PNG graphics in a ZIP file, or run <a href="/ocr-pdf" class="docs-inline-link">OCR PDF</a> to make scanned documents fully searchable.
        </p>
      </div>
    </article>

    <!-- Chapter 5 -->
    <article class="docs-chapter" id="ch-redaction">
      <span class="docs-chapter-tag">Chapter 5 • Security</span>
      <h2 class="docs-chapter-title">Permanent Vector Redaction vs. "Black Boxes"</h2>
      <p class="docs-chapter-desc">
        Learn how to safely redact sensitive information like Social Security numbers, bank details, and trade secrets.
      </p>

      <div class="docs-callout warning">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <strong>The Danger of Naive Black Boxes:</strong> Drawing a black shape over text in standard software does not delete the text. Anyone can copy the text underneath or remove the black box.
        </div>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">✓</span>
          <h3 class="docs-step-title">True Forensic Redaction</h3>
        </div>
        <p class="docs-step-body">
          LetsEdit's <a href="/redact-pdf" class="docs-inline-link">Redact PDF</a> tool permanently destroys the underlying vector character coordinates, glyph mappings, and content stream tokens. Once applied and downloaded, the text is mathematically impossible to recover.
        </p>
      </div>
    </article>

    <!-- Chapter 6 -->
    <article class="docs-chapter" id="ch-signatures">
      <span class="docs-chapter-tag">Chapter 6 • E-Signatures</span>
      <h2 class="docs-chapter-title">Legally-Binding Electronic Signatures</h2>
      <p class="docs-chapter-desc">
        Sign contracts, agreements, and NDAs with legally binding e-signatures under the U.S. ESIGN Act and EU eIDAS regulations.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Draw, Type, or Upload Signatures</h3>
        </div>
        <p class="docs-step-body">
          Open <a href="/sign-pdf" class="docs-inline-link">Sign PDF</a>. You can draw your signature with your mouse or stylus using Bezier ink smoothing, type your name using legal script fonts, or upload a photo of your signature with automatic background transparency removal.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Multi-Party Signature Requests</h3>
        </div>
        <p class="docs-step-body">
          Need a client or partner to sign? Use <a href="/sign-request" class="docs-inline-link">Request Signatures</a> to specify signers, place interactive signature and date fields on specific pages, and dispatch automated signing invitations.
        </p>
      </div>
    </article>

    <!-- Chapter 7 -->
    <article class="docs-chapter" id="ch-forms">
      <span class="docs-chapter-tag">Chapter 7 • Forms</span>
      <h2 class="docs-chapter-title">Filling and Flattening Interactive AcroForms</h2>
      <p class="docs-chapter-desc">
        Complete tax forms, job applications, and official government paperwork easily.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Interactive Field Detection</h3>
        </div>
        <p class="docs-step-body">
          When you open a PDF containing interactive fields (text inputs, checkboxes, radio buttons, dropdowns), LetsEdit highlights them automatically. Simply click and type or toggle options.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Form Flattening</h3>
        </div>
        <p class="docs-step-body">
          Before emailing or filing a completed form, run <a href="/flatten-pdf" class="docs-inline-link">Flatten PDF</a>. This renders your entered answers directly into the permanent vector artwork, preventing anyone from tampering with or editing your submitted values.
        </p>
      </div>
    </article>

    <!-- Chapter 8 -->
    <article class="docs-chapter" id="ch-bates">
      <span class="docs-chapter-tag">Chapter 8 • Discovery</span>
      <h2 class="docs-chapter-title">Legal Bates Numbering Suite</h2>
      <p class="docs-chapter-desc">
        Sequence indexing for litigators, legal teams, and regulatory filings.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Custom Prefixes &amp; Zero-Padding</h3>
        </div>
        <p class="docs-step-body">
          Open <a href="/bates-numbering" class="docs-inline-link">Bates Numbering</a>. Specify your case prefix (e.g., <code>CONF-</code> or <code>PLAINTIFF-</code>), starting number, and zero-padding digits (e.g., <code>CONF-000001</code>).
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">6-Zone Page Positioning</h3>
        </div>
        <p class="docs-step-body">
          Position numbers precisely in the top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right with automatic margin offsets to avoid overlapping existing document text.
        </p>
      </div>
    </article>

    <!-- Chapter 9 -->
    <article class="docs-chapter" id="ch-shortcuts">
      <span class="docs-chapter-tag">Chapter 9 • Reference</span>
      <h2 class="docs-chapter-title">Studio Keyboard Shortcuts</h2>
      <p class="docs-chapter-desc">
        Work at lightning speed using native keyboard hotkeys inside the interactive studio.
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
            <td>Revert your most recent edit or annotation</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">Y</kbd></td>
            <td>Redo</td>
            <td>Re-apply the undone action</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">V</kbd></td>
            <td>Select Tool</td>
            <td>Activate pointer tool to move and resize objects</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">T</kbd></td>
            <td>Text Tool</td>
            <td>Click existing text to edit or click blank space to add new text</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">D</kbd></td>
            <td>Draw / Pen</td>
            <td>Freehand smooth drawing with pressure curves</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">H</kbd></td>
            <td>Highlighter</td>
            <td>Highlight contract lines with semi-transparent ink</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">E</kbd></td>
            <td>Eraser</td>
            <td>Erase ink strokes or annotations</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">R</kbd></td>
            <td>Rectangle</td>
            <td>Draw geometric boxes and outlines</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">Ctrl</kbd> + <kbd class="docs-kbd">F</kbd></td>
            <td>Find &amp; Replace</td>
            <td>Search text across all document pages</td>
          </tr>
          <tr>
            <td><kbd class="docs-kbd">Delete</kbd></td>
            <td>Delete Object</td>
            <td>Delete the currently selected annotation, text block, or shape</td>
          </tr>
        </tbody>
      </table>
    </article>
  `;
}
