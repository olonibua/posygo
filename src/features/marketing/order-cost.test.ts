import { describe, expect, it } from "vitest";

import { type PublicPriceListView, SEED_FEE_SCHEDULES, vendorFeeSchedule } from "@/shared";

import { convertMinor, orderCost } from "./order-cost";

const prices = (countryCode: string): PublicPriceListView => ({
  countryCode,
  countryName: "United Kingdom",
  currency: "GBP",
  schedule: vendorFeeSchedule(SEED_FEE_SCHEDULES.GB!),
  shopping: SEED_FEE_SCHEDULES.GB!.shopping,
});

describe("order cost", () => {
  it("adds packing to postage with our shipping markup", () => {
    const cost = orderCost(prices("GB"))!;
    expect(cost).toMatchObject({ currency: "GBP", packingMinor: 299, postageMinor: 413, totalMinor: 712, extraItemMinor: 99, packingCapMinor: 1099, firstShipmentFree: true });
    expect(cost.storage.map((row) => [row.tier, row.monthlyMinor, row.stockingMinor])).toEqual([
      ["SMALL", 900, 1200],
      ["MEDIUM", 1400, 2200],
      ["LARGE", 1800, 4000],
      ["X_LARGE", 2500, 6000],
    ]);
  });

  it("prices postage for each country we know, and nothing for others", () => {
    expect(orderCost(prices("CA"))?.postageMinor).toBe(1180);
    expect(orderCost(prices("IE"))?.postageMinor).toBe(990);
    expect(orderCost(prices("JP"))).toBeNull();
  });

  it("converts and rounds to a friendly amount", () => {
    expect(convertMinor(712, 2050.4, 10_000)).toBe(1_460_000);
  });
});
