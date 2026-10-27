import { expect, type Page, test } from "@playwright/test";

import { knowledgeFor } from "@/features/assistant/knowledge/registry";
import { fieldFor } from "@/features/assistant/knowledge/types";

import { CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

const HELPER = /^Open Posy/;
const PUBLIC_PAGES = ["/signup", "/login", "/forgot-password", "/shop-for-me", "/track", "/partners"];
const SELLER_PAGES = [
  "/overview",
  "/inbound",
  "/inbound/new",
  "/inventory",
  "/orders",
  "/orders/new",
  "/orders/import",
  "/products",
  "/products/new",
  "/products/labels",
  "/returns",
  "/returns/new",
  "/claims",
  "/settings/integrations",
  "/settings/markets",
  "/settings/referrals",
  "/settings/security",
  "/settings/team",
  "/storefront",
  "/wallet",
];
const CONSOLE_PAGES = [
  "/admin/claims",
  "/admin/countries",
  "/admin/custody-alerts",
  "/admin/fees",
  "/admin/finance",
  "/admin/finance/adjustments",
  "/admin/finance/reconciliation",
  "/admin/hub-transfers",
  "/admin/legal",
  "/admin/orders",
  "/admin/packaging",
  "/admin/partners",
  "/admin/partners/mystery-orders",
  "/admin/partners/payouts",
  "/admin/partners/stock-counts",
  "/admin/receiving",
  "/admin/referrals",
  "/admin/returns",
  "/admin/security",
  "/admin/shopping",
  "/admin/shopping-desk",
  "/admin/staff",
  "/admin/stock",
  "/admin/storefront-orders",
  "/admin/storefront-returns",
  "/admin/support",
  "/admin/transfers",
  "/admin/verifications",
  "/admin/warehouses",
];
const PARTNER_PAGES = ["/admin", "/admin/partnership/claims", "/admin/partnership/earnings", "/admin/partnership/stock-counts", "/admin/partnership/team", "/admin/partnership/transfers"];

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

async function unexplainedFields(page: Page, paths: readonly string[]): Promise<Record<string, string[]>> {
  const gaps: Record<string, string[]> = {};
  for (const path of paths) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const knowledge = knowledgeFor(new URL(page.url()).pathname);
    const missing = knowledge ? (await visibleFieldLabels(page)).filter((label) => !fieldFor(knowledge, label)) : ["(no notes for this page)"];
    if (missing.length > 0) {
      gaps[path] = missing;
    }
  }
  return gaps;
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

  test("answers open questions in its own words when answers are switched on, and still offers a person", async ({ page }) => {
    let asked: { page?: string; question?: string } = {};
    await page.route("**/v1/public/assistant/status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ answers: true }) }));
    await page.route("**/v1/public/assistant/answers", async (route) => {
      asked = route.request().postDataJSON() as typeof asked;
      const unsure = asked.question?.includes("moon");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(unsure ? { answer: null, handoff: true } : { answer: "Storage is charged per box, each month.", handoff: false }),
      });
    });
    await page.goto("/signup");
    await page.getByRole("button", { name: HELPER }).click();
    const helper = page.getByRole("dialog", { name: /Posy/ });
    await helper.getByLabel("Message Posy").fill("how is storage charged?");
    await helper.getByLabel("Message Posy").press("Enter");
    await expect(helper.getByText("Storage is charged per box, each month.")).toBeVisible();
    await expect(helper.getByRole("button", { name: "Still need a person?" })).toBeVisible();
    expect(asked).toMatchObject({ page: "/signup", question: "how is storage charged?" });
    await helper.getByLabel("Message Posy").fill("do you deliver to the moon?");
    await helper.getByLabel("Message Posy").press("Enter");
    await expect(helper.getByText("I'd rather not guess")).toBeVisible();
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

  test("walks a seller through a form, and fixes a format mistake only when they say yes", async ({ page }) => {
    await signIn(page, CAST.vendorOwner);
    await page.goto("/products/new");
    await page.getByLabel("Product code").fill("wig bw 16");
    await page.getByRole("button", { name: HELPER }).click();
    const helper = page.getByRole("dialog", { name: /Posy/ });
    const typing = helper.getByRole("button", { name: "I prefer typing" });
    if (await typing.isVisible()) {
      await typing.click();
      await expect(helper.getByText("Typing it is.")).toBeVisible();
    }
    await helper.getByRole("button", { name: "Explain this page" }).click();
    await helper.getByRole("button", { name: "Walk me through it" }).click();
    await expect(helper.getByText(/^Step 1 of \d+:/)).toBeVisible();
    await expect(page.locator(".helper-highlight")).toHaveCount(1);
    await helper.getByRole("button", { name: "Next" }).last().click();
    await expect(helper.getByText(/^Step 2 of \d+:/)).toBeVisible();
    await helper.getByRole("button", { name: "Stop" }).last().click();
    await expect(helper.getByText("No problem.")).toBeVisible();
    await expect(page.getByLabel("Product code")).toHaveValue(/^wig bw 16$/i);
    await helper.getByLabel("Message Posy").fill("what is the product code?");
    await helper.getByLabel("Message Posy").press("Enter");
    await helper.getByRole("button", { name: 'Yes, change "Product code" to WIG-BW-16' }).click();
    await expect(page.getByLabel("Product code")).toHaveValue("WIG-BW-16");
    await expect(helper.getByText('Done. I\'ve changed "Product code".')).toBeVisible();
  });

  test("can explain every field on the public pages", async ({ page }) => {
    expect(await unexplainedFields(page, PUBLIC_PAGES)).toEqual({});
  });

  test("can explain every field in the seller portal", async ({ page }) => {
    await signIn(page, CAST.vendorOwner);
    expect(await unexplainedFields(page, SELLER_PAGES)).toEqual({});
  });

  test("can explain every field in the platform console", async ({ page }) => {
    await signIn(page, CAST.superAdmin);
    expect(await unexplainedFields(page, CONSOLE_PAGES)).toEqual({});
  });

  test("can explain every field in the partner console", async ({ page }) => {
    await signIn(page, CAST.partnerLead);
    expect(await unexplainedFields(page, PARTNER_PAGES)).toEqual({});
  });
});
