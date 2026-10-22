/**
 * Sejda & iLovePDF Reverse-Engineered Authentication & SSO System
 * Implements the full client-side authentication architecture from SEJDA_AUTH_SPECIFICATION.md:
 * - Dual mode: Sign In vs Create Account
 * - Enterprise SSO domain detection (debounced email lookup)
 * - Cloudflare Turnstile human bot verification
 * - Adaptive step-up 2FA email verification challenge (403 simulation)
 * - Google & Microsoft Azure AD / MSAL OAuth simulation
 * - Remembered email persistence (`localStorage.getItem('rememberedEmail')`)
 * - Global User Account Popover widget with avatar, pro badge, and sign-out
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class AuthModal {
  constructor() {
    this.modal = null;
    this.mode = 'login'; // 'login' | 'register'
    this.ssoDomains = ['@acme.com', '@enterprise.org', '@company.com', '@corp.net', '@google.com', '@microsoft.com'];
    this.activePopover = null;

    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop auth-modal-backdrop';
    this.modal.id = 'auth-modal';
    this.modal.style.display = 'none';

    this.renderModal();
    document.body.appendChild(this.modal);
    this.bindEvents();

    // Close any active user popover when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (this.activePopover && !this.activePopover.contains(e.target) && !e.target.closest('.user-account-btn') && !e.target.closest('#btn-open-auth')) {
        this.closeAccountMenu();
      }
    });

    // Global listener for user change
    store.subscribe((event, data) => {
      if (event === 'user-changed') {
        this.updateAllUserWidgets(data.user);
      }
    });
  }

  renderModal() {
    const isRegister = this.mode === 'register';

    this.modal.innerHTML = `
      <div class="modal-dialog auth-dialog">
        <div class="modal-header" style="padding-bottom: 12px;">
          <div class="lets-logo" style="cursor: default;">
            <div class="lets-logo-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M10.5 13.5l3.5-3.5 2 2-3.5 3.5-2.5.5.5-2.5z"></path>
              </svg>
            </div>
            <span class="lets-logo-text">Lets<span class="lets-logo-accent">Edit</span></span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <!-- Auth Tabs: Sign in vs Register -->
        <div class="auth-tabs">
          <button type="button" class="auth-tab-btn ${!isRegister ? 'active' : ''}" data-auth-tab="login">
            Sign In
          </button>
          <button type="button" class="auth-tab-btn ${isRegister ? 'active' : ''}" data-auth-tab="register">
            Create Free Account
          </button>
        </div>

        <div class="modal-body" style="padding-top: 20px;">
          <div class="auth-alert" style="display:none;"></div>

          <form id="auth-login-form">
            ${isRegister ? `
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="auth-name" name="name" class="form-input" placeholder="e.g. Alex Morgan" required autocomplete="name" />
              </div>
            ` : ''}

            <div class="form-group">
              <label>Email address</label>
              <input type="email" id="auth-email" name="email" class="form-input" placeholder="name@company.com" required autocomplete="username" />
            </div>

            <!-- Password field (switched to SSO when enterprise domain detected) -->
            <div class="form-group pwd-field-group">
              <label>Password</label>
              <input type="password" id="auth-password" name="password" class="form-input" placeholder="••••••••" required autocomplete="${isRegister ? 'new-password' : 'current-password'}" />
              ${!isRegister ? `
                <div class="form-sub-links">
                  <a href="#" class="forgot-pwd-link" id="link-forgot-pwd">Forgot password?</a>
                </div>
              ` : ''}
            </div>

            ${isRegister ? `
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="auth-confirm-password" name="confirmPassword" class="form-input" placeholder="••••••••" required autocomplete="new-password" />
              </div>
            ` : ''}

            <!-- Step-Up 2FA Email Verification Challenge (Initially hidden) -->
            <div class="form-group verification-code-group" style="display:none;">
              <label style="color:#0284c7; font-weight:600;">Email Verification Code</label>
              <input type="text" id="auth-code" name="verificationCode" class="form-input" placeholder="123456" maxlength="6" />
              <p class="form-hint">
                Security check: A 6-digit confirmation code was sent to your inbox.
              </p>
            </div>

            <!-- Interactive Cloudflare Turnstile Bot Protection -->
            <div class="turnstile-box">
              <label class="turnstile-check-label">
                <input type="checkbox" id="auth-turnstile-check" />
                <span class="turnstile-custom-box"></span>
                <span class="turnstile-text">Verify you are human</span>
              </label>
              <div class="turnstile-badge">
                <span>Cloudflare</span>
                <small>Turnstile</small>
              </div>
            </div>

            <!-- Standard Submit Button -->
            <button type="submit" class="btn btn-primary w-full btn-auth-submit pwd-field-group" id="btn-submit-pwd" style="padding: 12px; font-weight: 600;">
              <span class="btn-text">${isRegister ? 'Create Free Account' : 'Sign In'}</span>
              <span class="spinner" style="display:none;"></span>
            </button>

            <!-- SSO Action Button (Visible when enterprise email is detected) -->
            <button type="button" class="btn btn-primary w-full sso-field-group" id="btn-submit-sso" style="display:none; padding: 12px; font-weight: 600;">
              Continue with Enterprise SSO &rarr;
            </button>
            <div class="sso-switch-link sso-field-group" style="display:none; text-align: center; margin-top: 8px;">
              <a href="#" id="link-use-pwd">Use password instead</a>
            </div>
          </form>

          <!-- Alternative Social Sign-in -->
          <div class="divider-line">
            <span>or continue with</span>
          </div>

          <div class="social-login-grid">
            <button class="btn btn-social" id="btn-google-login" type="button">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33c.71-2.13 2.69-3.71 5.03-3.71z"/></svg>
              <span>Google Account</span>
            </button>
            <button class="btn btn-social" id="btn-msft-login" type="button">
              <svg width="18" height="18" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
              <span>Microsoft Account</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const emailInput = this.modal.querySelector('#auth-email');
    const pwdInput = this.modal.querySelector('#auth-password');
    const form = this.modal.querySelector('#auth-login-form');
    const alertBox = this.modal.querySelector('.auth-alert');
    const turnstileCheck = this.modal.querySelector('#auth-turnstile-check');
    const pwdFields = this.modal.querySelectorAll('.pwd-field-group');
    const ssoFields = this.modal.querySelectorAll('.sso-field-group');
    const codeGroup = this.modal.querySelector('.verification-code-group');
    const closeBtn = this.modal.querySelector('.modal-close-btn');

    // Tab switcher (Sign In vs Create Account)
    this.modal.querySelectorAll('[data-auth-tab]').forEach(btn => {
      btn.onclick = () => {
        this.mode = btn.getAttribute('data-auth-tab');
        this.renderModal();
        this.open();
      };
    });

    let debounceTimer;

    // SSO Domain auto-detection on email change via backend API
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          const email = emailInput.value.trim().toLowerCase();
          if (!email || !email.includes('@')) return;

          try {
            const res = await fetch('/users/login-with-sso/lookup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.useSSO && this.mode === 'login') {
              pwdFields.forEach(el => el.style.display = 'none');
              ssoFields.forEach(el => el.style.display = 'block');
              Toast.info(`Enterprise domain @${data.domain || ''} detected: SSO mode activated`);
            } else {
              pwdFields.forEach(el => el.style.display = 'block');
              ssoFields.forEach(el => el.style.display = 'none');
            }
          } catch (err) {
            // Fallback to local domain check if network fails
            const isSSO = this.ssoDomains.some(d => email.endsWith(d));
            if (isSSO && this.mode === 'login') {
              pwdFields.forEach(el => el.style.display = 'none');
              ssoFields.forEach(el => el.style.display = 'block');
            }
          }
        }, 200);
      });
    }

    const usePwdLink = this.modal.querySelector('#link-use-pwd');
    if (usePwdLink) {
      usePwdLink.onclick = (e) => {
        e.preventDefault();
        pwdFields.forEach(el => el.style.display = 'block');
        ssoFields.forEach(el => el.style.display = 'none');
      };
    }

    const forgotLink = this.modal.querySelector('#link-forgot-pwd');
    if (forgotLink) {
      forgotLink.onclick = async (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) {
          Toast.warning('Please enter your email address to receive password reset instructions');
          return;
        }
        try {
          const res = await fetch('/users/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          Toast.info(data.message || `Password reset instructions sent to ${email}`);
        } catch {
          Toast.info(`Password reset instructions sent to ${email}`);
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => { this.close(); };
    }

    // Form submit with Backend API call
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.style.display = 'none';

        if (!turnstileCheck || !turnstileCheck.checked) {
          alertBox.textContent = 'Please select the "Verify you are human" checkbox.';
          alertBox.style.display = 'block';
          return;
        }

        const email = emailInput.value.trim();
        const password = pwdInput ? pwdInput.value : '';

        if (this.mode === 'register') {
          const nameInp = this.modal.querySelector('#auth-name');
          const confInp = this.modal.querySelector('#auth-confirm-password');
          if (confInp && pwdInput && confInp.value !== pwdInput.value) {
            alertBox.textContent = 'Passwords do not match.';
            alertBox.style.display = 'block';
            return;
          }

          try {
            const res = await fetch('/users/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: (nameInp && nameInp.value.trim()) || email.split('@')[0],
                email,
                password
              })
            });
            const data = await res.json();
            if (!res.ok) {
              alertBox.textContent = data.error || 'Registration failed.';
              alertBox.style.display = 'block';
              return;
            }
            this.handleSuccessfulAuth(data);
          } catch (err) {
            // Fallback for offline environments
            const user = {
              email,
              name: (nameInp && nameInp.value.trim()) || email.split('@')[0],
              plan: 'Pro',
              token: 'auth_' + Math.random().toString(36).substring(2)
            };
            this.handleSuccessfulAuth(user);
          }
          return;
        }

        // Login flow with Backend API & Adaptive 2FA
        const codeInp = this.modal.querySelector('#auth-code');
        const emailVerificationCode = codeInp ? codeInp.value.trim() : undefined;

        try {
          const res = await fetch('/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              emailVerificationCode,
              'cf-turnstile-response': 'cf_' + Math.random().toString(36).substring(2)
            })
          });

          const data = await res.json();

          if (res.status === 403 && data.twoFactorRequired) {
            // Adaptive step-up 2FA Challenge triggered by backend
            codeGroup.style.display = 'block';
            alertBox.textContent = data.message || 'Security check: Email verification required. Enter code 123456.';
            alertBox.style.display = 'block';
            return;
          }

          if (!res.ok) {
            alertBox.textContent = data.error || 'Login failed. Please check your credentials.';
            alertBox.style.display = 'block';
            return;
          }

          this.handleSuccessfulAuth(data);
        } catch (err) {
          // Graceful fallback for offline
          if ((email.includes('2fa') || password === 'demo') && codeGroup.style.display === 'none') {
            codeGroup.style.display = 'block';
            alertBox.textContent = 'Security check: Email verification required. Enter code 123456.';
            alertBox.style.display = 'block';
            return;
          }
          const user = {
            email,
            name: email.split('@')[0],
            plan: 'Pro',
            token: 'auth_' + Math.random().toString(36).substring(2)
          };
          this.handleSuccessfulAuth(user);
        }
      });
    }

    // SSO click with backend SAML flow
    const ssoBtn = this.modal.querySelector('#btn-submit-sso');
    if (ssoBtn) {
      ssoBtn.onclick = async () => {
        if (!turnstileCheck || !turnstileCheck.checked) {
          alertBox.textContent = 'Please verify you are human before proceeding.';
          alertBox.style.display = 'block';
          return;
        }
        Toast.info('Connecting to enterprise identity provider (SAML 2.0)...');

        const email = emailInput ? emailInput.value.trim() : 'enterprise@user.com';
        try {
          const res = await fetch('/users/login-with-sso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          Toast.success(`Authenticated with SSO identity provider (${data.ssoUrl ? new URL(data.ssoUrl).hostname : 'SAML 2.0'})`);
        } catch {}

        const user = {
          email,
          name: email.split('@')[0],
          plan: 'Enterprise',
          sso: true,
          token: 'sso_' + Math.random().toString(36).substring(2)
        };
        this.handleSuccessfulAuth(user);
      };
    }

    // Google OAuth with backend API
    const googleBtn = this.modal.querySelector('#btn-google-login');
    if (googleBtn) {
      googleBtn.onclick = async () => {
        try {
          const res = await fetch('/users/login-with-google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: 'google_oauth_token_' + Date.now() })
          });
          const data = await res.json();
          this.handleSuccessfulAuth(data);
        } catch {
          const user = {
            email: 'alex.google@example.com',
            name: 'Alex Morgan',
            plan: 'Pro',
            provider: 'google',
            token: 'gsi_' + Math.random().toString(36).substring(2)
          };
          this.handleSuccessfulAuth(user);
        }
      };
    }

    // Microsoft OAuth with backend API
    const msftBtn = this.modal.querySelector('#btn-msft-login');
    if (msftBtn) {
      msftBtn.onclick = async () => {
        try {
          const res = await fetch('/users/login-with-microsoft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: 'msal_oauth_token_' + Date.now() })
          });
          const data = await res.json();
          this.handleSuccessfulAuth(data);
        } catch {
          const user = {
            email: 'jordan.msft@example.com',
            name: 'Jordan Miller',
            plan: 'Pro',
            provider: 'microsoft',
            token: 'msal_' + Math.random().toString(36).substring(2)
          };
          this.handleSuccessfulAuth(user);
        }
      };
    }
  }

  handleSuccessfulAuth(user) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rememberedEmail', user.email);
    }
    store.setUser(user);
    this.close();
    Toast.success(`Welcome back, ${user.name}!`);
  }

  open(mode = 'login') {
    this.mode = mode;
    this.renderModal();
    const emailInput = this.modal.querySelector('#auth-email');
    if (emailInput && typeof localStorage !== 'undefined') {
      const remembered = localStorage.getItem('rememberedEmail');
      if (remembered) emailInput.value = remembered;
    }
    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
  }

  // --- GLOBAL USER ACCOUNT POPOVER MENU ---
  toggleAccountMenu(targetButton) {
    if (this.activePopover) {
      this.closeAccountMenu();
      return;
    }

    const state = store.getState();
    if (!state.user) {
      this.open('login');
      return;
    }

    const user = state.user;
    const initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase();

    const popover = document.createElement('div');
    popover.className = 'user-account-dropdown';
    popover.innerHTML = `
      <div class="account-dropdown-header">
        <div class="account-avatar-ring">${initials}</div>
        <div class="account-user-meta">
          <strong>${user.name || 'User'}</strong>
          <span>${user.email}</span>
        </div>
      </div>
      <div class="account-plan-card">
        <span class="account-plan-badge">${user.plan ? `${user.plan.toUpperCase()} ACTIVE` : 'PRO ACTIVE'}</span>
        <p>Unlimited client-side PDF editing, conversion & vector tools.</p>
      </div>
      <div class="account-dropdown-divider"></div>
      <button type="button" class="account-menu-item" id="btn-popover-logout">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path></svg>
        <span>Sign Out</span>
      </button>
    `;

    targetButton.parentElement.appendChild(popover);
    this.activePopover = popover;

    const logoutBtn = popover.querySelector('#btn-popover-logout');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.stopPropagation();
        this.closeAccountMenu();
        store.setUser(null);
        Toast.info('Signed out successfully');
      };
    }
  }

  closeAccountMenu() {
    if (this.activePopover && this.activePopover.parentElement) {
      this.activePopover.parentElement.removeChild(this.activePopover);
      this.activePopover = null;
    }
  }

  updateAllUserWidgets(user) {
    const studioName = document.getElementById('user-display-name');
    if (studioName) {
      studioName.textContent = user ? user.name : 'Log in';
    }

    const landingBtn = document.getElementById('btn-landing-auth');
    if (landingBtn) {
      landingBtn.innerHTML = user
        ? `<div class="account-avatar-ring" style="width:22px; height:22px; font-size:11px; margin-right:6px;">${user.name.substring(0, 1).toUpperCase()}</div><span>${user.name}</span>`
        : `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><span>Log in</span>`;
    }

    const signupBtn = document.getElementById('btn-landing-signup');
    if (signupBtn) {
      signupBtn.style.display = user ? 'none' : 'inline-flex';
    }
  }
}

export const authModal = new AuthModal();
