"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { canListen, canSpeak, femaleVoices, hush, listen, pageHasBeenUsed, readPreference, readVoiceName, savePreference, saveVoiceName, say, type VoicePreference } from "./speech";

export interface VoiceOption {
  name: string;
  label: string;
}

function labelFor(name: string): string {
  return name.replace(/^(Microsoft|Google)\s+/i, "").replace(/\s*\(.*\)$/, "").replace(/\s+Online.*$/i, "").trim();
}

export function useVoice(onSpeaking: (speaking: boolean) => void) {
  const [preference, setPreference] = useState<VoicePreference>(null);
  const [support, setSupport] = useState({ speak: false, listen: false });
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const stopListening = useRef<() => void>(() => undefined);
  const speaking = useRef(onSpeaking);
  speaking.current = onSpeaking;

  useEffect(() => {
    setPreference(readPreference());
    setSupport({ speak: canSpeak(), listen: canListen() });
    if (!canSpeak()) {
      return;
    }
    const load = () => {
      const female = femaleVoices();
      setVoices(female.map((voice) => ({ name: voice.name, label: labelFor(voice.name) })));
      setVoiceName(readVoiceName() ?? female[0]?.name ?? null);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      hush();
      stopListening.current();
    };
  }, []);

  const speak = useCallback(
    (text: string, unprompted = false) => {
      if (preference !== "on" || !support.speak || (unprompted && !pageHasBeenUsed())) {
        return;
      }
      say(text, { onStart: () => speaking.current(true), onEnd: () => speaking.current(false) });
    },
    [preference, support.speak],
  );

  const choose = useCallback((on: boolean) => {
    savePreference(on ? "on" : "off");
    setPreference(on ? "on" : "off");
    if (!on) {
      hush();
    }
  }, []);

  const pickVoice = useCallback((name: string) => {
    saveVoiceName(name);
    setVoiceName(name);
    say("Hi, I'm Posy. This is how I'll sound.");
  }, []);

  const hear = useCallback((onText: (text: string) => void) => {
    setListening(true);
    stopListening.current = listen(onText, () => setListening(false));
  }, []);

  return {
    on: preference === "on",
    undecided: preference === null && support.speak,
    canSpeak: support.speak,
    canListen: support.listen,
    listening,
    voices,
    voiceName,
    pickVoice,
    speak,
    choose,
    hear,
    stop: () => stopListening.current(),
  };
}

export type VoiceState = ReturnType<typeof useVoice>;
