import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/brand";
import { FEATURES } from "@/lib/features";

import { type MarketingLink, MarketingNav } from "./marketing-nav";

const LINKS: MarketingLink[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/fulfilment", label: "Countries" },
  ...(FEATURES.marketplace ? [{ href: "/marketplace", label: "Shop" }] : []),
];

const FOOTER_LINKS = [
  ...LINKS,
  { href: "/guides", label: "Guides" },
  { href: "/track", label: "Track a parcel" },
  { href: "/partners", label: "Partners" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
];

export function MarketingHeader() {
  return (
    <div className="mx-auto max-w-container px-4 sm:px-8">
      <nav aria-label="Main" className="relative flex h-[84px] items-center justify-between gap-4">
        <Logo />
        <MarketingNav links={LINKS} />
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
