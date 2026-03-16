"use client";

import { CheckCircle, FileText, Lightbulb, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { JourneyStep } from "@/types/journey";

interface Props {
  step: JourneyStep;
  caseId: string;
  orgName: string;
  existingLetterId?: string | null;
  onComplete: () => Promise<void>;
  isLoading: boolean;
}

function interpolate(text: string, orgName: string) {
  return text.replace(/\{company_name\}/g, orgName);
}

export function JourneySendLetter({
  step,
  caseId,
  orgName,
  existingLetterId,
  onComplete,
  isLoading,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(existingLetterId ?? null);
  const tip = step.action_config.tip;

  async function generateLetter() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/draft-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          letterType: step.action_config.letter_type ?? "custom",
          promptContext: step.action_config.prompt_context,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "upgrade_required") {
          toast.error("AI letter drafting requires a Basic or Pro plan.");
        } else {
          toast.error(data.error ?? "Failed to generate letter");
        }
        return;
      }
      setGeneratedId(data.letterId);
      toast.success("Letter generated successfully.");
    } catch {
      toast.error("Failed to generate letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {interpolate(step.description, orgName)}
      </p>

      {generatedId ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Letter ready</p>
              <p className="mt-0.5 text-xs text-green-700">
                Your letter has been generated and saved to your case.
              </p>
              <Link
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-800 underline underline-offset-2 hover:text-green-900"
                href={`/cases/${caseId}/letters/${generatedId}`}
              >
                <FileText className="h-3.5 w-3.5" />
                View full letter →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-800">
                AI-drafted letter ready to generate
              </p>
              <p className="mt-0.5 text-xs text-purple-700">
                Our AI will draft this letter using your case details, interaction history, and
                UK consumer law references.
              </p>
              <Button
                className="mt-3"
                disabled={generating}
                size="sm"
                variant="default"
                onClick={generateLetter}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Letter
                  </>
                )}
              </Button>
            </div>
          </div>
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
        <Button
          disabled={isLoading}
          onClick={onComplete}
        >
          <Send className="mr-2 h-4 w-4" />
          {isLoading ? "Saving…" : generatedId ? "Letter Sent — Continue" : "Skip & Continue"}
        </Button>
      </div>
    </div>
  );
}
