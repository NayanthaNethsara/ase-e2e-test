import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.saucedemo.com/v1/index.html";
const USERNAME = "locked_out_user";
const PASSWORD = process.env.SAUCE_PASSWORD || "secret_sauce";

test.describe("Locked Out User - Should NOT Be Able to Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("should show locked out error on login attempt", async ({ page }) => {
    await page.locator("#user-name").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#login-button").click();

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText("this user has been locked out");
  });

  test("should remain on login page after error", async ({ page }) => {
    await page.locator("#user-name").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#login-button").click();

    // Should still be on login page
    await expect(page).toHaveURL(BASE_URL);
    await expect(page.locator(".login_logo")).toBeVisible();
  });

  test("should display error button to clear message", async ({ page }) => {
    await page.locator("#user-name").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#login-button").click();

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();

    // Click the error close button
    await page.locator(".error-button").click();
    await expect(errorMsg).not.toBeVisible();
  });

  test("should not access inventory page directly", async ({ page }) => {
    // Try to access inventory page without logging in
    await page.goto("https://www.saucedemo.com/v1/inventory.html");

    // Should redirect to login
    await expect(page).toHaveURL(BASE_URL);
    await expect(page.locator(".login_logo")).toBeVisible();
  });
});
