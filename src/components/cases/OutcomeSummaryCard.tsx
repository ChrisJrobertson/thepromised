"use client";

import { CheckCircle2, Minus, Pencil, XCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Case } from "@/types/database";
import { OutcomeForm } from "./OutcomeForm";

type OutcomeSummaryCardProps = {
  theCase: Pick<
    Case,
    | "id"
    | "outcome_satisfaction"
    | "outcome_resolution_type"
    | "outcome_amount_pence"
    | "outcome_notes"
    | "resolved_at"
  >;
};

const SATISFACTION_CONFIG = {
  yes: {
    label: "Fully satisfied",
    colour: "border-green-200 bg-green-50 text-green-700",
    icon: CheckCircle2,
  },
  partially: {
    label: "Partially satisfied",
    colour: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Minus,
  },
  no: {
    label: "Not satisfied",
    colour: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
} as const;

const RESOLUTION_LABELS: Record<string, string> = {
  refund: "Refund",
  compensation: "Compensation",
  apology: "Apology",
  replacement: "Replacement",
  service_fix: "Service fix",
  nothing: "Nothing",
  other: "Other",
};

export function OutcomeSummaryCard({ theCase }: OutcomeSummaryCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const satisfaction = theCase.outcome_satisfaction;
  const config = satisfaction ? SATISFACTION_CONFIG[satisfaction] : null;
  const resolutionLabel = theCase.outcome_resolution_type
    ? RESOLUTION_LABELS[theCase.outcome_resolution_type] ?? theCase.outcome_resolution_type
    : null;
  const amountPounds =
    theCase.outcome_amount_pence != null
      ? (theCase.outcome_amount_pence / 100).toLocaleString("en-GB", {
          style: "currency",
          currency: "GBP",
        })
      : null;

  if (!satisfaction || !config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <>
      <Card className={`border ${config.colour}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              Case Outcome
            </span>
            <button
              className="text-xs font-normal text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setEditOpen(true)}
              type="button"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            {resolutionLabel && (
              <Badge className={config.colour} variant="outline">
                {resolutionLabel}
                {amountPounds ? ` of ${amountPounds}` : ""}
              </Badge>
            )}
          </div>
          <p className={`text-xs ${config.colour.split(" ").at(-1)}`}>{config.label}</p>
          {theCase.outcome_notes && (
            <p className="text-xs text-muted-foreground italic">
              &ldquo;{theCase.outcome_notes}&rdquo;
            </p>
          )}
        </CardContent>
      </Card>

      <OutcomeForm
        caseId={theCase.id}
        onOpenChange={setEditOpen}
        open={editOpen}
      />
    </>
  );
}
