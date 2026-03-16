import type { Profile } from "@/types/database";
import { AI_LIMITS } from "@/lib/ai/constants";

type ExportType = "full_case" | "timeline_only" | "letters_only";
type AiFeature = "suggestions" | "letters";

// ── Case creation ──────────────────────────────────────────────────────────────
export function canCreateCase(profile: Profile): boolean {
  if (profile.subscription_tier === "free") {
    return profile.cases_count < 1;
  }
  return true;
}

// ── PDF export ─────────────────────────────────────────────────────────────────
export function canExportPDF(profile: Profile, exportType: ExportType): boolean {
  if (profile.subscription_tier === "free") return false;
  if (profile.subscription_tier === "basic") {
    return exportType === "timeline_only" || exportType === "letters_only";
  }
  return true; // pro
}

// ── AI features ────────────────────────────────────────────────────────────────
export function canUseAI(profile: Profile, feature: AiFeature): boolean {
  const tier = profile.subscription_tier;
  const limit = AI_LIMITS[tier][feature];
  if (limit === 0) return false;
  if (feature === "suggestions") return profile.ai_suggestions_used < limit;
  if (feature === "letters") return profile.ai_letters_used < limit;
  return profile.ai_credits_used < limit;
}

export function canViewAISuggestions(profile: Profile): boolean {
  return true; // Free tier now gets 3 suggestions/month
}

export function getRemainingAI(profile: Profile, feature: AiFeature): { used: number; limit: number; remaining: number } {
  const tier = profile.subscription_tier;
  const limit = AI_LIMITS[tier][feature];
  const used = feature === "suggestions" ? profile.ai_suggestions_used : feature === "letters" ? profile.ai_letters_used : profile.ai_credits_used;
  return { used, limit, remaining: Math.max(0, limit - used) };
}

// ── Voice memos (Pro only) ─────────────────────────────────────────────────────
export function canRecordVoiceMemo(profile: Profile): boolean {
  return profile.subscription_tier === "pro";
}

// ── Email forwarding (Pro only) ────────────────────────────────────────────────
export function canUseEmailForward(profile: Profile): boolean {
  return profile.subscription_tier === "pro";
}

// ── Email reminders ────────────────────────────────────────────────────────────
export function canReceiveEmailReminders(profile: Profile): boolean {
  return profile.subscription_tier !== "free";
}

// ── Upgrade reason helpers ─────────────────────────────────────────────────────
export function getUpgradeReason(
  profile: Profile,
  feature: "cases" | "pdf" | "ai" | "voice" | "email_forward"
): { blocked: boolean; reason: string; requiredTier: "basic" | "pro" } | null {
  switch (feature) {
    case "cases":
      if (profile.subscription_tier === "free" && profile.cases_count >= 1) {
        return {
          blocked: true,
          reason: "You've reached the 1 case limit on the free plan.",
          requiredTier: "basic",
        };
      }
      return null;
    case "pdf":
      if (profile.subscription_tier === "free") {
        return {
          blocked: true,
          reason: "PDF export requires Basic or Pro.",
          requiredTier: "basic",
        };
      }
      return null;
    case "ai":
      if (profile.subscription_tier === "free") {
        if (profile.ai_suggestions_used >= AI_LIMITS.free.suggestions) {
          return {
            blocked: true,
            reason: `You've used your ${AI_LIMITS.free.suggestions} free AI suggestions this month. Upgrade for unlimited suggestions, or wait until next month.`,
            requiredTier: "basic",
          };
        }
      }
      return null;
    case "voice":
      if (profile.subscription_tier !== "pro") {
        return {
          blocked: true,
          reason: "Voice memo recording requires Pro.",
          requiredTier: "pro",
        };
      }
      return null;
    case "email_forward":
      if (profile.subscription_tier !== "pro") {
        return {
          blocked: true,
          reason: "Email forwarding parser requires Pro.",
          requiredTier: "pro",
        };
      }
      return null;
    default:
      return null;
  }
}
