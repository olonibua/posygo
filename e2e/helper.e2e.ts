import { expect, type Page, test } from "@playwright/test";

import { knowledgeFor } from "@/features/assistant/knowledge/registry";
import { fieldFor } from "@/features/assistant/knowledge/types";

import { CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

const HELPER = /^Open Posy/;

function visibleFieldLabels(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const clean = (text: string | null | undefined) => text?.replace(/\s+/g, " ").trim() || null;
    const controls = [...document.querySelectorAll<HTMLElement>("input, select, textarea, fieldset button")].filter(
      (element) => !element.closest("[data-assistant], header, nav") && element.getAttribute("type") !== "hidden" && element.offsetParent !== null,
    );
    const labels = controls.map((element) => {
      if (element.matches("button")) {
        return clean(element.closest("fieldset")?.querySelector("legend")?.textContent);
      }
      const control = element as HTMLInputElement;
      return clean(control.labels?.[0]?.textContent) ?? clean(control.getAttribute("aria-label")) ?? clean(control.closest("fieldset")?.querySelector("legend")?.textContent);
    });
    return [...new Set(labels.filter((label): label is string => Boolean(label)))];
  });
}

async function expectEveryFieldExplained(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  const knowledge = knowledgeFor(new URL(page.url()).pathname);
  expect(knowledge, `knowledge for ${path}`).toBeDefined();
  const labels = await visibleFieldLabels(page);
  expect(labels.length, `fields found on ${path}`).toBeGreaterThan(0);
  const unexplained = labels.filter((label) => !fieldFor(knowledge!, label));
  expect(unexplained, `fields on ${path} the helper can't explain`).toEqual([]);
}

test.describe.configure({ mode: "serial" });

test.describe("the helper", () => {
  let reference = "";

  test("explains the page and the field someone is on, and won't guess", async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto("/signup");
    await page.getByLabel("Work email").focus();
    await page.getByRole("button", { name: HELPER }).click();
    const helper = page.getByRole("dialog", { name: /Posy/ });
    await expect(helper.getByText("Hi, I'm Posy")).toBeVisible();
    await helper.getByRole("button", { name: 'What\'s "Work email"?' }).click();
    await expect(helper.getByText("The email you'll sign in with")).toBeVisible();
    await helper.getByLabel("Message Posy").fill("what does where will your stock live mean?");
    await helper.getByLabel("Message Posy").press("Enter");
    await expect(helper.getByText("The country whose hub will store your stock")).toBeVisible();
    await helper.getByLabel("Message Posy").fill("do you deliver to the moon?");
    await helper.getByLabel("Message Posy").press("Enter");
    await expect(helper.getByText("I'd rather not guess")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(helper).toBeHidden();
    expect(problems).toEqual([]);
  });

  test("tells people when a failure is on our side, and reports it for them", async ({ page }) => {
    await page.route("**/v1/auth/login", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ statusCode: 500, code: "internal_error", message: "Something went wrong.", correlationId: "1b4e28ba-2fa1-41d2-883f-0016d3cca427" }),
      }),
    );
    await page.goto("/login");
    await page.getByLabel("Email").fill("helper-check@e2e.gfn.local");
    await page.getByLabel("Password", { exact: true }).fill("a long enough password");
    await page.getByRole("button", { name: /Sign in/ }).click();
    const nudge = page.getByRole("status").filter({ hasText: "not yours" });
    await expect(nudge).toBeVisible();
    reference = /CASE-[A-Z0-9]{8}/.exec((await nudge.textContent()) ?? "")?.[0] ?? "";
    expect(reference).not.toBe("");
    await nudge.getByRole("button", { name: "Yes, help me" }).click();
    await expect(page.getByRole("dialog", { name: /Posy/ }).getByText("This isn't something you did")).toBeVisible();
  });

  test("support staff see the case with the steps that led to it, and resolve it", async ({ page }) => {
    await signIn(page, CAST.admin);
    await page.goto("/admin/support");
    const card = page.locator("li").filter({ hasText: reference });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Show details" }).click();
    await expect(card.getByText("Went to Password").first()).toBeVisible();
    await expect(card.getByText(/1b4e28ba-2fa1-41d2-883f-0016d3cca427/).first()).toBeVisible();
    await card.getByLabel("What was done").fill("Sign-in is working again.");
    await card.getByRole("button", { name: "Mark as resolved" }).click();
    await expect(page.getByText(`${reference} resolved`)).toBeVisible();
  });

  test("can explain every field on the vendor forms it covers", async ({ page }) => {
    await expectEveryFieldExplained(page, "/signup");
    await signIn(page, CAST.vendorOwner);
    for (const path of ["/inbound/new", "/products/new", "/orders/new", "/wallet"]) {
      await expectEveryFieldExplained(page, path);
    }
  });
});
