import { expect, test } from "@playwright/test";

import { CAST, PASSWORD } from "./support/cast";
import { expectNoHorizontalScroll, resetCast, signIn, watchConsole } from "./support/session";

test.describe("signing in", () => {
  test("refuses a wrong password without saying which part was wrong", async ({ page }) => {
    resetCast(true);
    await page.goto("/login");
    await page.getByLabel("Email").fill(CAST.vendorOwner.email);
    await page.getByLabel("Password", { exact: true }).fill("not the right password");
    await page.getByRole("button", { name: /Sign in/ }).click();
    await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("asks staff for an authenticator code and refuses a wrong one", async ({ page }) => {
    resetCast(true);
    await page.goto("/login");
    await page.getByLabel("Email").fill(CAST.compliance.email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: /Sign in/ }).click();
    await page.getByLabel("Authenticator code").fill("000000");
    await page
      .getByRole("button", { name: /Continue|Verify|Sign in/ })
      .first()
      .click();
    await expect(page.getByText("That code didn't work. Sign in again to retry.")).toBeVisible();
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test("sends signed-out visitors back to sign in, and signing out ends the session", async ({ page }) => {
    const problems = watchConsole(page);
    await page.context().clearCookies();
    await page.goto("/admin/claims");
    await page.waitForURL(/\/login/);
    await signIn(page, CAST.partnerStaff);
    await page.getByRole("button", { name: /Sign out/ }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"));
    await page.goto("/admin/partnership/transfers");
    await page.waitForURL(/\/login/);
    expect(problems).toEqual([]);
  });

  test("works on a phone without sideways scrolling", async ({ browser }) => {
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await phone.newPage();
    await signIn(page, CAST.vendorOwner);
    for (const path of ["/overview", "/inventory", "/claims", "/orders"]) {
      await page.goto(path);
      await page.getByRole("heading", { level: 1 }).waitFor();
      await expectNoHorizontalScroll(page);
    }
    await phone.close();
  });
});
