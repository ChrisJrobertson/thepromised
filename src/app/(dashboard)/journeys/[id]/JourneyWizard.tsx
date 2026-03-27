"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  FileText,
  Info,
  Lightbulb,
  Loader2,
  MessageSquare,
  Scale,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  advanceJourneyStep,
  completeJourney,
  abandonJourney,
  linkJourneyToCase,
} from "@/lib/actions/journeys";
import type { JourneyTemplate, JourneyStep } from "@/lib/journeys/templates";
import type { UserJourney } from "@/lib/actions/journeys";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
  journey: UserJourney;
  template: JourneyTemplate;
  cases: { id: string; title: string }[];
};

export function JourneyWizard({ journey, template, cases }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(journey.current_step_index);
  const [completedSteps, setCompletedSteps] = useState<string[]>(
    Array.isArray(journey.completed_steps) ? (journey.completed_steps as string[]) : []
  );
  const [linkedCaseId, setLinkedCaseId] = useState(journey.case_id ?? "");
  const [isLinkingPending, startLinkingTransition] = useTransition();

  const currentStep: JourneyStep | undefined = template.steps[currentIndex];
  const isCompleted = journey.status === "completed";
  const totalSteps = template.steps.length;
  const progressPercent = Math.round((currentIndex / totalSteps) * 100);

  function resolveNextIndex(): number {
    if (!currentStep?.next_step_id) return currentIndex + 1;
    const idx = template.steps.findIndex((s) => s.id === currentStep.next_step_id);
    return idx !== -1 ? idx : currentIndex + 1;
  }

  function handleAdvance(nextIndexOverride?: number) {
    if (!currentStep) return;
    const nextIndex = nextIndexOverride ?? resolveNextIndex();
    const isLastStep = nextIndex >= totalSteps;

    startTransition(async () => {
      if (isLastStep) {
        const result = await completeJourney(journey.id);
        if (result.error) { toast.error(result.error); return; }
        toast.success("Journey completed! Well done.");
        router.refresh();
        return;
      }

      const result = await advanceJourneyStep(journey.id, nextIndex, currentStep.id);
      if (result.error) { toast.error(result.error); return; }

      setCompletedSteps((prev) => [...prev, currentStep.id]);
      setCurrentIndex(nextIndex);
    });
  }

  function handleDecision(nextId: string) {
    const idx = template.steps.findIndex((s) => s.id === nextId);
    if (idx === -1) {
      handleAdvance();
      return;
    }
    if (idx === currentIndex) {
      toast.message("Stay on this step until your situation changes, then choose again.");
      return;
    }
    handleAdvance(idx);
  }

  function handleLinkCase(caseId: string | null) {
    if (!caseId) return;
    if (caseId === "__new__") {
      router.push(
        `/cases/new?linkJourney=${encodeURIComponent(journey.id)}`,
      );
      return;
    }
    setLinkedCaseId(caseId);
    startLinkingTransition(async () => {
      const result = await linkJourneyToCase(journey.id, caseId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Case linked to journey.");
        router.refresh();
      }
    });
  }

  function handleAbandon() {
    if (!confirm("Are you sure you want to abandon this journey? You can start again any time.")) return;
    startTransition(async () => {
      await abandonJourney(journey.id);
    });
  }

  if (isCompleted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Journey Complete!</h1>
        <p className="text-muted-foreground">
          You&apos;ve completed all steps in the <strong>{template.title}</strong> journey.
        </p>
        <div className="flex justify-center gap-3">
          {linkedCaseId && (
            <Link href={`/cases/${linkedCaseId}`}>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" /> View Case
              </Button>
            </Link>
          )}
          <Link href="/journeys/new">
            <Button className="gap-2">
              <ArrowRight className="h-4 w-4" /> Start Another Journey
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/journeys">
          <Button size="icon" variant="ghost">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{template.title}</h1>
          <p className="text-xs text-muted-foreground">
            Step {currentIndex + 1} of {totalSteps}
          </p>
        </div>
        <button
          className="text-xs text-muted-foreground underline"
          onClick={handleAbandon}
          type="button"
        >
          Abandon
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{completedSteps.length} steps completed</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step stepper pills */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {template.steps.map((step, i) => (
          <div
            className={`h-2 flex-1 min-w-3 rounded-full transition-colors ${
              completedSteps.includes(step.id)
                ? "bg-teal-500"
                : i === currentIndex
                ? "bg-primary"
                : "bg-slate-200"
            }`}
            key={step.id}
            title={step.title}
          />
        ))}
      </div>

      {/* Link case card (if not linked) */}
      {!linkedCaseId && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 py-3">
            <Info className="h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-amber-800">Link a case to auto-fill letters</p>
              <div className="mt-2 flex items-center gap-2">
                <Label className="text-xs text-amber-700 shrink-0">Case:</Label>
                <Select onValueChange={handleLinkCase}>
                  <SelectTrigger className="h-7 text-xs bg-white">
                    <SelectValue placeholder="Select case…" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__" className="text-xs">
                      + Create new case
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isLinkingPending && <Loader2 className="h-3 w-3 animate-spin text-amber-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current step card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <StepTypeIcon type={currentStep.type} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base leading-snug">{currentStep.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-slate-600">{currentStep.description}</p>

          {currentStep.action_config?.wait_message &&
            (currentStep.type === "action_draft_letter" || currentStep.type === "wait") && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-medium text-slate-700">What to expect</p>
                <p className="mt-1">{currentStep.action_config.wait_message}</p>
              </div>
            )}

          {currentStep.type === "checklist" &&
            currentStep.action_config?.checklist_items &&
            currentStep.action_config.checklist_items.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Checklist</p>
                <ul className="space-y-2">
                  {currentStep.action_config.checklist_items.map((item, i) => (
                    <li className="flex gap-2 text-xs text-slate-600" key={i}>
                      <span className="mt-0.5 text-teal-600">☐</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {currentStep.action_config?.checklist_tip &&
            (currentStep.type === "checklist" ||
              currentStep.type === "info" ||
              currentStep.type === "action_draft_letter") && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <p className="text-xs text-amber-800">{currentStep.action_config.checklist_tip}</p>
                </div>
              </div>
            )}

          {currentStep.action_config?.letter_before_action && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-800">
              You should already have sent a Letter Before Action. Keep a copy for the court bundle.
            </div>
          )}

          {/* Legal basis */}
          {currentStep.legal_basis && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-start gap-2">
                <Scale className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1">Legal basis</p>
                  <p className="text-xs text-blue-600">{currentStep.legal_basis}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">Tips</p>
                  <ul className="space-y-1">
                    {currentStep.tips.map((tip, i) => (
                      <li className="text-xs text-amber-600" key={i}>
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Decision step */}
          {currentStep.type === "decision" && currentStep.action_config && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
                disabled={isPending}
                onClick={() =>
                  handleDecision(currentStep.action_config?.decision_yes_next ?? "")
                }
                type="button"
              >
                <CheckCircle2 className="h-4 w-4" />
                {currentStep.action_config.decision_yes_label ?? "Yes"}
              </Button>
              <Button
                className="w-full gap-2"
                disabled={isPending}
                onClick={() =>
                  handleDecision(currentStep.action_config?.decision_no_next ?? "")
                }
                type="button"
                variant="outline"
              >
                <XCircle className="h-4 w-4" />
                {currentStep.action_config.decision_no_label ?? "No"}
              </Button>
            </div>
          )}

          {/* Multi-option branch */}
          {currentStep.type === "branch" &&
            currentStep.action_config?.branch_options &&
            currentStep.action_config.branch_options.length > 0 && (
              <div className="space-y-2">
                {currentStep.action_config.branch_question && (
                  <p className="text-xs font-medium text-slate-700">
                    {currentStep.action_config.branch_question}
                  </p>
                )}
                <div className="grid gap-2">
                  {currentStep.action_config.branch_options.map((opt) => (
                    <Button
                      className="h-auto min-h-11 w-full justify-start whitespace-normal px-3 py-2 text-left text-sm"
                      disabled={isPending}
                      key={opt.next_step_id + opt.label}
                      onClick={() => handleDecision(opt.next_step_id)}
                      type="button"
                      variant="outline"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

          {/* Action step buttons */}
          {currentStep.type !== "decision" && currentStep.type !== "branch" && (
            <div className="flex flex-wrap gap-3">
              {currentStep.type === "complete" &&
                currentStep.action_config?.suggest_outcome_link &&
                linkedCaseId && (
                  <Link href={`/cases/${linkedCaseId}`}>
                    <Button className="gap-2" type="button" variant="secondary">
                      <FileText className="h-4 w-4" />
                      Record outcome on your case
                    </Button>
                  </Link>
                )}
              {/* Letter drafting action */}
              {currentStep.type === "action_draft_letter" && currentStep.action_config?.letter_type && (
                <Link
                  href={
                    linkedCaseId
                      ? `/cases/${linkedCaseId}/letters/new?type=${encodeURIComponent(currentStep.action_config.letter_type)}&promptContext=${encodeURIComponent(currentStep.action_config.prompt_context ?? "")}`
                      : "/cases"
                  }
                  target={linkedCaseId ? undefined : "_blank"}
                >
                  <Button className="gap-2" type="button" variant="default">
                    <FileText className="h-4 w-4" />
                    {linkedCaseId ? "Draft this letter →" : "Link a case first"}
                    {!linkedCaseId && <ExternalLink className="h-3 w-3" />}
                  </Button>
                </Link>
              )}

              {/* Log interaction action */}
              {currentStep.type === "action_log_interaction" && (
                <Link
                  href={
                    linkedCaseId
                      ? `/cases/${linkedCaseId}/interactions/new`
                      : "/cases"
                  }
                >
                  <Button className="gap-2" type="button" variant="default">
                    <MessageSquare className="h-4 w-4" />
                    {linkedCaseId ? "Log interaction →" : "Link a case first"}
                  </Button>
                </Link>
              )}

              <Button
                className="gap-2"
                disabled={isPending}
                onClick={() => handleAdvance()}
                type="button"
                variant={
                  currentStep.type === "wait" ||
                  currentStep.type === "info" ||
                  currentStep.type === "checklist"
                    ? "default"
                    : "outline"
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : currentIndex + 1 >= totalSteps ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Complete Journey
                  </>
                ) : (
                  <>
                    {currentStep.type === "complete" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Mark Complete
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" /> Done — Next Step
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed steps */}
      {completedSteps.length > 0 && (
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-muted-foreground">
            Completed steps ({completedSteps.length})
          </summary>
          <div className="mt-3 space-y-2">
            {completedSteps.map((stepId) => {
              const step = template.steps.find((s) => s.id === stepId);
              if (!step) return null;
              return (
                <div
                  className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
                  key={stepId}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
                  <span className="text-sm text-slate-600">{step.title}</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}

function StepTypeIcon({ type }: { type: string }) {
  const base = "h-8 w-8 rounded-full flex items-center justify-center shrink-0";
  if (type === "action_draft_letter")
    return (
      <div className={`${base} bg-blue-100`}>
        <FileText className="h-4 w-4 text-blue-600" />
      </div>
    );
  if (type === "action_log_interaction")
    return (
      <div className={`${base} bg-teal-100`}>
        <MessageSquare className="h-4 w-4 text-teal-600" />
      </div>
    );
  if (type === "decision")
    return (
      <div className={`${base} bg-amber-100`}>
        <Scale className="h-4 w-4 text-amber-600" />
      </div>
    );
  if (type === "complete")
    return (
      <div className={`${base} bg-green-100`}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      </div>
    );
  if (type === "checklist")
    return (
      <div className={`${base} bg-violet-100`}>
        <CheckCircle2 className="h-4 w-4 text-violet-600" />
      </div>
    );
  if (type === "branch")
    return (
      <div className={`${base} bg-amber-100`}>
        <Scale className="h-4 w-4 text-amber-700" />
      </div>
    );
  return (
    <div className={`${base} bg-slate-100`}>
      <Info className="h-4 w-4 text-slate-600" />
    </div>
  );
}
