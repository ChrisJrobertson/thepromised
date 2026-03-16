"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { OutcomeForm } from "@/components/cases/OutcomeForm";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { updateCaseStatus } from "@/lib/actions/cases";
import type { Case } from "@/types/database";

type CaseActionsProps = {
  caseId: string;
  currentStatus: Case["status"];
  currentPriority: Case["priority"];
  currentStage?: Case["escalation_stage"];
  hasOutcome?: boolean;
};

const STATUS_OPTIONS: Case["status"][] = ["open", "escalated", "resolved", "closed"];
const PRIORITY_OPTIONS: Case["priority"][] = ["low", "medium", "high", "urgent"];

const CLOSING_STATUSES: Case["status"][] = ["resolved", "closed"];

export function CaseActions({
  caseId,
  currentStatus,
  currentPriority,
  hasOutcome = false,
}: CaseActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Case["status"] | null>(null);

  function handleStatusChange(status: Case["status"]) {
    if (CLOSING_STATUSES.includes(status) && !hasOutcome) {
      setPendingStatus(status);
      setOutcomeOpen(true);
      return;
    }

    startTransition(async () => {
      const result = await updateCaseStatus(caseId, { status });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${status}`);
      }
    });
  }

  function handleSkipOutcome() {
    setOutcomeOpen(false);
    if (pendingStatus) {
      startTransition(async () => {
        const result = await updateCaseStatus(caseId, { status: pendingStatus });
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(`Status updated to ${pendingStatus}`);
        }
        setPendingStatus(null);
      });
    }
  }

  function handlePriorityChange(priority: Case["priority"]) {
    startTransition(async () => {
      const result = await updateCaseStatus(caseId, { priority });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Priority updated to ${priority}`);
      }
    });
  }

  return (
    <>
    <div className="flex flex-wrap gap-2">
      <Link
        className={buttonVariants({ size: "sm" })}
        href={`/cases/${caseId}/interactions/new`}
      >
        + Log Interaction
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          disabled={isPending}
        >
          Status
          <ChevronDown className="ml-1.5 h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUS_OPTIONS.map((status) => (
            <DropdownMenuItem
              className={currentStatus === status ? "font-medium" : ""}
              key={status}
              onClick={() => handleStatusChange(status)}
            >
              {currentStatus === status ? "✓ " : ""}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          disabled={isPending}
        >
          Priority
          <ChevronDown className="ml-1.5 h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Update Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PRIORITY_OPTIONS.map((priority) => (
            <DropdownMenuItem
              className={currentPriority === priority ? "font-medium" : ""}
              key={priority}
              onClick={() => handlePriorityChange(priority)}
            >
              {currentPriority === priority ? "✓ " : ""}
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <OutcomeForm
      caseId={caseId}
      onOpenChange={(open) => {
        setOutcomeOpen(open);
        if (!open) setPendingStatus(null);
      }}
      onSkip={handleSkipOutcome}
      open={outcomeOpen}
    />
    </>
  );
}
