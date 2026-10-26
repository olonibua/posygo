import { DEFAULT_PARTNER_TIERS } from "@/shared";
import { describe, expect, it } from "vitest";

import { listNames } from "@/features/marketing/live-countries";

import { programmeDraft, programmeFrom } from "./partner-programme-draft";

describe("partner programme settings", () => {
  it("round-trips the defaults through the form", () => {
    const draft = programmeDraft({}, "GBP");
    expect(draft).toMatchObject({ acceptingApplications: false, deposit: "0.00", retentionDays: "90", mysteryVendorId: "" });
    expect(draft.tiers).toHaveLength(DEFAULT_PARTNER_TIERS.length);
    const result = programmeFrom(draft, "GBP");
    expect(result.ok && result.programme.tiers).toEqual(DEFAULT_PARTNER_TIERS);
  });

  it("names the fields that aren't numbers, and applies the schema's own rules", () => {
    const draft = programmeDraft({}, "GBP");
    draft.retentionDays = "soon";
    draft.tiers[0]!.maxStock = "lots";
    expect(programmeFrom(draft, "GBP")).toEqual({ ok: false, message: "Check these: retention days, tier 1 stock limit." });
    draft.retentionDays = "5";
    draft.tiers[0]!.maxStock = "500.00";
    expect(programmeFrom(draft, "GBP").ok).toBe(false);
  });

  it("keeps custody rules when the settings are saved", () => {
    const draft = programmeDraft({ partners: { shrinkageAlertBps: 350, trustFloor: 60, highValueOrderMinor: 40_000 } }, "GBP");
    expect(draft.custody).toEqual({ cycleCountDays: "30", lossAlertPct: "3.5", trustFloor: "60", trustForPromotion: "80", highValue: "400.00", noScanHours: "48" });
    const result = programmeFrom(draft, "GBP");
    expect(result.ok && result.programme).toMatchObject({ shrinkageAlertBps: 350, trustFloor: 60, highValueOrderMinor: 40_000, cycleCountDays: 30, noScanAlertHours: 48 });
    draft.custody.lossAlertPct = "lots";
    expect(programmeFrom(draft, "GBP")).toEqual({ ok: false, message: "Check these: loss alert." });
  });

  it("lists hub countries in plain English", () => {
    expect(listNames([])).toBe("");
    expect(listNames(["the UK"])).toBe("the UK");
    expect(listNames(["the UK", "the US", "Canada"])).toBe("the UK, the US and Canada");
  });
});
