"use client";

import { Compass, FileText, Folder, Home, Menu, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/cases", label: "My Cases", icon: Folder },
  { href: "/cases/new", label: "New Case", icon: PlusCircle },
  { href: "/letters", label: "Letters", icon: FileText },
  { href: "/escalation-guides", label: "Escalation Guides", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="inline-flex size-8 items-center justify-center rounded-md border bg-white text-slate-900">
        <Menu className="size-4" />
        <span className="sr-only">Open navigation menu</span>
      </SheetTrigger>
      <SheetContent className="w-80 bg-primary text-white">
        <SheetHeader>
          <SheetTitle className="text-white">TheyPromised</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white",
                  isActive && "border-secondary bg-white/10 text-white",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
