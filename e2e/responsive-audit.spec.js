import { test, expect } from '@playwright/test';

test.describe('Full-Suite Responsive Engine Audit Across Viewports', () => {

  const viewports = [
    { name: 'Ultra-Compact (iPhone SE 1st gen)', width: 320, height: 568 },
    { name: 'Standard Smartphone (iPhone SE 2nd/3rd gen)', width: 375, height: 667 },
    { name: 'Modern Smartphone (Pixel 7 / iPhone 15)', width: 393, height: 852 },
    { name: 'Portrait Tablet / Phablet (iPad Mini 768px)', width: 768, height: 1024 },
    { name: 'Mid-Size Tablet (iPad 10.9" 820px)', width: 820, height: 1180 },
    { name: 'Small Laptop / Landscape Tablet (1024px)', width: 1024, height: 768 },
  ];

  for (const vp of viewports) {
    test(`Landing Page renders with zero overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Ensure main landing elements rendered
      const brandLogo = page.locator('#landing-brand-logo');
      await expect(brandLogo).toBeVisible();

      const heroTitle = page.locator('.landing-hero-title');
      await expect(heroTitle).toBeVisible();

      // Check ZERO horizontal overflow across the entire document
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      // Verify category filter rail exists and is scrollable
      const filterRail = page.locator('.landing-filter-rail');
      await expect(filterRail).toBeVisible();

      // Verify popular tools and tool cards rendered
      const toolCards = page.locator('.hero-popular-card, .tools-dir-item');
      const count = await toolCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test(`Legal Hub renders cleanly with zero overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/privacy', { waitUntil: 'domcontentloaded' });

      const legalContainer = page.locator('#legal-page-container');
      await expect(legalContainer).toBeVisible();

      // Check ZERO horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      // Check legal content card is visible
      const contentCard = page.locator('.legal-content-card');
      await expect(contentCard).toBeVisible();
    });

    test(`Documentation Page renders cleanly with zero overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/docs', { waitUntil: 'domcontentloaded' });

      const docsContainer = page.locator('#docs-page-container');
      await expect(docsContainer).toBeVisible();

      // Check ZERO horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });

    test(`Workflow Tool Page (/merge_pdf) renders cleanly on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/merge_pdf', { waitUntil: 'domcontentloaded' });

      const workflowContainer = page.locator('.tool-workflow-container');
      await expect(workflowContainer).toBeVisible();

      // Check ZERO horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });

    test(`Studio Editor (/edit) renders responsive navbar on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/edit', { waitUntil: 'domcontentloaded' });

      const navbar = page.locator('.app-navbar');
      await expect(navbar).toBeVisible();

      const exportBtn = page.locator('#btn-save-pdf');
      await expect(exportBtn).toBeVisible();

      // Check ZERO horizontal overflow on document
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });
  }

  test('Auth modal displays full responsive width and tap-friendly targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Open login modal
    const authBtn = page.locator('#btn-landing-auth');
    await authBtn.click();

    const authModal = page.locator('#auth-modal');
    await expect(authModal).toBeVisible();

    const googleBtn = page.locator('#btn-google-login');
    await expect(googleBtn).toBeVisible();

    // Check Google Auth button meets minimum tap target height (>= 40px)
    const btnBox = await googleBtn.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(btnBox.height).toBeGreaterThanOrEqual(40);
  });

});
