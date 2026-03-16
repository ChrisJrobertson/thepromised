import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getActiveJourney,
  getAvailableJourneyId,
  startJourney,
} from "@/lib/journeys/service";
import { getJourneyTemplate, getOrderedSteps } from "@/lib/journeys/templates";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET /api/journeys?caseId=xxx
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("caseId");
  if (!caseId) return NextResponse.json({ error: "caseId is required" }, { status: 400 });

  // Verify case ownership
  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, category")
    .eq("id", caseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseRow) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const journey = await getActiveJourney(supabase, caseId);
  const availableTemplateId = getAvailableJourneyId(caseRow.category);

  if (!journey) {
    return NextResponse.json({
      journey: null,
      template: availableTemplateId ? getJourneyTemplate(availableTemplateId) : null,
      availableTemplateId,
    });
  }

  const template = getJourneyTemplate(journey.journey_template_id);
  if (!template) {
    return NextResponse.json({ journey, template: null, availableTemplateId });
  }

  return NextResponse.json({
    journey,
    template,
    steps: getOrderedSteps(template),
    availableTemplateId,
  });
}

// POST /api/journeys — start a new journey
const startSchema = z.object({
  caseId: z.string().uuid(),
  templateId: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
  }

  const { caseId, templateId } = parsed.data;

  // Verify case ownership
  const { data: caseRow } = await supabase
    .from("cases")
    .select("id")
    .eq("id", caseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseRow) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const template = getJourneyTemplate(templateId);
  if (!template) return NextResponse.json({ error: "Unknown journey template" }, { status: 400 });

  try {
    const journey = await startJourney(supabase, caseId, user.id, templateId);
    return NextResponse.json({ journey, template });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to start journey";
    // Handle duplicate (case already has an active journey)
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json({ error: "This case already has an active journey" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
