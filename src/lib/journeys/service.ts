import type { SupabaseClient } from "@supabase/supabase-js";

import {
  CATEGORY_TO_JOURNEY,
  getFirstStep,
  getJourneyStep,
  getJourneyTemplate,
} from "./templates";
import type { CaseJourney, JourneyStepHistoryEntry } from "@/types/journey";
import type { SupabaseDatabase } from "@/types/database";

type DB = SupabaseClient<SupabaseDatabase>;

type JourneyRow = {
  id: string;
  case_id: string;
  user_id: string;
  journey_template_id: string;
  current_step_id: string;
  status: string;
  step_history: unknown;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getActiveJourney(
  supabase: DB,
  caseId: string
): Promise<CaseJourney | null> {
  const { data } = await supabase
    .from("case_journeys")
    .select("*")
    .eq("case_id", caseId)
    .maybeSingle();

  if (!data) return null;
  return dbRowToJourney(data as unknown as JourneyRow);
}

export function getAvailableJourneyId(caseCategory: string): string | null {
  return CATEGORY_TO_JOURNEY[caseCategory] ?? null;
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function startJourney(
  supabase: DB,
  caseId: string,
  userId: string,
  templateId: string
): Promise<CaseJourney> {
  const template = getJourneyTemplate(templateId);
  if (!template) throw new Error(`Unknown journey template: ${templateId}`);

  const firstStep = getFirstStep(template);

  const { data, error } = await supabase
    .from("case_journeys")
    .insert({
      case_id: caseId,
      user_id: userId,
      journey_template_id: templateId,
      current_step_id: firstStep.step_id,
      status: "in_progress",
      step_history: [],
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return dbRowToJourney(data as unknown as JourneyRow);
}

export async function completeStep(
  supabase: DB,
  journeyId: string,
  stepId: string,
  choice?: string
): Promise<CaseJourney> {
  // Fetch current journey
  const { data: existing, error: fetchErr } = await supabase
    .from("case_journeys")
    .select("*")
    .eq("id", journeyId)
    .single();

  if (fetchErr || !existing) throw new Error("Journey not found");
  const journey = dbRowToJourney(existing as unknown as JourneyRow);

  const template = getJourneyTemplate(journey.journey_template_id);
  if (!template) throw new Error("Journey template not found");

  const step = getJourneyStep(template, stepId);
  if (!step) throw new Error(`Step ${stepId} not found in template`);

  // Build updated history
  const newEntry: JourneyStepHistoryEntry = {
    step_id: stepId,
    completed_at: new Date().toISOString(),
    ...(choice ? { choice } : {}),
  };
  const updatedHistory = [...journey.step_history, newEntry];

  // Determine next step
  let nextStepId: string | null = step.next_step;

  if (step.action_type === "branch" && step.action_config.options && choice) {
    const option = step.action_config.options.find((o) => o.next_step === choice);
    if (option) nextStepId = option.next_step;
  }

  // If no next step, complete the journey
  if (!nextStepId) {
    const { data, error } = await supabase
      .from("case_journeys")
      .update({
        status: "completed",
        step_history: updatedHistory as unknown as import("@/types/database").Json,
        current_step_id: stepId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", journeyId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return dbRowToJourney(data as unknown as JourneyRow);
  }

  const { data, error } = await supabase
    .from("case_journeys")
    .update({
      current_step_id: nextStepId,
      step_history: updatedHistory as unknown as import("@/types/database").Json,
    })
    .eq("id", journeyId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return dbRowToJourney(data as unknown as JourneyRow);
}

export async function abandonJourney(supabase: DB, journeyId: string): Promise<void> {
  const { error } = await supabase
    .from("case_journeys")
    .update({ status: "abandoned" })
    .eq("id", journeyId);

  if (error) throw new Error(error.message);
}

export async function completeJourney(supabase: DB, journeyId: string): Promise<void> {
  const { error } = await supabase
    .from("case_journeys")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", journeyId);

  if (error) throw new Error(error.message);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function dbRowToJourney(row: {
  id: string;
  case_id: string;
  user_id: string;
  journey_template_id: string;
  current_step_id: string;
  status: string;
  step_history: unknown;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}): CaseJourney {
  return {
    id: row.id,
    case_id: row.case_id,
    user_id: row.user_id,
    journey_template_id: row.journey_template_id,
    current_step_id: row.current_step_id,
    status: row.status as CaseJourney["status"],
    step_history: (Array.isArray(row.step_history) ? row.step_history : []) as JourneyStepHistoryEntry[],
    started_at: row.started_at ?? new Date().toISOString(),
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
