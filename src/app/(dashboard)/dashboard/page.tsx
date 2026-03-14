import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { AlertTriangle, FolderKanban, HandCoins, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? "";

  const [{ count: activeCases }, { data: reminders }, { data: recentInteractions }] =
    await Promise.all([
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
    ]);

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
          <CardContent className="text-3xl font-bold">0</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" /> Overdue Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">0</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-green-600" /> Cases Resolved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">0</CardContent>
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
          <Link className="rounded-md border px-4 py-2 text-sm" href="/cases">
            Log an Interaction
          </Link>
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
