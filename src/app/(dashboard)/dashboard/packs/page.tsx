import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { COMPLAINT_PACKS_BY_ID } from "@/lib/packs/config";
import type { ComplaintPack } from "@/types/database";

export const metadata = {
  title: "My Packs — TheyPromised",
};

type CaseRef = {
  id: string;
  title: string;
};

export default async function MyPacksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("complaint_packs")
    .select("*")
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });

  const packs = (data ?? []) as ComplaintPack[];
  const caseIds = [
    ...new Set(
      packs.map((pack) => pack.case_id).filter((caseId): caseId is string => Boolean(caseId)),
    ),
  ];

  const { data: casesRaw } = caseIds.length
    ? await supabase.from("cases").select("id, title").in("id", caseIds)
    : { data: [] as CaseRef[] };

  const caseMap = new Map(
    ((casesRaw ?? []) as CaseRef[]).map((caseRow) => [caseRow.id, caseRow.title]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Packs</h1>
          <p className="text-sm text-slate-600">
            Your purchased complaint packs and linked cases.
          </p>
        </div>
        <Link
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50"
          href="/packs"
        >
          Buy another pack
        </Link>
      </div>

      {packs.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-600">
          You have not purchased any packs yet.{" "}
          <Link className="font-medium text-primary underline" href="/packs">
            View complaint packs
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-3">
          {packs.map((pack) => {
            const definition = COMPLAINT_PACKS_BY_ID.get(pack.pack_type);
            return (
              <article
                className="rounded-lg border bg-white p-4 shadow-sm"
                key={pack.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      {definition?.name ?? pack.pack_type}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      Purchased:{" "}
                      {pack.purchased_at
                        ? new Date(pack.purchased_at).toLocaleDateString("en-GB")
                        : "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Status:{" "}
                      <span className="rounded bg-slate-100 px-2 py-0.5 capitalize">
                        {pack.status.replace(/_/g, " ")}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Linked case:{" "}
                      {pack.case_id
                        ? (caseMap.get(pack.case_id) ?? pack.case_id)
                        : "Not linked"}
                    </p>
                  </div>

                  {pack.case_id ? (
                    <Link
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      href={`/cases/${pack.case_id}`}
                    >
                      View Case
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
