import { describe, expect, it } from "vitest";

import {
  canCreateCase,
  canExportPDF,
  canRecordVoiceMemo,
  canUseAI,
  canUseEmailForward,
  canViewAISuggestions,
} from "@/lib/stripe/feature-gates";
import type { Profile } from "@/types/database";

function makeProfile(
  overrides: Partial<Profile> = {}
): Profile {
  const profile: Profile = {
    id: "test-user-id",
    email: "test@example.com",
    full_name: "Test User",
    phone: null,
    address_line_1: null,
    address_line_2: null,
    city: null,
    postcode: null,
    stripe_customer_id: null,
    subscription_tier: "free",
    subscription_status: "active",
    subscription_id: null,
    cases_count: 0,
    ai_suggestions_used: 0,
    ai_letters_used: 0,
    ai_credits_used: 0,
    ai_credits_reset_at: null,
    pack_pro_expires_at: null,
    pack_access_case_id: null,
    pack_source_pack_id: null,
    is_admin: false,
    last_export_at: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  };
  profile.pack_pro_expires_at = overrides.pack_pro_expires_at ?? null;
  profile.pack_access_case_id = overrides.pack_access_case_id ?? null;
  profile.pack_source_pack_id = overrides.pack_source_pack_id ?? null;
  return profile;
}

describe("canCreateCase", () => {
  it("allows free users to create 1 case", () => {
    expect(canCreateCase(makeProfile({ cases_count: 0 }))).toBe(true);
  });

  it("blocks free users at 1 case", () => {
    expect(canCreateCase(makeProfile({ cases_count: 1 }))).toBe(false);
  });

  it("allows basic users unlimited cases", () => {
    expect(
      canCreateCase(makeProfile({ subscription_tier: "basic", cases_count: 100 }))
    ).toBe(true);
  });

  it("allows pro users unlimited cases", () => {
    expect(
      canCreateCase(makeProfile({ subscription_tier: "pro", cases_count: 999 }))
    ).toBe(true);
  });
});

describe("canExportPDF", () => {
  it("blocks free users from all exports", () => {
    expect(canExportPDF(makeProfile(), "full_case")).toBe(false);
    expect(canExportPDF(makeProfile(), "timeline_only")).toBe(false);
    expect(canExportPDF(makeProfile(), "letters_only")).toBe(false);
  });

  it("allows basic users timeline and letters exports", () => {
    const profile = makeProfile({ subscription_tier: "basic" });
    expect(canExportPDF(profile, "timeline_only")).toBe(true);
    expect(canExportPDF(profile, "letters_only")).toBe(true);
    expect(canExportPDF(profile, "full_case")).toBe(false);
  });

  it("allows pro users all export types", () => {
    const profile = makeProfile({ subscription_tier: "pro" });
    expect(canExportPDF(profile, "full_case")).toBe(true);
    expect(canExportPDF(profile, "timeline_only")).toBe(true);
    expect(canExportPDF(profile, "letters_only")).toBe(true);
  });
});

describe("canUseAI", () => {
  it("blocks free users from all AI features", () => {
    expect(canUseAI(makeProfile(), "suggestions")).toBe(false);
    expect(canUseAI(makeProfile(), "letters")).toBe(false);
  });

  it("allows basic users up to their suggestion limit", () => {
    const profile = makeProfile({ subscription_tier: "basic", ai_credits_used: 5 });
    expect(canUseAI(profile, "suggestions")).toBe(true);
  });

  it("blocks basic users at suggestion limit", () => {
    const profile = makeProfile({ subscription_tier: "basic", ai_credits_used: 10 });
    expect(canUseAI(profile, "suggestions")).toBe(false);
  });

  it("allows pro users up to their limit", () => {
    const profile = makeProfile({ subscription_tier: "pro", ai_credits_used: 49 });
    expect(canUseAI(profile, "suggestions")).toBe(true);
  });

  it("blocks pro users at their limit", () => {
    const profile = makeProfile({ subscription_tier: "pro", ai_credits_used: 50 });
    expect(canUseAI(profile, "suggestions")).toBe(false);
  });
});

describe("canRecordVoiceMemo", () => {
  it("blocks free users", () => {
    expect(canRecordVoiceMemo(makeProfile())).toBe(false);
  });

  it("blocks basic users", () => {
    expect(canRecordVoiceMemo(makeProfile({ subscription_tier: "basic" }))).toBe(false);
  });

  it("allows pro users", () => {
    expect(canRecordVoiceMemo(makeProfile({ subscription_tier: "pro" }))).toBe(true);
  });
});

describe("canUseEmailForward", () => {
  it("blocks free and basic users", () => {
    expect(canUseEmailForward(makeProfile())).toBe(false);
    expect(canUseEmailForward(makeProfile({ subscription_tier: "basic" }))).toBe(false);
  });

  it("allows pro users", () => {
    expect(canUseEmailForward(makeProfile({ subscription_tier: "pro" }))).toBe(true);
  });
});

describe("canViewAISuggestions", () => {
  it("blocks free users", () => {
    expect(canViewAISuggestions(makeProfile())).toBe(false);
  });

  it("allows basic and pro users", () => {
    expect(canViewAISuggestions(makeProfile({ subscription_tier: "basic" }))).toBe(true);
    expect(canViewAISuggestions(makeProfile({ subscription_tier: "pro" }))).toBe(true);
  });
});
