
import { test, expect } from '@playwright/test';

test.describe('Cart Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
  });


  // =========================================================
  // 1. PAGE LOAD
  // =========================================================
  test('cart page loads successfully', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible().catch(() => {});

    await expect(
      page.getByRole('heading', {
        name: /Your Shopping Bag/i
      })
    ).toBeVisible();
  });


  // =========================================================
  // 2. URL
  // =========================================================
  test('cart page has correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/cart/);
  });


  // =========================================================
  // 3. TITLE
  // =========================================================
  test('cart page has a valid title', async ({ page }) => {
    const title = await page.title();

    expect(title.trim().length).toBeGreaterThan(0);
    expect(title).toMatch(/Jwelles/i);
  });


  // =========================================================
  // 4. IMPORTANT LINKS
  // =========================================================
  test('important cart links are available', async ({ page }) => {
    const checkoutLink = page.getByRole('link', {
      name: /Proceed to Checkout/i
    });

    const continueShopping = page.getByRole('link', {
      name: /Continue Shopping/i
    });

    // These are available when cart contains products.
    // Empty cart has Continue Shopping instead.
    const emptyState = page.getByText(/Your bag is empty/i);

    if (await emptyState.isVisible().catch(() => false)) {
      await expect(
        page.getByRole('link', {
          name: /Continue Shopping/i
        })
      ).toBeVisible();
    } else {
      await expect(checkoutLink).toBeVisible();
      await expect(continueShopping).toBeVisible();
    }
  });


  // =========================================================
  // 5. PRODUCT LINKS
  // =========================================================
  test('cart product links point to product details', async ({ page }) => {
    const productLinks = page.locator(
      '.cart-row a[href^="/products/"]'
    );

    const count = await productLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const href = await productLinks.nth(i).getAttribute('href');

        expect(href).toMatch(/^\/products\/\d+/);
      }
    }
  });


  // =========================================================
  // 6. BUTTONS
  // =========================================================
  test('cart quantity and remove buttons are usable when cart has items', async ({ page }) => {
    const cartRows = page.locator('.cart-row');

    if (await cartRows.count() > 0) {

      await expect(
        page.getByRole('button', {
          name: 'Decrease quantity'
        }).first()
      ).toBeVisible();

      await expect(
        page.getByRole('button', {
          name: 'Increase quantity'
        }).first()
      ).toBeVisible();

      await expect(
        page.getByRole('button', {
          name: /Remove/i
        }).first()
      ).toBeVisible();
    }
  });


  // =========================================================
  // 7. QUANTITY DISPLAY
  // =========================================================
  test('cart quantity control displays a valid quantity', async ({ page }) => {
    const quantityControls = page.locator('.cart-drawer-qty');

    const count = await quantityControls.count();

    if (count > 0) {
      const quantityText = await quantityControls.first().locator('span').innerText();

      const quantity = Number(quantityText.trim());

      expect(Number.isInteger(quantity)).toBe(true);
      expect(quantity).toBeGreaterThanOrEqual(1);
    }
  });


  // =========================================================
  // 8. QUANTITY INCREASE
  // =========================================================
  test('increase quantity button works', async ({ page }) => {
    const rows = page.locator('.cart-row');

    if (await rows.count() === 0) {
      test.skip();
    }

    const row = rows.first();

    const quantity = row.locator('.cart-drawer-qty span');
    const increaseButton = row.getByRole('button', {
      name: 'Increase quantity'
    });

    const before = Number(await quantity.innerText());

    if (await increaseButton.isEnabled()) {
      await increaseButton.click();

      await expect(quantity).toHaveText(String(before + 1));
    }
  });


  // =========================================================
  // 9. QUANTITY DECREASE
  // =========================================================
  test('decrease quantity button works when quantity is greater than one', async ({ page }) => {
    const rows = page.locator('.cart-row');

    if (await rows.count() === 0) {
      test.skip();
    }

    const row = rows.first();

    const quantity = row.locator('.cart-drawer-qty span');
    const increaseButton = row.getByRole('button', {
      name: 'Increase quantity'
    });
    const decreaseButton = row.getByRole('button', {
      name: 'Decrease quantity'
    });

    const before = Number(await quantity.innerText());

    // Try to increase first so decrease can be tested safely.
    if (await increaseButton.isEnabled()) {
      await increaseButton.click();

      await expect(quantity).toHaveText(String(before + 1));

      await decreaseButton.click();

      await expect(quantity).toHaveText(String(before));
    } else if (before === 1) {
      await expect(decreaseButton).toBeDisabled();
    }
  });


  // =========================================================
  // 10. REMOVE BUTTON
  // =========================================================
  test('remove button removes a cart item', async ({ page }) => {
    const rows = page.locator('.cart-row');

    const countBefore = await rows.count();

    if (countBefore === 0) {
      test.skip();
    }

    await rows.first().getByRole('button', {
      name: /Remove/i
    }).click();

    await expect
      .poll(async () => await page.locator('.cart-row').count())
      .toBeLessThan(countBefore);
  });


  // =========================================================
  // 11. ORDER SUMMARY
  // =========================================================
  test('order summary is displayed when cart has items', async ({ page }) => {
    const summary = page.locator('.cart-summary');

    if (await page.locator('.cart-row').count() > 0) {
      await expect(summary).toBeVisible();

      await expect(
        summary.getByRole('heading', {
          name: /Order Summary/i
        })
      ).toBeVisible();

      await expect(
        summary.getByText(/Subtotal/i)
      ).toBeVisible();

      await expect(
        summary.getByText(/Shipping/i)
      ).toBeVisible();

      await expect(
        summary.getByText(/Estimated Total/i)
      ).toBeVisible();
    }
  });


  // =========================================================
  // 12. SHIPPING
  // =========================================================
  test('shipping information is displayed correctly', async ({ page }) => {
    const summary = page.locator('.cart-summary');

    if (await page.locator('.cart-row').count() > 0) {
      const shippingRow = summary
        .locator('.cart-summary-row')
        .filter({ hasText: 'Shipping' });

      await expect(shippingRow).toBeVisible();

      const shippingText = await shippingRow.innerText();

      expect(shippingText).toMatch(/Shipping|Free|₹|Rs/i);
    }
  });


  // =========================================================
  // 13. IMAGES
  // =========================================================
  test('cart product images load correctly', async ({ page }) => {
    const images = page.locator('.cart-row-image img');

    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);

      await expect(image).toBeVisible();

      const naturalWidth = await image.evaluate(
        img => img.naturalWidth
      );

      expect(naturalWidth).toBeGreaterThan(0);
    }
  });


  // =========================================================
  // 14. NO HORIZONTAL OVERFLOW
  // =========================================================
  test('cart page should not have horizontal overflow', async ({ page }) => {
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth >
        document.documentElement.clientWidth;
    });

    expect(overflow).toBe(false);
  });


  // =========================================================
  // 15. NO UNEXPECTED OUTSIDE-VIEWPORT ELEMENTS
  // =========================================================
  test('important cart elements should remain inside viewport', async ({ page }) => {
    const viewport = page.viewportSize();

    expect(viewport).not.toBeNull();

    const elements = [
      page.getByRole('heading', {
        name: /Your Shopping Bag/i
      }),
      page.getByRole('heading', {
        name: /Order Summary/i
      })
    ];

    for (const element of elements) {
      if (await element.isVisible().catch(() => false)) {
        const box = await element.boundingBox();

        expect(box).not.toBeNull();

        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });


  // =========================================================
  // 16. KEYBOARD NAVIGATION
  // =========================================================
  test('cart interactive elements can receive keyboard focus', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');

    await expect(focused).toBeVisible();
  });


  // =========================================================
  // 17. ACCESSIBILITY BASICS
  // =========================================================
  test('cart product images have alternative text', async ({ page }) => {
    const images = page.locator('.cart-row-image img');

    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');

      expect(alt).not.toBeNull();
      expect(alt.trim().length).toBeGreaterThan(0);
    }
  });


  // =========================================================
  // 18. EMPTY CART STATE
  // =========================================================
  test('empty cart state contains shopping action when cart is empty', async ({ page }) => {
    const emptyState = page.getByText(/Your bag is empty/i);

    if (await emptyState.isVisible().catch(() => false)) {
      await expect(
        page.getByText(
          /Looks like you haven't added anything yet/i
        )
      ).toBeVisible();

      await expect(
        page.getByRole('link', {
          name: /Continue Shopping/i
        })
      ).toBeVisible();
    }
  });


  // =========================================================
  // 19. REFRESH / BACK / FORWARD
  // =========================================================
  test('cart page remains available after refresh', async ({ page }) => {
    await page.reload();

    await expect(page).toHaveURL(/\/cart/);

    await expect(
      page.getByRole('heading', {
        name: /Your Shopping Bag/i
      })
    ).toBeVisible();
  });


  test('back and forward navigation works from cart', async ({ page }) => {
    await page.goto('/products');

    await page.goto('/cart');

    await expect(page).toHaveURL(/\/cart/);

    await page.goBack();

    await expect(page).toHaveURL(/\/products/);

    await page.goForward();

    await expect(page).toHaveURL(/\/cart/);
  });


  // =========================================================
  // 20. VISUAL REGRESSION
  // =========================================================
  test('cart page should match expected visual design', async ({ page }) => {
    await expect(page).toHaveScreenshot(
      'cart-page.png',
      {
        fullPage: true,
        animations: 'disabled'
      }
    );
  });


  // =========================================================
  // CART-SPECIFIC: CHECKOUT NAVIGATION
  // =========================================================
  test('proceed to checkout navigates correctly', async ({ page }) => {
    const checkout = page.getByRole('link', {
      name: /Proceed to Checkout/i
    });

    if (await checkout.isVisible().catch(() => false)) {
      await checkout.click();

      await expect(page).toHaveURL(/\/checkout/);
    }
  });


  // =========================================================
  // CART-SPECIFIC: CONTINUE SHOPPING
  // =========================================================
  test('continue shopping navigates to products', async ({ page }) => {
    const continueShopping = page.getByRole('link', {
      name: /Continue Shopping/i
    });

    if (await continueShopping.isVisible().catch(() => false)) {
      await continueShopping.click();

      await expect(page).toHaveURL(/\/products/);
    }
  });


  // =========================================================
  // CART-SPECIFIC: PRODUCT NAVIGATION
  // =========================================================
  test('clicking a cart product opens product details', async ({ page }) => {
    const productLink = page.locator(
      '.cart-row-name[href^="/products/"]'
    ).first();

    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      await expect(page).toHaveURL(/\/products\/\d+$/);
    }
  });

});
