import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { authService } from '../src/core/auth-service.js';
import { store } from '../src/core/state-store.js';

describe('Production Hybrid Auth Service Tests (LETSEDIT_AUTH_SPECIFICATION.md)', () => {
  beforeEach(async () => {
    await authService.logout();
  });

  test('authService initializes with CSRF protection and empty session', () => {
    assert.ok(authService);
    assert.ok(authService.csrfToken);
    assert.equal(typeof authService.login, 'function');
    assert.equal(typeof authService.register, 'function');
    assert.equal(typeof authService.lookupSSO, 'function');
    assert.equal(typeof authService.loginWithSSO, 'function');
    assert.equal(typeof authService.signInWithGoogle, 'function');
    assert.equal(typeof authService.signInWithMicrosoft, 'function');
    assert.equal(typeof authService.verifySession, 'function');
    assert.equal(typeof authService.logout, 'function');
  });

  test('login throws validation error on invalid email or missing password', async () => {
    await assert.rejects(
      () => authService.login({ email: 'notanemail', password: 'password123' }),
      /valid email address/
    );

    await assert.rejects(
      () => authService.login({ email: 'valid@example.com', password: '' }),
      /enter your password/
    );
  });

  test('register validates password length and provisions user', async () => {
    await assert.rejects(
      () => authService.register({ name: 'Short', email: 'short@example.com', password: '123' }),
      /at least 6 characters/
    );

    const regResult = await authService.register({
      name: 'Morgan Stanley',
      email: 'morgan.stanley@example.com',
      password: 'SecurePassword123!'
    });

    assert.ok(regResult);
    assert.equal(regResult.success, true);
    assert.equal(regResult.user.email, 'morgan.stanley@example.com');
    assert.equal(regResult.user.name, 'Morgan Stanley');
    assert.ok(regResult.user.token);

    // Verify state store sync
    assert.equal(store.getState().user?.email, 'morgan.stanley@example.com');
  });

  test('login authenticates user and updates state store', async () => {
    const result = await authService.login({
      email: 'alex.pro@example.com',
      password: 'StandardPassword123'
    });

    assert.ok(result);
    assert.equal(result.success, true);
    assert.ok(result.user);
    assert.equal(result.user.email, 'alex.pro@example.com');
    assert.ok(result.user.token);
    assert.equal(store.getState().user?.email, 'alex.pro@example.com');
  });

  test('login triggers adaptive step-up 2FA and verifies code', async () => {
    // 1. Initial attempt with 2fa account triggers challenge
    const challengeResult = await authService.login({
      email: 'security.2fa@example.com',
      password: 'demo'
    });

    assert.ok(challengeResult);
    assert.equal(challengeResult.twoFactorRequired, true);
    assert.ok(challengeResult.message);

    // 2. Submitting with valid 6-digit code completes sign-in
    const verifyResult = await authService.login({
      email: 'security.2fa@example.com',
      password: 'demo',
      verificationCode: '123456'
    });

    assert.ok(verifyResult);
    assert.equal(verifyResult.success, true);
    assert.ok(verifyResult.user);
    assert.equal(verifyResult.user.email, 'security.2fa@example.com');
    assert.equal(store.getState().user?.email, 'security.2fa@example.com');
  });

  test('lookupSSO detects enterprise email domains and caches result', async () => {
    const ssoResult = await authService.lookupSSO('engineer@acme.com');
    assert.ok(ssoResult);
    assert.equal(ssoResult.useSSO, true);

    const normalResult = await authService.lookupSSO('regular@gmail.com');
    assert.ok(normalResult);
    assert.equal(normalResult.useSSO, false);

    // Cached lookup
    const cachedResult = await authService.lookupSSO('other.worker@acme.com');
    assert.equal(cachedResult.useSSO, true);
  });

  test('loginWithSSO returns SAML redirect URL', async () => {
    const ssoData = await authService.loginWithSSO('director@company.com');
    assert.ok(ssoData);
    assert.equal(ssoData.useSSO, true);
    assert.ok(ssoData.ssoUrl.includes('saml2/idp/sso'));
    assert.ok(ssoData.ssoUrl.includes('company.com'));
  });

  test('signInWithGoogle provisions Google OAuth user session', async () => {
    const result = await authService.signInWithGoogle();
    assert.ok(result);
    assert.equal(result.success, true);
    assert.ok(result.user.email.includes('google') || result.user.provider === 'google' || result.user.provider === 'google.com');
    assert.equal(store.getState().user?.email, result.user.email);
  });

  test('signInWithMicrosoft provisions Microsoft OAuth user session', async () => {
    const result = await authService.signInWithMicrosoft();
    assert.ok(result);
    assert.equal(result.success, true);
    assert.ok(result.user.email.includes('msft') || result.user.provider === 'microsoft');
    assert.equal(store.getState().user?.email, result.user.email);
  });

  test('profile update, API key lifecycle, and session verification', async () => {
    // Log in first
    const { user } = await authService.login({
      email: 'developer@example.com',
      password: 'DevPassword123'
    });

    // 1. Verify session
    const verification = await authService.verifySession(user.token);
    assert.equal(verification.valid, true);

    // 2. Update profile
    const updated = await authService.updateProfile({ name: 'Senior Developer', requires2fa: true });
    assert.equal(updated.name, 'Senior Developer');
    assert.equal(updated.requires2fa, true);
    assert.equal(store.getState().user?.name, 'Senior Developer');

    // 3. Create developer API key
    const newKey = await authService.createApiKey('CI/CD Pipeline Key');
    assert.ok(newKey);
    assert.equal(newKey.label, 'CI/CD Pipeline Key');
    assert.ok(newKey.token.startsWith('api_live_'));

    // 4. Revoke API key
    const revoked = await authService.revokeApiKey(newKey.id);
    assert.equal(revoked, true);

    // 5. Logout
    await authService.logout();
    assert.equal(store.getState().user, null);
    assert.equal(authService.getStoredUser(), null);
  });

  test('sendPasswordReset dispatches password recovery email', async () => {
    const resetResult = await authService.sendPasswordReset('forgotten@example.com');
    assert.equal(resetResult, true);
  });
});
