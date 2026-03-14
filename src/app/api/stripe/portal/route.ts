import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "queued",
    message: "Stripe customer portal route scaffolded.",
  });
}
