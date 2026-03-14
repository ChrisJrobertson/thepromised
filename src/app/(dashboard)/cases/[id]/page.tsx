import Link from "next/link";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <PagePlaceholder
        description="This case hub will include timeline, interactions, evidence, letters, escalation guidance, and notes."
        title={`Case ${id}`}
      />
      <div className="flex flex-wrap gap-2 text-sm">
        <Link className="rounded-md border px-3 py-2" href={`/cases/${id}/timeline`}>
          Timeline
        </Link>
        <Link className="rounded-md border px-3 py-2" href={`/cases/${id}/letters`}>
          Letters
        </Link>
        <Link className="rounded-md border px-3 py-2" href={`/cases/${id}/export`}>
          Export
        </Link>
      </div>
    </div>
  );
}
