import Stripe from "stripe";

/** Only retry without `customer` when Stripe says the customer ID itself is missing (e.g. test/live mismatch). */
function isStaleCheckoutCustomerMissing(
  error: unknown,
  params: Stripe.Checkout.SessionCreateParams
): error is Stripe.errors.StripeError {
  if (!params.customer) return false;
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  const stripeError = error as Stripe.errors.StripeError;
  if (stripeError.code !== "resource_missing") return false;
  const param = stripeError.param ?? "";
  return param === "customer" || param.startsWith("customer");
}

/**
 * Retries checkout without a stale customer ID so live-mode Stripe can create
 * a fresh customer from the supplied email.
 */
export async function createCheckoutSessionWithCustomerRecovery(
  stripe: Stripe,
  params: Stripe.Checkout.SessionCreateParams
) {
  try {
    return await stripe.checkout.sessions.create(params);
  } catch (error) {
    if (isStaleCheckoutCustomerMissing(error, params)) {
      console.warn(
        "[Stripe Checkout] Stored customer not found, creating new customer:",
        params.customer
      );

      const paramsWithoutCustomer: Stripe.Checkout.SessionCreateParams = {
        ...params,
      };
      delete paramsWithoutCustomer.customer;

      const metadataEmail = params.metadata?.userEmail;
      const email =
        typeof params.customer_email === "string"
          ? params.customer_email
          : typeof metadataEmail === "string"
            ? metadataEmail
            : undefined;

      return await stripe.checkout.sessions.create({
        ...paramsWithoutCustomer,
        ...(email ? { customer_email: email } : {}),
      });
    }

    throw error;
  }
}
