export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getJourneyTemplate } from "@/lib/journeys/templates";
import { JourneyWizard } from "./JourneyWizard";
import type { UserJourney } from "@/lib/actions/journeys";

export const metadata: Metadata = {
  title: "Journey — TheyPromised",
};

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: journey } = await (supabase as any)
    .from("user_journeys")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!journey) notFound();

  const typedJourney = journey as UserJourney;
  const template = getJourneyTemplate(typedJourney.template_id);

  if (!template) notFound();

  // Fetch user's open cases for linking
  const { data: cases } = await supabase
    .from("cases")
    .select("id, title")
    .eq("user_id", user.id)
    .neq("status", "closed")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <JourneyWizard
      cases={(cases as { id: string; title: string }[] | null) ?? []}
      journey={typedJourney}
      template={template}
    />
  );
}
