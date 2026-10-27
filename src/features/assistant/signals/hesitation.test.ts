import { describe, expect, it } from "vitest";

import { DWELL_MS, HesitationTracker } from "./hesitation";

describe("noticing when someone is stuck", () => {
  it("speaks up after a long pause on one field, but never while they type", () => {
    const tracker = new HesitationTracker();
    tracker.focused("Tariff code", 0);
    expect(tracker.stuckOn(DWELL_MS - 1)).toBeNull();
    tracker.edited("Tariff code", DWELL_MS - 1000);
    expect(tracker.stuckOn(DWELL_MS + 1000)).toBeNull();
    expect(tracker.stuckOn(DWELL_MS + 10_000)).toBe("Tariff code");
  });

  it("asks only once per field, and waits a while before asking about anything else", () => {
    const tracker = new HesitationTracker();
    tracker.focused("Tariff code", 0);
    expect(tracker.stuckOn(DWELL_MS + 10_000)).toBe("Tariff code");
    expect(tracker.stuckOn(DWELL_MS * 10)).toBeNull();
    tracker.focused("Weight (g)", 60_000);
    expect(tracker.stuckOn(120_000)).toBeNull();
    tracker.focused("Value per unit (GBP)", 10 * 60_000);
    expect(tracker.stuckOn(11 * 60_000)).toBe("Value per unit (GBP)");
  });

  it("speaks up when the same field is rejected twice in a row", () => {
    const tracker = new HesitationTracker();
    expect(tracker.fieldRejected("Tracking number", 0)).toBeNull();
    expect(tracker.fieldRejected("Tracking number", 1000)).toBe("Tracking number");
    tracker.fieldAccepted("Postcode");
    expect(tracker.fieldRejected("Postcode", 2000)).toBeNull();
  });

  it("forgets the field once they move away", () => {
    const tracker = new HesitationTracker();
    tracker.focused("Units", 0);
    tracker.left();
    expect(tracker.stuckOn(DWELL_MS * 2)).toBeNull();
  });
});
