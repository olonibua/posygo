"use client";

import { useLayoutEffect, useRef, useState } from "react";

const NUMBER = /^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/;
const DURATION_MS = 700;

function prefersStill(): boolean {
  return typeof window === "undefined" || typeof window.matchMedia !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CountUp({ value }: { value: string }) {
  const match = NUMBER.exec(value);
  const [shown, setShown] = useState(value);
  const previous = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!match || prefersStill()) {
      setShown(value);
      return;
    }
    const [, prefix, digits, suffix] = match;
    const target = Number(digits!.replace(/,/g, ""));
    const decimals = digits!.includes(".") ? digits!.split(".")[1]!.length : 0;
    const grouped = digits!.includes(",");
    const from = previous.current ?? 0;
    previous.current = target;
    const format = (amount: number) => `${prefix}${amount.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped })}${suffix}`;
    const started = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      setShown(format(from + (target - from) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span aria-label={value}>{shown}</span>;
}
