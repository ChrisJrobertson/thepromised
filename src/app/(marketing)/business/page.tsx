import { BusinessEnquiryForm } from "@/components/marketing/BusinessEnquiryForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TheyPromised for Business",
  description:
    "Monitor your company's complaint performance, benchmark against competitors, and reduce escalations. Request a pilot today.",
  openGraph: {
    title: "TheyPromised for Business",
    description:
      "Monitor complaint performance, benchmark against competitors, and reduce escalations.",
    url: "https://www.theypromised.app/business",
    siteName: "TheyPromised",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TheyPromised for Business",
    description:
      "Monitor complaint performance, benchmark against competitors, and reduce escalations.",
  },
};

export default function BusinessPage() {
  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <section className="space-y-4 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            See What Your Customers Are Really Saying
          </h1>
          <p className="mx-auto max-w-4xl text-slate-700">
            TheyPromised tracks real UK consumer complaints in real time.
            Promise-keeping rates. Response times. Helpfulness scores.
            Escalation patterns. We know how your customers feel about your
            complaint handling. Do you?
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Insight</h2>
            <p className="mt-1 text-2xl font-bold">£500/month</p>
            <p className="mt-3 text-sm text-slate-700">
              Your company scorecard with monthly report and benchmark data.
            </p>
            <p className="mt-4 text-sm font-semibold">Includes:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Monthly PDF report</li>
              <li>Complaint volume trends</li>
              <li>Promise-keeping rate</li>
              <li>Response time analysis</li>
              <li>Helpfulness score trend</li>
              <li>Escalation rate tracking</li>
            </ul>
            <a className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white" href="#b2b-enquiry">
              Start Pilot
            </a>
          </article>

          <article className="rounded-xl border-2 border-primary bg-white p-6 shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Professional</h2>
            <p className="mt-1 text-2xl font-bold">£1,000/month</p>
            <p className="mt-3 text-sm text-slate-700">
              Everything in Insight, plus competitor benchmarking across your
              sector.
            </p>
            <p className="mt-4 text-sm font-semibold">Includes:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Weekly data exports</li>
              <li>Sector comparison</li>
              <li>Channel analysis</li>
              <li>Quarterly review call</li>
              <li>Custom dashboards</li>
            </ul>
            <a className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white" href="#b2b-enquiry">
              Start Pilot
            </a>
          </article>

          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Enterprise</h2>
            <p className="mt-1 text-2xl font-bold">Custom</p>
            <p className="mt-3 text-sm text-slate-700">
              Everything in Professional, plus deeper integration and strategic
              support.
            </p>
            <p className="mt-4 text-sm font-semibold">Includes:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>API access</li>
              <li>Custom reporting</li>
              <li>Dedicated account manager</li>
              <li>White-label options</li>
            </ul>
            <a className="mt-5 inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50" href="#b2b-enquiry">
              Contact Us
            </a>
          </article>
        </section>

        <section className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4 text-sm text-red-900">
          <p>
            &ldquo;British Gas breaks 68% of the promises they make to
            complainants.&rdquo; That&apos;s real data from real consumers. What
            does yours say?
          </p>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 space-y-2 text-sm text-slate-700">
            <li>
              1. We share your current complaint scorecard (you might be
              surprised)
            </li>
            <li>
              2. You get monthly reports showing trends, benchmarks, and problem
              areas
            </li>
            <li>
              3. You use the data to improve complaint handling and reduce
              ombudsman escalations
            </li>
            <li>4. Your scorecard improves. Your customers notice.</li>
          </ol>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-medium">Where does the data come from?</p>
              <p>Real UK consumers tracking complaints through TheyPromised.</p>
            </div>
            <div>
              <p className="font-medium">Is the data anonymised?</p>
              <p>
                Yes, we never share individual complainant details with
                companies.
              </p>
            </div>
            <div>
              <p className="font-medium">
                How many complaints do you need for meaningful data?
              </p>
              <p>
                We provide reports once we have 5+ complaints for your company.
              </p>
            </div>
            <div>
              <p className="font-medium">
                Can I respond to complaints through TheyPromised?
              </p>
              <p>
                Not yet, but we&apos;re building that. For now, the data helps
                you improve your process.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-2xl" id="b2b-enquiry">
          <BusinessEnquiryForm />
        </section>
      </div>
    </main>
  );
}
