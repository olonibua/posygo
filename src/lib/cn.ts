import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const merge = extendTailwindMerge({ extend: { classGroups: { "font-size": [{ text: ["hero", "display", "h1", "h2", "h3", "lead", "body", "small", "meta", "stamp", "label"] }] } } });

export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}
