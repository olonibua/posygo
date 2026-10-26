import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { CountUp } from "./count-up";
import { type Tone, toneDot, toneSurface } from "./tone";

export interface StatTileProps {
  label: string;
  value: ReactNode;
  note?: string;
  tone: Tone;
  dots?: readonly Tone[];
}

const DOT_POSITIONS = ["top-4 right-[22px]", "top-[22px] right-3"] as const;

export function StatTile({ label, value, note, tone, dots = [] }: StatTileProps) {
  return (
    <div className={cn("motion-rise motion-lift relative overflow-hidden rounded-tile px-[18px] py-4", toneSurface[tone])}>
      <p className="text-small font-medium">{label}</p>
      <p className="mt-1.5 text-[38px] font-medium leading-[44px] tracking-[-1.2px] tabular-nums">
        {typeof value === "string" || typeof value === "number" ? <CountUp value={String(value)} /> : value}
      </p>
      {note ? <p className="text-meta font-normal opacity-80">{note}</p> : null}
      {dots.slice(0, 2).map((dot, index) => (
        <i key={`${dot}-${index}`} aria-hidden className={cn("confetti-dot", toneDot[dot], DOT_POSITIONS[index])} />
      ))}
    </div>
  );
}

export function StatTileGrid({ children }: { children: ReactNode }) {
  return <div className="stagger grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}
