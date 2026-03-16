"use client";

import { addDays, differenceInDays, format, isFuture } from "date-fns";
import { enGB } from "date-fns/locale";
import { Clock, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JourneyStep, JourneyStepHistoryEntry } from "@/types/journey";

interface Props {
  step: JourneyStep;
  orgName: string;
  stepHistory: JourneyStepHistoryEntry[];
  previousStepId: string | null;
  onComplete: () => Promise<void>;
  isLoading: boolean;
}

function interpolate(text: string, orgName: string) {
  return text.replace(/\{company_name\}/g, orgName);
}

export function JourneyWait({
  step,
  orgName,
  stepHistory,
  previousStepId,
  onComplete,
  isLoading,
}: Props) {
  const tip = step.action_config.tip;
  const waitMessage =
    step.action_config.wait_message ?? step.wait_message ?? "Waiting period in progress";

  // Find when the previous step was completed to calculate wait end date
  const prevEntry = previousStepId
    ? stepHistory.find((h) => h.step_id === previousStepId)
    : stepHistory[stepHistory.length - 1];

  const waitFromDate = prevEntry?.completed_at
    ? new Date(prevEntry.completed_at)
    : new Date();

  const waitDays = step.wait_after_days ?? 0;
  const waitEndDate = addDays(waitFromDate, waitDays);
  const daysRemaining = Math.max(0, differenceInDays(waitEndDate, new Date()));
  const waitPassed = !isFuture(waitEndDate);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {interpolate(step.description, orgName)}
      </p>

      {waitDays > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-orange-500" />
          <h3 className="font-semibold text-orange-900">
            {waitPassed ? "Wait Period Complete" : "Waiting Period"}
          </h3>
          <p className="mt-1 text-sm text-orange-700">
            {interpolate(waitMessage, orgName)}
          </p>
          {waitPassed ? (
            <p className="mt-3 text-sm font-semibold text-green-700">
              ✓ Sufficient time has passed — you can continue.
            </p>
          ) : (
            <>
              <p className="mt-3 text-2xl font-bold text-orange-900">
                {daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining
              </p>
              <p className="mt-1 text-sm text-orange-600">
                Until {format(waitEndDate, "d MMMM yyyy", { locale: enGB })}
              </p>
            </>
          )}
        </div>
      )}

      {tip && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">{interpolate(tip, orgName)}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button disabled={isLoading} onClick={onComplete}>
          {isLoading
            ? "Saving…"
            : waitPassed
              ? "Continue"
              : "Skip Wait & Continue"}
        </Button>
      </div>
    </div>
  );
}
