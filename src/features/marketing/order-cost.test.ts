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
    expect(cost).toMatchObject({ currency: "GBP", packingMinor: 299, postageMinor: 413, totalMinor: 712, extraItemMinor: 99, packingCapMinor: 1099 });
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
