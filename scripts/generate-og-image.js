/**
 * Generates the official 1200x630 OpenGraph / Twitter Card preview banner
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SVG_PATH = path.resolve(ROOT_DIR, 'public', 'og-image.svg');
const PNG_PATH = path.resolve(ROOT_DIR, 'public', 'og-image.png');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#19040a"/>
      <stop offset="50%" stop-color="#240712"/>
      <stop offset="100%" stop-color="#0a101e"/>
    </linearGradient>
    <radialGradient id="glow" cx="600" cy="220" r="450" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ee404c" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ee404c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fca5a5"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2f74ee" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#00b4d8" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Deep Rich Gradient Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Subtle grid lines -->
  <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- Center Content Container -->
  <g transform="translate(600, 160)" text-anchor="middle">
    <!-- Brand Logo Icon (4 Quadrants) -->
    <g transform="translate(-48, -70)">
      <rect x="0" y="0" width="42" height="42" rx="12" fill="#EE404C"/>
      <rect x="54" y="0" width="42" height="42" rx="12" fill="#00B4D8"/>
      <rect x="0" y="54" width="42" height="42" rx="12" fill="#2F74EE"/>
      <rect x="54" y="54" width="42" height="42" rx="12" fill="#F0A500"/>
    </g>

    <!-- Main Title "LetsEdit" -->
    <text y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="68" font-weight="800" fill="#ffffff" letter-spacing="-2">
      Lets<tspan fill="#EE404C">Edit</tspan>
    </text>

    <!-- Tagline -->
    <text y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="600" fill="#cbd5e1" letter-spacing="-0.5">
      Modern, Private Online PDF Editor &amp; Tools Suite
    </text>

    <!-- Feature Pillars -->
    <text y="200" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="500" fill="#94a3b8">
      Edit Existing Text  •  Merge &amp; Split  •  Compress  •  Sign &amp; Request  •  Vector Redact
    </text>

    <!-- Trust Badge Pill -->
    <g transform="translate(-230, 245)">
      <rect width="460" height="50" rx="25" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1.5"/>
      <circle cx="32" cy="25" r="7" fill="#10B981"/>
      <text x="52" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#6ee7b7" text-anchor="start">
        100% In-Browser Privacy • Zero Cloud Uploads
      </text>
    </g>

    <!-- Domain Footer -->
    <text y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#64748b" letter-spacing="1">
      LETSEDIT.WEB.APP
    </text>
  </g>
</svg>`;

fs.writeFileSync(SVG_PATH, svgContent, 'utf-8');
console.log(`[OG-Image] Saved SVG to ${SVG_PATH}`);

try {
  execSync(`magick -density 150 "${SVG_PATH}" -resize 1200x630 "${PNG_PATH}"`);
  console.log(`[OG-Image] Successfully rendered 1200x630 PNG to ${PNG_PATH}`);
} catch (err) {
  console.warn(`[OG-Image] Magick direct convert warning, trying convert:`, err.message);
  try {
    execSync(`convert "${SVG_PATH}" "${PNG_PATH}"`);
    console.log(`[OG-Image] Successfully rendered PNG with convert`);
  } catch (e2) {
    console.error(`[OG-Image] Error rendering PNG:`, e2.message);
  }
}
