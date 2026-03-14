import Stripe from "stripe";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) return stripeClient;

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
    appInfo: {
      name: "TheyPromised",
      version: "0.1.0",
    },
  });

  return stripeClient;
}

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
  const { data: profileData } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  const profile = profileData as Pick<Profile, "stripe_customer_id"> | null;

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const stripe = getStripeClient();
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
