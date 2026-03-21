"use client";

import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { Clock, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CaseWithOrganisation } from "@/types/cases";

type CaseRow = CaseWithOrganisation & { pendingPromises: number };

type StatusTab = { value: string; label: string };
type SortOption = { value: string; label: string };

type CasesClientProps = {
  cases: CaseRow[];
  initialStatus: string;
  initialSearch: string;
  initialSort: string;
  statusTabs: readonly StatusTab[];
  sortOptions: readonly SortOption[];
};

const STATUS_COLOURS: Record<string, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  escalated: "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-green-200 bg-green-50 text-green-700",
  closed: "border-slate-200 bg-slate-100 text-slate-600",
};

const PRIORITY_DOTS: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-amber-400",
  low: "bg-slate-400",
};

function formatLastInteractionRelative(iso: string): string | null {
  const d = parseISO(iso);
  if (!isValid(d)) return null;
  return formatDistanceToNow(d, { addSuffix: true, locale: enGB });
}

const ESCALATION_LABELS: Record<string, string> = {
  initial: "Initial",
  formal_complaint: "Formal Complaint",
  final_response: "Final Response",
  ombudsman: "Ombudsman",
  court: "Court",
};

export function CasesClient({
  cases,
  initialStatus,
  initialSearch,
  initialSort,
  statusTabs,
  sortOptions,
}: CasesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      if (initialStatus && initialStatus !== "all") params.set("status", initialStatus);
      if (search) params.set("search", search);
      if (initialSort && initialSort !== "recent") params.set("sort", initialSort);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`/cases?${params.toString()}`);
    },
    [initialStatus, search, initialSort, router]
  );

  function handleSearch(value: string) {
    setSearch(value);
    const params = new URLSearchParams();
    if (initialStatus && initialStatus !== "all") params.set("status", initialStatus);
    if (value) params.set("search", value);
    if (initialSort && initialSort !== "recent") params.set("sort", initialSort);
    router.push(`/cases?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                initialStatus === tab.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              key={tab.value}
              onClick={() => updateParams({ status: tab.value === "all" ? "" : tab.value })}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            className="w-48"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search cases..."
            value={search}
          />
          <Select
            onValueChange={(v) => v && updateParams({ sort: v })}
            value={initialSort}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cases list */}
      {cases.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No cases match your filters.
        </p>
      ) : (
        <div className="grid gap-3">
          {cases.map((c) => {
            const orgName =
              c.organisations?.name ?? c.custom_organisation_name ?? "Unknown organisation";
            const orgCategory = c.organisations?.category ?? c.category;
            const lastInteractionRelative = c.last_interaction_date
              ? formatLastInteractionRelative(c.last_interaction_date)
              : null;

            return (
              <Link href={`/cases/${c.id}`} key={c.id}>
                <Card className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{orgName}</span>
                          <Badge className="shrink-0" variant="outline">
                            {orgCategory?.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{c.title}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOTS[c.priority] ?? "bg-slate-400"}`}
                          title={`Priority: ${c.priority}`}
                        />
                        <Badge
                          className={STATUS_COLOURS[c.status] ?? ""}
                          variant="outline"
                        >
                          {c.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {ESCALATION_LABELS[c.escalation_stage] ?? c.escalation_stage}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {c.interaction_count} interaction{c.interaction_count !== 1 ? "s" : ""}
                      </span>
                      {lastInteractionRelative ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lastInteractionRelative}
                        </span>
                      ) : null}
                      {c.pendingPromises > 0 && (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-700" variant="outline">
                          {c.pendingPromises} promise{c.pendingPromises !== 1 ? "s" : ""} pending
                        </Badge>
                      )}
                      {c.amount_in_dispute && (
                        <span className="font-medium text-foreground">
                          £{c.amount_in_dispute.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
