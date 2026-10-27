import { afterEach, describe, expect, it } from "vitest";

import { rememberSignedIn, shouldRestoreSession } from "./session-hint";

describe("restoring a session", () => {
  afterEach(() => window.localStorage.clear());

  it("skips the check on public pages for people who have never signed in", () => {
    expect(shouldRestoreSession("/pricing")).toBe(false);
    expect(shouldRestoreSession("/store/brooklyn-braids")).toBe(false);
  });

  it("always checks on private pages", () => {
    expect(shouldRestoreSession("/overview")).toBe(true);
    expect(shouldRestoreSession("/admin/shopping")).toBe(true);
    expect(shouldRestoreSession("/track/1Z999")).toBe(true);
    expect(shouldRestoreSession("/adminx")).toBe(false);
  });

  it("checks everywhere once this browser has signed in, and stops after signing out", () => {
    rememberSignedIn(true);
    expect(shouldRestoreSession("/pricing")).toBe(true);
    rememberSignedIn(false);
    expect(shouldRestoreSession("/pricing")).toBe(false);
  });
});
