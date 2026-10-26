import { SEED_FEE_SCHEDULES } from "@/shared";
import { describe, expect, it } from "vitest";

import { draftFrom, scheduleFrom } from "./fee-draft";
import { majorToMinor, toMajorText, toMinor } from "./money-input";

describe("money input", () => {
  it("reads amounts typed in major units", () => {
    expect(toMinor("250", "GBP")).toBe(25_000);
    expect(toMinor("1,250.5", "GBP")).toBe(125_050);
    expect(toMinor("0.07", "USD")).toBe(7);
    expect(toMinor("500", "JPY")).toBe(500);
  });

  it("refuses anything that isn't a plain amount", () => {
    expect(toMinor("12.345", "GBP")).toBeNull();
    expect(toMinor("-5", "GBP")).toBeNull();
    expect(toMinor("1e5", "GBP")).toBeNull();
    expect(toMinor("", "GBP")).toBeNull();
    expect(toMinor("2.5", "JPY")).toBeNull();
  });

  it("scales whole amounts by the currency's minor units", () => {
    expect(majorToMinor(250, "GBP")).toBe(25_000);
    expect(majorToMinor(10_000, "JPY")).toBe(10_000);
  });

  it("writes minor units back as editable text", () => {
    expect(toMajorText(1099, "GBP")).toBe("10.99");
    expect(toMajorText(500, "JPY")).toBe("500");
  });
});

describe("price list draft", () => {
  it("round-trips a price list through the form unchanged", () => {
    const schedule = SEED_FEE_SCHEDULES.GB!;
    const result = scheduleFrom(draftFrom(schedule, "GBP"), "GBP");
    expect(result).toEqual({ ok: true, schedule });
  });

  it("names the amounts that can't be read", () => {
    const draft = draftFrom(SEED_FEE_SCHEDULES.GB!, "GBP");
    draft.tiers.SMALL.stocking = "twelve";
    expect(scheduleFrom(draft, "GBP")).toEqual({ ok: false, message: "Check these amounts: small stocking." });
  });

  it("carries what partners earn, and checks the holdback limit", () => {
    const draft = draftFrom(SEED_FEE_SCHEDULES.GB!, "GBP");
    expect(draft).toMatchObject({
      partnerReceivingPercent: "70",
      partnerStoragePercent: "70",
      partnerFulfilmentPercent: "70",
      partnerFoundingPercent: "5",
      partnerFoundingPlaces: "5",
      partnerHoldbackPercent: "20",
      partnerHoldbackDays: "60",
    });
    draft.partnerHoldbackDays = "soon";
    expect(scheduleFrom(draft, "GBP")).toEqual({ ok: false, message: "Check these amounts: holdback days." });
    draft.partnerHoldbackDays = "60";
    draft.partnerHoldbackPercent = "75";
    expect(scheduleFrom(draft, "GBP").ok).toBe(false);
    draft.partnerHoldbackPercent = "20";
    draft.partnerFoundingPercent = "40";
    expect(scheduleFrom(draft, "GBP").ok).toBe(false);
  });

  it("applies the schema's own rules", () => {
    const draft = draftFrom(SEED_FEE_SCHEDULES.GB!, "GBP");
    draft.max = "1.00";
    expect(scheduleFrom(draft, "GBP")).toEqual({ ok: false, message: "The cap can't be below the base fee" });
  });
});
