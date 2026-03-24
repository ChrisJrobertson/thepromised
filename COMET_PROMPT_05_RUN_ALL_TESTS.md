# COMET PROMPT 05 — Run All Tests, Fix Failures, Verify Remaining Issues

> **Purpose:** Execute the full test suite (Vitest + Playwright marketing/auth), fix any remaining failures, then verify that the 4 security/logic fixes from Prompt 03 are correctly applied. Finally, flag 1 remaining logic bug for manual fix.
>
> **This is an EXECUTION prompt — you WILL modify test files if they fail, but you will NOT modify production code.** The only exception is the `invoice.paid` guard in Section 5, which is a targeted one-line production fix.

---

## SECTION 1: Vitest — Run and Fix

### Step 1a: Run the full unit test suite

```bash
npm run test
```

**Expected:** All tests pass. The suite includes 5 test files in `src/test/unit/`:

| File | Tests | What it covers |
|------|-------|----------------|
| `date.test.ts` | 4 | UK date formatting (DD/MM/YYYY) |
| `escalation-rules.test.ts` | 6 | Seed data structure, categories, regulatory URLs |
| `feature-gates.test.ts` | ~14 | canCreateCase, canExportPDF, canUseAI, canRecordVoiceMemo, canUseEmailForward, canViewAISuggestions |
| `letter-templates.test.ts` | ~10 | 11 template types, required fields, legal references |
| `validation.test.ts` | ~12 | Zod schemas for cases and interactions, category/priority/channel constants |

**If any test fails:**

1. Read the failing test AND the corresponding source file it imports.
2. Determine whether the failure is:
   - **(a) Test drift** — the test expectation is outdated vs the current implementation. → Fix the test.
   - **(b) Real bug** — the implementation has a genuine defect. → Document it but do NOT fix production code (except the `invoice.paid` issue in Section 5).
3. Re-run `npm run test` after each fix until all pass.

### Step 1b: Check for duplicate test files

The Vitest config (`vitest.config.ts`) only includes `src/test/**/*.test.ts`. There are also test files at:
- `src/lib/stripe/feature-gates.test.ts`
- `src/lib/ai/escalation-rules.test.ts`
- `src/lib/date.test.ts`
- `src/lib/validation/auth.test.ts`

These are NOT run by `npm run test` because they're outside the `src/test/` directory. Check whether they're stale duplicates of the `src/test/unit/` versions:

```bash
diff src/lib/stripe/feature-gates.test.ts src/test/unit/feature-gates.test.ts 2>/dev/null || echo "Files differ or one is missing"
diff src/lib/ai/escalation-rules.test.ts src/test/unit/escalation-rules.test.ts 2>/dev/null || echo "Files differ"
diff src/lib/date.test.ts src/test/unit/date.test.ts 2>/dev/null || echo "Files differ"
```

If they're older/incomplete duplicates, **delete the stale copies** in `src/lib/` to avoid confusion. The canonical tests live in `src/test/unit/`.

---

## SECTION 2: Playwright — Marketing & Auth E2E

### Step 2a: Run marketing and auth tests

```bash
npx playwright test tests/e2e/marketing.test.ts tests/e2e/auth.test.ts --project=chromium
```

**Expected:** All pass. These tests hit unauthenticated pages only and don't need Supabase credentials.

**If any test fails:**

1. Take a screenshot of the failure: `npx playwright test --project=chromium --reporter=html`
2. Read the failing test selector and compare it to the actual page source.
3. Fix the selector — use `.first()` for ambiguous matches, or tighten with `getByRole('heading', { name: /exact text/i })`.
4. Re-run until green.

### Step 2b: Check the authenticated test file exists but skip execution

```bash
cat tests/e2e/authenticated.test.ts
```

This file requires `PLAYWRIGHT_TEST_EMAIL` and `PLAYWRIGHT_TEST_PASSWORD` in `.env.test.local`. If those aren't set, these tests will fail at login. **Do not run them** — just confirm the file exists and the fixture at `tests/e2e/fixtures/auth.ts` is present.

---

## SECTION 3: TypeScript Compilation Check

```bash
npx tsc --noEmit 2>&1 | head -50
```

**Known behaviour:** This may fail because `tsconfig.json` includes `.next/types/**/*.ts` which can be missing after a clean. If it fails:

1. Check if the error is ONLY about `.next/types` files. If so, this is a config artefact, not a real type error.
2. Run `npm run build` instead — Next.js runs its own type check during build, which handles the `.next/types` correctly.

```bash
npm run build 2>&1 | tail -20
```

**Expected:** Build succeeds with zero errors.

---

## SECTION 4: Lint Check

```bash
npm run lint
```

**Expected:** Zero errors, zero warnings.

If there are lint errors in test files you modified, fix them (typically: missing imports, unused variables, trailing whitespace).

---

## SECTION 5: Verify Security/Logic Fixes (Read-Only Checks)

Run these grep checks to confirm all 4 fixes from Prompt 03 are correctly applied:

### 5a: changeEmail redirect — must use `/callback`, NOT `/auth/callback`

```bash
grep -rn "/auth/callback" src/
```

**Expected:** Zero matches. If any remain, the fix wasn't applied — update `src/lib/actions/settings.ts` to use `/callback`.

### 5b: Resend webhook — must reject when secret is missing

```bash
grep -n "if (!secret)" src/app/api/webhooks/resend/route.ts
```

**Expected:** Line ~15 shows `if (!secret)` with a `return new Response("Webhook secret not configured", { status: 500 })` on the next line.

### 5c: Inbound email webhook — must reject when secret is missing

```bash
grep -n "if (!secret)" src/app/api/webhooks/inbound-email/route.ts
```

**Expected:** Line ~25 shows the same pattern.

### 5d: Stripe status normalisation — must convert "canceled" to "cancelled"

```bash
grep -n "rawStatus" src/app/api/webhooks/stripe/route.ts
```

**Expected:** Shows `rawStatus === "canceled" ? "cancelled"` pattern.

---

## SECTION 6: Fix Remaining Logic Bug — `invoice.paid` Overwrites `pack_temporary`

**File:** `src/app/api/webhooks/stripe/route.ts`, the `invoice.paid` case handler (around line 444).

**Problem:** The handler blindly sets `subscription_status: "active"` for ALL profiles matching the customer ID. If a user is currently on `pack_temporary` status (they bought a one-off complaint pack and got 7-day Pro access), this overwrites their status to `active` — which breaks the pack expiry logic. When the 7 days expire, the system checks for `pack_temporary` to revert them to free, but finds `active` instead and does nothing.

**Current code (line ~444-455):**
```typescript
const { error: invoicePaidUpdateError } = await supabase
  .from("profiles")
  .update({
    subscription_status: "active",
    ...(shouldReset
      ? {
          ai_credits_used: 0,
          ai_credits_reset_at: addMonths(now, 1).toISOString(),
        }
      : {}),
  })
  .eq("stripe_customer_id", customerId);
```

**Fix:** Add a filter to exclude `pack_temporary` users from this update:

```typescript
const { error: invoicePaidUpdateError } = await supabase
  .from("profiles")
  .update({
    subscription_status: "active",
    ...(shouldReset
      ? {
          ai_credits_used: 0,
          ai_credits_reset_at: addMonths(now, 1).toISOString(),
        }
      : {}),
  })
  .eq("stripe_customer_id", customerId)
  .neq("subscription_status", "pack_temporary");
```

The single added line `.neq("subscription_status", "pack_temporary")` ensures pack users are left untouched by subscription renewal events that don't belong to them.

---

## SECTION 7: Final Build Verification

After all fixes:

```bash
npm run build 2>&1 | tail -5
npm run test 2>&1 | tail -10
npm run lint 2>&1 | tail -5
```

**Expected:**
- Build: zero errors
- Tests: all pass (0 failures)
- Lint: zero errors

---

## SECTION 8: Generate Summary Report

Create a file called `TEST_RUN_REPORT.md` in the project root with this structure:

```markdown
# Test Run Report — [current date]

## Results

| Suite | Total | Passed | Failed | Skipped |
|-------|-------|--------|--------|---------|
| Vitest (unit) | X | X | 0 | 0 |
| Playwright (marketing) | X | X | 0 | 0 |
| Playwright (auth) | X | X | 0 | 0 |
| Playwright (authenticated) | — | — | — | Not run (no credentials) |
| TypeScript (`tsc`) | — | PASS/FAIL | — | — |
| Build (`next build`) | — | PASS | — | — |
| Lint | — | PASS | — | — |

## Fixes Applied During This Run
- [list any test fixes made]

## Security Verification
- [x] `/auth/callback` → `/callback` fix confirmed
- [x] Resend webhook rejects unsigned requests
- [x] Inbound email webhook rejects unsigned requests
- [x] Stripe `canceled` → `cancelled` normalisation confirmed
- [x] `invoice.paid` no longer overwrites `pack_temporary` status

## Remaining Manual Verification Required
- [ ] Authenticated E2E tests (need test user credentials in `.env.test.local`)
- [ ] Stripe webhook end-to-end (need live/test webhook events)
- [ ] Resend email delivery (need verified domain)
- [ ] Cron route (`/api/reminders/cron`) with real CRON_SECRET
- [ ] Full case lifecycle: register → case → interaction → letter → export → share → resolve

## Stale Files Cleaned Up
- [list any duplicate test files removed from src/lib/]
```

Fill in the actual numbers from the test runs.

---

## IMPORTANT CONSTRAINTS

1. **Only modify test files** — except for the single `invoice.paid` fix in Section 6.
2. **Do not install new dependencies.**
3. **Do not modify Playwright config or Vitest config** — they've already been updated.
4. **If a test failure reveals a real production bug** (not test drift), document it in the report but do NOT fix it in this prompt. The `invoice.paid` fix is the only exception because it's a one-line guard with zero side effects.
5. **Run each command and record the actual output** — do not assume results.
