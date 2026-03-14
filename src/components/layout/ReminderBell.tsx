"use client";

import { differenceInDays, format, isPast } from "date-fns";
import { enGB } from "date-fns/locale";
import { Bell, CheckCheck, Clock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";

type Reminder = {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  due_date: string;
  reminder_type: string;
  is_dismissed: boolean | null;
  is_sent: boolean | null;
};

function urgencyClass(dueDate: string): string {
  const date = new Date(dueDate);
  if (isPast(date)) return "text-red-600";
  const days = differenceInDays(date, new Date());
  if (days === 0) return "text-red-500";
  if (days <= 2) return "text-amber-600";
  return "text-muted-foreground";
}

export function ReminderBell({ count: initialCount = 0 }: { count?: number }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open && !loaded) {
      fetchReminders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function fetchReminders() {
    const supabase = createClient();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_dismissed", false)
      .lte("due_date", sevenDaysFromNow.toISOString())
      .order("due_date", { ascending: true })
      .limit(10);

    if (data) {
      setReminders(data as Reminder[]);
      setCount(data.length);
      setLoaded(true);
    }
  }

  async function dismissReminder(id: string) {
    const supabase = createClient();
    await supabase
      .from("reminders")
      .update({ is_dismissed: true })
      .eq("id", id);

    setReminders((prev) => prev.filter((r) => r.id !== id));
    setCount((prev) => Math.max(0, prev - 1));
  }

  async function dismissAll() {
    const supabase = createClient();
    const ids = reminders.map((r) => r.id);
    await supabase
      .from("reminders")
      .update({ is_dismissed: true })
      .in("id", ids);

    setReminders([]);
    setCount(0);
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white text-slate-900 hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
        <span className="sr-only">View reminders ({count})</span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold text-sm">Reminders</p>
          {reminders.length > 0 && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={dismissAll}
              type="button"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Dismiss all
            </button>
          )}
        </div>

        {/* Reminder list */}
        {reminders.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-6 w-6 opacity-40" />
            <p>No upcoming reminders</p>
          </div>
        ) : (
          <div className="divide-y max-h-80 overflow-y-auto">
            {reminders.map((reminder) => (
              <div
                className="flex items-start gap-3 p-3"
                key={reminder.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight truncate">
                    {reminder.title}
                  </p>
                  {reminder.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {reminder.description}
                    </p>
                  )}
                  <p
                    className={`mt-1 flex items-center gap-1 text-xs font-medium ${urgencyClass(reminder.due_date)}`}
                  >
                    <Clock className="h-3 w-3" />
                    {isPast(new Date(reminder.due_date))
                      ? "Overdue"
                      : format(new Date(reminder.due_date), "d MMM", {
                          locale: enGB,
                        })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                    href={`/cases/${reminder.case_id}`}
                    onClick={() => setOpen(false)}
                  >
                    View
                  </Link>
                  <button
                    className="rounded p-1 text-muted-foreground hover:bg-muted"
                    onClick={() => dismissReminder(reminder.id)}
                    title="Dismiss"
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-4 py-2.5">
          <Link
            className="text-sm text-primary hover:underline"
            href="/reminders"
            onClick={() => setOpen(false)}
          >
            View all reminders →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
