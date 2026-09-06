import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {

  test('login page loads successfully', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    await expect(
      page.getByRole('button', { name: /sign in/i })
    ).toBeVisible();
  });

  test('shows validation errors when form is submitted empty', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Email is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill('invalid-email');
    await page.locator('#password').fill('somepassword');

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(
      page.getByText('Enter a valid email address.')
    ).toBeVisible();
  });

  test('register link navigates to register page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: 'Create one' }).click();

    await expect(page).toHaveURL(/\/register/);
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login');

    const password = page.locator('#password');

    await password.fill('TestPassword123');

    await expect(password).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Show password' }).click();

    await expect(password).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Hide password' }).click();

    await expect(password).toHaveAttribute('type', 'password');
  });

});