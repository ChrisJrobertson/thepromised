"use client";

import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JourneyStep } from "@/types/journey";

interface Props {
  step: JourneyStep;
  caseId: string;
  orgName: string;
  onComplete: () => Promise<void>;
  isLoading: boolean;
}

export function JourneyResolve({ step, caseId, orgName, onComplete, isLoading }: Props) {
  const [satisfied, setSatisfied] = useState<"yes" | "partially" | "no" | "">("");
  const [resolution, setResolution] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const showForm = step.action_config.trigger_outcome_form;

  async function handleClose() {
    if (showForm && !satisfied) {
      toast.error("Please select whether you got what you wanted.");
      return;
    }

    setSaving(true);
    try {
      // Update case status to resolved
      await fetch(`/api/cases/${caseId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution_summary: resolution || undefined,
          compensation_received: amount ? parseFloat(amount) : undefined,
        }),
      });
    } catch {
      // Non-fatal — case update is best-effort
    }

    await onComplete();
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
        <h3 className="text-lg font-bold text-green-900">Well done for seeing this through</h3>
        <p className="mt-1 text-sm text-green-700">
          Whether or not you got everything you wanted, you built a documented case that{" "}
          {orgName} had to take seriously.
        </p>
      </div>

      {showForm && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">How did it go?</h4>

          <div className="space-y-2">
            <Label>Did you get what you wanted?</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["yes", "partially", "no"] as const).map((v) => (
                <button
                  className={`rounded-lg border p-2.5 text-sm font-medium transition-colors ${
                    satisfied === v
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white hover:border-primary/50"
                  }`}
                  key={v}
                  type="button"
                  onClick={() => setSatisfied(v)}
                >
                  {v === "yes" ? "Yes 🎉" : v === "partially" ? "Partially 🤔" : "No 😤"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">What was the resolution?</Label>
            <Select value={resolution} onValueChange={(v) => setResolution(v ?? "")}>
              <SelectTrigger id="resolution">
                <SelectValue placeholder="Select outcome…" />
              </SelectTrigger>
              <SelectContent>
                {["Refund", "Compensation", "Apology", "Repair", "Replacement", "Partial settlement", "Nothing", "Other"].map((opt) => (
                  <SelectItem key={opt} value={opt.toLowerCase()}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount received (£) <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="amount"
              min="0"
              placeholder="0.00"
              step="0.01"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading || saving}
          onClick={handleClose}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {isLoading || saving ? "Saving…" : "Close Journey"}
        </Button>
      </div>
    </div>
  );
}
