"use client";

import { formatDistanceToNow } from "date-fns";
import { enGB } from "date-fns/locale";
import { Clock, MessageSquare, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type Case = {
  id: string;
  ref: string | null;
  title: string;
  status: string;
  priority: string;
  escalation_stage: string | null;
  interaction_count: number | null;
  last_interaction_date: string | null;
  amount_in_dispute: number | string | null;
  category: string | null;
  custom_organisation_name: string | null;
  organisations: { id: string; name: string; category: string | null } | null;
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

const ESCALATION_LABELS: Record<string, string> = {
  initial: "Initial",
  formal_complaint: "Formal Complaint",
  final_response: "Final Response",
  ombudsman: "Ombudsman",
  court: "Court",
};

const STATUS_TABS = ["all", "open", "escalated", "resolved", "closed"] as const;
const STATUS_LABELS = { all: "All", open: "Open", escalated: "Escalated", resolved: "Resolved", closed: "Closed" };

export function CasesPageClient() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("all");

  useEffect(() => {
    async function fetchCases() {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();

        let query = supabase
          .from("cases")
          .select(`
            id, ref, title, status, priority, escalation_stage, interaction_count,
            last_interaction_date, amount_in_dispute, category,
            custom_organisation_name,
            organisations (id, name, category)
          `)
          .order("updated_at", { ascending: false })
          .limit(30);

        if (activeStatus !== "all") {
          query = query.eq("status", activeStatus as "open" | "escalated" | "resolved" | "closed");
        }

        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        setCases((data as Case[]) ?? []);
      } catch (err) {
        console.error("Cases fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load cases");
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [activeStatus]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Cases</h1>
          <Link
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            href="/cases/new"
          >
            <Plus className="h-4 w-4" /> New Case
          </Link>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div className="h-24 animate-pulse rounded-xl border bg-slate-100" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Cases</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Error loading cases: {error}</p>
          <button
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-white"
            onClick={() => window.location.reload()}
            type="button"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Cases</h1>
          <p className="text-sm text-muted-foreground">
            {cases.length} case{cases.length !== 1 ? "s" : ""}
            {activeStatus !== "all" ? ` · ${activeStatus}` : ""}
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          href="/cases/new"
        >
          <Plus className="h-4 w-4" /> New Case
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeStatus === tab
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
            key={tab}
            onClick={() => setActiveStatus(tab)}
            type="button"
          >
            {STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Cases list */}
      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium text-slate-700">
              {activeStatus === "all" ? "No cases yet" : `No ${activeStatus} cases`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              When a company lets you down, start a case here.
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
              href="/cases/new"
            >
              <Plus className="h-4 w-4" /> Start Your First Case
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {cases.map((c) => {
            const orgName =
              c.organisations?.name ?? c.custom_organisation_name ?? "Unknown organisation";
            const orgCategory = c.organisations?.category ?? c.category;

            return (
              <Link href={`/cases/${c.id}`} key={c.id}>
                <Card className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium truncate">{orgName}</span>
                          {orgCategory && (
                            <Badge className="shrink-0" variant="outline">
                              {orgCategory.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{c.title}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOTS[c.priority] ?? "bg-slate-400"}`}
                          title={`Priority: ${c.priority}`}
                        />
                        <Badge className={STATUS_COLOURS[c.status] ?? ""} variant="outline">
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      {c.escalation_stage && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {ESCALATION_LABELS[c.escalation_stage] ?? c.escalation_stage}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {c.interaction_count ?? 0} interaction{(c.interaction_count ?? 0) !== 1 ? "s" : ""}
                      </span>
                      {c.last_interaction_date && (
                        <span className="flex items-center gap-1" suppressHydrationWarning>
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(c.last_interaction_date), {
                            addSuffix: true,
                            locale: enGB,
                          })}
                        </span>
                      )}
                      {c.amount_in_dispute && Number(c.amount_in_dispute) > 0 && (
                        <span className="font-medium text-foreground">
                          £{Number(c.amount_in_dispute).toFixed(2)}
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
