# Free Tier & Credit System Audit

Generated: 16 March 2026

---

## 1. Stripe Configuration

### Price IDs

All price IDs are loaded from environment variables. No hardcoded price IDs exist in the codebase.

| Variable | File | Line |
|---|---|---|
| `STRIPE_PRICE_ID_BASIC_MONTHLY` | `.env.local.example:12` | Placeholder `price_...` |
| `STRIPE_PRICE_ID_BASIC_ANNUAL` | `.env.local.example:13` | Placeholder `price_...` |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | `.env.local.example:14` | Placeholder `price_...` |
| `STRIPE_PRICE_ID_PRO_ANNUAL` | `.env.local.example:15` | Placeholder `price_...` |

These are consumed in:
- `src/lib/stripe/config.ts:1-10` — `STRIPE_PRICE_IDS` object
- `src/app/api/stripe/checkout/route.ts:12-19` — `ALLOWED_PRICE_IDS` set
- `src/lib/stripe/webhooks.ts:5-13` — `BASIC_PRICE_SET` and `PRO_PRICE_SET` for tier resolution

Complaint pack prices are **not** Stripe price IDs. They are defined inline in `src/lib/packs/config.ts:13-68` and used with `price_data` in the checkout session (no pre-created Stripe prices required).

### Mode (Test/Live)

- `.env.local.example:7` shows `STRIPE_SECRET_KEY=sk_test_...` — confirmed **test mode** keys
- `.env.local.example:9` shows `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` — **test mode**
- Webhook secret placeholder: `STRIPE_WEBHOOK_SECRET=whsec_...`
- No live-mode keys are referenced anywhere in the codebase

### Subscription Checkout Flow

Step-by-step trace:

1. **Pricing page CTA** → User clicks "Upgrade to Basic/Pro" → navigates to `/pricing`
2. **Client-side POST** → `POST /api/stripe/checkout` (`src/app/api/stripe/checkout/route.ts`)
   - Validates `priceId` against `ALLOWED_PRICE_IDS` (line 35)
   - Calls `getOrCreateStripeCustomer()` to upsert Stripe customer (line 42)
   - Creates Stripe Checkout Session with `mode: "subscription"` (line 52)
   - Sets `metadata.supabase_user_id` for webhook correlation (line 58)
   - `success_url` → `/settings/billing?session_id={CHECKOUT_SESSION_ID}` (line 53)
   - Returns `{ url: session.url }` to client (line 67)
3. **User completes Stripe Checkout** → redirected to `/settings/billing?session_id=...`
4. **Stripe fires `checkout.session.completed`** → `POST /api/webhooks/stripe` (`src/app/api/webhooks/stripe/route.ts:45-179`)
   - Identifies `session.mode === "subscription"` branch (line 119+)
   - Retrieves full subscription object from Stripe (line 122)
   - Calls `getTierFromSubscription(subscription)` (`src/lib/stripe/webhooks.ts:15`) to resolve `"basic"` or `"pro"`
   - Updates `profiles` row (line 130-143):
     - `subscription_tier` ← resolved tier
     - `subscription_status` ← `"active"`
     - `subscription_id` ← Stripe subscription ID
     - `stripe_customer_id` ← Stripe customer ID
     - `ai_credits_used` ← `0` (reset on upgrade)
     - `ai_credits_reset_at` ← one month from now (`addMonths(now, 1)`)
     - Clears any pack fields (`pack_pro_expires_at`, `pack_access_case_id`, `pack_source_pack_id` ← `null`)
   - Sends subscription confirmation email (line 159-177)

### Customer Portal

- **Route**: `POST /api/stripe/portal` (`src/app/api/stripe/portal/route.ts`)
- Looks up `stripe_customer_id` from `profiles` (line 18-23)
- Creates Stripe Billing Portal session (line 37)
- `return_url` → `/settings/billing` (line 39)
- Returns `{ url: session.url }` — client redirects to Stripe-hosted portal
- **Accessed from**: `src/app/(dashboard)/settings/billing/BillingClient.tsx:74-89` — "Manage subscription" button
- **What it allows**: Cancel subscription, change payment method, download invoices. Plan-change capability depends on Stripe dashboard portal configuration (not configured in code).
- **Requirement**: User must have `stripe_customer_id` on profile (line 26-30); otherwise returns 404.

### Pack Checkout Flow

Step-by-step trace:

1. **Packs page CTA** → User selects a pack → `POST /api/packs/checkout` (`src/app/api/packs/checkout/route.ts`)
   - Validates `packId` against `COMPLAINT_PACKS_BY_ID` map (line 25)
   - Optionally validates `caseId` ownership (line 31-45)
   - Creates Stripe Checkout Session with `mode: "payment"` (line 57)
   - Uses inline `price_data` (no pre-created price ID) with `pack.price` and `pack.name` (line 60-72)
   - Sets `metadata: { userId, packId, caseId }` (line 75-79)
   - `success_url` → `/packs/success?session_id={CHECKOUT_SESSION_ID}` (line 73)
   - Returns `{ url: session.url }` (line 85)
2. **User completes Stripe payment** → redirected to `/packs/success`
3. **Stripe fires `checkout.session.completed`** → `POST /api/webhooks/stripe` (`src/app/api/webhooks/stripe/route.ts:47-116`)
   - Identifies `session.mode === "payment"` branch (line 47)
   - Extracts `userId`, `packId`, `caseId` from `session.metadata` (line 48-50)
   - Idempotency check: skips if `complaint_packs` record already exists for this session or payment intent (line 57-73)
   - Inserts `complaint_packs` record with `status: "purchased"`, `entitlement_expires_at` (+7 days) (line 79-95)
   - **Temporary Pro upgrade**: If `profile.subscription_tier === "free"` (line 103):
     - Sets `subscription_tier: "pro"`, `subscription_status: "pack_temporary"` (line 107-108)
     - Sets `pack_pro_expires_at` to +7 days (line 109)
     - Sets `pack_access_case_id` if a case was specified (line 110)
     - Does NOT set `ai_credits_reset_at` — this is a gap (free users don't get credit counter reset)

---

## 2. Tier Definitions

### Tier Names & Storage

- **Tier names**: `"free"`, `"basic"`, `"pro"`
- **TypeScript type**: `SubscriptionTier = "free" | "basic" | "pro"` — `src/lib/stripe/config.ts:12`
- **Database column**: `profiles.subscription_tier` — `src/types/database.ts:23`
- **Default value**: `"free"` (from `Database` Insert type default)
- **Subscription status column**: `profiles.subscription_status` — `src/types/database.ts:24-29`
  - Values: `"active"`, `"cancelled"`, `"past_due"`, `"trialing"`, `"pack_temporary"`

### Tier Prices

Defined in `src/lib/stripe/config.ts:14-27`:

| Tier | Monthly | Annual | Annual/mo equivalent | Saving |
|---|---|---|---|---|
| Basic | £4.99 | £39.99 | £3.33 | 33% |
| Pro | £9.99 | £79.99 | £6.67 | 33% |

Setup script confirms: `src/lib/stripe/setup.ts:36` (`499` pence monthly), line 45 (`3999` pence annual), line 64 (`999` pence monthly), line 74 (`7999` pence annual).

### Limit Definitions — EVERY Location

The AI limits are defined in **five separate places**. This is the most critical fragmentation issue:

| File:Line | What's defined |
|---|---|
| `src/lib/ai/constants.ts:4-8` | **Canonical** `AI_LIMITS` object: `free:{s:0,l:0,sum:0}`, `basic:{s:10,l:5,sum:100}`, `pro:{s:50,l:30,sum:500}` |
| `src/lib/ai/client.ts:11-18` | **Duplicate** `getAiLimit()` function with inline object (same values, but only `suggestions`, `letters`, `summaries`) |
| `src/app/api/ai/suggest/route.ts:73-77` | **Inline duplicate** `tierLimits` object — only `suggestions` and `letters`, no `summaries` key |
| `src/app/api/ai/draft-letter/route.ts:64-68` | **Inline duplicate** `tierLimits` object — same as above |
| `src/app/api/ai/summarise/route.ts:53-57` | **Inline duplicate** `tierLimits` object — same as above |

Case creation limit:
- `src/lib/stripe/feature-gates.ts:9-11` — `profile.cases_count < 1` for free tier

PDF export restrictions:
- `src/lib/stripe/feature-gates.ts:16-22` — `free → false`, `basic → timeline_only/letters_only only`, `pro → all`

### Tier Checks Throughout App

| File:Line | What it checks |
|---|---|
| `src/lib/stripe/feature-gates.ts:9` | `canCreateCase`: free limited to 1 case |
| `src/lib/stripe/feature-gates.ts:17` | `canExportPDF`: free blocked entirely |
| `src/lib/stripe/feature-gates.ts:25-29` | `canUseAI`: checks `AI_LIMITS[tier][feature]` and `ai_credits_used < limit` |
| `src/lib/stripe/feature-gates.ts:32-34` | `canViewAISuggestions`: hardcodes `tier !== "free"` |
| `src/lib/stripe/feature-gates.ts:37-39` | `canRecordVoiceMemo`: Pro only |
| `src/lib/stripe/feature-gates.ts:42-44` | `canUseEmailForward`: Pro only |
| `src/lib/stripe/feature-gates.ts:47-49` | `canReceiveEmailReminders`: free blocked |
| `src/lib/stripe/feature-gates.ts:56-65` | `getUpgradeReason("cases")`: free with ≥1 case blocked |
| `src/lib/stripe/feature-gates.ts:66-74` | `getUpgradeReason("pdf")`: free blocked |
| `src/lib/stripe/feature-gates.ts:75-83` | `getUpgradeReason("ai")`: free blocked (hardcoded message) |
| `src/lib/stripe/feature-gates.ts:84-92` | `getUpgradeReason("voice")`: non-pro blocked |
| `src/lib/stripe/feature-gates.ts:93-101` | `getUpgradeReason("email_forward")`: non-pro blocked |
| `src/lib/actions/cases.ts:80-85` | Server action: `canCreateCase(profile)` gate before DB insert |
| `src/app/(dashboard)/cases/page.tsx:140` | Show/hide "+ New Case" button |
| `src/app/(dashboard)/cases/page.tsx:157-163` | Render `UpgradePrompt` if `!canCreate` |
| `src/app/(dashboard)/cases/[id]/page.tsx:96` | Read `subscription_tier` to pass to `AISuggestion` |
| `src/app/(dashboard)/cases/[id]/page.tsx:320-339` | Pack upsell banner only for `tier === "free"` |
| `src/app/(dashboard)/settings/billing/BillingClient.tsx:157-163` | Show `UpgradePrompt` for free tier |
| `src/app/(dashboard)/settings/billing/BillingClient.tsx:166` | Hide AI credits progress bar for free |
| `src/app/api/reminders/cron/route.ts:62` | `.neq("subscription_tier", "free")` — exclude free from reminder emails |
| `src/app/api/reminders/cron/route.ts:234` | `subscription_tier !== "free"` — exclude free from escalation emails |
| `src/app/api/reminders/cron/route.ts:350` | `subscription_tier !== "free"` — exclude free from promise-broken emails |
| `src/app/api/ai/suggest/route.ts:73-98` | Inline tier limits check + `ai_suggestions_used` guard |
| `src/app/api/ai/draft-letter/route.ts:64-90` | Inline tier limits check + `ai_letters_used` guard |
| `src/app/api/ai/summarise/route.ts:53-64` | Inline tier limits check + `ai_suggestions_used` guard |
| `src/lib/stripe/webhooks.ts:15-24` | `getTierFromSubscription`: maps Stripe price IDs to tier names |

---

## 3. AI Credit System

### Credit Limits Per Tier

**Canonical source**: `src/lib/ai/constants.ts:4-8`

```
free:  { suggestions: 0,  letters: 0,  summaries: 0   }
basic: { suggestions: 10, letters: 5,  summaries: 100  }
pro:   { suggestions: 50, letters: 30, summaries: 500  }
```

The `summaries` limit is defined in constants but **never enforced** in `/api/ai/summarise/route.ts`. That route only checks `ai_suggestions_used` against `limits.suggestions`.

### Credit Tracking Columns

All in the `profiles` table (`src/types/database.ts:33-36`):

| Column | Type | Purpose |
|---|---|---|
| `ai_suggestions_used` | `number` | Count of AI case analyses + summaries consumed this period |
| `ai_letters_used` | `number` | Count of AI letters drafted this period |
| `ai_credits_used` | `number` | Aggregate total (bumped by both suggest and letter routes) |
| `ai_credits_reset_at` | `string \| null` | Timestamp of last reset (used as "reset due before" marker) |

**Note on `ai_credits_used`**: Both `/api/ai/suggest` (line 221) and `/api/ai/draft-letter` (line 243) increment `ai_credits_used` alongside their specific counters. The summarise route (`src/app/api/ai/summarise/route.ts:118`) also increments `ai_suggestions_used` and `ai_credits_used`. There is no dedicated `ai_summaries_used` column in the database.

### Credit Checks in API Routes

**`/api/ai/suggest`** (`src/app/api/ai/suggest/route.ts`):
- Line 73-77: Defines inline `tierLimits` (duplicates `AI_LIMITS`)
- Line 80-89: If `limits.suggestions === 0` → 403 `{ error: "upgrade_required", requiredTier: "basic" }`
- Line 91-98: If `profile.ai_suggestions_used >= limits.suggestions` → 403 `{ error: "Monthly AI credit limit reached..." }`
- Line 217-222: On success, increments `ai_suggestions_used + 1` and `ai_credits_used + 1`

**`/api/ai/draft-letter`** (`src/app/api/ai/draft-letter/route.ts`):
- Line 64-68: Defines inline `tierLimits` (duplicates `AI_LIMITS`)
- Line 72-81: If `limit === 0` → 403 `{ error: "upgrade_required", requiredTier: "basic" }`
- Line 83-90: If `profile.ai_letters_used >= limit` → 403 `{ error: "Monthly AI credit limit reached..." }`
- Line 239-244: On success, increments `ai_letters_used + 1` and `ai_credits_used + 1`

**`/api/ai/summarise`** (`src/app/api/ai/summarise/route.ts`):
- Line 53-57: Defines inline `tierLimits` (only `suggestions` and `letters`, no `summaries`)
- Line 59-64: If `limits.suggestions === 0` OR `profile.ai_suggestions_used >= limits.suggestions` → 403
  - **Note**: Uses the **suggestions** limit (not a separate summaries limit). Free users blocked because `limits.suggestions === 0`.
- Line 115-120: On success, increments `ai_suggestions_used + 1` and `ai_credits_used + 1`
  - **Anomaly**: Summarise debits `ai_suggestions_used`, not a `summaries` counter.

### Free User UI When Blocked

**AI Case Analysis Panel** (`src/components/cases/AISuggestion.tsx`):
- Lines 75-109: If `tier === "free"`, renders a card with:
  - Blurred fake analysis text ("Your case looks strong...", "Next step: Request a formal deadlock letter...")
  - Overlay with Sparkles icon and "Unlock AI guidance" text
  - `UpgradePrompt` component below with title "AI analysis requires Basic or Pro"
- The `UpgradePrompt` component (`src/components/ui/UpgradePrompt.tsx`) renders an amber alert box with a link "Upgrade to Basic" pointing to `/pricing`

**AI Letter Drafting** (`src/app/(dashboard)/cases/[id]/letters/new/LetterWizard.tsx`):
- Letter wizard calls `POST /api/ai/draft-letter`
- If blocked (403), the wizard displays the error message returned by the API
- No pre-check in the UI before calling — the gate is API-only; error surfaces after user clicks "Generate"

**AI Summarise** (`src/app/api/ai/summarise/route.ts`):
- No dedicated UI pre-check found; gate is API-only

### Monthly Credit Reset

**Two mechanisms**:

**Mechanism 1 — Cron job** (`src/app/api/reminders/cron/route.ts:33-41`):
```sql
UPDATE profiles
SET ai_suggestions_used = 0, ai_letters_used = 0, ai_credits_used = 0, ai_credits_reset_at = now
WHERE ai_credits_reset_at < (now - 30 days)
```
- No tier filter — runs on ALL tiers where the condition matches
- Sets `ai_credits_reset_at` to `now.toISOString()` (the moment of reset, NOT next-month)
- **Critical gap**: `NULL` values do NOT satisfy `.lt()` in PostgreSQL/PostgREST — fresh users with `ai_credits_reset_at = null` are **never caught by this query**

**Mechanism 2 — Invoice paid webhook** (`src/app/api/webhooks/stripe/route.ts:286-333`):
- Fires on `invoice.paid` Stripe event
- Resets credits if `ai_credits_reset_at < now`
- Sets `ai_credits_reset_at` to `addMonths(now, 1)`
- Only applies to users with a Stripe customer ID (paid subscribers only)

**Summary**: Free users with `ai_credits_reset_at = null` never have their credits reset by the cron job. Free users have no Stripe customer so are never reset by the webhook either. Currently this doesn't matter (free limits are 0), but it becomes critical if non-zero free limits are introduced.

### Helper Functions

| Function | File:Line | Notes |
|---|---|---|
| `canUseAI(profile, feature)` | `src/lib/stripe/feature-gates.ts:25-29` | Uses `AI_LIMITS` from constants. Checks `limit === 0` or `ai_credits_used < limit`. **Not used in API routes** — routes duplicate the logic inline. |
| `canViewAISuggestions(profile)` | `src/lib/stripe/feature-gates.ts:32-34` | Hardcodes `tier !== "free"` — does not use `AI_LIMITS`. |
| `getAiLimit(tier, feature)` | `src/lib/ai/client.ts:11-18` | Another duplicate of `AI_LIMITS`. Not used anywhere else in the codebase. |

---

## 4. Paywall Touchpoints

| Feature | Enforcement Location | File:Line | What free user sees |
|---|---|---|---|
| AI case analysis | `AISuggestion` component | `src/components/cases/AISuggestion.tsx:75-109` | Blurred preview + `UpgradePrompt` (amber box, link to /pricing) |
| AI case analysis | API guard | `src/app/api/ai/suggest/route.ts:80-89` | 403 `upgrade_required` response |
| AI letter drafting | API guard | `src/app/api/ai/draft-letter/route.ts:72-81` | 403 `upgrade_required` response; LetterWizard shows error |
| AI summarise | API guard | `src/app/api/ai/summarise/route.ts:59-64` | 403 response |
| Case creation (>1) | Server action | `src/lib/actions/cases.ts:80-85` | `toast.error(result.error)` in CaseWizard |
| Case creation (>1) | Cases list page | `src/app/(dashboard)/cases/page.tsx:152-163` | "+ New Case" button hidden; `UpgradePrompt` shown |
| PDF export (any) | API guard | `src/app/api/export/pdf/route.ts:81-93` | 403 `upgrade_required` |
| PDF export (any) | Export UI | `src/app/(dashboard)/cases/[id]/export/ExportClient.tsx:143-157` | All options greyed out with lock icon |
| PDF full case | Export UI | `src/app/(dashboard)/cases/[id]/export/ExportClient.tsx:210-216` | `UpgradePrompt` shown when `full_case` selected |
| Email reminders (digest) | Cron job | `src/app/api/reminders/cron/route.ts:62` | `.neq("subscription_tier", "free")` — free users excluded from query |
| Escalation alert emails | Cron job | `src/app/api/reminders/cron/route.ts:234` | `subscription_tier !== "free"` check before send |
| Promise-broken emails | Cron job | `src/app/api/reminders/cron/route.ts:350` | `subscription_tier !== "free"` check before send |
| Voice memo recording | Feature gate fn | `src/lib/stripe/feature-gates.ts:37-39` | Pro only (`canRecordVoiceMemo`) |
| Email forwarding | Feature gate fn | `src/lib/stripe/feature-gates.ts:42-44` | Pro only (`canUseEmailForward`) |
| Billing page | BillingClient | `src/app/(dashboard)/settings/billing/BillingClient.tsx:157-163` | `UpgradePrompt` rendered for free tier |
| AI credits progress | BillingClient | `src/app/(dashboard)/settings/billing/BillingClient.tsx:166` | Section hidden entirely if `tier === "free"` |
| Case detail page | CasePage | `src/app/(dashboard)/cases/[id]/page.tsx:320-339` | Packs upsell banner shown (not a hard block, a soft prompt) |

---

## 5. Pack System

### Temporary Pro Access

**Where implemented**: `src/app/api/webhooks/stripe/route.ts:103-113`

When a pack purchase (`mode === "payment"`) completes:
1. A `complaint_packs` record is inserted with `entitlement_expires_at` = now + 7 days
2. If `profile.subscription_tier === "free"` (not already paid):
   - `subscription_tier` → `"pro"`
   - `subscription_status` → `"pack_temporary"`
   - `pack_pro_expires_at` → now + 7 days (7 × 24 × 60 × 60 × 1000 ms, line 75-77)
   - `pack_access_case_id` → the specified case ID (or `null` for global access)
   - `pack_source_pack_id` → the `complaint_packs.id` just inserted

**Scope**: If a case ID was specified at checkout, the Pro access is locked to that specific case. AI routes enforce this via `enforcePackScopedCaseAccess()`.

**Credit reset**: When pack Pro access is granted, `ai_credits_used` and `ai_credits_reset_at` are **not** reset. The user starts with whatever credit counts they had as a free user (typically 0).

### Does a Pack Bypass or Add Credits?

Pack access does not add credits or bypass the credit counter. It elevates `subscription_tier` to `"pro"`, which changes the limit ceiling. The user then has up to 50 suggestions and 30 letters per the Pro tier limits — checked against their existing `ai_suggestions_used` and `ai_letters_used` counters. Since free users start at 0 used, this effectively gives them full Pro-level access for 7 days.

### Pack Expiry Mechanism

**Mechanism 1 — Cron job** (`src/app/api/reminders/cron/route.ts:43-55`):
```sql
UPDATE profiles
SET subscription_tier = 'free', subscription_status = 'active',
    pack_pro_expires_at = null, pack_access_case_id = null, pack_source_pack_id = null
WHERE subscription_status = 'pack_temporary'
  AND pack_pro_expires_at < now
```
- Runs daily (or per cron schedule); reverts access after expiry
- Does **not** reset `ai_suggestions_used` or `ai_letters_used` on reversion

**Mechanism 2 — At-request time** (`src/lib/packs/access.ts:28-33`):
- `enforcePackScopedCaseAccess()` checks `pack_pro_expires_at < new Date()` on every API call
- Returns 403 immediately if expired, even if cron hasn't run yet
- This means access reverts functionally within the same second the expiry time passes

**Refund handling** (`src/app/api/webhooks/stripe/route.ts:337-374`):
- On `charge.refunded`, the `complaint_packs` record is marked `refunded`
- If the refunded pack was the active `pack_source_pack_id`, profile is immediately reverted to free

---

## 6. Free User Reset Assessment

### Current Behaviour

The cron job reset query (`src/app/api/reminders/cron/route.ts:33-41`):

```typescript
await supabase
  .from("profiles")
  .update({
    ai_suggestions_used: 0,
    ai_letters_used: 0,
    ai_credits_used: 0,
    ai_credits_reset_at: now.toISOString(),
  })
  .lt("ai_credits_reset_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
```

**Does it skip free tier users?**

Technically there is **no `WHERE subscription_tier != 'free'` clause**, but in practice free users are skipped because:

1. New users are created with `ai_credits_reset_at = null` (default from `Insert` type)
2. PostgreSQL `.lt()` comparisons against `NULL` evaluate to `false` — PostgREST does not include `null` rows in a `.lt()` filter
3. Therefore, free users who have never been reset (i.e., have `ai_credits_reset_at = null`) are **never matched** and never reset
4. Free users who previously purchased a pack and had their pack expire also never get `ai_credits_reset_at` set (the pack upgrade doesn't set this field)

The `invoice.paid` webhook reset (`src/app/api/webhooks/stripe/route.ts:286-333`) only fires for users with a `stripe_customer_id`, which free users do not have.

**Net result**: Free users effectively never have their counters reset. Currently this is harmless because free limits are 0 (there is nothing to consume or reset). If free limits become non-zero, this becomes a blocking bug.

### Changes Needed for Non-Zero Free Limits

If free tier AI limits are changed to non-zero values (e.g., `suggestions: 3, letters: 1`), the following **must** be updated:

| File:Line | Change Required |
|---|---|
| `src/lib/ai/constants.ts:5` | Update `free: { suggestions: X, letters: Y, summaries: Z }` |
| `src/app/api/ai/suggest/route.ts:74` | Update or remove inline `tierLimits.free` — ideally replace all inline objects with import from `AI_LIMITS` |
| `src/app/api/ai/draft-letter/route.ts:65` | Same — update or remove inline `tierLimits.free` |
| `src/app/api/ai/summarise/route.ts:54` | Same — update or remove inline `tierLimits.free` |
| `src/lib/ai/client.ts:13` | Update `getAiLimit()` inline object for free tier |
| `src/lib/stripe/feature-gates.ts:28` | `canUseAI()` currently returns false if `limit === 0` — this logic will work correctly if limit > 0, so no change needed to the function logic itself |
| `src/lib/stripe/feature-gates.ts:32-34` | `canViewAISuggestions()` hardcodes `tier !== "free"` — must be updated to allow free users if non-zero limits are set |
| `src/lib/stripe/feature-gates.ts:75-83` | `getUpgradeReason("ai")` blocks all free users regardless of credits — must be updated to only block when credits are exhausted |
| `src/components/cases/AISuggestion.tsx:75-109` | Free user sees blurred preview unconditionally — must be changed to show the actual "Analyse Case" button |
| `src/app/api/reminders/cron/route.ts:33-41` | Cron reset query uses `.lt()` which excludes `null` — must change to also match rows where `ai_credits_reset_at IS NULL`, e.g.: `.or("ai_credits_reset_at.is.null,ai_credits_reset_at.lt.{date}")` |
| New: user registration / Supabase trigger | When a new user is created, `ai_credits_reset_at` should be set to `addMonths(now, 1)` so the cron can pick them up on next cycle |

---

## 7. Summary: Files That Will Need Changes in Prompt 2

| File Path | Reason |
|---|---|
| `src/lib/ai/constants.ts` | **Single source of truth for AI limits** — update `free` tier values here first |
| `src/app/api/ai/suggest/route.ts` | Inline `tierLimits` must be removed/updated; free tier gate logic must change |
| `src/app/api/ai/draft-letter/route.ts` | Inline `tierLimits` must be removed/updated; free tier gate logic must change |
| `src/app/api/ai/summarise/route.ts` | Inline `tierLimits` must be removed/updated; free tier gate logic must change |
| `src/lib/ai/client.ts` | `getAiLimit()` has a third duplicate of the AI limits table |
| `src/lib/stripe/feature-gates.ts` | `canViewAISuggestions()` hardcodes free=blocked; `getUpgradeReason("ai")` hardcodes free=blocked |
| `src/components/cases/AISuggestion.tsx` | Unconditional blurred preview for free tier must become conditional (show real UI if credits remain) |
| `src/app/api/reminders/cron/route.ts` | Credit reset query must include `null` values to catch new free users |
| Supabase migration (new) | New user trigger or default value must set `ai_credits_reset_at` so cron works for free users |
