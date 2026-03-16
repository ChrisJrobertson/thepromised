import {
  Bell,
  Calculator,
  Compass,
  FileText,
  Folder,
  Home,
  Package,
  PlusCircle,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";

import { SubscriptionBadge } from "@/components/layout/SubscriptionBadge";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

type SidebarProps = {
  pathname: string;
  userName: string;
  userEmail: string;
  tier: "free" | "basic" | "pro";
  isAdmin?: boolean;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/cases", label: "My Cases", icon: Folder },
  { href: "/cases/new", label: "New Case (+)", icon: PlusCircle },
  { href: "/letters", label: "Letters", icon: FileText },
  { href: "/dashboard/packs", label: "Packs", icon: Package },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/escalation-guides", label: "Escalation Guides", icon: Compass },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ pathname, userName, userEmail, tier, isAdmin = false }: SidebarProps) {
  const items = isAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Admin", icon: Shield }]
    : NAV_ITEMS;

  return (
    <aside className="hidden w-72 shrink-0 flex-col bg-primary text-white md:flex">
      <div className="border-b border-white/15 p-5">
        <Link className="inline-flex items-center gap-2 text-xl font-bold" href="/dashboard">
          <Shield className="size-5" />
          TheyPromised
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white",
                isActive && "border-secondary bg-white/10 text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-white/15 p-4">
        <SubscriptionBadge tier={tier} />
        <UserMenu email={userEmail} name={userName} />
      </div>
    </aside>
  );
}
