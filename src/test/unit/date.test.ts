import { describe, expect, it } from "vitest";

import { formatUkDate } from "@/lib/date";

describe("formatUkDate", () => {
  it("formats a date string in UK format", () => {
    expect(formatUkDate("2026-03-14")).toBe("14/03/2026");
  });

  it("formats a Date object", () => {
    expect(formatUkDate(new Date("2026-01-01"))).toBe("01/01/2026");
  });

  it("handles end-of-year dates", () => {
    expect(formatUkDate("2025-12-31")).toBe("31/12/2025");
  });

  it("zero-pads days and months", () => {
    expect(formatUkDate("2026-03-05")).toBe("05/03/2026");
    expect(formatUkDate("2026-07-09")).toBe("09/07/2026");
  });
});
