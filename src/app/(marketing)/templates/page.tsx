import Link from "next/link";

import { complaintTemplates } from "@/lib/data/complaint-templates";

export const metadata = {
  title: "Common Complaint Templates — Start in 2 Minutes",
  description: "Ready-made complaint templates with UK legislation and practical escalation tips.",
};

export default function TemplatesPage() {
  const grouped = complaintTemplates.reduce<Record<string, typeof complaintTemplates>>((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {});

  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <header>
          <h1 className="text-3xl font-bold">Common Complaint Templates — Start in 2 Minutes</h1>
          <p className="mt-2 text-slate-600">Use a proven complaint structure and customise it in your own words.</p>
        </header>

        {Object.entries(grouped).map(([category, templates]) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-semibold capitalize">{category.replace(/_/g, " ")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div className="rounded-lg border bg-white p-4 shadow-sm" key={template.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{template.title}</h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs capitalize">{template.category.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-sm text-slate-600">{template.description}</p>
                  {template.commonWith.length > 0 ? (
                    <p className="mt-2 text-xs text-slate-500">Common with: {template.commonWith.join(", ")}</p>
                  ) : null}
                  <div className="mt-4 flex gap-2">
                    <Link className="text-sm text-primary underline" href={`/templates/${template.slug}`}>View template</Link>
                    <Link className="text-sm text-slate-700 underline" href={`/cases/new?template=${template.id}`}>Start this complaint</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
