import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { type Tone, toneSurface } from "./tone";

export function Chip({ tone = "lime", size = "md", children, className }: { tone?: Tone; size?: "sm" | "md" | "lg"; children: ReactNode; className?: string }) {
  const sizes = { sm: "px-[9px] py-1 text-meta", md: "px-3.5 py-[9px] text-small font-medium", lg: "px-4 py-[11px] text-body font-medium" };
  return <span className={cn("inline-flex items-center rounded-chip", sizes[size], toneSurface[tone], className)}>{children}</span>;
}

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-[9px] px-[11px] py-1.5 text-[13px] font-semibold leading-4", toneSurface[tone])}>
      <span aria-hidden className="h-2 w-2 rounded-full bg-current opacity-55" />
      {children}
    </span>
  );
}
