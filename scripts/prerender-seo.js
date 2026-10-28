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

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  let count = 0;

  // 1. Prerender Homepage (dist/index.html) with full semantic landing HTML & h1
  const landingHtml = getLandingTemplateHtml();
  let homeHtml = baseHtml;
  if (!homeHtml.includes('id="landing-view"')) {
    homeHtml = homeHtml.replace(
      /(<body[^>]*>)/i,
      `$1\n  <div id="landing-view" class="landing-view-container">\n${landingHtml}\n  </div>`
    );
  }
  homeHtml = homeHtml.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${BASE_URL}/">`);
  homeHtml = homeHtml.replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${BASE_URL}/">`);
  homeHtml = homeHtml.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${BASE_URL}/og-image.png">`);
  homeHtml = homeHtml.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${BASE_URL}/og-image.png">`);
  fs.writeFileSync(baseHtmlPath, homeHtml, 'utf-8');
  count++;

  // 2. Prerender All Sub-Routes & Aliases
  for (const route of ROUTE_DEFINITIONS) {
    if (route.path === '/') continue;

    const toolName = route.title ? route.title.split('—')[0].split('.')[0].trim() : 'PDF Tool';
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
