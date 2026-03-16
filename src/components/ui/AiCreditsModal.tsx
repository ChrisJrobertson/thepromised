"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AiCreditsModalProps = {
  open: boolean;
  onClose: () => void;
  feature: "suggestions" | "letters";
  limitCount: number;
};

const FEATURE_COPY: Record<"suggestions" | "letters", { noun: string; upgrade: string }> = {
  suggestions: {
    noun: "AI suggestions",
    upgrade: "10 suggestions and 5 AI-drafted letters",
  },
  letters: {
    noun: "AI letters",
    upgrade: "5 AI letters and 10 case analyses",
  },
};

export function AiCreditsModal({
  open,
  onClose,
  feature,
  limitCount,
}: AiCreditsModalProps) {
  const copy = FEATURE_COPY[feature];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Monthly limit reached
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-1 text-sm">
            You&apos;ve used your {limitCount} free {copy.noun} this month.{" "}
            <span className="font-medium text-foreground">
              Upgrade to Basic (£4.99/mo) for {copy.upgrade}, or grab a
              one-off Complaint Pack from £29.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Link
            className={cn(buttonVariants({ variant: "default" }), "w-full justify-center")}
            href="/pricing"
          >
            Upgrade Plan
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
            href="/packs"
          >
            Browse Packs
          </Link>
          <button
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            onClick={onClose}
            type="button"
          >
            Maybe Later
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
