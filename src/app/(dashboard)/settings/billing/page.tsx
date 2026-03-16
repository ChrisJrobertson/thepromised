import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { AI_LIMITS } from "@/lib/ai/client";
import type { Profile } from "@/types/database";

import { BillingClient } from "./BillingClient";

export const metadata = { title: "Billing" };

type Invoice = {
  id: string;
  number: string | null;
  amount_paid: number;
  currency: string;
  status: string | null;
  created: number;
  hosted_invoice_url: string | null;
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) redirect("/login");
  const profile = profileData as Profile;

  // Fetch invoices if customer exists
  let invoices: Invoice[] = [];
  let nextBillingDate: string | null = null;

  if (profile.stripe_customer_id) {
    try {
      const stripe = getStripeClient();

      // Get invoices
      const stripeInvoices = await stripe.invoices.list({
        customer: profile.stripe_customer_id,
        limit: 10,
      });

      invoices = stripeInvoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        amount_paid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        created: inv.created,
        hosted_invoice_url: inv.hosted_invoice_url ?? null,
      }));

      // Get subscription for next billing date
      if (profile.subscription_id) {
        const subscription = await stripe.subscriptions.retrieve(
          profile.subscription_id
        );
        const subData = subscription as unknown as { current_period_end: number };
        nextBillingDate = new Date(
          subData.current_period_end * 1000
        ).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch {
      // Stripe errors shouldn't break the page
    }
  }

  const tier = profile.subscription_tier;
  const aiLimit = AI_LIMITS[tier].suggestions + AI_LIMITS[tier].letters;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Billing & Subscription</h2>
          {sp.session_id && (
            <p className="mt-1 text-sm text-green-600 font-medium">
              Subscription activated successfully!
            </p>
          )}
        </div>
      </div>

      <BillingClient
        aiCreditsUsed={profile.ai_credits_used}
        aiCreditsLimit={aiLimit}
        invoices={invoices}
        nextBillingDate={nextBillingDate}
        hasStripeCustomer={!!profile.stripe_customer_id}
        subscriptionStatus={profile.subscription_status}
        tier={tier}
      />
    </div>
  );
}
