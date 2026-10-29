import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

test("a seller sees each tip once, when they reach it, and can open it again", async ({ page }) => {
  const problems = watchConsole(page);
  await signIn(page, CAST.vendorOwner, { hints: true });

  const start = page.getByRole("dialog", { name: "Start here" });
  await expect(start).toBeVisible();
  await start.getByRole("button", { name: "Got it" }).click();
  await expect(start).toHaveCount(0);

  await page.goto("/inbound/new");
  const hub = page.getByRole("dialog", { name: "What's a hub?" });
  await expect(hub).toBeVisible();
  await expect(page.getByRole("radio", { name: /Leeds/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Manchester/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(hub).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("radio", { name: /Leeds/ })).toBeVisible();
  await expect(hub).toHaveCount(0);
  await page.getByRole("button", { name: "What's a hub?" }).click();
  await expect(hub).toBeVisible();

  await page.goto("/overview");
  await expect(start).toHaveCount(0);
  expect(problems).toEqual([]);
});
