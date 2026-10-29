import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { resetCast, signIn, watchConsole } from "./support/session";

test.describe.configure({ mode: "serial" });
test.afterAll(() => resetCast());

test("a super admin changes a staff member's role", async ({ page }) => {
  const problems = watchConsole(page);
  await signIn(page, CAST.superAdmin);
  await page.goto("/admin/staff");
  const row = page.getByRole("row").filter({ hasText: CAST.admin.email });
  await expect(row.getByText("Administrator")).toBeVisible();

  await row.getByRole("button", { name: "Change role" }).click();
  await page.getByLabel("Role").first().selectOption("COMPLIANCE");
  await page.getByRole("button", { name: "Save role" }).click();
  await expect(page.getByText("Role changed")).toBeVisible();
  await expect(row.getByText("Compliance")).toBeVisible();

  await row.getByRole("button", { name: "Change role" }).click();
  await page.getByLabel("Role").first().selectOption("COMPLIANCE");
  await page.getByRole("button", { name: "Save role" }).click();
  await expect(page.getByText("They already have this role.")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  const superRow = page.getByRole("row").filter({ hasText: CAST.superAdmin.email });
  await expect(superRow.getByRole("button", { name: "Change role" })).toHaveCount(0);
  expect(problems).toEqual([]);
});
