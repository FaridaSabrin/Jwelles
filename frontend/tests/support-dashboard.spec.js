// frontend/tests/support-dashboard.spec.js
import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL || "http://localhost:5173";

// Replace these with your project's existing test fixture helpers if you
// already have a shared auth util. These emails are created by your
// backend test fixtures — do not invent credentials in prod code.
const SUPPORT_EMAIL = process.env.E2E_SUPPORT_EMAIL || "support@example.com";
const SUPPORT_PASS = process.env.E2E_SUPPORT_PASS || "testpass1234";
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL || "customer@example.com";
const CUSTOMER_PASS = process.env.E2E_CUSTOMER_PASS || "testpass1234";

async function loginAs(page, email, password) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /log ?in|sign ?in/i }).click();
  await page.waitForLoadState("networkidle");
}

test.describe("Support Dashboard authorization", () => {
  test("Test 1 — anonymous is sent to /login", async ({ page }) => {
    await page.goto(`${BASE}/support-dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });

  test("Test 2 — normal customer lands on /unauthorized", async ({ page }) => {
    await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASS);
    await page.goto(`${BASE}/support-dashboard`);
    await expect(page).toHaveURL(/\/unauthorized/);
  });

  test("Test 3 — Support Staff sees Support Dashboard", async ({ page }) => {
    await loginAs(page, SUPPORT_EMAIL, SUPPORT_PASS);
    await page.goto(`${BASE}/support-dashboard`);
    await expect(page).toHaveURL(/\/support-dashboard/);
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();
  });

  test("Test 4 — Support Staff sees Tickets page", async ({ page }) => {
    await loginAs(page, SUPPORT_EMAIL, SUPPORT_PASS);
    await page.goto(`${BASE}/support-dashboard/tickets`);
    await expect(
      page.getByRole("heading", { name: /tickets/i })
    ).toBeVisible();
  });

  test("Test 5 — Support Staff sees Ticket detail", async ({ page }) => {
    await loginAs(page, SUPPORT_EMAIL, SUPPORT_PASS);
    await page.goto(`${BASE}/support-dashboard/tickets`);
    const firstView = page.locator(".sd-view-btn").first();
    if (await firstView.count()) {
      await firstView.click();
      await expect(page).toHaveURL(/\/support-dashboard\/tickets\/.+/);
      await expect(page.locator(".sd-detail")).toBeVisible();
    } else {
      test.skip(true, "No tickets in test DB to open.");
    }
  });

  test("Test 6 — Support Staff refresh stays in Support Dashboard", async ({ page }) => {
    await loginAs(page, SUPPORT_EMAIL, SUPPORT_PASS);
    await page.goto(`${BASE}/support-dashboard`);
    await page.reload();
    await expect(page).toHaveURL(/\/support-dashboard/);
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();
  });

  test("Test 7 — Customer is denied on /support-dashboard/tickets", async ({ page }) => {
    await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASS);
    await page.goto(`${BASE}/support-dashboard/tickets`);
    await expect(page).toHaveURL(/\/unauthorized/);
  });
});