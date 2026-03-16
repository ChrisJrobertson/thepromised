"use client";

import { addDays, differenceInDays, format, isFuture } from "date-fns";
import { enGB } from "date-fns/locale";
import { AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JourneyStep } from "@/types/journey";

interface Props {
  step: JourneyStep;
  orgName: string;
  firstContactDate: string | null;
  onComplete: () => Promise<void>;
  isLoading: boolean;
}

function interpolate(text: string, orgName: string) {
  return text.replace(/\{company_name\}/g, orgName);
}

export function JourneyInfo({ step, orgName, firstContactDate, onComplete, isLoading }: Props) {
  const tip = step.action_config.tip;
  const compensationTable = step.action_config.compensation_table;
  const checkDeadline = step.action_config.check_8_week_deadline;

  let deadlineInfo: { date: Date; daysAway: number; passed: boolean } | null = null;
  if (checkDeadline && firstContactDate) {
    const deadline = addDays(new Date(firstContactDate), 56);
    const daysAway = differenceInDays(deadline, new Date());
    deadlineInfo = { date: deadline, daysAway, passed: !isFuture(deadline) };
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {interpolate(step.description, orgName)}
      </p>

      {compensationTable && compensationTable.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Flight Distance</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Compensation</th>
              </tr>
            </thead>
            <tbody>
              {compensationTable.map((row, i) => (
                <tr className={i % 2 === 0 ? "bg-white" : "bg-slate-50"} key={i}>
                  <td className="px-4 py-2.5 text-slate-700">{row.distance}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {checkDeadline && (
        <div>
          {firstContactDate ? (
            deadlineInfo!.passed ? (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Your 8-week deadline has passed — you can escalate now
                  </p>
                  <p className="mt-0.5 text-xs text-green-700">
                    Deadline was {format(deadlineInfo!.date, "d MMMM yyyy", { locale: enGB })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    8-week escalation deadline: {format(deadlineInfo!.date, "d MMMM yyyy", { locale: enGB })}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    {deadlineInfo!.daysAway} day{deadlineInfo!.daysAway === 1 ? "" : "s"} remaining — you may proceed now if{" "}
                    {orgName} has issued a deadlock letter or final response.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-sm text-blue-800">
                Set the first contact date on your case to see your 8-week escalation deadline countdown.
              </p>
            </div>
          )}
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
        <Button disabled={isLoading} onClick={onComplete}>
          {isLoading ? "Saving…" : "I Understand — Continue"}
        </Button>
      </div>
    </div>
  );
}
