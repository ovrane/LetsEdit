/**
 * Landing Home Page Component
 * High-converting, SEO-optimized landing page styled after iLovePDF and Sejda PDF.
 * Decomposed into modular sub-modules in ./landing/:
 * - landing-icons.js: Two-tone SVG icon dictionary
 * - landing-html.js: Semantic HTML templates
 * - landing-cards.js: Category filter rail and card grid renderer
 */

import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { TOOLS_CATALOG, allToolsModal } from './all-tools-modal.js';
import { Toast } from './toast.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { applyTheme, getPreferredTheme, toggleTheme } from '../utils/theme.js';
import { WORKFLOW_TOOLS_CONFIG } from './workflow/tools-config.js';
import { authModal } from './auth-modal.js';
import { router } from '../core/router.js';
import { getLandingTemplateHtml } from './landing/landing-html.js';
import { LandingCardsRenderer } from './landing/landing-cards.js';
import { getTwoToneIconSvg } from './landing/landing-icons.js';

export class LandingPage {
  constructor() {
    this.container = null;
    this.activeFilter = 'all';
    this.onOpenStudioCallback = null;
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  setOpenStudioCallback(cb) {
    this.onOpenStudioCallback = cb;
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'landing-view';
    this.container.className = 'landing-view-container';
    this.searchQuery = '';
    this.container.innerHTML = getLandingTemplateHtml();

    document.body.prepend(this.container);
    this.bindEvents();
    this.renderCards();
  }

  getTwoToneIconSvg(id, color) {
    return getTwoToneIconSvg(id, color);
  }

  renderSingleCardHtml(tool) {
    return LandingCardsRenderer.renderSingleCardHtml(tool);
  }

  renderCards() {
    LandingCardsRenderer.renderCards(this);
  }

  attachLandingCardEvents(container) {
    LandingCardsRenderer.attachLandingCardEvents(container, this);
  }

  async handleToolAction(action, toolId = null) {
    let matchedId = toolId;
    if (!matchedId && action) {
      const match = TOOLS_CATALOG.find(t => t.action === action);
      if (match) matchedId = match.id;
    }

    // 1. Direct workflow action prefix
    if (action && action.startsWith('workflow:')) {
      const toolKey = action.replace('workflow:', '');
      router.navigate(router.getCanonicalPath(toolKey));
      return;
    }

    // 2. Dedicated workflow tools (Merge, Compress, Split, etc.)
    if (matchedId && WORKFLOW_TOOLS_CONFIG[matchedId]) {
      router.navigate(router.getCanonicalPath(matchedId));
      return;
    }

    // 3. Delete pages routes to interactive page organizer
    if (matchedId === 'delete' || action === 'sidebar:delete') {
      router.navigate('/organize_pdf');
      return;
    }

    // 4. Core editor navigation: route to /edit_pdf where dedicated uploader or canvas activates
    if (matchedId === 'edit' || action === 'tool:select' || action === 'tool:text' || action === 'workflow:edit') {
      router.navigate('/edit_pdf');
      return;
    }

    // 5. In-studio tools: if no document loaded, navigate to editor to upload first
    if (!store.getState().pdfBytes) {
      router.navigate('/edit_pdf');
      return;
    }

    // 6. Fallback to in-studio modal if opened from within editor context
    this.switchToStudio();
    setTimeout(() => {
      allToolsModal.dispatchToolAction(action);
    }, 150);
  }

  bindEvents() {
    // Hero quick search & clear
    const heroSearchInput = this.container.querySelector('#hero-quick-search-input');
    const heroSearchClear = this.container.querySelector('#hero-search-clear-btn');
    const toolSearchInput = this.container.querySelector('#landing-tool-search');

    if (heroSearchInput) {
      heroSearchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        if (heroSearchClear) {
          heroSearchClear.style.display = this.searchQuery ? 'block' : 'none';
        }
        if (toolSearchInput) {
          toolSearchInput.value = this.searchQuery;
        }
        this.renderCards();
      };
    }

    if (heroSearchClear && heroSearchInput) {
      heroSearchClear.onclick = () => {
        heroSearchInput.value = '';
        this.searchQuery = '';
        heroSearchClear.style.display = 'none';
        if (toolSearchInput) toolSearchInput.value = '';
        this.renderCards();
        heroSearchInput.focus();
      };
    }

    // Hero popular tool pill shortcuts
    this.container.querySelectorAll('.hero-popular-pill').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const action = btn.getAttribute('data-action');
        if (action) this.handleToolAction(action);
      };
    });

    // Executive What's New showcase cards
    this.container.querySelectorAll('.whats-new-card').forEach(card => {
      card.onclick = (e) => {
        e.preventDefault();
        const action = card.getAttribute('data-action');
        if (action) this.handleToolAction(action);
      };
    });

    const enterStudioBtn = this.container.querySelector('#btn-landing-studio-cta');
    if (enterStudioBtn) {
      enterStudioBtn.onclick = () => {
        router.navigate('/edit_pdf');
      };
    }

    // Filter Chips
    const chips = this.container.querySelectorAll('.landing-filter-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.getAttribute('data-filter');
        this.renderCards();
      };
    });

    // Tool Search Input
    const searchInput = this.container.querySelector('#landing-tool-search');
    const searchClear = this.container.querySelector('#landing-search-clear');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        if (searchClear) {
          searchClear.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.renderCards();
      };
    }
    if (searchClear) {
      searchClear.onclick = () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          searchClear.style.display = 'none';
          this.renderCards();
          searchInput.focus();
        }
      };
    }

    // Theme Toggle on Landing Header
    const landingThemeBtn = this.container.querySelector('#btn-landing-theme');
    if (landingThemeBtn) {
      landingThemeBtn.onclick = () => {
        toggleTheme();
      };
    }

    applyTheme(getPreferredTheme());

    // User auth button & popover on landing header
    const landingAuthBtn = this.container.querySelector('#btn-landing-auth');
    if (landingAuthBtn) {
      landingAuthBtn.onclick = (e) => {
        e.stopPropagation();
        const user = store.getState().user;
        if (user) {
          authModal.toggleAccountMenu(landingAuthBtn);
        } else {
          router.navigate('/login');
        }
      };
    }

    const landingSignupBtn = this.container.querySelector('#btn-landing-signup');
    if (landingSignupBtn) {
      landingSignupBtn.onclick = (e) => {
        e.stopPropagation();
        router.navigate('/register');
      };
    }
    authModal.updateAllUserWidgets(store.getState().user);

    // Dropdown toggles (Convert, Edit, Security, Mega Menu)
    const dropdownTriggers = [
      { btnId: '#btn-convert-dropdown', menuClass: '.landing-dropdown' },
      { btnId: '#btn-edit-dropdown', menuClass: '.landing-dropdown' },
      { btnId: '#btn-security-dropdown', menuClass: '.landing-dropdown' },
      { btnId: '#btn-landing-mega-menu', menuClass: '.mega-dropdown' }
    ];

    const activeDropdowns = [];
    dropdownTriggers.forEach(({ btnId, menuClass }) => {
      const btn = this.container.querySelector(btnId);
      const dropdown = btn?.closest(menuClass);
      if (btn && dropdown) {
        activeDropdowns.push(dropdown);
        btn.onclick = (e) => {
          e.stopPropagation();
          // Close other open dropdowns
          activeDropdowns.forEach(d => {
            if (d !== dropdown) d.classList.remove('open');
          });
          dropdown.classList.toggle('open');
        };
      }
    });

    // Close any open navigation dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      activeDropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('open');
        }
      });
    });

    // Global keyboard shortcut ⌘K / Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        const heroInput = this.container.querySelector('#hero-quick-search-input');
        if (heroInput && document.body.classList.contains('show-landing')) {
          e.preventDefault();
          heroInput.focus();
          heroInput.select();
        }
      }
    });

    // Brand logo returns to landing
    const brandLogo = this.container.querySelector('#landing-brand-logo');
    if (brandLogo) {
      brandLogo.style.cursor = 'pointer';
      brandLogo.onclick = () => router.navigate('/');
    }

    // Navbar quick links
    this.container.querySelectorAll('.landing-nav-link[data-tool]').forEach(btn => {
      btn.onclick = () => {
        const tool = btn.getAttribute('data-tool');
        if (WORKFLOW_TOOLS_CONFIG[tool]) {
          router.navigate(router.getCanonicalPath(tool));
        } else if (tool === 'edit') {
          router.navigate('/edit_pdf');
        } else {
          this.handleToolAction(`modal:${tool}`, tool);
        }
      };
    });

    // Mega menu dropdown action items (Smallpdf style & standard dropdowns)
    this.container.querySelectorAll('.mega-item, .landing-dropdown-item, .smallpdf-tool-link').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        activeDropdowns.forEach(d => d.classList.remove('open'));
        const action = item.getAttribute('data-action');
        if (action) this.handleToolAction(action);
      };
    });

    // Footer multi-column links (both data-tool and data-action)
    this.container.querySelectorAll('.footer-links a[data-tool], .footer-col a[data-tool]').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const tool = link.getAttribute('data-tool');
        if (tool === 'edit') {
          router.navigate('/edit_pdf');
        } else if (WORKFLOW_TOOLS_CONFIG[tool]) {
          router.navigate(router.getCanonicalPath(tool));
        } else {
          const match = TOOLS_CATALOG.find(t => t.id === tool);
          if (match) this.handleToolAction(match.action, match.id);
          else router.navigate('/edit_pdf');
        }
      };
    });

    this.container.querySelectorAll('.footer-col a[data-action], .footer-badge-item[data-action]').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const action = link.getAttribute('data-action');
        if (action?.startsWith('app:')) {
          Toast.success('LetsEdit is an offline-capable Desktop PWA! Install via your browser address bar icon or pin to your taskbar.');
        } else if (action) {
          this.handleToolAction(action);
        }
      };
    });

    // Windows & Web App Showcase Buttons
    const installDesktopBtn = this.container.querySelector('#btn-install-desktop-app');
    if (installDesktopBtn) {
      installDesktopBtn.onclick = (e) => {
        e.preventDefault();
        Toast.success('LetsEdit Desktop App: Install via your browser address bar (Install App icon) or use 100% offline.');
      };
    }

    const openWebAppBtn = this.container.querySelector('#btn-open-web-app');
    if (openWebAppBtn) {
      openWebAppBtn.onclick = (e) => {
        e.preventDefault();
        router.navigate('/edit_pdf');
      };
    }
  }

  async loadSelectedFile(file) {
    try {
      Toast.info('Loading PDF into Studio...');
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const info = await pdfEngine.loadPdf(arrayBuffer);
      store.setDocument(arrayBuffer, file.name, info.numPages);
      const filenameEl = document.getElementById('current-filename');
      if (filenameEl) filenameEl.textContent = file.name;
      this.switchToStudio();
      Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
    } catch (err) {
      console.error(err);
      Toast.error('Failed to open PDF document');
    }
  }

  switchToStudio({ updateUrl = true } = {}) {
    document.body.classList.remove('show-landing', 'show-tool-workflow');
    document.body.classList.add('show-studio');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (updateUrl && typeof window !== 'undefined') {
      const canonical = '/edit_pdf';
      if (window.location.pathname !== canonical) {
        window.history.pushState({ path: canonical }, '', canonical);
      }
      if (typeof document !== 'undefined') {
        document.title = 'Online PDF Editor — Edit PDF files directly in your browser — LetsEdit';
      }
    }
    if (this.onOpenStudioCallback) {
      this.onOpenStudioCallback();
    }
  }

  switchToLanding({ updateUrl = true } = {}) {
    document.body.classList.remove('show-studio', 'show-tool-workflow');
    document.body.classList.add('show-landing');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (updateUrl && typeof window !== 'undefined') {
      const canonical = '/';
      if (window.location.pathname !== canonical) {
        window.history.pushState({ path: canonical }, '', canonical);
      }
      if (typeof document !== 'undefined') {
        document.title = 'LetsEdit — All-in-One Online PDF Editor & Tools';
      }
    }
  }
}

export const landingPage = new LandingPage();
