import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "@/middleware";

import { carriesSessionCookie } from "./api/client";
import { safeNextPath } from "./auth/use-session-gate";

describe("session cookie", () => {
  it("is sent only to the endpoints that start or refresh a session", () => {
    expect(carriesSessionCookie("/v1/auth/refresh")).toBe(true);
    expect(carriesSessionCookie("/v1/staff-invitations/accept")).toBe(true);
    expect(carriesSessionCookie("/v1/invitations/accept")).toBe(true);
    expect(carriesSessionCookie("/v1/partner")).toBe(false);
    expect(carriesSessionCookie("/v1/staff-invitations/preview")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("allows same-site paths only", () => {
    expect(safeNextPath("/overview")).toBe("/overview");
    expect(safeNextPath("//evil.example")).toBeNull();
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("/\\evil.example")).toBeNull();
    expect(safeNextPath("/%5Cevil.example")).toBe("/%5Cevil.example");
    expect(safeNextPath("/admin?tab=1")).toBe("/admin?tab=1");
    expect(safeNextPath(null)).toBeNull();
  });
});

describe("content security policy", () => {
  it("forbids framing, plugins and foreign scripts", () => {
    const policy = buildContentSecurityPolicy("abc123");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("'nonce-abc123'");
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });
});
