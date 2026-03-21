# Environment Variable Audit — TheyPromised

**Generated:** 21 March 2026
**Scope:** All `process.env.*` references across 34 source files + root config files

---

## Coverage Summary

| Category | Required | In `.env.local` | Status |
|---|---|---|---|
| Supabase | 3 | 3 | All present |
| Stripe (keys) | 3 | 3 | All present |
| Stripe (subscription prices) | 4 | 4 | All present |
| Stripe (pack prices) | 3 | 3 | All present |
| AI (Anthropic) | 1 | 1 | All present |
| Email (Resend) | 5 | 5 | **See note below** |
| Rate Limiting (Upstash) | 2 | 2 | All present |
| App | 2 | 2 | All present |
| Security | 2 | 2 | All present |
| Analytics (PostHog) | 2 | 2 | All present |
| Error Monitoring (Sentry) | 2 | 2 | All present |
| B2B | 1 | 0 | **Missing — see below** |
| **Total** | **30** | **29** | |

---

## Action Items

### 1. `RESEND_DOMAIN_VERIFIED=false` — Must flip to `true`

Currently set to `false` in `.env.local`. This gates whether outbound complaint letters are actually sent via Resend. Once the `theypromised.app` domain is verified in the Resend dashboard:

- Set `RESEND_DOMAIN_VERIFIED=true` in `.env.local`
- Set the same in **Vercel → Environment Variables** for Production

### 2. `B2B_ALERT_EMAIL` — Missing from `.env.local`

The codebase references this for SLA breach alerts. It falls back gracefully to `support@` if unset, so it's not a blocker — but for production it should be set explicitly.

**Recommended:** Add `B2B_ALERT_EMAIL=ops@theypromised.app` to both `.env.local` and Vercel.

### 3. Vercel Cross-Check (Manual)

The following vars must be set in **Vercel → Settings → Environment Variables → Production**. Confirm each is present and matches live values:

**Critical (app breaks without these):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID_BASIC_MONTHLY`
- `STRIPE_PRICE_ID_BASIC_ANNUAL`
- `STRIPE_PRICE_ID_PRO_MONTHLY`
- `STRIPE_PRICE_ID_PRO_ANNUAL`
- `STRIPE_PRICE_COMPLAINT_STARTER`
- `STRIPE_PRICE_ESCALATION_PACK`
- `STRIPE_PRICE_FULL_CASE_PACK`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

**Important (degraded functionality without these):**
- `RESEND_FROM_EMAIL`
- `RESEND_ADMIN_FROM`
- `RESEND_DOMAIN_VERIFIED` (must be `true`)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

**Optional (graceful fallback if unset):**
- `SEED_SECRET` (one-time use only)
- `B2B_ALERT_EMAIL` (falls back to support@)
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `NEXT_PUBLIC_APP_NAME` (defaults to "TheyPromised")

### 4. Security Note — Key Rotation Reminder

The `.env.local` file contains live API keys. After launch, rotate:
- `SUPABASE_SERVICE_ROLE_KEY` (if previously shared/committed)
- `ANTHROPIC_API_KEY`
- `CRON_SECRET` and `SEED_SECRET`

Ensure `.env.local` is in `.gitignore` (it is).

---

## No Missing References

Every `process.env.*` reference in the codebase has a corresponding entry in `.env.local.example`. No orphaned or undocumented env vars were found.
