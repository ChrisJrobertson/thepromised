import { addMonths } from "date-fns";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { getTierFromSubscription } from "@/lib/stripe/webhooks";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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

  const supabase = createServiceRoleClient();

  async function updateProfileFromSubscriptionEvent(
    subscription: Stripe.Subscription
  ) {
    const tier = getTierFromSubscription(subscription);
    const rawStatus = subscription.status;
    const status =
      rawStatus === "canceled"
        ? "cancelled"
        : (rawStatus as "active" | "cancelled" | "past_due" | "trialing");
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
    const userId =
      subscription.metadata?.supabase_user_id ?? subscription.metadata?.userId;

    const updatePayload = {
      subscription_tier: tier,
      subscription_status: status,
      subscription_id: subscription.id,
      stripe_customer_id: customerId ?? null,
    };

    const { data: updatedBySubscription, error: updateBySubscriptionError } =
      await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("subscription_id", subscription.id)
        .select("id");

    if (updateBySubscriptionError) {
      throw updateBySubscriptionError;
    }

    if (updatedBySubscription.length > 0) {
      return {
        profileId: updatedBySubscription[0].id,
        status,
        tier,
      };
    }

    if (customerId) {
      const { data: updatedByCustomer, error: updateByCustomerError } =
        await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("stripe_customer_id", customerId)
          .select("id");

      if (updateByCustomerError) {
        throw updateByCustomerError;
      }

      if (updatedByCustomer.length > 0) {
        return {
          profileId: updatedByCustomer[0].id,
          status,
          tier,
        };
      }
    }

    if (userId) {
      const { data: updatedByUser, error: updateByUserError } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId)
        .select("id");

      if (updateByUserError) {
        throw updateByUserError;
      }

      if (updatedByUser.length > 0) {
        return {
          profileId: updatedByUser[0].id,
          status,
          tier,
        };
      }
    }

    console.warn("[Stripe webhook] No profile matched subscription update", {
      customerId,
      subscriptionId: subscription.id,
      userId,
    });

    return { profileId: null, status, tier };
  }

  try {
    switch (event.type) {
      // ── New subscription / checkout completed ──────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          const userId = session.metadata?.userId;
          const packId = session.metadata?.packId;
          const caseId = session.metadata?.caseId;
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null;

          if (!userId || !packId) break;

          if (typeof session.customer === "string") {
            await supabase
              .from("profiles")
              .update({ stripe_customer_id: session.customer })
              .eq("id", userId);
          }

          const { data: existingBySession } = await supabase
            .from("complaint_packs")
            .select("id")
            .eq("checkout_session_id", session.id)
            .maybeSingle();

          if (existingBySession) break;

          if (paymentIntentId) {
            const { data: existingByPayment } = await supabase
              .from("complaint_packs")
              .select("id")
              .eq("stripe_payment_id", paymentIntentId)
              .maybeSingle();
            if (existingByPayment) break;
          }

          const entitlementExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString();

          const { data: insertedPack } = await supabase
            .from("complaint_packs")
            .insert({
              user_id: userId,
              case_id: caseId ? caseId : null,
              entitlement_case_id: caseId ? caseId : null,
              entitlement_expires_at: entitlementExpiresAt,
              checkout_session_id: session.id,
              pack_type: packId,
              status: "purchased",
              stripe_payment_id: paymentIntentId,
              amount_paid: session.amount_total ?? 0,
              currency: session.currency ?? "gbp",
              purchased_at: new Date().toISOString(),
            })
            .select("id")
            .maybeSingle();

          const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", userId)
            .maybeSingle();

          if (profile?.subscription_tier === "free") {
            await supabase
              .from("profiles")
              .update({
                subscription_tier: "pro",
                subscription_status: "pack_temporary",
                pack_pro_expires_at: entitlementExpiresAt,
                pack_access_case_id: caseId ? caseId : null,
                pack_source_pack_id: insertedPack?.id ?? null,
              })
              .eq("id", userId);
          }

          // Send pack purchase confirmation email (fire-and-forget).
          try {
            const { data: packProfile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", userId)
              .maybeSingle();
            if (packProfile) {
              const expiryFormatted = new Date(entitlementExpiresAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const { sendPackPurchaseConfirm } = await import("@/lib/email/send");
              await sendPackPurchaseConfirm(
                (packProfile as { email: string; full_name: string | null }).email,
                (packProfile as { email: string; full_name: string | null }).full_name ?? "there",
                (packId as import("@/lib/email/templates/PackPurchaseConfirmEmail").PackType),
                expiryFormatted,
                session.amount_total ?? 0,
                caseId ?? undefined
              );
            }
          } catch {
            // Email failure must not fail the webhook.
          }

          break;
        }

        const userId =
          session.metadata?.supabase_user_id ?? session.metadata?.userId;
        if (!userId) break;

        const stripe = getStripeClient();
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const tier = getTierFromSubscription(subscription);
        const now = new Date();

        const { error: checkoutUpdateError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
            subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            ai_credits_used: 0,
            ai_credits_reset_at: addMonths(now, 1).toISOString(),
            pack_pro_expires_at: null,
            pack_access_case_id: null,
            pack_source_pack_id: null,
          })
          .eq("id", userId);

        if (checkoutUpdateError) {
          console.error("Failed to update profile after checkout:", checkoutUpdateError);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        trackServerEvent(userId, "subscription_upgraded", {
          tier,
          subscription_id: subscription.id,
        });

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
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const { profileId, status, tier } =
          await updateProfileFromSubscriptionEvent(subscription);

        if (event.type === "customer.subscription.updated" && profileId) {
          trackServerEvent(profileId, "subscription_updated", {
            tier,
            status,
            subscription_id: subscription.id,
          });
        }

        break;
      }

      // ── Subscription cancelled ─────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Fetch profile (including tier/email) BEFORE downgrading to free.
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("id, email, full_name, subscription_tier")
          .eq("subscription_id", subscription.id)
          .maybeSingle();

        const { error: subscriptionDeleteError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "cancelled",
            subscription_id: null,
            pack_pro_expires_at: null,
            pack_access_case_id: null,
            pack_source_pack_id: null,
          })
          .eq("subscription_id", subscription.id);

        if (subscriptionDeleteError) {
          console.error(
            "Failed to update profile after subscription delete:",
            subscriptionDeleteError
          );
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        if (profileRow?.id) {
          trackServerEvent(profileRow.id, "subscription_cancelled", {
            subscription_id: subscription.id,
          });

          // Send cancellation email (fire-and-forget).
          try {
            const row = profileRow as {
              id: string;
              email: string;
              full_name: string | null;
              subscription_tier: string | null;
            };
            const tierName =
              row.subscription_tier === "pro" ? "Pro" : "Basic";
            const { sendSubscriptionCancelled } = await import("@/lib/email/send");
            await sendSubscriptionCancelled(
              row.email,
              row.full_name ?? "there",
              tierName
            );
          } catch {
            // Email failure must not fail the webhook.
          }
        }

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
          const { error: paymentFailedUpdateError } = await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("stripe_customer_id", customerId);

          if (paymentFailedUpdateError) {
            console.error(
              "Failed to update profile after payment failure:",
              paymentFailedUpdateError
            );
            return NextResponse.json(
              { error: "Database update failed" },
              { status: 500 }
            );
          }
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

        const { error: invoicePaidUpdateError } = await supabase
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

        if (invoicePaidUpdateError) {
          console.error(
            "Failed to update profile after invoice paid:",
            invoicePaidUpdateError
          );
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        break;
      }

      // ── Payment refunded (one-off pack support) ────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : null;
        if (!paymentIntentId) break;

        const { data: refundedPack } = await supabase
          .from("complaint_packs")
          .select("id, user_id")
          .eq("stripe_payment_id", paymentIntentId)
          .maybeSingle();
        if (!refundedPack) break;

        await supabase
          .from("complaint_packs")
          .update({
            status: "refunded",
            notes: "Marked refunded via Stripe webhook (charge.refunded).",
          })
          .eq("id", refundedPack.id);

        // If this refunded pack was the active temporary source, revert access.
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "active",
            pack_pro_expires_at: null,
            pack_access_case_id: null,
            pack_source_pack_id: null,
          })
          .eq("id", refundedPack.user_id)
          .eq("subscription_status", "pack_temporary")
          .eq("pack_source_pack_id", refundedPack.id);

        break;
      }

      default:
        // Return 200 for unhandled events — Stripe retries on non-2xx
        break;
    }
  } catch (handlerError) {
    console.error(`[Webhook ${event.type}]`, handlerError);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
