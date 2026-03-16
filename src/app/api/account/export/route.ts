import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

  if (profile.last_export_at) {
    const elapsed = Date.now() - new Date(profile.last_export_at).getTime();
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
    .select("*, organisations(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const caseIds = (cases ?? []).map((c) => c.id);
  const [interactionsRes, lettersRes, remindersRes, evidenceRes] = await Promise.all([
    caseIds.length ? admin.from("interactions").select("*").in("case_id", caseIds) : Promise.resolve({ data: [] as unknown[] }),
    caseIds.length ? admin.from("letters").select("*").in("case_id", caseIds) : Promise.resolve({ data: [] as unknown[] }),
    caseIds.length ? admin.from("reminders").select("*").in("case_id", caseIds) : Promise.resolve({ data: [] as unknown[] }),
    caseIds.length
      ? admin.from("evidence").select("case_id, file_name, description, created_at").in("case_id", caseIds)
      : Promise.resolve({ data: [] as unknown[] }),
  ]);

  const interactions = interactionsRes.data ?? [];
  const letters = lettersRes.data ?? [];
  const reminders = remindersRes.data ?? [];
  const evidence = evidenceRes.data ?? [];

  const payload = {
    exported_at: new Date().toISOString(),
    profile,
    cases: (cases ?? []).map((row) => ({
      case: row,
      organisation: row.organisations?.name ?? null,
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
