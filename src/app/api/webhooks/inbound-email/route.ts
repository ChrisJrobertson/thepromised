import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/admin";

function parseSender(from: string) {
  const match = from.match(/^(.*?)\s*<.*>$/);
  if (match?.[1]) return match[1].replace(/(^"|"$)/g, "").trim();
  return from;
}

function extractAlias(to: string) {
  const first = to.split(",")[0]?.trim() ?? "";
  const local = first.split("@")[0] ?? "";
  return local.toLowerCase();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const to = String(formData.get("to") ?? "");
  const from = String(formData.get("from") ?? "");
  const subject = String(formData.get("subject") ?? "");
  const text = String(formData.get("text") ?? "");
  const html = String(formData.get("html") ?? "");

  const alias = extractAlias(to);
  if (!alias.startsWith("case-")) {
    return NextResponse.json({ error: "Invalid alias" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, user_id, title")
    .eq("inbound_email_alias", alias)
    .maybeSingle();
  if (!caseRow) {
    return NextResponse.json({ error: "Case not found for alias" }, { status: 404 });
  }

  const sender = parseSender(from);
  const body = (text || html || "").slice(0, 2000);
  const summary = `Inbound email reply\nSubject: ${subject || "No subject"}\n\n${body}`.slice(0, 2000);
  const now = new Date().toISOString();

  await supabase.from("interactions").insert({
    case_id: caseRow.id,
    user_id: caseRow.user_id,
    interaction_date: now,
    channel: "email",
    direction: "inbound",
    contact_name: sender || null,
    summary,
    outcome: "other",
  });

  await supabase
    .from("cases")
    .update({
      last_interaction_date: now,
      response_received: true,
      response_received_at: now,
    })
    .eq("id", caseRow.id);

  await supabase
    .from("reminders")
    .update({ is_sent: true, is_dismissed: true })
    .eq("case_id", caseRow.id)
    .eq("user_id", caseRow.user_id)
    .in("reminder_type", ["response_approaching", "response_due", "response_overdue"]);

  await supabase.from("reminders").insert({
    user_id: caseRow.user_id,
    case_id: caseRow.id,
    reminder_type: "notification",
    title: "Company replied to your complaint",
    description: `${sender || "The company"} replied: ${subject || "No subject"}`,
    due_date: now,
    is_sent: false,
  });

  return NextResponse.json({ ok: true });
}
