"use client";

import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { Bell, Check, CheckCheck, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

type Reminder = {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  due_date: string;
  reminder_type: string;
  is_dismissed: boolean | null;
  cases: { title: string; id: string } | null;
};

type GroupedReminders = {
  overdue: Reminder[];
  today: Reminder[];
  thisWeek: Reminder[];
  later: Reminder[];
};

type RemindersClientProps = {
  grouped: GroupedReminders;
  cases: { id: string; title: string }[];
  userId: string;
};

const TYPE_LABELS: Record<string, string> = {
  promise_deadline: "Promise deadline",
  escalation_window: "Escalation alert",
  follow_up: "Follow-up",
  custom: "Custom",
};

const GROUP_CONFIG = [
  {
    key: "overdue" as const,
    label: "Overdue",
    labelClass: "text-red-600",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
  },
  {
    key: "today" as const,
    label: "Today",
    labelClass: "text-amber-600",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    key: "thisWeek" as const,
    label: "This week",
    labelClass: "text-foreground",
    badgeClass: "",
  },
  {
    key: "later" as const,
    label: "Later",
    labelClass: "text-muted-foreground",
    badgeClass: "",
  },
];

export function RemindersClient({
  grouped: initialGrouped,
  cases,
  userId,
}: RemindersClientProps) {
  const router = useRouter();
  const [grouped, setGrouped] = useState(initialGrouped);
  const [showCreate, setShowCreate] = useState(false);
  const [newReminder, setNewReminder] = useState({
    case_id: "",
    title: "",
    description: "",
    due_date: "",
  });

  const allReminders = [
    ...grouped.overdue,
    ...grouped.today,
    ...grouped.thisWeek,
    ...grouped.later,
  ];

  function removeFromState(id: string) {
    setGrouped((prev) => ({
      overdue: prev.overdue.filter((r) => r.id !== id),
      today: prev.today.filter((r) => r.id !== id),
      thisWeek: prev.thisWeek.filter((r) => r.id !== id),
      later: prev.later.filter((r) => r.id !== id),
    }));
  }

  async function dismissReminder(id: string) {
    const supabase = createClient();
    await supabase
      .from("reminders")
      .update({ is_dismissed: true })
      .eq("id", id);
    removeFromState(id);
    toast.success("Reminder dismissed");
  }

  async function dismissAll() {
    const supabase = createClient();
    const ids = allReminders.map((r) => r.id);
    await supabase
      .from("reminders")
      .update({ is_dismissed: true })
      .in("id", ids);
    setGrouped({ overdue: [], today: [], thisWeek: [], later: [] });
    toast.success("All reminders dismissed");
  }

  async function createReminder() {
    if (!newReminder.case_id || !newReminder.title || !newReminder.due_date) {
      toast.error("Please fill in case, title, and due date");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("reminders").insert({
      user_id: userId,
      case_id: newReminder.case_id,
      title: newReminder.title,
      description: newReminder.description || null,
      due_date: new Date(newReminder.due_date).toISOString(),
      reminder_type: "custom",
    });

    if (error) {
      toast.error("Failed to create reminder");
    } else {
      toast.success("Reminder created");
      setShowCreate(false);
      setNewReminder({ case_id: "", title: "", description: "", due_date: "" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      {allReminders.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {allReminders.length} active reminder{allReminders.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreate(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add reminder
            </Button>
            <Button
              onClick={dismissAll}
              size="sm"
              type="button"
              variant="outline"
            >
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Dismiss all
            </Button>
          </div>
        </div>
      )}

      {/* Groups */}
      {allReminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium">No active reminders</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Reminders are created automatically when you log promises and upcoming deadlines.
          </p>
          <Button
            className="mt-4"
            onClick={() => setShowCreate(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create a reminder
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {GROUP_CONFIG.map((group) => {
            const items = grouped[group.key];
            if (items.length === 0) return null;

            return (
              <div key={group.key} className="space-y-2">
                <h2
                  className={`flex items-center gap-2 text-sm font-semibold ${group.labelClass}`}
                >
                  {group.label}
                  <Badge
                    className={group.badgeClass || "border-muted bg-muted/50 text-muted-foreground"}
                    variant="outline"
                  >
                    {items.length}
                  </Badge>
                </h2>
                <div className="space-y-2">
                  {items.map((reminder) => (
                    <Card key={reminder.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <p className="font-medium text-sm">{reminder.title}</p>
                            {reminder.description && (
                              <p className="text-xs text-muted-foreground">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(
                                  new Date(reminder.due_date),
                                  "d MMMM yyyy",
                                  { locale: enGB }
                                )}
                              </span>
                              {reminder.cases && (
                                <Link
                                  className="text-primary hover:underline"
                                  href={`/cases/${reminder.cases.id}`}
                                >
                                  {reminder.cases.title}
                                </Link>
                              )}
                              <Badge className="text-[10px]" variant="outline">
                                {TYPE_LABELS[reminder.reminder_type] ?? reminder.reminder_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {reminder.cases && (
                              <Link
                                className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                                href={`/cases/${reminder.cases.id}`}
                              >
                                View case
                              </Link>
                            )}
                            <Button
                              className="h-7 px-2"
                              onClick={() => dismissReminder(reminder.id)}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create reminder dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setNewReminder({ case_id: "", title: "", description: "", due_date: "" });
          }
        }}
        open={showCreate}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Case *</Label>
              <Select
                onValueChange={(v) =>
                  v && setNewReminder((prev) => ({ ...prev, case_id: v }))
                }
                value={newReminder.case_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reminder-title">Title *</Label>
              <Input
                id="reminder-title"
                onChange={(e) =>
                  setNewReminder((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Follow up if no response received"
                value={newReminder.title}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reminder-desc">Description</Label>
              <Textarea
                id="reminder-desc"
                onChange={(e) =>
                  setNewReminder((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional details..."
                rows={2}
                value={newReminder.description}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reminder-date">Due date *</Label>
              <Input
                id="reminder-date"
                onChange={(e) =>
                  setNewReminder((prev) => ({
                    ...prev,
                    due_date: e.target.value,
                  }))
                }
                type="date"
                value={newReminder.due_date}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowCreate(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={createReminder} type="button">
                Create reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
