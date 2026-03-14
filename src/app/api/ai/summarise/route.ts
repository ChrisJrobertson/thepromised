import { NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().min(1).max(10_000),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = inputSchema.parse(json);

    const summary = body.text.split(".")[0]?.slice(0, 160) ?? body.text.slice(0, 160);

    return NextResponse.json({
      summary,
      message:
        "Summary route scaffolded. Claude Haiku integration and credit tracking are next.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
