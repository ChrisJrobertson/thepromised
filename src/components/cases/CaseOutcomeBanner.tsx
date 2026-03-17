"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { OutcomeForm, OutcomeSummaryCard } from "@/components/cases/OutcomeForm";
import { Button } from "@/components/ui/button";
import type { Case } from "@/types/database";

type CaseOutcomeBannerProps = {
  caseId: string;
  case: Case;
};

export function CaseOutcomeBanner({ caseId, case: c }: CaseOutcomeBannerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isClosed = c.status === "resolved" || c.status === "closed";
  const hasOutcome = c.outcome_satisfaction != null;

  if (!isClosed) return null;

  if (hasOutcome) {
    return (
      <>
        <OutcomeSummaryCard
          case={c}
          onEdit={() => setDialogOpen(true)}
        />
        <OutcomeForm
          caseId={caseId}
          initialCase={c}
          mode="record"
          onOpenChange={setDialogOpen}
          onSuccess={() => router.refresh()}
          open={dialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>How did this case end? Record your outcome to help other consumers.</p>
        <Button
          onClick={() => setDialogOpen(true)}
          size="sm"
          variant="secondary"
        >
          Record outcome
        </Button>
      </div>
      <OutcomeForm
        caseId={caseId}
        mode="record"
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
        open={dialogOpen}
      />
    </>
  );
}
