"use client";

import { Bell, FolderOpen, LayoutDashboard, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { InteractionModal } from "@/components/cases/InteractionModal";

const TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/cases", icon: FolderOpen, label: "Cases" },
  { href: null, icon: Plus, label: "Log", isAction: true },
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/settings/profile", icon: Settings, label: "Settings" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur-sm md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;

            if (tab.isAction) {
              return (
                <button
                  className="flex flex-col items-center justify-center"
                  key="log"
                  onClick={() => setModalOpen(true)}
                  type="button"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </button>
              );
            }

            const isActive = tab.href
              ? pathname === tab.href ||
                (tab.href !== "/dashboard" && pathname.startsWith(tab.href))
              : false;

            return (
              <Link
                className={`flex flex-col items-center gap-0.5 px-3 py-2 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                href={tab.href!}
                key={tab.href}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for iOS home indicator */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      <InteractionModal onOpenChange={setModalOpen} open={modalOpen} />
    </>
  );
}
