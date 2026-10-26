import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { apiStatus, buyerLinkToken, deliverStoreOrder, expectNoHorizontalScroll, resetCast, signIn, watchConsole } from "./support/session";

const SLUG = "e2e-shop";
const PRODUCT = "Test lace wig";
const BUYER = "buyer@e2e.gfn.local";
const CODE = `E2E${Date.now().toString(36).slice(-5).toUpperCase()}`;
const QUOTE = {
  items: [{ productId: "00000000-0000-4000-8000-000000000000", quantity: 1 }],
  shipTo: { name: "Ada Buyer", line1: "1 High Street", city: "Leeds", postalCode: "LS1 4AP", countryCode: "GB" },
};

test.describe.configure({ mode: "serial" });

test.describe("a vendor store, from opening to a paid order", () => {
  let reference = "";

  test.beforeAll(() => resetCast());

  test("a closed store is not found and checkout refuses it", async ({ page, request }) => {
    await page.goto(`/store/${SLUG}`);
    await expect(page.getByText("This store isn't open")).toBeVisible();
    expect(await apiStatus(request, null, `/v1/public/stores/${SLUG}`)).toBe(404);
    expect(await apiStatus(request, null, `/v1/public/stores/${SLUG}/quote`, "POST", QUOTE)).toBe(404);
  });

  test("the vendor names the store, lists a product, connects a bank and opens", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.vendorOwner);
    await page.getByRole("link", { name: "Storefront", exact: true }).click();
    await expect(page.getByRole("button", { name: "Open my store →" })).toBeDisabled();
    await page.getByLabel("Store name").fill("E2E Hair Studio");
    await page.getByLabel("Store address").fill(SLUG);
    await page.getByLabel("About your store").fill("Hand-finished wigs, packed the day you order.");
    await page.getByRole("button", { name: "Save store details" }).click();
    await expect(page.getByText("Store details saved")).toBeVisible();
    const row = page.getByRole("row", { name: new RegExp(PRODUCT) });
    await row.getByLabel(`Price for ${PRODUCT}`).fill("40.00");
    await row.getByRole("button", { name: "List" }).click();
    await expect(page.getByText(`${PRODUCT} is in your store`)).toBeVisible();
    await page.getByRole("button", { name: "Connect bank account" }).click();
    await expect(page.getByText("Practice Bank ••••4242")).toBeVisible();
    await page.getByRole("button", { name: "Open my store →" }).click();
    await expect(page.getByRole("link", { name: "View store" })).toBeVisible();
    await page.getByLabel("Code", { exact: true }).fill(CODE);
    await page.getByLabel("Percent off").fill("10");
    await page.getByRole("button", { name: "Create code" }).click();
    await expect(page.getByText(`${CODE} is ready to share`)).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("a buyer adds to the basket, checks out and pays", async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto(`/store/${SLUG}`);
    await expect(page.getByRole("heading", { name: "E2E Hair Studio" })).toBeVisible();
    await expect(page.getByText("Prices include VAT")).toBeVisible();
    await page.getByRole("button", { name: "Add to basket" }).first().click();
    await page.getByRole("button", { name: "Add to basket" }).first().click();
    await expect(page.getByText("2 items")).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.getByRole("link", { name: "Check out →" }).click();
    await page.getByRole("button", { name: "One fewer" }).click();
    await page.getByLabel("Full name").fill("Ada Buyer");
    await page.getByLabel("Address", { exact: true }).fill("1 High Street");
    await page.getByLabel("Town or city").fill("Leeds");
    await page.getByLabel("Postcode").fill("LS1 4AP");
    await page.getByLabel("Email").fill(BUYER);
    await page.getByLabel("Discount code (optional)").fill(CODE.toLowerCase());
    await page.getByRole("button", { name: "See delivery and total" }).click();
    await expect(page.getByText("VAT included")).toBeVisible();
    await expect(page.getByText("−£4.00")).toBeVisible();
    await page.locator("label", { hasText: "Express" }).click();
    await page.getByRole("button", { name: /^Pay / }).click();
    await page.waitForURL(/\/checkout\/sandbox/);
    await expect(page.getByRole("heading", { name: "Practice payment" })).toBeVisible();
    reference = new URL(page.url()).searchParams.get("order") ?? "";
    await page.getByRole("button", { name: /^Pay / }).click();
    await page.waitForURL(/\/checkout\/complete/);
    await expect(page.getByRole("heading", { name: "Thank you, it's paid" })).toBeVisible();
    await expect(page.getByText(`1 × ${PRODUCT}`)).toBeVisible();
    await page.goto(`/store/${SLUG}`);
    await expect(page.getByRole("link", { name: /Basket\s*0/ })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("the vendor sees the order and their share without the buyer's email", async ({ page }) => {
    await signIn(page, CAST.vendorOwner);
    await page.goto("/storefront");
    const row = page.getByRole("row", { name: new RegExp(reference) });
    await expect(row).toContainText("Ada Buyer, Leeds");
    await expect(row).toContainText("Held until returns close");
    await expect(page.getByText(BUYER)).toHaveCount(0);
  });

  test("finance refunds part of the order; a vendor member can't reach staff orders", async ({ page, request }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.finance);
    await page.getByRole("link", { name: "Store orders", exact: true }).click();
    await page
      .getByRole("row", { name: new RegExp(reference) })
      .getByRole("button", { name: "Open" })
      .click();
    await expect(page.getByText(BUYER)).toBeVisible();
    await page.getByLabel("Amount").fill("5.00");
    await page.getByLabel("Reason").fill("Box arrived dented.");
    await page.getByRole("button", { name: /^Refund £5\.00/ }).click();
    await expect(page.getByText("Refund sent to the buyer's card")).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "£5.00" }).first()).toBeVisible();
    expect(problems).toEqual([]);
    const member = await signIn(page, CAST.vendorMember);
    expect(await apiStatus(request, member, "/v1/admin/storefront-orders")).toBe(404);
  });

  test("the buyer signs in from an emailed link and asks for a return", async ({ page }) => {
    const problems = watchConsole(page);
    deliverStoreOrder(reference);
    await page.goto("/account");
    await page.getByLabel("Email").fill(BUYER);
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(page.getByText("Check your inbox")).toBeVisible();
    await page.goto(`/account/sign-in#token=${buyerLinkToken(BUYER)}`);
    await page.waitForURL("/account");
    expect(page.url()).not.toContain("token");
    await expect(page.getByText(`Signed in as ${BUYER}.`)).toBeVisible();
    const card = page.locator("li", { hasText: reference });
    await card.getByRole("button", { name: "Return this order" }).click();
    await card.getByLabel("What went wrong?").fill("The lace is a shade darker than the photo.");
    await card.getByRole("button", { name: "Send return request" }).click();
    await expect(card.getByText("Waiting for the store")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("the vendor accepts the return with a partial refund and the buyer sees it", async ({ page }) => {
    await signIn(page, CAST.vendorOwner);
    await page.goto("/storefront");
    const request = page.locator("li", { hasText: `order ${reference}` });
    await request.getByLabel("Refund").fill("10.00");
    await request.getByLabel("Message to the buyer").fill("Sorry about the shade. Please keep it.");
    await request.getByRole("button", { name: /^Accept and refund £10\.00/ }).click();
    await expect(page.getByText("Return accepted and refunded")).toBeVisible();
    await page.context().clearCookies();
    await page.goto(`/account/sign-in#token=${buyerLinkToken(BUYER)}`);
    await page.waitForURL("/account");
    const card = page.locator("li", { hasText: reference });
    await expect(card.getByText("Store: Sorry about the shade. Please keep it.")).toBeVisible();
    await expect(card.getByText("Refunded", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("button", { name: "Email me a sign-in link" })).toBeVisible();
  });
});
