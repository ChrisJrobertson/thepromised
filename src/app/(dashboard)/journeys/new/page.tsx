import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { JOURNEY_TEMPLATES, JOURNEY_SECTORS } from "@/lib/journeys/templates";
import { StartJourneyClient } from "./StartJourneyClient";
import type { Case } from "@/types/database";

export const metadata: Metadata = {
  title: "Start a Guided Journey — TheyPromised",
};

export default async function NewJourneyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cases } = await supabase
    .from("cases")
    .select("id, title, organisation_id")
    .eq("user_id", user.id)
    .neq("status", "closed")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <StartJourneyClient
      cases={(cases as Case[] | null) ?? []}
      sectors={JOURNEY_SECTORS}
      templates={JOURNEY_TEMPLATES.filter((t) => t.is_active)}
    />
  );
}
