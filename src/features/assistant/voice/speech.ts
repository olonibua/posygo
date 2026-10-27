interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionConstructor = new () => Recognition;

const PREFERENCE_KEY = "posygo.helper.voice";

export type VoicePreference = "on" | "off" | null;

function recognitionConstructor(): RecognitionConstructor | null {
  const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

export function canListen(): boolean {
  return typeof window !== "undefined" && recognitionConstructor() !== null;
}

export function pageHasBeenUsed(): boolean {
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activation?.hasBeenActive ?? true;
}

export function readPreference(): VoicePreference {
  try {
    const value = window.localStorage.getItem(PREFERENCE_KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

export function savePreference(value: "on" | "off"): void {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, value);
  } catch {
    return;
  }
}

export function spokenText(text: string): string {
  return text
    .replace(/^\s*[•\-]\s*/gm, "")
    .replace(/^\s*\d+\.\s*/gm, "")
    .replace(/[“”"]/g, "")
    .replace(/\bCASE-([A-Z0-9])([A-Z0-9]+)/g, (_match, first: string, rest: string) => `case ${[first, ...rest].join(" ")}`)
    .replace(/\s+/g, " ")
    .trim();
}

function britishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === "en-GB" && /female|libby|sonia|serena|kate/i.test(voice.name)) ??
    voices.find((voice) => voice.lang === "en-GB") ??
    voices.find((voice) => voice.lang.startsWith("en"))
  );
}

export function say(text: string, events: { onStart?: () => void; onEnd?: () => void } = {}): void {
  if (!canSpeak()) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(spokenText(text));
  const voice = britishVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = voice?.lang ?? "en-GB";
  utterance.rate = 1.02;
  utterance.onstart = () => events.onStart?.();
  utterance.onend = () => events.onEnd?.();
  utterance.onerror = () => events.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function hush(): void {
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}

export function listen(onText: (text: string) => void, onDone: () => void): () => void {
  const Constructor = recognitionConstructor();
  if (!Constructor) {
    onDone();
    return () => undefined;
  }
  hush();
  const recognition = new Constructor();
  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript.trim();
    if (transcript) {
      onText(transcript);
    }
  };
  recognition.onend = onDone;
  recognition.onerror = onDone;
  recognition.start();
  return () => recognition.stop();
}
