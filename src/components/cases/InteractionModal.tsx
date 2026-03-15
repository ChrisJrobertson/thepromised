"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Case } from "@/types/database";

import { InteractionForm } from "./InteractionForm";

type InteractionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCase?: Pick<Case, "id" | "title"> | null;
  cases?: Pick<Case, "id" | "title">[];
};

export function InteractionModal({
  open,
  onOpenChange,
  preselectedCase,
  cases,
}: InteractionModalProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="flex h-full w-full flex-col overflow-hidden sm:max-w-xl">
        <SheetHeader className="shrink-0 pb-4">
          <SheetTitle>Log Interaction</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pb-safe">
          <InteractionForm
            cases={cases}
            onSuccess={() => onOpenChange(false)}
            preselectedCaseId={preselectedCase?.id}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
