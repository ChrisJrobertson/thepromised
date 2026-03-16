"use client";

import { CheckSquare, Lightbulb } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { JourneyStep } from "@/types/journey";

interface Props {
  step: JourneyStep;
  orgName: string;
  onComplete: () => Promise<void>;
  isLoading: boolean;
}

function interpolate(text: string, orgName: string) {
  return text.replace(/\{company_name\}/g, orgName);
}

export function JourneyChecklist({ step, orgName, onComplete, isLoading }: Props) {
  const items = step.action_config.items ?? [];
  const tip = step.action_config.tip;
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const canComplete = checkedCount >= Math.max(1, Math.floor(items.length * 0.5));

  function toggle(i: number) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {interpolate(step.description, orgName)}
      </p>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              checked[i]
                ? "border-green-200 bg-green-50"
                : "border-slate-200 bg-white hover:border-primary/50"
            }`}
            onClick={() => toggle(i)}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                checked[i]
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-slate-300"
              }`}
            >
              {checked[i] && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 12 10">
                  <path
                    d="M1 5l4 4 6-8"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              )}
            </div>
            <span className={`text-sm ${checked[i] ? "line-through text-muted-foreground" : ""}`}>
              {interpolate(item, orgName)}
            </span>
          </li>
        ))}
      </ul>

      {tip && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">{interpolate(tip, orgName)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          {checkedCount} of {items.length} items checked
        </p>
        <Button
          disabled={!canComplete || isLoading}
          onClick={onComplete}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          {isLoading ? "Saving…" : "Mark Complete"}
        </Button>
      </div>
    </div>
  );
}
