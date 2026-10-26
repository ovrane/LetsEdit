import { test, expect } from '@playwright/test';

test.describe('Studio Editor Empty State & Document Uploader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edit_pdf');
    await page.waitForLoadState('domcontentloaded');
  });

  test('studio upload card renders with clean Adobe Acrobat style and no test buttons', async ({ page }) => {
    const uploadCard = page.locator('#editor-empty-dropzone');
    await expect(uploadCard).toBeVisible();

    // Check heading and subtitle
    await expect(uploadCard.locator('.editor-upload-title')).toContainText('Select a PDF to edit');
    await expect(uploadCard.locator('.editor-upload-subtitle')).toBeVisible();

    // Check primary "Select PDF file" button
    const selectFileBtn = uploadCard.locator('#btn-editor-upload-pdf');
    await expect(selectFileBtn).toBeVisible();
    await expect(selectFileBtn).toContainText('Select PDF file');

    // Check secondary "Blank Page" button
    const blankBtn = uploadCard.locator('#btn-editor-blank-doc');
    await expect(blankBtn).toBeVisible();
    await expect(blankBtn).toContainText('Blank Page');

    // Verify test buttons and sample contract links are COMPLETELY REMOVED
    const sampleLink = uploadCard.locator('#btn-editor-load-sample');
    await expect(sampleLink).toHaveCount(0);
    const sampleRow = uploadCard.locator('.editor-upload-sample-row');
    await expect(sampleRow).toHaveCount(0);

    // Verify privacy feature pills
    await expect(uploadCard.locator('.feature-pill.pill-private')).toContainText('In-Browser Privacy');
  });

  test('clicking Blank Page creates a clean editable document canvas', async ({ page }) => {
    const blankBtn = page.locator('#btn-editor-blank-doc');
    await expect(blankBtn).toBeVisible();
    await blankBtn.click();

    // Empty state should disappear once blank document is ready
    await expect(page.locator('#editor-empty-dropzone')).not.toBeVisible();

    // Document canvas viewport should show the active page
    const canvasWrap = page.locator('.pdf-page-wrapper, .pdf-page-canvas');
    await expect(canvasWrap.first()).toBeVisible();

    // Filename in navbar pill should reflect blank document
    const filenameTag = page.locator('#current-filename');
    await expect(filenameTag).toContainText('Blank_Document.pdf');
  });
});
