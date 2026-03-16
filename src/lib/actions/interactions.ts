"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";

import { quickSummary } from "@/lib/ai/haiku";
import { trackServerEvent } from "@/lib/analytics/posthog-server";

import { createClient } from "@/lib/supabase/server";
import type { InteractionInsert, ReminderInsert } from "@/types/database";

export type LogInteractionInput = {
  case_id: string;
  interaction_date: string;
  channel: InteractionInsert["channel"];
  direction: "inbound" | "outbound";
  summary: string;
  contact_name?: string | null;
  contact_department?: string | null;
  contact_role?: string | null;
  reference_number?: string | null;
  duration_minutes?: number | null;
  has_promise?: boolean;
  promises_made?: string | null;
  promise_deadline?: string | null;
  outcome?: InteractionInsert["outcome"];
  next_steps?: string | null;
  mood?: InteractionInsert["mood"];
};

export async function logInteraction(input: LogInteractionInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to log an interaction" };
  }

  // Verify user owns this case (RLS will also enforce this)
  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, title")
    .eq("id", input.case_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseRow) {
    return { error: "Case not found" };
  }

  const { data: interaction, error } = await supabase
    .from("interactions")
    .insert({
      case_id: input.case_id,
      user_id: user.id,
      interaction_date: input.interaction_date,
      channel: input.channel,
      direction: input.direction,
      summary: input.summary,
      contact_name: input.contact_name ?? null,
      contact_department: input.contact_department ?? null,
      contact_role: input.contact_role ?? null,
      reference_number: input.reference_number ?? null,
      duration_minutes: input.duration_minutes ?? null,
      promises_made: input.has_promise ? (input.promises_made ?? null) : null,
      promise_deadline: input.has_promise ? (input.promise_deadline ?? null) : null,
      outcome: input.outcome ?? null,
      next_steps: input.next_steps ?? null,
      mood: input.mood ?? null,
    } satisfies InteractionInsert)
    .select("id")
    .single();

  if (error) {
    return { error: `Failed to log interaction: ${error.message}` };
  }

  // Auto-create reminders for promise deadlines
  if (input.has_promise && input.promises_made && input.promise_deadline) {
    const deadline = new Date(input.promise_deadline);
    const reminders: ReminderInsert[] = [
      {
        user_id: user.id,
        case_id: input.case_id,
        interaction_id: interaction.id,
        reminder_type: "promise_deadline",
        title: `Promise deadline tomorrow`,
        description: `They promised: ${input.promises_made}`,
        due_date: addDays(deadline, -1).toISOString(),
      },
      {
        user_id: user.id,
        case_id: input.case_id,
        interaction_id: interaction.id,
        reminder_type: "promise_deadline",
        title: `Promise deadline today`,
        description: `They promised: ${input.promises_made}`,
        due_date: deadline.toISOString(),
      },
      {
        user_id: user.id,
        case_id: input.case_id,
        interaction_id: interaction.id,
        reminder_type: "promise_deadline",
        title: `Promise deadline passed — was it kept?`,
        description: `They promised: ${input.promises_made}`,
        due_date: addDays(deadline, 1).toISOString(),
      },
    ];
    await supabase.from("reminders").insert(reminders);
  }

  revalidatePath(`/cases/${input.case_id}`);
  revalidatePath(`/cases/${input.case_id}/timeline`);
  trackServerEvent(user.id, "interaction_logged", {
    channel: input.channel,
    caseId: input.case_id,
  });

  // Fire-and-forget HuggingFace auto-summary (Pro feature — runs silently)
  if (input.summary && input.summary.length > 100) {
    const interactionId = interaction.id;
    quickSummary(input.summary)
      .then(async (aiSummary) => {
        if (aiSummary) {
          const { createClient: makeClient } = await import("@/lib/supabase/server");
          const supabaseServer = await makeClient();
          await supabaseServer
            .from("interactions")
            .update({ ai_summary: aiSummary })
            .eq("id", interactionId);
        }
      })
      .catch(() => {});
  }

  return { success: true, interactionId: interaction.id };
}

export async function deleteInteraction(interactionId: string, caseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorised" };
  }

  // Delete associated reminders first
  await supabase
    .from("reminders")
    .delete()
    .eq("interaction_id", interactionId)
    .eq("user_id", user.id);

  const { error } = await supabase
    .from("interactions")
    .delete()
    .eq("id", interactionId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}/timeline`);
  return { success: true };
}

export async function updatePromiseFulfilled(
  interactionId: string,
  caseId: string,
  fulfilled: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorised" };
  }

  const { error } = await supabase
    .from("interactions")
    .update({ promise_fulfilled: fulfilled })
    .eq("id", interactionId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}/timeline`);
  return { success: true };
}
