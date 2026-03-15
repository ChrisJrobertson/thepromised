import { NextResponse } from "next/server";
import { z } from "zod";

import { quickSummary } from "@/lib/ai/huggingface";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const inputSchema = z.object({
  text: z.string().min(1).max(10_000),
  interactionId: z.string().uuid().optional(),
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

    const json = await request.json();
    const { text, interactionId } = inputSchema.parse(json);

    // Try HF first, fallback to first sentence truncation
    const hfSummary = await quickSummary(text);
    const summary =
      hfSummary ?? (text.split(".")[0]?.slice(0, 160) ?? text.slice(0, 160));

    // If interactionId provided, update the ai_summary field
    if (interactionId) {
      await supabase
        .from("interactions")
        .update({ ai_summary: summary })
        .eq("id", interactionId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ summary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Summarisation failed" },
      { status: 500 }
    );
  }
}
