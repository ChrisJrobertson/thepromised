/**
 * PART 1 — Checkout Flow Audit (recorded 2026-03-16)
 *
 * SUBSCRIPTION CHECKOUT PARAMETERS (stripe.checkout.sessions.create):
 *   mode                      "subscription"
 *   customer                  Stripe customer ID (pre-creates or retrieves); email already
 *                             attached to the customer record so Stripe pre-fills it.
 *                             customer_email must NOT be set when customer is set.
 *   payment_method_types      NOT set → Stripe auto-enables all Dashboard-active methods
 *                             (Apple Pay, Google Pay, Link). ✓ No change needed.
 *   billing_address_collection "required" → CHANGED to "auto" (only collect when necessary).
 *   allow_promotion_codes     true ✓
 *   tax_id_collection         enabled ✓
 *   success_url               Was: /settings/billing?session_id=... (always)
 *                             Now:  if returnPath supplied → returnPath?upgraded=true
 *                                   otherwise              → /settings/billing?session_id=...
 *   cancel_url                /pricing ✓
 *
 * ADDITIONAL CHANGES:
 *   - Input now accepts { tier, period } as an alternative to { priceId } so the paywall
 *     modal can trigger checkout without knowing the private price ID client-side.
 *   - Optional returnPath lets callers specify the post-checkout landing page
 *     (e.g. /cases/<id>?upgraded=true) without hard-coding it in this route.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import { getOrCreateStripeCustomer, getStripeClient } from "@/lib/stripe/client";
import { STRIPE_PRICE_IDS, getPriceId } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";

// A safe relative path: must start with / and not with // (open-redirect guard)
const relativePathSchema = z
  .string()
  .regex(/^\/[^/]/, "returnPath must be a relative path starting with /")
  .max(200)
  .optional();

const inputSchema = z
  .object({
    // Explicit price ID (used by the pricing page)
    priceId: z.string().min(1).optional(),
    // Tier + period shorthand (used by paywall modals — keeps price IDs server-side)
    tier: z.enum(["basic", "pro"]).optional(),
    period: z.enum(["monthly", "annual"]).default("monthly"),
    // Where to land after successful checkout. Omit to keep the default billing page flow.
    returnPath: relativePathSchema,
  })
  .refine((d) => d.priceId || d.tier, {
    message: "Either priceId or tier must be provided",
  });

const ALLOWED_PRICE_IDS = new Set(
  [
    STRIPE_PRICE_IDS.basic.monthly,
    STRIPE_PRICE_IDS.basic.annual,
    STRIPE_PRICE_IDS.pro.monthly,
    STRIPE_PRICE_IDS.pro.annual,
  ].filter(Boolean),
);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = inputSchema.parse(json);

    // Resolve price ID — either from the explicit field or from tier+period
    let priceId: string;
    if (parsed.priceId) {
      priceId = parsed.priceId;
    } else {
      priceId = getPriceId(parsed.tier!, parsed.period);
    }

    if (!ALLOWED_PRICE_IDS.has(priceId)) {
      return NextResponse.json(
        { error: "Invalid price selected" },
        { status: 400 }
      );
    }

    const customerId = await getOrCreateStripeCustomer({
      userId: user.id,
      email: user.email ?? "",
      name: user.user_metadata.full_name ?? undefined,
    });

    const stripe = getStripeClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

    // Build success URL: caller-specified return path takes priority so the
    // user lands directly back on their case/dashboard after checkout.
    const successUrl = parsed.returnPath
      ? `${appUrl}${parsed.returnPath}?upgraded=true`
      : `${appUrl}/settings/billing?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // customer already has email attached — do NOT also pass customer_email
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: `${appUrl}/pricing`,
      metadata: { supabase_user_id: user.id },
      allow_promotion_codes: true,
      // "auto" only requests billing address when required for tax/payment method
      billing_address_collection: "auto",
      tax_id_collection: { enabled: true },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[Checkout error]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
