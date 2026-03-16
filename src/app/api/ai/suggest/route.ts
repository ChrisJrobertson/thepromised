import { differenceInDays } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";

import { CLAUDE_MODEL, anthropic } from "@/lib/ai/client";
import { CASE_ANALYSIS_SYSTEM, buildCaseAnalysisPrompt } from "@/lib/ai/prompts";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { enforcePackScopedCaseAccess } from "@/lib/packs/access";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const runtime = "nodejs";

const inputSchema = z.object({
  caseId: z.string().uuid(),
});

const suggestionResponseSchema = z.object({
  assessment: z.string(),
  nextStep: z.string(),
  deadlines: z.array(z.string()),
  evidenceNeeded: z.array(z.string()),
  strengthRating: z.enum(["weak", "moderate", "strong"]),
  strengthExplanation: z.string(),
  letterRecommended: z.boolean(),
  letterType: z.string().nullable(),
});

export type AiSuggestion = z.infer<typeof suggestionResponseSchema>;

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

    const json = await request.json();
    const { caseId } = inputSchema.parse(json);

    // Load profile for tier check
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    const profile = profileData as Profile;
    const tier = profile.subscription_tier;
    const tierLimits = {
      free: { suggestions: 0, letters: 0 },
      basic: { suggestions: 10, letters: 5 },
      pro: { suggestions: 50, letters: 30 },
    } as const;
    const limits = tierLimits[tier] ?? tierLimits.free;

    if (limits.suggestions === 0) {
      return NextResponse.json(
        {
          error: "upgrade_required",
          message: "AI case analysis is not available on the free plan. Upgrade to Basic or Pro.",
          requiredTier: "basic",
        },
        { status: 403 }
      );
    }

    if (profile.ai_suggestions_used >= limits.suggestions) {
      return NextResponse.json(
        {
          error: "Monthly AI credit limit reached. Upgrade your plan for more.",
        },
        { status: 403 }
      );
    }

    const packScopeError = await enforcePackScopedCaseAccess({
      profile,
      caseId,
      userId: user.id,
      supabase,
    });
    if (packScopeError) return packScopeError;

    // Load case (verify ownership via RLS)
    const { data: caseData } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const typedCase = caseData as import("@/types/database").Case;

    // Load org name
    let orgName = typedCase.custom_organisation_name ?? typedCase.title;
    if (typedCase.organisation_id) {
      const { data: orgRow } = await supabase
        .from("organisations")
        .select("name")
        .eq("id", typedCase.organisation_id)
        .maybeSingle();
      if (orgRow) orgName = (orgRow as { name: string }).name;
    }

    // Load interactions
    const { data: interactions } = await supabase
      .from("interactions")
      .select("*")
      .eq("case_id", caseId)
      .order("interaction_date", { ascending: true });

    // Load relevant escalation rules
    const { data: escalationRules } = await supabase
      .from("escalation_rules")
      .select("stage_order, title, wait_period_days, regulatory_body, tips")
      .eq("category", typedCase.category)
      .order("stage_order", { ascending: true });

    const daysOpen = typedCase.first_contact_date
      ? differenceInDays(new Date(), new Date(typedCase.first_contact_date))
      : 0;

    const prompt = buildCaseAnalysisPrompt({
      title: typedCase.title,
      category: typedCase.category,
      description: typedCase.description,
      status: typedCase.status,
      escalationStage: typedCase.escalation_stage,
      priority: typedCase.priority,
      firstContactDate: typedCase.first_contact_date,
      daysOpen,
      desiredOutcome: typedCase.desired_outcome,
      amountInDispute: typedCase.amount_in_dispute,
      referenceNumber: typedCase.reference_number,
      organisationName: orgName,
      interactions: ((interactions ?? []) as import("@/types/database").Interaction[]).map((i) => ({
        date: i.interaction_date,
        channel: i.channel,
        direction: i.direction,
        summary: i.summary,
        outcome: i.outcome,
        promisesMade: i.promises_made,
        promiseFulfilled: i.promise_fulfilled,
        mood: i.mood,
      })),
      escalationRules: (escalationRules ?? []).map((r) => ({
        stageOrder: r.stage_order,
        title: r.title,
        waitPeriodDays: r.wait_period_days,
        regulatoryBody: r.regulatory_body,
        tips: r.tips,
      })),
    });

    // Call Claude
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: CASE_ANALYSIS_SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    // Parse and validate JSON response
    let parsed: AiSuggestion;
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawText.replace(/^```(?:json)?\n?/m, "").replace(/```$/m, "").trim();
      const jsonObj = JSON.parse(cleaned);
      parsed = suggestionResponseSchema.parse(jsonObj);
    } catch {
      // If Claude didn't return valid JSON, build a safe fallback
      parsed = {
        assessment:
          "We were unable to parse the AI response. Please try again.",
        nextStep: rawText.slice(0, 200),
        deadlines: [],
        evidenceNeeded: [],
        strengthRating: "moderate",
        strengthExplanation: "Unable to assess.",
        letterRecommended: false,
        letterType: null,
      };
    }

    // Increment credits after successful model call
    await supabase
      .from("profiles")
      .update({
        ai_suggestions_used: profile.ai_suggestions_used + 1,
        ai_credits_used: profile.ai_credits_used + 1,
      })
      .eq("id", user.id);

    trackServerEvent(user.id, "ai_suggestion_requested", { caseId });

    return NextResponse.json({
      suggestion: parsed,
      creditsUsed: profile.ai_suggestions_used + 1,
      creditsLimit: limits.suggestions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[AI suggest error]", error);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
