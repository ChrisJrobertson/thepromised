import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getOrCreateStripeCustomer, getStripeClient } from "@/lib/stripe/client";
import { STRIPE_PRICE_IDS } from "@/lib/stripe/config";
import { createCheckoutSessionWithCustomerRecovery } from "@/lib/stripe/checkout";
import { createClient } from "@/lib/supabase/server";

// Allowlisted plan identifiers — client sends one of these, never a raw price ID
const PLAN_TO_PRICE_ID: Record<string, string | undefined> = {
  basic_monthly: STRIPE_PRICE_IDS.basic.monthly,
  basic_annual: STRIPE_PRICE_IDS.basic.annual,
  pro_monthly: STRIPE_PRICE_IDS.pro.monthly,
  pro_annual: STRIPE_PRICE_IDS.pro.annual,
};

const ALLOWED_PLANS = new Set(Object.keys(PLAN_TO_PRICE_ID));

const inputSchema = z.object({
  plan: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_id, subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    const billingProfile = profileRow as {
      stripe_customer_id: string | null;
      subscription_id: string | null;
      subscription_status: string | null;
    } | null;

    const subStatus = billingProfile?.subscription_status;
    const hasOngoingStripeSubscription =
      Boolean(billingProfile?.stripe_customer_id) &&
      Boolean(billingProfile?.subscription_id) &&
      (subStatus === "active" ||
        subStatus === "trialing" ||
        subStatus === "past_due");

    if (hasOngoingStripeSubscription) {
      return NextResponse.json(
        {
          error:
            "You have an active subscription. Use the billing portal in Settings to manage or change your plan.",
        },
        { status: 400 }
      );
    }

    const json = await request.json();
    const { plan } = inputSchema.parse(json);

    // Validate plan against allowlist
    if (!ALLOWED_PLANS.has(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Resolve price ID server-side — never trust the client to send this
    const priceId = PLAN_TO_PRICE_ID[plan];
    if (!priceId) {
      console.error(`[Checkout] Price ID not configured for plan: ${plan}`);
      return NextResponse.json(
        { error: "Checkout is not available for this plan. Please contact support." },
        { status: 503 }
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

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      customer: customerId,
      customer_email: user.email ?? undefined,
      metadata: {
        supabase_user_id: user.id,
        userId: user.id,
        userEmail: user.email ?? "",
        plan,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          userId: user.id,
        },
      },
    };

    const session = await createCheckoutSessionWithCustomerRecovery(
      stripe,
      sessionParams
    );

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
