// NOTE: Run POST /api/seed with SEED_SECRET to populate organisations and escalation rules
// NOTE: Run npx tsx src/lib/stripe/setup.ts to create Stripe products
import { differenceInDays, format } from "date-fns";
import { enGB } from "date-fns/locale";
import { AlertTriangle, FolderKanban, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? "";
  const now = new Date().toISOString();

  const [
    { count: activeCases },
    { data: reminders },
    { data: recentInteractions },
    { count: openPromises },
    { count: overdueActions },
    { data: resolvedData },
    { data: escalationCandidates },
  ] = await Promise.all([
    supabase
      .from("cases")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["open", "escalated"]),
    supabase
      .from("reminders")
      .select("id, title, due_date, case_id")
      .eq("user_id", userId)
      .eq("is_dismissed", false)
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("interactions")
      .select("id, summary, interaction_date, case_id")
      .eq("user_id", userId)
      .order("interaction_date", { ascending: false })
      .limit(10),
    // Open promises: has promises_made text, not fulfilled, and has a deadline
    supabase
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("promises_made", "is", null)
      .neq("promises_made", "")
      .or("promise_fulfilled.is.null,promise_fulfilled.eq.false")
      .not("promise_deadline", "is", null),
    // Overdue: has promise, not fulfilled, deadline has passed
    supabase
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("promises_made", "is", null)
      .is("promise_fulfilled", null)
      .lt("promise_deadline", now),
    // Resolved cases with compensation
    supabase
      .from("cases")
      .select("id, compensation_received")
      .eq("user_id", userId)
      .eq("status", "resolved"),
    // Cases approaching or past the 8-week escalation window
    supabase
      .from("cases")
      .select(
        "id, title, first_contact_date, escalation_deadline, custom_organisation_name, organisations(name)"
      )
      .eq("user_id", userId)
      .in("status", ["open", "escalated"])
      .limit(100),
  ]);

  const resolvedCount = resolvedData?.length ?? 0;
  const compensationTotal = (resolvedData ?? []).reduce(
    (sum, c) => sum + (c.compensation_received ?? 0),
    0
  );

  const today = new Date();

  type EscalationCandidate = {
    id: string;
    title: string;
    first_contact_date: string | null;
    escalation_deadline: string | null;
    custom_organisation_name: string | null;
    organisations: { name: string } | { name: string }[] | null;
  };

  type EscalationAlert = {
    id: string;
    title: string;
    first_contact_date: string | null;
    escalation_deadline: string | null;
    custom_organisation_name: string | null;
    organisations: { name: string } | null;
    daysSinceContact: number;
    urgency: "deadline_passed" | "deadline_soon" | "approaching_window";
  };

  const typedEscalationCandidates = (escalationCandidates ?? []) as EscalationCandidate[];

  const escalationAlerts: EscalationAlert[] = typedEscalationCandidates
    .map((c) => {
      const firstContact = c.first_contact_date
        ? new Date(c.first_contact_date)
        : null;
      const daysSinceContact = firstContact
        ? differenceInDays(today, firstContact)
        : 0;
      const escalationDeadline = c.escalation_deadline
        ? new Date(c.escalation_deadline)
        : null;
      const organisationRow = Array.isArray(c.organisations)
        ? c.organisations[0] ?? null
        : c.organisations;
      const orgName =
        organisationRow?.name ??
        c.custom_organisation_name ??
        "";

      const deadlinePassed =
        escalationDeadline && escalationDeadline < today;
      const deadlineSoon =
        escalationDeadline &&
        escalationDeadline <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const approachingWindow =
        daysSinceContact >= 42 && daysSinceContact <= 56;

      const isAlert = deadlinePassed || deadlineSoon || approachingWindow;
      if (!isAlert) return null;

      const urgency: EscalationAlert["urgency"] = deadlinePassed
        ? "deadline_passed"
        : deadlineSoon
          ? "deadline_soon"
          : "approaching_window";

      return {
        id: c.id,
        title: c.title,
        first_contact_date: c.first_contact_date,
        escalation_deadline: c.escalation_deadline,
        custom_organisation_name: c.custom_organisation_name,
        organisations: organisationRow,
        daysSinceContact,
        urgency,
        orgName,
      };
    })
    .filter(Boolean) as EscalationAlert[];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: enGB })}
          </p>
        </CardHeader>
      </Card>

      {/* Escalation Alerts */}
      {escalationAlerts.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <AlertTriangle className="size-5" />
              Escalation Alerts ({escalationAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {escalationAlerts.map((alert) => {
                const orgName =
                  alert.organisations?.name ??
                  alert.custom_organisation_name ??
                  "";
                return (
                  <li
                    className="flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-white px-3 py-2 dark:bg-amber-900/20"
                    key={alert.id}
                  >
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      {orgName && (
                        <p className="text-xs text-muted-foreground">{orgName}</p>
                      )}
                      {alert.first_contact_date && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {alert.daysSinceContact} days since first complaint
                        </p>
                      )}
                      <p className="mt-0.5 text-xs">
                        {alert.urgency === "deadline_passed" ? (
                          <span className="font-medium text-red-600">
                            Deadline passed — take action now
                          </span>
                        ) : alert.urgency === "deadline_soon" ? (
                          <span className="font-medium text-amber-700">
                            Escalation deadline within 7 days
                          </span>
                        ) : (
                          <span className="text-amber-700">
                            {alert.daysSinceContact} days since first contact — you may now be able to escalate
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Badge
                        className={
                          alert.urgency === "deadline_passed"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                        variant="outline"
                      >
                        {alert.urgency === "deadline_passed"
                          ? "Urgent"
                          : alert.urgency === "deadline_soon"
                            ? "Deadline Soon"
                            : "Action Required"}
                      </Badge>
                      <div className="mt-1 text-right">
                        <Link
                          className="text-xs text-primary underline"
                          href={`/cases/${alert.id}`}
                        >
                          View Case →
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="size-4 text-primary" /> Active Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{activeCases ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-accent" /> Open Promises
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{openPromises ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" /> Overdue Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{overdueActions ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-green-600" /> Cases Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{resolvedCount}</p>
            {compensationTotal > 0 && (
              <p className="mt-0.5 text-xs text-green-600">
                £{compensationTotal.toLocaleString("en-GB")} recovered
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Reminders</CardTitle>
            <Link className="text-sm text-primary underline" href="/reminders">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {reminders?.length ? (
              <ul className="space-y-3">
                {reminders.map((reminder) => (
                  <li className="rounded-md border p-3 text-sm" key={reminder.id}>
                    <p className="font-medium">{reminder.title}</p>
                    <p className="text-muted-foreground">
                      Due {format(new Date(reminder.due_date), "dd/MM/yyyy HH:mm", { locale: enGB })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No reminders due soon.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInteractions?.length ? (
              <ul className="space-y-3">
                {recentInteractions.map((interaction) => (
                  <li className="rounded-md border p-3 text-sm" key={interaction.id}>
                    <p className="line-clamp-2">{interaction.summary}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(interaction.interaction_date), "dd/MM/yyyy HH:mm", {
                        locale: enGB,
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No interactions logged yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link className="rounded-md bg-primary px-4 py-2 text-sm text-white" href="/cases/new">
            Start New Case
          </Link>
          <DashboardQuickActions />
          <Link className="rounded-md border px-4 py-2 text-sm" href="/cases">
            Generate Letter
          </Link>
          <Link className="rounded-md border px-4 py-2 text-sm" href="/cases">
            Export Case File
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
