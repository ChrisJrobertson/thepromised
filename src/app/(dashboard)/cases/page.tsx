import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cases } = await supabase
    .from("cases")
    .select("id, title, status, priority, escalation_stage, interaction_count, updated_at")
    .eq("user_id", user?.id ?? "")
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Cases</h2>
        <Link className="rounded-md bg-primary px-4 py-2 text-sm text-white" href="/cases/new">
          New Case
        </Link>
      </div>
      {cases?.length ? (
        <div className="grid gap-3">
          {cases.map((c) => (
            <Link href={`/cases/${c.id}`} key={c.id}>
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {c.title}
                    <Badge variant="secondary">{c.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>Priority: {c.priority}</span>
                  <span>Stage: {c.escalation_stage}</span>
                  <span>Interactions: {c.interaction_count}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No cases yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Start your first case and begin recording every interaction.
            </p>
            <Link className="rounded-md bg-primary px-4 py-2 text-sm text-white" href="/cases/new">
              Start your first case
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
