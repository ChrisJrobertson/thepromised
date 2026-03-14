import Stripe from "stripe";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  appInfo: {
    name: "TheyPromised",
    version: "0.1.0",
  },
});

type GetOrCreateCustomerParams = {
  userId: string;
  email: string;
  name?: string | null;
};

export async function getOrCreateStripeCustomer({
  userId,
  email,
  name,
}: GetOrCreateCustomerParams) {
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: {
      supabase_user_id: userId,
      product: "TheyPromised",
    },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}
