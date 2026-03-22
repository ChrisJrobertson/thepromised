"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

type ResponseTimerProps = {
  caseId: string;
  companyName: string;
  responseDeadline: string;
  responseReceived: boolean;
  responseReceivedAt: string | null;
  escalationGuideHref: string;
};

export function ResponseTimer({
  caseId,
  companyName,
  responseDeadline,
  responseReceived,
  responseReceivedAt,
  escalationGuideHref,
}: ResponseTimerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deadline = new Date(responseDeadline);
  const now = new Date();

  const totalDays = 14;
  const elapsedDays = Math.max(0, totalDays - Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const overdueDays = Math.max(0, Math.ceil((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)));
  const pct = useMemo(() => Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)), [elapsedDays]);

  const barClass =
    pct < 50
      ? "bg-green-500"
      : pct < 80
        ? "bg-amber-500"
        : "bg-red-500";

  async function markReceived() {
    setIsSubmitting(true);
    const res = await fetch(`/api/cases/${caseId}/response-received`, { method: "POST" });
    setIsSubmitting(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(body.error ?? "Could not update response status");
      return;
    }
    toast.success("Response marked as received");
    window.location.reload();
  }

  if (responseReceived) {
    return (
      <section className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">
          Response received from {companyName}. Responded on{" "}
          {responseReceivedAt ? new Date(responseReceivedAt).toLocaleDateString("en-GB") : "—"}.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border bg-white p-4">
      <div className="h-3 overflow-hidden rounded bg-slate-100">
        <div
          className={`h-full ${remainingDays < 0 ? "bg-red-600" : barClass}`}
          style={{ width: `${remainingDays < 0 ? Math.min(140, 100 + overdueDays * 5) : pct}%` }}
        />
      </div>

      {remainingDays >= 0 ? (
        <p className="text-sm text-slate-700">
          Waiting for response from {companyName}. {elapsedDays} of {totalDays} days elapsed.
          Deadline: {deadline.toLocaleDateString("en-GB")} ({remainingDays} days remaining)
        </p>
      ) : (
        <p className="text-sm text-red-700">
          No response from {companyName} — {overdueDays} days overdue. This strengthens your case for escalation.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button disabled={isSubmitting} onClick={markReceived} size="sm" type="button">
          {isSubmitting ? "Saving..." : "Mark Response Received"}
        </Button>
        {remainingDays < 0 ? (
          <Link
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={escalationGuideHref}
          >
            Escalate Now →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
