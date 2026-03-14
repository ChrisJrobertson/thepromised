import { NextResponse } from "next/server";
import { z } from "zod";

import { AI_PROMPTS } from "@/lib/ai/prompts";

const inputSchema = z.object({
  caseId: z.uuid(),
  letterType: z.string().min(1),
  additionalInstructions: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = inputSchema.parse(json);

    return NextResponse.json({
      caseId: body.caseId,
      letterType: body.letterType,
      status: "queued",
      message:
        "Letter draft route scaffolded. Claude generation and storage in letters table will follow.",
      prompt: AI_PROMPTS.draftLetter,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
