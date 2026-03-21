/** Subscription prices — env names must match Vercel exactly. */
export const STRIPE_PRICE_IDS = {
  basic: {
    monthly: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY,
    annual: process.env.STRIPE_PRICE_ID_BASIC_ANNUAL,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    annual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL,
  },
} as const;

/**
 * One-off pack prices — different naming convention from subscriptions;
 * must match Vercel (`STRIPE_PRICE_COMPLAINT_STARTER`, etc.).
 */
export const STRIPE_PACK_PRICE_IDS = {
  "starter-pack": process.env.STRIPE_PRICE_COMPLAINT_STARTER,
  "escalation-pack": process.env.STRIPE_PRICE_ESCALATION_PACK,
  "full-case-pack": process.env.STRIPE_PRICE_FULL_CASE_PACK,
} as const;

export function getPackStripePriceId(packId: string): string | undefined {
  if (!(packId in STRIPE_PACK_PRICE_IDS)) return undefined;
  const raw =
    STRIPE_PACK_PRICE_IDS[packId as keyof typeof STRIPE_PACK_PRICE_IDS];
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

export type SubscriptionTier = "free" | "basic" | "pro";

export const PLAN_PRICES = {
  basic: {
    monthly: 4.99,
    annual: 39.99,
    annualMonthlyEquivalent: 3.33,
    annualSavingPercent: 33,
  },
  pro: {
    monthly: 9.99,
    annual: 79.99,
    annualMonthlyEquivalent: 6.67,
    annualSavingPercent: 33,
  },
} as const;

export type BillingPeriod = "monthly" | "annual";

export function getPriceId(
  tier: "basic" | "pro",
  period: BillingPeriod
): string | undefined {
  const raw =
    tier === "basic"
      ? period === "monthly"
        ? STRIPE_PRICE_IDS.basic.monthly
        : STRIPE_PRICE_IDS.basic.annual
      : period === "monthly"
        ? STRIPE_PRICE_IDS.pro.monthly
        : STRIPE_PRICE_IDS.pro.annual;
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}
