import { test as base, expect, type Page } from "@playwright/test";

type AuthFixtures = {
  authedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page }, provideAuthedPage) => {
    // Navigate to login
    await page.goto("/login");

    // Fill credentials
    await page.getByLabel(/Email/i).first().fill(
      process.env.PLAYWRIGHT_TEST_EMAIL ?? "smoke-test@theypromised.app"
    );
    await page.getByLabel(/Password/i).first().fill(
      process.env.PLAYWRIGHT_TEST_PASSWORD ?? ""
    );

    // Submit
    await page.getByRole("button", { name: /Log in/i }).click();

    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 15_000 });

    await provideAuthedPage(page);
  },
});

export { expect };
