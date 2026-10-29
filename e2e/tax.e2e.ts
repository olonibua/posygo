import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { resetCast, signIn, watchConsole } from "./support/session";

test.describe.configure({ mode: "serial" });
test.beforeAll(() => resetCast());
test.afterAll(() => resetCast());

function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

test("finance adds a filing, sees it coming up and marks it as filed", async ({ page }) => {
  const problems = watchConsole(page);
  const title = `Browser check ${Date.now()}`;
  await signIn(page, CAST.finance);
  await page.goto("/admin");
  await page.getByRole("link", { name: "Tax & compliance" }).first().click();
  await expect(page.getByRole("heading", { name: "Tax & compliance" })).toBeVisible();
  await expect(page.getByRole("meter", { name: "UK VAT registration" })).toBeVisible();

  await page.getByRole("link", { name: /United Kingdom/ }).click();
  await expect(page.getByRole("heading", { name: "United Kingdom" })).toBeVisible();
  await page.getByRole("button", { name: /Add (an obligation|your own)/ }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Authority").fill("HMRC");
  await page.getByLabel("What it is").fill("A filing added by the browser check.");
  await page.getByLabel("How often").selectOption("QUARTERLY");
  await page.getByLabel("When it's due").fill("1 month after each quarter");
  await page.getByLabel("First due date").fill(inDays(3));
  await page.getByRole("button", { name: "Add obligation" }).click();
  await expect(page.getByText("Obligation added")).toBeVisible();

  const card = page.getByRole("article", { name: title });
  await expect(card.getByText("Due in 3 days")).toBeVisible();
  await expect(card.getByText("To check")).toBeVisible();

  await page.goto("/admin/tax");
  await expect(page.getByRole("link", { name: new RegExp(title) }).first()).toBeVisible();

  await page.goBack();
  await card.getByRole("button", { name: "Mark filed" }).click();
  await card.getByLabel("Reference").fill("REF-123");
  await card.getByRole("button", { name: "Mark as filed" }).click();
  await expect(page.getByText("The next deadline has been added.")).toBeVisible();
  await expect(card.getByText(/REF-123/)).toBeVisible();
  await card.getByRole("button", { name: "Mark as checked" }).click();
  await expect(card.getByText("Checked", { exact: true })).toBeVisible();
  expect(problems).toEqual([]);
});

test("only finance and super admins see tax", async ({ page }) => {
  await signIn(page, CAST.admin);
  await page.goto("/admin");
  await expect(page.getByRole("link", { name: "Tax & compliance" })).toHaveCount(0);
});
