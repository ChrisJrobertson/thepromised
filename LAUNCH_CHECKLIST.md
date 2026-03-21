# TheyPromised — Launch Checklist

**Generated:** 21 March 2026

---

## Code & Build (all done)

- [x] 54 Vitest tests passing
- [x] 13 Playwright E2E tests passing (marketing + auth)
- [x] TypeScript `--noEmit` clean
- [x] ESLint — 0 errors (3 warnings, non-blocking)
- [x] `npm run build` passes
- [x] Security fixes verified (callback redirect, webhook fail-closed, Stripe spelling normalisation)
- [x] `invoice.paid` pack_temporary guard applied
- [x] Duplicate test files removed
- [x] No TODO/FIXME/HACK comments in codebase
- [x] `favicon.ico` generated from existing PNGs
- [x] `og-image.png` present (1200×630)
- [x] Content-Security-Policy header added to `vercel.json`
- [x] Custom 404 page and global error boundary in place
- [x] Sitemap and robots.ts properly configured
- [x] Middleware protects all authenticated routes
- [x] All API endpoints verify their secrets (cron, seed, webhooks)

---

## Environment (manual steps)

- [ ] **Resend domain verification** — Verify `theypromised.app` in Resend dashboard, then:
  - Set `RESEND_DOMAIN_VERIFIED=true` in `.env.local`
  - Set `RESEND_DOMAIN_VERIFIED=true` in Vercel → Environment Variables → Production
- [ ] **Vercel env var cross-check** — Open Vercel dashboard and confirm all 30 env vars are set for Production. Use `ENV_VAR_AUDIT.md` as the checklist. Pay special attention to:
  - All 7 Stripe price IDs (4 subscription + 3 pack)
  - `STRIPE_WEBHOOK_SECRET` (must match the live webhook endpoint, not the test one)
  - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - `CRON_SECRET` (must match the value used by the Vercel cron job)
  - `B2B_ALERT_EMAIL=ops@theypromised.app`
- [ ] **Supabase** — Un-pause the project if paused (dashboard.supabase.com → project → Resume)

---

## Stripe (manual steps)

- [ ] **Webhook endpoint** — Confirm `https://www.theypromised.app/api/webhooks/stripe` is the active live webhook in Stripe dashboard, listening to: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`, `charge.refunded`
- [ ] **Pack purchase smoke test** — Buy a Complaint Starter pack in test mode, then verify:
  - `complaint_packs` row created with correct `credits_remaining`
  - `profiles.subscription_status` set to `pack_temporary`
  - Trigger an `invoice.paid` event for a separate subscription user and confirm their status is NOT overwritten (the `.neq("subscription_status", "pack_temporary")` guard)
- [ ] **Subscription smoke test** — Complete a Basic Monthly checkout. Confirm profile updates to `subscription_status: "active"`, `subscription_tier: "basic"`

---

## Monitoring (manual steps)

- [ ] **Sentry** — Verify the DSN is active at sentry.io. Trigger a test error in dev to confirm events arrive
- [ ] **PostHog** — Check eu.posthog.com for incoming events. The `/ingest` proxy rewrite should be working — verify no ad-blocker issues by checking network tab
- [ ] **Vercel cron** — After deploy, check Vercel dashboard → Cron Jobs to confirm `/api/reminders/cron` is registered and scheduled for `0 8 * * *`

---

## Post-Deploy Verification

- [ ] Visit `https://www.theypromised.app` — hero loads, no console errors
- [ ] Visit `/login` — form renders, magic link sends (if Resend domain verified)
- [ ] Visit `/pricing` — all 3 tiers display with correct prices
- [ ] Visit `/register` — creates account, redirects to dashboard
- [ ] Open Facebook Sharing Debugger / Twitter Card Validator — OG image renders correctly
- [ ] Check `https://www.theypromised.app/sitemap.xml` — returns valid XML
- [ ] Check `https://www.theypromised.app/robots.txt` — allows indexing of public routes
- [ ] Test the CSP header — open DevTools → Network → check `Content-Security-Policy` response header on any page

---

## Optional Polish (post-launch)

- [ ] Upgrade OG image to a more visually rich design
- [ ] Set up uptime monitoring (e.g. BetterStack, Checkly)
- [ ] Configure Vercel Spend Protection alerts
- [ ] Tighten CSP further — remove `'unsafe-eval'` if no runtime eval is needed after testing
- [ ] Rotate API keys that may have been exposed during development
