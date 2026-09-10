import { test, expect } from '@playwright/test';

test.describe('Navigation Smoke Tests', () => {

  test('logo navigates to homepage', async ({ page }) => {
    await page.goto('/products');

    const logo = page.getByRole('link', {
      name: /Jwelles Fine Jewellery/i
    });

    await expect(logo).toBeVisible();

    await logo.click();

    await expect(page).toHaveURL(/\/$/);
  });


  test('login navigation works', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', {
      name: 'Login'
    });

    await expect(loginLink).toBeVisible();

    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });


  test('products navigation works', async ({ page }) => {
    await page.goto('/');

    const productsLink = page.getByRole('link', {
      name: /SHOP NOW/i
    });

    await expect(productsLink).toBeVisible();

    await productsLink.click();

    await expect(page).toHaveURL(/\/products/);
  });


  test('wishlist navigation works', async ({ page }) => {
    await page.goto('/');

    const wishlistLink = page.getByRole('link', {
      name: /Wishlist/i
    });

    await expect(wishlistLink).toBeVisible();

    await wishlistLink.click();

    await expect(page).toHaveURL(/\/wishlist/);
  });


  test('cart drawer opens from shopping bag button', async ({ page }) => {
    await page.goto('/');

    const cartButton = page.getByRole('button', {
      name: /Shopping bag/i
    });

    await expect(cartButton).toBeVisible();

    await cartButton.click();

    const cartDrawer = page.getByRole('complementary', {
      name: 'Shopping bag'
    });

    await expect(cartDrawer).toBeVisible();

    await expect(
      page.getByRole('heading', {
        name: /Your Bag \(0\)/i
      })
    ).toBeVisible();
  });


  test('back and forward navigation works', async ({ page }) => {
    await page.goto('/');

    await page.goto('/products');

    await expect(page).toHaveURL(/\/products/);

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);

    await page.goForward();

    await expect(page).toHaveURL(/\/products/);
  });


  test('refresh keeps the current page', async ({ page }) => {
    await page.goto('/products');

    await expect(page).toHaveURL(/\/products/);

    await page.reload();

    await expect(page).toHaveURL(/\/products/);

    await expect(
      page.getByRole('heading', {
        name: /Our Jewellery/i
      })
    ).toBeVisible();
  });

});