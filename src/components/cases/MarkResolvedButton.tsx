"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { closeCase } from "@/lib/actions/cases";

const resolveSchema = z.object({
  outcome_type: z.enum([
    "full_resolution",
    "partial_resolution",
    "goodwill_gesture",
    "ombudsman_upheld",
    "ombudsman_rejected",
    "court_awarded",
    "court_settled",
    "no_resolution",
  ]),
  compensation_amount: z.string().optional(),
  resolution_summary: z.string().min(10, "Please describe how this was resolved (at least 10 characters)"),
});

type ResolveFormData = z.infer<typeof resolveSchema>;

const OUTCOME_LABELS: Record<string, string> = {
  full_resolution: "Full resolution — everything I asked for",
  partial_resolution: "Partial resolution — some of what I asked for",
  goodwill_gesture: "Goodwill gesture only",
  ombudsman_upheld: "Ombudsman upheld my complaint",
  ombudsman_rejected: "Ombudsman rejected my complaint",
  court_awarded: "Court awarded in my favour",
  court_settled: "Settled out of court",
  no_resolution: "Closed without resolution",
};

type MarkResolvedButtonProps = {
  caseId: string;
  caseTitle: string;
};

export function MarkResolvedButton({ caseId, caseTitle }: MarkResolvedButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResolveFormData>({
    resolver: zodResolver(resolveSchema),
    defaultValues: {
      outcome_type: "full_resolution",
      compensation_amount: undefined,
      resolution_summary: "",
    },
  });

  function onSubmit(data: ResolveFormData) {
    startTransition(async () => {
      const compensationNum = data.compensation_amount ? parseFloat(data.compensation_amount) : NaN;
      const summary = [
        OUTCOME_LABELS[data.outcome_type] ?? data.outcome_type,
        !isNaN(compensationNum) && compensationNum > 0
          ? `£${compensationNum.toLocaleString("en-GB")} received`
          : null,
        data.resolution_summary,
      ]
        .filter(Boolean)
        .join(" — ");

      const result = await closeCase(caseId, summary);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Case marked as resolved. Well done!");
      setOpen(false);
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 h-8"
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark Resolved
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark case as resolved</DialogTitle>
          <DialogDescription>
            Record the outcome for <strong>{caseTitle}</strong>. This helps build
            public data on how companies handle complaints.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="outcome_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(OUTCOME_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compensation_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compensation or refund received (£)</FormLabel>
                  <FormControl>
                    <Input
                      min="0"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resolution_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What happened?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe how the company resolved your complaint…"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                disabled={isPending}
                type="submit"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Mark Resolved"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
