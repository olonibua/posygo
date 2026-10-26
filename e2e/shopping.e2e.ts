import { writeFileSync } from "node:fs";

import { expect, type Page, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { apiStatus, buyerLinkToken, expectNoHorizontalScroll, resetCast, shoppingConfirmToken, signIn, watchConsole } from "./support/session";

const PHOTO = "e2e/results/shopping-photo.png";
const BUYER = `shopper-${Date.now().toString(36)}@e2e.gfn.local`;

async function signInBuyer(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto(`/account/sign-in#token=${buyerLinkToken(BUYER)}`);
  await page.waitForURL("/account");
  await page.getByRole("button", { name: "Shopping requests" }).click();
}

test.describe.configure({ mode: "serial" });

test.describe("personal shopping, from a link to a parcel on its way", () => {
  let reference = "";

  test.beforeAll(() => {
    resetCast(true);
    writeFileSync(PHOTO, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 7)]));
  });

  test("anyone can ask us to buy something, on any screen size", async ({ page }) => {
    const problems = watchConsole(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/shop-for-me");
    await expect(page.getByRole("heading", { name: "We'll buy it for you" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.getByLabel("Item 1 link").fill("http://shop.example/trainers");
    await page.getByLabel("Size, colour, model").fill("White trainers, size 6");
    await page.getByLabel("Full name").fill("Ada Obi");
    await page.getByLabel("Address", { exact: true }).fill("1 High Street");
    await page.getByLabel("Town or city").fill("Leeds");
    await page.getByLabel("Postcode").fill("LS1 4AP");
    await page.getByLabel("Email").fill(BUYER);
    await page.getByRole("button", { name: "Ask for a price" }).click();
    await expect(page.getByText("Use a secure link starting with https://")).toBeVisible();
    await page.getByLabel("Item 1 link").fill("https://shop.example/trainers");
    await page.getByRole("button", { name: "Ask for a price" }).click();
    const heading = page.getByRole("heading", { name: /^Check your email to confirm SHP-GB-/ });
    await expect(heading).toBeVisible();
    reference = /SHP-GB-[A-Z0-9]{8}/.exec((await heading.textContent())!)![0];
    await page.goto(`/shopping/confirm#token=${shoppingConfirmToken(reference)}`);
    await expect(page.getByRole("heading", { name: `Request ${reference} confirmed` })).toBeVisible();
    expect(page.url()).not.toContain("token");
    await page.reload();
    await expect(page.getByText("This link has expired or has already been used")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("country staff price it; people without the right role can't", async ({ page, request }) => {
    const problems = watchConsole(page);
    const vendor = await signIn(page, CAST.vendorOwner);
    expect(await apiStatus(request, vendor, "/v1/admin/shopping")).toBe(404);
    expect(await apiStatus(request, null, "/v1/admin/shopping")).toBe(401);
    await signIn(page, CAST.countryOps);
    await page.getByRole("link", { name: "Personal shopping", exact: true }).click();
    const card = page.locator("li", { hasText: reference });
    await card.getByLabel("Shop price for one").fill("45.00");
    await card.getByLabel("Weight of one (grams)").fill("900");
    await card.getByRole("button", { name: "Send the price" }).click();
    await expect(page.getByText("Price sent to the buyer")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("the buyer pays from their account", async ({ page }) => {
    const problems = watchConsole(page);
    await signInBuyer(page);
    const card = page.locator("li", { hasText: reference });
    await expect(card.getByText("Ready to pay")).toBeVisible();
    await expect(card.getByText("£6.75")).toBeVisible();
    await expect(card.getByText(/Delivering to Ada Obi, 1 High Street, Leeds, LS1 4AP, GB/)).toBeVisible();
    await card.getByRole("button", { name: /^Pay £/ }).click();
    await page.waitForURL(/\/shopping\/sandbox/);
    await page.getByRole("button", { name: /^Pay £/ }).click();
    await page.waitForURL(/\/account\?paid=/);
    await expect(page.locator("li", { hasText: reference }).getByText("Paid", { exact: true })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("staff buy it and the warehouse books it in and sends it", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.countryOps);
    await page.goto("/admin/shopping");
    await page.getByRole("button", { name: "To buy" }).click();
    const toBuy = page.locator("li", { hasText: reference });
    await toBuy.getByRole("button", { name: "Bought" }).click();
    await toBuy.getByLabel("Shop's order number (optional)").fill("SHOP-1001");
    await toBuy.getByRole("button", { name: "Record 1 item" }).click();
    await expect(page.getByText("Purchases recorded")).toBeVisible();
    await signIn(page, CAST.operator);
    await page.getByRole("link", { name: "Shopping parcels", exact: true }).click();
    const parcel = page.locator("li", { hasText: reference });
    await parcel.getByLabel("White trainers, size 6: how many arrived").fill("1");
    await parcel.locator("input[type=file]").first().setInputFiles(PHOTO);
    await parcel.getByRole("button", { name: "Book it in" }).click();
    await expect(page.getByText("Items booked in")).toBeVisible();
    await parcel.getByRole("button", { name: "Buy label and send" }).click();
    await expect(page.getByText("Label bought, parcel on its way")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("the buyer sees it's on its way", async ({ page }) => {
    await signInBuyer(page);
    const card = page.locator("li", { hasText: reference });
    await expect(card.getByText("On its way")).toBeVisible();
    await expect(card.getByRole("link", { name: /Track your parcel/ })).toBeVisible();
  });
});
