"use client";

import { useSyncExternalStore } from "react";

export interface BasketLine {
  productId: string;
  name: string;
  priceMinor: number;
  quantity: number;
}

const KEY_PREFIX = "gfn-basket:";
const MAX_QUANTITY = 99;
const listeners = new Set<() => void>();
const memory = new Map<string, BasketLine[]>();
const EMPTY: BasketLine[] = [];

function read(slug: string): BasketLine[] {
  if (memory.has(slug)) {
    return memory.get(slug)!;
  }
  try {
    const stored = window.localStorage.getItem(KEY_PREFIX + slug);
    const lines = stored ? (JSON.parse(stored) as BasketLine[]) : EMPTY;
    memory.set(slug, Array.isArray(lines) ? lines : EMPTY);
  } catch {
    memory.set(slug, EMPTY);
  }
  return memory.get(slug)!;
}

function persist(slug: string, lines: BasketLine[]): boolean {
  try {
    window.localStorage.setItem(KEY_PREFIX + slug, JSON.stringify(lines));
    return true;
  } catch {
    return false;
  }
}

function write(slug: string, lines: BasketLine[]): void {
  memory.set(slug, lines);
  persist(slug, lines);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const basket = {
  add(slug: string, line: Omit<BasketLine, "quantity">): void {
    const lines = read(slug);
    const existing = lines.find((candidate) => candidate.productId === line.productId);
    write(
      slug,
      existing ? lines.map((candidate) => (candidate === existing ? { ...candidate, quantity: Math.min(MAX_QUANTITY, candidate.quantity + 1) } : candidate)) : [...lines, { ...line, quantity: 1 }],
    );
  },
  setQuantity(slug: string, productId: string, quantity: number): void {
    write(
      slug,
      read(slug)
        .map((line) => (line.productId === productId ? { ...line, quantity: Math.min(MAX_QUANTITY, Math.max(0, quantity)) } : line))
        .filter((line) => line.quantity > 0),
    );
  },
  clear(slug: string): void {
    write(slug, EMPTY);
  },
};

export function useBasket(slug: string): BasketLine[] {
  return useSyncExternalStore(
    subscribe,
    () => read(slug),
    () => EMPTY,
  );
}
