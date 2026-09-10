import { test, expect } from '@playwright/test';

test('Jwelles homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Jwelles/i);

  await expect(page.locator('body')).toBeVisible();
});