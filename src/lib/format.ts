import { Money } from "@/shared";

export function formatMoney(amountMinor: number, currency: string, locale: string): string {
  return Money.of(amountMinor, currency).format(locale);
}

export function formatDate(value: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  return hour < 18 ? "Good afternoon" : "Good evening";
}

export function localeFor(countryCode: string | null | undefined): string {
  return countryCode === "US" ? "en-US" : "en-GB";
}

export function formatDateTime(value: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
