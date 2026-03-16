"use client";

import { useQuery } from "@tanstack/react-query";
import { Compass, Loader2 } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJourneyTemplate, getOrderedSteps } from "@/lib/journeys/templates";
import type { CaseJourney } from "@/types/journey";

interface ActiveJourneyRow {
  journey: CaseJourney;
  caseTitle: string;
  orgName: string;
}

async function fetchActiveJourneys(): Promise<ActiveJourneyRow[]> {
  const res = await fetch("/api/journeys/active");
  if (!res.ok) return [];
  return res.json();
}

export function JourneyProgressWidget() {
  const { data: rows = [], isLoading } = useQuery<ActiveJourneyRow[]>({
    queryKey: ["journey-progress"],
    queryFn: fetchActiveJourneys,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Compass className="h-4 w-4 text-primary" />
            Guided Journeys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Compass className="h-4 w-4 text-primary" />
          Guided Journeys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(({ journey, caseTitle, orgName }) => {
          const template = getJourneyTemplate(journey.journey_template_id);
          if (!template) return null;

          const orderedSteps = getOrderedSteps(template);
          const completedCount = journey.step_history.length;
          const totalSteps = orderedSteps.length;
          const pct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
          const currentStep = template.steps.find((s) => s.step_id === journey.current_step_id);

          return (
            <Link
              className="block rounded-lg border p-3 transition-all hover:border-primary/50 hover:shadow-sm"
              href={`/cases/${journey.case_id}?tab=journey`}
              key={journey.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{orgName}</p>
                  <p className="truncate text-xs text-muted-foreground">{caseTitle}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {completedCount}/{totalSteps}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {currentStep && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Next: {currentStep.title.replace(/\{company_name\}/g, orgName)}
                </p>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
