"use client";

import type { ReactNode } from "react";

import { type GateRequirement, useSessionGate } from "@/lib/auth/use-session-gate";

import { AppShell } from "./app-shell";
import { type Console, consoleFor } from "./navigation";

export function GatedConsole({ console, requirement, children }: { console?: Console; requirement: GateRequirement; children: ReactNode }) {
  const user = useSessionGate(requirement);
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center" role="status" aria-live="polite">
        <span className="flex items-center gap-3 text-small text-ink-soft">
          <img src="/brand/flower-mark.svg" alt="" className="h-6 w-6 animate-spin [animation-duration:2.4s]" />
          Opening your workspace…
        </span>
      </div>
    );
  }
  return (
    <AppShell console={console ?? consoleFor(user)} user={user}>
      {children}
    </AppShell>
  );
}
