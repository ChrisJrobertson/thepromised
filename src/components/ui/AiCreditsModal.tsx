"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
          <DialogDescription asChild>
            <div className="space-y-2 pt-1 text-sm">
              <p>
                You've used your {limitCount} free {copy.noun} this month.
              </p>
              <p className="font-medium text-foreground">
                Upgrade to Basic (£4.99/mo) for {copy.upgrade}, or grab a
                one-off Complaint Pack from £29.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full">
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/packs">Browse Packs</Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose} type="button">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
