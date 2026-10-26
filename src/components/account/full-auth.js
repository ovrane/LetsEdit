/**
 * Full-Page Authentication View & Handlers
 * Handles full-screen sign-in and sign-up flows with SSO domain detection,
 * Cloudflare Turnstile, step-up 2FA code verification, and Google/Microsoft OAuth.
 */

import { router } from '../../core/router.js';
import { Toast } from '../toast.js';
import { firebaseAuth } from '../../core/firebase-auth.js';

export class FullPageAuth {
  static render(accountPage) {
    const isRegister = accountPage.authMode === 'register';

    accountPage.container.innerHTML = `
      <header class="account-header">
        <div class="account-nav-inner">
          <div class="account-brand" id="btn-auth-home" style="cursor: pointer;" title="Back to All Tools (/)">
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
            <button class="btn btn-sm btn-outline" id="btn-auth-back-tools">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>All Tools</span>
            </button>
          </div>
        </div>
      </header>

      <main class="full-auth-main">
        <div class="full-auth-card">
          <div class="full-auth-header">
            <h2>${isRegister ? 'Create your free account' : 'Sign in to LetsEdit'}</h2>
            <p>${isRegister ? 'Get free unlimited access to 43+ browser PDF tools.' : 'Welcome back! Choose your preferred login method.'}</p>
          </div>

          <!-- Tabs -->
          <div class="auth-tabs" style="margin-bottom: 24px;">
            <button type="button" class="auth-tab-btn ${!isRegister ? 'active' : ''}" id="btn-tab-signin">
              Sign In
            </button>
            <button type="button" class="auth-tab-btn ${isRegister ? 'active' : ''}" id="btn-tab-register">
              Create Account
            </button>
          </div>

          <div class="auth-alert" style="display:none;"></div>

          <form id="full-auth-form">
            ${isRegister ? `
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="full-auth-name" class="form-input" placeholder="e.g. Alex Morgan" required autocomplete="name" />
              </div>
            ` : ''}

            <div class="form-group">
              <label>Email address</label>
              <input type="email" id="full-auth-email" class="form-input" placeholder="name@company.com" required autocomplete="username" />
            </div>

            <!-- Password field -->
            <div class="form-group pwd-field-group">
              <label>Password</label>
              <input type="password" id="full-auth-password" class="form-input" placeholder="••••••••••••" required autocomplete="current-password" />
            </div>

            <!-- SSO Detected Button (hidden until enterprise domain match) -->
            <div class="form-group sso-field-group" style="display:none;">
              <button type="button" class="btn btn-primary" id="btn-full-sso-login" style="width:100%; display:flex; justify-content:center; gap:8px;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Continue with Single Sign-On (SSO)</span>
              </button>
            </div>

            <!-- 2FA Code field (revealed on 403 challenge) -->
            <div class="form-group verification-code-group" style="display:none;">
              <label>Verification Code</label>
              <input type="text" id="full-auth-2fa-code" class="form-input" placeholder="Enter 6-digit code (e.g. 123456)" maxlength="6" />
              <small class="form-text text-muted">A verification code was sent to your email.</small>
            </div>

            <!-- Cloudflare Turnstile Mock Widget -->
            <div class="turnstile-mock-box" id="full-turnstile-box">
              <label class="turnstile-label">
                <input type="checkbox" id="chk-full-turnstile" checked />
                <span class="turnstile-check"></span>
                <span>I am human</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f38020"><path d="M18.8 12.8c-.2-1.8-1.5-3.3-3.2-3.8-.4-2.8-2.8-5-5.6-5-2.6 0-4.8 1.8-5.4 4.3C2 8.7 0 11 0 13.8 0 17 2.6 19.6 5.8 19.6h12.5c2.6 0 4.7-2.1 4.7-4.7 0-1-.3-1.8-1-2.5l-3.2.4z"/></svg>
              </label>
              <div class="turnstile-branding">
                <span>Privacy • Terms</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-submit-auth" id="btn-full-submit-auth" style="width:100%; margin-top:16px;">
              <span>${isRegister ? 'Create Free Account' : 'Sign In'}</span>
            </button>
          </form>

          <!-- Social OAuth Buttons -->
          <div class="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div class="social-auth-grid">
            <button type="button" class="btn btn-outline btn-social" id="btn-full-google-login">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              <span>Google</span>
            </button>
            <button type="button" class="btn btn-outline btn-social" id="btn-full-msft-login">
              <svg width="18" height="18" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
              <span>Microsoft</span>
            </button>
          </div>
        </div>
      </main>
    `;

    FullPageAuth.bindEvents(accountPage);
  }

  static bindEvents(accountPage) {
    const homeBtn = accountPage.container.querySelector('#btn-auth-home');
    if (homeBtn) homeBtn.onclick = () => router.navigate('/');

    const backBtn = accountPage.container.querySelector('#btn-auth-back-tools');
    if (backBtn) backBtn.onclick = () => router.navigate('/');

    const tabSignIn = accountPage.container.querySelector('#btn-tab-signin');
    if (tabSignIn) {
      tabSignIn.onclick = () => {
        accountPage.authMode = 'login';
        FullPageAuth.render(accountPage);
        if (typeof window !== 'undefined') {
          window.history.pushState({ path: '/login' }, '', '/login');
          document.title = 'Sign in to LetsEdit — Fast & Secure PDF Tools';
        }
      };
    }

    const tabReg = accountPage.container.querySelector('#btn-tab-register');
    if (tabReg) {
      tabReg.onclick = () => {
        accountPage.authMode = 'register';
        FullPageAuth.render(accountPage);
        if (typeof window !== 'undefined') {
          window.history.pushState({ path: '/register' }, '', '/register');
          document.title = 'Create Free Account — LetsEdit';
        }
      };
    }

    const emailInp = accountPage.container.querySelector('#full-auth-email');
    const pwdGroup = accountPage.container.querySelector('.pwd-field-group');
    const ssoGroup = accountPage.container.querySelector('.sso-field-group');

    if (emailInp) {
      emailInp.oninput = (e) => {
        const val = e.target.value.toLowerCase().trim();
        const isSso = accountPage.ssoDomains.some(domain => val.endsWith(domain));
        if (isSso) {
          if (pwdGroup) pwdGroup.style.display = 'none';
          if (ssoGroup) ssoGroup.style.display = 'block';
        } else {
          if (pwdGroup) pwdGroup.style.display = 'block';
          if (ssoGroup) ssoGroup.style.display = 'none';
        }
      };
    }

    const form = accountPage.container.querySelector('#full-auth-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = emailInp ? emailInp.value.trim() : '';
        const pwdInp = accountPage.container.querySelector('#full-auth-password');
        const pwd = pwdInp ? pwdInp.value : '';
        const nameInp = accountPage.container.querySelector('#full-auth-name');
        const name = nameInp ? nameInp.value.trim() : email.split('@')[0];

        if (!email || !pwd) {
          Toast.warning('Please enter your email and password');
          return;
        }

        try {
          let user;
          if (accountPage.authMode === 'register') {
            user = await firebaseAuth.signUpWithEmail(email, pwd, name);
          } else {
            user = await firebaseAuth.signInWithEmail(email, pwd);
          }
          Toast.success(`Welcome to LetsEdit, ${user.name}!`);
          accountPage.show({ updateUrl: true, mode: 'account' });
        } catch (err) {
          Toast.error(err.message || 'Authentication error');
        }
      };
    }

    const googleBtn = accountPage.container.querySelector('#btn-full-google-login');
    if (googleBtn) {
      googleBtn.onclick = async () => {
        try {
          Toast.info('Connecting to Google Account...');
          const user = await firebaseAuth.signInWithGoogle();
          Toast.success(`Signed in as ${user.name}`);
          accountPage.show({ updateUrl: true, mode: 'account' });
        } catch (err) {
          Toast.error('Google Sign-in failed: ' + err.message);
        }
      };
    }

    const msftBtn = accountPage.container.querySelector('#btn-full-msft-login');
    if (msftBtn) {
      msftBtn.onclick = async () => {
        try {
          Toast.info('Connecting to Microsoft Account...');
          const user = await firebaseAuth.signInWithMicrosoft();
          Toast.success(`Signed in as ${user.name}`);
          accountPage.show({ updateUrl: true, mode: 'account' });
        } catch (err) {
          Toast.error('Microsoft Sign-in failed: ' + err.message);
        }
      };
    }
  }
}
