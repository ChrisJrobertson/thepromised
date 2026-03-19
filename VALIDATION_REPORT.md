# TheyPromised — Full Validation Report
## Generated: 17 March 2026

## Executive Summary
- Total checks: 87
- ✅ PASS: 61
- ⚠️ WARN: 17
- ❌ FAIL: 7
- 🔍 MISSING: 2

## Critical Failures (Must Fix Before Launch)
1. **Stripe `canceled` vs `cancelled` DB constraint violation** — `src/app/api/webhooks/stripe/route.ts` line 214. When Stripe sends `customer.subscription.updated` with `status: "canceled"` (US spelling), the DB CHECK constraint (`'cancelled'` UK spelling) rejects the UPDATE, returning HTTP 500. Stripe retries indefinitely.
2. **Dashboard "Compensation Won" stat always shows £0** — `src/app/(dashboard)/dashboard/page.tsx` line 99 reads `compensation_received` which is never written to. All compensation data is stored in `outcome_amount_pence` (pence, via `submitCaseOutcome`). The dashboard shows a permanently broken £0 stat.
3. **Open redirect in OAuth callback** — `src/app/(auth)/callback/route.ts` line 60. `new URL(next, request.url)` with an unvalidated `next` param resolves external URLs (e.g. `?next=https://attacker.com`), redirecting users off-site post-login.
4. **`cases.ref` column missing from migrations** — No `ALTER TABLE cases ADD COLUMN ref TEXT` in any migration file. Running migrations against a fresh Supabase instance will fail at the trigger/index creation in `20260317140000`.
5. **Missing `error.tsx`** — No `src/app/error.tsx` or `src/app/(dashboard)/error.tsx`. Unhandled Supabase or server errors in dashboard routes bubble to `global-error.tsx`, which renders a bare HTML page outside the app shell with no navigation.
6. **Homepage social proof is fabricated** — Named testimonials (Sarah T., Marcus L., Priya K.) are unverified placeholder content. A JSX comment reads `{/* ── SOCIAL PROOF PLACEHOLDER ──*/}` in production code. The claim "Join thousands of UK consumers" has no data backing it. Potential ASA/CAP compliance issue.
7. **Sentry Session Replay runs without consent** — `instrumentation-client.ts` line 7: `replaysSessionSampleRate: 0.1` records 10% of all sessions unconditionally, with no consent check. This may conflict with the app's cookie consent model under UK GDPR.

## Warnings (Fix Soon)
1. **`?next=` param ignored for password login** — `src/app/(auth)/login/LoginClient.tsx` hardcodes redirect to `/dashboard`. Middleware sets `?next=<path>` on auth-redirect, but LoginClient never reads `useSearchParams()`. Users sent to `/login` from a protected page always land on `/dashboard` instead of returning to where they were going.
2. **`LETTER_TYPE_LABELS` missing 3 types in letters page** — `src/app/(dashboard)/letters/page.tsx` lines 22–31: `LETTER_TYPE_LABELS` has 8 entries but the DB allows 11. Letters of type `adr_referral`, `section_75_claim`, `letter_before_action` will render as `undefined` in the letters list UI (blank badge label).
3. **`generateMetadata` for case detail page lacks user auth** — `src/app/(dashboard)/cases/[id]/page.tsx` lines 43–51. Any authenticated user can probe whether a case with a given UUID exists and learn its title by hitting `/cases/<uuid>` — the metadata query filters by `id` only, not `user_id`. Low-severity IDOR information leak.
4. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` documented but unused** — In `.env.local.example` but has zero `process.env` references in `src/`. `@stripe/stripe-js` is a declared dependency with no import found via grep. Either the Stripe.js client-side integration is not yet wired up, or it is referenced indirectly.
5. **Cookie consent cookie missing `Secure` attribute** — `src/components/CookieConsent.tsx`: the `tp_consent` cookie string should include `; Secure` for HTTPS environments to prevent downgrade attacks.
6. **Sentry `replaysSessionSampleRate: 0.1`** (also Critical #7 above) — separate concern: review whether Sentry's DPA covers session replay data under UK GDPR without explicit user consent.
7. **`dashboard/page.tsx` queries legacy status values** — Line 110 includes `status.eq.in_progress`, `status.eq.OPEN`, `status.eq.ESCALATED`, `status.eq.IN_PROGRESS`, `status.eq.REVIEW` in `OR` filters. These status values no longer exist after the constraint migration. The query works (returns no rows for those filters), but it is dead code noise that could confuse future developers.
8. **Sitemap `lastModified: new Date()`** — `src/app/sitemap.ts`: every entry uses today's date on every request. Static pages should have a real hardcoded date; dynamic pages should use their `updated_at` timestamp.
9. **`NEXT_PUBLIC_POSTHOG_HOST` used server-side only** — `src/lib/analytics/posthog-server.ts` uses `NEXT_PUBLIC_POSTHOG_HOST`. The `NEXT_PUBLIC_` prefix bundles this into the client JS unnecessarily. A plain `POSTHOG_HOST` env var would be cleaner.
10. **`import/first` ordering violation** — `src/app/(auth)/login/LoginClient.tsx` lines 8–27: `GoogleIcon` SVG component is declared before `import` statements. ESLint `import/first` would flag this; the current ESLint config doesn't enforce it, but it is a code quality issue.
11. **Scorecard queries fail at build time** — Build log shows `Scorecard index query failed: Invalid API key` during static page generation. The code gracefully returns `[]` on failure (`src/lib/analytics/scorecards.ts` line 169), so the build passes. But scorecard pages will be empty in production if `SUPABASE_SERVICE_ROLE_KEY` is not set at build time (it's needed for the `v_company_stats` view).
12. **Pricing teaser on homepage is hardcoded** — `src/app/(marketing)/HomePageClient.tsx`: `£4.99/mo`, `£9.99/mo`, `Packs from £29` are hardcoded and will drift from actual Stripe prices without a code change.
13. **`/callback` not in `AUTH_ROUTES`** — `src/middleware.ts`: `/callback` is not listed in `AUTH_ROUTES` (which redirects authenticated users away from auth pages). This is correct but it means an authenticated user can visit `/callback` without being redirected. Minor, but worth noting.
14. **No granular cookie consent options** — `src/components/CookieConsent.tsx`: only "Accept All" or "Reject Non-Essential". UK ICO guidelines recommend granular consent toggles per category.
15. **`organisations.category` CHECK may reject user-entered values** — The initial migration CHECK lists 15 categories. In `createCase`, category is cast with `as OrganisationInsert["category"]`. If a user's case category isn't in this set, the org INSERT will fail at the DB constraint. The `cases.category` column has no CHECK, making this an inconsistency.
16. **`delivery_status` column on `letters` has no CHECK constraint** — Added in `20260316100000` as plain TEXT. Application writes `'draft'`, `'sent'`, `'failed'`, `'delivered'`, `'opened'`, `'bounced'` — no constraint prevents invalid values.
17. **`compensation_received` column is in TypeScript types and read by dashboard** — See Critical #2. The column exists and is read, but is never written to by any current code path, making it always NULL.

## Missing Features
1. **`src/app/error.tsx`** — No error boundary at the app or dashboard level. Dashboard errors fall through to `global-error.tsx` which renders outside the app shell.
2. **`src/app/(dashboard)/error.tsx`** — Same issue: no dashboard-specific error boundary.

---

## Detailed Results

### Section 1: Build & Compile

#### 1.1 Clean Build
✅ **PASS** — Build completes successfully.

```
✓ Compiled successfully in 37.7s
✓ Generating static pages (104/104)
```

**Pages generated:** 104 total (mix of static ○, SSG ●, and dynamic ƒ).

**Build warnings (non-blocking):**
- `src/lib/actions/outcomes.ts:8` — `'OUTCOME_RESOLUTION_TYPES' is assigned a value but only used as a type` (`@typescript-eslint/no-unused-vars`)
- `src/lib/actions/outcomes.ts:18` — `'OUTCOME_SATISFACTION' is assigned a value but only used as a type`
- `src/lib/stripe/feature-gates.ts:35` — `'profile' is defined but never used`

**Build-time error (non-failing):**
- `Scorecard index query failed: Invalid API key` — emitted twice during SSG. Handled gracefully (returns empty array), but scorecard data pages will be empty without a valid `SUPABASE_SERVICE_ROLE_KEY` at build time.

#### 1.2 TypeScript Strict Check
✅ **PASS** — `npx tsc --noEmit` exits 0 with no output. No type errors beyond what the build catches.

#### 1.3 Lint
✅ **PASS** — ESLint exits 0 with 0 errors, 3 warnings:
- `src/lib/actions/outcomes.ts:8,18` — `@typescript-eslint/no-unused-vars`
- `src/lib/stripe/feature-gates.ts:35` — `@typescript-eslint/no-unused-vars`

#### 1.4 Missing Dependencies
✅ **PASS** — All `@`-scoped package imports are declared in `package.json`:

| Import | Status |
|--------|--------|
| `@anthropic-ai/sdk` | ✅ in deps |
| `@base-ui/react/*` | ✅ in deps |
| `@hookform/resolvers/zod` | ✅ in deps |
| `@react-email/components` | ✅ in deps |
| `@react-pdf/renderer` | ✅ in deps |
| `@sentry/nextjs` | ✅ in deps |
| `@supabase/ssr` | ✅ in deps |
| `@supabase/supabase-js` | ✅ in deps |
| `@tanstack/react-query` | ✅ in deps |
| `@upstash/ratelimit` | ✅ in deps |
| `@upstash/redis` | ✅ in deps |
| `@vercel/analytics/react` | ✅ in deps |
| `@vercel/speed-insights/next` | ✅ in deps |

⚠️ `@stripe/stripe-js` is declared in deps but **has no import in any source file**. Either it is unused/dead, or the client-side Stripe integration is not yet implemented.

---

### Section 2: Database Schema vs Application Code

#### 2.1 Cases Table

**Schema columns (final, post-all-migrations):**
`id`, `user_id` (NOT NULL), `organisation_id` (nullable after `20260317140000`), `custom_organisation_name`, `category` (NOT NULL, no CHECK), `title` (NOT NULL), `description`, `status` (DEFAULT 'open', CHECK: `open, escalated, resolved, closed`), `priority` (DEFAULT 'medium', CHECK: `low, medium, high, urgent`), `reference_number`, `desired_outcome`, `amount_in_dispute`, `escalation_stage` (CHECK: `initial, formal_complaint, final_response, ombudsman, court`), `escalation_deadline`, `first_contact_date`, `last_interaction_date`, `resolved_date`, `resolution_summary`, `compensation_received`, `interaction_count`, `response_deadline`, `response_received`, `response_received_at`, `inbound_email_alias`, `outcome_satisfaction` (CHECK: `yes, partially, no`), `outcome_resolution_type` (CHECK: `refund, compensation, apology, replacement, service_fix, nothing, other`), `outcome_amount_pence`, `outcome_notes`, `resolved_at`, `share_token`, `is_shared`, `ref` (NOT NULL, auto-generated by trigger), `created_at`, `updated_at`.

**INSERT (createCase):** `user_id, organisation_id, custom_organisation_name, category, title, description, reference_number, amount_in_dispute, desired_outcome, priority, status ('open'), escalation_stage ('initial'), first_contact_date` — all valid. `ref` deliberately omitted; trigger auto-generates it. ✅

**UPDATE (updateCaseStatus):** `status, priority, escalation_stage, resolved_date, resolution_summary` — all valid. ✅

**UPDATE (advanceEscalationStage):** `escalation_stage, status ('escalated')` — both valid. ✅

**UPDATE (submitCaseOutcome):** `outcome_satisfaction, outcome_resolution_type, outcome_amount_pence, outcome_notes, resolved_at, status ('resolved'), resolved_date, updated_at` — all valid. ✅

**SELECT (dashboard/page.tsx line 99):** `id, compensation_received` — column exists but is **never written to** by any code path. ❌ See Critical Failure #2.

**ref trigger:** ✅ Trigger `trigger_generate_case_ref` defined in `20260317140000_fix_cases_ref_auto_generation.sql`. Applied to live DB. ❌ However, no `ALTER TABLE cases ADD COLUMN ref TEXT` in any migration — fresh installs would fail.

**CHECK constraints vs app values:**
- `status`: App uses `'open', 'escalated', 'resolved', 'closed'` — matches constraint. ✅
- `priority`: App uses `'low', 'medium', 'high', 'urgent'` — matches constraint. ✅
- `outcome_satisfaction`: App uses `'yes', 'partially', 'no'` — matches. ✅
- `outcome_resolution_type`: App uses `'refund', 'compensation', 'apology', 'replacement', 'service_fix', 'nothing', 'other'` — matches. ✅

#### 2.2 Interactions Table

**Schema columns:** `id`, `case_id` (NOT NULL), `user_id` (NOT NULL), `interaction_date` (NOT NULL), `channel` (NOT NULL, CHECK: `phone, email, letter, webchat, in_person, social_media, app, other`), `direction` (NOT NULL, CHECK: `inbound, outbound`), `contact_name`, `contact_department`, `contact_role`, `reference_number`, `duration_minutes`, `summary` (NOT NULL), `promises_made`, `promise_deadline`, `promise_fulfilled`, `outcome` (CHECK: `resolved, escalated, promised_callback, promised_action, no_resolution, transferred, disconnected, letter_sent, other`), `next_steps`, `mood` (CHECK: `helpful, neutral, unhelpful, hostile`), `ai_summary`, `created_at`, `updated_at`.

**INSERT (logInteraction, createCase first-interaction):** All required NOT NULL columns provided. All CHECK values match. Uses `satisfies InteractionInsert`. ✅

**INSERT (letters/send route — auto-log):** `channel: 'email'`, `direction: 'outbound'`, `outcome: 'letter_sent'` — all valid after migration `20260316103000`. ✅

**INSERT (inbound email webhook):** `channel: 'email'`, `direction: 'inbound'`, `outcome: 'other'` — valid. ✅

**UPDATE (updatePromiseFulfilled):** `promise_fulfilled` — valid. ✅

**UPDATE (auto-summary):** `ai_summary` — valid. ✅

#### 2.3 Letters Table

**Schema columns:** `id`, `case_id` (NOT NULL), `user_id` (NOT NULL), `letter_type` (NOT NULL, CHECK: 11 values after `20260317100000`), `recipient_name`, `recipient_address`, `subject` (NOT NULL), `body` (NOT NULL), `ai_generated`, `sent_date`, `sent_via` (CHECK: `email, post, not_sent`), `status` (DEFAULT 'draft', CHECK: `draft, sent, acknowledged`), `sent_at`, `sent_to_email`, `resend_email_id`, `delivery_status` (NO CHECK constraint), `delivered_at`, `opened_at`, `bounced_at`, `created_at`, `updated_at`.

**INSERT (draft-letter API):** `case_id, user_id, letter_type, recipient_name, recipient_address, sent_to_email, subject, body, ai_generated (true), status ('draft')` — all valid. ✅

**letter_type values allowed by DB CHECK (after `20260317100000`):**
`initial_complaint, follow_up, escalation, final_response_request, ombudsman_referral, subject_access_request, formal_notice, custom, adr_referral, section_75_claim, letter_before_action`

**letter_type values in `letter-templates.ts`:** Same 11 values. ✅ Match is complete.

**letter_type labels in `letters/page.tsx`:** Only 8 labels defined — missing `adr_referral`, `section_75_claim`, `letter_before_action`. ⚠️ These will render as `undefined` in the UI.

**UPDATE (send route success):** `status ('sent'), sent_via ('email'), sent_date, delivery_status ('sent'), sent_at, sent_to_email, resend_email_id` — all valid. ✅

**UPDATE (send route failure):** `delivery_status ('failed')` — no CHECK constraint, accepted. ✅

**UPDATE (Resend webhook — delivered/opened/bounced):** `delivery_status ('delivered'/'opened'/'bounced'), delivered_at/opened_at/bounced_at` — columns exist, no CHECK constraint. ✅

#### 2.4 Promises Table
🔍 **MISSING** — No `promises` table exists in any migration file. Promise data is stored inline on the `interactions` table via `promises_made` (text), `promise_deadline` (timestamptz), and `promise_fulfilled` (boolean) columns. There is no separate promises table. The interactions table approach is correct and complete.

#### 2.5 Organisations Table

**Schema columns:** `id`, `name` (NOT NULL), `category` (nullable, no CHECK), `complaint_email`, `complaint_phone`, `complaint_address`, `website`, `ombudsman_name`, `ombudsman_url`, `escalation_wait_weeks`, `notes`, `is_verified`, `created_at` — plus legacy PI schema columns: `email`, `phone`, `address`, `logo_url`, `settings`, `plan` (NOT NULL DEFAULT 'SOLO', CHECK: `SOLO, PROFESSIONAL, AGENCY, ENTERPRISE`), `ai_credits_used`, `ai_credits_reset_at`, `vat_registered`, `vat_number`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `onboarding_completed`.

**INSERT (createCase inline org):** `name, category, website, complaint_email, complaint_phone, is_verified (false)` — all nullable (except `name`). `plan` uses default 'SOLO'. ✅

**RLS INSERT:** `organisations_insert_authenticated` policy (added `20260317150000`) allows authenticated users to INSERT. ✅

**Note:** Legacy `plan` column (NOT NULL, CHECK uppercase) is provided by default ('SOLO'). No TheyPromised code explicitly sets it.

⚠️ The `organisations.category` column has no CHECK constraint in the actual DB (the migration `CREATE TABLE` was a no-op as the table pre-existed from the legacy schema). However, the TypeScript `OrganisationInsert` type restricts it to 15 valid values, so the app-level validation provides a soft guard. The DB itself won't reject invalid categories.

#### 2.6 Profiles Table

**Schema columns (all migrations combined):** `id`, `email` (NOT NULL), `full_name`, `phone`, `address_line_1`, `address_line_2`, `city`, `postcode`, `stripe_customer_id`, `subscription_tier` (DEFAULT 'free'), `subscription_status` (DEFAULT 'active', CHECK: `active, cancelled, past_due, trialing, pack_temporary`), `subscription_id`, `cases_count` (DEFAULT 0), `ai_credits_used` (DEFAULT 0), `ai_credits_reset_at`, `ai_suggestions_used` (DEFAULT 0), `ai_letters_used` (DEFAULT 0), `is_admin` (DEFAULT false), `last_export_at`, `pack_pro_expires_at`, `pack_access_case_id`, `pack_source_pack_id`, `notification_preferences` (DEFAULT `{"email_reminders":true,...}`), `created_at`, `updated_at`.

**AI credit columns:** `ai_suggestions_used`, `ai_letters_used`, `ai_credits_used` — all valid. Credit reset logic in `cron/route.ts` correctly zeroes all three. ✅

**Subscription tier values:** App uses `'free', 'basic', 'pro'` — no CHECK constraint exists in the actual DB (initial migration `CREATE TABLE IF NOT EXISTS` was a no-op since table pre-existed). TypeScript types enforce this. ✅

**Subscription status values:**
- DB CHECK: `'active', 'cancelled', 'past_due', 'trialing', 'pack_temporary'`
- App uses: all of the above PLUS Stripe sends `'canceled'` (one l) for subscription updates.
- ❌ Critical mismatch: see Critical Failure #1.

**`handle_new_user` trigger (profile auto-creation):** Defined in initial migration. Fires on `auth.users` INSERT. ✅

#### 2.7 All Other Tables

| Table | App References | Status |
|-------|---------------|--------|
| `reminders` | Yes — extensively in cron, letter-send, interactions, cases actions | ✅ All columns valid |
| `evidence` | Yes — evidence upload actions and EvidenceGallery component | ✅ All columns valid |
| `exports` | Yes — `api/export/pdf/route.ts` inserts rows | ✅ All columns valid |
| `complaint_packs` | Yes — Stripe webhook inserts; users view own packs | ✅ All columns valid post-`20260316133000` |
| `monthly_ai_usage` | Yes — `src/lib/ai/usage.ts` inserts and updates | ✅ All columns valid |
| `user_journeys` | Yes — `src/lib/actions/journeys.ts` full CRUD | ✅ All columns valid |
| `journey_templates` | Yes — read-only by app, seeded by migrations | ✅ |
| `escalation_rules` | Yes — read by case detail page | ✅ |
| `business_enquiries` | Yes — `api/business-enquiries/route.ts` | ✅ |
| `b2b_pilots` | Yes — admin-only routes | ✅ |
| `b2b_outreach_emails` | Yes — admin `send-scorecard` route | ✅ |
| `case_journeys` | **No** — not referenced anywhere in `src/` | 🔍 Legacy table from old PI schema, unused |

#### 2.8 TypeScript Types

**File:** `src/types/database.ts`

✅ `cases` Row type includes `ref: string` (added in the previous fix session).

✅ `cases` Insert type includes `ref?: string` (optional, auto-generated by trigger).

⚠️ `cases` Row and Insert types do NOT include legacy PI schema columns (`type`, `rate`, `opened_at`, `assigned_to`, `investigator_id`, `client_id`, `deleted_at`, etc.) that exist on the actual DB table. These columns are invisible to TypeScript but exist in the DB. This is intentional (the app doesn't use them), but it means raw `SELECT *` queries would return fields not in the TypeScript types.

✅ `profiles` types include all current columns including `notification_preferences`.

✅ `letters` types include delivery tracking columns (`sent_at`, `sent_to_email`, `resend_email_id`, `delivery_status`, `delivered_at`, `opened_at`, `bounced_at`).

⚠️ `organisations` Row type does NOT include legacy PI columns (`plan`, `ai_credits_used`, etc.). These are excluded by design (app only reads TheyPromised-relevant columns).

✅ All other table types appear consistent with the migration schema.

---

### Section 3: Routing & Navigation

#### 3.1 Route Map

All 104 pages generated at build. Key routes:

| Route | Type | Notes |
|-------|------|-------|
| `/` | ○ Static | Homepage |
| `/login`, `/register`, `/forgot-password` | ○ Static | Auth pages |
| `/callback` | ƒ Dynamic | OAuth callback route |
| `/dashboard` | ƒ Dynamic | Protected |
| `/dashboard/packs` | ƒ Dynamic | Protected |
| `/cases` | ƒ Dynamic | Protected |
| `/cases/new` | ƒ Dynamic | Protected |
| `/cases/[id]` | ƒ Dynamic | Protected |
| `/cases/[id]/timeline` | ƒ Dynamic | Protected |
| `/cases/[id]/letters` | ƒ Dynamic | Protected |
| `/cases/[id]/letters/[letterId]` | ƒ Dynamic | Protected |
| `/cases/[id]/letters/new` | ƒ Dynamic | Protected |
| `/cases/[id]/interactions/new` | ƒ Dynamic | Protected |
| `/cases/[id]/export` | ƒ Dynamic | Protected |
| `/letters` | ƒ Dynamic | Protected |
| `/reminders` | ƒ Dynamic | Protected |
| `/settings`, `/settings/profile`, `/settings/billing`, `/settings/notifications`, `/settings/account` | ƒ Dynamic | Protected |
| `/journeys`, `/journeys/new`, `/journeys/[id]` | ƒ Dynamic | Protected |
| `/packs` | ƒ Dynamic | **PUBLIC** (not in middleware) |
| `/packs/success` | ƒ Dynamic | Protected |
| `/shared/[token]` | ƒ Dynamic | **PUBLIC** (no auth) |
| `/admin`, `/admin/users`, `/admin/b2b`, `/admin/companies`, `/admin/companies/[id]`, `/admin/categories` | ƒ Dynamic | Auth-protected (not role-checked in middleware) |
| `/templates`, `/templates/[slug]` | ○/● Static | Marketing |
| `/escalation-guides`, `/escalation-guides/[category]` | ○/● Static | Marketing |
| `/calculator`, `/guides/[slug]`, `/companies`, `/companies/[slug]` | ○/● Static/SSG | Marketing |
| `/pricing`, `/packs`, `/about`, `/business`, `/how-it-works`, `/privacy`, `/terms` | ○ Static | Marketing |

#### 3.2 Navigation Links vs Routes

**Sidebar (`Sidebar.tsx`) + MobileNav (`MobileNav.tsx`) nav items:**

| Label | href | Route Exists? | Notes |
|-------|------|---------------|-------|
| Dashboard | `/dashboard` | ✅ | Protected |
| My Cases | `/cases` | ✅ | Protected |
| New Case (+) | `/cases/new` | ✅ | Protected |
| Letters | `/letters` | ✅ | Protected |
| Packs | `/dashboard/packs` | ✅ | Protected |
| Templates | `/templates` | ✅ | **Marketing page** (no dashboard sidebar) |
| Calculator | `/calculator` | ✅ | **Marketing page** (no dashboard sidebar) |
| Guided Journeys | `/journeys` | ✅ (Sidebar only) | Protected; **absent from MobileNav** |
| Escalation Guides | `/escalation-guides` | ✅ | **Marketing page** (no dashboard sidebar) |
| Reminders | `/reminders` | ✅ | Protected |
| Settings | `/settings` | ✅ | Protected |

⚠️ **Templates, Calculator, Escalation Guides** — clicking these from the dashboard nav navigates to marketing-layout pages (no sidebar/header). This is a degraded UX for authenticated users but not a 404.

⚠️ **Guided Journeys** (`/journeys`) appears in Sidebar but NOT in MobileNav. The MobileNav shows 10 items; Sidebar shows 11. Mobile users cannot navigate to Journeys from the hamburger menu.

#### 3.3 Mobile Navigation
✅ `MobileNav.tsx` exists at `src/components/layout/MobileNav.tsx`.

✅ **Closes on route change:** `useEffect(() => { setIsOpen(false); }, [pathname])` added in the previous fix session.

✅ **Closes on link click:** `onClick={() => setIsOpen(false)}` on each `<Link>`.

✅ **Overlay/backdrop:** shadcn `Sheet` uses Radix Dialog internally, which closes on overlay click and Escape key by default.

✅ **Active state for `/cases`:** Fixed in previous session — `/cases` uses exact-match, so `/cases/new` does not highlight the My Cases item.

#### 3.4 Bottom Tab Bar
✅ `BottomTabBar.tsx` exists at `src/components/layout/BottomTabBar.tsx`.

**Tab hrefs:**
- Home → `/dashboard` ✅
- Cases → `/cases` ✅
- "+" (action) → opens `InteractionModal` (not `/cases/new`) — intentional; this is for quick interaction logging, not case creation. ✅
- Reminders → `/reminders` ✅
- Settings → `/settings/profile` ✅

⚠️ The "+" button opens an interaction-log modal. The prompt asked if it navigates to `/cases/new`. It does not — this is a distinct UX action. There is no "New Case" in the bottom tab bar (the MobileNav hamburger menu has "New Case (+)").

✅ Active state: Cases tab uses `startsWith('/cases')` which correctly remains active on all `/cases/*` sub-routes. No competing "New Case" tab in the bottom bar creates a dual-active problem here.

#### 3.5 Dynamic Routes
✅ `/cases/[id]` — `page.tsx` exists. `if (!caseData) notFound()` at line 112. Auth check + `user_id` filter prevents IDOR on data reads.

✅ `/shared/[token]` — `src/app/(marketing)/shared/[token]/page.tsx` exists. Queries `cases WHERE share_token = ? AND is_shared = true`. Calls `notFound()` if no result. No auth required. ✅

✅ `/templates/[slug]` — exists, uses `generateStaticParams`.

✅ `/escalation-guides/[category]` — exists, uses `generateStaticParams`.

✅ `/guides/[slug]` — exists, uses `generateStaticParams`.

✅ `/companies/[slug]` — exists, uses `generateStaticParams`.

✅ `/journeys/[id]` — exists, auth-protected.

✅ `/admin/companies/[id]` — exists, auth-protected.

---

### Section 4: Core User Flows (Code Trace)

#### 4.1 Registration
✅ **Flow:** `RegisterClient.tsx` → `supabase.auth.signUp({ email, password, options: { data: { full_name }, emailRedirectTo } })` → on success: `toast.success("Check your email to confirm your account")` → `router.push("/login")`.

✅ **Profile creation:** Handled by the `handle_new_user` database trigger (defined in initial migration) which fires on `auth.users` INSERT. The `/callback` route also upserts to profiles on OAuth signup.

✅ **Google OAuth:** `supabase.auth.signInWithOAuth({ provider: "google", ... })` → redirects to `/callback`.

✅ **Post-registration:** User lands on `/login` (email verification flow). After verifying email and logging in, user lands on `/dashboard`.

#### 4.2 Login
✅ **Password flow:** `LoginClient.tsx` → `supabase.auth.signInWithPassword({ email, password })` → on success: `router.push("/dashboard"); router.refresh()`.

⚠️ **`?next=` param ignored:** Hardcoded `/dashboard` redirect. Users arriving from middleware auth-redirect always land on `/dashboard` regardless of their original destination.

✅ **Magic link:** `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: getAuthCallbackUrl() } })`.

✅ **Google OAuth:** `supabase.auth.signInWithOAuth({ provider: "google" })`.

✅ **OAuth callback:** `src/app/(auth)/callback/route.ts` — exchanges code for session, upserts profile, sends welcome email (non-blocking), tracks signup event.

❌ **Open redirect:** Line 60 — `NextResponse.redirect(new URL(next, request.url))` with unvalidated `next` param.

#### 4.3 Case Creation
✅ **Full flow:** `CaseWizard.tsx` → `createCase()` server action in `src/lib/actions/cases.ts`.

✅ **Column trace:** All INSERT columns validated against schema (see Section 2.1).

✅ **Organisation selection:** Both "select existing" (sets `organisation_id`) and "add new org inline" (inserts org first, gets ID) paths handled. RLS allows authenticated INSERT on organisations.

✅ **`ref` trigger:** Auto-generates `TP-XXXXX` on INSERT. App code does not provide `ref`.

✅ **Post-creation redirect:** `redirect(`/cases/${newCase.id}?created=true`)` in `createCase`.

✅ **Feature gate:** `canCreateCase(profile)` checked before insert. Free users limited to 1 case.

#### 4.4 Interaction Logging
✅ **Full flow:** `LogInteractionForm` → `logInteraction()` server action.

✅ **All required NOT NULL columns provided:** `case_id, user_id, interaction_date, channel, direction, summary`.

✅ **Promise reminders:** If `has_promise && promises_made && promise_deadline`, three reminder rows inserted (`promise_deadline` type) for day-before, day-of, and day-after. ✅

✅ **Timeline refresh:** `revalidatePath(\`/cases/${input.case_id}\`)` and `/cases/${input.case_id}/timeline` called. ✅

✅ **Auto-summary (fire-and-forget):** `quickSummary()` called for long interactions; errors are swallowed to not block the response.

#### 4.5 AI Letter Generation
✅ **Flow:** Letter button → `POST /api/ai/draft-letter` → rate limit check → profile/tier check → monthly usage check (free tier) → Anthropic API call → letter INSERT → credit decrement.

✅ **Credit check at 0:** Free users hitting the monthly `letters` limit receive `{ error: "limit_reached", ... }` with HTTP 403. Paid users with `letterLimit === 0` (shouldn't happen with current tier config) get `error: "upgrade_required"`.

✅ **`letter_type` CHECK:** All 11 valid types confirmed in `letter-templates.ts`. The route casts `letterType as LetterInsert["letter_type"]`. If a client sends an invalid type, it would fail the DB constraint — but the Zod schema validates input is a non-empty string (not enum-validated at API level). ⚠️ Minor: the API doesn't validate `letterType` against the allowed enum at the application layer.

✅ **Anthropic API key:** `process.env.ANTHROPIC_API_KEY` referenced in `src/lib/ai/client.ts`. Documented in `.env.local.example`.

#### 4.6 Stripe Subscription
✅ **Flow:** Pricing page → checkout button → `POST /api/stripe/checkout` → Stripe Checkout session with `mode: 'subscription'` → redirect to Stripe hosted page → success → `POST /api/webhooks/stripe`.

✅ **Webhook handler:** `src/app/api/webhooks/stripe/route.ts` (453 lines). Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`, `charge.refunded`.

✅ **Webhook signature verification:** `stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)`. Verified via `svix`-backed signature. ✅

❌ **Stripe `canceled` vs `cancelled`:** `customer.subscription.updated` handler (lines 209–237) casts `subscription.status` to `"cancelled"` TypeScript type but does not transform the runtime string. Stripe sends `"canceled"` (one l) which fails the DB CHECK constraint. See Critical Failure #1.

✅ **Profile updates on payment:** `checkout.session.completed` correctly sets `subscription_tier`, `subscription_status: 'active'`, `subscription_id`, `stripe_customer_id`.

✅ **Stripe price IDs:** `STRIPE_PRICE_ID_BASIC_MONTHLY`, `STRIPE_PRICE_ID_BASIC_ANNUAL`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_ANNUAL` — all referenced in `api/stripe/checkout/route.ts`. ✅

⚠️ **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`:** Documented in `.env.local.example` and `@stripe/stripe-js` is in deps, but no usage found in `src/`. Client-side Stripe.js integration appears unimplemented.

#### 4.7 Stripe Pack Purchase
✅ **Flow:** Packs page → buy button → `POST /api/packs/checkout` → Stripe Checkout session with `mode: 'payment'` → redirect → `POST /api/webhooks/stripe` (`checkout.session.completed`, `payment_intent.payment_mode`).

✅ **`complaint_packs` INSERT:** All required columns inserted via Stripe webhook on successful payment.

✅ **Profile credits:** Free users get `subscription_tier: 'pro', subscription_status: 'pack_temporary'` and `pack_pro_expires_at` set for 30 days.

✅ **RLS on complaint_packs:** Fixed — now uses `complaint_packs_select_own` and `complaint_packs_insert_own` (authenticated, own rows). Service role bypasses for webhook inserts.

#### 4.8 PDF Export
✅ **Route exists:** `src/app/api/export/pdf/route.ts`.

✅ **PDF generation:** Uses `@react-pdf/renderer` (`renderToBuffer`). Package is in `dependencies`. ✅

✅ **Runtime:** `export const runtime = "nodejs"` — correctly set (react-pdf is incompatible with edge runtime).

✅ **Upload:** PDF is uploaded to the `evidence` Supabase Storage bucket under `exports/{userId}/{caseId}/{filename}`. Bucket exists (created in initial migration).

✅ **`exports` table INSERT:** All required columns provided.

✅ **Letter PDF export** also exists at `/api/export/letter-pdf`.

#### 4.9 Shareable Case Link
✅ **Share token generation:** `src/app/api/cases/[id]/share/route.ts` — POST generates `nanoid()` token, saves `share_token` and `is_shared: true` to the case row.

✅ **Public page:** `src/app/(marketing)/shared/[token]/page.tsx` — queries `cases WHERE share_token = token AND is_shared = true`. Uses `createServiceRoleClient()` (bypasses RLS). Returns `notFound()` if no match. ✅

✅ **Truly public:** Route is in `(marketing)` group (no middleware protection). No auth check in the page. ✅

✅ **Data exposure:** Only exposes: title, status, escalation_stage, created_at, first_contact_date, category, organisation name. Does NOT expose interactions, evidence, letters, owner contact info. ✅

#### 4.10 Cookie Consent → PostHog
✅ **Consent check:** `PostHogProvider.tsx` — `if (process.env.NODE_ENV === "production" && hasAnalyticsConsent())`. `hasAnalyticsConsent()` reads the `tp_consent` cookie.

✅ **`/ingest` proxy:** `api_host: "/ingest"` in `posthog.ts`. Next.js config rewrites `/ingest/:path*` to PostHog EU endpoint.

✅ **Single `posthog.init()` call:** Only one instance across entire codebase — in `src/lib/analytics/posthog.ts`, gated by `isInitialised` guard.

⚠️ **`CookieConsent.tsx` missing `Secure` attribute** on the `tp_consent` cookie.

❌ **Sentry Session Replay without consent:** `instrumentation-client.ts:7` — `replaysSessionSampleRate: 0.1` runs unconditionally for 10% of sessions, with no consent check.

#### 4.11 Reminders / Cron
✅ **Cron route exists:** `src/app/api/reminders/cron/route.ts`.

✅ **CRON_SECRET protection:** Checks `Authorization: Bearer ${CRON_SECRET}` header. Returns 401 if missing or wrong.

✅ **Resend integration:** Uses `src/lib/email/send.ts` which wraps the Resend SDK. `RESEND_API_KEY` required.

✅ **Vercel cron schedule:** `vercel.json` — `/api/reminders/cron` runs at `0 8 * * *` (08:00 UTC daily). ✅

#### 4.12 Email Sending (Letters to Companies)
✅ **Feature exists:** `src/app/api/letters/[id]/send/route.ts`.

✅ **Resend integration:** Uses Resend SDK with `RESEND_FROM_EMAIL` as the from-address.

⚠️ **Domain verification gate:** `if (process.env.RESEND_DOMAIN_VERIFIED !== "true") { return error }` — this guard prevents any email sending if the env var is not set to `"true"`. This is intentional for dev but must be set in production.

✅ **From address:** `RESEND_FROM_EMAIL` (e.g. `complaints@theypromised.app`) documented in `.env.local.example`.

---

### Section 5: Environment Variables

| Variable | `NEXT_PUBLIC_`? | In `.env.local.example`? | Required? | Notes |
|----------|----------------|--------------------------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | Required | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | Required | |
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | Required | Used for redirects, OG, sitemap |
| `NEXT_PUBLIC_APP_NAME` | ✅ | ✅ | Optional (defaults exist) | |
| `NEXT_PUBLIC_POSTHOG_KEY` | ✅ | ✅ | Optional | Analytics; gracefully skipped if absent |
| `NEXT_PUBLIC_POSTHOG_HOST` | ✅ | ✅ | Optional | ⚠️ Server-side only; `NEXT_PUBLIC_` prefix unnecessary |
| `NEXT_PUBLIC_SENTRY_DSN` | ✅ | ✅ | Optional | Error tracking |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | ✅ | Unknown | ⚠️ Documented but no `process.env` reference found in `src/` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | ✅ | Required | Admin client, webhooks, cron |
| `STRIPE_SECRET_KEY` | ❌ | ✅ | Required | All Stripe operations |
| `STRIPE_WEBHOOK_SECRET` | ❌ | ✅ | Required | Webhook signature verification |
| `STRIPE_PRICE_ID_BASIC_MONTHLY` | ❌ | ✅ | Required | Checkout |
| `STRIPE_PRICE_ID_BASIC_ANNUAL` | ❌ | ✅ | Required | Checkout |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | ❌ | ✅ | Required | Checkout |
| `STRIPE_PRICE_ID_PRO_ANNUAL` | ❌ | ✅ | Required | Checkout |
| `ANTHROPIC_API_KEY` | ❌ | ✅ | Required | AI letter generation |
| `RESEND_API_KEY` | ❌ | ✅ | Required | Email sending |
| `RESEND_FROM_EMAIL` | ❌ | ✅ | Required | Letter from-address |
| `RESEND_ADMIN_FROM` | ❌ | ✅ | Required | System emails |
| `RESEND_DOMAIN_VERIFIED` | ❌ | ✅ | Required | Feature flag; must be `"true"` to send email |
| `RESEND_WEBHOOK_SECRET` | ❌ | ✅ | Required | Delivery tracking webhooks |
| `UPSTASH_REDIS_REST_URL` | ❌ | ✅ | Optional | Rate limiting (falls back to allow-all) |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | ✅ | Optional | Rate limiting |
| `CRON_SECRET` | ❌ | ✅ | Required | Cron endpoint auth |
| `SEED_SECRET` | ❌ | ✅ | Required | Seed endpoint auth |
| `B2B_ALERT_EMAIL` | ❌ | ✅ | Optional | B2B SLA alerts |
| `SENTRY_AUTH_TOKEN` | ❌ | ✅ | Build-time only | Source map upload |
| `NODE_ENV` | n/a | n/a | Standard | Set by Next.js |

All 27 variables found in `src/` are documented in `.env.local.example`. No undocumented env vars found.

---

### Section 6: Error Handling & Edge Cases

#### 6.1 Custom 404 Page
✅ `src/app/not-found.tsx` exists. Custom branded page with links to Home, "Start a Case", and "Escalation Guides".

#### 6.2 Custom Error Page
❌ `src/app/error.tsx` — **DOES NOT EXIST**. Only `src/app/global-error.tsx` exists (root layout crash handler). Dashboard-level errors (e.g. Supabase query failure, network error) are not caught by any error boundary within the app shell. Users would see the `global-error.tsx` bare HTML fallback with no navigation.

❌ `src/app/(dashboard)/error.tsx` — **DOES NOT EXIST**.

✅ `src/app/global-error.tsx` — exists, captures to Sentry, shows an inline "Try again" reset button.

#### 6.3 Loading States
✅ `src/app/(dashboard)/dashboard/loading.tsx` — exists (spinner/skeleton).

✅ `src/app/(dashboard)/cases/loading.tsx` — exists.

⚠️ No `loading.tsx` files found for `/letters`, `/reminders`, `/settings`, `/journeys`, or `/cases/[id]`. These pages have no Suspense boundaries and will show blank content during server rendering.

#### 6.4 Empty States
✅ **Cases page (0 cases):** Renders a `<Card>` with "No cases yet" message and a "Create Your First Case" button (only if `canCreate`). Checked in `cases/page.tsx` lines 174–191.

✅ **Letters page (0 letters):** Renders "No letters yet" message when query returns no results. Checked in `letters/page.tsx`.

⚠️ **Interactions (case detail with 0 interactions):** The `CaseTimeline` component renders the timeline list; when empty, no explicit "no interactions yet" empty state was found in the component. Could not fully determine without running the app — the component file is at `src/components/cases/CaseTimeline.tsx`.

#### 6.5 Auth Protection
✅ **Middleware:** `src/middleware.ts` protects: `/admin`, `/dashboard`, `/cases`, `/settings`, `/reminders`, `/letters`, `/packs/success`, `/journeys`. Unauthenticated users redirected to `/login?next=<pathname>`.

✅ **Unauthenticated user visits `/cases`:** Middleware intercepts, redirects to `/login?next=/cases`. ✅

✅ **User A accessing User B's case (`/cases/[uuid]`):** Case page queries `supabase.from("cases").eq("id", id).eq("user_id", user.id)` — if user B's ID doesn't match, `caseData` is null, `notFound()` is called. RLS also enforces this at DB level. ✅

⚠️ **`generateMetadata` for `/cases/[id]`:** Queries case title without `user_id` filter (line 46–50). Any authenticated user can probe whether a case UUID exists and learn its title. Low-severity information leak.

⚠️ **`/admin` routes:** Middleware protects `/admin` by auth only. Admin role is not checked in middleware. Admin pages must perform their own role checks — verify each admin page individually.

---

### Section 7: SEO & Marketing Pages

#### 7.1 Homepage
⚠️ **Metadata:** `export const metadata` exists in `src/app/(marketing)/page.tsx`. ✅

❌ **Fake testimonials:** `src/app/(marketing)/HomePageClient.tsx` — `TESTIMONIALS` array at lines 111–133 contains three testimonials attributed to "Sarah T.", "Marcus L.", "Priya K." These are fabricated names with no verification mechanism. Potential ASA/CAP compliance issue.

❌ **"Join thousands":** Claim on homepage ("Join thousands of UK consumers who stopped being ignored") has no data backing. If the user base is in early stage, this is misleading.

❌ **SOCIAL PROOF PLACEHOLDER:** A JSX comment `{/* ── SOCIAL PROOF PLACEHOLDER ──*/}` appears in production code above an anonymous blockquote (no attribution, clearly fabricated). This is placeholder content not meant for production.

⚠️ **Pricing teaser hardcoded:** `£4.99/mo`, `£9.99/mo`, `Packs from £29` hardcoded and not driven by Stripe price data.

✅ **CTA link:** "Start for free" CTA links to `/register`. ✅

#### 7.2 Other Marketing Pages

All 17 marketing pages have `metadata` or `generateMetadata` exports. ✅

| Page | Route | Metadata | Notes |
|------|-------|----------|-------|
| Homepage | `/` | ✅ | Fake testimonials (see above) |
| How It Works | `/how-it-works` | ✅ | |
| About | `/about` | ✅ | |
| Business | `/business` | ✅ | |
| Calculator | `/calculator` | ✅ | |
| Companies | `/companies` | ✅ | |
| Companies/[slug] | `/companies/[slug]` | ✅ | |
| Escalation Guides | `/escalation-guides` | ✅ | |
| Escalation Guides/[category] | `/escalation-guides/[category]` | ✅ | |
| Guides/[slug] | `/guides/[slug]` | ✅ | |
| Packs | `/packs` | ✅ | Public (not middleware-protected) |
| Pricing | `/pricing` | ✅ | |
| Privacy | `/privacy` | ✅ | |
| Shared/[token] | `/shared/[token]` | ✅ | Public case share |
| Templates | `/templates` | ✅ | |
| Templates/[slug] | `/templates/[slug]` | ✅ | |
| Terms | `/terms` | ✅ | |

No placeholder/lorem ipsum text found on any page other than the homepage testimonials and social proof placeholder.

#### 7.3 Sitemap & Robots
✅ `src/app/sitemap.ts` — programmatic TypeScript sitemap. Covers all key static and dynamic routes. References `NEXT_PUBLIC_APP_URL`.

⚠️ **`lastModified: new Date()`** on every entry — all pages report today's date on every request, which is meaningless for crawl prioritisation.

✅ `src/app/robots.ts` — programmatic robots.ts. Allow list and disallow list both consistent with middleware protections. Sitemap URL included.

---

## Appendix: Files Checked

**Build artefacts:** `npm run build` output, `npx tsc --noEmit`, `npm run lint`

**Migration files (all 20):** `supabase/migrations/20260314170000_initial_schema.sql` through `supabase/migrations/20260317160000_critical_schema_fixes.sql`

**Application code:** `src/lib/actions/cases.ts`, `src/lib/actions/interactions.ts`, `src/lib/actions/outcomes.ts`, `src/lib/actions/journeys.ts`, `src/lib/ai/usage.ts`, `src/lib/ai/letter-templates.ts`, `src/lib/analytics/scorecards.ts`, `src/lib/stripe/feature-gates.ts`, `src/app/api/ai/draft-letter/route.ts`, `src/app/api/letters/[id]/send/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/app/api/reminders/cron/route.ts`, `src/app/api/export/pdf/route.ts`, `src/app/api/stripe/checkout/route.ts`, `src/app/api/packs/checkout/route.ts`, `src/app/(auth)/callback/route.ts`, `src/app/(auth)/login/LoginClient.tsx`, `src/app/(auth)/register/RegisterClient.tsx`, `src/app/(dashboard)/cases/[id]/page.tsx`, `src/app/(dashboard)/cases/page.tsx`, `src/app/(dashboard)/cases/new/page.tsx`, `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/letters/page.tsx`, `src/app/(marketing)/shared/[token]/page.tsx`, `src/app/(marketing)/HomePageClient.tsx`, `src/components/layout/MobileNav.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/BottomTabBar.tsx`, `src/components/CookieConsent.tsx`, `src/lib/analytics/posthog.ts`, `src/middleware.ts`, `instrumentation-client.ts`, `vercel.json`, `.env.local.example`, `src/types/database.ts`
