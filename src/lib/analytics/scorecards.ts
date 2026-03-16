import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type CompanyStatsRow = Database["public"]["Views"]["v_company_stats"]["Row"];

function getScorecardClient() {
  try {
    return createServiceRoleClient();
  } catch {
    // Build environments may not provide service role credentials.
    return null;
  }
}

export function slugifyCompanyName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toGrade(score: number) {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

export type PublicScorecard = {
  slug: string;
  organisation_id: string;
  company_name: string;
  category: string;
  grade: "A" | "B" | "C" | "D" | "F";
  composite_score: number;
  total_cases: number;
  promise_kept_pct: number;
  response_rate_within_deadline_pct: number;
  avg_response_days: number;
  helpfulness_score: number;
  helpfulness_pct: number;
  escalation_rate: number;
  resolution_rate: number;
  resolution_rate_without_ombudsman: number;
  avg_resolution_days: number;
  total_disputed: number;
  channel_breakdown: {
    phone: number;
    email: number;
    webchat: number;
    letter: number;
    other: number;
  };
  most_common_channel: string;
  updated_at: string;
};

function buildScorecard(stats: CompanyStatsRow): PublicScorecard | null {
  if (!stats.organisation_id || !stats.organisation_name) return null;

  const totalCases = Number(stats.total_cases ?? 0);
  const totalPromises = Number(stats.total_promises ?? 0);
  const promisesKept = Number(stats.promises_kept ?? 0);
  const promiseKeptPct = totalPromises ? (promisesKept / totalPromises) * 100 : 0;

  const lettersSent = Number(stats.letters_sent_count ?? 0);
  const responsesReceived = Number(stats.responses_received_count ?? 0);
  const responseRatePct = lettersSent ? (responsesReceived / lettersSent) * 100 : 0;

  const helpfulnessScore = Number(stats.avg_helpfulness_score ?? 0);
  const helpfulnessPct = (helpfulnessScore / 4) * 100;

  const resolvedCases = Number(stats.resolved_cases ?? 0);
  const escalationRate = Number(stats.escalation_rate_pct ?? 0);
  const resolutionRate = totalCases ? (resolvedCases / totalCases) * 100 : 0;
  const resolutionWithoutOmbudsman = resolutionRate * ((100 - escalationRate) / 100);

  const composite =
    promiseKeptPct * 0.3 +
    responseRatePct * 0.25 +
    helpfulnessPct * 0.25 +
    resolutionWithoutOmbudsman * 0.2;

  const channelBreakdown = {
    phone: Number(stats.pct_phone ?? 0),
    email: Number(stats.pct_email ?? 0),
    webchat: Number(stats.pct_webchat ?? 0),
    letter: Number(stats.pct_letter ?? 0),
    other: 0,
  };
  const known =
    channelBreakdown.phone +
    channelBreakdown.email +
    channelBreakdown.webchat +
    channelBreakdown.letter;
  channelBreakdown.other = Number(Math.max(0, 100 - known).toFixed(1));

  const mostCommonChannel = (
    Object.entries(channelBreakdown)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other"
  ).replace(/_/g, " ");

  return {
    slug: slugifyCompanyName(stats.organisation_name),
    organisation_id: stats.organisation_id,
    company_name: stats.organisation_name,
    category: stats.category ?? "other",
    grade: toGrade(composite),
    composite_score: Number(composite.toFixed(1)),
    total_cases: totalCases,
    promise_kept_pct: Number(promiseKeptPct.toFixed(1)),
    response_rate_within_deadline_pct: Number(responseRatePct.toFixed(1)),
    avg_response_days: Number(stats.avg_response_days ?? 0),
    helpfulness_score: Number(helpfulnessScore.toFixed(2)),
    helpfulness_pct: Number(helpfulnessPct.toFixed(1)),
    escalation_rate: Number(escalationRate.toFixed(1)),
    resolution_rate: Number(resolutionRate.toFixed(1)),
    resolution_rate_without_ombudsman: Number(resolutionWithoutOmbudsman.toFixed(1)),
    avg_resolution_days: Number(stats.avg_resolution_days ?? 0),
    total_disputed: Number(stats.total_amount_disputed ?? 0),
    channel_breakdown: channelBreakdown,
    most_common_channel: mostCommonChannel,
    updated_at: new Date().toISOString(),
  };
}

export async function getPublicScorecardForSlug(slug: string) {
  const supabase = getScorecardClient();
  if (!supabase) return null;

  const { data: organisations, error: orgError } = await supabase
    .from("organisations")
    .select("id, name");
  if (orgError) throw orgError;

  const organisationRows = (organisations ?? []) as Array<{ id: string; name: string }>;
  const organisation = organisationRows.find((o) => slugifyCompanyName(o.name) === slug);
  if (!organisation) return null;

  const { data: stats, error: statsError } = await supabase
    .from("v_company_stats")
    .select("*")
    .eq("organisation_id", organisation.id)
    .maybeSingle();
  if (statsError) throw statsError;
  if (!stats) return null;

  const scorecard = buildScorecard(stats as CompanyStatsRow);
  if (!scorecard) return null;
  return scorecard;
}

export async function getPublicScorecardIndex(minCases = 5) {
  const supabase = getScorecardClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("v_company_stats")
    .select("*")
    .gte("total_cases", minCases)
    .order("total_cases", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as CompanyStatsRow[])
    .map((row) => buildScorecard(row))
    .filter((row): row is PublicScorecard => Boolean(row));
}
