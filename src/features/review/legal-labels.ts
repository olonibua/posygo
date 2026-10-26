import type { LegalDocumentKind } from "@/shared";

export const LEGAL_KIND_LABELS: Record<LegalDocumentKind, string> = {
  VENDOR_AGREEMENT: "Vendor agreement",
  TERMS: "Terms of service",
  PRIVACY: "Privacy policy",
  PARTNER_AGREEMENT: "Partner agreement",
  CUSTODY_TERMS: "Custody terms",
  NON_DIVERSION: "Non-diversion undertaking",
  DATA_PROCESSING: "Data processing agreement",
  INSURANCE_OBLIGATION: "Insurance obligations",
};
