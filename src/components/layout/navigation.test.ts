import type { SessionUser } from "@/shared";
import { describe, expect, it } from "vitest";

import { activeItem, ADMIN_CONSOLE, consoleFor, isLocked, PARTNER_CONSOLE, VENDOR_CONSOLE, visibleItems } from "./navigation";

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
    expect(labels("ACTIVE")).toEqual(["Partnership", "Receiving", "Orders", "Returns", "Stock", "Stock counts", "Transfers", "Hub", "Team", "Earnings", "Claims", "Security"]);
  });

  it("shows partner staff no team or earnings pages", () => {
    const staff = { ...partnerLead("ACTIVE"), role: "PARTNER_STAFF" } as SessionUser;
    expect(visibleItems(PARTNER_CONSOLE, staff).map((item) => item.label)).toEqual(["Partnership", "Receiving", "Orders", "Returns", "Stock", "Stock counts", "Transfers", "Hub", "Security"]);
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

describe("vendor directory navigation", () => {
  const staff = (role: SessionUser["role"]) => ({ ...partnerLead("ACTIVE"), role, partnerId: null, partnerStatus: null }) as unknown as SessionUser;

  it("shows vendors after partners and products beside stock to staff who can read vendors", () => {
    const labels = visibleItems(ADMIN_CONSOLE, staff("COUNTRY_OPS")).map((item) => item.label);
    expect(labels.slice(labels.indexOf("Partners"), labels.indexOf("Partners") + 2)).toEqual(["Partners", "Vendors"]);
    expect(labels.slice(labels.indexOf("Products"), labels.indexOf("Products") + 2)).toEqual(["Products", "Stock"]);
    expect(activeItem(ADMIN_CONSOLE.items, "/admin/vendors/123")?.label).toBe("Vendors");
  });

  it("keeps them from warehouse operators", () => {
    const labels = visibleItems(ADMIN_CONSOLE, staff("WAREHOUSE_OPERATOR")).map((item) => item.label);
    expect(labels).not.toContain("Vendors");
    expect(labels).not.toContain("Products");
  });
});

const vendorOwner = (vendorStatus: SessionUser["vendorStatus"]): SessionUser =>
  ({
    id: "u2",
    email: "owner@shop.test",
    role: "VENDOR_OWNER",
    vendorId: "v1",
    vendorStatus,
    countryCode: "GB",
    partnerId: null,
    partnerStatus: null,
    mfaState: "NOT_REQUIRED",
    permissions: [],
  }) as unknown as SessionUser;

describe("vendor portal before the account is live", () => {
  const lockedLabels = (status: SessionUser["vendorStatus"]) =>
    visibleItems(VENDOR_CONSOLE, vendorOwner(status))
      .filter((item) => isLocked(item, vendorOwner(status)))
      .map((item) => item.label);

  it("keeps everything but the overview, verification and security locked until the account is live", () => {
    expect(lockedLabels("PENDING_VERIFICATION")).not.toContain("Overview");
    expect(lockedLabels("PENDING_VERIFICATION")).not.toContain("Verification");
    expect(lockedLabels("PENDING_VERIFICATION")).not.toContain("Security");
    expect(lockedLabels("PENDING_VERIFICATION")).toEqual(expect.arrayContaining(["Products", "Inventory", "Inbound", "Orders", "Wallet"]));
    expect(lockedLabels("ACTIVE")).toEqual([]);
  });

  it("never locks staff pages", () => {
    const staff = { ...partnerLead("ACTIVE"), partnerId: null, role: "SUPER_ADMIN" } as SessionUser;
    expect(visibleItems(ADMIN_CONSOLE, staff).some((item) => isLocked(item, staff))).toBe(false);
  });

  it("hides the switched-off shop and personal shopping pages", () => {
    expect(VENDOR_CONSOLE.items.find((item) => item.label === "Storefront")?.feature).toBe("marketplace");
    expect(visibleItems(VENDOR_CONSOLE, vendorOwner("ACTIVE")).map((item) => item.label)).not.toContain("Storefront");
  });
});
