"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type InteractionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InteractionModal({ open, onOpenChange }: InteractionModalProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Log Interaction</SheetTitle>
          <SheetDescription>
            Full interaction logging form will be added in the next implementation phase.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
