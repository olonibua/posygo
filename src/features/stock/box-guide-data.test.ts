import { describe, expect, it } from "vitest";

import { BOX_GUIDE, packBottles, packGarments, tierForBox } from "./box-guide-data";

const entry = (tier: string) => BOX_GUIDE.find((box) => box.tier === tier)!;

describe("box sizes", () => {
  it("puts standard UK and European boxes in the smallest size they fit, whichever way they are measured", () => {
    expect(tierForBox([305, 229, 229])).toBe("SMALL");
    expect(tierForBox([229, 305, 229])).toBe("SMALL");
    expect(tierForBox([457, 305, 305])).toBe("MEDIUM");
    expect(tierForBox([400, 300, 300])).toBe("MEDIUM");
    expect(tierForBox([457, 457, 457])).toBe("LARGE");
    expect(tierForBox([610, 457, 457])).toBe("X_LARGE");
    expect(tierForBox([600, 400, 400])).toBe("X_LARGE");
  });

  it("says when a box is too big for any size", () => {
    expect(tierForBox([800, 600, 500])).toBeNull();
  });

  it("counts bottles by space, then caps them by the weight limit", () => {
    expect(packBottles(entry("SMALL"))).toMatchObject({ limitedByWeight: false });
    expect(packBottles(entry("SMALL")).placements).toHaveLength(30);
    expect(packBottles(entry("MEDIUM")).placements).toHaveLength(60);
    expect(packBottles(entry("LARGE"))).toMatchObject({ limitedByWeight: true });
    expect(packBottles(entry("LARGE")).placements).toHaveLength(166);
    expect(packBottles(entry("X_LARGE")).placements).toHaveLength(208);
  });

  it("counts folded clothes", () => {
    expect(BOX_GUIDE.map((box) => packGarments(box).placements.length)).toEqual([7, 20, 30, 60]);
  });
});
