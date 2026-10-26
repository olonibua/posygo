"use client";

import { hasPermission, isVendorRole, type Permission, type SessionUser } from "@/shared";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./auth-context";

export type GateRequirement = { kind: "vendor" } | { kind: "staff" } | { kind: "permission"; permission: Permission };

export function homeFor(user: SessionUser): string {
  if (user.mfaState === "ENROLMENT_REQUIRED") {
    return "/mfa/setup";
  }
  if (user.partnerId) {
    return "/admin/partnership";
  }
  return isVendorRole(user.role) ? "/overview" : "/admin";
}

function satisfies(user: SessionUser, requirement: GateRequirement): boolean {
  if (requirement.kind === "vendor") {
    return isVendorRole(user.role);
  }
  if (requirement.kind === "staff") {
    return !isVendorRole(user.role);
  }
  return hasPermission(user.role, requirement.permission);
}

export function useSessionGate(requirement: GateRequirement): SessionUser | null {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const user = state.status === "authenticated" ? state.user : null;
  const allowed = user !== null && user.mfaState !== "ENROLMENT_REQUIRED" && satisfies(user, requirement);

  useEffect(() => {
    if (state.status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (user && !allowed) {
      router.replace(homeFor(user));
    }
  }, [state.status, user, allowed, router, pathname]);

  return allowed ? user : null;
}

const SITE_ORIGIN = "https://site.invalid";

export function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || /[\\\s]/.test(next)) {
    return null;
  }
  try {
    const url = new URL(next, SITE_ORIGIN);
    return url.origin === SITE_ORIGIN ? `${url.pathname}${url.search}` : null;
  } catch {
    return null;
  }
}
