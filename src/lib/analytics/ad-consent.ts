export type AdConsent = "granted" | "declined";

const STORAGE_KEY = "posygo.ad-consent";

export function readAdConsent(): AdConsent | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "granted" || stored === "declined" ? stored : null;
  } catch {
    return null;
  }
}

export function saveAdConsent(choice: AdConsent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    return;
  }
}
