import { expect, test } from "@playwright/test";

const shouldRunJourney = process.env.RUN_FULL_JOURNEY === "true";

test.describe("Full user journey", () => {
  test.skip(
    !shouldRunJourney,
    "Set RUN_FULL_JOURNEY=true and test env vars to run full journey."
  );

  test("register → create case → log interaction → open export", async ({ page }) => {
    const email = `test+${Date.now()}@theypromised.app`;
    const password = "JourneyTest123!";

    await page.goto("/register");
    await page.getByLabel("Full name").fill("Alex Thompson");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Create account" }).click();

    // In local/dev environments email verification may be bypassed or mocked.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("link", { name: /\+ New Case|Start New Case/i }).first().click();
    await expect(page).toHaveURL(/\/cases\/new/);

    await page.getByPlaceholder("Search organisation").fill("British Gas");
    await page.getByRole("button", { name: /British Gas/i }).first().click();
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.getByLabel("Case title *").fill(
      "Incorrect billing after smart meter installation"
    );
    await page.getByLabel("What happened? *").fill(
      "Meter readings have been incorrect for over a month."
    );
    await page.getByRole("button", { name: /Next/i }).click();
    await page.getByRole("button", { name: /Next/i }).click();
    await page.getByRole("button", { name: /Create Case/i }).click();

    await expect(page).toHaveURL(/\/cases\/.+/);
    await page.getByRole("button", { name: /Log Interaction/i }).first().click();

    await page.getByLabel("What happened? * (min. 20 characters)").fill(
      "Spoke to the billing team and they promised a response within 48 hours."
    );
    await page.getByRole("button", { name: /Log Interaction/i }).click();

    await expect(page.getByText(/Interaction logged/i)).toBeVisible();

    await page.goto(page.url().replace(/\?.*$/, "") + "/export");
    await expect(page).toHaveURL(/\/export/);
    await expect(page.getByText(/Choose export type/i)).toBeVisible();
  });
});
