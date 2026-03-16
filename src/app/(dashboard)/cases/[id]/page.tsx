import { differenceInDays } from "date-fns";
import {
  AlertCircle,
  Clock,
  Download,
  Edit,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AISuggestion } from "@/components/cases/AISuggestion";
import { UpgradeSuccessToast } from "@/components/ui/UpgradeSuccessToast";
import { CaseTimeline } from "@/components/cases/CaseTimeline";
import { EscalationGuide } from "@/components/cases/EscalationGuide";
import { EvidenceGallery } from "@/components/cases/EvidenceGallery";
import { ForwardReplyPanel } from "@/components/cases/ForwardReplyPanel";
import { ResponseTimer } from "@/components/cases/ResponseTimer";
import { ShareCaseButton } from "@/components/cases/ShareCaseButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatUkDate } from "@/lib/date";
import { AI_LIMITS } from "@/lib/ai/constants";
import { COMPLAINT_PACKS_BY_ID } from "@/lib/packs/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type {
  Case,
  EscalationRule,
  Evidence,
  Interaction,
  Letter,
  Organisation,
  Reminder,
} from "@/types/database";

import { CaseActions } from "./CaseActions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.title ? `${data.title} — TheyPromised` : "Case — TheyPromised" };
}

const STATUS_COLOURS: Record<string, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  escalated: "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-green-200 bg-green-50 text-green-700",
  closed: "border-slate-200 bg-slate-100 text-slate-600",
};

const PRIORITY_COLOURS: Record<string, string> = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-100 text-slate-600",
};

const ESCALATION_STAGES = [
  { key: "initial", label: "Initial" },
  { key: "formal_complaint", label: "Formal Complaint" },
  { key: "final_response", label: "Final Response" },
  { key: "ombudsman", label: "Ombudsman" },
  { key: "court", label: "Court" },
] as const;

export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; tab?: string; upgraded?: string; pack_activated?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile for AI tier and credit counts
  const { data: profileData } = await supabase
    .from("profiles")
    .select("subscription_tier, ai_suggestions_used, ai_letters_used")
    .eq("id", user.id)
    .maybeSingle();
  const profileRow = profileData as Pick<Profile, "subscription_tier" | "ai_suggestions_used" | "ai_letters_used"> | null;
  const tier = profileRow?.subscription_tier ?? "free";
  const aiSuggestionsUsed = profileRow?.ai_suggestions_used ?? 0;
  const suggestionsLimit = AI_LIMITS[tier as keyof typeof AI_LIMITS]?.suggestions ?? 0;

  // Fetch case + organisation in one query
  const { data: caseData } = await supabase
    .from("cases")
    .select("*, organisations(*), share_token, is_shared")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseData) notFound();

  const theCase = caseData as Case & { organisations: Organisation | null };

  // Fetch everything else in parallel
  const [
    { data: interactions },
    { data: evidence },
    { data: letters },
    { data: reminders },
    { data: escalationRules },
  ] = await Promise.all([
    supabase
      .from("interactions")
      .select("*, evidence(*)")
      .eq("case_id", id)
      .eq("user_id", user.id)
      .order("interaction_date", { ascending: false }),
    supabase
      .from("evidence")
      .select("*")
      .eq("case_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("letters")
      .select("*")
      .eq("case_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reminders")
      .select("*")
      .eq("case_id", id)
      .eq("user_id", user.id)
      .eq("is_dismissed", false)
      .gte("due_date", new Date().toISOString())
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("escalation_rules")
      .select("*")
      .eq("category", theCase.category)
      .order("stage_order", { ascending: true }),
  ]);

  const orgName =
    theCase.organisations?.name ??
    theCase.custom_organisation_name ??
    "Unknown Organisation";
  const scorecardSlug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const currentStageIndex = ESCALATION_STAGES.findIndex(
    (s) => s.key === theCase.escalation_stage
  );

  const daysOpen = theCase.first_contact_date
    ? differenceInDays(new Date(), new Date(theCase.first_contact_date))
    : null;

  type InteractionRow = Interaction & { evidence: Evidence[] };
  const typedInteractions = (interactions ?? []) as InteractionRow[];
  const pendingPromises = typedInteractions.filter(
    (i) => i.promises_made && i.promise_fulfilled === null
  );
  const overdueResponse = theCase.response_deadline
    ? !theCase.response_received &&
      new Date(theCase.response_deadline).getTime() < Date.now()
    : false;

  const recommendedPackId = (() => {
    if (theCase.escalation_stage === "ombudsman" || typedInteractions.length >= 6) {
      return "full-case-pack";
    }
    if (
      overdueResponse ||
      (daysOpen !== null && daysOpen >= 35) ||
      theCase.escalation_stage === "final_response"
    ) {
      return "escalation-pack";
    }
    return "starter-pack";
  })();
  const recommendedPack = COMPLAINT_PACKS_BY_ID.get(recommendedPackId);

  const activeTab = sp.tab ?? "timeline";

  return (
    <div className="space-y-6 pb-16">
      {/* Upgrade / pack activation confirmation toasts */}
      {sp.upgraded === "true" && <UpgradeSuccessToast type="subscription" />}
      {sp.pack_activated === "true" && <UpgradeSuccessToast type="pack" />}

      {/* Top section */}
      <div className="space-y-4">
        {sp.created && (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Case created successfully. Start logging your interactions below.</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{orgName}</h1>
              <Badge className="border-muted" variant="outline">
                {theCase.category.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">{theCase.title}</p>
            <Link className="text-xs text-primary underline" href={`/companies/${scorecardSlug}`}>
              📊 How does {orgName} compare? View their complaint scorecard →
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ShareCaseButton
              caseId={id}
              initialIsShared={(theCase as { is_shared?: boolean }).is_shared ?? false}
              initialShareToken={(theCase as { share_token?: string | null }).share_token ?? null}
            />
            <CaseActions
              caseId={id}
              currentPriority={theCase.priority}
              currentStage={theCase.escalation_stage}
              currentStatus={theCase.status}
            />
          </div>
        </div>

        {/* Status + priority badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={STATUS_COLOURS[theCase.status] ?? ""}
            variant="outline"
          >
            {theCase.status.charAt(0).toUpperCase() + theCase.status.slice(1)}
          </Badge>
          <Badge
            className={PRIORITY_COLOURS[theCase.priority] ?? ""}
            variant="outline"
          >
            {theCase.priority.charAt(0).toUpperCase() + theCase.priority.slice(1)} priority
          </Badge>
        </div>

        {/* Escalation stage stepper */}
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-0">
            {ESCALATION_STAGES.map((stage, i) => {
              const isCurrent = stage.key === theCase.escalation_stage;
              const isPast = i < currentStageIndex;
              return (
                <div className="flex items-center" key={stage.key}>
                  <div
                    className={`flex flex-col items-center gap-1 px-3 py-2 text-center ${
                      isCurrent
                        ? "text-secondary"
                        : isPast
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full border-2 ${
                        isCurrent
                          ? "border-secondary bg-secondary"
                          : isPast
                            ? "border-secondary bg-secondary/30"
                            : "border-muted-foreground/30 bg-transparent"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${isCurrent ? "text-secondary" : ""}`}
                    >
                      {stage.label}
                      {isCurrent && (
                        <span className="block text-[10px] font-normal">
                          You are here
                        </span>
                      )}
                    </span>
                  </div>
                  {i < ESCALATION_STAGES.length - 1 && (
                    <div
                      className={`h-0.5 w-8 ${i < currentStageIndex ? "bg-secondary/40" : "bg-muted"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{theCase.interaction_count}</p>
            <p className="text-xs text-muted-foreground">Interactions</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{daysOpen ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Days open</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">
              {theCase.amount_in_dispute
                ? `£${theCase.amount_in_dispute.toFixed(0)}`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">In dispute</p>
          </div>
        </div>

        {tier === "free" ? (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
            <p>
              Need help with this case? Our Complaint Packs include AI letters,
              case review, and ombudsman-ready exports.
            </p>
            {recommendedPack ? (
              <p className="mt-1 text-xs text-teal-800">
                Recommended for this case: <strong>{recommendedPack.name}</strong>{" "}
                ({recommendedPack.priceDisplay}) — {recommendedPack.bestFor}
              </p>
            ) : null}
            <Link
              className="mt-2 inline-flex font-medium text-teal-800 underline underline-offset-2"
              href={`/packs?recommended=${recommendedPackId}&caseId=${id}`}
            >
              View Packs →
            </Link>
          </div>
        ) : null}

        {theCase.response_deadline ? (
          <ResponseTimer
            caseId={id}
            companyName={orgName}
            escalationGuideHref={`/escalation-guides/${theCase.category}`}
            responseDeadline={theCase.response_deadline}
            responseReceived={Boolean(theCase.response_received)}
            responseReceivedAt={theCase.response_received_at}
          />
        ) : null}

        {theCase.response_deadline ? (
          <ForwardReplyPanel
            caseId={id}
            companyName={orgName}
            initialAlias={theCase.inbound_email_alias}
            userId={user.id}
          />
        ) : null}
      </div>

      {/* Main content + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Tabs */}
        <Tabs defaultValue={activeTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="timeline">
              <Clock className="mr-1.5 h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="interactions">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Interactions
            </TabsTrigger>
            <TabsTrigger value="evidence">
              <FileText className="mr-1.5 h-4 w-4" />
              Evidence
            </TabsTrigger>
            <TabsTrigger value="letters">
              <Edit className="mr-1.5 h-4 w-4" />
              Letters
            </TabsTrigger>
            <TabsTrigger value="escalation">
              <AlertCircle className="mr-1.5 h-4 w-4" />
              Escalation
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="timeline">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {interactions?.length ?? 0} interactions logged
              </p>
              <Link className={buttonVariants({ size: "sm" })} href={`/cases/${id}/interactions/new`}>
                + Log Interaction
              </Link>
            </div>
            <CaseTimeline
              caseId={id}
              interactions={typedInteractions}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="interactions">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                All interactions
              </p>
              <Link className={buttonVariants({ size: "sm" })} href={`/cases/${id}/interactions/new`}>
                + Log Interaction
              </Link>
            </div>
            <InteractionTable interactions={typedInteractions} />
          </TabsContent>

          <TabsContent className="mt-4" value="evidence">
            <EvidenceGallery
              caseId={id}
              evidence={(evidence ?? []) as Evidence[]}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="letters">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {letters?.length ?? 0} letter{letters?.length !== 1 ? "s" : ""}
              </p>
              <Link className={buttonVariants({ size: "sm" })} href={`/cases/${id}/letters/new`}>
                + Generate Letter
              </Link>
            </div>
            <LettersList caseId={id} letters={(letters ?? []) as Letter[]} />
          </TabsContent>

          <TabsContent className="mt-4" value="escalation">
            <EscalationGuide
              caseId={id}
              category={theCase.category}
              currentStage={theCase.escalation_stage}
              firstContactDate={theCase.first_contact_date}
              rules={(escalationRules ?? []) as EscalationRule[]}
            />
          </TabsContent>
        </Tabs>

        {/* Right sidebar */}
        <aside className="hidden space-y-4 lg:block">
          {/* Case details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {theCase.reference_number && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs">{theCase.reference_number}</span>
                </div>
              )}
              {theCase.first_contact_date && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">First contact</span>
                  <span>{formatUkDate(theCase.first_contact_date)}</span>
                </div>
              )}
              {theCase.amount_in_dispute && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">In dispute</span>
                  <span className="font-medium">£{theCase.amount_in_dispute.toFixed(2)}</span>
                </div>
              )}
              {theCase.desired_outcome && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">Desired outcome</span>
                  <p className="text-xs">{theCase.desired_outcome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming reminders */}
          {reminders && reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Upcoming Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(reminders as Reminder[]).map((r) => (
                  <div
                    className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs"
                    key={r.id}
                  >
                    <p className="font-medium text-amber-800">{r.title}</p>
                    <p className="text-amber-700">{formatUkDate(r.due_date)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Promises tracker */}
          {pendingPromises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Promises Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingPromises.map((interaction) => (
                  <div
                    className="rounded-md border p-2 text-xs"
                    key={interaction.id}
                  >
                    <p className="font-medium">{interaction.promises_made}</p>
                    {interaction.promise_deadline && (
                      <p className="text-muted-foreground">
                        By {formatUkDate(interaction.promise_deadline)}
                      </p>
                    )}
                    <Badge
                      className="mt-1 border-amber-200 bg-amber-50 text-amber-700"
                      variant="outline"
                    >
                      Pending
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Suggestion (lazy-loaded client component) */}
          <AISuggestion
            caseId={id}
            tier={tier}
            initialSuggestionsUsed={aiSuggestionsUsed}
            suggestionsLimit={suggestionsLimit}
          />

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                className={buttonVariants({ size: "sm", variant: "outline" }) + " w-full justify-start"}
                href={`/cases/${id}/letters/new`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Letter
              </Link>
              <Link
                className={buttonVariants({ size: "sm", variant: "outline" }) + " w-full justify-start"}
                href={`/cases/${id}/export`}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Case
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// --- Inline sub-components ---

function InteractionTable({ interactions }: { interactions: Interaction[] }) {
  const CHANNEL_ICONS: Record<string, string> = {
    phone: "📞",
    email: "✉️",
    letter: "📄",
    webchat: "💬",
    in_person: "🤝",
    social_media: "📱",
    app: "📲",
    other: "📋",
  };

  if (interactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No interactions logged yet.{" "}
        <Link className="underline" href="?tab=timeline">
          Log your first interaction.
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {interactions.map((i) => (
        <Card key={i.id}>
          <CardContent className="p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{CHANNEL_ICONS[i.channel] ?? "📋"}</span>
                <div>
                  <p className="font-medium">
                    {i.direction === "outbound" ? "You → them" : "Them → you"}
                    {i.contact_name ? ` · ${i.contact_name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatUkDate(i.interaction_date)}
                    {i.duration_minutes ? ` · ${i.duration_minutes} min` : ""}
                  </p>
                </div>
              </div>
              {i.outcome && (
                <Badge variant="outline">{i.outcome.replace(/_/g, " ")}</Badge>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{i.summary}</p>
            {i.promises_made && (
              <p className="mt-1 rounded-sm border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                Promise: {i.promises_made}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LettersList({ caseId, letters }: { caseId: string; letters: Letter[] }) {
  const STATUS_COLOURS: Record<string, string> = {
    draft: "border-muted bg-muted/50 text-muted-foreground",
    sent: "border-blue-200 bg-blue-50 text-blue-700",
    delivered: "border-green-200 bg-green-50 text-green-700",
    opened: "border-teal-200 bg-teal-50 text-teal-700",
    bounced: "border-red-200 bg-red-50 text-red-700",
    failed: "border-red-200 bg-red-50 text-red-700",
    acknowledged: "border-green-200 bg-green-50 text-green-700",
  };

  if (letters.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        <p>No letters yet.</p>
        <Link
          className="mt-2 inline-block underline"
          href={`/cases/${caseId}/letters/new`}
        >
          Generate your first letter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {letters.map((letter) => (
        <Card key={letter.id}>
          <CardContent className="p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{letter.subject}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {letter.letter_type.replace(/_/g, " ")}
                  {letter.ai_generated ? " · AI generated" : ""}
                </p>
              </div>
              <Badge
                className={STATUS_COLOURS[letter.delivery_status ?? letter.status] ?? ""}
                variant="outline"
              >
                {(letter.delivery_status ?? letter.status).replace(/_/g, " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
