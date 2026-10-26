# LetsEdit — Enterprise In-Browser PDF Suite & Vector Document Engine

[![CI Pipeline](https://github.com/codxbrexx/Lets_Edit/actions/workflows/ci.yml/badge.svg)](https://github.com/codxbrexx/Lets_Edit/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-332%20passing-success.svg)](tests/)
[![E2E Tests](https://img.shields.io/badge/playwright-24%20passed-success.svg)](e2e/)
[![Privacy](https://img.shields.io/badge/privacy-100%25%20client--side-blueviolet.svg)](#zero-cloud-architecture)

> **LetsEdit** is a high-performance, private, all-in-one PDF suite engineered to rival desktop suites like Adobe Acrobat Pro and leading web platforms like iLovePDF and Sejda. Powered by client-side WebAssembly and byte-level vector synthesis, all 43+ document operations execute locally inside your browser with **zero cloud document uploads** and **zero server telemetry**.

---

## 📑 Table of Contents
1. [Core Architectural Philosophy](#-core-architectural-philosophy)
2. [Feature Matrix (43+ Tools)](#-feature-matrix-43-tools)
3. [Multi-Layer Compositing Engine](#-multi-layer-compositing-engine)
4. [Enterprise Security, Compliance & Forensics](#-enterprise-security-compliance--forensics)
5. [E-Signatures & Audit Trail Engine](#-e-signatures--audit-trail-engine)
6. [Cloudflare Turnstile & Firebase Authentication](#-cloudflare-turnstile--firebase-authentication)
7. [Multi-Threaded Worker Pool & PWA Architecture](#-multi-threaded-worker-pool--pwa-architecture)
8. [Directory Structure](#-directory-structure)
9. [Getting Started](#-getting-started)
10. [Configuration & Environment Variables](#-configuration--environment-variables)
11. [Testing & Quality Gates](#-testing--quality-gates)
12. [CI/CD & Deployment](#-cicd--deployment)

---

## 🛡️ Core Architectural Philosophy

Traditional online PDF editors upload user documents to remote server queues for server-side manipulation. This introduces latency, privacy risks, regulatory compliance concerns (GDPR, HIPAA), and bandwidth constraints.

**LetsEdit shifts the entire document pipeline to the client browser:**
* **100% Client-Side Processing:** Documents stay in memory on the user's device. No page images, binary streams, or form field inputs are ever transferred to or stored on external servers.
* **Pure Vector Compilation:** Uses `pdf-lib` to manipulate the document object tree directly. Exported PDFs maintain crisp vector paths and native fonts rather than downsampled raster bitmaps.
* **Strict Architecture Rules:** All JavaScript modules are strictly capped at under 1,000 lines of code to preserve separation of concerns and maintainability.

---

## 🧰 Feature Matrix (43+ Tools)

### 1. Edit & Annotate
* **Inline Text Editor:** Click existing PDF text to edit directly; automated font weight, size, and baseline detection with localized whiteout masking.
* **Freehand Drawing & Brushes:** Pressure-responsive ink strokes with customizable colors, line widths, and opacity.
* **Vector Highlighters:** Semi-transparent markers for reviewing contracts and legal clauses.
* **Shapes & Stamps:** Rectangles, ellipses, directional arrows, callouts, and customizable approved/confidential stamps.
* **Form Field Controls:** Add interactive Text Inputs, Checkboxes, and Radio Buttons.
* **Find & Replace:** Search text across all pages with real-time vector coordinate matching and batch replacement.

### 2. Organize & Layout
* **Merge PDF:** Combine multiple PDF documents, images, and scan batches into a unified file with customizable Table of Contents and cover sheets.
* **Split PDF:** Extract page ranges, burst every page, or partition automatically using text detection and keyword triggers.
* **Alternate & Mix:** Interleave odd and even scan batches from duplex scanning.
* **N-Up Imposition:** Tile 2, 4, 8, or 16 pages per sheet for booklets and printing.
* **Rotate & Delete:** 90°/180° page reorientation and single or batch page deletions with drag-and-drop thumbnail reordering.
* **Crop & Resize Margins:** Visual page trimming and standardization to A4, Letter, or custom dimensions.

### 3. Convert & OCR
* **PDF to Office:** Export document text streams to Word (`.docx`), Excel (`.xlsx`), and PowerPoint (`.pptx`).
* **Office to PDF:** Convert Office documents and text formats directly to PDF.
* **PDF to High-Res Images:** Export pages as 300 DPI PNG, JPG, or WebP archives.
* **Images to PDF:** Merge multi-format photo albums, mobile receipts, and scanned receipts into a single PDF.
* **Client-Side OCR:** Tesseract.js WebAssembly engine extracts searchable text layers from scanned raster documents in 10+ languages.
* **HTML & Markdown to PDF:** Render rich web pages and formatted markdown documents into vector PDFs.

### 4. Enterprise Security & Forensics
* **Permanent Vector Redaction:** Forensically destroys text matrices, content stream tokens, and underlying glyphs beneath opaque masks.
* **Deep Document Sanitization:** Strips hidden metadata, embedded attachments, JavaScript actions, thumbnail streams, and private vendor chunks.
* **AcroForm Flattening:** Bakes interactive fields and signatures into immutable vector artwork to prevent post-signature tampering.
* **Bates Numbering Suite:** Legal discovery sequence numbering with customizable prefixes, suffixes, zero-padding (`ABC-000001`), and 6-zone alignment.
* **ISO 32000-1 PageLabels & Outlines:** Structure Roman numeral front matter, Arabic body sections, and hierarchical bookmark trees.
* **AES-256 Encryption & Permissions:** Password-protect documents and restrict printing, copying, and modifications.

### 5. Smart Tools & Comparison
* **Visual PDF Diff:** Compare two revisions side-by-side, with interactive wipe slider, opacity ghost blend, or difference overlay.
* **PDF/A Compliance:** Validate and convert documents into ISO 19005 archival standards (PDF/A-1b and PDF/A-2b).
* **Document Repair:** Reconstruct broken xref tables and damaged stream headers.
* **Grayscale Conversion:** Strip color channels for print cost optimization.

---

## 🎨 Multi-Layer Compositing Engine

LetsEdit renders and coordinates documents through a 4-layer canvas compositing stack:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Interactive DOM Layer (.pdf-dom-layer)          │
│ Draggable text boxes, form inputs, signatures, gizmos   │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Annotation Canvas Layer (.pdf-annotation-canvas)│
│ High-performance freehand pen, highlights, rectangles    │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Text Layer (.pdf-text-layer)                   │
│ Selectable glyph spans, click-to-edit coordinate anchors │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Base Render Canvas (.pdf-page-canvas)          │
│ High-DPI PDF.js rasterization of source vector document  │
└─────────────────────────────────────────────────────────┘
```

---

## ✍️ E-Signatures & Audit Trail Engine

* **Multi-Modal Signing:** Draw signatures using smooth Bezier curves, type cursive signatures (*Caveat*, *Dancing Script*, *Great Vibes*), or upload a signature graphic.
* **Multi-Party Sign Requests:** Issue signing workflows with designated signatory fields, email invitations, and progress tracking.
* **SHA-256 Cryptographic Audit Certificate:** Appends an automated, tamper-evident audit record sheet containing:
  - Unique Transaction UUID and Document SHA-256 Digest
  - Timestamp, Signer IP, and Email Identity verification
  - Verification QR Code linking to proof verification

---

## 🔐 Cloudflare Turnstile & Firebase Authentication

* **Cloudflare Turnstile Bot Protection:**
  - Client engine (`src/core/turnstile.js`) dynamically loads Turnstile API with explicit rendering and dark/light theme synchronization.
  - Server route (`POST /api/turnstile/verify`) validates tokens against `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
  - Resilient offline fallback ensures continuous workflow execution in development or offline environments.
* **Live Firebase Authentication:**
  - Configured with Google OAuth popup authentication (`select_account` prompt, email/profile scopes).
  - Email & password registration with password-reset flows.
  - Enterprise SSO domain detection switches dynamically to SSO mode on corporate email entry.
  - Zero hardcoded mock account fallbacks in browser runtime.

---

## ⚡ Multi-Threaded Worker Pool & PWA Architecture

* **Worker Pool:** Offloads intensive operations (threat scans, keyword clustering, batch conversions) to Web Workers across available CPU cores with real-time throughput metrics (pages/sec) displayed in the floating HUD.
* **Progressive Web App (PWA):** Installs natively on macOS, Windows, and Linux via Web App Manifest with service worker asset caching.
* **Mobile Pair:** Scan a QR code from any smartphone or tablet to transfer files instantly to the desktop canvas over local WebRTC/WebSocket pairing.

---

## 📁 Directory Structure

```
Pdf-Editor/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Node 22 test, build & 1,000-line ceiling gate
│       └── deploy.yml             # Automated deployment to Firebase Hosting
├── e2e/                           # Playwright end-to-end browser tests
│   ├── auth-flow.spec.js          # Authentication modal & Google OAuth flows
│   ├── landing-hero.spec.js       # Display-height hero, dark theme & scroll cues
│   ├── studio-upload.spec.js      # Adobe Acrobat uploader & blank page canvas
│   └── tools-and-legal.spec.js    # Legal modal, privacy, terms & workflow tools
├── public/
│   ├── manifest.webmanifest       # PWA application manifest
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
│       ├── canvas/                # Canvas render layers & text clustering
│       └── engine/                # Modular operations (Redact, Bates, Sanitize...)
└── tests/                         # Node.js native unit test suites (332 tests)
    ├── setup.js                   # Test environment bootstrap & Iterator polyfill
    └── turnstile.test.js          # Cloudflare Turnstile client & server unit tests
```

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js:** `>= 20.0.0` (Node 22 LTS recommended)
* **npm:** `>= 9.0.0`

### Installation & Local Run
```bash
# 1. Clone repository
git clone https://github.com/codxbrexx/Lets_Edit.git
cd Lets_Edit

# 2. Install dependencies
npm ci

# 3. Start local development server
npm run dev
# Vite runs at http://localhost:5173/

# 4. (Optional) Start backend API server
npm run server
# Server runs at http://localhost:3000/
```

---

## ⚙️ Configuration & Environment Variables

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

## 🧪 Testing & Quality Gates

The test suite covers unit tests, engine invariants, and full Playwright browser simulations:

```bash
# Run all 332 Unit Test Suites (node:test)
npm test

# Run all 24 Playwright End-to-End Tests (Desktop & Mobile)
npx playwright test

# Verify production Vite build
npm run build
```

### Architecture Rule
Every JavaScript file (`src/**/*.js`) is strictly constrained to a **1,000-line ceiling**. The CI pipeline automatically fails if any file exceeds this threshold.

---

## 🚀 CI/CD & Deployment

Every push to `main` and `verson-update-code` executes the GitHub Actions CI pipeline:
1. Installs clean dependencies via `npm ci`.
2. Validates the 1,000-line architecture quality gate across all JS files.
3. Executes the complete 332-test unit test suite in Node 22.
4. Verifies the production Vite build bundle.
5. Deploys live to **Firebase Hosting** on `main` branch merges.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
