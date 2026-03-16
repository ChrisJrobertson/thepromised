import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("cases")
    .update({ response_received: true, response_received_at: now })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("reminders")
    .update({ is_sent: true, is_dismissed: true })
    .eq("case_id", id)
    .eq("user_id", user.id)
    .in("reminder_type", ["response_approaching", "response_due", "response_overdue"]);

  return NextResponse.json({ ok: true });
}
