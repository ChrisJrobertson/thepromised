// Register this webhook URL in the Resend dashboard: https://www.theypromised.app/api/webhooks/resend

import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        type?: string;
        data?: { email_id?: string };
      }
    | null;
  if (!payload?.type || !payload.data?.email_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: letter } = await supabase
    .from("letters")
    .select("id, case_id, user_id")
    .eq("resend_email_id", payload.data.email_id)
    .maybeSingle();
  if (!letter) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const updates: Record<string, string> = {};

  if (payload.type === "email.delivered") {
    updates.delivery_status = "delivered";
    updates.delivered_at = now;
  } else if (payload.type === "email.opened") {
    updates.delivery_status = "opened";
    updates.opened_at = now;
  } else if (payload.type === "email.bounced" || payload.type === "email.complained") {
    updates.delivery_status = "bounced";
    updates.bounced_at = now;
  } else {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("letters").update(updates).eq("id", letter.id);

  if (payload.type === "email.opened") {
    await supabase.from("reminders").insert({
      user_id: letter.user_id,
      case_id: letter.case_id,
      reminder_type: "notification",
      title: "Your complaint email was opened",
      description: "The recipient opened your complaint email.",
      due_date: now,
      is_sent: false,
    });
  }

  if (payload.type === "email.bounced" || payload.type === "email.complained") {
    await supabase.from("reminders").insert({
      user_id: letter.user_id,
      case_id: letter.case_id,
      reminder_type: "notification",
      title: "Your complaint email bounced — check the address",
      description: "Delivery failed. Review the complaint email address before resending.",
      due_date: now,
      is_sent: false,
    });
  }

  return NextResponse.json({ ok: true });
}
