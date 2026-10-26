import type { InboundAction, InboundStatus, LotCondition, MovementType, ShippingMode, StorageTier } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const INBOUND_STATUS_DISPLAY: Record<InboundStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "yellow" },
  SUBMITTED: { label: "On the way", tone: "sky" },
  ARRIVED: { label: "Arrived", tone: "teal" },
  ON_HOLD: { label: "On hold", tone: "orange" },
  RECEIVED: { label: "Received", tone: "lime" },
  DISCREPANCY: { label: "Received with differences", tone: "pink" },
  REJECTED: { label: "Refused", tone: "pink" },
  RETURN_REQUESTED: { label: "Being returned", tone: "orange" },
  CANCELLED: { label: "Cancelled", tone: "cocoa" },
};

export const INBOUND_ACTION_LABELS: Record<InboundAction, string> = {
  SUBMIT: "Submit shipment",
  CANCEL: "Cancel shipment",
  CHECK_IN: "Check in at the dock",
  HOLD: "Put on hold",
  RELEASE: "Release hold",
  COMPLETE: "Record counts",
  REJECT: "Refuse shipment",
  REQUEST_RETURN: "Return to sender",
  PAY_HOLD: "Pay hold charge",
};

export const STORAGE_TIER_LABELS: Record<StorageTier, { label: string; hint: string }> = {
  SMALL: { label: "Small", hint: "Up to a shoebox" },
  MEDIUM: { label: "Medium", hint: "Up to a moving box" },
  LARGE: { label: "Large", hint: "Up to a wardrobe box" },
  X_LARGE: { label: "Extra large", hint: "Bulky or oversized" },
  PALLET: { label: "Pallet", hint: "A full pallet" },
};

export const SHIPPING_MODE_LABELS: Record<ShippingMode, { label: string; hint: string }> = {
  LOOSE: { label: "Loose boxes", hint: "Parcels sent by courier" },
  PALLET: { label: "Pallets", hint: "Freight on one or more pallets" },
};

export const CONDITION_DISPLAY: Record<LotCondition, { label: string; tone: Tone }> = { SELLABLE: { label: "Sellable", tone: "lime" }, DAMAGED: { label: "Damaged", tone: "pink" } };

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  RECEIVE: "Received",
  PUT_AWAY: "Put away",
  MOVE: "Moved",
  RESERVE: "Reserved for an order",
  RELEASE: "Released",
  SHIP: "Shipped",
  ADJUST: "Adjusted",
  TRANSFER_OUT: "Sent to another hub",
  TRANSFER_IN: "Arrived from another hub",
  WRITE_OFF: "Written off",
  RETURN_IN: "Returned by a customer",
};

export const OPEN_STATUS_GROUPS = {
  open: ["SUBMITTED", "ARRIVED", "ON_HOLD"],
  drafts: ["DRAFT"],
  done: ["RECEIVED", "DISCREPANCY", "REJECTED", "RETURN_REQUESTED", "CANCELLED"],
} as const satisfies Record<string, readonly InboundStatus[]>;
