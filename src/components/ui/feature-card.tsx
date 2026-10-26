import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Chip } from "./chip";
import { type Tone, toneDot } from "./tone";

export function FeatureCard({ title, body, footer, confetti = false }: { title: string; body: string; footer: ReactNode; confetti?: boolean }) {
  return (
    <article
      className={cn(
        "relative flex min-h-[360px] flex-col justify-between gap-8 overflow-hidden rounded-frame border border-line p-6 sm:p-[34px]",
        confetti ? "bg-cream bg-[url(/brand/confetti-dense.svg)] bg-[length:600px] bg-center" : "bg-paper",
      )}
    >
      <div>
        <h3 className="mb-2.5 text-[30px] font-medium leading-[32px] tracking-[-1px]">{title}</h3>
        <p className="max-w-[400px] text-body text-ink-soft">{body}</p>
      </div>
      {footer}
    </article>
  );
}

export interface DotListItem {
  label: string;
  dot: Tone;
  status: string;
  statusTone: Tone;
}

export function DotList({ items }: { items: readonly DotListItem[] }) {
  return (
    <ul className="rounded-card bg-cream px-[18px] py-1">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-3 border-t border-line py-[13px] text-small first:border-t-0">
          <span className="flex items-center gap-2.5">
            <span aria-hidden className={cn("h-2.5 w-2.5 shrink-0 rounded-full", toneDot[item.dot])} />
            {item.label}
          </span>
          <Chip tone={item.statusTone} size="sm">
            {item.status}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
