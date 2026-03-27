import Stripe from "stripe";

import { isStaleStripeCustomerError } from "@/lib/stripe/stale-customer";

export type CheckoutRecoveryOptions = {
  /** Called after a successful retry without the stored customer id (e.g. clear Supabase `stripe_customer_id`). */
  onStaleCustomerRecovered?: (staleCustomerId: string) => Promise<void>;
};

function shouldRetryCheckoutWithoutCustomer(
  error: unknown,
  params: Stripe.Checkout.SessionCreateParams
): error is Stripe.errors.StripeError {
  if (!params.customer) return false;
  return isStaleStripeCustomerError(error);
}

/**
 * Retries checkout without a stale customer ID so live-mode Stripe can create
 * a fresh customer from the supplied email.
 */
export async function createCheckoutSessionWithCustomerRecovery(
  stripe: Stripe,
  params: Stripe.Checkout.SessionCreateParams,
  options?: CheckoutRecoveryOptions
) {
  try {
    return await stripe.checkout.sessions.create(params);
  } catch (error) {
    if (shouldRetryCheckoutWithoutCustomer(error, params)) {
      const staleId =
        typeof params.customer === "string" ? params.customer : "";
      console.warn(
        "[Stripe Checkout] Retrying without stale customer:",
        staleId,
        (error as Stripe.errors.StripeError).code,
        (error as Stripe.errors.StripeError).message
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

      const session = await stripe.checkout.sessions.create({
        ...paramsWithoutCustomer,
        ...(email ? { customer_email: email } : {}),
      });

      if (staleId && options?.onStaleCustomerRecovered) {
        await options.onStaleCustomerRecovered(staleId);
      }

      return session;
    }

    throw error;
  }
}
