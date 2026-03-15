"use client";

import { addDays, differenceInDays, format, isBefore, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Flag,
  Landmark,
  Mail,
  MessageSquare,
  Phone,
  Scale,
  Search,
  Share2,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteInteraction, updatePromiseFulfilled } from "@/lib/actions/interactions";
import {
  INTERACTION_CHANNEL_LABELS,
  INTERACTION_OUTCOME_LABELS,
} from "@/lib/validation/cases";
import type { Evidence, Interaction } from "@/types/database";

type InteractionWithEvidence = Interaction & { evidence?: Evidence[] };

type CaseInfo = {
  created_at: string | null;
  first_contact_date: string | null;
  escalation_stage: string;
  status: string;
  resolved_date: string | null;
};

type Milestone = {
  date: Date;
  label: string;
  emoji: string;
  colour: "green" | "amber" | "blue" | "purple" | "slate";
};

type CaseTimelineProps = {
  caseId: string;
  interactions: InteractionWithEvidence[];
  caseInfo?: CaseInfo | null;
};

type ChannelConfig = { icon: LucideIcon; bg: string; iconColour: string; border: string };

const CHANNEL_CONFIG: Record<string, ChannelConfig> = {
  phone: { icon: Phone, bg: "bg-blue-100", iconColour: "text-blue-600", border: "border-blue-200" },
  email: { icon: Mail, bg: "bg-purple-100", iconColour: "text-purple-600", border: "border-purple-200" },
  letter: { icon: FileText, bg: "bg-slate-100", iconColour: "text-slate-600", border: "border-slate-200" },
  webchat: { icon: MessageSquare, bg: "bg-cyan-100", iconColour: "text-cyan-600", border: "border-cyan-200" },
  in_person: { icon: Users, bg: "bg-green-100", iconColour: "text-green-600", border: "border-green-200" },
  social_media: { icon: Share2, bg: "bg-pink-100", iconColour: "text-pink-600", border: "border-pink-200" },
  app: { icon: MessageSquare, bg: "bg-indigo-100", iconColour: "text-indigo-600", border: "border-indigo-200" },
  other: { icon: FileText, bg: "bg-slate-100", iconColour: "text-slate-500", border: "border-slate-200" },
};

const DEFAULT_CHANNEL: ChannelConfig = {
  icon: FileText,
  bg: "bg-slate-100",
  iconColour: "text-slate-500",
  border: "border-slate-200",
};

const MOOD_CONFIG: Record<string, { emoji: string; colour: string; label: string }> = {
  helpful: { emoji: "😊", colour: "text-green-600", label: "Helpful" },
  neutral: { emoji: "😐", colour: "text-slate-500", label: "Neutral" },
  unhelpful: { emoji: "😞", colour: "text-amber-600", label: "Unhelpful" },
  hostile: { emoji: "😠", colour: "text-red-600", label: "Hostile" },
};

const OUTCOME_COLOURS: Record<string, string> = {
  resolved: "border-green-200 bg-green-50 text-green-700",
  escalated: "border-amber-200 bg-amber-50 text-amber-700",
  promised_callback: "border-blue-200 bg-blue-50 text-blue-700",
  promised_action: "border-blue-200 bg-blue-50 text-blue-700",
  no_resolution: "border-red-200 bg-red-50 text-red-700",
  transferred: "border-slate-200 bg-slate-50 text-slate-600",
  disconnected: "border-red-200 bg-red-50 text-red-700",
  other: "border-muted bg-muted/50 text-muted-foreground",
};

const MILESTONE_COLOURS: Record<string, string> = {
  green: "border-green-200 bg-green-50 text-green-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  purple: "border-purple-200 bg-purple-50 text-purple-800",
  slate: "border-slate-200 bg-slate-50 text-slate-800",
};

const FILTER_CHANNELS = [
  "all",
  "phone",
  "email",
  "letter",
  "webchat",
  "in_person",
  "social_media",
  "app",
  "other",
] as const;

const MILESTONE_ICON_MAP: Record<string, LucideIcon> = {
  green: Check,
  amber: Flag,
  blue: Landmark,
  purple: FileText,
  slate: Scale,
};

function buildMilestones(
  caseInfo: CaseInfo,
  interactions: InteractionWithEvidence[]
): Milestone[] {
  const milestones: Milestone[] = [];

  if (caseInfo.created_at) {
    milestones.push({
      date: parseISO(caseInfo.created_at),
      label: `Case opened on ${format(parseISO(caseInfo.created_at), "d MMMM yyyy", { locale: enGB })}`,
      emoji: "case_opened",
      colour: "green",
    });
  }

  // 8-week escalation window marker
  if (caseInfo.first_contact_date) {
    const windowDate = addDays(parseISO(caseInfo.first_contact_date), 56);
    milestones.push({
      date: windowDate,
      label: `8-week escalation window reached on ${format(windowDate, "d MMMM yyyy", { locale: enGB })} — you may now contact the ombudsman`,
      emoji: "escalation_window",
      colour: "amber",
    });
  }

  // Ombudsman referral
  if (
    caseInfo.escalation_stage === "ombudsman" ||
    caseInfo.escalation_stage === "court"
  ) {
    const ombudsmanInteraction = interactions.find(
      (i) => i.outcome === "escalated"
    );
    const date = ombudsmanInteraction
      ? parseISO(ombudsmanInteraction.interaction_date)
      : new Date();
    milestones.push({
      date,
      label: "Case referred to ombudsman / external body",
      emoji: "ombudsman",
      colour: "blue",
    });
  }

  // Formal complaint stage
  if (
    caseInfo.escalation_stage === "formal_complaint" ||
    caseInfo.escalation_stage === "final_response" ||
    caseInfo.escalation_stage === "ombudsman" ||
    caseInfo.escalation_stage === "court"
  ) {
    const letterInteraction = interactions.find(
      (i) => i.channel === "letter" || i.channel === "email"
    );
    if (letterInteraction) {
      milestones.push({
        date: parseISO(letterInteraction.interaction_date),
        label: "Formal complaint submitted in writing",
        emoji: "formal_complaint",
        colour: "purple",
      });
    }
  }

  // Case resolved
  if (caseInfo.status === "resolved" && caseInfo.resolved_date) {
    milestones.push({
      date: parseISO(caseInfo.resolved_date),
      label: `Case resolved on ${format(parseISO(caseInfo.resolved_date), "d MMMM yyyy", { locale: enGB })}`,
      emoji: "resolved",
      colour: "green",
    });
  }

  return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function CaseTimeline({
  caseId,
  interactions: initialInteractions,
  caseInfo,
}: CaseTimelineProps) {
  const [interactions, setInteractions] = useState(initialInteractions);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [showPromisesOnly, setShowPromisesOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);

  const milestones = useMemo(
    () => (caseInfo ? buildMilestones(caseInfo, interactions) : []),
    [caseInfo, interactions]
  );

  const sorted = useMemo(
    () =>
      [...interactions].sort((a, b) => {
        const diff =
          new Date(a.interaction_date).getTime() -
          new Date(b.interaction_date).getTime();
        return sortOrder === "newest" ? -diff : diff;
      }),
    [interactions, sortOrder]
  );

  const filtered = useMemo(
    () =>
      sorted.filter((i) => {
        if (channelFilter !== "all" && i.channel !== channelFilter) return false;
        if (showPromisesOnly && !i.promises_made) return false;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          const searchable = [
            i.summary,
            i.contact_name,
            i.contact_department,
            i.reference_number,
            i.promises_made,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!searchable.includes(q)) return false;
        }
        return true;
      }),
    [sorted, channelFilter, showPromisesOnly, debouncedSearch]
  );

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteInteraction(id, caseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setInteractions((prev) => prev.filter((i) => i.id !== id));
        setConfirmDelete(null);
        toast.success("Interaction deleted");
      }
    });
  }

  function handleMarkPromise(interactionId: string, fulfilled: boolean) {
    startTransition(async () => {
      const result = await updatePromiseFulfilled(interactionId, caseId, fulfilled);
      if (result.error) {
        toast.error(result.error);
      } else {
        setInteractions((prev) =>
          prev.map((i) =>
            i.id === interactionId ? { ...i, promise_fulfilled: fulfilled } : i
          )
        );
        toast.success(`Promise marked as ${fulfilled ? "kept" : "broken"}`);
      }
    });
  }

  // Build a combined timeline with milestone markers inserted at correct positions
  type TimelineItem =
    | { type: "interaction"; data: InteractionWithEvidence }
    | { type: "milestone"; data: Milestone };

  const timelineItems = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = filtered.map((i) => ({
      type: "interaction" as const,
      data: i,
    }));

    // Only insert milestones if no search active (avoids confusing results)
    if (!debouncedSearch && milestones.length > 0) {
      const today = new Date();
      for (const milestone of milestones) {
        // Skip future milestones past "approaching" – only show past ones
        const isInFuture = isBefore(today, milestone.date);
        const isPastEscalationWindow =
          milestone.emoji === "⏰" &&
          differenceInDays(today, milestone.date) < -7;
        if (isInFuture && isPastEscalationWindow) continue;

        // Find insert position
        const insertIdx = items.findIndex((item) => {
          if (item.type !== "interaction") return false;
          const iDate = new Date(item.data.interaction_date);
          return sortOrder === "newest"
            ? iDate <= milestone.date
            : iDate >= milestone.date;
        });

        const milestoneItem: TimelineItem = {
          type: "milestone" as const,
          data: milestone,
        };

        if (insertIdx === -1) {
          if (sortOrder === "newest") {
            items.push(milestoneItem);
          } else {
            items.unshift(milestoneItem);
          }
        } else {
          items.splice(insertIdx, 0, milestoneItem);
        }
      }
    }

    return items;
  }, [filtered, milestones, sortOrder, debouncedSearch]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between print:hidden">
        <div className="flex flex-wrap gap-2">
          <button
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${sortOrder === "newest" ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground"}`}
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            type="button"
          >
            {sortOrder === "newest" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
          </button>

          <Select
            onValueChange={(v) => v && setChannelFilter(v)}
            value={channelFilter}
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {FILTER_CHANNELS.slice(1).map((ch) => (
                <SelectItem key={ch} value={ch}>
                  {CHANNEL_EMOJIS[ch as keyof typeof CHANNEL_EMOJIS] ?? ""}{" "}
                  {INTERACTION_CHANNEL_LABELS[ch as keyof typeof INTERACTION_CHANNEL_LABELS] ?? ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${showPromisesOnly ? "border-amber-400 bg-amber-50 text-amber-700" : "border-muted text-muted-foreground"}`}
            onClick={() => setShowPromisesOnly((prev) => !prev)}
            type="button"
          >
            Promises only
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} of {interactions.length} interactions
        </p>
      </div>

      {/* Search */}
      <div className="relative print:hidden">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 pl-8 pr-8 text-xs"
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search interactions…"
          type="search"
          value={searchText}
        />
        {searchText && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchText("")}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          <p>{debouncedSearch ? "No interactions match your search." : "No interactions match your filters."}</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-primary/20 print:hidden" />

          <div className="space-y-4">
            {timelineItems.map((item, index) => {
              if (item.type === "milestone") {
                const milestone = item.data;
                const MilestoneIcon = MILESTONE_ICON_MAP[milestone.colour] ?? Flag;
                return (
                  <div
                    className={`relative flex gap-4 print:hidden`}
                    key={`milestone-${milestone.emoji}-${index}`}
                  >
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${MILESTONE_COLOURS[milestone.colour]}`}
                    >
                      <MilestoneIcon className="h-4 w-4" />
                    </div>
                    <div
                      className={`flex-1 rounded-lg border-2 border-dashed px-4 py-2.5 text-sm font-medium ${MILESTONE_COLOURS[milestone.colour]}`}
                    >
                      {milestone.label}
                    </div>
                  </div>
                );
              }

              const interaction = item.data;
              const isExpanded = expandedIds.has(interaction.id);
              const isLong = interaction.summary.length > 150;
              const hasPromise = !!interaction.promises_made;
              const promiseFulfilled = interaction.promise_fulfilled;
              const channelCfg = CHANNEL_CONFIG[interaction.channel] ?? DEFAULT_CHANNEL;
              const ChannelIcon = channelCfg.icon;
              const moodCfg = interaction.mood ? MOOD_CONFIG[interaction.mood] : null;
              const promiseDeadline = interaction.promise_deadline
                ? new Date(interaction.promise_deadline)
                : null;
              const now = new Date();
              const isOverdue = promiseDeadline && !promiseFulfilled && isBefore(promiseDeadline, now);
              const daysOverdue = isOverdue && promiseDeadline ? differenceInDays(now, promiseDeadline) : 0;
              const daysUntil =
                promiseDeadline && !isOverdue && promiseFulfilled === null
                  ? differenceInDays(promiseDeadline, now)
                  : 0;

              const imageEvidence = (interaction.evidence ?? []).filter(
                (e) => e.file_type.startsWith("image/")
              );
              const otherEvidence = (interaction.evidence ?? []).filter(
                (e) => !e.file_type.startsWith("image/")
              );

              return (
                <div className="relative flex gap-4 print:gap-2" key={interaction.id}>
                  {/* Timeline node */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm print:h-8 print:w-8 ${channelCfg.bg}`}
                  >
                    <ChannelIcon className={`h-4 w-4 print:h-3 print:w-3 ${channelCfg.iconColour}`} />
                  </div>

                  {/* Content card */}
                  <div className="min-w-0 flex-1 rounded-lg border bg-card p-4 shadow-sm print:border-slate-300 print:p-3">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {format(
                              new Date(interaction.interaction_date),
                              "d MMMM yyyy, h:mm a",
                              { locale: enGB }
                            )}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className={`flex items-center gap-1 ${channelCfg.iconColour}`}>
                            <ChannelIcon className="h-3 w-3" />
                            {INTERACTION_CHANNEL_LABELS[interaction.channel]}
                          </span>
                          <span className="flex items-center gap-0.5">
                            {interaction.direction === "outbound" ? (
                              <><ArrowRight className="h-3 w-3 text-blue-500" /> You contacted them</>
                            ) : (
                              <><ArrowLeft className="h-3 w-3 text-amber-500" /> They contacted you</>
                            )}
                          </span>
                          {interaction.contact_name && (
                            <span>
                              {interaction.contact_name}
                              {interaction.contact_department
                                ? `, ${interaction.contact_department}`
                                : ""}
                            </span>
                          )}
                          {interaction.reference_number && (
                            <span className="font-mono">
                              Ref: {interaction.reference_number}
                            </span>
                          )}
                          {interaction.duration_minutes && (
                            <span>{interaction.duration_minutes} min</span>
                          )}
                        </div>
                      </div>

                      {/* Outcome badge + mood */}
                      <div className="flex items-center gap-2 print:hidden">
                        {moodCfg && (
                          <span className={`text-base ${moodCfg.colour}`} title={`${moodCfg.label}`}>
                            {moodCfg.emoji}
                          </span>
                        )}
                        {interaction.outcome && (
                          <Badge
                            className={OUTCOME_COLOURS[interaction.outcome] ?? ""}
                            variant="outline"
                          >
                            {INTERACTION_OUTCOME_LABELS[interaction.outcome]}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-3">
                      <p className={`text-sm ${!isExpanded && isLong ? "line-clamp-3" : ""}`}>
                        {interaction.summary}
                      </p>
                      {isLong && (
                        <button
                          className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground print:hidden"
                          onClick={() => toggleExpanded(interaction.id)}
                          type="button"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" /> Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" /> Show more
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* AI Summary */}
                    {interaction.ai_summary && (
                      <div className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium">AI summary: </span>
                        {interaction.ai_summary}
                      </div>
                    )}

                    {/* Promise badges (visible without expanding) */}
                    {hasPromise && (
                      <div className="mt-2 flex flex-wrap gap-2 print:hidden">
                        {promiseFulfilled === true && (
                          <Badge className="border-green-200 bg-green-50 text-green-700" variant="outline">
                            Promise Kept ✓
                          </Badge>
                        )}
                        {promiseFulfilled === false && (
                          <Badge className="border-red-200 bg-red-50 text-red-700" variant="outline">
                            Promise Broken ✗
                            {daysOverdue > 0 ? ` · ${daysOverdue} days overdue` : ""}
                          </Badge>
                        )}
                        {promiseFulfilled === null && isOverdue && (
                          <Badge className="border-red-200 bg-red-50 text-red-700" variant="outline">
                            Promise Broken ✗
                            {daysOverdue > 0 ? ` · ${daysOverdue} days overdue` : ""}
                          </Badge>
                        )}
                        {promiseFulfilled === null && !isOverdue && promiseDeadline && (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700" variant="outline">
                            Promise Pending · Due in {daysUntil} day{daysUntil !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        {promiseFulfilled === null && !promiseDeadline && (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700" variant="outline">
                            Promise Made
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Promise detail block */}
                    {hasPromise && (
                      <div
                        className={`mt-2 rounded-md border p-3 text-sm ${
                          promiseFulfilled === true
                            ? "border-green-200 bg-green-50"
                            : promiseFulfilled === false || isOverdue
                              ? "border-red-200 bg-red-50"
                              : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs">{interaction.promises_made}</p>
                            {interaction.promise_deadline && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                By{" "}
                                {format(
                                  new Date(interaction.promise_deadline),
                                  "d MMMM yyyy",
                                  { locale: enGB }
                                )}
                              </p>
                            )}
                          </div>
                          {promiseFulfilled === null && (
                            <div className="flex gap-1 shrink-0 print:hidden">
                              <Button
                                className="h-7 px-2 text-xs"
                                disabled={isPending}
                                onClick={() => handleMarkPromise(interaction.id, true)}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                <Check className="mr-1 h-3 w-3" /> Kept
                              </Button>
                              <Button
                                className="h-7 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                disabled={isPending}
                                onClick={() => handleMarkPromise(interaction.id, false)}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                ✗ Broken
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Next steps */}
                    {interaction.next_steps && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Next steps: </span>
                        {interaction.next_steps}
                      </div>
                    )}

                    {/* Evidence */}
                    {(imageEvidence.length > 0 || otherEvidence.length > 0) && (
                      <div className="mt-3 space-y-2 print:hidden">
                        {/* Image thumbnails */}
                        {imageEvidence.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {imageEvidence.slice(0, 4).map((ev) => (
                              <div
                                className="h-12 w-12 overflow-hidden rounded-md border bg-muted"
                                key={ev.id}
                                title={ev.file_name}
                              >
                                {/* Thumbnail placeholder — signed URLs require client-side fetch */}
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                  📷
                                </div>
                              </div>
                            ))}
                            {imageEvidence.length > 4 && (
                              <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                                +{imageEvidence.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Non-image evidence badges */}
                        {otherEvidence.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {otherEvidence.map((ev) => (
                              <div
                                className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs"
                                key={ev.id}
                              >
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="max-w-[100px] truncate">{ev.file_name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 flex gap-2 print:hidden">
                      <Button
                        className="h-7 px-2 text-xs"
                        onClick={() => setConfirmDelete(interaction.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="mr-1 h-3 w-3 text-red-400" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        open={!!confirmDelete}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this interaction?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the interaction and any associated reminders.
            Evidence files will not be deleted.
          </p>
          <div className="mt-4 flex gap-3 justify-end">
            <Button
              onClick={() => setConfirmDelete(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              type="button"
              variant="destructive"
            >
              {isPending ? "Deleting..." : "Delete interaction"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
