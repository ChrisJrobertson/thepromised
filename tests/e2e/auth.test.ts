import { expect, test } from "@playwright/test";

test.describe("Auth flow", () => {
  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /Create your account/i })
    ).toBeVisible();
    await expect(page.getByLabel(/Full name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i).first()).toBeVisible();
    await expect(page.getByLabel(/Password/i).first()).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /Create account/i }).click();
    // Expect at least one validation error to appear
    await expect(page.getByText(/required|must be/i).first()).toBeVisible();
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });
});
