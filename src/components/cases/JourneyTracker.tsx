"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { OutcomeForm } from "@/components/cases/OutcomeForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  advanceJourneyStep,
  advanceJourneyToStep,
  updateJourneyChecklist,
} from "@/lib/actions/journey";
import type { CaseJourney, JourneyStep, JourneyStepStatus } from "@/lib/services/journeyService";

type JourneyTrackerProps = {
  caseId: string;
  journey: CaseJourney;
  companyName: string;
};

function resolveDescription(text: string, companyName: string): string {
  return text.replace(/\{company_name\}/g, companyName);
}

function getStepDisplayStatus(
  step: JourneyStep,
  journey: CaseJourney
): JourneyStepStatus {
  const raw = journey.step_statuses[step.step_id];
  if (!raw) return "pending";
  if (typeof raw === "object" && "status" in raw) return raw.status;
  return raw as JourneyStepStatus;
}

function getChecklistState(step: JourneyStep, journey: CaseJourney): boolean[] {
  const raw = journey.step_statuses[step.step_id];
  const items = (step.action_config.items as string[]) ?? [];
  if (typeof raw === "object" && "checklist" in raw) {
    return raw.checklist ?? new Array(items.length).fill(false);
  }
  return new Array(items.length).fill(false);
}

function StepStatusIcon({ status }: { status: JourneyStepStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />;
  }
  if (status === "active" || status === "in_progress") {
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
      </span>
    );
  }
  if (status === "waiting") {
    return <Clock className="h-5 w-5 text-amber-500 shrink-0" />;
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
    </span>
  );
}

// --- Action type sub-components ---

function ChecklistAction({
  step,
  caseId,
  journey,
  onAdvance,
}: {
  step: JourneyStep;
  caseId: string;
  journey: CaseJourney;
  onAdvance: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const items = (step.action_config.items as string[]) ?? [];
  const checklist = getChecklistState(step, journey);
  const allChecked = checklist.length > 0 && checklist.every(Boolean);

  function toggleItem(index: number) {
    startTransition(async () => {
      const result = await updateJourneyChecklist(caseId, step.step_id, index, !checklist[index]);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li className="flex items-start gap-2" key={i}>
            <input
              checked={checklist[i] ?? false}
              className="mt-0.5 h-4 w-4 accent-primary"
              disabled={isPending}
              id={`check-${step.step_id}-${i}`}
              onChange={() => toggleItem(i)}
              type="checkbox"
            />
            <label
              className={`text-sm cursor-pointer ${checklist[i] ? "line-through text-muted-foreground" : ""}`}
              htmlFor={`check-${step.step_id}-${i}`}
            >
              {item}
            </label>
          </li>
        ))}
      </ul>
      {allChecked && (
        <Button
          className="w-full"
          disabled={isPending}
          onClick={onAdvance}
          size="sm"
          type="button"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark as complete
        </Button>
      )}
    </div>
  );
}

function SendLetterAction({
  step,
  caseId,
  onAdvance,
}: {
  step: JourneyStep;
  caseId: string;
  onAdvance: () => void;
}) {
  const config = step.action_config as {
    letter_type?: string;
    prompt_context?: string;
  };
  const letterType = config.letter_type ?? "initial_complaint";
  const promptContext = config.prompt_context;

  const href = `/cases/${caseId}/letters/new?type=${letterType}${promptContext ? `&journey_context=${promptContext}` : ""}`;

  return (
    <div className="space-y-2">
      <Link href={href}>
        <Button className="w-full" size="sm" type="button">
          <FileText className="mr-2 h-4 w-4" />
          Generate &amp; Review Letter
        </Button>
      </Link>
      <button
        className="w-full text-xs text-muted-foreground underline hover:text-foreground"
        onClick={onAdvance}
        type="button"
      >
        I&#39;ve already sent a letter for this step
      </button>
    </div>
  );
}

function BranchAction({
  step,
  caseId,
}: {
  step: JourneyStep;
  caseId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const config = step.action_config as {
    question?: string;
    options?: Array<{ label: string; next_step: string }>;
  };

  function handleChoice(nextStep: string) {
    startTransition(async () => {
      const result = await advanceJourneyToStep(caseId, nextStep);
      if (result?.error) toast.error(result.error);
      else toast.success("Journey updated");
    });
  }

  return (
    <div className="space-y-3">
      {config.question && (
        <p className="text-sm font-medium">{config.question}</p>
      )}
      <div className="space-y-2">
        {(config.options ?? []).map((opt) => (
          <button
            className="w-full rounded-lg border-2 px-4 py-2.5 text-sm text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-60"
            disabled={isPending}
            key={opt.next_step}
            onClick={() => handleChoice(opt.next_step)}
            type="button"
          >
            <ChevronRight className="mr-2 inline h-3.5 w-3.5 text-primary" />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoAction({
  step,
  onAdvance,
}: {
  step: JourneyStep;
  onAdvance: () => void;
}) {
  const config = step.action_config as { tip?: string };

  return (
    <div className="space-y-3">
      {config.tip && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">Tip</p>
          <p>{config.tip}</p>
        </div>
      )}
      <Button className="w-full" onClick={onAdvance} size="sm" type="button">
        I understand — Continue
      </Button>
    </div>
  );
}

function EscalateAction({
  step,
  caseId,
  onAdvance,
}: {
  step: JourneyStep;
  caseId: string;
  onAdvance: () => void;
}) {
  const config = step.action_config as {
    letter_type?: string;
    prompt_context?: string;
    escalation_target?: string;
    escalation_url?: string;
    escalation_method?: string;
  };

  const letterType = config.letter_type ?? "ombudsman_referral";
  const promptContext = config.prompt_context;
  const letterHref = `/cases/${caseId}/letters/new?type=${letterType}${promptContext ? `&journey_context=${promptContext}` : ""}`;
  const exportHref = `/cases/${caseId}/export`;

  return (
    <div className="space-y-2">
      {config.escalation_target && config.escalation_url && (
        <a
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          href={config.escalation_url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {config.escalation_target}
          {config.escalation_method ? ` — ${config.escalation_method}` : ""}
        </a>
      )}
      <Link href={letterHref}>
        <Button className="w-full" size="sm" type="button">
          <FileText className="mr-2 h-4 w-4" />
          Generate Referral Letter
        </Button>
      </Link>
      <Link href={exportHref}>
        <Button className="w-full" size="sm" type="button" variant="outline">
          Export Case PDF
        </Button>
      </Link>
      <Button className="w-full" onClick={onAdvance} size="sm" type="button" variant="ghost">
        I&#39;ve submitted my referral
      </Button>
    </div>
  );
}

function WaitAction({
  step,
  journey,
  onAdvance,
}: {
  step: JourneyStep;
  journey: CaseJourney;
  onAdvance: () => void;
}) {
  const config = step.action_config as { tip?: string };
  const waitingUntil = journey.waiting_until;

  let daysRemaining: number | null = null;
  if (waitingUntil) {
    const diff = Math.ceil((new Date(waitingUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    daysRemaining = Math.max(0, diff);
  }

  return (
    <div className="space-y-3">
      {waitingUntil && daysRemaining !== null && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-800">
            {daysRemaining === 0 ? "Waiting period has ended" : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
          </p>
          {daysRemaining > 0 && (
            <p className="text-xs text-amber-700 mt-0.5">
              Deadline: {new Date(waitingUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      )}
      {config.tip && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p>{config.tip}</p>
        </div>
      )}
      <Button
        className="w-full"
        onClick={onAdvance}
        size="sm"
        type="button"
        variant="outline"
      >
        They responded early — continue
      </Button>
    </div>
  );
}

function ResolveAction({
  caseId,
  onAdvance,
}: {
  caseId: string;
  onAdvance: () => void;
}) {
  const [outcomeOpen, setOutcomeOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={() => setOutcomeOpen(true)}
          size="sm"
          type="button"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Record Outcome &amp; Close Case
        </Button>
        <button
          className="w-full text-xs text-muted-foreground underline hover:text-foreground"
          onClick={onAdvance}
          type="button"
        >
          Skip — already resolved
        </button>
      </div>
      <OutcomeForm
        caseId={caseId}
        onOpenChange={setOutcomeOpen}
        open={outcomeOpen}
      />
    </>
  );
}

// --- Step card ---

function StepCard({
  step,
  status,
  isActive,
  completedAt,
  caseId,
  journey,
  companyName,
}: {
  step: JourneyStep;
  status: JourneyStepStatus;
  isActive: boolean;
  completedAt?: string;
  caseId: string;
  journey: CaseJourney;
  companyName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdvance() {
    startTransition(async () => {
      const result = await advanceJourneyStep(caseId);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Step completed");
        router.refresh();
      }
    });
  }

  const description = resolveDescription(step.description, companyName);

  if (status === "completed") {
    return (
      <div className="flex items-start gap-3 py-2 opacity-70">
        <StepStatusIcon status="completed" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium line-through">{step.title}</p>
          {completedAt && (
            <p className="text-xs text-muted-foreground">
              Completed {new Date(completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-start gap-3 py-2 opacity-40">
        <StepStatusIcon status="pending" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{step.title}</p>
          <p className="text-xs text-muted-foreground">Coming up</p>
        </div>
      </div>
    );
  }

  // Active step — full expanded view
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <StepStatusIcon status={status} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{step.title}</p>
          <Badge className="mt-1 border-primary/30 bg-primary/10 text-primary text-xs" variant="outline">
            Active
          </Badge>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

      {step.action_type === "checklist" && (
        <ChecklistAction
          caseId={caseId}
          journey={journey}
          onAdvance={handleAdvance}
          step={step}
        />
      )}

      {step.action_type === "send_letter" && (
        <SendLetterAction
          caseId={caseId}
          onAdvance={handleAdvance}
          step={step}
        />
      )}

      {step.action_type === "branch" && (
        <BranchAction caseId={caseId} step={step} />
      )}

      {step.action_type === "info" && (
        <InfoAction onAdvance={handleAdvance} step={step} />
      )}

      {step.action_type === "escalate" && (
        <EscalateAction
          caseId={caseId}
          onAdvance={handleAdvance}
          step={step}
        />
      )}

      {step.action_type === "wait" && (
        <WaitAction journey={journey} onAdvance={handleAdvance} step={step} />
      )}

      {step.action_type === "resolve" && (
        <ResolveAction caseId={caseId} onAdvance={handleAdvance} />
      )}
    </div>
  );
}

// --- Main JourneyTracker ---

export function JourneyTracker({ caseId, journey, companyName }: JourneyTrackerProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!journey.template) return null;

  const sortedSteps = [...journey.template.steps].sort((a, b) => a.order - b.order);
  const completedCount = sortedSteps.filter(
    (s) => getStepDisplayStatus(s, journey) === "completed"
  ).length;
  const totalSteps = sortedSteps.filter((s) => s.step_id !== "resolved").length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Guided Journey
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-normal text-muted-foreground">
              {completedCount}/{totalSteps} steps
            </span>
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardTitle>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{journey.template.name}</p>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-1 pt-0">
          {sortedSteps.map((step) => {
            const status = getStepDisplayStatus(step, journey);
            const completedAt = journey.step_completed_at[step.step_id];
            return (
              <StepCard
                caseId={caseId}
                completedAt={completedAt}
                companyName={companyName}
                isActive={step.step_id === journey.current_step_id}
                journey={journey}
                key={step.step_id}
                status={status}
                step={step}
              />
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
