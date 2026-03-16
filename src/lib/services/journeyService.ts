import { differenceInDays } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export type JourneyStepStatus = "pending" | "active" | "in_progress" | "completed" | "waiting";

export type JourneyStep = {
  step_id: string;
  order: number;
  title: string;
  description: string;
  action_type: "checklist" | "send_letter" | "branch" | "info" | "escalate" | "wait" | "resolve";
  action_config: Record<string, unknown>;
  completion_criteria: {
    type: "letter_sent" | "interaction_logged" | "days_passed" | "evidence_uploaded" | "response_received" | "manual";
    letter_type?: string;
    reference?: string;
    days?: number;
  };
  wait_after_days: number;
  wait_message?: string;
  next_step: string | null;
};

export type JourneyTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: JourneyStep[];
  estimated_duration_days: number | null;
};

export type CaseJourney = {
  id: string;
  case_id: string;
  journey_template_id: string;
  current_step_id: string;
  step_statuses: Record<string, JourneyStepStatus | { status: JourneyStepStatus; checklist?: boolean[] }>;
  step_completed_at: Record<string, string>;
  waiting_until: string | null;
  started_at: string | null;
  completed_at: string | null;
  dismissed: boolean | null;
  template?: JourneyTemplate;
};

type RawJourneyTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Json;
  estimated_duration_days: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type RawCaseJourney = {
  id: string;
  case_id: string;
  journey_template_id: string;
  current_step_id: string;
  step_statuses: Json;
  step_completed_at: Json;
  waiting_until: string | null;
  started_at: string | null;
  completed_at: string | null;
  dismissed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

function parseSteps(raw: Json): JourneyStep[] {
  if (!Array.isArray(raw)) return [];
  return raw as unknown as JourneyStep[];
}

function parseStatuses(raw: Json): CaseJourney["step_statuses"] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, JourneyStepStatus | { status: JourneyStepStatus; checklist?: boolean[] }>;
}

function parseCompletedAt(raw: Json): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, string>;
}

function buildJourney(raw: RawCaseJourney, template?: JourneyTemplate): CaseJourney {
  return {
    id: raw.id,
    case_id: raw.case_id,
    journey_template_id: raw.journey_template_id,
    current_step_id: raw.current_step_id,
    step_statuses: parseStatuses(raw.step_statuses),
    step_completed_at: parseCompletedAt(raw.step_completed_at),
    waiting_until: raw.waiting_until,
    started_at: raw.started_at,
    completed_at: raw.completed_at,
    dismissed: raw.dismissed,
    template,
  };
}

export async function getJourneyTemplate(templateId: string): Promise<JourneyTemplate | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("journey_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as RawJourneyTemplate;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    steps: parseSteps(row.steps),
    estimated_duration_days: row.estimated_duration_days,
  };
}

export async function getJourneyTemplatesForCategory(category: string): Promise<JourneyTemplate[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("journey_templates")
    .select("*")
    .eq("category", category);

  if (error || !data) return [];

  return (data as RawJourneyTemplate[]).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    steps: parseSteps(t.steps),
    estimated_duration_days: t.estimated_duration_days,
  }));
}

export async function startJourney(caseId: string, journeyTemplateId: string): Promise<CaseJourney | null> {
  const supabase = await createClient();

  const template = await getJourneyTemplate(journeyTemplateId);
  if (!template) return null;

  const sortedSteps = [...template.steps].sort((a, b) => a.order - b.order);
  const firstStep = sortedSteps[0];
  if (!firstStep) return null;

  const initialStatuses: Record<string, JourneyStepStatus> = {};
  for (const step of sortedSteps) {
    initialStatuses[step.step_id] = step.step_id === firstStep.step_id ? "active" : "pending";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("case_journeys")
    .insert({
      case_id: caseId,
      journey_template_id: journeyTemplateId,
      current_step_id: firstStep.step_id,
      step_statuses: initialStatuses,
      step_completed_at: {},
    })
    .select("*")
    .single();

  if (error || !data) return null;

  return buildJourney(data as RawCaseJourney, template);
}

export async function getJourneyForCase(caseId: string): Promise<CaseJourney | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("case_journeys")
    .select("*")
    .eq("case_id", caseId)
    .maybeSingle();

  if (error || !data) return null;

  const raw = data as RawCaseJourney;
  const template = await getJourneyTemplate(raw.journey_template_id);

  return buildJourney(raw, template ?? undefined);
}

export async function evaluateStepCompletion(
  caseId: string
): Promise<{ completed: boolean; reason?: string }> {
  const supabase = await createClient();

  const journey = await getJourneyForCase(caseId);
  if (!journey?.template) return { completed: false };

  const currentStep = journey.template.steps.find(
    (s) => s.step_id === journey.current_step_id
  );
  if (!currentStep) return { completed: false };

  const criteria = currentStep.completion_criteria;

  if (criteria.type === "manual") {
    return { completed: false, reason: "Manual completion required" };
  }

  if (criteria.type === "letter_sent" && criteria.letter_type) {
    const { data } = await supabase
      .from("letters")
      .select("id")
      .eq("case_id", caseId)
      .limit(1);
    return { completed: Boolean(data && data.length > 0), reason: "letter_sent" };
  }

  if (criteria.type === "days_passed") {
    if (!journey.waiting_until) return { completed: false };
    const expired = new Date(journey.waiting_until) <= new Date();
    return { completed: expired, reason: "wait_period" };
  }

  if (criteria.type === "interaction_logged") {
    const stepStartTime = journey.started_at ?? new Date().toISOString();
    const { data } = await supabase
      .from("interactions")
      .select("id")
      .eq("case_id", caseId)
      .gt("created_at", stepStartTime)
      .limit(1);
    return { completed: Boolean(data && data.length > 0), reason: "interaction_logged" };
  }

  return { completed: false };
}

export async function advanceStep(caseId: string): Promise<CaseJourney | null> {
  const supabase = await createClient();
  const journey = await getJourneyForCase(caseId);
  if (!journey?.template) return null;

  const currentStep = journey.template.steps.find(
    (s) => s.step_id === journey.current_step_id
  );
  if (!currentStep) return null;

  const now = new Date().toISOString();
  const updatedStatuses = { ...journey.step_statuses } as Record<string, JourneyStepStatus | { status: JourneyStepStatus; checklist?: boolean[] }>;
  const updatedCompletedAt = { ...journey.step_completed_at };

  const currentStatus = updatedStatuses[currentStep.step_id];
  if (typeof currentStatus === "object" && "status" in currentStatus) {
    updatedStatuses[currentStep.step_id] = { ...currentStatus, status: "completed" };
  } else {
    updatedStatuses[currentStep.step_id] = "completed";
  }
  updatedCompletedAt[currentStep.step_id] = now;

  const nextStepId = currentStep.next_step;
  if (!nextStepId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("case_journeys")
      .update({
        step_statuses: updatedStatuses,
        step_completed_at: updatedCompletedAt,
        completed_at: now,
        updated_at: now,
      })
      .eq("case_id", caseId)
      .select("*")
      .single();

    if (!data) return null;
    return buildJourney(data as RawCaseJourney, journey.template);
  }

  updatedStatuses[nextStepId] = "active";

  let waitingUntil: string | null = null;
  if (currentStep.wait_after_days > 0) {
    const waitDate = new Date();
    waitDate.setDate(waitDate.getDate() + currentStep.wait_after_days);
    waitingUntil = waitDate.toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("case_journeys")
    .update({
      current_step_id: nextStepId,
      step_statuses: updatedStatuses,
      step_completed_at: updatedCompletedAt,
      waiting_until: waitingUntil,
      updated_at: now,
    })
    .eq("case_id", caseId)
    .select("*")
    .single();

  if (!data) return null;
  return buildJourney(data as RawCaseJourney, journey.template);
}

export async function advanceToStep(caseId: string, targetStepId: string): Promise<CaseJourney | null> {
  const supabase = await createClient();
  const journey = await getJourneyForCase(caseId);
  if (!journey?.template) return null;

  const now = new Date().toISOString();
  const updatedStatuses = { ...journey.step_statuses } as Record<string, JourneyStepStatus | { status: JourneyStepStatus; checklist?: boolean[] }>;
  const updatedCompletedAt = { ...journey.step_completed_at };

  const curStatus = updatedStatuses[journey.current_step_id];
  if (typeof curStatus === "object" && "status" in curStatus) {
    updatedStatuses[journey.current_step_id] = { ...curStatus, status: "completed" };
  } else {
    updatedStatuses[journey.current_step_id] = "completed";
  }
  updatedCompletedAt[journey.current_step_id] = now;

  updatedStatuses[targetStepId] = "active";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("case_journeys")
    .update({
      current_step_id: targetStepId,
      step_statuses: updatedStatuses,
      step_completed_at: updatedCompletedAt,
      waiting_until: null,
      updated_at: now,
    })
    .eq("case_id", caseId)
    .select("*")
    .single();

  if (!data) return null;
  return buildJourney(data as RawCaseJourney, journey.template);
}

export async function markStepComplete(caseId: string): Promise<CaseJourney | null> {
  const { completed } = await evaluateStepCompletion(caseId);
  if (!completed) return null;
  return advanceStep(caseId);
}

export async function checkWaitingPeriod(
  caseId: string
): Promise<{ expired: boolean; daysRemaining?: number }> {
  const journey = await getJourneyForCase(caseId);
  if (!journey?.waiting_until) return { expired: false };

  const waitUntil = new Date(journey.waiting_until);
  const now = new Date();

  if (waitUntil <= now) {
    return { expired: true, daysRemaining: 0 };
  }

  const daysRemaining = Math.ceil(differenceInDays(waitUntil, now));
  return { expired: false, daysRemaining };
}

export async function updateChecklistItem(
  caseId: string,
  stepId: string,
  itemIndex: number,
  checked: boolean
): Promise<CaseJourney | null> {
  const supabase = await createClient();
  const journey = await getJourneyForCase(caseId);
  if (!journey?.template) return null;

  const step = journey.template.steps.find((s) => s.step_id === stepId);
  if (!step) return null;

  const items = (step.action_config.items as string[]) ?? [];
  const updatedStatuses = { ...journey.step_statuses };
  const existingStatus = updatedStatuses[stepId];

  let checklist: boolean[];
  if (typeof existingStatus === "object" && "checklist" in existingStatus) {
    checklist = [...(existingStatus.checklist ?? [])];
  } else {
    checklist = new Array(items.length).fill(false);
  }

  checklist[itemIndex] = checked;
  updatedStatuses[stepId] = {
    status: (typeof existingStatus === "object" && "status" in existingStatus)
      ? existingStatus.status
      : "active" as JourneyStepStatus,
    checklist,
  };

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("case_journeys")
    .update({
      step_statuses: updatedStatuses,
      updated_at: now,
    })
    .eq("case_id", caseId)
    .select("*")
    .single();

  if (!data) return null;
  return buildJourney(data as RawCaseJourney, journey.template);
}

export async function dismissJourneyBanner(caseId: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("case_journeys")
    .update({ dismissed: true, updated_at: new Date().toISOString() })
    .eq("case_id", caseId);
}
