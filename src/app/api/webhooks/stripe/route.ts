import { addMonths } from "date-fns";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { getTierFromSubscription } from "@/lib/stripe/webhooks";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Use Supabase server client — webhook endpoints bypass RLS via service-role
// Since we're in a webhook we trust the Stripe signature but we operate as the
// specific user (find by ID/customer), so standard server client is fine.

export async function POST(request: Request) {
  const payload = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing webhook signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      // ── New subscription / checkout completed ──────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (!userId) break;

        const stripe = getStripeClient();
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const tier = getTierFromSubscription(subscription);
        const now = new Date();

        await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
            subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            ai_credits_used: 0,
            ai_credits_reset_at: addMonths(now, 1).toISOString(),
          })
          .eq("id", userId);

        trackServerEvent(userId, "subscription_started", { tier });

        // Send welcome/confirmation email (imported lazily to avoid import issues)
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", userId)
            .maybeSingle();
          if (profileData) {
            const { sendSubscriptionConfirm } = await import("@/lib/email/send");
            if (tier !== "free") {
              await sendSubscriptionConfirm(
                (profileData as { email: string; full_name: string | null }).email,
                (profileData as { email: string; full_name: string | null }).full_name ?? "there",
                tier
              );
            }
          }
        } catch {
          // Email failure should not fail the webhook
        }

        break;
      }

      // ── Subscription updated ───────────────────────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const tier = getTierFromSubscription(subscription);

        const status = subscription.status as
          | "active"
          | "cancelled"
          | "past_due"
          | "trialing";

        await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: status,
          })
          .eq("subscription_id", subscription.id);

        break;
      }

      // ── Subscription cancelled ─────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "cancelled",
            subscription_id: null,
          })
          .eq("subscription_id", subscription.id);

        break;
      }

      // ── Payment failed ─────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("stripe_customer_id", customerId);
        }

        break;
      }

      // ── Invoice paid / subscription renewed ───────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (!customerId) break;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("ai_credits_reset_at")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        const profile = profileData as {
          ai_credits_reset_at: string | null;
        } | null;
        const now = new Date();
        const shouldReset =
          !profile?.ai_credits_reset_at ||
          new Date(profile.ai_credits_reset_at) < now;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            ...(shouldReset
              ? {
                  ai_credits_used: 0,
                  ai_credits_reset_at: addMonths(now, 1).toISOString(),
                }
              : {}),
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      default:
        // Return 200 for unhandled events — Stripe retries on non-2xx
        break;
    }
  } catch (handlerError) {
    console.error(`[Webhook ${event.type}]`, handlerError);
    // Still return 200 to prevent Stripe retries for transient errors
  }

  return NextResponse.json({ received: true });
}
