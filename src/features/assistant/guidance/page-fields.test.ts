import { describe, expect, it } from "vitest";

import { describePage } from "../knowledge/types";
import { applyFix, fieldsOnScreen, suggestedFix } from "./page-fields";
import { productCodeFix } from "./fixes";

const PAGE = describePage({ route: "/products/new", title: "Add a product", purpose: "Describe a product.", steps: ["Name it.", "Code it."], fields: {}, related: [] });

const WITH_FIELDS = { ...PAGE, fields: { name: { labels: ["Product name"], meaning: "The name." }, code: { labels: ["Product code"], meaning: "Your code.", fix: productCodeFix } } };

function render(html: string): HTMLElement {
  document.body.innerHTML = html;
  for (const element of document.querySelectorAll<HTMLElement>("input")) {
    Object.defineProperty(element, "offsetParent", { get: () => document.body });
  }
  return document.body;
}

describe("working with the fields on screen", () => {
  it("lists the described fields in the order they appear", () => {
    render('<label for="c">Product code</label><input id="c"><label for="n">Product name</label><input id="n"><label for="x">Unknown</label><input id="x">');
    expect(fieldsOnScreen(WITH_FIELDS).map((field) => field.label)).toEqual(["Product code", "Product name"]);
  });

  it("offers a fix only when the value can be put right, and applies it like typing", () => {
    render('<label for="c">Product code</label><input id="c" value="wig bw 16">');
    expect(suggestedFix("Product code", WITH_FIELDS.fields.code)).toBe("WIG-BW-16");
    const typed: string[] = [];
    document.getElementById("c")!.addEventListener("input", (event) => typed.push((event.target as HTMLInputElement).value));
    Element.prototype.scrollIntoView = () => undefined;
    expect(applyFix("Product code", "WIG-BW-16")).toBe(true);
    expect(typed).toEqual(["WIG-BW-16"]);
    expect(suggestedFix("Product code", WITH_FIELDS.fields.code)).toBeNull();
  });

  it("never reads password fields", () => {
    render('<label for="p">Product code</label><input id="p" type="password" value="wig bw 16">');
    expect(suggestedFix("Product code", WITH_FIELDS.fields.code)).toBeNull();
  });
});
