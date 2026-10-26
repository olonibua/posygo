import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

test.describe.configure({ mode: "serial" });

test.describe("referrals", () => {
  let code = "";

  test("a vendor finds their code and the invite link fills it in on sign-up", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.vendorOwner);
    await page.getByRole("link", { name: "Refer a business", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Refer a business" })).toBeVisible();
    code = (await page.locator(".font-mono").first().textContent())!.trim();
    expect(code).toMatch(/^[A-Z0-9]+-[A-Z0-9]{4}$/);
    await page.context().clearCookies();
    await page.goto(`/signup?ref=${code}`);
    await expect(page.getByLabel("Referral code (optional)")).toHaveValue(code);
    expect(problems).toEqual([]);
  });

  test("finance starts a campaign code; a vendor code can't be reused for it", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.finance);
    await expect(page.getByText("Needs someone")).toBeVisible();
    await expect(page.getByText("Held in vendor wallets now")).toBeVisible();
    await page.getByRole("link", { name: "Referrals", exact: true }).click();
    const campaign = `E2E-${Date.now().toString(36).toUpperCase()}`;
    await page.getByLabel("Code", { exact: true }).fill(code);
    await page.getByLabel("Name", { exact: true }).fill("Duplicate check");
    await page.getByLabel(/Welcome credit/).fill("20");
    await page.getByRole("button", { name: "Create code" }).click();
    await expect(page.getByText("That code is already in use")).toBeVisible();
    await page.getByLabel("Code", { exact: true }).fill(campaign);
    await page.getByRole("button", { name: "Create code" }).click();
    await expect(page.getByText("Campaign code is live")).toBeVisible();
    await expect(page.getByRole("row", { name: new RegExp(campaign) })).toContainText("£20.00");
    expect(problems).toEqual([]);
  });
});
