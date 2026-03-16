import { NextResponse } from "next/server";
import { z } from "zod";

import { quickSummary } from "@/lib/ai/haiku";
import { AI_LIMITS } from "@/lib/ai/constants";
import { ensureCreditsResetIfDue } from "@/lib/ai/credits";
import { enforcePackScopedCaseAccess } from "@/lib/packs/access";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const runtime = "nodejs";

const inputSchema = z.object({
  text: z.string().min(1).max(10_000),
  interactionId: z.string().uuid().optional(),
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
    const limits = AI_LIMITS[profile.subscription_tier] ?? AI_LIMITS.free;

    // Lazy monthly reset for users without Stripe subscriptions (e.g. free tier)
    const { ai_suggestions_used } = await ensureCreditsResetIfDue(profile, user.id, supabase);

    if (ai_suggestions_used >= limits.summaries) {
      return NextResponse.json(
        { error: "Monthly AI credit limit reached. Upgrade your plan for more." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { text, interactionId, caseId } = inputSchema.parse(json);

    if (profile.subscription_status === "pack_temporary") {
      let scopedCaseId = caseId ?? null;

      if (!scopedCaseId && interactionId) {
        const { data: interactionRow } = await supabase
          .from("interactions")
          .select("case_id")
          .eq("id", interactionId)
          .eq("user_id", user.id)
          .maybeSingle();
        scopedCaseId =
          (interactionRow as { case_id: string } | null)?.case_id ?? null;
      }

      if (!scopedCaseId) {
        return NextResponse.json(
          {
            error:
              "Pack-scoped AI summarisation requires a linked case context.",
          },
          { status: 403 },
        );
      }

      const packScopeError = await enforcePackScopedCaseAccess({
        profile,
        caseId: scopedCaseId,
        userId: user.id,
        supabase,
      });
      if (packScopeError) return packScopeError;
    }

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
        ai_suggestions_used: ai_suggestions_used + 1,
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
