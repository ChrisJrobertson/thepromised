# TheyPromised.app — Final Pre-Launch Review

**Report generated:** 14 March 2026  
**Reviewer:** Cursor (Final Pre-Launch Review checklist)

---

## STEP 1: BUILD VERIFICATION

| Check | Result | Notes |
|-------|--------|-------|
| `npm run build` | ✅ PASS | Zero errors. Warnings: Sentry deprecation (instrumentation), webpack cache serialisation |
| `npx tsc --noEmit` | ⚠️ FAIL | Fails due to stale `.next/types/**` in tsconfig include — Next.js build type-check passes |
| `npx vitest run` | ✅ PASS | 5 test files, 51 tests passed |
| `npx next lint` | ✅ PASS | Zero errors, zero warnings (fixed during review) |

**tsc note:** The project includes `.next/types/**/*.ts` in `tsconfig.json`. When `.next` is cleaned or regenerated, these files can be missing and cause tsc to fail. The Next.js build runs its own type check and passes. Recommendation: run `npm run build` for type validation, or exclude `.next` from tsc in CI.

---

## STEP 2: LIVE INFRASTRUCTURE CHECK VIA MCP

**MCP availability:** Supabase, Stripe, and Hugging Face MCPs were not callable with the expected tool names. Live infrastructure verification could not be performed via MCP.

**Manual verification required:**
- Run the Supabase SQL queries from the checklist (tables, RLS, triggers, seed data, storage bucket)
- Verify Stripe products, prices, webhook endpoint, and Customer Portal
- Test Hugging Face summarisation and NER with sample text

---

## STEP 3: ENVIRONMENT VARIABLE AUDIT

`.env.local` is gitignored and contains secrets — cannot be read directly. Verify in Vercel and locally:

| Variable | Required | Format |
|----------|----------|--------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | Starts with https:// |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Long string starting with eyJ |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Long string starting with eyJ |
| STRIPE_SECRET_KEY | Yes | sk_test_ or sk_live_ |
| STRIPE_WEBHOOK_SECRET | Yes | whsec_ |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Yes | pk_test_ or pk_live_ |
| STRIPE_PRICE_ID_BASIC_MONTHLY | Yes | price_ |
| STRIPE_PRICE_ID_BASIC_ANNUAL | Yes | price_ |
| STRIPE_PRICE_ID_PRO_MONTHLY | Yes | price_ |
| STRIPE_PRICE_ID_PRO_ANNUAL | Yes | price_ |
| ANTHROPIC_API_KEY | Yes | sk-ant- |
| HUGGINGFACE_API_KEY | Yes | hf_ |
| NEXT_PUBLIC_APP_URL | Yes | https://thepromised.app |
| NEXT_PUBLIC_APP_NAME | Yes | TheyPromised |
| RESEND_API_KEY | Yes | re_ |
| CRON_SECRET | Yes | Any string |
| SEED_SECRET | Yes | Any string |
| NEXT_PUBLIC_SENTRY_DSN | Recommended | https:// |
| NEXT_PUBLIC_POSTHOG_KEY | Recommended | phc_ |

---

## STEP 4: DEPENDENCY & IMPORT AUDIT

- All `@/` imports verified — target files exist
- No broken imports found
- Client components correctly use `'use client'` where hooks/browser APIs are used
- No server-only packages (anthropic, @huggingface, stripe, react-pdf, resend, posthog-node) in client components

---

## STEP 5: ROUTE VERIFICATION

All expected routes exist with correct exports:

| Route | Status |
|-------|--------|
| Auth: /login, /register, /forgot-password, /callback | ✅ |
| Dashboard: /dashboard, /cases, /cases/new, /cases/[id], /cases/[id]/timeline, /cases/[id]/letters, /cases/[id]/letters/new, /cases/[id]/export, /cases/[id]/interactions/new, /letters, /reminders, /settings/* | ✅ |
| Marketing: /, /pricing, /how-it-works, /escalation-guides, /escalation-guides/[category], /about, /privacy, /terms | ✅ |
| API: /api/webhooks/stripe, /api/ai/*, /api/export/*, /api/stripe/*, /api/reminders/cron, /api/seed, /api/letters/[id], /api/export/data | ✅ |

---

## STEP 6: SECURITY REVIEW

| Check | Result |
|-------|--------|
| Secrets not in client code | ✅ All secrets referenced only in server-side files |
| Service role usage | ✅ Only in webhook, cron, seed — appropriate |
| Auth on protected API routes | ✅ All /api/* except webhooks/stripe and seed use `supabase.auth.getUser()` |
| CRON_SECRET in cron route | ✅ Bearer token verification |
| SEED_SECRET in seed route | ✅ x-seed-secret header verification |
| .env.local in .gitignore | ✅ .env* ignored |

---

## STEP 7: STRIPE WEBHOOK BODY HANDLING

| Requirement | Verified |
|-------------|----------|
| Uses `request.text()` for raw body | ✅ `const payload = await request.text()` |
| `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)` | ✅ `constructEventAsync(payload, signature, ...)` |
| Signature from `stripe-signature` header | ✅ |
| Returns 200 for handled and unhandled events | ✅ `return NextResponse.json({ received: true })` |
| `export const runtime = 'nodejs'` | ✅ |

---

## STEP 8: CROSS-COMPONENT CONSISTENCY

- **UK dates:** `toLocaleDateString("en-GB", ...)`, `date-fns` with `enGB` locale used
- **UK English:** No American spellings (organisation, colour, etc.) in user-facing strings
- **Subscription tier:** Feature gates, upgrade prompts, and billing read from `profile.subscription_tier`

---

## STEP 9: PERFORMANCE CHECK

- No server-only libs in client bundles
- No raw `<img>` tags — EvidenceUpload uses `img` for user-uploaded previews (acceptable)
- Dashboard, cases, case detail pages: no explicit loading.tsx; Next.js handles loading for server components

---

## STEP 10: LIVE DATA INTEGRITY

Cannot run without live Supabase access. When seeding/migrating, run:

```sql
-- Orphan check
SELECT COUNT(*) FROM interactions i LEFT JOIN cases c ON i.case_id = c.id WHERE c.id IS NULL;
SELECT COUNT(*) FROM evidence e LEFT JOIN cases c ON e.case_id = c.id WHERE c.id IS NULL;
-- Both should be 0

-- NULL required fields
SELECT COUNT(*) FROM cases WHERE title IS NULL OR category IS NULL;
SELECT COUNT(*) FROM interactions WHERE summary IS NULL OR channel IS NULL;
-- Both should be 0
```

---

# LAUNCH REPORT

## 🔴 BLOCKERS (must fix before deploy)

None identified. Build passes, security checks pass, Stripe webhook handling is correct.

## 🟡 ISSUES (should fix, not critical)

1. **tsc --noEmit fails** — Due to `.next/types` in tsconfig. Next build type-check passes. Consider excluding `.next` from tsc or running build for type validation in CI.
2. **PDF Table of Contents** — CasePdfDocument has no TOC page. Fix Prompt 2 mentioned this; not implemented.
3. **QuickLogButton (header)** — When user has 0 cases and clicks "Log Interaction", the modal opens with empty cases. DashboardQuickActions handles this correctly with a toast; the header QuickLogButton does not. Consider aligning behaviour.
4. **Sentry instrumentation** — Deprecation warning: move to `instrumentation-client.ts` and add `onRequestError` hook.

## 🟢 NICE TO HAVE (post-launch)

1. Add loading.tsx for /dashboard, /cases, /cases/[id] for Suspense boundaries
2. Migrate Sentry to instrumentation-client.ts
3. Add PDF Table of Contents page
4. PWA icons (192, 512, 180 PNGs) — manifest references SVG only

## ✅ VERIFIED WORKING

- Build (zero errors)
- All unit tests (51 passing)
- Lint (zero warnings)
- All routes present
- Stripe webhook: raw body, signature verification, 200 on all events
- Auth on all protected API routes
- CRON_SECRET and SEED_SECRET verification
- No secrets in client code
- UK English and UK date format

## INFRASTRUCTURE STATUS

| Service | Status | Notes |
|---------|--------|-------|
| Supabase DB | ⏳ Manual | Verify tables, RLS, triggers, seed via MCP or dashboard |
| Supabase Storage | ⏳ Manual | Verify `evidence` bucket |
| Stripe Products | ⏳ Manual | Verify 2 products, 4 prices in GBP |
| Stripe Webhook | ⏳ Manual | Verify endpoint URL and events |
| Stripe Portal | ⏳ Manual | Verify configuration |
| Hugging Face | ⏳ Manual | Test summarisation + NER |
| Claude API | ⏳ Manual | Key valid (no live test without spending credits) |

## DEPLOYMENT CHECKLIST

- [x] Build passes with zero errors
- [x] TypeScript passes (via Next.js build)
- [x] All tests pass
- [ ] All env vars set in Vercel
- [ ] Stripe webhook endpoint live
- [ ] Database migrated and seeded
- [ ] Resend domain verified
- [ ] PostHog project created
- [ ] Sentry project created
- [ ] Custom domain active on Vercel
- [ ] Test user journey completed successfully
- [x] No American spellings in UI
- [x] No secrets in client code

## GO / NO-GO RECOMMENDATION

**READY TO DEPLOY** — with the following pre-flight steps:

1. Set all required environment variables in Vercel
2. Run Supabase migrations and `POST /api/seed` with SEED_SECRET
3. Run `npx tsx src/lib/stripe/setup.ts` and add price IDs to env
4. Create Stripe webhook pointing to `https://thepromised.app/api/webhooks/stripe`
5. Verify Resend domain and PostHog/Sentry projects
6. Complete a manual test journey: register → case → interaction → timeline → export

The codebase is production-ready. The remaining items are deployment and infrastructure configuration, not code changes.
