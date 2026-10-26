import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { CheckMark } from "./check-mark";
import { type Tone, toneSurface } from "./tone";

export function ChoiceChip({ selected, tone, onToggle, children }: { selected: boolean; tone: Tone; onToggle: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "motion-press inline-flex items-center gap-2 rounded-chip border-[1.5px] px-[15px] py-2.5 text-small font-medium",
        selected ? cn("border-transparent", toneSurface[tone]) : "border-line-strong bg-paper hover:border-ink",
      )}
    >
      {selected ? <CheckMark className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}
