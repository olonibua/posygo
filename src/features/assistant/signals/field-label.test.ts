import { describe, expect, it } from "vitest";

import { fieldLabelOf, rejectedFieldLabels } from "./field-label";

function render(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body;
}

describe("reading which field someone is on", () => {
  it("uses the field's label and never its value", () => {
    const root = render('<label for="a">Tracking number</label><input id="a" value="SECRET-123">');
    const label = fieldLabelOf(root.querySelector("input"));
    expect(label).toBe("Tracking number");
    expect(label).not.toContain("SECRET");
  });

  it("names choice buttons by their group", () => {
    const root = render("<fieldset><legend>Storage size</legend><button>Small</button></fieldset>");
    expect(fieldLabelOf(root.querySelector("button"))).toBe("Storage size");
  });

  it("ignores the helper's own box and buttons outside a form group", () => {
    const root = render('<div data-assistant><label for="m">Message</label><input id="m"></div><button>Save</button>');
    expect(fieldLabelOf(root.querySelector("input"))).toBeNull();
    expect(fieldLabelOf(root.querySelector("button"))).toBeNull();
  });

  it("lists the fields the form has marked as wrong", () => {
    const root = render('<label for="a">Postcode</label><input id="a" aria-invalid="true"><label for="b">Town or city</label><input id="b" aria-invalid="false">');
    expect(rejectedFieldLabels(root)).toEqual(["Postcode"]);
  });
});
