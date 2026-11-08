import { expect, type Page, test } from "@playwright/test";

import { API_URL, CAST } from "./support/cast";
import { resetCast, signIn, watchConsole } from "./support/session";

const ORIGIN = { Origin: new URL(process.env.E2E_BASE_URL ?? "http://localhost:3000").origin };
const SPARE_SHOP = "Spare Test Shop";

async function accountPanel(page: Page) {
  const panel = page
    .locator("section, div")
    .filter({ has: page.getByText("Account", { exact: true }) })
    .filter({ has: page.getByLabel("Reason") })
    .last();
  await expect(panel).toBeVisible();
  return panel;
}

async function switchAccess(page: Page, from: "Deactivate" | "Reactivate", to: "Deactivate" | "Reactivate") {
  const panel = await accountPanel(page);
  await panel.getByLabel("Reason").fill("Checking account controls in the browser.");
  await panel.getByRole("button", { name: from, exact: true }).click();
  await expect(panel.getByRole("button", { name: to, exact: true })).toBeVisible();
}

test.describe("closing accounts", () => {
  test.beforeAll(() => resetCast());

  test("a super admin deactivates and reactivates a live vendor, and deletes a spare one", async ({ page, request }) => {
    const problems = watchConsole(page);
    await request.post(`${API_URL}/v1/auth/signup`, {
      headers: ORIGIN,
      data: { email: "spare@e2e.gfn.local", password: "a long enough password", businessName: SPARE_SHOP, countryCodes: ["GB"], acceptTerms: true },
    });
    const token = await signIn(page, CAST.superAdmin);
    const list = await request.get(`${API_URL}/v1/admin/vendors?q=e2e`, { headers: { ...ORIGIN, Authorization: `Bearer ${token}` } });
    const rows = ((await list.json()) as { items: Array<{ id: string; businessName: string; ownerEmail: string | null }> }).items;
    const live = rows.find((row) => row.ownerEmail === CAST.vendorOwner.email)!;

    await page.goto(`/admin/vendors/${live.id}`);
    const panel = await accountPanel(page);
    await expect(panel.getByText("Has activity on record, so it can only be deactivated.")).toBeVisible();
    await switchAccess(page, "Deactivate", "Reactivate");
    await expect(panel.getByText(/Deactivated on/)).toBeVisible();
    await page.screenshot({ path: "e2e/results/vendor-deactivated.png", fullPage: true });
    await switchAccess(page, "Reactivate", "Deactivate");

    const spare = await request.get(`${API_URL}/v1/admin/vendors?q=spare`, { headers: { ...ORIGIN, Authorization: `Bearer ${token}` } });
    const spareId = ((await spare.json()) as { items: Array<{ id: string }> }).items[0]!.id;
    await page.goto(`/admin/vendors/${spareId}`);
    const sparePanel = await accountPanel(page);
    await sparePanel.getByLabel("Reason").fill("Spare signup made while testing.");
    await sparePanel.getByRole("button", { name: "Delete", exact: true }).click();
    const confirm = sparePanel.getByRole("button", { name: "Delete for good" });
    await expect(confirm).toBeDisabled();
    await sparePanel.getByLabel(`Type ${SPARE_SHOP} to confirm`).fill(SPARE_SHOP);
    await page.screenshot({ path: "e2e/results/vendor-delete-confirm.png", fullPage: true });
    await confirm.click();
    await page.waitForURL((url) => url.pathname === "/admin/vendors");
    await expect(page.getByText(SPARE_SHOP)).toHaveCount(0);
    expect(problems).toEqual([]);
  });

  test("a super admin pauses and resumes a partner from the partner page", async ({ page, request }) => {
    const token = await signIn(page, CAST.superAdmin);
    const partners = await request.get(`${API_URL}/v1/admin/partners`, { headers: { ...ORIGIN, Authorization: `Bearer ${token}` } });
    const partner = ((await partners.json()) as Array<{ id: string; status: string }>).find((row) => row.status === "ACTIVE")!;
    await page.goto(`/admin/partners/${partner.id}`);
    await switchAccess(page, "Deactivate", "Reactivate");
    await page.screenshot({ path: "e2e/results/partner-deactivated.png", fullPage: true });
    await switchAccess(page, "Reactivate", "Deactivate");
  });

  test("other staff don't see the account controls", async ({ page, request }) => {
    const token = await signIn(page, CAST.countryOps);
    const list = await request.get(`${API_URL}/v1/admin/vendors`, { headers: { ...ORIGIN, Authorization: `Bearer ${token}` } });
    const vendor = ((await list.json()) as { items: Array<{ id: string; businessName: string }> }).items[0]!;
    await page.goto(`/admin/vendors/${vendor.id}`);
    await expect(page.getByRole("heading", { name: vendor.businessName })).toBeVisible();
    await expect(page.getByRole("button", { name: "Deactivate" })).toHaveCount(0);
  });
});
