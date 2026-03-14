"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { EvidenceInsert } from "@/types/database";

export async function createEvidenceRecord(input: {
  case_id: string;
  interaction_id?: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  description?: string | null;
  evidence_type?: EvidenceInsert["evidence_type"];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorised" };
  }

  const { data, error } = await supabase
    .from("evidence")
    .insert({
      ...input,
      user_id: user.id,
      interaction_id: input.interaction_id ?? null,
      description: input.description ?? null,
      evidence_type: input.evidence_type ?? null,
    } satisfies EvidenceInsert)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/cases/${input.case_id}`);
  return { success: true, evidenceId: data.id };
}

export async function deleteEvidence(evidenceId: string, caseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorised" };
  }

  // Get the storage path before deleting
  const { data: evidence } = await supabase
    .from("evidence")
    .select("storage_path")
    .eq("id", evidenceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!evidence) {
    return { error: "Evidence not found" };
  }

  // Delete from storage
  await supabase.storage.from("evidence").remove([evidence.storage_path]);

  // Delete the record
  const { error } = await supabase
    .from("evidence")
    .delete()
    .eq("id", evidenceId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/cases/${caseId}`);
  return { success: true };
}

export async function getEvidenceUrl(storagePath: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("evidence")
    .createSignedUrl(storagePath, 3600);

  return data?.signedUrl ?? null;
}
