import { describe, expect, it } from "vitest";

import { ESCALATION_STAGES } from "@/lib/ai/escalation-rules";

describe("escalation stages", () => {
  it("contains the expected progression order", () => {
    expect(ESCALATION_STAGES).toEqual([
      "initial",
      "formal_complaint",
      "final_response",
      "ombudsman",
      "court",
    ]);
  });
});
