import { describe, expect, it } from "vitest";

import { readPreference, savePreference, spokenText } from "./speech";

describe("speaking replies", () => {
  it("reads replies naturally, without list marks or quote marks, and spells out case numbers", () => {
    expect(spokenText("Watch out for:\n• Digits only.\n1. Name it.\nYour case is CASE-AB12.")).toBe("Watch out for: Digits only. Name it. Your case is case A B 1 2.");
    expect(spokenText('Explain "Tariff code"')).toBe("Explain Tariff code");
  });

  it("remembers whether someone wants to hear the helper", () => {
    window.localStorage.clear();
    expect(readPreference()).toBeNull();
    savePreference("on");
    expect(readPreference()).toBe("on");
    savePreference("off");
    expect(readPreference()).toBe("off");
  });
});
