"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { canCreateCase } from "@/lib/stripe/feature-gates";
import type {
  CaseInsert,
  CaseUpdate,
  InteractionInsert,
  OrganisationInsert,
  ReminderInsert,
} from "@/types/database";

export type CreateCaseInput = {
  // Organisation
  organisation_id?: string | null;
  organisation_name?: string | null;
  category: string;
  // New organisation fields (if creating inline)
  new_organisation?: {
    name: string;
    category: string;
    website?: string;
    complaint_email?: string;
    complaint_phone?: string;
  } | null;
  // Case details
  title: string;
  description?: string;
  reference_number?: string;
  amount_in_dispute?: number | null;
  desired_outcome?: string;
  priority: "low" | "medium" | "high" | "urgent";
  first_contact_date: string;
  // Optional first interaction
  first_interaction?: {
    interaction_date: string;
    channel: InteractionInsert["channel"];
    direction: "inbound" | "outbound";
    summary: string;
    contact_name?: string;
    contact_department?: string;
    contact_role?: string;
    reference_number?: string;
    duration_minutes?: number | null;
    promises_made?: string;
    promise_deadline?: string;
    outcome?: InteractionInsert["outcome"];
    next_steps?: string;
    mood?: InteractionInsert["mood"];
  } | null;
};

export async function createCase(input: CreateCaseInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a case" };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) {
    return { error: "Profile not found" };
  }

  const profile = profileData as import("@/types/database").Profile;

  if (!canCreateCase(profile)) {
    return {
      error:
        "You have reached the maximum number of cases on the free plan. Please upgrade to create more cases.",
    };
  }

  let organisationId = input.organisation_id ?? null;

  // Create new organisation if provided
  if (input.new_organisation) {
    const orgData: OrganisationInsert = {
      name: input.new_organisation.name,
      category: input.new_organisation.category as OrganisationInsert["category"],
      website: input.new_organisation.website ?? null,
      complaint_email: input.new_organisation.complaint_email ?? null,
      complaint_phone: input.new_organisation.complaint_phone ?? null,
      is_verified: false,
    };

    const { data: newOrg, error: orgError } = await supabase
      .from("organisations")
      .insert(orgData)
      .select("id")
      .single();

    if (orgError) {
      return { error: `Failed to create organisation: ${orgError.message}` };
    }

    organisationId = newOrg.id;
  }

  const caseData: CaseInsert = {
    user_id: user.id,
    organisation_id: organisationId,
    custom_organisation_name:
      !organisationId && input.organisation_name
        ? input.organisation_name
        : null,
    category: input.category,
    title: input.title,
    description: input.description ?? null,
    reference_number: input.reference_number ?? null,
    amount_in_dispute: input.amount_in_dispute ?? null,
    desired_outcome: input.desired_outcome ?? null,
    priority: input.priority,
    status: "open",
    escalation_stage: "initial",
    first_contact_date: input.first_contact_date,
  };

  const { data: newCase, error: caseError } = await supabase
    .from("cases")
    .insert(caseData)
    .select("id")
    .single();

  if (caseError) {
    return { error: `Failed to create case: ${caseError.message}` };
  }

  // Log first interaction if provided
  if (input.first_interaction) {
    const fi = input.first_interaction;
    const { data: interaction, error: interactionError } = await supabase
      .from("interactions")
      .insert({
        case_id: newCase.id,
        user_id: user.id,
        interaction_date: fi.interaction_date,
        channel: fi.channel,
        direction: fi.direction,
        summary: fi.summary,
        contact_name: fi.contact_name ?? null,
        contact_department: fi.contact_department ?? null,
        contact_role: fi.contact_role ?? null,
        reference_number: fi.reference_number ?? null,
        duration_minutes: fi.duration_minutes ?? null,
        promises_made: fi.promises_made ?? null,
        promise_deadline: fi.promise_deadline ?? null,
        outcome: fi.outcome ?? null,
        next_steps: fi.next_steps ?? null,
        mood: fi.mood ?? null,
      } satisfies InteractionInsert)
      .select("id")
      .single();

    if (!interactionError && interaction && fi.promises_made && fi.promise_deadline) {
      const deadline = new Date(fi.promise_deadline);
      const reminders: ReminderInsert[] = [
        {
          user_id: user.id,
          case_id: newCase.id,
          interaction_id: interaction.id,
          reminder_type: "promise_deadline",
          title: `Promise deadline approaching`,
          description: `They promised: ${fi.promises_made}`,
          due_date: addDays(deadline, -1).toISOString(),
        },
        {
          user_id: user.id,
          case_id: newCase.id,
          interaction_id: interaction.id,
          reminder_type: "promise_deadline",
          title: `Promise deadline today`,
          description: `They promised: ${fi.promises_made}`,
          due_date: deadline.toISOString(),
        },
        {
          user_id: user.id,
          case_id: newCase.id,
          interaction_id: interaction.id,
          reminder_type: "promise_deadline",
          title: `Promise deadline passed — mark as kept or broken`,
          description: `They promised: ${fi.promises_made}`,
          due_date: addDays(deadline, 1).toISOString(),
        },
      ];
      await supabase.from("reminders").insert(reminders);
    }
  }

  revalidatePath("/cases");
  return { success: true, caseId: newCase.id };
}

export async function updateCaseStatus(
  caseId: string,
  update: Pick<CaseUpdate, "status" | "priority" | "escalation_stage" | "resolved_date" | "resolution_summary">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorised" };
  }

  const { error } = await supabase
    .from("cases")
    .update(update)
    .eq("id", caseId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  return { success: true };
}

export async function closeCase(caseId: string, resolutionSummary?: string) {
  return updateCaseStatus(caseId, {
    status: "closed",
    resolved_date: new Date().toISOString(),
    resolution_summary: resolutionSummary ?? null,
  });
}

export async function advanceEscalationStage(
  caseId: string,
  newStage: CaseUpdate["escalation_stage"]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorised" };
  }

  const { error } = await supabase
    .from("cases")
    .update({ escalation_stage: newStage, status: "escalated" })
    .eq("id", caseId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/cases/${caseId}`);
  return { success: true };
}
