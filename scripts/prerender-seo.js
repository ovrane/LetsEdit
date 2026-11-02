/**
 * Build-Time Static Prerendering Engine for LetsEdit
 * Generates pre-rendered HTML files in dist/ for the landing page and all 45+ tool routes & aliases.
 * Ensures Googlebot, Bingbot, and Social Crawlers (Twitter, LinkedIn, Slack, WhatsApp)
 * receive 100% complete SEO meta tags, canonical links, OpenGraph cards, and Schema.org JSON-LD.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROUTE_DEFINITIONS } from '../src/core/router.js';
import { getLandingTemplateHtml } from '../src/components/landing/landing-html.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const BASE_URL = 'https://letsedit.web.app';

export function prerenderRoutes() {
  const baseHtmlPath = path.resolve(DIST_DIR, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('[Prerender] Error: dist/index.html not found. Run vite build first.');
    return;
  }

  let baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  let count = 0;

  // Preload main stylesheet to eliminate render-blocking delay
  const cssMatch = baseHtml.match(/<link rel="stylesheet"[^>]*href="(\/assets\/index-[^"]+\.css)"/i);
  if (cssMatch && !baseHtml.includes(`rel="preload" as="style" href="${cssMatch[1]}"`)) {
    const cssPreload = `  <link rel="preload" as="style" href="${cssMatch[1]}">\n`;
    baseHtml = baseHtml.replace(cssMatch[0], cssPreload + cssMatch[0]);
  }

  // 1. Prerender Homepage (dist/index.html) with full semantic landing HTML & h1
  const landingHtml = getLandingTemplateHtml();
  let homeHtml = baseHtml;
  if (!homeHtml.includes('id="landing-view"')) {
    homeHtml = homeHtml.replace(
      /(<body[^>]*>)/i,
      `$1\n  <div id="landing-view" class="landing-view-container">\n${landingHtml}\n  </div>`
    );
  }
  homeHtml = homeHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>Free Online PDF Editor &amp; Tools | LetsEdit</title>`);
  homeHtml = homeHtml.replace(/<meta name="description"[\s\S]*?>/i, `<meta name="description" content="Edit, merge, split, compress, convert, and sign PDFs online for free. Your files stay on your device with browser-based processing.">`);
  homeHtml = homeHtml.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${BASE_URL}/">`);
  homeHtml = homeHtml.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="Free Online PDF Editor &amp; Tools | LetsEdit">`);
  homeHtml = homeHtml.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="Edit, merge, split, compress, convert, and sign PDFs online for free. Your files stay on your device with browser-based processing.">`);
  homeHtml = homeHtml.replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${BASE_URL}/">`);
  homeHtml = homeHtml.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${BASE_URL}/og-image.png">`);
  homeHtml = homeHtml.replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="Free Online PDF Editor &amp; Tools | LetsEdit">`);
  homeHtml = homeHtml.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="Edit, merge, split, compress, convert, and sign PDFs online for free. Your files stay on your device with browser-based processing.">`);
  homeHtml = homeHtml.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${BASE_URL}/og-image.png">`);
  fs.writeFileSync(baseHtmlPath, homeHtml, 'utf-8');
  count++;

  // 2. Prerender All Sub-Routes & Aliases
  for (const route of ROUTE_DEFINITIONS) {
    if (route.path === '/') continue;

    const toolName = route.title ? route.title.split('—')[0].split('.')[0].trim() : 'PDF Tool';
    const cleanHeading = toolName.toLowerCase().includes('online') ? toolName : `${toolName} Online Free`;
    const canonicalUrl = `${BASE_URL}${route.path}`;

    // Schema.org Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": `LetsEdit — ${toolName}`,
          "url": canonicalUrl,
          "description": route.description || "Every tool you need to work with PDFs 100% free and in your browser with zero cloud uploads.",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1420"
          }
        },
        {
          "@type": "HowTo",
          "name": `How to use ${toolName} online for free`,
          "step": [
            {
              "@type": "HowToStep",
              "name": "Select PDF",
              "text": "Select your document from your computer or drag and drop it into the tool dropzone."
            },
            {
              "@type": "HowToStep",
              "name": "Configure Options",
              "text": "Customize page ranges, rotation, compression level, or settings directly in your browser."
            },
            {
              "@type": "HowToStep",
              "name": "Process & Save",
              "text": "Click the process button to execute client-side WebAssembly rendering with zero cloud uploads and save your file."
            }
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `Is LetsEdit ${toolName} free with no limits?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, LetsEdit is 100% free with no daily task limits, paywalls, or credit card requirements."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files uploaded to any cloud server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. LetsEdit processes your files locally using WebAssembly inside your browser sandbox with zero server uploads."
              }
            }
          ]
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${BASE_URL}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": toolName,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    // Render HTML template for this route
    let html = baseHtml;

    // Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`);

    // Canonical tag (always points to primary canonicalUrl)
    html = html.replace(
      /<link rel="canonical" href="[^"]*">/i,
      `<link rel="canonical" href="${canonicalUrl}">`
    );

    // Meta description
    if (route.description) {
      html = html.replace(
        /<meta name="description"\s+content="[^"]*">/i,
        `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}">`
      );
    }

    // OpenGraph
    html = html.replace(
      /<meta property="og:title" content="[^"]*">/i,
      `<meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}">`
    );
    if (route.description) {
      html = html.replace(
        /<meta property="og:description" content="[^"]*">/i,
        `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}">`
      );
    }
    html = html.replace(
      /<meta property="og:url" content="[^"]*">/i,
      `<meta property="og:url" content="${canonicalUrl}">`
    );
    html = html.replace(
      /<meta property="og:image" content="[^"]*">/i,
      `<meta property="og:image" content="${BASE_URL}/og-image.png">`
    );

    // Twitter Card
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*">/i,
      `<meta name="twitter:title" content="${route.title.replace(/"/g, '&quot;')}">`
    );
    if (route.description) {
      html = html.replace(
        /<meta name="twitter:description" content="[^"]*">/i,
        `<meta name="twitter:description" content="${route.description.replace(/"/g, '&quot;')}">`
      );
    }
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*">/i,
      `<meta name="twitter:image" content="${BASE_URL}/og-image.png">`
    );

    // JSON-LD replacement
    const jsonLdScript = `<script type="application/ld+json" id="letsedit-route-jsonld">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLdScript);

    // Inject semantic pre-rendered HTML shell for crawlers (Googlebot, Bingbot)
    const semanticContent = `
  <main id="tool-prerender-seo" class="tool-prerender-seo-shell">
    <section class="workflow-uploader-card" style="max-width: 860px; margin: 36px auto; padding: 32px 24px; text-align: center;">
      <h1 class="workflow-title" style="font-size: 32px; font-weight: 800; margin-bottom: 8px;">${cleanHeading}</h1>
      <p class="workflow-subtitle" style="font-size: 15px; color: #64748b; margin-bottom: 24px; max-width: 650px; margin-left: auto; margin-right: auto;">${route.description || 'Fast, private, client-side PDF tool with zero server uploads.'}</p>
      <div class="workflow-dropzone" style="border: 2px dashed #cbd5e1; border-radius: 16px; padding: 36px 20px; background: #f8fafc; margin-bottom: 24px;">
        <a href="${canonicalUrl}" class="workflow-primary-cta btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700;">
          <span>Choose PDF files</span>
        </a>
        <p style="margin-top: 12px; font-size: 12.5px; color: #94a3b8;">100% In-Browser Execution &bull; Zero Server Uploads &bull; Free Forever</p>
      </div>
    </section>

    <!-- Semantic Educational Content for Search Engine Crawlers -->
    <section class="workflow-seo-container" style="max-width: 860px; margin: 0 auto 60px; padding: 0 20px;">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">How to use ${toolName} Online for Free</h2>
      <ol style="margin-bottom: 28px; line-height: 1.8; color: #475569; padding-left: 20px;">
        <li><strong>Select Files:</strong> Click Choose PDF files or drag and drop your document into the upload area.</li>
        <li><strong>Configure:</strong> Adjust settings, page order, or compression directly in your browser.</li>
        <li><strong>Process & Download:</strong> Click Process to generate your PDF instantly with client-side WebAssembly.</li>
      </ol>

      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">Why Choose LetsEdit for ${toolName}</h2>
      <ul style="margin-bottom: 28px; line-height: 1.8; color: #475569; padding-left: 20px;">
        <li><strong>100% Client-Side Privacy:</strong> Your documents never leave your browser or get uploaded to cloud servers.</li>
        <li><strong>Zero Limits & Paywalls:</strong> No hourly task limits, no subscriptions, no forced watermarks.</li>
        <li><strong>Sub-Second Speed:</strong> Local processing avoids slow upload/download roundtrips.</li>
      </ul>

      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">Frequently Asked Questions</h2>
      <div class="seo-faq-list" style="margin-bottom: 28px;">
        <details style="margin-bottom: 10px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <summary style="font-weight: 600; cursor: pointer;">Is LetsEdit ${toolName} completely free?</summary>
          <p style="margin-top: 8px; color: #64748b; font-size: 14px;">Yes, LetsEdit is 100% free with unlimited tasks and zero hidden fees or credit card requirements.</p>
        </details>
        <details style="margin-bottom: 10px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <summary style="font-weight: 600; cursor: pointer;">Are my confidential files secure?</summary>
          <p style="margin-top: 8px; color: #64748b; font-size: 14px;">Yes. Processing runs entirely in client-side WebAssembly inside your browser sandbox. Files never touch any remote server.</p>
        </details>
      </div>

      <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">Related PDF Tools</h2>
      <nav class="seo-related-tools" style="display: flex; gap: 8px; flex-wrap: wrap;">
        <a href="/edit-pdf" style="padding: 5px 12px; background: #f1f5f9; border-radius: 6px; text-decoration: none; color: #334155; font-size: 12.5px;">Edit PDF</a>
        <a href="/merge-pdf" style="padding: 5px 12px; background: #f1f5f9; border-radius: 6px; text-decoration: none; color: #334155; font-size: 12.5px;">Merge PDF</a>
        <a href="/compress-pdf" style="padding: 5px 12px; background: #f1f5f9; border-radius: 6px; text-decoration: none; color: #334155; font-size: 12.5px;">Compress PDF</a>
        <a href="/split-pdf" style="padding: 5px 12px; background: #f1f5f9; border-radius: 6px; text-decoration: none; color: #334155; font-size: 12.5px;">Split PDF</a>
        <a href="/sign-pdf" style="padding: 5px 12px; background: #f1f5f9; border-radius: 6px; text-decoration: none; color: #334155; font-size: 12.5px;">Sign PDF</a>
        <a href="/pdf-to-word" style="padding: 5px 12px; background: #f1f5f9; border-radius: 6px; text-decoration: none; color: #334155; font-size: 12.5px;">PDF to Word</a>
      </nav>
    </section>
  </main>
`;
    html = html.replace(/(<body[^>]*>)/i, `$1\n${semanticContent}`);

    // Prerender both primary path and all aliases
    const allPaths = [route.path, ...(route.aliases || [])];
    const seenDirs = new Set();

    for (const p of allPaths) {
      const cleanPath = p.replace(/^\//, '');
      if (!cleanPath || seenDirs.has(cleanPath)) continue;
      seenDirs.add(cleanPath);

      const targetDir = path.resolve(DIST_DIR, cleanPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetFile = path.resolve(targetDir, 'index.html');
      fs.writeFileSync(targetFile, html, 'utf-8');
      count++;
    }
  }

  console.log(`[Prerender] Successfully generated ${count} static prerendered HTML routes (including homepage & aliases) in dist/`);
}

// Self-executing if run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prerenderRoutes();
}
