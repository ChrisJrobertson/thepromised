"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Compass,
  Loader2,
  Map,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getOrderedSteps } from "@/lib/journeys/templates";
import type { CaseJourney, JourneyStep, JourneyTemplate } from "@/types/journey";

import { JourneyProgress, JourneyProgressBar } from "./JourneyProgress";
import { JourneyBranch } from "./steps/JourneyBranch";
import { JourneyChecklist } from "./steps/JourneyChecklist";
import { JourneyEscalate } from "./steps/JourneyEscalate";
import { JourneyInfo } from "./steps/JourneyInfo";
import { JourneyResolve } from "./steps/JourneyResolve";
import { JourneySendLetter } from "./steps/JourneySendLetter";
import { JourneyWait } from "./steps/JourneyWait";

interface JourneyApiResponse {
  journey: CaseJourney | null;
  template: JourneyTemplate | null;
  availableTemplateId: string | null;
  steps?: JourneyStep[];
}

interface Props {
  caseId: string;
  orgName: string;
  firstContactDate: string | null;
}

async function fetchJourney(caseId: string): Promise<JourneyApiResponse> {
  const res = await fetch(`/api/journeys?caseId=${caseId}`);
  if (!res.ok) throw new Error("Failed to load journey");
  return res.json();
}

export function JourneyWizard({ caseId, orgName, firstContactDate }: Props) {
  const queryClient = useQueryClient();
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  // Track the "review" step — allows jumping back to a completed step
  const [reviewStepId, setReviewStepId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<JourneyApiResponse>({
    queryKey: ["journey", caseId],
    queryFn: () => fetchJourney(caseId),
    staleTime: 30_000,
  });

  const startMutation = useMutation({
    mutationFn: (templateId: string) =>
      fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, templateId }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to start journey");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey", caseId] });
      queryClient.invalidateQueries({ queryKey: ["journey-progress"] });
      setConfirmStart(false);
      toast.success("Guided journey started!");
    },
    onError: (e) => toast.error(e.message),
  });

  const stepMutation = useMutation({
    mutationFn: ({ journeyId, stepId, choice }: { journeyId: string; stepId: string; choice?: string }) =>
      fetch(`/api/journeys/${journeyId}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, choice }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to complete step");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey", caseId] });
      queryClient.invalidateQueries({ queryKey: ["journey-progress"] });
      setReviewStepId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const abandonMutation = useMutation({
    mutationFn: (journeyId: string) =>
      fetch(`/api/journeys/${journeyId}/abandon`, { method: "POST" }).then(async (res) => {
        if (!res.ok) throw new Error("Failed to abandon journey");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey", caseId] });
      queryClient.invalidateQueries({ queryKey: ["journey-progress"] });
      setConfirmAbandon(false);
      toast.success("Journey abandoned.");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const { journey, template, availableTemplateId } = data;

  // ── No journey & no template available ────────────────────────────────────
  if (!availableTemplateId && !journey) return null;

  // ── No active journey — show "Start Journey" card ─────────────────────────
  if (!journey || journey.status === "abandoned") {
    if (!availableTemplateId || !template) return null;

    return (
      <>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Compass className="h-4 w-4 text-primary" />
              </div>
              Guided Complaint Journey Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {template.description} Estimated time to complete:{" "}
              <strong>{template.estimated_duration_days} days</strong>.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {template.steps.length} steps — from initial complaint to escalation if needed.
            </p>
            <Button className="mt-4" size="sm" onClick={() => setConfirmStart(true)}>
              <Map className="mr-2 h-4 w-4" />
              Start Guided Journey
            </Button>
          </CardContent>
        </Card>

        <Dialog open={confirmStart} onOpenChange={setConfirmStart}>
          <DialogContent>
            <DialogTitle>Start Guided Journey</DialogTitle>
            <DialogDescription>
              This will walk you through the complete complaint process for{" "}
              <strong>{template.name}</strong> step by step. You can abandon it at any time.
            </DialogDescription>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmStart(false)}>
                Cancel
              </Button>
              <Button
                disabled={startMutation.isPending}
                onClick={() => startMutation.mutate(availableTemplateId)}
              >
                {startMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Starting…</>
                ) : (
                  "Start Journey"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ── Completed journey ──────────────────────────────────────────────────────
  if (journey.status === "completed") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <Compass className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              Journey completed — well done
            </p>
            <p className="text-xs text-green-700">
              {template?.name ?? journey.journey_template_id}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Active journey ─────────────────────────────────────────────────────────
  if (!template) return null;

  const orderedSteps = getOrderedSteps(template);
  const completedStepIds = new Set(journey.step_history.map((h) => h.step_id));
  const activeStepId = reviewStepId ?? journey.current_step_id;
  const currentStep = template.steps.find((s) => s.step_id === activeStepId) ?? null;
  const isReviewing = reviewStepId !== null;

  // Find the previous step id (for wait component)
  const currentIdx = orderedSteps.findIndex((s) => s.step_id === activeStepId);
  const prevStep = currentIdx > 0 ? orderedSteps[currentIdx - 1] : null;

  async function handleComplete(choice?: string) {
    if (!currentStep) return;
    await stepMutation.mutateAsync({
      journeyId: journey!.id,
      stepId: currentStep.step_id,
      choice,
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Compass className="h-4 w-4 text-primary" />
              Guided Journey: {template.name}
            </CardTitle>
            <Button
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              size="sm"
              variant="ghost"
              onClick={() => setConfirmAbandon(true)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Abandon
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* ── Stepper (desktop sidebar / mobile top bar) ─────────────── */}
            <div className="border-b p-4 lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
              {/* Mobile: compact bar */}
              <div className="lg:hidden">
                <JourneyProgressBar
                  completedStepIds={completedStepIds}
                  currentStepId={journey.current_step_id}
                  steps={orderedSteps}
                />
              </div>
              {/* Desktop: full stepper */}
              <div className="hidden lg:block">
                <JourneyProgress
                  completedStepIds={completedStepIds}
                  currentStepId={journey.current_step_id}
                  steps={orderedSteps}
                  onStepClick={(id) => setReviewStepId(completedStepIds.has(id) ? id : null)}
                />
              </div>
            </div>

            {/* ── Step content ───────────────────────────────────────────── */}
            <div className="flex-1 p-5">
              {isReviewing && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Reviewing a completed step — click a step in the sidebar to go back to your current step.
                  <button
                    className="ml-auto underline"
                    type="button"
                    onClick={() => setReviewStepId(null)}
                  >
                    Return to current step
                  </button>
                </div>
              )}

              {currentStep ? (
                <>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Step {currentStep.order}
                    </p>
                    <h3 className="text-lg font-semibold">
                      {currentStep.title.replace(/\{company_name\}/g, orgName)}
                    </h3>
                  </div>

                  {currentStep.action_type === "checklist" && (
                    <JourneyChecklist
                      isLoading={stepMutation.isPending}
                      orgName={orgName}
                      step={currentStep}
                      onComplete={() => handleComplete()}
                    />
                  )}
                  {currentStep.action_type === "send_letter" && (
                    <JourneySendLetter
                      caseId={caseId}
                      isLoading={stepMutation.isPending}
                      orgName={orgName}
                      step={currentStep}
                      onComplete={() => handleComplete()}
                    />
                  )}
                  {currentStep.action_type === "branch" && (
                    <JourneyBranch
                      isLoading={stepMutation.isPending}
                      orgName={orgName}
                      step={currentStep}
                      onComplete={(choice) => handleComplete(choice)}
                    />
                  )}
                  {currentStep.action_type === "info" && (
                    <JourneyInfo
                      firstContactDate={firstContactDate}
                      isLoading={stepMutation.isPending}
                      orgName={orgName}
                      step={currentStep}
                      onComplete={() => handleComplete()}
                    />
                  )}
                  {currentStep.action_type === "wait" && (
                    <JourneyWait
                      isLoading={stepMutation.isPending}
                      orgName={orgName}
                      previousStepId={prevStep?.step_id ?? null}
                      step={currentStep}
                      stepHistory={journey.step_history}
                      onComplete={() => handleComplete()}
                    />
                  )}
                  {currentStep.action_type === "escalate" && (
                    <JourneyEscalate
                      caseId={caseId}
                      isLoading={stepMutation.isPending}
                      orgName={orgName}
                      step={currentStep}
                      onComplete={() => handleComplete()}
                    />
                  )}
                  {currentStep.action_type === "resolve" && (
                    <JourneyResolve
                      caseId={caseId}
                      isLoading={stepMutation.isPending}
                      orgName={orgName}
                      step={currentStep}
                      onComplete={() => handleComplete()}
                    />
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Step not found.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abandon confirmation dialog */}
      <Dialog open={confirmAbandon} onOpenChange={setConfirmAbandon}>
        <DialogContent>
          <DialogTitle>Abandon this journey?</DialogTitle>
          <DialogDescription>
            Your progress will be marked as abandoned. You can start a new journey for this case later.
            Your case data, interactions, and letters will not be affected.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmAbandon(false)}>
              Keep Going
            </Button>
            <Button
              disabled={abandonMutation.isPending}
              variant="destructive"
              onClick={() => abandonMutation.mutate(journey.id)}
            >
              {abandonMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Abandoning…</>
              ) : (
                "Abandon Journey"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
