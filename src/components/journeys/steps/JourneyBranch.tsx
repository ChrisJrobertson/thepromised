"use client";

import { GitBranch } from "lucide-react";

import type { JourneyBranchOption, JourneyStep } from "@/types/journey";

interface Props {
  step: JourneyStep;
  orgName: string;
  onComplete: (choice: string) => Promise<void>;
  isLoading: boolean;
}

function interpolate(text: string, orgName: string) {
  return text.replace(/\{company_name\}/g, orgName);
}

export function JourneyBranch({ step, orgName, onComplete, isLoading }: Props) {
  const question = step.action_config.question;
  const options: JourneyBranchOption[] = step.action_config.options ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {interpolate(step.description, orgName)}
      </p>

      {question && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          <GitBranch className="mb-1 mr-1.5 inline h-4 w-4" />
          {interpolate(question, orgName)}
        </p>
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <button
            className="group flex w-full items-start gap-3 rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition-all hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            key={option.next_step}
            type="button"
            onClick={() => onComplete(option.next_step)}
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 transition-colors group-hover:border-primary" />
            <span className="text-sm leading-relaxed">{interpolate(option.label, orgName)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
