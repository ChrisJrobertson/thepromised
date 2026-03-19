import { NextResponse } from "next/server";

import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

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
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const profile = profileData as Pick<Profile, "stripe_customer_id"> | null;

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const stripe = getStripeClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${appUrl}/settings/billing`,
      });
      return NextResponse.json({ url: session.url });
    } catch (stripeError: unknown) {
      const err = stripeError as { code?: string; message?: string };
      if (err.code === "resource_missing") {
        console.error("[Portal] Stripe customer not found:", profile.stripe_customer_id);
        return NextResponse.json(
          {
            error:
              "Billing account not found in Stripe. This can happen after switching from test to live mode. Please re-subscribe to create a new billing account.",
          },
          { status: 400 }
        );
      }
      throw stripeError;
    }
  } catch (error) {
    console.error("[Portal error]", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
