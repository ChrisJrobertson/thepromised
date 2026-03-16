import Link from "next/link";
import { notFound } from "next/navigation";

import { getCompanyStatsById } from "@/lib/analytics/service";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type CaseLite = {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
  first_contact_date: string | null;
  updated_at: string | null;
  amount_in_dispute: number | null;
  interaction_count: number | null;
};

type InteractionLite = {
  case_id: string;
  interaction_date: string;
  mood: string | null;
  channel: string;
  outcome: string | null;
  promises_made: string | null;
  promise_fulfilled: boolean | null;
  promise_deadline: string | null;
  summary: string;
};

function calcDays(start?: string | null, end?: string | null) {
  if (!start) return null;
  const s = new Date(start).getTime();
  const e = new Date(end ?? new Date().toISOString()).getTime();
  return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [companyStats] = await Promise.all([getCompanyStatsById(id)]);
  if (!companyStats) notFound();

  const supabase = createServiceRoleClient();
  const [{ data: org }, { data: casesRaw }] = await Promise.all([
    supabase
      .from("organisations")
      .select("name, category, ombudsman_name, complaint_email")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("cases")
      .select("id, title, status, created_at, first_contact_date, updated_at, amount_in_dispute, interaction_count")
      .eq("organisation_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const cases = (casesRaw ?? []) as CaseLite[];
  const caseIds = cases.map((c) => c.id);
  const [{ data: interactionsRaw }, { data: lettersRaw }] = await Promise.all([
    caseIds.length
      ? supabase
          .from("interactions")
          .select("case_id, interaction_date, mood, channel, outcome, promises_made, promise_fulfilled, promise_deadline, summary")
          .in("case_id", caseIds)
      : Promise.resolve({ data: [] as InteractionLite[] }),
    caseIds.length
      ? supabase
          .from("letters")
          .select("id, sent_at, delivered_at, opened_at, bounced_at, delivery_status")
          .in("case_id", caseIds)
      : Promise.resolve({ data: [] as Array<Record<string, string | null>> }),
  ]);

  const interactions = (interactionsRaw ?? []) as InteractionLite[];
  const totalPromises = Number(companyStats.total_promises ?? 0);
  const kept = Number(companyStats.promises_kept ?? 0);
  const broken = Number(companyStats.promises_broken ?? 0);
  const pending = Math.max(totalPromises - kept - broken, 0);
  const promiseKeptPct = totalPromises ? (kept / totalPromises) * 100 : 0;

  const moodByMonth = new Map<string, { total: number; count: number }>();
  for (const interaction of interactions) {
    const month = new Date(interaction.interaction_date).toISOString().slice(0, 7);
    const score =
      interaction.mood === "helpful"
        ? 4
        : interaction.mood === "neutral"
          ? 3
          : interaction.mood === "unhelpful"
            ? 2
            : interaction.mood === "hostile"
              ? 1
              : null;
    if (!score) continue;
    const current = moodByMonth.get(month) ?? { total: 0, count: 0 };
    current.total += score;
    current.count += 1;
    moodByMonth.set(month, current);
  }

  const moodTrend = [...moodByMonth.entries()]
    .map(([month, value]) => ({
      month,
      score: value.count ? value.total / value.count : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const channelCounts = new Map<string, number>();
  const outcomeCounts = new Map<string, number>();
  for (const interaction of interactions) {
    channelCounts.set(interaction.channel, (channelCounts.get(interaction.channel) ?? 0) + 1);
    outcomeCounts.set(interaction.outcome ?? "other", (outcomeCounts.get(interaction.outcome ?? "other") ?? 0) + 1);
  }
  const totalInteractions = Math.max(interactions.length, 1);
  const channelRows = [...channelCounts.entries()]
    .map(([channel, count]) => ({ channel, count, pct: (count / totalInteractions) * 100 }))
    .sort((a, b) => b.count - a.count);

  const letters = lettersRaw ?? [];
  const openedCount = letters.filter((l) => Boolean(l.opened_at)).length;
  const bouncedCount = letters.filter((l) => Boolean(l.bounced_at)).length;
  const sentCount = Number(companyStats.letters_sent_count ?? 0);
  const responseCount = Number(companyStats.responses_received_count ?? 0);
  const responseRate = sentCount ? (responseCount / sentCount) * 100 : 0;
  const openRate = letters.length ? (openedCount / letters.length) * 100 : 0;

  const stopwords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "your",
    "have",
    "been",
    "not",
    "are",
    "was",
    "but",
  ]);
  const keywordCounts = new Map<string, number>();
  for (const row of cases) {
    for (const token of row.title.toLowerCase().split(/[^a-z0-9]+/g)) {
      if (token.length < 3 || stopwords.has(token)) continue;
      keywordCounts.set(token, (keywordCounts.get(token) ?? 0) + 1);
    }
  }
  const keywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const caseBrokenPromises = new Map<string, number>();
  for (const interaction of interactions) {
    if (interaction.promises_made && interaction.promise_fulfilled === false) {
      caseBrokenPromises.set(interaction.case_id, (caseBrokenPromises.get(interaction.case_id) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-slate-600 hover:underline" href="/admin/companies">← Back to Companies</Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{org?.name ?? companyStats.organisation_name}</h1>
            <p className="text-sm text-slate-600">Category: {(org?.category ?? companyStats.category ?? "other").replace(/_/g, " ")}</p>
          </div>
          <div className="text-sm text-slate-600">
            <p>Ombudsman: {org?.ombudsman_name ?? "—"}</p>
            <p>Complaint Email: {org?.complaint_email ?? "—"}</p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Total Cases", value: Number(companyStats.total_cases ?? 0).toString() },
          { label: "Avg Resolution Days", value: `${Number(companyStats.avg_resolution_days ?? 0).toFixed(1)} days` },
          { label: "Promise Kept Rate", value: `${promiseKeptPct.toFixed(1)}%` },
          { label: "Helpfulness Score", value: `${Number(companyStats.avg_helpfulness_score ?? 0).toFixed(2)}/4` },
          { label: "Escalation Rate", value: `${Number(companyStats.escalation_rate_pct ?? 0).toFixed(1)}%` },
        ].map((card) => (
          <div className="rounded border bg-white p-3" key={card.label}>
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Promise Tracking Breakdown</h2>
        <div className="mb-2 h-3 w-full overflow-hidden rounded bg-slate-100">
          <div className="h-full bg-green-500" style={{ width: `${totalPromises ? (kept / totalPromises) * 100 : 0}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <p>Total: {totalPromises}</p>
          <p>Kept: {kept}</p>
          <p>Broken: {broken}</p>
          <p>Pending: {pending}</p>
        </div>
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Mood / Helpfulness Over Time</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {moodTrend.map((row) => (
            <div className="rounded border p-2 text-sm" key={row.month}>
              <p className="text-xs text-slate-500">{row.month}</p>
              <p className="font-semibold">{row.score.toFixed(2)}/4</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Channel Usage</h2>
          <div className="space-y-2 text-sm">
            {channelRows.map((row) => (
              <div key={row.channel}>
                <div className="mb-1 flex items-center justify-between">
                  <span>{row.channel}</span>
                  <span>{row.pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div className="h-full rounded bg-blue-500" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Interaction Outcomes</h2>
          <div className="space-y-2 text-sm">
            {[...outcomeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([outcome, count]) => (
              <div className="flex items-center justify-between rounded border p-2" key={outcome}>
                <span>{outcome}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Response Behaviour</h2>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          <p>Letters sent: {sentCount}</p>
          <p>Responses received: {responseCount} ({responseRate.toFixed(1)}%)</p>
          <p>Average response time: {Number(companyStats.avg_response_days ?? 0).toFixed(1)} days</p>
          <p>Emails opened: {openedCount} ({openRate.toFixed(1)}%)</p>
          <p>Emails bounced: {bouncedCount}</p>
        </div>
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Common Complaint Types</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {keywords.map(([word, count]) => (
            <span className="rounded bg-slate-100 px-2 py-1" key={word}>
              {word} ({count})
            </span>
          ))}
        </div>
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent Cases (Anonymised)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Interactions</th>
                <th className="px-3 py-2">Promises Broken</th>
                <th className="px-3 py-2">Amount Disputed</th>
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 20).map((row) => (
                <tr className="border-t" key={row.id}>
                  <td className="px-3 py-2">{row.title}</td>
                  <td className="px-3 py-2 capitalize">{row.status}</td>
                  <td className="px-3 py-2">{calcDays(row.first_contact_date, row.updated_at) ?? "—"} days</td>
                  <td className="px-3 py-2">{row.interaction_count ?? 0}</td>
                  <td className="px-3 py-2">{caseBrokenPromises.get(row.id) ?? 0}</td>
                  <td className="px-3 py-2">£{Number(row.amount_in_dispute ?? 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
