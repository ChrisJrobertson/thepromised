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
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Log Interaction</SheetTitle>
        </SheetHeader>
        <InteractionForm
          cases={cases}
          onSuccess={() => onOpenChange(false)}
          preselectedCaseId={preselectedCase?.id}
        />
      </SheetContent>
    </Sheet>
  );
}
