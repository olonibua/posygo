import { describe, expect, it } from "vitest";

import { readScreen } from "./screen";

function render(html: string): Document {
  document.body.innerHTML = html;
  for (const element of document.querySelectorAll<HTMLElement>("input, select, textarea, [role=radiogroup]")) {
    element.getClientRects = () => [{} as DOMRect] as unknown as DOMRectList;
  }
  return document;
}

describe("reading the screen for Posy", () => {
  it("shares the heading, what's been typed, the chosen options and the messages showing", () => {
    const screen = readScreen(
      render(`<main>
        <h1>Send stock in</h1>
        <div role="radiogroup" aria-label="Hub"><button role="radio" aria-checked="false">Leeds</button><button role="radio" aria-checked="true">Manchester</button></div>
        <label for="carrier">Carrier</label><input id="carrier" value="Royal Mail">
        <label for="notes">Notes for the hub</label><textarea id="notes"></textarea>
        <label for="mode">Shipping</label><select id="mode"><option value="">Choose</option><option value="LOOSE" selected>Loose boxes</option></select>
        <label for="ok">I agree</label><input id="ok" type="checkbox" checked>
        <p role="alert">Choose the hub to send your stock to.</p>
      </main>`),
    );
    expect(screen).toEqual({
      title: "Send stock in",
      fields: [
        { label: "Hub", value: "Manchester" },
        { label: "Carrier", value: "Royal Mail" },
        { label: "Notes for the hub", value: "" },
        { label: "Shipping", value: "Loose boxes" },
        { label: "I agree", value: "ticked" },
      ],
      alerts: ["Choose the hub to send your stock to."],
    });
  });

  it("never shares passwords, card details, one-time codes or Posy's own panel", () => {
    const screen = readScreen(
      render(`<main>
        <label for="p">Password</label><input id="p" type="password" value="secret password">
        <label for="c">Card number</label><input id="c" autocomplete="cc-number" value="4242424242424242">
        <label for="o">Code</label><input id="o" autocomplete="one-time-code" value="123456">
        <div data-private><label for="x">Bank</label><input id="x" value="12-34-56"></div>
        <div data-assistant><label for="q">Ask Posy</label><input id="q" value="hello"></div>
      </main>`),
    );
    expect(screen.fields).toEqual([]);
  });
});
