import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { getOrCreateStripeCustomer, getStripeClient } from "@/lib/stripe/client";
import { STRIPE_PRICE_IDS } from "@/lib/stripe/config";
import { createCheckoutSessionWithCustomerRecovery } from "@/lib/stripe/checkout";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  priceId: z.string().min(1),
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
    const { priceId } = inputSchema.parse(json);

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
