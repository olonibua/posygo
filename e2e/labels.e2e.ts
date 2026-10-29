import { expect, test } from "@playwright/test";

import { API_URL, CAST } from "./support/cast";
import { signIn, watchConsole } from "./support/session";

function pageSizes(pdf: Buffer): string[] {
  return [...pdf.toString("latin1").matchAll(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/g)].map((match) => `${Math.round(Number(match[1]))}x${Math.round(Number(match[2]))}`);
}

test("prints each label on its own label-sized page, not on A4", async ({ page, request }) => {
  const problems = watchConsole(page);
  const token = await signIn(page, CAST.vendorOwner);
  const products = (await (await request.get(`${API_URL}/v1/vendor/products?status=ACTIVE`, { headers: { Authorization: `Bearer ${token}`, Origin: "http://localhost:3000" } })).json()) as Array<{ id: string }>;
  await page.goto(`/products/labels?ids=${products[0]!.id}`);
  await page.getByLabel("Copies of each").selectOption("2");
  await expect(page.getByRole("button", { name: "Print 2 labels" })).toBeVisible();

  const small = pageSizes(await page.pdf({ preferCSSPageSize: true }));
  expect(small).toEqual(["176x113", "176x113"]);

  await page.getByLabel("Label size").selectOption({ label: "4 × 6 in" });
  const shipping = pageSizes(await page.pdf({ preferCSSPageSize: true }));
  expect(shipping).toEqual(["288x432", "288x432"]);
  expect(problems).toEqual([]);
});
