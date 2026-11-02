# Contributing to LetsEdit — Free PDF Suite for Everyone

> **Mission:** Make professional-grade PDF editing **completely free, forever** — no limits, no paywalls, no uploads. Every feature that costs money on Adobe, Smallpdf, or iLovePDF should be available to anyone with a browser.

[![CI Pipeline](https://github.com/codxbrexx/Lets_Edit/actions/workflows/ci.yml/badge.svg)](https://github.com/codxbrexx/Lets_Edit/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-458%20passing-success.svg)](tests/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Table of Contents

1. [Why Contribute?](#why-contribute)
2. [Philosophy & Guiding Principles](#philosophy--guiding-principles)
3. [Before You Start](#before-you-start)
4. [Local Development Setup](#local-development-setup)
5. [Project Architecture Map](#project-architecture-map)
6. [Code Standards](#code-standards)
7. [How to Pick a Task](#how-to-pick-a-task)
8. [Pull Request Workflow](#pull-request-workflow)
9. [Writing Tests](#writing-tests)
10. [Priority Contribution Areas](#priority-contribution-areas)
11. [Community & Contact](#community--contact)

---

## Why Contribute

Millions of people are forced to pay $10–$25/month just to edit a PDF, add a signature, or merge documents. LetsEdit exists to eliminate that barrier. Every tool runs entirely in the browser — **your files never leave your device**.

Contributors directly provide access to professional tools for:
- Students submitting assignments
- Freelancers editing contracts
- Healthcare workers handling patient forms
- Teachers creating learning materials
- Anyone in a country where paid software is unaffordable

**Every contribution directly improves access to essential software for people worldwide.**

---

## Philosophy & Guiding Principles

These are non-negotiable. Every contribution must respect them:

| Principle | What it means |
|-----------|--------------|
| **100% Client-Side** | No file uploads to any server. All PDF processing happens in the browser using WebAssembly + `pdf-lib` + `pdfjs-dist`. |
| **Zero Paywalls** | Every feature is free. No "upgrade to pro", no file size limits, no daily limits. |
| **Zero Telemetry** | No analytics, no tracking pixels, no usage logging. We don't even know you used the app. |
| **Privacy by Architecture** | Files stay in browser RAM. They are never written to disk on a server. |
| **Speed First** | Operations on 100-page documents must complete in under 3 seconds on a mid-range laptop. |
| **Competitive Parity** | Every feature must be as good as or better than Adobe Acrobat Web, Sejda, and iLovePDF. |

---

## Before You Start

1. **Read the architecture docs:**
   - [`LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md`](./LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md) — deep competitive analysis
   - [`LETSEDIT_AUTH_SPECIFICATION.md`](./LETSEDIT_AUTH_SPECIFICATION.md) — auth system design
   - [`todo.md`](./todo.md) — master implementation matrix and roadmap
   - [`bug.md`](./bug.md) — current known bugs and resolved issues
   - [`CONTRIBUTORS_TODO.md`](./CONTRIBUTORS_TODO.md) — your starting point for tasks

2. **Never break existing tests.** Run `npm test` before submitting anything. All 458 tests must pass.

3. **Ask first for large features.** Open a GitHub Issue before starting a major feature to avoid wasted work.

---

## Local Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 22.x (Active LTS) |
| npm | ≥ 9.x |
| Git | Any modern version |
| Browser | Chrome 120+ / Firefox 121+ / Safari 17+ |

### Setup Steps

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Lets_Edit.git
cd Lets_Edit

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env
# Fill in .env with your own Firebase keys (see .env.example for guidance)
# For local PDF tool development, Firebase is optional — tools work without it

# 4. Start the dev server
npm run dev
# App opens at http://localhost:5173

# 5. Run tests (all 458 must pass before any PR)
npm test

# 6. Build for production (must succeed with zero errors)
npm run build
```

### Environment Variables (`.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_FIREBASE_API_KEY` | Optional | Firebase authentication |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Firebase project ID |
| `VITE_TURNSTILE_SITE_KEY` | Optional | Cloudflare bot protection |

> **Note:** You can use `1x00000000000000000000AA` as the Turnstile test key locally.
> All 52+ PDF tools work completely without Firebase. Auth is only needed for cloud sync.

---

## Project Architecture Map

```
Pdf-Editor/
├── index.html                     ← App shell, SEO meta, full toolbar HTML
├── vite.config.js                 ← Build config (code splitting, CORS, preload)
├── src/
│   ├── main.js                    ← Bootstrap: App class, all event bindings
│   ├── style.css                  ← CSS design token entry point
│   ├── styles/                    ← Modular CSS files (one per UI section)
│   │   ├── studio-controls.css    ← Toolbar, properties bar, dropdown menus
│   │   └── ...
│   ├── core/                      ← Pure engine logic — NO DOM, NO UI here
│   │   ├── pdf-engine.js          ← PDF facade: merge, split, compress, export, OCR...
│   │   ├── canvas-manager.js      ← WYSIWYG canvas: tools, annotations, gizmos
│   │   ├── state-store.js         ← Global pub/sub reactive state store
│   │   ├── font-registry.js       ← 150+ font catalog + Google Fonts lazy loader
│   │   ├── pdf-crypto.js          ← ISO 32000 AES-256 / RC4 encryption engine
│   │   ├── pdf-redactor.js        ← Permanent text redaction at stream level
│   │   ├── router.js              ← SPA pushState router with 56 routes
│   │   ├── pwa-manager.js         ← Service worker, offline detection, install prompt
│   │   └── canvas/                ← Canvas sub-engines
│   │       ├── text-clustering.js ← Baseline grouping (Sejda-style phrase detection)
│   │       ├── resize-gizmo.js    ← 8-handle transform gizmo for annotations
│   │       └── empty-state.js     ← Studio empty state (upload prompt)
│   ├── components/                ← UI modal components (one modal = one file)
│   │   ├── tool-workflow.js       ← iLovePDF 3-stage pipeline engine
│   │   ├── sidebar.js             ← Page thumbnail sidebar panel
│   │   ├── landing-page.js        ← Full landing page + hero section
│   │   ├── auth-modal.js          ← Firebase Google OAuth modal
│   │   ├── watermark-modal.js     ← Watermark tool UI + preview
│   │   ├── pagenumbers-modal.js   ← Header/footer numbering UI
│   │   ├── compare-modal.js       ← PDF diff viewer UI
│   │   ├── ocr-modal.js           ← OCR language selector + progress
│   │   └── workflow/              ← Per-tool workspace option panels
│   ├── tools/                     ← Interactive canvas tool implementations
│   │   ├── signature-tool.js      ← Draw / Type / Upload / Camera signature
│   │   ├── form-tool.js           ← AcroForm field builder (text, checkbox, radio)
│   │   ├── image-tool.js          ← Stamp/image placer with resize gizmo
│   │   └── search-replace.js      ← Find & replace across PDF content streams
│   ├── react/                     ← React 19 components (landing + navbar only)
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── LandingHero.jsx
│   │       └── CanvaToolbar.jsx
│   └── utils/
│       ├── helpers.js             ← downloadBlob, readFileAsArrayBuffer, etc.
│       └── theme.js               ← Dark / light theme manager
├── server/                        ← Thin Node.js API (watermark preview only)
│   ├── index.js                   ← Express entry + route handler registration
│   └── routes/
├── tests/                         ← Node.js native test runner suites
│   ├── setup.js                   ← ES2024 Iterator polyfill for Node 22 CI
│   ├── pdf-export.test.js         ← Core engine tests
│   ├── text-clustering.test.js    ← Baseline grouping tests
│   ├── watermark-suite.test.js    ← Watermark engine tests
│   └── ...15 total suites
├── e2e/                           ← Playwright browser tests (24 tests)
├── scripts/
│   ├── generate-sitemap.js        ← Generates /public/sitemap.xml (56 URLs)
│   └── prerender-seo.js           ← Static HTML prerender (279 routes)
└── public/
    ├── sw.js                      ← Service worker (offline + caching)
    └── manifest.webmanifest       ← PWA manifest
```

---

## Code Standards

### Non-Negotiable Rules

1. **1,000-line file limit** — if a file exceeds this, split it into modules
2. **No server-side file processing** — every operation must run in the browser
3. **No `console.log` in production** — use `Toast.info()` / `Toast.error()` for user messages
4. **All async functions must have `try/catch`** with meaningful error messages
5. **Guard against null DOM elements:**
   ```js
   const el = document.getElementById('my-button');
   if (!el) return; // always guard before using
   ```

### JavaScript Style

```js
// Correct pattern
/**
 * Converts a PDF page to a high-resolution image blob.
 * @param {Uint8Array} pdfBytes - Raw PDF binary data
 * @param {number} pageIndex - 0-based page number
 * @param {number} [dpi=150] - Output DPI (72, 150, or 300)
 * @returns {Promise<Blob>} JPEG or PNG image blob
 */
export async function renderPageToImageBlob(pdfBytes, pageIndex, dpi = 150) {
  if (!pdfBytes) throw new Error('renderPageToImageBlob: pdfBytes is required');
  try {
    // implementation
  } catch (err) {
    Toast.error(`Failed to render page: ${err.message}`);
    throw err;
  }
}

// Wrong pattern — no docs, silent failure, default export
export default async function render(b, i, d) {
  try { /* ... */ } catch (e) {}
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | `kebab-case.js` | `pdf-engine.js` |
| Classes | `PascalCase` | `CanvasManager` |
| Functions/methods | `camelCase` | `exportPdf()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE_MB` |
| CSS custom properties | `--kebab-case` | `--color-primary` |
| Test suites | `kebab-case.test.js` | `ocr-engine.test.js` |

### CSS Standards

- Add new design tokens to `:root` in `src/style.css` — never hardcode values
- Every dark mode overrides must also be in `[data-theme="dark"]`
- Animations must respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .animated-thing { animation: none; }
  }
  ```

---

## How to Pick a Task

1. Open [`CONTRIBUTORS_TODO.md`](./CONTRIBUTORS_TODO.md)
2. Find a task marked with your skill level:
   - **Easy** — self-contained, 1–2 files, good for first-time contributors
   - **Medium** — requires understanding 2–4 files, moderate complexity
   - **Hard** — multi-file, algorithm-heavy, requires deep PDF knowledge
3. Check the task is not already assigned in GitHub Issues
4. Comment on the issue (or create one) so others know you're on it
5. Read the **"Exact Files to Edit"** and **"Acceptance Criteria"** for your task

---

## Pull Request Workflow

```bash
# 1. Sync your fork with upstream
git remote add upstream https://github.com/codxbrexx/Lets_Edit.git
git fetch upstream
git checkout main
git merge upstream/main

# 2. Create a descriptive feature branch
git checkout -b feat/tesseract-ocr-wasm-worker

# 3. Make your changes (commit often with meaningful messages)
git commit -m "feat(ocr): bootstrap Tesseract.js WASM worker loader"
git commit -m "feat(ocr): wire language selector to worker config"
git commit -m "test(ocr): add WASM worker initialization test"

# 4. Verify tests pass
npm test

# 5. Verify clean build
npm run build

# 6. Push and open a PR
git push origin feat/tesseract-ocr-wasm-worker
```

### PR Checklist

Before clicking "Create Pull Request", confirm **all** of these:

- [ ] `npm test` — **all tests pass** (0 failures)
- [ ] `npm run build` — **builds without errors**
- [ ] Feature works entirely in the browser (no server needed)
- [ ] Feature works while offline (after first page load)
- [ ] No file in the PR exceeds 1,000 lines
- [ ] New public functions have JSDoc comments
- [ ] At least one unit test covers the new logic
- [ ] No hardcoded colors, magic numbers, or `console.log`
- [ ] Dark mode is tested and works correctly
- [ ] Mobile view (375px width) is tested

### Commit Message Format

```
<type>(<scope>): <short description>

Types:
  feat      New feature
  fix       Bug fix
  docs      Documentation only
  test      Adding or fixing tests
  style     CSS / formatting, no logic change
  refactor  Code restructure without behavior change
  perf      Performance improvement
  chore     Build, config, or tooling changes

Examples:
  feat(ocr): add real Tesseract WASM worker with language selector
  fix(toolbar): add missing loadAllEditorFonts import in main.js
  test(watermark): cover mosaic repeat grid layout mode
  perf(canvas): debounce annotation re-render on resize
```

---

## Writing Tests

Tests use **Node.js's built-in test runner** (no Jest, no Mocha). Keep them fast and pure.

```js
// tests/my-feature.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { myFunction } from '../src/core/my-module.js';

describe('My Feature Tests', () => {
  test('returns correct output for valid input', async () => {
    const result = await myFunction({ input: 'test' });
    assert.equal(result.status, 'success');
    assert.ok(result.outputBytes instanceof Uint8Array);
    assert.ok(result.outputBytes.length > 0);
  });

  test('throws meaningful error for invalid input', async () => {
    await assert.rejects(
      () => myFunction(null),
      { message: /required/ }
    );
  });
});
```

Run tests:
```bash
npm test                                        # All 458 tests
node --import ./tests/setup.js --test tests/my-feature.test.js  # Single suite
```

**Test coverage rules:**
- Every new function in `src/core/` → **must have at least one test**
- Every new server route in `server/` → **must have at least one test**
- Pure UI/CSS changes → tests optional but appreciated
- Bug fixes → **must include a regression test**

---

## Priority Contribution Areas

See [`CONTRIBUTORS_TODO.md`](./CONTRIBUTORS_TODO.md) for all tasks with difficulty ratings, file pointers, and acceptance criteria.

**Highest impact open tasks:**

| Priority | Task | Why It Matters | Difficulty |
|----------|------|---------------|-----------|
|  1 | Real Tesseract WASM OCR | Current OCR is a placeholder — scanned PDFs can't be searched | Hard |
|  2 | PDF/A-2b & 3b conformance | Archival PDF standards used in legal/government | Hard |
|  3 | Visual compare wipe slider | Side-by-side diff view with drag wipe/blend | Medium |
|  4 | Mobile camera QR pairing | Scan paper with phone → appears on desktop | Hard |
|  5 | Accessibility (ARIA + keyboard) | Screen reader support, focus management | Medium |
|  6 | i18n / Internationalization | App is English-only — millions excluded | Medium |
|  7 | CSS preload `crossorigin` fix | Browser warning on every page load | Easy |
|  8 | EPUB to PDF conversion | Popular ebook format with no free converter | Hard |
|  9 | PDF to EPUB conversion | Reverse of above | Hard |
| 10 | Table extraction to Excel | Smarter table detection from PDF streams | Medium |

---

## Community & Contact

- **GitHub Issues** — bug reports, feature proposals, questions
- **GitHub Discussions** — architecture discussions, design decisions
- **Security Issues** — report privately via GitHub's security advisory tab (never in public issues)

---

## License

By contributing, you agree your code will be released under the [MIT License](./LICENSE).
All contributions must be your own original work or properly attributed open-source code with a compatible license.

---

*Every line of code you contribute makes PDF editing free for millions of people. Thank you for that.*
