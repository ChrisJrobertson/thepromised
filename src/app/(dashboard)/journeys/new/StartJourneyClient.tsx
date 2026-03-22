"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { startJourney } from "@/lib/actions/journeys";
import type { JourneyTemplate } from "@/lib/journeys/templates";
import type { Case } from "@/types/database";

type StartJourneyClientProps = {
  templates: JourneyTemplate[];
  cases: Case[];
  sectors: { id: string; label: string; icon: string; description?: string }[];
};

export function StartJourneyClient({ templates, cases, sectors }: StartJourneyClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<string>("");

  const filteredTemplates = selectedSector
    ? templates.filter((t) => t.sector === selectedSector)
    : templates;

  const chosenTemplate = templates.find((t) => t.id === selectedTemplate);

  function handleStart() {
    if (!selectedTemplate) {
      toast.error("Please select a journey type.");
      return;
    }
    startTransition(async () => {
      const result = await startJourney(selectedTemplate, selectedCase || undefined);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.journeyId) {
        router.push(`/journeys/${result.journeyId}`);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Start a Guided Journey</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your complaint type and we&apos;ll walk you through every step — letters, evidence,
          escalation, and legal context included.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. What type of complaint is this?</CardTitle>
          <CardDescription>Filter by sector to find the right journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sector filter */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${!selectedSector ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              onClick={() => {
                setSelectedSector("");
                setSelectedTemplate("");
              }}
              type="button"
            >
              All
            </button>
            {sectors.map((sector) => (
              <button
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${selectedSector === sector.id ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                key={sector.id}
                onClick={() => {
                  setSelectedSector(sector.id);
                  setSelectedTemplate("");
                }}
                title={sector.description}
                type="button"
              >
                {sector.icon} {sector.label}
              </button>
            ))}
          </div>

          {/* Template cards */}
          <div className="grid gap-3">
            {filteredTemplates.map((template) => (
              <button
                className={`w-full rounded-lg border p-4 text-left transition-all ${selectedTemplate === template.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                type="button"
              >
                <p className="font-semibold text-slate-800">{template.title}</p>
                <p className="mt-1 text-sm text-slate-500">{template.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {template.steps.length} steps
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Link to an existing case (optional)</CardTitle>
            <CardDescription>
              Linking lets the journey use your case data to pre-fill letters. You can also link later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="case-select">Case</Label>
              <Select onValueChange={(v) => { if (v) setSelectedCase(v); }} value={selectedCase}>
                <SelectTrigger id="case-select">
                  <SelectValue placeholder="Select a case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {chosenTemplate && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <h3 className="font-semibold text-primary">{chosenTemplate.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{chosenTemplate.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {chosenTemplate.steps.slice(0, 4).map((step, i) => (
                <span
                  className="rounded-full bg-white border border-primary/20 px-2.5 py-0.5 text-xs text-slate-600"
                  key={step.id}
                >
                  {i + 1}. {step.title}
                </span>
              ))}
              {chosenTemplate.steps.length > 4 && (
                <span className="rounded-full bg-white border border-primary/20 px-2.5 py-0.5 text-xs text-slate-600">
                  +{chosenTemplate.steps.length - 4} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          disabled={!selectedTemplate || isPending}
          onClick={handleStart}
          type="button"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting…
            </>
          ) : (
            "Start Journey"
          )}
        </Button>
        <Button onClick={() => router.back()} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );
}
