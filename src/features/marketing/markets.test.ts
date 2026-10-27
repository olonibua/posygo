import { describe, expect, it } from "vitest";

import { countryPath, findBySlug, fulfilmentWord } from "./markets";

const countries = [
  { code: "GB", name: "United Kingdom", currency: "GBP", status: "LIVE", locale: "en-GB", measurementSystem: "METRIC" },
  { code: "US", name: "United States", currency: "USD", status: "LIVE", locale: "en-US", measurementSystem: "IMPERIAL" },
] as const;

describe("market pages", () => {
  it("spell fulfilment the way each market searches for it", () => {
    expect(fulfilmentWord("US")).toBe("fulfillment");
    expect(fulfilmentWord("GB")).toBe("fulfilment");
  });

  it("give each market a readable address that finds it again", () => {
    expect(countryPath(countries[1])).toBe("/fulfilment/united-states");
    expect(findBySlug([...countries], "united-kingdom")?.code).toBe("GB");
    expect(findBySlug([...countries], "narnia")).toBeUndefined();
  });
});

describe("country names in sentences", () => {
  it("read naturally and keep the short name people search for", async () => {
    const { countryPhrase, shortName } = await import("./markets");
    expect(countryPhrase(countries[1])).toBe("the United States");
    expect(countryPhrase({ name: "Nigeria" })).toBe("Nigeria");
    expect(shortName("GB")).toBe("UK");
    expect(shortName("NG")).toBeUndefined();
  });
});
