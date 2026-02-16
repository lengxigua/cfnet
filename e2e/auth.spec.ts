import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Login')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Sign Up')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();

    // Should show error message
    await expect(page.locator('[role="alert"], .text-destructive')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Sign up now').click();
    await expect(page).toHaveURL(/\/register/);

    await page.getByText('Login now').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
