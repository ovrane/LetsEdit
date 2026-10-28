/**
 * Dedicated Documentation & Engineering Hub Page
 * Bridges user-facing walkthroughs for beginners with deep project architecture,
 * 4-layer canvas compositing, cryptographic audit trail, and REST API specifications.
 * Enforces strict < 1,000 lines modular standard.
 */

import { router } from '../core/router.js';
import { toggleTheme } from '../utils/theme.js';
import {
  getUserDocsNavHtml,
  getUserDocsQuickGridHtml,
  getUserDocsContentHtml
} from './docs/docs-user-content.js';
import {
  getProjectDocsNavHtml,
  getProjectDocsQuickGridHtml,
  getProjectDocsContentHtml
} from './docs/docs-project-content.js';

export class DocsPage {
  constructor() {
    this.container = null;
    this.searchQuery = '';
    this.currentTab = 'user'; // 'user' or 'project'
    this.isMounted = false;
  }

  mount(container) {
    this.container = container;
    this.isMounted = true;
  }

  show({ updateUrl = true } = {}) {
    if (!this.container) {
      let el = document.getElementById('docs-page-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'docs-page-container';
        document.body.appendChild(el);
      }
      this.mount(el);
    }

    // Inspect URL parameters and anchor hash safely
    let isProjectTab = false;
    try {
      if (typeof window !== 'undefined' && window.location) {
        const href = window.location.href || (window.location.origin ? window.location.origin + (window.location.pathname || '') : 'https://letsedit.local/docs');
        const url = new URL(href, 'https://letsedit.local');
        if (url.searchParams?.get('tab') === 'project' || (window.location.hash && window.location.hash.startsWith('#proj-'))) {
          isProjectTab = true;
        }
      }
    } catch {
      isProjectTab = false;
    }
    this.currentTab = isProjectTab ? 'project' : 'user';

    this.container.style.display = 'block';
    this.render();
    this.bindEvents();

    if (updateUrl && typeof window !== 'undefined' && window.history?.pushState) {
      const targetPath = this.currentTab === 'project' ? '/docs?tab=project' : '/docs';
      window.history.pushState({}, '', targetPath);
    }

    // Smooth scroll to target hash if present
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location?.hash;
        if (hash) {
          const targetEl = document.querySelector(hash);
          if (targetEl && typeof targetEl.scrollIntoView === 'function') {
            setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth' }), 50);
          } else if (typeof window.scrollTo === 'function') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else if (typeof window.scrollTo === 'function') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch {
      // Ignore scroll errors in mock environments
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  switchTab(tab) {
    if (this.currentTab === tab) return;
    this.currentTab = tab;
    this.render();
    this.bindEvents();
    const targetPath = this.currentTab === 'project' ? '/docs?tab=project' : '/docs';
    window.history.replaceState({}, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    const isProject = this.currentTab === 'project';

    this.container.className = 'docs-page-container';
    this.container.innerHTML = `
      <header class="docs-header">
        <div class="docs-header-inner">
          <div class="docs-header-left">
            <div class="lets-logo" id="docs-logo" style="cursor: pointer;">
              <div class="lets-logo-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
                  <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
                  <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
                  <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
                </svg>
              </div>
              <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
            </div>
            <a href="/" data-route="/" class="legal-nav-link" id="docs-nav-home">Home</a>
            <a href="/#landing-tools-section" data-route="/#landing-tools-section" class="legal-nav-link" id="docs-nav-tools">All Tools</a>
            <a href="/privacy" data-route="/privacy" class="legal-nav-link" id="docs-nav-policy">Privacy &amp; Terms</a>
          </div>

          <div class="docs-header-right">
            <div class="docs-search-input-wrap">
              <svg class="docs-search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="docs-search-input" class="docs-search-input" placeholder="Search documentation..." aria-label="Search docs" value="${this.searchQuery}" />
            </div>
            <button class="icon-btn" id="btn-docs-theme" title="Toggle Theme" aria-label="Toggle theme">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
            <a href="/edit_pdf" data-route="/edit_pdf" class="btn btn-primary btn-sm" id="btn-docs-studio" style="padding: 8px 16px; font-weight: 700;">
              <span>Launch Studio</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </div>
      </header>

      <section class="docs-hero-section">
        <div class="docs-hero-inner">
          <span class="docs-badge-pill">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            <span>${isProject ? 'ENGINEERING &amp; ARCHITECTURE' : 'LEARN PDF EDITING'}</span>
          </span>
          <h1 class="docs-hero-title">
            ${isProject ? 'Project Architecture &amp; <span class="docs-theme-accent">Technical Specs</span>' : 'Documentation &amp; <span class="docs-theme-accent">Beginner\'s Guide</span>'}
          </h1>
          <p class="docs-hero-desc">
            ${isProject
              ? 'Complete developer documentation covering client-side WebAssembly, 4-layer canvas compositing, text clustering math, REST APIs, and maintenance standards.'
              : 'Everything you need to know about working with PDFs, from editing existing text to legal Bates numbering, e-signatures, and permanent redaction.'
            }
          </p>

          <!-- Tab Switcher Segmented Control -->
          <div class="docs-tab-switcher">
            <button class="docs-tab-btn ${!isProject ? 'active' : ''}" data-tab="user">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>User Guide &amp; Tutorials</span>
            </button>
            <button class="docs-tab-btn ${isProject ? 'active' : ''}" data-tab="project">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span>Project &amp; Engineering Specs</span>
            </button>
          </div>

          <div class="docs-quick-grid" id="docs-quick-grid">
            ${isProject ? getProjectDocsQuickGridHtml() : getUserDocsQuickGridHtml()}
          </div>
        </div>
      </section>

      <main class="docs-main-body">
        <aside class="docs-sidebar">
          <div class="docs-nav-card" id="docs-sidebar-nav">
            ${isProject ? getProjectDocsNavHtml() : getUserDocsNavHtml()}
          </div>
        </aside>

        <section class="docs-content" id="docs-content-container">
          ${isProject ? getProjectDocsContentHtml() : getUserDocsContentHtml()}

          <!-- Empty State for Search -->
          <div id="docs-search-empty" style="display: none; text-align: center; padding: 48px 24px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: 12px; margin-top: 24px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" style="margin: 0 auto 12px;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px;">No documentation matches found</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Try searching for terms like "wasm", "clustering", "redaction", "canvas", or "api".</p>
          </div>
        </section>
      </main>
    `;
  }

  filterContent(query = '') {
    this.searchQuery = query;
    if (!this.container) return;
    const q = query.toLowerCase().trim();
    const chapters = this.container.querySelectorAll('.docs-chapter');
    let visibleCount = 0;
    chapters.forEach(ch => {
      const text = (ch.innerText || ch.textContent || '').toLowerCase();
      if (!q || text.includes(q)) {
        ch.style.display = 'block';
        visibleCount++;
      } else {
        ch.style.display = 'none';
      }
    });

    const empty = this.container.querySelector('#docs-search-empty');
    if (empty) {
      empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  bindEvents() {
    const logo = this.container.querySelector('#docs-logo');
    if (logo) logo.onclick = () => router.navigate('/');

    const homeLink = this.container.querySelector('#docs-nav-home');
    if (homeLink) homeLink.onclick = (e) => { e.preventDefault(); router.navigate('/'); };

    const toolsLink = this.container.querySelector('#docs-nav-tools');
    if (toolsLink) toolsLink.onclick = (e) => { e.preventDefault(); router.navigate('/#landing-tools-section'); };

    const policyLink = this.container.querySelector('#docs-nav-policy');
    if (policyLink) policyLink.onclick = (e) => { e.preventDefault(); router.navigate('/privacy'); };

    const themeBtn = this.container.querySelector('#btn-docs-theme');
    if (themeBtn) themeBtn.onclick = () => toggleTheme();

    const studioBtn = this.container.querySelector('#btn-docs-studio');
    if (studioBtn) studioBtn.onclick = (e) => { e.preventDefault(); router.navigate('/edit_pdf'); };

    // Mode tab buttons (User vs Project)
    const tabBtns = this.container.querySelectorAll('.docs-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      };
    });

    // Quick card clicks in hero
    const quickCards = this.container.querySelectorAll('.docs-quick-card');
    quickCards.forEach(card => {
      card.onclick = () => {
        const target = card.getAttribute('data-target');
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      };
    });

    // Sidebar navigation
    const navItems = this.container.querySelectorAll('.docs-nav-item');
    navItems.forEach(item => {
      item.onclick = () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const chapterId = item.getAttribute('data-chapter');
        const el = document.getElementById(chapterId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      };
    });

    // Search inside documentation
    const searchInput = this.container.querySelector('#docs-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.filterContent(e.target.value);
      };
    }
  }
}

export const docsPage = new DocsPage();
