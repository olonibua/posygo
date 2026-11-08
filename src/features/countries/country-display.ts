import type { CountryStatus, TaxRules } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const COUNTRY_STATUS_DISPLAY: Record<CountryStatus, { label: string; tone: Tone }> = {
  PROSPECTIVE: { label: "Prospective", tone: "yellow" },
  ONBOARDING: { label: "Onboarding", tone: "sky" },
  LIVE: { label: "Live", tone: "lime" },
  SUSPENDED: { label: "Suspended", tone: "pink" },
  CLOSED: { label: "Closed", tone: "cocoa" },
};

const TAX_LABEL: Record<TaxRules["model"], string> = { VAT: "VAT", GST: "GST", SALES_TAX: "Sales tax", NONE: "No tax" };

export function describeTax(tax: TaxRules): string {
  if (tax.model === "SALES_TAX" || tax.model === "NONE") {
    return TAX_LABEL[tax.model];
  }
  return `${TAX_LABEL[tax.model]} ${tax.standardRateBps / 100}%${tax.pricesIncludeTax ? " incl." : ""}`;
}

export interface AdminCountry {
  code: string;
  name: string;
  currency: string;
  status: CountryStatus;
  config: { tax: TaxRules; locale: string; partners?: unknown };
  updatedAt: string;
}
