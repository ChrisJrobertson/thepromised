# TheyPromised — Full Codebase Audit

**Audit Date:** 16 March 2026  
**Branch:** `cursor/project-codebase-audit-576b`  
**Auditor:** Automated codebase audit

---

## Section 1: Project Structure

### Top-Level Directory Layout

```
/workspace
├── public/                  PWA icons, manifest.json, favicons
├── src/
│   ├── app/                 Next.js App Router routes (grouped)
│   ├── components/          Reusable UI components
│   ├── lib/                 Business logic, utilities, integrations
│   ├── middleware.ts         Edge middleware for auth routing
│   ├── test/                Unit test setup + tests
│   └── types/               TypeScript type definitions
├── supabase/
│   └── migrations/          6 SQL migration files
├── tests/
│   └── e2e/                 Playwright e2e test directory (currently empty)
├── .env.local.example       Template for all required env vars
├── next.config.ts           Next.js config wrapped with Sentry
├── vercel.json              Vercel deployment config (crons, headers)
├── package.json             Project manifest
├── tsconfig.json            TypeScript config
├── vitest.config.ts         Vitest unit test config
└── playwright.config.ts     Playwright e2e config
```

### Framework & Major Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.5.12 | Framework (App Router) |
| react | 19.2.3 | UI runtime |
| @supabase/supabase-js | ^2.99.1 | Database + auth client |
| @supabase/ssr | ^0.9.0 | SSR/middleware auth helpers |
| stripe | ^20.4.1 | Payment processing |
| @anthropic-ai/sdk | ^0.78.0 | AI (Claude) integration |
| resend | ^6.9.3 | Transactional email |
| @react-pdf/renderer | ^4.3.2 | PDF generation |
| framer-motion | ^12.36.0 | Animations |
| @tanstack/react-query | ^5.90.21 | Client-side data fetching |
| react-hook-form | ^7.71.2 | Form management |
| zod | ^4.3.6 | Schema validation |
| posthog-js + posthog-node | ^1.360.2 / ^5.28.2 | Analytics |
| @sentry/nextjs | ^10.43.0 | Error monitoring |
| @vercel/analytics | ^2.0.1 | Vercel web analytics |
| @vercel/speed-insights | ^2.0.0 | Vercel performance tracking |
| tailwindcss | ^4 | CSS utility framework |
| shadcn/ui (via components) | via shadcn@^4.0.7 | Component library |
| lucide-react | ^0.577.0 | Icons |
| date-fns | ^4.1.0 | Date utilities |
| sonner | ^2.0.7 | Toast notifications |
| nanoid | ^5.1.7 | ID generation |
| cmdk | ^1.1.1 | Command palette |
| next-themes | ^0.4.6 | Dark mode |

### Tailwind Version & Configuration

**Tailwind CSS v4** — configured via `postcss.config.mjs` with `@tailwindcss/postcss`. No `tailwind.config.js` is present (v4 uses CSS-first config in `src/app/globals.css`). Uses `tw-animate-css` for animation utilities and `tailwind-merge` + `clsx` for class composition.

### TypeScript Configuration

TypeScript 5 in strict mode. Standard Next.js tsconfig with `@/*` path alias pointing to `./src/*`. `noEmit` type checking via `npm run typecheck`.

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Required** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Required** | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required** | Supabase service role key (server-only) |
| `STRIPE_SECRET_KEY` | **Required** | Stripe server-side secret key |
| `STRIPE_WEBHOOK_SECRET` | **Required** | Stripe webhook signature secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Required** | Stripe publishable key |
| `STRIPE_PRICE_ID_BASIC_MONTHLY` | **Required** | Stripe Basic monthly price ID |
| `STRIPE_PRICE_ID_BASIC_ANNUAL` | **Required** | Stripe Basic annual price ID |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | **Required** | Stripe Pro monthly price ID |
| `STRIPE_PRICE_ID_PRO_ANNUAL` | **Required** | Stripe Pro annual price ID |
| `ANTHROPIC_API_KEY` | **Required** | Claude API key |
| `RESEND_API_KEY` | **Required** | Resend email API key |
| `NEXT_PUBLIC_APP_URL` | **Required** | App base URL (e.g. https://www.theypromised.app) |
| `NEXT_PUBLIC_APP_NAME` | Optional | App name (defaults to "TheyPromised") |
| `CRON_SECRET` | **Required** | Bearer token to authenticate cron endpoint |
| `SEED_SECRET` | Optional | One-time secret for `/api/seed` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | PostHog host (default: `https://eu.posthog.com`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry error monitoring DSN |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry source map upload token |
| `B2B_ALERT_EMAIL` | Optional | Recipient for B2B SLA alert emails (defaults to `support@theypromised.app`) |
| `RESEND_ADMIN_FROM` | Optional | Override sender for admin B2B scorecard emails |

**Note:** `.env.local.example` shows `sk_test_...` and `pk_test_...` prefix placeholders, indicating Stripe is configured for **test mode** by default.

---

## Section 2: Database Schema

*Schema derived from all 6 migration files. No live Supabase credentials were available in this environment.*

### Tables

#### `public.profiles`
Extends `auth.users`. Auto-created by trigger on user signup.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| email | text | — | NOT NULL |
| full_name | text | NULL | |
| phone | text | NULL | |
| address_line_1 | text | NULL | |
| address_line_2 | text | NULL | |
| city | text | NULL | |
| postcode | text | NULL | |
| stripe_customer_id | text | NULL | UNIQUE |
| subscription_tier | text | 'free' | CHECK: free / basic / pro |
| subscription_status | text | 'active' | CHECK: active / cancelled / past_due / trialing / pack_temporary |
| subscription_id | text | NULL | Stripe subscription ID |
| cases_count | integer | 0 | Auto-updated by trigger |
| ai_credits_used | integer | 0 | Aggregate credits (reset monthly) |
| ai_suggestions_used | integer | 0 | Separate suggestions counter |
| ai_letters_used | integer | 0 | Separate letters counter |
| ai_credits_reset_at | timestamptz | NOW() | |
| is_admin | boolean | false | Admin flag |
| last_export_at | timestamptz | NULL | |
| pack_pro_expires_at | timestamptz | NULL | Expiry for temporary pack-based Pro access |
| pack_access_case_id | uuid | NULL | FK → cases(id) — scoped pack access |
| pack_source_pack_id | uuid | NULL | FK → complaint_packs(id) |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | Auto-updated by trigger |

#### `public.organisations`
Canonical list of organisations users can file complaints against.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| name | text | — | NOT NULL. GIN trigram index |
| category | text | — | NOT NULL. CHECK: energy / water / broadband_phone / financial_services / insurance / government_hmrc / government_dwp / government_council / nhs / housing / retail / transport / education / employment / other |
| complaint_email | text | NULL | |
| complaint_phone | text | NULL | |
| complaint_address | text | NULL | |
| website | text | NULL | |
| ombudsman_name | text | NULL | |
| ombudsman_url | text | NULL | |
| escalation_wait_weeks | integer | 8 | |
| notes | text | NULL | |
| is_verified | boolean | false | |
| created_at | timestamptz | NOW() | |

#### `public.cases`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| user_id | uuid | — | NOT NULL. FK → profiles(id) ON DELETE CASCADE |
| organisation_id | uuid | NULL | FK → organisations(id) |
| custom_organisation_name | text | NULL | Free-text org name when no org_id |
| category | text | — | NOT NULL |
| title | text | — | NOT NULL |
| description | text | NULL | |
| status | text | 'open' | CHECK: open / escalated / resolved / closed |
| priority | text | 'medium' | CHECK: low / medium / high / urgent |
| reference_number | text | NULL | |
| desired_outcome | text | NULL | |
| amount_in_dispute | numeric(10,2) | NULL | |
| escalation_stage | text | 'initial' | CHECK: initial / formal_complaint / final_response / ombudsman / court |
| escalation_deadline | timestamptz | NULL | |
| first_contact_date | timestamptz | NULL | |
| last_interaction_date | timestamptz | NULL | Auto-updated by trigger |
| resolved_date | timestamptz | NULL | |
| resolution_summary | text | NULL | |
| compensation_received | numeric(10,2) | NULL | |
| interaction_count | integer | 0 | Auto-updated by trigger |
| response_deadline | timestamptz | NULL | 14-day window after letter sent |
| response_received | boolean | false | |
| response_received_at | timestamptz | NULL | |
| inbound_email_alias | text | NULL | UNIQUE (partial index, when not NULL). Pro feature |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | Auto-updated by trigger |

#### `public.interactions`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| case_id | uuid | — | NOT NULL. FK → cases(id) ON DELETE CASCADE |
| user_id | uuid | — | NOT NULL. FK → profiles(id) ON DELETE CASCADE |
| interaction_date | timestamptz | — | NOT NULL |
| channel | text | — | NOT NULL. CHECK: phone / email / letter / webchat / in_person / social_media / app / other |
| direction | text | — | NOT NULL. CHECK: inbound / outbound |
| contact_name | text | NULL | |
| contact_department | text | NULL | |
| contact_role | text | NULL | |
| reference_number | text | NULL | |
| duration_minutes | integer | NULL | |
| summary | text | — | NOT NULL |
| promises_made | text | NULL | |
| promise_deadline | timestamptz | NULL | |
| promise_fulfilled | boolean | NULL | NULL = pending, true = kept, false = broken |
| outcome | text | NULL | CHECK: resolved / escalated / promised_callback / promised_action / no_resolution / transferred / disconnected / letter_sent / other |
| next_steps | text | NULL | |
| mood | text | NULL | CHECK: helpful / neutral / unhelpful / hostile |
| ai_summary | text | NULL | Auto-generated AI summary |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | Auto-updated by trigger |

#### `public.evidence`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| case_id | uuid | — | NOT NULL. FK → cases(id) ON DELETE CASCADE |
| interaction_id | uuid | NULL | FK → interactions(id) ON DELETE SET NULL |
| user_id | uuid | — | NOT NULL. FK → profiles(id) ON DELETE CASCADE |
| file_name | text | — | NOT NULL |
| file_type | text | — | NOT NULL |
| file_size | integer | — | NOT NULL |
| storage_path | text | — | NOT NULL. Path in Supabase Storage `evidence` bucket |
| description | text | NULL | |
| evidence_type | text | NULL | CHECK: screenshot / email / letter / photo / voice_memo / document / receipt / contract / other |
| created_at | timestamptz | NOW() | |

#### `public.letters`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| case_id | uuid | — | NOT NULL. FK → cases(id) ON DELETE CASCADE |
| user_id | uuid | — | NOT NULL. FK → profiles(id) ON DELETE CASCADE |
| letter_type | text | — | NOT NULL. CHECK: initial_complaint / follow_up / escalation / final_response_request / ombudsman_referral / subject_access_request / formal_notice / custom |
| recipient_name | text | NULL | |
| recipient_address | text | NULL | |
| subject | text | — | NOT NULL |
| body | text | — | NOT NULL |
| ai_generated | boolean | false | |
| sent_date | timestamptz | NULL | |
| sent_via | text | NULL | CHECK: email / post / not_sent |
| status | text | 'draft' | CHECK: draft / sent / acknowledged |
| sent_at | timestamptz | NULL | |
| sent_to_email | text | NULL | |
| resend_email_id | text | NULL | Resend delivery tracking ID |
| delivery_status | text | 'draft' | Tracks: draft / sent / delivered / opened / bounced |
| delivered_at | timestamptz | NULL | |
| opened_at | timestamptz | NULL | |
| bounced_at | timestamptz | NULL | |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | Auto-updated by trigger |

#### `public.escalation_rules`
Seeded data defining the escalation path per category.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| category | text | — | NOT NULL |
| stage | text | — | NOT NULL |
| stage_order | integer | — | NOT NULL |
| title | text | — | NOT NULL |
| description | text | — | NOT NULL |
| action_required | text | — | NOT NULL |
| wait_period_days | integer | NULL | |
| deadline_type | text | NULL | CHECK: from_complaint / from_response / absolute |
| regulatory_body | text | NULL | |
| regulatory_url | text | NULL | |
| template_available | boolean | false | |
| tips | text | NULL | |
| created_at | timestamptz | NOW() | |

#### `public.reminders`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| user_id | uuid | — | NOT NULL. FK → profiles(id) ON DELETE CASCADE |
| case_id | uuid | — | NOT NULL. FK → cases(id) ON DELETE CASCADE |
| interaction_id | uuid | NULL | FK → interactions(id) ON DELETE SET NULL |
| reminder_type | text | — | CHECK: promise_deadline / escalation_window / follow_up / custom / response_approaching / response_due / response_overdue / notification |
| title | text | — | NOT NULL |
| description | text | NULL | |
| due_date | timestamptz | — | NOT NULL |
| is_sent | boolean | false | |
| is_dismissed | boolean | false | |
| created_at | timestamptz | NOW() | |

#### `public.exports`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| case_id | uuid | — | NOT NULL. FK → cases(id) ON DELETE CASCADE |
| user_id | uuid | — | NOT NULL. FK → profiles(id) ON DELETE CASCADE |
| file_name | text | — | NOT NULL |
| storage_path | text | — | NOT NULL |
| export_type | text | 'full_case' | CHECK: full_case / timeline_only / letters_only |
| created_at | timestamptz | NOW() | |

#### `public.complaint_packs`
One-off paid packs (non-subscription revenue).

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | — | NOT NULL. FK → profiles(id) ON DELETE CASCADE |
| case_id | uuid | NULL | FK → cases(id) ON DELETE SET NULL |
| pack_type | text | — | NOT NULL. Slug: starter / escalation / full-case |
| status | text | 'purchased' | CHECK: purchased / in_progress / fulfilled / refunded / cancelled |
| stripe_payment_id | text | NULL | UNIQUE (partial) |
| checkout_session_id | text | NULL | UNIQUE (partial) — idempotency key |
| amount_paid | integer | — | NOT NULL. In pence |
| currency | text | 'gbp' | NOT NULL |
| purchased_at | timestamptz | NOW() | |
| completed_at | timestamptz | NULL | |
| entitlement_expires_at | timestamptz | NULL | 7-day window |
| entitlement_case_id | uuid | NULL | FK → cases(id) ON DELETE SET NULL — scoped access |
| notes | text | NULL | |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | Auto-updated by trigger |

#### `public.business_enquiries`
B2C → B2B lead capture.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| company_name | text | — | NOT NULL |
| contact_name | text | — | NOT NULL |
| email | text | — | NOT NULL |
| role | text | NULL | |
| message | text | NULL | |
| website | text | NULL | |
| sector | text | NULL | |
| complaint_volume_estimate | text | NULL | |
| consent_to_contact | boolean | false | |
| source_ip | text | NULL | Anti-spam |
| user_agent | text | NULL | Anti-spam |
| created_at | timestamptz | NOW() | |

#### `public.b2b_pilots`
Active B2B pilot tracking.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| company_name | text | — | NOT NULL |
| contact_name | text | — | NOT NULL |
| contact_email | text | — | NOT NULL |
| contact_role | text | NULL | |
| organisation_id | uuid | NULL | FK → organisations(id) |
| plan_type | text | 'standard' | NOT NULL |
| monthly_fee | integer | — | NOT NULL. In pence |
| currency | text | 'gbp' | NOT NULL |
| status | text | 'enquiry' | CHECK: enquiry / contacted / pilot_started / active / churned |
| stripe_customer_id | text | NULL | |
| stripe_subscription_id | text | NULL | |
| started_at | timestamptz | NULL | |
| business_enquiry_id | uuid | NULL | FK → business_enquiries(id) |
| notes | text | NULL | |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | Auto-updated by trigger |

#### `public.b2b_outreach_emails`
Tracks scorecard outreach emails sent to companies.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| organisation_id | uuid | NULL | FK → organisations(id) ON DELETE SET NULL |
| b2b_pilot_id | uuid | NULL | FK → b2b_pilots(id) ON DELETE SET NULL |
| recipient_email | text | — | NOT NULL |
| resend_email_id | text | NULL | UNIQUE (partial) |
| status | text | 'sent' | NOT NULL |
| subject | text | — | NOT NULL |
| sent_at | timestamptz | NOW() | |
| delivered_at | timestamptz | NULL | |
| opened_at | timestamptz | NULL | |
| bounced_at | timestamptz | NULL | |
| complained_at | timestamptz | NULL | |
| metadata | jsonb | NULL | |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | Auto-updated by trigger |

### Database Views (Analytics — service_role only)

| View | Description |
|------|-------------|
| `v_company_stats` | Per-organisation complaint metrics: case volume, resolution rate, promise keeping, helpfulness score, channel breakdown, financials, escalation rate |
| `v_platform_stats` | Platform-wide aggregate: total users by tier, total cases, interactions, letters, broken promises, disputes |
| `v_monthly_trends` | Monthly breakdown for charts: new cases, active users, resolved cases, ombudsman referrals, total disputed |
| `v_category_stats` | Category-level aggregation: total cases per category, avg resolution days, escalation rate |
| `v_company_rankings` | Top offenders by complaint count with promise broken %, helpfulness score, escalation rate |

All views are revoked from `anon` and `authenticated` roles. Only `service_role` can query them.

### RLS Policies

| Table | Policy | Enforces |
|-------|--------|----------|
| profiles | select/insert/update/delete | `id = auth.uid()` (own record only) |
| cases | select/insert/update/delete | `user_id = auth.uid()` |
| interactions | select/insert/update/delete | `user_id = auth.uid()` |
| evidence | select/insert/update/delete | `user_id = auth.uid()` |
| letters | select/insert/update/delete | `user_id = auth.uid()` |
| reminders | select/insert/update/delete | `user_id = auth.uid()` |
| exports | select/insert/update/delete | `user_id = auth.uid()` |
| organisations | select | `authenticated` (read-only for all users) |
| organisations | insert/update/delete | `service_role` only |
| escalation_rules | select | `authenticated` (read-only for all users) |
| escalation_rules | insert/update/delete | `service_role` only |
| complaint_packs | select | `auth.uid() = user_id` |
| complaint_packs | all operations | `service_role` |
| business_enquiries | insert | `true` (anyone can submit an enquiry) |
| b2b_pilots | all operations | `service_role` only |
| b2b_outreach_emails | all operations | `service_role` only |

**Storage bucket `evidence`:** User-scoped path policy — `(storage.foldername(name))[1] = auth.uid()::text`.

### Database Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `update_updated_at()` | BEFORE UPDATE on profiles, cases, interactions, letters, complaint_packs, b2b_pilots, b2b_outreach_emails | Automatically sets `updated_at = now()` |
| `handle_new_user()` | AFTER INSERT on `auth.users` | Creates a profile row for every new auth user |
| `update_case_count()` | AFTER INSERT or DELETE on cases | Increments/decrements `profiles.cases_count` |
| `update_interaction_count()` | AFTER INSERT or DELETE on interactions | Increments `cases.interaction_count` and updates `cases.last_interaction_date` |

---

## Section 3: Routes & Pages

### Marketing / Public Routes (`src/app/(marketing)/`)

| URL | Description | SEO (`generateMetadata`) | SSG (`generateStaticParams`) | Key Components |
|-----|-------------|--------------------------|-------------------------------|----------------|
| `/` | Landing page — hero, features, how it works, testimonials, AI section, pricing preview, B2B teaser | No (client component) | No | Landing page (client component, Framer Motion) |
| `/about` | About page | No | No | Static content |
| `/business` | For Business — B2B pitch page | No | No | `BusinessEnquiryForm` |
| `/calculator` | Compensation calculator | No | No | `CalculatorClient` (interactive) |
| `/companies` | Company scorecards index — all companies with complaint data | No | No | `CompanyScorecardIndex` |
| `/companies/[slug]` | Individual company scorecard page | No | No | Static — fetches from `v_company_stats` via API |
| `/escalation-guides` | Escalation guides index by category | No | No | Static list of 15 categories |
| `/escalation-guides/[category]` | Per-category escalation guide | No | Yes (15 categories) | Dynamic content from `escalation_rules` table |
| `/guides/[slug]` | Individual organisation guide (SEO page) | No | Yes (15 orgs from `ORG_GUIDES`) | Static content from `organisations.ts` |
| `/how-it-works` | How the product works — walkthrough | No | No | Static content |
| `/packs` | Complaint Packs sales page | No | No | `PacksCheckoutClient` |
| `/pricing` | Pricing page — Free/Basic/Pro + Packs | No | No | `PricingClient` |
| `/privacy` | Privacy policy | No | No | Static content |
| `/shared/[token]` | Publicly shareable case view | No | No | Fetches shared case by token |
| `/templates` | Complaint template library | No | No | `TemplatesGrid` |
| `/templates/[slug]` | Individual template detail page | No | Yes (10 templates from `complaintTemplates`) | Template detail with CTA |
| `/terms` | Terms of service | No | No | Static content |

### App / Dashboard Routes (`src/app/(dashboard)/`)

Auth is checked in the layout (`DashboardLayout`) which redirects to `/login` if no session.

| URL | Description | Key Components |
|-----|-------------|----------------|
| `/dashboard` | Main dashboard — stat cards, escalation alerts, response alerts, reminders, recent activity, quick actions | `DashboardQuickActions`, stat cards |
| `/cases` | Case list — all user cases with filter/sort | `CasesClient` |
| `/cases/new` | New case wizard — multi-step form | `CaseWizard`, `OrganisationStepForm` |
| `/cases/[id]` | Case detail — timeline, interactions, letters, actions | `CaseActions`, `AISuggestion`, `CaseTimeline`, `EscalationGuide`, `ForwardReplyPanel`, `ShareCaseButton` |
| `/cases/[id]/interactions/new` | Log new interaction form | `InteractionForm` |
| `/cases/[id]/letters` | Letters list for a case | — |
| `/cases/[id]/letters/new` | Letter wizard — choose type + AI draft | `LetterWizard` |
| `/cases/[id]/letters/[letterId]` | Letter detail — view/edit/send | `LetterActions`, `SendLetterButton` |
| `/cases/[id]/timeline` | Timeline print view | `CaseTimeline`, `PrintButton` |
| `/cases/[id]/export` | PDF export options page | `ExportClient` |
| `/dashboard/packs` | User's purchased packs | — |
| `/letters` | All letters across all cases | — |
| `/packs/success` | Pack purchase success page | — |
| `/reminders` | All reminders list | `RemindersClient` |
| `/settings` | Settings index (redirects to profile) | — |
| `/settings/profile` | Profile settings | `ProfileForm` |
| `/settings/account` | Account settings — data export, account deletion | `AccountClient` |
| `/settings/billing` | Subscription billing, upgrade, cancel | `BillingClient` |
| `/settings/notifications` | Notification preferences | `NotificationsForm` |

### Admin Routes (`src/app/(admin)/`)

Admin access enforced by `requireAdmin()` in `AdminLayout` — checks `profiles.is_admin = true` using service role client. Redirects to `/dashboard` if not admin.

| URL | Description |
|-----|-------------|
| `/admin` | Overview dashboard — platform stats from `v_platform_stats`, monthly trends, category stats, recent signups |
| `/admin/companies` | Companies table with complaint scorecards — `CompaniesTable`, `TopCompaniesTable` |
| `/admin/companies/[id]` | Individual company detail and scorecard email trigger |
| `/admin/categories` | Category stats breakdown |
| `/admin/users` | User management table — `UsersTable` |
| `/admin/b2b` | B2B pipeline — business enquiries, pilot management — `B2BPilotsTable` |

### Auth Routes (`src/app/(auth)/`)

| URL | Description |
|-----|-------------|
| `/login` | Login page with email/password and Google OAuth |
| `/register` | Registration page |
| `/forgot-password` | Password reset request |
| `/callback` | OAuth callback handler (Supabase `exchangeCodeForSession`) |

### API Routes (`src/app/api/`)

#### AI

| Route | Methods | Auth | Rate Limit | Description |
|-------|---------|------|------------|-------------|
| `/api/ai/suggest` | POST | Required (user) | 10/min, 100/hr | Case analysis — calls Claude Sonnet. Checks tier (free blocked). Increments `ai_suggestions_used`. |
| `/api/ai/draft-letter` | POST | Required (user) | 10/min, 100/hr | Letter drafting — calls Claude Sonnet. Checks tier + `ai_letters_used` limit. Saves letter to DB. |
| `/api/ai/summarise` | POST | Required (user) | — | Interaction summary — calls Claude Haiku. |

#### Stripe

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/stripe/checkout` | POST | Required (user) | Creates Stripe Checkout session (subscription mode). Validates price ID against allowlist. |
| `/api/stripe/portal` | POST | Required (user) | Creates Stripe Customer Portal session. |
| `/api/webhooks/stripe` | POST | Stripe signature | Handles: `checkout.session.completed` (subscription + packs), `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`, `charge.refunded`. |

#### Packs

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/packs/checkout` | POST | Required (user) | Creates Stripe Checkout session (payment mode) for one-off complaint packs. Embeds `userId`, `packId`, `caseId` in metadata. |

#### Cases

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/cases/[id]/share` | POST/DELETE | Required (user) | Creates/removes shareable case token |
| `/api/cases/[id]/inbound-alias` | POST/DELETE | Required (user, Pro) | Creates/removes unique inbound email alias |
| `/api/cases/[id]/response-received` | POST | Required (user) | Marks case as response received |

#### Letters

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/letters/[id]` | GET/PATCH/DELETE | Required (user) | Letter CRUD |
| `/api/letters/[id]/send` | POST | Required (user, Basic/Pro) | Sends letter via Resend email. Sets `delivery_status = sent`, tracks `resend_email_id`. |

#### Export

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/export/pdf` | POST | Required (user, Basic/Pro) | Generates full case PDF via `@react-pdf/renderer` |
| `/api/export/letter-pdf` | POST | Required (user, Basic/Pro) | Generates letter PDF |
| `/api/export/data` | GET | Required (user) | Exports all user data as JSON |

#### Account

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/account/delete` | DELETE | Required (user) | Deletes user account and all data |
| `/api/account/export` | GET | Required (user) | Exports all user data (GDPR) |

#### Reminders

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/reminders/cron` | GET | `Bearer CRON_SECRET` | Daily cron (08:00 UTC). Sends reminder digests, creates escalation alerts, checks expired promises, reverts expired pack access, sends B2B SLA alerts. |

#### Companies (public)

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/companies/[slug]/stats` | GET | None | Returns public company scorecard stats |

#### Business Enquiries

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/business-enquiries` | POST | None | Submits a B2B enquiry (anyone can submit) |

#### Admin (API)

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/admin/stats` | GET | Required (admin) | Returns platform stats from analytics views |
| `/api/admin/companies` | GET | Required (admin) | Lists companies with scorecards |
| `/api/admin/companies/[id]` | GET/PATCH | Required (admin) | Get/update company |
| `/api/admin/b2b` | GET/POST/PATCH | Required (admin) | B2B pipeline management |
| `/api/admin/export` | GET | Required (admin) | Full platform data export |
| `/api/admin/send-scorecard` | POST | Required (admin) | Sends scorecard outreach email to a company |

#### Webhooks

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/webhooks/stripe` | POST | Stripe signature | (documented above) |
| `/api/webhooks/resend` | POST | Resend signature | Updates letter delivery status (delivered/opened/bounced) from Resend email events |
| `/api/webhooks/inbound-email` | POST | — | Parses inbound emails forwarded to case aliases (Pro feature) |

#### Misc

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/seed` | POST | `Bearer SEED_SECRET` | One-time seed for organisations and escalation rules |

---

## Section 4: Components Inventory

### `src/components/admin/`

| Component | Description | Used In |
|-----------|-------------|---------|
| `B2BPilotsTable.tsx` | Table showing B2B pilot records with status management | `/admin/b2b` |
| `CompaniesTable.tsx` | Company list with complaint scores and scorecard email action | `/admin/companies` |
| `TopCompaniesTable.tsx` | Ranked companies by complaint volume | `/admin` |
| `UsersTable.tsx` | User management with tier, case/interaction/letter counts | `/admin/users` |

### `src/components/cases/`

| Component | Description | Used In |
|-----------|-------------|---------|
| `AISuggestion.tsx` | AI case analysis card — triggers `/api/ai/suggest`, displays strength rating, next steps, evidence gaps | `/cases/[id]` |
| `CaseTimeline.tsx` | Visual timeline of all interactions and letters | `/cases/[id]`, `/cases/[id]/timeline` |
| `EmailForward.tsx` | UI to create/manage inbound email alias (Pro) | `/cases/[id]` |
| `EscalationGuide.tsx` | Renders escalation rules for the case category | `/cases/[id]` |
| `EvidenceGallery.tsx` | Displays uploaded evidence files as thumbnails | `/cases/[id]` |
| `EvidenceUpload.tsx` | File upload component for evidence | `/cases/[id]/interactions/new`, `/cases/[id]` |
| `ForwardReplyPanel.tsx` | Panel for inbound reply email management | `/cases/[id]` |
| `InteractionForm.tsx` | Form to log a new interaction (all fields) | `/cases/[id]/interactions/new` |
| `InteractionModal.tsx` | Modal wrapper for interaction form | Various |
| `OrganisationSearch.tsx` | Autocomplete search for organisations | `/cases/new` |
| `QuickLogButton.tsx` | Quick action to log an interaction | `/cases/[id]` |
| `ResponseTimer.tsx` | Countdown timer for 14-day company response deadline | `/cases/[id]` |
| `ShareCaseButton.tsx` | Creates/removes shareable case link | `/cases/[id]` |
| `VoiceMemoRecorder.tsx` | Voice memo recording (Pro only) | `/cases/[id]/interactions/new` |
| `index.ts` | Re-exports |  |

### `src/components/dashboard/`

| Component | Description | Used In |
|-----------|-------------|---------|
| `DashboardQuickActions.tsx` | Quick action buttons (log interaction, upload evidence) | `/dashboard` |
| `index.ts` | Re-exports |  |

### `src/components/layout/`

| Component | Description | Used In |
|-----------|-------------|---------|
| `AdminViewToggle.tsx` | Toggle to switch between user/admin view (for admin users) | `Sidebar` |
| `AppShell.tsx` | Main app shell — wraps `Sidebar`, `Header`, `BottomTabBar` | `(dashboard)/layout.tsx` |
| `AuthShell.tsx` | Auth page wrapper | `(auth)/layout.tsx` |
| `BottomTabBar.tsx` | Mobile bottom navigation bar | `AppShell` |
| `Header.tsx` | Top header bar with page title and subscription badge | `AppShell` |
| `MobileNav.tsx` | Mobile navigation drawer | `Header` |
| `PagePlaceholder.tsx` | Coming-soon placeholder component | Various placeholder pages |
| `Providers.tsx` | Root providers: TanStack Query, PostHog, Sonner toaster | `src/app/layout.tsx` |
| `ReminderBell.tsx` | Bell icon with unread reminder count | `Header` |
| `Sidebar.tsx` | Desktop sidebar navigation | `AppShell` |
| `SubscriptionBadge.tsx` | Badge showing current tier (Free/Basic/Pro) | `Header` |
| `UserMenu.tsx` | User dropdown menu with settings/logout | `Header` |

### `src/components/letters/`

| Component | Description | Used In |
|-----------|-------------|---------|
| `SendLetterButton.tsx` | Button to send letter via Resend email | `/cases/[id]/letters/[letterId]` |
| `index.ts` | Re-exports |  |

### `src/components/marketing/`

| Component | Description | Used In |
|-----------|-------------|---------|
| `BusinessEnquiryForm.tsx` | B2B enquiry form (submits to `/api/business-enquiries`) | `/business` |
| `CompanyScorecardIndex.tsx` | Grid of company scorecards for public companies page | `/companies` |
| `PacksCheckoutClient.tsx` | Pack purchase UI with checkout session creation | `/packs` |
| `TemplatesGrid.tsx` | Grid of complaint templates | `/templates` |
| `index.ts` | Re-exports |  |

### `src/components/ui/` (shadcn/ui primitives)

`alert`, `avatar`, `badge`, `button`, `calendar`, `card`, `command`, `dialog`, `dropdown-menu`, `form`, `input-group`, `input`, `label`, `popover`, `progress`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `table`, `tabs`, `textarea`, `tooltip`, `UpgradePrompt`

`UpgradePrompt.tsx` is a custom component (not standard shadcn) that renders a paywall prompt for locked features.

### `src/components/`

| Component | Description | Used In |
|-----------|-------------|---------|
| `CookieConsent.tsx` | Cookie consent banner (controls PostHog initialisation) | `src/app/layout.tsx` |
| `PostHogProvider.tsx` | PostHog client initialisation wrapper | `Providers.tsx` |

### Dead Code / Unused Components

- **`PagePlaceholder.tsx`** — exists and is used by placeholder pages but flagged as a pattern for unbuilt routes (no routes currently use it as their primary render, it's a utility).
- No components found that are imported but never rendered.

---

## Section 5: Authentication & Authorisation

### Auth Provider

**Supabase Auth** — supports email/password and Google OAuth.

### Session Management

- **Middleware (`src/middleware.ts`):** Calls `updateSession()` from `@/lib/supabase/middleware` on every request (excluding static assets). Maintains the Supabase session cookie. Redirects unauthenticated users to `/login?next=<path>` for protected routes. Redirects authenticated users away from `/login` and `/register` to `/dashboard`.
- **Protected routes:** `/admin`, `/dashboard`, `/cases`, `/settings`, `/reminders`, `/letters`
- **Server Components:** Use `createClient()` from `@/lib/supabase/server` — reads the session cookie.
- **Client Components:** Use `createClient()` from `@/lib/supabase/client` — browser-side Supabase client.
- **Dashboard Layout:** Double-checks auth via `supabase.auth.getUser()` and redirects to `/login` if no session (belt-and-braces beyond middleware).

### User Roles & Tiers

| Tier | Storage | How Set |
|------|---------|---------|
| `free` / `basic` / `pro` | `profiles.subscription_tier` | Stripe webhook on checkout/subscription events |
| `is_admin` flag | `profiles.is_admin` (boolean) | Manually set via migration SQL (`UPDATE profiles SET is_admin = true WHERE email = '...'`) |

### Admin Access

`requireAdmin()` (`src/lib/auth/admin.ts`) — checks `profiles.is_admin` via service role client. Used in:
- `(admin)/layout.tsx` — wraps all admin pages
- `requireAdminApi()` (`src/lib/auth/admin-api.ts`) — used in admin API routes

### Subscription Tier Checks

Feature gates defined in `src/lib/stripe/feature-gates.ts`:

| Feature | Free | Basic | Pro |
|---------|------|-------|-----|
| Cases | Max 1 | Unlimited | Unlimited |
| PDF export (timeline/letters only) | ❌ | ✅ | ✅ |
| PDF export (full case) | ❌ | ❌ | ✅ |
| AI suggestions | 0/mo | 10/mo | 50/mo |
| AI letters | 0/mo | 5/mo | 30/mo |
| AI summaries | 0/mo | 100/mo | 500/mo |
| Voice memos | ❌ | ❌ | ✅ |
| Email forwarding | ❌ | ❌ | ✅ |
| Email reminders | ❌ | ✅ | ✅ |

**Pack access:** Purchasing a pack temporarily elevates `subscription_tier` to `pro` with `subscription_status = pack_temporary` for 7 days, scoped to a specific case. `enforcePackScopedCaseAccess()` enforces this in AI and PDF API routes.

### Free User Limit Enforcement

When a free user has `cases_count >= 1`, the `canCreateCase()` function returns `false`. The `CaseWizard` and `/cases/new` page render an `UpgradePrompt` instead of the creation form.

---

## Section 6: Stripe Integration

### Mode

**Test mode** — `.env.local.example` explicitly shows `sk_test_...` and `pk_test_...` prefixes. No live key references in code.

### Products & Prices

Configured via environment variables (created by running `npx tsx src/lib/stripe/setup.ts`):

| Plan | Price | Env Var |
|------|-------|---------|
| Basic Monthly | £4.99/mo | `STRIPE_PRICE_ID_BASIC_MONTHLY` |
| Basic Annual | £39.99/yr (~£3.33/mo) | `STRIPE_PRICE_ID_BASIC_ANNUAL` |
| Pro Monthly | £9.99/mo | `STRIPE_PRICE_ID_PRO_MONTHLY` |
| Pro Annual | £79.99/yr (~£6.67/mo) | `STRIPE_PRICE_ID_PRO_ANNUAL` |

One-off complaint packs (no Stripe product IDs in code — price set dynamically):
- Starter Pack: £29
- Escalation Pack: £49
- Full Case Pack: £79

### Checkout Flow

1. User clicks upgrade on `/pricing` or `/settings/billing`
2. `BillingClient` calls `POST /api/stripe/checkout` with a `priceId`
3. Server validates price ID against allowlist, creates/retrieves Stripe customer, creates Checkout session in `subscription` mode
4. User is redirected to Stripe-hosted checkout
5. On success, redirected to `/settings/billing?session_id=...`
6. Stripe fires `checkout.session.completed` webhook → profile updated

**Pack checkout flow:**
1. User clicks buy on `/packs` or `/dashboard/packs`
2. `PacksCheckoutClient` calls `POST /api/packs/checkout` with `packId`, optional `caseId`
3. Creates Checkout session in `payment` mode with `userId`, `packId`, `caseId` in metadata
4. On success, `charge.refunded` / `checkout.session.completed` webhook records the purchase

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` (subscription) | Updates profile `subscription_tier`, `subscription_id`, `stripe_customer_id`, resets AI credits |
| `checkout.session.completed` (payment/pack) | Inserts into `complaint_packs`, temporarily elevates free users to Pro for 7 days |
| `customer.subscription.updated` | Updates tier and status from active subscription items |
| `customer.subscription.deleted` | Resets profile to free tier, clears pack access |
| `invoice.payment_failed` | Sets `subscription_status = past_due` |
| `invoice.paid` | Sets `subscription_status = active`, resets AI credits monthly |
| `charge.refunded` | Marks pack as refunded, reverts pack-based Pro access |

### Customer Portal

`POST /api/stripe/portal` creates a Stripe Customer Portal session. Linked from `/settings/billing`.

---

## Section 7: AI Integration

### Provider & Models

**Anthropic Claude** via `@anthropic-ai/sdk`.

| Use Case | Model |
|----------|-------|
| Letter drafting | `claude-sonnet-4-5-20250514` |
| Case analysis / suggestions | `claude-sonnet-4-5-20250514` |
| Interaction summarisation | `claude-haiku-4-5-20251001` |
| Entity extraction | `claude-haiku-4-5-20251001` |
| Classification | `claude-haiku-4-5-20251001` |

### AI Endpoints

| Endpoint | Model | What It Does |
|----------|-------|-------------|
| `POST /api/ai/suggest` | claude-sonnet | Analyses a case and returns structured JSON: assessment, next step, deadlines, evidence needed, strength rating, letter recommendation |
| `POST /api/ai/draft-letter` | claude-sonnet | Drafts a full letter using case data + template context + optional journey-specific prompt. Saves to `letters` table. |
| `POST /api/ai/summarise` | claude-haiku | Summarises an interaction note into one sentence |

### Credit / Limit Enforcement

Monthly limits per tier:

| Tier | Suggestions | Letters | Summaries |
|------|-------------|---------|-----------|
| Free | 0 | 0 | 0 |
| Basic | 10 | 5 | 100 |
| Pro | 50 | 30 | 500 |

Tracked via `profiles.ai_suggestions_used` and `profiles.ai_letters_used`. Reset monthly by the cron job when `ai_credits_reset_at < now - 30 days`.

### Rate Limiting

In-memory rate limiter (`src/lib/rate-limit.ts`) applied on all AI endpoints:
- 10 requests per minute per user
- 100 requests per hour per user

**Note:** In-memory rate limiter does not survive server restarts or work across multiple instances. Should be replaced with Upstash Redis for production scale.

### Letter Prompt System

`buildLetterPrompt()` in `src/lib/ai/prompts.ts` constructs the user prompt with:
- Letter type and template metadata (name, legal references, suggested tone)
- Sender address from profile
- Organisation details (name, complaint email)
- Case details (title, description, reference, desired outcome, amount)
- Up to 8 most recent interactions with promise tracking
- Optional `additionalInstructions` (user-provided or journey-specific)

### Journey Prompt Contexts

`src/lib/ai/journey-prompts.ts` — `JOURNEY_LETTER_PROMPTS` map:

| Key | Journey Step |
|-----|-------------|
| `energy_billing_initial` | Energy billing — initial complaint |
| `energy_billing_followup` | Energy billing — follow-up |
| `energy_billing_ombudsman` | Energy billing — ombudsman referral |
| `broadband_speed_initial` | Broadband speed — initial complaint |
| `broadband_speed_followup` | Broadband speed — follow-up |
| `broadband_speed_adr` | Broadband speed — ADR referral |
| `flight_delay_initial` | Flight delay — initial compensation claim |
| `flight_delay_followup` | Flight delay — follow-up / challenge refusal |
| `flight_delay_adr` | Flight delay — ADR submission |
| `bank_charges_initial` | Bank charges — initial complaint |
| `bank_charges_followup` | Bank charges — follow-up |
| `bank_charges_fos` | Bank charges — FOS referral |
| `faulty_product_reject` | Faulty product — short-term right to reject (CRA s.22) |
| `faulty_product_repair` | Faulty product — repair/replacement request (CRA s.23-24) |
| `faulty_product_followup_reject` | Faulty product — follow-up rejection dispute |
| `faulty_product_followup_repair` | Faulty product — follow-up failed repair |
| `faulty_product_section75` | Faulty product — Section 75 credit card claim |
| `faulty_product_fos_s75` | Faulty product — FOS Section 75 referral |
| `faulty_product_lba` | Faulty product — Letter Before Action |

### Case Analysis Prompt

`buildCaseAnalysisPrompt()` sends case context (org, category, status, days open, all interactions, escalation rules) and expects a strict JSON response with: `assessment`, `nextStep`, `deadlines`, `evidenceNeeded`, `strengthRating`, `strengthExplanation`, `letterRecommended`, `letterType`.

---

## Section 8: Email / Notifications

### Email Provider

**Resend** (`resend` ^6.9.3). From address: `noreply@theypromised.app` (configured in `src/lib/email/client.ts`).

### Email Templates

All templates built with `@react-email/components` (TSX components):

| Template | File | When Sent |
|----------|------|-----------|
| Welcome email | `WelcomeEmail.tsx` | On new user sign-up (triggered from auth flow) |
| Reminder digest | `ReminderDigestEmail.tsx` | Daily cron — when user has due/overdue reminders (Basic/Pro only) |
| Escalation alert | `EscalationAlertEmail.tsx` | Cron — when case reaches 6/7/8 week escalation window (Basic/Pro only) |
| Promise broken | `PromiseBrokenEmail.tsx` | Cron — when a promise deadline passes without fulfilment (Basic/Pro only) |
| Subscription confirmation | `SubscriptionConfirmEmail.tsx` | Stripe `checkout.session.completed` webhook for subscriptions |

### Letter Sending

Letters can be sent directly via email through Resend (`POST /api/letters/[id]/send`). This sends the letter body as an HTML email to the organisation's complaint email address. Tracks delivery via `resend_email_id` and the Resend webhook (`/api/webhooks/resend`).

### Reminder System

**Cron-based** — scheduled via Vercel cron (`vercel.json`):
- **Schedule:** `0 8 * * *` — daily at 08:00 UTC
- **Endpoint:** `GET /api/reminders/cron` (authenticated via `Bearer CRON_SECRET`)

The cron:
1. Resets expired AI credits monthly
2. Reverts expired pack-based Pro access (after 7 days)
3. Sends daily reminder digest emails to non-free users with due/overdue reminders
4. Creates escalation window alerts at 6, 7, and 8 weeks from `first_contact_date`
5. Creates reminders for expired escalation deadlines
6. Creates reminder + sends email for overdue promises
7. Sends B2B SLA alert emails to admin for stale enquiries/pilots

### Notification Preferences

`profiles.notification_preferences` (JSONB column — added gracefully by cron). Cron respects `email_reminders: false` to suppress digest emails.

---

## Section 9: Features Inventory

| Feature | Status | Notes |
|---------|--------|-------|
| Case creation | **Working** | Multi-step wizard (`CaseWizard`) with org search, template selection, all fields |
| Case templates | **Working** | 10 templates in `complaint-templates.ts` with pre-filled fields and tips |
| Interaction logging | **Working** | Full form with all channels, promise tracking, mood, evidence attach |
| Promise tracking | **Working** | Logged per-interaction; overdue promises highlighted; cron detects broken promises |
| Timeline view | **Working** | Visual chronological timeline; printable version at `/cases/[id]/timeline` |
| AI letter generation | **Working** | 11 letter types; Claude Sonnet; journey-specific prompt contexts; Basic/Pro only |
| AI case analysis | **Working** | Case strength, next steps, evidence gaps, deadlines; Claude Sonnet; Basic/Pro only |
| AI suggestions | **Working** | Delivered via the case analysis endpoint; per-tier credit limits enforced |
| PDF export | **Working** | Full case PDF (`@react-pdf/renderer`); tier-gated (timeline/letters on Basic, full on Pro) |
| Evidence upload | **Working** | Supabase Storage `evidence` bucket; 10MB limit; user-scoped paths |
| Escalation guides | **Working** | 15 categories with static content + dynamic `escalation_rules` from DB |
| Escalation engine (rules) | **Working** | Seeded rules in `escalation_rules` table; AI uses them for guidance |
| Company scorecards | **Working** | Public pages at `/companies/[slug]`; data from `v_company_stats` view |
| Guided journeys | **Partial** | Journey prompt contexts exist for 5 complaint types (energy, broadband, flight, bank, faulty product); no dedicated journey UI wizard yet |
| Journey templates | **Partial** | 19 journey letter prompt contexts in `journey-prompts.ts`; no dedicated journey UI |
| Outcome tracking | **Working** | `cases.status`, `compensation_received`, `resolved_date`, `resolution_summary` all tracked |
| Reminders / nudges | **Working** | Full reminder system with daily cron, in-app list at `/reminders`, email digests |
| Shareable case links | **Working** | `POST /api/cases/[id]/share` creates a token; public view at `/shared/[token]` |
| Complaint packs | **Working** | 3 packs (Starter £29, Escalation £49, Full Case £79); Stripe one-off payment; 7-day Pro access |
| Compensation calculator | **Working** | Interactive calculator at `/calculator` |
| Organisation-specific guides (SEO pages) | **Working** | 15 org guides at `/guides/[slug]` (British Gas, EDF, OVO, BT, Sky, Virgin Media, HSBC, Barclays, Lloyds, HMRC, DWP, NHS, Amazon, Currys, TalkTalk) |
| Dashboard stat cards | **Working** | Active cases, open promises, overdue actions, cases resolved with compensation total |
| Quick actions | **Working** | `DashboardQuickActions` component; "Start New Case", "Log Interaction", "Generate Letter", "Export Case File" |
| Bottom tab bar (mobile) | **Working** | `BottomTabBar` with Dashboard, Cases, New, Reminders, Settings |
| PWA manifest | **Working** | `public/manifest.json` with icons, shortcuts, standalone display |
| Admin panel | **Working** | Full admin panel at `/admin` with overview, companies, users, B2B pipeline |
| Admin view toggle | **Working** | `AdminViewToggle` in sidebar for admins to navigate to admin section |
| B2B lead capture | **Working** | `BusinessEnquiryForm` on `/business`; stored in `business_enquiries` table |
| B2B pipeline management | **Working** | `B2BPilotsTable` at `/admin/b2b`; enquiry → contacted → pilot_started → active → churned |
| For Business marketing page | **Working** | `/business` page with pitch and enquiry form |
| Pricing page | **Working** | `/pricing` with monthly/annual toggle; upgrade CTAs |
| User onboarding (empty state) | **Working** | Dashboard shows "Ready to hold them to account?" card when user has no cases |
| Stripe checkout | **Working** | Subscription checkout via `/api/stripe/checkout`; pack checkout via `/api/packs/checkout` |
| Stripe billing portal | **Working** | `/api/stripe/portal`; linked from `/settings/billing` |
| Stripe webhooks | **Working** | 6 event types handled in `/api/webhooks/stripe` |

---

## Section 10: Configuration & Environment

### All Environment Variables (Names Only)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_ID_BASIC_MONTHLY
STRIPE_PRICE_ID_BASIC_ANNUAL
STRIPE_PRICE_ID_PRO_MONTHLY
STRIPE_PRICE_ID_PRO_ANNUAL

# AI
ANTHROPIC_API_KEY

# Email
RESEND_API_KEY
RESEND_ADMIN_FROM        (optional)

# App
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_NAME     (optional, defaults to "TheyPromised")

# Security
CRON_SECRET
SEED_SECRET              (optional, dev only)

# Analytics
NEXT_PUBLIC_POSTHOG_KEY  (optional)
NEXT_PUBLIC_POSTHOG_HOST (optional, defaults to https://eu.posthog.com)

# Error monitoring
NEXT_PUBLIC_SENTRY_DSN   (optional)
SENTRY_AUTH_TOKEN        (optional, for source maps)

# B2B alerts
B2B_ALERT_EMAIL          (optional)
```

### External Services

| Service | Purpose | Config |
|---------|---------|--------|
| Supabase | Auth, database, storage, realtime | `NEXT_PUBLIC_SUPABASE_URL` + keys |
| Stripe | Payments, subscriptions | `STRIPE_SECRET_KEY` + price IDs |
| Anthropic Claude | AI letter drafting, case analysis | `ANTHROPIC_API_KEY` |
| Resend | Transactional + letter emails | `RESEND_API_KEY` |
| PostHog | Product analytics (optional) | `NEXT_PUBLIC_POSTHOG_KEY` |
| Sentry | Error monitoring (optional) | `NEXT_PUBLIC_SENTRY_DSN` |
| Vercel Analytics | Web analytics | Auto (via `@vercel/analytics`) |
| Vercel Speed Insights | Core Web Vitals | Auto (via `@vercel/speed-insights`) |

### PostHog Integration

PostHog is **integrated** and **optional**. Initialised only after user accepts cookie consent (`tp_consent=accepted` cookie). Uses `person_profiles: "identified_only"` (GDPR-friendly).

**Tracked events:**

| Event | Properties |
|-------|------------|
| `sign_up` | `method: email|google` |
| `case_created` | `category, priority` |
| `interaction_logged` | `channel, has_promise` |
| `letter_generated` | `letter_type` |
| `pdf_exported` | `export_type` |
| `subscription_started` | `tier, period` |
| `ai_analysis_requested` | `tier` |
| `subscription_upgraded` | `tier, subscription_id` (server-side via posthog-node) |
| `ai_suggestion_requested` | `caseId` (server-side) |
| `subscription_cancelled` | `subscription_id` (server-side) |

PostHog is initialised EU region by default (`https://eu.posthog.com`) for GDPR compliance.

### Sentry Integration

Sentry is **integrated** and **optional** (`NEXT_PUBLIC_SENTRY_DSN` must be set). Configured via:
- `sentry.client.config.ts` — client-side
- `sentry.server.config.ts` — server-side
- `sentry.edge.config.ts` — edge runtime
- `instrumentation-client.ts` — Next.js 15 instrumentation hook
- `instrumentation.ts` — server instrumentation
- `src/app/global-error.tsx` — global error boundary with Sentry capture

Wrapped in `next.config.ts` via `withSentryConfig()`. Source maps disabled if `SENTRY_AUTH_TOKEN` is not set.

---

## Section 11: Known Issues & Dead Code

### TypeScript

**`npx tsc --noEmit` — PASSED with zero errors.** ✅

### ESLint

**`npx next lint` — PASSED with zero warnings or errors.** ✅

### TODO/FIXME/HACK Comments

**None found** in any `.ts` or `.tsx` source files.

### Identified Issues & Notes

1. **In-memory rate limiter** (`src/lib/rate-limit.ts`) — does not persist across server restarts or scale horizontally. The file itself notes this: `// Simple in-memory rate limiter (replace with Upstash Redis if available)`. For production deployments with multiple instances (Vercel serverless), this provides no real protection.

2. **Sentry client config deprecation** — Build warning: `[@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your sentry.client.config.ts file, or moving its content to instrumentation-client.ts`. `instrumentation-client.ts` exists but `sentry.client.config.ts` was not renamed. Non-breaking for now.

3. **`letter_type` constraint mismatch** — The initial schema migration defines `letter_type` CHECK constraint as `initial_complaint | follow_up | escalation | final_response_request | ombudsman_referral | subject_access_request | formal_notice | custom`. However `src/lib/ai/letter-templates.ts` defines additional types: `adr_referral`, `section_75_claim`, `letter_before_action`. These additional types are not in the DB constraint, meaning inserting a letter with those types would fail at the DB level. The `draft-letter` API casts unrecognised types to `"custom"` as a fallback, which mitigates (but does not fix) this.

4. **`dashboard/packs/page.tsx` and `packs/success/page.tsx`** — These routes exist in the file system but render minimal content (placeholder/success messages). The pack dashboard feature is partially built.

5. **`admin/categories/page.tsx` and `admin/companies/[id]/page.tsx`** — From the build output, these render a 207B page (effectively just a layout wrapper with no content beyond the base layout). Likely placeholder/stub pages.

6. **`notification_preferences` column** — The cron job reads `profiles.notification_preferences` but no migration adds this column. The cron handles the missing column gracefully (defaults to sending), but the column does not exist in the schema yet. The `settings/notifications` page saves preferences, but without the DB column it will fail silently.

7. **Webpack large string serialisation warnings** — Build produced three `[webpack.cache.PackFileCacheStrategy] Serializing big strings (139-189kiB)` warnings. Cosmetic performance warnings, not errors. Related to large prompt strings and type definition files.

8. **`/cases/[id]` page is large** — 394 kB First Load JS. This is the most JS-heavy page in the app.

9. **Dead API routes / orphaned routes:** No API routes appear completely unreferenced. All routes have clear callers either in the frontend or are called by external systems (crons, webhooks).

10. **`src/test/unit/` directory** — Contains duplicate test files that are symlinked or near-duplicates of tests in `src/lib/ai/` and `src/lib/validation/`. Both locations contain the same tests (`escalation-rules.test.ts`, `validation.test.ts`). This is redundant but not broken.

---

## Section 12: Deployment & Infrastructure

### Hosting Platform

**Vercel** — configured via `vercel.json`.

### Next.js Configuration (`next.config.ts`)

Minimal Next.js config (no custom redirects, rewrites, or headers at the framework level). Wrapped with `withSentryConfig()` for Sentry integration:
- `org: "synqforge"`, `project: "thepromised"`
- `widenClientFileUpload: true`
- Source maps disabled when `SENTRY_AUTH_TOKEN` is not set

### Vercel Configuration (`vercel.json`)

**Cron jobs:**
```json
{ "path": "/api/reminders/cron", "schedule": "0 8 * * *" }
```
Runs daily at 08:00 UTC.

**Security headers (all routes):**

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(self), geolocation=()` |

### Sitemap (`src/app/sitemap.ts`)

Dynamically generated sitemap includes:
- 14 static routes (homepage, pricing, how-it-works, etc.)
- 15 escalation guide category routes
- 15 org guide routes (from `ORG_GUIDES`)
- Dynamic company scorecard routes (from Supabase `v_company_stats` — limited to top 5)
- 10 template routes

### Robots.txt (`src/app/robots.ts`)

- **Allowed:** `/`, `/pricing`, `/how-it-works`, `/escalation-guides`, `/about`, `/privacy`, `/terms`, `/register`, `/login`
- **Disallowed:** `/dashboard`, `/cases`, `/settings`, `/api`, `/reminders`, `/letters`, `/callback`
- Sitemap linked at `${baseUrl}/sitemap.xml`

### PWA (`public/manifest.json`)

- `display: standalone`, `orientation: portrait`
- `theme_color: #1e3a5f`
- Icons: 192×192, 512×512 PNG + SVG
- Shortcuts: "New Case" → `/cases/new`, "My Cases" → `/cases`
- Language: `en-GB`

### Company

SynqForge LTD, Company number 16808271 (displayed in landing page trust bar).

---

## Build Output

```
> thepromised@0.1.0 build
> next build

   ▲ Next.js 15.5.12

 ✓ Compiled successfully in 31.1s
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (101/101)

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
├ ƒ /api/...                                          226 B         180 kB
├ ○ /business                                       1.31 kB         181 kB
├ ○ /calculator                                      1.7 kB         183 kB
├ ƒ /cases                                          5.46 kB         255 kB
├ ƒ /cases/[id]                                       17 kB         394 kB  ← Largest page
├ ƒ /dashboard                                       2.4 kB         375 kB
├ ● /escalation-guides/[category]                     207 B         182 kB  (15 paths)
├ ● /guides/[slug]                                    207 B         182 kB  (15 paths)
├ ○ /pricing                                        6.39 kB         208 kB
├ ƒ /reminders                                      6.47 kB         328 kB
├ ○ /templates                                      2.61 kB         184 kB
├ ● /templates/[slug]                                 207 B         182 kB  (10 paths)
└ ...
+ First Load JS shared by all                        180 kB
ƒ Middleware                                        89.9 kB

BUILD STATUS: ✅ SUCCESS — 101 pages generated, 0 errors
TypeScript: ✅ PASSED — 0 type errors
ESLint: ✅ PASSED — 0 warnings or errors

WARNINGS:
- [@sentry/nextjs] DEPRECATION: sentry.client.config.ts should be renamed to
  instrumentation-client.ts for Turbopack compatibility.
- [webpack] Serializing big strings (139-189kiB) — cosmetic performance warning
  related to large prompt constants and type definitions.
```
