import Stripe from "stripe";

function isStripeResourceMissing(error: unknown): error is Stripe.errors.StripeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "resource_missing"
  );
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
    if (isStripeResourceMissing(error) && params.customer) {
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
