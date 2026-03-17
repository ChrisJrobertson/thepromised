import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { Compass, Plus, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getJourneyTemplate } from "@/lib/journeys/templates";
import type { UserJourney } from "@/lib/actions/journeys";

export const metadata: Metadata = {
  title: "Guided Journeys — TheyPromised",
  description: "Step-by-step walkthroughs for UK consumer complaints.",
};

export default async function JourneysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: journeys } = await (supabase as any)
    .from("user_journeys")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const activeJourneys = (journeys as UserJourney[] | null)?.filter((j) => j.status === "active") ?? [];
  const pastJourneys = (journeys as UserJourney[] | null)?.filter((j) => j.status !== "active") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Guided Journeys</h1>
          <p className="text-sm text-muted-foreground">
            Step-by-step walkthroughs that tell you exactly what to do, when, and what to say.
          </p>
        </div>
        <Link href="/journeys/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Start a Journey
          </Button>
        </Link>
      </div>

      {activeJourneys.length === 0 && pastJourneys.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Compass className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Start your first guided journey</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Guided Journeys walk you through complex complaint processes step by step — from your first
              letter to the ombudsman, with legal context and AI drafting at every stage.
            </p>
            <Link href="/journeys/new">
              <Button className="mt-6 gap-2">
                <Plus className="h-4 w-4" />
                Start a Journey
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeJourneys.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-slate-700">Active</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeJourneys.map((journey) => (
                  <JourneyCard journey={journey} key={journey.id} />
                ))}
              </div>
            </section>
          )}
          {pastJourneys.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-slate-700">Past</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pastJourneys.map((journey) => (
                  <JourneyCard journey={journey} key={journey.id} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function JourneyCard({ journey }: { journey: UserJourney }) {
  const template = getJourneyTemplate(journey.template_id);
  const title = template?.title ?? journey.template_id;
  const totalSteps = template?.steps.length ?? 1;
  const progress = Math.round((journey.current_step_index / totalSteps) * 100);

  return (
    <Link href={`/journeys/${journey.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-tight">{title}</CardTitle>
            <StatusBadge status={journey.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>
                Step {journey.current_step_index + 1} of {totalSteps}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Updated{" "}
            {format(new Date(journey.updated_at), "dd MMM yyyy", { locale: enGB })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <Badge className="gap-1 bg-green-100 text-green-700 text-xs" variant="outline">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </Badge>
    );
  }
  if (status === "abandoned") {
    return (
      <Badge className="text-xs text-slate-500" variant="outline">
        Abandoned
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-blue-100 text-blue-700 text-xs" variant="outline">
      <Clock className="h-3 w-3" />
      Active
    </Badge>
  );
}
