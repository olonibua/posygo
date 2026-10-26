import type { CancellationReason, OrderAction, OrderStatus, PublicTrackingStatus } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const ORDER_STATUS_DISPLAY: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING_PACKING: { label: "Waiting to be packed", tone: "yellow" },
  PACKING_COMPLETED: { label: "Packed", tone: "sky" },
  AWAITING_SHIPPING_SELECTION: { label: "Choosing shipping", tone: "sky" },
  AWAITING_WALLET_FUNDING: { label: "Needs funds for shipping", tone: "orange" },
  SHIPPING_PAID: { label: "Buying label", tone: "sky" },
  LABEL_PURCHASED: { label: "Label ready", tone: "teal" },
  HANDED_OFF: { label: "With the carrier", tone: "teal" },
  IN_TRANSIT: { label: "In transit", tone: "teal" },
  DELIVERED: { label: "Delivered", tone: "lime" },
  ON_HOLD: { label: "On hold", tone: "orange" },
  EXCEPTION: { label: "Carrier problem", tone: "pink" },
  CANCELLED: { label: "Cancelled", tone: "cocoa" },
  RETURNED: { label: "Returned", tone: "pink" },
};

export const ORDER_GROUPS = {
  packing: ["PENDING_PACKING", "ON_HOLD"],
  shipping: ["PACKING_COMPLETED", "AWAITING_SHIPPING_SELECTION", "AWAITING_WALLET_FUNDING", "SHIPPING_PAID", "LABEL_PURCHASED"],
  travelling: ["HANDED_OFF", "IN_TRANSIT", "EXCEPTION"],
  done: ["DELIVERED", "CANCELLED", "RETURNED"],
} as const satisfies Record<string, readonly OrderStatus[]>;
export type OrderGroup = keyof typeof ORDER_GROUPS;

export const ORDER_GROUP_LABELS: Record<OrderGroup, string> = { packing: "To pack", shipping: "Shipping", travelling: "On the way", done: "Finished" };

export const ORDER_ACTION_LABELS: Record<OrderAction, string> = {
  RECORD_PACK: "Record pack",
  REPACK: "Send back to packing",
  FETCH_RATES: "Get shipping rates",
  SELECT_RATE: "Buy label",
  RETRY_LABEL: "Try the label again",
  HAND_OFF: "Handed to carrier",
  HOLD: "Put on hold",
  RELEASE: "Release hold",
  CANCEL: "Cancel order",
  PAY_SHIPPING: "Pay for shipping",
  REQUEST_CANCELLATION: "Ask to cancel",
};

export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  CUSTOMER_CANCELLED: "The customer cancelled",
  WRONG_ITEMS: "Wrong items ordered",
  ADDRESS_PROBLEM: "Problem with the address",
  OUT_OF_STOCK: "Out of stock",
  OTHER: "Something else",
};

export const TRACKING_STATUS_DISPLAY: Record<PublicTrackingStatus, { label: string; tone: Tone; step: number }> = {
  PROCESSING: { label: "Being prepared", tone: "yellow", step: 1 },
  LABEL_CREATED: { label: "Label created", tone: "sky", step: 2 },
  WITH_CARRIER: { label: "With the carrier", tone: "teal", step: 3 },
  IN_TRANSIT: { label: "On its way", tone: "teal", step: 3 },
  DELIVERED: { label: "Delivered", tone: "lime", step: 4 },
  PROBLEM: { label: "Delayed — the carrier is on it", tone: "orange", step: 3 },
  RETURNED: { label: "Returned to sender", tone: "pink", step: 4 },
  CANCELLED: { label: "Cancelled", tone: "cocoa", step: 0 },
};

export function countryName(code: string, locale = "en-GB"): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`;
}

export function formatSize(lengthMm: number, widthMm: number, heightMm: number): string {
  return `${lengthMm / 10} × ${widthMm / 10} × ${heightMm / 10} cm`;
}
