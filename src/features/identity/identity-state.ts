import type { IdentityCheckView } from "@/shared";

export type IdentityState = "NOT_STARTED" | "WAITING" | "IN_REVIEW" | "VERIFIED" | "DECLINED";

const STATES: Record<IdentityCheckView["status"], IdentityState> = {
  PENDING: "WAITING",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "VERIFIED",
  DECLINED: "DECLINED",
  ABANDONED: "DECLINED",
  EXPIRED: "DECLINED",
};

export function identityStateOf(check: IdentityCheckView | null): IdentityState {
  return check ? STATES[check.status] : "NOT_STARTED";
}

export const IDENTITY_STATUS_LABELS: Record<IdentityCheckView["status"], string> = {
  PENDING: "Not finished",
  IN_REVIEW: "Being checked",
  APPROVED: "Verified",
  DECLINED: "Didn't pass",
  ABANDONED: "Not finished",
  EXPIRED: "Link expired",
};
