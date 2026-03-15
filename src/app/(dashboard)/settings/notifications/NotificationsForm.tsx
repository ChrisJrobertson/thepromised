"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import {
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/actions/settings";

const NOTIFICATION_OPTIONS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  requiresPaid: boolean;
}> = [
  {
    key: "email_reminders",
    label: "Daily reminder digest",
    description:
      "A daily summary of reminders due today — deadlines, escalations, and pending actions.",
    requiresPaid: true,
  },
  {
    key: "promise_deadline_reminders",
    label: "Promise deadline alerts",
    description:
      "Email when an organisation's promise deadline is approaching or has been missed.",
    requiresPaid: true,
  },
  {
    key: "escalation_window_alerts",
    label: "Escalation window alerts",
    description:
      "Email at 6, 7, and 8 weeks to let you know when you can escalate to the ombudsman.",
    requiresPaid: true,
  },
  {
    key: "weekly_case_summary",
    label: "Weekly case summary",
    description: "A weekly digest of activity across all your active cases.",
    requiresPaid: true,
  },
  {
    key: "product_updates",
    label: "Product updates and tips",
    description: "Occasional emails about new features, guides, and complaint tips.",
    requiresPaid: false,
  },
];

type NotificationsFormProps = {
  defaultPrefs: NotificationPreferences;
  emailAllowed: boolean;
};

export function NotificationsForm({
  defaultPrefs,
  emailAllowed,
}: NotificationsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<NotificationPreferences>({
    defaultValues: defaultPrefs,
  });

  function onSubmit(data: NotificationPreferences) {
    startTransition(async () => {
      const result = await updateNotificationPreferences(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Notification preferences saved");
      }
    });
  }

  return (
    <div className="space-y-4">
      {!emailAllowed && (
        <UpgradePrompt
          description="Email reminders and alerts require a Basic or Pro plan. Upgrade to never miss a deadline."
          requiredTier="basic"
          title="Email notifications require Basic or Pro"
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {NOTIFICATION_OPTIONS.map((option) => {
              const isDisabled = option.requiresPaid && !emailAllowed;
              return (
                <div
                  className={`flex items-start justify-between gap-4 py-2 ${isDisabled ? "opacity-50" : ""}`}
                  key={option.key}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                      {option.requiresPaid && (
                        <span className="ml-1 text-xs text-primary">
                          (Basic+)
                        </span>
                      )}
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      className="peer sr-only"
                      disabled={isDisabled}
                      type="checkbox"
                      {...register(option.key)}
                    />
                    <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
                  </label>
                </div>
              );
            })}

            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
