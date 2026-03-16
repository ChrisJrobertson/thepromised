import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { AccountClient } from "./AccountClient";

export const metadata = { title: "Account Settings" };

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_export_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your data and account settings.
        </p>
      </div>
      <AccountClient lastExportAt={profile?.last_export_at ?? null} />
    </div>
  );
}
