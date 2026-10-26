"use client";

import type { SessionUser } from "@/shared";

import { useAuth } from "./auth-context";

export function useCurrentUser(): SessionUser {
  const { state } = useAuth();
  if (state.status !== "authenticated") {
    throw new Error("useCurrentUser must be used inside a gated console");
  }
  return state.user;
}
