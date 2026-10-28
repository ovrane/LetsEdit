/**
 * Automated XML Sitemap Generator for LetsEdit
 * Generates an SEO-optimized sitemap.xml with all canonical routes,
 * priority scoring based on search query volume, and current lastmod dates.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROUTE_DEFINITIONS } from '../src/core/router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_SITEMAP = path.resolve(ROOT_DIR, 'public', 'sitemap.xml');
const BASE_URL = 'https://letsedit-pdf.web.app';

// Today's date in ISO YYYY-MM-DD
const TODAY = new Date().toISOString().split('T')[0];

function getPriorityAndFreq(route) {
  const p = route.path;
  if (p === '/' || p === '/edit_pdf') {
    return { priority: '1.0', changefreq: 'daily' };
  }
  if (['/merge_pdf', '/compress_pdf', '/split_pdf', '/pdf_to_word', '/sign_pdf'].includes(p)) {
    return { priority: '0.95', changefreq: 'weekly' };
  }
  if ([
    '/word_to_pdf', '/pdf_to_excel', '/pdf_to_powerpoint', '/pdf_to_jpg',
    '/jpg_to_pdf', '/organize_pdf', '/ocr_pdf', '/watermark_pdf',
    '/protect_pdf', '/unlock_pdf', '/redact_pdf', '/rotate_pdf'
  ].includes(p)) {
    return { priority: '0.9', changefreq: 'weekly' };
  }
  if ([
    '/bates_numbering_pdf', '/pdf_to_pdfa', '/compare_pdf', '/nup_pdf',
    '/split_half_pdf', '/alternate_mix_pdf', '/resize_pdf', '/repair_pdf',
    '/fill_pdf', '/flatten_pdf', '/edit_pdf_metadata', '/page_labels',
    '/sanitize_pdf', '/bookmarks', '/header-footer', '/pagenumber_pdf',
    '/extract_pages_pdf', '/extract_images_pdf', '/extract_text_pdf',
    '/grayscale_pdf', '/flip_pdf', '/deskew_pdf', '/rename_pdf',
    '/remove_annotations_pdf', '/html_to_pdf', '/powerpoint_to_pdf',
    '/excel_to_pdf', '/scan_pdf'
  ].includes(p)) {
    return { priority: '0.8', changefreq: 'monthly' };
  }
  if (['/request_signature', '/sign_document', '/mobile_pair'].includes(p)) {
    return { priority: '0.7', changefreq: 'monthly' };
  }
  if (p === '/docs') {
    return { priority: '0.85', changefreq: 'weekly' };
  }
  if (['/privacy', '/terms', '/security-whitepaper', '/security', '/cookies'].includes(p)) {
    return { priority: '0.6', changefreq: 'monthly' };
  }
  // Exclude internal auth / account routes from indexing sitemap
  if (['/login', '/register', '/account'].includes(p)) {
    return null;
  }
  return { priority: '0.8', changefreq: 'monthly' };
}

export function generateSitemapXml() {
  const seenPaths = new Set();
  const entries = [];

  for (const route of ROUTE_DEFINITIONS) {
    if (seenPaths.has(route.path)) continue;
    seenPaths.add(route.path);

    const meta = getPriorityAndFreq(route);
    if (!meta) continue;

    const loc = route.path === '/' ? `${BASE_URL}/` : `${BASE_URL}${route.path}`;
    entries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`);
  }

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

  fs.writeFileSync(PUBLIC_SITEMAP, xmlContent, 'utf-8');
  console.log(`[Sitemap] Generated ${entries.length} URLs in ${PUBLIC_SITEMAP}`);
  return xmlContent;
}

// Self-executing if run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemapXml();
}
