import { expect, test } from "@playwright/test";

import { CAST, type Member } from "./support/cast";
import { apiStatus, signIn, watchConsole } from "./support/session";

const ANY_ID = "00000000-0000-4000-8000-000000000000";
const DECIDE = { path: `/v1/admin/claims/${ANY_ID}/decision`, method: "POST" as const, body: { approve: true, note: "Should not be allowed" } };
const ASSESS = { path: `/v1/admin/claims/${ANY_ID}/assessment`, method: "POST" as const, body: { liability: "PLATFORM", amountMinor: 1, writeOff: false, note: "Should not be allowed" } };
const REPORT = { path: "/v1/vendor/claims", method: "POST" as const, body: { lotId: ANY_ID, kind: "DAMAGE", quantity: 1, description: "Should not be allowed to report this.", fileIds: [] } };

interface Probe {
  path: string;
  method?: "GET" | "POST";
  body?: object;
}

interface RoleCase {
  member: Member;
  console: string;
  sees: string[];
  hidden: string[];
  allowed: Probe[];
  denied: Probe[];
}

const get = (path: string): Probe => ({ path });

const CASES: RoleCase[] = [
  {
    member: CAST.superAdmin,
    console: "Platform console",
    sees: ["Partners", "Transfers", "Hub transfers", "Claims", "Custody alerts", "Staff", "Finance"],
    hidden: [],
    allowed: [get("/v1/admin/claims"), get("/v1/admin/transfers"), get("/v1/admin/custody-alerts")],
    denied: [get("/v1/vendor/claims"), get("/v1/partner/claims"), get("/v1/partner/trust")],
  },
  {
    member: CAST.admin,
    console: "Platform console",
    sees: ["Partners", "Claims", "Custody alerts"],
    hidden: ["Transfers", "Staff", "Finance"],
    allowed: [get("/v1/admin/claims")],
    denied: [get("/v1/admin/transfers"), ASSESS, DECIDE, get("/v1/admin/staff")],
  },
  {
    member: CAST.finance,
    console: "Platform console",
    sees: ["Claims", "Finance", "Prices"],
    hidden: ["Transfers", "Staff", "Verifications"],
    allowed: [get("/v1/admin/claims"), get("/v1/admin/custody-alerts")],
    denied: [get("/v1/admin/transfers"), ASSESS],
  },
  {
    member: CAST.compliance,
    console: "Platform console",
    sees: ["Claims", "Custody alerts", "Verifications"],
    hidden: ["Transfers", "Hub transfers"],
    allowed: [get("/v1/admin/claims")],
    denied: [DECIDE, get("/v1/admin/transfers")],
  },
  {
    member: CAST.countryOps,
    console: "Platform console",
    sees: ["Transfers", "Claims", "Custody alerts", "Partners"],
    hidden: ["Finance", "Staff", "Hub transfers"],
    allowed: [get("/v1/admin/transfers"), get("/v1/admin/claims")],
    denied: [DECIDE, get("/v1/admin/staff")],
  },
  {
    member: CAST.operator,
    console: "Platform console",
    sees: ["Receiving", "Orders", "Hub transfers"],
    hidden: ["Claims", "Transfers", "Partners", "Finance"],
    allowed: [get("/v1/warehouse/transfers")],
    denied: [get("/v1/admin/claims"), get("/v1/admin/transfers"), get("/v1/partner/transfers")],
  },
  {
    member: CAST.vendorOwner,
    console: "Vendor portal",
    sees: ["Inventory", "Orders", "Claims", "Wallet", "Integrations"],
    hidden: [],
    allowed: [get("/v1/vendor/claims"), get("/v1/vendor/hubs")],
    denied: [get("/v1/admin/claims"), get("/v1/partner/trust"), get("/v1/warehouse/transfers")],
  },
  {
    member: CAST.vendorMember,
    console: "Vendor portal",
    sees: ["Inventory", "Orders", "Claims"],
    hidden: ["Wallet", "Integrations"],
    allowed: [get("/v1/vendor/claims")],
    denied: [REPORT, get("/v1/admin/claims")],
  },
  {
    member: CAST.partnerLead,
    console: "Partner console",
    sees: ["Partnership", "Stock counts", "Transfers", "Earnings", "Claims", "Team"],
    hidden: [],
    allowed: [get("/v1/partner/trust"), get("/v1/partner/claims"), get("/v1/partner/transfers")],
    denied: [get("/v1/admin/claims"), get("/v1/vendor/hubs"), get("/v1/admin/transfers")],
  },
  {
    member: CAST.partnerStaff,
    console: "Partner console",
    sees: ["Partnership", "Stock counts", "Transfers"],
    hidden: ["Earnings", "Claims", "Team"],
    allowed: [get("/v1/partner/transfers"), get("/v1/partner/trust")],
    denied: [get("/v1/partner/claims"), get("/v1/admin/claims")],
  },
];

test.describe("every role sees only its own console", () => {
  for (const role of CASES) {
    test(`${role.member.role}`, async ({ page, request }) => {
      const problems = watchConsole(page);
      const token = await signIn(page, role.member);
      const nav = page.getByRole("navigation", { name: role.console });
      for (const label of role.sees) {
        await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
      }
      for (const label of role.hidden) {
        await expect(nav.getByRole("link", { name: label, exact: true })).toHaveCount(0);
      }
      for (const probe of role.allowed) {
        expect(await apiStatus(request, token, probe.path, probe.method, probe.body), probe.path).toBe(200);
      }
      for (const probe of role.denied) {
        expect([403, 404], `${probe.method ?? "GET"} ${probe.path}`).toContain(await apiStatus(request, token, probe.path, probe.method, probe.body));
      }
      await page.screenshot({ path: `e2e/results/role-${role.member.handle}.png`, fullPage: true });
      expect(problems).toEqual([]);
    });
  }

  test("nothing answers without signing in", async ({ request }) => {
    for (const path of ["/v1/admin/claims", "/v1/vendor/claims", "/v1/partner/trust", "/v1/warehouse/transfers"]) {
      expect(await apiStatus(request, null, path), path).toBe(401);
    }
  });
});
