import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin-api";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type CompanyRankingRow = Database["public"]["Views"]["v_company_rankings"]["Row"];

function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
      return `"${text.replace(/"/g, "\"\"")}"`;
    }
    return text;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
  ];
  return lines.join("\n");
}

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const category = searchParams.get("category");

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("v_company_rankings")
    .select("*")
    .order("complaint_count", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = ((data ?? []) as CompanyRankingRow[]).map((row) => ({
    organisation_id: row.organisation_id,
    name: row.name,
    category: row.category,
    complaint_count: row.complaint_count,
    promise_broken_pct: row.promise_broken_pct,
    helpfulness_score: row.helpfulness_score,
    escalation_rate_pct: row.escalation_rate_pct,
    total_disputed: row.total_disputed,
  }));

  if (format === "json") {
    return new Response(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=\"company-rankings.json\"",
      },
    });
  }

  const csv = toCsv(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"company-rankings.csv\"",
    },
  });
}
