import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { API_DIR, API_URL, CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

const PHOTO = "e2e/results/return-photo.png";
const RECIPIENT = { name: "Ada Obi", line1: "1 High Street", city: "Leeds", postalCode: "LS1 4AP", countryCode: "GB" };

test.describe.configure({ mode: "serial" });

test.describe("a customer return, from the order to back on sale", () => {
  let order = { id: "", reference: "", warehouseName: "" };
  let rma = "";

  test.beforeAll(() => {
    writeFileSync(PHOTO, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 7)]));
  });

  test("the vendor opens a return from a sent order", async ({ page, request }) => {
    const problems = watchConsole(page);
    const token = await signIn(page, CAST.vendorOwner);
    const headers = { Authorization: `Bearer ${token}` };
    const products = (await (await request.get(`${API_URL}/v1/vendor/products?status=ACTIVE`, { headers })).json()) as Array<{ id: string; code: string }>;
    const wig = products.find((product) => product.code === "E2E-WIG")!;
    const placed = await request.post(`${API_URL}/v1/vendor/orders`, { headers, data: { deliveries: [{ recipient: RECIPIENT, lines: [{ productId: wig.id, quantity: 1 }] }] } });
    expect(placed.status()).toBe(201);
    order = ((await placed.json()) as Array<typeof order>)[0]!;
    execFileSync("npm", ["run", "-s", "seed:e2e:hand-off", "--", order.reference], { cwd: resolve(API_DIR), stdio: "pipe" });
    await page.goto(`/orders/${order.id}`);
    await page.getByRole("link", { name: "Start a return" }).click();
    await page.getByLabel("Test lace wig: how many").fill("1");
    await page.getByLabel("Why is it coming back?").fill("Customer ordered the wrong length.");
    await page.getByRole("button", { name: "Open the return" }).click();
    await expect(page.getByText("Return opened")).toBeVisible();
    await expect(page.getByText("Send it to", { exact: true }).first()).toBeVisible();
    rma = (await page
      .getByText(/^RMA-GB-/)
      .first()
      .textContent())!.trim();
    expect(problems).toEqual([]);
  });

  test("the hub counts it blind and photographs it", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, order.warehouseName.includes("hub") ? CAST.partnerStaff : CAST.operator);
    await page.goto("/admin/returns");
    const card = page.locator("li", { hasText: rma });
    await expect(card.getByRole("columnheader", { name: "Expected" })).toHaveCount(0);
    await card.getByLabel("Test lace wig counted").fill("1");
    await card.locator("input[type=file]").first().setInputFiles(PHOTO);
    await card.getByRole("button", { name: "Record what arrived" }).click();
    await expect(page.getByText("Return received. The vendor has been asked what to do")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("the vendor puts it back on sale and the hub finishes", async ({ page }) => {
    await signIn(page, CAST.vendorOwner);
    await page.getByRole("link", { name: "Returns", exact: true }).click();
    const card = page.locator("li", { hasText: rma });
    await expect(card.getByText("Arrived, needs your say")).toBeVisible();
    await card.getByRole("button", { name: "Send instructions" }).click();
    await expect(page.getByText("Instructions sent to the warehouse")).toBeVisible();
    await signIn(page, order.warehouseName.includes("hub") ? CAST.partnerStaff : CAST.operator);
    await page.goto("/admin/returns");
    await page.getByRole("button", { name: "Ready to finish" }).click();
    await page.locator("li", { hasText: rma }).getByRole("button", { name: "Done, finish the return" }).click();
    await expect(page.getByText("Return finished")).toBeVisible();
    await signIn(page, CAST.vendorOwner);
    await page.goto("/returns");
    await page.getByRole("button", { name: "Finished" }).click();
    await expect(page.locator("li", { hasText: rma }).getByText("Done")).toBeVisible();
    await page.getByRole("button", { name: /^Activity/ }).click();
    await page
      .getByRole("dialog", { name: "Recent activity" })
      .getByRole("button", { name: new RegExp(`Return ${rma} is done`) })
      .click();
    await page.waitForURL("**/returns");
  });

  test("the vendor downloads their stock and orders as spreadsheets", async ({ page }) => {
    await signIn(page, CAST.vendorOwner);
    await page.goto("/inventory");
    const stock = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download CSV" }).click();
    expect((await stock).suggestedFilename()).toMatch(/^inventory-([a-z]{2}-)?\d{4}-\d{2}-\d{2}\.csv$/);
    await page.goto("/orders");
    await page.getByRole("button", { name: "Download CSV" }).click();
    const orders = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download CSV" }).click();
    const file = await orders;
    expect(file.suggestedFilename()).toMatch(/^orders-.*\.csv$/);
    expect(readFileSync((await file.path())!, "utf8")).toContain(order.reference);
  });
});
