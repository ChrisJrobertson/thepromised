"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_LINKS = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/account", label: "Account" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="rounded-lg border bg-white p-3 h-fit">
        <nav className="space-y-1 text-sm">
          {SETTINGS_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                className={`block rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-primary/5 font-medium text-primary"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
