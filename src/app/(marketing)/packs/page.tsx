import { createClient } from "@/lib/supabase/server";
import { COMPLAINT_PACKS } from "@/lib/packs/config";
import { PacksCheckoutClient } from "@/components/marketing/PacksCheckoutClient";

export const metadata = {
  title: "Complaint Packs — Professional Case Building | TheyPromised",
  description:
    "One-off complaint support packs from £29. Get AI letters, escalation guidance, and ombudsman-ready exports without a subscription.",
};

type CaseOption = {
  id: string;
  title: string;
};

export default async function PacksPage({
  searchParams,
}: {
  searchParams: Promise<{ recommended?: string; caseId?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cases: CaseOption[] = [];
  if (user) {
    const { data } = await supabase
      .from("cases")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    cases = (data ?? []) as CaseOption[];
  }

  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Complaint Packs — Expert Case Building Without the Expert Price
          </h1>
          <p className="text-slate-600">
            One-off payment. No subscription required. Get the ammunition you
            need.
          </p>
        </header>

        <PacksCheckoutClient
          cases={cases}
          isLoggedIn={Boolean(user)}
          packs={COMPLAINT_PACKS}
          preselectedCaseId={sp.caseId ?? ""}
          recommendedPackId={sp.recommended ?? ""}
        />

        <section className="rounded-lg border bg-slate-50 p-6 text-center">
          <p className="font-medium">
            Already tracking a complaint? These packs work with your existing
            case data.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Not sure which pack you need? Start Free and upgrade when you&apos;re
            ready.
          </p>
          <a
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            href="/register"
          >
            Start Free →
          </a>
        </section>
      </div>
    </main>
  );
}
