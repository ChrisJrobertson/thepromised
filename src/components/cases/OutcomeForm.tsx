"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitCaseOutcome,
  type OutcomeResolutionType,
  type OutcomeSatisfaction,
} from "@/lib/actions/outcomes";
import type { Case } from "@/types/database";

const SATISFACTION_OPTIONS: { value: OutcomeSatisfaction; label: string; icon: typeof Check }[] = [
  { value: "yes", label: "Yes", icon: Check },
  { value: "partially", label: "Partially", icon: Check },
  { value: "no", label: "No", icon: X },
];

const RESOLUTION_TYPES: { value: OutcomeResolutionType; label: string }[] = [
  { value: "refund", label: "Refund" },
  { value: "compensation", label: "Compensation" },
  { value: "apology", label: "Apology" },
  { value: "replacement", label: "Replacement" },
  { value: "service_fix", label: "Service fix" },
  { value: "nothing", label: "Nothing" },
  { value: "other", label: "Other" },
];

const SHOW_AMOUNT_TYPES: OutcomeResolutionType[] = ["refund", "compensation", "replacement"];

type OutcomeFormProps = {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onSkip?: () => void;
  initialCase?: Case | null;
  mode?: "resolve" | "record"; // resolve = closing case; record = just recording outcome (e.g. already closed)
};

export function OutcomeForm({
  caseId,
  open,
  onOpenChange,
  onSuccess,
  onSkip,
  initialCase,
  mode = "resolve",
}: OutcomeFormProps) {
  const [satisfaction, setSatisfaction] = useState<OutcomeSatisfaction | null>(
    (initialCase?.outcome_satisfaction as OutcomeSatisfaction) ?? null
  );
  const [resolutionType, setResolutionType] = useState<OutcomeResolutionType>(
    (initialCase?.outcome_resolution_type as OutcomeResolutionType) ?? "nothing"
  );
  const [amountPounds, setAmountPounds] = useState<string>(
    initialCase?.outcome_amount_pence != null
      ? (initialCase.outcome_amount_pence / 100).toFixed(2)
      : ""
  );
  const [notes, setNotes] = useState(initialCase?.outcome_notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAmount = SHOW_AMOUNT_TYPES.includes(resolutionType);
  const amountNum = amountPounds ? parseFloat(amountPounds) : null;
  const validAmount = showAmount ? (amountNum == null || amountNum >= 0) : true;

  async function handleSubmit() {
    if (satisfaction == null) {
      toast.error("Please select whether you got what you wanted.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitCaseOutcome({
        caseId,
        satisfaction,
        resolutionType,
        amountPounds: showAmount && amountNum != null && !Number.isNaN(amountNum) ? amountNum : null,
        notes: notes.trim() || null,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Outcome saved.");
      onOpenChange(false);
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSkip() {
    onSkip?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "resolve" ? "Resolve case" : "Record outcome"}
          </DialogTitle>
          <DialogDescription>
            {mode === "resolve"
              ? "How did this case end? Your answer helps other consumers know what to expect."
              : "Add how this case ended. Recording your outcome helps other consumers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label className="text-sm font-medium">Did you get what you wanted?</Label>
            <div className="mt-2 flex gap-2">
              {SATISFACTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSatisfaction(opt.value)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-colors ${
                    satisfaction === opt.value
                      ? opt.value === "yes"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : opt.value === "partially"
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-red-500 bg-red-50 text-red-700"
                      : "border-muted hover:bg-muted/50"
                  }`}
                >
                  <opt.icon className="h-5 w-5" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">What was the resolution?</Label>
            <select
              className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={resolutionType}
              onChange={(e) => setResolutionType(e.target.value as OutcomeResolutionType)}
            >
              {RESOLUTION_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {showAmount && (
            <div>
              <Label className="text-sm font-medium">How much did you receive? (£)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={amountPounds}
                onChange={(e) => setAmountPounds(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Anything else to note? (optional)</Label>
            <Textarea
              className="mt-1.5 resize-none"
              maxLength={200}
              placeholder="e.g. They refunded 3 months plus £50 goodwill"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">{notes.length}/200</p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            disabled={isSubmitting || !validAmount}
            onClick={handleSubmit}
            type="button"
          >
            {mode === "resolve" ? "Save outcome & close case" : "Save outcome"}
          </Button>
          {mode === "resolve" && onSkip && (
            <Button
              className="order-first sm:order-none"
              onClick={handleSkip}
              type="button"
              variant="ghost"
            >
              Close without recording outcome
            </Button>
          )}
        </DialogFooter>
        {mode === "resolve" && onSkip && (
          <p className="text-center text-xs text-muted-foreground">
            Recording your outcome helps other consumers know what to expect.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function OutcomeSummaryCard({
  case: c,
  onEdit,
}: {
  case: Case;
  onEdit: () => void;
}) {
  const satisfactionLabel =
    c.outcome_satisfaction === "yes"
      ? "You were fully satisfied"
      : c.outcome_satisfaction === "partially"
        ? "You were partially satisfied"
        : "You were not satisfied";
  const resolutionLabel =
    c.outcome_resolution_type &&
    RESOLUTION_TYPES.find((r) => r.value === c.outcome_resolution_type)?.label;
  const amountStr =
    c.outcome_amount_pence != null && c.outcome_amount_pence > 0
      ? `£${(c.outcome_amount_pence / 100).toFixed(2)}`
      : null;

  const line =
    resolutionLabel && amountStr
      ? `${resolutionLabel} of ${amountStr} — ${satisfactionLabel}`
      : resolutionLabel
        ? `${resolutionLabel} — ${satisfactionLabel}`
        : satisfactionLabel;

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
      <div>
        <p className="font-medium">Outcome</p>
        <p>{line}</p>
      </div>
      <Button
        aria-label="Edit outcome"
        className="h-8 w-8 shrink-0"
        onClick={onEdit}
        size="icon"
        variant="ghost"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}
