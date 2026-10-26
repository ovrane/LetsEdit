import { test, expect } from '@playwright/test';

test.describe('Legal Policies, Preproduction Modals & Workflow Navigation', () => {
  test('direct navigation to /privacy opens Privacy Policy tab in Legal Modal', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('domcontentloaded');

    const legalModal = page.locator('#legal-modal');
    await expect(legalModal).toBeVisible();

    const activeTab = page.locator('.legal-tab-btn.active');
    await expect(activeTab).toHaveAttribute('data-legal-tab', 'privacy');
    await expect(page.locator('.legal-modal-body h2')).toContainText('Privacy Policy');
  });

  test('direct navigation to /terms opens Terms of Service tab in Legal Modal', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('domcontentloaded');

    const legalModal = page.locator('#legal-modal');
    await expect(legalModal).toBeVisible();

    const activeTab = page.locator('.legal-tab-btn.active');
    await expect(activeTab).toHaveAttribute('data-legal-tab', 'terms');
    await expect(page.locator('.legal-modal-body h2')).toContainText('Terms of Service');
  });

  test('direct navigation to /security-whitepaper opens Security Whitepaper', async ({ page }) => {
    await page.goto('/security-whitepaper');
    await page.waitForLoadState('domcontentloaded');

    const legalModal = page.locator('#legal-modal');
    await expect(legalModal).toBeVisible();

    const activeTab = page.locator('.legal-tab-btn.active');
    await expect(activeTab).toHaveAttribute('data-legal-tab', 'security');
    await expect(page.locator('.legal-modal-body h2')).toContainText('Security & Architectural Whitepaper');
  });

  test('navigation to /merge_pdf opens workflow tool interface', async ({ page }) => {
    await page.goto('/merge_pdf');
    await page.waitForLoadState('domcontentloaded');

    // Workflow container should be visible
    const workflow = page.locator('.tool-workflow-container');
    await expect(workflow).toBeVisible();
    await expect(page).toHaveTitle(/Merge PDF/i);
  });
});
