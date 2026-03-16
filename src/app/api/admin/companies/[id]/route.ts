import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: summary, error: summaryError } = await supabase
    .from("v_company_stats")
    .select("*")
    .eq("organisation_id", id)
    .maybeSingle();

  if (summaryError) {
    return NextResponse.json({ error: summaryError.message }, { status: 500 });
  }
  if (!summary) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const { data: cases } = await supabase
    .from("cases")
    .select("id, title, status, created_at, first_contact_date, updated_at, amount_in_dispute, interaction_count")
    .eq("organisation_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  const caseIds = (cases ?? []).map((c) => c.id);
  const [interactionsResult, lettersResult] = await Promise.all([
    caseIds.length
      ? supabase
          .from("interactions")
          .select("case_id, interaction_date, mood, channel, outcome, promises_made, promise_fulfilled, promise_deadline, summary")
          .in("case_id", caseIds)
      : Promise.resolve({ data: [] as unknown[] }),
    caseIds.length
      ? supabase
          .from("letters")
          .select("id, sent_at, delivered_at, opened_at, bounced_at, delivery_status")
          .in("case_id", caseIds)
      : Promise.resolve({ data: [] as unknown[] }),
  ]);

  return NextResponse.json({
    summary,
    cases: cases ?? [],
    interactions: interactionsResult.data ?? [],
    letters: lettersResult.data ?? [],
  });
}
