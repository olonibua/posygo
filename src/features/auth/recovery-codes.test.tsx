import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecoveryCodes } from "./recovery-codes";

const CODES = ["K8QF7-VVWHY", "M9FSG-XSSKN"];

describe("RecoveryCodes", () => {
  it("copies every code, one per line", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<RecoveryCodes codes={CODES} />);

    await user.click(screen.getByRole("button", { name: "Copy codes" }));

    expect(writeText).toHaveBeenCalledWith("K8QF7-VVWHY\nM9FSG-XSSKN");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("says so when the browser blocks copying", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("blocked"));
    render(<RecoveryCodes codes={CODES} />);

    await user.click(screen.getByRole("button", { name: "Copy codes" }));

    expect(await screen.findByText("Couldn't copy. Select them instead.")).toBeInTheDocument();
  });
});
