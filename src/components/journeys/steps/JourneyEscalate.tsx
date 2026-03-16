"use client";

import { ArrowUpRight, Download, ExternalLink, FileText, Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { JourneyStep } from "@/types/journey";

interface Props {
  step: JourneyStep;
  caseId: string;
  orgName: string;
  existingEscalationLetterId?: string | null;
  onComplete: () => Promise<void>;
  isLoading: boolean;
}

function interpolate(text: string, orgName: string) {
  return text.replace(/\{company_name\}/g, orgName);
}

export function JourneyEscalate({
  step,
  caseId,
  orgName,
  existingEscalationLetterId,
  onComplete,
  isLoading,
}: Props) {
  const cfg = step.action_config;
  const [generating, setGenerating] = useState(false);
  const [generatedLetterId, setGeneratedLetterId] = useState<string | null>(
    existingEscalationLetterId ?? null
  );
  const tip = cfg.tip;

  async function generateEscalationLetter() {
    if (!cfg.prompt_context) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/draft-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          letterType: cfg.letter_type ?? "ombudsman_referral",
          promptContext: cfg.prompt_context,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate letter");
        return;
      }
      setGeneratedLetterId(data.letterId);
      toast.success("Escalation letter generated.");
    } catch {
      toast.error("Failed to generate letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {interpolate(step.description, orgName)}
      </p>

      {/* Escalation target info */}
      {cfg.escalation_target && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-800">
            <ArrowUpRight className="mr-1.5 inline h-4 w-4" />
            Escalating to: {cfg.escalation_target}
          </h4>
          {cfg.escalation_method && (
            <p className="mt-1 text-xs text-red-700">
              Method: {cfg.escalation_method}
            </p>
          )}
          {cfg.escalation_url && (
            <a
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-800 underline underline-offset-2 hover:text-red-900"
              href={cfg.escalation_url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open {cfg.escalation_target} website →
            </a>
          )}
        </div>
      )}

      {/* Generate referral letter (if prompt_context provided) */}
      {cfg.prompt_context && (
        <div>
          {generatedLetterId ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Referral letter ready</p>
                <Link
                  className="mt-0.5 text-xs text-green-700 underline"
                  href={`/cases/${caseId}/letters/${generatedLetterId}`}
                >
                  View letter →
                </Link>
              </div>
            </div>
          ) : (
            <Button
              disabled={generating}
              size="sm"
              variant="outline"
              onClick={generateEscalationLetter}
            >
              {generating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>
              ) : (
                <><FileText className="mr-2 h-4 w-4" />Generate Referral Letter</>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Export case PDF */}
      {cfg.export_pdf && (
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary/50 hover:text-primary"
          href={`/cases/${caseId}/export`}
        >
          <Download className="h-4 w-4" />
          Export Case File PDF
        </Link>
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
          {isLoading ? "Saving…" : "I've Submitted My Complaint — Continue"}
        </Button>
      </div>
    </div>
  );
}
