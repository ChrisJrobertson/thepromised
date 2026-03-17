import type { Profile } from "@/types/database";
import { AI_LIMITS, type AiTier, type AiFeature } from "@/lib/ai/constants";

type ExportType = "full_case" | "timeline_only" | "letters_only";

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
  const tier = profile.subscription_tier as AiTier;
  const limit = AI_LIMITS[tier][feature];
  if (feature === "letters") {
    return profile.ai_letters_used < limit;
  }
  // suggestions and summaries both use the ai_suggestions_used counter
  return profile.ai_suggestions_used < limit;
}

export function canViewAISuggestions(profile: Profile): boolean {
  // Free users can view AI suggestions up to their monthly limit.
  const tier = profile.subscription_tier as AiTier;
  const limit = AI_LIMITS[tier].suggestions;
  return profile.ai_suggestions_used < limit;
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
    case "ai": {
      const tier = profile.subscription_tier as AiTier;
      const limit = AI_LIMITS[tier].suggestions;
      if (profile.ai_suggestions_used >= limit) {
        return {
          blocked: true,
          reason:
            tier === "free"
              ? `You've used your ${limit} free AI suggestions this month. Upgrade for more.`
              : "Monthly AI credit limit reached. Upgrade your plan for more.",
          requiredTier: tier === "free" ? "basic" : "pro",
        };
      }
      return null;
    }
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
