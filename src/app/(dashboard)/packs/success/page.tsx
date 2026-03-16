import Link from "next/link";

import { COMPLAINT_PACKS_BY_ID } from "@/lib/packs/config";
import { getStripeClient } from "@/lib/stripe/client";

export const metadata = {
  title: "Pack purchased — TheyPromised",
};

export default async function PackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;

  let packName = "Complaint Pack";
  let caseId: string | null = null;

  if (sp.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sp.session_id);
      const packId = session.metadata?.packId;
      const caseFromMeta = session.metadata?.caseId;

      const pack = packId ? COMPLAINT_PACKS_BY_ID.get(packId) : undefined;
      if (pack) packName = pack.name;
      if (caseFromMeta) caseId = caseFromMeta;
    } catch {
      // Non-blocking: render generic success state.
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-3xl">✅</p>
        <h1 className="mt-2 text-3xl font-bold">Pack Purchased!</h1>
        <p className="mt-2 text-slate-700">
          Your <strong>{packName}</strong> is ready. Here&apos;s what happens next:
        </p>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Your case has been upgraded with Pro features for 7 days</li>
          <li>Use AI to generate your complaint letters</li>
          <li>Export your professional case file as PDF</li>
          <li>Send your complaint directly via email</li>
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            href={caseId ? `/cases/${caseId}` : "/cases"}
          >
            Go to My Case →
          </Link>
          <Link
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            href="/dashboard/packs"
          >
            View All My Packs →
          </Link>
        </div>
      </section>
    </div>
  );
}
