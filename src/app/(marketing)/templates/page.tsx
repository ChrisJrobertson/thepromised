import { complaintTemplates } from "@/lib/data/complaint-templates";
import { TemplatesGrid } from "@/components/marketing/TemplatesGrid";

export const metadata = {
  title: "What's Your Complaint About? — Start in 2 Minutes | TheyPromised",
  description:
    "Ready-made UK complaint templates with the right legislation, escalation path, and a professionally drafted letter. Pick your issue and we'll guide you through the rest.",
};

export default function TemplatesPage() {
  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            What&apos;s Your Complaint About?
            <span className="ml-2 text-lg font-normal text-slate-400 md:text-xl">
              — Start in 2 Minutes
            </span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Each template pre-fills your case with the right escalation path, relevant regulations,
            and a professionally drafted complaint letter. Pick your issue and we&apos;ll guide you
            through the rest.
          </p>
        </header>

        <TemplatesGrid templates={complaintTemplates} />
      </div>
    </main>
  );
}
