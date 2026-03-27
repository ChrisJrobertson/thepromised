import Stripe from "stripe";

/**
 * True when Stripe rejected a `customer` id (wrong mode, deleted customer, etc.).
 * Covers `resource_missing` and other invalid_request errors scoped to `customer`.
 */
export function isStaleStripeCustomerError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as Stripe.errors.StripeError;
  const param = e.param ?? "";
  const aboutCustomer =
    param === "customer" || param.startsWith("customer");
  if (!aboutCustomer) return false;

  if (e.code === "resource_missing") return true;
  if (e.type === "StripeInvalidRequestError") return true;

  return false;
}
