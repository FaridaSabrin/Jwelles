import { test, expect } from '@playwright/test';

test.describe('Wishlist Collections', () => {

  test('wishlist page shows collection controls when available', async ({ page }) => {
    await page.goto('/wishlist');

    const main = page.locator('main');

    await expect(main).toBeVisible();

    const collectionControl = main.getByRole('button', {
      name: /collection|create new collection|manage collection/i
    }).first();

    await expect(collectionControl).toBeVisible();
  });


  test('create new collection control can be opened', async ({ page }) => {
    await page.goto('/wishlist');

    const main = page.locator('main');

    const createButton = main.getByRole('button', {
      name: /create new collection/i
    });

    await expect(createButton).toBeVisible();

    await createButton.click();

    await expect(
      page.getByRole('textbox').filter({
        has: undefined
      }).first()
    ).toBeVisible();
  });


  test('collection form contains collection name field', async ({ page }) => {
    await page.goto('/wishlist');

    const main = page.locator('main');

    const createButton = main.getByRole('button', {
      name: /create new collection/i
    });

    await expect(createButton).toBeVisible();

    await createButton.click();

    await expect(
      page.getByRole('textbox', {
        name: /collection name|name/i
      }).first()
    ).toBeVisible();
  });


  test('collection form supports public or private visibility', async ({ page }) => {
    await page.goto('/wishlist');

    const main = page.locator('main');

    const createButton = main.getByRole('button', {
      name: /create new collection/i
    });

    await expect(createButton).toBeVisible();

    await createButton.click();

    const visibilityControl = page.getByText(
      /public|private/i
    ).first();

    await expect(visibilityControl).toBeVisible();
  });


  test('collection form can be cancelled or closed', async ({ page }) => {
    await page.goto('/wishlist');

    const main = page.locator('main');

    const createButton = main.getByRole('button', {
      name: /create new collection/i
    });

    await expect(createButton).toBeVisible();

    await createButton.click();

    const closeButton = page.getByRole('button', {
      name: /close|cancel/i
    }).first();

    await expect(closeButton).toBeVisible();

    await closeButton.click();
  });

});