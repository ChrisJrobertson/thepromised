import Link from "next/link";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type ReminderBellProps = {
  count?: number;
};

export function ReminderBell({ count = 0 }: ReminderBellProps) {
  return (
    <Link
      className="relative inline-flex size-8 items-center justify-center rounded-md border bg-white text-slate-900"
      href="/reminders"
    >
      <Bell className="size-4" />
      {count > 0 ? (
        <Badge className="absolute -top-2 -right-2 h-5 min-w-5 justify-center rounded-full px-1 text-xs">
          {count}
        </Badge>
      ) : null}
      <span className="sr-only">View reminders</span>
    </Link>
  );
}
