export function productCodeFix(value: string): string | null {
  const fixed = value
    .trim()
    .toUpperCase()
    .replace(/[\s_/.]+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return /^[A-Z0-9][A-Z0-9-]{1,39}$/.test(fixed) ? fixed : null;
}

export function trackingNumberFix(value: string): string | null {
  const fixed = value
    .replace(/[^A-Za-z0-9 -]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 60);
  return /^[A-Za-z0-9 -]{4,60}$/.test(fixed) ? fixed : null;
}

export function tariffCodeFix(value: string): string | null {
  const fixed = value.replace(/\D/g, "");
  return /^\d{6,10}$/.test(fixed) ? fixed : null;
}

export function orderReferenceFix(value: string): string | null {
  const fixed = value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._:#/-]/g, "")
    .slice(0, 64);
  return /^[A-Za-z0-9._:#/-]{1,64}$/.test(fixed) ? fixed : null;
}
