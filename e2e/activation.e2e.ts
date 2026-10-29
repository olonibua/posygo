import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { awaitActivation, resetCast, signIn, watchConsole } from "./support/session";

test.describe.configure({ mode: "serial" });
test.afterAll(() => resetCast());

test("a verified seller has to pay the activation fee before anything opens", async ({ page }) => {
  const problems = watchConsole(page);
  awaitActivation();
  await signIn(page, CAST.vendorOwner);

  const gate = page.getByRole("dialog", { name: "Activate your account" });
  await expect(gate).toBeVisible();
  await expect(gate.getByText("£10.00", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.click(10, 10);
  await expect(gate).toBeVisible();

  await page.goto("/products");
  await expect(gate).toBeVisible();

  await gate.getByRole("button", { name: /Pay £10\.00/ }).click();
  await page.waitForURL(/\/verification\/sandbox-checkout/);
  await expect(gate).toHaveCount(0);
  await page.getByRole("button", { name: "Complete test payment" }).click();

  await page.waitForURL(/\/verification\?activation=/);
  await expect(page.getByText("Thanks, your activation fee is paid")).toBeVisible();
  await expect(gate).toHaveCount(0);
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Your catalogue", level: 1 })).toBeVisible();
  await expect(gate).toHaveCount(0);
  expect(problems).toEqual([]);
});
