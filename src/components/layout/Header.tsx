import { QuickLogButton } from "@/components/cases/QuickLogButton";
import { ReminderBell } from "@/components/layout/ReminderBell";
import { SubscriptionBadge } from "@/components/layout/SubscriptionBadge";
import { MobileNav } from "@/components/layout/MobileNav";

type HeaderProps = {
  title: string;
  tier: "free" | "basic" | "pro";
  reminderCount?: number;
};

export function Header({ title, tier, reminderCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <QuickLogButton />
          <ReminderBell count={reminderCount} />
          <div className="hidden md:block">
            <SubscriptionBadge tier={tier} />
          </div>
        </div>
      </div>
    </header>
  );
}
