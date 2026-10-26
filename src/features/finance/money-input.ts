import { currencyDefinition } from "@/shared";

const AMOUNT = /^\d{1,9}(\.\d{0,4})?$/;

export function toMinor(text: string, currency: string): number | null {
  const cleaned = text.replace(/[,\s]/g, "");
  if (!AMOUNT.test(cleaned)) {
    return null;
  }
  const digits = currencyDefinition(currency).minorUnits;
  const [whole = "0", fraction = ""] = cleaned.split(".");
  if (fraction.length > digits) {
    return null;
  }
  return Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, "0") || "0");
}

export function toMajorText(amountMinor: number, currency: string): string {
  const digits = currencyDefinition(currency).minorUnits;
  return (amountMinor / 10 ** digits).toFixed(digits);
}

export function majorToMinor(major: number, currency: string): number {
  return major * 10 ** currencyDefinition(currency).minorUnits;
}

export function currencySymbol(currency: string): string {
  return currencyDefinition(currency).symbol;
}
