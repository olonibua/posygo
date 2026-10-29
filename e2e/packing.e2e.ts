import { writeFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { API_URL, CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

const PHOTO = "e2e/results/parcel-photo.png";
const RECIPIENT = { name: "Ada Obi", line1: "1 High Street", city: "Leeds", postalCode: "LS1 4AP", countryCode: "GB" };

test.beforeAll(() => {
  writeFileSync(PHOTO, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 7)]));
});

test("the hub checks, packs, ships and tracks an order step by step", async ({ page, browser, request }) => {
  const seller = await browser.newPage();
  const token = await signIn(seller, CAST.vendorOwner);
  const headers = { Authorization: `Bearer ${token}` };
  const products = (await (await request.get(`${API_URL}/v1/vendor/products?status=ACTIVE`, { headers })).json()) as Array<{ id: string; code: string }>;
  const wig = products.find((product) => product.code === "E2E-WIG")!;
  const placed = await request.post(`${API_URL}/v1/vendor/orders`, { headers, data: { deliveries: [{ recipient: RECIPIENT, lines: [{ productId: wig.id, quantity: 1 }] }] } });
  expect(placed.status()).toBe(201);
  const order = ((await placed.json()) as Array<{ id: string; reference: string; warehouseName: string }>)[0]!;
  await seller.close();

  const problems = watchConsole(page);
  await signIn(page, order.warehouseName === "Manchester test warehouse" ? CAST.operator : CAST.partnerLead);
  await page.goto(`/admin/orders/${order.id}`);
  const progress = page.getByRole("list", { name: "Progress" });
  await expect(progress.locator("[aria-current=step]")).toHaveText("Check items");

  await page.getByRole("button", { name: "Scan with camera" }).click();
  const camera = page.getByRole("dialog", { name: "Scan with the camera" });
  await camera.getByRole("button", { name: "Close camera" }).click();
  await expect(camera).toHaveCount(0);

  const codeBox = page.getByLabel("Barcode or lot label");
  const byHand = page.getByRole("region", { name: "No barcode on the product?" });
  const lotCode = byHand.getByRole("button").first();
  const lot = (await lotCode.textContent())!.trim();
  await lotCode.click();
  await expect(codeBox).toHaveValue(lot);
  await expect(page.getByText("Test lace wig: 1 of 1")).toHaveCount(0);
  await page.getByRole("button", { name: "Add code" }).click();
  await expect(page.getByText("Test lace wig: 1 of 1 — done")).toBeVisible();
  await expect(progress.locator("[aria-current=step]")).toHaveText("Pack");

  await page.getByRole("button", { name: /^Small bag/ }).click();
  await page.getByLabel("Weight on the scale (g)").fill("250");
  await expect(page.getByText(/Courier prices will be for 35 × 25 × 3 cm/)).toBeVisible();
  await page.getByRole("button", { name: "Save and get courier prices" }).click();
  await expect(page.getByText(/Prices for a 35 × 25 × 3 cm parcel weighing 250 g/)).toBeVisible();
  await expect(progress.locator("[aria-current=step]")).toHaveText("Shipping");
  await page.getByRole("button", { name: /buy the label/i }).click();
  await expect(progress.locator("[aria-current=step]")).toHaveText("Hand over");

  await page.locator("input[type=file]").first().setInputFiles(PHOTO);
  const handOver = page.getByRole("button", { name: "Handed to the courier" });
  await expect(handOver).toBeEnabled({ timeout: 15_000 });
  await handOver.click();
  await expect(page.getByText("Handed to the courier", { exact: true }).first()).toBeVisible();
  await expect(progress.locator("[aria-current=step]")).toHaveText("On its way");

  await page.getByRole("button", { name: "Mark delivered" }).click();
  await expect(page.getByText("Delivered to the recipient").first()).toBeVisible();

  await page.goto("/admin/orders");
  await page.getByRole("button", { name: "Finished" }).click();
  await expect(page.getByRole("row").filter({ hasText: order.reference })).toBeVisible();
  expect(problems.filter((problem) => !/camera|NotFoundError|NotAllowedError|getUserMedia/i.test(problem))).toEqual([]);
});
