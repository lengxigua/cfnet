import { test, expect } from '@playwright/test';

test.describe('Page Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Next\.js|Edge Next/i);
    await expect(page.getByText(/Welcome|Edge Runtime/i).first()).toBeVisible();
  });

  test('should load pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/Pricing/i).first()).toBeVisible();
  });

  test('should load privacy policy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText(/Privacy Policy/i).first()).toBeVisible();
  });

  test('should load terms of service page', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText(/Terms of Service/i).first()).toBeVisible();
  });

  test('should return 404 for non-existent pages', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    // Should show 404 content or status
    const content = await page.textContent('body');
    expect(content).toContain('404');
  });

  test('should have API health endpoint', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.status()).toBe(200);
  });
});
