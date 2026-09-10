import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {

  test('register page loads successfully', async ({ page }) => {
    await page.goto('/register');

    await expect(page).toHaveURL(/\/register/);

    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible();

    await expect(
      page.getByText(
        'Join Jwelles for a personalised jewellery journey.'
      )
    ).toBeVisible();
  });


  test('registration form fields are visible', async ({ page }) => {
    await page.goto('/register');

    const main = page.getByRole('main');

    await expect(
      main.getByRole('textbox', {
        name: 'First Name',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('textbox', {
        name: 'Last Name',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('textbox', {
        name: 'Email',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('textbox', {
        name: 'Password',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('textbox', {
        name: 'Confirm Password',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('checkbox', {
        name: /Terms & Conditions and Privacy Policy/i
      })
    ).toBeVisible();

    await expect(
      main.getByRole('button', {
        name: 'Create Account',
        exact: true
      })
    ).toBeVisible();
  });


  test('empty registration form shows validation errors', async ({ page }) => {
    await page.goto('/register');

    const main = page.getByRole('main');

    await main.getByRole('button', {
      name: 'Create Account',
      exact: true
    }).click();

    await expect(
      main.locator('text=/required|invalid/i').first()
    ).toBeVisible();
  });


  test('login link navigates to login page', async ({ page }) => {
    await page.goto('/register');

    const main = page.getByRole('main');

    const loginLink = main.getByRole('link', {
      name: 'Sign in',
      exact: true
    });

    await expect(loginLink).toBeVisible();

    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });


  test('password field is masked', async ({ page }) => {
    await page.goto('/register');

    const main = page.getByRole('main');

    const passwordField = main.getByRole('textbox', {
      name: 'Password',
      exact: true
    });

    await expect(passwordField).toBeVisible();

    await passwordField.fill('TestPassword123');

    await expect(passwordField).toHaveAttribute(
      'type',
      'password'
    );
  });


  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/register');

    const main = page.getByRole('main');

    const passwordField = main.getByRole('textbox', {
      name: 'Password',
      exact: true
    });

    await passwordField.fill('TestPassword123');

    await expect(passwordField).toHaveAttribute(
      'type',
      'password'
    );

    await main.getByRole('button', {
      name: 'Show password',
      exact: true
    }).click();

    await expect(passwordField).toHaveAttribute(
      'type',
      'text'
    );
  });


  test('terms and conditions checkbox can be selected', async ({ page }) => {
    await page.goto('/register');

    const main = page.getByRole('main');

    const termsCheckbox = main.getByRole('checkbox', {
      name: /Terms & Conditions and Privacy Policy/i
    });

    await expect(termsCheckbox).not.toBeChecked();

    await termsCheckbox.check();

    await expect(termsCheckbox).toBeChecked();
  });


  test('terms and privacy links are visible', async ({ page }) => {
    await page.goto('/register');

    const main = page.getByRole('main');

    await expect(
      main.getByRole('link', {
        name: 'Terms & Conditions',
        exact: true
      })
    ).toBeVisible();

    await expect(
      main.getByRole('link', {
        name: 'Privacy Policy',
        exact: true
      })
    ).toBeVisible();
  });

});