import { describe, expect, it } from "vitest";

import { femaleVoices, readPreference, savePreference, spokenText } from "./speech";

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

describe("choosing Posy's voice", () => {
  it("offers only female English voices, British first", () => {
    const voices = [
      { name: "Daniel", lang: "en-GB", localService: true },
      { name: "Google UK English Male", lang: "en-GB", localService: false },
      { name: "Samantha", lang: "en-US", localService: true },
      { name: "Microsoft Libby Online (Natural) - English (United Kingdom)", lang: "en-GB", localService: false },
      { name: "Google UK English Female", lang: "en-GB", localService: false },
      { name: "Amélie", lang: "fr-CA", localService: true },
    ];
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { getVoices: () => voices, cancel: () => undefined, speak: () => undefined } });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class {} });
    expect(femaleVoices().map((voice) => voice.name)).toEqual(["Microsoft Libby Online (Natural) - English (United Kingdom)", "Google UK English Female", "Samantha"]);
  });
});
