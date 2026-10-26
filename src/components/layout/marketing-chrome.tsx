import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#trust", label: "Trust & safety" },
  { href: "/#hubs", label: "Hubs" },
  { href: "/marketplace", label: "Shop" },
  { href: "/shop-for-me", label: "Shop for me" },
  { href: "/partners", label: "Become a partner" },
  { href: "/login", label: "Sign in" },
];

export function MarketingHeader() {
  return (
    <div className="mx-auto max-w-container px-4 sm:px-8">
      <nav aria-label="Main" className="flex h-[84px] items-center justify-between gap-4">
        <Logo />
        <div className="hidden gap-[30px] text-[15px] md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-ink no-underline hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
        <ButtonLink href="/signup">Get started →</ButtonLink>
      </nav>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <div className="mx-auto max-w-container px-4 sm:px-8">
      <footer className="flex flex-col items-center justify-between gap-4 py-11 text-small text-ink-soft md:flex-row">
        <Logo size="sm" />
        <span>
          {LINKS.slice(0, 4).map((link) => (
            <Link key={link.href} href={link.href} className="mx-1.5 text-ink-soft no-underline hover:underline">
              {link.label}
            </Link>
          ))}
        </span>
        <span>
          © {new Date().getFullYear()} {BRAND.name}
        </span>
      </footer>
    </div>
  );
}
