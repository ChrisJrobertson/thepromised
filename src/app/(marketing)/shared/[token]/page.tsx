import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { ArrowRight, FileText, Mail, MessageSquare, Phone, Share2, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type Params = Promise<{ token: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { token } = await params;
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from("cases")
    .select("title")
    .eq("share_token", token)
    .eq("is_shared", true)
    .maybeSingle() as { data: { title: string } | null; error: unknown };

  if (!data) return { title: "Shared Case | TheyPromised" };

  return {
    title: `${data.title} | Shared Case | TheyPromised`,
    description: "This case file has been shared via TheyPromised — the UK consumer complaint tracker.",
    robots: { index: false, follow: false },
  };
}

type ChannelConfig = { icon: LucideIcon; bg: string; iconColour: string };

const CHANNEL_CONFIG: Record<string, ChannelConfig> = {
  phone: { icon: Phone, bg: "bg-blue-100", iconColour: "text-blue-600" },
  email: { icon: Mail, bg: "bg-purple-100", iconColour: "text-purple-600" },
  letter: { icon: FileText, bg: "bg-slate-100", iconColour: "text-slate-600" },
  webchat: { icon: MessageSquare, bg: "bg-cyan-100", iconColour: "text-cyan-600" },
  in_person: { icon: Users, bg: "bg-green-100", iconColour: "text-green-600" },
  social_media: { icon: Share2, bg: "bg-pink-100", iconColour: "text-pink-600" },
  app: { icon: MessageSquare, bg: "bg-indigo-100", iconColour: "text-indigo-600" },
  other: { icon: FileText, bg: "bg-slate-100", iconColour: "text-slate-500" },
};

const CHANNEL_LABELS: Record<string, string> = {
  phone: "Phone call",
  email: "Email",
  letter: "Letter",
  webchat: "Webchat",
  in_person: "In person",
  social_media: "Social media",
  app: "App",
  other: "Other",
};

const STATUS_COLOURS: Record<string, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  escalated: "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-green-200 bg-green-50 text-green-700",
  closed: "border-slate-200 bg-slate-100 text-slate-600",
};

export default async function SharedCasePage({ params }: { params: Params }) {
  const { token } = await params;
  const supabase = createServiceRoleClient();

  type SharedCase = {
    id: string;
    title: string;
    status: string;
    escalation_stage: string | null;
    created_at: string | null;
    first_contact_date: string | null;
    category: string | null;
    custom_organisation_name: string | null;
    organisations: { name: string } | null;
  };

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, title, status, escalation_stage, created_at, first_contact_date, category, custom_organisation_name, organisations(name)")
    .eq("share_token", token)
    .eq("is_shared", true)
    .maybeSingle() as { data: SharedCase | null; error: unknown };

  if (!caseData) notFound();

  type SharedInteraction = {
    id: string;
    interaction_date: string;
    channel: string;
    direction: string;
    summary: string;
    contact_name: string | null;
    promises_made: string | null;
    promise_deadline: string | null;
    promise_fulfilled: boolean | null;
    outcome: string | null;
    mood: string | null;
  };

  const { data: interactions } = await supabase
    .from("interactions")
    .select("id, interaction_date, channel, direction, summary, contact_name, promises_made, promise_deadline, promise_fulfilled, outcome, mood")
    .eq("case_id", caseData.id)
    .order("interaction_date", { ascending: false }) as { data: SharedInteraction[] | null; error: unknown };

  const orgName =
    caseData.organisations?.name ??
    caseData.custom_organisation_name ??
    "Unknown organisation";

  const ESCALATION_STAGE_LABELS: Record<string, string> = {
    initial: "Initial Contact",
    formal_complaint: "Formal Complaint",
    final_response: "Final Response",
    ombudsman: "Ombudsman Referral",
    court: "Court / Legal",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Shared header banner */}
      <div className="border-b bg-primary/5 py-3">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
          This case file was shared via{" "}
          <Link className="font-medium text-primary underline" href="/">
            TheyPromised
          </Link>{" "}
          — the UK consumer complaint tracker
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Case header */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{caseData.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{orgName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={STATUS_COLOURS[caseData.status] ?? "border-slate-200 bg-slate-50 text-slate-600"}
                  variant="outline"
                >
                  {caseData.status}
                </Badge>
                {caseData.escalation_stage && (
                  <Badge variant="outline">
                    {ESCALATION_STAGE_LABELS[caseData.escalation_stage] ?? caseData.escalation_stage}
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {caseData.created_at && (
                <span>
                  Case opened:{" "}
                  {format(new Date(caseData.created_at), "d MMMM yyyy", { locale: enGB })}
                </span>
              )}
              {caseData.first_contact_date && (
                <span>
                  First contact:{" "}
                  {format(new Date(caseData.first_contact_date), "d MMMM yyyy", { locale: enGB })}
                </span>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Privacy notice */}
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <strong>Privacy:</strong> This view shows the case timeline only. Uploaded evidence files,
          draft letters, and the case owner&apos;s contact details are not shared.
        </div>

        {/* Timeline */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Timeline ({interactions?.length ?? 0} interaction{interactions?.length !== 1 ? "s" : ""})
          </h2>

          {!interactions || interactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No interactions recorded yet.
              </CardContent>
            </Card>
          ) : (
            <div className="relative space-y-4">
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-primary/20" />
              {interactions.map((interaction) => {
                const channelCfg = CHANNEL_CONFIG[interaction.channel] ?? CHANNEL_CONFIG.other;
                const ChannelIcon = channelCfg.icon;
                const hasPromise = !!interaction.promises_made;

                return (
                  <div className="relative flex gap-4" key={interaction.id}>
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${channelCfg.bg}`}
                    >
                      <ChannelIcon className={`h-4 w-4 ${channelCfg.iconColour}`} />
                    </div>
                    <Card className="min-w-0 flex-1">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              {format(new Date(interaction.interaction_date), "d MMMM yyyy, h:mm a", {
                                locale: enGB,
                              })}
                            </p>
                            <p className={`text-xs ${channelCfg.iconColour}`}>
                              {CHANNEL_LABELS[interaction.channel] ?? interaction.channel}
                              {interaction.direction === "outbound"
                                ? " · You contacted them"
                                : " · They contacted you"}
                              {interaction.contact_name ? ` · ${interaction.contact_name}` : ""}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{interaction.summary}</p>
                        {hasPromise && (
                          <div
                            className={`mt-2 rounded-md border p-2 text-xs ${
                              interaction.promise_fulfilled === true
                                ? "border-green-200 bg-green-50 text-green-700"
                                : interaction.promise_fulfilled === false
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span className="font-medium">
                              {interaction.promise_fulfilled === true
                                ? "Promise kept: "
                                : interaction.promise_fulfilled === false
                                  ? "Promise broken: "
                                  : "Promise made: "}
                            </span>
                            {interaction.promises_made}
                            {interaction.promise_deadline && (
                              <span className="ml-1 text-muted-foreground">
                                (by{" "}
                                {format(new Date(interaction.promise_deadline), "d MMMM yyyy", {
                                  locale: enGB,
                                })}
                                )
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6 text-center">
            <p className="mb-2 font-semibold">Track your own complaints</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Log every call, email, and promise. Get escalation guidance and export a professional
              case file. Free to start.
            </p>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              href="/register"
            >
              Start your case free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
