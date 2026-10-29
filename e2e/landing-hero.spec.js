import { test, expect } from '@playwright/test';

test.describe('Landing Page & Display-Height Hero', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('hero section fills display height and displays core elements', async ({ page }) => {
    const hero = page.locator('.landing-hero-section');
    await expect(hero).toBeVisible();

    // Check display height (viewport height minus header)
    const viewportSize = page.viewportSize();
    if (viewportSize) {
      const heroBox = await hero.boundingBox();
      expect(heroBox).toBeTruthy();
      // Should fill the display height (allow small padding margin)
      expect(heroBox.height).toBeGreaterThanOrEqual(viewportSize.height - 120);
    }

    // Check hero typography and actions
    await expect(page.locator('.landing-hero-title')).toContainText(/Free Online PDF Editor|Work on your PDF/i);
    await expect(page.locator('#btn-landing-upload-pdf')).toBeVisible();
    await expect(page.locator('#btn-landing-open-editor, #btn-landing-explore-tools').first()).toBeVisible();
    await expect(page.locator('#btn-landing-scroll-cue')).toBeVisible();
  });

  test('explore tools button and scroll cue scroll down to tool cards', async ({ page }) => {
    const toolsGrid = page.locator('#landing-cards-grid');
    await expect(toolsGrid).toBeAttached();

    // Click scroll cue
    const scrollCue = page.locator('#btn-landing-scroll-cue');
    await scrollCue.click();

    // Wait a brief moment for smooth scroll
    await page.waitForTimeout(600);
    const scrollY = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop || document.querySelector('.landing-view-container')?.scrollTop || 0);
    expect(scrollY).toBeGreaterThan(50);
  });

  test('dark mode theme applies exact neutral dark #232323 background', async ({ page }) => {
    // Click theme toggle
    const themeBtn = page.locator('#btn-landing-theme');
    await themeBtn.click();

    // Check data-theme attribute
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Wait for the 0.2s background-color CSS transition to complete
    await page.waitForTimeout(300);

    // Verify background color of landing hero is #232323 (rgb(35, 35, 35) or rgb(36, 36, 36) in mobile renderers)
    const heroBg = await page.locator('.landing-hero-section').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(['rgb(35, 35, 35)', 'rgb(36, 36, 36)']).toContain(heroBg);
  });
});
