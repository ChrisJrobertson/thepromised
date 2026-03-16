import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { getResendClient } from "@/lib/email/client";
import { createClient } from "@/lib/supabase/server";

function emailFromAddress() {
  const verified = process.env.RESEND_DOMAIN_VERIFIED === "true";
  if (verified) {
    return process.env.RESEND_FROM_EMAIL
      ? `TheyPromised <${process.env.RESEND_FROM_EMAIL}>`
      : "TheyPromised <complaints@theypromised.app>";
  }
  return "TheyPromised <onboarding@resend.dev>";
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: letter, error: letterError } = await supabase
    .from("letters")
    .select("id, case_id, user_id, letter_type, subject, body, status, sent_to_email, delivery_status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (letterError || !letter) {
    return NextResponse.json({ error: "Letter not found" }, { status: 404 });
  }

  if (!(letter.status === "draft" || letter.delivery_status === "failed")) {
    return NextResponse.json({ error: "This letter has already been sent." }, { status: 400 });
  }

  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, user_id, title, organisation_id, response_deadline, inbound_email_alias")
    .eq("id", letter.case_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!caseRow) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const { data: org } = caseRow.organisation_id
    ? await supabase
        .from("organisations")
        .select("name, complaint_email")
        .eq("id", caseRow.organisation_id)
        .maybeSingle()
    : { data: null };

  const recipientEmail = letter.sent_to_email ?? org?.complaint_email ?? null;
  if (!recipientEmail) {
    return NextResponse.json(
      { error: "No complaint email found. Add one in case settings or export as PDF instead." },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();
  const replyTo = profile?.email ?? user.email ?? undefined;
  const companyName = org?.name ?? caseRow.title;
  const subject = letter.subject || `Formal Complaint — ${companyName}`;
  const referenceText = caseRow.title ? `<p><strong>Reference:</strong> ${caseRow.title}</p>` : "";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      ${referenceText}
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${letter.body}</pre>
      <hr style="margin: 24px 0; border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #475569;">
        This complaint was sent via TheyPromised. Please reply directly to this email.
      </p>
    </div>
  `;

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: emailFromAddress(),
      to: recipientEmail,
      replyTo,
      subject,
      html,
      tags: [
        { name: "letter_id", value: letter.id },
        { name: "case_id", value: letter.case_id },
        { name: "type", value: "complaint_letter" },
      ],
    });
    if (error) throw new Error(error.message);

    const now = new Date();
    const nowIso = now.toISOString();
    const responseWindowDays = letter.letter_type === "ombudsman_referral" ? 28 : 14;
    const responseDeadline = addDays(now, responseWindowDays).toISOString();
    const inboundAlias = caseRow.inbound_email_alias ?? `case-${nanoid(10).toLowerCase()}`;

    await supabase
      .from("letters")
      .update({
        status: "sent",
        sent_via: "email",
        sent_date: nowIso,
        delivery_status: "sent",
        sent_at: nowIso,
        sent_to_email: recipientEmail,
        resend_email_id: data?.id ?? null,
      })
      .eq("id", letter.id)
      .eq("user_id", user.id);

    await supabase.from("interactions").insert({
      case_id: caseRow.id,
      user_id: user.id,
      interaction_date: nowIso,
      channel: "email",
      direction: "outbound",
      outcome: "letter_sent",
      summary: `Letter sent via email (${letter.letter_type}) to ${recipientEmail}.`,
    });

    await supabase
      .from("cases")
      .update({
        last_interaction_date: nowIso,
        response_deadline: responseDeadline,
        response_received: false,
        inbound_email_alias: inboundAlias,
      })
      .eq("id", caseRow.id)
      .eq("user_id", user.id);

    const reminderRows = [
      {
        user_id: user.id,
        case_id: caseRow.id,
        reminder_type: "response_approaching" as const,
        title: "Response due in 2 days",
        description: `Waiting for a response from ${companyName}.`,
        due_date: addDays(new Date(responseDeadline), -2).toISOString(),
      },
      {
        user_id: user.id,
        case_id: caseRow.id,
        reminder_type: "response_due" as const,
        title: "Response due today",
        description: `The response deadline for ${companyName} is today.`,
        due_date: responseDeadline,
      },
      {
        user_id: user.id,
        case_id: caseRow.id,
        reminder_type: "response_overdue" as const,
        title: "Response overdue (1 day)",
        description: `${companyName} has not responded.`,
        due_date: addDays(new Date(responseDeadline), 1).toISOString(),
      },
      {
        user_id: user.id,
        case_id: caseRow.id,
        reminder_type: "response_overdue" as const,
        title: "Response overdue (7 days)",
        description: `${companyName} still has not responded.`,
        due_date: addDays(new Date(responseDeadline), 7).toISOString(),
      },
    ];
    await supabase.from("reminders").insert(reminderRows);

    trackServerEvent(user.id, "letter_sent", {
      letter_id: letter.id,
      case_id: letter.case_id,
      recipient: recipientEmail,
    });

    return NextResponse.json({
      ok: true,
      sent_to_email: recipientEmail,
      sent_at: nowIso,
      resend_email_id: data?.id ?? null,
      inbound_email_alias: inboundAlias,
      response_deadline: responseDeadline,
    });
  } catch (error) {
    await supabase
      .from("letters")
      .update({ delivery_status: "failed" })
      .eq("id", letter.id)
      .eq("user_id", user.id);

    const message = error instanceof Error ? error.message : "Failed to send letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
