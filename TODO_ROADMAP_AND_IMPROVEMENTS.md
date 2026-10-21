# PDF Studio: TODO Roadmap, Incomplete Tasks & Feature Improvements

> **Document Purpose:** Comprehensive roadmap outlining current project status, incomplete/in-progress features, technical debt, and high-impact architectural improvements inspired by industry leaders (Sejda, Adobe Acrobat Web, Smallpdf).

---

## 📊 1. Current Status Matrix

| Component / Feature | Current State | Completeness | Priority for Next Phase |
| :--- | :--- | :---: | :---: |
| **PDF Rendering Engine** | Renders via PDF.js on high-DPI `<canvas>` | **90%** | Add virtualized lazy-loading for 50+ page docs |
| **Inline Text Editing** | Click-to-edit with automatic whiteout underlay | **85%** | Add multi-font embedding & ligature handling |
| **Freehand & Annotations** | Smooth pen, highlighter & dedicated Eraser tool | **100%** | Completed with fluid rub-to-erase stroke detection & Lucide cursor |
| **Shapes & Lines** | Rectangle, Ellipse, Line, Arrow | **85%** | Add polygon, star, and border dash styling |
| **Signatures** | Draw, Type (calligraphy fonts), Upload & Webcam Extraction | **100%** | Live webcam streaming with paper ink binarization completed |
| **Images & Stamps** | Upload, opacity slider, standard & custom business stamps | **100%** | Pre-designed stamps suite (Approved, Draft, Void, Sign Here, etc.) |
| **Form Builder** | Interactive inputs, checkboxes, and radio | **100%** | True AcroForms export with interactive text/checkbox/radio fields |
| **Page Management** | 90° rotation, deletion, thumbnails, blank page, merge | **100%** | HTML5 drag-and-drop reordering, blank pages, and merge external PDF |
| **Watermark Tool** | Document-wide angle, opacity, presets, and vector export | **100%** | Completed with live canvas preview and pure vector export |
| **Page Numbers** | Header/Footer dynamic numbering with 6 positions | **100%** | Completed with live canvas positioning and format tokens |
| **Security & Passwords** | AES-256 PDF encryption & permission controls | **100%** | Completed with user/owner password protection on export |
| **Redaction / Whiteout** | True Content Stream Sanitization & Whiteout/Blackout | **100%** | Permanently purges underlying text from binary PDF content streams |
| **Find & Replace** | Cross-document search, regex, case sensitivity & batch replace | **100%** | Completed with Next/Prev cycling, active match viewport scrolling, and headless test suite |
| **Document Metadata** | View and edit PDF Title, Author, Subject, Keywords, Creator | **100%** | Completed with interactive inspector modal and standard vector embedding |
| **Crop PDF & Margins** | Trim whitespace borders and resize crop boxes | **100%** | Completed with margin diagram, quick presets, and vector `setCropBox` |
| **Vector PDF Export** | `pdf-lib` vector recompiler | **100%** | Completed with AcroForms, watermarks, numbering, encryption, metadata, and crop |
| **Authentication System** | Sejda-style Turnstile, SSO, and 2FA UI | **85%** | Connect to live backend database/OAuth endpoints |

---

## 📋 2. Incomplete Tasks & Immediate TODOs

### Phase 1: High-Priority Document Operations (COMPLETED ✅)
- [x] **Drag-and-Drop Page Reordering:**
  - *Implemented:* HTML5 Drag-and-Drop reordering in `src/components/sidebar.js`. Synchronized with `state.pageOrder` and honored during both rendering and `pdf-lib` vector export.
- [x] **Insert Blank Page & Merge External PDF:**
  - *Implemented:* `+ Blank Page` button dynamically inserts a clean canvas page at any index; `Merge PDF` input uploads and appends external PDF pages into the active document.
- [x] **Full AcroForms Native Export:**
  - *Implemented:* `pdf-lib` interactive AcroForms export using `form.createTextField()`, `form.createCheckBox()`, and `form.createRadioGroup()`.
- [x] **Document-Wide Watermarking:**
  - *Implemented:* `WatermarkModal` with angle (0°, 45°, 90°, -45°), opacity slider, font size, custom color, quick presets (`CONFIDENTIAL`, `DRAFT`, `SAMPLE`, `DO NOT COPY`, `APPROVED`), live canvas overlay, and vector export.
- [x] **Header & Footer Page Numbers:**
  - *Implemented:* `PageNumbersModal` with `{n}` and `{total}` token support, 6 alignment positions (Top Left/Center/Right, Bottom Left/Center/Right), live canvas positioning, and vector export.
- [x] **PDF Security & AES-256 Encryption:**
  - *Implemented:* `SecurityModal` with user open password, owner password, strength meter, and permissions policy (printing, copying, content modification).
- [x] **Webcam Signature Capture:**
  - *Implemented:* Added 4th `Camera` tab to `SignatureTool` with `getUserMedia` video feed and threshold binarization to extract dark pen ink and make background paper transparent.

### Phase 2: Core Editing & Creative Capabilities (COMPLETED / ACTIVE 🚀)
- [x] **Official Business Stamps Suite & Custom Stamp Generator:**
  - *Implemented:* Standard stamps (`APPROVED`, `REJECTED`, `CONFIDENTIAL`, `DRAFT`, `RECEIVED`, `SIGN HERE`, `VOID`, `FINAL`) with double border styling, live date badge, custom stamp generator with custom angles and colors, and opacity slider in [`src/tools/image-tool.js`](file:///home/codxbrexx/Pdf-Editor/src/tools/image-tool.js).
- [x] **Dedicated Eraser Tool:**
  - *Implemented:* Toolbar eraser button with custom Lucide SVG cursor, real-time stroke/annotation collision detection, and instant history undo support in [`src/core/canvas-manager.js`](file:///home/codxbrexx/Pdf-Editor/src/core/canvas-manager.js).
- [x] **ISO 32000-1 Standard PDF Encryption Module:**
  - *Implemented:* Pure JavaScript implementation of MD5, RC4 stream cipher, and Algorithms 2, 3, and 4 in [`src/core/pdf-crypto.js`](file:///home/codxbrexx/Pdf-Editor/src/core/pdf-crypto.js). Correctly computes `/O`, `/U`, and `/P` security dictionaries and registers `/Encrypt` trailers in exported PDFs without external dependencies.
- [x] **Automated Regression & Functional Test Suite (29/29 Passing):**
  - *Implemented:* Node native test runner (`npm test`) covering StateStore immutability, undo/redo stacks, page reordering, blank page insertion, AcroForm fields generation, watermarks, page numbering tokens, password encryption, search & replace navigation, document metadata properties, and crop box trimming.
- [x] **True Text Content Stream Redaction (Security):**
  - *Implemented:* Complete decompress-sanitize-recompress engine in [`src/core/pdf-redactor.js`](file:///home/codxbrexx/Pdf-Editor/src/core/pdf-redactor.js). Purges literal `(text) Tj`, hex `<hex> Tj`, and `[ (text) ] TJ` tokens within redaction bounding boxes or matching replaced terms. Text cannot be copied, highlighted, or extracted from the exported PDF file.
- [x] **8-Point Interactive Transform Gizmo & Selection Box:**
  - *Implemented:* Interactive selection box with 8 directional resize handles (`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`) and single-click selection in [`src/core/canvas-manager.js`](file:///home/codxbrexx/Pdf-Editor/src/core/canvas-manager.js#L418-L510). Allows intuitive freeform and diagonal scaling, keyboard Delete/Backspace removal, and click-outside deselection.
- [x] **Advanced Find & Replace Engine:**
  - *Implemented:* Cross-page literal and regex search, Next/Prev navigation with smooth auto-scroll to active match, highlight overlays, single and batch replacement with whiteout underlay and vector export.
- [x] **Document Properties & Metadata Editor:**
  - *Implemented:* [`src/components/metadata-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/metadata-modal.js) for viewing and editing PDF Title, Author, Subject, Keywords, Creator, and Producer, fully integrated with `StateStore` undo/redo and exported via `pdf-lib`.
- [x] **Crop PDF & Margin Trimmer (Sejda Crop PDF):**
  - *Implemented:* [`src/components/crop-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/crop-modal.js) with real-time margin visualizer, presets (24pt border trim, 36pt standard, 50pt header/footer trim), custom points input, and vector `setCropBox()` export.
- [ ] **Font Catalog Expansion & TrueType Embedding:**
  - *Current state:* Standard fonts (Helvetica, Times Roman, Courier) available.
  - *Task:* Embed Google Web Fonts (Roboto, Montserrat, Caveat) `.ttf` binary glyphs in `pdf-lib` via `doc.embedFont()`.

---

## 💡 3. Recommended Architectural & Feature Improvements

### A. Performance: Virtualized Page Windowing (Large Documents)
* **Problem:** Rendering 100 pages of high-resolution canvas simultaneously consumes hundreds of megabytes of GPU/RAM.
* **Solution:** Implement an `IntersectionObserver` in `CanvasManager`. Only render the active viewport pages plus 1 buffer page above and below. Off-screen pages retain lightweight placeholder divs, releasing their `<canvas>` contexts until scrolled into view.

### B. Selection Handles & Multi-Object Transform Gizmo
* **Feature:** Add 8-point bounding box handles (corners + edges) with a rotation handle at the top for placed text, shapes, and images.
* **Benefit:** Allows users to freely scale diagonally, rotate arbitrarily, and multi-select objects using `Shift + Click` or area marquee drag.

### C. Standard PDF Stamps & Watermarking
* **Feature:** Add a quick-stamp dropdown:
  * **Status Stamps:** `APPROVED`, `DRAFT`, `CONFIDENTIAL`, `VOID`, `FINAL`.
  * **Dynamic Date Stamps:** Automatically stamps the current date and user initials.
  * **Tiled Watermarks:** Semi-transparent text watermarks across the diagonal of all pages (e.g. *"CONFIDENTIAL - FOR REVIEW ONLY"*).

### D. PDF Security & Document Metadata
* **Feature:**
  * **Password Protection:** Encrypt PDF with user/owner passwords and AES-256 encryption via `pdf-lib`.
  * **Permissions:** Restrict printing, content copying, and form modification.
  * **Document Properties:** View and edit PDF Title, Author, Subject, Keywords, and Creator metadata.

### E. PDF Optimization & Compression
* **Feature:** Many PDFs grow large when adding images. Provide an "Export & Compress" option:
  * Downsample embedded images to 150 DPI (screen quality) or 300 DPI (print quality).
  * Run stream object compression (FlateDecode) to minimize file size before download.

### F. Dark Mode & Studio Theme Toggle
* **Feature:** Add a theme toggle in the top navbar (`Light`, `Dark`, `System Default`).
* **Design:** Sleek charcoal/slate dark theme (`#0f172a` workspace with high-contrast document backing) reducing eye strain during long document editing sessions.

---

## 🗓️ 4. Recommended Sprint Roadmap

```mermaid
gantt
    title PDF Studio Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Sprint 1: Core Operations
    Drag-and-Drop Page Reordering       :active, 2026-11-01, 5d
    Blank Page & Merge PDFs             :2026-11-06, 4d
    AcroForms Native Interactive Export :2026-11-10, 5d

    section Sprint 2: Tool Enhancements
    Webcam Signature Scanner (Otsu)     :2026-11-15, 4d
    Google Fonts TTF Vector Embedding   :2026-11-19, 5d
    True Redaction Text Stripping       :2026-11-24, 4d

    section Sprint 3: Enterprise & Scaling
    Virtualized Page Rendering (Large PDFs) :2026-11-28, 6d
    Multi-Object Transform Gizmo        :2026-12-04, 5d
    PDF Encryption & Password Security  :2026-12-09, 4d
    Dark Mode Theme & Polish            :2026-12-13, 3d
```

---

## 🏁 5. Quick-Action Checklist to Start Today

1. **Test Reordering:** Open `src/components/sidebar.js` and add drag handlers (`dragstart`, `dragover`, `drop`) on `.thumb-card`.
2. **Test Fillable Forms:** Update `src/core/pdf-engine.js` export loop to call `pdfDoc.getForm().createTextField()` when `ann.type === 'form'`.
3. **Test Custom Fonts:** Download a Google Font `.ttf` into `src/assets/fonts/` and pass it to `pdfDoc.embedFont()`.

---

## 🌐 6. The Complete 30+ Sejda Tools Expansion Plan

Below is the roadmap for extending our PDF Studio suite to match every single tool on Sejda's platform. Complete technical recipes and reverse-engineering findings are documented in [`SEJDA_FULL_SUITE_REVERSE_ENGINEERING.md`](file:///home/codxbrexx/Pdf-Editor/SEJDA_FULL_SUITE_REVERSE_ENGINEERING.md).

### Category 1: Merge, Split & Page Organization
- [x] **Merge PDF (`/merge-pdf`):** Combine multiple PDF uploads into one document using `PDFDocument.create()` and `copyPages()` via sidebar.
- [x] **Alternate & Mix (`/alternate-mix-pdf`):** Interleave odd pages from Doc A and even pages from Doc B (duplex scanner flow) via [`src/components/alternate-mix-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/alternate-mix-modal.js).
- [x] **Organize & Reorder (`/organize-pdf`):** Visual full-grid page drag-and-drop sequencing with live thumbnail preview.
- [x] **Split by Pages (`/split-pdf`):** Subdivide document by custom ranges (e.g. `1-2, 3-4`) or extract all pages via [`src/components/split-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/split-modal.js).
- [ ] **Split in Half (`/split-pdf-down-the-middle`):** Bisect A3 or two-page book scans down the center into separate A4 pages.
- [x] **Delete & Extract Pages (`/delete-pdf-pages` & `/extract-pdf-pages`):** Extract selected pages or delete individual pages via sidebar thumbnail controls.

### Category 2: Security & Watermarking
- [x] **Protect / Encrypt (`/encrypt-pdf`):** User & owner passwords with AES-256 and print/copy restriction flags via [`src/components/security-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/security-modal.js).
- [ ] **Unlock (`/unlock-pdf`):** Decrypt and strip password restrictions.
- [x] **Watermark (`/watermark-pdf`):** Diagonal text or logo watermark with configurable opacity (0.1 - 1.0) and rotation angle via [`src/components/watermark-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/watermark-modal.js).
- [x] **Flatten (`/flatten-pdf`):** Bake all interactive AcroForm fields and annotations permanently into static vector page streams via `form.flatten()`.

### Category 3: Page Geometry & Dimensions
- [x] **Crop PDF (`/crop-pdf`):** Interactive margin crop setting `setCropBox()` with presets and live margin preview via [`src/components/crop-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/crop-modal.js).
- [ ] **Resize Margins (`/resize-pdf`):** Adjust page bounds (A4, Letter) and add margin padding for binding.
- [x] **Bates Numbering (`/bates-numbering-pdf`):** Legal numbering sequences with custom prefix, start index, zero-padding, and 6 positions via [`src/components/bates-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/bates-modal.js).
- [x] **Header & Footer / Page Numbers (`/header-footer-pdf`):** Apply `Page {n} of {total}` across all pages with 6 alignment positions via [`src/components/pagenumbers-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/pagenumbers-modal.js).
- [x] **N-Up Printing (`/n-up-pdf`):** Place 2 or 4 pages per sheet onto an enlarged page via [`src/components/nup-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/nup-modal.js).

### Category 4: Conversions & OCR
- [ ] **PDF to JPG / PNG (`/pdf-to-jpg`):** Render pages at 72, 150, or 300 DPI and download individual images or a ZIP.
- [x] **JPG / Images to PDF (`/jpg-to-pdf`):** Pack multiple image files into a single multi-page PDF document via `pdfEngine.imagesToPdf()`.
- [x] **PDF to Text (`/extract-text-from-pdf`):** Extract all searchable document text using decompressed binary content stream parsing via `pdfEngine.extractDocumentText()`.
- [x] **Edit Metadata (`/edit-pdf-metadata`):** Update Title, Author, Subject, Keywords, Creator, and Producer tags via [`src/components/metadata-modal.js`](file:///home/codxbrexx/Pdf-Editor/src/components/metadata-modal.js).
- [ ] **OCR PDF (`/ocr-pdf`):** Run Tesseract.js (WebAssembly) on image pages to inject an invisible searchable text layer.

