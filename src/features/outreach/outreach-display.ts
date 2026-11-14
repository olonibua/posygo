import type { OutreachKind, OutreachStatus } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const OUTREACH_STATUS_LABELS: Record<OutreachStatus, { label: string; tone: Tone }> = {
  NOT_CONTACTED: { label: "Not contacted", tone: "sky" },
  MESSAGED: { label: "Messaged", tone: "yellow" },
  REPLIED: { label: "Replied", tone: "lime" },
  CALL_BOOKED: { label: "Call booked", tone: "lime" },
  ONBOARDED: { label: "Onboarded", tone: "lime" },
  DECLINED: { label: "Declined", tone: "pink" },
  UNSUBSCRIBED: { label: "Unsubscribed", tone: "pink" },
};

export const OUTREACH_KIND_LABELS: Record<OutreachKind, string> = {
  PREP_CENTRE: "Prep centre",
  CARGO_AGENT: "Cargo agent",
  COURIER: "Courier",
  INDIVIDUAL: "Individual",
  BRAND: "Brand",
  OTHER: "Other",
};
