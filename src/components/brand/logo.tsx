import Link from "next/link";

import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";

const SIZES = { sm: { image: "h-[22px] w-[22px]", text: "text-[19px]" }, md: { image: "h-[26px] w-[26px]", text: "text-[22px]" } } as const;

export function Logo({ size = "md", href = "/", className }: { size?: keyof typeof SIZES; href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-1.5 font-semibold tracking-[-0.6px] text-ink no-underline", SIZES[size].text, className)}>
      <img src="/brand/flower-mark.svg" alt="" aria-hidden className={SIZES[size].image} />
      {BRAND.name}
    </Link>
  );
}
