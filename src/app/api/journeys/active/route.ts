import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { CaseJourney } from "@/types/journey";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  type JourneyRow = {
    id: string; case_id: string; user_id: string; journey_template_id: string;
    current_step_id: string; status: string; step_history: unknown;
    started_at: string | null; completed_at: string | null;
    created_at: string | null; updated_at: string | null;
  };
  type CaseRow = {
    id: string; title: string; custom_organisation_name: string | null;
    organisations: { name: string } | null;
  };

  const { data: journeysRaw } = await supabase
    .from("case_journeys")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(5);

  const journeys = (journeysRaw ?? []) as unknown as JourneyRow[];
  if (journeys.length === 0) return NextResponse.json([]);

  // Fetch the related cases for titles + org names
  const caseIds = journeys.map((j) => j.case_id);
  const { data: casesRaw } = await supabase
    .from("cases")
    .select("id, title, custom_organisation_name, organisations(name)")
    .in("id", caseIds)
    .eq("user_id", user.id);

  const cases = (casesRaw ?? []) as unknown as CaseRow[];

  const caseMap = new Map(
    cases.map((c) => [
      c.id,
      {
        title: c.title,
        orgName: c.organisations?.name ?? c.custom_organisation_name ?? "Unknown",
      },
    ])
  );

  const rows = journeys.map((j) => {
    const caseData = caseMap.get(j.case_id);
    return {
      journey: {
        id: j.id,
        case_id: j.case_id,
        user_id: j.user_id,
        journey_template_id: j.journey_template_id,
        current_step_id: j.current_step_id,
        status: j.status,
        step_history: Array.isArray(j.step_history) ? j.step_history : [],
        started_at: j.started_at,
        completed_at: j.completed_at,
        created_at: j.created_at,
        updated_at: j.updated_at,
      } as CaseJourney,
      caseTitle: caseData?.title ?? "Untitled case",
      orgName: caseData?.orgName ?? "Unknown",
    };
  });

  return NextResponse.json(rows);
}
