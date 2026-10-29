import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

test("a seller picks fast delivery for an order", async ({ page }) => {
  const problems = watchConsole(page);
  await signIn(page, CAST.vendorOwner);
  await page.goto("/orders/new");
  const discard = page.getByRole("button", { name: "Discard draft" });
  await discard
    .waitFor({ timeout: 4_000 })
    .then(() => discard.click())
    .catch(() => undefined);
  const estimate = page.getByRole("region", { name: "Estimated delivery" });
  await expect(estimate.getByText("Add the address and products to see delivery prices.")).toBeVisible();
  await page.getByLabel("Recipient name").fill("Ada Obi");
  await page.getByLabel("Address", { exact: true }).fill("1 High Street");
  await page.getByLabel("Town or city").fill("Manchester");
  await page.getByLabel("Postcode").fill("M1 1AA");
  await page.getByLabel("Product 1").selectOption({ index: 1 });
  await expect(estimate.getByText("Your choice")).toBeVisible();
  await expect(estimate.getByText(/£\d+\.\d{2}/).first()).toBeVisible();
  await expect(estimate.getByText(/The final price is set when the hub weighs the packed parcel/)).toBeVisible();
  const fastest = page.getByRole("button", { name: /Fastest/ });
  await expect(page.getByRole("button", { name: /Cheapest/ })).toHaveAttribute("aria-pressed", "true");
  await fastest.click();
  await expect(fastest).toHaveAttribute("aria-pressed", "true");
  await expect(estimate.getByText(/sent fastest/)).toBeVisible();
  await discard.click();
  expect(problems).toEqual([]);
});

test("a partner sees what is at their hub on the partnership page", async ({ page }) => {
  const problems = watchConsole(page);
  await signIn(page, CAST.partnerLead);
  await page.goto("/admin/partnership");
  const hub = page.getByRole("region", { name: "At your hub" });
  await expect(hub.getByText("Units stored")).toBeVisible();
  await expect(hub.getByText("Waiting to be put away")).toBeVisible();
  await expect(hub.getByText("Orders to pack")).toBeVisible();
  await hub.getByText("Units stored").click();
  await page.waitForURL(/\/admin\/stock/);
  expect(problems).toEqual([]);
});
