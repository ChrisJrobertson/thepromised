"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type UserJourney = {
  id: string;
  user_id: string;
  case_id: string | null;
  template_id: string;
  current_step_index: number;
  status: "active" | "completed" | "abandoned";
  completed_steps: string[];
  started_at: string;
  updated_at: string;
  completed_at: string | null;
};

export async function startJourney(templateId: string, caseId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_journeys")
    .insert({
      user_id: user.id,
      template_id: templateId,
      case_id: caseId ?? null,
      current_step_index: 0,
      status: "active",
      completed_steps: [],
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/journeys");
  return { success: true, journeyId: data.id };
}

export async function advanceJourneyStep(
  journeyId: string,
  nextStepIndex: number,
  completedStepId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: journey } = await (supabase as any)
    .from("user_journeys")
    .select("completed_steps, current_step_index, user_id")
    .eq("id", journeyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!journey) return { error: "Journey not found" };

  const completedSteps = Array.isArray(journey.completed_steps)
    ? [...(journey.completed_steps as string[]), completedStepId]
    : [completedStepId];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_journeys")
    .update({
      current_step_index: nextStepIndex,
      completed_steps: completedSteps,
    })
    .eq("id", journeyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/journeys/${journeyId}`);
  return { success: true };
}

export async function completeJourney(journeyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_journeys")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", journeyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/journeys");
  revalidatePath(`/journeys/${journeyId}`);
  return { success: true };
}

export async function abandonJourney(journeyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_journeys")
    .update({ status: "abandoned" })
    .eq("id", journeyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/journeys");
  redirect("/journeys");
}

export async function linkJourneyToCase(journeyId: string, caseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_journeys")
    .update({ case_id: caseId })
    .eq("id", journeyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/journeys/${journeyId}`);
  return { success: true };
}
