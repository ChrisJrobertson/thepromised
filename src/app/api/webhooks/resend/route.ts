// Resend webhook — receives email delivery events (delivered, opened, bounced, complained).
// Registered in the Resend dashboard: https://www.theypromised.app/api/webhooks/resend
// Requires RESEND_WEBHOOK_SECRET set in the Resend dashboard webhook settings.

import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();

  // Verify Svix signature to prevent spoofed delivery events.
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const wh = new Webhook(secret);
    try {
      wh.verify(body, {
        "svix-id": request.headers.get("svix-id") ?? "",
        "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
        "svix-signature": request.headers.get("svix-signature") ?? "",
      });
    } catch {
      return new Response("Invalid webhook signature", { status: 401 });
    }
  }

  let payload: { type?: string; data?: { email_id?: string } } | null = null;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload?.type || !payload.data?.email_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const outreachUpdates: Record<string, string> = {};
  if (payload.type === "email.delivered") {
    outreachUpdates.status = "delivered";
    outreachUpdates.delivered_at = now;
  } else if (payload.type === "email.opened") {
    outreachUpdates.status = "opened";
    outreachUpdates.opened_at = now;
  } else if (payload.type === "email.bounced") {
    outreachUpdates.status = "bounced";
    outreachUpdates.bounced_at = now;
  } else if (payload.type === "email.complained") {
    outreachUpdates.status = "complained";
    outreachUpdates.complained_at = now;
  }

  if (Object.keys(outreachUpdates).length > 0) {
    await supabase
      .from("b2b_outreach_emails")
      .update(outreachUpdates)
      .eq("resend_email_id", payload.data.email_id);
  }

  const { data: letter } = await supabase
    .from("letters")
    .select("id, case_id, user_id")
    .eq("resend_email_id", payload.data.email_id)
    .maybeSingle();
  if (!letter) {
    return NextResponse.json({ ok: true });
  }

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
