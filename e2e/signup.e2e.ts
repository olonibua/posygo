import { expect, test } from "@playwright/test";

test("sign-up lets a seller pick storage countries from a drop-down", async ({ page }) => {
  await page.goto("/signup");
  const picker = page.getByLabel("Choose a country");
  await expect(picker.locator("option")).toHaveCount(11);
  await picker.selectOption("GB");
  await page.getByLabel("Add another country").selectOption("DE");
  await page.getByLabel("Add another country").selectOption("AU");
  const chosen = page.getByRole("group", { name: "Where do you want to store stock?" }).getByRole("listitem");
  await expect(chosen.filter({ hasText: "United Kingdom" })).toContainText("Home");
  await expect(chosen.filter({ hasText: "Germany" })).toContainText("EUR");
  await page.getByRole("button", { name: "Remove Germany" }).click();
  await expect(chosen).toHaveCount(2);
  await expect(page.getByLabel("Add another country").locator("option", { hasText: "Germany" })).toHaveCount(1);
});
