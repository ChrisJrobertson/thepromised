# TheyPromised — Full End-to-End Application Review

**Date:** 17 March 2026  
**Reviewer:** Autonomous Code Audit Agent  
**Branch:** `cursor/theypromised-application-review-3aeb`  
**Stack:** Next.js 15 / React 19 / TypeScript (strict) / Supabase / Stripe / Anthropic Claude / Resend / Tailwind v4

---

## Executive Summary

TheyPromised is a well-structured, architecturally coherent consumer complaint-tracking platform at approximately 70–75% completion for a B2C launch. The core case management lifecycle (create → log interactions → upload evidence → draft letters → export PDF) is fully implemented end-to-end. Authentication, subscription billing, complaint packs, the admin panel, and the email delivery pipeline are all functional. The codebase is cleanly organised, TypeScript-strict, and follows consistent patterns throughout.

However, several significant gaps prevent a confident launch:

1. **Guided Journeys is entirely absent from the frontend.** The AI prompts exist in `journey-prompts.ts` but there are no API routes, no database table, no UI components, and no tab on the case detail page.
2. **Three letter types (`adr_referral`, `section_75_claim`, `letter_before_action`) exist in `letter-templates.ts` but would violate the database `CHECK` constraint** — no migration has been applied to expand the letters table.
3. **The `notification_preferences` column is missing from the database** — the cron job references it, the settings form writes to it, but no migration has ever created it. The code silently swallows the `42703` (undefined column) error.
4. **The rate limiter is in-memory only** and will not function correctly on Vercel serverless across multiple instances.
5. **The Resend webhook has no signature verification**, allowing any caller to inject fake email delivery events.
6. **The marketing site has no mobile navigation**. On all screens below `md` breakpoint, the header nav is `hidden` with no drawer/hamburger fallback.
7. The `canUseAI()` feature gate uses a shared `ai_credits_used` counter against per-feature limits, creating incorrect cross-contamination (5 AI suggestions consumed = letters also blocked for basic users).
8. Multiple pages contain placeholder content (fabricated testimonials, dashed screenshot boxes, unsubstantiated statistics on the B2B page).

The platform is production-ready in architecture and data model. Fixing the items above — particularly the letter type migration, the notification preferences migration, a real rate limiter, the Resend webhook signature check, and the mobile nav — would constitute a releasable product.

---

## Part 1: First Contact — How Users Discover and Arrive

### 1a. Landing Page (`/`)

**Component:** `src/app/(marketing)/page.tsx` — rendered as a `"use client"` component (unnecessary; no dynamic data, only Framer Motion animations which could be extracted to sub-components)

**Hero section:** Headline reads "Hold Them to Account. Every Promise. Every Deadline." with sub-copy explaining the platform. Value proposition is reasonably clear within 5 seconds. CTAs above the fold: "Start Free — No Card Needed" → `/register` and "See How It Works" → `/how-it-works`. Both resolve correctly.

**SEO:** **MISSING.** The landing page has no `export const metadata` or `generateMetadata`. It relies entirely on the root `layout.tsx` fallback metadata. This is the highest-traffic page and has no unique OG title, description, or OG image.

**Trust bar:** Present. Contains: "256-bit Encryption", "UK Data Only", "GDPR Compliant", "No Credit Card", "14-Day Free Trial". Reasonable but no ICO/company registration number shown.

**Section-by-section audit:**

| Section | Status | Issues |
|---|---|---|
| Hero | ✓ Present | "Join thousands of UK consumers" — unsubstantiated claim at launch |
| Trust bar | ✓ Present | No company reg number |
| Social Proof Placeholder | ⚠ Placeholder | Explicitly labelled "Social Proof Placeholder"; contains one fabricated British Gas story and links to `/about` for "More stories" — but `/about` has no user stories |
| How It Works (steps) | ⚠ Partial | Step title and step number label are duplicated on consecutive lines (renders e.g. "1. Start your case" then "Start your case" again) |
| Testimonials | ⚠ Placeholder | Three fabricated names (Sarah T., Marcus L., Priya K.) — must be replaced before launch |
| AI Section | ✓ Present | Mock letter UI looks credible |
| Pricing Preview | ✓ Present | Links to `/pricing` |
| B2B Teaser | ✓ Present | Links to `/business` |
| Footer | ✓ Present | See §7e for footer detail |

**Footer company details:** The footer contains "SynqForge LTD" and references Company No. 16808271. The registered address is present but the contact email in the footer (`support@theypromised.app`) differs from the contact email on the About page (`hello@theypromised.app`). Inconsistency.

**Links audit:** All visible CTAs resolve to existing routes. No 404s on marketing page links found in code review.

---

### 1b. SEO Entry Points

**Pages WITH `generateMetadata` or `export const metadata`:**
- `/pricing/page.tsx` ✓
- `/templates/page.tsx` ✓
- `/templates/[slug]/page.tsx` ✓ (per-slug dynamic metadata)
- `/guides/[slug]/page.tsx` ✓ (per-org dynamic metadata)
- `/escalation-guides/[category]/page.tsx` ✓
- `/companies/[slug]/page.tsx` ✓
- `/shared/[token]/page.tsx` ✓ (correctly set to `noindex`)
- All `/settings/*` and `/admin/*` pages ✓

**Pages MISSING `generateMetadata`:**

| Page | Traffic Priority | Impact |
|---|---|---|
| `/` (landing) | **Highest** | **CRITICAL** — no SEO title/desc/OG |
| `/about` | Medium | Missing OG tags |
| `/how-it-works` | Medium | Missing OG tags |
| `/business` | Medium | Missing OG tags |
| `/calculator` | High | Missing OG tags + no JSON-LD |
| `/packs` | Medium | Missing OG tags |
| `/escalation-guides` (index) | High | Missing OG tags |
| `/companies` (index) | High | Missing OG tags |
| `/privacy` | Low | Acceptable |
| `/terms` | Low | Acceptable |

**Org guides (`/guides/[slug]`):** All 15 exist in `ORG_GUIDES` array (British Gas, EDF, OVO, BT, Sky, Virgin Media, HSBC, Barclays, Lloyds, HMRC, DWP, NHS, Amazon, Currys, TalkTalk). Each renders with unique `generateMetadata`. The `escalation_rules` query provides step-by-step content. If no DB rules exist for the category, a dashed "Detailed steps loading..." placeholder renders.

**Escalation guides (`/escalation-guides/[category]`):** 15 categories in `CATEGORY_TITLES` object (`energy`, `water`, `broadband_phone`, `financial_services`, `insurance`, `government_hmrc`, `government_dwp`, `government_council`, `nhs`, `housing`, `retail`, `transport`, `education`, `employment`, `other`). Three of these (`water`, `education`, `other`) are in `generateStaticParams` but **not linked from the index page**. They exist as accessible URLs but are unreachable through navigation.

**Company scorecards (`/companies/[slug]`):** Rendered dynamically. `getPublicScorecardIndex(5)` gates on ≥5 cases per company — on a fresh deployment with no data, `generateStaticParams` returns zero slugs and the index shows empty state.

**Sitemap (`/sitemap.ts`):** Exists and generates routes for marketing pages, org guides, escalation guides, templates, and company scorecards. `lastModified: new Date()` is set on every route (wasteful for crawler budget — all pages appear as modified on every crawl). Company scorecard routes will be empty until real data accumulates.

**Robots (`/robots.ts`):** `Disallow: ["/dashboard", "/cases", "/settings", "/admin", "/reminders", "/letters", "/packs"]` — correct. `/shared/[token]` routes are NOT disallowed (relying on per-page `noindex` metadata instead). `/api/*` is not disallowed (API routes return JSON/redirect, should be disallowed for crawler efficiency).

---

### 1c. Marketing Pages — Inventory

| Page | Loads | Content Complete | Has CTA | SEO Metadata | Mobile-Ready |
|---|---|---|---|---|---|
| `/how-it-works` | ✓ | ⚠ 4 screenshot placeholders (dashed boxes) | ✓ | ⚠ Missing OG | ⚠ No mobile nav |
| `/about` | ✓ | ⚠ No user stories | ✓ | ⚠ Missing OG | ⚠ No mobile nav |
| `/templates` | ✓ | ✓ 10 templates | ✓ | ✓ | ⚠ No mobile nav |
| `/templates/[slug]` | ✓ | ⚠ Step-by-step is generic on all | ✓ | ✓ | ⚠ No mobile nav |
| `/calculator` | ✓ | ⚠ Faulty tab shows text only, no number | ✓ | ⚠ Missing OG/JSON-LD | ⚠ No mobile nav |
| `/pricing` | ✓ | ✓ | ✓ | ✓ | ⚠ No mobile nav |
| `/packs` | ✓ | ✓ | ✓ | ⚠ Missing OG | ⚠ No mobile nav |
| `/escalation-guides` | ✓ | ✓ | ✓ | ⚠ Missing OG | ⚠ No mobile nav |
| `/escalation-guides/[category]` | ✓ | ⚠ Shows "coming soon" if no DB data | ✓ | ✓ | ⚠ No mobile nav |
| `/guides/[slug]` | ✓ | ⚠ Shows placeholder if no escalation rules | ✓ | ✓ | ⚠ No mobile nav |
| `/companies` | ✓ | ⚠ Empty on fresh deploy | ✓ | ⚠ Missing OG | ⚠ No mobile nav |
| `/companies/[slug]` | ✓ | ⚠ "Not enough data" on fresh deploy | ✓ | ✓ | ⚠ No mobile nav |
| `/business` | ✓ | ⚠ Fabricated stat; "not yet" in FAQ | ✓ | ⚠ Missing OG | ⚠ No mobile nav |
| `/privacy` | ✓ | ⚠ Lists Hugging Face processor (may be inaccurate) | N/A | ✓ | ⚠ No mobile nav |
| `/terms` | ✓ | ⚠ Prices hardcoded in legal text | N/A | ✓ | ⚠ No mobile nav |
| `/shared/[token]` | ✓ | ✓ | ✓ | ✓ (noindex) | ✓ (standalone layout) |

---

## Part 2: B2C Signup and Registration Flow

### 2a. Registration Page (`/register`)

**Methods available:** Email/password (with strength indicator: length, uppercase, number, confirmation) and Google OAuth. ✓

**Privacy trust text:** Present — "Your data is stored securely in the UK. We never share your information with the companies you're complaining about." ✓

**Privacy Policy link:** Present below the form. ✓

**On successful registration:**
- OAuth path: `(auth)/callback/route.ts` exchanges code, calls `supabase.auth.exchangeCodeForSession()`, then upserts profile, tracks `sign_up` event in PostHog, sends welcome email (non-blocking, fire-and-forget), sets Sentry user context. Redirects to `/dashboard`. ✓
- Email/password path: handled by Supabase's `signUp()` — `handle_new_user()` trigger fires on `auth.users INSERT` creating the `profiles` row. Redirect to `/dashboard` via `router.push`. ✓

**Email verification:** Based on code analysis, Supabase email confirmation settings are not overridden in code — this depends on Supabase project settings (not auditable from code alone). The registration form calls `supabase.auth.signUp()` without specifying `emailRedirectTo` for email verification — the user may be signed in immediately without email confirmation depending on project config.

**Welcome email:** `WelcomeEmail.tsx` template exists and is sent via Resend in the callback route. Template is complete with brand colours. ✓

**On registration failure:** Toast error messages shown via `sonner`. Duplicate email, OAuth errors, and weak passwords all surface toast messages. ✓

**"Already have an account?" link:** Present → `/login`. ✓

### 2b. Login Page (`/login`)

**Methods:** Email/password, Magic Link (passwordless email), and Google OAuth. Three distinct paths on a single form. ✓

**On success:** Redirects to `/dashboard` or `?next=` param destination. ✓

**On failure:** Toast messages for all error states. ✓

**Forgot password:** Full flow exists at `/forgot-password`. Sends Supabase reset email. Password strength indicator on the reset form. Redirect after reset to `/settings/profile`. ✓

**"Don't have an account?" link:** Present → `/register`. ✓

### 2c. Auth Middleware

**File:** `src/middleware.ts`

**Protected routes:** `/dashboard`, `/cases`, `/settings`, `/reminders`, `/letters`, `/admin`. Unauthenticated users redirected to `/login?next=<original_path>`. ✓

**Auth route redirect:** Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`. ✓

**Missing protections:**
- `/packs/success` (dashboard route) is NOT in the middleware matcher — a user who manually constructs this URL without auth could hit it (it would fail gracefully when querying Supabase but shows a confusing partial page).
- `/dashboard/packs` IS correctly within the `/dashboard` matcher. ✓

**Incorrectly protected routes:** None found. Marketing pages, `/privacy`, `/terms`, `/shared/[token]` all correctly accessible without auth.

---

## Part 3: B2C First-Time User Onboarding

### 3a. Empty Dashboard State

When `totalCases === 0`:
- **Onboarding card** ("Ready to hold them to account?") — ✓ Present, gradient primary background with two CTAs.
- **"Start Your First Case"** → `/cases/new` ✓
- **"Browse Escalation Guides"** → `/escalation-guides` ✓
- **Stat cards hidden** — ✓ All 4 stat cards are conditionally hidden when `totalCases === 0`.
- **Quick organisation search** below onboarding card — **MISSING.** There is no autocomplete org search on the empty dashboard. The CTA goes directly to `/cases/new`.
- **Sidebar/nav for new users:** Shows full 10-item nav. Potentially overwhelming; no progressive disclosure for new users.

### 3b. Case Creation Flow

**Route:** `/cases/new`

**Template pre-fill:** `?template=` query param is supported. `getComplaintTemplateById(template)` populates wizard fields. ✓

**Org pre-fill:** `?org=` query param is **NOT** supported. The `CaseWizard` only reads `template` from search params.

**CaseWizard — 4 steps:**
1. **Organisation** (`OrganisationStepForm`) — live trigram search of `organisations` table with debounce, OR create a new org inline. ✓
2. **Case Details** — title, description, category (dropdown), priority, reference number, desired outcome, amount in dispute. ✓
3. **First Interaction (optional)** — channel, date, summary, promises, outcome. Can be skipped. ✓
4. **Confirm** — review before submission. ✓

**Organisation search:** Uses trigram index via Supabase `.ilike()` — not direct SQL trigram but effective. Searches `name` with `%query%` pattern. Works for "British Gas", "BT", "HSBC". ✓

**Required fields:** Title and category are required. Organisation is required. Description, desired outcome, amount optional.

**Categories available:** All 15 from the `organisations.category` CHECK constraint. ✓

**On submission:** `createCase` server action called. Creates case with `user_id`, optional org creation, optional first interaction. Redirects to `/cases/[id]?created=true`. ✓

**`cases_count` increment:** Done via `update_case_count()` trigger on `cases INSERT`. ✓

**`?created=true` banner:** **PARTIALLY IMPLEMENTED.** The case detail page (`/cases/[id]/page.tsx`) does read `searchParams.created` but there is no special "guided journey prompt" banner. The page renders normally — the `?created=true` param is read but produces no visible UI difference from a normal case view. The intended "Start the Energy Billing Journey" prompt does not exist because Guided Journeys has no frontend.

### 3c. Post-Creation — The "Magic Moment" Path

- `?created=true` banner: No special UI triggered. **GAP.**
- Guided Journey prompt: **DOES NOT EXIST.** No `getAvailableJourneyId()` function, no journey template matching, no journey tab on case detail page.
- Journey categories with templates: `journey-prompts.ts` contains 18 prompt keys across 5 categories (energy, broadband, flight, bank, faulty products) — but these are used only by the `draft-letter` API route, not as a standalone journey system.
- Can user immediately log interaction? ✓ (Interactions tab → `/cases/[id]/interactions/new`)
- Can user generate AI letter? ✓ (Letters tab → `/cases/[id]/letters/new` → `LetterWizard`)
- Can user use AI analysis? ✓ (Right sidebar `AISuggestion` component)
- Can user upload evidence? ✓ (Evidence tab with `EvidenceUpload` component)

### 3d. AI Feature First Experience — Free Tier

**Free tier limits (from `AI_LIMITS` in `constants.ts`):**
- suggestions: 0
- letters: 0
- summaries: 0

**Free tier AI experience:** Free users **cannot access any AI feature at all** — all limits are 0. `canViewAISuggestions(profile)` returns `false` for free tier, so the AI analysis sidebar widget is hidden entirely.

The `feature-gates.ts` function `canUseAI(profile, "letters")` returns `false` for free (limit === 0). The new letter page shows an `UpgradePrompt` component. ✓

**`UpgradePrompt` component:** Located at `src/components/ui/UpgradePrompt.tsx`. Shows upgrade messaging with CTA.

**Paywall modal:** Present via `UpgradePrompt`. CTA links to `/pricing`. ✓

**Second case creation for free user:** `canCreateCase` returns `false` when `cases_count >= 1` for free tier. The cases page shows an upgrade prompt card and the "New Case" button is disabled with upgrade link. ✓

**Important note on `canUseAI` bug:** `canUseAI(profile, "letters")` checks `profile.ai_credits_used < AI_LIMITS[tier].letters`. Since `ai_credits_used` is a shared counter incremented by ALL AI actions (suggestions, letters, summaries), a Basic user who uses 5 AI suggestions has `ai_credits_used = 5`, which equals `AI_LIMITS.basic.letters = 5`, causing the UI to report that letters are also exhausted — even if the user has never generated a letter. The API route checks the per-feature `ai_letters_used` counter separately and would still allow the letter — but the UI shows the paywall incorrectly.

---

## Part 4: B2C Core Product Features — Case Lifecycle

### 4a. Case Detail Page (`/cases/[id]`)

The page runs 9+ parallel Supabase queries. Tabs available:

| Tab | Works | Content |
|---|---|---|
| Timeline | ✓ | `CaseTimeline` component — interactions in chronological order with channel icons, promise badges (kept/broken/overdue), mood indicators |
| Interactions | ✓ | Lists all interactions, links to `/cases/[id]/interactions/new` |
| Evidence | ✓ | `EvidenceGallery` (view) + `EvidenceUpload` (upload). `VoiceMemoRecorder` (Pro only) |
| Letters | ✓ | Lists letters with type, delivery status, link through to letter detail |
| Escalation | ✓ | Shows escalation stage stepper, escalation rules from DB, ombudsman links |
| **Journey** | **MISSING** | **No Journey tab exists** |

**Overview section:** Title, category badge, status badge (with `CaseActions` dropdown to change), priority indicator, escalation stage stepper, amount in dispute, desired outcome, reference number, interaction count, last interaction date. Right sidebar shows: case details card, reminders list, promise tracker, AI suggestion (for non-free), quick actions. ✓

**Complaint pack upsell:** Rendered for open cases on non-Pro tiers. ✓

**Response timer (`ResponseTimer`):** Shows 14-day countdown from `response_deadline`. Turns red when overdue. "Mark Response Received" calls `POST /api/cases/[id]/response-received`. ✓

**Email forwarding (`ForwardReplyPanel`):** Pro only. Generates an inbound email alias. The alias domain `ingest.theypromised.app` is hardcoded but there is no evidence this inbound email route is registered with any email provider. The `inbound_email_alias` is set on the case but the webhook at `/api/webhooks/inbound-email/route.ts` would need to be registered with a provider (e.g., Resend Inbound Email). **Partially implemented — alias generation works but delivery pipeline is incomplete.**

**Share button (`ShareCaseButton`):** Generates `share_token` via `POST /api/cases/[id]/share`, copies link to clipboard. Toggle off via `DELETE`. The shared view at `/shared/[token]` is publicly accessible. ✓

**Export:** Available via `/cases/[id]/export` → `ExportClient`. 3 types (Timeline Only, Letters Only, Full Case) with tier gating. Stored in `exports` table with Supabase Storage path. Previous exports listed but **no re-download link** available for past exports. ✓ (with re-download gap)

**Case status management:** `CaseActions` dropdown with 4 statuses (open, escalated, resolved, closed) and 4 priorities (low, medium, high, urgent). ✓

**Outcome tracking:** When resolving a case via `closeCase` server action, only `resolution_summary` and `resolved_date` are written. The schema has `compensation_received` column but the resolution UI does not prompt for it (the "did you get what you wanted / yes/partially/no / resolution type / amount received" flow does not exist). **GAP.**

### 4b. Interactions (Logging Evidence)

**Interaction types available (from `interactions.channel` CHECK):** `phone`, `email`, `letter`, `webchat`, `in_person`, `social_media`, `app`, `other`.

Note: The audit task expected types like `phone_call`, `email_sent`, `complaint_filed` etc. — the actual DB uses simpler channel types plus a `direction` field (`inbound`/`outbound`).

**InteractionForm fields:**
- Interaction date/time ✓
- Channel (dropdown) ✓
- Direction (inbound/outbound) ✓
- Contact name, department, role ✓
- Reference number ✓
- Duration (minutes) ✓
- Summary (required) ✓
- Promises made (text) + promise deadline ✓
- Outcome (dropdown) ✓
- Next steps ✓
- Mood indicator ✓
- Evidence file attachment ✓

**`interaction_count` update:** `update_interaction_count()` trigger fires on INSERT. ✓  
**`last_interaction_date` update:** Updated by same trigger on INSERT. ✓

### 4c. Promise Tracking

**Promise visibility on timeline:** `CaseTimeline` renders promise badges: ✓ (kept), ✗ (broken/overdue), ⏳ (pending). ✓

**Automatic reminder creation for promises:** `logInteraction` server action creates a `promise_deadline` reminder row when `promises_made` + `promise_deadline` are present. ✓

**Promise deadline cron:** `reminders/cron/route.ts` queries interactions with `promise_fulfilled IS NULL AND promise_deadline < NOW()` and sends `PromiseBrokenEmail`. ✓

**`PromiseBrokenEmail` template:** Exists at `src/lib/email/templates/PromiseBrokenEmail.tsx`. ✓

**Dashboard "Open Promises" stat:** Updated via the dashboard page's parallel query. ✓

### 4d. AI-Drafted Letters

**Letter types in `letter-templates.ts` (11 defined):**
1. `initial_complaint` ✓
2. `follow_up` ✓
3. `escalation` ✓
4. `final_response_request` ✓
5. `ombudsman_referral` ✓
6. `subject_access_request` ✓
7. `formal_notice` ✓
8. `custom` ✓
9. `adr_referral` ✓ (in templates, **MISSING from DB CHECK constraint**)
10. `section_75_claim` ✓ (in templates, **MISSING from DB CHECK constraint**)
11. `letter_before_action` ✓ (in templates, **MISSING from DB CHECK constraint**)

**CRITICAL:** The initial migration defines the `letters.letter_type` CHECK constraint with only 8 types. No subsequent migration expands this constraint. Attempting to save a letter of type `adr_referral`, `section_75_claim`, or `letter_before_action` will throw a PostgreSQL constraint violation error. The `LetterWizard` will silently fail on step 4 (generating letter) because the AI drafts fine but the INSERT fails.

**`buildLetterPrompt()`:** Includes letter type, template metadata, sender address, org details, case details, up to 8 recent interactions, and optional additional instructions. ✓

**Letter editing:** A4 textarea in `LetterWizard` step 4. Edit before sending. ✓

**Sending via email:** `SendLetterButton` calls `POST /api/letters/[id]/send` → Resend email. Sets response deadline, creates inbound alias, creates 4 reminder rows. ✓

**Delivery tracking:** Resend webhook at `/api/webhooks/resend/route.ts` updates `letters.delivery_status`, `delivered_at`, `opened_at`, `bounced_at`. However, **no HMAC signature verification** on the Resend webhook endpoint.

**`letter_type` CHECK constraint:** Migration needed to add `adr_referral`, `section_75_claim`, `letter_before_action`.

### 4e. Guided Journeys

**Status: DOES NOT EXIST as a frontend feature.**

| Component/Route | Status |
|---|---|
| `journey-prompts.ts` (AI prompts) | ✓ Exists — used by `draft-letter` route for journey context |
| Journey database table | **MISSING** — no migration |
| `GET /api/journeys` | **MISSING** |
| `POST /api/journeys` | **MISSING** |
| `GET /api/journeys/active` | **MISSING** |
| `POST /api/journeys/[id]/step` | **MISSING** |
| `POST /api/journeys/[id]/abandon` | **MISSING** |
| `JourneyWizard` component | **MISSING** |
| `JourneyProgress` component | **MISSING** |
| Journey tab on case detail page | **MISSING** |
| `JourneyProgressWidget` on dashboard | **MISSING** |
| 7 step renderers | **MISSING** |

The journey prompt definitions in `journey-prompts.ts` cover 5 categories (energy, broadband, flight, bank, faulty products) and 18 specific journey steps. These serve as context for the `draft-letter` endpoint's `promptContext` parameter — not as a standalone guided journey system.

### 4f. Escalation Engine

**Storage:** `escalation_rules` table. Data loaded via `POST /api/seed` (calls `seedEscalationRules()`).

**Seeded categories (from `escalation-rules.ts` seed):** All 15 categories have multi-stage escalation paths: `energy`, `water`, `broadband_phone`, `financial_services`, `insurance`, `government_hmrc`, `government_dwp`, `government_council`, `nhs`, `housing`, `retail`, `transport`, `education`, `employment`, `other`.

**Escalation path example (energy):**
1. Formal complaint → 8 weeks → Final Response Letter required
2. Deadlock/8 weeks passed → Energy Ombudsman (Ombudsman Services Energy)
3. Ombudsman resolution → binding on company
4. Unresolved → Consumer Council for Water / Ofgem

**Cron alerts:** Creates escalation window reminders at 42 days (6 weeks), 49 days (7 weeks), and 56 days (8 weeks) from `first_contact_date`. Sends `EscalationAlertEmail`. ✓

**AI analysis references escalation rules:** `buildCaseAnalysisPrompt()` includes case category, which informs AI responses about relevant escalation paths. ✓

**Bug in cron:** Line queries `.eq("stage", "ombudsman")` but the stage values in seed data use strings like `"ombudsman"` — this should work, but the query uses `stage` while the DB column might be `stage_order` (integer). The `stage` column IS present (it's a text field in the schema), so this appears correct.

### 4g. Reminders System

**Reminder types (from expanded CHECK constraint in migration 3):** `promise_deadline`, `escalation_window`, `follow_up`, `custom`, `response_approaching`, `response_due`, `response_overdue`, `notification`. ✓

**Creation methods:**
- Automatically from `logInteraction` (promise deadlines) ✓
- Automatically from `send` letter API route (response_approaching, response_due, response_overdue ×2) ✓
- Automatically from cron (escalation window alerts) ✓
- Manually from `/reminders` page (user creates custom reminders) ✓

**Viewing reminders:** `/reminders` page groups by Overdue / Today / This week / Later. ✓

**Dismiss reminders:** Client-side Supabase update, optimistic removal from UI. ✓

**Daily cron at `POST /api/reminders/cron`** (protected by `CRON_SECRET` bearer token):
- ✓ Resets `ai_suggestions_used`, `ai_letters_used`, `ai_credits_used` on the 1st of each month
- ✓ Reverts `pack_temporary` subscription status after `pack_pro_expires_at` passes
- ✓ Sends daily reminder digest emails to non-free users (respects `notification_preferences.email_reminders`)
- ✓ Creates 6/7/8-week escalation window reminders
- ✓ Creates expired escalation deadline reminders
- ✓ Sends `PromiseBrokenEmail` for overdue promises
- ✓ Sends B2B SLA alert emails for stale enquiries

**`notification_preferences` column:** **MISSING FROM DATABASE.** The code reads `profile.notification_preferences` and writes to it, but the column has never been added via migration. In `settings.ts`, the update catches error code `42703` (undefined column) and silently returns success. In the cron, `notification_preferences` is read via type cast with a null fallback — so the cron defaults to sending all emails to everyone. **All notifications are sent to all non-free users regardless of their preference settings.**

### 4h. Evidence & File Uploads

**Storage:** Supabase Storage `evidence` bucket. `public: false`, `file_size_limit: 10485760` (10MB). ✓

**Storage path structure:** `{userId}/{caseId}/{filename}` — paths are enforced by RLS (`foldername[1] = auth.uid()`). ✓

**File types:** All types accepted by the upload form. No explicit MIME type filtering found in `EvidenceUpload` component.

**Evidence types (from DB CHECK):** `screenshot`, `email`, `letter`, `photo`, `voice_memo`, `document`, `receipt`, `contract`, `other`. ✓

**View/download:** Signed URLs generated via `getEvidenceUrl()` server action. 1-hour expiry. **No ownership check in `getEvidenceUrl()`** — accepts raw `storagePath` string without verifying the requesting user owns that record. Any authenticated user who knows a storage path can generate a signed URL.

**PDF exports:** Evidence files are listed in the PDF export. ✓

### 4i. PDF Export

- Full export triggers `POST /api/export/pdf` → React-PDF document → Supabase Storage → `exports` table row. ✓
- Export types: `full_case`, `timeline_only`, `letters_only`. ✓
- Tier gating: Free = none; Basic = `timeline_only` and `letters_only`; Pro = all. ✓
- `profiles.last_export_at` updated. **MISSING** — the export route does not update this column; it records in `exports` table but the profile column is not updated.
- Previous exports listed in `ExportClient` with no re-download link.

### 4j. Compensation Calculator (`/calculator`)

**4 calculator tabs:**
1. **Flight Delay (UK261)** — fixed bands: £220 (1500km), £350 (1500–3500km), £520 (>3500km). Correct UK-specific amounts. ✓
2. **Energy Overcharge** — kWh × pence, monthly bill calculation. No VAT handling. ✓
3. **Broadband Speed Shortfall** — monthly credit based on % below promised speed. ✓
4. **Faulty Product (Consumer Rights Act 2015)** — shows text guidance, no numeric result. Inconsistent with other tabs.

**Legal disclaimer:** Present in the tips text of template data but NOT shown on the calculator page itself. Should be visible.

**CTA:** Links to `/register` generically. Does not pre-fill a case with calculated values.

**SEO:** Missing JSON-LD (`HowTo` or `FAQPage` schema) which would be highly valuable for "flight delay compensation calculator" type queries.

### 4k. Company Scorecards (`/companies`, `/companies/[slug]`)

**Data source:** `v_company_stats` view (service role only). `getPublicScorecardIndex(5)` — requires ≥5 cases per company. On a new deployment, the page shows empty state.

**Scorecard data shown:** Total cases, resolution rate, average resolution days, promise-keeping %, avg helpfulness score, escalation rate, total amount disputed. Composite grade (A–F). ✓

**Data quality:** All data is real (from user-submitted cases). No placeholder data after launch, but fresh deployment will show empty.

**Organisation count in index:** Determined by how many orgs have ≥5 cases. Zero at launch.

**Search/filter on index:** Present via `CompanyScorecardIndex` component — search input and category tabs. ✓

**Grade colour coding:** All progress bars are `bg-slate-800` regardless of grade. No A=green, F=red colouring.

**Scorecard `helpfulness_score`:** Shown as `X/4` without explaining the scale.

**SEO on individual pages:** `generateMetadata` with company name and score. ✓ Missing `Organization` JSON-LD schema which would be extremely valuable for brand searches.

---

## Part 5: B2C Monetisation — Subscriptions and Packs

### 5a. Pricing Page (`/pricing`)

**Tiers displayed:** Free, Basic (£4.99/month or £39.99/year), Pro (£9.99/month or £79.99/year). ✓

**Monthly/annual toggle:** Present in `PricingClient`. ✓

**Feature comparison:** Clear comparison table present. ✓

**Known issue:** Bottom CTA button text is identical for logged-in and logged-out states (conditional renders same string both ways).

### 5b. Subscription Flow — End to End

1. User clicks upgrade → `POST /api/stripe/checkout` ✓
2. Checkout session created with `price_id` from allowlist, `success_url` set to `/dashboard?upgraded=true`, `cancel_url` to `/pricing`, `client_reference_id: user.id`, `metadata: { userId, tier }` ✓
3. Stripe Checkout ✓
4. `checkout.session.completed` webhook → `POST /api/webhooks/stripe` ✓
5. Webhook updates `profiles`: `subscription_tier`, `subscription_status: "active"`, `stripe_customer_id`, `subscription_id` ✓
6. User redirected to `/dashboard?upgraded=true` — but **there is no special UI on the dashboard for `?upgraded=true`**. No success banner/message. **GAP.**
7. `SubscriptionConfirmEmail` sent? The webhook handler does NOT send a confirmation email. The email template exists (`SubscriptionConfirmEmail.tsx`) but is never called from the Stripe webhook. **GAP.**

### 5c. Subscription Management

**Stripe Customer Portal:** `POST /api/stripe/portal` → Stripe billing portal. Allows cancel, update payment method, view invoices. ✓

**Subscription cancelled (`customer.subscription.deleted` webhook):** `subscription_tier` → `"free"`, `subscription_status` → `"cancelled"`, `subscription_id` → `null`. ✓

**Payment failed (`invoice.payment_failed`):** Sets `subscription_status: "past_due"`. No email sent from the webhook (Stripe itself sends a failed payment email, which may be sufficient). The billing UI shows a "past_due" warning. ✓

**`invoice.paid`:** Updates next billing date, resets `ai_suggestions_used` and `ai_letters_used`. ✓

### 5d. Complaint Packs (`/packs`)

**Packs available:**
| Pack | Price | Key Entitlements |
|---|---|---|
| Starter | £29 | 1 letter, timeline export, 3 AI suggestions, case summary |
| Escalation | £49 | 3 letters, escalation guide, 5 AI suggestions, letter PDF export |
| Full Case File | £79 | 5 letters, full PDF, SAR template, evidence checklist, 10 AI suggestions |

**Pack checkout flow:**
1. User selects pack and (optionally) a case → `POST /api/packs/checkout` → Stripe checkout session ✓
2. `checkout.session.completed` webhook handles mode `"payment"` (vs subscription) ✓
3. Creates `complaint_packs` row with `checkout_session_id` (unique index prevents duplicates) ✓
4. Sets `profiles.subscription_status = "pack_temporary"`, `subscription_tier = "pro"`, `pack_pro_expires_at = now() + 7 days`, `pack_access_case_id` ✓
5. Cron reverts after expiry ✓

**Pack statuses:** `purchased`, `in_progress`, `fulfilled`, `refunded`, `cancelled`. ✓

**Pack access scoping:** `enforcePackScopedCaseAccess()` validates case ownership, expiry, and that an active pack row exists. ✓

**Note:** Pack pricing is hardcoded in application code (`config.ts`) using Stripe `price_data`, not Stripe price IDs. If prices change in `config.ts`, Stripe checkout immediately reflects new prices without any Stripe product history.

### 5e. Feature Gate Table

| Feature | Free | Basic | Pro | Source |
|---|---|---|---|---|
| Active cases | 1 | Unlimited | Unlimited | `canCreateCase()` |
| AI suggestions/month | 0 | 10 | 50 | `AI_LIMITS` / API route |
| AI letters/month | 0 | 5 | 30 | `AI_LIMITS` / API route |
| AI summaries/month | 0 | 100 | 500 | `AI_LIMITS` (not enforced separately — see bug) |
| PDF export (timeline/letters) | ✗ | ✓ | ✓ | `canExportPDF()` |
| PDF export (full case) | ✗ | ✗ | ✓ | `canExportPDF()` |
| Email reminders | ✗ | ✓ | ✓ | `canReceiveEmailReminders()` |
| Letter sending via email | ✓ | ✓ | ✓ | **Not gated** |
| Evidence uploads | ✓ | ✓ | ✓ | Not gated |
| Guided journeys | N/A | N/A | N/A | **Not built** |
| Company scorecards | ✓ | ✓ | ✓ | Public pages |
| Share case links | ✓ | ✓ | ✓ | Not gated |
| Voice memos | ✗ | ✗ | ✓ | `canRecordVoiceMemo()` |
| Email forwarding/parsing | ✗ | ✗ | ✓ | `canUseEmailForward()` |
| AI case analysis (sidebar) | ✗ | ✓ | ✓ | `canViewAISuggestions()` |

**Source of truth:** `src/lib/stripe/feature-gates.ts` and `src/lib/ai/constants.ts`. Limits are enforced at both API route level AND client/server component level. ✓

**Features SHOULD be gated but aren't:**
- Letter sending via email (free users can send letters via email which triggers Resend usage and creates response deadline reminders — potentially a cost concern)
- Evidence uploads (no limit on free tier)

**Features gated but SHOULDN'T be:**
- None identified.

---

## Part 6: B2B — Business Engagement and Pipeline

### 6a. For Business Marketing Page (`/business`)

**Value proposition:** "Know before they complain" — positioned as complaint intelligence and early resolution tool for businesses.

**`BusinessEnquiryForm`:** Present. Fields: `company_name`, `contact_name`, `email`, `role`, `website`, `sector`, `complaint_volume_estimate`, `message`, `consent_to_contact`. Honeypot field (`company_fax`). ✓

**Anti-spam:** IP-based rate limiting (5/hour via in-memory limiter), honeypot. ✓ (rate limiter is in-memory only — same limitation as main AI rate limiter)

**Data storage:** `business_enquiries` table with `source_ip`, `user_agent`. ✓

**Confirmation:** Inline success message shown. ✓

**Issue:** The business page contains: "British Gas breaks 68% of the promises made to our users. Wouldn't you want to know before it becomes a headline?" — presented as a red callout data statistic. This is fabricated placeholder data. Publishing this before it is substantiated with real user-sourced data creates legal liability (defamation/malicious falsehood risk).

### 6b. B2B Lead Pipeline (Admin)

**Admin panel at `/admin`:** Exists and is functional. Protected by `requireAdmin()` which checks `profiles.is_admin = true`. ✓

**Admin overview dashboard:** Platform stats via `v_platform_stats` view — total users, case counts, interaction counts, letter counts, signups over last 7/30 days, category breakdowns. ✓

**B2B pipeline at `/admin/b2b`:** Exists. Shows `business_enquiries` table and `b2b_pilots` table.

**Pipeline stages:** `enquiry`, `contacted`, `pilot_started`, `active`, `churned`. ✓

**Admin capabilities:**
- View all business enquiries ✓
- Change pilot status via `PATCH /api/admin/b2b` ✓
- Track outreach email delivery (via `b2b_outreach_emails` table updated by Resend webhook) ✓
- Manage pilot details (company, contact, fee, status) ✓
- `PATCH /api/admin/b2b` creates or updates `b2b_pilots` ✓
- Admin can send scorecard emails via `POST /api/admin/send-scorecard` ✓

### 6c. B2B Product Features — What Exists vs What's Missing

**Separate B2B customer portal:** **DOES NOT EXIST.** There is no login portal for business customers to see their own complaint data.

**`AdminViewToggle`:** Exists as a component in the sidebar for admin users. Appears to be a UI toggle but its actual functionality (what it does when toggled) was not fully verified from the component source.

**Business customer capabilities (none built):**
- See aggregated complaint data about their company: **MISSING** (data exists in `v_company_stats` but no B2B customer portal)
- Monitor complaint volumes / resolution rates: **MISSING**
- Benchmark against competitors: **MISSING**
- Receive escalation alerts: **MISSING**

**Database infrastructure ready for B2B product:**
- `b2b_pilots` table ✓
- `business_enquiries` table ✓
- `b2b_outreach_emails` table ✓
- `v_company_stats` view ✓
- `v_company_rankings` view ✓

### 6d. B2B Pricing

**On pricing page:** B2B teaser section present but no B2B pricing. ✓

**On business page:** Three pricing tiers shown (Insight £299/month, Professional £699/month, Enterprise £POA) but these are static placeholder text — no checkout flow, no Stripe products created for B2B subscriptions.

**Self-serve B2B signup:** **DOES NOT EXIST.** All B2B is enquiry-based and manually managed via the admin panel.

---

## Part 7: Navigation and Information Architecture

### 7a. Top Navigation (Logged Out)

Located in `(marketing)/layout.tsx`:

| Label | URL | Works? |
|---|---|---|
| How It Works | `/how-it-works` | ✓ |
| Templates | `/templates` | ✓ |
| Calculator | `/calculator` | ✓ |
| Pricing | `/pricing` | ✓ |
| Complaint Packs | `/packs` | ✓ |
| Escalation Guides | `/escalation-guides` | ✓ |
| Company Scorecards | `/companies` | ✓ |
| For Business | `/business` | ✓ |
| Log In | `/login` | ✓ |
| Start Free | `/register` | ✓ |

**Mobile:** All nav items are `hidden md:flex`. **On mobile there is no navigation at all** — no hamburger menu, no drawer. Users on mobile cannot navigate between marketing pages. **CRITICAL UX gap.**

### 7b. Top Navigation (Logged In)

The marketing layout does NOT detect auth state — a logged-in user visiting `/pricing` still sees "Log In" and "Start Free" buttons. The nav shows the same items regardless. A "Dashboard" link for authenticated users is absent.

### 7c. Dashboard Sidebar

Located in `src/components/layout/Sidebar.tsx`:

| Label | URL | Icon | Works? |
|---|---|---|---|
| Dashboard | `/dashboard` | Home | ✓ |
| My Cases | `/cases` | Folder | ✓ |
| New Case (+) | `/cases/new` | PlusCircle | ✓ |
| Letters | `/letters` | FileText | ✓ |
| Packs | `/dashboard/packs` | Package | ✓ |
| Templates | `/templates` | FileText | ✓ |
| Calculator | `/calculator` | Calculator | ✓ |
| Escalation Guides | `/escalation-guides` | Compass | ✓ |
| Reminders | `/reminders` | Bell | ✓ |
| Settings | `/settings` | Settings | → `/settings/profile` (settings index is placeholder) |
| Admin section | `/admin` | — | Admin-only, shown if `isAdmin` |

Note: "Letters" and "Templates" both use the `FileText` icon — minor duplication.

The sidebar is `hidden md:flex` — not visible on mobile. The `BottomTabBar` provides mobile navigation.

### 7d. Mobile Navigation

**`BottomTabBar`:** Present and implemented.

| Tab | URL | Notes |
|---|---|---|
| Home | `/dashboard` | ✓ |
| Cases | `/cases` | ✓ |
| Log | (modal) | Opens `InteractionModal` directly ✓ |
| Reminders | `/reminders` | ✓ |
| Settings | `/settings/profile` | Links directly to profile (bypasses placeholder settings index) ✓ |

The bottom tab bar only renders within the `(dashboard)` layout. It does not appear on marketing pages — but marketing pages have no mobile nav at all.

### 7e. Footer

Footer is in `(marketing)/layout.tsx`. Three columns:

**Product column:** Start Free, Pricing, Templates, Calculator, Escalation Guides, Complaint Packs

**Company column:** About, How It Works, For Business, Company Scorecards, Privacy Policy, Terms of Service

**Support column:** Support email, User Guide

**Missing links:** `/reminders`, `/guides` (org guides index doesn't exist — guides are accessed individually from the escalation guides page)

**Company info:** SynqForge LTD, Company No. 16808271, registered address present. ✓

---

## Part 8: Cross-Cutting Concerns

### 8a. Mobile Responsiveness

**CRITICAL GAP: Marketing site has no mobile navigation.** All header nav items are `hidden md:flex` with no hamburger/drawer fallback. On any screen below 768px, the entire navigation disappears.

**Dashboard/app:** Responsive via sidebar (desktop) + `BottomTabBar` (mobile) approach. Generally works well.

**Known responsive issues from code review:**
- `BusinessEnquiryForm` inputs lack `w-full` class — inputs may not be full-width on mobile.
- Company scorecard grade badges have no colour coding — less readable on small screens.
- Landing page hero section uses large `text-6xl` heading that may overflow on 375px.

### 8b. Error Handling

**Custom 404 page:** `global-error.tsx` exists for global errors. No specific `not-found.tsx` at the root level was found in the file listing — Next.js shows default 404. Individual routes (e.g., `cases/[id]`) call `notFound()` which would show the default 404 page.

**API failures:** All API routes have try/catch with user-friendly error messages returned as JSON. Client components use `sonner` toasts for error display. ✓

**AI API failures:** `quickSummary`, `classifyChannel`, `extractEntities`, `sentimentScore` all return `null` on failure (fire-and-forget used in `logInteraction`). The main AI routes (`suggest`, `draft-letter`) return proper error responses with status codes. ✓

**Stripe checkout failures:** No explicit handling found — user would remain on Stripe's error page or be redirected back to `/pricing`. No custom failure handling.

**File upload failures:** `EvidenceUpload` component uses try/catch and shows error state. ✓

### 8c. Performance

Build output is appended at the end of this document. Based on code analysis:

- **Largest page:** `/cases/[id]` page fetches 9+ parallel queries and renders `CaseTimeline` (799 lines) — likely the heaviest page.
- **Code splitting:** Using Next.js App Router which provides automatic code splitting per route. ✓
- **Images:** No `<Image>` (Next.js optimised) components found on marketing pages — static assets use `<img>` or SVG.
- **Root layout fonts:** Three font families loaded (Inter, DM_Sans, Geist_Mono) — modest overhead.

### 8d. Security

**RLS status for all tables:**

| Table | RLS Enabled | Policy Type |
|---|---|---|
| `profiles` | ✓ | SELECT/INSERT/UPDATE/DELETE own row only |
| `organisations` | ✓ | SELECT: any authenticated; INSERT/UPDATE/DELETE: service_role only |
| `cases` | ✓ | SELECT/INSERT/UPDATE/DELETE own rows only |
| `interactions` | ✓ | SELECT/INSERT/UPDATE/DELETE own rows only |
| `evidence` | ✓ | SELECT/INSERT/UPDATE/DELETE own rows only |
| `letters` | ✓ | SELECT/INSERT/UPDATE/DELETE own rows only |
| `escalation_rules` | ✓ | SELECT: any authenticated; INSERT/UPDATE/DELETE: service_role only |
| `reminders` | ✓ | SELECT/INSERT/UPDATE/DELETE own rows only |
| `exports` | ✓ | SELECT/INSERT/UPDATE/DELETE own rows only |
| `complaint_packs` | ✓ | SELECT: own; ALL: service_role |
| `business_enquiries` | ✓ | INSERT: public (anyone); no SELECT policy for anon/authenticated |
| `b2b_pilots` | ✓ | ALL: service_role only |
| `b2b_outreach_emails` | ✓ | ALL: service_role only |

**Analytics views:** `v_company_stats`, `v_platform_stats`, `v_monthly_trends`, `v_category_stats`, `v_company_rankings` are REVOKED from `anon` and `authenticated` — only accessible via service_role. ✓

**Cross-user case access:** Users cannot access another user's cases via URL manipulation because all queries include `.eq("user_id", user.id)` filters AND RLS policies enforce this. ✓

**Cron endpoint authentication:** Protected by `Authorization: Bearer ${CRON_SECRET}` header check. ✓

**Rate limiter:** In-memory only (`Map` in module scope). **Will not work correctly on Vercel serverless** — multiple function instances each have independent rate limit state; cold starts reset all counters. Must be replaced with Redis/Upstash.

**Resend webhook:** **NO SIGNATURE VERIFICATION.** Any caller who knows the endpoint URL can POST fake delivery events, potentially marking emails as delivered/opened when they were bounced, or injecting false states into the `letters` and `b2b_outreach_emails` tables.

**API keys:** `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are all server-only env vars (no `NEXT_PUBLIC_` prefix). ✓

**`getEvidenceUrl()` missing ownership check:** Accepts a raw `storagePath` string without verifying the requesting user owns the corresponding `evidence` record. Any authenticated user who knows or guesses a storage path can generate a 1-hour signed URL.

**`inbound_email_alias`:** Assigned locally via `nanoid()` but never registered with any inbound email routing provider. The format `{alias}@ingest.theypromised.app` implies a Resend Inbound or similar service, but there is no evidence this is configured.

**`deleteAccount` uses `supabase.auth.admin.deleteUser()`:** This should use the service-role client, not the user's RLS client. The `supabase` client here is created by `createClient()` (server-component client) which uses the user's JWT. `auth.admin` methods require service-role permissions. **This will likely fail silently.** The account deletion flow may not actually delete the auth user.

### 8e. Analytics & Monitoring

**PostHog:** Initialised in `PostHogProvider.tsx`. Cookie consent gating present via `CookieConsent.tsx`. ✓

**Tracked events (typed in `posthog.ts`):**
- `sign_up` (method: email | google)
- `case_created` (category, priority)
- `interaction_logged` (channel, has_promise)
- `letter_generated` (letter_type)
- `pdf_exported` (export_type)
- `subscription_started` (tier, period)
- `ai_analysis_requested` (tier)

**NOT explicitly tracked:**
- `subscription_upgraded` (separate from started)
- `subscription_cancelled`
- `ai_suggestion_requested` (mentioned in the audit spec but not in the typed helpers)
- Pack purchases
- Evidence uploads

**Sentry:** Configured in `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`. The note in the repo about "Sentry config file needs renaming for Turbopack compatibility" refers to the `instrumentation.ts` pattern — this is already the correct naming convention for Next.js 15 instrumentation.

**Cookie consent banner:** `CookieConsent.tsx` component exists. PostHog only fires after consent. ✓

**Vercel Analytics/Speed Insights:** Both included in root layout. ✓

### 8f. PWA

**`manifest.json`:** Present at `/public/manifest.json`. ✓

| Field | Value | Status |
|---|---|---|
| name | "TheyPromised" | ✓ |
| short_name | "TheyPromised" | ✓ |
| start_url | "/" | ✓ |
| display | "standalone" | ✓ |
| theme_color | "#1e3a5f" | ✓ |
| icons | SVG + 192px + 512px | ⚠ 192/512 PNG files referenced but may not exist in `/public` |
| shortcuts | New Case, My Cases | ✓ |

**Root layout:** `manifest.json` linked via `<link rel="manifest">`. `apple-mobile-web-app-capable`, `theme-color`, and `apple-touch-icon` meta tags present. ✓

**Icon files:** `public/` directory contains `icon.svg` and `icons/icon.svg` but **`icon-192.png` and `icon-512.png` are NOT present**. The manifest references PNG icons that don't exist. PWA install will fail to show the correct icon on Android and iOS.

---

## Part 9: Database Integrity Check

### 9a. Schema Completeness

| Table | Exists | Key Gaps |
|---|---|---|
| `profiles` | ✓ | Missing `notification_preferences` column (no migration) |
| `organisations` | ✓ | Trigram index (`gin_trgm_ops`) ✓ |
| `cases` | ✓ | All columns including response tracking, inbound alias ✓ |
| `interactions` | ✓ | `outcome` constraint expanded in migration 4 to include `letter_sent` ✓ |
| `evidence` | ✓ | All columns ✓ |
| `letters` | ✓ | **CHECK constraint only has 8 types — missing `adr_referral`, `section_75_claim`, `letter_before_action`** |
| `escalation_rules` | ✓ | All columns ✓ |
| `reminders` | ✓ | Expanded `reminder_type` CHECK (8 types) ✓ |
| `exports` | ✓ | All columns ✓ |
| `complaint_packs` | ✓ | Idempotency unique indexes ✓ |
| `business_enquiries` | ✓ | Anti-spam fields added in migration 6 ✓ |
| `b2b_pilots` | ✓ | Status CHECK constraint ✓ |
| `b2b_outreach_emails` | ✓ | Unique index on `resend_email_id` ✓ |

**Missing tables:**
- `journeys` (for Guided Journeys feature) — **MISSING**
- `journey_steps` (for step tracking) — **MISSING**

### 9b. Views

| View | Exists | Access | Notes |
|---|---|---|---|
| `v_company_stats` | ✓ | Service role only | Used by scorecard pages via admin client |
| `v_platform_stats` | ✓ | Service role only | Used by admin dashboard |
| `v_monthly_trends` | ✓ | Service role only | Used by admin |
| `v_category_stats` | ✓ | Service role only | Used by admin categories page |
| `v_company_rankings` | ✓ | Service role only | Used by admin |
| `v_dashboard_stats` | **MISSING** | — | Referenced in audit spec but does not exist; dashboard uses direct parallel queries |

### 9c. Triggers and Functions

| Trigger/Function | Exists | Works | Notes |
|---|---|---|---|
| `handle_new_user()` | ✓ | ✓ | Creates profile on auth.users INSERT; updated in migration 2 |
| `update_case_count()` | ✓ | ✓ | Increments/decrements `profiles.cases_count` |
| `update_interaction_count()` | ✓ | ✓ | Updates `cases.interaction_count` and `last_interaction_date` |
| `update_updated_at()` | ✓ | ✓ | Applied to profiles, cases, interactions, letters, complaint_packs, b2b_pilots, b2b_outreach_emails |

### 9d. Seed Data

**Organisation seed:** `src/lib/seed/organisations.ts` contains `SEED_ORGANISATIONS` with ~40 organisations. Loaded via `POST /api/seed`. Must be run manually after deployment.

**Escalation rules seed:** `src/lib/seed/escalation-rules.ts` contains multi-stage rules for all 15 categories. Loaded via `POST /api/seed`. Must be run manually.

**Stripe products:** Must be created via `npx tsx src/lib/stripe/setup.ts`. Must be run manually.

**All seed operations are manual.** There is a comment at the top of the dashboard page reminding about this. The `SEED_SECRET` env var must be set.

**`notification_preferences` column:** **NOT SEEDED OR MIGRATED.** The column does not exist in the database.

### 9e. RLS Policies Summary

All 13 tables have RLS enabled. See §8d for the complete policy table. No tables have RLS disabled. No overly permissive policies found — `business_enquiries` has an open INSERT (intentional for anonymous form submissions) but no open SELECT. `b2b_pilots` and `b2b_outreach_emails` are service_role only (intentional — no user-facing access needed).

**Gap:** `business_enquiries` has no SELECT policy for authenticated or service_role (other than ALL). The admin queries use the service role client which has implicit bypass, so functionally fine — but there's no explicit SELECT policy documenting this intent.

---

## Part 10: Gap Analysis

### 10a. Broken Features

| # | Feature | Severity | Detail |
|---|---|---|---|
| 1 | AI letter types `adr_referral`, `section_75_claim`, `letter_before_action` | **CRITICAL** | DB CHECK constraint violation on save — letter generation will silently fail for 3 of 11 types |
| 2 | `notification_preferences` never persists | **HIGH** | Column missing from DB; code silently swallows the error; all email preferences ignored by cron |
| 3 | `deleteAccount` auth user deletion | **HIGH** | Uses user-JWT client to call `auth.admin.deleteUser()` — likely fails silently; user profile deleted but auth row may remain |
| 4 | `canUseAI` shared credits counter | **MEDIUM** | `ai_credits_used` (shared) checked against per-feature limits — basic user who uses 5 suggestions sees letters incorrectly blocked in UI (API still works correctly) |
| 5 | Priority sort on cases list | **MEDIUM** | `case "priority"` falls through to `created_at DESC` sort — no actual priority ordering |
| 6 | `profiles.last_export_at` not updated | **LOW** | PDF export route doesn't update this column; export history page (if it uses this) would show stale data |
| 7 | Re-download of previous exports | **LOW** | ExportClient lists previous exports but no re-download link/button |
| 8 | Org name shown in new interaction header | **LOW** | `interactions/new/page.tsx` shows case title as org name |

### 10b. Missing UI for Existing Backend

| # | Backend | Severity | Detail |
|---|---|---|---|
| 1 | `notification_preferences` in DB (once added) | **HIGH** | Settings form exists but preferences can't be saved until migration is applied |
| 2 | `compensation_received` column in `cases` | **MEDIUM** | DB column exists but resolution flow never prompts for it |
| 3 | `resolution_type` outcome tracking | **MEDIUM** | No "did you get what you wanted / type of resolution" UI on case close |
| 4 | `v_company_stats` `helpfulness_score` explanation | **LOW** | Shown as `X/4` on scorecard without explaining the scale |
| 5 | `v_company_stats` grade colour coding | **LOW** | All progress bars are slate-800 regardless of grade |
| 6 | Previous export re-download | **LOW** | `exports` table has storage path but UI shows no re-download link |
| 7 | `b2b_pilots` B2B customer portal | **MEDIUM** | Table and pricing structure exist, no customer-facing portal |
| 8 | B2B pricing checkout | **MEDIUM** | Pricing tiers shown on `/business` page as static text; no Stripe products or checkout |

### 10c. Missing Backend for Existing UI

| # | UI Element | Severity | Detail |
|---|---|---|---|
| 1 | `ForwardReplyPanel` inbound email | **HIGH** | Alias generated in DB but `ingest.theypromised.app` domain not registered with any email provider; `/api/webhooks/inbound-email` endpoint exists but no provider registration |
| 2 | Upgrade success message | **MEDIUM** | Stripe redirects to `/dashboard?upgraded=true` but dashboard has no conditional UI for this param |
| 3 | `SubscriptionConfirmEmail` | **MEDIUM** | Template exists and is complete but never called from Stripe webhook or anywhere else |
| 4 | `?created=true` case creation banner | **MEDIUM** | Param is read in case detail page but no UI is triggered by it |
| 5 | Marketing nav on mobile | **CRITICAL** | Nav items exist but `hidden md:flex` with no mobile fallback |

### 10d. Incomplete User Journeys

| # | Journey | Severity | Detail |
|---|---|---|---|
| 1 | Guided Journeys (entire feature) | **CRITICAL** | No journey API routes, no journey DB table, no JourneyWizard UI, no Journey tab — the most distinctive feature of the product is entirely missing |
| 2 | Case resolution outcome capture | **HIGH** | User closes a case but is never asked how it resolved, what type of resolution, or how much compensation was received |
| 3 | Post-signup upgrade flow | **MEDIUM** | Stripe payment completes, user lands on dashboard with no success feedback; no `SubscriptionConfirmEmail` sent |
| 4 | First case "magic moment" | **MEDIUM** | `?created=true` triggers nothing; no guided prompt to start a journey or use AI analysis for first time |
| 5 | Calculator → case creation pre-fill | **LOW** | Calculator produces results but the "Start a case" CTA links generically to `/register`, not pre-filled |
| 6 | Marketing mobile navigation | **CRITICAL** | User on mobile can reach landing page but cannot navigate to any other marketing page |

### 10e. Missing Features

| # | Feature | Severity | Detail |
|---|---|---|---|
| 1 | Guided Journeys (full feature) | **CRITICAL** | See §4e — entirely absent from frontend |
| 2 | Mobile navigation on marketing site | **CRITICAL** | No hamburger/drawer for marketing pages |
| 3 | PWA icons (PNG) | **HIGH** | `icon-192.png` and `icon-512.png` referenced in manifest but not present in `/public/` |
| 4 | Resend webhook signature verification | **HIGH** | Security gap — any caller can inject delivery events |
| 5 | Real rate limiter (Redis) | **HIGH** | In-memory rate limiter won't function on Vercel serverless |
| 6 | `notification_preferences` migration | **HIGH** | Column missing from DB; entire notification preferences system broken |
| 7 | B2B customer portal | **HIGH** | B2B infrastructure in DB but no customer-facing portal |
| 8 | Custom 404 page | **MEDIUM** | No `not-found.tsx` at root level — shows Next.js default 404 |
| 9 | NHS/employment/water complaint templates | **MEDIUM** | These categories exist in escalation guides but have no complaint template |
| 10 | Subscription confirmation email | **MEDIUM** | Template complete but never sent |
| 11 | Company scorecard Organisation JSON-LD | **MEDIUM** | High SEO value for brand searches |
| 12 | Landing page SEO metadata | **CRITICAL** | No `metadata` export on the highest-traffic page |
| 13 | B2B self-serve checkout | **MEDIUM** | All B2B is manual/enquiry-based; no Stripe products for B2B plans |
| 14 | Org-specific escalation guide pages when no DB data | **MEDIUM** | Shows "loading" placeholder rather than static content |

### 10f. UX Issues

| # | Issue | Severity | Detail |
|---|---|---|---|
| 1 | Fabricated testimonials | **CRITICAL** | Three named testimonials are clearly placeholder — must be replaced |
| 2 | British Gas 68% statistic | **CRITICAL** | Unsubstantiated claim on B2B page — legal liability risk |
| 3 | `/about` linked as "More stories" but has no stories | **HIGH** | Broken user expectation from landing page |
| 4 | How-it-works step cards duplicate text | **MEDIUM** | Step number label and step title both render same text on landing page |
| 5 | Marketing nav invisible on mobile | **CRITICAL** | Entire site navigation hidden on mobile |
| 6 | "More stories →" link on landing goes nowhere | **HIGH** | `/about` contains no user stories |
| 7 | How-it-works screenshots are all dashed boxes | **HIGH** | 4 placeholder boxes visible to real users |
| 8 | Settings index is a `PagePlaceholder` | **MEDIUM** | `/settings` renders "Settings" with a link to `/settings/profile` — no actual settings hub |
| 9 | `canUseAI` false-positive blocking | **MEDIUM** | Basic users who use their suggestions quota see letters incorrectly gated in UI |
| 10 | Pricing page bottom CTA has identical text for logged-in/out | **LOW** | Conditional is pointless |
| 11 | Category slugs shown raw in CompanyScorecardIndex | **LOW** | `financial_services` displayed as "financial services" with no proper label |
| 12 | FAQ on B2B page says "not yet, but we're building that" | **MEDIUM** | Signals incompleteness to business prospects |
| 13 | `helpfulness_score` shown as X/4 | **LOW** | Scale unexplained to users |

### 10g. SEO Gaps

| # | Gap | Severity |
|---|---|---|
| 1 | Landing page has no `metadata` export | **CRITICAL** |
| 2 | `/about`, `/how-it-works`, `/business`, `/calculator`, `/packs`, `/escalation-guides` (index), `/companies` (index) missing OG/Twitter metadata | **HIGH** |
| 3 | `/companies/[slug]` missing `Organization` JSON-LD | **HIGH** |
| 4 | `/how-it-works` missing `HowTo` JSON-LD (it exists but step images are placeholders) | **MEDIUM** |
| 5 | `/calculator` missing `FAQPage` or `HowTo` JSON-LD | **HIGH** |
| 6 | Company scorecard pages empty on new deploy (nothing to index) | **MEDIUM** |
| 7 | Sitemap `lastModified: new Date()` on all routes (wasteful) | **LOW** |
| 8 | `/api/*` not disallowed in robots.txt | **LOW** |
| 9 | `/shared/[token]` not disallowed in robots.ts (relies on per-page noindex) | **LOW** |
| 10 | Water, education, other escalation guide categories not reachable from nav | **LOW** |

### 10h. Security Concerns

| # | Concern | Severity | Detail |
|---|---|---|---|
| 1 | Resend webhook: no signature verification | **HIGH** | Fake delivery events can be injected |
| 2 | In-memory rate limiter | **HIGH** | Does not work across serverless instances; all AI and business enquiry rate limits are bypass-able by hitting different function instances |
| 3 | `getEvidenceUrl()` no ownership check | **MEDIUM** | Any authenticated user with a known storage path can generate signed download URLs |
| 4 | `deleteAccount` uses wrong Supabase client for admin.deleteUser | **HIGH** | Auth user likely not deleted on account deletion — orphaned auth records |
| 5 | Analytics views inaccessible without service role | **LOW** | Correct by design — but should be documented |
| 6 | Pack checkout uses hardcoded price_data | **LOW** | Price changes in config are immediately live in Stripe with no audit trail |
| 7 | Business enquiry rate limit is IP-based only | **LOW** | Same email can submit unlimited enquiries from different IPs |

---

## Appendix A: Complete Route Map

| Route | Auth Required | Component | Status |
|---|---|---|---|
| `/` | No | `(marketing)/page.tsx` | Working (placeholder content, no SEO) |
| `/how-it-works` | No | `(marketing)/how-it-works/page.tsx` | Working (screenshot placeholders) |
| `/about` | No | `(marketing)/about/page.tsx` | Working (no stories) |
| `/templates` | No | `(marketing)/templates/page.tsx` | Working |
| `/templates/[slug]` | No | `(marketing)/templates/[slug]/page.tsx` | Working (generic step content) |
| `/calculator` | No | `(marketing)/calculator/page.tsx` + `CalculatorClient` | Working (faulty tab incomplete) |
| `/pricing` | No | `(marketing)/pricing/page.tsx` + `PricingClient` | Working |
| `/packs` | No | `(marketing)/packs/page.tsx` + `PacksCheckoutClient` | Working |
| `/escalation-guides` | No | `(marketing)/escalation-guides/page.tsx` | Working |
| `/escalation-guides/[category]` | No | `(marketing)/escalation-guides/[category]/page.tsx` | Working (empty without DB seed) |
| `/guides/[slug]` | No | `(marketing)/guides/[slug]/page.tsx` | Working (empty without DB seed) |
| `/companies` | No | `(marketing)/companies/page.tsx` + `CompanyScorecardIndex` | Working (empty without data) |
| `/companies/[slug]` | No | `(marketing)/companies/[slug]/page.tsx` | Working (empty without data) |
| `/business` | No | `(marketing)/business/page.tsx` | Working (placeholder stats, incomplete FAQ) |
| `/privacy` | No | `(marketing)/privacy/page.tsx` | Working |
| `/terms` | No | `(marketing)/terms/page.tsx` | Working |
| `/shared/[token]` | No | `(marketing)/shared/[token]/page.tsx` | Working |
| `/login` | No (redirect if auth) | `(auth)/login/page.tsx` | Working |
| `/register` | No (redirect if auth) | `(auth)/register/page.tsx` | Working |
| `/forgot-password` | No | `(auth)/forgot-password/page.tsx` | Working |
| `/callback` | No | `(auth)/callback/route.ts` | Working |
| `/dashboard` | Yes | `(dashboard)/dashboard/page.tsx` | Working |
| `/dashboard/packs` | Yes | `(dashboard)/dashboard/packs/page.tsx` | Working |
| `/cases` | Yes | `(dashboard)/cases/page.tsx` + `CasesClient` | Working (priority sort broken) |
| `/cases/new` | Yes | `(dashboard)/cases/new/page.tsx` + `CaseWizard` | Working |
| `/cases/[id]` | Yes | `(dashboard)/cases/[id]/page.tsx` | Working (no Journey tab) |
| `/cases/[id]/interactions/new` | Yes | `(dashboard)/cases/[id]/interactions/new/page.tsx` | Working |
| `/cases/[id]/letters` | Yes | `(dashboard)/cases/[id]/letters/page.tsx` | Working |
| `/cases/[id]/letters/new` | Yes | `LetterWizard` | Partial (3 letter types cause DB error) |
| `/cases/[id]/letters/[letterId]` | Yes | Letter detail page + `LetterActions` | Working |
| `/cases/[id]/export` | Yes | `ExportClient` | Working (no re-download for past exports) |
| `/cases/[id]/timeline` | Yes | Timeline print page | Working |
| `/letters` | Yes | `(dashboard)/letters/page.tsx` | Working |
| `/reminders` | Yes | `RemindersClient` | Working |
| `/settings` | Yes | `PagePlaceholder` | **Placeholder only** |
| `/settings/profile` | Yes | `ProfileForm` | Working |
| `/settings/account` | Yes | `AccountClient` | Working (delete may not work) |
| `/settings/billing` | Yes | `BillingClient` | Working |
| `/settings/notifications` | Yes | `NotificationsForm` | Working UI (preferences not persisted) |
| `/packs/success` | Yes | Pack success page | Working |
| `/admin` | Yes (admin) | Admin overview | Working |
| `/admin/users` | Yes (admin) | Users table | Working |
| `/admin/b2b` | Yes (admin) | B2B pipeline | Working |
| `/admin/categories` | Yes (admin) | Category stats | Working |
| `/admin/companies` | Yes (admin) | Companies table | Working |
| `/admin/companies/[id]` | Yes (admin) | Company detail | Working |
| `POST /api/ai/suggest` | Yes | AI case analysis | Working |
| `POST /api/ai/draft-letter` | Yes | AI letter drafting | Working (3 types cause DB error) |
| `POST /api/ai/summarise` | Yes | AI summarise | Working |
| `POST /api/stripe/checkout` | Yes | Stripe checkout | Working |
| `POST /api/stripe/portal` | Yes | Stripe portal | Working |
| `POST /api/webhooks/stripe` | No (Stripe sig) | Stripe webhook | Working |
| `POST /api/webhooks/resend` | No (**no sig verify**) | Resend webhook | Working but insecure |
| `POST /api/webhooks/inbound-email` | No | Inbound email | Route exists, provider not configured |
| `POST /api/packs/checkout` | Yes | Pack checkout | Working |
| `POST /api/reminders/cron` | CRON_SECRET | Daily cron | Working (notification_preferences silently fails) |
| `POST /api/export/pdf` | Yes | PDF generation | Working |
| `GET/POST /api/export/letter-pdf` | Yes | Letter PDF | Working |
| `GET /api/export/data` | Yes | Data export (JSON) | Working |
| `PATCH /api/letters/[id]` | Yes | Update letter | Working |
| `POST /api/cases/[id]/share` | Yes | Generate share token | Working |
| `DELETE /api/cases/[id]/share` | Yes | Remove share token | Working |
| `POST /api/cases/[id]/inbound-alias` | Yes | Generate email alias | Working (no provider registration) |
| `POST /api/cases/[id]/response-received` | Yes | Mark response received | Working |
| `POST /api/business-enquiries` | No | Business enquiry submit | Working |
| `GET /api/admin/stats` | Admin | Admin stats | Working |
| `PATCH /api/admin/b2b` | Admin | B2B pipeline management | Working |
| `POST /api/admin/send-scorecard` | Admin | Send B2B scorecard email | Working |
| `GET /api/admin/export` | Admin | Admin data export | Working |
| `GET/PATCH/DELETE /api/admin/companies/[id]` | Admin | Company management | Working |
| `POST /api/seed` | SEED_SECRET | Seed data | Working |
| `POST /api/account/delete` | Yes | Account deletion | Working (auth deletion may fail) |
| `GET /api/account/export` | Yes | Data export | Working |

---

## Appendix B: Complete Feature Matrix

| Feature | Free | Basic | Pro | Status | Key Files |
|---|---|---|---|---|---|
| Account creation | ✓ | ✓ | ✓ | Working | `register/page.tsx`, `callback/route.ts` |
| Google OAuth | ✓ | ✓ | ✓ | Working | `login/page.tsx` |
| Create case | 1 max | Unlimited | Unlimited | Working | `cases/new/CaseWizard.tsx`, `actions/cases.ts` |
| Log interactions | ✓ | ✓ | ✓ | Working | `InteractionForm.tsx`, `actions/interactions.ts` |
| Upload evidence | ✓ | ✓ | ✓ | Working | `EvidenceUpload.tsx`, `actions/evidence.ts` |
| Promise tracking | ✓ | ✓ | ✓ | Working | `CaseTimeline.tsx`, cron |
| AI case analysis | ✗ | ✓ | ✓ | Working | `AISuggestion.tsx`, `/api/ai/suggest` |
| AI letter drafting | ✗ | ✓ (5/mo) | ✓ (30/mo) | Partial (3 types break DB) | `LetterWizard.tsx`, `/api/ai/draft-letter` |
| AI interaction summary | ✗ | ✓ | ✓ | Working | `haiku.ts`, `/api/ai/summarise` |
| Voice memo recording | ✗ | ✗ | ✓ | Working | `VoiceMemoRecorder.tsx` |
| Email forwarding/parsing | ✗ | ✗ | ✓ | Partial (no provider) | `ForwardReplyPanel.tsx` |
| PDF export (timeline/letters) | ✗ | ✓ | ✓ | Working | `ExportClient.tsx`, `/api/export/pdf` |
| PDF export (full case) | ✗ | ✗ | ✓ | Working | Same |
| Email reminders | ✗ | ✓ | ✓ | Partial (prefs not persisted) | cron, notification emails |
| Guided Journeys | ✗ | ✗ | ✓ | **Not built** | `journey-prompts.ts` (partial) |
| Complaint packs | — | — | — | Working | `/packs`, pack checkout |
| Share case link | ✓ | ✓ | ✓ | Working | `ShareCaseButton.tsx` |
| Company scorecards | ✓ | ✓ | ✓ | Working (empty at launch) | `scorecards.ts` |
| Escalation guides | ✓ | ✓ | ✓ | Working (empty without DB seed) | escalation-guides pages |
| Org-specific guides | ✓ | ✓ | ✓ | Working (15 orgs) | `organisations.ts` |
| Complaint templates | ✓ | ✓ | ✓ | Working (10 templates) | `complaint-templates.ts` |
| Compensation calculator | ✓ | ✓ | ✓ | Working (faulty tab incomplete) | `CalculatorClient.tsx` |
| Subscription (Basic/Pro) | — | ✓ | ✓ | Working | Stripe checkout/webhook |
| Billing portal | — | ✓ | ✓ | Working | `/api/stripe/portal` |
| Admin panel | — | — | Admin | Working | `(admin)/*` |
| B2B pipeline management | — | — | Admin | Working | `/admin/b2b` |
| B2B customer portal | — | — | — | **Not built** | DB infrastructure ready |
| Notification preferences | ✗ | ✓ | ✓ | Broken (no DB column) | `NotificationsForm.tsx` |

---

## Appendix C: Recommended Priority Actions

### Priority 1 — Must Fix Before Launch (CRITICAL)

1. **Add mobile navigation to marketing layout** — Add a hamburger/drawer menu to `(marketing)/layout.tsx`. All nav items hidden on mobile makes the marketing site unusable on phones.

2. **Add SEO metadata to landing page** — Add `export const metadata` to `src/app/(marketing)/page.tsx` with title, description, openGraph, and twitter fields.

3. **Apply DB migration to expand `letters.letter_type` CHECK constraint** — Add `adr_referral`, `section_75_claim`, `letter_before_action` to the constraint. Until this is done, using 3 of 11 letter types throws a DB error.

4. **Remove fabricated testimonials and placeholder statistics** — Replace the 3 fake testimonials on the landing page, the "Social Proof Placeholder" section, and the British Gas 68% statistic on the B2B page before any real users see these pages.

5. **Remove dashed screenshot placeholders on `/how-it-works`** — Replace the 4 dashed boxes with real screenshots or UI mockups.

6. **Add PWA PNG icons** — Create `icon-192.png` and `icon-512.png` and add to `/public/`. PWA installation currently fails to show the app icon.

### Priority 2 — Fix Before First Real Users

7. **Apply `notification_preferences` migration** — Add `notification_preferences JSONB DEFAULT '{}'::jsonb` column to `profiles`. The entire notification settings UI and all cron-based email preference gating depend on this.

8. **Add Resend webhook signature verification** — Validate the `Svix-Signature` header in `/api/webhooks/resend/route.ts` using Resend's signing secret.

9. **Replace in-memory rate limiter with Upstash Redis** — The current `checkRateLimit()` function does not work on Vercel serverless. Add `@upstash/ratelimit` and `@upstash/redis`.

10. **Fix `deleteAccount` Supabase client** — Replace the user-JWT Supabase client with the service-role admin client for `auth.admin.deleteUser()` in `actions/settings.ts`.

11. **Fix `canUseAI` credits counter confusion** — Update `canUseAI(profile, feature)` to check `profile.ai_suggestions_used` (for suggestions) and `profile.ai_letters_used` (for letters) rather than the shared `profile.ai_credits_used`.

12. **Add OG metadata to high-priority marketing pages** — `/about`, `/how-it-works`, `/business`, `/calculator`, `/packs`, `/escalation-guides` index, `/companies` index all need openGraph metadata.

13. **Fix `getEvidenceUrl()` ownership check** — Before generating a signed URL, verify the storage path corresponds to an evidence record owned by the requesting user.

14. **Send `SubscriptionConfirmEmail` from Stripe webhook** — The template is ready; add the `sendEmail(subscriptionConfirmEmail(...))` call to the `checkout.session.completed` handler.

15. **Add upgrade success banner on dashboard** — Read `?upgraded=true` param and show a toast or banner.

### Priority 3 — Within First Week Post-Launch

16. **Build Guided Journeys feature** — Create `journeys` and `journey_steps` tables, all 5 API routes, the `JourneyWizard` component with 7 step renderers, the Journey tab on case detail, and the `JourneyProgressWidget` on the dashboard.

17. **Add `?created=true` first-case experience** — On case detail with `?created=true`, show a banner with next step options (use AI analysis, add an interaction, start a journey for supported categories).

18. **Add resolution outcome capture** — When closing a case, prompt: "Did you get what you wanted?" (yes/partially/no), resolution type, compensation amount. Write to `compensation_received` and `resolution_summary`.

19. **Register inbound email provider** — Configure `ingest.theypromised.app` with Resend Inbound (or equivalent) to complete the email forwarding pipeline.

20. **Add custom 404 page** — Create `src/app/not-found.tsx` with brand-appropriate design and navigation CTAs.

### Priority 4 — Quality Polish

21. **Add `Organization` JSON-LD to company scorecard pages** — High SEO value for brand name searches.

22. **Add grade colour coding to company scorecard** — A=green, B=blue-green, C=yellow, D=orange, F=red for progress bars and badges.

23. **Add `?org=` param support to `/cases/new`** — Allow deep-linking to case creation with a specific org pre-selected.

24. **Fix "More stories" link on landing page** — Either add real user stories to `/about` or change the link destination.

25. **Fix duplicate text on how-it-works cards** — Remove the redundant step-label `<p>` tag that duplicates the card `<h3>` title.

26. **Replace `PagePlaceholder` on `/settings`** — Build a proper settings hub with cards linking to Profile, Account, Billing, and Notifications subsections.

27. **Fix `canCreateCase` check for pack-temporary users** — A user with `pack_temporary` subscription and `cases_count >= 1` should still be able to create cases for the duration of their pack access.

28. **Add `HowTo` JSON-LD to `/calculator` page** — Highly valuable for flight delay and energy calculator search queries.

29. **Disallow `/api/*` and `/shared/*` in robots.ts** — Cleaner crawler budget management.

30. **Fix pricing page bottom CTA conditional** — Render "Go to Dashboard" or "View My Cases" for logged-in users instead of "Start Your Case — Free".

---

## Build Output

Build completed successfully. `npm run build` exited with code 0.

```
▲ Next.js 15.5.12
   - Experiments (use with caution):
     · clientTraceMetadata

   [@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your `sentry.client.config.ts`
   file, or moving its content to `instrumentation-client.ts`. When using Turbopack
   `sentry.client.config.ts` will no longer work.
   Read more: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client

   <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (139kiB, 189kiB, 140kiB)
   impacts deserialization performance (consider using Buffer instead)

 ✓ Compiled successfully in 29.7s
 ✓ Linting and checking validity of types
 ✓ Generating static pages (101/101)
 ✓ Finalizing page optimization
 ✓ Collecting build traces

Route (app)                                            Size  First Load JS
┌ ○ /                                               46.4 kB         228 kB
├ ○ /_not-found                                        1 kB         181 kB
├ ○ /about                                            207 B         182 kB
├ ƒ /admin                                          1.14 kB         183 kB
├ ƒ /admin/b2b                                      2.23 kB         191 kB
├ ƒ /admin/categories                                 207 B         182 kB
├ ƒ /admin/companies                                1.45 kB         183 kB
├ ƒ /admin/companies/[id]                             207 B         182 kB
├ ƒ /admin/users                                      945 B         181 kB
├ [API routes: all 226 B / 180 kB — 27 routes]
├ ○ /business                                       1.31 kB         181 kB
├ ○ /calculator                                      1.7 kB         183 kB
├ ƒ /callback                                         226 B         180 kB
├ ƒ /cases                                          5.46 kB         255 kB
├ ƒ /cases/[id]                                       17 kB         394 kB   ← largest page
├ ƒ /cases/[id]/export                              5.21 kB         215 kB
├ ƒ /cases/[id]/interactions/new                      319 B         368 kB
├ ƒ /cases/[id]/letters                             1.16 kB         196 kB
├ ƒ /cases/[id]/letters/[letterId]                  6.21 kB         236 kB
├ ƒ /cases/[id]/letters/new                         8.22 kB         216 kB
├ ƒ /cases/[id]/timeline                            1.82 kB         309 kB
├ ƒ /cases/new                                      12.5 kB         368 kB
├ ○ /companies                                        990 B         182 kB
├ ƒ /companies/[slug]                                 207 B         182 kB
├ ƒ /dashboard                                       2.4 kB         375 kB
├ ƒ /dashboard/packs                                  207 B         182 kB
├ ○ /escalation-guides                                207 B         182 kB
├ ● /escalation-guides/[category]  (15 static paths)  207 B         182 kB
├ ○ /forgot-password                                 3.9 kB         306 kB
├ ● /guides/[slug]  (15 static paths)                 207 B         182 kB
├ ○ /how-it-works                                     207 B         182 kB
├ ƒ /letters                                        1.49 kB         196 kB
├ ○ /login                                          4.36 kB         306 kB
├ ƒ /packs                                          2.26 kB         193 kB
├ ƒ /packs/success                                    207 B         182 kB
├ ƒ /pricing                                        6.39 kB         208 kB
├ ○ /privacy                                          226 B         180 kB
├ ○ /register                                       4.73 kB         307 kB
├ ƒ /reminders                                      6.47 kB         328 kB
├ ○ /robots.txt                                       226 B         180 kB
├ ƒ /settings                                         207 B         182 kB
├ ƒ /settings/account                               4.39 kB         291 kB
├ ƒ /settings/billing                               6.85 kB         217 kB
├ ƒ /settings/notifications                         3.25 kB         217 kB
├ ƒ /settings/profile                               4.97 kB         250 kB
├ ƒ /shared/[token]                                   279 B         182 kB
├ ○ /sitemap.xml                                      226 B         180 kB
├ ○ /templates                                      2.61 kB         184 kB
├ ● /templates/[slug]  (10 static paths)              207 B         182 kB
└ ○ /terms                                            226 B         180 kB
+ First Load JS shared by all                        180 kB
  ├ chunks/4bd1b696-100b9d70ed4e49c1.js             54.2 kB
  ├ chunks/7391-c7cccc836ac179d2.js                  123 kB
  └ other shared chunks (total)                     2.83 kB

ƒ Middleware                                        89.9 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

### Build Notes

1. **Build passes with 0 errors and 0 TypeScript errors.** ✓
2. **Sentry deprecation warning:** `sentry.client.config.ts` should be renamed to `instrumentation-client.ts` for Turbopack compatibility. This is a Sentry-specific configuration issue, not a code defect.
3. **Webpack cache serialization warnings:** Three large strings (~139kB, 189kB, 140kB) are being serialized as strings rather than Buffers. These likely originate from the seed data files (`organisations.ts` and `escalation-rules.ts`). These only affect build-time performance, not runtime.
4. **Largest page: `/cases/[id]` at 394kB First Load JS.** This is notable — it includes `CaseTimeline` (799 lines), `AISuggestion`, `InteractionForm`, `EvidenceUpload`, `EvidenceGallery`, `ShareCaseButton`, `ForwardReplyPanel`, `ResponseTimer`, `CaseActions`. Code-splitting or lazy-loading heavy tabs could reduce the initial load.
5. **Dashboard First Load: 375kB** — second largest. Includes `DashboardQuickActions`, `InteractionModal`, `ReminderBell`.
6. **`/cases/[id]/interactions/new` at 368kB** — shares the `InteractionForm` bundle with the case detail page.
7. **101 total pages/routes generated.** Code splitting is working correctly via Next.js App Router route segments.
8. **No `/journeys/*` routes appear in the build output**, confirming the Guided Journeys feature is entirely absent.
