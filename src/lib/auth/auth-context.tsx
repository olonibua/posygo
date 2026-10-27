"use client";

import type { AuthenticatedResult, SessionUser } from "@/shared";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest, onSessionChange, refreshSession, setSession } from "@/lib/api/client";
import { shouldRestoreSession } from "@/lib/auth/session-hint";

type AuthState = { status: "loading"; user: null } | { status: "anonymous"; user: null } | { status: "authenticated"; user: SessionUser };

interface AuthContextValue {
  state: AuthState;
  signIn: (result: AuthenticatedResult) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    const unsubscribe = onSessionChange((result) => setState(result ? { status: "authenticated", user: result.user } : { status: "anonymous", user: null }));
    if (shouldRestoreSession(window.location.pathname)) {
      void refreshSession();
    } else {
      setSession(null);
    }
    return unsubscribe;
  }, []);

  const signIn = useCallback((result: AuthenticatedResult) => setSession(result), []);

  const signOut = useCallback(async () => {
    try {
      await apiRequest<void>("/v1/auth/logout", { method: "POST", authenticated: false });
    } finally {
      setSession(null);
    }
  }, []);

  const value = useMemo(() => ({ state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
