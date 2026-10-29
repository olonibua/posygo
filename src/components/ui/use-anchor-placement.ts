"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

const EDGE = 16;

export interface AnchorPlacement {
  top: number;
  right: number;
}

export function useAnchorPlacement(anchor: RefObject<HTMLElement | null>, gap: number, width: number): AnchorPlacement | null {
  const [place, setPlace] = useState<AnchorPlacement | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (rect) {
        const viewport = document.documentElement.clientWidth;
        const widest = viewport - Math.min(width, viewport - EDGE * 2) - EDGE;
        setPlace({ top: rect.bottom + window.scrollY + gap, right: Math.min(widest, Math.max(EDGE, viewport - rect.right - 4)) });
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
  }, [anchor, gap, width]);
  return place;
}
