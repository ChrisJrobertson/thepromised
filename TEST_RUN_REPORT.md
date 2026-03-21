# Test Run Report — 2026-03-21

## Results

| Suite | Total | Passed | Failed | Skipped |
|-------|-------|--------|--------|---------|
| Vitest (unit) | 54 | 54 | 0 | 0 |
| Playwright (marketing + auth, Chromium) | 13 | 13 | 0 | 0 |
| Playwright (authenticated) | — | — | — | Not run (requires `PLAYWRIGHT_TEST_PASSWORD` in `.env.test.local`) |
| TypeScript (`tsc --noEmit`) | — | PASS | — | — |
| Build (`next build`) | — | PASS | — | — |
| Lint (`eslint .`) | — | PASS (0 errors) | — | 3 warnings in `src/lib` (pre-existing) |

## Fixes Applied During This Run

- **Stale duplicate unit tests removed** (canonical copies live in `src/test/unit/`):
  - `src/lib/stripe/feature-gates.test.ts`
  - `src/lib/ai/escalation-rules.test.ts`
  - `src/lib/date.test.ts`
  - `src/lib/validation/auth.test.ts`
- **`invoice.paid` Stripe webhook:** added `.neq("subscription_status", "pack_temporary")` so subscription renewal events do not overwrite one-off pack users’ status (`src/app/api/webhooks/stripe/route.ts`).
- **Playwright auth fixture ESLint:** renamed Playwright’s fixture callback parameter from `use` to `provideAuthedPage` to satisfy `react-hooks/rules-of-hooks` (false positive on `use*` names).

## Security Verification (Prompt 03)

- [x] **`/auth/callback` → `/callback`** — `grep -rn "/auth/callback" src/` returns no matches.
- [x] **Resend webhook** — `src/app/api/webhooks/resend/route.ts` line ~15: `if (!secret)` → 500 + log.
- [x] **Inbound email webhook** — `src/app/api/webhooks/inbound-email/route.ts` line ~25: `if (!secret)` → 500 + log.
- [x] **Stripe `canceled` → `cancelled`** — `rawStatus === "canceled" ? "cancelled"` present in `stripe/route.ts`.
- [x] **`invoice.paid` no longer overwrites `pack_temporary`** — update query includes `.neq("subscription_status", "pack_temporary")`.

## Remaining Manual Verification Required

- [ ] **Authenticated E2E** — set `PLAYWRIGHT_TEST_EMAIL` / `PLAYWRIGHT_TEST_PASSWORD` in `.env.test.local` and run `npx playwright test tests/e2e/authenticated.test.ts`.
- [ ] **Stripe webhooks end-to-end** — verify with Stripe CLI or dashboard (subscription + pack flows).
- [ ] **Resend** — domain/DNS and `RESEND_WEBHOOK_SECRET` in production.
- [ ] **Cron** — `/api/reminders/cron` with `CRON_SECRET` on a schedule.
- [ ] **Full product journey** — register → case → interaction → letter → export → share → resolve.

## One Remaining Logic Area for Manual Review

**Pack vs subscription `invoice.paid` attribution:** The new `.neq("subscription_status", "pack_temporary")` guard stops renewal-style `invoice.paid` events from clobbering pack users. If a user later buys a **real** subscription while still in an edge state, confirm in Stripe/Supabase that their `subscription_status` and `stripe_customer_id` transitions are still correct (manual QA or webhook logs).

## Stale Files Cleaned Up

- Removed four duplicate/stale `*.test.ts` files under `src/lib/` (see list above).

## Lint Note

`eslint .` exits **0** with **3 warnings** (not errors) in production files:

- `src/lib/actions/outcomes.ts` — `OUTCOME_*` used only as types
- `src/lib/stripe/feature-gates.ts` — unused `profile` parameter

Out of scope for this prompt (production edits limited to `invoice.paid` guard).
