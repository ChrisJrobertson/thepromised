"use client";

import {
  ArrowUpRight,
  CheckCircle,
  CheckSquare,
  Clock,
  FileText,
  GitBranch,
  Info,
} from "lucide-react";

import type { JourneyActionType, JourneyStep } from "@/types/journey";

interface Props {
  steps: JourneyStep[];
  currentStepId: string;
  completedStepIds: Set<string>;
  onStepClick?: (stepId: string) => void;
}

const STEP_META: Record<JourneyActionType, { icon: React.ElementType; colour: string; bg: string }> = {
  checklist:  { icon: CheckSquare,  colour: "text-blue-600",   bg: "bg-blue-100" },
  send_letter:{ icon: FileText,     colour: "text-purple-600", bg: "bg-purple-100" },
  branch:     { icon: GitBranch,    colour: "text-amber-600",  bg: "bg-amber-100" },
  info:       { icon: Info,         colour: "text-slate-600",  bg: "bg-slate-100" },
  wait:       { icon: Clock,        colour: "text-orange-600", bg: "bg-orange-100" },
  escalate:   { icon: ArrowUpRight, colour: "text-red-600",    bg: "bg-red-100" },
  resolve:    { icon: CheckCircle,  colour: "text-green-600",  bg: "bg-green-100" },
};

export function JourneyProgress({ steps, currentStepId, completedStepIds, onStepClick }: Props) {
  // De-duplicate by step_id for display (branch siblings show as one line)
  const uniqueSteps = steps.filter(
    (step, idx, arr) => arr.findIndex((s) => s.step_id === step.step_id) === idx
  );

  return (
    <nav aria-label="Journey progress" className="space-y-1">
      {uniqueSteps.map((step, idx) => {
        const isDone = completedStepIds.has(step.step_id);
        const isCurrent = step.step_id === currentStepId;
        const meta = STEP_META[step.action_type];
        const Icon = meta.icon;
        const isClickable = isDone && onStepClick;

        return (
          <div className="flex items-start gap-3" key={step.step_id}>
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <button
                aria-label={step.title}
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                  isDone
                    ? "bg-green-100"
                    : isCurrent
                      ? `${meta.bg} ring-2 ring-offset-1 ring-primary/40`
                      : "bg-slate-100"
                } ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                disabled={!isClickable}
                type="button"
                onClick={() => isClickable && onStepClick(step.step_id)}
              >
                {isDone ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${isCurrent ? meta.colour : "text-slate-400"}`}
                  />
                )}
                {isCurrent && (
                  <span className="absolute -inset-1 animate-ping rounded-full bg-primary/20" />
                )}
              </button>
              {idx < uniqueSteps.length - 1 && (
                <div
                  className={`mt-1 w-0.5 flex-1 transition-colors ${
                    isDone ? "bg-green-300" : "bg-slate-200"
                  }`}
                  style={{ height: "1.25rem" }}
                />
              )}
            </div>

            {/* Step title */}
            <div className="pb-4 pt-1.5">
              <p
                className={`text-xs font-medium leading-tight ${
                  isDone
                    ? "text-green-700 line-through"
                    : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {step.title}
              </p>
              {isCurrent && (
                <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Current
                </span>
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// Compact version for mobile top bar
export function JourneyProgressBar({
  steps,
  currentStepId,
  completedStepIds,
}: {
  steps: JourneyStep[];
  currentStepId: string;
  completedStepIds: Set<string>;
}) {
  const unique = steps.filter(
    (step, idx, arr) => arr.findIndex((s) => s.step_id === step.step_id) === idx
  );
  const total = unique.length;
  const currentIdx = unique.findIndex((s) => s.step_id === currentStepId);
  const completed = completedStepIds.size;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {Math.min(currentIdx + 1, total)} of {total}
        </span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
