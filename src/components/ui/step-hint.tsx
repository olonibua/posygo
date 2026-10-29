"use client";

import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { hintStore } from "@/lib/hints/hint-store";

const VISIBLE_SHARE = 0.6;

interface StepHintProps {
  id: string;
  title: string;
  text: string;
  children: ReactNode;
  className?: string;
  enabled?: boolean;
}

function useOpenHint(): string | null {
  return useSyncExternalStore(hintStore.subscribe, hintStore.openId, () => null);
}

export function StepHint({ id, title, text, children, className, enabled = true }: StepHintProps) {
  const anchor = useRef<HTMLDivElement>(null);
  const open = useOpenHint() === id;

  useEffect(() => {
    const element = anchor.current;
    if (!enabled || !element || typeof IntersectionObserver === "undefined") {
      return;
    }
    let visible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) {
          hintStore.offer(id);
        }
      },
      { threshold: VISIBLE_SHARE },
    );
    observer.observe(element);
    const unsubscribe = hintStore.subscribe(() => {
      if (visible) {
        hintStore.offer(id);
      }
    });
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [id, enabled]);

  useEffect(() => () => hintStore.close(id), [id]);

  return (
    <div ref={anchor} className={cn("relative", className)}>
      {children}
      {open && enabled ? <HintCard anchor={anchor} title={title} text={text} onDone={() => hintStore.dismiss(id)} /> : null}
    </div>
  );
}

const GAP = 12;
const EDGE = 16;

function usePlacement(anchor: RefObject<HTMLDivElement | null>) {
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (rect) {
        setPlace({ top: rect.bottom + window.scrollY + GAP, right: Math.max(EDGE, document.documentElement.clientWidth - rect.right - 4) });
      }
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [anchor]);
  return place;
}

function HintCard({ anchor, title, text, onDone }: { anchor: RefObject<HTMLDivElement | null>; title: string; text: string; onDone: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  const place = usePlacement(anchor);
  useEffect(() => {
    button.current?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onDone();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onDone]);

  if (!place) {
    return null;
  }
  return createPortal(
    <div
      role="dialog"
      aria-label={title}
      style={{ top: place.top, right: place.right }}
      className="motion-pop absolute z-[45] w-[min(300px,calc(100vw-32px))] rounded-[16px] bg-ink p-5 text-on-ink shadow-[0_24px_60px_-18px_#11111166] print:hidden"
    >
      <span aria-hidden className="absolute -top-1.5 right-[14px] h-3 w-3 rotate-45 rounded-[2px] bg-ink" />
      <div className="flex items-center gap-2">
        <img src="/brand/flower-mark-cream.svg" alt="" className="h-5 w-5" />
        <b className="text-[15px] font-semibold">{title}</b>
      </div>
      <p className="mt-2 text-[14px] leading-[21px] text-on-ink-soft">{text}</p>
      <div className="mt-4 flex justify-end">
        <button ref={button} type="button" onClick={onDone} className="rounded-control bg-yellow px-4 py-2 text-[13px] font-semibold text-cocoa transition-transform duration-200 hover:-translate-y-px">
          Got it
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function HintButton({ id, label }: { id: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => hintStore.show(id)}
      aria-label={label}
      className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paper-sunk text-[12px] font-bold text-ink-soft transition-colors duration-200 hover:bg-ink hover:text-on-ink"
    >
      ?
    </button>
  );
}
