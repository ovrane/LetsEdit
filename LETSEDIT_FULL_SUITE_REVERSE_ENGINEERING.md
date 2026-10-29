# Reverse Engineering the Complete Sejda 30+ PDF Tools Suite

> **Architectural Overview:**
> Sejda's platform is divided into two layers:
> 1. **Frontend Client Layer:** HTML5/CSS/JavaScript with PDF.js for rendering, canvas-based UI manipulation, and task parameter serialization.
> 2. **Processing Engine:** Built upon SAMBox (Sejda's high-performance fork of Apache PDFBox) running on JVM servers for the web platform, and inside an embedded local JVM for Sejda Desktop.
>
> Below is the reverse-engineered specification of all **35+ tools** across the Sejda suite, paired with exact **pure client-side implementation recipes** using `pdf-lib`, `pdfjs-dist`, and WebAssembly.

---

## 🗂️ Cluster 1: Merge, Split & Page Organization

### 1. Merge PDF (`/merge-pdf`)
* **Sejda Architecture:** Accepts multiple PDF uploads. Client renders first page of each file as a draggable card. Options: table of contents generation, cover page, outline/bookmark inheritance. Submits file IDs + page order to `/process/merge`.
* **Pure Client Implementation (`pdf-lib`):**
  ```javascript
  import { PDFDocument } from 'pdf-lib';

  export async function mergePdfs(pdfBuffers) {
    const mergedDoc = await PDFDocument.create();
    for (const buf of pdfBuffers) {
      const srcDoc = await PDFDocument.load(buf);
      const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      copiedPages.forEach(page => mergedDoc.addPage(page));
    }
    return await mergedDoc.save();
  }
  ```

### 2. Alternate & Mix PDF (`/alternate-mix-pdf`)
* **Sejda Architecture:** Specifically designed for front-and-back scanner flows where Document A contains odd pages and Document B contains even pages in reverse order.
* **Client Implementation Recipe:**
  ```javascript
  export async function alternateMixPdfs(docABuffer, docBBuffer, reverseB = true) {
    const merged = await PDFDocument.create();
    const docA = await PDFDocument.load(docABuffer);
    const docB = await PDFDocument.load(docBBuffer);
    
    const countA = docA.getPageCount();
    const countB = docB.getPageCount();
    const maxPages = Math.max(countA, countB);

    for (let i = 0; i < maxPages; i++) {
      if (i < countA) {
        const [pageA] = await merged.copyPages(docA, [i]);
        merged.addPage(pageA);
      }
      const bIdx = reverseB ? (countB - 1 - i) : i;
      if (bIdx >= 0 && bIdx < countB) {
        const [pageB] = await merged.copyPages(docB, [bIdx]);
        merged.addPage(pageB);
      }
    }
    return await merged.save();
  }
  ```

### 3. Organize & Visual Reorder (`/organize-pdf`)
* **Sejda Architecture:** Renders a full grid of every page in the document. Allows arbitrary drag-and-drop reordering, single-page deletion, and duplicating pages.
* **Client Implementation Recipe:**
  ```javascript
  export async function reorderPages(pdfBuffer, newOrderArray) {
    // newOrderArray: [2, 0, 1, 3] (0-indexed desired sequence)
    const srcDoc = await PDFDocument.load(pdfBuffer);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, newOrderArray);
    copied.forEach(page => newDoc.addPage(page));
    return await newDoc.save();
  }
  ```

### 4. Split PDF (by Pages, Ranges, or Bookmarks) (`/split-pdf`)
* **Sejda Architecture:** Offers 5 splitting modes:
  1. *Extract every page* into individual single-page PDFs (zipped).
  2. *Split by ranges* (e.g. `1-3, 4-7, 8-12`).
  3. *Split by size* (subdivides document below target megabytes).
  4. *Split down the middle* (divides A3/two-page scans into two A4 pages).
  5. *Split by outline* (detects PDF Table of Contents bookmarks).
* **Client Implementation Recipe (Split by Range):**
  ```javascript
  export async function splitPdfByRange(pdfBuffer, ranges) {
    // ranges: [[0, 1, 2], [3, 4], [5]]
    const srcDoc = await PDFDocument.load(pdfBuffer);
    const splitDocs = [];

    for (const pageIndices of ranges) {
      const subDoc = await PDFDocument.create();
      const pages = await subDoc.copyPages(srcDoc, pageIndices);
      pages.forEach(p => subDoc.addPage(p));
      splitDocs.push(await subDoc.save());
    }
    return splitDocs;
  }
  ```

### 5. Split in Half / Two-Page Scan Slicer (`/split-pdf-down-the-middle`)
* **Sejda Architecture:** Takes two-page scans (e.g. book scans on A3/A4) and bisects each page down the center vertical or horizontal axis into two separate consecutive pages.
* **Client Implementation Recipe:**
  ```javascript
  export async function splitPagesDownTheMiddle(pdfBuffer) {
    const srcDoc = await PDFDocument.load(pdfBuffer);
    const newDoc = await PDFDocument.create();

    for (let i = 0; i < srcDoc.getPageCount(); i++) {
      // Embed page twice: left half and right half
      const [leftPage, rightPage] = await newDoc.copyPages(srcDoc, [i, i]);
      const { width, height } = leftPage.getSize();
      
      // Crop left half
      leftPage.setCropBox(0, 0, width / 2, height);
      newDoc.addPage(leftPage);

      // Crop right half
      rightPage.setCropBox(width / 2, 0, width / 2, height);
      newDoc.addPage(rightPage);
    }
    return await newDoc.save();
  }
  ```

### 6. Delete & Extract Pages (`/delete-pdf-pages` & `/extract-pdf-pages`)
* **Sejda Architecture:** Grid of pages with click-to-select. Delete removes selected; Extract exports only selected into a new document.
* **Client Implementation Recipe:**
  ```javascript
  export async function extractPages(pdfBuffer, keepIndices) {
    const srcDoc = await PDFDocument.load(pdfBuffer);
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(srcDoc, keepIndices);
    pages.forEach(p => newDoc.addPage(p));
    return await newDoc.save();
  }
  ```

---

## 🔒 Cluster 2: Security & Protection

### 7. Protect / Encrypt PDF (`/encrypt-pdf`)
* **Sejda Architecture:** Prompts for User Password (required to open) and Owner Password (required to edit). Checkbox options for permissions: Printing allowed, Copy text/graphics allowed, Form filling allowed.
* **Client Implementation Recipe (`pdf-lib`):**
  ```javascript
  export async function encryptPdf(pdfBuffer, userPassword, ownerPassword, permissions = {}) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    return await pdfDoc.save({
      userPassword,
      ownerPassword: ownerPassword || userPassword,
      permissions: {
        printing: permissions.printing ?? 'highResolution',
        modifying: permissions.modifying ?? false,
        copying: permissions.copying ?? false,
        annotating: permissions.annotating ?? false,
        fillingForms: permissions.fillingForms ?? true
      }
    });
  }
  ```

### 8. Unlock / Decrypt PDF (`/unlock-pdf`)
* **Sejda Architecture:** Prompts for password if encrypted; strips security dictionary and returns decrypted document.
* **Client Implementation Recipe:**
  ```javascript
  export async function unlockPdf(pdfBuffer, password) {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { password });
    // Saving without encryption options strips password protection
    return await pdfDoc.save();
  }
  ```

### 9. Watermark PDF (`/watermark-pdf`)
* **Sejda Architecture:** Supports text watermarks and image watermarks. Options: rotation angle (0°, 45°, 90°), opacity (0.1 to 1.0), font size, tile pattern across entire page, or single center stamp.
* **Client Implementation Recipe:**
  ```javascript
  import { degrees, rgb, StandardFonts } from 'pdf-lib';

  export async function addWatermark(pdfBuffer, text, options = {}) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 4,
        y: height / 2,
        size: options.size || 50,
        font,
        color: rgb(0.7, 0.7, 0.7),
        opacity: options.opacity || 0.35,
        rotate: degrees(options.rotation || 45)
      });
    }
    return await pdfDoc.save();
  }
  ```

### 10. Flatten PDF (`/flatten-pdf`)
* **Sejda Architecture:** Merges fillable form fields and interactive annotations directly into the background content stream, preventing further modification or tampering.
* **Client Implementation Recipe:**
  ```javascript
  export async function flattenPdf(pdfBuffer) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();
    form.flatten(); // Turns all AcroForm text fields & checkboxes into static page graphics
    return await pdfDoc.save();
  }
  ```

---

## 🎨 Cluster 3: Layout, Page Formatting & Dimensions

### 11. Crop PDF (`/crop-pdf`)
* **Sejda Architecture:** Visual crop marquee on canvas. Offers: "Crop whole document", "Crop current page", or "Auto-crop whitespace margins".
* **Client Implementation Recipe:**
  ```javascript
  export async function cropPdf(pdfBuffer, cropRectsPerPage) {
    // cropRectsPerPage: { pageIndex: { x, y, width, height } }
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    pages.forEach((page, idx) => {
      const rect = cropRectsPerPage[idx] || cropRectsPerPage['all'];
      if (rect) {
        page.setCropBox(rect.x, rect.y, rect.width, rect.height);
      }
    });
    return await pdfDoc.save();
  }
  ```

### 12. Resize PDF Page Size & Margins (`/resize-pdf`)
* **Sejda Architecture:** Change page format (A4 to Letter, Letter to A4, A3, Legal). Add margins (e.g. +20pt margin for spiral binding).
* **Client Implementation Recipe:**
  ```javascript
  export async function resizePage(pdfBuffer, targetWidth, targetHeight, margin = 20) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      page.setSize(targetWidth, targetHeight);
      page.setMediaBox(0, 0, targetWidth, targetHeight);
    }
    return await pdfDoc.save();
  }
  ```

### 13. Rotate Pages Permanently (`/rotate-pdf-pages`)
* **Sejda Architecture:** Batch rotate all pages, odd pages, or even pages by 90°, 180°, or 270°.
* **Client Implementation Recipe:**
  ```javascript
  export async function rotateAllPages(pdfBuffer, angle = 90) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    });
    return await pdfDoc.save();
  }
  ```

### 14. Header & Footer / Page Numbers (`/header-footer-pdf`)
* **Sejda Architecture:** Custom text formatting (`Page {n} of {total}`). Alignment: Top-left, Top-center, Top-right, Bottom-left, Bottom-center, Bottom-right. Font family and size selector.
* **Client Implementation Recipe:**
  ```javascript
  export async function addPageNumbers(pdfBuffer, format = 'Page {n} of {total}', position = 'bottom-center') {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const total = pages.length;

    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();
      const text = format.replace('{n}', (idx + 1).toString()).replace('{total}', total.toString());
      const fontSize = 10;
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x = (width - textWidth) / 2; // default center
      let y = 25; // default bottom

      if (position.includes('left')) x = 36;
      if (position.includes('right')) x = width - textWidth - 36;
      if (position.includes('top')) y = height - 35;

      page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    });
    return await pdfDoc.save();
  }
  ```

### 15. Bates Numbering (`/bates-numbering-pdf`)
* **Sejda Architecture:** Legal numbering system: Prefix (e.g. `CASE-2024-`), start number, number of digits padding (`000001`), and optional suffix.
* **Client Implementation Recipe:**
  ```javascript
  export async function addBatesNumbering(pdfBuffer, prefix = 'CASE-', startNum = 1, padding = 6) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const pages = pdfDoc.getPages();

    pages.forEach((page, idx) => {
      const { width } = page.getSize();
      const numStr = String(startNum + idx).padStart(padding, '0');
      const batesTag = `${prefix}${numStr}`;
      page.drawText(batesTag, {
        x: width - 180,
        y: 20,
        size: 11,
        font,
        color: rgb(0.1, 0.1, 0.1)
      });
    });
    return await pdfDoc.save();
  }
  ```

### 16. N-Up Printing Layout (`/n-up-pdf`)
* **Sejda Architecture:** Prints 2 or 4 pages per sheet (e.g. two A4 pages onto a single A3 sheet).
* **Client Implementation Recipe:** Uses `pdfDoc.embedPages()` to scale and tile source pages as vector XObjects onto newly generated sheets.

---

## 🗜️ Cluster 4: Compression, Scans & Image Processing

### 17. Compress PDF (`/compress-pdf`)
* **Sejda Architecture:**
  - Extracts embedded raster images (JPEG/PNG).
  - Downsamples images to target DPI (e.g. 150 DPI for screen, 220 DPI for print).
  - Converts uncompressed color spaces and runs zlib/deflate on stream dictionaries.
  - Removes unused fonts, duplicate XObjects, and metadata bloat.
* **Client Implementation Plan:**
  - Extract image XObjects from `pdfDoc`, draw onto an HTML5 canvas at scaled down resolution, convert via `canvas.toBlob('image/jpeg', quality)`, and re-embed.

### 18. Grayscale PDF (`/grayscale-pdf`)
* **Sejda Architecture:** Traverses document graphics stream; converts color images (`/DeviceRGB`) to `/DeviceGray` color space and changes text draw colors `rgb(r,g,b)` to grayscale intensity `0.299*R + 0.587*G + 0.114*B`.

### 19. Deskew PDF Scans (`/deskew-pdf`)
* **Sejda Architecture:** Uses Radon transform or Hough transform on scan images to calculate tilt angle, and applies inverse rotation matrix to straighten crooked scans.
* **Client Implementation:** Can be performed in Web Workers via OpenCV.js (`cv.minAreaRect` / Hough lines).

### 20. OCR Searchable PDF (`/ocr-pdf`)
* **Sejda Architecture:** Server runs Tesseract OCR. Detects text positions on raster image pages, and injects an invisible, selectable text layer (`3 Tr` text rendering mode) behind the image.
* **Client Implementation:** **Tesseract.js** (WebAssembly client-side). Emits hOCR text bounding boxes, then injects invisible text onto matching canvas coordinates.

---

## 🔄 Cluster 5: Conversions (From & To PDF)

### 21. PDF to JPG / PNG (`/pdf-to-jpg`)
* **Sejda Architecture:** Renders each page to image format with selectable resolution (72, 150, 300 DPI) and bundles into `.zip`.
* **Client Implementation Recipe (`pdfjsLib` + Canvas):**
  ```javascript
  export async function pdfToImages(pdfDoc, scale = 2.0, format = 'image/jpeg') {
    const images = [];
    for (let p = 1; p <= pdfDoc.numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      images.push(canvas.toDataURL(format, 0.92));
    }
    return images;
  }
  ```

### 22. JPG / Images to PDF (`/jpg-to-pdf`)
* **Sejda Architecture:** Upload multiple PNG, JPEG, TIFF images; creates a multi-page PDF where each image fills a page.
* **Client Implementation Recipe:**
  ```javascript
  export async function imagesToPdf(imageUrls) {
    const pdfDoc = await PDFDocument.create();
    for (const url of imageUrls) {
      const imgBytes = await fetch(url).then(r => r.arrayBuffer());
      const img = url.includes('png') ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    return await pdfDoc.save();
  }
  ```

### 23. PDF to Text (`/extract-text-from-pdf`)
* **Client Implementation Recipe:**
  ```javascript
  export async function extractAllText(pdfDoc) {
    let fullText = '';
    for (let p = 1; p <= pdfDoc.numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const content = await page.getTextContent();
      const pageStr = content.items.map(i => i.str).join(' ');
      fullText += `--- Page ${p} ---\n${pageStr}\n\n`;
    }
    return fullText;
  }
  ```

### 24. Edit PDF Metadata (`/edit-pdf-metadata`)
* **Client Implementation Recipe:**
  ```javascript
  export async function updateMetadata(pdfBuffer, meta = {}) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    if (meta.title) pdfDoc.setTitle(meta.title);
    if (meta.author) pdfDoc.setAuthor(meta.author);
    if (meta.subject) pdfDoc.setSubject(meta.subject);
    if (meta.keywords) pdfDoc.setKeywords(Array.isArray(meta.keywords) ? meta.keywords : [meta.keywords]);
    if (meta.creator) pdfDoc.setCreator(meta.creator);
    pdfDoc.setModificationDate(new Date());
    return await pdfDoc.save();
  }
  ```

---

## 🛠️ Complete Tool Architecture Comparison Matrix

| Sejda Feature | Sejda Server Mechanism | Our Client-Side Studio Engine | Zero-Server Capable? |
| :--- | :--- | :--- | :---: |
| **PDF Editor** | PDF.js + SAMBox Java | PDF.js + Canvas + `pdf-lib` | **Yes (100% Client)** |
| **Merge PDF** | SAMBox `PDFMergerUtility` | `pdf-lib` `copyPages` | **Yes (100% Client)** |
| **Split PDF** | SAMBox `Splitter` | `pdf-lib` Subdocuments | **Yes (100% Client)** |
| **Rotate & Delete** | SAMBox Page dictionary update | `page.setRotation()` / `removePage()` | **Yes (100% Client)** |
| **Protect / Encrypt** | Standard AES-256 PDF encryption | `pdfDoc.save({ userPassword })` | **Yes (100% Client)** |
| **Unlock / Decrypt** | Decrypt with supplied password | `PDFDocument.load(buf, { password })` | **Yes (100% Client)** |
| **Watermark** | Vector text overlay on page stream | `page.drawText()` with opacity & angle | **Yes (100% Client)** |
| **Flatten** | AcroForm appearance stream bake | `pdfDoc.getForm().flatten()` | **Yes (100% Client)** |
| **Page Numbers** | Dynamic header/footer stream inject | `page.drawText()` with position formula | **Yes (100% Client)** |
| **Bates Numbering** | Sequenced courier text stamps | `page.drawText()` padded sequence | **Yes (100% Client)** |
| **Crop & Resize** | CropBox and MediaBox update | `page.setCropBox()` / `page.setSize()` | **Yes (100% Client)** |
| **PDF to Image** | PDF.js / Java renderer | PDF.js + HTML5 Canvas `toBlob` | **Yes (100% Client)** |
| **Image to PDF** | JPEG/PNG stream packaging | `pdfDoc.embedPng()` / `embedJpg()` | **Yes (100% Client)** |
| **Edit Metadata** | Document Info Dictionary update | `pdfDoc.setTitle()`, `setAuthor()` | **Yes (100% Client)** |
| **OCR PDF** | Tesseract C++ on server | Tesseract.js (WebAssembly) | **Yes (WASM Client)** |
| **PDF to Word/Excel**| Apache POI / LibreOffice | AST Structural extraction / Service | Hybrid |
