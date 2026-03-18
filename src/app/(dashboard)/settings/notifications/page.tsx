export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { canReceiveEmailReminders } from "@/lib/stripe/feature-gates";
import type { Profile } from "@/types/database";

import { NotificationsForm } from "./NotificationsForm";

export const metadata = { title: "Notification Settings — TheyPromised" };

export default async function NotificationSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  const emailAllowed = profile ? canReceiveEmailReminders(profile) : false;

  // Try to read notification_preferences from profile (may not exist yet)
  const prefs = (profile as unknown as Record<string, unknown>)
    ?.notification_preferences as Record<string, boolean> | null ?? null;

  const defaultPrefs = {
    email_reminders: prefs?.email_reminders ?? true,
    promise_deadline_reminders: prefs?.promise_deadline_reminders ?? true,
    escalation_window_alerts: prefs?.escalation_window_alerts ?? true,
    weekly_case_summary: prefs?.weekly_case_summary ?? false,
    product_updates: prefs?.product_updates ?? true,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Choose which emails you want to receive.
        </p>
      </div>
      <NotificationsForm
        defaultPrefs={defaultPrefs}
        emailAllowed={emailAllowed}
      />
    </div>
  );
}
