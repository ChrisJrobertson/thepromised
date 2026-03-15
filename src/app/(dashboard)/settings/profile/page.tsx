import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "Profile Settings — TheyPromised" };

export default async function ProfilePage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Your details are used to pre-fill the sender address on generated letters.
        </p>
      </div>
      <ProfileForm email={user.email ?? ""} profile={profile} />
    </div>
  );
}
