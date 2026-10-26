import type { ClaimKind, ClaimLiability, ClaimSource, ClaimStatus, CustodyAlertKind, TransferStatus } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const CLAIM_STATUS_DISPLAY: Record<ClaimStatus, { label: string; tone: Tone }> = {
  OPEN: { label: "New", tone: "sky" },
  ASSESSED: { label: "Awaiting decision", tone: "yellow" },
  SETTLED: { label: "Settled", tone: "lime" },
  REJECTED: { label: "Not accepted", tone: "cocoa" },
};

export const CLAIM_KIND_LABELS: Record<ClaimKind, string> = { SHORTAGE: "Missing units", DAMAGE: "Damaged", LOSS: "Lost" };

export const CLAIM_SOURCE_LABELS: Record<ClaimSource, string> = {
  STOCK_COUNT: "Stock count",
  TRANSFER: "Hub transfer",
  ORDER: "Order",
  VENDOR_REPORT: "Reported by the vendor",
  STAFF: "Opened by our team",
};

export const LIABILITY_DISPLAY: Record<ClaimLiability, { label: string; hint: string }> = {
  PARTNER: { label: "The hub", hint: "Recovered from the partner's balance, then their deposit. We cover the rest." },
  PLATFORM: { label: "Us", hint: "We credit the vendor's wallet in full." },
  CARRIER: { label: "The carrier", hint: "We credit the vendor's wallet and chase the carrier ourselves." },
  VENDOR: { label: "The vendor", hint: "No credit. The vendor's own packing or records caused it." },
};

export const TRANSFER_STATUS_DISPLAY: Record<TransferStatus, { label: string; tone: Tone }> = {
  REQUESTED: { label: "To send", tone: "yellow" },
  DISPATCHED: { label: "On the way", tone: "sky" },
  RECEIVED: { label: "Arrived", tone: "lime" },
  CANCELLED: { label: "Cancelled", tone: "cocoa" },
};

export const ALERT_DISPLAY: Record<CustodyAlertKind, { label: string; tone: Tone }> = {
  NO_CARRIER_SCAN: { label: "No carrier scan", tone: "orange" },
  COUNT_SHORTFALL: { label: "Count came up short", tone: "pink" },
  SHRINKAGE: { label: "Losing stock", tone: "magenta" },
  TRUST_LOW: { label: "Trust too low", tone: "cocoa" },
};
