import { TopCompaniesTable } from "@/components/admin/TopCompaniesTable";
import {
  getBusinessEnquiries,
  getCategoryStats,
  getCompanyRankings,
  getMonthlyTrends,
  getPlatformStats,
  getRecentSignups,
} from "@/lib/analytics/service";

function formatMoney(value: number | null | undefined) {
  return `£${Number(value ?? 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function percentage(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export default async function AdminOverviewPage() {
  const [platform, trends, rankings, categories, signups, enquiries] = await Promise.all([
    getPlatformStats(),
    getMonthlyTrends(),
    getCompanyRankings(50),
    getCategoryStats(),
    getRecentSignups(20),
    getBusinessEnquiries(20),
  ]);

  const totalPromises = Number(platform.total_promises ?? 0);
  const brokenPromises = Number(platform.total_broken_promises ?? 0);
  const keptPromises = Math.max(totalPromises - brokenPromises, 0);
  const keptPct = percentage(keptPromises, totalPromises);

  const categoryMax = Math.max(...(categories ?? []).map((c) => Number(c.total_cases ?? 0)), 1);
  const responseMax = Math.max(...(categories ?? []).map((c) => Number(c.avg_resolution_days ?? 0)), 1);

  const leaderboard = (rankings ?? [])
    .map((r) => {
      const broken = Number(r.promise_broken_pct ?? 0);
      return { ...r, promise_kept_pct: Math.max(0, 100 - broken) };
    })
    .filter((r) => Number(r.complaint_count ?? 0) >= 1)
    .sort((a, b) => b.promise_kept_pct - a.promise_kept_pct);

  const bestFive = leaderboard.slice(0, 5);
  const worstFive = [...leaderboard].reverse().slice(0, 5);

  const freeUsers = Number(platform.free_users ?? 0);
  const basicUsers = Number(platform.basic_users ?? 0);
  const proUsers = Number(platform.pro_users ?? 0);
  const totalUsers = Math.max(Number(platform.total_users ?? 0), 1);
  const donutStyle = {
    background: `conic-gradient(
      #64748b 0% ${((freeUsers / totalUsers) * 100).toFixed(2)}%,
      #0ea5e9 ${((freeUsers / totalUsers) * 100).toFixed(2)}% ${(((freeUsers + basicUsers) / totalUsers) * 100).toFixed(2)}%,
      #14b8a6 ${(((freeUsers + basicUsers) / totalUsers) * 100).toFixed(2)}% 100%
    )`,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Analytics Overview</h1>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Total Users",
            value: Number(platform.total_users ?? 0).toLocaleString("en-GB"),
            delta: `+${Number(platform.signups_last_7_days ?? 0)} this week`,
            deltaColour: "text-green-600",
          },
          {
            label: "Active Cases",
            value: Number(platform.active_cases ?? 0).toLocaleString("en-GB"),
            delta: `+${Number(platform.cases_last_7_days ?? 0)} this week`,
            deltaColour: "text-amber-600",
          },
          {
            label: "Total Interactions",
            value: Number(platform.total_interactions ?? 0).toLocaleString("en-GB"),
            delta: `+${Number(platform.interactions_last_7_days ?? 0)} this week`,
            deltaColour: "text-green-600",
          },
          {
            label: "Promises Tracked",
            value: `${keptPromises} kept / ${brokenPromises} broken`,
            delta: `${keptPct.toFixed(1)}% kept rate`,
            deltaColour: keptPct >= 50 ? "text-green-600" : "text-red-600",
          },
          {
            label: "Letters Sent",
            value: Number(platform.total_letters_sent ?? 0).toLocaleString("en-GB"),
            delta: "",
            deltaColour: "text-slate-500",
          },
          {
            label: "Amount Disputed",
            value: formatMoney(platform.total_amount_disputed),
            delta: "",
            deltaColour: "text-slate-500",
          },
        ].map((card) => (
          <div className="rounded-lg bg-white p-4 shadow-sm" key={card.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
            {card.label === "Promises Tracked" && (
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
                <div className="h-full bg-green-500" style={{ width: `${keptPct}%` }} />
              </div>
            )}
            {card.delta ? <p className={`mt-2 text-xs ${card.deltaColour}`}>{card.delta}</p> : null}
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold">Monthly Activity</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {(trends ?? []).slice(-12).map((row) => (
            <div className="rounded border p-3" key={row.month ?? Math.random()}>
              <p className="text-xs text-slate-500">
                {row.month ? new Date(row.month).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "Unknown"}
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <p>New: <span className="font-semibold text-blue-700">{Number(row.new_cases ?? 0)}</span></p>
                <p>Resolved: <span className="font-semibold text-green-700">{Number(row.resolved_cases ?? 0)}</span></p>
                <p>Ombudsman: <span className="font-semibold text-red-700">{Number(row.ombudsman_referrals ?? 0)}</span></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Top 10 Most Complained About Companies</h2>
          <TopCompaniesTable rows={(rankings ?? []).map((r) => ({ ...r, organisation_id: r.organisation_id }))} />
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Complaints by Category</h2>
          <div className="space-y-2">
            {(categories ?? []).map((cat) => {
              const value = Number(cat.total_cases ?? 0);
              const width = (value / categoryMax) * 100;
              return (
                <div key={cat.category ?? Math.random()}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize">{(cat.category ?? "other").replace(/_/g, " ")}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div className="h-full rounded bg-amber-400" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Promise Keeping Leaderboard</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-green-700">Top 5</p>
              <ul className="space-y-2 text-sm">
                {bestFive.map((row) => (
                  <li className="flex items-center justify-between rounded border p-2" key={`best-${row.organisation_id ?? row.name}`}>
                    <span>{row.name}</span>
                    <span className="rounded bg-green-100 px-2 py-0.5 text-green-700">{row.promise_kept_pct.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-red-700">Bottom 5</p>
              <ul className="space-y-2 text-sm">
                {worstFive.map((row) => (
                  <li className="flex items-center justify-between rounded border p-2" key={`worst-${row.organisation_id ?? row.name}`}>
                    <span>{row.name}</span>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">{row.promise_kept_pct.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Average Response Time by Category</h2>
          <div className="space-y-2">
            {(categories ?? []).map((cat) => {
              const days = Number(cat.avg_resolution_days ?? 0);
              const width = (days / responseMax) * 100;
              return (
                <div key={`resp-${cat.category ?? Math.random()}`}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize">{(cat.category ?? "other").replace(/_/g, " ")}</span>
                    <span>{days.toFixed(1)} days</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div className="h-full rounded bg-blue-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-red-600">Threshold: 14 days</p>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Subscription Distribution</h2>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="h-32 w-32 rounded-full" style={donutStyle} />
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold text-slate-600">Free:</span> {freeUsers} ({percentage(freeUsers, totalUsers).toFixed(1)}%)</p>
            <p><span className="font-semibold text-sky-600">Basic:</span> {basicUsers} ({percentage(basicUsers, totalUsers).toFixed(1)}%)</p>
            <p><span className="font-semibold text-teal-600">Pro:</span> {proUsers} ({percentage(proUsers, totalUsers).toFixed(1)}%)</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent Signups (Last 7 Days)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Cases Created</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((row) => (
                <tr className="border-t" key={row.id}>
                  <td className="px-3 py-2">{row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="px-3 py-2 capitalize">{row.subscription_tier}</td>
                  <td className="px-3 py-2">{row.cases_created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Business Enquiries</h2>
        <div className="space-y-2">
          {enquiries.map((row) => (
            <details className="rounded border p-3" key={row.id}>
              <summary className="cursor-pointer text-sm font-medium">
                {row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"} · {row.company_name} · {row.contact_name} ({row.email})
              </summary>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <p><strong>Role:</strong> {row.role ?? "—"}</p>
                <p><strong>Message:</strong> {row.message ?? "—"}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
