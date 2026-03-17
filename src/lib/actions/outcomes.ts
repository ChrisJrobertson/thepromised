"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Case } from "@/types/database";

const OUTCOME_RESOLUTION_TYPES = [
  "refund",
  "compensation",
  "apology",
  "replacement",
  "service_fix",
  "nothing",
  "other",
] as const;

const OUTCOME_SATISFACTION = ["yes", "partially", "no"] as const;

export type OutcomeSatisfaction = (typeof OUTCOME_SATISFACTION)[number];
export type OutcomeResolutionType = (typeof OUTCOME_RESOLUTION_TYPES)[number];

export type SubmitCaseOutcomeInput = {
  caseId: string;
  satisfaction: OutcomeSatisfaction;
  resolutionType: OutcomeResolutionType;
  amountPounds?: number | null;
  notes?: string | null;
};

export type CompanyOutcomeStats = {
  company_name: string | null;
  total_resolved: number;
  fully_satisfied: number;
  partially_satisfied: number;
  not_satisfied: number;
  refunds: number;
  compensations: number;
  avg_amount_pence: number | null;
  median_amount_pence: number | null;
};

export async function submitCaseOutcome(
  input: SubmitCaseOutcomeInput
): Promise<{ error?: string; case?: Case }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to record an outcome" };
  }

  const amountPence =
    input.amountPounds != null && input.amountPounds > 0
      ? Math.round(input.amountPounds * 100)
      : null;

  const { data: caseData, error } = await supabase
    .from("cases")
    .update({
      outcome_satisfaction: input.satisfaction,
      outcome_resolution_type: input.resolutionType,
      outcome_amount_pence: amountPence,
      outcome_notes: input.notes?.slice(0, 500) ?? null,
      resolved_at: new Date().toISOString(),
      status: "resolved",
      resolved_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.caseId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/cases");
  revalidatePath(`/cases/${input.caseId}`);
  return { case: caseData as Case };
}

export async function getCompanyOutcomeStats(
  companyName: string
): Promise<CompanyOutcomeStats | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outcome_stats_by_company")
    .select("*")
    .eq("company_name", companyName)
    .maybeSingle();

  if (error || !data) return null;
  return data as CompanyOutcomeStats;
}
