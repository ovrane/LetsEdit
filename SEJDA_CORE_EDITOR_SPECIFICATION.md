# Sejda.com Core PDF Editor Engine Architecture & Technical Specification

> **Source:** Reverse-engineered from live production runtime bundle `https://www.sejda.com/js/pages/pdf-editor.min.obfuscated.js?v=523` and DOM templates via REA (Reverse-Engineer-Anything).

---

## 1. High-Level Editor Architecture

Sejda's editor employs a **multi-layered compositing model** per page. Each document page is encapsulated within a `.pdf-page-wrap` container containing synchronized layers:

```
┌────────────────────────────────────────────────────────┐
│                   .pdf-page-wrap                       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 4. Interaction / Annotation Layer                │  │
│  │    (Signatures, Shapes, Images, Whiteouts)       │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 3. Form Layer (.formLayer)                       │  │
│  │    (Interactive form fields, inputs, dropdowns)  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 2. Text Layer (.textLayer)                       │  │
│  │    (Direct inline text editing & font matching)  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 1. Canvas Layer (canvas.page)                    │  │
│  │    (Base PDF page rendered via PDF.js)           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 2. The 9 Core Tools

Located in `#tools-menu` (`[data-tool="..."]`):

| Tool ID | Name | Core Capabilities |
| :--- | :--- | :--- |
| `text` | **Text** | Edit existing PDF text inline or insert new text anywhere on page. Font family, size, color, bold/italic, alignment. |
| `link` | **Links** | Create clickable rectangular link hotspots for external URLs or internal page jumps. |
| `form` | **Forms** | Add or edit form controls: Text Fields, Checkboxes, Radio Buttons, Dropdowns. Auto-detect fields via `/process/detect-form-fields`. |
| `image` | **Images** | Upload PNG/JPG images, adjust size, transparency, place stamps, or delete existing embedded images. |
| `sign` | **Sign** | Create electronic signatures: Type name, Draw with mouse/touch, Upload signature image, or Camera capture with automatic background removal. |
| `whiteout` | **Whiteout** | Place white opaque redaction boxes over content to erase text/graphics. |
| `annotate` | **Annotate** | Freehand drawing (`#drawBtn`), freehand highlight (`#highlightFreehandBtn`), and structured text highlighter. |
| `shape` | **Shapes** | Insert geometric vector shapes: Rectangle, Ellipse, Line, and Arrow. |
| `text-replace` | **Find & Replace** | Global document search (`#findText`) and text replacement (`#replaceText`) across all pages. |

---

## 3. Deep-Dive: Inline Text Editing & Font Matching

One of Sejda's standout capabilities is **editing existing PDF text in-place** without converting the entire document into an editable Word file:

### How it Works:
1. **Bounding Box Detection:** PDF.js extracts text items (`TextContent`) with glyph bounding boxes, font names, matrix transforms, and font sizes.
2. **Overlay Construction (`.textLayer`):** Elements are rendered directly over matching glyph positions.
3. **Activation on Click:** When the user clicks an existing text span with the `text` tool:
   - The element receives `.text-editable` and `contenteditable="true"`.
   - The original background glyph on the canvas is visually suppressed (using an automatic whiteout mask matched to the background color).
4. **Font Matching & Fallback:**
   - Detects original font name (`#fontOriginal`, e.g., `Calibri`, `ArialMT`, `Cambria`).
   - Checks if font is available locally or via `/css/pdf-editor/fonts.css?v=5`.
   - If missing, launches `#fontReplacementPrompt` offering the closest visual match (e.g., metric-compatible web fonts like `Carlito` for `Calibri`, `Caladea` for `Cambria`, or Google Fonts).
   - Computes baseline adjustments (`ascent/descent`, `deltaAscentScaled`).
   - Flags unsupported complex scripts (`ComplexScripts`, e.g., Arabic, Devanagari) where ligatures cannot be modified glyph-by-glyph.

---

## 4. Electronic Signatures (`#createSignatureModal`)

Sejda provides four distinct signature creation methods:
1. **Type (`type`):** Converts typed name using curated cursive script fonts (e.g., *Alex Appleseed* style handwriting).
2. **Draw (`draw`):** Smooth HTML5 `<canvas>` bezier-curve capturing for touch/mouse signatures.
3. **Upload Image (`upload`):** Upload an image file with automatic contrast adjustment.
4. **Camera Capture (`camera`):**
   - Accesses webcam via `navigator.mediaDevices.getUserMedia()`.
   - Instructs user to hold a signed paper to the camera.
   - Automatically removes background paper color (`Could not remove signature background`), isolating pure black/blue ink with transparency.

---

## 5. Page Management & Thumbnails (`#thumbs-menu`)

* **Navigation Drawer (`#navOpenBtn`):** Displays `#pdf-canvas-list-nav-side-panel` with lazy-rendered page thumbnails (`CanvasPool`).
* **Page Operations:**
  - **Reorder:** Drag-and-drop page thumbnail sorting.
  - **Rotate:** 90° clockwise/counter-clockwise (`rotate-left-page`, `rotate-right-page`).
  - **Delete:** Remove page (`delete-page`).
  - **Zoom:** Per-page and document-wide zoom levels (`zoom-in-page`, `zoom-out-page`).
  - *Safety constraint:* `"Cannot rotate pages that have changes"` / `"Cannot zoom on pages that have changes"` ensures coordinates remain locked while active annotations are in-flight.

---

## 6. Document State & Autosave Recovery

* **Storage Key:** `pdf-editor-recovery_v2` in `localStorage`.
* **State Serializer:** Periodically compiles delta operations:
  ```json
  {
    "fileId": "...",
    "pageCount": 12,
    "operations": [
      {
        "type": "text-edit",
        "page": 1,
        "rect": [120, 340, 200, 25],
        "originalText": "Annual Report 2023",
        "newText": "Annual Report 2024",
        "fontFamily": "Calibri",
        "fontSize": 14,
        "color": "#333333"
      },
      {
        "type": "signature",
        "page": 12,
        "rect": [400, 650, 150, 60],
        "dataUrl": "data:image/png;base64,..."
      }
    ]
  }
  ```
* On page load, if unsaved state is detected, prompts user with `#pdf-editor-recovery` to restore work.

---

## 7. Reference Files in Workspace

| File Path | Description |
| :--- | :--- |
| [`reference/sejda-editor-toolbar.html`](file:///home/codxbrexx/Pdf-Editor/reference/sejda-editor-toolbar.html) | Extracted HTML structure of Sejda's editor toolbar, menu items, and thumbnails drawer. |
| [`/tmp/sejda_decoded_strings.json`](file:///tmp/sejda_decoded_strings.json) | Complete dictionary of all 2,070 decoded strings extracted from Sejda's core editor engine. |
| [`SEJDA_AUTH_SPECIFICATION.md`](file:///home/codxbrexx/Pdf-Editor/SEJDA_AUTH_SPECIFICATION.md) | The authentication and login specification created in the previous step. |
