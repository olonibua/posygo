import type { SessionUser } from "@/shared";
import { describe, expect, it } from "vitest";

import { activeItem, ADMIN_CONSOLE, consoleFor, PARTNER_CONSOLE, visibleItems } from "./navigation";

const partnerLead = (partnerStatus: SessionUser["partnerStatus"]): SessionUser =>
  ({
    id: "u1",
    email: "lead@partner.test",
    role: "FULFILMENT_PARTNER",
    vendorId: null,
    countryCode: "GB",
    partnerId: "p1",
    partnerStatus,
    mfaState: "VERIFIED",
    permissions: [],
  }) as unknown as SessionUser;

describe("partner console navigation", () => {
  it("gives partners their own console", () => {
    expect(consoleFor(partnerLead("ACTIVE"))).toBe(PARTNER_CONSOLE);
  });

  it("hides warehouse work until the partnership is active", () => {
    const labels = (status: SessionUser["partnerStatus"]) => visibleItems(PARTNER_CONSOLE, partnerLead(status)).map((item) => item.label);
    expect(labels("APPLIED")).toEqual(["Partnership", "Team", "Earnings", "Security"]);
    expect(labels("SUSPENDED")).toEqual(["Partnership", "Stock counts", "Transfers", "Team", "Earnings", "Claims", "Security"]);
    expect(labels("ACTIVE")).toEqual(["Partnership", "Receiving", "Orders", "Returns", "Shopping parcels", "Stock", "Stock counts", "Transfers", "Hub", "Team", "Earnings", "Claims", "Security"]);
  });

  it("shows partner staff no team or earnings pages", () => {
    const staff = { ...partnerLead("ACTIVE"), role: "PARTNER_STAFF" } as SessionUser;
    expect(visibleItems(PARTNER_CONSOLE, staff).map((item) => item.label)).toEqual([
      "Partnership",
      "Receiving",
      "Orders",
      "Returns",
      "Shopping parcels",
      "Stock",
      "Stock counts",
      "Transfers",
      "Hub",
      "Security",
    ]);
  });
});

describe("active section", () => {
  it("matches nested pages to the closest section", () => {
    expect(activeItem(ADMIN_CONSOLE.items, "/admin")?.label).toBe("Overview");
    expect(activeItem(ADMIN_CONSOLE.items, "/admin/partners/123")?.label).toBe("Partners");
    expect(activeItem(ADMIN_CONSOLE.items, "/admin/partnersx")?.label).toBe("Overview");
    expect(activeItem(ADMIN_CONSOLE.items, "/overview")).toBeUndefined();
  });
});
