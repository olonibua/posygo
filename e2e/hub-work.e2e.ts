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
  const delivery = page.getByRole("region", { name: "Delivery" });
  await expect(delivery.getByText("Add the address and products to see the services and prices.")).toBeVisible();
  await page.getByLabel("Recipient name").fill("Ada Obi");
  await page.getByLabel("Address", { exact: true }).fill("1 High Street");
  await page.getByLabel("Town or city").fill("Manchester");
  await page.getByLabel("Postcode").fill("M1 1AA");
  await page.getByLabel("Product 1").selectOption({ index: 1 });
  const chosen = delivery.getByRole("button", { pressed: true });
  await expect(chosen.getByText("Your choice")).toBeVisible();
  await expect(chosen.getByText("Cheapest", { exact: true })).toBeVisible();
  await expect(delivery.getByText(/The final price is set when the hub weighs the packed parcel/)).toBeVisible();

  const picker = delivery.getByRole("combobox", { name: "Delivery" });
  await picker.selectOption("FASTEST");
  await expect(chosen.getByText("Fastest", { exact: true })).toBeVisible();

  const services = picker.locator('optgroup[label="Choose a service"] option');
  const service = (await services.last().getAttribute("value"))!;
  await picker.selectOption(service);
  await expect(delivery.getByText(/The hub books this service/)).toBeVisible();
  await expect(delivery.getByRole("button", { pressed: true })).toHaveCount(1);

  await delivery.getByRole("button", { pressed: false }).first().click();
  await expect(picker).not.toHaveValue(service);
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
