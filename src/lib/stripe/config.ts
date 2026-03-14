export const STRIPE_PRICE_IDS = {
  basicMonthly: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY ?? "",
  basicAnnual: process.env.STRIPE_PRICE_ID_BASIC_ANNUAL ?? "",
  proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? "",
  proAnnual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL ?? "",
} as const;

export type SubscriptionTier = "free" | "basic" | "pro";
