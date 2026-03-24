# COMET PROMPT — Full Codebase Review & Verification

> **Purpose:** Exhaustive, read-only audit of the entire TheyPromised codebase. No code changes. Produce a structured report covering every domain, every route, every integration, and every known gap — with clear PASS / FAIL / WARN verdicts and actionable remediation steps.
>
> **Important:** This is a REVIEW prompt. Do NOT modify any files. Output a single markdown report named `COMET_REVIEW_REPORT.md` in the project root.

---

## CONTEXT

TheyPromised (theypromised.app) is a UK consumer complaint tracking platform.

**Tech stack:** Next.js 15 (App Router), React 19, TypeScript (strict), Supabase (auth, DB, storage, realtime), Stripe (payments), Anthropic Claude API (AI features), Resend (email), Tailwind v4, shadcn/ui, Vercel deployment.

**Business model:** Free tier (limited AI credits) → Basic/Pro subscriptions + one-off complaint packs. B2B pilot monitoring. Guided complaint journeys. AI-drafted letters citing UK consumer legislation.

**Brand rules:** UK English only (organisation, colour, licence). Dates DD/MM/YYYY. All user-facing legal references must cite correct UK legislation.

---

## INSTRUCTIONS

Work through every section below **sequentially**. For each section, read every relevant file. Do not skip files or make assumptions — open and inspect each one. Record your findings with PASS / FAIL / WARN verdicts and specific file:line references.

---

## SECTION 1: BUILD & TOOLCHAIN INTEGRITY

1. Run `npm run build` — record exit code, error count, warning count.
2. Run `npx tsc --noEmit` — record result. If it fails, explain why and whether this is a genuine type safety issue or a config artefact.
3. Run `npm run lint` — record result.
4. Run `npm run test` — record test count, pass/fail counts, any skipped tests.
5. Check `package.json` for:
   - Any outdated or deprecated dependencies (check for known CVEs if possible)
   - Mismatched peer dependencies
   - Scripts that reference missing binaries
6. Check `tsconfig.json` for strict mode, path aliases, and any problematic includes (e.g. `.next/types`).
7. Check `next.config.ts` for security headers, redirects, image domains, experimental flags.
8. Check `vercel.json` for cron config, function config, rewrites.
9. Check `eslint.config.mjs` for rule coverage.

---

## SECTION 2: PROJECT STRUCTURE & ARCHITECTURE

1. Map the full directory tree: `src/app`, `src/lib`, `src/components`, `src/types`, `supabase/migrations`, `scripts`, `public`, `tests`.
2. Verify route group organisation: `(marketing)`, `(auth)`, `(dashboard)`, `(admin)`.
3. For each route group, list every `page.tsx` and `layout.tsx`. Flag any missing layouts.
4. Check for orphan files — components or lib modules that are never imported anywhere.
5. Verify barrel exports (`index.ts`) are complete and don't re-export unused modules.
6. Check that Server Components vs Client Components are correctly separated:
   - No `"use client"` components importing server-only packages (anthropic, stripe, resend, posthog-node, @react-pdf/renderer server-side).
   - No Server Components using hooks, browser APIs, or event handlers.

---

## SECTION 3: AUTHENTICATION & AUTHORISATION

1. Read `src/lib/supabase/server.ts`, `client.ts`, `middleware.ts`, `admin.ts`, `auth.ts`.
2. Read `src/middleware.ts` — verify:
   - Protected routes require auth
   - Public routes are explicitly allowed
   - Admin routes check admin role
   - Auth callback route is unprotected
   - Redirect logic is correct (no infinite loops)
3. Read every `(auth)` page: login, register, forgot-password, callback.
   - Verify Zod validation on all form inputs
   - Check error handling for auth failures
   - Verify redirect after successful auth
4. Read `src/lib/auth/admin.ts` and `admin-api.ts`:
   - How is admin determined? Hardcoded email list? Database role? Supabase claims?
   - Is this check applied consistently across all admin routes and API endpoints?
5. Check every API route (`src/app/api/**`) for auth verification:
   - List any API routes that do NOT call `supabase.auth.getUser()` or equivalent
   - Determine if the omission is intentional (webhooks, public endpoints) or a security gap

---

## SECTION 4: DATABASE & MIGRATIONS

1. Read every file in `supabase/migrations/` in chronological order.
2. For each migration, document:
   - Tables created/altered
   - RLS policies added
   - Triggers and functions
   - Seed data inserted
3. Check for:
   - Tables referenced in code but missing from migrations (e.g. `share_token`, `is_shared` columns)
   - Migrations that could fail if run out of order
   - Missing foreign key constraints
   - Missing indexes on frequently queried columns (user_id, case_id, created_at)
   - RLS policies on ALL user-owned tables — list any tables without RLS
4. Read `src/types/database.ts` — verify it matches the schema defined in migrations.
5. Cross-reference every Supabase query in the codebase against the schema:
   - Any queries referencing columns that don't exist in migrations?
   - Any INSERT/UPDATE operations missing required fields?

---

## SECTION 5: API ROUTES — FULL AUDIT

For every file in `src/app/api/**`:

1. **Auth:** Does it verify the user? If not, is the omission justified?
2. **Input validation:** Does it validate request body/params with Zod or equivalent?
3. **Error handling:** Does it catch errors and return appropriate HTTP status codes?
4. **Rate limiting:** Is rate limiting applied? What mechanism (in-memory, Upstash, none)?
5. **Response format:** Consistent JSON response structure?

Pay special attention to:
- `api/webhooks/stripe/route.ts` — raw body handling, signature verification, event processing
- `api/webhooks/resend/route.ts` — does it verify Resend webhook signatures (Svix)?
- `api/webhooks/inbound-email/route.ts` — does it verify the sender? Any injection risk?
- `api/ai/*` — rate limiting, credit deduction, error handling for API failures
- `api/seed/route.ts` — is it disabled or protected in production?
- `api/reminders/cron/route.ts` — CRON_SECRET verification, idempotency
- `api/admin/*` — admin auth check on every endpoint
- `api/account/delete/route.ts` — does it cascade properly? GDPR compliant?
- `api/export/*` — auth check, file size limits, timeout handling

---

## SECTION 6: SERVER ACTIONS

Read every file in `src/lib/actions/`:
1. `cases.ts` — CRUD operations, RLS reliance, input validation
2. `interactions.ts` — same checks
3. `evidence.ts` — file upload handling, storage bucket references, file type/size validation
4. `journeys.ts` — journey state management, step progression logic
5. `outcomes.ts` — outcome recording, case status transitions
6. `settings.ts` — profile updates, notification preferences, account operations

For each action:
- Is the user authenticated before the action executes?
- Is input validated with Zod?
- Are error messages user-friendly (no raw error leaks)?
- Do mutations use the correct Supabase client (server vs admin)?

---

## SECTION 7: AI INTEGRATION

1. Read `src/lib/ai/client.ts` — how is the Anthropic client initialised? Key management?
2. Read `src/lib/ai/prompts.ts` — system prompts, user prompts. Do they correctly reference UK legislation?
3. Read `src/lib/ai/letter-templates.ts` and `letter-contexts.ts` — template accuracy, legal citation correctness.
4. Read `src/lib/ai/journey-prompts.ts` — guided journey AI context.
5. Read `src/lib/ai/escalation-rules.ts` — rule logic, test coverage (check `escalation-rules.test.ts`).
6. Read `src/lib/ai/haiku.ts` — what is this? Summarisation with a lighter model?
7. Read `src/lib/ai/usage.ts` — credit tracking, tier limits, monthly reset logic.
8. Read `src/lib/ai/constants.ts` — model names, token limits, pricing constants.
9. Check every AI API route (`api/ai/*`):
   - `draft-letter` — prompt injection risk? Output validation?
   - `suggest` — what does it suggest? Input/output validation?
   - `summarise` — input size limits? Truncation handling?
   - `usage` — read-only or writable? Auth check?

---

## SECTION 8: STRIPE & MONETISATION

1. Read `src/lib/stripe/client.ts`, `config.ts`, `checkout.ts`, `webhooks.ts`, `setup.ts`.
2. Read `src/lib/stripe/feature-gates.ts` and its test file.
3. Read `src/lib/packs/config.ts` and `access.ts`.
4. Verify the full subscription lifecycle:
   - Checkout session creation → webhook handling → profile.subscription_tier update → feature gating
   - Cancellation → downgrade → feature restriction
   - Pack purchase → credit addition
5. Check for:
   - Hardcoded price IDs vs environment variables
   - Test mode artefacts (sk_test_, price_test_) in production code
   - Missing webhook event handlers (invoice.payment_failed, customer.subscription.updated, etc.)
   - Race conditions in credit deduction (concurrent AI requests)
6. Read the Stripe portal route (`api/stripe/portal`) — does it create a portal session correctly?
7. Read the checkout route (`api/stripe/checkout`) — does it handle errors? Duplicate sessions?

---

## SECTION 9: EMAIL SYSTEM

1. Read `src/lib/email/client.ts` and `send.ts`.
2. Read every email template in `src/lib/email/templates/`:
   - Are they all valid React Email components?
   - Do they reference correct URLs (theypromised.app, not localhost)?
   - Do they use UK English?
   - Are there any templates that reference features not yet implemented?
3. Check the Resend webhook route — signature verification?
4. Check the inbound email route — how does it link incoming emails to cases?
5. Check the letter sending flow (`api/letters/[id]/send`) — Resend API call, error handling, status tracking.

---

## SECTION 10: GUIDED JOURNEYS

1. Read `src/lib/journeys/templates.ts` — journey definitions, step structure.
2. Read `src/lib/actions/journeys.ts` — state management, step completion.
3. Read all journey-related migrations.
4. Read the dashboard journey pages:
   - `(dashboard)/journeys/page.tsx` — list view
   - `(dashboard)/journeys/new/page.tsx` and `StartJourneyClient.tsx` — creation flow
   - `(dashboard)/journeys/[id]/page.tsx` and `JourneyWizard.tsx` — step-by-step wizard
5. Verify the full journey lifecycle works end-to-end:
   - Can a user select a journey template?
   - Can they start a journey linked to a case?
   - Can they progress through steps?
   - Does it integrate with the AI system for guided advice?
6. Flag if any part of the journey system is incomplete or references non-existent database tables/columns.

---

## SECTION 11: FRONTEND — MARKETING PAGES

For every page in `src/app/(marketing)/`:
1. Does it export `generateMetadata`? If not, why?
2. Is the content real (not placeholder/Lorem Ipsum)?
3. Are all internal links valid (no broken hrefs)?
4. Are all images present in `/public`? Flag missing images.
5. Do CTAs point to correct destinations?
6. Is UK English used throughout?
7. Check `/how-it-works` — are there placeholder grey boxes instead of real screenshots?
8. Check `/companies` and `/business` — are descriptions thin/underdeveloped?
9. Check `/pricing` — do prices match Stripe config? Are tier names consistent?
10. Check `/packs` — does the checkout flow link correctly?

---

## SECTION 12: FRONTEND — DASHBOARD & CASE MANAGEMENT

For every page in `src/app/(dashboard)/`:
1. Auth protection (via middleware + layout)?
2. Loading states (`loading.tsx` or Suspense boundaries)?
3. Error handling (error boundaries, toast notifications)?
4. Data fetching pattern (server component fetch vs client-side TanStack Query)?
5. Full case lifecycle:
   - Create case → log interactions → upload evidence → view timeline → generate letter → export PDF → share case → mark resolved → record outcome
6. Check the case detail page (`cases/[id]/page.tsx`) — does it load all related data correctly?
7. Check the letter wizard (`cases/[id]/letters/new/LetterWizard.tsx`) — form steps, AI integration, preview, send.
8. Check reminders (`reminders/page.tsx`) — CRUD, notification preferences.
9. Check all settings pages: profile, notifications, billing, account.
10. Check admin pages: dashboard stats, users, companies, B2B, categories.

---

## SECTION 13: COMPONENTS AUDIT

1. Read every component in `src/components/cases/` — verify props, state management, error handling.
2. Read every component in `src/components/layout/` — verify responsive design, mobile nav, auth-aware rendering.
3. Read every component in `src/components/dashboard/` — verify data display, empty states.
4. Read every component in `src/components/marketing/` — verify forms, client-side validation.
5. Read every component in `src/components/letters/` — verify send flow, status tracking.
6. Check `src/components/ui/UpgradePrompt.tsx` — is the paywall correctly positioned (after the magic moment)?
7. Verify all shadcn/ui components are used correctly and consistently styled.

---

## SECTION 14: SEO & METADATA

1. Read `src/app/layout.tsx` — root metadata, default title/description, OG tags.
2. Read `src/app/robots.ts` — are correct paths blocked/allowed?
3. Read `src/app/sitemap.ts` — does it include all public pages? Dynamic routes?
4. Read `src/app/api/og/route.tsx` — OG image generation. Does it work?
5. Check `/public` for: `favicon.ico`, `apple-touch-icon.png`, `og-image.png`, `manifest.json`/`site.webmanifest`.
6. List every page that SHOULD have `generateMetadata` but doesn't.
7. Check for missing `<meta>` descriptions on key marketing pages.

---

## SECTION 15: SECURITY DEEP-DIVE

1. **Secrets exposure:** Grep the entire codebase for hardcoded API keys, tokens, passwords. Check `.env.local.example` doesn't contain real values.
2. **XSS:** Check for `dangerouslySetInnerHTML` usage. If present, is the content sanitised?
3. **CSRF:** Are Server Actions and API routes protected against CSRF?
4. **Injection:** Check `src/lib/search/sanitize.ts` — is search input properly sanitised?
5. **Rate limiting:** Read `src/lib/rate-limit.ts` — is it Upstash-based or in-memory? Does it work across Vercel serverless instances?
6. **Webhook security:**
   - Stripe: signature verification ✓ (confirmed in prior review)
   - Resend: is Svix signature verification implemented?
   - Inbound email: any authentication?
7. **File uploads:** Check evidence upload — file type whitelist, size limits, storage bucket configuration.
8. **GDPR compliance:**
   - Account deletion (`api/account/delete`) — does it delete ALL user data?
   - Data export (`api/account/export`) — does it export ALL user data?
   - Cookie consent component — present and functional?
   - Privacy policy — covers all data processing?
9. **Admin access:** Can a non-admin access admin routes or API endpoints?
10. **Service role usage:** List every file that uses the Supabase service role client. Verify each usage is justified.

---

## SECTION 16: PERFORMANCE & BEST PRACTICES

1. **Bundle analysis:** Are any server-only packages accidentally imported in client components?
2. **Image optimisation:** Are all images using `next/image`? Any raw `<img>` tags?
3. **Loading states:** Which dashboard pages are missing `loading.tsx`?
4. **Caching:** Are expensive database queries cached appropriately?
5. **Error boundaries:** Is there a `global-error.tsx`? A `not-found.tsx`?
6. **Suspense boundaries:** Are they used for async server components?
7. **Client component minimisation:** Are `"use client"` directives pushed as far down the tree as possible?

---

## SECTION 17: TESTING COVERAGE

1. List all test files and their coverage areas.
2. Identify critical paths with NO test coverage:
   - Stripe webhook event handling
   - AI credit deduction logic
   - Auth flow (login, register, callback)
   - Case CRUD operations
   - Journey state machine
3. Check if E2E tests exist (Playwright config is present — are there actual test files?).
4. Recommend the 5 highest-priority tests to write before launch.

---

## SECTION 18: CROSS-REFERENCE WITH KNOWN ISSUES

Compare findings against the two prior review reports (FULL_REVIEW_REPORT.md from 17 March, PRE_LAUNCH_REPORT.md from 14 March):

1. **Guided Journeys** — was the missing frontend flagged in the March 17 report implemented since? Check for journey pages, wizard component, API routes, database tables.
2. **Webhook signature verification** — Resend and inbound-email webhooks had no signature verification. Has this been fixed?
3. **In-memory rate limiter** — was it replaced with Upstash? (package.json shows `@upstash/ratelimit` — verify it's actually used).
4. **Missing database columns** — `share_token`/`is_shared` were flagged as missing from migrations. Resolved?
5. **Homepage SEO** — `"use client"` blocking `generateMetadata`. Resolved?
6. **How-it-works placeholder images** — four grey boxes. Resolved?
7. **Missing OG image** — `/og-image.png`. Resolved?
8. **QuickLogButton zero-case handling** — header version didn't handle empty cases. Resolved?
9. **PDF Table of Contents** — flagged as missing. Resolved?
10. **tsc --noEmit failure** — `.next/types` config issue. Resolved?

---

## SECTION 19: GAP ANALYSIS

Based on all findings, produce a gap analysis:

### Critical (must fix before launch)
- Security vulnerabilities
- Broken user flows
- Data integrity risks
- Missing auth checks

### High (should fix before launch)
- Missing SEO metadata on key pages
- Incomplete features visible to users
- Missing input validation
- Thin error handling

### Medium (fix within first week)
- Missing loading states
- Test coverage gaps
- Performance optimisations
- Polish issues

### Low (post-launch backlog)
- Nice-to-have features
- Code quality improvements
- Additional test coverage
- Documentation

---

## SECTION 20: FINAL VERDICT

Provide a clear **GO / CONDITIONAL GO / NO-GO** recommendation with:
1. Total issues found by severity
2. Estimated remediation effort for critical and high items
3. The 5 most important things to fix before going live
4. A confidence score (1–10) for launch readiness

---

## OUTPUT FORMAT

Save your complete report as `COMET_REVIEW_REPORT.md` in the project root. Structure it exactly as the sections above, with a table of contents at the top and an executive summary.

Use tables for structured data. Use code blocks for file references. Use ✅ PASS / ❌ FAIL / ⚠️ WARN for verdicts.

Be forensic. Be specific. Cite file paths and line numbers. Do not generalise — every claim must be backed by evidence from the code you read.
