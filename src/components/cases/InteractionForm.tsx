"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Laptop,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  Send,
  Users,
  Wifi,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { EvidenceUpload } from "@/components/cases/EvidenceUpload";
import { VoiceMemoRecorder } from "@/components/cases/VoiceMemoRecorder";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { logInteraction } from "@/lib/actions/interactions";
import { analytics } from "@/lib/analytics/posthog";
import { canRecordVoiceMemo } from "@/lib/stripe/feature-gates";
import { createClient } from "@/lib/supabase/client";
import {
  INTERACTION_CHANNEL_LABELS,
  INTERACTION_CHANNELS,
  INTERACTION_OUTCOME_LABELS,
  INTERACTION_OUTCOMES,
  interactionSchema,
  type InteractionFormData,
} from "@/lib/validation/cases";
import type { Case } from "@/types/database";
import type { Profile } from "@/types/database";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  phone: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  letter: <Send className="h-3.5 w-3.5" />,
  webchat: <MessageCircle className="h-3.5 w-3.5" />,
  in_person: <Users className="h-3.5 w-3.5" />,
  social_media: <Wifi className="h-3.5 w-3.5" />,
  app: <Laptop className="h-3.5 w-3.5" />,
  other: <MessageCircle className="h-3.5 w-3.5" />,
};

type InteractionFormProps = {
  preselectedCaseId?: string;
  cases?: Pick<Case, "id" | "title">[];
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
};

export function InteractionForm({
  preselectedCaseId,
  cases,
  onSuccess,
  redirectOnSuccess = true,
}: InteractionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [authUserId, setAuthUserId] = useState<string>("");
  const [subscriptionTier, setSubscriptionTier] = useState<Profile["subscription_tier"]>("free");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
  }, []);

  useEffect(() => {
    if (!authUserId) return;

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", authUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.subscription_tier) {
          setSubscriptionTier(data.subscription_tier);
        }
      });
  }, [authUserId]);

  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      case_id: preselectedCaseId ?? "",
      interaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      channel: "phone",
      direction: "outbound",
      summary: "",
      contact_name: "",
      contact_department: "",
      contact_role: "",
      reference_number: "",
      duration_minutes: "",
      has_promise: false,
      promises_made: "",
      promise_deadline: "",
      outcome: undefined,
      next_steps: "",
      mood: undefined,
    },
  });

  const watchChannel = form.watch("channel");
  const watchHasPromise = form.watch("has_promise");

  function onSubmit(data: InteractionFormData) {
    startTransition(async () => {
      const result = await logInteraction({
        case_id: data.case_id,
        interaction_date: data.interaction_date,
        channel: data.channel,
        direction: data.direction,
        summary: data.summary,
        contact_name: data.contact_name || null,
        contact_department: data.contact_department || null,
        contact_role: data.contact_role || null,
        reference_number: data.reference_number || null,
        duration_minutes: data.duration_minutes
          ? parseInt(data.duration_minutes, 10)
          : null,
        has_promise: data.has_promise,
        promises_made: data.promises_made || null,
        promise_deadline: data.promise_deadline || null,
        outcome: data.outcome ?? null,
        next_steps: data.next_steps || null,
        mood: data.mood ?? null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (data.channel === "phone" && !data.has_promise) {
        toast.success("Interaction logged", {
          description:
            "Pro tip: note down the exact time. Phone records can be requested as evidence.",
          duration: 6000,
        });
      } else {
        toast.success("Interaction logged successfully");
      }

      if (data.has_promise && data.promise_deadline) {
        toast.info("Reminders set for the promise deadline", {
          duration: 4000,
        });
      }

      analytics.interactionLogged(data.channel, data.has_promise);

      form.reset();
      onSuccess?.();

      if (redirectOnSuccess && data.case_id) {
        router.push(`/cases/${data.case_id}?tab=timeline`);
        router.refresh();
      }
    });
  }
  const selectedCaseId = preselectedCaseId ?? form.watch("case_id");

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Case selector (only shown if no preselected case) */}
        {!preselectedCaseId && cases && cases.length > 0 && (
          <FormField
            control={form.control}
            name="case_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Date & time + Direction */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
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
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction *</FormLabel>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors ${field.value === "outbound" ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:border-muted-foreground"}`}
                    onClick={() => field.onChange("outbound")}
                    type="button"
                  >
                    I contacted them →
                  </button>
                  <button
                    className={`flex-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors ${field.value === "inbound" ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:border-muted-foreground"}`}
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

        {/* Channel */}
        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel *</FormLabel>
              <div className="flex flex-wrap gap-2">
                {INTERACTION_CHANNELS.map((ch) => (
                  <button
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${field.value === ch ? "border-secondary bg-secondary/10 text-secondary" : "border-muted text-muted-foreground hover:border-muted-foreground"}`}
                    key={ch}
                    onClick={() => field.onChange(ch)}
                    type="button"
                  >
                    {CHANNEL_ICONS[ch]}
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
            control={form.control}
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

        {/* Summary */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What happened? * (min. 20 characters)</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[120px]"
                  placeholder="Describe the interaction in detail — who you spoke to, what was said, any reference numbers given, exactly what was promised..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact details */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Contact details (optional)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sarah" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
              control={form.control}
              name="contact_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role / title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Agent" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="reference_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference number given</FormLabel>
                <FormControl>
                  <Input placeholder="Any reference they provided" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Promises */}
        <div className="space-y-3 rounded-md border p-4">
          <FormField
            control={form.control}
            name="has_promise"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm">Did they promise anything?</FormLabel>
                  <div className="flex gap-2">
                    <button
                      className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${field.value ? "border-amber-400 bg-amber-50 text-amber-700" : "border-muted text-muted-foreground"}`}
                      onClick={() => field.onChange(true)}
                      type="button"
                    >
                      Yes
                    </button>
                    <button
                      className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${!field.value ? "border-muted bg-muted/50 text-muted-foreground" : "border-muted text-muted-foreground"}`}
                      onClick={() => field.onChange(false)}
                      type="button"
                    >
                      No
                    </button>
                  </div>
                </div>
              </FormItem>
            )}
          />

          {watchHasPromise && (
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="promises_made"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What did they promise? *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. They will call back within 3 working days with a full refund decision..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promise_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>By when?</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll set automatic reminders to check if the promise was kept.
                    </p>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Outcome + Next steps */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
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
                      <SelectValue placeholder="Select outcome" />
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
        </div>

        <FormField
          control={form.control}
          name="next_steps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next steps</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What will you do next? What are you waiting for?"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Mood / helpfulness */}
        <FormField
          control={form.control}
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
                    onClick={() =>
                      field.onChange(field.value === value ? undefined : value)
                    }
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

        {/* Attach evidence */}
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Attach Evidence</p>
          </div>
          <p className="text-xs text-muted-foreground">
            You can add files and voice notes now. They will be attached to this case.
          </p>

          {!selectedCaseId ? (
            <p className="text-xs text-muted-foreground">
              Select a case first to attach evidence.
            </p>
          ) : !authUserId ? (
            <p className="text-xs text-muted-foreground">Loading your account...</p>
          ) : (
            <div className="space-y-4">
              <EvidenceUpload
                caseId={selectedCaseId}
                interactionId={null}
                userId={authUserId}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium">Voice memo</p>
                {canRecordVoiceMemo({ subscription_tier: subscriptionTier }) ? (
                  <VoiceMemoRecorder
                    caseId={selectedCaseId}
                    interactionId={null}
                    profile={{ subscription_tier: subscriptionTier }}
                    userId={authUserId}
                  />
                ) : (
                  <UpgradePrompt
                    description="Voice memo recording is available on the Pro plan."
                    requiredTier="pro"
                    title="Voice memos require Pro"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Logging..." : "Log Interaction"}
        </Button>
      </form>
    </Form>
  );
}
