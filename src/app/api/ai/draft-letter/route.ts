import { NextResponse } from "next/server";
import { z } from "zod";

import { CLAUDE_MODELS, anthropic } from "@/lib/ai/client";
import { LETTER_SYSTEM, buildLetterPrompt } from "@/lib/ai/prompts";
import { getTemplate } from "@/lib/ai/letter-templates";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { LetterInsert, Profile } from "@/types/database";

export const runtime = "nodejs";

const inputSchema = z.object({
  caseId: z.string().uuid(),
  letterType: z.string().min(1),
  additionalInstructions: z.string().max(500).optional(),
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

    const json = await request.json();
    const { caseId, letterType, additionalInstructions } = inputSchema.parse(json);

    // Profile + tier check
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
    const limit = limits.letters;

    if (limit === 0) {
      return NextResponse.json(
        {
          error: "upgrade_required",
          message: "AI letter drafting requires a Basic or Pro plan.",
          requiredTier: "basic",
        },
        { status: 403 }
      );
    }

    if (profile.ai_letters_used >= limit) {
      return NextResponse.json(
        {
          error: "Monthly AI credit limit reached. Upgrade your plan for more.",
        },
        { status: 403 }
      );
    }

    // Load case
    const { data: caseData } = await supabase
      .from("cases")
      .select("*, organisation_id, custom_organisation_name")
      .eq("id", caseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    const typedCase = caseData as import("@/types/database").Case;

    // Load org separately (type inference workaround)
    let orgName = typedCase.custom_organisation_name ?? typedCase.title;
    let complaintEmail: string | null = null;
    let complaintPhone: string | null = null;

    if (typedCase.organisation_id) {
      const { data: orgRow } = await supabase
        .from("organisations")
        .select("name, complaint_email, complaint_phone")
        .eq("id", typedCase.organisation_id)
        .maybeSingle();
      if (orgRow) {
        const org = orgRow as { name: string; complaint_email: string | null; complaint_phone: string | null };
        orgName = org.name;
        complaintEmail = org.complaint_email;
        complaintPhone = org.complaint_phone;
      }
    }

    const { data: interactions } = await supabase
      .from("interactions")
      .select(
        "interaction_date, channel, summary, promises_made, promise_fulfilled, reference_number"
      )
      .eq("case_id", caseId)
      .order("interaction_date", { ascending: true });

    const template = getTemplate(letterType as Parameters<typeof getTemplate>[0]);

    const prompt = buildLetterPrompt({
      letterType,
      letterTypeName: template?.name ?? letterType,
      legalReferences: template?.legalReferences ?? [],
      suggestedTone: template?.suggestedTone ?? "Professional",
      organisationName: orgName,
      complaintEmail,
      complaintPhone,
      senderName: profile.full_name ?? user.email ?? "Unknown",
      senderAddressLine1: profile.address_line_1,
      senderAddressLine2: profile.address_line_2,
      senderCity: profile.city,
      senderPostcode: profile.postcode,
      caseTitle: typedCase.title,
      caseDescription: typedCase.description,
      referenceNumber: typedCase.reference_number,
      firstContactDate: typedCase.first_contact_date
        ? new Date(typedCase.first_contact_date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null,
      desiredOutcome: typedCase.desired_outcome,
      amountInDispute: typedCase.amount_in_dispute,
      interactions: (interactions ?? []).map((i) => ({
        date: new Date(i.interaction_date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        channel: i.channel,
        summary: i.summary,
        promisesMade: i.promises_made,
        promiseFulfilled: i.promise_fulfilled,
        referenceNumber: i.reference_number,
      })),
      additionalInstructions,
    });

    // Call Claude
    const message = await anthropic.messages.create({
      model: CLAUDE_MODELS.letterDrafting,
      max_tokens: 2048,
      system: LETTER_SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const letterBody =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";

    if (!letterBody) {
      return NextResponse.json(
        { error: "AI returned an empty letter. Please try again." },
        { status: 500 }
      );
    }

    // Build subject line
    const subject = `${template?.name ?? "Formal Complaint"}${
      typedCase.title ? ` — ${typedCase.title}` : ""
    }${typedCase.reference_number ? ` (Ref: ${typedCase.reference_number})` : ""}`;

    // Save letter to DB
    const letterInsert: LetterInsert = {
      case_id: caseId,
      user_id: user.id,
      letter_type: (letterType as LetterInsert["letter_type"]) ?? "custom",
      recipient_name: orgName,
      recipient_address: complaintEmail,
      sent_to_email: complaintEmail,
      subject,
      body: letterBody,
      ai_generated: true,
      status: "draft",
    };

    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .insert(letterInsert)
      .select("id")
      .single();

    if (letterError) {
      return NextResponse.json(
        { error: `Failed to save letter: ${letterError.message}` },
        { status: 500 }
      );
    }

    // Increment AI counters after successful model call
    await supabase
      .from("profiles")
      .update({
        ai_letters_used: profile.ai_letters_used + 1,
        ai_credits_used: profile.ai_credits_used + 1,
      })
      .eq("id", user.id);

    trackServerEvent(user.id, "letter_generated", { letterType, letterId: letter.id });

    return NextResponse.json({
      letterId: letter.id,
      subject,
      body: letterBody,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[Draft letter error]", error);
    return NextResponse.json(
      { error: "Letter drafting failed. Please try again." },
      { status: 500 }
    );
  }
}
