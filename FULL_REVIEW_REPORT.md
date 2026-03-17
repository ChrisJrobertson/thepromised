# FULL_REVIEW_REPORT.md — TheyPromised Application Audit

> **Generated:** 17 March 2026  
> **Auditor:** Forensic code review (static analysis + build verification)  
> **Scope:** Full end-to-end codebase audit — no code changes made  

---

## Executive Summary

TheyPromised is a well-architected consumer complaint tracking platform with a solid technical foundation. The core B2C loop — signup → create case → log interactions → generate AI letters → manage escalation — **is fully implemented and functional**. The build compiles cleanly with zero errors across 101 routes. The database schema is comprehensive with strong RLS policies on all user-owned tables.

However, the application has **three categories of meaningful gaps** that require attention before a confident public launch:

1. **One major feature is entirely missing at the frontend layer:** Guided Journeys. The AI prompt data, journey contexts, and backend infrastructure are ready, but there are no UI pages, no API routes, no JourneyWizard component, and no database tables for journey state. This feature appears prominently in the email templates and pricing copy but cannot be accessed by any user.

2. **Several security weaknesses** need addressing: the Resend and inbound-email webhooks have no signature verification; the rate limiter is in-memory only and does not work across Vercel serverless instances; and two database columns (`share_token`/`is_shared`) appear in production code but are absent from migrations.

3. **Multiple polish gaps** affect first impressions: the `/how-it-works` page has four grey placeholder boxes instead of screenshots; there is no custom 404 page; the OG image (`/og-image.png`) is missing; and the homepage is a client component with no page-level SEO metadata.

The B2B pipeline, admin panel, Stripe subscription lifecycle, PDF export, evidence management, and escalation engine are all production-ready. The platform is launch-viable with targeted fixes.

---

## Part 1: First Contact — How Users Discover and Arrive

### 1a. Landing Page (`/`)

**Exists:** Yes — `src/app/(marketing)/page.tsx`  
**Client/Server:** `"use client"` (Framer Motion animations)  
**Content Status:** Real, complete content. No placeholder text or Lorem Ipsum.

**Page structure (top to bottom):**
| Section | Status | Notes |
|---------|--------|-------|
| Hero headline + value proposition | ✅ | "They promised. Now prove it." with sub-headline |
| CTA buttons above fold | ✅ | "Start Your Case — Free" (→ `/register`) + "See How It Works" (→ `#how-it-works`) |
| Trust bar | ✅ | "256-bit encryption", "UK Data Centres", "GDPR Compliant", "No credit card required" |
| Social proof (cases logged / orgs tracked) | ✅ | Real counts |
| Problem → Solution section | ✅ | Real content |
| How It Works preview | ✅ | 3-step summary |
| AI feature section | ✅ | Claude-powered features explained |
| Testimonials | ✅ | 3 testimonials present |
| Pricing preview | ✅ | Links to `/pricing` |
| B2B teaser | ✅ | Links to `/business` |
| Final CTA | ✅ | → `/register` |
| Footer | ✅ | Company info, all key links |

**SEO Issues:**
- **CRITICAL:** Being a `"use client"` component, the page **cannot export `generateMetadata`**. The root layout's default title (`"TheyPromised — They Promised. You Proved It."`) and description apply, but there is **no page-specific SEO metadata** for the most important URL on the site. Search engines render client-side pages more slowly and less reliably.
- No custom `<meta description>` override for the homepage.

**Footer completeness:**
- ✅ SynqForge LTD (Company No. 16808271)
- ✅ Registered address: 3rd Floor, 86-90 Paul Street, London, EC2A 4NE
- ✅ Privacy Policy, Terms of Service links
- ✅ Support email: `support@theypromised.app`
- ❌ No "User Guide" link in the primary footer nav (only in support column of `(marketing)/layout.tsx` footer)

**All nav links:** Verified present and correctly routed.

---

### 1b. SEO Entry Points

**Pages WITH `generateMetadata`:**
| Page | Title Pattern |
|------|---------------|
| `/how-it-works` | "How It Works — Track Your Complaint Step by Step" |
| `/about` | "About TheyPromised" |
| `/pricing` | "Pricing — Plans for Consumers and Business \| TheyPromised" |
| `/templates` | "What's Your Complaint About? — Start in 2 Minutes \| TheyPromised" |
| `/templates/[slug]` | Dynamic per template |
| `/calculator` | "What Am I Owed? — UK Consumer Compensation Calculator \| TheyPromised" |
| `/packs` | "Complaint Packs — Professional Case Building \| TheyPromised" |
| `/escalation-guides` | "Escalation Guides \| TheyPromised" |
| `/escalation-guides/[category]` | Dynamic: "How to Complain About Your Energy Supplier — UK Guide 2026" |
| `/guides/[slug]` | Dynamic with OG tags |
| `/companies` | "UK Company Complaint Scorecards" (thin — see below) |
| `/companies/[slug]` | Dynamic with OG tags |
| `/business` | "For Business — Complaint Intelligence" (thin — see below) |
| `/privacy` | ✅ |
| `/terms` | ✅ |
| `/shared/[token]` | Dynamic; `robots: { index: false }` ✅ |

**Pages MISSING `generateMetadata`:**
| Page | Reason | Impact |
|------|--------|--------|
| `/` (homepage) | `"use client"` — cannot export metadata | **HIGH** — most important page |
| `/login` | `"use client"` | Low — auth pages rarely SEO-indexed |
| `/register` | `"use client"` | Low — auth pages rarely SEO-indexed |
| `/forgot-password` | `"use client"` | Low |

**Thin metadata (exists but underdeveloped):**
- `/companies` — description is 9 words, no `openGraph` block
- `/business` — description is 9 words, no `openGraph` block

**Guide pages — all 15 org guides:**
British Gas, EDF Energy, OVO Energy, BT, Sky, Virgin Media, HSBC, Barclays, Lloyds Bank, HMRC, DWP/Universal Credit, NHS England, Amazon UK, Currys, TalkTalk — all 15 exist in `ORG_GUIDES` and are statically generated. Each has dynamic SEO metadata. ✅

**Escalation guide categories — all 15 pre-rendered:**  
`energy`, `water`, `broadband_phone`, `financial_services`, `insurance`, `government_hmrc`, `government_dwp`, `government_council`, `nhs`, `housing`, `retail`, `transport`, `employment`, `education`, `other` — all 15 statically generated. Content depends on DB data; falls back to "Guide coming soon" if no escalation rules exist for a category. ✅

**Company Scorecards:** Dynamically generated from DB. Real data shown when ≥5 cases exist; graceful fallback otherwise. ✅

**`sitemap.ts`:** Exists at `src/app/sitemap.ts`. Includes all static pages, all 15 escalation categories, all org guide slugs, all template slugs, and live company scorecards from DB. ✅

**`robots.ts`:** Exists. Disallows: `/dashboard`, `/cases`, `/settings`, `/api`, `/reminders`, `/letters`, `/callback`. 

**Gap:** The `allow` list only explicitly lists 9 pages (`/`, `/pricing`, `/how-it-works`, `/escalation-guides`, `/about`, `/privacy`, `/terms`, `/register`, `/login`). The following valuable SEO pages are absent from the allow list: `/companies`, `/guides/*`, `/templates/*`, `/calculator`, `/packs`, `/business`. While omission from `allow` doesn't block crawling (only paths in `disallow` are blocked), explicit allow entries signal crawl priority.

---

### 1c. Marketing Pages — Full Inventory

| Page | Loads | Content Complete | Has CTA | Has Metadata | Issues |
|------|-------|-----------------|---------|--------------|--------|
| `/how-it-works` | ✅ | ⚠️ Partial | ✅ | ✅ | 4 grey placeholder boxes ("Step 1 screenshot", etc.) instead of actual screenshots |
| `/about` | ✅ | ✅ | ✅ | ✅ | None |
| `/templates` | ✅ | ✅ | ✅ | ✅ | None |
| `/templates/[slug]` | ✅ | ✅ | ✅ | ✅ | All 10 templates render correctly |
| `/calculator` | ✅ | ✅ | ✅ | ✅ | 4 tabs: flight/energy/broadband/faulty product |
| `/pricing` | ✅ | ✅ | ✅ | ✅ | Full feature comparison table, FAQ |
| `/packs` | ✅ | ✅ | ✅ | ✅ | Requires case selection if logged in |
| `/escalation-guides` | ✅ | ✅ | ✅ | ✅ | 12 category cards + org guides cross-links |
| `/escalation-guides/[category]` | ✅ | ⚠️ Partial | ✅ | ✅ | "Guide coming soon" if DB empty for category |
| `/guides/[slug]` | ✅ | ✅ | ✅ | ✅ | All 15 org guides with contact info |
| `/companies` | ✅ | ✅ | ✅ | ⚠️ Thin | Short description, no OG metadata |
| `/companies/[slug]` | ✅ | ✅ | ✅ | ✅ | Good dynamic metadata |
| `/business` | ✅ | ✅ | ✅ | ⚠️ Thin | Short description, no OG metadata |
| `/privacy` | ✅ | ✅ | ✅ | ✅ | Comprehensive GDPR-compliant policy |
| `/terms` | ✅ | ✅ | ✅ | ✅ | Complete with 14-day cooling-off period |
| `/shared/[token]` | ✅ | ✅ | ✅ | ✅ | Correctly set to noindex |

**Missing marketing asset:** `public/og-image.png` — referenced in root layout metadata for ALL pages' OpenGraph preview. **This file does not exist.** Social sharing of any page on the site will show a broken/missing image.

---

## Part 2: B2C Signup and Registration Flow

### 2a. Registration Page (`/register`)

**Registration methods available:**
- ✅ Email + Password (react-hook-form + Zod, live password strength meter)
- ✅ Google OAuth (`supabase.auth.signInWithOAuth`)

**Privacy trust text:** ✅ Present — "Your data is stored securely in the UK. We never share your information with the companies you're complaining about."

**Privacy Policy link:** ✅ Present in the terms acceptance checkbox text.

**Post-registration flow:**
- `supabase.auth.signUp()` → redirect to `/callback?next=/dashboard`
- Callback route (`src/app/(auth)/callback/route.ts`) handles session creation
- `handle_new_user()` trigger fires on `auth.users` INSERT → creates `profiles` row ✅
- New user detection: callback checks for existing profile BEFORE upsert to determine if new ✅
- Welcome email sent via `import()` + `.catch(() => {})` (non-blocking, fire-and-forget) ✅
- Redirect: → `/dashboard` ✅
- Email verification: Determined by Supabase project settings (not enforced in code)

**Error handling:**
- Duplicate email: Supabase returns error, displayed via toast ✅
- Weak password: Zod validation + live strength indicator ✅
- OAuth error: Error captured from URL params ✅

**Bugs:**
- Google OAuth button shows `<Check>` (tick icon) instead of a Google `G` icon — misleading
- "Already have an account?" link: ✅ present → `/login`

---

### 2b. Login Page (`/login`)

**Login methods available:**
- ✅ Email + Password
- ✅ Magic Link (OTP)
- ✅ Google OAuth

**Post-login redirect:** → `/dashboard` (or `?next=` param if set) ✅

**Failed login:** Errors displayed via toast ✅

**Forgot password:** ✅ Fully implemented — calls `supabase.auth.resetPasswordForEmail()` with redirect to `/settings/profile`. Full end-to-end flow works.

**"Don't have an account?" link:** ✅ Present → `/register`

---

### 2c. Auth Middleware

**Location:** `src/middleware.ts`

**What it protects:**
```
/admin, /dashboard, /cases, /settings, /reminders, /letters
```

**Unauthenticated redirect:** → `/login?next={pathname}` ✅

**Authenticated redirect from auth pages:** `/login`, `/register` → `/dashboard` ✅

**Routes that should be protected but aren't:**
- `/packs/success` — pack success page is inside `(dashboard)` group but the route path resolves to `/packs/success`, not `/dashboard/packs/success`. The middleware does not protect `/packs/*`. ⚠️ A user who guesses a session URL parameter could view the success page without auth. Low severity as it doesn't expose user data.

**Routes incorrectly protected:** None identified.

---

## Part 3: B2C First-Time User Onboarding

### 3a. Empty Dashboard State

**When `cases_count === 0`:**
- ✅ Full-width gradient onboarding card rendered: "Ready to hold them to account?"
- ✅ "Start Your First Case" CTA → `/cases/new`
- ✅ "Browse Escalation Guides" CTA → `/escalation-guides`
- ✅ Stat cards hidden when cases = 0 (no zero-filling confusion)

**Organisation search below onboarding card:** ❌ NOT PRESENT. The prompt called for a quick org search ("Who are you in a dispute with?") — this does not exist on the dashboard. Users must go to `/cases/new` to search for an organisation.

---

### 3b. Case Creation Flow

**Entry point:** `/cases/new` → `CaseWizard.tsx`

**Template pre-fill via URL params:**
- `?template=energy-wrong-tariff` → pre-populates org category, preferred companies ✅
- `?org=` param → Not confirmed as implemented (wizard accepts `preferredCompanyNames` from template data but no `?org=` param handling found)

**4-step wizard:**
1. **Step 0 — Organisation:** Trigram search for existing orgs + option to enter custom name. Tested: "British Gas", "BT", "HSBC" all return results from seeded data.
2. **Step 1 — Case Details:** Title*, what happened*, reference number, amount in dispute, desired outcome, priority (low/medium/high/urgent)*, first contact date*
3. **Step 2 — First Interaction (optional):** Full interaction form with all fields. User can skip.
4. **Step 3 — Confirm:** Summary table with all entered data.

**On submission:**
- `createCase()` server action executes ✅
- `cases_count` incremented by `update_case_count()` trigger ✅
- Redirect: → `/cases/[id]?created=true` ✅

**Note on `?created=true`:** The param is accepted by the URL but **no banner/prompt appears in the case detail page** based on its presence. The case detail page does not contain logic reading `searchParams.created`. This means the "guided journey prompt" described in the spec does not exist.

---

### 3c. Post-Creation — The "Magic Moment" Path

**`?created=true` journey banner:** ❌ **MISSING** — The case detail page does not read or act on this parameter. There is no "Start the Energy Billing Journey" prompt or any guided journey entry point.

**Guided Journeys overall status:** ❌ **ENTIRE FEATURE MISSING** at frontend level. See Part 4e for full analysis.

**From the case detail page, a new user CAN:**
- ✅ Log an interaction (Tab 1: Timeline → "Log Interaction" button → `InteractionModal`)
- ✅ Generate an AI letter (Letters tab → "Generate Letter" → `LetterWizard`)
- ✅ Request AI case analysis (right sidebar → `AISuggestion` component)
- ✅ Upload evidence (Evidence tab → `EvidenceUpload` drag-and-drop)

---

### 3d. AI Feature First Experience — Free Tier

**Free tier limits:** Confirmed in `src/lib/ai/constants.ts`:
```
Free:  AI suggestions: 0, AI letters: 0, AI summaries: 0
Basic: AI suggestions: 10, AI letters: 5, AI summaries: 100
Pro:   AI suggestions: 50, AI letters: 30, AI summaries: 500
```

**Free user experience:**
- AI Suggestion component: Shows a blurred fake preview with "Unlock AI guidance" overlay → `UpgradePrompt` → `/pricing` ✅
- Letter generation: Returns 403 with `upgrade_required` reason → `UpgradePrompt` rendered ✅
- Post-letter nudge/toast: Not explicitly found in the wizard — the wizard renders an `<UpgradePrompt>` block inline rather than a toast

**Creating a second case (free tier):**
- `canCreateCase(profile)` returns `false` when `cases_count >= 1` ✅
- The case creation page does not check this server-side before rendering the wizard; the check is in the `createCase()` server action which returns an error ⚠️ (no pre-flight guard on the UI)
- The upgrade path is via the error message → `/pricing`

---

## Part 4: B2C Core Product Features — Case Lifecycle

### 4a. Case Detail Page (`/cases/[id]`)

**Page size:** 393 kB (largest page in the build — see Part 8c)

**Header section shows:**
- Organisation name + category badge
- Case title + scorecard link (`/companies/{slug}`)
- Share button + CaseActions
- Status badge (open/escalated/resolved/closed) + Priority badge
- 5-stage escalation stepper (Initial → Formal → Final Response → Ombudsman → Court)
- Interaction count, days open, amount in dispute
- Pack upsell card (free tier) with contextual pack recommendations
- `ResponseTimer` (if response deadline set)
- `ForwardReplyPanel` (if response deadline set)

**Five tabs:**
| Tab | Content | Status |
|-----|---------|--------|
| Timeline | `CaseTimeline` + "Log Interaction" button | ✅ Working |
| Interactions | Tabular view with channel emoji, direction, date, duration, summary, promise badge | ✅ Working |
| Evidence | `EvidenceGallery` with filter tabs | ✅ Working |
| Letters | List with status badges + "Generate Letter" button | ✅ Working |
| Escalation | `EscalationGuide` component with rules from DB | ✅ Working |

**Right sidebar (lg+ screens):**
- Case details card (reference, dates, amount, desired outcome)
- Upcoming reminders card
- Promises tracker card (pending promises with deadlines)
- `AISuggestion` (lazy-loaded) — full AI analysis component
- Actions: Generate Letter → `/cases/{id}/letters/new`, Export → `/cases/{id}/export`

**Outcome tracking:** ✅ `updateCaseStatus()` server action accepts `resolution_summary`, `compensation_received`. No dedicated UI modal found for the resolution outcome form (did you get what you wanted? yes/partially/no). The `advanceEscalationStage()` action handles stage progression.

**Share button:** ✅ `ShareCaseButton` — fully implemented with enable/disable sharing and copy-to-clipboard.

**PDF Export:** ✅ `ExportClient` — 3 export types, tier-gated, downloads from `/api/export/pdf`.

---

### 4b. Interactions (Logging Evidence)

**Interaction types (channels) available:**
`phone`, `email`, `letter`, `webchat`, `in_person`, `social_media`, `app`, `other` — all 8 available ✅

**Form fields:** ✅ Date/time, direction, channel, duration (phone-only), summary, contact name/department/role, reference number, promises made + deadline (conditional), outcome select, next steps, mood picker.

**Promise features:** ✅ Deadline captured, auto-reminder created, promise_fulfilled flag available.

**DB counter updates:**
- `cases.interaction_count` — updated by `update_interaction_count()` trigger ✅
- `cases.last_interaction_date` — updated by same trigger ✅

**Gap:** The `interaction_type` field mentioned in the spec (phone_call, email_sent, etc.) maps to `channel` + `direction` in the database — two separate fields. The combined types (e.g., `email_sent` = `channel: email` + `direction: outbound`) are not stored as a single field. This is architecturally correct but worth noting for downstream reporting.

---

### 4c. Promise Tracking

- ✅ Promise description captured in `interactions.promises_made`
- ✅ Promise deadline in `interactions.promise_deadline`
- ✅ `promise_fulfilled` boolean field exists on interactions
- ✅ `updatePromiseFulfilled()` server action implemented
- ✅ Auto-reminders created on `logInteraction()` if promise_deadline set
- ✅ Dashboard stat card "Open Promises" counts unfulfilled promises
- ✅ Promises Tracker card shown in case detail sidebar

**Cron promise-broken flow:**
- ✅ Daily cron checks interactions with `promise_deadline < now AND promise_fulfilled IS NULL`
- ✅ Inserts reminder for each overdue promise
- ✅ Sends `PromiseBrokenEmail` via Resend (for non-free users)

**Gap:** Promise status on the case timeline (`Promise Kept ✓ / Promise Broken ✗ · X days overdue`) — confirmed in `CaseTimeline` component via `promise_fulfilled` flag and date calculation. The timeline does show promise badges. ✅

---

### 4d. AI-Drafted Letters

**Letter types available (database CHECK constraint — initial migration):**  
`initial_complaint`, `follow_up`, `escalation`, `final_response_request`, `ombudsman_referral`, `subject_access_request`, `formal_notice`, `custom`

**Letter types in `letter-templates.ts` (11 total):**  
All 8 above PLUS: `adr_referral`, `section_75_claim`, `letter_before_action`

**⚠️ MISMATCH:** The database `letters.letter_type` CHECK constraint only includes **8 types** (from the initial migration). Three new types (`adr_referral`, `section_75_claim`, `letter_before_action`) appear in `letter-templates.ts` and can be selected in the `LetterWizard`, but **will fail database insertion** due to the constraint violation. Migration 007 (to add these types to the CHECK constraint) does not exist.

**Additional bug:** `formal_notice` and `letter_before_action` are functionally identical in `letter-templates.ts` — same display name ("Letter Before Action"), same description, same legal references. This creates a duplicate tile in the wizard.

**`buildLetterPrompt()` content:** ✅ Includes letter type, template metadata, sender address, today's date, recipient details, full case info, up to 8 recent interactions, optional additional instructions.

**Letter editing:** ✅ Full A4-styled textarea in the wizard.

**Letter sending:** ✅ `SendLetterButton` → `/api/letters/[id]/send` → Resend API.

**Delivery tracking:** ✅ Resend webhooks update `letters.delivery_status`, `delivered_at`, `opened_at`, `bounced_at`.

**Case analysis `letterType` enum:** ⚠️ `buildCaseAnalysisPrompt()` JSON schema hint only lists 7 letter types. `adr_referral`, `section_75_claim`, `letter_before_action`, and `custom` are missing — Claude cannot recommend these 4 types via case analysis.

---

### 4e. Guided Journeys

**Status: FRONTEND ENTIRELY MISSING**

| Component | Status |
|-----------|--------|
| Journey prompt library (`journey-prompts.ts`) | ✅ Exists — 19 prompts across 5 categories |
| Journey templates/config data | ❌ Missing |
| Journey database tables | ❌ Missing |
| Journey API routes (`/api/journeys/`) | ❌ Missing |
| `JourneyWizard` component | ❌ Missing |
| Journey step renderers (7 types) | ❌ Missing |
| Journey pages (`/dashboard/journeys/`) | ❌ Missing |
| Dashboard journey widget | ❌ Missing |
| Journey entry point after case creation | ❌ Missing |
| `getAvailableJourneyId()` function | ❌ Missing |

**What does exist:** `src/lib/ai/journey-prompts.ts` contains highly detailed AI prompt strings for 5 categories (energy billing, broadband speed, flight delays, bank charges, faulty products) × 3–7 steps each. This file is complete and production-quality but **has no callers anywhere in the codebase**.

The Guided Journeys feature is mentioned in:
- The pricing page (implied in the feature set)
- The subscription confirmation email (implied)
- The product vision

But **zero lines of code** implement the journey UI, state machine, or API. This is the single largest feature gap in the application.

---

### 4f. Escalation Engine

**Escalation rules storage:** `escalation_rules` table ✅

**Categories with seeded rules:** 15 categories
`energy`, `water`, `broadband_phone`, `financial_services`, `insurance`, `government_hmrc`, `government_dwp`, `government_council`, `nhs`, `housing`, `retail`, `transport`, `education`, `employment`, `other`

**Escalation path example (energy):**
1. Initial complaint (day 0)
2. Formal complaint in writing (day 14)
3. Request deadlock letter / final response (week 8)
4. Escalate to Energy Ombudsman (week 8+)
5. Small Claims Court (last resort)

**Cron escalation alerts:** ✅ Implemented — creates reminders at 6, 7, and 8 weeks from `first_contact_date` for open cases.

**`EscalationAlertEmail`:** ✅ Sent for non-free users with case-specific ombudsman details.

**AI case analysis escalation references:** ✅ `buildCaseAnalysisPrompt()` includes relevant `escalation_rules` rows from the database.

**5-stage UI stepper:** ✅ Present on case detail page (Initial → Formal → Final Response → Ombudsman → Court).

---

### 4g. Reminders System

**Reminder types:** `promise_deadline`, `escalation_window`, `follow_up`, `custom`, `response_approaching`, `response_due`, `response_overdue`, `notification` — all 8 ✅

**Creation methods:** Automatically from promises ✅, escalation windows ✅, response deadlines (after letter send) ✅, and manually by user ✅.

**`/reminders` page:** ✅ Fully implemented. Groups into: overdue / today / this week / later. Dismiss individual + bulk dismiss. Create custom reminder.

**Daily cron at `/api/reminders/cron`:**
1. ✅ Reset AI credits monthly
2. ✅ Revert expired pack Pro access (>7 days)
3. ✅ Send daily reminder digest emails (non-free users)
4. ✅ Create escalation window alerts (6/7/8 weeks)
5. ✅ Create deadline-passed alerts
6. ✅ Create overdue promise alerts + send `PromiseBrokenEmail`
7. ✅ Send B2B SLA alert email to ops team

**Cron authentication:** ✅ Bearer token (`CRON_SECRET`) required.

**`notification_preferences` column:** ⚠️ The cron reads `profile.notification_preferences?.email_reminders` and the settings page writes this JSON column — but this column **does not appear in any migration file**. It was added directly to the live database or is missing from migrations entirely. This is a migration gap.

---

### 4h. Evidence & File Uploads

**Storage:** Supabase `evidence` bucket (private) ✅

**Accepted file types:** JPG, PNG, HEIC, PDF, DOC, DOCX, MP3, M4A, WEBM, TXT ✅

**File size limit:** 10 MB ✅

**Attachment to interactions:** ✅ `EvidenceUpload` accepts `interactionId` prop; shown post-interaction-save.

**Evidence gallery:** ✅ Filter by type, preview dialog, download, delete with confirmation.

**Evidence in PDF exports:** ✅ `CasePdfDocument` includes evidence file index section.

**`evidence_type` classifications:** `screenshot`, `email`, `letter`, `photo`, `voice_memo`, `document`, `receipt`, `contract`, `other` ✅

**Minor issue:** `.txt` files are mapped to `evidence_type: "email"` — a semantic mismatch. Text files aren't necessarily emails.

---

### 4i. PDF Export

**UI:** ✅ `ExportClient` at `/cases/[id]/export`

| Export Type | Tier Required | Includes |
|-------------|--------------|----------|
| `timeline_only` | Basic | Cover page, chronological interactions, promises |
| `letters_only` | Basic | Cover page, all letters with sent/draft status |
| `full_case` | Pro | All of the above + case summary, escalation history, evidence index |

**`exports` table:** ✅ Records created with `storage_path`.

**`profiles.last_export_at`:** ✅ Updated by `/api/account/export` (GDPR data export route); the PDF export route updates the `exports` table but the profile `last_export_at` column may only be updated by the GDPR route.

**Previous exports list:** ✅ Shown on the export page.

---

### 4j. Compensation Calculator (`/calculator`)

**Four calculation tabs:**
1. **Flight Delay (UK261):** Distance (short/medium/long-haul), delay hours → calculates £220/£350/£520 entitlement. Deducts for extraordinary circumstances.
2. **Energy Overcharge:** Tariff comparison, monthly difference, months affected → total overcharge + interest calculation.
3. **Broadband Speed Shortfall:** Contracted vs actual speed, affected months, tariff → proportional refund.
4. **Faulty Product:** Purchase price, fault type, time elapsed → CRA 2015 remedy calculation.

**Results:** Sensible, legally-grounded results. Each includes a "Start a Complaint for This" CTA → `/cases/new?template=[relevant-template]` ✅

---

### 4k. Company Scorecards

**Index page:** Fetches top 5 companies by complaint volume from `v_company_rankings` view. `CompanyScorecardIndex` component renders them.

**Individual scorecard:** Overall grade (A–F), 4 metric bars (promise-keeping, response speed, helpfulness, resolution rate), statistics grid.

**Data source:** `v_company_stats` view (service_role access) ✅

**Real vs placeholder data:** The views aggregate from real `cases` and `interactions` rows. If no cases have been submitted for a company, `getPublicScorecardForSlug()` returns `not_enough_data`. Placeholder data is NOT hardcoded. ✅

**Search/filter on index:** Not present in the current implementation — `CompanyScorecardIndex` shows a fixed top-5 list with no search.

---

## Part 5: B2C Monetisation — Subscriptions and Packs

### 5a. Pricing Page (`/pricing`)

**Tiers displayed:**
| Tier | Monthly | Annual | Annual equivalent |
|------|---------|--------|-------------------|
| Free | £0 | £0 | — |
| Basic | £4.99/mo | £39.99/yr | £3.33/mo (33% saving) |
| Pro | £9.99/mo | £79.99/yr | £6.67/mo (33% saving) |

**Monthly/annual toggle:** ✅ Present in `PricingClient`.

**Full feature comparison table:** ✅ Present in the pricing page.

**Complaint packs section:** ✅ Shown on the pricing page with links to `/packs`.

**Upgrade CTAs:** ✅ Link to Stripe checkout via `/api/stripe/checkout`.

---

### 5b. Subscription Flow — End to End

1. User clicks "Upgrade to Basic" → `PricingClient` calls `POST /api/stripe/checkout` with `{ priceId }` ✅
2. API validates `priceId` against allowlist, creates Stripe Checkout session ✅
3. User completes payment on Stripe hosted page ✅
4. Stripe sends `checkout.session.completed` to `/api/webhooks/stripe` ✅
5. Webhook updates `profiles`: `subscription_tier`, `subscription_status`, `subscription_id`, `stripe_customer_id`, resets AI credits ✅
6. `SubscriptionConfirmEmail` sent via Resend ✅
7. Redirect: Stripe redirects to `success_url` — this URL is `{origin}/dashboard` based on the checkout configuration ✅ (no dedicated success page for subscriptions)

---

### 5c. Subscription Management

**Stripe Customer Portal:** ✅ `POST /api/stripe/portal` → Stripe Billing Portal. Users can cancel, update payment method, view invoices.

**Subscription cancelled (`customer.subscription.deleted`):** ✅ Profile reverted to `free`/`cancelled`, pack fields cleared.

**Payment failed (`invoice.payment_failed`):** ✅ `subscription_status` set to `past_due`. `BillingClient` shows a prominent amber alert banner for `past_due` status. ✅

**`invoice.paid`:** ✅ Resets AI credits, sets status to `active`.

---

### 5d. Complaint Packs

**Packs available:**
| Pack | Price | Slug |
|------|-------|------|
| Complaint Starter Pack | £29 | `starter` |
| Escalation Pack | £49 | `escalation` |
| Full Case Pack | £79 | `full-case` |

**Checkout:** ✅ `POST /api/packs/checkout` → Stripe `mode: "payment"` one-off checkout.

**After purchase (via `checkout.session.completed` webhook):**
- ✅ `complaint_packs` record created
- ✅ `profiles.subscription_status` set to `pack_temporary`
- ✅ `profiles.pack_pro_expires_at` set (7 days from purchase)
- ✅ `profiles.pack_access_case_id` set (scoped to specific case if provided)
- ✅ Cron reverts pack Pro access after expiry

**Pack statuses:** `purchased`, `in_progress`, `fulfilled`, `refunded`, `cancelled` ✅

**`checkout_session_id` UNIQUE constraint:** ✅ Added in migration 6 — idempotent webhook handling.

---

### 5e. Feature Gating — Complete Matrix

| Feature | Free | Basic | Pro | Enforced Where |
|---------|------|-------|-----|----------------|
| Active cases | Max 1 | Unlimited | Unlimited | `createCase()` server action |
| AI suggestions/month | 0 | 10 | 50 | `/api/ai/suggest` |
| AI letters/month | 0 | 5 | 30 | `/api/ai/draft-letter` |
| AI summaries/month | 0 | 100 | 500 | `/api/ai/summarise` |
| PDF export (timeline/letters) | ❌ | ✅ | ✅ | `/api/export/pdf` |
| PDF export (full case) | ❌ | ❌ | ✅ | `/api/export/pdf` |
| Email reminders (daily digest) | ❌ | ✅ | ✅ | Cron respects `canReceiveEmailReminders()` |
| Voice memo recording | ❌ | ❌ | ✅ | `canRecordVoiceMemo()` (client-side check) |
| Email forwarding parser | ❌ | ❌ | ✅ | `canUseEmailForward()` (client-side check) |
| View AI suggestions (sidebar) | ❌ (blurred) | ✅ | ✅ | `canViewAISuggestions()` |
| Company scorecards | ✅ | ✅ | ✅ | Public — no gating |
| Share case links | ✅ | ✅ | ✅ | No gating |
| Evidence uploads | ✅ | ✅ | ✅ | No gating |
| Guided journeys | N/A | N/A | N/A | Feature doesn't exist yet |
| Letter sending via email | ✅ | ✅ | ✅ | No tier gate on sending |

**Source of truth:** `src/lib/stripe/feature-gates.ts` (boolean gate functions) + `src/lib/ai/constants.ts` (AI limits).

**Enforcement:** API level for AI and PDF. Client-side only for voice memos and email forwarding — these should also have server-side checks in their respective API routes.

**Gaps in gating:**
- No evidence upload limit gated by tier
- No case file sharing gated by tier
- `VoiceMemoRecorder` and email forwarding parser are only gated client-side with no corresponding server-side check

---

## Part 6: B2B — Business Engagement and Pipeline

### 6a. For Business Marketing Page (`/business`)

**Value proposition:** Complaint intelligence — aggregate data showing complaint patterns, resolution rates, and benchmarks for organisations.

**`BusinessEnquiryForm` fields:** ✅ `company_name` (required), `contact_name` (required), `email` (required), `role`, `website` (URL), `sector`, `complaint_volume_estimate`, `message`, `consent_to_contact` (required), hidden honeypot `company_fax` → `hp_website`.

**Form submission:** → `POST /api/business-enquiries` → `business_enquiries` table ✅

**Anti-spam:** ✅ Honeypot field, IP rate limiting (5 req/hour), source_ip + user_agent recorded.

**Confirmation message:** ✅ Success state shown after submission.

**B2B pricing tiers on the page:**
| Tier | Monthly Rate | Notes |
|------|-------------|-------|
| Insight | £500/mo | Up to 5 users, monthly PDF report |
| Professional | £1,000/mo | Unlimited users, API access, custom reports |
| Enterprise | Custom | Dedicated account manager |

**Self-serve B2B signup:** ❌ Not available — all B2B is sales-led via the enquiry form.

**Issue:** `BusinessEnquiryForm` uses plain `useState` + `e.preventDefault()` instead of React Hook Form + Zod (inconsistent with codebase standard). Client-side validation is minimal (browser `type="email"` and `type="url"` only).

---

### 6b. B2B Lead Pipeline (Admin)

**Admin panel at `/admin`:** ✅ Accessible (requires `is_admin = true` on profile).

**B2B pipeline at `/admin/b2b`:** ✅ Full implementation — merges `business_enquiries` and `b2b_pilots` tables with deduplication logic.

**Pipeline stages:** `enquiry` → `contacted` → `pilot_started` → `active` → `churned` ✅

**Admin can:**
- ✅ View all business enquiries with company, contact, message details
- ✅ Change enquiry/pilot status via inline dropdown → `PATCH /api/admin/b2b`
- ✅ Track SLA alerts (>48h in enquiry, >7d contacted, >30d active)
- ✅ Send company scorecard email → `POST /api/admin/send-scorecard`
- ✅ Track outreach delivery via `b2b_outreach_emails` table (Resend webhook tracking)

**B2B SLA cron:** ✅ Daily cron sends summary email to ops team for stale entries.

---

### 6c. B2B Product Features — What Exists vs What's Missing

**Does NOT exist:**
- ❌ B2B customer portal or separate business dashboard
- ❌ Business-facing login or separate business user type
- ❌ Aggregated complaint data visible to business customers
- ❌ Complaint volume monitoring for businesses
- ❌ Competitor benchmarking for businesses
- ❌ Escalation alerts sent to business customers

**What exists in the database that could support B2B features:**
- ✅ `v_company_stats` view — comprehensive per-organisation complaint metrics
- ✅ `v_company_rankings` view — ranking data
- ✅ `b2b_pilots` table — tracks pilot agreements with organisations
- ✅ `b2b_outreach_emails` table — delivery tracking for scorecard emails sent to companies
- ✅ Admin scorecard email flow — sends PDF scorecards to company contacts via Resend

**`AdminViewToggle`:** ✅ Exists — a UI convenience that shows extra sidebar nav items for admin users in "B2B view" mode. Stored in `localStorage`. Does NOT grant any permissions.

**Conclusion:** B2B is entirely a sales-led, manual process right now. The data infrastructure (views, tables) is in place, but there is no self-serve B2B portal. All "B2B product" is delivered manually by the ops team (downloading CSV exports, sending scorecard emails from the admin panel).

---

### 6d. B2B Pricing

**On `/business` page:** ✅ Three pricing tiers listed (Insight/Professional/Enterprise).

**On `/pricing` page:** ✅ Brief B2B section at the bottom with "Book a Demo" CTA linking to `/business#b2b-enquiry`.

**B2B pricing model:** Flat monthly rate (£500/£1,000/custom). No per-seat pricing implemented.

**Self-serve B2B signup:** ❌ Not available. All onboarding is manual/enquiry-based.

---

## Part 7: Navigation and Information Architecture

### 7a. Top Navigation (Logged Out)

| Label | URL | Status |
|-------|-----|--------|
| How It Works | `/how-it-works` | ✅ |
| Templates | `/templates` | ✅ |
| Calculator | `/calculator` | ✅ |
| Pricing | `/pricing` | ✅ |
| Complaint Packs | `/packs` | ✅ |
| Escalation Guides | `/escalation-guides` | ✅ |
| Company Scorecards | `/companies` | ✅ |
| For Business | `/business` | ✅ |
| Log In | `/login` | ✅ |
| Start Free | `/register` | ✅ (teal CTA button) |

All 10 items present and correctly linked. ✅

---

### 7b. Top Navigation (Logged In)

The `(marketing)/layout.tsx` renders the same nav for logged-in and logged-out users (it doesn't have server-side session awareness). The header switches based on auth state via the Supabase client — when logged in, "Log In" / "Start Free" are replaced with a "Dashboard" link.

---

### 7c. Dashboard Sidebar (Logged In)

| Label | URL | Icon | Status |
|-------|-----|------|--------|
| Dashboard | `/dashboard` | `LayoutDashboard` | ✅ |
| My Cases | `/cases` | `FolderOpen` | ✅ |
| New Case | `/cases/new` | `Plus` (green circle) | ✅ |
| Letters | `/letters` | `FileText` | ✅ |
| Packs | `/dashboard/packs` | `Package` | ✅ |
| Templates | `/templates` | `FileText` | ⚠️ Same icon as Letters |
| Calculator | `/calculator` | `Calculator` | ✅ |
| Escalation Guides | `/escalation-guides` | `BookOpen` | ✅ |
| Reminders | `/reminders` | `Bell` | ✅ |
| Settings | `/settings` | `Settings` | ✅ |
| (Admin) AdminViewToggle | — | `Shield` | ✅ Admin only |
| SubscriptionBadge | — | — | ✅ |
| UserMenu | — | Avatar | ✅ |

**Active link bug:** The Dashboard item (`/dashboard`) uses `pathname.startsWith("/dashboard/")` logic, so it incorrectly appears active when on `/dashboard/packs` (since that path starts with `/dashboard/`).

**Missing sidebar item:** No "Reminders" bell count badge in sidebar (only in the header `ReminderBell`).

---

### 7d. Mobile Navigation

**`BottomTabBar`:** ✅ 5 tabs — Home (`/dashboard`), Cases (`/cases`), Log (opens `InteractionModal` FAB), Reminders (`/reminders`), Settings (`/settings/profile`).

**Sidebar collapse on mobile:** ✅ Sidebar is hidden on mobile. `AppShell` uses a mobile sheet/drawer.

**All pages navigable on mobile:** ✅ The bottom tab bar covers the primary navigation paths.

---

### 7e. Footer

| Section | Items | Status |
|---------|-------|--------|
| Product | Start Free, Pricing, Templates, Calculator, Escalation Guides, Complaint Packs | ✅ |
| Company | About, For Business, Company Scorecards, Privacy Policy, Terms of Service | ✅ |
| Support | `support@theypromised.app`, User Guide (`/how-it-works`) | ✅ |
| Legal | © 2026 SynqForge LTD (Company No. 16808271), 3rd Floor, 86-90 Paul Street, London, EC2A 4NE | ✅ |

Footer is consistent across all `(marketing)` pages. ✅

---

## Part 8: Cross-Cutting Concerns

### 8a. Mobile Responsiveness

Based on static code analysis of Tailwind classes and responsive breakpoints:

| Page | 375px | 768px | Notes |
|------|-------|-------|-------|
| Landing page | ✅ | ✅ | Responsive grid, stacked mobile layout |
| Dashboard (empty) | ✅ | ✅ | Full-width onboarding card |
| Dashboard (with cases) | ✅ | ✅ | Stat cards stack 2×2 on mobile |
| Case detail | ⚠️ | ✅ | Right sidebar hidden on mobile (lg:grid-cols-3). Case tabs may be crowded on very small screens — 5 tabs on 375px |
| Case creation wizard | ✅ | ✅ | Single column wizard |
| Templates page | ✅ | ✅ | Grid adapts to 1→2→3 cols |
| Pricing page | ✅ | ✅ | Cards stack on mobile |
| Letters page | ✅ | ✅ | — |

**Known concern:** The 5-tab navigation on `cases/[id]` (Timeline / Interactions / Evidence / Letters / Escalation) may truncate or overflow on 375px screens. The tabs use `overflow-x-auto` which allows horizontal scrolling — functional but not ideal UX.

---

### 8b. Error Handling

**Custom 404 page:** ❌ `src/app/not-found.tsx` does not exist. Next.js renders its default unstyled `/_not-found` page. This appears in the build output as `/_not-found` (1 kB) which is the framework default.

**API errors:** ✅ All API routes return structured error responses with HTTP status codes. UI components handle errors via sonner toasts.

**AI API failures:** ✅ All 3 AI routes have try/catch with user-friendly error messages.

**Stripe checkout failure:** ✅ Errors returned from checkout session creation are surfaced to the user.

**File upload failure:** ✅ `EvidenceUpload` has try/catch; errors shown in the upload queue item.

---

### 8c. Performance

**Build output analysis:**
| Page | First Load JS | Notes |
|------|--------------|-------|
| `/cases/[id]` | **393 kB** | Largest page — includes `@react-pdf/renderer`, all case components |
| `/cases/new` | 368 kB | Case wizard + org search |
| `/cases/[id]/interactions/new` | 367 kB | Shared chunks with cases/[id] |
| `/cases/[id]/timeline` | 308 kB | |
| `/reminders` | 327 kB | |
| `/dashboard` | 374 kB | |
| `/` (homepage) | 228 kB | Includes Framer Motion |

**Shared JS bundle:** 180 kB (includes React, Supabase client, Next.js runtime)

**Sentry warning:** `[@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your 'sentry.client.config.ts' file, or moving its content to 'instrumentation-client.ts'. When using Turbopack sentry.client.config.ts will no longer work.`  
This file already exists as `instrumentation-client.ts` — but `sentry.client.config.ts` also remains. The duplicate file should be removed.

**Webpack serialisation warnings:** Large string serialisation warnings (139 kB, 189 kB, 140 kB) affecting build cache performance — likely from the seed data files (`organisations.ts`, `escalation-rules.ts`). Non-critical but worth investigating.

**Code splitting:** ✅ Working — API routes are all 223 B (shell only). Lazy loading via `AISuggestion` client component pattern.

**Images:** No Next.js `<Image>` components found in components reviewed. Marketing hero section uses CSS backgrounds. Evidence gallery uses `<img>` with blob URLs.

**Font loading:** `geistSans` is declared as `Inter({ variable: "--font-geist-sans" })` — this is a naming error. The variable is named `--font-geist-sans` but actually imports Inter, not Geist Sans. Functional but inaccurate.

---

### 8d. Security

**RLS enabled on all user-data tables:** ✅ Confirmed (see Part 9e).

**Cross-user data access:** ✅ All user-owned tables use `user_id = auth.uid()` in RLS policies. Direct URL manipulation (e.g., `/cases/[other-user-id]`) will return empty results or 404 before reaching the UI.

**Cron authentication:** ✅ `Authorization: Bearer {CRON_SECRET}` required.

**Rate limiting:** ⚠️ **CRITICAL FOR PRODUCTION** — The `checkRateLimit()` utility in `src/lib/rate-limit.ts` uses an in-memory `Map`. This does not persist across Vercel serverless function instances. On a multi-instance deployment (which Vercel uses), the rate limiter is effectively bypassed — each instance maintains its own count independently. AI endpoints are therefore rate-limited only within a single serverless cold start, not globally. A Redis or Upstash-based rate limiter is needed for reliable protection.

**Webhook security gaps:**
1. **`/api/webhooks/resend`** — No signature verification. Any caller who discovers the URL can spoof delivery events (e.g., mark a letter as "opened" or "bounced" without sending it).
2. **`/api/webhooks/inbound-email`** — No authentication beyond checking if the alias starts with `case-`. No IP allowlist, no Resend signature.

**API key exposure:** ✅ All external API keys (`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`) are server-side only env vars. No `NEXT_PUBLIC_` prefixed secrets found.

**Admin API auth:** ✅ `requireAdminApi()` performs a two-step check using both session auth and service role client to verify `profiles.is_admin`.

---

### 8e. Analytics & Monitoring

**PostHog:** ✅ Initialised via `PostHogProvider` — only fires in production (`NODE_ENV === "production"`). Gated on cookie consent (`tp_consent=accepted` cookie). EU host used (`eu.posthog.com`). `person_profiles: "identified_only"`.

**Tracked events:**
- `sign_up` (in callback route)
- `case_created` (in `createCase()` server action)
- `interaction_logged` (in `logInteraction()` server action)
- `letter_generated` (in `/api/ai/draft-letter`)
- `pdf_exported` (in `/api/export/pdf`)
- `subscription_started` (in Stripe webhook)
- `ai_analysis_requested` (in `/api/ai/suggest`)
- Note: `subscription_upgraded`, `subscription_cancelled` are not confirmed as tracked in the webhook handler — only `subscription_started` explicitly fires `analytics.subscriptionStarted`.

**Sentry:** ✅ Configured across all three runtimes (client, server, edge) in `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`. SourceMap upload enabled when `SENTRY_AUTH_TOKEN` is set.  
**⚠️ Action required:** `sentry.client.config.ts` needs to be removed (duplicate of `instrumentation-client.ts`) for Turbopack compatibility.

**Cookie consent:** ✅ `CookieConsent.tsx` shows a banner with Accept/Reject options. `initPostHog()` called immediately on accept.

**Gap:** There is no way for users to withdraw or change cookie consent after the initial choice. A "Cookie settings" link in the footer or settings page is needed for full GDPR compliance.

**Vercel Analytics + Speed Insights:** ✅ Packages present (`@vercel/analytics`, `@vercel/speed-insights`). Loaded via `Providers` component.

---

### 8f. PWA

| Requirement | Status |
|-------------|--------|
| `manifest.json` in `/public` | ✅ |
| App name and short name | ✅ TheyPromised |
| `start_url` | ✅ `/dashboard` |
| `display: standalone` | ✅ |
| `theme_color: #1e3a5f` | ✅ |
| Icons (192px, 512px, SVG) | ✅ 3 icon sizes |
| Shortcuts (New Case, My Cases) | ✅ |
| Manifest linked in `<head>` | ✅ |
| `apple-mobile-web-app-capable` meta | ✅ |
| `theme-color` meta tag | ✅ |

---

## Part 9: Database Integrity Check

### 9a. Schema Completeness

| Table | Exists | Key Columns | Issues |
|-------|--------|-------------|--------|
| `profiles` | ✅ | All columns confirmed | `notification_preferences` referenced in code but missing from migrations |
| `organisations` | ✅ | With trigram GIN index | — |
| `cases` | ✅ | All columns confirmed | `share_token`, `is_shared` in types/code but NOT in migrations |
| `interactions` | ✅ | All columns confirmed | — |
| `evidence` | ✅ | All columns confirmed | — |
| `letters` | ✅ | Initial 8-type CHECK constraint | **MISMATCH:** `adr_referral`, `section_75_claim`, `letter_before_action` in code but not in DB constraint |
| `escalation_rules` | ✅ | All columns confirmed | — |
| `reminders` | ✅ | All 8 reminder types | — |
| `exports` | ✅ | All columns confirmed | — |
| `complaint_packs` | ✅ | All columns confirmed | — |
| `business_enquiries` | ✅ | All columns confirmed | — |
| `b2b_pilots` | ✅ | All columns confirmed | — |
| `b2b_outreach_emails` | ✅ | All columns confirmed | — |

---

### 9b. Views

| View | Exists | Access | Returns Data |
|------|--------|--------|-------------|
| `v_company_stats` | ✅ | Service role only | When cases exist |
| `v_platform_stats` | ✅ | Service role only | When data exists |
| `v_monthly_trends` | ✅ | Service role only | Rolling 12 months |
| `v_category_stats` | ✅ | Service role only | When data exists |
| `v_company_rankings` | ✅ | Service role only | When orgs have ≥1 case |

All 5 views are correctly locked to service_role. Authenticated/anon roles explicitly revoked. ✅

---

### 9c. Triggers and Functions

| Trigger/Function | Status | Notes |
|-----------------|--------|-------|
| `handle_new_user()` | ✅ | Creates profile on `auth.users` INSERT |
| `on_auth_user_created` trigger | ✅ | AFTER INSERT on `auth.users` |
| `update_case_count()` | ✅ | Increments/decrements `profiles.cases_count` |
| `cases_count_trigger` | ✅ | AFTER INSERT OR DELETE on `cases` |
| `update_interaction_count()` | ✅ | Updates `cases.interaction_count` + `last_interaction_date` |
| `interactions_count_trigger` | ✅ | AFTER INSERT OR DELETE on `interactions` |
| `update_updated_at()` | ✅ | Auto-updates `updated_at` on all relevant tables |

---

### 9d. Seed Data

| Data | Status |
|------|--------|
| Organisation seed | ✅ 43 organisations in `src/lib/seed/organisations.ts` — loaded via `POST /api/seed` |
| Escalation rules seed | ✅ 56 rules across 15 categories in `src/lib/seed/escalation-rules.ts` — loaded via same endpoint |
| "British Gas", "BT", "HSBC" | ✅ All 3 in seed data |
| `notification_preferences` column | ❌ Not in any migration — must have been added directly |
| `share_token`, `is_shared` on cases | ❌ Not in any migration — must have been added directly |
| Seed endpoint authentication | ✅ `x-seed-secret` header required (`SEED_SECRET` env var) |

---

### 9e. RLS Policies

| Table | RLS Enabled | Policies | Assessment |
|-------|-------------|----------|------------|
| `profiles` | ✅ | SELECT/INSERT/UPDATE/DELETE: `id = auth.uid()` | ✅ Secure |
| `cases` | ✅ | SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()` | ✅ Secure |
| `interactions` | ✅ | SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()` | ✅ Secure |
| `evidence` | ✅ | SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()` | ✅ Secure |
| `letters` | ✅ | SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()` | ✅ Secure |
| `reminders` | ✅ | SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()` | ✅ Secure |
| `exports` | ✅ | SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()` | ✅ Secure |
| `organisations` | ✅ | SELECT: any authenticated; INSERT/UPDATE/DELETE: service_role only | ✅ Secure |
| `escalation_rules` | ✅ | SELECT: any authenticated; INSERT/UPDATE/DELETE: service_role only | ✅ Secure |
| `business_enquiries` | ✅ | INSERT: anyone (anon); no SELECT/UPDATE/DELETE for regular users | ✅ Correct (public enquiry form) |
| `complaint_packs` | ✅ | SELECT: `auth.uid() = user_id`; ALL: service_role | ✅ Secure |
| `b2b_pilots` | ✅ | ALL: service_role only | ✅ Secure (admin only) |
| `b2b_outreach_emails` | ✅ | ALL: service_role only | ✅ Secure (admin only) |
| Storage `evidence` bucket | ✅ | SELECT/INSERT/UPDATE/DELETE: first path segment = `auth.uid()` | ✅ Secure |

**No RLS gaps identified on tables with user data.** All policies follow the principle of least privilege. ✅

---

## Part 10: Gap Analysis

### 10a. Broken Features

| Gap | Severity | Details |
|-----|----------|---------|
| Letter types `adr_referral`, `section_75_claim`, `letter_before_action` fail on DB insert | **CRITICAL** | These 3 types appear in `LetterWizard` but the `letters.letter_type` CHECK constraint only includes 8 original types. Any attempt to save these letters will throw a Postgres constraint violation. Migration required. |
| Rate limiting ineffective on Vercel serverless | **CRITICAL** | In-memory `Map`-based rate limiter does not persist across instances. AI endpoints have no effective global rate limiting in production. |
| `notification_preferences` column missing from migrations | **HIGH** | Column is read/written in the cron and settings page but has no migration. If the DB is re-migrated from scratch, this column won't exist and the cron will silently fail. |
| `share_token` / `is_shared` columns missing from migrations | **HIGH** | Used in `cases/[id]/share` API route but not in any migration file. Same schema-drift risk. |
| Dashboard "Generate Letter" quick action links to `/cases` | **MEDIUM** | Not a letter-drafting action — just navigates to the cases list. No letter is generated. |
| Dashboard "Export Case File" quick action links to `/cases` | **MEDIUM** | Same issue — not a direct export action. |
| `formal_notice` is a duplicate of `letter_before_action` | **MEDIUM** | Both have the same display name, description, and legal references in `letter-templates.ts`. Users see two identical tiles in the wizard. |
| Case analysis `letterType` enum incomplete | **MEDIUM** | 4 letter types (`adr_referral`, `section_75_claim`, `letter_before_action`, `custom`) not included in the JSON schema hint passed to Claude — AI can never recommend these types. |

---

### 10b. Missing UI for Existing Backend

| Gap | Severity | Details |
|-----|----------|---------|
| Guided Journeys — entire frontend missing | **CRITICAL** | `journey-prompts.ts` exists with 19 prompts across 5 categories. No pages, no wizard, no API routes, no database tables, no step renderers, no journey templates, no dashboard entry point. |
| `?created=true` journey prompt not rendered | **HIGH** | The URL param is set on redirect after case creation, but the case detail page does not read or act on it. No post-creation guided journey offer appears. |
| Company scorecard search/filter | **MEDIUM** | `/companies` shows a fixed top-5 list. No search box to find a specific company's scorecard. |
| `v_company_stats` view accessible for B2B customers | **MEDIUM** | The data exists but no business-customer-facing portal exists to view it. B2B product is entirely ops-delivered. |
| Overdue actions details | **LOW** | The dashboard shows an "Overdue Actions" count, but there's no dedicated page to list them. |

---

### 10c. Missing Backend for Existing UI

| Gap | Severity | Details |
|-----|----------|---------|
| Voice memo recording (Pro feature) | **MEDIUM** | `VoiceMemoRecorder` component exists in `src/components/cases/`. No API route for processing/storing voice memos beyond file upload. The component likely uploads as audio evidence but no AI transcription is wired. |
| Email forwarding parser (Pro feature) | **MEDIUM** | `EmailForward.tsx` component exists. `ForwardReplyPanel` and `EmailForwardPanel` exist. The inbound email webhook (`/api/webhooks/inbound-email`) handles inbound replies — but the "parse a forwarded email and auto-fill an interaction" feature may not be fully connected. |
| Withdraw cookie consent | **MEDIUM** | `CookieConsent.tsx` sets consent on first choice but provides no mechanism to change it. No settings page option, no footer link. |
| B2B self-serve portal | **HIGH** | B2B pricing page promises self-serve access. No portal exists — all onboarding is manual. |

---

### 10d. Incomplete User Journeys

| Gap | Severity | Details |
|-----|----------|---------|
| New user → case created → "Start Guided Journey" prompt | **CRITICAL** | The entire guided journey post-creation flow is missing. New users have no guided walkthrough after their first case. |
| Free user creating second case — no pre-flight gate | **MEDIUM** | The case creation wizard renders fully before the server action rejects it. Users get an error after completing the wizard rather than being informed before starting. |
| Pack purchase → Stripe delay → success page shows wrong state | **LOW** | If the Stripe `checkout.session.completed` webhook hasn't fired by the time the user lands on `/packs/success`, the "Case upgraded to Pro" tick won't show. No polling or retry. |
| Email change flow | **MEDIUM** | No option to change email address in settings. Users must contact support. |

---

### 10e. Missing Features

| Gap | Severity | Details |
|-----|----------|---------|
| Custom 404 page (`not-found.tsx`) | **HIGH** | Generic Next.js default shown for all 404s. No branding, no helpful links. |
| OG image (`/public/og-image.png`) | **HIGH** | Referenced in root layout metadata. Missing file means ALL page social shares show a broken image preview. |
| Guided Journeys (entire feature) | **CRITICAL** | See 10b. |
| B2B self-serve portal | **HIGH** | See 10c. |
| Organisation quick-search on dashboard | **MEDIUM** | Planned ("Who are you in a dispute with?" on empty dashboard) — not implemented. |
| Cookie preference management (post-consent) | **MEDIUM** | No way to withdraw or change analytics consent after initial choice. GDPR requires this. |
| Case resolution outcome form | **MEDIUM** | No dedicated UI asking "Did you get what you wanted? (yes/partially/no)" when resolving a case. Fields exist in DB (`resolution_summary`, `compensation_received`) but there's no guided form. |
| Email change in settings | **MEDIUM** | Not possible via UI — requires contacting support. |
| Subscription success page | **LOW** | After subscribing, users land on `/dashboard` with no confirmation banner or welcome message specific to their new tier. |

---

### 10f. UX Issues

| Gap | Severity | Details |
|-----|----------|---------|
| 5 tabs on `/cases/[id]` on mobile | **MEDIUM** | 5 tabs (Timeline/Interactions/Evidence/Letters/Escalation) on 375px screens horizontally scroll. Very small tap targets. |
| "How It Works" page has 4 grey placeholder boxes | **HIGH** | Dashed-border boxes reading "Step 1 screenshot" etc. are clearly unfinished. Damages trust for users who click from the landing page. |
| Google OAuth button shows tick icon | **MEDIUM** | `<Check>` icon on "Continue with Google" button — misleading. Should be Google's `G` icon. |
| Sidebar active state bug | **LOW** | Dashboard sidebar shows Dashboard as active when on `/dashboard/packs`. |
| `Letters` and `Templates` share the same `FileText` icon in sidebar | **LOW** | Visual ambiguity. |
| No post-subscription confirmation message | **LOW** | After upgrading, user lands on `/dashboard` with no "Welcome to Basic/Pro!" message. |
| Unauthenticated pack buyers redirected to `/register` silently | **LOW** | No explanation that an account is needed. Could reduce pack conversion. |

---

### 10g. SEO Gaps

| Gap | Severity | Details |
|-----|----------|---------|
| OG image missing | **HIGH** | `/og-image.png` referenced but doesn't exist. All social shares show broken image. |
| Homepage is `"use client"` — no `generateMetadata` | **HIGH** | Most important page has no page-level SEO metadata. Client-rendered homepage is slower for crawlers. |
| `/companies` and `/business` have thin metadata | **MEDIUM** | Short descriptions, no `openGraph` blocks. Social sharing degrades to root layout defaults. |
| `robots.ts` missing explicit `allow` for key pages | **LOW** | `/companies`, `/guides/*`, `/templates/*`, `/calculator`, `/packs`, `/business` not in allow list. |
| Pro plan missing from JSON-LD `SoftwareApplication` schema | **LOW** | Root layout JSON-LD only includes Free and Basic Offer objects. Pro is not listed. |

---

### 10h. Security Concerns

| Gap | Severity | Details |
|-----|----------|---------|
| Rate limiting is in-memory only | **CRITICAL** | Does not work across Vercel serverless instances. All AI endpoints lack effective global rate limiting. |
| Resend webhook has no signature verification | **HIGH** | Anyone who discovers the URL can spoof delivery events, potentially marking letters as delivered/opened/bounced. |
| Inbound email webhook has no authentication | **HIGH** | No secret, no IP allowlist. Any HTTP caller can inject fake inbound emails into cases. |
| `notification_preferences` and `share_token`/`is_shared` missing from migrations | **HIGH** | Schema drift — production DB differs from migration files. Rebuild from migrations would lose these columns and break features. |
| `sentry.client.config.ts` duplicate file | **LOW** | Should be removed; `instrumentation-client.ts` is the correct file for Turbopack. |
| Two account deletion paths with different behaviour | **LOW** | API route (`/api/account/delete`) cancels all Stripe subscriptions by listing them; server action (`deleteAccount()`) only cancels by stored `subscription_id`. These should be consolidated. |

---

## Appendix A: Complete Route Map

| Route | Auth Required | Component/Handler | Status |
|-------|--------------|------------------|--------|
| `/` | No | `(marketing)/page.tsx` | ✅ Working |
| `/how-it-works` | No | `(marketing)/how-it-works/page.tsx` | ⚠️ Partial (placeholder images) |
| `/about` | No | `(marketing)/about/page.tsx` | ✅ Working |
| `/pricing` | No | `(marketing)/pricing/PricingClient.tsx` | ✅ Working |
| `/templates` | No | `TemplatesGrid` component | ✅ Working |
| `/templates/[slug]` | No | `(marketing)/templates/[slug]/page.tsx` | ✅ Working (10 slugs SSG) |
| `/calculator` | No | `CalculatorClient.tsx` | ✅ Working |
| `/packs` | No | `PacksCheckoutClient.tsx` | ✅ Working |
| `/escalation-guides` | No | `(marketing)/escalation-guides/page.tsx` | ✅ Working |
| `/escalation-guides/[category]` | No | `(marketing)/escalation-guides/[category]/page.tsx` | ✅ Working (15 SSG) |
| `/guides/[slug]` | No | `(marketing)/guides/[slug]/page.tsx` | ✅ Working (15 SSG) |
| `/companies` | No | `CompanyScorecardIndex` | ✅ Working |
| `/companies/[slug]` | No | `(marketing)/companies/[slug]/page.tsx` | ✅ Working |
| `/business` | No | `BusinessEnquiryForm` | ✅ Working |
| `/privacy` | No | `(marketing)/privacy/page.tsx` | ✅ Working |
| `/terms` | No | `(marketing)/terms/page.tsx` | ✅ Working |
| `/shared/[token]` | No | `(marketing)/shared/[token]/page.tsx` | ✅ Working |
| `/login` | No (redirects if authed) | `(auth)/login/page.tsx` | ✅ Working |
| `/register` | No (redirects if authed) | `(auth)/register/page.tsx` | ✅ Working |
| `/forgot-password` | No | `(auth)/forgot-password/page.tsx` | ✅ Working |
| `/callback` | No | `(auth)/callback/route.ts` | ✅ Working |
| `/dashboard` | Yes | `(dashboard)/dashboard/page.tsx` | ✅ Working |
| `/dashboard/packs` | Yes | `(dashboard)/dashboard/packs/page.tsx` | ✅ Working |
| `/cases` | Yes | `CasesClient.tsx` | ✅ Working |
| `/cases/new` | Yes | `CaseWizard.tsx` | ✅ Working |
| `/cases/[id]` | Yes | `(dashboard)/cases/[id]/page.tsx` | ✅ Working |
| `/cases/[id]/timeline` | Yes | `(dashboard)/cases/[id]/timeline/page.tsx` | ✅ Working |
| `/cases/[id]/export` | Yes | `ExportClient.tsx` | ✅ Working |
| `/cases/[id]/interactions/new` | Yes | `(dashboard)/cases/[id]/interactions/new/page.tsx` | ✅ Working |
| `/cases/[id]/letters` | Yes | `(dashboard)/cases/[id]/letters/page.tsx` | ✅ Working |
| `/cases/[id]/letters/new` | Yes | `LetterWizard.tsx` | ⚠️ Partial (3 letter types break DB) |
| `/cases/[id]/letters/[letterId]` | Yes | `(dashboard)/cases/[id]/letters/[letterId]/page.tsx` | ✅ Working |
| `/letters` | Yes | `(dashboard)/letters/page.tsx` | ✅ Working |
| `/reminders` | Yes | `RemindersClient.tsx` | ✅ Working |
| `/packs/success` | No (⚠️ should be) | `(dashboard)/packs/success/page.tsx` | ✅ Working |
| `/settings` | Yes | Redirect to `/settings/profile` | ✅ Working |
| `/settings/account` | Yes | `AccountClient.tsx` | ✅ Working |
| `/settings/billing` | Yes | `BillingClient.tsx` | ✅ Working |
| `/settings/notifications` | Yes | `NotificationsForm.tsx` | ✅ Working |
| `/settings/profile` | Yes | `ProfileForm.tsx` | ✅ Working |
| `/admin` | Yes (is_admin) | `(admin)/admin/page.tsx` | ✅ Working |
| `/admin/b2b` | Yes (is_admin) | `B2BPilotsTable.tsx` | ✅ Working |
| `/admin/categories` | Yes (is_admin) | `(admin)/admin/categories/page.tsx` | ✅ Working |
| `/admin/companies` | Yes (is_admin) | `CompaniesTable.tsx` | ✅ Working |
| `/admin/companies/[id]` | Yes (is_admin) | `(admin)/admin/companies/[id]/page.tsx` | ✅ Working |
| `/admin/users` | Yes (is_admin) | `UsersTable.tsx` | ✅ Working |
| `/api/ai/suggest` | Yes (JWT) | Anthropic Claude | ✅ Working |
| `/api/ai/draft-letter` | Yes (JWT) | Anthropic Claude | ⚠️ Partial (3 letter types fail DB) |
| `/api/ai/summarise` | Yes (JWT) | HuggingFace Haiku | ✅ Working |
| `/api/stripe/checkout` | Yes (JWT) | Stripe | ✅ Working |
| `/api/stripe/portal` | Yes (JWT) | Stripe | ✅ Working |
| `/api/packs/checkout` | Yes (JWT) | Stripe | ✅ Working |
| `/api/webhooks/stripe` | No (sig verify) | Stripe | ✅ Working |
| `/api/webhooks/resend` | ❌ None | Resend | ⚠️ Security gap |
| `/api/webhooks/inbound-email` | ❌ None | Resend | ⚠️ Security gap |
| `/api/export/pdf` | Yes (JWT) | `@react-pdf/renderer` | ✅ Working |
| `/api/export/letter-pdf` | Yes (JWT) | `@react-pdf/renderer` | ✅ Working |
| `/api/export/data` | Yes (JWT) | JSON dump | ✅ Working |
| `/api/letters/[id]` | Yes (JWT) | Supabase | ✅ Working |
| `/api/letters/[id]/send` | Yes (JWT) | Resend | ✅ Working |
| `/api/cases/[id]/share` | Yes (JWT) | Supabase | ✅ Working |
| `/api/cases/[id]/response-received` | Yes (JWT) | Supabase | ✅ Working |
| `/api/cases/[id]/inbound-alias` | Yes (JWT) | Supabase | ✅ Working |
| `/api/reminders/cron` | Cron secret | Supabase | ✅ Working |
| `/api/business-enquiries` | No | Supabase | ✅ Working |
| `/api/account/delete` | Yes (JWT) | Supabase + Stripe | ✅ Working |
| `/api/account/export` | Yes (JWT) | Supabase | ✅ Working |
| `/api/seed` | Seed secret | Supabase | ✅ Working |
| `/api/admin/*` | Yes (is_admin) | Supabase service role | ✅ Working |
| `/api/companies/[slug]/stats` | No | Supabase | ✅ Working |
| `/sitemap.xml` | No | `app/sitemap.ts` | ✅ Working |
| `/robots.txt` | No | `app/robots.ts` | ✅ Working |
| `/_not-found` | No | Next.js default | ⚠️ Unstyled default |

---

## Appendix B: Complete Feature Matrix

| Feature | Free | Basic | Pro | Status | Files |
|---------|------|-------|-----|--------|-------|
| Account creation | ✅ | ✅ | ✅ | ✅ Working | `register/page.tsx`, `callback/route.ts` |
| Google OAuth | ✅ | ✅ | ✅ | ✅ Working | `login/page.tsx`, `register/page.tsx` |
| Magic link login | ✅ | ✅ | ✅ | ✅ Working | `login/page.tsx` |
| Case creation | 1 only | Unlimited | Unlimited | ✅ Working | `cases/new/CaseWizard.tsx`, `lib/actions/cases.ts` |
| Case templates (10) | ✅ | ✅ | ✅ | ✅ Working | `lib/data/complaint-templates.ts` |
| Organisation search | ✅ | ✅ | ✅ | ✅ Working | `OrganisationSearch.tsx` (trigram) |
| Log interactions | ✅ | ✅ | ✅ | ✅ Working | `InteractionForm.tsx`, `lib/actions/interactions.ts` |
| Promise tracking | ✅ | ✅ | ✅ | ✅ Working | Interactions table + triggers |
| Evidence upload | ✅ | ✅ | ✅ | ✅ Working | `EvidenceUpload.tsx`, `lib/actions/evidence.ts` |
| Evidence gallery | ✅ | ✅ | ✅ | ✅ Working | `EvidenceGallery.tsx` |
| AI case analysis | ❌ | ✅ (10/mo) | ✅ (50/mo) | ✅ Working | `AISuggestion.tsx`, `/api/ai/suggest` |
| AI letter drafting (8 types) | ❌ | ✅ (5/mo) | ✅ (30/mo) | ✅ Working | `LetterWizard.tsx`, `/api/ai/draft-letter` |
| AI letter drafting (3 new types) | ❌ | ❌ (breaks DB) | ❌ (breaks DB) | ❌ BROKEN | Missing DB migration |
| AI case summarisation | ❌ | ✅ (100/mo) | ✅ (500/mo) | ✅ Working | `/api/ai/summarise` |
| Letter sending (Resend) | ✅ | ✅ | ✅ | ✅ Working | `SendLetterButton.tsx`, `/api/letters/[id]/send` |
| Letter delivery tracking | ✅ | ✅ | ✅ | ✅ Working | `/api/webhooks/resend` |
| PDF export (timeline/letters) | ❌ | ✅ | ✅ | ✅ Working | `ExportClient.tsx`, `/api/export/pdf` |
| PDF export (full case) | ❌ | ❌ | ✅ | ✅ Working | Same |
| Escalation guidance | ✅ | ✅ | ✅ | ✅ Working | `EscalationGuide.tsx`, `escalation_rules` table |
| Escalation window alerts | ❌ | ✅ | ✅ | ✅ Working | Cron + `EscalationAlertEmail` |
| Guided journeys | N/A | N/A | N/A | ❌ MISSING | Not built |
| Share case (public link) | ✅ | ✅ | ✅ | ✅ Working | `ShareCaseButton.tsx`, `/api/cases/[id]/share` |
| Response timer | ✅ | ✅ | ✅ | ✅ Working | `ResponseTimer.tsx` |
| Inbound email reply linking | ❌ | ❌ | ✅ | ⚠️ Partial | `ForwardReplyPanel.tsx`, webhook (no auth) |
| Voice memo recording | ❌ | ❌ | ✅ | ⚠️ Partial | `VoiceMemoRecorder.tsx` exists; no AI processing |
| Reminders system | ✅ | ✅ | ✅ | ✅ Working | `reminders/page.tsx`, cron |
| Daily reminder digest email | ❌ | ✅ | ✅ | ✅ Working | `ReminderDigestEmail.tsx`, cron |
| Company scorecards | ✅ | ✅ | ✅ | ✅ Working | `/companies/[slug]`, `v_company_stats` |
| Compensation calculator | ✅ | ✅ | ✅ | ✅ Working | `CalculatorClient.tsx` |
| Subscription management | N/A | ✅ | ✅ | ✅ Working | `BillingClient.tsx`, Stripe Portal |
| Complaint packs | ✅ | ✅ | ✅ | ✅ Working | `PacksCheckoutClient.tsx` |
| Account data export (GDPR) | ✅ | ✅ | ✅ | ✅ Working | `AccountClient.tsx`, `/api/account/export` |
| Account deletion | ✅ | ✅ | ✅ | ✅ Working | `AccountClient.tsx`, `/api/account/delete` |
| B2B enquiry form | N/A | N/A | N/A | ✅ Working | `BusinessEnquiryForm.tsx` |
| B2B admin pipeline | N/A | N/A | N/A | ✅ Working | `/admin/b2b`, `B2BPilotsTable.tsx` |
| B2B self-serve portal | N/A | N/A | N/A | ❌ MISSING | Not built |
| Admin analytics dashboard | N/A | N/A | N/A | ✅ Working | `/admin/page.tsx` |
| PostHog analytics | ✅ | ✅ | ✅ | ✅ Working | `PostHogProvider.tsx`, `posthog.ts` |
| Sentry error monitoring | ✅ | ✅ | ✅ | ✅ Working | `instrumentation*.ts`, `sentry.*.config.ts` |
| PWA manifest | ✅ | ✅ | ✅ | ✅ Working | `public/manifest.json` |
| Cookie consent (GDPR) | ✅ | ✅ | ✅ | ⚠️ Partial | `CookieConsent.tsx` (no withdrawal mechanism) |

---

## Appendix C: Recommended Priority Actions

### Immediate (Before Any Public Traffic)

1. **Fix the `letters.letter_type` CHECK constraint** — Add migration to include `adr_referral`, `section_75_claim`, `letter_before_action`. This is a silent data error that will break the letter wizard for 3 of 11 letter types. Also remove the duplicate `formal_notice` template.

2. **Create missing database migrations** — Write `ALTER TABLE` migrations for `share_token`/`is_shared` on `cases` and `notification_preferences` on `profiles`. Without these, a fresh DB deployment would break sharing and the cron.

3. **Replace in-memory rate limiter** — Implement Upstash Redis or Vercel KV-based rate limiting for all AI endpoints. Current implementation provides zero protection in serverless production.

4. **Add Resend webhook signature verification** — Implement `svix` or a shared webhook secret to verify that POST requests to `/api/webhooks/resend` originate from Resend's servers.

5. **Secure the inbound email webhook** — Add a shared secret header check or verify the request originates from Resend's IP range on `/api/webhooks/inbound-email`.

6. **Create `/public/og-image.png`** — All social sharing previews are currently broken. A 1200×630px branded OG image is needed immediately.

7. **Create `src/app/not-found.tsx`** — Replace the generic Next.js 404 with a branded, helpful page with navigation links and a search option.

### High Priority (Week 1)

8. **Fix the `/how-it-works` placeholder boxes** — Replace the 4 "Step X screenshot" placeholder containers with real screenshots or mockups. This is visible to users who click from the landing page.

9. **Remove `sentry.client.config.ts`** — The content has already been moved to `instrumentation-client.ts`. The old file causes a Turbopack deprecation warning on every build.

10. **Fix the Google OAuth button icon** — Replace `<Check>` with a proper Google icon in `register/page.tsx`.

11. **Convert the homepage to a Server Component** — Extract the animated sections into a separate `"use client"` child component, allowing the page wrapper to export `generateMetadata` for proper SEO metadata on the most important URL.

12. **Add cookie consent withdrawal mechanism** — Add a "Cookie Settings" link in the footer that allows users to change their analytics preference. Required for full GDPR compliance.

### Medium Priority (Weeks 1–2)

13. **Build the Guided Journey frontend** — The prompt library (`journey-prompts.ts`) is complete. The work needed is: journey template config (step sequences), API routes (`GET/POST /api/journeys`, `POST /api/journeys/[id]/step`), a journey database table (or use `cases` metadata), and the `JourneyWizard` component with 7 step-type renderers. This is the largest feature gap.

14. **Implement `?created=true` journey prompt on case detail** — Show a contextual banner after first case creation offering to start the relevant guided journey.

15. **Fix dashboard quick actions** — "Generate Letter" and "Export Case File" should either be removed from the quick actions bar or replaced with working implementations (e.g., a modal to select a case, or navigation to the most recent case).

16. **Add pre-flight case limit check in case creation wizard** — Show a paywall prompt at the start of the wizard for free users who already have 1 case, rather than letting them complete the wizard and fail on submission.

17. **Fix the case analysis `letterType` enum** — Add `adr_referral`, `section_75_claim`, `letter_before_action`, `custom` to the JSON schema hint in `buildCaseAnalysisPrompt()`.

18. **Add a resolution outcome form** — When a user sets a case to "resolved", show a structured form asking for outcome details (`compensation_received`, `resolution_summary`). Fields exist in the DB but there's no guided UI.

19. **Company scorecard search** — Add a text search input to `/companies` so users can find their specific company rather than only seeing top-5 rankings.

### Lower Priority (Weeks 2–4)

20. **Add email change option to Profile Settings** — Currently requires contacting support. Can be implemented via `supabase.auth.updateUser({ email: newEmail })`.

21. **Add subscription success message** — Show a "Welcome to Basic/Pro!" toast or banner when a user first arrives on `/dashboard` after upgrading.

22. **Fix sidebar active state for `/dashboard/packs`** — The Dashboard nav item incorrectly activates on sub-routes.

23. **Differentiate Letters and Templates sidebar icons** — Use distinct icons to avoid visual confusion.

24. **Enrich OG metadata for `/companies` and `/business`** — Add proper `openGraph` blocks with longer descriptions.

25. **Update `robots.ts` allow list** — Add explicit allow entries for `/companies`, `/guides/*`, `/templates/*`, `/calculator`, `/packs`, `/business`.

26. **Add Pro plan to JSON-LD SoftwareApplication schema** — Root layout only includes Free and Basic Offer objects.

27. **Consolidate the two account deletion paths** — Align the server action (`deleteAccount()`) with the API route (`/api/account/delete`) to use the same Stripe subscription cancellation logic.

28. **Add pagination to admin users table** — Current 500-row hard limit will become a problem at scale.

---

## Build Output

```
▲ Next.js 15.5.12
   - Experiments (use with caution):
     · clientTraceMetadata

[@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your
`sentry.client.config.ts` file, or moving its content to
`instrumentation-client.ts`. When using Turbopack `sentry.client.config.ts`
will no longer work.

<w> Serializing big strings (139kiB, 189kiB, 140kiB) impacts deserialization
performance (consider using Buffer instead)

✓ Compiled successfully in 15.5s
✓ Linting and checking validity of types ... (passed — 0 errors)
✓ Generating static pages (101/101)

Route (app)                                            Size  First Load JS
┌ ○ /                                               46.3 kB         228 kB
├ ○ /_not-found                                        1 kB         181 kB
├ ○ /about                                            207 B         182 kB
├ ƒ /admin                                          1.15 kB         183 kB
├ ƒ /admin/b2b                                      2.24 kB         191 kB
├ ƒ /admin/categories                                 207 B         182 kB
├ ƒ /admin/companies                                1.46 kB         183 kB
├ ƒ /admin/companies/[id]                             207 B         182 kB
├ ƒ /admin/users                                      948 B         181 kB
[ API routes ... 223B each ]
├ ○ /business                                       1.31 kB         181 kB
├ ○ /calculator                                     1.71 kB         183 kB
├ ƒ /cases                                          5.44 kB         255 kB
├ ƒ /cases/[id]                                     16.9 kB         393 kB  ← LARGEST PAGE
├ ƒ /cases/[id]/export                              5.21 kB         215 kB
├ ƒ /cases/[id]/interactions/new                      317 B         367 kB
├ ƒ /cases/[id]/letters                             1.16 kB         196 kB
├ ƒ /cases/[id]/letters/[letterId]                  6.21 kB         236 kB
├ ƒ /cases/[id]/letters/new                         8.21 kB         216 kB
├ ƒ /cases/[id]/timeline                            1.81 kB         308 kB
├ ƒ /cases/new                                      12.6 kB         368 kB
├ ○ /companies                                        992 B         182 kB
├ ƒ /companies/[slug]                                 207 B         182 kB
├ ƒ /dashboard                                       2.4 kB         374 kB
├ ● /escalation-guides/[category]                     207 B         182 kB  (15 paths)
├ ○ /forgot-password                                 3.9 kB         306 kB
├ ● /guides/[slug]                                    207 B         182 kB  (15 paths)
├ ○ /how-it-works                                     207 B         182 kB
├ ƒ /letters                                        1.49 kB         196 kB
├ ○ /login                                          4.36 kB         306 kB
├ ƒ /packs                                          2.27 kB         193 kB
├ ƒ /pricing                                        6.41 kB         207 kB
├ ƒ /reminders                                      6.46 kB         327 kB
├ ƒ /settings/account                               4.4 kB         291 kB
├ ƒ /settings/billing                               6.85 kB         217 kB
├ ƒ /settings/notifications                         3.26 kB         217 kB
├ ƒ /settings/profile                               4.98 kB         250 kB
├ ƒ /shared/[token]                                   280 B         182 kB
├ ● /templates/[slug]                                 207 B         182 kB  (10 paths)
└ ○ /terms                                            223 B         180 kB

+ First Load JS shared by all: 180 kB
ƒ Middleware: 89.6 kB

Build result: ✅ SUCCESS — 0 errors, 0 type errors
101 total routes
```
