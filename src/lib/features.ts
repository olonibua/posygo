import { notFound } from "next/navigation";

export const FEATURES = { marketplace: process.env.NEXT_PUBLIC_MARKETPLACE === "on", personalShopping: process.env.NEXT_PUBLIC_PERSONAL_SHOPPING === "on" } as const;

export type Feature = keyof typeof FEATURES;

export function requireFeature(feature: Feature): void {
  if (!FEATURES[feature]) {
    notFound();
  }
}
