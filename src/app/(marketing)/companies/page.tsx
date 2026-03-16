import { CompanyScorecardIndex } from "@/components/marketing/CompanyScorecardIndex";
import { getPublicScorecardIndex } from "@/lib/analytics/scorecards";

export const metadata = {
  title: "UK Company Complaint Scorecards",
  description: "See how companies handle complaints, based on real consumer data.",
};

export default async function CompanyScorecardsPage() {
  const scorecards = await getPublicScorecardIndex(5);

  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">UK Company Complaint Scorecards</h1>
          <p className="text-slate-600">See how companies handle complaints, based on real consumer data.</p>
        </header>

        <CompanyScorecardIndex scorecards={scorecards} />

        <section className="rounded-lg border bg-slate-50 p-6 text-center">
          <p className="font-medium">Not seeing your company?</p>
          <p className="mt-1 text-sm text-slate-600">
            Start tracking your complaint and help build the data.
          </p>
          <a className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm text-white" href="/register">
            Start Free
          </a>
        </section>
      </div>
    </main>
  );
}
