export const STRIPE_PRICE_IDS = {
  basicMonthly: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY ?? "",
  basicAnnual: process.env.STRIPE_PRICE_ID_BASIC_ANNUAL ?? "",
  proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? "",
  proAnnual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL ?? "",
} as const;

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

export function getPriceId(tier: "basic" | "pro", period: BillingPeriod): string {
  if (tier === "basic") {
    return period === "monthly"
      ? STRIPE_PRICE_IDS.basicMonthly
      : STRIPE_PRICE_IDS.basicAnnual;
  }
  return period === "monthly"
    ? STRIPE_PRICE_IDS.proMonthly
    : STRIPE_PRICE_IDS.proAnnual;
}
