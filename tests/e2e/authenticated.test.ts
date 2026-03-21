import { test, expect } from "./fixtures/auth";

// Skip entire file when credentials are not configured (local/CI without Supabase test user).
test.skip(
  !process.env.PLAYWRIGHT_TEST_PASSWORD,
  "Set PLAYWRIGHT_TEST_PASSWORD in .env.test.local (see .env.test.local.example)"
);

test.describe("Authenticated flows", () => {
  test("dashboard loads with user content", async ({ authedPage: page }) => {
    await expect(page).toHaveURL(/dashboard/);
    // Dashboard welcome uses CardTitle (div), not an h1 — assert visible copy instead
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    await expect(page.getByRole("navigation").first()).toBeVisible();
  });

  test("can navigate to cases list", async ({ authedPage: page }) => {
    await page.goto("/cases");
    await expect(page).toHaveURL(/cases/);
    await expect(
      page.getByRole("heading", { name: /My Cases/i }).first()
    ).toBeVisible();
  });

  test("can open new case wizard", async ({ authedPage: page }) => {
    await page.goto("/cases/new");
    await expect(page).toHaveURL(/cases\/new/);
    await expect(
      page.getByRole("heading", { name: /What happened/i })
    ).toBeVisible();
  });

  test("settings pages load correctly", async ({ authedPage: page }) => {
    await page.goto("/settings/profile");
    await expect(page.getByLabel(/Full name/i).first()).toBeVisible();

    await page.goto("/settings/billing");
    await expect(page).toHaveURL(/settings\/billing/);
    await expect(page.getByText(/plan/i).first()).toBeVisible();

    await page.goto("/settings/notifications");
    await expect(page).toHaveURL(/settings\/notifications/);
    await expect(page.getByRole("heading", { name: /Notifications/i })).toBeVisible();
  });

  test("pricing page shows upgrade CTAs for logged-in user", async ({ authedPage: page }) => {
    await page.goto("/pricing");
    // Plan names are column headers in the comparison table, not page headings
    await expect(page.getByRole("columnheader", { name: /^Free$/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /^Basic$/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /^Pro$/i })).toBeVisible();
  });
});
