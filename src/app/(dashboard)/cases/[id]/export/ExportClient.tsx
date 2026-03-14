"use client";

import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { AlertCircle, Clock, Download, FileText, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";

type ExportType = "full_case" | "timeline_only" | "letters_only";

type ExportClientProps = {
  caseId: string;
  caseTitle: string;
  canFull: boolean;
  canTimeline: boolean;
  exportHistory: Array<{
    id: string;
    file_name: string;
    export_type: string;
    created_at: string | null;
  }>;
};

const EXPORT_OPTIONS: Array<{
  type: ExportType;
  name: string;
  description: string;
  includes: string[];
  tier: "basic" | "pro";
  icon: string;
}> = [
  {
    type: "timeline_only",
    name: "Timeline Only",
    description: "A chronological log of all your interactions — ideal for a quick summary.",
    includes: [
      "Cover page with case details",
      "All interactions in chronological order",
      "Promises made and their status",
    ],
    tier: "basic",
    icon: "📅",
  },
  {
    type: "letters_only",
    name: "Letters Only",
    description: "All generated and saved letters for this case.",
    includes: [
      "Cover page",
      "All letters in chronological order",
      "Sent/draft status",
    ],
    tier: "basic",
    icon: "✉️",
  },
  {
    type: "full_case",
    name: "Full Case File",
    description: "The complete case dossier — everything an ombudsman or court needs.",
    includes: [
      "Cover page",
      "Case summary",
      "Complete chronological timeline",
      "Promises tracker table",
      "Escalation history",
      "Evidence index",
      "All correspondence",
    ],
    tier: "pro",
    icon: "📁",
  },
];

const EXPORT_TYPE_LABELS: Record<string, string> = {
  full_case: "Full Case File",
  timeline_only: "Timeline Only",
  letters_only: "Letters Only",
};

export function ExportClient({
  caseId,
  caseTitle,
  canFull,
  canTimeline,
  exportHistory,
}: ExportClientProps) {
  const [selectedType, setSelectedType] = useState<ExportType>("timeline_only");
  const [isGenerating, setIsGenerating] = useState(false);

  function canExport(type: ExportType) {
    if (type === "full_case") return canFull;
    return canTimeline;
  }

  async function handleExport() {
    if (!canExport(selectedType)) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ caseId, exportType: selectedType }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "upgrade_required") {
          toast.error(data.message);
          return;
        }
        toast.error(data.error ?? "Export failed. Please try again.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${caseTitle.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 50)}-${EXPORT_TYPE_LABELS[selectedType]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Case file downloaded successfully");
    } catch {
      toast.error("Export failed. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Export type selector */}
      <div className="space-y-3">
        <h2 className="font-semibold">Choose export type</h2>
        <div className="grid gap-3">
          {EXPORT_OPTIONS.map((option) => {
            const isAvailable = canExport(option.type);
            const isSelected = selectedType === option.type;

            return (
              <button
                className={`relative rounded-lg border p-4 text-left transition-all ${
                  !isAvailable
                    ? "cursor-not-allowed opacity-60"
                    : isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted hover:border-primary/40"
                }`}
                disabled={!isAvailable}
                key={option.type}
                onClick={() => isAvailable && setSelectedType(option.type)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{option.name}</p>
                        <Badge
                          className={
                            option.tier === "pro"
                              ? "border-amber-200 bg-amber-50 text-amber-700 text-[10px]"
                              : "border-secondary/30 bg-secondary/10 text-secondary text-[10px]"
                          }
                          variant="outline"
                        >
                          {option.tier === "pro" ? "Pro" : "Basic"}
                        </Badge>
                        {!isAvailable && (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {option.description}
                      </p>
                      <ul className="mt-2 space-y-0.5">
                        {option.includes.map((item) => (
                          <li
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            key={item}
                          >
                            <span className="text-[10px]">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upgrade prompt for full case */}
      {selectedType === "full_case" && !canFull && (
        <UpgradePrompt
          description="Full case file export is available on the Pro plan. This is the complete dossier that ombudsmen and courts expect — cover page, full timeline, promises tracker, evidence index, and all correspondence."
          requiredTier="pro"
          title="Full case file requires Pro"
        />
      )}

      {/* Generate button */}
      {canExport(selectedType) && (
        <div className="space-y-3">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <p className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Generating a large case file may take 10–30 seconds. The file will
                download automatically. A copy is saved to your account.
              </span>
            </p>
          </div>

          <Button
            className="w-full"
            disabled={isGenerating}
            onClick={handleExport}
            size="lg"
            type="button"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate & Download {EXPORT_TYPE_LABELS[selectedType]}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Export history */}
      {exportHistory.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground">
            Previous exports
          </h2>
          <div className="space-y-2">
            {exportHistory.map((exp) => (
              <div
                className="flex items-center justify-between rounded-md border p-3"
                key={exp.id}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {EXPORT_TYPE_LABELS[exp.export_type] ?? exp.export_type}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exp.created_at
                        ? format(new Date(exp.created_at), "d MMM yyyy 'at' HH:mm", {
                            locale: enGB,
                          })
                        : "Unknown date"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
