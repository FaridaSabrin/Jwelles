import { test, expect } from '@playwright/test';

test.describe('Products Page', () => {

  test('products page loads successfully', async ({ page }) => {
    await page.goto('/products');

    await expect(page).toHaveURL(/\/products/);

    await expect(
      page.getByRole('heading', { name: /Our Jewellery/i })
    ).toBeVisible();
  });

  test('products are displayed', async ({ page }) => {
    await page.goto('/products');

    await expect(
      page.getByRole('heading', { name: /Our Jewellery/i })
    ).toBeVisible();

    const productCards = page.locator('.product-grid > *');

    await expect(productCards.first()).toBeVisible();
  });

  test('sort dropdown is visible', async ({ page }) => {
    await page.goto('/products');

    await expect(
      page.locator('.products-toolbar')
    ).toBeVisible();
  });

  test('filters button is visible', async ({ page }) => {
    await page.goto('/products');

    await expect(
      page.getByRole('button', { name: /filters/i })
    ).toBeVisible();
  });

  test('clear all filters works when filters are applied', async ({ page }) => {
    await page.goto('/products?search=gold');

    await expect(
      page.getByRole('heading', { name: /Results for "gold"/i })
    ).toBeVisible();

    const clearButton = page.locator('.active-chip-clear');

    await expect(clearButton).toBeVisible();

    await clearButton.click();

    await expect(page).toHaveURL(/\/products(?:\?.*|$)/);
  });

  test('clicking a product opens product details', async ({ page }) => {
    await page.goto('/products');

    const firstProductLink = page
      .locator('.product-grid article a[href^="/products/"]')
      .first();

    await expect(firstProductLink).toBeVisible();

    await firstProductLink.click();

    await expect(page).toHaveURL(/\/products\/\d+$/);
  });

});