import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
type InteractionRow = Database["public"]["Tables"]["interactions"]["Row"];
type LetterRow = Database["public"]["Tables"]["letters"]["Row"];
type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];
type EvidenceRow = Pick<
  Database["public"]["Tables"]["evidence"]["Row"],
  "case_id" | "file_name" | "description" | "created_at"
>;
type OrganisationRow = Pick<Database["public"]["Tables"]["organisations"]["Row"], "id" | "name">;
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const admin = createServiceRoleClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const profileRow = profile as ProfileRow;

  if (profileRow.last_export_at) {
    const elapsed = Date.now() - new Date(profileRow.last_export_at).getTime();
    if (elapsed < 24 * 60 * 60 * 1000) {
      const retryAfter = Math.ceil((24 * 60 * 60 * 1000 - elapsed) / 1000);
      return NextResponse.json(
        { error: "Export available once every 24 hours." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
  }

  await admin
    .from("profiles")
    .update({ last_export_at: new Date().toISOString() })
    .eq("id", user.id);

  const { data: cases } = await admin
    .from("cases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const caseRows = (cases ?? []) as CaseRow[];
  const caseIds = caseRows.map((c) => c.id);
  const organisationIds = [...new Set(caseRows.map((c) => c.organisation_id).filter((id): id is string => Boolean(id)))];

  const { data: organisations } = organisationIds.length
    ? await admin.from("organisations").select("id, name").in("id", organisationIds)
    : { data: [] as OrganisationRow[] };

  const organisationNames = new Map(
    ((organisations ?? []) as OrganisationRow[]).map((o) => [o.id, o.name]),
  );

  const [interactionsRes, lettersRes, remindersRes, evidenceRes] = await Promise.all([
    caseIds.length ? admin.from("interactions").select("*").in("case_id", caseIds) : Promise.resolve({ data: [] as InteractionRow[] }),
    caseIds.length ? admin.from("letters").select("*").in("case_id", caseIds) : Promise.resolve({ data: [] as LetterRow[] }),
    caseIds.length ? admin.from("reminders").select("*").in("case_id", caseIds) : Promise.resolve({ data: [] as ReminderRow[] }),
    caseIds.length
      ? admin.from("evidence").select("case_id, file_name, description, created_at").in("case_id", caseIds)
      : Promise.resolve({ data: [] as EvidenceRow[] }),
  ]);

  const interactions = (interactionsRes.data ?? []) as InteractionRow[];
  const letters = (lettersRes.data ?? []) as LetterRow[];
  const reminders = (remindersRes.data ?? []) as ReminderRow[];
  const evidence = (evidenceRes.data ?? []) as EvidenceRow[];

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profileRow,
    cases: caseRows.map((row) => ({
      case: row,
      organisation: row.organisation_id ? (organisationNames.get(row.organisation_id) ?? null) : null,
      interactions: interactions.filter((i) => i.case_id === row.id),
      letters: letters.filter((l) => l.case_id === row.id),
      reminders: reminders.filter((r) => r.case_id === row.id),
      evidence: evidence
        .filter((e) => e.case_id === row.id)
        .map((e) => ({
          filename: e.file_name,
          description: e.description,
          uploaded_at: e.created_at,
        })),
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="theypromised-account-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
