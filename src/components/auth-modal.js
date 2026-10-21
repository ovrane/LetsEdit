/**
 * Sejda-inspired Authentication & SSO Modal
 * Reconstructs the exact reverse-engineered authentication workflows:
 * - Turnstile human verification requirement
 * - Enterprise SSO domain detection on debounced input
 * - Step-up 2FA email verification code prompt
 * - Google & Microsoft OAuth triggers
 * - Local remembered session
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class AuthModal {
  constructor() {
    this.modal = null;
    this.ssoDomains = ['@acme.com', '@enterprise.org', '@company.com', '@corp.net'];
    this.pendingEmail = '';
    this.init();
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop auth-modal-backdrop';
    this.modal.id = 'auth-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog auth-dialog">
        <div class="modal-header">
          <div class="brand-header">
            <div class="logo-mark">PDF</div>
            <h3>Sign in to your account</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="auth-alert" style="display:none;"></div>

          <form id="auth-login-form">
            <div class="form-group">
              <label>Email address</label>
              <input type="email" id="auth-email" name="email" class="form-input" placeholder="name@company.com" required autocomplete="username" />
            </div>

            <!-- Password field (switched to SSO when enterprise domain detected) -->
            <div class="form-group pwd-field-group">
              <label>Password</label>
              <input type="password" id="auth-password" name="password" class="form-input" placeholder="••••••••" required autocomplete="current-password" />
              <div class="form-sub-links">
                <a href="#" class="forgot-pwd-link">Forgot password?</a>
              </div>
            </div>

            <!-- Step-Up 2FA Email Verification Challenge (Initially hidden) -->
            <div class="form-group verification-code-group" style="display:none;">
              <label style="color:#0284c7;">Email Verification Code</label>
              <input type="text" id="auth-code" name="verificationCode" class="form-input" placeholder="123456" maxlength="6" />
              <p class="form-hint">
                A verification code was sent to your inbox. Please confirm it's really you.
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
            <button type="submit" class="btn btn-primary w-full btn-auth-submit pwd-field-group" id="btn-submit-pwd">
              <span class="btn-text">Sign in</span>
              <span class="spinner" style="display:none;"></span>
            </button>

            <!-- SSO Action Button (Visible when enterprise email is detected) -->
            <button type="button" class="btn btn-primary w-full sso-field-group" id="btn-submit-sso" style="display:none;">
              Continue with SSO &rarr;
            </button>
            <div class="sso-switch-link sso-field-group" style="display:none;">
              <a href="#" id="link-use-pwd">Use password instead</a>
            </div>
          </form>

          <!-- Alternative Social Sign-in -->
          <div class="divider-line">
            <span>or alternatively</span>
          </div>

          <div class="social-login-grid">
            <button class="btn btn-social" id="btn-google-login">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33c.71-2.13 2.69-3.71 5.03-3.71z"/></svg>
              <span>Sign in with Google</span>
            </button>
            <button class="btn btn-social" id="btn-msft-login">
              <svg width="18" height="18" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
              <span>Sign in with Microsoft</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
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

    let debounceTimer;

    // SSO Domain auto-detection on email change
    emailInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const email = emailInput.value.trim().toLowerCase();
        const isSSO = this.ssoDomains.some(d => email.endsWith(d));
        if (isSSO) {
          pwdFields.forEach(el => el.style.display = 'none');
          ssoFields.forEach(el => el.style.display = 'block');
          Toast.info('Enterprise domain recognized: SSO mode activated.');
        } else {
          pwdFields.forEach(el => el.style.display = 'block');
          ssoFields.forEach(el => el.style.display = 'none');
        }
      }, 300);
    });

    this.modal.querySelector('#link-use-pwd').onclick = (e) => {
      e.preventDefault();
      pwdFields.forEach(el => el.style.display = 'block');
      ssoFields.forEach(el => el.style.display = 'none');
    };

    // Close
    closeBtn.onclick = () => { this.modal.style.display = 'none'; };

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      // 1. Verify Turnstile
      if (!turnstileCheck.checked) {
        alertBox.textContent = 'Please select the "Verify you are human" checkbox below.';
        alertBox.style.display = 'block';
        return;
      }

      const email = emailInput.value.trim();
      const password = pwdInput.value;
      const code = this.modal.querySelector('#auth-code').value.trim();

      // Demo 2FA Trigger: if password is "demo", require 2FA code "123456"
      if (password === 'demo' && codeGroup.style.display === 'none') {
        codeGroup.style.display = 'block';
        alertBox.textContent = 'Security check: Email verification required. Enter code 123456.';
        alertBox.style.display = 'block';
        return;
      }

      if (codeGroup.style.display !== 'none' && code !== '123456') {
        alertBox.textContent = 'Verification code is incorrect. Please check code 123456.';
        alertBox.style.display = 'block';
        return;
      }

      // Successful Login
      const user = {
        email,
        name: email.split('@')[0],
        token: 'auth_' + Math.random().toString(36).substr(2)
      };

      store.setUser(user);
      this.modal.style.display = 'none';
      Toast.success(`Welcome back, ${user.name}!`);
    });

    // SSO click
    this.modal.querySelector('#btn-submit-sso').onclick = () => {
      if (!turnstileCheck.checked) {
        alertBox.textContent = 'Please verify you are human before proceeding.';
        alertBox.style.display = 'block';
        return;
      }
      Toast.info('Connecting to enterprise identity provider (SAML/Okta)...');
      setTimeout(() => {
        const email = emailInput.value.trim();
        store.setUser({ email, name: email.split('@')[0], sso: true });
        this.modal.style.display = 'none';
        Toast.success('SSO Authentication verified!');
      }, 1000);
    };

    // Social buttons
    this.modal.querySelector('#btn-google-login').onclick = () => {
      store.setUser({ email: 'alex.google@example.com', name: 'Alex (Google)', provider: 'google' });
      this.modal.style.display = 'none';
      Toast.success('Signed in with Google!');
    };

    this.modal.querySelector('#btn-msft-login').onclick = () => {
      store.setUser({ email: 'jordan.msft@example.com', name: 'Jordan (Microsoft)', provider: 'microsoft' });
      this.modal.style.display = 'none';
      Toast.success('Signed in with Microsoft!');
    };
  }

  open() {
    this.modal.style.display = 'flex';
  }
}
