export type EscalationStep = {
  step_number: number;
  title: string;
  description: string;
  deadline_days?: number | null;
  legislation_ref?: string | null;
  tip?: string | null;
};

function deadlineLabel(days: number | null | undefined): string | null {
  if (days == null) return null;
  if (days >= 56) return "Within about 8 weeks";
  if (days === 7) return "Within 1 week";
  return `Within ${days} days`;
}

export function EscalationTimeline({ steps }: { steps: EscalationStep[] }) {
  if (steps.length === 0) return null;

  const sorted = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <ol className="relative mx-auto max-w-3xl border-l-2 border-[#D85A30]/40 pl-8">
      {sorted.map((step) => (
        <li className="mb-10 last:mb-0" key={step.step_number}>
          <span className="absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full bg-[#D85A30] text-[10px] font-bold text-white">
            {step.step_number}
          </span>
          <h3 className="text-lg font-semibold text-[#1a2744]">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {deadlineLabel(step.deadline_days) ? (
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {deadlineLabel(step.deadline_days)}
              </span>
            ) : null}
            {step.legislation_ref ? (
              <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                {step.legislation_ref}
              </span>
            ) : null}
          </div>
          {step.tip ? (
            <p className="mt-3 rounded-lg border border-[#D85A30]/20 bg-[#D85A30]/5 px-3 py-2 text-xs text-slate-700">
              <span className="font-semibold text-[#D85A30]">Tip: </span>
              {step.tip}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
