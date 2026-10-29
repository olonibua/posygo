import { expect, test } from "@playwright/test";

import { API_URL, CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

const RECIPIENT = { name: "Ada Obi", line1: "1 High Street", city: "Leeds", postalCode: "LS1 4AP", countryCode: "GB" };

test("the hub checks an item with no barcode by hand, with the camera on offer", async ({ page, browser, request }) => {
  const seller = await browser.newPage();
  const token = await signIn(seller, CAST.vendorOwner);
  const headers = { Authorization: `Bearer ${token}` };
  const products = (await (await request.get(`${API_URL}/v1/vendor/products?status=ACTIVE`, { headers })).json()) as Array<{ id: string; code: string }>;
  const wig = products.find((product) => product.code === "E2E-WIG")!;
  const placed = await request.post(`${API_URL}/v1/vendor/orders`, { headers, data: { deliveries: [{ recipient: RECIPIENT, lines: [{ productId: wig.id, quantity: 1 }] }] } });
  expect(placed.status()).toBe(201);
  const order = ((await placed.json()) as Array<{ id: string; warehouseName: string }>)[0]!;
  await seller.close();

  const problems = watchConsole(page);
  await signIn(page, order.warehouseName === "Manchester test warehouse" ? CAST.operator : CAST.partnerLead);
  await page.goto(`/admin/orders/${order.id}`);
  await page.getByRole("button", { name: "Scan with camera" }).click();
  const camera = page.getByRole("dialog", { name: "Scan with the camera" });
  await expect(camera).toBeVisible();
  await camera.getByRole("button", { name: "Close camera" }).click();
  await expect(camera).toHaveCount(0);

  const byHand = page.getByRole("region", { name: "No barcode on the product?" });
  await expect(byHand.getByText("Test lace wig")).toBeVisible();
  await byHand.getByRole("button", { name: "Confirm 1" }).click();
  await expect(page.getByText("Test lace wig: 1 of 1 — done")).toBeVisible();
  await expect(page.getByText("Everything is scanned. Record the parcel below.")).toBeVisible();
  await expect(page.getByText("Test lace wig checked by hand (1 of 1)")).toBeVisible();
  expect(problems.filter((problem) => !/camera|NotFoundError|NotAllowedError|getUserMedia/i.test(problem))).toEqual([]);

  const cancelled = await request.post(`${API_URL}/v1/vendor/orders/${order.id}/actions`, { headers, data: { action: "CANCEL", reason: "CUSTOMER_CANCELLED" } });
  expect([200, 409]).toContain(cancelled.status());
});
