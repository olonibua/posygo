"use client";

import Link from "next/link";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

export interface FilterOption<Value extends string> {
  value: Value;
  label: string;
  count?: number;
}

interface Indicator {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function FilterTabs<Value extends string>({ options, value, onChange, label }: { options: readonly FilterOption<Value>[]; value: Value; onChange: (value: Value) => void; label: string }) {
  const group = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const active = group.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      setIndicator(active ? { left: active.offsetLeft, top: active.offsetTop, width: active.offsetWidth, height: active.offsetHeight } : null);
    };
    measure();
    if (typeof ResizeObserver === "undefined" || !group.current) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(group.current);
    return () => observer.disconnect();
  }, [value, options]);

  return (
    <div ref={group} role="group" aria-label={label} className="relative flex flex-wrap gap-2">
      {indicator ? (
        <span
          aria-hidden
          className="absolute rounded-control bg-cocoa transition-[left,top,width,height] duration-300 ease-[var(--ease-out)]"
          style={{ left: indicator.left, top: indicator.top, width: indicator.width, height: indicator.height }}
        />
      ) : null}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "motion-press relative rounded-control border-[1.5px] px-3.5 py-2 text-small font-medium",
              active ? "border-transparent text-on-ink" : "border-line-strong bg-paper text-ink hover:border-ink",
              active && !indicator && "bg-cocoa",
            )}
          >
            {option.label}
            {option.count === undefined ? null : <b className="ml-1.5 font-semibold opacity-60">{option.count}</b>}
          </button>
        );
      })}
    </div>
  );
}

export function OpenLink({ href, children = "Open" }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 font-medium text-ink no-underline">
      {children}
      <i aria-hidden className="motion-press grid h-[30px] w-[30px] place-items-center rounded-full bg-cocoa text-[13px] not-italic text-on-ink group-hover:translate-x-0.5 group-hover:bg-blue">
        →
      </i>
    </Link>
  );
}

const EMPTY_STICKERS = ["/brand/sticker-flower-blue.svg", "/brand/sticker-flower-pink.svg", "/brand/sticker-clover.svg", "/brand/badge-scallop-sky.svg"] as const;

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  const sticker = EMPTY_STICKERS[title.length % EMPTY_STICKERS.length];
  return (
    <div className="motion-rise flex flex-col items-center gap-3 px-6 py-6 text-center">
      <img src={sticker} alt="" aria-hidden className="motion-wobble h-16 w-16 -rotate-[8deg]" />
      <p className="text-h3 text-ink">{title}</p>
      <p className="max-w-sm text-small text-ink-soft">{body}</p>
      {action}
    </div>
  );
}
