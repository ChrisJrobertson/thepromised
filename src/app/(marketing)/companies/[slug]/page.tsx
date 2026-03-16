import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { getCompanyOutcomeStats, getPublicScorecardForSlug } from "@/lib/analytics/scorecards";

type Params = Promise<{ slug: string }>;

function metricGrade(score: number) {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const scorecard = await getPublicScorecardForSlug(slug);
  if (!scorecard) return {};

  const companyName = scorecard.company_name;
  const promiseKeptPct = scorecard.promise_kept_pct.toFixed(1);
  const avgDays = scorecard.avg_resolution_days.toFixed(1);

  return {
    title: `${companyName} Complaint Performance — How They Handle Complaints | TheyPromised`,
    description: `See how ${companyName} handles customer complaints. Promise keeping rate, response times, helpfulness scores, and escalation data from real UK consumers. Track your complaint free.`,
    openGraph: {
      title: `${companyName} Complaint Scorecard`,
      description: `${companyName} keeps ${promiseKeptPct}% of promises and takes an average of ${avgDays} days to resolve complaints.`,
    },
  };
}

export default async function CompanyScorecardPage({ params }: { params: Params }) {
  const { slug } = await params;
  const scorecard = await getPublicScorecardForSlug(slug);
  if (!scorecard) notFound();

  const outcomeStats = await getCompanyOutcomeStats(scorecard.company_name);

  trackServerEvent(`scorecard:${slug}`, "scorecard_viewed", {
    company: scorecard.company_name,
    total_cases: scorecard.total_cases,
    grade: scorecard.grade,
  });

  if (scorecard.total_cases < 5) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-3xl space-y-4 px-4 text-center">
          <h1 className="text-3xl font-bold">How Does {scorecard.company_name} Handle Complaints?</h1>
          <p className="text-slate-600">Not enough data yet.</p>
        </div>
      </main>
    );
  }

  const rows = [
    { label: "Promise Keeping", pct: scorecard.promise_kept_pct },
    { label: "Response Speed", pct: scorecard.response_rate_within_deadline_pct },
    { label: "Helpfulness", pct: scorecard.helpfulness_pct },
    { label: "Resolution Rate", pct: scorecard.resolution_rate_without_ombudsman },
  ];

  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-4xl space-y-8 px-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">How Does {scorecard.company_name} Handle Complaints?</h1>
          <p className="text-slate-600">Based on {scorecard.total_cases} complaints tracked by TheyPromised users.</p>
          <p className="text-xs text-slate-500">Data updated in real time.</p>
        </header>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Complaint Scorecard</h2>
          <p className="mt-3 text-2xl font-bold">Overall Grade: {scorecard.grade}</p>

          <div className="mt-5 space-y-4">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{row.label}</span>
                  <span>{row.pct.toFixed(1)}% · {metricGrade(row.pct)}</span>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div className="h-full rounded bg-slate-800" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 text-sm md:grid-cols-2">
            <p>Escalation Rate: {scorecard.escalation_rate.toFixed(1)}% go to ombudsman</p>
            <p>Average Resolution: {scorecard.avg_resolution_days.toFixed(1)} days</p>
            <p>Average Response: {scorecard.avg_response_days.toFixed(1)} days</p>
            <p>Total Disputed: £{scorecard.total_disputed.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</p>
            <p className="md:col-span-2">Most Common Channel: {scorecard.most_common_channel} ({Math.max(
              scorecard.channel_breakdown.phone,
              scorecard.channel_breakdown.email,
              scorecard.channel_breakdown.webchat,
              scorecard.channel_breakdown.letter,
              scorecard.channel_breakdown.other
            ).toFixed(1)}%)</p>
          </div>
        </section>

        {/* Outcome stats section */}
        {outcomeStats && outcomeStats.total_resolved >= 5 ? (
          <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Resolution Outcomes
            </h2>
            <p className="text-sm text-slate-600">
              Based on {outcomeStats.total_resolved} resolved cases tracked on TheyPromised.
            </p>

            {/* Satisfaction breakdown */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Satisfaction breakdown</p>
              <div className="flex h-4 overflow-hidden rounded-full">
                {outcomeStats.total_resolved > 0 && (
                  <>
                    <div
                      className="bg-green-500"
                      style={{ width: `${(outcomeStats.fully_satisfied / outcomeStats.total_resolved) * 100}%` }}
                      title={`Fully satisfied: ${outcomeStats.fully_satisfied}`}
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${(outcomeStats.partially_satisfied / outcomeStats.total_resolved) * 100}%` }}
                      title={`Partially satisfied: ${outcomeStats.partially_satisfied}`}
                    />
                    <div
                      className="bg-red-400"
                      style={{ width: `${(outcomeStats.not_satisfied / outcomeStats.total_resolved) * 100}%` }}
                      title={`Not satisfied: ${outcomeStats.not_satisfied}`}
                    />
                  </>
                )}
              </div>
              <div className="mt-1 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  Satisfied ({outcomeStats.fully_satisfied})
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  Partial ({outcomeStats.partially_satisfied})
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                  Unsatisfied ({outcomeStats.not_satisfied})
                </span>
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xl font-bold">{outcomeStats.refunds + outcomeStats.compensations}</p>
                <p className="text-xs text-slate-500">Refunds/compensations</p>
              </div>
              {outcomeStats.avg_amount_pence != null && (
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold">
                    £{(outcomeStats.avg_amount_pence / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-slate-500">Average amount</p>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xl font-bold">{outcomeStats.satisfaction_pct.toFixed(0)}%</p>
                <p className="text-xs text-slate-500">Some satisfaction</p>
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-lg border bg-slate-50 p-5 text-sm text-slate-500">
            <p>Not enough outcome data yet for {scorecard.company_name}.</p>
            <p className="mt-1">Resolve your case to contribute.</p>
          </div>
        )}

        <div className="rounded-lg border bg-slate-50 p-5">
          <p className="mb-3 text-sm">Track your {scorecard.company_name} complaint</p>
          <Link className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white" href="/register">
            Start Free
          </Link>
        </div>
      </div>
    </main>
  );
}
