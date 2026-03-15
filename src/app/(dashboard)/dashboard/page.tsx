// NOTE: Run POST /api/seed with SEED_SECRET to populate organisations and escalation rules
// NOTE: Run npx tsx src/lib/stripe/setup.ts to create Stripe products
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = { title: "Dashboard | TheyPromised" };

import { differenceInDays, format } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  AlertTriangle,
  Download,
  FileText,
  FolderKanban,
  Mail,
  MessageSquare,
  Phone,
  PlusCircle,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    { count: totalCases },
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
      .or(
        "status.eq.open,status.eq.escalated,status.eq.in_progress,status.eq.OPEN,status.eq.ESCALATED,status.eq.IN_PROGRESS,status.eq.REVIEW"
      ),
    supabase
      .from("cases")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("reminders")
      .select("id, title, due_date, case_id")
      .eq("user_id", userId)
      .eq("is_dismissed", false)
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("interactions")
      .select("id, summary, interaction_date, case_id, channel")
      .eq("user_id", userId)
      .order("interaction_date", { ascending: false })
      .limit(10),
    // Open promises: has promises_made text, not fulfilled (null or false), and has a deadline
    supabase
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("promises_made", "is", null)
      .neq("promises_made", "")
      .or("promise_fulfilled.is.null,promise_fulfilled.eq.false")
      .not("promise_deadline", "is", null),
    // Overdue: has promise, not fulfilled (null or false), deadline has passed
    supabase
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("promises_made", "is", null)
      .neq("promises_made", "")
      .or("promise_fulfilled.is.null,promise_fulfilled.eq.false")
      .not("promise_deadline", "is", null)
      .lt("promise_deadline", now),
    // Resolved/closed cases with compensation
    supabase
      .from("cases")
      .select("id, compensation_received")
      .eq("user_id", userId)
      .or("status.eq.resolved,status.eq.RESOLVED,status.eq.closed,status.eq.CLOSED"),
    // Cases approaching or past the 8-week escalation window
    supabase
      .from("cases")
      .select(
        "id, title, first_contact_date, escalation_deadline, custom_organisation_name, organisations(name)"
      )
      .eq("user_id", userId)
      .or(
        "status.eq.open,status.eq.escalated,status.eq.in_progress,status.eq.OPEN,status.eq.ESCALATED,status.eq.IN_PROGRESS,status.eq.REVIEW"
      )
      .not("first_contact_date", "is", null)
      .limit(20)
      .returns<
        {
          id: string;
          title: string;
          first_contact_date: string | null;
          escalation_deadline: string | null;
          custom_organisation_name: string | null;
          organisations: { name: string } | null;
        }[]
      >(),
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
    organisations: { name: string } | null;
  };

  type EscalationAlert = EscalationCandidate & {
    daysSinceContact: number;
    urgency: "deadline_passed" | "deadline_soon" | "approaching_window";
    orgName: string;
  };

  const candidates = (escalationCandidates ?? []) as EscalationCandidate[];

  const escalationAlerts: EscalationAlert[] = candidates
    .map((c) => {
      const firstContact = c.first_contact_date ? new Date(c.first_contact_date) : null;
      const daysSinceContact = firstContact ? differenceInDays(today, firstContact) : 0;
      const escalationDeadline = c.escalation_deadline ? new Date(c.escalation_deadline) : null;
      const orgName = c.organisations?.name ?? c.custom_organisation_name ?? "";

      const deadlinePassed = escalationDeadline && escalationDeadline < today;
      const deadlineSoon =
        escalationDeadline &&
        escalationDeadline <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const approachingWindow = daysSinceContact >= 42 && daysSinceContact <= 63;

      const isAlert = deadlinePassed || deadlineSoon || approachingWindow;
      if (!isAlert) return null;

      const urgency: EscalationAlert["urgency"] = deadlinePassed
        ? "deadline_passed"
        : deadlineSoon
          ? "deadline_soon"
          : "approaching_window";

      return { ...c, daysSinceContact, urgency, orgName };
    })
    .filter((x): x is EscalationAlert => x !== null);

  const CHANNEL_ICONS: Record<string, { icon: React.ElementType; colour: string; bg: string }> = {
    phone: { icon: Phone, colour: "text-blue-600", bg: "bg-blue-100" },
    email: { icon: Mail, colour: "text-purple-600", bg: "bg-purple-100" },
    letter: { icon: FileText, colour: "text-slate-600", bg: "bg-slate-100" },
    webchat: { icon: MessageSquare, colour: "text-green-600", bg: "bg-green-100" },
    in_person: { icon: Users, colour: "text-orange-600", bg: "bg-orange-100" },
    social_media: { icon: Share2, colour: "text-pink-600", bg: "bg-pink-100" },
    app: { icon: MessageSquare, colour: "text-indigo-600", bg: "bg-indigo-100" },
    other: { icon: FileText, colour: "text-slate-600", bg: "bg-slate-100" },
  };

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
        <Card className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <AlertTriangle className="size-5" />
              Escalation Alerts ({escalationAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {escalationAlerts.map((alert) => {
                return (
                  <li
                    className="flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-white px-3 py-2 dark:bg-amber-900/20"
                    key={alert.id}
                  >
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      {alert.orgName && (
                        <p className="text-xs text-muted-foreground">{alert.orgName}</p>
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
                            {alert.daysSinceContact} days since first contact — you may now be able to
                            escalate
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge
                        className={
                          alert.urgency === "deadline_passed"
                            ? "bg-red-600 text-white"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                        variant={alert.urgency === "deadline_passed" ? "default" : "outline"}
                      >
                        {alert.urgency === "deadline_passed"
                          ? "Action Required"
                          : alert.urgency === "deadline_soon"
                            ? "Deadline Soon"
                            : "Action Required"}
                      </Badge>
                      <Link href={`/cases/${alert.id}`}>
                        <Button className="h-7 px-2 text-xs" size="sm" variant="outline">
                          View Case →
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Onboarding card for new users */}
      {(totalCases ?? 0) === 0 && (
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to hold them to account?</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Which company has let you down? Start a case and we&apos;ll help you track every call,
              email, and broken promise — then build the evidence to make them listen.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/cases/new">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Start Your First Case
                </Button>
              </Link>
              <Link href="/escalation-guides">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  Browse Escalation Guides
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat cards — only show when user has cases */}
      {(totalCases ?? 0) > 0 && <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="border-l-4 border-blue-500 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600">
              <FolderKanban className="size-4 text-blue-600" /> Active Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{activeCases ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-amber-500 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600">
              <AlertTriangle className="size-4 text-amber-600" /> Open Promises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{openPromises ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-red-500 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600">
              <AlertTriangle className="size-4 text-red-600" /> Overdue Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{overdueActions ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-green-500 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="size-4 text-green-600" /> Cases Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
            {compensationTotal > 0 && (
              <p className="mt-0.5 text-xs text-green-600">
                £{compensationTotal.toLocaleString("en-GB")} recovered
              </p>
            )}
          </CardContent>
        </Card>
      </div>}

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
                {recentInteractions.map((interaction) => {
                  const channelInfo =
                    CHANNEL_ICONS[(interaction as { channel?: string }).channel ?? ""] ??
                    CHANNEL_ICONS.other;
                  const ChannelIcon = channelInfo.icon;
                  return (
                    <li className="flex items-start gap-3 rounded-md border p-3 text-sm" key={interaction.id}>
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${channelInfo.bg}`}
                      >
                        <ChannelIcon className={`h-3.5 w-3.5 ${channelInfo.colour}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2">{interaction.summary}</p>
                        <p className="text-muted-foreground">
                          {format(new Date(interaction.interaction_date), "dd/MM/yyyy HH:mm", {
                            locale: enGB,
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
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
          <Link href="/cases/new">
            <Button className="gap-2 bg-primary text-white hover:bg-teal-600">
              <PlusCircle className="h-4 w-4" />
              Start New Case
            </Button>
          </Link>
          <DashboardQuickActions />
          <Link href="/cases">
            <Button className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50" variant="outline">
              <FileText className="h-4 w-4" />
              Generate Letter
            </Button>
          </Link>
          <Link href="/cases">
            <Button className="gap-2" variant="outline">
              <Download className="h-4 w-4" />
              Export Case File
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
