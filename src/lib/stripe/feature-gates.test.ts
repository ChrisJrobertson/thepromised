import { describe, expect, it } from "vitest";

import { canCreateCase, canExportPDF } from "@/lib/stripe/feature-gates";
import type { Profile } from "@/types/database";

const baseProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "test@example.com",
  full_name: null,
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
  created_at: null,
  updated_at: null,
};

describe("feature gates", () => {
  it("allows one free case only", () => {
    expect(canCreateCase({ ...baseProfile, cases_count: 0 })).toBe(true);
    expect(canCreateCase({ ...baseProfile, cases_count: 1 })).toBe(false);
  });

  it("limits basic export type", () => {
    const basic = { ...baseProfile, subscription_tier: "basic" as const };
    expect(canExportPDF(basic, "timeline_only")).toBe(true);
    expect(canExportPDF(basic, "full_case")).toBe(false);
  });
});
