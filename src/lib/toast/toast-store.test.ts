import { describe, expect, it } from "vitest";

import { dismissToast, markToastsSeen, toast, toastSnapshot } from "./toast-store";

describe("toasts", () => {
  it("shows the latest three, keeps a history and counts what hasn't been seen", () => {
    ["One", "Two", "Three", "Four"].forEach((title) => toast.success(title));
    toast.error("Five", "Something went wrong");
    const state = toastSnapshot();
    expect(state.visible.map((item) => item.title)).toEqual(["Three", "Four", "Five"]);
    expect(state.history.map((item) => item.title)).toEqual(["Five", "Four", "Three", "Two", "One"]);
    expect(state.unseen).toBe(5);
    dismissToast(state.visible[0]!.id);
    expect(toastSnapshot().visible.map((item) => item.title)).toEqual(["Four", "Five"]);
    markToastsSeen();
    expect(toastSnapshot().unseen).toBe(0);
  });
});
