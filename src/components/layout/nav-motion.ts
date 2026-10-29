import type { IconName } from "@/components/ui/icon";

export type NavMotion = "ring" | "spin" | "hop" | "drive" | "lift" | "pulse" | "rewind" | "nod" | "tilt" | "pop";

const MOTIONS: Partial<Record<IconName, NavMotion>> = {
  bell: "ring",
  settings: "spin",
  globe: "spin",
  wallet: "hop",
  orders: "drive",
  inbound: "drive",
  transfer: "drive",
  lanes: "drive",
  inventory: "lift",
  products: "lift",
  storefront: "lift",
  verification: "pulse",
  shield: "pulse",
  returns: "rewind",
  team: "nod",
  claim: "tilt",
  document: "tilt",
};

export function motionFor(icon: IconName): NavMotion {
  return MOTIONS[icon] ?? "pop";
}
