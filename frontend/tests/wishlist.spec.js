import { test, expect } from '@playwright/test';

test.describe('Wishlist Page', () => {

  test('wishlist page loads successfully', async ({ page }) => {
    await page.goto('/wishlist');

    await expect(page).toHaveURL(/\/wishlist/);

    await expect(page.locator('main')).toBeVisible();
  });


  test('wishlist page has expected content', async ({ page }) => {
    await page.goto('/wishlist');

    const main = page.locator('main');

    await expect(
      main.getByRole('heading', { level: 1 })
    ).toBeVisible();
  });


  test('wishlist navigation from navbar works', async ({ page }) => {
    await page.goto('/');

    const wishlistLink = page.getByRole('link', {
      name: /Wishlist/i
    });

    await expect(wishlistLink).toBeVisible();

    await wishlistLink.click();

    await expect(page).toHaveURL(/\/wishlist/);

    await expect(page.locator('main')).toBeVisible();
  });


  test('wishlist page does not show a blank screen', async ({ page }) => {
    await page.goto('/wishlist');

    const main = page.locator('main');

    await expect(main).toBeVisible();

    // Verify that the main area actually contains rendered content.
    await expect(main.locator('h1, h2, h3, p, button, a').first()).toBeVisible();
  });


  test('wishlist page remains available after refresh', async ({ page }) => {
    await page.goto('/wishlist');

    await expect(page).toHaveURL(/\/wishlist/);

    await page.reload();

    await expect(page).toHaveURL(/\/wishlist/);

    await expect(page.locator('main')).toBeVisible();
  });

});