# PDF Studio & Editor

A high-performance, full-featured web-based PDF Editor built with pure client-side vector compilation, inspired by the reverse-engineered architecture of [Sejda.com](https://www.sejda.com/).

![Application Preview](preview.png)

---

## 🚀 Key Capabilities

### 1. Multi-Layer Compositing Engine
* **Layer 1: PDF.js Base Canvas (`pdf-page-canvas`):** High-DPI canvas rendering of the source document pages.
* **Layer 2: Text Layer (`pdf-text-layer`):** Selectable text bounding boxes, enabling document search and inline click-to-edit.
* **Layer 3: Annotation Canvas (`pdf-annotation-canvas`):** Freehand drawing, brushes, and highlighters.
* **Layer 4: Interactive DOM Layer (`pdf-dom-layer`):** Interactive draggable elements, form controls, signatures, whiteouts, and images.

---

### 2. The 9 Core Tools
1. **Cursor (`select`):** Select, drag, reposition, and resize existing annotations.
2. **Text Tool (`text`):** 
   - Click anywhere to insert new text with customizable font size, font family, color, and alignment.
   - Click existing document text to edit inline with automatic background whiteout masking.
3. **Freehand Pen (`draw`):** Smooth handwriting sketching with customizable stroke color and line width.
4. **Highlighter (`highlight`):** Semi-transparent marker pen for highlighting text passages and clauses.
5. **Whiteout (`whiteout`):** Opaque redaction boxes to cover and hide sensitive information.
6. **Shapes (`shape`):** Draw Rectangles, Circles/Ellipses, Lines, and Directional Arrows.
7. **Signatures (`sign`):**
   - **Draw:** Touch/mouse signature pad with customizable ink colors (navy, black, blue, green).
   - **Type:** Convert typed name into calligraphic cursive signatures (*Caveat*, *Dancing Script*, *Great Vibes*).
   - **Upload:** Place an existing signature PNG or JPEG.
8. **Images (`image`):** Upload logos, graphics, and stamps directly onto any page.
9. **Form Controls (`form`):** Add interactive Text Inputs, Checkboxes, and Radio Buttons.
10. **Find & Replace (`replace`):** Document-wide text searching with visual highlights and batch replacement.

---

### 3. Page Management & Sidebar
* **Thumbnails Drawer:** Visual previews of each page with real-time rendering.
* **Page Operations:** Rotate 90° clockwise/counter-clockwise, Delete individual pages, Reorder pages.
* **Zoom Controls:** Dynamic zoom scaling from 40% to 300% with crisp vector text re-rendering.
* **Undo & Redo:** Full 30-level history stack (`Ctrl+Z` / `Ctrl+Y`).

---

### 4. Pure Vector PDF Export
Uses **`pdf-lib`** to recompile all user edits (text changes, drawings, redactions, signatures, shapes, form controls, and page rotations/deletions) directly into a vector PDF file. Maintains crisp font outlines without rasterizing pages into images.

---

### 5. Sejda-Inspired Authentication
* **Cloudflare Turnstile:** Interactive bot verification check.
* **Enterprise SSO Domain Detection:** Automatically detects corporate domains (`@acme.com`, `@company.com`, etc.) on debounced email input and switches the UI from password mode to Single Sign-On.
* **Step-Up 2FA:** Adaptive email verification challenge code dialog.
* **Social OAuth:** One-click Google and Microsoft Azure AD login triggers.
* **Session Persistence:** Remembers user session in `localStorage`.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Run Locally
```bash
# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173/)
npm run dev

# Build production bundle
npm run build
```

---

## 📁 Repository Structure
```
/home/codxbrexx/Pdf-Editor/
├── index.html                           # App markup, toolbar, and modal dialogs
├── package.json                         # Vite, pdf-lib, pdfjs-dist dependencies
├── src/
│   ├── main.js                          # Main application orchestrator
│   ├── style.css                        # Modern CSS design system & typography
│   ├── core/
│   │   ├── pdf-engine.js                # PDF.js render & pdf-lib vector exporter
│   │   ├── canvas-manager.js            # Multi-layer canvas compositing engine
│   │   └── state-store.js               # Reactive document state & undo/redo
│   ├── tools/
│   │   ├── signature-tool.js            # Draw, Type & Upload signature modal
│   │   ├── image-tool.js                # Graphic & stamp insertion
│   │   ├── form-tool.js                 # Interactive form controls
│   │   └── search-replace.js            # Global find & replace
│   ├── components/
│   │   ├── sidebar.js                   # Thumbnails navigator & page actions
│   │   ├── auth-modal.js                # Turnstile, SSO & 2FA login modal
│   │   └── toast.js                     # Animated toast notifications
│   └── utils/
│       └── helpers.js                   # Coordinate conversions & file helpers
└── reference/                           # Reverse-engineered Sejda reference assets
    ├── sejda-login.js                   # Extracted and formatted Sejda login client JS
    ├── sejda-login-form.html            # Extracted login markup
    ├── sejda-editor-toolbar.html        # Extracted editor toolbar markup
    └── sejda-decoded-strings.json       # All 2,070 decoded internal strings
```
