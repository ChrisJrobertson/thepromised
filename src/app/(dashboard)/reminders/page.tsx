import { isPast, isToday, addDays } from "date-fns";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Reminder } from "@/types/database";

import { RemindersClient } from "./RemindersClient";

export const metadata = { title: "Reminders" };

type ReminderWithCase = Reminder & {
  cases: { title: string; id: string } | null;
};

export default async function RemindersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: remindersRaw } = await supabase
    .from("reminders")
    .select("*, cases(id, title)")
    .eq("user_id", user.id)
    .eq("is_dismissed", false)
    .order("due_date", { ascending: true });

  const { data: casesRaw } = await supabase
    .from("cases")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("status", "open")
    .order("updated_at", { ascending: false });

  const reminders = (remindersRaw ?? []) as ReminderWithCase[];
  const cases = (casesRaw ?? []) as { id: string; title: string }[];

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const weekEnd = addDays(now, 7);

  const grouped = {
    overdue: reminders.filter(
      (r) => isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date))
    ),
    today: reminders.filter((r) => isToday(new Date(r.due_date))),
    thisWeek: reminders.filter((r) => {
      const d = new Date(r.due_date);
      return d > todayEnd && d <= weekEnd;
    }),
    later: reminders.filter((r) => new Date(r.due_date) > weekEnd),
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reminders</h1>
          <p className="text-sm text-muted-foreground">
            {reminders.length} active reminder{reminders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <RemindersClient
        cases={cases}
        grouped={grouped}
        userId={user.id}
      />
    </div>
  );
}
