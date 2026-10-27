import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { knowledgeFor, PAGE_KNOWLEDGE } from "./registry";
import { fieldFor } from "./types";

const APP = join(process.cwd(), "src/app");

function appRoutes(directory = APP, prefix = ""): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      const segment = entry.startsWith("(") ? "" : `/${entry}`;
      return appRoutes(path, `${prefix}${segment}`);
    }
    return entry === "page.tsx" ? [prefix || "/"] : [];
  });
}

const FORMS_THAT_MUST_BE_EXPLAINED = ["/signup", "/inbound/new", "/inbound/[id]/edit", "/products/new", "/products/[id]", "/orders/new", "/wallet"];

describe("page knowledge", () => {
  const routes = appRoutes();

  it("describes only pages that exist", () => {
    for (const page of PAGE_KNOWLEDGE) {
      expect(routes, page.route).toContain(page.route);
    }
  });

  it("covers every form the helper is promised for", () => {
    for (const route of FORMS_THAT_MUST_BE_EXPLAINED) {
      expect(
        PAGE_KNOWLEDGE.map((page) => page.route),
        route,
      ).toContain(route);
    }
  });

  it("explains every field in plain sentences, with the usual steps", () => {
    for (const page of PAGE_KNOWLEDGE) {
      expect(page.steps.length, page.route).toBeGreaterThan(1);
      for (const [key, field] of Object.entries(page.fields)) {
        expect(field.meaning.length, `${page.route} ${key}`).toBeGreaterThan(15);
      }
      for (const link of page.related) {
        expect(routes, `${page.route} links to ${link.href}`).toContain(link.href);
      }
    }
  });

  it("finds the right page and field from what's on screen", () => {
    expect(knowledgeFor("/inbound/new")?.title).toBe("Send stock in");
    expect(knowledgeFor("/inbound/6b1f1f2e-9a5d-4d47-9a8a-0b8a9d3f2c11/edit")?.route).toBe("/inbound/[id]/edit");
    expect(knowledgeFor("/products/new")?.route).toBe("/products/new");
    expect(knowledgeFor("/nowhere")).toBeUndefined();
    const product = knowledgeFor("/products/new")!;
    expect(fieldFor(product, "Value per unit (GBP)")?.meaning).toContain("customs");
    expect(fieldFor(product, "Barcode 2")).toBeDefined();
  });
});
