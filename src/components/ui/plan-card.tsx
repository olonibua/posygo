import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Sticker } from "./surfaces";
import { type Tone, toneDot, toneSurface } from "./tone";

export interface PlanCardProps {
  tone: Tone;
  title: string;
  line: string;
  headline: string;
  headlineNote?: string;
  action: ReactNode;
  points: ReadonlyArray<{ text: string; dot: Tone }>;
  sticker?: string;
}

export function PlanCard({ tone, title, line, headline, headlineNote, action, points, sticker }: PlanCardProps) {
  return (
    <article className="relative rounded-frame border border-line bg-paper p-2 text-left">
      {sticker ? <Sticker src={sticker} className="-right-2 -top-10 w-[100px] -rotate-[8deg] sm:-right-[26px] sm:w-[120px]" /> : null}
      <div className={cn("rounded-[18px] p-6", toneSurface[tone])}>
        <h3 className="text-[24px] font-medium leading-[28px]">{title}</h3>
        <p className="mb-[30px] mt-1.5 text-small">{line}</p>
        <p className="text-[40px] font-medium leading-[44px] tracking-[-1.8px] sm:text-[48px] sm:leading-[48px]">
          {headline} {headlineNote ? <small className="text-[13px] font-normal tracking-normal">{headlineNote}</small> : null}
        </p>
        <div className="mt-4">{action}</div>
      </div>
      <ul className="px-6 pb-4 pt-[22px]">
        {points.map((point) => (
          <li key={point.text} className="my-2.5 flex gap-2.5 text-[15px] leading-[22px] text-ink-soft">
            <span aria-hidden className={cn("mt-[7px] h-2 w-2 shrink-0 rounded-full", toneDot[point.dot])} />
            {point.text}
          </li>
        ))}
      </ul>
    </article>
  );
}
