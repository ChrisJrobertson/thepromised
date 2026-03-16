# Stripe Dashboard Settings — Enable Before Launch

These settings must be configured in the Stripe Dashboard at https://dashboard.stripe.com
They cannot be set via code.

---

## Payment Methods (Settings → Payment methods)

- [ ] Enable **Apple Pay**
- [ ] Enable **Google Pay**
- [ ] Enable **Link** (Stripe's one-click checkout — auto-saves card for returning users)
- [ ] Verify these are enabled for **BOTH test and live mode**

> **Why this matters:** The checkout route does not set `payment_method_types`, which
> lets Stripe auto-enable everything you've turned on in the Dashboard. If these aren't
> enabled there, they will silently not appear at checkout.

---

## Apple Pay Domain Verification (Settings → Payment methods → Apple Pay)

- [ ] Add and verify your domain: `theypromised.app`
- [ ] Download the domain verification file from Stripe
- [ ] Host it at: `https://theypromised.app/.well-known/apple-developer-merchantid-domain-association`
- [ ] Verify it resolves correctly before going live

---

## Google Pay

- [ ] No domain verification needed — works automatically once enabled in the Dashboard

---

## Link (One-Click Checkout)

- [ ] No additional setup needed — works automatically once enabled in the Dashboard
- [ ] Returning Link users will see their saved payment details pre-filled

---

## Customer Portal (Settings → Billing → Customer portal)

- [ ] Verify customers can **update payment methods**
- [ ] Verify customers can **switch plans** (Basic ↔ Pro)
- [ ] Verify customers can **cancel** (with a cancellation flow, not instant)
- [ ] Set the return URL to: `https://www.theypromised.app/settings/billing`

---

## Checkout Appearance (Settings → Branding)

- [ ] Upload the TheyPromised logo for the Checkout and Customer Portal pages
- [ ] Set brand colour to match the app (primary blue/teal)
- [ ] Ensure "Powered by Stripe" badge is visible — it builds payment trust

---

## Webhook Endpoint (Developers → Webhooks)

- [ ] Confirm endpoint is registered: `https://www.theypromised.app/api/webhooks/stripe`
- [ ] Confirm the following events are subscribed:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `charge.refunded`
- [ ] Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in your environment

---

## Tax (Settings → Tax)

- [ ] Verify `tax_id_collection` is appropriate for your VAT registration status
- [ ] If not VAT-registered, consider removing `tax_id_collection: { enabled: true }`
  from `src/app/api/stripe/checkout/route.ts`
