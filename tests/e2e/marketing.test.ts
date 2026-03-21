import { expect, test } from "@playwright/test";

test.describe("Marketing pages", () => {
  test("landing page loads and has correct heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /They Promised\.\s*You Proved It\./i }).first()
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Start Your Case/i }).first()).toBeVisible();
  });

  test("pricing page loads with all 3 plans", async ({ page }) => {
    await page.goto("/pricing");
    // Plan names live in card labels and the feature-comparison table `<th>`s (not `<h*>` headings).
    await expect(page.getByRole("columnheader", { name: /^Free$/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /^Basic$/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /^Pro$/i })).toBeVisible();
  });

  test("how it works page loads", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(
      page.getByRole("heading", { name: /How TheyPromised Works/i })
    ).toBeVisible();
  });

  test("escalation guides hub loads", async ({ page }) => {
    await page.goto("/escalation-guides");
    await expect(
      page.getByRole("heading", { name: /UK Escalation Guides/i })
    ).toBeVisible();
    await expect(page.getByText("Energy").first()).toBeVisible();
    await expect(page.getByText("Financial Services").first()).toBeVisible();
  });

  test("energy escalation guide loads", async ({ page }) => {
    await page.goto("/escalation-guides/energy");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /Built for people/i })
    ).toBeVisible();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: /Privacy Policy/i })
    ).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: /Terms of Service/i })
    ).toBeVisible();
  });

  test("login page redirects unauthenticated users from dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
