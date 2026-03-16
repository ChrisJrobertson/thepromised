import { differenceInDays, format, isPast, isToday } from "date-fns";
import { enGB } from "date-fns/locale";
import { NextResponse } from "next/server";

import { sendReminderDigest, sendEscalationAlert, sendPromiseBroken } from "@/lib/email/send";
import { EMAIL_FROM, getResendClient } from "@/lib/email/client";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { ReminderInsert } from "@/types/database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const now = new Date();
  const results = {
    reminder_emails_sent: 0,
    escalation_alerts_created: 0,
    escalation_emails_sent: 0,
    promise_alerts_created: 0,
    promise_emails_sent: 0,
    deadline_alerts_created: 0,
    b2b_sla_alerts_sent: 0,
  };

  // Reset AI credits monthly
  await supabase
    .from("profiles")
    .update({
      ai_suggestions_used: 0,
      ai_letters_used: 0,
      ai_credits_used: 0,
      ai_credits_reset_at: now.toISOString(),
    })
    .lt("ai_credits_reset_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Revert temporary pack Pro access after 7 days
  const nowIso = now.toISOString();
  await supabase
    .from("profiles")
    .update({
      subscription_tier: "free",
      subscription_status: "active",
      pack_pro_expires_at: null,
      pack_access_case_id: null,
      pack_source_pack_id: null,
    })
    .eq("subscription_status", "pack_temporary")
    .lt("pack_pro_expires_at", nowIso);

  // ── 1. Send daily reminder digest emails ────────────────────────────────────
  // Get all users who have reminders due today/overdue and have email reminders enabled
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .neq("subscription_tier", "free");

  type UserProfile = {
    id: string;
    email: string;
    full_name: string | null;
  };

  for (const userRaw of (allUsers ?? [])) {
    const user = userRaw as UserProfile;

    // Check notification preferences (gracefully handle missing column)
    const { data: notifRaw } = await supabase
      .from("profiles")
      .select("notification_preferences")
      .eq("id", user.id)
      .maybeSingle();

    const notifPrefs = (notifRaw as unknown as { notification_preferences: Record<string, boolean> | null } | null)
      ?.notification_preferences;

    // Default to sending if preferences not set
    if (notifPrefs && notifPrefs.email_reminders === false) continue;

    // Find due/overdue reminders for this user
    const { data: remindersRaw } = await supabase
      .from("reminders")
      .select("*, cases(id, title)")
      .eq("user_id", user.id)
      .eq("is_dismissed", false)
      .eq("is_sent", false)
      .lte("due_date", now.toISOString());

    type ReminderWithCase = {
      id: string;
      case_id: string;
      title: string;
      description: string | null;
      due_date: string;
      cases: { id: string; title: string } | null;
    };

    const reminders = (remindersRaw ?? []) as ReminderWithCase[];
    if (reminders.length === 0) continue;

    const reminderItems = reminders.map((r) => ({
      title: r.title,
      description: r.description,
      dueDate: format(new Date(r.due_date), "d MMMM yyyy", { locale: enGB }),
      caseTitle: r.cases?.title ?? "Unknown case",
      caseUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app"}/cases/${r.case_id}`,
      isOverdue: !isToday(new Date(r.due_date)) && isPast(new Date(r.due_date)),
    }));

    const emailResult = await sendReminderDigest(
      user.email,
      user.full_name ?? "there",
      reminderItems
    );

    if (emailResult.success) {
      results.reminder_emails_sent++;
      // Mark as sent
      const ids = reminders.map((r) => r.id);
      await supabase
        .from("reminders")
        .update({ is_sent: true })
        .in("id", ids);
    }
  }

  // ── 2. Escalation window alerts (6w, 7w, 8w from first_contact_date) ────────
  const escalationAlertDays = [42, 49, 56]; // 6, 7, 8 weeks

  const { data: openCasesRaw } = await supabase
    .from("cases")
    .select("id, user_id, title, first_contact_date, escalation_stage, custom_organisation_name, organisation_id, category")
    .eq("status", "open")
    .in("escalation_stage", ["initial", "formal_complaint"])
    .not("first_contact_date", "is", null);

  type OpenCase = {
    id: string;
    user_id: string;
    title: string;
    first_contact_date: string | null;
    escalation_stage: string;
    custom_organisation_name: string | null;
    organisation_id: string | null;
    category: string;
  };

  const openCases = (openCasesRaw ?? []) as OpenCase[];

  for (const c of openCases) {
    if (!c.first_contact_date) continue;
    const daysOpen = differenceInDays(now, new Date(c.first_contact_date));

    for (const targetDays of escalationAlertDays) {
      if (Math.abs(daysOpen - targetDays) > 1) continue;

      const weeksTarget = targetDays / 7;
      const reminderTitle = `${weeksTarget}-week escalation window for "${c.title}"`;

      // Check for duplicate
      const { data: existing } = await supabase
        .from("reminders")
        .select("id")
        .eq("case_id", c.id)
        .eq("title", reminderTitle)
        .maybeSingle();

      if (existing) continue;

      // Get org name
      let orgName = c.custom_organisation_name ?? "Unknown";
      let ombudsmanName = "the relevant ombudsman";
      let ombudsmanUrl = "https://www.ombudsmanassociation.org/find-ombudsman";

      if (c.organisation_id) {
        const { data: orgRow } = await supabase
          .from("organisations")
          .select("name, ombudsman_name, ombudsman_url")
          .eq("id", c.organisation_id)
          .maybeSingle();
        if (orgRow) {
          const org = orgRow as { name: string; ombudsman_name: string | null; ombudsman_url: string | null };
          orgName = org.name;
          ombudsmanName = org.ombudsman_name ?? ombudsmanName;
          ombudsmanUrl = org.ombudsman_url ?? ombudsmanUrl;
        }
      }

      // If ombudsman not on org, look up escalation rules
      if (ombudsmanName === "the relevant ombudsman") {
        const { data: escalationRule } = await supabase
          .from("escalation_rules")
          .select("regulatory_body, regulatory_url")
          .eq("category", c.category)
          .eq("stage", "ombudsman")
          .maybeSingle();
        if (escalationRule) {
          const rule = escalationRule as { regulatory_body: string | null; regulatory_url: string | null };
          ombudsmanName = rule.regulatory_body ?? ombudsmanName;
          ombudsmanUrl = rule.regulatory_url ?? ombudsmanUrl;
        }
      }

      const description = targetDays === 56
        ? `You can now escalate your ${orgName} complaint to ${ombudsmanName}.`
        : `Escalation window approaching for your ${orgName} complaint.`;

      await supabase.from("reminders").insert({
        user_id: c.user_id,
        case_id: c.id,
        reminder_type: "escalation_window",
        title: reminderTitle,
        description,
        due_date: now.toISOString(),
      } satisfies ReminderInsert);

      results.escalation_alerts_created++;

      // Send email if user has notifications enabled
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("email, full_name, subscription_tier")
        .eq("id", c.user_id)
        .maybeSingle();

      if (userProfile) {
        const profile = userProfile as { email: string; full_name: string | null; subscription_tier: string };
        if (profile.subscription_tier !== "free") {
          const emailResult = await sendEscalationAlert(
            profile.email,
            profile.full_name ?? "there",
            c.title,
            orgName,
            weeksTarget,
            ombudsmanName,
            ombudsmanUrl,
            c.id
          );
          if (emailResult.success) results.escalation_emails_sent++;
        }
      }
    }
  }

  // ── 3. Expired escalation deadlines ─────────────────────────────────────────
  const { data: casesWithDeadlinesRaw } = await supabase
    .from("cases")
    .select("id, user_id, title, escalation_deadline, custom_organisation_name")
    .not("escalation_deadline", "is", null)
    .lt("escalation_deadline", now.toISOString())
    .in("status", ["open", "escalated"]);

  type DeadlineCase = {
    id: string;
    user_id: string;
    title: string;
    escalation_deadline: string | null;
    custom_organisation_name: string | null;
  };

  for (const c of (casesWithDeadlinesRaw ?? []) as DeadlineCase[]) {
    if (!c.escalation_deadline) continue;
    const reminderTitle = `Escalation deadline has passed for "${c.title}"`;

    const { data: existing } = await supabase
      .from("reminders")
      .select("id")
      .eq("case_id", c.id)
      .eq("title", reminderTitle)
      .maybeSingle();

    if (existing) continue;

    const orgName = c.custom_organisation_name ?? "Unknown";
    await supabase.from("reminders").insert({
      user_id: c.user_id,
      case_id: c.id,
      reminder_type: "escalation_window",
      title: reminderTitle,
      description: `The escalation deadline for your case against ${orgName} has passed. Review your escalation guide for next steps.`,
      due_date: now.toISOString(),
    } satisfies ReminderInsert);
    results.deadline_alerts_created++;
  }

  // ── 4. Promises past their deadline ─────────────────────────────────────────
  const { data: overduePromises } = await supabase
    .from("interactions")
    .select("id, case_id, user_id, promises_made, promise_deadline")
    .not("promises_made", "is", null)
    .is("promise_fulfilled", null)
    .not("promise_deadline", "is", null)
    .lt("promise_deadline", now.toISOString());

  type OverduePromise = {
    id: string;
    case_id: string;
    user_id: string;
    promises_made: string | null;
    promise_deadline: string | null;
  };

  for (const interaction of (overduePromises ?? []) as OverduePromise[]) {
    if (!interaction.promise_deadline || !interaction.promises_made) continue;

    const { data: existing } = await supabase
      .from("reminders")
      .select("id")
      .eq("interaction_id", interaction.id)
      .eq("title", "Overdue promise in your case")
      .maybeSingle();

    if (existing) continue;

    await supabase.from("reminders").insert({
      user_id: interaction.user_id,
      case_id: interaction.case_id,
      interaction_id: interaction.id,
      reminder_type: "promise_deadline",
      title: "Overdue promise in your case",
      description: `They promised: "${interaction.promises_made}". Please mark it as kept or broken.`,
      due_date: now.toISOString(),
    } satisfies ReminderInsert);

    results.promise_alerts_created++;

    // Look up the case for email context
    const { data: caseRow } = await supabase
      .from("cases")
      .select("title, custom_organisation_name, organisation_id")
      .eq("id", interaction.case_id)
      .maybeSingle();

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("email, full_name, subscription_tier")
      .eq("id", interaction.user_id)
      .maybeSingle();

    if (caseRow && userProfile) {
      const profile = userProfile as { email: string; full_name: string | null; subscription_tier: string };
      const caseData = caseRow as { title: string; custom_organisation_name: string | null; organisation_id: string | null };

      if (profile.subscription_tier !== "free") {
        let orgName = caseData.custom_organisation_name ?? "Unknown organisation";

        if (caseData.organisation_id) {
          const { data: orgRow } = await supabase
            .from("organisations")
            .select("name")
            .eq("id", caseData.organisation_id)
            .maybeSingle();
          if (orgRow) orgName = (orgRow as { name: string }).name;
        }

        const emailResult = await sendPromiseBroken(
          profile.email,
          profile.full_name ?? "there",
          caseData.title,
          orgName,
          interaction.promises_made,
          format(new Date(interaction.promise_deadline), "d MMMM yyyy", { locale: enGB }),
          interaction.case_id
        );
        if (emailResult.success) results.promise_emails_sent++;
      }
    }
  }

  // ── 5. B2B pipeline SLA alerts for admin ops ───────────────────────────────
  const [staleEnquiriesRes, staleContactedRes, stalePilotRes] = await Promise.all([
    supabase
      .from("business_enquiries")
      .select("id, company_name, contact_name, email, created_at")
      .lt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })
      .limit(30),
    supabase
      .from("b2b_pilots")
      .select("id, company_name, contact_name, contact_email, status, updated_at")
      .eq("status", "contacted")
      .lt("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("updated_at", { ascending: true })
      .limit(30),
    supabase
      .from("b2b_pilots")
      .select("id, company_name, contact_name, contact_email, status, updated_at")
      .eq("status", "pilot_started")
      .lt("updated_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("updated_at", { ascending: true })
      .limit(30),
  ]);

  const staleEnquiries = staleEnquiriesRes.data ?? [];
  const staleContacted = staleContactedRes.data ?? [];
  const stalePilots = stalePilotRes.data ?? [];

  if (staleEnquiries.length || staleContacted.length || stalePilots.length) {
    const to = process.env.B2B_ALERT_EMAIL ?? "support@theypromised.app";
    const resend = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

    const listItems = (rows: Array<Record<string, string | null>>, label: string) =>
      rows
        .map(
          (row) =>
            `<li><strong>${row.company_name ?? "Unknown"}</strong> — ${
              row.contact_name ?? row.contact_email ?? "No contact"
            }</li>`,
        )
        .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h2>B2B pipeline SLA alerts</h2>
        <p>Automated reminder from TheyPromised cron.</p>
        <p><a href="${appUrl}/admin/b2b">Open B2B admin board</a></p>
        ${
          staleEnquiries.length
            ? `<h3>Uncontacted enquiries >48h (${staleEnquiries.length})</h3><ul>${listItems(
                staleEnquiries as Array<Record<string, string | null>>,
                "enquiries",
              )}</ul>`
            : ""
        }
        ${
          staleContacted.length
            ? `<h3>Contacted but no pilot progress >7d (${staleContacted.length})</h3><ul>${listItems(
                staleContacted as Array<Record<string, string | null>>,
                "contacted",
              )}</ul>`
            : ""
        }
        ${
          stalePilots.length
            ? `<h3>Pilots started but no review >30d (${stalePilots.length})</h3><ul>${listItems(
                stalePilots as Array<Record<string, string | null>>,
                "pilots",
              )}</ul>`
            : ""
        }
      </div>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `B2B SLA alerts: ${staleEnquiries.length + staleContacted.length + stalePilots.length} action(s)`,
      html,
    });
    results.b2b_sla_alerts_sent = 1;
  }

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    ...results,
  });
}
