import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { complaintTemplates, getComplaintTemplateBySlug } from "@/lib/data/complaint-templates";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return complaintTemplates.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const template = getComplaintTemplateBySlug(slug);
  if (!template) return {};
  return {
    title: `${template.title} — Free Complaint Template | TheyPromised`,
    description: `Start your ${template.title} complaint in 2 minutes. Includes relevant UK legislation, tips, and a guided escalation path.`,
  };
}

export default async function TemplateDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const template = getComplaintTemplateBySlug(slug);
  if (!template) notFound();

  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-4xl space-y-8 px-4">
        <header className="space-y-2">
          <p className="text-sm text-slate-500 capitalize">{template.category.replace(/_/g, " ")}</p>
          <h1 className="text-3xl font-bold">{template.title}</h1>
          <p className="text-slate-700">{template.description}</p>
        </header>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold">Suggested Complaint Framing</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Title:</strong> {template.suggestedTitle}</p>
            <p><strong>Description:</strong> {template.suggestedDescription}</p>
            <p><strong>Desired outcome:</strong> {template.suggestedDesiredOutcome}</p>
            <p><strong>Priority:</strong> {template.suggestedPriority}</p>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold">Relevant UK legislation</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {template.relevantLegislation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold">Tips</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {template.tips.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {template.commonWith.length > 0 ? (
          <section className="rounded-lg border bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold">Common with these organisations</h2>
            <p className="text-sm text-slate-700">{template.commonWith.join(", ")}</p>
          </section>
        ) : null}

        <section className="rounded-lg border bg-slate-50 p-5">
          <h2 className="mb-2 text-lg font-semibold">Step-by-step</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Create your case with this template pre-filled.</li>
            <li>Log every interaction and promise from the organisation.</li>
            <li>Send a formal complaint letter and track deadlines.</li>
            <li>Escalate to the relevant ombudsman if unresolved.</li>
          </ol>
          <Link className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white" href={`/cases/new?template=${template.id}`}>
            Start This Complaint
          </Link>
        </section>
      </div>
    </main>
  );
}
