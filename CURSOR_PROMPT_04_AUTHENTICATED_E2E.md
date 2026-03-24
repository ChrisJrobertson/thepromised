# Cursor Prompt 04 — Minimal Authenticated E2E Suite

> **Scope:** Add a new Playwright test file covering the 5 critical authenticated paths. Also update `playwright.config.ts` with an auth setup project.
> **Run after:** `npx playwright test` to confirm all pass.

---

## Context

The current E2E suite only tests unauthenticated marketing pages. There are zero tests for logged-in flows — the core product. This prompt adds smoke tests for the 5 most important authenticated paths.

**Prerequisites:** A test user must exist in Supabase. Create `.env.test.local` (gitignored) with:
```
PLAYWRIGHT_TEST_EMAIL=smoke-test@theypromised.app
PLAYWRIGHT_TEST_PASSWORD=<a secure test password>
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

---

## Step 1: Create auth setup fixture

Create `tests/e2e/fixtures/auth.ts`:

```typescript
import { test as base, expect, type Page } from "@playwright/test";

type AuthFixtures = {
  authedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page }, use) => {
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

    await use(page);
  },
});

export { expect };
```

---

## Step 2: Create authenticated smoke tests

Create `tests/e2e/authenticated.test.ts`:

```typescript
import { test, expect } from "./fixtures/auth";

test.describe("Authenticated flows", () => {
  test("dashboard loads with user content", async ({ authedPage: page }) => {
    await expect(page).toHaveURL(/dashboard/);
    // Dashboard should show the main heading or welcome message
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toBeVisible();
    // Sidebar or nav should be visible
    await expect(page.getByRole("navigation").first()).toBeVisible();
  });

  test("can navigate to cases list", async ({ authedPage: page }) => {
    await page.goto("/cases");
    await expect(page).toHaveURL(/cases/);
    // Should show cases heading or empty state
    await expect(
      page.getByRole("heading", { name: /cases/i }).first()
    ).toBeVisible();
  });

  test("can open new case wizard", async ({ authedPage: page }) => {
    await page.goto("/cases/new");
    await expect(page).toHaveURL(/cases\/new/);
    // The case creation form should be visible
    await expect(
      page.getByRole("heading").first()
    ).toBeVisible();
  });

  test("settings pages load correctly", async ({ authedPage: page }) => {
    // Profile settings
    await page.goto("/settings/profile");
    await expect(page.getByLabel(/Full name/i).first()).toBeVisible();

    // Billing settings
    await page.goto("/settings/billing");
    await expect(page).toHaveURL(/settings\/billing/);
    await expect(page.getByText(/plan/i).first()).toBeVisible();

    // Notifications settings
    await page.goto("/settings/notifications");
    await expect(page).toHaveURL(/settings\/notifications/);
  });

  test("pricing page shows upgrade CTAs for logged-in user", async ({ authedPage: page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /Free/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Basic/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pro/i }).first()).toBeVisible();
  });
});
```

---

## Step 3: Update Playwright config for auth tests

The existing `playwright.config.ts` is fine as-is — the auth fixture handles login per-test. No global setup needed for this minimal suite. However, add a `.env.test.local` to `.gitignore` if not already there:

Check `.gitignore` for `.env*` — the existing pattern `*.env*` or `.env*` should already cover `.env.test.local`. If not, add:
```
.env.test.local
```

---

## Step 4: Create the test user in Supabase (manual)

Before running, ensure the test user exists:

1. Go to Supabase dashboard → Authentication → Users
2. Create user: `smoke-test@theypromised.app` with a known password
3. Confirm the email (or disable email confirmation for this user)
4. The auth trigger will auto-create a `profiles` row

Or use the Supabase CLI:
```bash
supabase auth admin create-user \
  --email smoke-test@theypromised.app \
  --password "<password>" \
  --email-confirm
```

---

## Verification

```bash
# Run just the authenticated tests
npx playwright test tests/e2e/authenticated.test.ts

# Run the full suite
npx playwright test
```

Expected: All authenticated tests pass when the test user credentials are configured.

**Note:** These tests require a running dev server with a real Supabase connection. They will not work in CI without Supabase test credentials configured as secrets.

---

## Future expansion (not in this prompt)

Once this baseline is green, the next E2E tests to add would be:
1. **Case lifecycle:** create case → log interaction → view timeline
2. **Letter generation:** navigate to letter wizard → select template → verify AI call triggers
3. **Stripe checkout:** click upgrade → verify redirect to Stripe (mock or test mode)
4. **Export:** trigger PDF export → verify download
5. **Admin access:** verify admin pages load for admin user, 403 for normal user
