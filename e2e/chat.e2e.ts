import { expect, test } from "@playwright/test";

import { CAST } from "./support/cast";
import { resetCast, signIn, watchConsole } from "./support/session";

test.afterAll(() => resetCast());

test("a seller and the team chat live, with replies, references and no duplicates", async ({ browser }) => {
  const sellerPage = await (await browser.newContext()).newPage();
  const teamPage = await (await browser.newContext()).newPage();
  const problems = [...watchConsole(sellerPage), ...watchConsole(teamPage)];
  await signIn(sellerPage, CAST.vendorOwner);
  await signIn(teamPage, CAST.admin);

  await sellerPage.goto("/messages");
  await expect(sellerPage.getByText("Live", { exact: true })).toBeVisible();
  const question = `Where is ORD-GB-ABC1234? ${Date.now()}`;
  await sellerPage.getByLabel("Message").fill(question);
  await sellerPage.getByLabel("Message").press("Enter");
  await expect(sellerPage.getByText(question)).toHaveCount(1);

  await teamPage.goto("/admin/chat");
  await expect(teamPage.getByRole("link", { name: "Messages" })).toContainText("1");
  await teamPage.getByRole("button", { name: new RegExp(question.slice(-13)) }).click();
  await expect(teamPage.getByText("Live", { exact: true })).toBeVisible();
  await expect(teamPage.getByRole("button", { name: "ORD-GB-ABC1234", exact: true })).toBeVisible();

  await teamPage.getByRole("button", { name: "Reply" }).last().click();
  await expect(teamPage.getByText(/^Replying to/)).toBeVisible();
  await teamPage.getByLabel("Message").fill("Out for delivery today.");
  await teamPage.getByRole("button", { name: "Send" }).click();

  await expect(sellerPage.getByText("Out for delivery today.")).toBeVisible();
  await expect(sellerPage.getByText("Posygo team ·")).toBeVisible();
  await expect(teamPage.getByText("Seen")).toBeVisible();

  await sellerPage.getByLabel("Message").fill("Thanks!");
  await sellerPage.getByLabel("Message").press("Enter");
  await expect(teamPage.getByRole("list").last().getByText("Thanks!")).toHaveCount(1);
  await sellerPage.reload();
  await expect(sellerPage.getByRole("list").last().getByText("Thanks!")).toHaveCount(1);
  await expect(sellerPage.getByText(question)).toHaveCount(2);
  expect(problems).toEqual([]);
});
