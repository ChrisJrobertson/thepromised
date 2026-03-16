import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LetterActions } from "@/app/(dashboard)/cases/[id]/letters/[letterId]/LetterActions";
import { SendLetterButton } from "@/components/letters/SendLetterButton";
import { createClient } from "@/lib/supabase/server";
import type { Letter } from "@/types/database";

export const metadata = { title: "Letter Detail" };

type CaseHeading = { id: string; title: string; organisation_id: string | null };
type LetterDetail = Pick<
  Letter,
  "id" | "subject" | "body" | "sent_to_email" | "sent_at" | "opened_at" | "delivered_at" | "delivery_status"
>;

export default async function LetterDetailPage({
  params,
}: {
  params: Promise<{ id: string; letterId: string }>;
}) {
  const { id, letterId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: caseRaw }, { data: letterRaw }] = await Promise.all([
    supabase
      .from("cases")
      .select("id, title, organisation_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("letters")
      .select("id, subject, body, sent_to_email, sent_at, opened_at, delivered_at, delivery_status")
      .eq("id", letterId)
      .eq("case_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const caseRow = caseRaw as CaseHeading | null;
  const letter = letterRaw as LetterDetail | null;

  if (!caseRow || !letter) notFound();

  const { data: organisation } = caseRow.organisation_id
    ? await supabase
        .from("organisations")
        .select("name, complaint_email")
        .eq("id", caseRow.organisation_id)
        .maybeSingle()
    : { data: null };

  const recipientEmail = letter.sent_to_email ?? organisation?.complaint_email ?? null;

  return (
    <div className="space-y-4 pb-16">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href={`/cases/${id}/letters`}>
          ← Back to letters
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{letter.subject}</h1>
        <p className="text-sm text-muted-foreground">{caseRow.title}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LetterActions body={letter.body} letterId={letterId} subject={letter.subject} />
        <SendLetterButton
          deliveredAt={letter.delivered_at}
          deliveryStatus={letter.delivery_status}
          letterId={letter.id}
          openedAt={letter.opened_at}
          recipientEmail={recipientEmail}
          sentAt={letter.sent_at}
          sentToEmail={letter.sent_to_email}
          userEmail={user.email ?? "your email"}
        />
      </div>

      <div className="rounded-md border bg-blue-50 p-3 text-sm text-blue-800">
        This letter will be sent to: <strong>{recipientEmail ?? "No complaint email set"}</strong>
      </div>

      <article className="rounded-lg border bg-white p-4">
        <pre className="whitespace-pre-wrap font-sans text-sm">{letter.body}</pre>
      </article>
    </div>
  );
}
