"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { analytics } from "@/lib/analytics/posthog";
import { createCase } from "@/lib/actions/cases";
import {
  CASE_PRIORITIES,
  CASE_PRIORITY_LABELS,
  INTERACTION_CHANNEL_LABELS,
  INTERACTION_CHANNELS,
  INTERACTION_OUTCOME_LABELS,
  INTERACTION_OUTCOMES,
  ORGANISATION_CATEGORY_LABELS,
  caseDetailsSchema,
  firstInteractionSchema,
} from "@/lib/validation/cases";
import type {
  CaseDetailsData,
  FirstInteractionData,
} from "@/lib/validation/cases";

import { OrganisationStepForm } from "./OrganisationStepForm";

type SelectedOrg = {
  mode: "existing" | "new";
  organisation_id?: string | null;
  organisation_name: string;
  category: string;
  // new org extras
  website?: string;
  complaint_email?: string;
  complaint_phone?: string;
};

const STEPS = [
  { label: "Organisation", icon: Building2 },
  { label: "Case Details", icon: FileText },
  { label: "First Interaction", icon: MessageSquare },
  { label: "Confirm", icon: Check },
];

export function CaseWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null);
  const [isPending, startTransition] = useTransition();

  const detailsForm = useForm<CaseDetailsData>({
    resolver: zodResolver(caseDetailsSchema),
    defaultValues: {
      title: "",
      description: "",
      reference_number: "",
      amount_in_dispute: "",
      desired_outcome: "",
      priority: "medium",
      first_contact_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const interactionForm = useForm<FirstInteractionData>({
    resolver: zodResolver(firstInteractionSchema),
    defaultValues: {
      skip: true,
      interaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      channel: "phone",
      direction: "outbound",
      summary: "",
      contact_name: "",
      contact_department: "",
      contact_role: "",
      reference_number: "",
      duration_minutes: "",
      promises_made: "",
      promise_deadline: "",
      mood: undefined,
    },
  });

  const watchSkip = interactionForm.watch("skip");
  const watchChannel = interactionForm.watch("channel");
  const watchPromise = interactionForm.watch("promises_made");

  const progress = ((step + 1) / STEPS.length) * 100;

  function handleOrgNext(org: SelectedOrg) {
    setSelectedOrg(org);
    setStep(1);
  }

  async function handleDetailsNext() {
    const valid = await detailsForm.trigger();
    if (valid) setStep(2);
  }

  async function handleInteractionNext() {
    if (watchSkip) {
      setStep(3);
      return;
    }
    const valid = await interactionForm.trigger([
      "interaction_date",
      "channel",
      "direction",
      "summary",
    ]);
    if (valid) setStep(3);
  }

  function handleSubmit() {
    if (!selectedOrg) return;
    const details = detailsForm.getValues();
    const interaction = interactionForm.getValues();

    startTransition(async () => {
      const result = await createCase({
        organisation_id: selectedOrg.mode === "existing" ? selectedOrg.organisation_id ?? null : null,
        organisation_name: selectedOrg.organisation_name,
        category: selectedOrg.category,
        new_organisation:
          selectedOrg.mode === "new"
            ? {
                name: selectedOrg.organisation_name,
                category: selectedOrg.category,
                website: selectedOrg.website,
                complaint_email: selectedOrg.complaint_email,
                complaint_phone: selectedOrg.complaint_phone,
              }
            : null,
        title: details.title,
        description: details.description,
        reference_number: details.reference_number,
        amount_in_dispute: details.amount_in_dispute
          ? parseFloat(details.amount_in_dispute)
          : null,
        desired_outcome: details.desired_outcome,
        priority: details.priority,
        first_contact_date: details.first_contact_date,
        first_interaction:
          !interaction.skip && interaction.summary
            ? {
                interaction_date: interaction.interaction_date ?? new Date().toISOString(),
                channel: interaction.channel ?? "phone",
                direction: interaction.direction ?? "outbound",
                summary: interaction.summary ?? "",
                contact_name: interaction.contact_name,
                contact_department: interaction.contact_department,
                contact_role: interaction.contact_role,
                reference_number: interaction.reference_number,
                duration_minutes: interaction.duration_minutes
                  ? parseInt(interaction.duration_minutes, 10)
                  : null,
                promises_made: interaction.promises_made,
                promise_deadline: interaction.promise_deadline,
                outcome: interaction.outcome,
                next_steps: interaction.next_steps,
                mood: interaction.mood,
              }
            : null,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.caseId) {
        analytics.caseCreated(selectedOrg.category, details.priority);
        if (!interaction.skip && interaction.channel) {
          analytics.interactionLogged(
            interaction.channel,
            Boolean(interaction.promises_made)
          );
        }
        router.push(`/cases/${result.caseId}?created=true`);
        router.refresh();
      }
    });
  }

  const detailsValues = detailsForm.watch();

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="space-y-3">
        <Progress className="h-2" value={progress} />
        <div className="flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div
                className="flex flex-col items-center gap-1"
                key={s.label}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
                    isDone
                      ? "border-secondary bg-secondary text-white"
                      : isActive
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`hidden text-xs sm:block ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 0 — Organisation */}
      {step === 0 && (
        <OrganisationStepForm onNext={handleOrgNext} />
      )}

      {/* Step 1 — Case Details */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6">
            <Form {...detailsForm}>
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Case Details</h2>
                  <p className="text-sm text-muted-foreground">
                    What is this case about?
                  </p>
                </div>

                <FormField
                  control={detailsForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Billing dispute, Boiler not repaired, PIP refusal"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailsForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What happened? *</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px]"
                          placeholder="Describe the issue in your own words. Include dates, amounts, and any key facts."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={detailsForm.control}
                    name="reference_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Their reference number</FormLabel>
                        <FormControl>
                          <Input placeholder="If you have one" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={detailsForm.control}
                    name="amount_in_dispute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount in dispute (£)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              £
                            </span>
                            <Input
                              className="pl-7"
                              min="0"
                              placeholder="0.00"
                              step="0.01"
                              type="number"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={detailsForm.control}
                  name="desired_outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you want to happen?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Full refund of £340, repair the boiler, written apology, reinstatement of benefits"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={detailsForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority *</FormLabel>
                        <div className="flex gap-2">
                          {CASE_PRIORITIES.map((p) => (
                            <button
                              className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                                field.value === p
                                  ? p === "urgent"
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : p === "high"
                                      ? "border-orange-400 bg-orange-50 text-orange-700"
                                      : p === "medium"
                                        ? "border-amber-400 bg-amber-50 text-amber-700"
                                        : "border-slate-400 bg-slate-100 text-slate-700"
                                  : "border-muted text-muted-foreground hover:border-muted-foreground"
                              }`}
                              key={p}
                              onClick={() => field.onChange(p)}
                              type="button"
                            >
                              {CASE_PRIORITY_LABELS[p]}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={detailsForm.control}
                    name="first_contact_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of first contact *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — First Interaction */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6">
            <Form {...interactionForm}>
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">First Interaction</h2>
                  <p className="text-sm text-muted-foreground">
                    Would you like to log your first contact now?
                  </p>
                </div>

                <FormField
                  control={interactionForm.control}
                  name="skip"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-3">
                        <button
                          className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${!field.value ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:border-muted-foreground"}`}
                          onClick={() => field.onChange(false)}
                          type="button"
                        >
                          Yes, log it now
                        </button>
                        <button
                          className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${field.value ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:border-muted-foreground"}`}
                          onClick={() => field.onChange(true)}
                          type="button"
                        >
                          Skip for now
                        </button>
                      </div>
                    </FormItem>
                  )}
                />

                {!watchSkip && (
                  <div className="space-y-4 rounded-md border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={interactionForm.control}
                        name="interaction_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date & time *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={interactionForm.control}
                        name="direction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Direction *</FormLabel>
                            <div className="flex gap-2">
                              <button
                                className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium ${field.value === "outbound" ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground"}`}
                                onClick={() => field.onChange("outbound")}
                                type="button"
                              >
                                I contacted them →
                              </button>
                              <button
                                className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium ${field.value === "inbound" ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground"}`}
                                onClick={() => field.onChange("inbound")}
                                type="button"
                              >
                                ← They contacted me
                              </button>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={interactionForm.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel *</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {INTERACTION_CHANNELS.map((ch) => (
                              <button
                                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${field.value === ch ? "border-secondary bg-secondary/10 text-secondary" : "border-muted text-muted-foreground hover:border-muted-foreground"}`}
                                key={ch}
                                onClick={() => field.onChange(ch)}
                                type="button"
                              >
                                {INTERACTION_CHANNEL_LABELS[ch]}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchChannel === "phone" && (
                      <FormField
                        control={interactionForm.control}
                        name="duration_minutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Call duration (minutes)</FormLabel>
                            <FormControl>
                              <Input min="1" placeholder="e.g. 25" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={interactionForm.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What happened? *</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[100px]"
                              placeholder="Describe the interaction in detail — who you spoke to, what was said, any reference numbers given..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                      <FormField
                        control={interactionForm.control}
                        name="contact_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sarah" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={interactionForm.control}
                        name="contact_department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Billing" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={interactionForm.control}
                        name="contact_role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Agent" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={interactionForm.control}
                      name="promises_made"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Did they promise anything?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. They will call back within 3 working days with a resolution..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchPromise && (
                      <FormField
                        control={interactionForm.control}
                        name="promise_deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>By when?</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={interactionForm.control}
                      name="outcome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outcome</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an outcome" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INTERACTION_OUTCOMES.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {INTERACTION_OUTCOME_LABELS[o]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={interactionForm.control}
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How helpful were they?</FormLabel>
                          <div className="flex gap-2">
                            {(
                              [
                                { value: "helpful", emoji: "😊", label: "Helpful" },
                                { value: "neutral", emoji: "😐", label: "Neutral" },
                                { value: "unhelpful", emoji: "😤", label: "Unhelpful" },
                                { value: "hostile", emoji: "😡", label: "Hostile" },
                              ] as const
                            ).map(({ value, emoji, label }) => (
                              <button
                                className={`flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors ${field.value === value ? "border-primary bg-primary/5" : "border-muted text-muted-foreground hover:border-muted-foreground"}`}
                                key={value}
                                onClick={() => field.onChange(value)}
                                type="button"
                              >
                                <span className="text-xl">{emoji}</span>
                                {label}
                              </button>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && selectedOrg && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Confirm your case</h2>
                <p className="text-sm text-muted-foreground">
                  Review the details before creating.
                </p>
              </div>

              <div className="space-y-3 rounded-md border p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organisation</span>
                  <span className="font-medium">{selectedOrg.organisation_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">
                    {ORGANISATION_CATEGORY_LABELS[selectedOrg.category as keyof typeof ORGANISATION_CATEGORY_LABELS] ?? selectedOrg.category}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Case title</span>
                  <span className="font-medium max-w-[60%] text-right">{detailsValues.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <Badge
                    className={
                      detailsValues.priority === "urgent"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : detailsValues.priority === "high"
                          ? "border-orange-200 bg-orange-50 text-orange-700"
                          : detailsValues.priority === "medium"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                    }
                    variant="outline"
                  >
                    {CASE_PRIORITY_LABELS[detailsValues.priority]}
                  </Badge>
                </div>
                {detailsValues.amount_in_dispute && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount in dispute</span>
                    <span className="font-medium">£{parseFloat(detailsValues.amount_in_dispute).toFixed(2)}</span>
                  </div>
                )}
                {detailsValues.reference_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference number</span>
                    <span className="font-mono text-xs">{detailsValues.reference_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First contact</span>
                  <span>
                    {detailsValues.first_contact_date
                      ? format(
                          new Date(detailsValues.first_contact_date),
                          "dd/MM/yyyy"
                        )
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First interaction</span>
                  <span>
                    {watchSkip ? "Not logged yet" : "Will be logged"}
                  </span>
                </div>
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <p className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Keep adding interactions as they happen. The more detail you log, the stronger
                    your case becomes.
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          type="button"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step === 0 ? null : step === 1 ? (
          <Button onClick={handleDetailsNext} type="button">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : step === 2 ? (
          <Button onClick={handleInteractionNext} type="button">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button disabled={isPending} onClick={handleSubmit} type="button">
            {isPending ? "Creating case..." : "Create Case"}
            {!isPending && <Check className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
