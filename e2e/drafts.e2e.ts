import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

test.describe("drafts", () => {
  test("a half-filled product comes back after leaving the page, and can be discarded", async ({ page }) => {
    const problems = watchConsole(page);
    await signIn(page, CAST.vendorOwner);
    await page.goto("/products/new");
    await page.getByLabel("Product name").fill("Draft linen shirt");
    await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toBeVisible();

    await page.goto("/overview");
    await page.goto("/products/new");
    await expect(page.getByRole("status").filter({ hasText: "Picked up your draft from" })).toBeVisible();
    await expect(page.getByLabel("Product name")).toHaveValue("Draft linen shirt");

    await page.getByRole("button", { name: "Discard draft" }).click();
    await expect(page.getByLabel("Product name")).toHaveValue("");
    await page.reload();
    await expect(page.getByLabel("Product name")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Discard draft" })).toHaveCount(0);
    expect(problems).toEqual([]);
  });

  test("a partner application is kept on this device until it's sent", async ({ page }) => {
    await page.goto("/partners");
    await page.getByLabel("Full name").fill("Ada Draft");
    await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue("Ada Draft");
  });
});
