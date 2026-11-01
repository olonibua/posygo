import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { resetCast, signIn, watchConsole } from "./support/session";

test.describe.configure({ mode: "serial" });
test.beforeAll(() => resetCast());
test.afterAll(() => resetCast());

test("a super admin edits a reminder, previews it and switches it on", async ({ page }) => {
  const problems = watchConsole(page);
  await signIn(page, CAST.superAdmin);
  await page.goto("/admin");
  await page.getByRole("link", { name: "Reminder emails" }).first().click();
  await expect(page.getByRole("heading", { name: "Reminder emails" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sellers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fulfilment partners" })).toBeVisible();

  await page.getByRole("link", { name: /Send a first shipment/ }).click();
  await expect(page.getByRole("heading", { name: "Send a first shipment" })).toBeVisible();
  const preview = page.getByRole("complementary", { name: "Preview" });
  await page.getByLabel("Subject").fill("{name}, your stock could be in the UK");
  await expect(preview.getByText("Ada's Atelier, your stock could be in the UK")).toBeVisible();
  await expect(preview.getByText("Send a shipment")).toBeVisible();

  await page.getByRole("button", { name: "Send me a test" }).click();
  await expect(page.getByText("Test sent")).toBeVisible();

  await page.getByLabel("Send this reminder automatically").check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("This reminder is on.")).toBeVisible();

  await page.getByRole("button", { name: "Use standard wording" }).click();
  await expect(page.getByText("Back to the standard wording")).toBeVisible();
  await expect(page.getByLabel("Subject")).toHaveValue("Ready to send your stock to the UK?");
  await page.getByLabel("Send this reminder automatically").uncheck();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("This reminder is off.")).toBeVisible();
  expect(problems).toEqual([]);
});

test("other staff don't see reminder emails", async ({ page }) => {
  await signIn(page, CAST.finance);
  await page.goto("/admin");
  await expect(page.getByRole("link", { name: "Reminder emails" })).toHaveCount(0);
});

test("a stop link that doesn't check out is refused politely", async ({ page }) => {
  await page.goto(`/reminders/stop?e=${Buffer.from("someone@example.com").toString("base64url")}&t=${"0".repeat(64)}`);
  await expect(page.getByRole("heading", { name: "We couldn't use that link" })).toBeVisible();
});
