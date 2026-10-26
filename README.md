# LetsEdit: Enterprise In-Browser PDF Suite & Vector Document Engine

[![CI Pipeline](https://github.com/codxbrexx/Lets_Edit/actions/workflows/ci.yml/badge.svg)](https://github.com/codxbrexx/Lets_Edit/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-332%20passing-success.svg)](tests/)
[![E2E Tests](https://img.shields.io/badge/playwright-24%20passed-success.svg)](e2e/)
[![Privacy](https://img.shields.io/badge/privacy-100%25%20client--side-blueviolet.svg)](#-zero-cloud-architectural-philosophy)

> **LetsEdit** is an enterprise-grade, privacy-first vector document engine and comprehensive in-browser PDF suite. Powered by client-side WebAssembly, high-performance HTML5 Canvas compositing, and byte-level vector synthesis, all 43+ document operations execute locally inside the browser with **zero cloud document uploads** and **zero server telemetry**.

---

## Table of Contents
1. [Zero-Cloud Architectural Philosophy](#-zero-cloud-architectural-philosophy)
2. [System Architecture Diagram](#-system-architecture-diagram)
3. [Document Processing Lifecycle Flowchart](#-document-processing-lifecycle-flowchart)
4. [Multi-Layer Canvas Compositing Stack](#-multi-layer-canvas-compositing-stack)
5. [Real-Time Text Clustering & Inline Typography Engine](#-real-time-text-clustering--inline-typography-engine)
6. [Multi-Party E-Signature & Cryptographic Audit Trail](#-multi-party-e-signature--cryptographic-audit-trail)
7. [Multi-Threaded Worker Pool & Batch Pipeline](#-multi-threaded-worker-pool--batch-pipeline)
8. [Enterprise Security, Compliance & Deep Forensics](#-enterprise-security-compliance--deep-forensics)
9. [Edge Security: Cloudflare Turnstile & Firebase Auth](#-edge-security-cloudflare-turnstile--firebase-auth)
10. [Comprehensive Feature Matrix (43+ Tools)](#-comprehensive-feature-matrix-43-tools)
11. [Strict 1,000-Line Modular Architecture Standard](#-strict-1000-line-modular-architecture-standard)
12. [Repository Directory Structure](#-repository-directory-structure)
13. [Getting Started & Local Setup](#-getting-started--local-setup)
14. [Configuration & Environment Variables](#-configuration--environment-variables)
15. [Automated Testing & Quality Gates](#-automated-testing--quality-gates)
16. [CI/CD Pipeline & Deployment](#-cicd-pipeline--deployment)
17. [License](#-license)

---

## Zero-Cloud Architectural Philosophy

Legacy online PDF editing platforms rely on remote server-side document processing queues. In those models, user files are transmitted over HTTP to remote workers, converted into raster caches, edited via server-side libraries, and re-downloaded. This introduces:
- **Severe Data Privacy Vulnerabilities:** Sensitive contracts, medical records, tax filings, and legal discoveries are exposed to third-party cloud disks and transit breaches.
- **Regulatory Non-Compliance:** Uncontrolled server caching routinely violates GDPR, HIPAA, FERPA, and SOC2 mandates.
- **Latency & Bandwidth Bottlenecks:** Uploading and downloading multi-megabyte files throttles performance and creates point-of-failure dependencies on network health.

### The LetsEdit Paradigm:
```
Traditional Cloud Editors:  [Browser] ────(Full PDF Upload)────> [Server Worker / Cloud Storage] ────(Download)────> [Browser]
LetsEdit Architecture:     [Browser Memory Sandbox (PDF.js + WASM + pdf-lib + Web Workers)] ────(Local Blob Save)────> [User Disk]
```

1. **100% In-Memory Processing:** Document binaries never leave user RAM. Document object trees, text glyph matrices, and vector paths remain strictly confined to the local browser context.
2. **Pure Vector Manipulation:** Edits, shapes, fonts, and annotations are synthesized directly into the PDF ISO-32000 object dictionary using `pdf-lib`, preserving resolution-independent vector fidelity without downsampling.
3. **Hardware-Accelerated Concurrency:** Multi-core parallelization via Web Workers ensures real-time performance on complex 500+ page documents.

---

## System Architecture Diagram

```mermaid
graph TB
    subgraph ClientBrowser["Client Browser Sandbox (100% Client-Side)"]
        subgraph UIComponents["Presentation & Viewport Layer"]
            LP["Landing Page & Hero Studio"]
            EP["Document Studio Canvas"]
            TB["Unified Toolbar & Property Inspector"]
            MOD["Modal Subsystems (43+ Tools, Diff, Legal, Sign)"]
        end

        subgraph CoreStateStore["Reactive State Management"]
            SS["StateStore (Pub/Sub Store)"]
            HIST["Command History (Undo / Redo Stack)"]
            ROUT["PushState SPA Router Engine"]
        end

        subgraph CompositingEngine["4-Layer Canvas Compositing Pipeline"]
            L4["Layer 4: Interactive DOM Layer (Gizmos, Drag Handles, Forms)"]
            L3["Layer 3: Annotation Canvas (Ink, Brushes, Highlights, Shapes)"]
            L2["Layer 2: Text Layer (Glyph Anchors, Click-to-Edit Anchors)"]
            L1["Layer 1: Base Canvas (High-DPI PDF.js Viewport)"]
        end

        subgraph EngineCore["Document Engine & Forensics Core"]
            PE["PDFEngine Facade (pdf-engine.js)"]
            TC["Text Clustering Engine (text-clustering.js)"]
            SA["Sign & Audit Engine (sign-audit.js, multi-sign-ops.js)"]
            FO["Forensic Sanitization & Redaction (sanitize.js, redact.js)"]
            BA["Bates & Watermark Engine (bates.js, watermark.js)"]
            OP["Page Operations & Split/Merge (page-operations.js)"]
        end

        subgraph WorkerPoolLayer["Multi-Threaded Web Worker Pool"]
            WP["WorkerPool Dispatcher (worker-pool.js)"]
            W1["Worker Core 1: Threat Scanning"]
            W2["Worker Core 2: OCR WASM (Tesseract.js)"]
            W3["Worker Core 3: Keyword Search & Chunking"]
            W4["Worker Core 4: Visual Diff & Hash Digesting"]
            HUD["Worker Throughput HUD (Pages/Sec)"]
        end
    end

    subgraph EdgeServices["Optional Node API / Verification Edge"]
        API["Node.js API Server (Express/Native HTTP)"]
        TS_V["Turnstile Token Verification Endpoint (/api/turnstile/verify)"]
        SR_V["Sign Request Dispatch Route (/api/sign-requests)"]
    end

    subgraph ExternalPerimeter["Identity & Bot Protection Edge"]
        CF["Cloudflare Turnstile Challenge Engine"]
        FB["Firebase Authentication (Google OAuth & Identity)"]
    end

    %% Wiring
    LP --> ROUT
    EP --> SS
    MOD --> SS
    SS <--> HIST
    SS --> CompositingEngine
    CompositingEngine --> EngineCore
    EngineCore <--> WorkerPoolLayer
    WP --> W1 & W2 & W3 & W4
    WP --> HUD

    %% Edge
    MOD -.-> CF
    CF -. Token .-> TS_V
    TS_V -. Valid .-> API
    MOD -. OAuth .-> FB
    API -. Status .-> SS
```

---

## Document Processing Lifecycle Flowchart

The following flowchart outlines the path of a document through LetsEdit from initial drag-and-drop ingestion to immutable vector export:

```mermaid
flowchart TD
    A["User Drops PDF Document or Scanned Image"] --> B["Allocate Local ArrayBuffer in Browser Memory"]
    B --> C["PDF.js Parser Initializes Document Object Tree"]
    
    C --> D1["Extract Page Geometry & Viewport Dimensions"]
    C --> D2["Extract Text Glyph Matrix & Coordinate Anchors"]
    C --> D3["Inspect Catalog for Embedded Threats & Metadata"]

    D1 --> E1["Layer 1: Render Base Viewport Canvas at Device Pixel Ratio"]
    D2 --> E2["Text Clustering Engine groups Spans into Baselines & Words"]
    E2 --> E3["Layer 2: Render Transparent Click-to-Edit Text Layer"]

    E1 & E3 --> F["Mount Layer 3 (Annotation Canvas) & Layer 4 (Interactive DOM)"]
    F --> G["User Performs Edits, Signatures, Forms, or Page Layout Changes"]

    G --> H["StateStore Records Mutation & Pushes to Command Undo/Redo Stack"]
    
    H --> I{"Intensive Task Requested? (Batch OCR, Deep Threat Scan, Diff)"}
    I -- Yes --> J["WorkerPool Distributes Chunks across Hardware Threads"]
    J --> K["Real-Time HUD Updates Throughput (Pages/Sec)"]
    K --> L["Task Resolution Dispatched back to StateStore"]
    I -- No --> L

    L --> M{"User Requests Document Export / Download"}
    M --> N["Initialize pdf-lib Document Compiler"]
    N --> O["Synthesize Vector Paths, Fonts, and Form Dictionaries"]
    
    O --> P{"Workflow Requires Legal E-Sign Audit?"}
    P -- Yes --> Q["Compute Document SHA-256 Digest & Generate Standalone Audit Certificate"]
    Q --> R["Append Tamper-Evident Verification Sheet with QR Code"]
    P -- No --> S["Flatten AcroForms & Vector Masks (if configured)"]
    R --> S

    S --> T["Compile Final Byte Stream to Uint8Array"]
    T --> U["Generate Local Blob URL & Trigger Native Browser Download"]
```

---

## Multi-Layer Canvas Compositing Stack

To deliver 60 FPS viewport rendering while supporting pixel-precise click-to-edit text operations, freehand ink drawing, and interactive form fields, LetsEdit utilizes a decoupled **4-layer compositing stack**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Layer 4: Interactive DOM Layer (.pdf-dom-layer)                        │
│ • Floating transform gizmos, bounding box drag handles                 │
│ • AcroForm inputs: text boxes, radio buttons, checkboxes, dropdowns   │
│ • Placement previews for signatures, stamps, and Bates sequences       │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 3: Annotation Canvas Layer (.pdf-annotation-canvas)              │
│ • High-performance 2D canvas optimized for drawing & path rendering    │
│ • Smooth Bezier-smoothed freehand pen and ink strokes                  │
│ • Semi-transparent vector highlighters, geometric shapes, arrows       │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Text Layer (.pdf-text-layer)                                 │
│ • Transparent HTML span elements aligned to native PDF glyph coordinates│
│ • Real-time hit-testing for double-click inline text editing           │
│ • Browser-native text selection, clipboard copy, and search matching   │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Base Render Canvas (.pdf-page-canvas)                         │
│ • Hardware-accelerated PDF.js rasterization of the underlying PDF page │
│ • Rendered at window.devicePixelRatio (2x / 3x) for ultra-sharp Retina │
│ • Cached offscreen during active panning and zooming operations        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Real-Time Text Clustering & Inline Typography Engine

Traditional web PDF viewers render text as fragmented glyph spans (often splitting single words across multiple `<span>` tags due to kerning vectors). LetsEdit's **Text Clustering Engine** (`src/core/canvas/text-clustering.js`) mathematically reconstructs cohesive phrases and paragraphs in real time:

```mermaid
flowchart LR
    A["Raw PDF Glyph Stream (Fragmented Syllables)"] --> B["Filter Empty / Whitespace Tokens"]
    B --> C["Group Glyphs by Y-Coordinate Baseline (Threshold: 2.5pt)"]
    C --> D["Sort Baseline Glyphs Horizontally by X-Coordinate"]
    D --> E["Calculate Inter-Character Gaps vs Expected Space Width"]
    E --> F["Synthesize Words & Cohesive Sentence Blocks"]
    F --> G["Detect Font Family, Weight, and Style via Typography Mapping"]
    G --> H["Render Precision Click-to-Edit Bounding Box with Baseline Snapping"]
```

### Heuristic Font Detection Matrix:
```javascript
// Sample mapping from engine typography detector
const FONT_MAP = {
  times:     { family: '"Times New Roman", Times, serif', isSerif: true },
  helvetica: { family: 'Arial, Helvetica, sans-serif',    isSans: true },
  courier:   { family: '"Courier New", Courier, monospace', isMono: true },
  georgia:   { family: 'Georgia, serif',                  isSerif: true },
  consolas:  { family: 'Consolas, Monaco, monospace',     isMono: true }
};
```

---

## Multi-Party E-Signature & Cryptographic Audit Trail

LetsEdit provides a legally binding, tamper-evident electronic signature workflow compliant with the **U.S. ESIGN Act**, **UETA**, and **EU eIDAS (SES/AES)** regulations.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Document Owner
    participant Studio as LetsEdit Studio
    participant Worker as Web Worker Engine
    actor Signer as Signatory Recipient
    participant Verifier as Audit Verification Engine

    Creator->>Studio: Upload Contract & Place Signatory Fields
    Studio->>Worker: Compute Initial SHA-256 Document Digest
    Worker-->>Studio: Base Document Hash Generated
    Creator->>Studio: Dispatch Multi-Party Signing Workflow
    Signer->>Studio: Open Dedicated Signing Link
    Signer->>Studio: Render Smooth Vector Signature (Bezier Ink / Font / Graphic)
    Signer->>Studio: Submit Signature Confirmation
    Studio->>Worker: Burn Signature Vector into PDF Content Stream
    Studio->>Worker: Flatten Form Fields into Immutable Artwork
    Worker->>Worker: Compile Tamper-Proof Audit Certificate Sheet
    Note over Worker: Injects UUID, Signer IP, Email, Time, SHA-256 Digest, QR Matrix
    Worker->>Studio: Return Cryptographically Sealed PDF
    Studio-->>Creator: Download Completed Executed Contract
    Verifier->>Studio: Scan QR Code on Certificate Sheet
    Studio-->>Verifier: Validate Cryptographic Hash & Chain of Custody
```

### Tamper-Evident Audit Certificate Properties:
1. **Transaction ID:** Unique RFC 4122 v4 UUID assigned at workflow inception.
2. **Cryptographic Checksum:** 64-character SHA-256 hash of the unexecuted document and final executed document.
3. **Identity Verification:** Signer IP address, email address, user-agent, and exact UTC timestamp.
4. **Vector QR Code Matrix:** Embedded vector QR linking directly to verification proof without external cloud dependency.

---

## Multi-Threaded Worker Pool & Batch Pipeline

To prevent user interface freezing during intensive computational tasks, LetsEdit implements a **Hardware-Scalable Web Worker Pool** (`src/core/worker-pool.js`):

```mermaid
graph TD
    UI["Main Application UI Thread (60 FPS Unblocked)"] --> WP["WorkerPool Manager"]
    WP --> DET{"Detect CPU Hardware Concurrency"}
    DET -->|"navigator.hardwareConcurrency"| POOL["Allocate Thread Pool (e.g. 8 Cores)"]

    POOL --> T1["Task Chunk 1: Threat Scan"]
    POOL --> T2["Task Chunk 2: OCR Extraction"]
    POOL --> T3["Task Chunk 3: Keyword Search"]
    POOL --> T4["Task Chunk 4: Image Compression"]

    T1 & T2 & T3 & T4 --> HUD["Live HUD Monitor: Pages/Sec Throughput & Queue Depth"]
    HUD --> RES["Resolved Promise Aggregate"]
    RES --> UI
```

* **Dynamic Concurrency:** Automatically scales worker count based on available system cores (`navigator.hardwareConcurrency || 4`), capped safely to avoid memory contention.
* **Resilient Fallback:** Automatically falls back to asynchronous main-thread chunking if Web Workers are unavailable or restricted by browser security policies.
* **Real-Time Throughput HUD:** Visual floating dashboard displaying active workers, processed pages, and real-time processing speed (pages/sec).

---

## Enterprise Security, Compliance & Deep Forensics

LetsEdit includes advanced security and forensics capabilities designed for legal, governmental, and enterprise discovery workflows:

```mermaid
flowchart TD
    subgraph SanitizationEngine["Deep Document Sanitizer"]
        DOC["Raw Input Document"] --> SCAN["Forensic Threat Scanner"]
        SCAN --> JST["Detect & Strip Embedded JavaScript Actions"]
        SCAN --> ATT["Detect & Purge File Attachments & Alternate Streams"]
        SCAN --> META["Sanitize Producer Metadata, XMP Data, & Edit Histories"]
        SCAN --> THUMB["Purge Cached Thumbnail Images & Private Vendor Dictionaries"]
        JST & ATT & META & THUMB --> CLEAN["Certified Clean Document"]
    end

    subgraph RedactionEngine["Forensic Vector Redaction Engine"]
        RAW_TEXT["Target Redaction Region"] --> TOKENS["Locate Internal Content Stream Tokens"]
        TOKENS --> DESTROY["Permanently Destroy Underlying Glyphs & Matrices"]
        DESTROY --> MASK["Burn Opaque Vector Mask Rectangle"]
        MASK --> SAFE["Irreversible Forensic Redaction"]
    end
```

* **Permanent Vector Redaction:** Unlike naive editors that merely draw black rectangles over text (leaving underlying glyphs extractable), LetsEdit forensically purges the glyph coordinates, font matrices, and text tokens from the underlying PDF stream.
* **Bates Numbering Suite:** Legal discovery numbering with 6-zone coordinate anchors, customizable prefixes/suffixes, dynamic zero-padding (`CONF-000001`), and automatic margin adjustment.
* **ISO 32000-1 PageLabels & Outlines:** Structure Roman numeral front matter, Arabic body chapters, and hierarchical bookmark trees.
* **AcroForm Flattening:** Converts form fields, calculations, and signature graphics into immutable base vectors to guarantee post-execution integrity.

---

## Edge Security: Cloudflare Turnstile & Firebase Auth

LetsEdit combines modern bot protection with enterprise identity management:

```mermaid
flowchart LR
    subgraph Client["Browser Client"]
        U["User Requests Sign In / Registration"] --> TS_C["Render Cloudflare Turnstile Widget"]
        TS_C -->|"Token Acquired"| API_REQ["POST /api/turnstile/verify"]
    end

    subgraph BackendEdge["Edge / API Server"]
        API_REQ --> TS_V["Validate with challenges.cloudflare.com"]
        TS_V -->|"Success: true"| AUTH_PERM["Grant Authentication Clearance"]
    end

    subgraph IdentityProvider["Identity Layer"]
        AUTH_PERM --> FB_SDK["Firebase Auth SDK"]
        FB_SDK --> G_OAUTH["Google OAuth Popup (select_account)"]
        FB_SDK --> EMAIL["Email / Password + Password Reset"]
        FB_SDK --> SSO["Enterprise SSO Domain Routing"]
    end

    G_OAUTH & EMAIL & SSO --> STATE["Update StateStore User State"]
```

* **Cloudflare Turnstile:** Invisible and managed challenge verification ensuring zero bot automation, with dark/light mode synchronization and offline fallback for development environments.
* **Firebase Authentication:** Live Google OAuth popup flow (`select_account` prompt, email/profile scopes), standard email/password registration, password-reset dialogs, and enterprise SSO detection.
* **Zero Mock User Fallbacks:** Production builds enforce authenticated tokens; no mock account states exist in client code.

---

## Comprehensive Feature Matrix (43+ Tools)

| Suite | Tool | Description | Execution Context |
| :--- | :--- | :--- | :--- |
| **Edit & Annotate** | **Inline Text Editor** | Click existing PDF text to edit directly; font weight, size, and baseline detection with localized whiteout masking. | 100% In-Browser |
| | **Freehand Drawing & Brushes** | Pressure-responsive ink strokes with customizable colors, line widths, and opacity. | 100% In-Browser |
| | **Vector Highlighters** | Semi-transparent markers for reviewing contracts and legal clauses. | 100% In-Browser |
| | **Shapes & Stamps** | Rectangles, ellipses, directional arrows, callouts, and customizable approved/confidential stamps. | 100% In-Browser |
| | **Form Field Controls** | Add interactive Text Inputs, Checkboxes, and Radio Buttons. | 100% In-Browser |
| | **Find & Replace** | Search text across all pages with real-time vector coordinate matching and batch replacement. | 100% In-Browser |
| **Organize & Layout** | **Merge PDF** | Combine multiple PDF documents, images, and scan batches into a unified file with customizable Table of Contents and cover sheets. | 100% In-Browser |
| | **Split PDF** | Extract page ranges, burst every page, or partition automatically using text detection and keyword triggers. | 100% In-Browser |
| | **Alternate & Mix** | Interleave odd and even scan batches from duplex scanning. | 100% In-Browser |
| | **N-Up Imposition** | Tile 2, 4, 8, or 16 pages per sheet for booklets and printing. | 100% In-Browser |
| | **Rotate & Delete** | 90°/180° page reorientation and single or batch page deletions with drag-and-drop thumbnail reordering. | 100% In-Browser |
| | **Crop & Resize Margins** | Visual page trimming and standardization to A4, Letter, or custom dimensions. | 100% In-Browser |
| **Convert & OCR** | **PDF to Office** | Export document text streams to Word (`.docx`), Excel (`.xlsx`), and PowerPoint (`.pptx`). | 100% In-Browser |
| | **Office to PDF** | Convert Office documents and text formats directly to PDF. | 100% In-Browser |
| | **PDF to High-Res Images** | Export pages as 300 DPI PNG, JPG, or WebP archives. | 100% In-Browser |
| | **Images to PDF** | Merge multi-format photo albums, mobile receipts, and scanned receipts into a single PDF. | 100% In-Browser |
| | **Client-Side OCR** | Tesseract.js WebAssembly engine extracts searchable text layers from scanned raster documents in 10+ languages. | 100% In-Browser (WASM) |
| | **HTML & Markdown to PDF** | Render rich web pages and formatted markdown documents into vector PDFs. | 100% In-Browser |
| **Security & Forensics** | **Permanent Vector Redaction** | Forensically destroys text matrices, content stream tokens, and underlying glyphs beneath opaque masks. | 100% In-Browser |
| | **Deep Document Sanitization** | Strips hidden metadata, embedded attachments, JavaScript actions, thumbnail streams, and private vendor chunks. | 100% In-Browser |
| | **AcroForm Flattening** | Bakes interactive fields and signatures into immutable vector artwork to prevent post-signature tampering. | 100% In-Browser |
| | **Bates Numbering Suite** | Legal discovery sequence numbering with customizable prefixes, suffixes, zero-padding (`ABC-000001`), and 6-zone alignment. | 100% In-Browser |
| | **ISO 32000-1 PageLabels & Outlines** | Structure Roman numeral front matter, Arabic body sections, and hierarchical bookmark trees. | 100% In-Browser |
| | **AES-256 Encryption & Permissions** | Password-protect documents and restrict printing, copying, and modifications. | 100% In-Browser |
| **Smart Tools & Compare** | **Visual PDF Diff** | Compare two revisions side-by-side, with interactive wipe slider, opacity ghost blend, or difference overlay. | 100% In-Browser |
| | **PDF/A Compliance** | Validate and convert documents into ISO 19005 archival standards (PDF/A-1b and PDF/A-2b). | 100% In-Browser |
| | **Document Repair** | Reconstruct broken xref tables and damaged stream headers. | 100% In-Browser |
| | **Grayscale Conversion** | Strip color channels for print cost optimization. | 100% In-Browser |

---

## Strict 1,000-Line Modular Architecture Standard

To prevent codebase rot and monolithic files, LetsEdit enforces a strict architectural rule verified on every Git commit and CI run:

> **Every single JavaScript file in `src/` must remain strictly under 1,000 lines of code.**

If any source file reaches or exceeds 1,000 lines, the build fails automatically. Complex modules are decomposed into dedicated submodules:
- `landing-page.js` (625 lines) ➔ decomposed into `landing-html.js` (985 lines), `landing-cards.js` (215 lines), and `landing-icons.js` (200 lines).
- `page-operations.js` (422 lines) ➔ delegates to `bates-ops.js`, `sanitize.js`, `sign-audit.js`, `watermark-ops.js`, `split-ops.js`, and `merge-ops.js`.

---

## Repository Directory Structure

```
Pdf-Editor/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Node 22 test, build & 1,000-line ceiling gate
│       └── deploy.yml             # Automated deployment to Firebase Hosting
├── e2e/                           # Playwright end-to-end browser tests
│   ├── auth-flow.spec.js          # Authentication modal & Google OAuth flows
│   ├── landing-hero.spec.js       # Display-height hero, dark theme & scroll cues
│   ├── studio-upload.spec.js      # Studio document uploader & blank page canvas
│   └── tools-and-legal.spec.js    # Legal modal, privacy, terms & workflow tools
├── public/
│   ├── manifest.webmanifest       # Progressive Web App manifest
│   ├── robots.txt                 # SEO crawler directions
│   └── sitemap.xml                # Canonical tool URL index
├── server/
│   ├── index.js                   # Node HTTP API entrypoint
│   └── routes/                    # Modular API route controllers
│       ├── auth-routes.js         # Cloudflare Turnstile & session endpoints
│       ├── sanitize-routes.js     # Hidden threat forensic engine
│       ├── sign-request-routes.js # Multi-party e-sign requests
│       └── split-merge-routes.js  # Advanced merge TOC & keyword split
├── src/
│   ├── main.js                    # Application orchestrator & router mounts
│   ├── style.css                  # Unified design system & responsive theme tokens
│   ├── components/
│   │   ├── account-page.js        # Account dashboard & API key management
│   │   ├── all-tools-modal.js     # Directory catalog for 43+ tools
│   │   ├── auth-modal.js          # Turnstile-protected login dialog
│   │   ├── compare-modal.js       # Visual PDF side-by-side diff
│   │   ├── landing-page.js        # Executive landing page controller
│   │   ├── legal-modal.js         # Privacy, terms & security whitepaper tabs
│   │   ├── tool-workflow.js       # Workflow execution container
│   │   └── landing/               # Decomposed landing page modules
│   │       ├── landing-cards.js   # Tool filter rail & card renderer
│   │       ├── landing-html.js    # Semantic HTML template
│   │       └── landing-icons.js   # Two-tone vector icon dictionary
│   └── core/
│       ├── firebase-auth.js       # Firebase SDK wrapper & OAuth integration
│       ├── pdf-engine.js          # Vector parser & exporter
│       ├── router.js              # PushState URL routing engine
│       ├── state-store.js         # Reactive state store with undo/redo
│       ├── turnstile.js           # Cloudflare Turnstile client manager
│       ├── worker-pool.js         # Multi-threaded Web Worker pool
│       ├── canvas/                # Canvas render layers & text clustering
│       └── engine/                # Modular operations (Redact, Bates, Sanitize...)
└── tests/                         # Node.js native unit test suites (332 tests)
    ├── setup.js                   # Test environment bootstrap & Iterator polyfill
    └── turnstile.test.js          # Cloudflare Turnstile client & server unit tests
```

---

## Getting Started & Local Setup

### Prerequisites
* **Node.js:** `>= 20.0.0` (Node.js 22 LTS recommended)
* **npm:** `>= 9.0.0`

### Installation
```bash
# 1. Clone repository
git clone https://github.com/codxbrexx/Lets_Edit.git
cd Lets_Edit

# 2. Install dependencies
npm ci

# 3. Start local frontend development server
npm run dev
# Vite runs at http://localhost:5173/

# 4. (Optional) Start backend API server
npm run server
# Server runs at http://localhost:3000/
```

---

## Configuration & Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Authentication Configuration (lets-edit-inc)
VITE_FIREBASE_API_KEY=AIzaSyB2lOHysn5Uc3qurgRGW6JG49H29NuFNyU
VITE_FIREBASE_AUTH_DOMAIN=lets-edit-inc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lets-edit-inc
VITE_FIREBASE_STORAGE_BUCKET=lets-edit-inc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=285657458145
VITE_FIREBASE_APP_ID=1:285657458145:web:2fe8f13287f73e3ac35ea0

# Cloudflare Turnstile Bot Protection
# Generate from Cloudflare Dashboard -> Turnstile -> Add site
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CLOUDFLARE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

---

## Automated Testing & Quality Gates

The codebase maintains a 100% test pass rate across unit, integration, and browser end-to-end layers:

```bash
# Run all 332 Unit Test Suites (node:test)
npm test

# Run all 24 Playwright End-to-End Browser Tests (Desktop & Mobile Chrome)
npx playwright test

# Verify production Vite build bundle
npm run build
```

---

## CI/CD Pipeline & Deployment

Every push and pull request executes the automated GitHub Actions CI pipeline:
1. **Dependency Installation:** Runs `npm ci` with strict lockfile verification.
2. **Architecture Quality Gate:** Scans every `.js` file to ensure the 1,000-line ceiling is maintained.
3. **Unit Test Suite:** Executes all 332 tests in Node 22 with the ECMAScript `Iterator` polyfill bootstrap.
4. **Production Build:** Verifies that Vite compiles the production client bundle cleanly.
5. **Continuous Deployment:** On merges to `main`, `.github/workflows/deploy.yml` deploys the build artifacts to **Firebase Hosting**.

---

## License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
