"use client";

import { AlertCircle, Check, Copy, Download, FileText, Loader2, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { LetterTemplate } from "@/lib/ai/letter-templates";

type LetterWizardProps = {
  caseId: string;
  preselectedType: string | null;
  templates: LetterTemplate[];
  tier?: "free" | "basic" | "pro";
  aiLettersUsed?: number;
  aiLettersLimit?: number;
};

type Step = "select" | "instructions" | "generating" | "edit" | "actions";

export function LetterWizard({
  caseId,
  preselectedType,
  templates,
  tier = "free",
  aiLettersUsed = 0,
  aiLettersLimit = 0,
}: LetterWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(preselectedType ? "instructions" : "select");
  const [selectedType, setSelectedType] = useState<string>(preselectedType ?? "");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState<{
    id: string;
    subject: string;
    body: string;
  } | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const [sentDate, setSentDate] = useState("");
  const [sentVia, setSentVia] = useState<"email" | "post" | "not_sent">("not_sent");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localLettersUsed, setLocalLettersUsed] = useState(aiLettersUsed);
  const [showExhaustedModal, setShowExhaustedModal] = useState(false);

  const isLetterExhausted = aiLettersLimit > 0 && localLettersUsed >= aiLettersLimit;
  // Show credit indicator for free and basic users
  const showLetterCreditIndicator = tier !== "pro" && aiLettersLimit > 0;
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function handleUpgradeToBasic() {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "basic", returnPath: `/cases/${caseId}` }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Failed to start checkout. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  const selectedTemplate = templates.find((t) => t.type === selectedType);
  const stepProgress = {
    select: 20,
    instructions: 40,
    generating: 60,
    edit: 80,
    actions: 100,
  }[step];

  async function handleGenerate() {
    // Free users who have exhausted their monthly letter allowance see the soft paywall
    if (tier === "free" && isLetterExhausted) {
      setShowExhaustedModal(true);
      return;
    }

    setStep("generating");
    setError(null);

    try {
      const response = await fetch("/api/ai/draft-letter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caseId,
          letterType: selectedType,
          additionalInstructions: additionalInstructions || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? data.error ?? "Letter generation failed");
        setStep("instructions");
        return;
      }

      setGeneratedLetter({
        id: data.letterId,
        subject: data.subject,
        body: data.body,
      });
      setEditedBody(data.body);
      setStep("edit");

      // Post-magic-moment nudge: show once after the first free letter is generated
      if (tier === "free" && localLettersUsed === 0) {
        toast("Your letter is ready! Free users get 1 AI letter per month — upgrade for more.", {
          duration: 6000,
        });
      }
      setLocalLettersUsed((prev) => prev + 1);
    } catch {
      setError("Network error. Please try again.");
      setStep("instructions");
    }
  }

  async function handleSaveEdits() {
    if (!generatedLetter) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/letters/${generatedLetter.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: editedBody }),
      });

      if (!response.ok) {
        toast.error("Failed to save edits");
        return;
      }

      toast.success("Letter saved");
      setStep("actions");
    } catch {
      toast.error("Failed to save edits");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMarkSent() {
    if (!generatedLetter) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/letters/${generatedLetter.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: "sent",
          sent_date: sentDate || new Date().toISOString(),
          sent_via: sentVia,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to mark as sent");
        return;
      }

      toast.success("Letter marked as sent");
      router.push(`/cases/${caseId}?tab=letters`);
      router.refresh();
    } catch {
      toast.error("Failed to update letter");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownloadPdf() {
    if (!generatedLetter) return;

    try {
      const response = await fetch("/api/export/letter-pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ letterId: generatedLetter.id }),
      });

      if (!response.ok) {
        toast.error("Failed to generate PDF");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedLetter.subject.slice(0, 50)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(editedBody || (generatedLetter?.body ?? ""));
    toast.success("Copied to clipboard");
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <Progress className="h-1.5" value={stepProgress} />

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Select letter type */}
      {step === "select" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Select letter type</h2>
            <p className="text-sm text-muted-foreground">
              Choose the type of letter that best fits your situation.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <button
                className={`rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm ${
                  selectedType === template.type
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                }`}
                key={template.type}
                onClick={() => setSelectedType(template.type)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  {selectedType === template.type && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="mt-2 font-medium text-sm">{template.name}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                {template.legalReferences.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.legalReferences.slice(0, 1).map((ref) => (
                      <Badge
                        className="text-[10px]"
                        key={ref}
                        variant="secondary"
                      >
                        {ref.split(" ")[0]} {ref.split(" ")[1]}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          <Button
            className="w-full"
            disabled={!selectedType}
            onClick={() => setStep("instructions")}
            type="button"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Additional instructions */}
      {step === "instructions" && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedTemplate.icon} {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 text-sm space-y-2">
              <p>
                <span className="font-medium">When to use:</span>{" "}
                {selectedTemplate.whenToUse}
              </p>
              <p>
                <span className="font-medium">Tone:</span>{" "}
                {selectedTemplate.suggestedTone}
              </p>
              {selectedTemplate.legalReferences.length > 0 && (
                <p>
                  <span className="font-medium">Legal basis:</span>{" "}
                  {selectedTemplate.legalReferences.join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">
                Additional instructions{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="instructions"
                maxLength={500}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="Any specific points you want to emphasise, or details to include that aren't in the case..."
                rows={3}
                value={additionalInstructions}
              />
              <p className="text-xs text-muted-foreground">
                {additionalInstructions.length}/500
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("select")}
                  type="button"
                  variant="outline"
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleGenerate}
                  type="button"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Letter with AI
                </Button>
              </div>
              {showLetterCreditIndicator && (
                <p className="text-center text-xs text-muted-foreground">
                  {isLetterExhausted
                    ? `${localLettersUsed} of ${aiLettersLimit} AI letters used — upgrade for more`
                    : `${localLettersUsed} of ${aiLettersLimit} AI letters used this month`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generating */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium">Drafting your letter...</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Claude is reviewing your case history and crafting a professional
            complaint letter. This takes about 10–20 seconds.
          </p>
        </div>
      )}

      {/* Step 4: Edit */}
      {step === "edit" && generatedLetter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Review & Edit</h2>
              <p className="text-sm text-muted-foreground">
                Review the AI-drafted letter. Edit freely before saving.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} size="sm" type="button" variant="outline">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-muted/20 px-4 py-2">
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="text-sm font-medium">{generatedLetter.subject}</p>
          </div>

          {/* A4 paper preview + edit */}
          <div className="rounded-lg border shadow-inner bg-white">
            <div className="p-2 border-b bg-muted/30 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Letter body — click to edit</span>
            </div>
            <Textarea
              className="min-h-[600px] border-0 rounded-none rounded-b-lg bg-white font-mono text-sm leading-relaxed resize-none focus-visible:ring-0 p-6"
              onChange={(e) => setEditedBody(e.target.value)}
              value={editedBody}
            />
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <strong>Remember:</strong> AI-generated letters may contain errors. Always review before sending to ensure all facts are accurate.
          </div>
          <p className="text-xs italic text-muted-foreground text-center">
            AI suggestions are for guidance only and do not constitute legal advice. Always verify information with the relevant ombudsman or a qualified adviser.
          </p>

          <div className="flex gap-3">
            <Button
              disabled={isSaving}
              onClick={handleSaveEdits}
              type="button"
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
            <Button
              onClick={() => setStep("actions")}
              type="button"
              variant="outline"
            >
              Skip editing
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Actions */}
      {step === "actions" && generatedLetter && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Letter ready</h2>
            <p className="text-sm text-muted-foreground">
              Your letter has been saved as a draft. What would you like to do?
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="flex items-start gap-3 rounded-lg border p-4 text-left hover:border-primary/50 hover:shadow-sm transition-all"
              onClick={handleDownloadPdf}
              type="button"
            >
              <Download className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Download as PDF</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Formatted A4 letter ready to print or attach
                </p>
              </div>
            </button>

            <button
              className="flex items-start gap-3 rounded-lg border p-4 text-left hover:border-primary/50 hover:shadow-sm transition-all"
              onClick={handleCopy}
              type="button"
            >
              <Copy className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Copy to clipboard</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste into email or word processor
                </p>
              </div>
            </button>
          </div>

          {/* Mark as sent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mark as sent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sent-date">Date sent</Label>
                  <Input
                    id="sent-date"
                    onChange={(e) => setSentDate(e.target.value)}
                    type="date"
                    value={sentDate}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sent via</Label>
                  <div className="flex gap-2">
                    {(["email", "post"] as const).map((method) => (
                      <button
                        className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                          sentVia === method
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-muted text-muted-foreground"
                        }`}
                        key={method}
                        onClick={() => setSentVia(method)}
                        type="button"
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={isSaving || sentVia === "not_sent"}
                onClick={handleMarkSent}
                type="button"
                variant="secondary"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Mark as sent"}
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/cases/${caseId}?tab=letters`)}
              type="button"
              variant="outline"
            >
              Back to case
            </Button>
            <Button
              onClick={() => {
                setStep("select");
                setSelectedType("");
                setGeneratedLetter(null);
                setEditedBody("");
                setError(null);
              }}
              type="button"
              variant="ghost"
            >
              Create another letter
            </Button>
          </div>
        </div>
      )}

      {/* Soft paywall modal — shown when free user's monthly letter allowance is exhausted */}
      <Dialog open={showExhaustedModal} onOpenChange={setShowExhaustedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You&apos;ve used your free AI letter this month</DialogTitle>
            <DialogDescription>
              Upgrade to Basic (£4.99/mo) for 5 AI-drafted letters and 10 suggestions,
              or grab a one-off Complaint Pack.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <button
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              onClick={() => setShowExhaustedModal(false)}
              type="button"
            >
              Maybe Later
            </button>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
              href="/packs"
              onClick={() => setShowExhaustedModal(false)}
            >
              Browse Packs
            </Link>
            {/* Goes directly to Stripe Checkout — no extra pricing page click needed */}
            <button
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isCheckingOut}
              onClick={handleUpgradeToBasic}
              type="button"
            >
              {isCheckingOut ? "Loading…" : "Upgrade to Basic — £4.99/mo"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
