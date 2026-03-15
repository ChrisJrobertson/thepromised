import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { InteractionForm } from "@/components/cases/InteractionForm";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Log Interaction — TheyPromised" };

export default async function NewInteractionPage({
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

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, title, organisation_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseData) notFound();

  const orgName = caseData.title;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link
            className={buttonVariants({ size: "sm", variant: "ghost" })}
            href={`/cases/${id}`}
          >
            ← Back to case
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Log Interaction</h1>
          <p className="text-sm text-muted-foreground">{orgName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Interaction</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractionForm
            preselectedCaseId={id}
            redirectOnSuccess
          />
        </CardContent>
      </Card>
    </div>
  );
}
