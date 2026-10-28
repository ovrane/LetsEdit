/**
 * Project Documentation & Engineering Specification Content
 * Detailed technical breakdown of LetsEdit's architecture, 4-layer compositing engine,
 * text clustering math, cryptographic audit trail, worker pool, and maintenance standards.
 * Adheres strictly to the < 1,000 lines per file rule.
 */

export function getProjectDocsNavHtml() {
  return `
    <div class="docs-nav-header">Architecture &amp; Core</div>
    <button class="docs-nav-item active" data-chapter="proj-zero-cloud">
      <span>1. Zero-Cloud Architecture</span>
      <span class="docs-nav-badge">WASM</span>
    </button>
    <button class="docs-nav-item" data-chapter="proj-compositing">
      <span>2. 4-Layer Compositing Stack</span>
      <span class="docs-nav-badge">Canvas</span>
    </button>
    <button class="docs-nav-item" data-chapter="proj-text-clustering">
      <span>3. Text Clustering &amp; Fonts</span>
      <span class="docs-nav-badge">Math</span>
    </button>

    <div class="docs-nav-header" style="margin-top: 10px;">Security &amp; Forensic</div>
    <button class="docs-nav-item" data-chapter="proj-audit-trail">
      <span>4. Cryptographic E-Sign Audit</span>
      <span class="docs-nav-badge">SHA-256</span>
    </button>
    <button class="docs-nav-item" data-chapter="proj-worker-pool">
      <span>5. Multi-Thread Worker Pool</span>
      <span class="docs-nav-badge">Concurrency</span>
    </button>
    <button class="docs-nav-item" data-chapter="proj-true-redaction">
      <span>6. Vector Redaction vs Overlays</span>
      <span class="docs-nav-badge">Forensic</span>
    </button>

    <div class="docs-nav-header" style="margin-top: 10px;">Engineering &amp; Ops</div>
    <button class="docs-nav-item" data-chapter="proj-rest-apis">
      <span>7. REST API Endpoints</span>
      <span class="docs-nav-badge">Edge</span>
    </button>
    <button class="docs-nav-item" data-chapter="proj-modular-standard">
      <span>8. 1,000-Line Codebase Rule</span>
      <span class="docs-nav-badge">Quality</span>
    </button>
    <button class="docs-nav-item" data-chapter="proj-maintenance-guide">
      <span>9. Maintenance &amp; CI/CD</span>
      <span class="docs-nav-badge">DevOps</span>
    </button>
  `;
}

export function getProjectDocsQuickGridHtml() {
  return `
    <div class="docs-quick-card" data-target="proj-zero-cloud">
      <h4><span>⚡</span> Zero-Cloud WASM</h4>
      <p>100% in-browser memory execution. Zero server uploads, zero disk persistence.</p>
    </div>
    <div class="docs-quick-card" data-target="proj-compositing">
      <h4><span>🎨</span> 4-Layer Canvas Stack</h4>
      <p>Decoupled base canvas, text span hit-testing, ink annotations, and DOM gizmos.</p>
    </div>
    <div class="docs-quick-card" data-target="proj-audit-trail">
      <h4><span>📜</span> Cryptographic Audit Trail</h4>
      <p>ESIGN/eIDAS compliant SHA-256 digest certification with vector QR codes.</p>
    </div>
  `;
}

export function getProjectDocsContentHtml() {
  return `
    <!-- Project Chapter 1: Zero-Cloud Architecture -->
    <article class="docs-chapter" id="proj-zero-cloud">
      <span class="docs-chapter-tag">Architecture • Chapter 1</span>
      <h2 class="docs-chapter-title">Zero-Cloud Client Architecture &amp; Memory Sandbox</h2>
      <p class="docs-chapter-desc">
        Unlike legacy web PDF editors that stream sensitive files to remote server queues, LetsEdit executes
        all vector operations, text rasterization, and compression directly inside the client browser.
      </p>

      <div class="docs-tech-card">
        <h3 class="docs-tech-title">Traditional Cloud Editors vs. LetsEdit Architecture</h3>
        <div class="docs-code-preview">
Traditional Editors:  [User Browser] ──(Full PDF Upload)──> [Cloud Server Disk] ──(Download)──> [Browser]
LetsEdit Engine:      [Browser RAM: PDF.js + WASM + pdf-lib + Web Workers] ──(Local Blob)──> [User Disk]
        </div>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">100% Client-Side In-Memory Lifecycle</h3>
        </div>
        <p class="docs-step-body">
          Documents uploaded via drag-and-drop are loaded as standard <code>ArrayBuffer</code> objects in browser RAM.
          The document dictionary is parsed by <code>PDF.js</code> and modified at the byte level via <code>pdf-lib</code>.
          At no point are binary streams transmitted across the network, eliminating compliance exposure under GDPR, HIPAA, and SOC2.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Hardware-Accelerated WebAssembly Core</h3>
        </div>
        <p class="docs-step-body">
          High-complexity routines (such as Tesseract OCR, visual bitmap diffing, and DCT stream decoding)
          compile to WebAssembly binaries, allowing 60 FPS viewport rendering and handling 500+ page documents with zero UI lockup.
        </p>
      </div>
    </article>

    <!-- Project Chapter 2: 4-Layer Compositing Stack -->
    <article class="docs-chapter" id="proj-compositing">
      <span class="docs-chapter-tag">Compositing • Chapter 2</span>
      <h2 class="docs-chapter-title">The 4-Layer Canvas Compositing Pipeline</h2>
      <p class="docs-chapter-desc">
        To allow fluid pan, zoom, freehand ink drawing, and click-to-edit inline typography without re-rendering the entire page,
        LetsEdit separates the document viewport into four decoupled DOM and canvas layers.
      </p>

      <div class="docs-tech-card">
        <h3 class="docs-tech-title">Viewport Layer Hierarchy</h3>
        <table class="docs-api-table">
          <thead>
            <tr><th>Layer</th><th>DOM Class</th><th>Function &amp; Purpose</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Layer 4</strong></td>
              <td><code>.pdf-dom-layer</code></td>
              <td>Interactive DOM: Transform gizmos, drag handles, AcroForm inputs, signature placement anchors.</td>
            </tr>
            <tr>
              <td><strong>Layer 3</strong></td>
              <td><code>.pdf-annotation-canvas</code></td>
              <td>2D Canvas: Freehand Bezier-smoothed ink strokes, vector highlighters, geometric rectangles, and arrows.</td>
            </tr>
            <tr>
              <td><strong>Layer 2</strong></td>
              <td><code>.pdf-text-layer</code></td>
              <td>HTML Spans: Transparent glyph-anchored text spans matching PDF matrix coordinates for double-click editing.</td>
            </tr>
            <tr>
              <td><strong>Layer 1</strong></td>
              <td><code>.pdf-page-canvas</code></td>
              <td>Base Canvas: High-DPI PDF.js raster viewport rendered at <code>window.devicePixelRatio</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <!-- Project Chapter 3: Real-Time Text Clustering & Typography -->
    <article class="docs-chapter" id="proj-text-clustering">
      <span class="docs-chapter-tag">Typography • Chapter 3</span>
      <h2 class="docs-chapter-title">Real-Time Text Clustering &amp; Baseline Snapping</h2>
      <p class="docs-chapter-desc">
        PDF documents do not store sentences or words; they store raw character glyph coordinates.
        Our clustering engine mathematically groups disjointed syllables into editable words and coherent paragraphs.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Baseline Alignment Algorithm</h3>
        </div>
        <p class="docs-step-body">
          Glyphs are grouped onto baselines using a Y-coordinate threshold of <code>2.5pt</code>.
          Glyphs on the same baseline are then sorted horizontally by X-coordinate. When the horizontal gap between adjacent glyphs
          exceeds <code>0.25 * fontSize</code>, a word boundary is synthesized.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Heuristic Font Matching &amp; Canvas Whiteout</h3>
        </div>
        <p class="docs-step-body">
          When text is edited inline, the system detects whether the original font is serif, sans-serif, or monospace,
          matching it against standard system families (Helvetica, Times New Roman, Courier, Georgia).
          An opaque background patch is rendered beneath the new vector text to cleanly conceal the underlying glyph.
        </p>
      </div>
    </article>

    <!-- Project Chapter 4: Cryptographic E-Sign Audit Trail -->
    <article class="docs-chapter" id="proj-audit-trail">
      <span class="docs-chapter-tag">Legal &amp; Compliance • Chapter 4</span>
      <h2 class="docs-chapter-title">Multi-Party E-Signatures &amp; Cryptographic Audit Trail</h2>
      <p class="docs-chapter-desc">
        Full regulatory compliance with the <strong>U.S. ESIGN Act</strong>, <strong>UETA</strong>, and <strong>EU eIDAS (SES/AES)</strong> standards
        via automated SHA-256 document hashing and printable tamper-evident audit certificate sheets.
      </p>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Cryptographic SHA-256 Checksums</h3>
        </div>
        <p class="docs-step-body">
          Before any signature is placed, a SHA-256 hash of the base document bytes is computed.
          Upon execution of all signatures and form flattening, a final SHA-256 hash is generated.
          Any subsequent byte modification invalidates the mathematical seal.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">2</span>
          <h3 class="docs-step-title">Tamper-Proof Verification Certificate Sheet</h3>
        </div>
        <p class="docs-step-body">
          The engine appends a dedicated certificate sheet featuring an RFC 4122 v4 Transaction UUID,
          recorded signer IP address, verified email, UTC execution timestamp, and an embedded vector QR code
          linking directly to the public cryptographic verification proof.
        </p>
      </div>
    </article>

    <!-- Project Chapter 5: Multi-Threaded Web Worker Pool -->
    <article class="docs-chapter" id="proj-worker-pool">
      <span class="docs-chapter-tag">Concurrency • Chapter 5</span>
      <h2 class="docs-chapter-title">Hardware-Scalable Web Worker Pool &amp; Live HUD</h2>
      <p class="docs-chapter-desc">
        Heavy tasks (batch OCR, image extraction, document sanitization, visual page diffing) are offloaded
        to a pool of background Web Workers dynamically scaled to available hardware CPU cores.
      </p>

      <div class="docs-tech-card">
        <h3 class="docs-tech-title">Worker Pool Mechanics</h3>
        <div class="docs-code-preview">
const coreCount = Math.min(navigator.hardwareConcurrency || 4, 8);
this.pool = new WorkerPool({
  workerScript: '/src/core/worker-pool.js',
  concurrency: coreCount,
  onProgress: (throughput) => updateLiveHUD(throughput.pagesPerSec)
});
        </div>
        <p style="margin-top: 10px; font-size: 13.5px; color: var(--text-secondary);">
          <strong>Resilient Fallback:</strong> In restricted browser sandboxes where Web Workers are prohibited by CSP,
          the dispatcher seamlessly shifts to non-blocking <code>requestIdleCallback</code> micro-chunking on the main thread.
        </p>
      </div>
    </article>

    <!-- Project Chapter 6: True Vector Redaction vs Black Box Overlays -->
    <article class="docs-chapter" id="proj-true-redaction">
      <span class="docs-chapter-tag">Security • Chapter 6</span>
      <h2 class="docs-chapter-title">Forensic Vector Redaction vs. Superficial Black Overlays</h2>
      <p class="docs-chapter-desc">
        Why standard PDF editors fail at security, and how LetsEdit guarantees irreversible forensic destruction of sensitive data.
      </p>

      <div class="docs-tech-card">
        <h3 class="docs-tech-title">The "Black Rectangle" Vulnerability</h3>
        <p style="font-size: 14px; line-height: 1.6; color: var(--text-main);">
          Naive editors simply paint a black rectangle annotation over confidential text.
          Anyone can open the resulting PDF, copy the text beneath the box, or delete the rectangle in Adobe Acrobat.
          This has caused catastrophic legal and governmental data leaks worldwide.
        </p>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">✓</span>
          <h3 class="docs-step-title">The LetsEdit Forensic Redaction Protocol</h3>
        </div>
        <p class="docs-step-body">
          LetsEdit unpacks the PDF content streams, traverses the font glyph dictionary, and permanently deletes
          the text tokens, character coordinates, and underlying matrix objects inside the redacted bounding box.
          Only after the byte data is forensically destroyed is an opaque vector graphic baked into the stream.
        </p>
      </div>
    </article>

    <!-- Project Chapter 7: REST API & Edge Endpoints -->
    <article class="docs-chapter" id="proj-rest-apis">
      <span class="docs-chapter-tag">API Reference • Chapter 7</span>
      <h2 class="docs-chapter-title">REST API Endpoints &amp; Edge Integration</h2>
      <p class="docs-chapter-desc">
        Optional Node.js API services for headless automation, Cloudflare Turnstile token validation, and multi-party sign dispatching.
      </p>

      <div class="docs-tech-card">
        <table class="docs-api-table">
          <thead>
            <tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>/api/turnstile/verify</code></td>
              <td><code>POST</code></td>
              <td>Validates Cloudflare Turnstile CAPTCHA tokens against Cloudflare SiteVerify edge.</td>
            </tr>
            <tr>
              <td><code>/api/sign-requests</code></td>
              <td><code>POST</code></td>
              <td>Dispatches multi-party signature workflows and sends secure signing links to recipients.</td>
            </tr>
            <tr>
              <td><code>/api/sign-requests/:id</code></td>
              <td><code>GET</code></td>
              <td>Retrieves signature metadata, field coordinates, and current signing completion status.</td>
            </tr>
            <tr>
              <td><code>/api/sanitize</code></td>
              <td><code>POST</code></td>
              <td>Headless inspection route identifying embedded scripts, alternate streams, and metadata.</td>
            </tr>
            <tr>
              <td><code>/api/split-merge</code></td>
              <td><code>POST</code></td>
              <td>Automated document assembly with dynamic Table of Contents generation.</td>
            </tr>
            <tr>
              <td><code>/api/html-to-pdf/convert</code></td>
              <td><code>POST</code></td>
              <td>Converts Markdown, HTML, or raw strings into formatted vector PDF bytes.</td>
            </tr>
            <tr>
              <td><code>/api/extract-images/manifest</code></td>
              <td><code>POST</code></td>
              <td>Extracts embedded raster XObjects (DCT, Flate, JPX) into a packaged ZIP archive.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <!-- Project Chapter 8: Strict 1,000-Line Codebase Rule -->
    <article class="docs-chapter" id="proj-modular-standard">
      <span class="docs-chapter-tag">Standards • Chapter 8</span>
      <h2 class="docs-chapter-title">Strict 1,000-Line Modular Architecture Standard</h2>
      <p class="docs-chapter-desc">
        To prevent monolithic files and codebase rot, LetsEdit enforces an absolute architectural constraint:
      </p>

      <div class="docs-callout important">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <div>
          <strong>Strict Architectural Gate:</strong> Every JavaScript file in <code>src/</code> must remain strictly under 1,000 lines of code.
          If any file exceeds 999 lines, the CI pipeline automatically fails.
        </div>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">1</span>
          <h3 class="docs-step-title">Decomposition Patterns</h3>
        </div>
        <p class="docs-step-body">
          Large systems are decomposed into single-responsibility modules:
          <br>• <code>landing-page.js</code> ➔ <code>landing-html.js</code>, <code>landing-cards.js</code>, <code>landing-icons.js</code>, <code>landing-popular.js</code>
          <br>• <code>page-operations.js</code> ➔ <code>split-ops.js</code>, <code>merge-ops.js</code>, <code>bates-ops.js</code>, <code>sanitize.js</code>, <code>sign-audit.js</code>
          <br>• <code>docs-page.js</code> ➔ <code>docs-project-content.js</code>
        </p>
      </div>
    </article>

    <!-- Project Chapter 9: Maintenance, Testing & CI/CD -->
    <article class="docs-chapter" id="proj-maintenance-guide">
      <span class="docs-chapter-tag">DevOps • Chapter 9</span>
      <h2 class="docs-chapter-title">Maintenance Protocol, Quality Gates &amp; Deployment</h2>
      <p class="docs-chapter-desc">
        Automated testing, sitemap generation, static HTML prerendering, and zero-downtime Firebase Hosting deployment.
      </p>

      <div class="docs-tech-card">
        <h3 class="docs-tech-title">Essential Development Commands</h3>
        <div class="docs-code-preview">
# 1. Start local Vite development server
npm run dev

# 2. Run all 447+ automated unit test suites
npm test

# 3. Execute full production build + XML sitemap + 58 static SEO prerendered routes
npm run build

# 4. Deploy production bundle to Firebase Hosting
npm run deploy
        </div>
      </div>

      <div class="docs-step-card">
        <div class="docs-step-header">
          <span class="docs-step-num">✓</span>
          <h3 class="docs-step-title">Automated Quality Gates</h3>
        </div>
        <p class="docs-step-body">
          Every Git pull request and merge triggers our automated GitHub Actions CI pipeline:
          <br>1. <strong>Node.js 22 Test Suite:</strong> 447 tests verify engine operations, converters, and security.
          <br>2. <strong>1,000-Line Ceiling Check:</strong> AST scanner confirms zero files exceed 999 lines.
          <br>3. <strong>SEO Prerender Check:</strong> Validates static HTML generation across all 58 canonical URLs.
          <br>4. <strong>Production Deployment:</strong> Compiles and uploads assets to Firebase Hosting with edge caching headers.
        </p>
      </div>
    </article>
  `;
}
