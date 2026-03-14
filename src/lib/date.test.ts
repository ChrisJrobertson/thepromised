import { describe, expect, it } from "vitest";

import { formatUkDate } from "@/lib/date";

describe("formatUkDate", () => {
  it("formats to DD/MM/YYYY", () => {
    expect(formatUkDate("2026-03-14T10:30:00Z")).toBe("14/03/2026");
  });
});
