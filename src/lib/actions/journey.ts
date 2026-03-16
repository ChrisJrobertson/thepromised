"use server";

import { revalidatePath } from "next/cache";

import {
  startJourney as _startJourney,
  advanceStep as _advanceStep,
  advanceToStep as _advanceToStep,
  dismissJourneyBanner as _dismiss,
  updateChecklistItem as _updateChecklist,
} from "@/lib/services/journeyService";
import { createClient } from "@/lib/supabase/server";

export async function startJourneyAction(caseId: string, templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const journey = await _startJourney(caseId, templateId);
  if (!journey) return { error: "Failed to start journey" };

  revalidatePath(`/cases/${caseId}`);
  return { success: true, journey };
}

export async function advanceJourneyStep(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const journey = await _advanceStep(caseId);
  if (!journey) return { error: "Failed to advance step" };

  revalidatePath(`/cases/${caseId}`);
  return { success: true, journey };
}

export async function advanceJourneyToStep(caseId: string, targetStepId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const journey = await _advanceToStep(caseId, targetStepId);
  if (!journey) return { error: "Failed to advance journey" };

  revalidatePath(`/cases/${caseId}`);
  return { success: true, journey };
}

export async function dismissJourneyBannerAction(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  await _dismiss(caseId);
  revalidatePath(`/cases/${caseId}`);
  return { success: true };
}

export async function updateJourneyChecklist(
  caseId: string,
  stepId: string,
  itemIndex: number,
  checked: boolean
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorised" };

  const journey = await _updateChecklist(caseId, stepId, itemIndex, checked);
  if (!journey) return { error: "Failed to update checklist" };

  revalidatePath(`/cases/${caseId}`);
  return { success: true, journey };
}
