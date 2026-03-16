import { BusinessEnquiryForm } from "@/components/marketing/BusinessEnquiryForm";

export const metadata = {
  title: "Data for Business",
  description: "See what your customers are really saying with complaint intelligence from TheyPromised.",
};

export default function BusinessPage() {
  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">See What Your Customers Are Really Saying</h1>
          <p className="text-slate-700">
            TheyPromised tracks real consumer complaints in real time.
            We know how your customers feel about your service — do you?
          </p>

          <div>
            <h2 className="mb-2 text-lg font-semibold">What we measure:</h2>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Promise keeping rate — do you deliver what you promise?</li>
              <li>• Response speed — how quickly do you respond to formal complaints?</li>
              <li>• Helpfulness scores — are your agents actually helping?</li>
              <li>• Escalation rates — how many complaints end up at the ombudsman?</li>
              <li>• Channel preferences — how do your customers prefer to contact you?</li>
            </ul>
          </div>

          <blockquote className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4 text-sm text-red-900">
            &ldquo;British Gas breaks 68% of the promises they make to complainants.&rdquo;
            <br />
            <span className="text-xs">That&apos;s real data from real consumers. What does yours say?</span>
          </blockquote>
        </section>

        <BusinessEnquiryForm />
      </div>
    </main>
  );
}
