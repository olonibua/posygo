import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Paper({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-tile border border-line bg-paper", className)} {...props} />;
}

export function Stamp({ children, className, as: Tag = "span" }: { children: ReactNode; className?: string; as?: "span" | "p" | "h2" }) {
  return <Tag className={cn("block text-stamp uppercase text-ink-faint", className)}>{children}</Tag>;
}

type NoteTone = "yellow" | "lime" | "pink" | "sky";
const NOTE_BACKGROUND: Record<NoteTone, string> = { yellow: "bg-yellow", lime: "bg-lime", pink: "bg-pink", sky: "bg-sky" };
const NOTE_TILT = { left: "-rotate-2", right: "rotate-[1.5deg]", slight: "-rotate-[1.5deg]", none: "" } as const;

export function NotebookNote({ tone = "yellow", tilt = "left", className, children }: { tone?: NoteTone; tilt?: keyof typeof NOTE_TILT; className?: string; children: ReactNode }) {
  return <div className={cn("notebook", tilt === "none" ? "motion-rise" : "motion-settle", NOTE_BACKGROUND[tone], NOTE_TILT[tilt], className)}>{children}</div>;
}

export function StepNumber({ value }: { value: number }) {
  return <span className="inline-grid h-[30px] w-[30px] place-items-center rounded-full bg-cocoa text-small font-semibold text-on-ink">{value}</span>;
}

export function Sticker({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden className={cn("motion-pop pointer-events-none absolute select-none [animation-delay:240ms]", className)} />;
}

type PanelTone = "blue" | "lime" | "sky" | "cocoa";
const PANEL: Record<PanelTone, { surface: string; stamp: string; body: string; sticker: string }> = {
  blue: { surface: "bg-blue text-white", stamp: "text-white/80", body: "text-white/90", sticker: "/brand/sticker-flower-cream.svg" },
  lime: { surface: "bg-lime text-cocoa", stamp: "text-cocoa/70", body: "text-cocoa/85", sticker: "/brand/sticker-flower-blue.svg" },
  sky: { surface: "bg-sky text-cocoa", stamp: "text-cocoa/70", body: "text-cocoa/85", sticker: "/brand/sticker-flower-pink.svg" },
  cocoa: { surface: "bg-cocoa text-on-ink", stamp: "text-on-ink-soft", body: "text-on-ink-soft", sticker: "/brand/badge-scallop-orange.svg" },
};

export function FeaturePanel({ tone = "blue", stamp, title, children, action }: { tone?: PanelTone; stamp: string; title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  const panel = PANEL[tone];
  return (
    <section className={cn("motion-rise relative overflow-hidden rounded-tile px-6 py-6 sm:px-7", panel.surface)}>
      <Sticker src={panel.sticker} className="-bottom-6 -right-5 w-[110px] rotate-[12deg] opacity-95" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[640px]">
          <span className={cn("block text-stamp uppercase", panel.stamp)}>{stamp}</span>
          <h3 className="mb-1.5 mt-2 text-[26px] font-medium leading-[30px] tracking-[-0.8px]">{title}</h3>
          {children ? <div className={cn("text-small leading-[21px]", panel.body)}>{children}</div> : null}
        </div>
        {action ? <div className="relative shrink-0 sm:mr-16">{action}</div> : null}
      </div>
    </section>
  );
}
