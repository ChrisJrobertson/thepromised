"use client";

import { ChevronDown, ChevronRight, ChevronUp, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { dismissJourneyBannerAction, startJourneyAction } from "@/lib/actions/journey";
import type { JourneyTemplate } from "@/lib/services/journeyService";

type JourneyStartBannerProps = {
  caseId: string;
  template: JourneyTemplate;
};

export function JourneyStartBanner({ caseId, template }: JourneyStartBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStart() {
    startTransition(async () => {
      const result = await startJourneyAction(caseId, template.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Guided journey started");
        router.refresh();
      }
    });
  }

  function handleDismiss() {
    startTransition(async () => {
      // Create a minimal journey record just to mark it as dismissed
      const startResult = await startJourneyAction(caseId, template.id);
      if (!startResult?.error) {
        await dismissJourneyBannerAction(caseId);
        router.refresh();
      }
    });
  }

  const sortedSteps = [...template.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              Guided support available for {template.name.toLowerCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              We&apos;ll walk you through exactly what to do and when.
              {template.estimated_duration_days
                ? ` Estimated ${template.estimated_duration_days} days.`
                : ""}
            </p>
          </div>
        </div>
        <button
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground shrink-0"
          disabled={isPending}
          onClick={handleDismiss}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Expandable step preview */}
      <button
        className="flex items-center gap-1 text-xs text-primary hover:underline"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Hide" : "Preview"} all steps
      </button>

      {expanded && (
        <ol className="space-y-1 pl-2">
          {sortedSteps.map((step, i) => (
            <li className="flex items-start gap-2 text-xs text-muted-foreground" key={step.step_id}>
              <span className="font-mono text-primary shrink-0">{i + 1}.</span>
              <span>{step.title}</span>
              {step.wait_after_days > 0 && (
                <span className="text-amber-600 shrink-0">
                  (+{step.wait_after_days}d wait)
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="flex items-center gap-3">
        <Button
          disabled={isPending}
          onClick={handleStart}
          size="sm"
          type="button"
        >
          <ChevronRight className="mr-1.5 h-4 w-4" />
          Start guided journey
        </Button>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          disabled={isPending}
          onClick={handleDismiss}
          type="button"
        >
          No thanks, I&apos;ll manage myself
        </button>
      </div>
    </div>
  );
}
