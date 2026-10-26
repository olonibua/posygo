import type {
  ActivationReadiness,
  HeardFrom,
  InsurancePolicyView,
  MysteryOrderView,
  PartnerCheckKind,
  PartnerCheckStatus,
  PartnerDecision,
  PartnerEntryType,
  PartnerPayoutView,
  PartnerStatus,
  PayoutAccountView,
  ProofDocument,
  StockCountView,
} from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const PARTNER_STATUS_DISPLAY: Record<PartnerStatus, { label: string; tone: Tone; note: string }> = {
  APPLIED: { label: "Applied", tone: "sky", note: "Accept your invitation to start verification." },
  VERIFYING: { label: "Verifying", tone: "sky", note: "Complete each step below, then send everything for review." },
  UNDER_REVIEW: { label: "Under review", tone: "yellow", note: "Our team is checking your details. We'll email you if anything needs changing." },
  ACTIVE: { label: "Approved", tone: "lime", note: "Your hub is live. Vendors can send stock to you." },
  SUSPENDED: { label: "Paused", tone: "pink", note: "Hub work is paused until this is resolved." },
  OFFBOARDING: { label: "Closing", tone: "orange", note: "Stock is being moved out before the partnership ends." },
  TERMINATED: { label: "Ended", tone: "cocoa", note: "This partnership has ended." },
  REJECTED: { label: "Not approved", tone: "cocoa", note: "This application wasn't approved." },
};

export const CHECK_DISPLAY: Record<PartnerCheckKind, { label: string; ask: string }> = {
  REFERRAL: { label: "Referee", ask: "Someone in your community who knows you. We contact them to confirm." },
  IDENTITY: { label: "Identity", ask: "A quick photo ID and selfie check with our identity provider. We never see or keep your ID." },
  PROOF_OF_ADDRESS: { label: "Proof of address", ask: "A bill, bank statement or council tax letter from the last 3 months showing your storage address." },
  STORAGE_SPACE: { label: "Storage space", ask: "Photos or a short video of where the stock will live. We may also arrange a quick video call." },
  WORK_STATUS: { label: "Work and tax status", ask: "Confirm you can do this work and give your tax reference where your country needs one." },
};

export const CHECK_STATUS_DISPLAY: Record<PartnerCheckStatus, { label: string; tone: Tone }> = {
  NOT_STARTED: { label: "To do", tone: "sky" },
  SUBMITTED: { label: "Sent", tone: "yellow" },
  ACCEPTED: { label: "Done", tone: "lime" },
  REJECTED: { label: "Needs another look", tone: "pink" },
};

export const PROOF_DOCUMENT_LABELS: Record<ProofDocument, string> = { UTILITY_BILL: "Utility bill", BANK_STATEMENT: "Bank statement", COUNCIL_TAX: "Council tax or property tax letter" };

export const HEARD_FROM_LABELS: Record<HeardFrom, string> = {
  COMMUNITY_GROUP: "A community group",
  FRIEND_OR_FAMILY: "A friend or family member",
  SOCIAL_MEDIA: "Social media",
  SEARCH: "Searching online",
  VENDOR: "A vendor who sells with us",
  OTHER: "Somewhere else",
};

export const DECISION_DISPLAY: Record<PartnerDecision, { label: string; variant: "lime" | "yellow" | "ghost"; hint: string }> = {
  APPROVE: { label: "Approve", variant: "lime", hint: "Every step is accepted. Opens a starter-tier hub." },
  RETURN: { label: "Send back", variant: "yellow", hint: "Ask the partner to fix something and resubmit." },
  REJECT: { label: "Reject", variant: "ghost", hint: "Close the application for good." },
  SUSPEND: { label: "Pause hub", variant: "ghost", hint: "Stop new work straight away." },
  REINSTATE: { label: "Reinstate", variant: "lime", hint: "Resume work once every requirement is met again." },
  OFFBOARD: { label: "Start closing", variant: "yellow", hint: "Stop new work and move stock out." },
  TERMINATE: { label: "End partnership", variant: "ghost", hint: "Only once the hub is empty. Closes every account." },
};

export const DECISION_DONE: Record<PartnerDecision, string> = {
  APPROVE: "Partner approved",
  RETURN: "Sent back to the partner",
  REJECT: "Application rejected",
  SUSPEND: "Hub paused",
  REINSTATE: "Partner reinstated",
  OFFBOARD: "Closing started",
  TERMINATE: "Partnership ended",
};

export const READINESS_LABELS: Record<keyof ActivationReadiness, string> = {
  steps: "Every verification step done",
  agreement: "Partner agreement signed",
  payoutAccount: "Payout account set up",
  deposit: "Deposit held",
  insurance: "Own insurance verified",
};

export const ENTRY_TYPE_LABELS: Record<PartnerEntryType, string> = {
  RECEIVING: "Receiving and first month's storage",
  FULFILMENT: "Pick and pack",
  STORAGE_SHARE: "Storage",
  HOLDBACK: "Held back",
  HOLDBACK_RELEASE: "Released",
  PAYOUT: "Payout",
  ADJUSTMENT: "Adjustment",
};

export const INSURANCE_STATUS_DISPLAY: Record<InsurancePolicyView["status"], { label: string; tone: Tone }> = {
  PENDING: { label: "Waiting for review", tone: "yellow" },
  VERIFIED: { label: "Verified", tone: "lime" },
  REJECTED: { label: "Rejected", tone: "pink" },
  EXPIRED: { label: "Expired", tone: "cocoa" },
};

export const PAYOUT_STATUS_DISPLAY: Record<PartnerPayoutView["status"], { label: string; tone: Tone }> = {
  PENDING_APPROVAL: { label: "Waiting for approval", tone: "yellow" },
  PROCESSING: { label: "Sending", tone: "sky" },
  PAID: { label: "Paid", tone: "lime" },
  FAILED: { label: "Failed", tone: "pink" },
  REJECTED: { label: "Rejected", tone: "cocoa" },
};

export const PAYOUT_ACCOUNT_DISPLAY: Record<PayoutAccountView["status"], { label: string; tone: Tone }> = {
  ONBOARDING: { label: "Setup not finished", tone: "yellow" },
  ACTIVE: { label: "Ready for payouts", tone: "lime" },
  RESTRICTED: { label: "Needs attention", tone: "pink" },
};

export const STOCK_COUNT_DISPLAY: Record<StockCountView["status"], { label: string; tone: Tone }> = {
  REQUESTED: { label: "Waiting for count", tone: "yellow" },
  MATCHED: { label: "Matched", tone: "lime" },
  FLAGGED: { label: "Didn't match", tone: "pink" },
  MISSED: { label: "Missed", tone: "cocoa" },
};

export const MYSTERY_OUTCOME_DISPLAY: Record<MysteryOrderView["outcome"], { label: string; tone: Tone }> = {
  PENDING: { label: "Waiting", tone: "yellow" },
  PASSED: { label: "Passed", tone: "lime" },
  FAILED: { label: "Failed", tone: "pink" },
};

export const TEAM_ROLE_LABELS = { FULFILMENT_PARTNER: "Partner", PARTNER_STAFF: "Team member" } as const;

export function percent(bps: number): string {
  return `${(bps / 100).toLocaleString("en-GB", { maximumFractionDigits: 1 })}%`;
}
