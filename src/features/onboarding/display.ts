import type { DocumentSlot, VerificationStatus } from "@/shared";

import type { Step } from "@/components/ui/stepper";
import type { Tone } from "@/components/ui/tone";

export const VERIFICATION_STATUS_DISPLAY: Record<VerificationStatus, { label: string; tone: Tone }> = {
  NOT_STARTED: { label: "Not started", tone: "yellow" },
  IN_PROGRESS: { label: "In progress", tone: "yellow" },
  SUBMITTED: { label: "Under review", tone: "sky" },
  APPROVED: { label: "Approved", tone: "lime" },
  REJECTED: { label: "Rejected", tone: "pink" },
  RESUBMISSION_REQUIRED: { label: "Changes needed", tone: "orange" },
};

export const UNIT_BAND_LABELS = { UP_TO_100: "Up to 100 units", UP_TO_1000: "101 – 1,000 units", UP_TO_10000: "1,001 – 10,000 units", OVER_10000: "More than 10,000 units" } as const;

export const ORDER_BAND_LABELS = { UP_TO_50: "Up to 50 orders", UP_TO_500: "51 – 500 orders", UP_TO_5000: "501 – 5,000 orders", OVER_5000: "More than 5,000 orders" } as const;

export const HAZARD_LABELS = { BATTERIES: "Batteries", LIQUIDS: "Liquids", FRAGILE: "Fragile", FLAMMABLE: "Flammable", NONE: "None of these" } as const;

export const DOCUMENT_LABELS: Record<DocumentSlot, { label: string; hint: string }> = {
  idFront: { label: "ID — front", hint: "A clear photo or scan of the whole document." },
  idBack: { label: "ID — back", hint: "Not needed for passports." },
  selfie: { label: "Selfie holding your ID", hint: "Your face and the ID both clearly visible." },
  businessDocument: { label: "Business document", hint: "Certificate of incorporation, or a recent utility bill for sole traders." },
};

export const WIZARD_STEPS: readonly Step[] = [
  { title: "Business", detail: "Who you are and where you're registered" },
  { title: "Contact", detail: "The person we speak to" },
  { title: "Verify your identity", detail: "A quick ID and selfie check" },
  { title: "Documents", detail: "Your business document" },
  { title: "Operations", detail: "What you'll send us" },
  { title: "Review", detail: "Check and submit" },
];

const regionNames = new Intl.DisplayNames(["en-GB"], { type: "region" });

export function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function humanizeCode(code: string | undefined): string | undefined {
  if (!code) {
    return undefined;
  }
  const words = code.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
