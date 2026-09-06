import { test, expect } from '@playwright/test';

test.describe('Product Details Page', () => {

  async function openFirstProduct(page) {
    await page.goto('/products');

    const firstProduct = page
      .locator('.product-grid article a[href^="/products/"]')
      .first();

    await expect(firstProduct).toBeVisible();

    await firstProduct.click();

    await expect(page).toHaveURL(/\/products\/\d+$/);
  }


  test('product details page opens successfully', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    await expect(
      main.getByRole('heading', { level: 1 })
    ).toBeVisible();
  });


  test('product information is displayed', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    await expect(
      main.getByRole('heading', { level: 1 })
    ).toBeVisible();

    await expect(
      main.locator('.price-current')
    ).toBeVisible();

    await expect(
      main.locator('.price-original')
    ).toBeVisible();

    await expect(
      main.getByText(/% off/i)
    ).toBeVisible();

    await expect(
      main.getByText(/In Stock/i)
    ).toBeVisible();

    await expect(
      main.getByText(/SKU:/i)
    ).toBeVisible();
  });


  test('quantity controls are visible', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    await expect(
      main.getByRole('button', {
        name: 'Decrease quantity',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('button', {
        name: 'Increase quantity',
        exact: true
      })
    ).toBeVisible();
  });


  test('quantity can be increased and decreased', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    const increaseButton = main.getByRole('button', {
      name: 'Increase quantity',
      exact: true
    });

    const decreaseButton = main.getByRole('button', {
      name: 'Decrease quantity',
      exact: true
    });

    await expect(increaseButton).toBeVisible();
    await expect(decreaseButton).toBeVisible();

    await increaseButton.click();

    await decreaseButton.click();
  });


  test('add to cart button is visible', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    await expect(
      main.getByRole('button', {
        name: /Add to Cart|Added/i
      })
    ).toBeVisible();
  });


  test('buy now button is visible', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    await expect(
      main.getByRole('button', {
        name: 'Buy Now',
        exact: true
      })
    ).toBeVisible();
  });


  test('wishlist button is visible', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    await expect(
      main.locator('.pd-wishlist-btn')
    ).toBeVisible();
  });


  test('product information accordions are visible', async ({ page }) => {
    await openFirstProduct(page);

    const main = page.locator('main');

    await expect(
      main.getByRole('button', {
        name: 'Description',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('button', {
        name: 'Specifications',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('button', {
        name: 'Material & Care',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('button', {
        name: 'Shipping',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('button', {
        name: 'Returns',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('button', {
        name: /Reviews/i
      })
    ).toBeVisible();
  });

});