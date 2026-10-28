import { PRODUCT_STOCK_STATES, VENDOR_STAGES } from "@/shared";
import { describe, expect, it } from "vitest";

import { directoryPath, pageCount, STOCK_STATE_DISPLAY, VENDOR_STAGE_DISPLAY } from "./vendor-display";

describe("vendor directory display", () => {
  it("labels every stage and stock state", () => {
    expect(Object.keys(VENDOR_STAGE_DISPLAY).sort()).toEqual([...VENDOR_STAGES].sort());
    expect(Object.keys(STOCK_STATE_DISPLAY).sort()).toEqual([...PRODUCT_STOCK_STATES].sort());
  });

  it("builds the request path from only the filters in use", () => {
    expect(directoryPath("/v1/admin/vendors", { page: 1 })).toBe("/v1/admin/vendors");
    expect(directoryPath("/v1/admin/vendors", { q: "lace & co", country: "", stage: "LIVE", page: 2 })).toBe("/v1/admin/vendors?q=lace+%26+co&stage=LIVE&page=2");
  });

  it("always has at least one page", () => {
    expect(pageCount(0, 50)).toBe(1);
    expect(pageCount(50, 50)).toBe(1);
    expect(pageCount(51, 50)).toBe(2);
  });
});
