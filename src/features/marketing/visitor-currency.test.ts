import { describe, expect, it } from "vitest";

import { currencyForCountry, isBaseCurrency, readRate } from "./visitor-currency";

describe("visitor currency", () => {
  it("finds the currency for a visitor's country", () => {
    expect(currencyForCountry("NG")).toBe("NGN");
    expect(currencyForCountry("de")).toBe("EUR");
    expect(currencyForCountry("BR")).toBeNull();
    expect(currencyForCountry(null)).toBeNull();
  });

  it("only trusts a positive number from the rates feed", () => {
    expect(readRate({ result: "success", rates: { NGN: 2050.4 } }, "NGN")).toBe(2050.4);
    expect(readRate({ rates: { NGN: "2050" } }, "NGN")).toBeNull();
    expect(readRate({ rates: { NGN: 0 } }, "NGN")).toBeNull();
    expect(readRate(null, "NGN")).toBeNull();
  });

  it("only accepts a supported base currency", () => {
    expect(isBaseCurrency("GBP")).toBe(true);
    expect(isBaseCurrency("gbp")).toBe(false);
    expect(isBaseCurrency("XXX")).toBe(false);
  });
});
