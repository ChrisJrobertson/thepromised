import { NextResponse } from "next/server";
import { z } from "zod";

import { AI_PROMPTS } from "@/lib/ai/prompts";

const inputSchema = z.object({
  caseId: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = inputSchema.parse(json);

    return NextResponse.json({
      caseId: body.caseId,
      status: "queued",
      message:
        "AI suggest route scaffolded. Claude integration, validation, and caching are the next step.",
      prompt: AI_PROMPTS.caseSuggest,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
