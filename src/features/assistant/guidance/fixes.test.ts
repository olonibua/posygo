import { describe, expect, it } from "vitest";

import { orderReferenceFix, productCodeFix, tariffCodeFix, trackingNumberFix } from "./fixes";

describe("format fixes the helper can offer", () => {
  it("turns a product code into the accepted shape", () => {
    expect(productCodeFix("wig bw 16")).toBe("WIG-BW-16");
    expect(productCodeFix(" bonnet_pink! ")).toBe("BONNET-PINK");
    expect(productCodeFix("!")).toBeNull();
  });

  it("tidies tracking numbers, tariff codes and order references", () => {
    expect(trackingNumberFix("AB 1234#5678 GB")).toBe("AB 12345678 GB");
    expect(trackingNumberFix("#")).toBeNull();
    expect(tariffCodeFix("6704.20")).toBe("670420");
    expect(tariffCodeFix("67")).toBeNull();
    expect(orderReferenceFix("Order 1029 (shop)")).toBe("Order-1029-shop");
  });
});
