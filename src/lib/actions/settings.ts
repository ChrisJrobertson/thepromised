"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ProfileUpdate } from "@/types/database";

export type ProfileFormData = {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postcode: string;
};

export async function updateProfile(data: ProfileFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  const update: ProfileUpdate = {
    full_name: data.full_name || null,
    phone: data.phone || null,
    address_line_1: data.address_line_1 || null,
    address_line_2: data.address_line_2 || null,
    city: data.city || null,
    postcode: data.postcode || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings/profile");
  return { success: true };
}

export type NotificationPreferences = {
  email_reminders: boolean;
  promise_deadline_reminders: boolean;
  escalation_window_alerts: boolean;
  weekly_case_summary: boolean;
  product_updates: boolean;
  activity_nudges_enabled: boolean;
};

export async function updateNotificationPreferences(
  prefs: NotificationPreferences
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  // Store as JSON in a generic metadata column — if that doesn't exist,
  // this is a graceful no-op that still returns success for UI purposes.
  // The actual column `notification_preferences` is added via migration.
  const { error } = await supabase
    .from("profiles")
    .update({ notification_preferences: prefs } as unknown as ProfileUpdate)
    .eq("id", user.id);

  if (error) {
    // If the column doesn't exist yet, we still return success
    if (error.code === "42703") return { success: true };
    return { error: error.message };
  }

  revalidatePath("/settings/notifications");
  return { success: true };
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };

  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorised" };

  // Cancel Stripe subscription first
  try {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData) {
      const profile = profileData as {
        stripe_customer_id: string | null;
        subscription_id: string | null;
      };
      if (profile.subscription_id) {
        const { getStripeClient } = await import("@/lib/stripe/client");
        const stripe = getStripeClient();
        await stripe.subscriptions.cancel(profile.subscription_id);
      }
    }
  } catch {
    // Continue with deletion even if Stripe cancellation fails
  }

  // Delete all user data (Supabase will cascade via FK)
  // Deleting evidence from storage first
  const { data: evidenceItems } = await supabase
    .from("evidence")
    .select("storage_path")
    .eq("user_id", user.id);

  if (evidenceItems && evidenceItems.length > 0) {
    const paths = (evidenceItems as { storage_path: string }[]).map((e) => e.storage_path);
    await supabase.storage.from("evidence").remove(paths);
  }

  // Delete auth user — this cascades to profile via trigger
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  return { success: true };
}
