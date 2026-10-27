import { describe, expect, it } from "vitest";

import { recordOpenedPage, startTrailRecorder } from "./trail-recorder";
import { trail } from "./trail";

describe("recording the steps someone takes", () => {
  it("notes the page and the fields they visit and change, never what they type", () => {
    document.title = "Sign in · Posygo";
    document.body.innerHTML = '<label for="e">Email</label><input id="e">';
    const stop = startTrailRecorder();
    recordOpenedPage();
    const field = document.getElementById("e") as HTMLInputElement;
    field.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    field.value = "ada@example.test";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    stop();
    const steps = trail.recent().map((step) => step.what);
    expect(steps.slice(-3)).toEqual(["Opened Sign in", "Went to Email", "Changed Email"]);
    expect(steps.join(" ")).not.toContain("ada@");
  });
});
