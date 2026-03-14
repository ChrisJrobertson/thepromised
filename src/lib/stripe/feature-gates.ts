import type { Profile } from "@/types/database";

type ExportType = "full_case" | "timeline_only" | "letters_only";
type AiFeature = "suggestions" | "letters";

const AI_LIMITS = {
  free: { suggestions: 0, letters: 0 },
  basic: { suggestions: 10, letters: 5 },
  pro: { suggestions: 50, letters: 30 },
} as const;

export function canCreateCase(profile: Profile) {
  if (profile.subscription_tier === "free") {
    return profile.cases_count < 1;
  }
  return true;
}

export function canExportPDF(profile: Profile, exportType: ExportType) {
  if (profile.subscription_tier === "free") return false;
  if (profile.subscription_tier === "basic") {
    return exportType === "timeline_only";
  }
  return true;
}

export function canUseAI(profile: Profile, feature: AiFeature) {
  const limit = AI_LIMITS[profile.subscription_tier][feature];
  return profile.ai_credits_used < limit;
}

export function canRecordVoiceMemo(profile: Profile) {
  return profile.subscription_tier === "pro";
}

export function canUseEmailForward(profile: Profile) {
  return profile.subscription_tier === "pro";
}
