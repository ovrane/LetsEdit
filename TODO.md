# LetsEdit — Contributor Task Board & Organizational Overview

> **Goal:** Make PDF editing completely free for everyone, forever.
> This document tells contributors exactly what's built, what's missing, and what to work on next.
> Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) first for setup, standards, and PR rules.

---

## Organizational Overview

```
LetsEdit (letsedit.web.app)
│
├── MISSION
│   └── Beat Adobe, Sejda, Smallpdf, and iLovePDF on every feature
│       while being 100% free, 100% private, 100% in-browser
│
├── ARCHITECTURE LAYERS
│   ├── Engine Layer      → src/core/         (PDF processing, state, routing)
│   ├── UI Layer          → src/components/   (modals, landing, sidebar)
│   ├── Tool Layer        → src/tools/        (canvas tools: sign, draw, form)
│   ├── React Layer       → src/react/        (Navbar, hero, landing UI)
│   ├── Server Layer      → server/           (auth API, watermark preview)
│   └── Build Layer       → vite.config.js    (bundling, code splitting)
│
├── CURRENT STATE (as of Nov 2026)
│   ├── 52+ PDF tools implemented
│   ├── 458 automated unit tests (100% passing)
│   ├── 24 Playwright E2E tests (100% passing)
│   ├── Firebase Auth (Google SSO)
│   ├── PWA / Offline support
│   ├── 279 prerendered SEO routes
│   └── ~8 major features still missing (see tasks below)
│
└── COMPETITIVE TARGETS
    ├── Sejda PDF       → https://www.sejda.com/     (primary reference)
    ├── iLovePDF        → https://www.ilovepdf.com/  (workflow reference)
    ├── Adobe Acrobat   → https://www.adobe.com/acrobat (UI/UX reference)
    └── Smallpdf        → https://smallpdf.com/       (UX reference)
```

---

## Completed Features — Do Not Reimplement

<details>
<summary>Expand to view — 52 completed tools and features</summary>

### Core PDF Engine (all 100% client-side, zero uploads)
| # | Tool | Route | Status |
|---|------|-------|--------|
| 1 | PDF Editor (WYSIWYG canvas) | `/pdf-editor` | Done |
| 2 | Merge PDF | `/merge-pdf` | Done |
| 3 | Split by Pages / Ranges | `/split-pdf` | Done |
| 4 | Split in Half (book scans) | `/split-pdf-down-the-middle` | Done |
| 5 | Split by Bookmarks | `/split-bookmarks` | Done |
| 6 | Split by Size | `/split-size` | Done |
| 7 | Split by Text | `/split-text` | Done |
| 8 | Alternate & Mix (duplex scanner) | `/alternate-mix-pdf` | Done |
| 9 | Organize Pages (visual grid) | `/organize-pdf` | Done |
| 10 | Extract Pages | `/extract-pdf-pages` | Done |
| 11 | Delete Pages | `/delete-pdf-pages` | Done |
| 12 | Rotate Pages | `/rotate-pdf` | Done |
| 13 | Compress PDF | `/compress-pdf` | Done |
| 14 | Crop PDF (auto whitespace detect) | `/crop-pdf` | Done |
| 15 | Resize & Margins | `/resize-pdf` | Done |
| 16 | Flip / Mirror Pages | `/flip-pdf` | Done |
| 17 | Deskew & Straighten | `/deskew-pdf` | Done |
| 18 | N-Up Imposition (2-up / 4-up) | `/n-up-pdf` | Done |
| 19 | Grayscale PDF | `/grayscale-pdf` | Done |
| 20 | Watermark (text + image) | `/watermark-pdf` | Done |
| 21 | Page Numbers / Header & Footer | `/pagenumbers-pdf` | Done |
| 22 | Bates Numbering (legal) | `/bates-numbering-pdf` | Done |
| 23 | Protect & Encrypt (AES-256) | `/encrypt-pdf` | Done |
| 24 | Unlock PDF | `/unlock-pdf` | Done |
| 25 | Flatten AcroForms | `/flatten-pdf` | Done |
| 26 | Sanitize Document | `/sanitize-pdf` | Done |
| 27 | Permanent Redaction | `/redact-pdf` | Done |
| 28 | OCR PDF (placeholder) | `/ocr-pdf` | Placeholder |
| 29 | PDF to PDF/A (1b only) | `/pdf-to-pdfa` | Partial |
| 30 | PDF to JPG / PNG | `/pdf-to-jpg` | Done |
| 31 | PDF to Word DOC | `/pdf-to-word` | Done |
| 32 | PDF to Excel / CSV | `/pdf-to-excel` | Done |
| 33 | PDF to PowerPoint | `/pdf-to-ppt` | Done |
| 34 | PDF to Plain Text | `/extract-text-from-pdf` | Done |
| 35 | Images to PDF | `/jpg-to-pdf` | Done |
| 36 | HTML to PDF | `/html-to-pdf` | Done |
| 37 | Word DOCX to PDF | `/word-to-pdf` | Done |
| 38 | Excel to PDF | `/excel-to-pdf` | Done |
| 39 | PowerPoint to PDF | `/ppt-to-pdf` | Done |
| 40 | Extract Embedded Images | `/extract-images-pdf` | Done |
| 41 | Remove Annotations | `/remove-annotations-pdf` | Done |
| 42 | Repair Corrupted PDF | `/repair-pdf` | Done |
| 43 | Edit Metadata | `/edit-pdf-metadata` | Done |
| 44 | Create Bookmarks | `/create-bookmarks` | Done |
| 45 | Compare PDF (text diff) | `/compare-pdf` | Partial |
| 46 | Fill & Sign | `/sign-pdf` | Done |
| 47 | Create Forms (AcroForms) | `/create-pdf-forms` | Done |
| 48 | Link Hotspots | (in editor) | Done |
| 49 | Find & Replace | `/search-replace-pdf` | Done |
| 50 | Business Stamps | (in editor) | Done |
| 51 | Smart Rename by Content | `/rename-pdf` | Done |
| 52 | Mobile Camera Pairing (basic) | `/mobile-pair` | Partial |

### Platform Features
| Feature | Location | Status |
|---------|----------|--------|
| Firebase Google Auth | `src/components/auth-modal.js` | Done |
| Dark / Light theme | `src/utils/theme.js` | Done |
| PWA / Offline | `src/core/pwa-manager.js` | Done |
| Service Worker | `public/sw.js` | Done |
| Autosave recovery | `src/main.js` | Done |
| SPA router (56 routes) | `src/core/router.js` | Done |
| 279-route SEO prerender | `scripts/prerender-seo.js` | Done |
| Cloudflare Turnstile | `server/routes/` | Done |
| 150+ font catalog | `src/core/font-registry.js` | Done |
| Text Clustering Engine | `src/core/canvas/text-clustering.js` | Done |
| 8-Point Resize Gizmo | `src/core/canvas/resize-gizmo.js` | Done |
| Floating Bubble Toolbar | `src/core/canvas/bubble-toolbar.js` | Done |
| Tool Options Sidebar | `src/components/tool-options-panel.js` | Done |

</details>

---

## Open Tasks

Each task has:
- **Difficulty:**  Easy /  Medium /  Hard
- **Impact:**  Important /  Critical
- **Exact files to edit** — file paths are specified precisely

---

### TASK-001 — Real Tesseract WASM OCR Engine
**Priority:**  Critical | **Difficulty:**  Hard | **Label:** `feature/ocr`

**Problem:** The current OCR at `/ocr-pdf` is a placeholder that only injects dummy invisible text. Scanned PDFs don't actually become searchable.

**What to build:**
- Load [Tesseract.js](https://github.com/naptha/tesseract.js) WASM worker dynamically when OCR is triggered
- Support 12+ languages: English, Spanish, French, German, Italian, Chinese, Japanese, Arabic, Hindi, Portuguese, Russian, Korean
- Extract character/word bounding boxes (hOCR format)
- Inject invisible vector text layer (PDF rendering mode 3 `Tr=3`) at correct page coordinates
- Show per-page progress (Page 1/5... Page 2/5...)
- Output: scanned PDFs become fully searchable and copy-pasteable

**Exact files to edit:**
```
src/core/engine/extraction-ocr.js     ← Main OCR logic (currently placeholder)
src/components/ocr-modal.js           ← Wire language selector to real worker
src/components/workflow/workspace-options.js ← Language dropdown UI
tests/ocr-engine.test.js              ← Add real tests
```

**Acceptance criteria:**
- [ ] Upload a scanned PDF (image-only), run OCR → PDF text becomes selectable
- [ ] Language selector actually changes Tesseract language pack
- [ ] Progress indicator updates per-page during processing
- [ ] 100% client-side — no server calls
- [ ] At least 3 unit tests added

**Reference:** [plan.md — Starting Point 3](./plan.md) · [Tesseract.js docs](https://github.com/naptha/tesseract.js)

---

### TASK-002 — PDF/A Multi-Profile Conformance (2b and 3b)
**Priority:**  Critical | **Difficulty:**  Hard | **Label:** `feature/pdfa`

**Problem:** Current PDF/A conversion only outputs PDF/A-1b. Government, legal, and archival use cases need PDF/A-2b (transparency support) and PDF/A-3b (embedded file attachments, ZUGFeRD invoices).

**What to build:**
- Profile selector UI: `PDF/A-1b` / `PDF/A-2b` / `PDF/A-3b`
- ISO-compliant XMP metadata packet embedding:
  ```xml
  <pdfaid:part>2</pdfaid:part>
  <pdfaid:conformance>B</pdfaid:conformance>
  ```
- For PDF/A-3b: embed arbitrary file attachment (XML, JSON) with `AFRelationship`
- On-screen validation report: verify `OutputIntents`, color spaces, font embedding
- Embedded ICC color profile (sRGB) in `OutputIntents`

**Exact files to edit:**
```
src/core/engine/repair-compare.js      ← Add PDF/A-2b and 3b output logic
src/components/pdfa-modal.js           ← Add profile selector UI
src/components/workflow/workspace-options.js ← Wire profile option
tests/pdf-export.test.js              ← Add conformance tests
```

**Acceptance criteria:**
- [ ] Profile selector appears in PDF/A tool workspace
- [ ] Output PDF passes [veraPDF](https://verapdf.org/) online validator for chosen profile
- [ ] Validation report shows pass/fail on screen
- [ ] No server calls — 100% client-side

**Reference:** [plan.md — Starting Point 1](./plan.md) · ISO 19005-2 and 19005-3 specifications

---

### TASK-003 — Visual Side-by-Side Compare with Wipe Slider
**Priority:**  Critical | **Difficulty:**  Medium | **Label:** `feature/compare`

**Problem:** Current Compare PDF only shows a text diff. No visual rendering comparison exists. iLovePDF and Adobe both have a visual slider.

**What to build:**
- Side-by-side synchronized scroll viewport (Document A left, Document B right)
- Interactive drag **wipe slider** revealing A behind B in real time
- **Opacity blend slider** (0%–100%) to overlay one PDF on top of the other
- Highlight changed regions with a colored overlay
- Keep existing text diff view — add visual tabs: `[Text Diff] [Visual Compare]`

**Exact files to edit:**
```
src/components/compare-modal.js        ← Add visual tab, wipe slider UI
src/core/engine/repair-compare.js      ← Add page-to-canvas visual render
src/styles/studio-controls.css         ← Wipe slider and overlay styles
```

**Acceptance criteria:**
- [ ] Upload two PDFs → can switch between "Text Diff" and "Visual Compare" tabs
- [ ] Wipe slider drags smoothly and shows both documents
- [ ] Opacity blend slider works from 0% to 100%
- [ ] Works on mobile touch screens

**Reference:** [plan.md — Starting Point 2](./plan.md) · [Adobe Compare tool](https://www.adobe.com/acrobat/online/compare-pdf.html)

---

### TASK-004 — EPUB to PDF Conversion
**Priority:**  Important | **Difficulty:**  Hard | **Label:** `feature/epub-to-pdf`

**Problem:** EPUB is the most popular ebook format. No free client-side converter exists. All current tools (Smallpdf, iLovePDF) require server upload.

**What to build:**
- Parse EPUB3 container (`META-INF/container.xml` → OPF manifest → XHTML spine)
- Extract chapters, images, CSS styling
- Render to PDF pages using `pdf-lib` with:
  - Chapter headings, body text, images
  - Page breaks between chapters
  - Embedded cover image as first page
- Use `JSZip` to unpack EPUB (it's a ZIP archive)
- Add route `/epub-to-pdf` and workflow config

**Exact files to edit:**
```
src/core/engine/page-ops.js            ← Add epubToPdf() method
src/components/tool-workflow.js        ← Add 'epub-to-pdf' to WORKFLOW_TOOLS_CONFIG
src/core/router.js                     ← Add /epub-to-pdf route
scripts/generate-sitemap.js            ← Add URL
tests/pdf-export.test.js              ← Add conversion test
```

**Acceptance criteria:**
- [ ] Upload `.epub` file → download valid PDF
- [ ] Chapter headings rendered as H1/H2 with larger font
- [ ] Images appear in correct positions
- [ ] 100% client-side using JSZip + pdf-lib
- [ ] At least 2 unit tests

---

### TASK-005 — PDF to EPUB Conversion
**Priority:**  Important | **Difficulty:**  Hard | **Label:** `feature/pdf-to-epub`

**Problem:** Reverse of TASK-004. Convert PDF documents into EPUB for ebook readers (Kindle, Kobo, Apple Books). No free client-side converter exists.

**What to build:**
- Extract text clusters and headings from PDF using existing `TextClustering` engine
- Detect chapter boundaries (large bold text = new chapter)
- Package as valid EPUB3 structure:
  - `META-INF/container.xml`
  - `OEBPS/content.opf` (OPF manifest)
  - `OEBPS/toc.ncx` (table of contents)
  - `OEBPS/chapter_N.xhtml` (one per chapter)
- Bundle with JSZip and download as `.epub`

**Exact files to edit:**
```
src/core/engine/page-ops.js            ← Add pdfToEpub() method
src/components/tool-workflow.js        ← Add 'pdf-to-epub' workflow config
src/core/router.js                     ← Add /pdf-to-epub route
tests/pdf-export.test.js              ← Add test
```

**Acceptance criteria:**
- [ ] Upload PDF → download valid `.epub` file
- [ ] File opens in Calibre / Apple Books without errors
- [ ] Headings appear in table of contents
- [ ] 100% client-side

---

### TASK-006 — Accessibility (ARIA + Full Keyboard Navigation)
**Priority:**  Important | **Difficulty:**  Medium | **Label:** `a11y`

**Problem:** LetsEdit is currently not accessible to screen reader users or keyboard-only users. This excludes millions of users with visual or motor disabilities.

**What to build:**
- Add `role`, `aria-label`, `aria-expanded`, `aria-disabled` to all interactive elements
- Fix focus order — Tab key should navigate logically through the UI
- All modals must trap focus (Tab cycles inside modal, Escape closes it)
- All buttons that only have SVG icons need `aria-label="Button purpose"`
- Toolbar tool buttons need `aria-pressed="true/false"` for active state
- Color inputs need accessible labels
- Error messages must use `role="alert"` so screen readers announce them
- Add skip-to-content link at top of page

**Exact files to edit:**
```
index.html                             ← ARIA labels on all toolbar buttons
src/components/auth-modal.js           ← Modal focus trap + ARIA
src/components/watermark-modal.js      ← ARIA + focus management
src/components/sidebar.js             ← Page thumbnails need alt text
src/style.css                          ← :focus-visible styles (no outline removal)
```

**Acceptance criteria:**
- [ ] Entire app can be operated with keyboard only (no mouse)
- [ ] VoiceOver / NVDA reads button purposes correctly
- [ ] No `outline: none` without a `focus-visible` replacement
- [ ] All modals trap focus correctly
- [ ] Lighthouse Accessibility score ≥ 90

---

### TASK-007 — Internationalization (i18n) Framework
**Priority:**  Important | **Difficulty:**  Medium | **Label:** `i18n`

**Problem:** LetsEdit is English-only. This excludes Spanish (500M speakers), French, Arabic, Hindi, Chinese, and dozens of other language communities.

**What to build:**
- Choose and implement i18n approach (recommended: simple JSON translation files + vanilla JS)
- Extract all user-visible strings from all components to `src/i18n/en.json`
- Create `src/i18n/es.json` (Spanish) as the first translation
- Add language selector dropdown to the top navbar
- Persist selected language in `localStorage`
- Make translation loading lazy (only load selected language file)

**Priority strings to translate first:**
- Landing page hero, CTAs, tool names, tool descriptions
- Toolbar button labels and tooltips
- Modal titles, button labels, error messages
- Toast notification messages

**Exact files to edit:**
```
src/i18n/en.json                       ← CREATE: English base strings
src/i18n/es.json                       ← CREATE: Spanish translation
src/utils/i18n.js                      ← CREATE: t() translation helper
src/main.js                            ← Wire language init
src/components/landing-page.js         ← Replace hardcoded strings with t()
index.html                             ← lang attribute, language selector
```

**Acceptance criteria:**
- [ ] Switching to Spanish changes all UI strings
- [ ] Language selection persists across page reload
- [ ] English is default and complete
- [ ] Spanish translation covers at least landing page + tool names
- [ ] No layout breakage from longer translated strings

---

### TASK-008 — Smart Table Extraction to Real Excel
**Priority:**  Important | **Difficulty:**  Medium | **Label:** `feature/table-extract`

**Problem:** Current "PDF to Excel" tool just dumps raw text. It does not detect table structure (rows, columns, cell boundaries). The output is a plain text CSV with no grid structure.

**What to build:**
- Analyze `TextClustering` output to detect table rows (items at similar Y positions)
- Group into columns (items at similar X positions with consistent spacing)
- Detect header row (bold/larger font size)
- Generate properly structured XLSX using [SheetJS (xlsx)](https://github.com/SheetJS/sheetjs)
- Output `.xlsx` file instead of plain `.csv`
- Show preview of detected table structure before download

**Exact files to edit:**
```
src/core/engine/extraction-ocr.js      ← Add detectTableStructure() method
src/components/tool-workflow.js        ← Update pdf-to-excel config for XLSX output
src/core/pdf-engine.js                ← Update extractToExcel() method
tests/pdf-export.test.js              ← Add table detection tests
```

**Acceptance criteria:**
- [ ] Upload PDF with a table → download `.xlsx` with proper rows and columns
- [ ] Header row detected and formatted as bold in Excel
- [ ] Multi-page tables are concatenated
- [ ] 100% client-side using SheetJS
- [ ] At least 2 unit tests

---

### TASK-009 — Fix CSS Preload `crossorigin` Warning
**Priority:**  Important | **Difficulty:**  Easy | **Label:** `bug/preload`

**Problem:** The browser logs this warning on every page load:
```
The resource /assets/index-XXX.css was preloaded using link preload
but not used within a few seconds from the window's load event.
```

The CSS `<link rel="preload" as="style">` injected by `scripts/prerender-seo.js` is missing `crossorigin="anonymous"`, causing a credentials-mode mismatch.

**What to fix:**
```
scripts/prerender-seo.js  (line ~33)
```

Change:
```js
const cssPreload = `  <link rel="preload" as="style" href="${cssMatch[1]}">\n`;
```
To:
```js
const cssPreload = `  <link rel="preload" as="style" crossorigin="anonymous" href="${cssMatch[1]}">\n`;
```

**Acceptance criteria:**
- [ ] Run `npm run build`
- [ ] Check `dist/index.html` — CSS preload has `crossorigin="anonymous"`
- [ ] Browser console shows no preload warning
- [ ] All 458 tests still pass

---

### TASK-010 — Digital Signature Certificate (Cryptographic Audit Sheet)
**Priority:**  Important | **Difficulty:**  Hard | **Label:** `feature/signature-cert`

**Problem:** iLovePDF generates a cryptographic audit certificate (PDF) attached to signed documents. LetsEdit has signatures but no verifiable audit trail.

**What to build:**
- After signing a document, append a final "Audit Certificate" page to the PDF
- Certificate contains:
  - Document title, signer name/email, timestamp (ISO 8601)
  - SHA-256 hash of the signed document bytes
  - Geolocation (optional, with user consent)
  - QR code linking to a self-verifiable hash page
  - LetsEdit branding, legal compliance statement (ESIGN Act, eIDAS)
- Generate QR code client-side using a lightweight WASM/JS library

**Exact files to edit:**
```
src/tools/signature-tool.js           ← Add generateAuditCertificate() call after sign
src/core/engine/exporter.js           ← Add appendAuditCertificate() method
src/components/tool-workflow.js       ← Add audit cert option to sign workflow
tests/pdf-export.test.js             ← Add audit cert tests
```

**Acceptance criteria:**
- [ ] After signing → PDF has an extra page with the audit certificate
- [ ] Certificate shows SHA-256 hash of document
- [ ] Certificate shows timestamp and signer info
- [ ] QR code is scannable and links to valid URL
- [ ] 100% client-side

---

### TASK-011 — Advanced Mobile Camera QR Pairing
**Priority:**  Important | **Difficulty:**  Hard | **Label:** `feature/camera-pairing`

**Problem:** Basic camera pairing exists but the WebRTC channel is incomplete. Scanning a document with your phone and having it appear instantly on the desktop PDF editor is a major iLovePDF differentiator.

**What to build:**
- Desktop generates QR code with a short session token
- Mobile scans QR → opens `letsedit.web.app/mobile-pair?token=XYZ` in phone browser
- Phone requests camera permission → shows live viewfinder
- User photographs document → image transmitted via WebRTC data channel
- Desktop receives image → auto-converts to PDF → opens in editor
- Session expires after 5 minutes (security)

**Exact files to edit:**
```
src/components/mobile-pair-modal.js   ← Desktop QR display + WebRTC receiver
src/components/mobile-pair-page.js    ← Mobile camera viewfinder + sender
src/core/router.js                    ← Verify /mobile-pair route
server/routes/                        ← WebRTC signaling server (STUN/TURN)
```

---

### TASK-012 — Dark Mode for All Modal Components
**Priority:**  Important | **Difficulty:**  Easy | **Label:** `ux/dark-mode`

**Problem:** Several newer modal components don't fully respect `[data-theme="dark"]`. They have hardcoded light backgrounds in their component-specific CSS.

**What to fix:**
- Audit every modal in `src/components/` by opening it in dark mode
- Add `[data-theme="dark"]` overrides for any component that has hardcoded light colors
- All backgrounds should use `var(--bg-primary)` / `var(--bg-secondary)`
- All text should use `var(--text-primary)` / `var(--text-muted)`
- All borders should use `var(--border)`

**Files likely to fix:**
```
src/styles/studio-controls.css
src/components/compare-modal.js       (inline styles)
src/components/ocr-modal.js           (inline styles)
src/components/extract-images-modal.js
src/components/legal-modal.js
```

**Acceptance criteria:**
- [ ] Every modal looks correct in both light and dark mode
- [ ] No hardcoded hex colors (`#ffffff`, `#f5f5f5`, `#333`) in component logic
- [ ] Toggle theme rapidly — no flash of wrong color

---

### TASK-013 — Performance: Large PDF Virtualized Rendering
**Priority:**  Important | **Difficulty:**  Medium | **Label:** `perf/large-pdf`

**Problem:** Loading a 200+ page PDF is slow because all page canvases are created upfront. The IntersectionObserver virtualization exists but needs tuning.

**What to improve:**
- Profile rendering with Chrome DevTools on a 200-page PDF
- Verify `IntersectionObserver` correctly destroys off-screen canvas contexts
- Implement a page "memory budget" — keep max 10 rendered pages in memory
- Add loading skeleton placeholders for unrendered pages (not blank white)
- Sidebar thumbnails should load lazily (only the visible 5–10 thumbnails)
- Target: smooth 60 FPS scroll on a 500-page legal document

**Exact files to edit:**
```
src/core/canvas-manager.js            ← Virtualization tuning
src/components/sidebar.js            ← Lazy thumbnail loading
```

**Acceptance criteria:**
- [ ] 500-page PDF loads initial view in under 2 seconds
- [ ] Smooth scroll with no jank (measured with Chrome FPS overlay)
- [ ] Memory usage stays under 512MB for 500-page document

---

## Task Status Summary

| Task | Title | Difficulty | Priority | Status |
|------|-------|-----------|---------|--------|
| TASK-001 | Real Tesseract WASM OCR | Hard | Critical | `open` |
| TASK-002 | PDF/A-2b & 3b Conformance | Hard | Critical | `open` |
| TASK-003 | Visual Compare Wipe Slider | Medium | Critical | `open` |
| TASK-004 | EPUB to PDF | Hard | Important | `open` |
| TASK-005 | PDF to EPUB | Hard | Important | `open` |
| TASK-006 | Accessibility (ARIA + Keyboard) | Medium | Important | `open` |
| TASK-007 | Internationalization (i18n) | Medium | Important | `open` |
| TASK-008 | Smart Table → Real Excel | Medium | Important | `open` |
| TASK-009 | Fix CSS Preload Warning | Easy | Important | `open` |
| TASK-010 | Signature Audit Certificate | Hard | Important | `open` |
| TASK-011 | Advanced Camera Pairing | Hard | Important | `open` |
| TASK-012 | Dark Mode Audit (all modals) | Easy | Important | `open` |
| TASK-013 | Large PDF Performance | Medium | Important | `open` |

---

## Project File Reference

### Core Engine Files
| File | Purpose | Key Exports |
|------|---------|-------------|
| [`src/core/pdf-engine.js`](./src/core/pdf-engine.js) | Main PDF facade — all 52 tool methods | `pdfEngine` |
| [`src/core/canvas-manager.js`](./src/core/canvas-manager.js) | WYSIWYG canvas compositing | `CanvasManager` |
| [`src/core/state-store.js`](./src/core/state-store.js) | Reactive pub/sub state | `store` |
| [`src/core/font-registry.js`](./src/core/font-registry.js) | 150+ fonts + Google Fonts | `populateFontSelect`, `loadAllEditorFonts` |
| [`src/core/pdf-crypto.js`](./src/core/pdf-crypto.js) | AES-256 / RC4 encryption | `encryptPdf` |
| [`src/core/pdf-redactor.js`](./src/core/pdf-redactor.js) | Permanent stream redaction | `redactPageContentStreams` |
| [`src/core/router.js`](./src/core/router.js) | SPA router (56 routes) | `router`, `ROUTE_DEFINITIONS` |
| [`src/core/pwa-manager.js`](./src/core/pwa-manager.js) | PWA, offline, file system API | `pwaManager` |

### Engine Sub-Modules
| File | Purpose |
|------|---------|
| [`src/core/engine/page-ops.js`](./src/core/engine/page-ops.js) | Page manipulation (merge, split, crop...) |
| [`src/core/engine/exporter.js`](./src/core/engine/exporter.js) | PDF export, annotation embedding |
| [`src/core/engine/extraction-ocr.js`](./src/core/engine/extraction-ocr.js) | Text extraction + OCR (needs real WASM) |
| [`src/core/engine/repair-compare.js`](./src/core/engine/repair-compare.js) | Repair, compare, PDF/A conversion |
| [`src/core/canvas/text-clustering.js`](./src/core/canvas/text-clustering.js) | Sejda-style baseline phrase detection |
| [`src/core/canvas/resize-gizmo.js`](./src/core/canvas/resize-gizmo.js) | 8-handle annotation transform gizmo |
| [`src/core/canvas/bubble-toolbar.js`](./src/core/canvas/bubble-toolbar.js) | Floating contextual mini-toolbar |
| [`src/core/canvas/empty-state.js`](./src/core/canvas/empty-state.js) | Upload prompt (empty canvas state) |

### UI Components
| File | Purpose |
|------|---------|
| [`src/components/tool-workflow.js`](./src/components/tool-workflow.js) | iLovePDF 3-stage pipeline for all tools |
| [`src/components/landing-page.js`](./src/components/landing-page.js) | Full landing page + hero |
| [`src/components/auth-modal.js`](./src/components/auth-modal.js) | Firebase Google OAuth |
| [`src/components/sidebar.js`](./src/components/sidebar.js) | Page thumbnail panel |
| [`src/components/compare-modal.js`](./src/components/compare-modal.js) | PDF comparison viewer |
| [`src/components/ocr-modal.js`](./src/components/ocr-modal.js) | OCR language + progress UI |
| [`src/components/watermark-modal.js`](./src/components/watermark-modal.js) | Watermark configuration |
| [`src/components/all-tools-modal.js`](./src/components/all-tools-modal.js) | Full 52-tool hub + search |
| [`src/components/tool-options-panel.js`](./src/components/tool-options-panel.js) | Right-side contextual tool inspector |

### Tools (Canvas-Integrated)
| File | Purpose |
|------|---------|
| [`src/tools/signature-tool.js`](./src/tools/signature-tool.js) | Draw / Type / Upload / Camera signature |
| [`src/tools/form-tool.js`](./src/tools/form-tool.js) | AcroForm interactive field builder |
| [`src/tools/image-tool.js`](./src/tools/image-tool.js) | Stamp and image placement |
| [`src/tools/search-replace.js`](./src/tools/search-replace.js) | Cross-document find & replace |

### Test Suites
| File | Tests | Covers |
|------|-------|--------|
| `tests/pdf-export.test.js` | Core engine | merge, split, compress, watermark, encrypt... |
| `tests/text-clustering.test.js` | Text engine | Baseline grouping, word-gap detection |
| `tests/watermark-suite.test.js` | Watermark | Text, image, mosaic, anchor positions |
| `tests/bates-suite.test.js` | Bates numbering | Legal sequential indexing |
| `tests/pagenumbers-suite.test.js` | Page numbers | Header/footer numbering |
| `tests/state-store.test.js` | State | Pub/sub store, auth state |
| `tests/search-replace.test.js` | Find & Replace | Regex, case, multi-replace |
| `tests/backend-api.test.js` | Server | Auth endpoints, PDF API |

---

## Design Reference

When building UI, reference these tools for design parity:

| Tool | URL | What to copy |
|------|-----|-------------|
| **Sejda** | [sejda.com](https://www.sejda.com/) | Toolbar layout, tool card design, workspace stages |
| **iLovePDF** | [ilovepdf.com](https://www.ilovepdf.com/) | File cards, drag-drop, batch progress |
| **Adobe Acrobat** | [adobe.com/acrobat](https://www.adobe.com/acrobat) | Premium UI polish, annotation inspector |
| **Smallpdf** | [smallpdf.com](https://smallpdf.com/) | Landing page, CTA design |

**LetsEdit design tokens:**
```css
--color-primary: #EE404C        /* Red accent */
--color-secondary: #00B4D8      /* Cyan accent */
--bg-primary: #ffffff / #1a1a1a  /* Light / Dark bg */
--text-primary: #111 / #f0f0f0  /* Light / Dark text */
--border: #e0e0e0 / #333        /* Light / Dark border */
```

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | How to contribute: setup, standards, PR rules |
| [`todo.md`](./todo.md) | Full technical implementation matrix (very detailed) |
| [`bug.md`](./bug.md) | Bug tracker and resolved issues |
| [`plan.md`](./plan.md) | Implementation priority order |
| [`LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md`](./LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md) | Competitive analysis + code recipes |
| [`LETSEDIT_AUTH_SPECIFICATION.md`](./LETSEDIT_AUTH_SPECIFICATION.md) | Auth system spec |
| [`README.md`](./README.md) | Full project README with architecture diagrams |

---

*Updated: November 2026 · 458 tests passing · 52 tools implemented · 13 open tasks*
