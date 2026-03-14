"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { InteractionModal } from "@/components/cases/InteractionModal";
import { Button } from "@/components/ui/button";

export function QuickLogButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="mr-1 size-4" /> Log Interaction
      </Button>
      <InteractionModal onOpenChange={setOpen} open={open} />
    </>
  );
}
