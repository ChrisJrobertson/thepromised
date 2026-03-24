# Cursor Prompt 03 — Security & Logic Fixes (4 issues)

> **Scope:** Fix 4 production-critical logic/security issues. Minimal, surgical changes.
> **Run after:** `npm run build` to confirm zero errors.

---

## Issue 1: `changeEmail` redirects to `/auth/callback` — route doesn't exist

**File:** `src/lib/actions/settings.ts` line 91

**Problem:** The `changeEmail` server action sets `emailRedirectTo` to `/auth/callback`, but the actual auth callback route is at `/callback` (see `src/app/(auth)/callback/route.ts`). When a user confirms their email change, Supabase redirects them to a 404.

**Fix:**

```typescript
// BEFORE (line 91)
{ emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback` }

// AFTER
{ emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/callback` }
```

This matches the pattern used everywhere else in the codebase (see `src/lib/supabase/auth.ts` → `getAuthCallbackUrl()` which correctly builds `/callback?next=...`).

---

## Issue 2: Resend webhook skips signature verification when secret is missing

**File:** `src/app/api/webhooks/resend/route.ts`

**Problem:** The current code only verifies the Svix signature `if (secret)` — meaning if `RESEND_WEBHOOK_SECRET` is not set, the webhook accepts ALL requests without any verification. In production this is a security gap: anyone can POST fake delivery events.

**Fix:** Reject requests when the secret is not configured:

```typescript
// BEFORE (around line 13)
const secret = process.env.RESEND_WEBHOOK_SECRET;
if (secret) {
  const wh = new Webhook(secret);
  try {
    wh.verify(body, {

// AFTER
const secret = process.env.RESEND_WEBHOOK_SECRET;
if (!secret) {
  console.error("[Resend webhook] RESEND_WEBHOOK_SECRET is not set — rejecting request.");
  return new Response("Webhook secret not configured", { status: 500 });
}

const wh = new Webhook(secret);
try {
  wh.verify(body, {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  });
} catch {
  return new Response("Invalid webhook signature", { status: 401 });
}
```

Remove the outer `if (secret) {` wrapper — verification is now always required. The rest of the function body (after signature check) remains unchanged.

---

## Issue 3: Inbound email webhook skips signature verification when secret is missing

**File:** `src/app/api/webhooks/inbound-email/route.ts`

**Problem:** Same pattern as the Resend webhook — `if (secret)` means no verification when the env var is missing.

**Fix:** Same approach — reject when secret is not configured:

```typescript
// BEFORE (around line 18)
const secret = process.env.RESEND_WEBHOOK_SECRET;
if (secret) {
  const rawBody = await request.text();
  const wh = new Webhook(secret);
  // ...
  return handleInboundEmail(newRequest);
}
return handleInboundEmail(request);

// AFTER
const secret = process.env.RESEND_WEBHOOK_SECRET;
if (!secret) {
  console.error("[Inbound email webhook] RESEND_WEBHOOK_SECRET is not set — rejecting request.");
  return new Response("Webhook secret not configured", { status: 500 });
}

const rawBody = await request.text();
const wh = new Webhook(secret);
try {
  wh.verify(rawBody, {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  });
} catch {
  return new Response("Invalid webhook signature", { status: 401 });
}

const newRequest = new Request(request.url, {
  method: "POST",
  headers: request.headers,
  body: rawBody,
});
return handleInboundEmail(newRequest);
```

Remove the `return handleInboundEmail(request);` fallback at the end — every request must now be verified.

---

## Issue 4: Stripe `subscription.status` spelling mismatch

**File:** `src/app/api/webhooks/stripe/route.ts` — `updateProfileFromSubscriptionEvent` function

**Problem:** Stripe sends `status: "canceled"` (US spelling). The code casts this directly:
```typescript
const status = subscription.status as "active" | "cancelled" | "past_due" | "trialing";
```

But the database constraint and the rest of the codebase use `"cancelled"` (UK spelling). If Stripe sends `"canceled"`, the DB write may violate a CHECK constraint or store an inconsistent value.

**Fix:** Normalise the status before writing:

```typescript
// BEFORE (around line 50 in the function)
const status = subscription.status as
  | "active"
  | "cancelled"
  | "past_due"
  | "trialing";

// AFTER
const rawStatus = subscription.status;
const status = rawStatus === "canceled" ? "cancelled" : (rawStatus as
  | "active"
  | "cancelled"
  | "past_due"
  | "trialing");
```

This normalises Stripe's `"canceled"` to the UK `"cancelled"` that your database expects, while passing through all other statuses unchanged.

---

## Verification

After all 4 fixes:

```bash
npm run build    # Must pass with zero errors
npm run test     # Must still pass (no regression)
```

Then manually verify:
1. `RESEND_WEBHOOK_SECRET` is set in Vercel production environment
2. Grep for any other occurrences of `/auth/callback` — there should be none after the fix:
   ```bash
   grep -r "/auth/callback" src/
   ```
