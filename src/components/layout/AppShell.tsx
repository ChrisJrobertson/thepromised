"use client";

import { usePathname } from "next/navigation";

import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  tier: "free" | "basic" | "pro";
  isAdmin?: boolean;
};

function getTitle(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/cases")) return "My Cases";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/reminders")) return "Reminders";
  if (pathname.startsWith("/letters")) return "Letters";
  if (pathname.startsWith("/templates")) return "Templates";
  if (pathname.startsWith("/admin")) return "Admin";
  return "TheyPromised";
}

export function AppShell({ children, userName, userEmail, tier, isAdmin = false }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar isAdmin={isAdmin} pathname={pathname} tier={tier} userEmail={userEmail} userName={userName} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header tier={tier} title={getTitle(pathname)} />
          {/* Extra bottom padding on mobile for the tab bar */}
          <div className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</div>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
