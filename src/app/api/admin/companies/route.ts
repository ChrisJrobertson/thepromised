import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const ALLOWED_SORT_COLUMNS = new Set([
  "organisation_name",
  "category",
  "total_cases",
  "active_cases",
  "resolved_cases",
  "avg_resolution_days",
  "avg_response_days",
  "total_promises",
  "promises_kept",
  "promises_broken",
  "avg_helpfulness_score",
  "escalation_rate_pct",
  "total_amount_disputed",
]);

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sort_by") ?? "total_cases";
  const sortOrder = searchParams.get("sort_order") === "asc" ? "asc" : "desc";
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  if (!ALLOWED_SORT_COLUMNS.has(sortBy)) {
    return NextResponse.json({ error: "Invalid sort_by value" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  let query = supabase.from("v_company_stats").select("*");

  if (category) {
    query = query.eq("category", category);
  }
  if (search) {
    query = query.ilike("organisation_name", `%${search}%`);
  }

  const { data, error } = await query.order(sortBy, { ascending: sortOrder === "asc" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
