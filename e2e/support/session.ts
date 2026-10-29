import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { type APIRequestContext, expect, type Page, type Response } from "@playwright/test";

import { API_DIR, API_URL, type Member, PASSWORD, TOTP_SECRET } from "./cast";
import { currentStep, totp } from "./totp";

const lastStep = new Map<string, number>();
const AUTH_PATHS = new Set(["/v1/auth/login", "/v1/auth/mfa/challenge", "/v1/auth/refresh"]);

async function freshCode(member: Member): Promise<string> {
  while (lastStep.get(member.email) === currentStep()) {
    await new Promise((settle) => setTimeout(settle, 1000));
  }
  const step = currentStep();
  lastStep.set(member.email, step);
  return totp(TOTP_SECRET, step);
}

export function resetCast(limitsOnly = false): void {
  execFileSync("npm", ["run", "-s", limitsOnly ? "seed:e2e:limits" : "seed:e2e"], { cwd: resolve(API_DIR), stdio: "pipe" });
}

export function awaitActivation(): void {
  execFileSync("npm", ["run", "-s", "seed:e2e:awaiting-activation"], { cwd: resolve(API_DIR), stdio: "pipe" });
}

export function buyerLinkToken(email: string): string {
  return execFileSync("npm", ["run", "-s", "seed:e2e:buyer-link", "--", email], { cwd: resolve(API_DIR), encoding: "utf8" })
    .trim()
    .split("\n")
    .at(-1)!;
}

export function shoppingConfirmToken(reference: string): string {
  return execFileSync("npm", ["run", "-s", "seed:e2e:shopping-confirm", "--", reference], { cwd: resolve(API_DIR), encoding: "utf8" })
    .trim()
    .split("\n")
    .at(-1)!;
}

export function deliverStoreOrder(reference: string): void {
  execFileSync("npm", ["run", "-s", "seed:e2e:deliver", "--", reference], { cwd: resolve(API_DIR), stdio: "pipe" });
}

export async function signIn(page: Page, member: Member, { hints = false }: { hints?: boolean } = {}): Promise<string> {
  resetCast(true);
  await page.context().clearCookies();
  if (!hints) {
    await page.addInitScript(() => window.localStorage.setItem("posygo.hints-seen", JSON.stringify(["*"])));
  }
  const tokens: string[] = [];
  const capture = async (response: Response) => {
    if (AUTH_PATHS.has(new URL(response.url()).pathname) && response.ok()) {
      const body = (await response.json().catch(() => ({}))) as { accessToken?: string };
      if (body.accessToken) {
        tokens.push(body.accessToken);
      }
    }
  };
  page.on("response", capture);
  await page.goto("/login");
  await page.getByLabel("Email").fill(member.email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /Sign in/ }).click();
  if (member.mfa) {
    await page.getByLabel("Authenticator code").fill(await freshCode(member));
    await page
      .getByRole("button", { name: /Continue|Verify|Sign in/ })
      .first()
      .click();
  }
  await page.waitForURL((url) => url.pathname.startsWith(member.landing));
  await expect.poll(() => tokens.length).toBeGreaterThan(0);
  page.off("response", capture);
  return tokens.at(-1)!;
}

export async function apiStatus(request: APIRequestContext, token: string | null, path: string, method: "GET" | "POST" = "GET", body: object = {}): Promise<number> {
  const headers = { Origin: new URL(process.env.E2E_BASE_URL ?? "http://localhost:3000").origin, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const response = method === "GET" ? await request.get(`${API_URL}${path}`, { headers }) : await request.post(`${API_URL}${path}`, { headers, data: body });
  return response.status();
}

export function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !/status of (401|403|404|409|422|400)/.test(message.text())) {
      problems.push(message.text());
    }
  });
  return problems;
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
