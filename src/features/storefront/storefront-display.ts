import type { StorefrontOrderStatus, StorefrontReturnStatus, StorefrontTone, VendorPayoutStatus } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const ORDER_STATUS_DISPLAY: Record<StorefrontOrderStatus, { label: string; tone: Tone }> = {
  PENDING_PAYMENT: { label: "Waiting for payment", tone: "sky" },
  PAID: { label: "Paid", tone: "lime" },
  AWAITING_VENDOR_FUNDS: { label: "Waiting for wallet top-up", tone: "orange" },
  FULFILLING: { label: "Being packed", tone: "yellow" },
  SHIPPED: { label: "On its way", tone: "blue" },
  DELIVERED: { label: "Delivered", tone: "lime" },
  CANCELLED: { label: "Cancelled", tone: "cocoa" },
  REFUNDED: { label: "Refunded", tone: "pink" },
  PAYMENT_FAILED: { label: "Payment failed", tone: "pink" },
};

export const PAYOUT_STATUS_DISPLAY: Record<VendorPayoutStatus, { label: string; tone: Tone }> = {
  NONE: { label: "No payout", tone: "cocoa" },
  HELD: { label: "Held until returns close", tone: "sky" },
  PENDING: { label: "Sending", tone: "yellow" },
  PAID: { label: "Paid to your bank", tone: "lime" },
  FAILED: { label: "Payout failed", tone: "pink" },
  CANCELLED: { label: "Cancelled", tone: "cocoa" },
};

export const TONE_LABELS: Record<StorefrontTone, string> = {
  lime: "Lime",
  sky: "Sky",
  yellow: "Sunshine",
  pink: "Rose",
  orange: "Tangerine",
  teal: "Teal",
  blue: "Blue",
  magenta: "Berry",
  cocoa: "Cocoa",
};

export const DELIVERY_LABEL = { STANDARD: "Standard", EXPRESS: "Express" } as const;

export const RETURN_STATUS_DISPLAY: Record<StorefrontReturnStatus, { label: string; tone: Tone }> = {
  REQUESTED: { label: "Waiting for the store", tone: "yellow" },
  APPROVED: { label: "Accepted, refund pending", tone: "sky" },
  REJECTED: { label: "Not accepted", tone: "cocoa" },
  REFUNDED: { label: "Refunded", tone: "lime" },
};
