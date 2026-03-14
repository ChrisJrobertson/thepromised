import { NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  price_id: z.string().min(1),
  billing_period: z.enum(["monthly", "annual"]).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = inputSchema.parse(json);

    return NextResponse.json({
      status: "queued",
      message: "Stripe checkout route scaffolded.",
      request: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
