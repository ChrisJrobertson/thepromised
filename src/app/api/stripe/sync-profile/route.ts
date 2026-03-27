import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { resolveTierWithCheckoutSessionFallback } from "@/lib/stripe/webhooks";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * Re-read the active Stripe subscription and align `profiles` (tier, ids).
 * Fixes cases where webhooks stored `free` because the live price ID was not in env.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select(
        "stripe_customer_id, subscription_id, subscription_tier, subscription_status",
      )
      .eq("id", user.id)
      .maybeSingle();

    const profile = profileData as Pick<
      Profile,
      | "stripe_customer_id"
      | "subscription_id"
      | "subscription_tier"
      | "subscription_status"
    > | null;

    if (!profile?.stripe_customer_id && !profile?.subscription_id) {
      return NextResponse.json(
        { error: "No Stripe subscription is linked to this account yet." },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    let subscription: Stripe.Subscription | null = null;

    if (profile.subscription_id) {
      try {
        subscription = await stripe.subscriptions.retrieve(
          profile.subscription_id,
        );
      } catch {
        subscription = null;
      }
    }

    if (!subscription && profile.stripe_customer_id) {
      const { data } = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 1,
      });
      subscription = data[0] ?? null;
      if (!subscription) {
        const trialing = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: "trialing",
          limit: 1,
        });
        subscription = trialing.data[0] ?? null;
      }
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "No active or trialing subscription found in Stripe." },
        { status: 404 },
      );
    }

    const tier = await resolveTierWithCheckoutSessionFallback(
      stripe,
      subscription,
    );

    const rawStatus = subscription.status;
    const subscriptionStatus =
      rawStatus === "canceled"
        ? "cancelled"
        : (rawStatus as Profile["subscription_status"]);

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_tier: tier,
        subscription_status: subscriptionStatus,
        subscription_id: subscription.id,
        stripe_customer_id: customerId ?? profile.stripe_customer_id,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[sync-profile]", updateError);
      return NextResponse.json(
        { error: "Could not update your profile." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      tier,
      subscription_status: subscriptionStatus,
    });
  } catch (error) {
    console.error("[sync-profile]", error);
    return NextResponse.json(
      { error: "Failed to sync with Stripe." },
      { status: 500 },
    );
  }
}
