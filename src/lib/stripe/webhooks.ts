import type Stripe from "stripe";

import { STRIPE_PRICE_IDS, type SubscriptionTier } from "@/lib/stripe/config";

const BASIC_PRICE_SET = new Set([
  STRIPE_PRICE_IDS.basicMonthly,
  STRIPE_PRICE_IDS.basicAnnual,
]);

const PRO_PRICE_SET = new Set([
  STRIPE_PRICE_IDS.proMonthly,
  STRIPE_PRICE_IDS.proAnnual,
]);

export function getTierFromSubscription(
  subscription: Stripe.Subscription | null,
): SubscriptionTier {
  const activePriceIds =
    subscription?.items.data.map((item) => item.price.id).filter(Boolean) ?? [];

  if (activePriceIds.some((id) => PRO_PRICE_SET.has(id))) return "pro";
  if (activePriceIds.some((id) => BASIC_PRICE_SET.has(id))) return "basic";
  return "free";
}
