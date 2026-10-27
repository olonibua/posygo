"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { canListen, canSpeak, hush, listen, pageHasBeenUsed, readPreference, savePreference, say, type VoicePreference } from "./speech";

export function useVoice(onSpeaking: (speaking: boolean) => void) {
  const [preference, setPreference] = useState<VoicePreference>(null);
  const [support, setSupport] = useState({ speak: false, listen: false });
  const [listening, setListening] = useState(false);
  const stopListening = useRef<() => void>(() => undefined);
  const speaking = useRef(onSpeaking);
  speaking.current = onSpeaking;

  useEffect(() => {
    setPreference(readPreference());
    setSupport({ speak: canSpeak(), listen: canListen() });
    return () => {
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
    speak,
    choose,
    hear,
    stop: () => stopListening.current(),
  };
}

export type VoiceState = ReturnType<typeof useVoice>;
