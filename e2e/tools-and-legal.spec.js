import { test, expect } from '@playwright/test';

test.describe('Legal Policies, Preproduction Modals & Workflow Navigation', () => {
  test('direct navigation to /privacy opens Privacy Policy tab in Legal Hub', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' });

    const legalContainer = page.locator('#legal-page-container');
    await expect(legalContainer).toBeVisible();

    const activeTab = legalContainer.locator('.legal-sidebar-item.active, .legal-tab-btn.active');
    await expect(activeTab).toBeVisible();
    await expect(legalContainer).toContainText(/Privacy Policy/i);
  });

  test('direct navigation to /terms opens Terms of Service tab in Legal Hub', async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'domcontentloaded' });

    const legalContainer = page.locator('#legal-page-container');
    await expect(legalContainer).toBeVisible();

    const activeTab = legalContainer.locator('.legal-sidebar-item.active, .legal-tab-btn.active');
    await expect(activeTab).toBeVisible();
    await expect(legalContainer).toContainText(/Terms of Service/i);
  });

  test('direct navigation to /security-whitepaper opens Security Whitepaper', async ({ page }) => {
    await page.goto('/security-whitepaper', { waitUntil: 'domcontentloaded' });

    const legalContainer = page.locator('#legal-page-container');
    await expect(legalContainer).toBeVisible();

    const activeTab = legalContainer.locator('.legal-sidebar-item.active, .legal-tab-btn.active');
    await expect(activeTab).toBeVisible();
    await expect(legalContainer).toContainText(/Security/i);
  });

  test('navigation to /merge_pdf opens workflow tool interface', async ({ page }) => {
    await page.goto('/merge_pdf', { waitUntil: 'domcontentloaded' });

    // Workflow container should be visible
    const workflow = page.locator('.tool-workflow-container');
    await expect(workflow).toBeVisible();
    await expect(page).toHaveTitle(/Merge PDF/i);
  });
});
