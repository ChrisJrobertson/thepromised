import { NextResponse } from "next/server";

import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function POST() {
  const supabase = await createClient();

  try {
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

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("[Portal error]", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const stripeError =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: string })
        : null;

    if (stripeError?.code === "resource_missing") {
      console.error(
        "[Stripe Portal] Customer not found in current Stripe mode:",
        errMsg
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: null })
          .eq("id", user.id);
      }

      return NextResponse.json(
        {
          error:
            "Your billing account needs to be reconnected. Please visit the pricing page to reactivate your subscription.",
          action: "resubscribe",
        },
        { status: 400 }
      );
    }

    const looksLikePortalConfig =
      /portal|customer portal|billing portal|configuration/i.test(errMsg);
    return NextResponse.json(
      {
        error: looksLikePortalConfig
          ? "Customer portal isn’t set up in live Stripe. In the Stripe Dashboard go to Settings → Billing → Customer portal, publish a configuration, then try again."
          : "Failed to create portal session",
      },
      { status: 500 }
    );
  }
}
