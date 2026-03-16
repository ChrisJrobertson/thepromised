import { NextResponse } from "next/server";
import { z } from "zod";

import { COMPLAINT_PACKS_BY_ID } from "@/lib/packs/config";
import { getOrCreateStripeCustomer, getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  packId: z.string().min(1),
  caseId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = inputSchema.parse(await request.json());
    const pack = COMPLAINT_PACKS_BY_ID.get(body.packId);

    if (!pack) {
      return NextResponse.json({ error: "Invalid pack selected" }, { status: 400 });
    }

    if (body.caseId) {
      const { data: caseRow } = await supabase
        .from("cases")
        .select("id")
        .eq("id", body.caseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!caseRow) {
        return NextResponse.json(
          { error: "Selected case was not found" },
          { status: 404 },
        );
      }
    }

    const customerId = await getOrCreateStripeCustomer({
      userId: user.id,
      email: user.email ?? "",
      name: user.user_metadata.full_name ?? null,
    });

    const stripe = getStripeClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: pack.name,
              description: pack.description,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/packs/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/packs`,
      metadata: {
        userId: user.id,
        packId: pack.id,
        caseId: body.caseId ?? "",
      },
      client_reference_id: user.id,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[Pack checkout]", error);
    return NextResponse.json(
      { error: "Could not start pack checkout" },
      { status: 500 },
    );
  }
}
