"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AiCreditsModal } from "@/components/ui/AiCreditsModal";
import type { AiSuggestion } from "@/app/api/ai/suggest/route";

type AISuggestionProps = {
  caseId: string;
  tier?: "free" | "basic" | "pro";
  suggestionsUsed?: number;
  suggestionsLimit?: number;
};

const STRENGTH_CONFIG = {
  weak: {
    label: "Weak",
    colour: "border-red-200 bg-red-50 text-red-700",
    icon: AlertTriangle,
    barColour: "bg-red-400",
    barWidth: "w-1/3",
  },
  moderate: {
    label: "Moderate",
    colour: "border-amber-200 bg-amber-50 text-amber-700",
    icon: TrendingUp,
    barColour: "bg-amber-400",
    barWidth: "w-2/3",
  },
  strong: {
    label: "Strong",
    colour: "border-green-200 bg-green-50 text-green-700",
    icon: CheckCircle2,
    barColour: "bg-green-500",
    barWidth: "w-full",
  },
} as const;

function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-5/6" />
      <div className="h-8 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="h-4 bg-muted rounded w-4/5" />
    </div>
  );
}

export function AISuggestion({
  caseId,
  tier = "free",
  suggestionsUsed = 0,
  suggestionsLimit = 3,
}: AISuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsInfo, setCreditsInfo] = useState<{
    used: number;
    limit: number;
  }>({ used: suggestionsUsed, limit: suggestionsLimit });
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const creditsRemaining = creditsInfo.limit - creditsInfo.used;
  const isExhausted = creditsRemaining <= 0;

  async function fetchSuggestion() {
    if (isExhausted) {
      setShowCreditsModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ caseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If credits were exhausted server-side (concurrent request edge case)
        if (data.error === "credits_exhausted") {
          setCreditsInfo({ used: data.creditsLimit, limit: data.creditsLimit });
          setShowCreditsModal(true);
          return;
        }
        setError(data.message ?? "AI analysis failed. Please try again.");
        return;
      }

      setResult(data.suggestion as AiSuggestion);
      setCreditsInfo({
        used: data.creditsUsed,
        limit: data.creditsLimit,
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const strengthConfig = result ? STRENGTH_CONFIG[result.strengthRating] : null;

  return (
    <>
      <AiCreditsModal
        feature="suggestions"
        limitCount={creditsInfo.limit}
        onClose={() => setShowCreditsModal(false)}
        open={showCreditsModal}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Case Analysis
            </span>
            {creditsInfo.limit > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                {creditsInfo.used}/{creditsInfo.limit} used
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !loading && !error && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Get AI-powered analysis of your case: strength rating, next steps, deadlines, and evidence recommendations.
              </p>

              {/* Credit usage indicator */}
              {creditsInfo.limit > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${Math.min(100, (creditsInfo.used / creditsInfo.limit) * 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {creditsRemaining > 0
                      ? `${creditsRemaining} left`
                      : "None left"}
                  </span>
                </div>
              )}

              <Button
                className="w-full"
                onClick={fetchSuggestion}
                size="sm"
                type="button"
                variant={isExhausted ? "outline" : "default"}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isExhausted ? "Monthly limit reached" : "Analyse Case"}
              </Button>

              {tier === "free" && !isExhausted && (
                <p className="text-center text-xs text-muted-foreground">
                  {creditsRemaining} of {creditsInfo.limit} free analyses remaining this month
                </p>
              )}
            </div>
          )}

          {loading && <SkeletonLoader />}

          {error && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
              <Button
                className="w-full"
                onClick={fetchSuggestion}
                size="sm"
                type="button"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Strength rating */}
              {strengthConfig && (
                <div
                  className={`flex items-start gap-3 rounded-md border p-3 ${strengthConfig.colour}`}
                >
                  <strengthConfig.icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {strengthConfig.label} case
                    </p>
                    <p className="text-xs">{result.strengthExplanation}</p>
                  </div>
                </div>
              )}

              {/* Assessment */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Assessment
                </p>
                <p className="text-sm">{result.assessment}</p>
              </div>

              <Separator />

              {/* Next step */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recommended next step
                </p>
                <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm font-medium">{result.nextStep}</p>
                </div>
              </div>

              {/* Letter recommendation */}
              {result.letterRecommended && result.letterType && (
                <Link
                  className="flex items-center gap-2 rounded-md border border-secondary/30 bg-secondary/5 p-3 text-sm text-secondary hover:bg-secondary/10 transition-colors"
                  href={`/cases/${caseId}/letters/new?type=${result.letterType}`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Generate recommended letter</p>
                    <p className="text-xs opacity-80">
                      {result.letterType.replace(/_/g, " ")}
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Link>
              )}

              {/* Deadlines */}
              {result.deadlines.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Upcoming deadlines
                  </p>
                  <ul className="space-y-1">
                    {result.deadlines.map((d, i) => (
                      <li className="flex items-start gap-2 text-xs" key={i}>
                        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence needed */}
              {result.evidenceNeeded.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Evidence to gather
                  </p>
                  <ul className="space-y-1">
                    {result.evidenceNeeded.map((e, i) => (
                      <li className="flex items-start gap-2 text-xs" key={i}>
                        <Shield className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Credit usage post-result */}
              {creditsInfo.limit > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  {creditsInfo.used} of {creditsInfo.limit} analyses used this month
                  {tier === "free" && creditsInfo.used >= creditsInfo.limit && (
                    <> · <Link className="text-primary underline" href="/pricing">upgrade for more</Link></>
                  )}
                </p>
              )}

              <Button
                className="w-full"
                onClick={fetchSuggestion}
                size="sm"
                type="button"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Regenerate analysis
              </Button>

              <p className="text-[10px] italic text-muted-foreground text-center leading-tight">
                AI suggestions are for guidance only and do not constitute legal advice. Always verify information with the relevant ombudsman or a qualified adviser.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
