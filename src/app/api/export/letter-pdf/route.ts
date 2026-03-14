import { NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  letterId: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = inputSchema.parse(json);

    return NextResponse.json({
      letterId: body.letterId,
      status: "queued",
      message:
        "Letter PDF endpoint scaffolded. React PDF renderer integration will be added next.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
