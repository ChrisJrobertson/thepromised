"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AlertCircle, Clock, Edit, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

import { CaseTimeline } from "@/components/cases/CaseTimeline";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatUkDate } from "@/lib/date";
import type { Case, EscalationRule, Evidence, Interaction, Letter } from "@/types/database";

// Heavy tab components — split into separate JS chunks, loaded on first tab activation
const EvidenceGallery = dynamic(
  () => import("@/components/cases/EvidenceGallery").then((m) => ({ default: m.EvidenceGallery })),
  { ssr: false, loading: () => <TabSkeleton /> }
);

const EscalationGuide = dynamic(
  () =>
    import("@/components/cases/EscalationGuide").then((m) => ({ default: m.EscalationGuide })),
  { ssr: false, loading: () => <TabSkeleton /> }
);

// Sidebar AI widget — also split since it pulls in the AI client code
export const AISuggestionLazy = dynamic(
  () => import("@/components/cases/AISuggestion").then((m) => ({ default: m.AISuggestion })),
  { ssr: false, loading: () => <div className="h-24 animate-pulse rounded-lg bg-muted" /> }
);

function TabSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

type InteractionRow = Interaction & { evidence: Evidence[] };

export type CaseTabsProps = {
  caseId: string;
  defaultTab: string;
  interactions: InteractionRow[];
  evidence: Evidence[];
  letters: Letter[];
  escalationRules: EscalationRule[];
  caseCategory: string;
  caseEscalationStage: Case["escalation_stage"];
  caseFirstContactDate: string | null;
};

export function CaseTabs({
  caseId,
  defaultTab,
  interactions,
  evidence,
  letters,
  escalationRules,
  caseCategory,
  caseEscalationStage,
  caseFirstContactDate,
}: CaseTabsProps) {
  // Track which tabs have been visited so we only mount each component once
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    () => new Set([defaultTab])
  );

  const handleTabChange = (value: string) => {
    setVisitedTabs((prev) => new Set([...prev, value]));
  };

  return (
    <Tabs defaultValue={defaultTab} onValueChange={handleTabChange}>
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

      {/* Timeline is the default tab — always statically loaded */}
      <TabsContent className="mt-4" value="timeline">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {interactions.length} interactions logged
          </p>
          <Link
            className={buttonVariants({ size: "sm" })}
            href={`/cases/${caseId}/interactions/new`}
          >
            + Log Interaction
          </Link>
        </div>
        <CaseTimeline caseId={caseId} interactions={interactions} />
      </TabsContent>

      {/* Interactions — mount on first visit, simple inline component */}
      <TabsContent className="mt-4" value="interactions">
        {visitedTabs.has("interactions") && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">All interactions</p>
              <Link
                className={buttonVariants({ size: "sm" })}
                href={`/cases/${caseId}/interactions/new`}
              >
                + Log Interaction
              </Link>
            </div>
            <InteractionTable interactions={interactions} />
          </>
        )}
      </TabsContent>

      {/* Evidence — dynamically loaded on first visit */}
      <TabsContent className="mt-4" value="evidence">
        {visitedTabs.has("evidence") && (
          <EvidenceGallery caseId={caseId} evidence={evidence} />
        )}
      </TabsContent>

      {/* Letters — mount on first visit, simple inline component */}
      <TabsContent className="mt-4" value="letters">
        {visitedTabs.has("letters") && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {letters.length} letter{letters.length !== 1 ? "s" : ""}
              </p>
              <Link
                className={buttonVariants({ size: "sm" })}
                href={`/cases/${caseId}/letters/new`}
              >
                + Generate Letter
              </Link>
            </div>
            <LettersList caseId={caseId} letters={letters} />
          </>
        )}
      </TabsContent>

      {/* Escalation — dynamically loaded on first visit */}
      <TabsContent className="mt-4" value="escalation">
        {visitedTabs.has("escalation") && (
          <EscalationGuide
            caseId={caseId}
            category={caseCategory}
            currentStage={caseEscalationStage}
            firstContactDate={caseFirstContactDate}
            rules={escalationRules}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

// --- Inline sub-components (small, not worth a separate chunk) ---

function InteractionTable({ interactions }: { interactions: InteractionRow[] }) {
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
