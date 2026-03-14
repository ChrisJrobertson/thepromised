import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getStripeClient } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const payload = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    return NextResponse.json({ received: true, eventType: event.type });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
