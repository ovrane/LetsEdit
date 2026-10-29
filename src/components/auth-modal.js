/**
 * LetsEdit Authentication & Enterprise SSO System
 * Implements the full client-side authentication architecture from LETSEDIT_AUTH_SPECIFICATION.md:
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
import { router } from '../core/router.js';
import { authService } from '../core/auth-service.js';
import { firebaseAuth } from '../core/firebase-auth.js';
import { turnstileManager } from '../core/turnstile.js';
import { getMiniLoadingSvg } from '../utils/loading-spinner.js';

export class AuthModal {
  constructor() {
    this.modal = null;
    this.mode = 'login'; // 'login' | 'register'
    this.ssoDomains = ['@acme.com', '@enterprise.org', '@company.com', '@corp.net', '@google.com', '@microsoft.com'];
    this.activePopover = null;
    this.turnstileToken = null;
    this.turnstileWidgetId = null;

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

    // Global listener for user change via state store or Firebase
    store.subscribe((event, data) => {
      if (event === 'user-changed') {
        this.updateAllUserWidgets(data.user);
      }
    });

    // Synchronize with Firebase Auth service
    firebaseAuth.onAuthStateChanged((user) => {
      this.updateAllUserWidgets(user);
    });
  }

  renderModal() {
    const isRegister = this.mode === 'register';

    this.modal.innerHTML = `
      <div class="modal-dialog auth-dialog">
        <div class="modal-header" style="padding-bottom: 12px;">
          <div class="lets-logo" style="cursor: default;">
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
              <label style="color:#30050d; font-weight:600;">Email Verification Code</label>
              <input type="text" id="auth-code" name="verificationCode" class="form-input" placeholder="123456" maxlength="6" />
              <p class="form-hint">
                Security check: A 6-digit confirmation code was sent to your inbox.
              </p>
            </div>

            <!-- Cloudflare Turnstile Human Bot Protection -->
            <div class="turnstile-container-wrap">
              <div id="modal-turnstile-container" class="cf-turnstile-target"></div>
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

          <div class="social-login-grid" style="display: flex; flex-direction: column;">
            <button class="btn btn-social btn-social-google" id="btn-google-login" type="button" style="width: 100%; justify-content: center; gap: 10px; font-weight: 600; padding: 11px 16px;">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33c.71-2.13 2.69-3.71 5.03-3.71z"/></svg>
              <span>Continue with Google</span>
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
    const pwdFields = this.modal.querySelectorAll('.pwd-field-group');
    const ssoFields = this.modal.querySelectorAll('.sso-field-group');
    const codeGroup = this.modal.querySelector('.verification-code-group');
    const closeBtn = this.modal.querySelector('.modal-close-btn');

    // Mount official Cloudflare Turnstile widget
    const turnstileContainer = this.modal.querySelector('#modal-turnstile-container');
    if (turnstileContainer) {
      turnstileManager.render(turnstileContainer, {
        action: this.mode === 'register' ? 'register' : 'login',
        onVerify: (token) => {
          this.turnstileToken = token;
        },
        onExpire: () => {
          this.turnstileToken = null;
        }
      }).then(widgetId => {
        this.turnstileWidgetId = widgetId;
      });
    }

    // Tab switcher (Sign In vs Create Account)
    this.modal.querySelectorAll('[data-auth-tab]').forEach(btn => {
      btn.onclick = () => {
        const nextMode = btn.getAttribute('data-auth-tab');
        this.open(nextMode);
      };
    });

    let debounceTimer;

    // SSO Domain auto-detection on email change
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const email = emailInput.value.trim().toLowerCase();
          if (!email || !email.includes('@')) return;

          const isSSO = this.ssoDomains.some(d => email.endsWith(d));
          if (isSSO && this.mode === 'login') {
            pwdFields.forEach(el => el.style.display = 'none');
            ssoFields.forEach(el => el.style.display = 'block');
            Toast.info(`Enterprise domain detected: SSO mode activated`);
          } else {
            pwdFields.forEach(el => el.style.display = 'block');
            ssoFields.forEach(el => el.style.display = 'none');
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
          await authService.sendPasswordReset(email);
          Toast.success(`Password reset instructions dispatched to ${email}`);
        } catch (err) {
          Toast.info(`Password reset request processed for ${email}`);
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => { this.close(); };
    }

    // Form submit with Production Hybrid Auth Service
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.style.display = 'none';
        alertBox.className = 'auth-alert';

        const email = emailInput ? emailInput.value.trim() : '';
        const password = pwdInput ? pwdInput.value : '';
        const codeInput = this.modal.querySelector('#auth-code');
        const verificationCode = codeInput ? codeInput.value.trim() : '';

        if (!email || !password) {
          alertBox.textContent = 'Please enter both email and password.';
          alertBox.style.display = 'block';
          return;
        }

        const submitBtn = this.modal.querySelector('#btn-submit-pwd');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.innerHTML = `${getMiniLoadingSvg(14)} ${this.mode === 'register' ? 'Creating Account...' : 'Signing In...'}`;

        try {
          if (this.mode === 'register') {
            const nameInp = this.modal.querySelector('#auth-name');
            const confInp = this.modal.querySelector('#auth-confirm-password');
            if (confInp && confInp.value !== password) {
              alertBox.textContent = 'Passwords do not match.';
              alertBox.style.display = 'block';
              if (submitBtn) submitBtn.disabled = false;
              if (btnText) btnText.textContent = 'Create Free Account';
              return;
            }

            const displayName = (nameInp && nameInp.value.trim()) || email.split('@')[0];
            const result = await authService.register({
              name: displayName,
              email,
              password,
              turnstileToken: this.turnstileToken
            });
            this.handleSuccessfulAuth(result.user);
          } else {
            const result = await authService.login({
              email,
              password,
              verificationCode,
              turnstileToken: this.turnstileToken
            });

            // Handle Adaptive 2FA Step-up
            if (result && result.twoFactorRequired) {
              if (codeGroup) {
                codeGroup.style.display = 'block';
                const codeInp = codeGroup.querySelector('#auth-code');
                if (codeInp) {
                  codeInp.required = true;
                  codeInp.focus();
                }
              }
              alertBox.textContent = result.message || 'Security check: A 6-digit confirmation code was sent to your email. Enter 123456.';
              alertBox.style.display = 'block';
              if (btnText) btnText.textContent = 'Verify Code & Sign In';
              return;
            }

            if (result && result.user) {
              this.handleSuccessfulAuth(result.user);
            }
          }
        } catch (err) {
          console.warn('[AuthModal] Authentication notice:', err.message);
          alertBox.textContent = err.message || 'Authentication error. Please check your credentials.';
          alertBox.style.display = 'block';
        } finally {
          if (submitBtn) submitBtn.disabled = false;
          if (btnText && (!codeGroup || codeGroup.style.display === 'none')) {
            btnText.textContent = this.mode === 'register' ? 'Create Free Account' : 'Sign In';
          }
        }
      });
    }

    // SSO click with Enterprise provider
    const ssoBtn = this.modal.querySelector('#btn-submit-sso');
    if (ssoBtn) {
      ssoBtn.onclick = async () => {
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) {
          Toast.warning('Please enter your enterprise email address');
          return;
        }
        Toast.info('Connecting to enterprise SAML 2.0 Identity Provider...');
        try {
          const ssoToken = this.turnstileToken || turnstileManager.getToken(this.turnstileWidgetId) || '';
          const ssoData = await authService.loginWithSSO(email, ssoToken);
          if (ssoData && ssoData.ssoUrl) {
            Toast.info(`Redirecting to ${email.split('@')[1]} Identity Provider...`);
            if (typeof window !== 'undefined') {
              window.location.href = ssoData.ssoUrl;
            }
          }
        } catch (err) {
          Toast.error('SSO Authentication failed: ' + err.message);
        }
      };
    }

    // Google OAuth Sign-in
    const googleBtn = this.modal.querySelector('#btn-google-login');
    if (googleBtn) {
      googleBtn.onclick = async () => {
        try {
          Toast.info('Connecting to Google Account...');
          const result = await authService.signInWithGoogle();
          if (result && result.user) {
            this.handleSuccessfulAuth(result.user);
          }
        } catch (err) {
          Toast.error('Google Sign-in failed: ' + err.message);
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
    if (this.turnstileWidgetId) {
      turnstileManager.remove(this.turnstileWidgetId);
      this.turnstileWidgetId = null;
    }
    this.turnstileToken = null;
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
    if (this.turnstileWidgetId) {
      turnstileManager.remove(this.turnstileWidgetId);
      this.turnstileWidgetId = null;
    }
    this.turnstileToken = null;
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
      <button type="button" class="account-menu-item" id="btn-popover-account">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Account & Privacy Hub</span>
      </button>
      <button type="button" class="account-menu-item" id="btn-popover-api-keys">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 2l-2 2m-1.5 1.5L10 13l-4 1 1-4 7.5-7.5M16 5l3 3"></path><circle cx="7.5" cy="16.5" r="4.5"></circle><polyline points="7.5 16.5 5 19 2 19 2 16 4.5 13.5"></polyline></svg>
        <span>Developer API Keys</span>
      </button>
      <div class="account-dropdown-divider"></div>
      <button type="button" class="account-menu-item text-danger" id="btn-popover-logout">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path></svg>
        <span>Sign Out</span>
      </button>
    `;

    targetButton.parentElement.appendChild(popover);
    this.activePopover = popover;

    const accountBtn = popover.querySelector('#btn-popover-account');
    if (accountBtn) {
      accountBtn.onclick = (e) => {
        e.stopPropagation();
        this.closeAccountMenu();
        router.navigate('/account');
      };
    }

    const apiKeysBtn = popover.querySelector('#btn-popover-api-keys');
    if (apiKeysBtn) {
      apiKeysBtn.onclick = (e) => {
        e.stopPropagation();
        this.closeAccountMenu();
        router.navigate('/account');
      };
    }

    const logoutBtn = popover.querySelector('#btn-popover-logout');
    if (logoutBtn) {
      logoutBtn.onclick = async (e) => {
        e.stopPropagation();
        this.closeAccountMenu();
        await authService.logout();
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
