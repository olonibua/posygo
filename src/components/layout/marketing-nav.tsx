"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/auth-context";
import { homeFor } from "@/lib/auth/use-session-gate";

export interface MarketingLink {
  href: string;
  label: string;
}

const SIGN_IN: MarketingLink = { href: "/login", label: "Sign in" };

export function MarketingNav({ links }: { links: MarketingLink[] }) {
  const { state } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dashboard = state.status === "authenticated" ? homeFor(state.user) : null;
  const visibleLinks = dashboard ? links : [...links, SIGN_IN];

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <div className="hidden gap-[30px] text-[15px] md:flex">
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-ink no-underline hover:underline">
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {dashboard ? <ButtonLink href={dashboard}>Open dashboard →</ButtonLink> : <ButtonLink href="/signup">Get started →</ButtonLink>}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="marketing-menu"
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-control text-ink shadow-[inset_0_0_0_1.5px_var(--line-strong)] md:hidden"
        >
          <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </div>
      {open ? (
        <div id="marketing-menu" className="absolute inset-x-0 top-[76px] z-40 rounded-card bg-paper p-2 shadow-peek md:hidden">
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-control px-4 py-3.5 text-[17px] text-ink no-underline hover:bg-paper-sunk">
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
