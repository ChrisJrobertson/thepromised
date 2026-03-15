import type Stripe from "stripe";

import { STRIPE_PRICE_IDS, type SubscriptionTier } from "@/lib/stripe/config";

const BASIC_PRICE_SET = new Set([
  STRIPE_PRICE_IDS.basic.monthly,
  STRIPE_PRICE_IDS.basic.annual,
]);

const PRO_PRICE_SET = new Set([
  STRIPE_PRICE_IDS.pro.monthly,
  STRIPE_PRICE_IDS.pro.annual,
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
