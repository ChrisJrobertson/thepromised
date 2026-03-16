"use client";

import { useState } from "react";
import { OutcomeForm } from "@/components/cases/OutcomeForm";

export function RecordOutcomeButton({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="shrink-0 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 transition-colors"
        onClick={() => setOpen(true)}
        type="button"
      >
        Record Outcome
      </button>
      <OutcomeForm caseId={caseId} onOpenChange={setOpen} open={open} />
    </>
  );
}
