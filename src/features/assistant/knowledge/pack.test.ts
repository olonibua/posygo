import { describe, expect, it } from "vitest";

import { knowledgePack, readableLabel } from "./pack";

describe("knowledge pack for the answer service", () => {
  it("turns label patterns into words a person would read", () => {
    expect(readableLabel(/^Value per unit/)).toBe("Value per unit");
    expect(readableLabel(/^Product \d+$/)).toBe("Product 1");
    expect(readableLabel(/^(Postcode|ZIP code|Postal code)/)).toBe("Postcode");
  });

  it("carries every page, guide and question, ready to send as JSON", () => {
    const pack = JSON.parse(JSON.stringify(knowledgePack(new Date("2026-10-27T00:00:00Z")))) as ReturnType<typeof knowledgePack>;
    expect(pack.pages.map((page) => page.route)).toContain("/inbound/new");
    expect(pack.pages.find((page) => page.route === "/products/new")?.fields.find((field) => field.name === "hsCode")?.labels).toEqual(["Tariff code"]);
    expect(pack.articles.length).toBeGreaterThan(2);
    expect(pack.faqs.length).toBeGreaterThan(5);
  });
});
