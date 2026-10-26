import type { AdjustmentStatus, FeeScheduleStatus, LedgerEntryType, TopUpStatus, WalletStatus } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const LEDGER_TYPE_LABELS: Record<LedgerEntryType, string> = {
  DEPOSIT: "Top-up",
  ONBOARDING: "Inbound onboarding",
  STORAGE: "Monthly storage",
  FULFILMENT: "Fulfilment",
  SHIPPING: "Shipping",
  RETURN: "Return handling",
  RECEIVING_HOLD_FEE: "Receiving hold charge",
  MANUAL_CREDIT: "Credit from our team",
  MANUAL_DEBIT: "Charge from our team",
  REFUND: "Refund",
  REVERSAL: "Charge reversed",
  PAYMENT_REVERSAL: "Card payment reversed",
  COMPENSATION: "Compensation for lost or damaged stock",
  STOREFRONT_FEE: "Store set-up",
  REFERRAL_CREDIT: "Referral credit",
  CARRIED_OVER: "Balance carried over",
};

export const WALLET_STATUS_DISPLAY: Record<WalletStatus, { label: string; tone: Tone; note: string }> = {
  ACTIVE: { label: "Active", tone: "lime", note: "Charges are taken as work happens." },
  STORAGE_OVERDUE: { label: "Storage overdue", tone: "orange", note: "A storage charge couldn't be taken. Top up to clear it." },
  FROZEN: { label: "Paused", tone: "pink", note: "Charges are paused while our finance team looks into a payment." },
  CLOSED: { label: "Closed", tone: "cocoa", note: "This wallet no longer takes payments." },
};

export const TOP_UP_STATUS_DISPLAY: Record<TopUpStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Waiting for payment", tone: "yellow" },
  SUCCEEDED: { label: "Paid", tone: "lime" },
  FAILED: { label: "Failed", tone: "pink" },
  EXPIRED: { label: "Expired", tone: "cocoa" },
  REFUNDED: { label: "Refunded", tone: "orange" },
};

export const ADJUSTMENT_STATUS_DISPLAY: Record<AdjustmentStatus, { label: string; tone: Tone }> = {
  PENDING_APPROVAL: { label: "Waiting for approval", tone: "yellow" },
  APPLIED: { label: "Applied", tone: "lime" },
  REJECTED: { label: "Rejected", tone: "pink" },
};

export const FEE_STATUS_DISPLAY: Record<FeeScheduleStatus, { label: string; tone: Tone }> = {
  PROPOSED: { label: "Waiting for approval", tone: "yellow" },
  ACTIVE: { label: "In use", tone: "lime" },
  REJECTED: { label: "Rejected", tone: "pink" },
  SUPERSEDED: { label: "Replaced", tone: "cocoa" },
};
