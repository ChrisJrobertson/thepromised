import { NextResponse } from "next/server";
import { z } from "zod";

import { quickSummary } from "@/lib/ai/haiku";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

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

    const minuteCheck = checkRateLimit(user.id, 10, 60 * 1000);
    if (!minuteCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(minuteCheck.retryAfter) } }
      );
    }
    const hourCheck = checkRateLimit(user.id, 100, 60 * 60 * 1000);
    if (!hourCheck.allowed) {
      return NextResponse.json(
        { error: "Hourly limit reached. Please try again later." },
        { status: 429, headers: { "Retry-After": String(hourCheck.retryAfter) } }
      );
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    const profile = profileData as Profile;
    const tierLimits = {
      free: { suggestions: 0, letters: 0 },
      basic: { suggestions: 10, letters: 5 },
      pro: { suggestions: 50, letters: 30 },
    } as const;
    const limits = tierLimits[profile.subscription_tier] ?? tierLimits.free;
    if (limits.suggestions === 0 || profile.ai_suggestions_used >= limits.suggestions) {
      return NextResponse.json(
        { error: "Monthly AI credit limit reached. Upgrade your plan for more." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { text, interactionId } = inputSchema.parse(json);

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

    await supabase
      .from("profiles")
      .update({
        ai_suggestions_used: profile.ai_suggestions_used + 1,
        ai_credits_used: profile.ai_credits_used + 1,
      })
      .eq("id", user.id);

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
