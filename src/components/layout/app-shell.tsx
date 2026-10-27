"use client";

import type { SessionUser } from "@/shared";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toneSurface } from "@/components/ui/tone";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/cn";

import { ActivityBell } from "./activity-bell";
import { activeItem, type Console, visibleItems } from "./navigation";
import { Sidebar } from "./sidebar";

type DrawerState = "closed" | "open" | "closing";

export function AppShell({ console, user, children }: { console: Console; user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState<DrawerState>("closed");
  const close = useCallback(() => setDrawer((state) => (state === "open" ? "closing" : state)), []);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden border-r border-line bg-ground lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar console={console} user={user} />
        </div>
      </aside>
      {drawer === "closed" ? null : <Drawer state={drawer} console={console} user={user} onClose={close} onClosed={() => setDrawer("closed")} />}
      <div className="flex min-w-0 flex-col">
        <Topbar console={console} user={user} onOpenMenu={() => setDrawer("open")} />
        <main id="main" className="px-4 py-6 sm:px-9 sm:py-[30px]">
          <div key={pathname} className="motion-rise">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Drawer({ state, console, user, onClose, onClosed }: { state: DrawerState; console: Console; user: SessionUser; onClose: () => void; onClosed: () => void }) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  const closing = state === "closing";
  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" aria-label="Close menu" className={cn("absolute inset-0 bg-cocoa/40", closing ? "opacity-0 transition-opacity duration-200" : "motion-fade")} onClick={onClose} />
      <aside
        ref={panel}
        onAnimationEnd={(event) => event.animationName === "drawer-out" && onClosed()}
        className={cn(
          "relative h-full w-[288px] max-w-[85vw] border-r border-line bg-ground shadow-frame",
          closing ? "[animation:drawer-out_var(--dur)_var(--ease-in)_forwards]" : "[animation:drawer-in_var(--dur-slow)_var(--ease-out)_both]",
        )}
      >
        <button type="button" onClick={onClose} aria-label="Close menu" className="motion-press absolute right-3 top-6 z-10 grid h-9 w-9 place-items-center rounded-full hover:bg-paper">
          <Icon name="close" className="h-5 w-5" />
        </button>
        <Sidebar console={console} user={user} onNavigate={onClose} />
      </aside>
    </div>
  );
}

function Topbar({ console, user, onOpenMenu }: { console: Console; user: SessionUser; onOpenMenu: () => void }) {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const section = activeItem(visibleItems(console, user), pathname);
  const nested = section?.href !== undefined && pathname !== section.href;
  const initials = (user.businessName ?? user.email).slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="motion-press grid h-11 w-11 place-items-center rounded-nav border-[1.5px] border-line-strong bg-paper hover:border-ink lg:hidden"
          aria-label="Open menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-small">
          <span className="hidden text-stamp uppercase text-ink-faint md:block">{console.stamp}</span>
          {section ? (
            <>
              <span aria-hidden className="hidden text-ink-faint md:block">
                /
              </span>
              <span aria-hidden className={cn("h-2.5 w-2.5 shrink-0 rounded-full", toneSurface[section.tone])} />
              {nested && section.href ? (
                <Link href={section.href} className="group flex items-center gap-1 truncate font-medium text-ink no-underline">
                  <Icon name="back" className="h-4 w-4 transition-[translate] duration-200 group-hover:-translate-x-0.5" />
                  {section.label}
                </Link>
              ) : (
                <span key={section.label} className="motion-fade truncate font-medium">
                  {section.label}
                </span>
              )}
            </>
          ) : null}
        </nav>
      </div>
      <div className="flex items-center gap-3.5">
        <ActivityBell />
        <span className="grid h-11 w-11 place-items-center rounded-nav bg-lime font-semibold text-cocoa" aria-hidden>
          {initials}
        </span>
        <div className="hidden md:block">
          <b className="block text-[15px] font-medium">{user.email}</b>
          <span className="text-label uppercase tracking-[1.2px] text-ink-faint">{user.role.replace(/_/g, " ")}</span>
        </div>
        <Button variant="ghost" onClick={() => void handleSignOut()} icon={<Icon name="signOut" className="h-4 w-4" />}>
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
