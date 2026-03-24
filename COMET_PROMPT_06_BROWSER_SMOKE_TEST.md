# COMET PROMPT 06 — Live Browser Smoke Test (with AI Access)

> **Purpose:** Open `https://www.theypromised.app` in a browser and systematically verify every public page, the auth flow, the authenticated dashboard, security headers, SEO metadata, and external service integration. Generate a structured `BROWSER_SMOKE_REPORT.md` at the end.
>
> **This is a READ-ONLY testing prompt — do NOT modify any code.** If you find issues, document them in the report. You have full browser and AI access.

---

## IMPORTANT: Test Credentials

You will need a real account to test authenticated routes. Use either:
- An existing test account Chris provides, OR
- Register a new account at `/register` using a throwaway email during Section 3.

If you cannot authenticate (e.g. Resend domain not yet verified, magic link doesn't arrive), skip authenticated sections and mark them as **BLOCKED — auth unavailable** in the report.

---

## SECTION 1: Public Marketing Pages (unauthenticated)

Visit each URL below. For each, record: **loads (Y/N)**, **console errors (Y/N)**, **visual issues (describe any)**.

### 1a — Homepage
- Navigate to `https://www.theypromised.app`
- Verify the hero heading reads **"They Promised."** on line 1 and **"You Proved It."** on line 2
- Verify the primary CTA button says **"Start Your Case"** (or "Start Your Case — Free") and links to `/register`
- Verify the 6 category icons render (Energy, Banking, Broadband, Government, Housing, Insurance)
- Verify the 3 "problem" cards render (called, spoken to 5 people, ombudsman wants proof)
- Verify the 3 feature cards render (Log Everything, Get Guided, Export & Win)
- Verify the "How it works" 4-step section renders
- Verify the 3 testimonial cards render (Sarah T., Marcus L., Priya K.)
- Scroll to the footer — verify links are present and not broken
- Open DevTools → Console: note any errors or warnings

### 1b — Pricing
- Navigate to `/pricing`
- Verify **3 plan tiers** display: Free, Basic, Pro
- Verify Basic shows **£9.99/mo** (monthly) and toggle to annual shows **£7.99/mo** (or equivalent)
- Verify Pro shows **£19.99/mo** (monthly) and toggle to annual shows **£15.99/mo** (or equivalent)
- Verify Free tier lists: 1 active case, 3 AI suggestions/month, 1 AI letter/month
- Verify Basic tier lists: 10 AI case analyses/month, 5 AI-drafted letters/month
- Verify Pro tier lists: 50 AI case analyses/month, 30 AI-drafted letters/month
- Verify **Complaint Packs** section renders below the plans (Complaint Starter, Escalation Pack, Full Case Pack)
- Verify FAQ accordion works (6 questions)
- Check that CTA buttons for Basic/Pro link to either `/register` (unauthenticated) or trigger Stripe checkout (authenticated)

### 1c — How It Works
- Navigate to `/how-it-works`
- Verify page loads with step-by-step content
- No console errors

### 1d — Escalation Guides
- Navigate to `/escalation-guides`
- Verify the page lists complaint categories (energy, banking, broadband, etc.)
- Click at least one guide link (e.g. energy) and verify it loads a guide page

### 1e — About
- Navigate to `/about`
- Verify page loads, content renders

### 1f — Privacy & Terms
- Navigate to `/privacy` — verify it loads
- Navigate to `/terms` — verify it loads
- Both should have substantive legal content, not placeholder text

### 1g — Business (B2B)
- Navigate to `/business`
- Verify the B2B landing page loads with enterprise/organisation-focused content

### 1h — Complaint Templates
- Navigate to `/templates`
- Verify template listing page loads

### 1i — Calculator
- Navigate to `/calculator`
- Verify page loads

### 1j — Packs
- Navigate to `/packs`
- Verify the one-off complaint packs page loads (if separate from pricing)

### 1k — Companies
- Navigate to `/companies`
- Verify the company directory/scorecards page loads

---

## SECTION 2: Auth Pages (unauthenticated)

### 2a — Login
- Navigate to `/login`
- Verify the page title reads **"Log in to your account"**
- Verify an email input field is present
- Verify a **"Send magic link"** (or similar) button is present
- Verify a **Google** OAuth button is present
- Verify a link to `/register` is present ("Don't have an account?")
- Do NOT submit the form yet

### 2b — Register
- Navigate to `/register`
- Verify a registration form renders
- Verify a link to `/login` is present

### 2c — Forgot Password
- Navigate to `/forgot-password`
- Verify the password reset form renders

### 2d — Redirects
- Navigate to `/sign-in` — verify it redirects to `/login` (permanent redirect)
- Navigate to `/signup` — verify it redirects to `/register`

### 2e — Auth Guard
- Navigate to `/dashboard` while unauthenticated — verify redirect to `/login?next=/dashboard`
- Navigate to `/cases` while unauthenticated — verify redirect to `/login?next=/cases`
- Navigate to `/settings/profile` while unauthenticated — verify redirect to `/login?next=/settings/profile`

---

## SECTION 3: Authentication Flow

> **If Resend domain is not yet verified, magic links won't arrive. In that case, try Google OAuth or mark this section BLOCKED.**

### 3a — Register a Test Account
- Go to `/register`
- Enter a test email and submit
- Check for the magic link email (or use Google OAuth)
- Complete the auth flow — you should land on `/dashboard`

### 3b — Verify Session
- After logging in, confirm the dashboard loads
- Confirm the URL is `/dashboard` (not redirected away)
- Check that the navigation shows authenticated elements (e.g. user menu, cases link)

---

## SECTION 4: Authenticated Dashboard Pages

> **Requires a logged-in session from Section 3. If blocked, skip and note in report.**

### 4a — Dashboard
- Navigate to `/dashboard`
- Verify the main dashboard renders (welcome message, stats, or case list)
- No console errors

### 4b — Cases
- Navigate to `/cases`
- Verify the cases list page renders (may be empty for a new account)

### 4c — New Case Wizard
- Navigate to `/cases/new`
- Verify the heading reads **"What happened? Let's build your evidence."**
- Verify the case creation form/wizard renders
- Verify company search or input field is present
- Do NOT submit a case (unless you want to test the full flow)

### 4d — Settings Pages
- Navigate to `/settings` — verify it loads and links to sub-sections
- Navigate to `/settings/profile` — verify profile form renders
- Navigate to `/settings/billing` — verify billing/subscription info renders
- Navigate to `/settings/notifications` — verify notification preferences render
- Navigate to `/settings/account` — verify account management renders

### 4e — Pricing (Authenticated)
- Navigate to `/pricing` while logged in
- Verify CTA buttons now say "Upgrade" or "Subscribe" (not "Sign up" / "Register")
- Click a Basic/Pro CTA — verify it initiates a Stripe Checkout redirect (you can cancel immediately; just verify the redirect works)

---

## SECTION 5: Security Headers & Technical Checks

### 5a — Response Headers
Open DevTools → Network tab. Load the homepage and inspect the response headers on the main document request. Verify ALL of these are present:

| Header | Expected Value |
|--------|---------------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(self), geolocation=()` |
| `Content-Security-Policy` | Starts with `default-src 'self'` and includes `script-src`, `connect-src`, `frame-src` directives |

### 5b — CSP Violation Check
- With the Console open, browse through the homepage, pricing, login, and register pages
- Look for any **CSP violation** warnings (e.g. "Refused to load the script..." or "Refused to connect to...")
- If PostHog calls to `eu.i.posthog.com` are blocked, note this — the fix is to add `https://eu.i.posthog.com https://eu-assets.i.posthog.com` to the `connect-src` directive in `vercel.json`

### 5c — HTTPS
- Verify the site is served over HTTPS with a valid certificate
- Verify HTTP requests redirect to HTTPS

### 5d — Favicon
- Verify the browser tab shows a favicon (not the default browser icon)

---

## SECTION 6: SEO & Metadata

### 6a — Sitemap
- Navigate to `https://www.theypromised.app/sitemap.xml`
- Verify it returns valid XML
- Verify it includes at minimum: `/`, `/pricing`, `/how-it-works`, `/about`, `/privacy`, `/terms`, `/escalation-guides`, `/templates`, `/business`

### 6b — Robots.txt
- Navigate to `https://www.theypromised.app/robots.txt`
- Verify it allows: `/`, `/pricing`, `/how-it-works`, `/about`
- Verify it disallows: `/dashboard`, `/cases`, `/settings`, `/api`, `/admin`
- Verify it references the sitemap

### 6c — OG Meta Tags
- On the homepage, inspect the `<head>` for:
  - `<meta property="og:title">` — should contain "TheyPromised"
  - `<meta property="og:description">` — should describe the complaint tracking tool
  - `<meta property="og:image">` — should point to `/og-image.png`
  - `<meta name="twitter:card">` — should be `summary_large_image`

### 6d — Structured Data
- On the pricing page, view page source and search for `application/ld+json`
- Verify the FAQPage schema is present with 6 questions

### 6e — 404 Page
- Navigate to `https://www.theypromised.app/this-page-does-not-exist`
- Verify a custom 404 page renders (not the default Next.js 404)
- Verify the message is on-brand (should mention consumer rights)
- Verify navigation links are present (Go Home, Start a Case, Escalation Guides)

---

## SECTION 7: External Service Integration

### 7a — Stripe (visual only)
- On the pricing page, verify plan CTAs are clickable
- If authenticated: click a plan CTA, verify the Stripe Checkout page loads (then press back / cancel)
- Verify the Stripe.js script loads without CSP errors (check console)

### 7b — PostHog Analytics
- Open DevTools → Network tab
- Filter by "ingest" or "posthog"
- Navigate between 2-3 pages
- Verify PostHog events are firing (requests to `/ingest` or `eu.i.posthog.com`)
- If events are blocked by CSP, note the specific violation

### 7c — Sentry
- Check that the Sentry DSN script is loaded in the page (view source, search for `sentry`)
- No action needed beyond confirming it's present

### 7d — Supabase Connection
- If authenticated: verify that navigating to `/dashboard` and `/cases` loads data (even if empty) without "Failed to fetch" errors
- Check the console for any Supabase connection errors

---

## SECTION 8: Mobile Responsiveness

### 8a — Viewport Resize
- Resize the browser to mobile width (~375px) or use DevTools device emulation (iPhone 14)
- Check these pages at mobile width:
  - Homepage — hero text readable, CTA visible, no horizontal overflow
  - Pricing — plan cards stack vertically, all tiers visible
  - Login — form is usable, not cut off
  - Navigation — hamburger menu or mobile nav works

---

## SECTION 9: Performance Quick Check

### 9a — Core Web Vitals (Optional)
- Open DevTools → Lighthouse tab
- Run a Lighthouse audit on the homepage (Performance, Accessibility, Best Practices, SEO)
- Record the scores (don't need to be perfect, just note anything below 70)

### 9b — Console Cleanliness
- Browse through 5-6 pages
- Note any persistent console errors, warnings, or unhandled promise rejections
- Ignore development-mode warnings if running locally

---

## SECTION 10: Generate Report

Create `BROWSER_SMOKE_REPORT.md` in the repo root with this structure:

```markdown
# Browser Smoke Test Report

**Date:** [today]
**URL:** https://www.theypromised.app
**Browser:** [Chrome version / etc.]
**Tester:** Comet AI

---

## Summary

| Category | Pass | Fail | Blocked | Notes |
|----------|------|------|---------|-------|
| Marketing pages (11) | | | | |
| Auth pages (5) | | | | |
| Auth flow | | | | |
| Dashboard pages (5) | | | | |
| Security headers (4) | | | | |
| CSP violations | | | | |
| SEO & metadata (5) | | | | |
| External services (4) | | | | |
| Mobile responsiveness | | | | |
| **Total** | | | | |

---

## Failures

[For each failure, include: page URL, what was expected, what happened, screenshot if possible]

---

## CSP Violations

[List any Content-Security-Policy violations observed in the console, with the blocked resource and the directive that blocked it]

---

## Blocked Tests

[List any tests that could not be run (e.g. auth not available) and why]

---

## Console Errors

[List any console errors observed across all pages, grouped by page]

---

## Recommendations

[Prioritised list of fixes needed before launch, if any]

---

## Lighthouse Scores (Optional)

| Metric | Score |
|--------|-------|
| Performance | |
| Accessibility | |
| Best Practices | |
| SEO | |
```

**Important:** Be thorough. Every page visit should be recorded. Every console error should be captured. This is the final gate before launch.
