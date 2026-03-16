"use client";

import { Building2, Eye, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "tp_admin_view_mode";

type ViewMode = "consumer" | "admin";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Admin Overview" },
  { href: "/admin/b2b", label: "B2B Pipeline" },
];

export function AdminViewToggle() {
  const [mode, setMode] = useState<ViewMode>("consumer");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
      if (stored === "admin" || stored === "consumer") setMode(stored);
    } catch {
      // localStorage unavailable
    }
    setMounted(true);
  }, []);

  function toggle() {
    const next: ViewMode = mode === "consumer" ? "admin" : "consumer";
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  if (!mounted) return null;

  const isAdminMode = mode === "admin";

  return (
    <div className="space-y-2">
      {/* Admin nav links — only visible in admin mode */}
      {isAdminMode && (
        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={cn(
                  "flex items-center gap-2 rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white",
                  isActive && "border-secondary bg-white/10 text-white"
                )}
                href={item.href}
                key={item.href}
              >
                <Building2 className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Toggle button */}
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
          isAdminMode
            ? "bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
        )}
        onClick={toggle}
        title={isAdminMode ? "Switch to Consumer View" : "Switch to Admin View"}
        type="button"
      >
        {isAdminMode ? (
          <>
            <User className="size-3.5" />
            Switch to Consumer View
          </>
        ) : (
          <>
            <Eye className="size-3.5" />
            Admin View
          </>
        )}
      </button>
    </div>
  );
}
