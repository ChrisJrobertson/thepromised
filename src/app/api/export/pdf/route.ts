import { differenceInDays } from "date-fns";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { NextResponse } from "next/server";
import { z } from "zod";

import { CasePdfDocument, type CasePdfData } from "@/lib/pdf/CasePdfDocument";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { canExportPDF } from "@/lib/stripe/feature-gates";
import { createClient } from "@/lib/supabase/server";
import type {
  Case,
  Evidence,
  Interaction,
  Letter,
  Profile,
} from "@/types/database";

export const runtime = "nodejs";

const inputSchema = z.object({
  caseId: z.string().uuid(),
  exportType: z
    .enum(["full_case", "timeline_only", "letters_only"])
    .default("full_case"),
});

const ESCALATION_STAGE_NAMES: Record<string, string> = {
  initial: "Initial Complaint",
  formal_complaint: "Formal Complaint",
  final_response: "Final Response",
  ombudsman: "Ombudsman",
  court: "Court",
};

const ESCALATION_STAGE_ORDER = [
  "initial",
  "formal_complaint",
  "final_response",
  "ombudsman",
  "court",
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
    const { caseId, exportType } = inputSchema.parse(json);

    // Load profile for feature gate
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    const profile = profileData as Profile;

    // Feature gate
    if (!canExportPDF(profile, exportType)) {
      return NextResponse.json(
        {
          error: "upgrade_required",
          message:
            exportType === "full_case"
              ? "Full case export requires a Pro plan."
              : "PDF export requires a Basic or Pro plan.",
          requiredTier: exportType === "full_case" ? "pro" : "basic",
        },
        { status: 403 }
      );
    }

    // Load case
    const { data: caseData } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    const theCase = caseData as Case;

    // Load org name
    let orgName = theCase.custom_organisation_name ?? theCase.title;
    if (theCase.organisation_id) {
      const { data: org } = await supabase
        .from("organisations")
        .select("name")
        .eq("id", theCase.organisation_id)
        .maybeSingle();
      if (org) orgName = (org as { name: string }).name;
    }

    // Load interactions
    const { data: interactionsRaw } = await supabase
      .from("interactions")
      .select("*")
      .eq("case_id", caseId)
      .order("interaction_date", { ascending: true });

    const interactions = (interactionsRaw ?? []) as Interaction[];

    // Load evidence
    const { data: evidenceRaw } = await supabase
      .from("evidence")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    const evidence = (evidenceRaw ?? []) as Evidence[];

    // Load letters
    const { data: lettersRaw } = await supabase
      .from("letters")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    const letters = (lettersRaw ?? []) as Letter[];

    // Load escalation rules for this category
    const { data: escalationRulesRaw } = await supabase
      .from("escalation_rules")
      .select("stage_order, stage, title, description")
      .eq("category", theCase.category)
      .order("stage_order", { ascending: true });

    const escalationRules = escalationRulesRaw ?? [];

    // Build data
    const daysOpen = theCase.first_contact_date
      ? differenceInDays(new Date(), new Date(theCase.first_contact_date))
      : 0;

    const currentStageIndex = ESCALATION_STAGE_ORDER.indexOf(
      theCase.escalation_stage
    );

    const pdfData: CasePdfData = {
      caseTitle: theCase.title,
      orgName,
      caseReference: theCase.reference_number,
      description: theCase.description,
      desiredOutcome: theCase.desired_outcome,
      amountInDispute: theCase.amount_in_dispute,
      status: theCase.status,
      escalationStage: theCase.escalation_stage,
      firstContactDate: formatDate(theCase.first_contact_date),
      lastInteractionDate: formatDate(theCase.last_interaction_date),
      totalInteractions: interactions.length,
      daysOpen,
      userName: profile.full_name ?? user.email ?? "Unknown",
      generatedAt: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      interactions: interactions.map((i) => ({
        id: i.id,
        date: formatDate(i.interaction_date),
        channel: i.channel,
        direction: i.direction,
        contactName: i.contact_name,
        contactDepartment: i.contact_department,
        referenceNumber: i.reference_number,
        durationMinutes: i.duration_minutes,
        summary: i.summary,
        promisesMade: i.promises_made,
        promiseDeadline: i.promise_deadline ? formatDate(i.promise_deadline) : null,
        promiseFulfilled: i.promise_fulfilled,
        outcome: i.outcome,
        nextSteps: i.next_steps,
      })),
      promises: interactions
        .filter((i) => i.promises_made)
        .map((i) => ({
          date: formatDate(i.interaction_date),
          contactName: i.contact_name,
          promisesMade: i.promises_made!,
          deadline: i.promise_deadline ? formatDate(i.promise_deadline) : null,
          fulfilled: i.promise_fulfilled,
        })),
      evidence: evidence.map((e) => ({
        id: e.id,
        fileName: e.file_name,
        fileType: e.file_type,
        fileSize: e.file_size,
        description: e.description,
        evidenceType: e.evidence_type,
        createdAt: e.created_at ? formatDate(e.created_at) : null,
      })),
      letters: letters.map((l) => ({
        id: l.id,
        subject: l.subject,
        letterType: l.letter_type,
        status: l.status,
        sentDate: l.sent_date ? formatDate(l.sent_date) : null,
        body: l.body,
        aiGenerated: l.ai_generated ?? false,
      })),
      escalationStages: ESCALATION_STAGE_ORDER.map((stage, idx) => {
        const rule = escalationRules.find((r) => r.stage === stage);
        return {
          stageOrder: idx + 1,
          title:
            rule?.title ??
            ESCALATION_STAGE_NAMES[stage] ??
            stage.replace(/_/g, " "),
          description: (rule as { description?: string } | null)?.description ?? "",
          completed: idx <= currentStageIndex,
        };
      }),
      exportType,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      createElement(CasePdfDocument, { data: pdfData }) as ReactElement<DocumentProps>
    );

    // Save to exports table and Supabase Storage
    const filename = `case-file-${theCase.title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}-${Date.now()}.pdf`;
    const storagePath = `exports/${user.id}/${caseId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(storagePath, pdfBuffer, { contentType: "application/pdf" });

    if (!uploadError) {
      await supabase.from("exports").insert({
        case_id: caseId,
        user_id: user.id,
        file_name: filename,
        storage_path: storagePath,
        export_type: exportType,
      });
    }

    trackServerEvent(user.id, "case_exported", { caseId, exportType });

    const uint8Array = new Uint8Array(pdfBuffer);
    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": uint8Array.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[Case PDF error]", error);
    return NextResponse.json(
      { error: "PDF generation failed. Please try again." },
      { status: 500 }
    );
  }
}
