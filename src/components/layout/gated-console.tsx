"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { type GateRequirement, useSessionGate } from "@/lib/auth/use-session-gate";

import { AppShell } from "./app-shell";
import { activeItem, type Console, consoleFor, isLocked, visibleItems } from "./navigation";

export function GatedConsole({ console, requirement, children }: { console?: Console; requirement: GateRequirement; children: ReactNode }) {
  const user = useSessionGate(requirement);
  const pathname = usePathname();
  const router = useRouter();
  const shown = user ? (console ?? consoleFor(user)) : null;
  const section = user && shown ? activeItem(visibleItems(shown, user), pathname) : undefined;
  const locked = Boolean(user && section && isLocked(section, user));

  useEffect(() => {
    if (locked) {
      router.replace("/overview");
    }
  }, [locked, router]);

  if (!user || !shown || locked) {
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
    <AppShell console={shown} user={user}>
      {children}
    </AppShell>
  );
}
