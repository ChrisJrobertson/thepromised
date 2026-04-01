"use client";

import { addDays, format } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  ExternalLink,
  FileText,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { advanceEscalationStage } from "@/lib/actions/cases";
import type { Case, EscalationRule } from "@/types/database";

type EscalationGuideProps = {
  caseId: string;
  category: string;
  currentStage: Case["escalation_stage"];
  firstContactDate: string | null;
  rules: EscalationRule[];
};

const STAGE_ORDER: Case["escalation_stage"][] = [
  "initial",
  "formal_complaint",
  "final_response",
  "ombudsman",
  "court",
];

// Map stage_order integer (1-5 from seed) to Case escalation_stage enum
function stageOrderToEnum(order: number): Case["escalation_stage"] {
  return STAGE_ORDER[order - 1] ?? "court";
}

export function EscalationGuide({
  caseId,
  category,
  currentStage,
  firstContactDate,
  rules,
}: EscalationGuideProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);

  function calculateDeadline(rule: EscalationRule): Date | null {
    if (!rule.wait_period_days || !firstContactDate) return null;
    const base = new Date(firstContactDate);
    return addDays(base, rule.wait_period_days);
  }

  function handleAdvanceStage(nextStage: Case["escalation_stage"]) {
    startTransition(async () => {
      const result = await advanceEscalationStage(caseId, nextStage);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Escalation stage updated");
      }
    });
  }

  if (rules.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="font-medium">No escalation guide available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The escalation guide for <strong>{category.replace(/_/g, " ")}</strong> has not been
          seeded yet.
        </p>
      </div>
    );
  }

  // Sort rules by stage_order
  const sortedRules = [...rules].sort((a, b) => a.stage_order - b.stage_order);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            UK Complaints Escalation Path
          </h3>
          <p className="text-sm text-muted-foreground capitalize">
            {category.replace(/_/g, " ")}
          </p>
        </div>
        <Badge className="border-secondary/30 bg-secondary/10 text-secondary" variant="outline">
          <MapPin className="mr-1 h-3 w-3" />
          Stage {currentStageIndex + 1} of {STAGE_ORDER.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {sortedRules.map((rule) => {
          const stageEnum = stageOrderToEnum(rule.stage_order);
          const stageIdx = STAGE_ORDER.indexOf(stageEnum);
          const isCurrent = stageEnum === currentStage;
          const isPast = stageIdx < currentStageIndex;
          const isExpanded = expandedId === rule.id;
          const deadline = calculateDeadline(rule);
          const nextStageEnum = STAGE_ORDER[stageIdx + 1];

          return (
            <div
              className={`rounded-lg border transition-all ${
                isCurrent
                  ? "border-secondary bg-secondary/5 shadow-sm"
                  : isPast
                    ? "border-muted bg-muted/30"
                    : "border-muted"
              }`}
              key={rule.id}
            >
              <button
                className="flex w-full items-start gap-3 p-4 text-left"
                onClick={() =>
                  setExpandedId((prev) => (prev === rule.id ? null : rule.id))
                }
                type="button"
              >
                {/* Stage indicator */}
                <div className="mt-0.5 shrink-0">
                  {isPast ? (
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                  ) : isCurrent ? (
                    <Circle className="h-5 w-5 fill-secondary text-secondary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? "text-secondary"
                          : isPast
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                      }`}
                    >
                      Stage {rule.stage_order}: {rule.title}
                    </span>
                    {isCurrent && (
                      <Badge className="border-secondary/30 bg-secondary/10 text-secondary text-xs" variant="outline">
                        You are here
                      </Badge>
                    )}
                  </div>

                  {rule.wait_period_days && !isPast && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {rule.wait_period_days} day wait
                      {deadline && (
                        <>
                          {" "}· deadline{" "}
                          <strong>
                            {format(deadline, "d MMM yyyy", { locale: enGB })}
                          </strong>
                        </>
                      )}
                    </p>
                  )}

                  {rule.regulatory_body && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {rule.regulatory_body}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-muted-foreground">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3">
                  <p className="text-sm text-muted-foreground">{rule.description}</p>

                  <div className="rounded-md bg-muted/50 p-3 text-sm">
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      What to do
                    </p>
                    <p>{rule.action_required}</p>
                  </div>

                  {rule.tips && (
                    <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <p>{rule.tips}</p>
                    </div>
                  )}

                  {rule.regulatory_body && rule.regulatory_url && (
                    <a
                      className="flex items-center gap-1.5 text-sm text-secondary hover:underline"
                      href={rule.regulatory_url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {rule.regulatory_body}
                    </a>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {rule.template_available && (
                      <Link
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                        href={`/cases/${caseId}/letters/new?stage=${rule.stage}`}
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Generate letter for this stage
                      </Link>
                    )}

                    {isCurrent && nextStageEnum && (
                      <Button
                        disabled={isPending}
                        onClick={() => handleAdvanceStage(nextStageEnum)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        {isPending ? "Updating..." : "Mark this stage complete →"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
        <p>
          <strong>Important:</strong> This guide is for general information only.
          Time limits vary — always check the official regulator&apos;s website for the most current
          rules. Suggestions are for guidance only. Always verify with official sources.
        </p>
      </div>
    </div>
  );
}
