/**
 * Dedicated User Documentation & Walkthrough Hub Page
 * Focused entirely on beginner-to-advanced user guides, tutorials, visual walkthroughs,
 * keyboard shortcuts, and instant tool actions with top-tier ease-of-use UI/UX.
 * Strictly adheres to modular < 1,000 lines architecture standard.
 */

import { router } from '../core/router.js';
import { toggleTheme } from '../utils/theme.js';
import {
  getUserDocsNavHtml,
  getUserDocsQuickGridHtml,
  getUserDocsContentHtml
} from './docs/docs-user-content.js';

export class DocsPage {
  constructor() {
    this.container = null;
    this.searchQuery = '';
    this.activeCategory = 'all';
    this.isMounted = false;
    this._scrollListener = null;
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

    if (typeof document !== 'undefined' && document?.body?.classList) {
      document.body.classList.add('show-docs');
    }

    this.container.style.display = 'flex';
    this.container.scrollTop = 0;
    this.render();
    this.bindEvents();

    if (updateUrl && typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState({}, '', '/docs');
    }

    // Scroll to target hash anchor if present
    try {
      if (typeof window !== 'undefined' && window.location?.hash) {
        const hash = window.location.hash;
        const targetEl = document.querySelector(hash);
        if (targetEl && typeof targetEl.scrollIntoView === 'function') {
          setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth' }), 60);
        } else if (this.container) {
          this.container.scrollTop = 0;
        }
      } else if (this.container) {
        this.container.scrollTop = 0;
      }
    } catch {
      // Graceful fallback for non-browser testing
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (typeof document !== 'undefined' && document?.body?.classList) {
      document.body.classList.remove('show-docs');
    }
    if (this._scrollListener && this.container) {
      this.container.removeEventListener('scroll', this._scrollListener);
      this._scrollListener = null;
    }
  }

  render() {
    this.container.className = 'docs-page-container';
    this.container.innerHTML = `
      <!-- Fixed Global Docs Header -->
      <header class="docs-header">
        <div class="docs-header-inner">
          <div class="docs-header-left">
            <div class="lets-logo" id="docs-logo" style="cursor: pointer;" title="Back to Home">
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
            <nav class="docs-nav-breadcrumbs" aria-label="Breadcrumb navigation">
              <a href="/" data-route="/" class="legal-nav-link" id="docs-nav-home">Home</a>
              <span class="docs-breadcrumb-sep">/</span>
              <span class="docs-breadcrumb-current">User Guide</span>
            </nav>
            <a href="/#landing-tools-section" data-route="/#landing-tools-section" class="legal-nav-link docs-desktop-link" id="docs-nav-tools">All 40+ Tools</a>
            <a href="/privacy" data-route="/privacy" class="legal-nav-link docs-desktop-link" id="docs-nav-policy">Privacy &amp; Terms</a>
          </div>

          <div class="docs-header-right">
            <!-- Search Field with Clear Trigger -->
            <div class="docs-search-input-wrap">
              <svg class="docs-search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="docs-search-input" class="docs-search-input" placeholder="Search guides, tips &amp; tools..." aria-label="Search user documentation" value="${this.searchQuery}" />
              <button class="docs-search-clear" id="btn-docs-search-clear" title="Clear search" style="display: ${this.searchQuery ? 'flex' : 'none'};" aria-label="Clear search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>


            <!-- Studio CTA -->
            <a href="/edit_pdf" data-route="/edit_pdf" class="btn btn-primary btn-sm docs-header-cta" id="btn-docs-studio">
              <span>Launch Studio</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section Designed for Ease of Learning -->
      <section class="docs-hero-section">
        <div class="docs-hero-inner">
          <div class="docs-badge-pill">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <span>LEARN PDF EDITING • USER GUIDE &amp; TUTORIALS</span>
          </div>

          <h1 class="docs-hero-title">
            How to Edit, Sign &amp; Master <span class="docs-theme-accent">Any PDF Document</span>
          </h1>
          <p class="docs-hero-desc">
            Visual walkthroughs, step-by-step guides, and practical shortcuts to help you edit text, merge files, permanently redact sensitive data, and collect digital signatures with ease — 100% private in your browser.
          </p>

          <!-- Interactive Category Filter Chips -->
          <div class="docs-category-chips" id="docs-category-chips">
            <button class="docs-chip-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
              <span>All Topics</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'editing' ? 'active' : ''}" data-cat="editing">
              <span>✏️ Text &amp; Images</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'organize' ? 'active' : ''}" data-cat="organize">
              <span>📂 Merge &amp; Split</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'convert' ? 'active' : ''}" data-cat="convert">
              <span>🔄 Convert &amp; OCR</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'security' ? 'active' : ''}" data-cat="security">
              <span>🛡️ Redaction</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'signatures' ? 'active' : ''}" data-cat="signatures">
              <span>✍️ E-Sign</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'forms' ? 'active' : ''}" data-cat="forms">
              <span>📋 AcroForms</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'legal' ? 'active' : ''}" data-cat="legal">
              <span>⚖️ Bates Legal</span>
            </button>
            <button class="docs-chip-btn ${this.activeCategory === 'shortcuts' ? 'active' : ''}" data-cat="shortcuts">
              <span>⌨️ Shortcuts</span>
            </button>
          </div>

          <!-- Quick Jump Cards -->
          <div class="docs-quick-grid" id="docs-quick-grid">
            ${getUserDocsQuickGridHtml()}
          </div>
        </div>
      </section>

      <!-- Main 2-Column Documentation Reading View -->
      <main class="docs-main-body">
        <aside class="docs-sidebar">
          <div class="docs-nav-card" id="docs-sidebar-nav">
            ${getUserDocsNavHtml()}
          </div>
        </aside>

        <section class="docs-content" id="docs-content-container">
          ${getUserDocsContentHtml()}

          <!-- Empty State for Search -->
          <div id="docs-search-empty" class="docs-search-empty-card" style="display: none;">
            <div class="docs-search-empty-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <h3 class="docs-search-empty-title">No matching guides found</h3>
            <p class="docs-search-empty-desc">We couldn't find any documentation matching "<span id="docs-empty-query"></span>". Try searching for "edit", "merge", "redact", "sign", or "shortcuts".</p>
            <button class="btn btn-secondary btn-sm" id="btn-docs-reset-search" style="margin-top: 12px;">Reset Search &amp; View All</button>
          </div>
        </section>
      </main>
    `;
  }

  filterContent(query = '', category = null) {
    this.searchQuery = query;
    if (category !== null) {
      this.activeCategory = category;
    }
    if (!this.container) return;

    const q = query.toLowerCase().trim();
    const chapters = this.container.querySelectorAll('.docs-chapter');
    let visibleCount = 0;

    chapters.forEach(ch => {
      const chCat = ch.getAttribute('data-category') || '';
      const text = (ch.innerText || ch.textContent || '').toLowerCase();
      const matchesSearch = !q || text.includes(q);
      const matchesCategory = this.activeCategory === 'all' || chCat === this.activeCategory;

      if (matchesSearch && matchesCategory) {
        ch.style.display = 'block';
        visibleCount++;
      } else {
        ch.style.display = 'none';
      }
    });

    // Update empty state
    const empty = this.container.querySelector('#docs-search-empty');
    const emptyQuerySpan = this.container.querySelector('#docs-empty-query');
    if (empty) {
      empty.style.display = visibleCount === 0 ? 'block' : 'none';
      if (emptyQuerySpan) emptyQuerySpan.textContent = query || this.activeCategory;
    }

    // Toggle clear search button
    const clearBtn = this.container.querySelector('#btn-docs-search-clear');
    if (clearBtn) {
      clearBtn.style.display = q ? 'flex' : 'none';
    }
  }

  setupScrollSpy() {
    if (typeof window === 'undefined') return;

    const navItems = this.container.querySelectorAll('.docs-nav-item');
    const chapters = this.container.querySelectorAll('.docs-chapter');
    if (!chapters.length || !navItems.length) return;

    const onScroll = () => {
      const scrollPos = this.container ? this.container.scrollTop : (window.scrollY || 0);
      let currentId = '';

      chapters.forEach(ch => {
        const top = ch.offsetTop - 140;
        const height = ch.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = ch.id;
        }
      });

      if (currentId) {
        navItems.forEach(item => {
          if (item.getAttribute('data-chapter') === currentId) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    };

    if (this.container) {
      this.container.addEventListener('scroll', onScroll, { passive: true });
      this._scrollListener = onScroll;
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


    const studioBtn = this.container.querySelector('#btn-docs-studio');
    if (studioBtn) studioBtn.onclick = (e) => { e.preventDefault(); router.navigate('/edit_pdf'); };

    // Interactive category chips in hero
    const chips = this.container.querySelectorAll('.docs-chip-btn');
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-cat');
        this.filterContent(this.searchQuery, cat);

        // If specific category, scroll smoothly to the first visible chapter
        if (cat !== 'all') {
          const firstTarget = this.container.querySelector(`.docs-chapter[data-category="${cat}"]`);
          if (firstTarget && typeof firstTarget.scrollIntoView === 'function') {
            firstTarget.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };
    });

    // Quick card clicks in hero
    const quickCards = this.container.querySelectorAll('.docs-quick-card');
    quickCards.forEach(card => {
      card.onclick = () => {
        const targetId = card.getAttribute('data-target');
        const el = document.getElementById(targetId);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      };
    });

    // Sidebar navigation chapter jump
    const navItems = this.container.querySelectorAll('.docs-nav-item');
    navItems.forEach(item => {
      item.onclick = () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const chapterId = item.getAttribute('data-chapter');
        const el = document.getElementById(chapterId);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      };
    });

    // Search input typing
    const searchInput = this.container.querySelector('#docs-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.filterContent(e.target.value);
      };
    }

    // Clear search button
    const clearBtn = this.container.querySelector('#btn-docs-search-clear');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (searchInput) searchInput.value = '';
        this.filterContent('');
      };
    }

    // Reset search from empty state
    const resetBtn = this.container.querySelector('#btn-docs-reset-search');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (searchInput) searchInput.value = '';
        this.activeCategory = 'all';
        chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-cat') === 'all'));
        this.filterContent('');
      };
    }

    // Intercept internal docs action links so they use SPA router navigation
    const actionLinks = this.container.querySelectorAll('a[data-route], .docs-action-link, .docs-inline-link');
    actionLinks.forEach(link => {
      link.onclick = (e) => {
        const route = link.getAttribute('data-route') || link.getAttribute('href');
        if (route && route.startsWith('/')) {
          e.preventDefault();
          router.navigate(route);
        }
      };
    });

    // Initialize ScrollSpy
    this.setupScrollSpy();
  }
}

export const docsPage = new DocsPage();
