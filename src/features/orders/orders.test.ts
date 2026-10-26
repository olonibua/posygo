import { ORDER_STATUSES, PUBLIC_TRACKING_STATUSES } from "@/shared";
import { describe, expect, it } from "vitest";

import { ORDER_GROUPS, ORDER_STATUS_DISPLAY, TRACKING_STATUS_DISPLAY } from "./order-display";

describe("order display", () => {
  it("puts every status in exactly one tab", () => {
    const grouped = Object.values(ORDER_GROUPS).flat();
    expect([...grouped].sort()).toEqual([...ORDER_STATUSES].sort());
  });

  it("labels every status and tracking state", () => {
    expect(Object.keys(ORDER_STATUS_DISPLAY).sort()).toEqual([...ORDER_STATUSES].sort());
    expect(Object.keys(TRACKING_STATUS_DISPLAY).sort()).toEqual([...PUBLIC_TRACKING_STATUSES].sort());
  });
});
