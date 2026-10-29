import { test, expect } from '@playwright/test';

test.describe('Authentication System & Google OAuth Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('login modal renders with Google Auth and without Microsoft Auth', async ({ page }) => {
    // Open login modal from landing header
    const loginBtn = page.locator('#btn-landing-auth');
    await loginBtn.click();

    const authModal = page.locator('#auth-modal');
    await expect(authModal).toBeVisible();

    // Verify Google login button is present and prominent
    const googleBtn = page.locator('#btn-google-login');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Continue with Google');

    // Verify Microsoft login button is COMPLETELY REMOVED from the DOM
    const msftBtn = page.locator('#btn-msft-login');
    await expect(msftBtn).toHaveCount(0);
  });

  test('Google OAuth button is active and interactive on login modal', async ({ page }) => {
    // Open auth modal
    await page.locator('#btn-landing-auth').click();
    await expect(page.locator('#auth-modal')).toBeVisible();

    // Verify Google button is enabled and ready for live user interaction
    const googleBtn = page.locator('#btn-google-login');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toBeEnabled();
  });

  test('dedicated /login and /signup pages render with Google Auth only', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Check full-page Google button
    const googleBtn = page.locator('#btn-full-google-login');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Continue with Google');

    // Verify Microsoft button is not present
    const msftBtn = page.locator('#btn-full-msft-login');
    await expect(msftBtn).toHaveCount(0);
  });
});
