# Cursor Prompt 02 — Fix Playwright E2E Selectors (3 failures → 0)

> **Scope:** Update 2 E2E test files to match current page markup. NO changes to production code.
> **Run after:** `npx playwright test` to confirm all green.

---

## Problem

Playwright strict mode rejects locators that match multiple elements. The current tests use vague text matchers that hit multiple nodes on the rendered page.

---

## Fix 1: `tests/e2e/marketing.test.ts`

### Failure: "They Promised" matches multiple elements
The heading is actually two lines: "They Promised." and "You Proved It." — and the text "They Promised" also appears in the nav/logo. Use a more specific selector.

```typescript
// BEFORE
await expect(
  page.getByRole("heading", { name: /They Promised/i })
).toBeVisible();

// AFTER
await expect(
  page.getByRole("heading", { name: /They Promised\.\s*You Proved It\./i }).first()
).toBeVisible();
```

### Failure: CTA text doesn't match
The main CTA says "Start Your Case — Free", not "Start Tracking Free". The "Start Tracking Free" text exists lower on the page as a secondary link. Fix:

```typescript
// BEFORE
await expect(page.getByRole("link", { name: /Start Tracking Free/i })).toBeVisible();

// AFTER
await expect(page.getByRole("link", { name: /Start Your Case/i }).first()).toBeVisible();
```

### Failure: "Free" / "Basic" / "Pro" / "Energy" match multiple elements
The pricing page and escalation guides contain these words in multiple contexts (headings, badges, body text). Use `.first()` or tighter selectors:

```typescript
// BEFORE (pricing)
await expect(page.getByText("Free")).toBeVisible();
await expect(page.getByText("Basic")).toBeVisible();
await expect(page.getByText("Pro")).toBeVisible();

// AFTER (pricing) — target the plan heading specifically
await expect(page.getByRole("heading", { name: /Free/i }).first()).toBeVisible();
await expect(page.getByRole("heading", { name: /Basic/i }).first()).toBeVisible();
await expect(page.getByRole("heading", { name: /Pro/i }).first()).toBeVisible();
```

```typescript
// BEFORE (escalation guides)
await expect(page.getByText("Energy")).toBeVisible();
await expect(page.getByText("Financial Services")).toBeVisible();

// AFTER — use .first() to handle multiple matches
await expect(page.getByText("Energy").first()).toBeVisible();
await expect(page.getByText("Financial Services").first()).toBeVisible();
```

### Full corrected file: `tests/e2e/marketing.test.ts`

```typescript
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
    await expect(page.getByRole("heading", { name: /Free/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Basic/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pro/i }).first()).toBeVisible();
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
```

---

## Fix 2: `tests/e2e/auth.test.ts`

### Failure: "Sign in" doesn't exist — login heading is "Log in to your account"
The `LoginClient.tsx` renders via `<AuthShell title="Log in to your account">`, so the heading text is "Log in to your account", not "Sign in".

### Full corrected file: `tests/e2e/auth.test.ts`

```typescript
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
    await expect(
      page.getByRole("heading", { name: /Log in to your account/i })
    ).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page.getByText(/required|must be/i).first()).toBeVisible();
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });
});
```

---

## Verification

```bash
npx playwright test
```

Expected: **All 13 tests pass (9 marketing + 4 auth).**

Do NOT modify any file in `src/`. Only test files change.
