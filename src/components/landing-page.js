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
import { TOOLS_CATALOG, LETSEDIT_TOOL_CATEGORIES, allToolsModal } from './all-tools-modal.js';
import { Toast } from './toast.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { applyTheme, getPreferredTheme, toggleTheme } from '../utils/theme.js';
import { WORKFLOW_TOOLS_CONFIG } from './workflow/tools-config.js';
import { authModal } from './auth-modal.js';
import { router } from '../core/router.js';
import { getLandingTemplateHtml } from './landing/landing-html.js';
import { LandingCardsRenderer } from './landing/landing-cards.js';
import { getTwoToneIconSvg } from './landing/landing-icons.js';
import { pwaManager } from '../core/pwa-manager.js';
import { legalModal } from './legal-modal.js';

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
    // Hero Upload PDF Card actions
    const heroUploadBtn = this.container.querySelector('#btn-landing-upload-pdf');
    const heroFileInput = this.container.querySelector('#landing-hero-file-input');
    const heroBlankBtn = this.container.querySelector('#btn-landing-blank-doc');
    const heroSampleBtn = this.container.querySelector('#btn-landing-load-sample');
    const heroSampleMultiBtn = this.container.querySelector('#btn-landing-load-sample-multipage');
    const heroDropzone = this.container.querySelector('#landing-hero-dropzone');

    const handleUploadAndOpen = async (file) => {
      if (!file) return;
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        Toast.warning('Please select a valid PDF document');
        return;
      }
      try {
        Toast.info('Loading PDF into Studio...');
        const ab = await readFileAsArrayBuffer(file);
        const info = await pdfEngine.loadPdf(ab);
        store.setDocument(ab, file.name, info.numPages);
        const filenameEl = document.getElementById('current-filename');
        if (filenameEl) filenameEl.textContent = file.name;
        router.navigate('/edit_pdf');
        Toast.success(`Opened ${file.name} in PDF Editor!`);
      } catch (err) {
        console.error('Failed to load PDF on landing page:', err);
        Toast.error('Could not load PDF file');
      }
    };

    if (heroUploadBtn && heroFileInput) {
      heroUploadBtn.onclick = () => heroFileInput.click();
      heroFileInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handleUploadAndOpen(file);
        heroFileInput.value = '';
      };
    }

    if (heroBlankBtn) {
      heroBlankBtn.onclick = async () => {
        try {
          Toast.info('Creating clean blank page...');
          const blankBytes = await pdfEngine.createBlankPdf();
          const info = await pdfEngine.loadPdf(blankBytes);
          store.setDocument(blankBytes, 'Blank_Document.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Blank_Document.pdf';
          router.navigate('/edit_pdf');
          Toast.success('Blank document ready! Add text, shapes, or signatures.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to create blank page');
        }
      };
    }

    if (heroSampleBtn) {
      heroSampleBtn.onclick = async () => {
        try {
          Toast.info('Loading sample agreement...');
          const sampleBytes = await pdfEngine.createSamplePdf();
          const info = await pdfEngine.loadPdf(sampleBytes);
          store.setDocument(sampleBytes, 'Sample_Agreement.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Sample_Agreement.pdf';
          router.navigate('/edit_pdf');
          Toast.success('Sample document loaded! Ready to edit.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to load sample document');
        }
      };
    }

    if (heroSampleMultiBtn) {
      heroSampleMultiBtn.onclick = async () => {
        try {
          Toast.info('Loading 4-page sample report...');
          const sampleBytes = await pdfEngine.createSampleWatermarkPdf();
          const info = await pdfEngine.loadPdf(sampleBytes);
          store.setDocument(sampleBytes, 'Sample_4Page_Report.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Sample_4Page_Report.pdf';
          router.navigate('/edit_pdf');
          Toast.success('4-page report loaded! Ready for multi-page editing.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to load multi-page sample');
        }
      };
    }

    const heroOpenEditorBtn = this.container.querySelector('#btn-landing-open-editor');
    if (heroOpenEditorBtn) {
      heroOpenEditorBtn.onclick = () => router.navigate('/edit_pdf');
    }


    // Hero Drag & Drop PDF support
    const heroSection = this.container.querySelector('.landing-hero-section');
    if (heroSection) {
      ['dragenter', 'dragover'].forEach(evt => {
        heroSection.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          heroSection.classList.add('hero-drag-over');
        });
      });
      ['dragleave', 'drop'].forEach(evt => {
        heroSection.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          heroSection.classList.remove('hero-drag-over');
        });
      });
      heroSection.addEventListener('drop', (e) => {
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) handleUploadAndOpen(file);
      });
    }

    // Most Popular PDF Tools 3x2 Grid Cards
    this.container.querySelectorAll('.hero-popular-card').forEach(card => {
      const handleAction = () => {
        const tool = card.getAttribute('data-tool');
        if (tool === 'studio:edit') {
          router.navigate('/edit_pdf');
        } else if (tool) {
          this.handleToolAction(tool);
        }
      };
      card.onclick = (e) => {
        e.preventDefault();
        handleAction();
      };
      card.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction();
        }
      };
    });

    // Dynamic Header Shadow: Only show shadow when scrolled past top
    const header = this.container.querySelector('.landing-header');
    const updateNavScroll = () => {
      const scrollY = this.container.scrollTop || window.scrollY || 0;
      if (header) {
        if (scrollY > 8) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };
    this.container.addEventListener('scroll', updateNavScroll, { passive: true });
    window.addEventListener('scroll', updateNavScroll, { passive: true });
    updateNavScroll();

    const heroPreview = this.container.querySelector('#landing-hero-preview');
    if (heroPreview) {
      heroPreview.onclick = (e) => {
        const floatBadge = e.target.closest('.hero-float-badge');
        if (floatBadge && floatBadge.getAttribute('data-tool')) {
          e.stopPropagation();
          this.handleToolAction(floatBadge.getAttribute('data-tool'));
        }
      };
    }

    // Hero quick interactive capability chips (PowerPoint, Excel, Word, OCR, Compare, Redact)
    this.container.querySelectorAll('.hero-quick-chip').forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        const tool = chip.getAttribute('data-tool');
        if (tool) this.handleToolAction(tool);
      };
    });

    const scrollToTools = () => {
      const toolsSec = this.container.querySelector('.landing-tools-section');
      if (toolsSec) {
        toolsSec.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.navigate('/edit_pdf');
      }
    };

    const heroExploreBtn = this.container.querySelector('#btn-landing-explore-tools');
    if (heroExploreBtn) {
      heroExploreBtn.onclick = scrollToTools;
    }

    const heroScrollCue = this.container.querySelector('#btn-landing-scroll-cue');
    if (heroScrollCue) {
      heroScrollCue.onclick = scrollToTools;
    }

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

    // Header Quick Tool Search Modal (Spotlight style)
    this.setupHeaderQuickSearch();

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
          authModal.open('login');
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
          pwaManager.installPwa();
        } else if (action) {
          this.handleToolAction(action);
        }
      };
    });

    // Legal & Policies Dialog Triggers
    this.container.querySelectorAll('[data-legal]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-legal') || 'privacy';
        legalModal.open(tab);
      };
    });

    // Windows & Web App Showcase Buttons
    const installDesktopBtn = this.container.querySelector('#btn-install-desktop-app');
    if (installDesktopBtn) {
      installDesktopBtn.onclick = (e) => {
        e.preventDefault();
        pwaManager.installPwa();
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

  setupHeaderQuickSearch() {
    const searchBtn = this.container.querySelector('#btn-landing-search');
    const searchModal = this.container.querySelector('#landing-search-modal');
    const searchInput = this.container.querySelector('#landing-header-search-input');
    const closeBtn = this.container.querySelector('#btn-close-search-modal');
    const backdrop = this.container.querySelector('#landing-search-backdrop');
    const resultsContainer = this.container.querySelector('#landing-search-results');

    if (!searchBtn || !searchModal || !searchInput) return;

    // Collect all tools across categories
    const allTools = [];
    const seen = new Set();
    LETSEDIT_TOOL_CATEGORIES.forEach(cat => {
      cat.tools?.forEach(tool => {
        if (!seen.has(tool.id)) {
          seen.add(tool.id);
          allTools.push({ ...tool, categoryName: cat.name });
        }
      });
    });

    const openSearch = () => {
      searchModal.style.display = 'flex';
      searchModal.setAttribute('aria-hidden', 'false');
      renderResults(searchInput.value || '');
      setTimeout(() => {
        searchInput.focus();
        searchInput.select();
      }, 50);
    };

    const closeSearch = () => {
      searchModal.style.display = 'none';
      searchModal.setAttribute('aria-hidden', 'true');
    };

    const renderResults = (query) => {
      const q = (query || '').trim().toLowerCase();
      const filtered = q
        ? allTools.filter(t => t.title.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q)) || t.id.toLowerCase().includes(q))
        : allTools.slice(0, 8);

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `
          <div class="landing-search-empty">
            <p>No tools found matching "<strong>${query}</strong>"</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = filtered.map(tool => `
        <button class="landing-search-item" data-action="${tool.action || ''}" data-tool="${tool.id}">
          <span class="landing-search-item-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </span>
          <div class="landing-search-item-info">
            <div class="landing-search-item-title">
              <span>${tool.title}</span>
              ${tool.popular ? '<span class="landing-search-item-tag">POPULAR</span>' : ''}
            </div>
            <div class="landing-search-item-desc">${tool.desc || 'Launch tool'}</div>
          </div>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:var(--text-muted);"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      `).join('');

      resultsContainer.querySelectorAll('.landing-search-item').forEach(item => {
        item.onclick = () => {
          closeSearch();
          const action = item.getAttribute('data-action');
          const toolId = item.getAttribute('data-tool');
          if (action) {
            this.handleToolAction(action, toolId);
          } else if (toolId) {
            router.navigate(router.getCanonicalPath(toolId));
          }
        };
      });
    };

    searchBtn.onclick = (e) => {
      e.stopPropagation();
      openSearch();
    };

    if (closeBtn) closeBtn.onclick = closeSearch;
    if (backdrop) backdrop.onclick = closeSearch;

    searchInput.oninput = (e) => {
      renderResults(e.target.value);
    };

    searchInput.onkeydown = (e) => {
      if (e.key === 'Escape') {
        closeSearch();
      } else if (e.key === 'Enter') {
        const firstItem = resultsContainer.querySelector('.landing-search-item');
        if (firstItem) {
          firstItem.click();
        }
      }
    };

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (document.body.classList.contains('show-landing')) {
          e.preventDefault();
          if (searchModal.style.display === 'flex') {
            closeSearch();
          } else {
            openSearch();
          }
        }
      } else if (e.key === 'Escape' && searchModal.style.display === 'flex') {
        closeSearch();
      }
    });
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
