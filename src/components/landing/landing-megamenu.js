/**
 * Smallpdf-style Comprehensive Tools Grid Mega Menu HTML
 */

export function getLandingMegaMenuHtml() {
  return `
    <div class="landing-mega-menu-content" id="landing-mega-menu">
      <div class="smallpdf-mega-grid">
        <!-- Col 1: Compress & Convert -->
        <div class="smallpdf-mega-col">
          <div class="smallpdf-sec-title">Compress</div>
          <button class="smallpdf-tool-link" data-action="workflow:compress">
            <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14h6m-6-4h6m4 8h6m-6-4h6M4 6h16M4 18h4"/></svg></span>
            <span>Compress PDF</span>
          </button>

          <div class="smallpdf-sec-title" style="margin-top:14px;">Convert</div>
          <button class="smallpdf-tool-link" data-action="workflow:pdf-to-word">
            <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></span>
            <span>PDF Converter</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:ocr-pdf">
            <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg></span>
            <span>PDF OCR</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:pdfa">
            <span class="smallpdf-icon-box" style="background:#fee2e2; color:#ef4444;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
            <span>PDF to PDF/A</span>
          </button>

          <div class="smallpdf-sec-title" style="margin-top:14px;">PDF to Image</div>
          <button class="smallpdf-tool-link" data-action="workflow:to-image">
            <span class="smallpdf-icon-box" style="background:#fef3c7; color:#d97706;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
            <span>PDF to JPG</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:to-image">
            <span class="smallpdf-icon-box" style="background:#fef3c7; color:#d97706;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></span>
            <span>PDF to PNG</span>
          </button>
        </div>

        <!-- Col 2: Image to PDF & Office to PDF -->
        <div class="smallpdf-mega-col">
          <div class="smallpdf-sec-title">Image to PDF</div>
          <button class="smallpdf-tool-link" data-action="workflow:images-to-pdf">
            <span class="smallpdf-icon-box" style="background:#fef3c7; color:#d97706;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg></span>
            <span>JPG to PDF</span>
          </button>

          <div class="smallpdf-sec-title" style="margin-top:14px;">PDF to Office</div>
          <button class="smallpdf-tool-link" data-action="workflow:pdf-to-word">
            <span class="smallpdf-icon-box smallpdf-tag-word">W</span>
            <span>PDF to Word</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:pdf-to-excel">
            <span class="smallpdf-icon-box smallpdf-tag-excel">X</span>
            <span>PDF to Excel</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:pdf-to-ppt">
            <span class="smallpdf-icon-box smallpdf-tag-ppt">P</span>
            <span>PDF to PPT</span>
          </button>

          <div class="smallpdf-sec-title" style="margin-top:14px;">Office to PDF</div>
          <button class="smallpdf-tool-link" data-action="workflow:word-to-pdf">
            <span class="smallpdf-icon-box smallpdf-tag-word">W</span>
            <span>Word to PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:excel-to-pdf">
            <span class="smallpdf-icon-box smallpdf-tag-excel">X</span>
            <span>Excel to PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:ppt-to-pdf">
            <span class="smallpdf-icon-box smallpdf-tag-ppt">P</span>
            <span>PPT to PDF</span>
          </button>
        </div>

        <!-- Col 3: Convert to PDF (HTML, TXT, CSV, etc.) -->
        <div class="smallpdf-mega-col">
          <div class="smallpdf-sec-title">Convert to PDF</div>
          <button class="smallpdf-tool-link" data-action="workflow:html-to-pdf">
            <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
            <span>HTML to PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:pdf-to-text">
            <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></span>
            <span>TXT to PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:excel-to-pdf">
            <span class="smallpdf-icon-box" style="background:#dcfce7; color:#16a34a;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
            <span>CSV to PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:extract-images">
            <span class="smallpdf-icon-box" style="background:#fce7f3; color:#db2777;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg></span>
            <span>Extract Images</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:repair">
            <span class="smallpdf-icon-box" style="background:#fee2e2; color:#dc2626;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
            <span>Repair PDF</span>
          </button>
        </div>

        <!-- Col 4: Organize Pages -->
        <div class="smallpdf-mega-col">
          <div class="smallpdf-sec-title">Organize</div>
          <button class="smallpdf-tool-link" data-action="workflow:merge">
            <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg></span>
            <span>Merge PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:split">
            <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22V2"/></svg></span>
            <span>Split PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:rotate">
            <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg></span>
            <span>Rotate PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="sidebar:delete">
            <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></span>
            <span>Delete PDF Pages</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:extract-pages">
            <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg></span>
            <span>Extract PDF Pages</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:organize">
            <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
            <span>Organize PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:nup">
            <span class="smallpdf-icon-box" style="background:#ede9fe; color:#7c3aed;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg></span>
            <span>N-Up Imposition</span>
          </button>
        </div>

        <!-- Col 5: Edit & Annotate -->
        <div class="smallpdf-mega-col">
          <div class="smallpdf-sec-title">Edit</div>
          <button class="smallpdf-tool-link" data-action="tool:select">
            <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
            <span>Edit PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="tool:text">
            <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></span>
            <span>PDF Annotator</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:pagenumbers">
            <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg></span>
            <span>Number Pages</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:crop">
            <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/></svg></span>
            <span>Crop PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:redact">
            <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
            <span>Redact PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:watermark">
            <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg></span>
            <span>Watermark PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="tool:form">
            <span class="smallpdf-icon-box" style="background:#ccfbf1; color:#0d9488;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
            <span>PDF Form Filler</span>
          </button>
        </div>

        <!-- Col 6: Fill & Sign & Protect -->
        <div class="smallpdf-mega-col">
          <div class="smallpdf-sec-title">Fill & Sign</div>
          <button class="smallpdf-tool-link" data-action="workflow:sign">
            <span class="smallpdf-icon-box" style="background:#f3e8ff; color:#9333ea;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg></span>
            <span>Sign PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:sign-request">
            <span class="smallpdf-icon-box" style="background:#fef08a; color:#854d0e;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></span>
            <span>Request Signatures</span>
          </button>

          <div class="smallpdf-sec-title" style="margin-top:14px;">Protect</div>
          <button class="smallpdf-tool-link" data-action="workflow:unlock">
            <span class="smallpdf-icon-box" style="background:#fce7f3; color:#ec4899;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg></span>
            <span>Unlock PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:security">
            <span class="smallpdf-icon-box" style="background:#fce7f3; color:#ec4899;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            <span>Protect PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:flatten">
            <span class="smallpdf-icon-box" style="background:#fce7f3; color:#ec4899;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg></span>
            <span>Flatten PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:sanitize">
            <span class="smallpdf-icon-box" style="background:#dcfce7; color:#16a34a;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
            <span>Sanitize PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:bates">
            <span class="smallpdf-icon-box" style="background:#f1f5f9; color:#475569;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
            <span>Bates Numbering</span>
          </button>
        </div>

        <!-- Col 7: Scan & Smart Tools -->
        <div class="smallpdf-mega-col">
          <div class="smallpdf-sec-title">Scan</div>
          <button class="smallpdf-tool-link" data-action="workflow:scan">
            <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
            <span>PDF Scanner</span>
          </button>

          <div class="smallpdf-sec-title" style="margin-top:14px;">Smart Tools</div>
          <button class="smallpdf-tool-link" data-action="workflow:compare">
            <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7M6 9v12"/></svg></span>
            <span>Compare PDF</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:bookmarks">
            <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span>
            <span>Bookmarks</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:pagelabels">
            <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg></span>
            <span>Page Labels</span>
          </button>
          <button class="smallpdf-tool-link" data-action="workflow:resize">
            <span class="smallpdf-icon-box" style="background:#dbeafe; color:#2563eb;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>
            <span>Resize Margins</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
