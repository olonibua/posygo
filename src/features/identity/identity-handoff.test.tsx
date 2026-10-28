import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IdentityHandoff, type IdentityHandoffProps } from "./identity-handoff";

const SESSION_URL = "https://verify.didit.me/session/abc";

function useScreen(desktop: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: desktop, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
}

function renderHandoff(overrides: Partial<IdentityHandoffProps> = {}) {
  const props: IdentityHandoffProps = {
    state: "NOT_STARTED",
    editable: true,
    starting: false,
    checking: false,
    onStart: vi.fn(() => Promise.resolve({ url: SESSION_URL })),
    onCheck: vi.fn(),
    ...overrides,
  };
  render(<IdentityHandoff {...props} />);
  return props;
}

describe("IdentityHandoff", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a QR code made on this page and a same-device link on a computer", async () => {
    useScreen(true);
    const props = renderHandoff();
    await userEvent.click(screen.getByRole("button", { name: "Verify your identity" }));
    const qr = await screen.findByRole("img", { name: "QR code that opens your identity check" });
    expect(qr.getAttribute("src")).toMatch(/^data:image\/png;base64,/);
    expect(screen.getByText("Scan with your phone's camera")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue on this device instead" })).toHaveAttribute("href", SESSION_URL);
    expect(props.onCheck).toHaveBeenCalled();
  });

  it("shows a button that opens the check on a phone", async () => {
    useScreen(false);
    renderHandoff();
    await userEvent.click(screen.getByRole("button", { name: "Verify your identity" }));
    expect(await screen.findByRole("link", { name: "Open identity check" })).toHaveAttribute("href", SESSION_URL);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("keeps checking while the result is pending", async () => {
    useScreen(true);
    vi.useFakeTimers();
    const props = renderHandoff({ state: "WAITING" });
    vi.advanceTimersByTime(15_000);
    expect(props.onCheck).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
    await waitFor(() => expect(screen.getByRole("button", { name: "Continue check" })).toBeInTheDocument());
  });

  it("shows each outcome in plain words", () => {
    useScreen(true);
    renderHandoff({ state: "DECLINED", reason: "your face didn't match the photo on your ID" });
    expect(screen.getByText("Your check didn't pass: your face didn't match the photo on your ID.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("says when the identity is verified or being checked", () => {
    useScreen(true);
    renderHandoff({ state: "VERIFIED" });
    expect(screen.getByText("Identity verified")).toBeInTheDocument();
    renderHandoff({ state: "IN_REVIEW" });
    expect(screen.getByText("We're checking your ID")).toBeInTheDocument();
  });
});
