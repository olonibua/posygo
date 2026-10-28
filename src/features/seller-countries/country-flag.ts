const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - "A".charCodeAt(0);

export function countryFlag(code: string): string {
  return /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((letter) => letter.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET)) : "";
}
