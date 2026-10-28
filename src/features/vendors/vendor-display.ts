import type { ProductStockState, VendorStage } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const VENDOR_STAGE_DISPLAY: Record<VendorStage, { label: string; tone: Tone }> = {
  SIGNED_UP: { label: "Signed up", tone: "yellow" },
  VERIFYING: { label: "Verifying", tone: "sky" },
  VERIFIED: { label: "Verified", tone: "teal" },
  LIVE: { label: "Live", tone: "lime" },
  SUSPENDED: { label: "Suspended", tone: "pink" },
};

export const STOCK_STATE_DISPLAY: Record<ProductStockState, { label: string; tone: Tone }> = {
  NOT_SENT: { label: "Not sent yet", tone: "yellow" },
  ON_THE_WAY: { label: "On the way", tone: "sky" },
  IN_STORAGE: { label: "In storage", tone: "lime" },
  SOLD_OUT: { label: "Sold out", tone: "pink" },
};

export const MEMBER_ROLE_LABELS: Record<string, string> = { VENDOR_OWNER: "Owner", VENDOR_MEMBER: "Team member" };

export function directoryPath(base: string, filters: Readonly<Record<string, string | number | undefined>>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && !(key === "page" && value === 1)) {
      query.set(key, String(value));
    }
  }
  return query.size > 0 ? `${base}?${query.toString()}` : base;
}

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
