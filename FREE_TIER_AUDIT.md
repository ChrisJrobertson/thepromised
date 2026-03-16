# Free Tier Audit — TheyPromised.app

Conducted: 2026-03-16

---

## 1a. Stripe Configuration

### Price IDs
All Stripe price IDs come exclusively from environment variables — no hard-coded IDs in source code.

| Env var | Purpose |
|---------|---------|
| `STRIPE_PRICE_ID_BASIC_MONTHLY` | Basic monthly subscription |
| `STRIPE_PRICE_ID_BASIC_ANNUAL`  | Basic annual subscription |
| `STRIPE_PRICE_ID_PRO_MONTHLY`   | Pro monthly subscription |
| `STRIPE_PRICE_ID_PRO_ANNUAL`    | Pro annual subscription |

Referenced in: `src/lib/stripe/config.ts` (lines 1–10)  
Mode (test/live): unknown at code level — determined entirely by which key values are in `.env.local`.

### Subscription checkout flow
1. `src/app/(marketing)/pricing/PricingClient.tsx` — CTA button calls `handleCheckout(tier)` (line 127)
2. `POST /api/stripe/checkout` (`src/app/api/stripe/checkout/route.ts`) — creates Stripe Checkout Session with `supabase_user_id` in metadata
3. Stripe redirects user back to success URL
4. `POST /api/webhooks/stripe` → `checkout.session.completed` handler (line 45) retrieves subscription, calls `getTierFromSubscription()`, updates `profiles` row:
   - Sets `subscription_tier`, `subscription_status`, `subscription_id`, `stripe_customer_id`
   - Resets `ai_credits_used` to 0 and sets `ai_credits_reset_at` (does NOT reset `ai_suggestions_used` or `ai_letters_used` — **bug**)

### Customer Portal
- `POST /api/stripe/portal` (`src/app/api/stripe/portal/route.ts`) — creates a Billing Portal session
- UI entry: `src/app/(dashboard)/settings/billing/BillingClient.tsx` line 141 — "Manage subscription" button

### Pack checkout flow
1. `src/app/(dashboard)/dashboard/packs/page.tsx` or `/packs` marketing page — CTA links to `/api/packs/checkout`
2. `POST /api/packs/checkout` (`src/app/api/packs/checkout/route.ts`) — creates one-off Stripe payment session with `userId`, `packId`, `caseId` in metadata
3. `POST /api/webhooks/stripe` → `checkout.session.completed` with `session.mode === "payment"` (line 47) — inserts row in `complaint_packs`, if user is on free tier: temporarily upgrades to `subscription_tier = "pro"`, `subscription_status = "pack_temporary"`, sets `pack_pro_expires_at` (7 days)

---

## 1b. Subscription Tier Definitions

### Tier storage
Column `profiles.subscription_tier text default 'free' check (subscription_tier in ('free','basic','pro'))`  
Migration: `supabase/migrations/20260314170000_initial_schema.sql`

### Prices
Defined in `src/lib/stripe/config.ts` (lines 14–27):
- Basic: £4.99/mo, £39.99/yr (33% saving)
- Pro: £9.99/mo, £79.99/yr (33% saving)

### Feature limits — source of truth (FRAGMENTED — 5 locations)
There is **no single source of truth** for AI limits; they are duplicated in:

| File | Lines | What it defines |
|------|-------|----------------|
| `src/lib/ai/constants.ts` | 4–8 | `AI_LIMITS` — canonical export used by feature-gates |
| `src/lib/ai/client.ts` | 12–16 | `getAiLimit()` — duplicate inline object |
| `src/app/api/ai/suggest/route.ts` | 73–78 | `tierLimits` — inline duplicate |
| `src/app/api/ai/draft-letter/route.ts` | 64–69 | `tierLimits` — inline duplicate |
| `src/app/api/ai/summarise/route.ts` | 53–57 | `tierLimits` — inline duplicate |

Current limits across all locations:
```
free:  { suggestions: 0, letters: 0, summaries: 0 }
basic: { suggestions: 10, letters: 5, summaries: 100 }
pro:   { suggestions: 50, letters: 30, summaries: 500 }
```

### Tier checks in the app
- `src/lib/stripe/feature-gates.ts` — all gate functions
- `src/app/(dashboard)/cases/[id]/page.tsx` line 96 — reads tier for pack upsell banner
- `src/app/(dashboard)/cases/[id]/letters/new/page.tsx` line 59 — `canUseAI(profile, "letters")`
- `src/components/cases/AISuggestion.tsx` line 75 — `if (tier === "free")` hard block
- `src/app/(dashboard)/settings/billing/BillingClient.tsx` line 166 — hides credits for free
- `src/components/cases/EmailForward.tsx` — Pro gate
- `src/components/cases/VoiceMemoRecorder.tsx` — Pro gate

---

## 1c. AI Credit Enforcement

### Where limits are defined
See table in 1b above — five places, none referencing each other.

### Where credits are tracked (`profiles` table)
| Column | Tracks |
|--------|--------|
| `ai_suggestions_used` | Calls to `/api/ai/suggest` + `/api/ai/summarise` |
| `ai_letters_used` | Calls to `/api/ai/draft-letter` |
| `ai_credits_used` | Combined total of all AI calls (billing display) |
| `ai_credits_reset_at` | Timestamp when credits were last reset |

### Where credits are checked before AI calls
- `src/app/api/ai/suggest/route.ts` lines 80–98: two-step check — first flat-rejects free (`limits.suggestions === 0`), then checks `ai_suggestions_used >= limits.suggestions`
- `src/app/api/ai/draft-letter/route.ts` lines 72–90: same pattern with `ai_letters_used`
- `src/app/api/ai/summarise/route.ts` line 59: combined check — flat-rejects free OR exhausted
- `src/lib/stripe/feature-gates.ts::canUseAI()` lines 25–30: uses `ai_credits_used` (COMBINED) vs `AI_LIMITS[tier][feature]` — **inconsistency**: API routes use per-feature counters, gate uses combined counter

### Free user UI when accessing AI features
- **AI Suggestion panel** (`AISuggestion.tsx` line 75): Hard `if (tier === "free")` → renders blurred locked card + `UpgradePrompt` ("AI analysis requires Basic or Pro")
- **Letter generation** (`letters/new/page.tsx` lines 59–72): `canUseAI(profile, "letters")` → if false, renders full-page `UpgradePrompt` with no wizard access

### Monthly credit reset
- `invoice.paid` webhook handler (`src/app/api/webhooks/stripe/route.ts` lines 286–333): resets `ai_credits_used` and sets `ai_credits_reset_at` only
- **Bug**: Does NOT reset `ai_suggestions_used` or `ai_letters_used` — the counters that API routes actually check
- **Bug**: Free users have no Stripe subscription → `invoice.paid` never fires → **no monthly reset mechanism for free users**

### `canUseAI()` / helper functions
- `src/lib/stripe/feature-gates.ts::canUseAI()` (line 25) — exists but uses wrong counter (`ai_credits_used` vs per-feature)
- `src/lib/stripe/feature-gates.ts::canViewAISuggestions()` (line 32) — blocks all free users; not used in any component, only tested
- No `resetCredits()` helper exists anywhere

---

## 1d. Paywall Touchpoints

| Feature | Location | What free user sees |
|---------|----------|-------------------|
| AI suggestion | `AISuggestion.tsx:75` | Blurred card + "AI analysis requires Basic or Pro" with link to /pricing |
| AI letter | `letters/new/page.tsx:59–72` | Full-page UpgradePrompt, no wizard shown |
| Case creation (>1) | `canCreateCase()` in feature-gates.ts + `cases/new/page.tsx` | Blocked from creating case |
| PDF export | `canExportPDF()` in feature-gates.ts + `export/page.tsx` | Blocked entirely |
| Email reminders | `canReceiveEmailReminders()` in feature-gates.ts | Blocked (cron skips them) |
| Voice memo | `VoiceMemoRecorder.tsx` | Pro-only gate |
| Email forwarding | `EmailForward.tsx` | Pro-only gate |

---

## 1e. Pack System Interaction

### Temporary Pro access
When free user buys a pack (`checkout.session.completed` with mode=payment):
- `src/app/api/webhooks/stripe/route.ts` lines 103–114
- Sets: `subscription_tier = "pro"`, `subscription_status = "pack_temporary"`, `pack_pro_expires_at = now + 7 days`, `pack_access_case_id`, `pack_source_pack_id`

### Credit system interaction
Pack users get full Pro tier limits (50 suggestions, 30 letters) for 7 days. The `enforcePackScopedCaseAccess()` in `src/lib/packs/access.ts` checks that:
- `pack_pro_expires_at` has not passed
- If `pack_access_case_id` is set, the requested `caseId` matches

### Pack expiry handling
Pack expiry is enforced at AI API call time via `enforcePackScopedCaseAccess()`. There is no background job that reverts the tier — it stays as "pro/pack_temporary" in the DB until:
- A new subscription is purchased (overwrites tier)
- A refund is processed (`charge.refunded` webhook reverts to free)
- The access check fails at API call time (pack_pro_expires_at < now)

---

## Key Bugs Found

1. **Monthly reset doesn't reset per-feature counters** — `invoice.paid` resets `ai_credits_used` only; `ai_suggestions_used` and `ai_letters_used` (what API routes check) are never reset
2. **Free users never get a monthly reset** — no Stripe invoice for free tier means `invoice.paid` never fires
3. **`canUseAI()` uses wrong counter** — checks combined `ai_credits_used` instead of per-feature `ai_suggestions_used`/`ai_letters_used`
4. **Limits defined in 5 places** — no single source of truth, drift is likely

---

## Files Changed in This PR (Part 2–4)

| File | Change |
|------|--------|
| `src/lib/config/tiers.ts` | NEW — single source of truth for all tier limits |
| `src/lib/ai/constants.ts` | Now re-exports from config/tiers.ts |
| `src/lib/ai/client.ts` | Removed duplicate `getAiLimit()` function |
| `src/lib/ai/credits.ts` | NEW — `ensureCreditsResetIfDue()` lazy reset helper |
| `src/app/api/ai/suggest/route.ts` | Uses TIER_AI_LIMITS, lazy reset, new error codes |
| `src/app/api/ai/draft-letter/route.ts` | Uses TIER_AI_LIMITS, lazy reset, returns credits info |
| `src/app/api/ai/summarise/route.ts` | Uses TIER_AI_LIMITS, lazy reset |
| `src/lib/stripe/feature-gates.ts` | Fixed canUseAI (per-feature counters), canViewAISuggestions (allows free), getUpgradeReason |
| `src/app/api/webhooks/stripe/route.ts` | Resets ai_suggestions_used + ai_letters_used in all reset events |
| `src/test/unit/feature-gates.test.ts` | Updated tests for new free tier AI access |
| `src/components/ui/AiCreditsModal.tsx` | NEW — soft paywall modal |
| `src/components/cases/AISuggestion.tsx` | Removed tier=free hard block; credit indicator; soft modal |
| `src/app/(dashboard)/cases/[id]/page.tsx` | Passes credit data to AISuggestion |
| `src/app/(dashboard)/cases/[id]/letters/new/page.tsx` | Removed hard gate; passes credit data to wizard |
| `src/app/(dashboard)/cases/[id]/letters/new/LetterWizard.tsx` | Credit indicator; soft modal; magic moment toast |
| `src/app/(dashboard)/settings/billing/BillingClient.tsx` | Shows AI credits for free users; per-feature breakdown |
| `src/app/(dashboard)/settings/billing/page.tsx` | Passes per-feature credit data |
| `src/app/(marketing)/pricing/PricingClient.tsx` | Updated free tier feature lists and comparison table |
