import { writeFileSync } from "node:fs";

import { expect, type Page, test } from "@playwright/test";

import type { TransferView } from "@/shared";

import { API_URL, CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

const PHOTO = "e2e/results/seal-photo.png";

async function openClaim(page: Page, tab: string): Promise<void> {
  await page.goto("/admin/claims");
  await page.getByRole("button", { name: tab, exact: true }).click();
  await page.getByRole("button", { name: "Open", exact: true }).first().click();
}

test.describe.configure({ mode: "serial" });

test.describe("lost stock, from transfer to wallet credit", () => {
  let reference = "";
  let transfer: TransferView;
  let opsToken = "";

  test.beforeAll(() => {
    writeFileSync(PHOTO, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 7)]));
  });

  test("country ops asks the partner hub to send its stock to our warehouse", async ({ page, request }) => {
    const problems = watchConsole(page);
    opsToken = await signIn(page, CAST.countryOps);
    await page.getByRole("link", { name: "Transfers", exact: true }).click();
    await page.getByLabel("From").selectOption({ label: "Leeds test hub (HUB-E2E001) · partner hub" });
    await page.getByLabel("To").selectOption({ label: "Manchester test hub (E2E-MAN-1)" });
    await page.getByLabel("Why").fill("Bringing stock back to our warehouse for a stock check.");
    await page.getByRole("button", { name: "Request transfer" }).click();
    await expect(page.getByText("Transfer requested. The sending hub has been emailed.")).toBeVisible();
    const list = await request.get(`${API_URL}/v1/admin/transfers?status=REQUESTED`, { headers: { Authorization: `Bearer ${opsToken}` } });
    transfer = ((await list.json()) as TransferView[])[0]!;
    reference = transfer.reference;
    await expect(page.getByText(reference)).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("partner staff seal, photograph and send it", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.partnerStaff);
    await page.goto("/admin/partnership/transfers");
    const card = page.locator("li", { hasText: reference });
    await card.getByLabel("Carrier").fill("DPD");
    await card.getByLabel("Tracking number").fill("DPD-E2E-123");
    await card.getByRole("button", { name: "Mark as sent" }).isDisabled();
    await card.getByLabel("Seal number").fill("SEAL-E2E-1");
    await card.locator("input[type=file]").first().setInputFiles(PHOTO);
    await card.getByText("Uploaded").first().waitFor();
    await card.getByRole("button", { name: "Mark as sent" }).click();
    await expect(page.getByText("Sent. The receiving hub can now count it in.")).toBeVisible();
    await expect(card.getByText("On the way")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("our warehouse counts it in blind and finds one missing", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.operator);
    await page.getByRole("link", { name: "Hub transfers", exact: true }).click();
    const card = page.locator("li", { hasText: reference });
    await expect(card.getByText("Count it", { exact: true }).first()).toBeVisible();
    const inputs = card.locator("input[inputmode=numeric]");
    for (const [index, line] of transfer.lines.entries()) {
      await inputs.nth(index).fill(String((line.quantitySent ?? 0) - (index === 0 ? 1 : 0)));
    }
    await card.getByRole("button", { name: "Count it in" }).click();
    await expect(page.getByText("Counted in. The stock is now at your hub.")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("country ops decides the hub is responsible", async ({ page }) => {
    await signIn(page, CAST.countryOps);
    await openClaim(page, "New");
    await expect(page.getByText(`didn't arrive with transfer ${reference}`)).toBeVisible();
    await page.getByRole("radio", { name: /The hub/ }).click();
    await page.getByLabel("What you found").fill("The seal was intact but one unit was missing on arrival.");
    await page.getByRole("button", { name: "Save assessment" }).click();
    await expect(page.getByText("Assessment saved. It now needs a decision.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve and settle" })).toHaveCount(0);
  });

  test("the partner gives their side, once", async ({ page }) => {
    await signIn(page, CAST.partnerLead);
    await page.getByRole("link", { name: "Claims", exact: true }).click();
    await page.getByLabel("Your side").first().fill("We counted every unit on camera before sealing the box.");
    await page.getByRole("button", { name: "Send response" }).first().click();
    await expect(page.getByText("Thanks. Your response is with our team.")).toBeVisible();
    await expect(page.getByText("Trust score")).toBeVisible();
  });

  test("finance settles it and the vendor's wallet is credited", async ({ page }) => {
    await signIn(page, CAST.finance);
    await openClaim(page, "Awaiting decision");
    await page.getByLabel("Decision note").fill("Short on arrival with the seal intact. Credit the vendor.");
    await page.getByRole("button", { name: "Approve and settle" }).click();
    await expect(page.getByText("Settled. The vendor's wallet has been credited.")).toBeVisible();
    await expect(page.getByText(/credited to the vendor's wallet/)).toBeVisible();
  });

  test("the vendor sees the credit, and a team member can't report problems", async ({ page }) => {
    await signIn(page, CAST.vendorOwner);
    await page.getByRole("link", { name: "Claims", exact: true }).click();
    await expect(page.getByText("Settled").first()).toBeVisible();
    await expect(page.getByText("Grace").or(page.getByText("E2E Partner"))).toHaveCount(0);
    await signIn(page, CAST.vendorMember);
    await page.goto("/inventory");
    await page.getByRole("heading", { level: 1 }).waitFor();
    await expect(page.getByRole("button", { name: "Report", exact: true })).toHaveCount(0);
  });
});
