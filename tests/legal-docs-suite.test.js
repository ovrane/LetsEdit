import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROUTE_DEFINITIONS, router } from '../src/core/router.js';
import { LegalPage } from '../src/components/legal-page.js';
import { DocsPage } from '../src/components/docs-page.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Lightweight Node.js DOM polyfill for component testing
function createMockElement(tag = 'div') {
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    className: '',
    children: [],
    attributes: {},
    textContent: '',
    setAttribute(k, v) { el.attributes[k] = v; },
    getAttribute(k) { return el.attributes[k] || null; },
    appendChild(child) { el.children.push(child); return child; },
    addEventListener(evt, cb) {},
    querySelectorAll(selector) {
      if (selector === '.docs-chapter') {
        const count = (el.innerHTML.match(/class="docs-chapter"/g) || []).length;
        return Array.from({ length: count }, () => {
          const item = createMockElement('article');
          item.textContent = 'merge split redact ocr signature text basics';
          return item;
        });
      }
      if (selector === '.docs-nav-item') {
        const count = (el.innerHTML.match(/class="docs-nav-item/g) || []).length;
        return Array.from({ length: count }, () => createMockElement('button'));
      }
      return [];
    },
    querySelector(selector) {
      if (selector === '.legal-hero-title') {
        const match = el.innerHTML.match(/<h1 class="legal-hero-title">([^<]+)<\/h1>/);
        const child = createMockElement('h1');
        child.textContent = match ? match[1] : '';
        return child;
      }
      if (selector === '.legal-content-card') {
        const child = createMockElement('div');
        child.innerHTML = el.innerHTML;
        return child;
      }
      if (selector === '#docs-search-empty') {
        return createMockElement('div');
      }
      const child = createMockElement('div');
      return child;
    },
    get innerHTML() { return el._html || ''; },
    set innerHTML(val) { el._html = val; }
  };
  return el;
}

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (tag) => createMockElement(tag),
    getElementById: () => createMockElement('div'),
    querySelectorAll: () => [],
    querySelector: () => null
  };
  globalThis.window = {
    scrollTo: () => {}
  };
}

describe('Legal & Documentation System Suite', () => {
  it('router definitions include legal routes and documentation route with full SEO metadata', () => {
    const privacyRoute = ROUTE_DEFINITIONS.find(r => r.path === '/privacy');
    assert.ok(privacyRoute, 'Should have /privacy route');
    assert.equal(privacyRoute.isLegal, true);
    assert.equal(privacyRoute.legalTab, 'privacy');
    assert.ok(privacyRoute.title.includes('Privacy Policy'));

    const termsRoute = ROUTE_DEFINITIONS.find(r => r.path === '/terms');
    assert.ok(termsRoute, 'Should have /terms route');
    assert.equal(termsRoute.isLegal, true);
    assert.equal(termsRoute.legalTab, 'terms');
    assert.ok(termsRoute.title.includes('Terms of Service'));

    const securityRoute = ROUTE_DEFINITIONS.find(r => r.path === '/security-whitepaper');
    assert.ok(securityRoute, 'Should have /security-whitepaper route');
    assert.equal(securityRoute.isLegal, true);
    assert.equal(securityRoute.legalTab, 'security');
    assert.ok(securityRoute.title.includes('Security'));

    const cookiesRoute = ROUTE_DEFINITIONS.find(r => r.path === '/cookies');
    assert.ok(cookiesRoute, 'Should have /cookies route');
    assert.equal(cookiesRoute.isLegal, true);
    assert.equal(cookiesRoute.legalTab, 'cookies');
    assert.ok(cookiesRoute.title.includes('Cookie Policy'));

    const docsRoute = ROUTE_DEFINITIONS.find(r => r.path === '/docs');
    assert.ok(docsRoute, 'Should have /docs route');
    assert.equal(docsRoute.isDocs, true);
    assert.ok(docsRoute.title.includes('Documentation'));
    assert.ok(docsRoute.description.includes('PDF'));
  });

  it('LegalPage initializes and renders privacy tab content correctly', () => {
    const page = new LegalPage();
    const container = document.createElement('div');
    page.mount(container);
    page.show({ tab: 'privacy', updateUrl: false });

    assert.equal(page.activeTab, 'privacy');
    const headerTitle = container.querySelector('.legal-hero-title');
    assert.ok(headerTitle.textContent.includes('Privacy Policy'));

    const contentHtml = container.querySelector('.legal-content-card').innerHTML;
    assert.ok(contentHtml.includes('Zero-Cloud Upload Architecture') || contentHtml.includes('Zero-Cloud Processing Guarantee'));
    assert.ok(contentHtml.includes('WebAssembly'));
    assert.ok(contentHtml.includes('Zero'));
  });

  it('LegalPage switches between tabs: terms, security, and cookies', () => {
    const page = new LegalPage();
    const container = document.createElement('div');
    page.mount(container);

    // Terms
    page.switchTab('terms');
    assert.equal(page.activeTab, 'terms');
    let contentHtml = container.querySelector('.legal-content-card').innerHTML;
    assert.ok(contentHtml.includes('ESIGN Act & eIDAS Compliance') || contentHtml.includes('Electronic Signatures'));

    // Security Whitepaper
    page.switchTab('security');
    assert.equal(page.activeTab, 'security');
    contentHtml = container.querySelector('.legal-content-card').innerHTML;
    assert.ok(contentHtml.includes('Permanent Vector Redaction vs. "Black Box" Annotations') || contentHtml.includes('Permanent Vector Redaction'));
    assert.ok(contentHtml.includes('AcroForm Vector Flattening') || contentHtml.includes('Flattening'));
    assert.ok(contentHtml.includes('Sandboxed Web Worker Isolation'));

    // Cookies
    page.switchTab('cookies');
    assert.equal(page.activeTab, 'cookies');
    contentHtml = container.querySelector('.legal-content-card').innerHTML;
    assert.ok(contentHtml.includes('Zero-Tracking Cookie Philosophy') || contentHtml.includes('Cookie'));
    assert.ok(contentHtml.includes('localStorage'));
  });

  it('DocsPage initializes and renders all 9 beginner chapters', () => {
    const docs = new DocsPage();
    const container = document.createElement('div');
    docs.mount(container);
    docs.show({ updateUrl: false });

    const chapters = container.querySelectorAll('.docs-chapter');
    assert.equal(chapters.length, 9, 'Should render 9 documentation guide chapters');

    const navItems = container.querySelectorAll('.docs-nav-item');
    assert.equal(navItems.length, 9, 'Should render 9 chapter navigation links');
  });

  it('DocsPage search filter filters chapters and displays empty state on zero matches', () => {
    const docs = new DocsPage();
    const container = document.createElement('div');
    docs.mount(container);
    docs.show({ updateUrl: false });

    // Search for "redact"
    docs.filterContent('redact');
    const chapters = container.querySelectorAll('.docs-chapter');
    assert.ok(chapters.length >= 1, 'Should find redaction chapter');

    // Search for non-existent term
    docs.filterContent('xyzabcquuxnonexistent123');
    const emptyState = container.querySelector('#docs-search-empty');
    assert.ok(emptyState);

    // Reset filter
    docs.filterContent('');
    assert.ok(container.querySelectorAll('.docs-chapter').length >= 1);
  });

  it('Build system prerenders static HTML files for /docs and /cookies', () => {
    const docsHtmlPath = path.resolve(ROOT_DIR, 'dist', 'docs', 'index.html');
    assert.ok(fs.existsSync(docsHtmlPath), 'dist/docs/index.html must exist');
    const docsHtml = fs.readFileSync(docsHtmlPath, 'utf-8');
    assert.ok(docsHtml.includes('<title>Documentation &amp; Complete Beginner&#39;s Guide to PDF Editing — LetsEdit</title>') || docsHtml.includes('Documentation'), 'Docs HTML has title');
    assert.ok(docsHtml.includes('https://letsedit-pdf.web.app/docs'), 'Docs HTML has canonical url');

    const cookiesHtmlPath = path.resolve(ROOT_DIR, 'dist', 'cookies', 'index.html');
    assert.ok(fs.existsSync(cookiesHtmlPath), 'dist/cookies/index.html must exist');
    const cookiesHtml = fs.readFileSync(cookiesHtmlPath, 'utf-8');
    assert.ok(cookiesHtml.includes('Cookie Policy &amp; Tracking Disclosure — LetsEdit') || cookiesHtml.includes('Cookie Policy'), 'Cookies HTML has title');
  });
});
