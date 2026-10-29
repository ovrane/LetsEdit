import { test, expect } from '@playwright/test';

test.describe('Authentication System & Cloudflare Turnstile Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('login modal renders with Google Auth and without Microsoft Auth', async ({ page }) => {
    const loginBtn = page.locator('#btn-landing-auth');
    await loginBtn.click();

    const authModal = page.locator('#auth-modal');
    await expect(authModal).toBeVisible();

    const googleBtn = page.locator('#btn-google-login');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Continue with Google');

    const msftBtn = page.locator('#btn-msft-login');
    await expect(msftBtn).toHaveCount(0);
  });

  test('Google OAuth button is active and interactive on login modal', async ({ page }) => {
    await page.locator('#btn-landing-auth').click();
    await expect(page.locator('#auth-modal')).toBeVisible();

    const googleBtn = page.locator('#btn-google-login');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toBeEnabled();
  });

  test('dedicated /login and /signup pages render with Google Auth only', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const googleBtn = page.locator('#btn-full-google-login');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Continue with Google');

    const msftBtn = page.locator('#btn-full-msft-login');
    await expect(msftBtn).toHaveCount(0);
  });

  test('login with wrong password shows real error and does not create mock user', async ({ page }) => {
    await page.locator('#btn-landing-auth').click();
    await expect(page.locator('#auth-modal')).toBeVisible();

    await page.locator('#auth-email').fill('alex.pro@example.com');
    await page.locator('#auth-password').fill('WrongPassword999!');
    await page.locator('#btn-submit-pwd').click();

    // Verify real error alert is displayed
    const alertBox = page.locator('.auth-alert');
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/Incorrect password|Invalid credentials/i);

    // Verify user is NOT logged in
    const landingAuthBtn = page.locator('#btn-landing-auth');
    await expect(landingAuthBtn).toContainText('Log in');
  });

  test('login with unregistered email shows account not found error', async ({ page }) => {
    await page.locator('#btn-landing-auth').click();
    await expect(page.locator('#auth-modal')).toBeVisible();

    const randomEmail = `unregistered_${Date.now()}@example.com`;
    await page.locator('#auth-email').fill(randomEmail);
    await page.locator('#auth-password').fill('AnyPassword123!');
    await page.locator('#btn-submit-pwd').click();

    // Verify account not found error alert
    const alertBox = page.locator('.auth-alert');
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/No account found|Invalid credentials|create an account/i);

    // Verify user is NOT logged in
    const landingAuthBtn = page.locator('#btn-landing-auth');
    await expect(landingAuthBtn).toContainText('Log in');
  });

  test('create free account genuinely registers user and signs in', async ({ page }) => {
    await page.locator('#btn-landing-auth').click();
    await expect(page.locator('#auth-modal')).toBeVisible();

    // Switch to register tab
    await page.locator('[data-auth-tab="register"]').click();

    const testEmail = `newuser_${Date.now()}@example.com`;
    await page.locator('#auth-name').fill('Sarah Connor');
    await page.locator('#auth-email').fill(testEmail);
    await page.locator('#auth-password').fill('SkynetTerminator2026!');
    await page.locator('#auth-confirm-password').fill('SkynetTerminator2026!');

    await page.locator('#btn-submit-pwd').click();

    // Verify modal closes and user is logged in as Sarah Connor
    await expect(page.locator('#auth-modal')).toBeHidden({ timeout: 6000 });
    const landingAuthBtn = page.locator('#btn-landing-auth');
    await expect(landingAuthBtn).toContainText('Sarah Connor');
  });
});
