import { test, expect } from '@playwright/test';

<<<<<<< HEAD
test.describe('Login Page - UI / CSS Testing', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });


  // --------------------------------------------------
  // 1. Sign In button height
  // --------------------------------------------------
  test('Sign In button should have correct height', async ({ page }) => {

    const button = page.getByRole('button', {
      name: /sign in/i
    });

    await expect(button).toBeVisible();

    const box = await button.boundingBox();

    expect(box).not.toBeNull();

    // Normal button height should be 40-48px
    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeLessThanOrEqual(48);
  });


  // --------------------------------------------------
  // 2. Sign In button width
  // --------------------------------------------------
  test('Sign In button should have reasonable width', async ({ page }) => {

    const button = page.getByRole('button', {
      name: /sign in/i
    });

    const box = await button.boundingBox();

    expect(box).not.toBeNull();

    // Button should not be too small
    expect(box.width).toBeGreaterThanOrEqual(100);
  });


  // --------------------------------------------------
  // 3. Email input height
  // --------------------------------------------------
  test('Email input should have correct height', async ({ page }) => {

    const email = page.locator('#email');

    await expect(email).toBeVisible();

    const box = await email.boundingBox();

    expect(box).not.toBeNull();

    // Input should be comfortable to use
    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeLessThanOrEqual(52);
  });


  // --------------------------------------------------
  // 4. Password input height
  // --------------------------------------------------
  test('Password input should have correct height', async ({ page }) => {

    const password = page.locator('#password');

    await expect(password).toBeVisible();

    const box = await password.boundingBox();

    expect(box).not.toBeNull();

    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeLessThanOrEqual(52);
  });


  // --------------------------------------------------
  // 5. Email and password should have same width
  // --------------------------------------------------
  test('Email and password inputs should have same width', async ({ page }) => {

    const emailBox = await page
      .locator('#email')
      .boundingBox();

    const passwordBox = await page
      .locator('#password')
      .boundingBox();

    expect(emailBox).not.toBeNull();
    expect(passwordBox).not.toBeNull();

    expect(
      Math.abs(emailBox.width - passwordBox.width)
    ).toBeLessThanOrEqual(2);
  });


  // --------------------------------------------------
  // 6. Email and password should have same height
  // --------------------------------------------------
  test('Email and password inputs should have same height', async ({ page }) => {

    const emailBox = await page
      .locator('#email')
      .boundingBox();

    const passwordBox = await page
      .locator('#password')
      .boundingBox();

    expect(emailBox).not.toBeNull();
    expect(passwordBox).not.toBeNull();

    expect(
      Math.abs(emailBox.height - passwordBox.height)
    ).toBeLessThanOrEqual(2);
  });


  // --------------------------------------------------
  // 7. Sign In button should be inside viewport
  // --------------------------------------------------
  test('Sign In button should stay inside viewport', async ({ page }) => {

    const button = page.getByRole('button', {
      name: /sign in/i
    });

    const box = await button.boundingBox();

    expect(box).not.toBeNull();

    const viewport = page.viewportSize();

    expect(viewport).not.toBeNull();

    // Left side should not go outside screen
    expect(box.x).toBeGreaterThanOrEqual(0);

    // Top should not go outside screen
    expect(box.y).toBeGreaterThanOrEqual(0);

    // Right side should not go outside screen
    expect(
      box.x + box.width
    ).toBeLessThanOrEqual(viewport.width);

    // Bottom should not go outside screen
    expect(
      box.y + box.height
    ).toBeLessThanOrEqual(viewport.height);
  });


  // --------------------------------------------------
  // 8. Email and password should be aligned
  // --------------------------------------------------
  test('Email and password inputs should be left aligned', async ({ page }) => {

    const emailBox = await page
      .locator('#email')
      .boundingBox();

    const passwordBox = await page
      .locator('#password')
      .boundingBox();

    expect(emailBox).not.toBeNull();
    expect(passwordBox).not.toBeNull();

    expect(
      Math.abs(emailBox.x - passwordBox.x)
    ).toBeLessThanOrEqual(2);
  });


  // --------------------------------------------------
  // 9. Button should be horizontally aligned with inputs
  // --------------------------------------------------
  test('Sign In button should be aligned with form inputs', async ({ page }) => {

    const emailBox = await page
      .locator('#email')
      .boundingBox();

    const buttonBox = await page
      .getByRole('button', {
        name: /sign in/i
      })
      .boundingBox();

    expect(emailBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    // Their left edges should be approximately aligned
    expect(
      Math.abs(emailBox.x - buttonBox.x)
    ).toBeLessThanOrEqual(5);
  });


  // --------------------------------------------------
  // 10. Login page should not have horizontal overflow
  // --------------------------------------------------
  test('Login page should not have horizontal overflow', async ({ page }) => {

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth >
             document.documentElement.clientWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });


  // --------------------------------------------------
  // 11. Login page should not have vertical overflow
  // --------------------------------------------------
  test('Login page should not have unnecessary vertical overflow', async ({ page }) => {

    const hasVerticalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollHeight >
             document.documentElement.clientHeight;
    });

    // This is mainly useful for desktop viewport testing.
    expect(hasVerticalOverflow).toBe(false);
  });


  // --------------------------------------------------
  // 12. Visual regression screenshot
  // --------------------------------------------------
  test('Login page should match expected visual design', async ({ page }) => {

    await expect(page).toHaveScreenshot(
      'login-page.png',
      {
        fullPage: true,
        animations: 'disabled'
      }
    );
  });

});
test('Debug Login Page', async ({ page }) => {
  await page.goto('/login');

  console.log('URL:', page.url());
  console.log('TITLE:', await page.title());

  console.log(
    'Buttons:',
    await page.locator('button').allTextContents()
  );
=======
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

>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
});