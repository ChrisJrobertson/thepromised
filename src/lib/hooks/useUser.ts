"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type UserWithProfile = {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
};

async function getUserWithProfile(): Promise<UserWithProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, email: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
  };
}

export function useUser() {
  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: getUserWithProfile,
    staleTime: 60_000,
  });

  return {
    ...query,
    user: query.data ?? { userId: null, email: null, profile: null },
  };
}
