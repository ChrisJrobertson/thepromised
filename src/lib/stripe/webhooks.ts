import Stripe from "stripe";

import { STRIPE_PRICE_IDS, type SubscriptionTier } from "@/lib/stripe/config";

const BASIC_PRICE_SET = new Set(
  [STRIPE_PRICE_IDS.basic.monthly, STRIPE_PRICE_IDS.basic.annual].filter(
    (id): id is string => typeof id === "string" && id.length > 0
  )
);

const PRO_PRICE_SET = new Set(
  [STRIPE_PRICE_IDS.pro.monthly, STRIPE_PRICE_IDS.pro.annual].filter(
    (id): id is string => typeof id === "string" && id.length > 0
  )
);

/**
 * Allowlisted plan keys from checkout (e.g. pro_monthly). Used when the active
 * Stripe price ID is not listed in env (common for £1 test prices in production).
 */
export function tierFromPlanMetadata(
  plan: string | null | undefined,
): SubscriptionTier | null {
  if (!plan || typeof plan !== "string") return null;
  if (plan.startsWith("pro_")) return "pro";
  if (plan.startsWith("basic_")) return "basic";
  return null;
}

/**
 * Resolve tier: env-matched price IDs first (canonical for portal plan changes),
 * then subscription metadata `plan` from checkout, else free.
 */
export function getTierFromSubscription(
  subscription: Stripe.Subscription | null,
): SubscriptionTier {
  const activePriceIds =
    subscription?.items.data.map((item) => item.price.id).filter(Boolean) ?? [];

  if (activePriceIds.some((id) => PRO_PRICE_SET.has(id))) return "pro";
  if (activePriceIds.some((id) => BASIC_PRICE_SET.has(id))) return "basic";

  const fromMeta = tierFromPlanMetadata(subscription?.metadata?.plan);
  if (fromMeta) return fromMeta;

  return "free";
}

/** Prefer checkout session metadata when handling `checkout.session.completed`. */
export function getTierForCompletedCheckout(
  session: { metadata?: Stripe.Metadata | null },
  subscription: Stripe.Subscription | null,
): SubscriptionTier {
  return (
    tierFromPlanMetadata(session.metadata?.plan as string | undefined) ??
    getTierFromSubscription(subscription)
  );
}

/**
 * When env price IDs do not match (e.g. £1 test price), fall back to the completed
 * Checkout Session metadata for this subscription (Stripe keeps session metadata).
 */
export async function resolveTierWithCheckoutSessionFallback(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<SubscriptionTier> {
  const fromPricesAndSubMeta = getTierFromSubscription(subscription);
  if (fromPricesAndSubMeta !== "free") return fromPricesAndSubMeta;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) return "free";

  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 20,
  });

  for (const session of sessions.data) {
    if (session.mode !== "subscription" || session.status !== "complete") continue;
    const sessionSubId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    if (sessionSubId !== subscription.id) continue;
    const fromSession = tierFromPlanMetadata(
      session.metadata?.plan as string | undefined,
    );
    if (fromSession) return fromSession;
  }

  return "free";
}
