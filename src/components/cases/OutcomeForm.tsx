"use client";

import { CheckCircle2, Minus, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCaseOutcome } from "@/lib/actions/cases";

type Satisfaction = "yes" | "partially" | "no";
type ResolutionType =
  | "refund"
  | "compensation"
  | "apology"
  | "replacement"
  | "service_fix"
  | "nothing"
  | "other";

const RESOLUTION_OPTIONS: { value: ResolutionType; label: string }[] = [
  { value: "refund", label: "Refund" },
  { value: "compensation", label: "Compensation" },
  { value: "apology", label: "Apology" },
  { value: "replacement", label: "Replacement" },
  { value: "service_fix", label: "Service fix" },
  { value: "nothing", label: "Nothing" },
  { value: "other", label: "Other" },
];

const AMOUNT_TYPES: ResolutionType[] = ["refund", "compensation", "replacement"];

type OutcomeFormProps = {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip?: () => void;
};

export function OutcomeForm({ caseId, open, onOpenChange, onSkip }: OutcomeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [satisfaction, setSatisfaction] = useState<Satisfaction | null>(null);
  const [resolutionType, setResolutionType] = useState<ResolutionType | null>(null);
  const [amountPounds, setAmountPounds] = useState("");
  const [notes, setNotes] = useState("");

  const showAmount = resolutionType != null && AMOUNT_TYPES.includes(resolutionType);

  function handleSubmit() {
    if (!satisfaction || !resolutionType) {
      toast.error("Please complete all required fields before saving.");
      return;
    }

    startTransition(async () => {
      const parsed = amountPounds ? parseFloat(amountPounds) : null;
      const result = await submitCaseOutcome({
        caseId,
        satisfaction,
        resolutionType,
        amountPounds: parsed && !isNaN(parsed) ? parsed : null,
        notes: notes.trim() || null,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Outcome recorded. Well done for seeing this through!");
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Your Outcome</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your experience helps other consumers know what to expect.
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Did you get what you wanted? */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Did you get what you wanted?</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm transition-colors ${
                  satisfaction === "yes"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-muted hover:border-green-300"
                }`}
                onClick={() => setSatisfaction("yes")}
                type="button"
              >
                <CheckCircle2 className="h-5 w-5" />
                Yes
              </button>
              <button
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm transition-colors ${
                  satisfaction === "partially"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-muted hover:border-amber-300"
                }`}
                onClick={() => setSatisfaction("partially")}
                type="button"
              >
                <Minus className="h-5 w-5" />
                Partially
              </button>
              <button
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm transition-colors ${
                  satisfaction === "no"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-muted hover:border-red-300"
                }`}
                onClick={() => setSatisfaction("no")}
                type="button"
              >
                <XCircle className="h-5 w-5" />
                No
              </button>
            </div>
          </div>

          {/* What was the resolution? */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">What was the resolution?</Label>
            <div className="flex flex-wrap gap-2">
              {RESOLUTION_OPTIONS.map((opt) => (
                <button
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    resolutionType === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-muted hover:border-primary/50"
                  }`}
                  key={opt.value}
                  onClick={() => setResolutionType(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* How much did you receive? (only for monetary resolutions) */}
          {showAmount && (
            <div className="space-y-1">
              <Label className="text-sm font-medium" htmlFor="amount">
                How much did you receive? (optional)
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  £
                </span>
                <input
                  className="w-full rounded-md border bg-background py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  id="amount"
                  min="0"
                  onChange={(e) => setAmountPounds(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={amountPounds}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-sm font-medium" htmlFor="notes">
              Anything else to note? (optional)
            </Label>
            <Textarea
              className="resize-none text-sm"
              id="notes"
              maxLength={200}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. They refunded 3 months plus £50 goodwill"
              rows={2}
              value={notes}
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/200
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              className="text-xs text-muted-foreground underline hover:text-foreground"
              disabled={isPending}
              onClick={onSkip}
              type="button"
            >
              Close without recording outcome
            </button>
            <div className="flex gap-2">
              <Button
                disabled={isPending || !satisfaction || !resolutionType}
                onClick={handleSubmit}
                size="sm"
                type="button"
              >
                Save Outcome & Close Case
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Recording your outcome helps other consumers know what to expect.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
