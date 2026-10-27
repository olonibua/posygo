import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/fulfilment", label: "Hubs" },
  { href: "/marketplace", label: "Shop" },
  { href: "/shop-for-me", label: "Shop for me" },
  { href: "/partners", label: "Become a partner" },
  { href: "/login", label: "Sign in" },
];

const FOOTER_LINKS = [
  ...LINKS.filter((link) => link.href !== "/login"),
  { href: "/guides", label: "Guides" },
  { href: "/track", label: "Track a parcel" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
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
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-ink-soft no-underline hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <span>
          © {new Date().getFullYear()} {BRAND.name}
        </span>
      </footer>
    </div>
  );
}
