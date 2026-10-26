/**
 * Account & Developer API Management Hub
 * Implements the full-page /account and /login views as specified in LETSEDIT_AUTH_SPECIFICATION.md
 * Decomposed into modular sub-modules in ./account/:
 * - full-auth.js: Full-page authentication, SSO, Turnstile, and OAuth
 * - account-tabs.js: Profile, telemetry, Pro plan, API tokens, and 2FA
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { router } from '../core/router.js';
import { toggleTheme, getPreferredTheme } from '../utils/theme.js';
import { firebaseAuth } from '../core/firebase-auth.js';
import { FullPageAuth } from './account/full-auth.js';
import { AccountTabsRenderer } from './account/account-tabs.js';

export class AccountPage {
  constructor() {
    this.container = null;
    this.activeTab = 'profile'; // 'profile' | 'api-keys' | 'plan' | 'security'
    this.codeTab = 'curl'; // 'curl' | 'js' | 'python'
    this.authMode = 'login'; // 'login' | 'register'
    this.ssoDomains = ['@acme.com', '@enterprise.org', '@company.com', '@corp.net', '@google.com', '@microsoft.com'];

    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'account-view';
    this.container.className = 'account-view-container';
    document.body.appendChild(this.container);

    store.subscribe((event) => {
      if (event === 'user-changed') {
        if (document.body.classList.contains('show-account')) {
          const user = store.getState().user;
          if (user) {
            this.render();
          } else {
            this.renderFullPageAuth();
          }
        }
      }
    });
  }

  show({ updateUrl = true, mode = 'account' } = {}) {
    document.body.classList.remove('show-landing', 'show-studio', 'show-tool-workflow');
    document.body.classList.add('show-account');
    window.scrollTo({ top: 0, behavior: 'instant' });

    const user = store.getState().user;
    if (mode === 'login' || mode === 'register' || !user) {
      this.authMode = mode === 'register' ? 'register' : 'login';
      this.renderFullPageAuth();
      if (updateUrl && typeof window !== 'undefined') {
        const canonical = this.authMode === 'register' ? '/register' : '/login';
        if (window.location.pathname !== canonical) {
          window.history.pushState({ path: canonical }, '', canonical);
        }
        document.title = this.authMode === 'register'
          ? 'Create Free Account — LetsEdit'
          : 'Sign in to LetsEdit — Fast & Secure PDF Tools';
      }
    } else {
      this.render();
      if (updateUrl && typeof window !== 'undefined') {
        const canonical = '/account';
        if (window.location.pathname !== canonical) {
          window.history.pushState({ path: canonical }, '', canonical);
        }
        document.title = 'Account Settings & Developer API Keys — LetsEdit';
      }
    }
  }

  showLogin({ updateUrl = true } = {}) {
    this.show({ updateUrl, mode: 'login' });
  }

  showRegister({ updateUrl = true } = {}) {
    this.show({ updateUrl, mode: 'register' });
  }

  render() {
    const user = store.getState().user || {
      name: 'Guest User',
      email: 'guest@example.com',
      plan: 'Free Pro',
      requires2fa: false,
      apiKeys: []
    };

    const initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase();
    const currentTheme = getPreferredTheme ? getPreferredTheme() : 'light';
    const isDark = currentTheme === 'dark';
    const apiKeys = user.apiKeys || [];

    this.container.innerHTML = `
      <!-- Account Header Navbar -->
      <header class="account-header">
        <div class="account-nav-inner">
          <div class="account-brand" id="btn-account-home" style="cursor: pointer;" title="Back to All Tools (/)">
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

          <div class="account-nav-actions">
            <button class="btn btn-sm btn-outline" id="btn-account-back-tools">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>All Tools</span>
            </button>
            <button class="btn btn-sm btn-outline" id="btn-account-open-studio">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>PDF Studio</span>
            </button>
            <button class="icon-btn" id="btn-account-theme-toggle" title="Toggle Theme">
              <svg class="theme-sun-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display: ${isDark ? 'none' : 'block'};"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              <svg class="theme-moon-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display: ${isDark ? 'block' : 'none'};"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
            <button class="btn btn-sm btn-outline text-danger" id="btn-account-logout">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path></svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Account Content Shell -->
      <main class="account-main">
        <div class="account-shell">
          <!-- Left Sidebar Menu -->
          <aside class="account-sidebar-nav">
            <div class="account-user-card">
              <div class="account-avatar-large">${initials}</div>
              <div class="account-user-info">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
                <span class="account-status-pill"><span class="status-indicator"></span> Pro Member</span>
              </div>
            </div>

            <nav class="account-nav-list">
              <button class="account-nav-link ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Profile & Identity</span>
              </button>
              <button class="account-nav-link ${this.activeTab === 'plan' ? 'active' : ''}" data-tab="plan">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                <span>Plan & Privacy Shield</span>
              </button>
              <button class="account-nav-link ${this.activeTab === 'api-keys' ? 'active' : ''}" data-tab="api-keys">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 2l-2 2m-1.5 1.5L10 13l-4 1 1-4 7.5-7.5M16 5l3 3"></path><circle cx="7.5" cy="16.5" r="4.5"></circle><polyline points="7.5 16.5 5 19 2 19 2 16 4.5 13.5"></polyline></svg>
                <span>Developer API Keys</span>
              </button>
              <button class="account-nav-link ${this.activeTab === 'security' ? 'active' : ''}" data-tab="security">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Security & 2FA</span>
              </button>
            </nav>
          </aside>

          <!-- Right Tab Content Panel -->
          <section class="account-content-panel">
            ${this.renderActiveTabContent(user, apiKeys)}
          </section>
        </div>
      </main>
    `;

    this.bindEvents(user);
  }

  renderActiveTabContent(user, apiKeys) {
    return AccountTabsRenderer.renderActiveTabContent(this, user, apiKeys);
  }

  getCodeSnippet(token) {
    return AccountTabsRenderer.getCodeSnippet(this.codeTab, token);
  }

  renderFullPageAuth() {
    FullPageAuth.render(this);
  }

  bindFullAuthEvents() {
    FullPageAuth.bindEvents(this);
  }

  bindEvents(user) {
    const homeBtn = this.container.querySelector('#btn-account-home');
    if (homeBtn) homeBtn.onclick = () => router.navigate('/');

    const backBtn = this.container.querySelector('#btn-account-back-tools');
    if (backBtn) backBtn.onclick = () => router.navigate('/');

    const studioBtn = this.container.querySelector('#btn-account-open-studio');
    if (studioBtn) studioBtn.onclick = () => router.navigate('/edit_pdf');

    const logoutBtn = this.container.querySelector('#btn-account-logout');
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await firebaseAuth.signOut();
        Toast.info('Signed out of LetsEdit');
        this.showLogin({ updateUrl: true });
      };
    }

    const themeBtn = this.container.querySelector('#btn-account-theme-toggle');
    if (themeBtn) {
      themeBtn.onclick = () => {
        toggleTheme();
        this.render();
      };
    }

    const navLinks = this.container.querySelectorAll('.account-nav-link');
    navLinks.forEach(link => {
      link.onclick = () => {
        this.activeTab = link.dataset.tab;
        this.render();
      };
    });

    AccountTabsRenderer.bindTabEvents(this, user);
  }
}

export const accountPage = new AccountPage();
